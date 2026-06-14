/**
 * bundesagentur.js — Germany's official job portal (free REST API, no key needed).
 *
 * API base: https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs
 * Response root key: "ergebnisliste" (array of job objects)
 */

const { sleep, maxPerSource } = require('./utils');

const API_URL = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs';
const API_KEY = process.env.BUNDES_API_KEY || 'jobboerse-jobsuche';
const PAGE_SIZE = 100; // max the API accepts per request

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

function buildParams(keyword, sector, location, region, page = 1) {
  const params = new URLSearchParams({
    angebotsart:        '1',
    page:               String(page),
    size:               String(PAGE_SIZE),
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

async function fetch_({ keyword, sector, location, region, maxPerSource: mps } = {}) {
  const cap = maxPerSource({ maxPerSource: mps });
  const out = [];
  try {
    for (let page = 1; out.length < cap; page++) {
      const params = buildParams(keyword, sector, location, region, page);
      const r = await fetch(`${API_URL}?${params}`, {
        headers: { 'X-API-Key': API_KEY, Accept: 'application/json' }
      });
      if (!r.ok) break;
      const data = await r.json();
      const hits = data?.ergebnisliste || [];
      if (!hits.length) break;
      out.push(...hits.map(j => normalizeJob(j, sector)));

      const total = Number(data?.maxErgebnisse) || 0;
      if (hits.length < PAGE_SIZE) break;          // reached the last page
      if (total && out.length >= total) break;     // got everything available
      await sleep(150 + Math.random() * 150);      // polite anti-quota delay
    }
  } catch (err) {
    console.warn('[bundesagentur] fetch failed:', err.message);
  }
  return out.slice(0, cap);
}

module.exports = { fetch: fetch_ };
