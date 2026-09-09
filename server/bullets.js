/**
 * bullets.js — better wording for what the CV already says, and nothing else.
 *
 * The profile form asks for a description of each job and gets a fragment: "Jira",
 * "Systemadministration", "SuiteCrm". A recruiter reads a bullet, not a noun, and
 * the gap between the two is where CV builders make their money — Zety and the rest
 * offer a library of pre-written lines you click to insert.
 *
 * Those libraries are the part worth refusing. A line like "Reduced incident
 * response time by 40% through SIEM tuning" reads well and is a claim the applicant
 * has not made and may not be able to defend in an interview. It is also
 * recognisable: a recruiter who has read a hundred CVs has read that line before.
 *
 * So the suggestions here are rewrites, never additions. The model is given the
 * candidate's own CV text and the entry being edited, and asked to phrase what is
 * already there the way a CV phrases it. Then the guard checks the answer.
 *
 * The guard is the part that makes this safe to ship, and it cannot be the verbatim
 * check the schema parser uses — rephrasing is the whole point, so demanding the
 * exact words back would reject every good suggestion along with every bad one. It
 * checks the substance instead: every word in a suggestion that could carry a claim
 * must be traceable to the source text. A rewording of "Jira Cloud Migration"
 * passes; "ISO 27001 audit" does not, when the CV has never mentioned it.
 */
'use strict';

const MAX_TOKENS = 900;
const MAX_SUGGESTIONS = 5;

// Words that carry no claim, so their absence from the source proves nothing. German
// first, because that is what these CVs are written in.
const STOP = new Set([
  'aber', 'alle', 'allem', 'allen', 'aller', 'alles', 'also', 'andere', 'anderem',
  'auch', 'auf', 'aus', 'bei', 'beim', 'bis', 'dabei', 'damit', 'dann', 'darauf',
  'das', 'dass', 'dem', 'den', 'der', 'des', 'die', 'dies', 'diese', 'diesem',
  'diesen', 'dieser', 'dieses', 'durch', 'ein', 'eine', 'einem', 'einen', 'einer',
  'eines', 'fuer', 'für', 'gegen', 'hatte', 'ihre', 'ihrer', 'immer', 'indem',
  'jede', 'jeden', 'kann', 'konnte', 'mehr', 'mein', 'meine', 'mit', 'nach', 'nicht',
  'noch', 'nur', 'ober', 'oder', 'ohne', 'sein', 'seine', 'sich', 'sind', 'sowie',
  'sowohl', 'ueber', 'über', 'und', 'unter', 'vom', 'von', 'vor', 'wann', 'warum',
  'weil', 'weit', 'welche', 'wenn', 'werde', 'werden', 'wie', 'wieder', 'wird',
  'wurde', 'wurden', 'zum', 'zur', 'zwischen',
  'about', 'after', 'again', 'against', 'along', 'among', 'and', 'been', 'before',
  'being', 'between', 'both', 'during', 'each', 'from', 'further', 'have', 'having',
  'into', 'more', 'most', 'other', 'over', 'same', 'such', 'than', 'that', 'their',
  'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'under',
  'until', 'were', 'what', 'when', 'where', 'which', 'while', 'with', 'within',
  // Verbs a CV bullet opens with. They describe the act, not the subject, so they
  // are allowed to be new — "Migrated" for a CV that wrote "Migration".
  'administered', 'analysed', 'analyzed', 'built', 'created', 'delivered',
  'designed', 'developed', 'documented', 'implemented', 'improved', 'installed',
  'maintained', 'managed', 'migrated', 'performed', 'planned', 'supported', 'tested',
  'aufgebaut', 'betreut', 'durchgefuehrt', 'durchgeführt', 'eingefuehrt',
  'eingeführt', 'entwickelt', 'erstellt', 'migriert', 'umgesetzt', 'verantwortlich',
]);

