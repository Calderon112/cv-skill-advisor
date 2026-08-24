/**
 * score-explainer.js — the model explains the score; the formula decides it.
 *
 * The match percentage stays exactly where it was: in scorer.js, deterministic,
 * with published weights, reproducible tomorrow. Two independent reviewers named
 * that as the project's strongest decision, and the site sells it as "a score you
 * can argue with" — a number produced by a model would be a different number every
 * run and could not be decomposed.
 *
 * What a formula cannot do is say which of the six components actually mattered,
 * in a sentence a candidate can act on. "Skills 28 of 45" is accurate and tells
 * nobody what to do on Monday. That gap is what this fills.
 *
 * The contract is one-directional and enforced below: this module receives the
 * computed score and its breakdown, and may only describe them. It never returns a
 * number of its own, and an explanation that states a different percentage is
 * rejected rather than shown — a caption that disagrees with the figure above it
 * destroys trust in both.
 */
'use strict';

const MAX_TOKENS = 260;

// Every number the explanation is allowed to contain, derived from the breakdown
// rather than from the prose. Anything else is a hallucinated figure.
function allowedNumbers(score100, breakdown) {
  // 100 is the scale, not a claim: "76 out of 100" is the most natural way to
  // state the score and was being rejected as an invented figure. 0 likewise,
  // for a component that earned nothing.
  const allowed = new Set([String(Math.round(score100)), '100', '0']);
  const pts = (breakdown && breakdown.points) || {};
  const wts = (breakdown && breakdown.weights) || {};
  Object.keys(wts).forEach((k) => {
    allowed.add(String(wts[k]));
    if (pts[k] !== undefined) {
      allowed.add(String(pts[k]));
      allowed.add(String(Math.round(pts[k])));
      // The shortfall, which is the number an explanation most naturally reaches
      // for: "missing Splunk costs 17 of the 45 skill points" says more than
      // either 28 or 45 on its own. Derived here, so it is verified rather than
      // trusted.
      const gap = Math.round((wts[k] - pts[k]) * 10) / 10;
      allowed.add(String(gap));
      allowed.add(String(Math.round(gap)));
    }
  });
  // Counts of the skill lists — an explanation may legitimately say "two of the
  // five skills this posting asks for".
  const matched = (breakdown && breakdown.skillsMatched) || [];
  const missing = (breakdown && breakdown.skillsMissing) || [];
  [matched.length, missing.length, matched.length + missing.length].forEach((n) => allowed.add(String(n)));
  return allowed;
}

/**
 * @param {object} args
 *   score100    the number already shown to the user, 0..100
 *   breakdown   { points, weights, skillsMatched, skillsMissing } from scorer.js
 *   job         { title, company }
 *   language    'de' | 'en' — matches the interface the user is reading
 * @returns {Promise<{text:string}|null>}  null whenever anything is unavailable or
 *          unverifiable, so the caller falls back to the breakdown table alone.
 */
async function explainScore({ score100, breakdown, job, language }, llm) {
  if (!llm || !llm.isAvailable || !llm.isAvailable()) return null;
  if (typeof score100 !== 'number' || !breakdown || !breakdown.points) return null;

  const pts = breakdown.points;
  const wts = breakdown.weights || {};
  const rows = Object.keys(wts)
    .map((k) => `${k}: ${pts[k] !== undefined ? pts[k] : 0} of ${wts[k]}`)
    .join('\n');

  const matched = (breakdown.skillsMatched || []).slice(0, 14).join(', ') || '(none)';
  const missing = (breakdown.skillsMissing || []).slice(0, 14).join(', ') || '(none)';

  // The largest shortfall, computed here rather than left to the model to work
  // out. Arithmetic the caller already has should not be delegated to a language
  // model — it is the one part of this that can be wrong silently.
  let worst = null, worstGap = -1;
  Object.keys(wts).forEach((k) => {
    const gap = wts[k] - (pts[k] || 0);
    if (gap > worstGap) { worstGap = gap; worst = k; }
  });

  const system = [
    'You explain a job-match score that has ALREADY been calculated. You are not scoring anything.',
    '',
    'Rules, in order of importance:',
    '- Use ONLY the numbers given below. Never state a percentage or a point value that is not in the data.',
    '- Never contradict the total. It is final.',
    '- Name the component that costs the candidate the most points, and say what would close it.',
    '- Address the candidate directly, in two or three sentences. No preamble, no bullet list, no heading.',
    '- Describe, do not encourage. "You are missing X" is useful; "great fit, good luck" is not.',
    language === 'de' ? '- Write in German.' : '- Write in English.',
  ].join('\n');

  const user = [
    `Job: ${(job && job.title) || 'the role'}${job && job.company ? ' at ' + job.company : ''}`,
    `Total score: ${Math.round(score100)} of 100`,
    '',
    'Points earned per component (earned of maximum):',
    rows,
    '',
    `Largest shortfall: ${worst} (${Math.round(worstGap * 10) / 10} points below its maximum)`,
    `Skills the candidate has that this posting asks for: ${matched}`,
    `Skills this posting asks for that the candidate lacks: ${missing}`,
    '',
    'Write the explanation.',
  ].join('\n');

  let text;
  try {
    text = await llm.chat({ system, user, maxTokens: MAX_TOKENS, temperature: 0.3 });
  } catch (_) { return null; }

  text = String(text || '').trim();
  if (text.length < 20) return null;

  // The guard. A model asked to describe a 62 will sometimes write 65, or invent a
  // "78% match on skills" that appears nowhere in the data — and a caption
  // disagreeing with the figure printed above it is worse than no caption, because
  // the reader cannot tell which of the two to believe.
  const allowed = allowedNumbers(score100, breakdown);
  const stated = text.match(/\d+(?:[.,]\d+)?/g) || [];
  const invented = stated.filter((n) => !allowed.has(n) && !allowed.has(String(Math.round(parseFloat(n.replace(',', '.'))))));
  if (invented.length) return null;

  return { text, worst };
}

module.exports = { explainScore };
