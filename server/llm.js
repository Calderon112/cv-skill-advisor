/**
 * llm.js — Minimal external LLM client with retry + provider fallback.
 *
 * Supports four providers, all read from environment variables (loaded from
 * `.env` by the server). Three of them (OpenAI, OpenRouter, Gemini) speak the
 * OpenAI "chat/completions" format, so they share one code path; Anthropic has
 * its own. Uses the Node built-in `https` module — no npm dependency.
 *
 * Provider selection & resilience:
 *   - Set LLM_PROVIDER to prefer one of: anthropic | gemini | openrouter | openai
 *   - Any other providers that also have a key set are used as automatic
 *     fallbacks if the preferred one fails.
 *   - Transient errors (429/503/timeouts) are retried with backoff before
 *     moving on to the next provider.
 * If no usable key is set, `isAvailable()` returns false and callers fall back
 * to deterministic templates.
 */
const https = require('https');
const usage = require('./usage.js');

// Resolved at call time, not at import time. server.js loads .env *after* it
// requires this module, so a constant captured here freezes the default and
// silently ignores ANTHROPIC_MODEL / OPENROUTER_MODEL / GEMINI_MODEL from .env.
// The API keys already work this way — see KEY_ENV below.
const ANTHROPIC_MODEL = () => process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const OPENAI_MODEL = () => process.env.OPENAI_MODEL || 'gpt-4o';
const OPENROUTER_MODEL = () => process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
const GEMINI_MODEL = () => process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GWDG_MODEL = () => process.env.GWDG_MODEL || 'mistral-medium-3.5-128b';

// Which env var holds the API key for each provider.
const KEY_ENV = {
  anthropic: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  openai: 'OPENAI_API_KEY',
  gwdg: 'GWDG_API_KEY',
};

// Default order when several providers have keys (and none/one is preferred).
//
// GWDG first when it has a key. This application sends CVs to the model — names,
// addresses, employment history, all personal data under the GDPR. Every other
// provider here is a commercial service outside the EU. GWDG Chat AI runs on
// German academic infrastructure, which is a materially different answer to the
// question "where does the applicant's CV end up".
const AUTO_ORDER = ['gwdg', 'anthropic', 'gemini', 'openrouter', 'openai'];

// Retry tuning for transient failures.
const MAX_ATTEMPTS_PER_PROVIDER = 3;
const TRANSIENT_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isTransient(err) {
  if (!err) return false;
  if (TRANSIENT_STATUS.has(err.status)) return true;
  return /timed out|ECONNRESET|ETIMEDOUT|socket hang up|EAI_AGAIN|ENOTFOUND/i.test(err.message || '');
}

/**
 * Ordered list of providers that have a key configured. A provider named in
 * LLM_PROVIDER (if it has a key) is tried first; the rest act as fallbacks.
 */
function availableProviders() {
  const withKeys = AUTO_ORDER.filter((p) => process.env[KEY_ENV[p]]);
  const forced = (process.env.LLM_PROVIDER || '').toLowerCase().trim();
  if (forced && KEY_ENV[forced] && process.env[KEY_ENV[forced]]) {
    return [forced, ...withKeys.filter((p) => p !== forced)];
  }
  return withKeys;
}

function provider() {
  return availableProviders()[0] || null;
}

function isAvailable() {
  return availableProviders().length > 0;
}

