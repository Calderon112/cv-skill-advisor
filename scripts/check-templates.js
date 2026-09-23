/**
 * check-templates.js — every CV template, read the way a machine reads it.
 *
 * A template is judged here on one question: after the PDF is turned back into
 * text, is the candidate's record still intact and still in one piece? That is what
 * an applicant tracking system does with an application, and it is the failure this
 * project has already met once — a two-column layout interleaves its columns when
 * extracted, so the contact block lands in the middle of a job entry and the job
 * loses its employer.
 *
 * Two things are checked per template:
 *
 *   presence   every fact the profile contains survives the round trip. A heading
 *              printed as white type on a filled bar can be lost with the bar; a
 *              name set in a band can be dropped; both have happened in real CV
 *              builders and neither is visible on screen.
 *
 *   adjacency  a position and its employer come out near each other. This is the
 *              interleaving test: when a rail is read into the middle of an entry,
 *              the two drift apart even though both are still present, and a parser
 *              then files the job under the wrong company.
 *
 * Run it with the application served locally:
 *
 *   node server.js &                       # or any port
 *   PORT=3100 node scripts/check-templates.js
 *
 * Exits non-zero when a template fails, so it can gate a release.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = process.env.PORT || 3100;
const BASE = process.env.BASE || ('http://localhost:' + PORT);
const CHANNEL = process.env.CHANNEL || 'msedge';

// Deliberately ordinary: a German CV with two positions, two qualifications and a
// certificate. Nothing here is exotic, because the failure being looked for is not
// about exotic content.
const PROFILE = {
  firstName: 'Jardel Galdos', lastName: 'Kenne', email: 'benigo700@gmail.com',
  phone: '+49 176 12345678', location: 'Gelsenkirchen', nationality: 'kamerunisch',
  title: 'IT-Sicherheitsexpert:in',
  // Deliberately longer than three lines. The generator used to slice the summary
  // to exactly three and print no more, so a real CV went out ending mid-sentence
  // on "zeichne ich mich durch Fleiß und". A short fixture would never have caught
  // it; the last words below are checked as a fact of their own.
  summary: 'Informatikstudent an der Westfälischen Hochschule Gelsenkirchen mit '
    + 'praktischer Erfahrung in Systemadministration und IT-Sicherheit. Im Rahmen '
    + 'meines Studiums habe ich in einer Vielzahl von Kursen sowohl theoretische '
    + 'als auch praktische Kompetenzen erworben, von der Netzwerktechnik bis zur '
    + 'sicheren Softwareentwicklung. Darüber hinaus zeichne ich mich durch '
    + 'Sorgfalt und Ausdauer aus.',
  languages: 'Deutsch (C1), Englisch (B2), Französisch',
  softSkills: 'Teamfähigkeit, Zielstrebigkeit',
  interests: 'Fußball, Lesen',
  skills: [{ label: 'Java' }, { label: 'Python' }, { label: 'SQL' }, { label: 'Jira' },
    { label: 'Linux' }, { label: 'Nextcloud' }],
  experience: [
    { role: 'Werkstudent IT System Integration', org: 'Alberdingk-Boley', location: 'Krefeld',
      start: '06.2024', end: '11.2024',
      desc: 'Jira Cloud Migration im Asset Management\nSystemadministration\nDeployment via PXE-Boot' },
    { role: 'Werkstudent IT Support', org: 'Kück Industrie', location: 'Bochum',
      start: '11.2023', end: '02.2024',
      desc: 'Administration von SuiteCrm\nEinführung eines OpenSource-Ticketsystems' },
  ],
  education: [
    { degree: 'Bachelor of Science, Informatik', org: 'Westfälische Hochschule', start: '11.2020', end: 'heute' },
    { degree: 'C1 Zertifikat Deutschkurs', org: 'Universität Paderborn', start: '07.2019', end: '12.2019' },
  ],
  certifications: [{ name: 'CompTIA Security+', year: '2025' }],
  projects: [{ name: 'DistanceGaming', org: 'Studienprojekt', year: '2022',
    desc: 'Plattform für Karten- und Brettspiele', tech: 'WebGL, React Native' }],
  cvSchema: [], skillRows: [], photo: '', themeId: '', design: {},
};

// Every fact that has to survive. The label is what gets reported, so it says what
// was lost rather than which regular expression failed.
const FACTS = [
  ['Name', /Jardel Galdos Kenne/],
  ['Zielposition', /IT-Sicherheitsexpert/],
  ['E-Mail', /benigo700@gmail\.com/],
  ['Telefon', /176 12345678/],
  ['Position 1', /Werkstudent IT System Integration/],
  ['Arbeitgeber 1', /Alberdingk-Boley/],
  ['Aufgabe', /Jira Cloud Migration/],
  ['Position 2', /Werkstudent IT Support/],
  ['Arbeitgeber 2', /Kück Industrie/],
  ['Abschluss', /Bachelor of Science/],
  ['Hochschule', /Westfälische Hochschule/],
  ['Zertifikat', /CompTIA Security\+/],
  ['Kenntnis', /Python/],
  ['Sprache', /Deutsch/],
  // The tail of the summary. Its absence is how a three-line cut shows up.
  ['Kurzprofil bis zum Ende', /Sorgfalt und Ausdauer/],
];

// How far a position may drift from its employer before a parser would pair them
// wrongly. Three lines is generous: in the interleaving failure they end up dozens
// apart, with a rail's worth of text between them.
const ADJACENCY = 3;

const PAIRS = [
  ['Werkstudent IT System Integration', 'Alberdingk-Boley'],
  ['Werkstudent IT Support', 'Kück Industrie'],
  ['Bachelor of Science', 'Westfälische Hochschule'],
];

(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (_) {
    console.error('playwright is not installed — npm i -D playwright');
    process.exit(2);
  }
  const pdf = require('pdf-parse');

  const browser = await chromium.launch({ channel: CHANNEL });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  const themes = await page.evaluate(() => CvThemes.list().map((t) => ({ id: t.id, name: t.name })));
  if (!themes.length) { console.error('no templates found at ' + BASE); process.exit(2); }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-templates-'));
  const rows = [];

  for (const t of themes) {
    const b64 = await page.evaluate(({ prof, id }) => {
      const built = buildProfilePdfDoc(Object.assign({}, prof, { themeId: id }));
      return built ? built.doc.output('datauristring').split(',')[1] : null;
    }, { prof: PROFILE, id: t.id });

    if (!b64) { rows.push({ t, ok: false, missing: ['(kein Dokument)'], split: [], pages: 0 }); continue; }

    const file = path.join(tmp, t.id + '.pdf');
    fs.writeFileSync(file, Buffer.from(b64, 'base64'));
    const data = await pdf(fs.readFileSync(file));
    const lines = data.text.split('\n').map((s) => s.trim()).filter(Boolean);
    const joined = lines.join('\n');

    const missing = FACTS.filter(([, re]) => !re.test(joined)).map(([label]) => label);

    const split = PAIRS.filter(([a, bb]) => {
      const i = lines.findIndex((l) => l.includes(a));
      const j = lines.findIndex((l) => l.includes(bb));
      return i === -1 || j === -1 || Math.abs(i - j) > ADJACENCY;
    }).map(([a]) => a);

    rows.push({ t, ok: !missing.length && !split.length, missing, split, pages: data.numpages, file });
  }

  await browser.close();

  console.log('\n  Vorlage         Seiten  Befund');
  rows.forEach((r) => {
    const verdict = r.ok ? 'lesbar'
      : [r.missing.length ? 'fehlt: ' + r.missing.join(', ') : '',
         r.split.length ? 'getrennt: ' + r.split.join(', ') : ''].filter(Boolean).join(' — ');
    console.log('  ' + r.t.name.padEnd(16) + String(r.pages).padStart(4) + '    ' + verdict);
  });

  const failed = rows.filter((r) => !r.ok);
  if (errors.length) console.log('\n  Seitenfehler: ' + errors.slice(0, 4).join(' | '));
  console.log('\n  ' + (rows.length - failed.length) + '/' + rows.length + ' Vorlagen bestehen die Extraktion.');
  console.log('  PDFs: ' + tmp);
  process.exit(failed.length ? 1 : 0);
})();
