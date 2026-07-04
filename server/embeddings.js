/**
 * embeddings.js — Provider-agnostic text embeddings for the RAG features.
 *
 * Supports Gemini (text-embedding-004, free tier) and OpenAI
 * (text-embedding-3-small). Selection mirrors llm.js: a provider is usable when
 * its API key is set; Gemini is preferred (free) then OpenAI. No npm dependency —
 * uses the built-in `https` module. Results are cached in-memory per text so we
 * never pay to embed the same job/knowledge chunk twice in a session.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GEMINI_EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001';
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small';

// Both Gemini and OpenAI expose an OpenAI-compatible /embeddings endpoint that
// accepts a batch `input` array, so a single code path serves both.
const PROVIDER_CFG = {
  gemini: { hostname: 'generativelanguage.googleapis.com', path: '/v1beta/openai/embeddings', keyEnv: 'GEMINI_API_KEY', model: GEMINI_EMBED_MODEL },
  openai: { hostname: 'api.openai.com',                     path: '/v1/embeddings',           keyEnv: 'OPENAI_API_KEY', model: OPENAI_EMBED_MODEL },
};

// Prefer Gemini (free tier) then OpenAI. EMBED_PROVIDER can force one.
function embedProvider() {
  const forced = (process.env.EMBED_PROVIDER || '').toLowerCase().trim();
  if (forced === 'gemini' && process.env.GEMINI_API_KEY) return 'gemini';
  if (forced === 'openai' && process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

function isAvailable() { return embedProvider() !== null; }

function httpsJson(options, payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          const err = new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`);
          err.status = res.statusCode;
          reject(err);
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (_) { reject(new Error('Invalid JSON from embeddings provider')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => req.destroy(new Error('Embeddings request timed out')));
    req.write(payload);
    req.end();
  });
}

// Persistent embedding cache: hash(text) → number[]. Survives restarts so the
// KB and previously-seen jobs are never re-embedded (saves latency + API cost).
const _cache = new Map();
const CACHE_FILE = process.env.EMBED_CACHE_FILE || path.join(__dirname, '..', '.embeddings-cache.json');
const MAX_CACHE = Number(process.env.EMBED_CACHE_MAX) || 5000;
const keyOf = (t) => crypto.createHash('sha1').update(String(t)).digest('base64');

(function loadCache() {
  try {
    const obj = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    for (const k in obj) _cache.set(k, obj[k]);
  } catch (_) { /* no cache yet */ }
})();

let _saveTimer = null;
function scheduleSave() {
  if (_saveTimer) return;
  _saveTimer = setTimeout(() => {
    _saveTimer = null;
    try {
      let entries = [..._cache.entries()];
      if (entries.length > MAX_CACHE) entries = entries.slice(entries.length - MAX_CACHE); // keep most recent
      fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(entries)));
    } catch (_) { /* best-effort persistence */ }
  }, 3000);
}

// One OpenAI-compatible call (works for both Gemini and OpenAI).
async function embedBatch(provider, texts) {
  const cfg = PROVIDER_CFG[provider];
  const body = JSON.stringify({ model: cfg.model, input: texts });
  const data = await httpsJson({
    hostname: cfg.hostname,
    path: cfg.path,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env[cfg.keyEnv]}`,
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
    },
  }, body);
  return (data.data || []).sort((a, b) => a.index - b.index).map((d) => d.embedding || []);
}

const BATCH = 96; // both APIs accept large batches; stay well under limits

/**
 * Embed an array of strings → array of vectors (same order). Uses the cache for
 * already-seen texts and only calls the API for the misses, in batches.
 * Throws if no provider is configured or the API fails.
 */
async function embed(texts) {
  const provider = embedProvider();
  if (!provider) throw new Error('No embeddings API key configured (set GEMINI_API_KEY or OPENAI_API_KEY)');

  const missing = [];
  const seen = new Set();
  for (const t of texts) {
    const h = keyOf(t);
    if (!_cache.has(h) && !seen.has(h)) { missing.push(t); seen.add(h); }
  }

  for (let i = 0; i < missing.length; i += BATCH) {
    const chunk = missing.slice(i, i + BATCH);
    const vecs = await embedBatch(provider, chunk);
    chunk.forEach((t, j) => { if (vecs[j]) _cache.set(keyOf(t), vecs[j]); });
  }
  if (missing.length) scheduleSave();
  return texts.map((t) => _cache.get(keyOf(t)) || []);
}

/** Cosine similarity of two equal-length vectors → [-1, 1] (≈0..1 in practice). */
function cosine(a, b) {
  if (!a || !b || !a.length || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Raw cosine for these models clusters in a narrow band (~0.55 unrelated ↔ ~0.82
// strong), so a raw 0.56 would display as a misleading "56% relevant". `relevance`
// rescales that band to a calibrated 0..1 so an unrelated job reads ~0% and a
// strong match ~100%. Anchors are model-dependent and env-tunable.
const REL_FLOOR = Number(process.env.EMBED_REL_FLOOR) || 0.55;
const REL_CEIL  = Number(process.env.EMBED_REL_CEIL)  || 0.82;
function relevance(sim) {
  const r = (sim - REL_FLOOR) / (REL_CEIL - REL_FLOOR || 1);
  return Math.max(0, Math.min(1, r));
}

module.exports = { embed, cosine, relevance, isAvailable, embedProvider };
