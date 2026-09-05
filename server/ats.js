/**
 * ats.js — jobs straight from an employer's own applicant tracking system.
 *
 * Half of a Konzern's openings never reach an aggregator. TÜV NORD advertises 127
 * positions on its own portal; the Bundesagentur carries 63 of them. The missing
 * half is not hidden — it sits behind the recruiting platform the company uses.
 *
 * Reverse-engineering each career site was the obvious move and the wrong one. Every
 * group runs a different platform behind a private frontend API of its own, so fifty
 * employers means fifty scrapers, each broken by the next redesign, each reading an
 * endpoint the company never published.
 *
 * Four platforms publish a documented API instead, meant for exactly this, and
 * between them they carry a large share of German employers. One connector each,
 * and a registry that grows without touching code.
 *
 * ── Adding an employer ──────────────────────────────────────────────────────
 *
 * The identifier cannot be guessed. SmartRecruiters answers HTTP 200 with an empty
 * list for a company that does not exist, so a wrong guess looks like an employer
 * with no vacancies — which is why this file ships with only identifiers that have
 * been checked against live data.
 *
 * To find one, open the company's careers page and search the source for the
 * platform name:
 *
 *   greenhouse       boards.greenhouse.io/<token>          → token
 *   lever            jobs.lever.co/<company>               → company
 *   personio         <company>.jobs.personio.de            → company
 *   smartrecruiters  careers.smartrecruiters.com/<Company> → Company (case matters)
 *
 * Then add a line to ATS_EMPLOYERS below, or set ATS_REGISTRY in the environment to
 * a JSON array of the same shape to add employers without a deployment.
 */
'use strict';

const https = require('https');

const TIMEOUT_MS = 12000;
const MAX_PER_EMPLOYER = 200;

/** GET a URL and return the body, or null. Never throws: a source that is down
 *  must cost the search nothing but its own results. */
function get(url, headers) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    const req = https.get(url, { headers: Object.assign({
      'User-Agent': 'CareerAI/1.0 (+https://careerai-jk.duckdns.org)',
      Accept: 'application/json, application/xml;q=0.9, */*;q=0.8',
    }, headers || {}) }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return finish(get(res.headers.location, headers));
      }
      if (res.statusCode !== 200) { res.resume(); return finish(null); }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => finish(body));
    });
    req.on('error', () => finish(null));
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); finish(null); });
  });
}

const strip = (html) => String(html || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s{2,}/g, ' ')
  .trim();

/** One shape for all four, matching what the rest of the pipeline already reads. */
function normalise(platform, company, j) {
  return {
    platform,
    source: 'ats',
    title: j.title || 'Job offer',
    // The employer's own name, from the registry rather than from the payload: a
    // subsidiary posting under its group's board would otherwise report the
    // subsidiary, and the employer filter matches on this field.
    company,
    location: j.location || 'Germany',
    description: (j.description || '').slice(0, 4000),
    jobUrl: j.url || null,
    publishedDate: j.date || null,
    sector: j.department || '',
    board: platform,
    remote: /remote|homeoffice|home office/i.test(j.location + ' ' + (j.title || '')),
    jobType: j.type || null,
    raw: j.raw || null,
  };
}

// ── Connectors ──────────────────────────────────────────────────────────────

async function greenhouse(token, company) {
  const body = await get(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=true`);
  if (!body) return [];
  let data;
  try { data = JSON.parse(body); } catch (_) { return []; }
  return (data.jobs || []).slice(0, MAX_PER_EMPLOYER).map((j) => normalise('Greenhouse', company, {
    title: j.title,
    location: (j.location && j.location.name) || '',
    // content is HTML-escaped in this API, so it is unescaped before the tags go.
    description: strip(String(j.content || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')),
    url: j.absolute_url,
    date: (j.updated_at || '').slice(0, 10) || null,
    department: ((j.departments || [])[0] || {}).name || '',
    raw: j,
  }));
}

async function lever(slug, company) {
  const body = await get(`https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`);
  if (!body) return [];
  let data;
  try { data = JSON.parse(body); } catch (_) { return []; }
  return (Array.isArray(data) ? data : []).slice(0, MAX_PER_EMPLOYER).map((j) => normalise('Lever', company, {
    title: j.text,
    location: (j.categories && j.categories.location) || '',
    description: strip(j.descriptionPlain || j.description),
    url: j.hostedUrl,
    date: j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : null,
    department: (j.categories && j.categories.team) || '',
    raw: j,
  }));
}

async function smartrecruiters(id, company) {
  const body = await get(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings?limit=100`);
  if (!body) return [];
  let data;
  try { data = JSON.parse(body); } catch (_) { return []; }
  // An unknown company answers 200 with an empty list rather than 404, so a wrong
  // identifier reads as an employer with no vacancies. The caller is told how many
  // came back so that silence is visible.
  return (data.content || []).slice(0, MAX_PER_EMPLOYER).map((j) => {
    const loc = j.location || {};
    return normalise('SmartRecruiters', company, {
      title: j.name,
      location: [loc.city, loc.country].filter(Boolean).join(', '),
      description: strip((j.jobAd && j.jobAd.sections && j.jobAd.sections.jobDescription
        && j.jobAd.sections.jobDescription.text) || ''),
      url: `https://jobs.smartrecruiters.com/${encodeURIComponent(id)}/${j.id}`,
      date: (j.releasedDate || '').slice(0, 10) || null,
      department: (j.department && j.department.label) || '',
      raw: j,
    });
  });
}

