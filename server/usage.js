/**
 * usage.js — Lightweight LLM/embedding observability.
 *
 * Accumulates token counts per model (from provider `usage` fields) and estimates
 * cost from a rough price table. In-memory (resets on restart). Read via /api/usage.
 * Prices are approximate USD per 1M tokens — override with env if needed.
 */
'use strict';

const PRICES = {
  'gemini-2.5-flash':       { in: 0.30, out: 2.50 },
  'gemini-2.5-pro':         { in: 1.25, out: 10.0 },
  'gemini-embedding-001':   { in: 0.15, out: 0 },
  'gpt-4o':                 { in: 2.50, out: 10.0 },
  'gpt-4o-mini':            { in: 0.15, out: 0.60 },
  'text-embedding-3-small': { in: 0.02, out: 0 },
};

const _totals = { calls: 0, inputTokens: 0, outputTokens: 0, byModel: {}, since: Date.now() };

function priceFor(model) { return PRICES[model] || { in: 0, out: 0 }; }
function costOf(inTok, outTok, model) {
  const p = priceFor(model);
  return (inTok / 1e6) * p.in + (outTok / 1e6) * p.out;
}

/** Record one call's token usage. Safe to call with missing/zero counts. */
function record({ provider = '?', model = '?', inputTokens = 0, outputTokens = 0, kind = 'chat' } = {}) {
  const inp = Number(inputTokens) || 0;
  const out = Number(outputTokens) || 0;
  _totals.calls++;
  _totals.inputTokens += inp;
  _totals.outputTokens += out;
  const m = _totals.byModel[model] || (_totals.byModel[model] = { provider, kind, calls: 0, inputTokens: 0, outputTokens: 0 });
  m.calls++; m.inputTokens += inp; m.outputTokens += out;
  if (process.env.USAGE_LOG !== '0') {
    console.log(`[usage] ${kind} ${model}: +${inp} in / +${out} out  (≈$${costOf(inp, out, model).toFixed(5)})`);
  }
}

/** Aggregate snapshot with estimated cost per model + total. */
function snapshot() {
  let estCostUsd = 0;
  const models = Object.entries(_totals.byModel).map(([model, m]) => {
    const cost = costOf(m.inputTokens, m.outputTokens, model);
    estCostUsd += cost;
    return { model, provider: m.provider, kind: m.kind, calls: m.calls, inputTokens: m.inputTokens, outputTokens: m.outputTokens, estCostUsd: Math.round(cost * 1e4) / 1e4 };
  }).sort((a, b) => b.estCostUsd - a.estCostUsd);
  return {
    since: new Date(_totals.since).toISOString(),
    calls: _totals.calls,
    inputTokens: _totals.inputTokens,
    outputTokens: _totals.outputTokens,
    estCostUsd: Math.round(estCostUsd * 1e4) / 1e4,
    models,
  };
}

module.exports = { record, snapshot };
