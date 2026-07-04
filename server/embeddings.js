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

const _cache = new Map(); // text → number[]

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
  for (const t of texts) if (!_cache.has(t)) missing.push(t);

  for (let i = 0; i < missing.length; i += BATCH) {
    const chunk = missing.slice(i, i + BATCH);
    const vecs = await embedBatch(provider, chunk);
    chunk.forEach((t, j) => { if (vecs[j]) _cache.set(t, vecs[j]); });
  }
  return texts.map((t) => _cache.get(t) || []);
}

/** Cosine similarity of two equal-length vectors → [-1, 1] (≈0..1 in practice). */
function cosine(a, b) {
  if (!a || !b || !a.length || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

module.exports = { embed, cosine, isAvailable, embedProvider };
