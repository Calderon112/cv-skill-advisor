/**
 * employers.js — who is actually hiring, as opposed to who is mentioned.
 *
 * Searching "Siemens" on the Bundesagentur returns 500 rows of which 68 are Siemens
 * jobs. The rest are staffing agencies whose adverts name the client: Industriemontage
 * Roding, iSK Personaldienstleistungen, FERCHAU, Walter-Fach-Kraft. The keyword is
 * matched against the whole posting, so an agency writing "unser Kunde Siemens"
 * ranks exactly like Siemens writing about itself.
 *
 * That is not a missing source. The large German employers post to the
 * Bundesagentur in volume — Siemens 6,922 open positions, SAP 18,872, Bosch 1,149.
 * What was missing is the ability to say "at this employer" rather than "mentioning
 * this word", which is a filter on the company field.
 *
 * Two lists, and the second is what makes the first work:
 *
 *   MAJOR    large employers with the name variants their subsidiaries post under.
 *            "Siemens" alone would miss Siemens Energy and Siemens Healthineers,
 *            which are separate companies posting separately.
 *
 *   AGENCY   staffing and contracting firms. Not a judgement about them — many are
 *            a legitimate route into a Konzern — but an applicant asking to see the
 *            employers themselves is asking to see something else, and mixing the
 *            two answers neither question.
 */
'use strict';

// Name fragments, matched case-insensitively against the company field. A fragment
// rather than a full name, because the same employer posts as "Siemens AG",
// "Siemens Mobility GmbH" and "Siemens Healthineers AG".
const MAJOR = {
  siemens:            ['siemens'],
  bosch:              ['robert bosch', 'bosch gmbh', 'bosch rexroth', 'bosch service'],
  sap:                ['sap se', 'sap deutschland', 'sap signavio'],
  telekom:            ['deutsche telekom', 't-systems', 'telekom deutschland'],
  volkswagen:         ['volkswagen', 'audi ag', 'porsche ag', 'cariad'],
  bmw:                ['bmw ag', 'bmw group', 'bayerische motoren werke'],
  mercedes:           ['mercedes-benz', 'daimler truck'],
  allianz:            ['allianz se', 'allianz deutschland', 'allianz technology'],
  bayer:              ['bayer ag', 'bayer vital'],
  basf:               ['basf se', 'basf coatings'],
  bahn:               ['deutsche bahn', 'db systel', 'db netz', 'db regio', 'db schenker'],
  post:               ['deutsche post', 'dhl group', 'dhl '],
  lufthansa:          ['lufthansa'],
  thyssenkrupp:       ['thyssenkrupp'],
  eon:                ['e.on', 'eon se', 'westenergie'],
  rwe:                ['rwe ag', 'rwe power', 'rwe generation'],
  continental:        ['continental ag', 'continental automotive'],
  zf:                 ['zf friedrichshafen'],
  henkel:             ['henkel ag', 'henkel deutschland'],
  merck:              ['merck kgaa'],
  fresenius:          ['fresenius'],
  infineon:           ['infineon'],
  deutschebank:       ['deutsche bank', 'dws '],
  commerzbank:        ['commerzbank'],
  munichre:           ['münchener rück', 'munich re', 'ergo group', 'ergo deutschland'],
  vonovia:            ['vonovia'],
  adidas:             ['adidas ag'],
  beiersdorf:         ['beiersdorf'],
  brenntag:           ['brenntag'],
  heidelbergmaterials:['heidelberg materials'],
  mtu:                ['mtu aero'],
  qiagen:             ['qiagen'],
  rheinmetall:        ['rheinmetall'],
  sartorius:          ['sartorius'],
  symrise:            ['symrise'],
  zalando:            ['zalando'],
  siemensenergy:      ['siemens energy'],
  hensoldt:           ['hensoldt'],
  knorrbremse:        ['knorr-bremse'],
  lanxess:            ['lanxess'],
  evonik:             ['evonik'],
  bertelsmann:        ['bertelsmann', 'arvato'],
  rewe:               ['rewe group', 'rewe digital'],
  edeka:              ['edeka'],
  aldi:               ['aldi süd', 'aldi nord'],
  lidl:               ['lidl', 'schwarz it', 'schwarz digits'],
  otto:               ['otto group', 'otto gmbh'],
  bwi:                ['bwi gmbh'],

  // ── Prüf- und Zertifizierungsorganisationen ───────────────────────────────
  // Four separate companies sharing a name, which is why fragments and not names:
  // "TÜV" alone is 1,906 open positions across all of them, TÜV SÜD 572 on its own.
  tuev:               ['tüv süd', 'tüv rheinland', 'tüv nord', 'tüv thüringen',
                       'tuev sued', 'tuev rheinland', 'tuev nord', 'tüv saarland', 'tüv hessen'],
  dekra:              ['dekra'],

  // ── IT-Dienstleister und Beratung ─────────────────────────────────────────
  // Employers in their own right, not staffing firms: they hire onto their own
  // payroll and place their own people. The distinction matters because the agency
  // filter would otherwise sweep them out with the contractors.
  bechtle:            ['bechtle'],
  cancom:             ['cancom'],
  computacenter:      ['computacenter'],
  atos:               ['atos ', 'eviden'],
  capgemini:          ['capgemini'],
  accenture:          ['accenture'],
  ibm:                ['ibm deutschland', 'kyndryl'],
  fujitsu:            ['fujitsu'],
  nttdata:            ['ntt data'],
  materna:            ['materna'],
  adesso:             ['adesso se', 'adesso as a service'],
  msg:                ['msg systems', 'msg global'],
  soprasteria:        ['sopra steria'],
  datev:              ['datev'],
  finanzinformatik:   ['finanz informatik'],
  gisa:               ['gisa gmbh'],
  operational:        ['operational services'],
  lufthansaindustry:  ['lufthansa industry solutions'],

  // ── IT-Sicherheit im Besonderen ───────────────────────────────────────────
  secunet:            ['secunet'],
  genua:              ['genua gmbh'],
  rohdeschwarz:       ['rohde & schwarz', 'rohde und schwarz'],
  gundd:              ['giesecke+devrient', 'giesecke & devrient'],
  utimaco:            ['utimaco'],
  bsi:                ['bundesamt für sicherheit in der informationstechnik'],

  // ── Wirtschaftsprüfung mit eigener Cyber-Praxis ───────────────────────────
  deloitte:           ['deloitte'],
  kpmg:               ['kpmg'],
  ey:                 ['ernst & young', 'ey gmbh'],
  pwc:                ['pricewaterhousecoopers', 'pwc '],
};

