/**
 * cv-check.js — what is wrong with this Lebenslauf, said as something to fix.
 *
 * The profile page already shows a completeness percentage, and a percentage is a
 * score rather than advice: it says 80% and leaves the reader to guess which fifth
 * is missing and whether it matters. This says "Beginn fehlt bei Werkstudent IT
 * Support" and points at the field.
 *
 * Deliberately deterministic. Every check here is a rule that can be stated, argued
 * with, and tested, which is what makes it safe to show as a judgement on someone's
 * application. A model asked to review a CV produces fluent advice that changes
 * between two runs on the same document, and there is no way to tell a real finding
 * from an invented one.
 *
 * Three levels, and the difference is what happens if it is ignored:
 *   error  the document is wrong or unusable — no email, an end date before a start
 *   warn   a German recruiter will notice — an unexplained gap, a job with no tasks
 *   tip    it would read better — a language without a level, a very long summary
 *
 * One rule this file deliberately does NOT have: it never asks for a photo. German
 * CVs commonly carry one and the AGG makes requiring one a liability, so a builder
 * that nags for a face is pushing the applicant towards the thing the law spent
 * years discouraging. Whether to include it is the candidate's decision, made once,
 * not a warning that reappears on every edit.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CvCheck = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MONTHS = {
    jan: 0, feb: 1, mär: 2, mar: 2, maer: 2, apr: 3, mai: 4, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, dez: 11, dec: 11,
  };

  // "still there", in the words a CV actually uses.
  const ONGOING = /^(heute|jetzt|aktuell|gegenw(ä|ae)rtig|laufend|present|current|now|bis heute|seit)$/i;

  const str = (v) => String(v == null ? '' : v).trim();
  /** A month as one number, so two dates can be compared and subtracted. */
  const ym = (year, month) => year * 12 + month;

  /**
   * A typed date to a comparable month.
   *
   * @param kind 'start' | 'end' — decides what a bare year means. "2019" as a start
   *             is January 2019 and as an end is December 2019; reading both as
   *             January would invent a gap of eleven months that nobody has.
   * @returns {number|null} null when the text is not a date this can read, which is
   *          reported as such rather than guessed into a month.
   */
  function parseMonth(text, kind, now) {
    const s = str(text);
    if (!s) return null;
    if (ONGOING.test(s)) return now;
    let m = s.match(/^(\d{1,2})[.\/](\d{4})$/);                       // 09.2023, 6/2024
    if (m && +m[1] >= 1 && +m[1] <= 12) return ym(+m[2], +m[1] - 1);
    m = s.match(/^(\d{4})-(\d{2})/);                                  // 2023-09
    if (m && +m[2] >= 1 && +m[2] <= 12) return ym(+m[1], +m[2] - 1);
    m = s.match(/^([A-Za-zÄÖÜäöü]{3,})\.?\s*(\d{4})$/);               // Nov. 2020
    if (m) {
      const mm = MONTHS[m[1].slice(0, 3).toLowerCase()];
      if (mm !== undefined) return ym(+m[2], mm);
    }
    m = s.match(/^(\d{4})$/);                                         // 2019
    if (m) return ym(+m[1], kind === 'end' ? 11 : 0);
    return null;
  }

  const fmt = (v) => String((v % 12) + 1).padStart(2, '0') + '.' + Math.floor(v / 12);

  /** The current month, injectable so the gap and future-date rules can be tested. */
  function nowMonth(opts) {
    if (opts && typeof opts.now === 'number') return opts.now;
    const d = new Date();
    return ym(d.getFullYear(), d.getMonth());
  }

  // A gap a German recruiter asks about. Shorter than this is a notice period or a
  // move between semesters, and flagging those would bury the real ones.
  const GAP_MONTHS = 6;

  const PLACEHOLDER = /(lorem ipsum|\bxxx+\b|\btodo\b|\[(rolle|role|firma|company|name|position|stadt)\])/i;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  // A stated level, in the forms a CV writes one.
  const LEVEL = /\((.*?)\)|\b([ABC][12])\b|muttersprach|verhandlungssicher|flie(ß|ss)end|grundkenntnis|native|fluent|basic/i;

  /**
   * @param profile the profile as the form holds it
   * @param opts    { pages } from the live preview, { now } for tests
   * @returns {{issues: Array, counts: {error:number, warn:number, tip:number}}}
   */
  function run(profile, opts) {
    const p = profile || {};
    const o = opts || {};
    const now = nowMonth(o);
    const issues = [];
    const add = (level, code, message, target) => issues.push({ level, code, message, target: target || null });

    // ── Kontakt ────────────────────────────────────────────────────────────
    if (!str(p.firstName) || !str(p.lastName)) {
      add('error', 'NAME', 'Vor- und Nachname fehlen.', { field: 'pf-firstName' });
    }
    const mail = str(p.email);
    if (!mail) add('error', 'EMAIL_MISSING', 'Keine E-Mail-Adresse — ohne sie kann niemand antworten.', { field: 'pf-email' });
    else if (!EMAIL.test(mail)) add('error', 'EMAIL_INVALID', 'Die E-Mail-Adresse sieht nicht gültig aus: ' + mail, { field: 'pf-email' });

    const phone = str(p.phone);
    if (!phone) add('warn', 'PHONE', 'Keine Telefonnummer. In Deutschland wird sie im Lebenslauf erwartet.', { field: 'pf-phone' });
    else if ((phone.match(/\d/g) || []).length < 6) add('warn', 'PHONE_SHORT', 'Die Telefonnummer wirkt unvollständig.', { field: 'pf-phone' });

    if (!str(p.location)) add('tip', 'LOCATION', 'Kein Wohnort. Arbeitgeber sortieren nach Region.', { field: 'pf-location' });

    // ── Profil ─────────────────────────────────────────────────────────────
    if (!str(p.title)) add('tip', 'TITLE', 'Keine Zielposition angegeben — sie steht als Erstes unter dem Namen.', { field: 'pf-title' });
    const summary = str(p.summary);
    if (!summary) add('tip', 'SUMMARY', 'Kein Kurzprofil. Drei bis vier Sätze oben werden fast immer gelesen.', { field: 'pf-summary' });
    else if (summary.length > 700) {
      add('tip', 'SUMMARY_LONG', 'Das Kurzprofil ist lang (' + summary.length + ' Zeichen). Drei bis vier Sätze reichen.', { field: 'pf-summary' });
    }

    // ── Stationen ──────────────────────────────────────────────────────────
    const spans = [];
    const dated = (list, type, labelOf) => (list || []).forEach((x, i) => {
      const label = labelOf(x) || ('Eintrag ' + (i + 1));
      const rawStart = str(x.start);
      const rawEnd = str(x.end);
      const start = parseMonth(rawStart, 'start', now);
      const end = parseMonth(rawEnd, 'end', now);

      if (!rawStart) add('warn', 'START_MISSING', 'Beginn fehlt: ' + label, { list: type, index: i, field: 'start' });
      else if (start === null) {
        add('warn', 'START_UNREADABLE', 'Datum nicht lesbar: „' + rawStart + '" bei ' + label + '. Format MM.JJJJ.',
          { list: type, index: i, field: 'start' });
      }
      if (!rawEnd) {
        add('tip', 'END_MISSING', 'Kein Ende bei ' + label + '. Bei einer laufenden Station „heute" eintragen.',
          { list: type, index: i, field: 'end' });
      } else if (end === null) {
        add('warn', 'END_UNREADABLE', 'Datum nicht lesbar: „' + rawEnd + '" bei ' + label + '. Format MM.JJJJ.',
          { list: type, index: i, field: 'end' });
      }
      if (start !== null && end !== null && end < start) {
        add('error', 'DATE_ORDER', 'Das Ende liegt vor dem Beginn: ' + label, { list: type, index: i, field: 'end' });
      }
      if (start !== null && start > now + 1) {
        add('warn', 'FUTURE', 'Der Beginn liegt in der Zukunft: ' + label, { list: type, index: i, field: 'start' });
      }
      // A span whose end precedes its start is already reported above. Letting it
      // into the gap arithmetic stacks an invented finding on top of the real one:
      // one transposed date produced "Lücke von 28 Monaten" as well, and the reader
      // is then chasing a hole in their CV that does not exist.
      const contradictory = start !== null && end !== null && end < start;
      if (start !== null && !contradictory) spans.push({ start, end: end === null ? null : end, label });
    });

    dated(p.experience, 'exp', (x) => [str(x.role), str(x.org)].filter(Boolean).join(' – '));
    dated(p.education, 'edu', (x) => [str(x.degree), str(x.org)].filter(Boolean).join(' – '));

    (p.experience || []).forEach((x, i) => {
      if (!str(x.role)) add('error', 'ROLE', 'Eine Station ohne Positionsbezeichnung.', { list: 'exp', index: i, field: 'role' });
      if (!str(x.org)) add('warn', 'ORG', 'Eine Station ohne Arbeitgeber.', { list: 'exp', index: i, field: 'org' });
      const desc = str(x.desc);
      if (!desc) {
        add('warn', 'NO_TASKS', 'Keine Tätigkeiten bei ' + (str(x.role) || 'einer Station') + '. Eine Position ohne Aufgaben sagt nichts aus.',
          { list: 'exp', index: i, field: 'desc' });
      } else {
        const longest = desc.split('\n').map((l) => l.trim().split(/\s+/).length).reduce((a, b) => Math.max(a, b), 0);
        if (longest > 35) {
          add('tip', 'BULLET_LONG', 'Ein Aufzählungspunkt bei ' + (str(x.role) || 'einer Station') + ' hat ' + longest + ' Wörter. Kürzer wird gelesen.',
            { list: 'exp', index: i, field: 'desc' });
        }
      }
    });

    if (!(p.education || []).length) {
      add('warn', 'NO_EDUCATION', 'Keine Ausbildung eingetragen. In Deutschland gehört sie in jeden Lebenslauf.', { field: 'pf-add-edu' });
    }
    (p.education || []).forEach((x, i) => {
      if (!str(x.degree)) add('warn', 'DEGREE', 'Eine Ausbildung ohne Abschluss oder Studiengang.', { list: 'edu', index: i, field: 'degree' });
    });

    // ── Lücken ─────────────────────────────────────────────────────────────
    //
    // Only spans whose end is known take part. An entry with no end could be
    // running or could be a forgotten field, and inventing a gap out of that
    // would accuse the candidate of something the data does not say.
    const closed = spans.filter((s) => s.end !== null).sort((a, b) => a.start - b.start);
    let covered = null;
    let previous = null;
    closed.forEach((s) => {
      if (covered !== null && s.start - covered > GAP_MONTHS) {
        add('warn', 'GAP', 'Lücke von ' + (s.start - covered) + ' Monaten zwischen ' + fmt(covered) + ' und ' + fmt(s.start)
          + (previous ? ' (nach „' + previous.label + '")' : '') + '.', null);
      }
      if (covered === null || s.end > covered) { covered = s.end; previous = s; }
    });

    // ── Kenntnisse und Sprachen ────────────────────────────────────────────
    const skills = (p.skills || []).map((s) => str(typeof s === 'string' ? s : (s.label || s.key))).filter(Boolean);
    if (skills.length < 5) {
      add('tip', 'FEW_SKILLS', 'Nur ' + skills.length + ' Fähigkeit(en) eingetragen. Bewerbungsportale filtern danach.', { field: 'pf-skill-input' });
    }
    const seen = new Set();
    skills.forEach((s) => {
      const k = s.toLowerCase();
      if (seen.has(k)) add('tip', 'DUP_SKILL', 'Doppelt eingetragen: ' + s, { field: 'pf-skill-input' });
      seen.add(k);
    });

    const langs = str(p.languages);
    if (!langs) add('tip', 'NO_LANGUAGES', 'Keine Sprachkenntnisse. In Deutschland werden sie mit Niveau erwartet.', { field: 'pf-languages' });
    else {
      const without = langs.split(/[,;]+/).map((s) => s.trim()).filter(Boolean).filter((s) => !LEVEL.test(s));
      if (without.length) {
        add('tip', 'LANG_LEVEL', 'Ohne Niveau: ' + without.join(', ') + '. Üblich ist z. B. „Englisch (C1)".', { field: 'pf-languages' });
      }
    }

    // ── Platzhalter ────────────────────────────────────────────────────────
    //
    // A template's own "[Firma]" reaching a sent application is the worst of these
    // findings and the easiest to miss, because it reads as text.
    const scan = (value, where, target) => {
      const s = str(value);
      if (s && PLACEHOLDER.test(s)) add('error', 'PLACEHOLDER', 'Platzhalter im Text (' + where + '): ' + s.slice(0, 60), target);
    };
    scan(p.summary, 'Kurzprofil', { field: 'pf-summary' });
    scan(p.title, 'Zielposition', { field: 'pf-title' });
    (p.experience || []).forEach((x, i) => scan(x.desc, 'Tätigkeiten', { list: 'exp', index: i, field: 'desc' }));

    // ── Umfang ─────────────────────────────────────────────────────────────
    if (o.pages > 2) {
      add('warn', 'TOO_LONG', 'Der Lebenslauf hat ' + o.pages + ' Seiten. Üblich sind ein bis zwei.', null);
    }

    const counts = { error: 0, warn: 0, tip: 0 };
    issues.forEach((i) => { counts[i.level] += 1; });
    return { issues, counts };
  }

  return { run, parseMonth, GAP_MONTHS };
});
