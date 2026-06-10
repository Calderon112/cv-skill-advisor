/**
 * llm.js — Minimal external LLM client (Anthropic Claude, OpenAI fallback).
 *
 * Uses the Node built-in `https` module — no npm dependency. The API key is read
 * from environment variables (ANTHROPIC_API_KEY / OPENAI_API_KEY), which the
 * server loads from `.env`. If no key is set, `isAvailable()` returns false and
 * callers fall back to deterministic templates.
 */
const https = require('https');

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

function provider() {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

function isAvailable() {
  return provider() !== null;
}

function httpsJson(options, payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
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
    model: ANTHROPIC_MODEL,
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
  return text;
}

async function chatOpenAI({ system, user, maxTokens, temperature }) {
  const body = JSON.stringify({
    model: OPENAI_MODEL,
    max_tokens: maxTokens || 1500,
    temperature: temperature == null ? 0.5 : temperature,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  const data = await httpsJson({
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
    },
  }, body);
  const text = (((data.choices || [])[0] || {}).message || {}).content || '';
  if (!text.trim()) throw new Error('Empty response from OpenAI');
  return text.trim();
}

/**
 * Single-turn chat. Returns the assistant text, or throws if unavailable/failed.
 */
async function chat({ system, user, maxTokens, temperature }) {
  const p = provider();
  if (!p) throw new Error('No LLM API key configured');
  if (p === 'anthropic') return chatAnthropic({ system, user, maxTokens, temperature });
  return chatOpenAI({ system, user, maxTokens, temperature });
}

module.exports = { chat, isAvailable, provider };