/** Lower case, punctuation to spaces; umlauts kept, since they distinguish words. */
function norm(s) {
  return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/**
 * The words in a line that could carry a claim.
 *
 * Verbs are deliberately not among them. A rewrite has to be free to say
 * "angewendet" where the CV said nothing of the kind — that is what rewriting is —
 * and an earlier version of this guard rejected a perfectly sound bullet for it.
 * Enumerating verbs does not work either: there is no list to finish.
 *
 * What does carry a claim is the nouns, and German writes them with a capital. So:
 * capitalised words, acronyms, and numbers are checked; everything lowercase is
 * allowed to be new. The tools, standards, certifications, employers and metrics a
 * model invents are all in the checked set — SIEM, ISO, 27001, OSCP, Teams — and
 * the verbs and adjectives it needs to phrase a sentence are not.
 *
 * The first word is skipped: every sentence starts with a capital, so its case says
 * nothing about what it is.
 *
 * This leans on a German convention, and an English bullet is therefore checked
 * more lightly — proper nouns, acronyms and numbers only. That is the half that
 * matters for a fabricated claim, and the model is told plainly not to add facts;
 * the guard is a net under that instruction, not a substitute for it.
 */
function claimWords(text) {
  const out = [];
  const words = String(text || '').split(/[^\p{L}\p{N}+#.]+/u).filter(Boolean);
  words.forEach((raw, i) => {
    const w = raw.replace(/[.]+$/, '');
    if (!w) return;
    const low = norm(w);
    if (!low) return;
    // Any digit, including a lone one: "3 Regionen" and "5 Jahre" are claims as
    // much as "40%" is, and a two-character floor let them through.
    if (/^\d+$/.test(low)) { out.push({ word: low, exact: true }); return; }
    const isAcronym = /^[A-Z0-9][A-Z0-9+#.]+$/.test(w);
    if (isAcronym) { if (low.length >= 2) out.push({ word: low, exact: true }); return; }
    if (i === 0) return;                              // sentence case proves nothing
    if (!/^\p{Lu}/u.test(w)) return;                  // lower case: not a claim
    // German turns verbs into capitalised nouns, and the result is an act, not a
    // thing: Ausfuehrung, Validierung, Dokumentation, Durchfuehrung. Treating
    // those as claims rejected good rewrites — "Ausfuehrung von Funktionstests"
    // for a CV that says "Funktionstests". They are exempt, and nothing is lost:
    // an invented claim always names a thing — SIEM, ISO, Splunk, a headcount, a
    // percentage — and every one of those is still checked. "Durchfuehrung von
    // Penetrationstests" still fails, on Penetrationstests.
    if (/(ung|heit|keit|tion|schaft)$/.test(low)) return;
    if (low.length < 4 || STOP.has(low)) return;
    out.push({ word: low, exact: false });
  });
  return out;
}

/**
 * Is every claim in this line traceable to the source?
 *
 * German compounds are why the non-exact case matches on a prefix rather than the
 * whole word: a CV writing "Systemadministration" supports a bullet saying
 * "Administration der Systeme", and a whole-word check would call that an
 * invention. Five characters is enough of a stem to keep "Penetrationstest" from
 * matching "Personal".
 */
function grounded(line, haystack) {
  return claimWords(line).every(({ word, exact }) =>
    haystack.includes(exact ? word : word.slice(0, 5)));
}

/**
 * Rewrite one entry's description into CV bullets.
 *
 * @returns {Promise<{suggestions: string[], dropped: string[]}|null>} null when
 *          there is no model or nothing to work from, so the caller shows nothing
 *          rather than an error.
 */
async function suggestBullets({ cvText, entry, targetRole }, llm) {
  if (!llm || !llm.isAvailable || !llm.isAvailable()) return null;
  const source = String(cvText || '').trim();
  const e = entry || {};
  // The profile form calls the employer 'org'; 'company' is accepted too, because
  // a caller reading a job posting rather than a profile entry uses that name.
  const org = e.org || e.company || '';
  if (!source || !(e.role || org || e.desc)) return null;

  const system = [
    'You rewrite what a CV already says about ONE position into bullet points a',
    'recruiter can read. You are not a copywriter and you do not have a library of',
    'phrases: every bullet must restate something the CV text already contains.',
    '',
    'Rules:',
    '- Never introduce a tool, standard, certification, metric, number, client or',
    '  responsibility that is not in the CV text. No invented percentages.',
    '- Write in the language of the CV. A German CV gets German bullets.',
    '- One line each, 8 to 18 words, starting with what was done.',
    '- Do not repeat a bullet the entry already has, word for word.',
    '- At most ' + MAX_SUGGESTIONS + ' bullets. Fewer is correct when the CV says little.',
    '- Return ONLY a JSON array of strings. No prose, no fence.',
  ].join('\n');

  const user = [
    'CV TEXT (the only source of fact):', source.slice(0, 6000), '',
    'POSITION BEING EDITED:',
    'Title: ' + (e.role || ''), 'Employer: ' + org,
    'Period: ' + [e.start, e.end].filter(Boolean).join(' – ') || (e.period || ''),
    'Current description: ' + (e.desc || '(empty)'), '',
    targetRole ? 'The candidate is applying for: ' + targetRole
      + '. Prefer wording that is relevant to it, but invent nothing.' : '',
    'Return the JSON array.',
  ].join('\n');

  let reply;
  try {
    reply = await llm.chat({ system, user, maxTokens: MAX_TOKENS, temperature: 0.3 });
  } catch (_) { return null; }

  let parsed;
  try {
    const raw = String(reply).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    parsed = JSON.parse(raw);
  } catch (_) { return null; }
  if (!Array.isArray(parsed)) return null;

  const haystack = norm(source);
  const suggestions = [];
  const dropped = [];
  parsed.slice(0, MAX_SUGGESTIONS * 2).forEach((item) => {
    const line = String(item || '').trim().replace(/^[-•*]\s*/, '');
    if (!line || line.length < 8) return;
    // Recorded rather than discarded quietly. A model that keeps proposing lines the
    // CV cannot support is worth being able to see, and a suggestion that vanishes
    // without a word is the silence this project keeps finding bugs behind.
    if (grounded(line, haystack)) { if (suggestions.length < MAX_SUGGESTIONS) suggestions.push(line); }
    else dropped.push(line);
  });

  if (!suggestions.length && !dropped.length) return null;
  return { suggestions, dropped };
}

module.exports = { suggestBullets, grounded, claimWords, norm };