// Words that identify a staffing or contracting firm rather than the employer. Both
// halves matter: "personaldienstleistung" catches the ones that say so, and the named
// firms catch the ones that do not.

// The employers above whose business is IT, so an applicant can ask for those
// rather than for every large company in the country. A Konzern hires IT people
// too — Siemens has more open IT positions than most consultancies — but "show me
// the IT employers" is a different question from "show me the large employers",
// and answering the second when the first was asked buries the answer.
const IT_EMPLOYERS = new Set([
  'sap', 'telekom', 'infineon', 'bechtle', 'cancom', 'computacenter', 'atos',
  'capgemini', 'accenture', 'ibm', 'fujitsu', 'nttdata', 'materna', 'adesso', 'msg',
  'soprasteria', 'datev', 'finanzinformatik', 'gisa', 'operational',
  'lufthansaindustry', 'secunet', 'genua', 'rohdeschwarz', 'gundd', 'utimaco', 'bsi',
  'bwi', 'zalando', 'deloitte', 'kpmg', 'ey', 'pwc',
]);

const AGENCY_TERMS = [
  'personaldienstleist', 'zeitarbeit', 'arbeitnehmerüberlassung', 'arbeitnehmerueberlassung',
  'personalservice', 'personalvermittlung', 'personalberatung', 'staffing', 'recruiting gmbh',
  'zeitpersonal', 'personalmanagement', 'interim', 'temp-team', 'randstad', 'adecco',
  'manpower', 'hays ', 'ferchau', 'brunel', 'gulp', 'orizon', 'piening', 'tintschl',
  'i.k. hofmann', 'walter-fach-kraft', 'unique personal', 'avantgarde experts',
  'expertum', 'trio personal', 'akkodis', 'solcom', 'westhouse', 'hofmann personal',
];

const lower = (s) => String(s || '').toLowerCase();

/** Is this company one of the listed major employers? Returns its key, or null. */
function majorEmployer(company) {
  const c = lower(company);
  if (!c) return null;
  for (const key of Object.keys(MAJOR)) {
    if (MAJOR[key].some((frag) => c.includes(frag))) return key;
  }
  return null;
}

/**
 * Is this posting from a staffing firm?
 *
 * Checked against the company field only, never the description. An employer's own
 * advert routinely says "keine Zeitarbeit" or describes working with contractors,
 * and matching that would exclude exactly the postings the filter is meant to keep.
 */
function isAgency(company) {
  const c = lower(company);
  return !!c && AGENCY_TERMS.some((t) => c.includes(t));
}

/**
 * Filter a result set by employer.
 *
 * @param jobs
 * @param mode   'all' (unchanged) | 'major' (listed employers only) | 'direct'
 *               (anyone except a staffing firm)
 * @param name   optional single employer, matched as a fragment of the company field
 */
function filterByEmployer(jobs, mode, name) {
  const list = Array.isArray(jobs) ? jobs : [];
  const wanted = lower(name).trim();

  return list.filter((job) => {
    const company = job && job.company;
    // A named employer is matched on the company field, not on the posting text.
    // That is the whole point: an agency advert saying "unser Kunde Siemens" ranks
    // like Siemens itself when the keyword is matched against the whole document.
    if (wanted && !lower(company).includes(wanted)) return false;
    if (mode === 'it') {
      const key = majorEmployer(company);
      return !!key && IT_EMPLOYERS.has(key);
    }
    if (mode === 'major') return !!majorEmployer(company);
    if (mode === 'direct') return !isAgency(company);
    return true;
  });
}

/** The employer keys present in a result set, with counts, for the UI to offer. */
function employerBreakdown(jobs) {
  const out = {};
  (jobs || []).forEach((job) => {
    const key = majorEmployer(job && job.company);
    if (key) out[key] = (out[key] || 0) + 1;
  });
  return out;
}

module.exports = { MAJOR, IT_EMPLOYERS, AGENCY_TERMS, majorEmployer, isAgency, filterByEmployer, employerBreakdown };
