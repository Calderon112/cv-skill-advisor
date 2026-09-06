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
// A large employer has more openings than a page. Continental publishes 878 and
// Celonis 273; a cap of 200 quietly answered "200" to both, which reads as a total
// and is a ceiling. Raised to the same figure the sitemap connector uses, so one
// employer cannot flood a result set either.
const MAX_PER_EMPLOYER = 400;

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
  // Paged, because a Konzern does not fit in one. Continental publishes 878 postings
  // and the API hands back 100 at a time, so a single call reported 100 — a number
  // that looks like an answer and is a page size. It stops at MAX_PER_EMPLOYER, at a
  // short page, or when the total the API states has been reached.
  const rows = [];
  let total = null;
  for (let offset = 0; offset < MAX_PER_EMPLOYER; offset += 100) {
    const body = await get(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings?limit=100&offset=${offset}`);
    if (!body) break;
    let data;
    try { data = JSON.parse(body); } catch (_) { break; }
    // An unknown company answers 200 with an empty list rather than 404, so a wrong
    // identifier reads as an employer with no vacancies. The caller is told how many
    // came back so that silence is visible.
    const page = data.content || [];
    rows.push(...page);
    if (total === null && typeof data.totalFound === 'number') total = data.totalFound;
    if (page.length < 100) break;
    if (total !== null && rows.length >= total) break;
  }

  return rows.slice(0, MAX_PER_EMPLOYER).map((j) => {
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

// ── Job sitemaps ────────────────────────────────────────────────────────────
//
// The fifth connector, and the only one that is not a recruiting platform.
//
// A large employer that runs its own job board still has to be found by search
// engines, so it publishes a sitemap and announces it in robots.txt. TÜV NORD's
// carries 144 postings against the 63 that reach the Bundesagentur.
//
// The distinction that makes this legitimate is written in their own robots.txt:
//
//     Disallow: /api/                    ← the internal endpoint the site calls
//     Sitemap: .../de/sitemap_index.xml  ← published in the same file
//
// One is closed to automated access in as many words. The other is offered in the
// file that governs automated access, and exists for nothing else. This reads the
// second and never the first — and it reads robots.txt every time, so an employer
// who later disallows the sitemaps stops being read without anyone here noticing.
//
// It takes titles and URLs only. Fetching each posting for its text would be one
// request per job and is a different activity from reading an index; a job from
// here arrives without a description and is honest about that.

const SITEMAP_MAX = 400;

/** The Sitemap: lines a site publishes, and the paths it closes. */
async function robots(base) {
  const origin = new URL(base).origin;
  const body = await get(origin + '/robots.txt');
  const sitemaps = [];
  const disallow = [];
  let appliesToUs = true;
  String(body || '').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([a-z-]+)\s*:\s*(.+?)\s*$/i);
    if (!m) return;
    const key = m[1].toLowerCase();
    const val = m[2];
    // Sitemap lines are global; Disallow lines belong to the last User-agent block.
    if (key === 'user-agent') appliesToUs = (val === '*');
    else if (key === 'sitemap') sitemaps.push(val);
    else if (key === 'disallow' && appliesToUs && val) disallow.push(val);
  });
  return { origin, sitemaps, disallow };
}

/** Would robots.txt refuse this path? A prefix match, with * treated as a wildcard. */
function blocked(disallow, url) {
  let path;
  // Path AND query. A robots.txt rule is matched against both, and Siemens uses
  // that: "Disallow: /*/externaljobs/*qtvc=" closes a query parameter on a path
  // that is otherwise allowed. Comparing the path alone silently permitted it.
  try { const u = new URL(url); path = u.pathname + u.search; } catch (_) { return true; }
  return disallow.some((rule) => {
    const escaped = rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp('^' + escaped).test(path);
  });
}

// Does the PATH of this URL name a job? The whole URL is the wrong thing to ask,
// twice over: on jobs.siemens.com the host contains "jobs" so every page matched,
// and an unanchored "position" matched inside "disposition" — which is how a French
// press release about a document update arrived as a vacancy at Atos.
const JOB_SEGMENT = /(^|[\/\-_])(jobs?|stelle|stellen|stellenangebote?|karriere|career|careers|vacanc\w*|position|positions|offre|vagas)([\/\-_]|$)/i;

function pathNamesAJob(url) {
  try { return JOB_SEGMENT.test(new URL(url).pathname); } catch (_) { return false; }
}

const locsOf = (xml) => (String(xml || '').match(/<loc>\s*([^<]+?)\s*<\/loc>/gi) || [])
  .map((l) => l.replace(/<[^>]*>/g, '').trim().replace(/&amp;/g, '&'));

/**
 * A readable title out of a posting URL.
 *
 * These sitemaps carry no titles, and the slug is what there is:
 * "stellv-teamleitung-geotechnik-10567" is the job, and the trailing number is the
 * posting id rather than part of the name.
 */
// German capitalises nouns and leaves the rest down; a job title in a slug is
// all lower case and gives no way to tell which is which, so the closed class is
// listed and everything else is treated as a noun.
const SMALL = new Set(['im', 'in', 'am', 'an', 'auf', 'aus', 'bei', 'der', 'die', 'das',
  'den', 'des', 'dem', 'ein', 'eine', 'einer', 'fuer', 'für', 'mit', 'nach', 'oder',
  'und', 'von', 'vom', 'zu', 'zum', 'zur', 'ueber', 'über', 'als', 'bis',
  'a', 'an', 'and', 'at', 'for', 'of', 'or', 'the', 'to', 'with']);

function titleFromUrl(url) {
  let slug;
  try {
    slug = new URL(url).pathname.replace(/\/+$/, '').split('/').pop() || '';
  } catch (_) { return 'Job offer'; }
  const cased = decodeURIComponent(slug)
    // Some boards serve a file, not a path: REWE's slugs end ".html" and the
    // extension arrived inside the job title.
    .replace(/\.(html?|php|aspx?|jsp)$/i, '')
    // The posting id sits at either end depending on the site: TÜV NORD writes
    // "...-geotechnik-10567" and Zalando "2720430-software-engineer-...". Neither
    // is part of the name.
    .replace(/-\d{3,}$/, '')
    .replace(/^\d{4,}-/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\bm w d\b/gi, '(m/w/d)')
    .replace(/\s{2,}/g, ' ')
    .trim()
    // Every word, not only the first. A slug is lower case throughout, and the
    // capital carries meaning in German: "Stellv teamleitung geotechnik" reads as a
    // mistake where "Stellv Teamleitung Geotechnik" reads as a position. Function
    // words stay down — German capitalises the nouns, not the prepositions, and
    // "Werkstudentin Im Vertriebsinnendienst" is as wrong the other way.
    .replace(/(^|\s)(\p{Ll}[\p{L}]*)/gu, (m, sp, w) =>
      sp + (sp && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)));
  return cased || 'Job offer';
}

async function sitemap(base, company) {
  const { origin, sitemaps, disallow } = await robots(base);
  // The URL in the registry is a hint; robots.txt is the authority. If it announces
  // nothing, the one that was configured is used on its own.
  const roots = sitemaps.length ? sitemaps : [base];

  const indexes = [];
  for (const root of roots) {
    if (blocked(disallow, root)) continue;
    const xml = await get(root);
    if (!xml) continue;
    const locs = locsOf(xml);
    // A sitemap index points at more sitemaps; a sitemap points at pages. The job
    // one is picked by name where it is named, because fetching every section of a
    // large site to find the jobs is the wrong amount of traffic for the result.
    const jobIndexes = locs.filter((u) => /job|stelle|karriere|career|vacanc/i.test(u));
    if (/<sitemapindex/i.test(xml)) indexes.push(...(jobIndexes.length ? jobIndexes : locs.slice(0, 3)));
    else indexes.push(root);
  }

  const urls = [];
  for (const idx of indexes.slice(0, 4)) {
    if (blocked(disallow, idx)) continue;
    const xml = await get(idx);
    if (!xml) continue;
    locsOf(xml).forEach((u) => {
      if (!pathNamesAJob(u)) return;
      if (blocked(disallow, u)) return;
      urls.push(u);
    });
    if (urls.length >= SITEMAP_MAX) break;
  }

  // The listing and subscription pages sit in the same section as the postings.
  const seen = new Set();
  return urls
    .filter((u) => {
      const tail = u.replace(/\/+$/, '').split('/').pop() || '';
      if (!/[a-z]-[a-z]/i.test(tail)) return false;              // a real slug, not "jobs"
      if (/^(jobs|karriere|career|detail-page|abmelden|anmelden|suche)$/i.test(tail)) return false;
      // A site publishes one sitemap per language, so the same posting arrives twice
      // under two slugs — 278 rows for the 144 positions TÜV NORD actually has. The
      // trailing number is the posting id and is the same in both, so it is what
      // identity is taken from; the URL is not.
      const id = (tail.match(/-(\d{3,})$/) || tail.match(/^(\d{4,})-/) || [])[1] || u;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, SITEMAP_MAX)
    .map((u) => normalise('Employer site', company, {
      title: titleFromUrl(u),
      location: '',
      // Deliberately empty. The sitemap gives an index, not the postings, and
      // fetching each one would be a request per job — a different activity from
      // reading the index a site publishes to be read.
      description: '',
      url: u,
      date: null,
      department: '',
      raw: null,
    }));
}

const CONNECTORS = { greenhouse, lever, smartrecruiters, personio, sitemap };

// ── Registry ────────────────────────────────────────────────────────────────
//
// Only identifiers verified against live data belong here. An unverified one is
// worse than an absent one: it returns nothing and looks like an employer with no
// openings.
//
// Every line below was probed before it was written, and the count is what came back
// on the day it was added. The count is not a promise — an employer's board moves —
// but a line that returns zero for a week is a line to look at, and without the
// figure there is nothing to compare against.
//
// What the sweep found is worth stating plainly, because it shapes what this file
// can be. 242 identifier guesses across four platforms produced exactly one German
// employer: the large Konzerne run SAP SuccessFactors, Workday or Avature, none of
// which publishes an open endpoint the way Greenhouse and Lever do. Job sitemaps
// fill part of the gap and no more — of sixty domains probed, most announce a
// sitemap that turns out to hold press releases, and four hold postings.
//
// So this registry is a supplement, not the source. The Bundesagentur is where the
// German Konzerne actually post in volume — Siemens 6,922 open positions, SAP
// 18,872, Bosch 1,149 — and reaching those is a filter on the employer field, which
// is what server/employers.js does. What the registry adds is the postings that
// never reach the Bundesagentur at all: TÜV NORD publishes 139 through its own
// board against the 63 it files there.
const ATS_EMPLOYERS = [
  // ── Own job board, read through the sitemap they publish for search engines ──
  { company: 'TÜV NORD', platform: 'sitemap', id: 'https://www.tuev-nord-group.com/de/sitemap_index.xml' },   // 139
  { company: 'Zalando', platform: 'sitemap', id: 'https://jobs.zalando.com/sitemap.xml' },                    // 159
  { company: 'REWE Group', platform: 'sitemap', id: 'https://jobs.rewe-group.com/sitemap.xml' },              // 400, capped

  // ── Recruiting platforms with a public API ──────────────────────────────────
  { company: 'Continental', platform: 'smartrecruiters', id: 'Continental' },                                 // 878, capped at 400
  { company: 'Celonis', platform: 'greenhouse', id: 'celonis' },                                              // 273

  // Kept from the first version: neither is a German employer, and both are here so
  // the Greenhouse path is exercised by live data even if every entry above breaks.
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

// A German board answers an English question, and mostly in German.
//
// TÜV NORD's own portal returns five postings for "Security"; searching their
// sitemap for the same word returned three, because "IT-Sicherheitsexpert:in" and
// "Projektleiter:in IT-Sicherheit" are the same job in the other language. Their
// portal reads the whole posting and its category tag, which is where the English
// word lives. All this connector has is the title, so the word has to travel.
//
// Kept to the terms this project is about. It is not a translation layer and should
// not become one — an expansion that is nearly right turns a keyword filter into a
// suggestion, which is worse than the narrow answer it replaced.
const SYNONYMS = {
  security: ['sicherheit'],
  sicherheit: ['security'],
  cyber: ['cyber'],
  developer: ['entwickler'],
  entwickler: ['developer'],
  engineer: ['ingenieur'],
  network: ['netzwerk'],
  netzwerk: ['network'],
  privacy: ['datenschutz'],
  datenschutz: ['privacy'],
};

/** A search token and whatever it is also called. */
function expand(token) {
  return [token].concat(SYNONYMS[token] || []);
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
  const tokens = String(keyword || '').toLowerCase().split(/\s+/)
    .filter((t) => t.length > 2)
    .map(expand);
  if (tokens.length) {
    jobs = jobs.filter((j) => {
      const hay = (j.title + ' ' + j.description + ' ' + j.sector).toLowerCase();
      return tokens.some((forms) => forms.some((t) => hay.includes(t)));
    });
  }
  return jobs;
}

// titleFromUrl, pathNamesAJob and blocked are exported for the tests. They are the
// parts of the sitemap connector that hold judgement rather than transport, and
// they are the parts that were wrong twice — so they are the parts worth pinning
// without a network call.
module.exports = {
  fetchAtsJobs, registry, CONNECTORS, ATS_EMPLOYERS,
  titleFromUrl, pathNamesAJob, blocked,
};
