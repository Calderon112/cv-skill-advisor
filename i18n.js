/**
 * i18n.js — the profile form in the language the CV is written in.
 *
 * The page was built in English and grew German where the subject matter is
 * German: the templates, the Lebenslauf-Check, the section editor. So someone
 * importing a German CV met "First name" above their Vorname and "Experience"
 * above their Berufserfahrung — half a form in each language, which reads as an
 * unfinished translation rather than a choice.
 *
 * German is the default here because the market is. English stays available,
 * because an applicant writing an English CV for a German employer is ordinary.
 *
 * Deliberately small:
 *
 *   - One flat dictionary, German and English side by side, so a missing
 *     translation is visible in the source rather than at runtime.
 *   - The markup carries the keys (data-i18n, data-i18n-ph, data-i18n-title) and
 *     this walks them. No template engine, no build step, nothing to keep in sync
 *     beyond the attribute itself.
 *   - t() falls back to the key, so an untranslated string shows its own name
 *     instead of disappearing.
 *
 * It covers the profile page. The rest of the application is still English, and
 * saying so is better than a switch that half works.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.I18n = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const KEY = 'careerai-ui-lang';
  const LANGS = ['de', 'en'];

  // key: [Deutsch, English]
  const DICT = {
    // ── Page and modes ──────────────────────────────────────────────────────
    'profile.title':        ['Profil', 'Professional Profile'],
    'profile.lede':         ['Laden Sie Ihren Lebenslauf hoch (wird automatisch ausgelesen) oder füllen Sie das Formular aus.',
                             'Build your profile by uploading your CV (auto-extract) or filling it in manually.'],
    'profile.formLang':     ['Formularsprache', 'Form language'],
    'mode.import':          ['Aus Lebenslauf übernehmen', 'Import from CV'],
    'mode.manual':          ['Manuell eingeben', 'Manual entry'],

    // ── Import ──────────────────────────────────────────────────────────────
    'import.upload':        ['Lebenslauf hochladen', 'Upload your CV'],
    'import.paste':         ['… oder Text des Lebenslaufs hier einfügen', '…or paste CV text directly here'],
    'import.extract':       ['Auslesen und Profil erstellen', 'Extract & Build Profile'],
    'import.extracted':     ['Ausgelesenes Profil', 'Extracted profile'],
    'import.findJobs':      ['Passende Stellen finden →', 'Find matching jobs →'],
    'import.viewText':      ['Ausgelesenen Text ansehen', 'View extracted text'],
    'import.editManually':  ['Angaben manuell bearbeiten →', 'Edit details manually →'],
    'import.copy':          ['Kopieren', 'Copy'],

    'import.ready':         ['Bereit', 'Ready'],
    'import.drop':          ['Datei hierher ziehen oder klicken zum Auswählen',
                             'Drop CV file here or click to browse'],
    'import.dropHint':      ['.txt und durchsuchbare .pdf werden unterstützt',
                             '.txt and searchable .pdf supported'],
    'import.detected':      ['Erkannte Kenntnisse', 'Detected Skills'],
    'import.missing':       ['Fehlend / auszubauen', 'Missing / To develop'],
    'import.roles':         ['Passende Rollen', 'Recommended Roles'],
    'field.photoBox':       ['Foto', 'Photo'],
    'field.skillHint':      ['Kenntnis eingeben und Enter drücken', 'Type a skill and press Enter'],
    'danger.lede':          ['Setzt die in diesem Browser gespeicherten Profildaten zurück.',
                             'Reset your stored profile data from this browser.'],

    'import.adjusted':      ['Beim Einlesen angepasst:', 'Adjusted while reading the CV:'],
    'import.why.date':      ['ein Datum stand nicht neben dem Eintrag, dem es zugeordnet war — Feld leer gelassen',
                             'a date was not printed beside the entry it was paired with — left empty'],
    'import.why.bullets':   ['Aufgaben wurden dem Eintrag zugeordnet, unter dem sie im Lebenslauf stehen',
                             'bullets were returned to the entry they are printed under'],
    'import.why.lonelyDate':['ein Datum ohne Eintrag wurde verworfen', 'a date with no entry was discarded'],
    'import.why.notInCv':   ['nicht im Lebenslauf gefunden und verworfen', 'not found in the CV and discarded'],

    // ── Sections of the form ────────────────────────────────────────────────
    'card.personal':        ['Persönliche Angaben', 'Personal information'],
    'card.objective':       ['Ziel und Kurzprofil', 'Objective & summary'],
    'card.skills':          ['Kenntnisse', 'Skills'],
    'card.experience':      ['Berufserfahrung', 'Experience'],
    'card.education':       ['Ausbildung', 'Education'],
    'card.certifications':  ['Weiterbildung und Zertifikate', 'Certifications'],
    'card.schema':          ['Ihr Lebenslauf, Abschnitt für Abschnitt', 'Your CV, section by section'],
    'card.schemaNote':      ['Aus den Überschriften Ihres Lebenslaufs erzeugt. Alles hier ist änderbar und fließt in die erzeugten Dokumente ein.',
                             'Built from the headings your CV carries. Edit anything here; it feeds the generated documents.'],
    'card.dangerZone':      ['Profil löschen', 'Danger zone'],

    // ── Fields ──────────────────────────────────────────────────────────────
    'field.firstName':      ['Vorname', 'First name'],
    'field.lastName':       ['Nachname', 'Last name'],
    'field.email':          ['E-Mail', 'Email'],
    'field.phone':          ['Telefon', 'Phone'],
    'field.location':       ['Ort', 'Location'],
    'field.locationPh':     ['Stadt, Land', 'City, Country'],
    'field.nationality':    ['Staatsangehörigkeit', 'Nationality'],
    'field.languages':      ['Sprachen', 'Languages'],
    'field.jobTitle':       ['Zielposition', 'Target job title'],
    'field.jobTitlePh':     ['z. B. SOC Analyst', 'e.g. SOC Analyst'],
    'field.summary':        ['Kurzprofil', 'Professional summary'],
    'field.summaryPh':      ['Ein kurzer Absatz über Sie, Ihre Ziele und Ihre Motivation …',
                             'A short paragraph about you, your goals and motivation…'],
    'field.photo':          ['Foto hochladen', 'Upload photo'],
    'field.photoRemove':    ['Entfernen', 'Remove'],
    'field.photoHint':      ['JPG / PNG — erscheint auf Ihrem Lebenslauf-PDF (optional).',
                             'JPG / PNG — appears on your CV PDF (optional).'],
    'field.photoChange':    ['Foto ändern', 'Change photo'],
    'field.missing':        ['Fehlt: ', 'Missing '],
    'field.missingLocation':['Ort', 'current location'],
    'field.missingPhone':   ['Telefonnummer', 'phone number'],
    'field.missingEmail':   ['E-Mail-Adresse', 'email'],
    'skills.empty':         ['Noch keine Kenntnisse. Tragen Sie welche ein oder übernehmen Sie sie aus Ihrem Lebenslauf.',
                             'No skills yet. Add some, or import from your CV.'],
    'schema.count1':        ['1 Abschnitt', '1 section'],
    'schema.countN':        ['{n} Abschnitte', '{n} sections'],
    'field.skillPh':        ['Kenntnis eingeben …', 'Add a skill…'],
    'field.skillAdd':       ['Hinzufügen', 'Add'],

    // ── Repeat lists ────────────────────────────────────────────────────────
    'add.experience':       ['+ Station hinzufügen', '+ Add experience'],
    'add.education':        ['+ Ausbildung hinzufügen', '+ Add education'],
    'add.certification':    ['+ Zertifikat hinzufügen', '+ Add certification'],
    'add.language':         ['+ Sprache', '+ Language'],
    'repeat.empty':         ['Noch nichts eingetragen — oben auf „Hinzufügen“ klicken.',
                             'Nothing yet — click “Add” above.'],
    'drag.handle':          ['Verschieben — ziehen, oder mit den Pfeiltasten bewegen',
                             'Move — drag, or use the arrow keys'],
    'repeat.remove':        ['Entfernen', 'Remove'],
    'repeat.suggest':       ['Formulierungen vorschlagen', 'Suggest wording'],

    'exp.role':             ['Position / Titel', 'Role/Title'],
    'exp.org':              ['Unternehmen / Einrichtung', 'Company/Institution'],
    'exp.location':         ['Ort', 'Location'],
    'exp.start':            ['Beginn (z. B. 09.2023)', 'Start (e.g. 09.2023)'],
    'exp.end':              ['Ende (z. B. 06.2024)', 'End (e.g. 06.2024)'],
    'exp.desc':             ['Aufgaben und Erfolge', 'Description'],
    'edu.degree':           ['Abschluss / Studiengang', 'Degree/Programme'],
    'edu.org':              ['Hochschule / Schule', 'Institution'],
    'edu.location':         ['Ort', 'Location'],
    'edu.start':            ['Beginn', 'Start'],
    'edu.end':              ['Ende', 'End'],
    'cert.name':            ['Bezeichnung des Zertifikats', 'Certificate name'],
    'cert.year':            ['Jahr', 'Year'],

    // ── The section editor ──────────────────────────────────────────────────
    'schema.showFixed':     ['Feste Felder zeigen', 'Show fixed fields'],
    'schema.hideFixed':     ['Feste Felder ausblenden', 'Hide fixed fields'],
    'schema.heading':       ['Überschrift', 'Heading'],
    'schema.label':         ['Bezeichnung', 'Label'],
    'schema.value':         ['Wert', 'Value'],
    'schema.period':        ['Zeitraum', 'Period'],
    'schema.entryTitle':    ['Titel', 'Title'],
    'schema.org':           ['Einrichtung', 'Organisation'],
    'schema.bullets':       ['Ein Punkt pro Zeile', 'One bullet per line'],
    'schema.list':          ['Eines pro Zeile', 'One per line'],
    'schema.onlyHere':      ['Nur in Ihrem Lebenslauf — wird unten angehängt',
                             'Only in your CV — appended at the end'],
    'schema.addEntry':      ['+ Eintrag', '+ Entry'],
    'schema.addRow':        ['+ Zeile', '+ Row'],
    'schema.delSection':    ['Abschnitt entfernen', 'Remove section'],
    'schema.delEntry':      ['Eintrag entfernen', 'Remove entry'],

    // ── Adding a section ────────────────────────────────────────────────────
    'addSection.label':     ['Abschnitt hinzufügen', 'Add a section'],
    'addSection.entries':   ['Mit Zeitraum', 'With dates'],
    'addSection.list':      ['Liste', 'List'],
    'addSection.rows':      ['Feldpaare', 'Field pairs'],
    'addSection.text':      ['Fließtext', 'Running text'],
    'addSection.hint':      ['Zum Beispiel Ehrenamt, Publikationen oder Praktische Kenntnisse. Mit Zeitraum für Stationen, Liste für Aufzählungen, Feldpaare für „Bezeichnung: Wert“.',
                             'For example volunteering, publications or practical knowledge. With dates for stations, list for enumerations, field pairs for “label: value”.'],
    'addSection.prompt':    ['Überschrift des Abschnitts:', 'Heading of the section:'],
    'addSection.confirmDel':['Abschnitt entfernen?', 'Remove this section?'],

    // ── Languages ───────────────────────────────────────────────────────────
    'lang.name':            ['Sprache', 'Language'],
    'lang.level':           ['Niveau', 'Level'],
    'lang.none':            ['ohne Angabe', 'not stated'],
    'lang.remove':          ['Sprache entfernen', 'Remove language'],
    'lang.hint':            ['In Deutschland wird das Niveau erwartet — GER-Stufe oder Muttersprache.',
                             'German CVs state the level — CEFR or native speaker.'],

    // ── Actions ─────────────────────────────────────────────────────────────
    'action.save':          ['Profil speichern', 'Save Profile'],
    'action.pdf':           ['Als PDF erzeugen', 'Generate as PDF'],
    'action.template':      ['Vorlage', 'Template'],
    'action.previewOpen':   ['Vorschau', 'Preview'],
    'action.pdfLoad':       ['PDF laden', 'Download PDF'],
    'action.deleteProfile': ['Profildaten löschen', 'Delete profile data'],
    'danger.note':          ['Damit werden Profil, gespeicherte Kenntnisse, Berufserfahrung und Zertifikate entfernt. Ihre Bewerbungsübersicht bleibt erhalten.',
                             'This will remove your current profile, saved skills, experience and certifications. Your job tracking data will remain.'],

    // ── The check ───────────────────────────────────────────────────────────
    'check.title':          ['Lebenslauf-Check', 'CV check'],

    // ── JSON Resume ─────────────────────────────────────────────────────────
    'jr.title':             ['JSON Resume', 'JSON Resume'],
    'jr.export':            ['resume.json exportieren', 'Export resume.json'],
    'jr.import':            ['resume.json importieren', 'Import resume.json'],
  };

  let lang = 'de';
  try {
    const stored = localStorage.getItem(KEY);
    if (stored && LANGS.indexOf(stored) !== -1) lang = stored;
  } catch (_) { /* private window: the default stands */ }

  /** The string, or the key itself when there is no entry — never empty. */
  function t(key) {
    const row = DICT[key];
    if (!row) return key;
    return row[lang === 'en' ? 1 : 0] || row[0] || key;
  }

  function get() { return lang; }

  function set(next) {
    if (LANGS.indexOf(next) === -1) return lang;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch (_) { /* not worth failing over */ }
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
    return lang;
  }

  /**
   * Replace the marked text in a subtree.
   *
   * data-i18n        the element's text content
   * data-i18n-ph     its placeholder
   * data-i18n-title  its title and aria-label, which are the same sentence
   */
  function apply(root) {
    const scope = root || (typeof document !== 'undefined' ? document : null);
    if (!scope || !scope.querySelectorAll) return;
    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      const s = t(el.getAttribute('data-i18n-title'));
      el.setAttribute('title', s);
      el.setAttribute('aria-label', s);
    });
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }

  return { t, get, set, apply, LANGS, DICT };
}));
