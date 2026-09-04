/**
 * cv-schema.js — build the profile form from the CV, instead of the CV from a form.
 *
 * The manual form is a fixed shape: name, title, skills, experience, education,
 * certifications. That shape is a guess about what a CV contains, and it is wrong
 * as often as it is right — a student CV leads with PROJEKTE and has no employment
 * history worth the name, a career changer has WEITERBILDUNG and no certifications,
 * a German CV separates SOFT SKILLS from TECHNISCHE FÄHIGKEITEN and an English one
 * does not. Imposing the shape loses whatever did not fit it and shows empty boxes
 * for whatever was never there.
 *
 * So when a CV is imported, the form is built from the headings the document
 * actually has. The manual form stays exactly as it is for people entering a
 * profile by hand, where there is no document to read a shape from.
 *
 * The split follows the rule the rest of this project uses:
 *
 *   deterministic  which headings exist, and where each block starts and ends.
 *                  A heading is a line, not an opinion, and finding one needs no
 *                  model. This runs alone when there is no API key, and produces a
 *                  usable — if flatter — form on its own.
 *
 *   deliberative   what shape the content inside a block has. "02.2023 – 09.2023 /
 *                  Praktikum / DIGITAL-X Suarl" is three fields and a date range;
 *                  "Security Tools: Kali Linux, Wireshark" is a labelled row;
 *                  "▸ Teamfähigkeit" is a list item. Telling those apart from
 *                  layout alone is exactly the judgement a model is good at.
 *
 *   guard          every value the model returns must appear in the CV, verbatim.
 *                  A form field invented here becomes a claim in a cover letter two
 *                  screens later, and by then nobody can tell it was never written.
 */
'use strict';

const MAX_TOKENS = 2600;

// A heading, in the shapes CVs actually use: a short line in capitals, or a short
// line that is one of the names this project already knows. Length is the strongest
// signal — a heading is a label, not a sentence.
const KNOWN = [
  'BERUFSERFAHRUNG', 'WORK EXPERIENCE', 'EXPERIENCE', 'ERFAHRUNG', 'PROJEKTE', 'PROJECTS',
  'TECHNISCHE FÄHIGKEITEN', 'TECHNISCHE FAEHIGKEITEN', 'SKILLS', 'KOMPETENZEN',
  'AUSBILDUNG', 'EDUCATION', 'STUDIUM', 'WEITERBILDUNG', 'CERTIFICATIONS', 'ZERTIFIKATE',
  'SPRACHEN', 'LANGUAGES', 'SOFT SKILLS', 'INTERESSEN', 'INTERESTS', 'HOBBIES',
  'KONTAKT', 'CONTACT', 'PROFIL', 'PROFILE', 'SUMMARY',
  // Headings real German CVs use that the list above missed. This matters more
  // than it looks: the position rule below skips everything above the first KNOWN
  // heading, so a document whose first section is not on this list loses it.
  'FÄHIGKEITEN', 'FAEHIGKEITEN', 'KENNTNISSE', 'HOBBYS UND INTERESSEN', 'HOBBYS',
  'PRAKTIKA', 'BERUFSPRAXIS', 'PERSÖNLICHE DATEN', 'ÜBER MICH', 'ZUSAMMENFASSUNG',
  // Missing entirely from one generated CV because it was not on this list: a whole
  // section of the source document, silently absent from the output.
  'PRAKTISCHE KENNTNISSE', 'PRAKTISCHE ERFAHRUNG', 'IT-KENNTNISSE', 'EDV-KENNTNISSE',
];

function looksLikeHeading(line) {
  const t = line.trim();
  if (t.length < 3 || t.length > 42) return false;
  if (/[.!?;]$/.test(t)) return false;                       // a sentence, not a label
  const bare = t.replace(/[:•▸]/g, '').trim();
  if (KNOWN.includes(bare.toUpperCase())) return true;

  // Beyond the names this project knows, capitals alone are not enough. A real CV
  // produced a section called "SAP" — three letters from a capitalised skill list,
  // which then swallowed the line beneath it as its content. A heading a document
  // actually uses is a word, not an abbreviation.
  if (bare.length < 6) return false;

  // All caps, at least one letter, no digits: "TECHNISCHE FÄHIGKEITEN".
  return /^[A-ZÄÖÜß][A-ZÄÖÜß &/-]*$/.test(bare) && /[A-ZÄÖÜß]{3}/.test(bare);
}

/**
 * The CV's own sections: every heading it carries, with the text under each.
 * Deterministic, and useful on its own — the caller can render one editable block
 * per section without any model at all.
 *
 * @returns {Array<{heading: string, body: string}>}
 */
function detectSections(cvText) {
  const lines = String(cvText || '').split(/\r?\n/);
  const sections = [];
  let current = null;

  // A CV opens with the candidate's name, and a name set in capitals passes every
  // shape test a heading passes — one real CV produced a section called
  // "JARDEL GALDOS KENNE" holding the personal statement. Position settles it:
  // nothing above the first heading the document is known to use is itself a
  // heading. That opening block is the header, and it belongs to the profile
  // fields, not to a section of its own.
  const firstKnown = lines.findIndex((l) => KNOWN.includes(
    String(l).trim().replace(/[:•▸]/g, '').trim().toUpperCase()));

  lines.forEach((raw, i) => {
    if (firstKnown !== -1 && i < firstKnown) return;
    if (looksLikeHeading(raw)) {
      current = { heading: raw.trim().replace(/[:]+$/, ''), body: '' };
      sections.push(current);
      return;
    }
    if (!current) return;                                    // preamble, before any heading
    if (raw.trim()) current.body += (current.body ? '\n' : '') + raw.trim();
  });
  return sections.filter((s) => s.body);
}

