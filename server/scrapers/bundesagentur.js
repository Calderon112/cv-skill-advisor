/**
 * bundesagentur.js — Germany's official job portal (free REST API, no key needed).
 *
 * API base: https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs
 * Response root key: "ergebnisliste" (array of job objects)
 */

const API_URL = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs';
const API_KEY = process.env.BUNDES_API_KEY || 'jobboerse-jobsuche';

// Domain → German search term when user hasn't typed a keyword
const DOMAIN_KEYWORDS = {
  cybersecurity: 'IT Sicherheit cybersecurity',
  software:      'Softwareentwickler programmer',
  data:          'Data Analyst Datenwissenschaft',
  devops:        'DevOps cloud engineer',
  ai:            'Machine Learning KI engineer',
  network:       'Netzwerkadministrator infrastructure',
  'it-support':  'IT Support Systemadministrator',
  finance:       'Finance Accounting controller',
  marketing:     'Marketing Kommunikation',
  sales:         'Vertrieb Account Manager',
  hr:            'HR Personalwesen recruiter',
  project:       'Projektmanager',
  consulting:    'Unternehmensberater strategy',
  healthcare:    'Krankenpfleger Arzt medical',
  law:           'Jurist legal compliance',
  engineering:   'Ingenieur mechanical electrical',
  design:        'Designer UX UI',
  education:     'Lehrer Forscher education',
  all:           ''
};

function buildParams(keyword, sector, location, region) {
  const params = new URLSearchParams({
    angebotsart:        '1',
    page:               '1',
    size:               '25',
    pav:                'false',
    veroeffentlichtseit:'30'
  });

  // Location
  if (location) {
    params.set('wo', location);
  } else {
    const regionMap = { germany: 'Deutschland', switzerland: 'Schweiz', usa: 'Vereinigte Staaten' };
    params.set('wo', regionMap[region] || 'Deutschland');
  }

  // Keyword: user input takes priority over domain mapping
  const was = keyword || DOMAIN_KEYWORDS[sector] || '';
  if (was) params.set('was', was);

  return params;
}

function normalizeJob(job, sector) {
  const loc    = Array.isArray(job.stellenlokationen) ? job.stellenlokationen[0] : null;
  const city   = loc?.adresse?.ort || loc?.adresse?.region || '';
  const plz    = loc?.adresse?.plz || '';
  return {
    platform:      'Bundesagentur',
    source:        'bundesagentur',
    title:         job.stellenangebotsTitel || 'Job offer',
    company:       job.firma || 'Unbekannt',
    location:      [plz, city].filter(Boolean).join(' ') || 'Deutschland',
    description:   job.hauptberuf?.bezeichnungNeutral || job.alleBerufe?.[0]?.bezeichnungNeutral || 'Weitere Infos auf der Jobseite.',
    jobUrl:        job.externeURL || null,
    publishedDate: job.datumErsteVeroeffentlichung || null,
    sector:        sector || 'all',
    board:         'Bundesagentur',
    remote:        false,
    jobType:       null,
    salary:        null
  };
}

async function fetch_({ keyword, sector, location, region } = {}) {
  try {
    const params = buildParams(keyword, sector, location, region);
    const r = await fetch(`${API_URL}?${params}`, {
      headers: { 'X-API-Key': API_KEY, Accept: 'application/json' }
    });
    if (!r.ok) return [];
    const data = await r.json();
    const hits = data?.ergebnisliste || [];
    return hits.map(j => normalizeJob(j, sector));
  } catch (err) {
    console.warn('[bundesagentur] fetch failed:', err.message);
    return [];
  }
}

module.exports = { fetch: fetch_ };