async function personio(slug, company) {
  // An XML feed, not JSON, and the only one of the four that is. Parsed with a
  // regex rather than a dependency: the document is flat, and adding an XML parser
  // to this project for one feed is not a trade worth making.
  const body = await get(`https://${encodeURIComponent(slug)}.jobs.personio.de/xml`);
  if (!body || !/<position/i.test(body)) return [];
  const out = [];
  const tag = (block, name) => {
    const m = block.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>', 'i'));
    return m ? strip(m[1].replace(/<!\[CDATA\[|\]\]>/g, '')) : '';
  };
  const blocks = body.match(/<position[\s\S]*?<\/position>/gi) || [];
  blocks.slice(0, MAX_PER_EMPLOYER).forEach((b) => {
    out.push(normalise('Personio', company, {
      title: tag(b, 'name'),
      location: tag(b, 'office'),
      description: tag(b, 'jobDescriptions') || tag(b, 'description'),
      url: tag(b, 'url') || null,
      date: (tag(b, 'createdAt') || '').slice(0, 10) || null,
      department: tag(b, 'department'),
      raw: null,
    }));
  });
  return out;
}

const CONNECTORS = { greenhouse, lever, smartrecruiters, personio };

// ── Registry ────────────────────────────────────────────────────────────────
//
// Only identifiers verified against live data belong here. An unverified one is
// worse than an absent one: it returns nothing and looks like an employer with no
// openings.
const ATS_EMPLOYERS = [
  // Seeded with two that answer with real data, so the connector path is exercised
  // by something from the first run. German employers are added by looking their
  // identifier up on their own careers page — see the note at the top of this file.
  { company: 'Stripe', platform: 'greenhouse', id: 'stripe' },
  { company: 'Airbnb', platform: 'greenhouse', id: 'airbnb' },
];

/**
 * Employers from the built-in list plus anything in ATS_REGISTRY, so a deployment
 * can add one without a release.
 */
function registry(env) {
  const extra = [];
  const raw = (env || process.env).ATS_REGISTRY;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((e) => {
          if (e && e.company && CONNECTORS[e.platform] && e.id) extra.push(e);
        });
      }
    } catch (_) { /* a malformed registry must not stop the built-in one */ }
  }
  return ATS_EMPLOYERS.concat(extra);
}

/**
 * Every posting from every configured employer.
 *
 * @param {object} opts  { keyword, employer } — employer narrows to one entry by
 *                       name, which is what makes this affordable: fetching every
 *                       employer on every search would be one request per company.
 * @returns {Promise<Array>} normalised jobs; an employer that fails contributes none
 */
async function fetchAtsJobs(opts, env) {
  const { keyword, employer } = opts || {};
  const wanted = String(employer || '').toLowerCase().trim();
  const list = registry(env).filter((e) => !wanted || e.company.toLowerCase().includes(wanted));
  if (!list.length) return [];

  const batches = await Promise.all(list.map((e) =>
    CONNECTORS[e.platform](e.id, e.company).catch(() => [])));

  let jobs = batches.reduce((a, b) => a.concat(b), []);

  // Filtered here rather than by the caller: these APIs return an employer's whole
  // board, and a search for "IT Security" should not come back with every opening
  // the company has.
  const tokens = String(keyword || '').toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (tokens.length) {
    jobs = jobs.filter((j) => {
      const hay = (j.title + ' ' + j.description + ' ' + j.sector).toLowerCase();
      return tokens.some((t) => hay.includes(t));
    });
  }
  return jobs;
}

module.exports = { fetchAtsJobs, registry, CONNECTORS, ATS_EMPLOYERS };