const KINDS = new Set(['entries', 'rows', 'list', 'text']);

/** Case- and whitespace-insensitive containment, for the verbatim check. */
function norm(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Ask the model what shape each detected section has, and check its answer.
 *
 * Sections are described, never invented: the headings come from detectSections()
 * and a heading the model returns that was not in that list is dropped. Values are
 * checked against the CV text one by one.
 *
 * @returns {Promise<{sections: Array}|null>} null on any failure, so the caller
 *          falls back to the deterministic sections.
 */
async function buildSchema({ cvText, sections }, llm) {
  if (!llm || !llm.isAvailable || !llm.isAvailable()) return null;
  const text = String(cvText || '').trim();
  if (!text || !Array.isArray(sections) || !sections.length) return null;

  const system = [
    'You structure a CV that has ALREADY been split into sections. You do not summarise it,',
    'improve it, translate it or add to it.',
    '',
    'For each section given, choose ONE shape and fill it:',
    '  "entries" — dated items. Fields: title, org, period, bullets[]. For jobs, projects,',
    '              education, training.',
    '  "rows"    — labelled rows. Fields: label, value. For "Security Tools: Kali, Wireshark".',
    '  "list"    — one short item per line. For soft skills, interests, languages.',
    '  "text"    — a paragraph. For a profile or summary.',
    '',
    'Rules:',
    '- Copy values from the CV EXACTLY. Never rephrase, never translate, never merge two',
    '  bullets into one sentence, never expand an abbreviation.',
    '- Keep the section heading exactly as given to you.',
    '- A field with nothing to put in it is an empty string, not an invention.',
    '- If several date ranges appear consecutively with no text between them, they come from a',
    '  separate date column and you cannot tell which entry each belongs to. Leave "period" empty.',
    '- Return ONLY JSON, no prose, no fence:',
    '  {"sections":[{"heading":"<as given>","kind":"entries|rows|list|text",',
    '    "items":[{"title":"","org":"","period":"","bullets":[]}]}]}',
    '  rows items are {"label":"","value":""}; list items are plain strings;',
    '  text items are a single plain string.',
  ].join('\n');

  const user = sections
    .map((s) => `### ${s.heading}\n${s.body.slice(0, 1800)}`)
    .join('\n\n') + '\n\nReturn the JSON.';

  let reply;
  try {
    reply = await llm.chat({ system, user, maxTokens: MAX_TOKENS, temperature: 0.1 });
  } catch (_) { return null; }

  let parsed;
  try {
    const raw = String(reply).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    parsed = JSON.parse(raw);
  } catch (_) { return null; }
  if (!parsed || !Array.isArray(parsed.sections)) return null;

  const allowed = new Map(sections.map((s) => [norm(s.heading), s.heading]));
  const haystack = norm(text);
  const kept = [];
  const dropped = [];

  // Anything that is not a verbatim fragment of the CV is discarded. Short strings
  // are exempt: a two-character value carries no claim, and demanding an exact match
  // on "PHP" against normalised text produces false rejections, not safety.
  const ok = (v) => {
    const s = String(v || '').trim();
    if (s.length < 4) return true;
    return haystack.includes(norm(s));
  };

  parsed.sections.forEach((sec) => {
    const heading = allowed.get(norm(sec && sec.heading));
    if (!heading) { dropped.push({ heading: sec && sec.heading, why: 'heading not in the CV' }); return; }
    const kind = KINDS.has(sec.kind) ? sec.kind : 'text';
    const items = Array.isArray(sec.items) ? sec.items : [];
    const clean = [];

    items.forEach((item) => {
      if (kind === 'list') {
        if (ok(item)) clean.push(String(item).trim());
        else dropped.push({ heading, why: 'list item not in the CV' });
      } else if (kind === 'text') {
        if (ok(item)) clean.push(String(item).trim());
        else dropped.push({ heading, why: 'text not in the CV' });
      } else if (kind === 'rows') {
        if (item && ok(item.label) && ok(item.value)) {
          clean.push({ label: String(item.label || '').trim(), value: String(item.value || '').trim() });
        } else dropped.push({ heading, why: 'row not in the CV' });
      } else {
        if (!item) return;
        // Bullets are filtered individually rather than sinking the whole entry: a
        // real job with one invented line is still a real job. The removals are
        // recorded, because a bullet that vanishes without a word is the same
        // silence this project keeps finding bugs behind.
        const raw = Array.isArray(item.bullets) ? item.bullets : [];
        const bullets = raw.filter(ok).map((b) => String(b).trim());
        raw.filter((b) => !ok(b)).forEach((b) => dropped.push({
          heading, why: 'bullet not in the CV', text: String(b).slice(0, 90),
        }));
        if (ok(item.title) && ok(item.org) && ok(item.period)) {
          clean.push({
            title: String(item.title || '').trim(),
            org: String(item.org || '').trim(),
            period: String(item.period || '').trim(),
            bullets,
          });
        } else dropped.push({ heading, why: 'entry not in the CV' });
      }
    });

    if (clean.length) kept.push({ heading, kind, items: clean });
  });

  if (!kept.length) return null;
  return { sections: kept, dropped };
}

module.exports = { detectSections, buildSchema, looksLikeHeading };
