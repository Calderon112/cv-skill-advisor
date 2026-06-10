/**
 * dedup.js — Fuzzy cross-source job deduplication.
 *
 * The same role is often posted on several boards at once (Bundesagentur,
 * Arbeitnow, LinkedIn, Remotive). Exact title|company matching misses near
 * duplicates like "Python Developer (m/w/d)" vs "Python Developer" or
 * "Acme GmbH" vs "Acme AG". This module fuzzy-matches the normalized title +
 * company and keeps a single canonical row, recording the other sources under
 * `also_on` so the UI can show "also on LinkedIn, Remotive".
 *
 * Similarity = Sørensen–Dice coefficient over character bigrams (no dependency).
 */
'use strict';

const TITLE_THRESHOLD = 0.82;
const COMPANY_THRESHOLD = 0.80;

// Gender markers and company-form noise common in German job postings.
const NOISE = /\(?\s*[mwfdx]\s*[/\\|]\s*[mwfdx]\s*([/\\|]\s*[mwfdx]\s*)?\)?|\bgmbh\b|\bag\b|\bse\b|\bco\b|\bkg\b|\binc\b|\bltd\b|[^\w\s]/gi;

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(NOISE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function bigrams(s) {
  const out = new Map();
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2);
    out.set(g, (out.get(g) || 0) + 1);
  }
  return out;
}

/** Sørensen–Dice similarity over character bigrams, 0..1. */
function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
  const A = bigrams(a), B = bigrams(b);
  let inter = 0, total = 0;
  A.forEach((countA, g) => {
    total += countA;
    if (B.has(g)) inter += Math.min(countA, B.get(g));
  });
  B.forEach((countB) => { total += countB; });
  return (2 * inter) / total;
}

/** Are two jobs near-duplicates? Returns { dup, confidence }. */
function isDuplicate(jobA, jobB) {
  const ta = normalize(jobA.title), tb = normalize(jobB.title);
  const ca = normalize(jobA.company), cb = normalize(jobB.company);
  const titleSim = similarity(ta, tb);
  const companySim = similarity(ca, cb);
  if (titleSim >= TITLE_THRESHOLD && companySim >= COMPANY_THRESHOLD) {
    return { dup: true, confidence: Math.round((titleSim * 0.6 + companySim * 0.4) * 1000) / 1000 };
  }
  return { dup: false, confidence: 0 };
}

/**
 * De-duplicate a list of jobs across sources. Keeps the first occurrence as the
 * canonical row and appends other sources to its `also_on` array.
 */
function dedupeJobs(jobs) {
  const unique = [];
  (jobs || []).forEach((job) => {
    const match = unique.find((u) => isDuplicate(u, job).dup);
    if (match) {
      const src = job.board || job.platform || job.source;
      if (src) {
        match.also_on = match.also_on || [];
        if (!match.also_on.includes(src)) match.also_on.push(src);
      }
    } else {
      unique.push(job);
    }
  });
  return unique;
}

module.exports = { normalize, similarity, isDuplicate, dedupeJobs, TITLE_THRESHOLD, COMPANY_THRESHOLD };
