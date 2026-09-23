/**
 * json-resume.js — the profile as JSON Resume, and back.
 *
 * JSON Resume (jsonresume.org) is the one CV interchange format with an ecosystem
 * behind it: a published schema and, at the time of writing, over two hundred
 * community themes on npm, almost all MIT. This file does not render any of them —
 * they emit HTML and this project draws PDFs itself, which is what keeps the text
 * order under our control and the result readable by an applicant tracking system.
 * What it does is speak the format, so a profile can arrive from somewhere else and
 * leave for somewhere else.
 *
 * Two rules shape the mapping.
 *
 * Nothing is invented on the way in or out. Where the schema wants a field this
 * profile has never held — a URL, a postcode, a reference — the field is absent
 * rather than empty-stringed, because an empty string in an export reads as "the
 * candidate has none" to whatever consumes it.
 *
 * Nothing is lost on the way out. The schema has no place for a nationality, for
 * the CV's own section headings, or for which template was chosen, and a format
 * conversion that quietly drops a third of the document is worse than no export at
 * all. Those live under `meta`, where the schema permits extensions, so an export
 * followed by an import returns the profile that left.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JsonResume = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SCHEMA = 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json';

  const str = (v) => String(v == null ? '' : v).trim();
  /** Drop empty keys: the schema treats a missing field and an empty one differently. */
  function tidy(obj) {
    const out = {};
    Object.keys(obj).forEach((k) => {
      const v = obj[k];
      if (v == null) return;
      if (typeof v === 'string' && !v.trim()) return;
      if (Array.isArray(v) && !v.length) return;
      if (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) return;
      out[k] = v;
    });
    return out;
  }

  // ── Dates ─────────────────────────────────────────────────────────────────
  //
  // The form takes dates as text, because that is what a person types and what a
  // CV prints: "09.2023", "06/2024", "Nov. 2020", "2019". The schema wants
  // ISO-8601. Converting is worthwhile — a theme that sorts by date needs it — but
  // only where the reading is unambiguous. Anything else is left as written rather
  // than guessed into a wrong month, and an importer gets it back unchanged.

  const MONTHS = {
    jan: '01', feb: '02', mär: '03', mar: '03', apr: '04', mai: '05', may: '05',
    jun: '06', jul: '07', aug: '08', sep: '09', okt: '10', oct: '10', nov: '11',
    dez: '12', dec: '12',
  };

  /** "09.2023" | "06/2024" | "Nov. 2020" | "2019" -> "2023-09" | "2019". */
  function toIsoDate(text) {
    const s = str(text);
    if (!s) return '';
    if (/^\d{4}-\d{2}(-\d{2})?$/.test(s)) return s;                    // already ISO
    let m = s.match(/^(\d{1,2})[.\/](\d{4})$/);                        // 09.2023, 6/2024
    if (m) return m[2] + '-' + String(m[1]).padStart(2, '0');
    m = s.match(/^(\d{4})$/);                                          // 2019
    if (m) return m[1];
    m = s.match(/^([A-Za-zÄÖÜäöü]{3,})\.?\s+(\d{4})$/);                // Nov. 2020
    if (m) {
      const mm = MONTHS[m[1].slice(0, 3).toLowerCase()];
      if (mm) return m[2] + '-' + mm;
    }
    return '';                                                          // not a date we can read
  }

  /** ISO back to what the form shows. "2023-09" -> "09.2023". */
  function fromIsoDate(text) {
    const s = str(text);
    const m = s.match(/^(\d{4})-(\d{2})/);
    return m ? m[2] + '.' + m[1] : s;
  }

  // ── Languages ─────────────────────────────────────────────────────────────
  //
  // Held in the profile as one line, because the form has one input for them:
  // "Deutsch (C1), Englisch, Französisch". The schema wants a list of
  // {language, fluency}, and the level is in parentheses when it is stated at all.

  function splitLanguages(line) {
    // Newlines separate too, not only punctuation. The schema importer writes this
    // field one language per line — which is what the PDF renderer reads, since it
    // splits on both — so splitting on commas alone collapsed a real CV's three
    // languages into a single row reading
    // "Englisch (Muttersprache)Franzöisch (Muttersprache)Deutsch (C2)".
    return str(line).split(/[,;\r\n]+/).map((part) => {
      const s = part.trim();
      if (!s) return null;
      const m = s.match(/^(.+?)\s*[(（]\s*(.+?)\s*[)）]\s*$/);
      return tidy(m ? { language: m[1].trim(), fluency: m[2].trim() } : { language: s });
    }).filter(Boolean);
  }

  function joinLanguages(list) {
    return (list || []).map((l) => {
      const name = str(l && l.language);
      if (!name) return '';
      const f = str(l && l.fluency);
      return f ? name + ' (' + f + ')' : name;
    }).filter(Boolean).join(', ');
  }

  /** A description block to highlights, and back. One bullet per line. */
  const toHighlights = (desc) => str(desc).split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  const fromHighlights = (h, summary) => (h && h.length ? h.join('\n') : str(summary));

  // ── Out ───────────────────────────────────────────────────────────────────

  function toJsonResume(profile) {
    const p = profile || {};
    const name = [str(p.firstName), str(p.lastName)].filter(Boolean).join(' ');

    const basics = tidy({
      name,
      label: str(p.title),
      image: str(p.photo),
      email: str(p.email),
      phone: str(p.phone),
      summary: str(p.summary),
      location: tidy({ city: str(p.location) }),
    });

    const work = (p.experience || []).map((x) => tidy({
      name: str(x.org),
      // The same employer under the pre-1.0 key as well. The schema renamed
      // work.company to work.name, and much of the theme ecosystem never followed:
      // jsonresume-theme-macchiato reads {{this.company}}, so a correct v1.0.0
      // export renders with a blank employer — the one field a recruiter looks for
      // first. Emitting both costs a few bytes and makes the file work in both
      // halves of the ecosystem.
      company: str(x.org),
      position: str(x.role),
      location: str(x.location),
      startDate: toIsoDate(x.start),
      endDate: toIsoDate(x.end),
      highlights: toHighlights(x.desc),
    })).filter(w => Object.keys(w).length);

    const education = (p.education || []).map((x) => tidy({
      institution: str(x.org),
      // studyType and area are the schema's split of a degree. This profile holds
      // one line ("Bachelor of Science, Informatik"), and splitting it on the comma
      // is a guess that is wrong often enough to be worth not making: the whole
      // line goes to studyType, which is what a theme prints.
      studyType: str(x.degree),
      score: str(x.grade),
      startDate: toIsoDate(x.start),
      endDate: toIsoDate(x.end),
    })).filter(e => Object.keys(e).length);

    const certificates = (p.certifications || []).map((c) => tidy({
      name: str(c.name),
      issuer: str(c.issuer || c.org),
      date: toIsoDate(c.year),
    })).filter(c => Object.keys(c).length);

    const skills = (p.skills || []).map((s) => tidy({
      name: str(typeof s === 'string' ? s : (s.label || s.key)),
    })).filter(s => Object.keys(s).length);

    const projects = (p.projects || []).map((x) => tidy({
      name: str(x.name),
      entity: str(x.org),
      description: str(x.desc || x.description),
      highlights: toHighlights(x.desc || x.description),
      keywords: str(x.tech) ? str(x.tech).split(/\s*,\s*/).filter(Boolean) : [],
      startDate: toIsoDate(x.year),
    })).filter(x => Object.keys(x).length);

    // What the schema has nowhere to put. Kept rather than dropped, so that an
    // export is a copy of the profile and not a lossy summary of it.
    //
    // Two of these look like details and are not. The taxonomy key on a skill is
    // what the job scoring matches against; a re-imported profile without it scores
    // as though the skill were unrecognised. And the date strings are what the
    // person typed and what the PDF prints — exporting "Nov. 2020" as 2020-11 is
    // right for anything reading the file, but handing it back as "11.2020" would
    // rewrite their document behind them.
    const carried = tidy({
      nationality: str(p.nationality),
      softSkills: str(p.softSkills),
      interests: str(p.interests),
      skillRows: p.skillRows || [],
      cvSchema: p.cvSchema || [],
      themeId: str(p.themeId),
      skillKeys: (p.skills || []).map((s) => str(typeof s === 'string' ? '' : s.key)),
      dates: tidy({
        work: (p.experience || []).map((x) => tidy({ start: str(x.start), end: str(x.end) })),
        education: (p.education || []).map((x) => tidy({ start: str(x.start), end: str(x.end) })),
        certificates: (p.certifications || []).map((x) => tidy({ date: str(x.year) })),
        projects: (p.projects || []).map((x) => tidy({ date: str(x.year) })),
      }),
    });

    return tidy({
      $schema: SCHEMA,
      basics,
      work,
      education,
      certificates,
      skills,
      languages: splitLanguages(p.languages),
      projects,
      meta: tidy({
        canonical: undefined,
        version: '1.0.0',
        generator: 'CareerAI',
        careerai: carried,
      }),
    });
  }

  // ── In ────────────────────────────────────────────────────────────────────

  /**
   * @returns {{profile: object, warnings: string[]}} warnings name what the file
   *          carried and this profile has no field for — said out loud, because an
   *          import that silently drops a section is how someone discovers at the
   *          worst moment that half their CV never arrived.
   */
  function fromJsonResume(resume) {
    const r = resume || {};
    const b = r.basics || {};
    const carried = (r.meta && r.meta.careerai) || {};
    const kept = carried.dates || {};
    // The typed text where this file carries it, the ISO date where it does not —
    // which is the case for every resume.json that did not come from here.
    const asTyped = (group, i, field, iso) => {
      const row = (kept[group] || [])[i];
      return (row && str(row[field])) || fromIsoDate(iso);
    };
    const warnings = [];

    const full = str(b.name).split(/\s+/);
    const profile = {
      firstName: full.slice(0, -1).join(' ') || full[0] || '',
      lastName: full.length > 1 ? full[full.length - 1] : '',
      email: str(b.email),
      phone: str(b.phone),
      location: str(b.location && (b.location.city || b.location.region)),
      nationality: str(carried.nationality),
      languages: joinLanguages(r.languages),
      title: str(b.label),
      summary: str(b.summary),
      photo: str(b.image),
      softSkills: str(carried.softSkills),
      interests: str(carried.interests),
      skillRows: Array.isArray(carried.skillRows) ? carried.skillRows : [],
      cvSchema: Array.isArray(carried.cvSchema) ? carried.cvSchema : [],
      themeId: str(carried.themeId),
      skills: (r.skills || []).map((s, i) => tidy({
        key: str((carried.skillKeys || [])[i]),
        label: str(s && s.name),
      })).filter(s => s.label),
      experience: (r.work || []).map((w, i) => ({
        role: str(w.position),
        org: str(w.name || w.company),   // either key, whichever the file used
        location: str(w.location),
        start: asTyped('work', i, 'start', w.startDate),
        end: asTyped('work', i, 'end', w.endDate),
        desc: fromHighlights(w.highlights, w.summary),
      })),
      education: (r.education || []).map((e, i) => ({
        degree: [str(e.studyType), str(e.area)].filter(Boolean).join(', '),
        org: str(e.institution),
        location: '',
        start: asTyped('education', i, 'start', e.startDate),
        end: asTyped('education', i, 'end', e.endDate),
        grade: str(e.score),
      })),
      certifications: (r.certificates || []).map((c, i) => ({
        name: str(c.name),
        issuer: str(c.issuer),
        year: asTyped('certificates', i, 'date', c.date),
      })),
      projects: (r.projects || []).map((x, i) => ({
        name: str(x.name),
        org: str(x.entity),
        desc: fromHighlights(x.highlights, x.description),
        tech: (x.keywords || []).join(', '),
        year: asTyped('projects', i, 'date', x.startDate),
      })),
    };

    // Sections this profile has no home for. Named individually: "some fields were
    // dropped" tells the reader nothing they can act on.
    const LOST = [
      ['volunteer', 'Ehrenamt'], ['awards', 'Auszeichnungen'],
      ['publications', 'Publikationen'], ['references', 'Referenzen'],
      ['interests', 'Interessen (strukturiert)'],
    ];
    LOST.forEach(([key, label]) => {
      if (Array.isArray(r[key]) && r[key].length) {
        warnings.push(label + ' (' + r[key].length + ') — dieses Profil hat dafür kein Feld.');
      }
    });
    if ((b.profiles || []).length) {
      warnings.push('Profil-Links (' + b.profiles.length + ') — z. B. LinkedIn, GitHub.');
    }

    return { profile, warnings };
  }

  /** Is this parsed JSON plausibly a JSON Resume? */
  function looksLikeResume(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return Boolean(obj.basics || obj.work || obj.education || obj.skills || obj.$schema);
  }

  return {
    toJsonResume, fromJsonResume, looksLikeResume,
    toIsoDate, fromIsoDate, splitLanguages, joinLanguages, SCHEMA,
  };
});
