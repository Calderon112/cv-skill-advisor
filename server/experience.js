/**
 * experience.js — how many years of professional experience a CV actually shows.
 *
 * scorer.js gives seniority ten of its hundred points and reads them from
 * `profile.experienceYears`. Nothing ever set that field: scoreJob() in server.js
 * built its profile from skills and target roles only, so `|| 0` fired on every
 * call and every candidate was scored as having no experience at all. Ten points
 * of a published formula were decided by a value the system never measured.
 *
 * The fix has to keep the score reproducible, which rules out asking a model each
 * time a job is scored — the same CV against the same posting would drift. So:
 *
 *   1. Date ranges in the CV text are parsed and summed. Pure arithmetic, same
 *      answer every run. This is the source of truth whenever it finds anything.
 *   2. Only when a CV carries no parseable range may a model propose a figure, and
 *      it must quote the sentence it read it from. That value is stored on the
 *      profile, so scoring stays deterministic for a given profile: the model
 *      informs the profile, never the score.
 *
 * Overlapping ranges are merged rather than added. Two jobs held in the same year
 * are one year of experience, and a CV listing four concurrent projects would
 * otherwise report a decade.
 */
'use strict';

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  'mär': 3, mrz: 3, mai: 5, okt: 10, dez: 12,
};

// 02.2023 · 2/2023 · Feb 2023 · Februar 2023 · 2023
const SEP = '(?:\\s*[–—-]{1,2}\\s*|\\s+(?:bis|to|until)\\s+)';
const POINT = '(?:(\\d{1,2})[./](\\d{4})|([A-Za-zäöüÄÖÜ]{3,9})\\.?\\s+(\\d{4})|(\\d{4}))';
const RANGE = new RegExp(POINT + SEP + '(?:' + POINT + '|(heute|present|current|now|aktuell|jetzt))', 'gi');

// A date range sitting beside any of these describes studying, not working. A CV
// carries both, and counting them together turns a student with one internship into
// a candidate with nine years of experience: the education block alone runs from
// school to the current semester.
//
// A thesis is deliberately on this list. "Bachelorarbeit" often appears under
// BERUFSERFAHRUNG, and it is academic work — counting it would overstate the
// candidate to a recruiter who is going to ask about it.
const NOT_WORK = new RegExp([
  'studium', 'studien', 'bachelorarbeit', 'masterarbeit', 'bachelor', 'master',
  'b\\.?\\s?sc\\b', 'm\\.?\\s?sc\\b', 'abitur', 'diplom', 'universit', 'hochschule',
  'gymnasium', 'fachhochschule', 'ausbildung', 'sprachkurs', 'sprachlern', 'deutschkurs',
  'degree', 'university', 'school', 'semester', 'note\\s?:', 'grade\\s?:',
  '\\b[abc][12]\\b',
].join('|'), 'i');

/** A date point in months, or null when it did not parse. */
function toMonths(mm, yy1, name, yy2, yOnly) {
  if (yy1) return Number(yy1) * 12 + Math.min(12, Math.max(1, Number(mm)));
  if (yy2) {
    const m = MONTHS[String(name).slice(0, 3).toLowerCase()];
    return m ? Number(yy2) * 12 + m : Number(yy2) * 12 + 1;
  }
  if (yOnly) return Number(yOnly) * 12 + 1;
  return null;
}

/**
 * The entry a date range belongs to: its own line plus the two that follow.
 *
 * A symmetric character window does not work. Ninety characters after
 * "02.2023 - 09.2023 / Praktikum / Beispiel Suarl" already reaches the next entry's
 * "Universitaet", and the internship was discarded because of a word belonging to
 * the block below it. In a CV the role and the organisation follow the dates, so
 * forward-by-lines is the shape of the data.
 */
function entryAround(src, index, matchLength) {
  const lineStart = src.lastIndexOf('\n', index) + 1;
  let end = index + matchLength;
  for (let i = 0; i < 2; i++) {
    const nl = src.indexOf('\n', end);
    if (nl === -1) { end = src.length; break; }
    end = nl + 1;
  }
  return src.slice(lineStart, end);
}