function httpsJson(options, payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          const err = new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`);
          err.status = res.statusCode;
          reject(err);
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from LLM provider')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(90000, () => req.destroy(new Error('LLM request timed out')));
    req.write(payload);
    req.end();
  });
}

async function chatAnthropic({ system, user, maxTokens, temperature }) {
  const body = JSON.stringify({
    model: ANTHROPIC_MODEL(),
    max_tokens: maxTokens || 1500,
    temperature: temperature == null ? 0.5 : temperature,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const data = await httpsJson({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
    },
  }, body);
  const text = (data.content || []).map((p) => p.text || '').join('').trim();
  if (!text) throw new Error('Empty response from Anthropic');
  usage.record({ provider: 'anthropic', model: ANTHROPIC_MODEL(), inputTokens: data.usage?.input_tokens, outputTokens: data.usage?.output_tokens, kind: 'chat' });
  return text;
}

/**
 * Generic caller for any OpenAI "chat/completions"-compatible endpoint
 * (OpenAI, OpenRouter, Gemini's OpenAI-compatible layer).
 */
async function chatOpenAICompatible({ label, hostname, path, apiKey, model, extraHeaders, system, user, maxTokens, temperature, reasoningEffort }) {
  const body = JSON.stringify({
    model,
    max_tokens: maxTokens || 1500,
    temperature: temperature == null ? 0.5 : temperature,
    // Gemini 2.5 models spend part of the OUTPUT budget on internal reasoning, and
    // that share is invisible in completion_tokens. A 3000-token ceiling left ~300
    // tokens of actual text, so long structured answers came back cut mid-string and
    // failed to parse — which silently demoted the career ladders to the hardcoded
    // template. Asking for low effort on a formatting task returns the budget to the
    // answer. Only sent when a caller asks: not every provider accepts the field.
    ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  const data = await httpsJson({
    hostname,
    path,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
      ...(extraHeaders || {}),
    },
  }, body);
  const text = (((data.choices || [])[0] || {}).message || {}).content || '';
  if (!text.trim()) throw new Error(`Empty response from ${label || 'provider'}`);
  usage.record({ provider: label || 'openai-compatible', model, inputTokens: data.usage?.prompt_tokens, outputTokens: data.usage?.completion_tokens, kind: 'chat' });
  return text.trim();
}

/** Dispatch a single attempt to a named provider. */
function callProvider(name, args) {
  if (name === 'anthropic') return chatAnthropic(args);

  if (name === 'gemini') {
    return chatOpenAICompatible({
      // Callers can override with reasoningEffort; 'low' is the right default for the
      // extract-and-format work this app asks for, and it stops thinking tokens from
      // eating the output budget on the long JSON answers.
      reasoningEffort: 'low',
      ...args,
      label: 'Gemini',
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/openai/chat/completions',
      apiKey: process.env.GEMINI_API_KEY,
      model: GEMINI_MODEL(),
    });
  }

  if (name === 'openrouter') {
    // Try each model in turn — any single one can be rate-limited upstream.
    //
    // Probed 2026-07-30 against a real account: every ":free" slug this list used to
    // carry now answers HTTP 404 "This model is unavailable for free". OpenRouter
    // keeps withdrawing free tiers, so hard-coding more of them just rebuilds a dead
    // list. Only OPENROUTER_MODEL is tried now, and the error says plainly that the
    // slug is gone rather than burying it under four more 404s.
    //
    // A paid slug works if you want a real safety net behind Gemini's daily quota —
    // deepseek/deepseek-chat-v3-0324 (no ":free") answered. Set OPENROUTER_MODEL to it
    // knowing it bills per token.
    const models = [...new Set([OPENROUTER_MODEL()].filter(Boolean))];
    return (async () => {
      let lastErr;
      for (const model of models) {
        try {
          return await chatOpenAICompatible({
            ...args,
            label: `OpenRouter (${model})`,
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            apiKey: process.env.OPENROUTER_API_KEY,
            model,
            extraHeaders: { 'X-Title': 'CyberCareer' },
          });
        } catch (e) {
          lastErr = e;          // rate-limited / invalid model → just try the next one
        }
      }
      throw lastErr || new Error('OpenRouter: all free models failed');
    })();
  }

  if (name === 'openai') {
    return chatOpenAICompatible({
      ...args,
      label: 'OpenAI',
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY,
      model: OPENAI_MODEL(),
    });
  }

  // GWDG Chat AI — the Göttingen academic computing centre's LLM service, free to
  // members of participating German universities. The API is OpenAI-compatible, so
  // it needs no client of its own: only a different host and key.
  //
  // Sixteen models are exposed; the default is chosen for cover letters, which is
  // what this app actually generates. Measured 2026-08-14 on the production prompt:
  //
  //   qwen3-coder-next             left "[Unternehmensname]" unfilled in the letter
  //   qwen3.5-397b-a17b            returned empty — spends the budget on reasoning
  //   qwen3-30b-a3b-instruct-2507  3x faster, but upgraded "Grundlagen SIEM" into
  //                                "meine Erfahrung mit der Erkennung von Anomalien"
  //   mistral-medium-3.5-128b      kept it as "das mir den Einstieg erleichtern wird"
  //
  // The last one is the only distinction that matters here: an applicant has to
  // defend this letter in an interview, so a model that inflates the CV costs more
  // than the six seconds it saves. Override with GWDG_MODEL.
  if (name === 'gwdg') {
    return chatOpenAICompatible({
      ...args,
      label: 'GWDG Chat AI',
      hostname: 'chat-ai.academiccloud.de',
      path: '/v1/chat/completions',
      apiKey: process.env.GWDG_API_KEY,
      model: GWDG_MODEL(),
    });
  }

  return Promise.reject(new Error(`Unknown provider: ${name}`));
}

/**
 * Single-turn chat. Tries each available provider in order; within a provider,
 * retries transient errors (429/503/timeouts) with backoff. Returns the
 * assistant text, or throws if every provider/attempt fails.
 */
async function chat({ system, user, maxTokens, temperature }) {
  const providers = availableProviders();
  if (!providers.length) throw new Error('No LLM API key configured');
  const args = { system, user, maxTokens, temperature };
  const errors = [];

  for (const name of providers) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_PROVIDER; attempt++) {
      try {
        return await callProvider(name, args);
      } catch (e) {
        errors.push(`${name} (try ${attempt}): ${e.message}`);
        // Retry the same provider only on transient errors; otherwise fall
        // through to the next provider immediately.
        if (isTransient(e) && attempt < MAX_ATTEMPTS_PER_PROVIDER) {
          await sleep(600 * attempt * attempt); // ~0.6s, then ~2.4s
          continue;
        }
        break;
      }
    }
  }

  throw new Error(`All LLM providers failed → ${errors.join(' | ')}`);
}

module.exports = { chat, isAvailable, provider, availableProviders };