/**
 * Date ranges found in free text, as [startMonths, endMonths] pairs.
 * Exported for the tests: the parsing is the part most likely to be wrong.
 */
function extractRanges(text, nowMonths) {
  const out = [];
  const src = String(text || '');
  let m;
  RANGE.lastIndex = 0;
  while ((m = RANGE.exec(src)) !== null) {
    if (NOT_WORK.test(entryAround(src, m.index, m[0].length))) continue;
    const start = toMonths(m[1], m[2], m[3], m[4], m[5]);
    const end = m[11] ? nowMonths : toMonths(m[6], m[7], m[8], m[9], m[10]);
    if (start === null || end === null) continue;
    if (end < start) continue;              // a reversed range is a typo
    if (end - start > 50 * 12) continue;    // fifty years is a parse error
    out.push([start, end]);
  }
  return out;
}

/** Merge overlapping or touching ranges, then sum. */
function mergedMonths(ranges) {
  if (!ranges.length) return 0;
  const sorted = ranges.slice().sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0].slice()];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i][0] <= last[1]) last[1] = Math.max(last[1], sorted[i][1]);
    else merged.push(sorted[i].slice());
  }
  return merged.reduce((sum, r) => sum + (r[1] - r[0]), 0);
}

/**
 * Years of professional experience from CV text. Deterministic; returns null when
 * the text carries no parseable range, which is the only case the model is asked.
 *
 * @param {string} cvText
 * @param {Date} [now]  injectable so a test is not tied to the wall clock
 */
function deriveExperienceYears(cvText, now) {
  const d = now || new Date();
  const nowMonths = d.getFullYear() * 12 + (d.getMonth() + 1);
  const ranges = extractRanges(cvText, nowMonths);
  if (!ranges.length) return null;
  return Math.round((mergedMonths(ranges) / 12) * 10) / 10;
}

/**
 * Scout's fallback: a model reads the CV when no dates could be parsed, and must
 * quote the sentence it took the figure from. The quote is checked against the CV
 * before the number is accepted — the same rule the inferred-skills guard applies.
 * A number with no sentence behind it is a guess wearing a decimal point.
 *
 * @returns {Promise<{years:number, evidence:string}|null>}
 */
async function inferExperienceYears(cvText, llm) {
  if (!llm || !llm.isAvailable || !llm.isAvailable()) return null;
  const text = String(cvText || '').trim();
  if (text.length < 80) return null;

  const system = [
    'You read a CV and report how many years of PROFESSIONAL experience it shows.',
    '',
    'Rules:',
    '- Count paid employment, internships and working-student roles.',
    '- Do NOT count studies, coursework, theses or university projects.',
    '- Quote, verbatim, the sentence fragment from the CV you based the figure on.',
    '- If the CV shows no professional experience, answer 0 with an empty quote.',
    '- Return ONLY JSON, no prose, no fence: {"years": <number>, "evidence": "<verbatim quote>"}',
  ].join('\n');

  let reply;
  try {
    reply = await llm.chat({
      system,
      user: '<cv>\n' + text.slice(0, 6000) + '\n</cv>',
      maxTokens: 200,
      temperature: 0.1,
    });
  } catch (_) { return null; }

  let parsed;
  try {
    const raw = String(reply).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    parsed = JSON.parse(raw);
  } catch (_) { return null; }

  const years = Number(parsed && parsed.years);
  if (!Number.isFinite(years) || years < 0 || years > 50) return null;

  const evidence = String((parsed && parsed.evidence) || '').trim();
  if (years === 0) return { years: 0, evidence: '' };

  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
  if (evidence.length < 8 || !norm(text).includes(norm(evidence))) return null;

  return { years: Math.round(years * 10) / 10, evidence };
}

module.exports = { deriveExperienceYears, inferExperienceYears, extractRanges, mergedMonths };
