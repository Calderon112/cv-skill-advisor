const http   = require('http');
const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const zlib   = require('zlib');
let pdfParse;

try { pdfParse = require('pdf-parse'); } catch(_) { pdfParse = null; }

// Extended security taxonomy (200+ skills) + external LLM + email modules.
const { SECURITY_GROUPS, SECURITY_ROLES } = require('./security-skills.js');
const llm    = require('./server/llm.js');
const email  = require('./server/email.js');
const agents = require('./server/agents.js');
const { dedupeJobs } = require('./server/dedup.js');
const Scorer = require('./scorer.js');
const SecurityLearning = require('./security-learning.js');


// ── Password hashing (scrypt — Node.js built-in, no npm needed) ──────────
function hashPassword(plaintext) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plaintext, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(plaintext, stored) {
  // Legacy: plaintext stored directly (migrate on first login)
  if (!stored.includes(':')) return stored === plaintext;
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(plaintext, salt, 32).toString('hex');
  return actual === expected;
}

// Dev-only: Windows blocks external HTTPS due to SSL revocation check.
// This disables TLS cert verification globally for the Node.js process.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([^#][^=]+?)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key] && value) {
        process.env[key] = value;
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const publicDir = __dirname;
const STORAGE_FILE = path.join(__dirname, 'storage.json');
const USERS = [{ username: 'student', password: 'security', name: 'Student' }];

let storage = { profiles: {}, tokens: {}, users: {}, applications: {} };

function loadStorage() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf8');
      storage = JSON.parse(content || '{}');
      storage.profiles     = storage.profiles     || {};
      storage.tokens       = storage.tokens       || {};
      storage.users        = storage.users        || {};
      storage.applications = storage.applications || {};
    } else {
      saveStorage();
    }
  } catch (error) {
    console.error('Failed to load storage:', error);
    storage = { profiles: {}, tokens: {}, users: {} };
  }
}

function saveStorage() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(storage, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save storage:', error);
  }
}

function createToken(username) {
  const token = crypto.randomBytes(24).toString('hex');
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  storage.tokens[token] = { username, created: Date.now(), expires };
  saveStorage();
  return token;
}

function validateToken(token) {
  if (!token) return null;
  const session = storage.tokens[token];
  if (!session) return null;
  if (session.expires && Date.now() > session.expires) {
    delete storage.tokens[token];
    saveStorage();
    return null;
  }
  return session.username;
}

loadStorage();

const BUNDES_API_KEY       = process.env.BUNDES_API_KEY  || 'jobboerse-jobsuche';
const NEWPLAN_API_KEY      = process.env.NEWPLAN_API_KEY || '7679c728-db18-43ce-beb8-52a9d571d419';
const APIFY_TOKEN          = process.env.APIFY_TOKEN     || '';
const JOOBLE_API_KEY       = process.env.JOOBLE_API_KEY  || '';
const ADZUNA_APP_ID        = process.env.ADZUNA_APP_ID   || '';
const ADZUNA_APP_KEY       = process.env.ADZUNA_APP_KEY  || '';
const APIFY_RUN_URL        = 'https://api.apify.com/v2/acts/santamaria-automations~stepstone-de-scraper/runs?waitForFinish=120';
const APIFY_INDEED_RUN_URL = 'https://api.apify.com/v2/acts/automation-lab~indeed-scraper/runs?waitForFinish=120';
const JOBS_API_URL         = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs';
const ARBEITNOW_URL        = 'https://www.arbeitnow.com/api/job-board-api';
const REMOTIVE_URL         = 'https://remotive.com/api/remote-jobs';
const LINKEDIN_GUEST_URL   = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
const INDEED_RSS_URL       = 'https://de.indeed.com/jobs';
const STEPSTONE_SEARCH_URL = 'https://www.stepstone.de/jobs';

// ── Anti-bot realistic browser headers ───────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
];

function browserHeaders(referer = '', acceptJson = false) {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  return {
    'User-Agent':               ua,
    'Accept':                   acceptJson
      ? 'application/json,text/javascript,*/*;q=0.01'
      : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language':          'en-US,en;q=0.9,de;q=0.8,fr;q=0.7',
    'Accept-Encoding':          'gzip, deflate, br',
    'Connection':               'keep-alive',
    'Upgrade-Insecure-Requests':'1',
    'Sec-Fetch-Dest':           'document',
    'Sec-Fetch-Mode':           'navigate',
    'Sec-Fetch-Site':           referer ? 'same-origin' : 'none',
    'Sec-Fetch-User':           '?1',
    'DNT':                      '1',
    'Cache-Control':            'no-cache',
    ...(referer ? { 'Referer': referer } : {})
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Strip HTML tags from a string
function stripHtml(str) {
  return (str || '').replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const locationCoordinatesCache = {};
const NEWPLAN_BASE_URL = 'https://rest.arbeitsagentur.de';

function apifyHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (APIFY_TOKEN) h.Authorization = `Bearer ${APIFY_TOKEN}`;
  return h;
}

async function readApifyDataset(datasetId, sourceName) {
  if (!datasetId) return [];
  try {
    const url = `https://api.apify.com/v2/datasets/${encodeURIComponent(datasetId)}/items?clean=true&format=json&limit=50`;
    const r   = await fetch(url, { headers: apifyHeaders() });
    if (!r.ok) return [];
    const items = await r.json();
    return Array.isArray(items) ? items.map(item => normalizeApifyJobFields(item, sourceName)) : [];
  } catch (_) {
    return [];
  }
}

async function fetchApifyJobs(keyword, location, radius) {
  const payload = {
    keyword,
    location,
    searchPhrase: keyword,
    locations: location ? [location] : undefined,
    radius: radius === 'all' ? undefined : Number(radius) || undefined
  };

  try {
    const response = await fetch(APIFY_RUN_URL, {
      method: 'POST',
      headers: apifyHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(140000)
    });

    if (!response.ok) return null;

    const runData   = await response.json();
    const datasetId = runData?.defaultDatasetId || runData?.defaultDataset?.id || runData?.defaultDataset;
    const items     = await readApifyDataset(datasetId, 'StepStone');
    return { run: runData, items };
  } catch (_) {
    return null;
  }
}

async function fetchIndeedJobs(keyword, location, country, radius) {
  const payload = {
    keyword,
    location,
    country,
    search: keyword,
    locations: location ? [location] : undefined,
    radius: radius === 'all' ? undefined : Number(radius) || undefined
  };

  try {
    const response = await fetch(APIFY_INDEED_RUN_URL, {
      method: 'POST',
      headers: apifyHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(140000)
    });

    if (!response.ok) return null;

    const runData   = await response.json();
    const datasetId = runData?.defaultDatasetId || runData?.defaultDataset?.id || runData?.defaultDataset;
    const items     = await readApifyDataset(datasetId, 'Indeed');
    return { run: runData, items };
  } catch (_) {
    return null;
  }
}

async function fetchJoobleJobs(keyword, location, radius) {
  if (!JOOBLE_API_KEY) {
    return { run: { note: 'Jooble API key not configured.' }, items: [] };
  }

  const payload = {
    keywords: keyword,
    location,
    radius: radius === 'all' ? undefined : radius,
    page: 1
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(`https://jooble.org/api/${encodeURIComponent(JOOBLE_API_KEY)}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const items = data?.jobs || data?.results || [];
    return {
      run: data,
      items: Array.isArray(items) ? items.map(normalizeJoobleJobFields) : []
    };
  } catch (error) {
    return null;
  }
}

// ── Adzuna — free aggregator API (de/ch/us). Surfaces StepStone/Indeed-listed
// jobs legitimately, without scraping. Needs free ADZUNA_APP_ID + ADZUNA_APP_KEY.
async function fetchAdzunaJobs(keyword, location, region) {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    return { run: { note: 'Adzuna credentials not configured.' }, items: [] };
  }
  const country = buildSearchCountry(region || 'germany'); // de / ch / us
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: '50',
    'content-type': 'application/json'
  });
  if (keyword)  params.set('what', keyword);
  if (location) params.set('where', location);

  try {
    const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`, {
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return null;
    const data = await response.json();
    const items = Array.isArray(data?.results) ? data.results.map(normalizeAdzunaJobFields) : [];
    return { run: data, items };
  } catch (_) {
    return null;
  }
}

function normalizeAdzunaJobFields(job) {
  const salary = (job.salary_min || job.salary_max)
    ? `${job.salary_min || ''}–${job.salary_max || ''}`.replace(/^–|–$/g, '')
    : null;
  return {
    platform: 'Adzuna',
    source: 'adzuna',
    title: job.title || 'Job offer',
    company: job.company?.display_name || 'Unknown employer',
    location: job.location?.display_name
      || (Array.isArray(job.location?.area) ? job.location.area.join(', ') : '')
      || 'Unspecified',
    sector: job.category?.label || 'security',
    board: 'Adzuna',
    description: stripHtml(job.description || '').slice(0, 400),
    reference: job.id || null,
    publishedDate: job.created ? String(job.created).slice(0, 10) : null,
    jobUrl: job.redirect_url || null,
    salary,
    raw: job
  };
}

function normalizeJobUrl(job) {
  return job.url || job.jobUrl || job.link || job.linkUrl || job.applyUrl || job.job_link || job.apply_link || job.href || job.offerUrl || job.apply_link || null;
}

function normalizePublishedDate(job) {
  return job.publishedDate || job.datePosted || job.post_date || job.createdAt || job.created || job.posted || job.date || job.publishDate || job.publicationDate || null;
}

// Split keyword into tokens for OR-matching (avoids zero results on exact phrase)
function kwTokens(keyword) {
  return (keyword || '').toLowerCase().split(/\s+/).filter(t => t.length > 2);
}

function matchesKeyword(tokens, ...fields) {
  if (!tokens.length) return true;
  const hay = fields.map(f => (f || '').toLowerCase()).join(' ');
  return tokens.some(t => hay.includes(t));
}

// ── Arbeitnow — free public API (no key, Germany-focused jobs) ───────────
async function fetchArbeitnowJobs(keyword) {
  try {
    // Fetch pages 1-3 to increase coverage (100 jobs per page)
    const pages = await Promise.all([1, 2, 3].map(p =>
      fetch(`${ARBEITNOW_URL}?page=${p}`, { headers: browserHeaders('https://www.arbeitnow.com', true) })
        .then(r => r.ok ? r.json() : { data: [] })
        .catch(() => ({ data: [] }))
    ));
    const allJobs = pages.flatMap(d => d.data || []);
    const tokens  = kwTokens(keyword);

    const filtered = allJobs.filter(j =>
      matchesKeyword(tokens, j.title, ...(j.tags || []))
    );

    return filtered.map(j => ({
      platform:      'Arbeitnow',
      source:        'arbeitnow',
      title:         j.title || 'Job offer',
      company:       j.company_name || 'Unknown',
      location:      j.location || 'Germany',
      description:   stripHtml(j.description).slice(0, 400),
      jobUrl:        j.url || null,
      publishedDate: j.created_at ? new Date(j.created_at * 1000).toISOString().slice(0, 10) : null,
      sector:        (j.tags || []).slice(0, 3).join(', '),
      board:         'Arbeitnow',
      remote:        j.remote || false,
      jobType:       (j.job_types || []).join(', ') || null,
      raw:           j
    }));
  } catch (_) {
    return [];
  }
}

// ── Remotive — free public API (remote jobs worldwide) ───────────────────
async function fetchRemotiveJobs(keyword) {
  try {
    const url = `${REMOTIVE_URL}?search=${encodeURIComponent(keyword || '')}&limit=30`;
    const r   = await fetch(url, { headers: browserHeaders('https://remotive.com', true) });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.jobs || []).map(j => ({
      platform:      'Remotive',
      source:        'remotive',
      title:         j.title || 'Job offer',
      company:       j.company_name || 'Unknown',
      location:      j.candidate_required_location || 'Worldwide',
      description:   stripHtml(j.description).slice(0, 400),
      jobUrl:        j.url || null,
      publishedDate: j.publication_date?.slice(0, 10) || null,
      sector:        j.category || null,
      board:         'Remotive',
      remote:        true,
      jobType:       j.job_type || null,
      salary:        j.salary || null,
      raw:           j
    }));
  } catch (_) {
    return [];
  }
}

// ── LinkedIn — public guest API (no auth, anti-bot headers) ──────────────
async function fetchLinkedInJobs(keyword, location) {
  try {
    const params = new URLSearchParams({
      keywords: keyword || '',
      location: location || 'Germany',
      f_TPR:    'r2592000',   // last 30 days
      start:    '0'
    });
    await sleep(300 + Math.random() * 400);

    const r = await fetch(`${LINKEDIN_GUEST_URL}?${params}`, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://www.linkedin.com/jobs/search/',
        'DNT':             '1'
      }
    });
    if (!r.ok) return [];
    const html = await r.text();
    const jobs = [];

    // Each job card is a <li> containing a <div class="base-card">
    const liRe = /<li>([\s\S]*?)<\/li>/g;
    let m;
    while ((m = liRe.exec(html)) !== null) {
      const li = m[1];
      // Title: inside h3 (any class)
      const title   = (li.match(/<h3[^>]*>\s*<a[^>]*>\s*([^<\n]+)\s*<\/a>/) ||
                       li.match(/<h3[^>]*>\s*([^<\n]+)\s*<\/h3>/) || [])[1];
      // Company: inside h4 or .base-search-card__subtitle
      const company = (li.match(/<h4[^>]*>\s*<a[^>]*>\s*([^<\n]+)\s*<\/a>/) ||
                       li.match(/<h4[^>]*>\s*([^<\n]+)\s*<\/h4>/) || [])[1];
      // Location: span with location class
      const loc     = (li.match(/class="[^"]*location[^"]*"[^>]*>\s*([^<\n]+)/) || [])[1];
      // Date: datetime attribute
      const date    = (li.match(/datetime="([^"]+)"/) || [])[1];
      // URL: href to /jobs/view/
      const jobUrl  = (li.match(/href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^?"]+)/) || [])[1];

      const t = stripHtml(title || '').trim();
      const c = stripHtml(company || '').trim();
      if (t.length < 2 || c.length < 2) continue;

      jobs.push({
        platform:      'LinkedIn',
        source:        'linkedin',
        title:         t,
        company:       c,
        location:      stripHtml(loc || '').trim() || location || 'Germany',
        description:   'Full description on LinkedIn.',
        jobUrl:        jobUrl || null,
        publishedDate: date ? date.slice(0, 10) : null,
        board:         'LinkedIn',
        raw:           null
      });
    }
    return jobs;
  } catch (_) {
    return [];
  }
}

// ── Indeed — HTML scraping (RSS returns 403) ──────────────────────────────
async function fetchIndeedRssJobs(keyword, location) {
  try {
    const params = new URLSearchParams({
      q:        keyword || '',
      l:        location || 'Deutschland',
      sort:     'date',
      fromage:  '14',
      vjk:      ''
    });
    await sleep(500 + Math.random() * 500);

    const r = await fetch(`https://de.indeed.com/jobs?${params}`, {
      headers: {
        'User-Agent':               'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':                   'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language':          'de-DE,de;q=0.9,en;q=0.8',
        'Accept-Encoding':          'gzip, deflate, br',
        'Referer':                  'https://de.indeed.com/',
        'Sec-Fetch-Dest':           'document',
        'Sec-Fetch-Mode':           'navigate',
        'Sec-Fetch-Site':           'same-origin',
        'Upgrade-Insecure-Requests':'1',
        'Connection':               'keep-alive',
        'DNT':                      '1'
      }
    });

    if (!r.ok) return [];
    const html = await r.text();
    const jobs = [];

    // Indeed embeds job data in JSON inside window.mosaic.providerData
    const jsonMatch = html.match(/window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*(\{[\s\S]*?\});\s*window/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const results = data?.metaData?.mosaicProviderJobCardsModel?.results || [];
        results.forEach(job => {
          jobs.push({
            platform:      'Indeed',
            source:        'indeed',
            title:         job.title || 'Job offer',
            company:       job.company || 'Unknown',
            location:      job.formattedLocation || location || 'Deutschland',
            description:   stripHtml(job.snippet || '').slice(0, 400),
            jobUrl:        job.viewJobLink ? `https://de.indeed.com${job.viewJobLink}` : null,
            publishedDate: job.pubDate ? new Date(job.pubDate).toISOString().slice(0, 10) : null,
            board:         'Indeed',
            salary:        job.extractedSalary ? `${job.extractedSalary.min || ''}–${job.extractedSalary.max || ''} ${job.extractedSalary.type || ''}`.trim() : null,
            raw:           null
          });
        });
      } catch (_) {}
    }

    // Fallback: JSON-LD job postings
    if (!jobs.length) {
      const jsonLdRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
      let m;
      while ((m = jsonLdRe.exec(html)) !== null) {
        try {
          const obj = JSON.parse(m[1]);
          if (obj['@type'] !== 'JobPosting') continue;
          jobs.push({
            platform:      'Indeed',
            source:        'indeed',
            title:         obj.title,
            company:       obj.hiringOrganization?.name || 'Unknown',
            location:      obj.jobLocation?.address?.addressLocality || location || 'Deutschland',
            description:   stripHtml(obj.description || '').slice(0, 400),
            jobUrl:        obj.url || null,
            publishedDate: obj.datePosted?.slice(0, 10) || null,
            board:         'Indeed',
            raw:           null
          });
        } catch (_) {}
      }
    }

    return jobs;
  } catch (_) {
    return [];
  }
}

// ── StepStone — HTML + JSON-LD scraping ──────────────────────────────────
async function fetchStepstoneJobs(keyword, location) {
  try {
    const kw  = (keyword || 'it').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    // Correct StepStone URL format: /jobs/<keyword>/ (no location suffix)
    const url = `${STEPSTONE_SEARCH_URL}/${kw}/`;
    await sleep(400 + Math.random() * 600);

    const r = await fetch(url, { headers: browserHeaders('https://www.stepstone.de', false) });
    if (!r.ok) return [];
    const html = await r.text();
    const jobs = [];

    // JSON-LD job postings (most reliable)
    const jsonLdRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let m;
    while ((m = jsonLdRe.exec(html)) !== null) {
      try {
        const obj = JSON.parse(m[1]);
        if (obj['@type'] !== 'JobPosting') continue;
        jobs.push({
          platform:      'StepStone',
          source:        'stepstone',
          title:         obj.title || 'Job offer',
          company:       obj.hiringOrganization?.name || 'Unknown',
          location:      obj.jobLocation?.address?.addressLocality || location || 'Germany',
          description:   stripHtml(obj.description || '').slice(0, 400),
          jobUrl:        obj.url || null,
          publishedDate: obj.datePosted?.slice(0, 10) || null,
          salary:        obj.baseSalary
            ? `${obj.baseSalary.value?.value || obj.baseSalary.value?.minValue || ''}–${obj.baseSalary.value?.maxValue || ''} ${obj.baseSalary.currency || ''}`.trim()
            : null,
          jobType:       obj.employmentType || null,
          board:         'StepStone',
          raw:           null
        });
      } catch (_) {}
    }

    // Fallback: look for __NEXT_DATA__ JSON (Next.js site)
    if (!jobs.length) {
      const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nextMatch) {
        try {
          const data = JSON.parse(nextMatch[1]);
          const listings = data?.props?.pageProps?.searchResult?.results || [];
          listings.forEach(j => {
            jobs.push({
              platform:      'StepStone',
              source:        'stepstone',
              title:         j.jobTitle || j.title || 'Job offer',
              company:       j.company?.name || j.companyName || 'Unknown',
              location:      j.location?.city || location || 'Germany',
              description:   stripHtml(j.previewText || j.description || '').slice(0, 400),
              jobUrl:        j.url || null,
              publishedDate: j.date?.slice(0, 10) || null,
              board:         'StepStone',
              raw:           null
            });
          });
        } catch (_) {}
      }
    }

    return jobs;
  } catch (_) {
    return [];
  }
}

function normalizeCompany(job) {
  return job.company || job.employer || job.companyName || job.arbeitgeber?.name || job.arbeitgeber || job.organisation || job.organization || null;
}

function normalizeLocation(job) {
  return job.location || job.place || job.city || job.adresse || job.address || job.jobLocation || job.location_name || null;
}

function normalizeDescription(job) {
  return job.description || job.summary || job.snippet || job.jobDescription || job.text || job.details || job.body || 'No description available.';
}

function normalizeTitle(job) {
  return job.title || job.position || job.jobTitle || job.heading || job.bezeichnung || job.stellentitel || 'Job offer';
}

async function geocodeLocation(location) {
  if (!location || typeof location !== 'string') return null;
  const key = location.trim().toLowerCase();
  if (locationCoordinatesCache[key]) return locationCoordinatesCache[key];

  try {
    const url = `${NOMINATIM_BASE_URL}?format=json&limit=1&q=${encodeURIComponent(location)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'cv-skill-advisor-demo/1.0'
      }
    });
    if (!response.ok) return null;
    const results = await response.json();
    const first = Array.isArray(results) && results[0];
    if (!first) return null;
    const coord = { lat: parseFloat(first.lat), lon: parseFloat(first.lon) };
    locationCoordinatesCache[key] = coord;
    return coord;
  } catch (error) {
    return null;
  }
}

function haversineKm(a, b) {
  if (!a || !b) return null;
  const toRad = value => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon), Math.sqrt(1 - (sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon)));
  return 6371 * c;
}

async function filterJobsByDistance(jobs, origin, radiusKm) {
  if (!origin || radiusKm === 'all' || radiusKm === undefined || radiusKm === null) return jobs;
  const originCoords = await geocodeLocation(origin);
  if (!originCoords) return jobs;

  const kmLimit = Number(radiusKm);
  if (Number.isNaN(kmLimit) || kmLimit <= 0) return jobs;

  const results = [];
  for (const job of jobs) {
    const locationText = normalizeLocation(job) || job.location || job.place || job.city;
    const jobCoords = await geocodeLocation(locationText);
    if (!jobCoords) continue;
    const distance = haversineKm(originCoords, jobCoords);
    if (distance !== null && distance <= kmLimit) {
      results.push({ ...job, distance: Math.round(distance * 10) / 10 });
    }
  }

  return results;
}

function normalizeApifyJobFields(job, source) {
  return {
    platform: source,
    source,
    title: normalizeTitle(job),
    company: normalizeCompany(job) || 'Unknown employer',
    location: normalizeLocation(job) || 'Remote / unspecified',
    sector: job.sector || job.category || job.profession || job.jobCategory || 'security',
    board: job.board || source,
    description: normalizeDescription(job),
    reference: job.jobId || job.id || job.reference || null,
    publishedDate: normalizePublishedDate(job),
    jobUrl: normalizeJobUrl(job) || job.url || null,
    raw: job
  };
}

function normalizeJoobleJobFields(job) {
  return {
    platform: 'Jooble',
    source: 'jooble',
    title: normalizeTitle(job),
    company: normalizeCompany(job) || job.employer || 'Unknown employer',
    location: normalizeLocation(job) || 'Remote / unspecified',
    sector: job.category || job.sector || 'security',
    board: job.source || 'Jooble',
    description: normalizeDescription(job),
    reference: job.id || job.jobId || job.reference || null,
    publishedDate: normalizePublishedDate(job),
    jobUrl: normalizeJobUrl(job) || job.url || job.applicationUrl || null,
    raw: job
  };
}

function getToken(req) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/);
  return match ? match[1] : null;
}

function isAuthorized(req) {
  return validateToken(getToken(req)) !== null;
}

function getUser(username) {
  const data = storage.users[username] || USERS.find(u => u.username === username);
  if (!data) return null;
  return { username, ...data }; // always include the username field
}

function saveUser(username, password, name) {
  storage.users[username] = { password: hashPassword(password), name };
  saveStorage();
}

function getProfileText(token) {
  return storage.profiles[token] || '';
}

function saveProfileText(token, profile) {
  storage.profiles[token] = profile;
  saveStorage();
}

function extractBundesJobFields(job, searchParams) {
  // Real API response uses: ergebnisliste, stellenangebotsTitel, firma, stellenlokationen, externeURL
  const loc   = Array.isArray(job.stellenlokationen) ? job.stellenlokationen[0] : null;
  const city  = loc?.adresse?.ort  || loc?.adresse?.region || '';
  const plz   = loc?.adresse?.plz  || '';
  const location = [plz, city].filter(Boolean).join(' ') || 'Deutschland';

  return {
    platform:      'Bundesagentur',
    source:        'bundesapi',
    title:         job.stellenangebotsTitel || job.titel || 'Job offer',
    company:       job.firma || job.arbeitgeber?.name || job.arbeitgeber || 'Unbekannt',
    location,
    sector:        searchParams?.get?.('sector') || 'all',
    board:         'Bundesagentur',
    description:   job.hauptberuf?.bezeichnungNeutral || job.beruf || job.alleBerufe?.[0]?.bezeichnungNeutral || 'Weitere Infos auf der Jobseite.',
    reference:     job.referenznummer || job.chiffrenummer || null,
    publishedDate: job.datumErsteVeroeffentlichung || job.aenderungsdatum || null,
    jobUrl:        job.externeURL || job.externeUrl || null,
    raw:           job
  };
}

// Domain → fallback keyword when user has not typed a specific job title
const DOMAIN_KEYWORDS = {
  cybersecurity: 'cybersecurity IT security',
  software:      'software developer programmer',
  data:          'data analyst data scientist',
  devops:        'DevOps cloud engineer',
  ai:            'machine learning AI engineer',
  network:       'network administrator infrastructure',
  'it-support':  'IT support system administrator',
  finance:       'finance accounting controller',
  marketing:     'marketing communications',
  sales:         'sales account manager',
  hr:            'human resources recruiter',
  project:       'project manager',
  consulting:    'consultant strategy',
  healthcare:    'healthcare nurse doctor medical',
  law:           'lawyer legal compliance',
  engineering:   'engineer mechanical electrical',
  design:        'designer UX UI',
  education:     'teacher researcher education',
  all:           ''
};

// Common English→German keyword translations for Bundesagentur
const EN_TO_DE = {
  'software developer':     'Softwareentwickler',
  'software engineer':      'Softwareentwickler',
  'data analyst':           'Data Analyst',
  'data scientist':         'Data Scientist',
  'devops engineer':        'DevOps Engineer',
  'cloud engineer':         'Cloud Engineer',
  'frontend developer':     'Frontend Entwickler',
  'backend developer':      'Backend Entwickler',
  'fullstack developer':    'Full Stack Entwickler',
  'full stack developer':   'Full Stack Entwickler',
  'machine learning':       'Machine Learning',
  'cybersecurity':          'IT Sicherheit',
  'penetration testing':    'Penetrationstest',
  'network engineer':       'Netzwerktechniker',
  'project manager':        'Projektmanager',
  'product manager':        'Produktmanager',
  'marketing manager':      'Marketing Manager',
  'accountant':             'Buchhalter',
  'financial analyst':      'Finanzanalyst',
  'hr manager':             'HR Manager',
  'recruiter':              'Recruiter',
  'designer':               'Designer',
  'ux designer':            'UX Designer',
};

function translateForBundes(keyword) {
  if (!keyword) return '';
  const low = keyword.toLowerCase().trim();
  return EN_TO_DE[low] || keyword;
}

function buildBundesQueryParams(searchParams) {
  const params = new URLSearchParams();

  params.set('angebotsart',        '1');
  params.set('page',               '1');
  params.set('size',               '25');
  params.set('pav',                'false');
  params.set('veroeffentlichtseit','30');

  // Location — translate English region names to German for the API
  const EN_REGION = { Germany: 'Deutschland', Germany_: 'Deutschland', Switzerland: 'Schweiz', Austria: 'Österreich', 'United States': 'Vereinigte Staaten', USA: 'Vereinigte Staaten' };
  const location  = searchParams.get('location');
  const region    = searchParams.get('region') || 'germany';
  const wo        = location ? (EN_REGION[location] || location) : (region === 'germany' ? 'Deutschland' : region === 'switzerland' ? 'Schweiz' : region === 'usa' ? 'Vereinigte Staaten' : 'Deutschland');
  params.set('wo', wo);

  // Keyword: translate to German for better Bundesagentur results
  const rawKeyword = searchParams.get('keyword') || searchParams.get('was');
  const sector     = searchParams.get('sector') || 'all';
  const domainFallback = DOMAIN_KEYWORDS[sector] || '';
  const was = translateForBundes(rawKeyword) || translateForBundes(domainFallback) || rawKeyword || domainFallback;
  if (was) params.set('was', was);

  return params;
}

function buildSearchLocation(searchParams) {
  const location = searchParams.get('location');
  if (location) return location;
  const region = searchParams.get('region');
  if (region === 'germany')     return 'Germany';
  if (region === 'switzerland') return 'Switzerland';
  if (region === 'usa')         return 'United States';
  return null;
}

function buildSearchKeyword(searchParams) {
  // User's free-text keyword takes priority
  const keyword = searchParams.get('keyword');
  if (keyword && keyword.trim()) return keyword.trim();

  // Fall back to domain mapping
  const sector = searchParams.get('sector') || 'all';
  return DOMAIN_KEYWORDS[sector] || '';
}

function buildSearchCountry(region) {
  if (region === 'switzerland') return 'ch';
  if (region === 'usa') return 'us';
  return 'de';
}

// Assemble the source list for an "all platforms" search. The 4 free sources
// always run; Adzuna and the Apify scrapers (StepStone/Indeed) are added only
// when their key/token is configured — so an unconfigured key never produces a
// wasted request or a misleading empty entry in the breakdown.
function buildAllPlatformSources({ searchParams, keyword, location, region, distance }) {
  const loc = location
    || (region === 'switzerland' ? 'Switzerland' : region === 'usa' ? 'United States' : 'Germany');
  const sources = [
    { key: 'Bundesagentur', run: () => fetchBundesJobs(searchParams),     pick: r => r?.jobs || [] },
    { key: 'Arbeitnow',     run: () => fetchArbeitnowJobs(keyword),        pick: r => r || [] },
    { key: 'LinkedIn',      run: () => fetchLinkedInJobs(keyword, loc),    pick: r => r || [] },
    { key: 'Remotive',      run: () => fetchRemotiveJobs(keyword),         pick: r => r || [] },
  ];
  if (ADZUNA_APP_ID && ADZUNA_APP_KEY) {
    sources.push({ key: 'Adzuna', run: () => fetchAdzunaJobs(keyword, loc, region), pick: r => r?.items || [] });
  }
  if (APIFY_TOKEN) {
    sources.push({ key: 'StepStone', run: () => fetchApifyJobs(keyword, loc, distance),                              pick: r => r?.items || [] });
    sources.push({ key: 'Indeed',    run: () => fetchIndeedJobs(keyword, loc, buildSearchCountry(region), distance), pick: r => r?.items || [] });
  }
  return sources;
}

async function fetchBundesJobs(searchParams) {
  const params = buildBundesQueryParams(searchParams);
  const url = `${JOBS_API_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': BUNDES_API_KEY,
        Accept: 'application/json'
      },
      method: 'GET'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // Bundesagentur v6 API returns jobs in "ergebnisliste"
    const hits = data?.ergebnisliste || data?.stelle || data?.stellenangebote || data?.jobs || (Array.isArray(data) ? data : []);

    if (!Array.isArray(hits)) {
      return null;
    }

    return {
      query: Object.fromEntries(params.entries()),
      total: data?.maxErgebnisse || hits.length,
      jobs:  hits.map((job) => extractBundesJobFields(job, searchParams))
    };
  } catch (error) {
    return null;
  }
}

async function fetchNewPlanResource(parsedUrl) {
  const type = parsedUrl.searchParams.get('type');
  const berufenetId = parsedUrl.searchParams.get('berufenetId');
  const kldbCode = parsedUrl.searchParams.get('kldbCode');
  const dkzId = parsedUrl.searchParams.get('dkzId');

  let url;
  if (type === 'berufe' && berufenetId) {
    url = `${NEWPLAN_BASE_URL}/infosysbub/dkz-rest/pc/v1/berufe/${encodeURIComponent(berufenetId)}/`;
  } else if (type === 'kldb' && kldbCode) {
    url = `${NEWPLAN_BASE_URL}/infosysbub/dkz-rest/pc/v1//kldb2010?codenr=${encodeURIComponent(kldbCode)}`;
  } else if (type === 'suggest' && dkzId && berufenetId) {
    url = `${NEWPLAN_BASE_URL}/sete/suggest/pc/v1/inspiration/gattungen/${encodeURIComponent(dkzId)}?ausgangsberufDkzId=${encodeURIComponent(berufenetId)}`;
  } else {
    return { error: 'Missing parameters for NewPlan API. Use type=berufe, type=kldb, or type=suggest.' };
  }

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': NEWPLAN_API_KEY,
        Accept: 'application/json'
      }
    });
    if (!response.ok) {
      return { error: `NewPlan API request failed with status ${response.status}` };
    }
    return await response.json();
  } catch (error) {
    return { error: 'Failed to fetch NewPlan API resource.' };
  }
}

const jobs = [
  {
    title: 'SOC Analyst',
    company: 'SecureOps GmbH',
    location: 'Berlin, Germany',
    sector: 'soc',
    board: 'LinkedIn',
    description: 'Monitor security events, investigate alerts, and support incident response.'
  },
  {
    title: 'Cloud Security Engineer',
    company: 'CyberGuard AG',
    location: 'Zurich, Switzerland',
    sector: 'cloud',
    board: 'Indeed',
    description: 'Design secure cloud infrastructure, manage IAM, and harden cloud services.'
  },
  {
    title: 'Penetration Tester',
    company: 'RedTeam Security',
    location: 'New York, United States',
    sector: 'pentest',
    board: 'LinkedIn',
    description: 'Execute pentests, report vulnerabilities, and recommend remediation.'
  },
  {
    title: 'Governance & Risk Analyst',
    company: 'TrustWave',
    location: 'Frankfurt, Germany',
    sector: 'governance',
    board: 'Indeed',
    description: 'Support risk assessments, compliance reviews, and security governance projects.'
  },
  {
    title: 'DevSecOps Engineer',
    company: 'CloudSecure US',
    location: 'Austin, United States',
    sector: 'devsecops',
    board: 'LinkedIn',
    description: 'Integrate security into CI/CD pipelines and automate testing workflows.'
  },
  {
    title: 'Cybersecurity Analyst',
    company: 'Swiss Digital Defense',
    location: 'Geneva, Switzerland',
    sector: 'soc',
    board: 'Indeed',
    description: 'Analyze security incidents, perform log review, and support defensive operations.'
  }
];

const skillGroups = [
  {
    category: 'Core cybersecurity skills',
    skills: [
      { key: 'network security', label: 'Network security' },
      { key: 'cryptography', label: 'Cryptography' },
      { key: 'incident response', label: 'Incident response' },
      { key: 'risk assessment', label: 'Risk assessment' },
      { key: 'vulnerability analysis', label: 'Vulnerability analysis' }
    ]
  },
  {
    category: 'Technical skills',
    skills: [
      { key: 'linux', label: 'Linux administration' },
      { key: 'cloud security', label: 'Cloud security' },
      { key: 'penetration testing', label: 'Penetration testing' },
      { key: 'web application security', label: 'Web application security' },
      { key: 'python', label: 'Python programming' }
    ]
  },
  {
    category: 'Career skills',
    skills: [
      { key: 'communication', label: 'Communication' },
      { key: 'teamwork', label: 'Teamwork' },
      { key: 'documentation', label: 'Technical documentation' },
      { key: 'problem solving', label: 'Problem solving' },
      { key: 'project management', label: 'Project management' }
    ]
  }
];

const roles = [
  {
    name: 'SOC Analyst',
    required: ['network security', 'incident response', 'linux', 'communication']
  },
  {
    name: 'Cloud Security Engineer',
    required: ['cloud security', 'network security', 'linux', 'documentation']
  },
  {
    name: 'Penetration Tester',
    required: ['penetration testing', 'web application security', 'python', 'linux']
  },
  {
    name: 'Cybersecurity Consultant',
    required: ['risk assessment', 'vulnerability analysis', 'communication', 'problem solving']
  }
];

// Merge the extended security taxonomy (200+ skills), de-duplicating by key so
// the base Sprint-1 skills stay first and no skill is detected twice.
(function mergeSecurityTaxonomy() {
  const seen = new Set(skillGroups.flatMap(g => g.skills.map(s => s.key)));
  SECURITY_GROUPS.forEach(group => {
    const skills = group.skills.filter(s => !seen.has(s.key));
    skills.forEach(s => seen.add(s.key));
    if (skills.length) skillGroups.push({ category: group.category, skills });
  });
  const roleNames = new Set(roles.map(r => r.name));
  SECURITY_ROLES.forEach(r => { if (!roleNames.has(r.name)) roles.push(r); });
})();

function normalize(text) {
  return text.toLowerCase().replace(/[.,;:()\-\/]/g, ' ');
}

function findSkills(text) {
  const normalized = normalize(text);
  const found = [];
  skillGroups.forEach(group => {
    group.skills.forEach(skill => {
      if (normalized.includes(skill.key)) {
        found.push(skill);
      }
    });
  });
  return found;
}

// ── Server-side PDF text extraction (no external deps) ───────────────────
function decodePdfStr(s) {
  return s
    .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
}

function pullTextFromStream(streamStr, out) {
  const btEt = /BT([\s\S]*?)ET/g;
  let m;
  while ((m = btEt.exec(streamStr)) !== null) {
    const block = m[1];
    // Tj operator: (string) Tj
    const tj = /\(([^)]*)\)\s*(?:Tj|'|")/g;
    let t;
    while ((t = tj.exec(block)) !== null) {
      const txt = decodePdfStr(t[1]).trim();
      if (txt) out.push(txt);
    }
    // TJ operator: [(string)(string)...] TJ
    const tjArr = /\[([^\]]*)\]\s*TJ/g;
    while ((t = tjArr.exec(block)) !== null) {
      const parts = [];
      const sp = /\(([^)]*)\)/g;
      let s;
      while ((s = sp.exec(t[1])) !== null) {
        const txt = decodePdfStr(s[1]);
        if (txt.trim()) parts.push(txt);
      }
      if (parts.length) out.push(parts.join(''));
    }
  }
}

async function extractPdfText(buffer) {
  // Tentative 1 : pdf-parse (gère UTF-16, CMap, PDFs modernes)
  if (pdfParse) {
    try {
      const data = await pdfParse(buffer);
      if (data.text && data.text.trim().length > 20) {
        return data.text.trim();
      }
    } catch (_) {}
  }

  // Tentative 2 : extraction manuelle BT/ET (PDFs simples)
  const chunks = [];
  const raw = buffer.toString('binary');
  pullTextFromStream(raw, chunks);

  const streamRe = /(?:FlateDecode)[^\n]*\nstream\r?\n([\s\S]*?)endstream/g;
  let m;
  while ((m = streamRe.exec(raw)) !== null) {
    try {
      const compressed   = Buffer.from(m[1], 'binary');
      const decompressed = zlib.inflateSync(compressed).toString('latin1');
      pullTextFromStream(decompressed, chunks);
    } catch (_) {}
  }

  if (chunks.length > 0) {
    return chunks.join(' ').replace(/\s{2,}/g, ' ').trim();
  }

  // Fallback : ASCII brut
  return buffer.toString('latin1')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .split(/\n|\r/)
    .map(l => l.trim())
    .filter(l => l.length > 3)
    .join('\n')
    .replace(/[ \t]{3,}/g, '  ')
    .trim();
}

function analyzeRoles(foundKeys) {
  return roles
    .map(role => {
      const missing = role.required.filter(skill => !foundKeys.includes(skill));
      return {
        name: role.name,
        matched: role.required.length - missing.length,
        total: role.required.length,
        missing,
        score: (role.required.length - missing.length) / role.required.length
      };
    })
    .filter(role => role.score >= 0.4)
    .sort((a, b) => b.score - a.score);
}

function jobMatchesProfile(job, profileText) {
  if (!profileText) return true;
  const normalizedProfile = normalize(profileText);
  const profileSkills = findSkills(profileText).map(skill => skill.key);
  const combinedJobText = [job.title, job.company, job.location, job.description, job.sector, job.board]
    .filter(Boolean)
    .join(' ').toLowerCase();

  if (profileSkills.length > 0) {
    return profileSkills.some(skill => combinedJobText.includes(skill));
  }

  return normalizedProfile.split(' ').some(token => token && combinedJobText.includes(token));
}

// Matcher scoring: weighted 6-criteria score (skills/role/location/remote/
// seniority/salary) with a transparent breakdown — see scorer.js.
function scoreJob(job, analysis) {
  const profile = {
    skills: (analysis.foundSkills || []).map(s => s.key),
    targetRoles: (analysis.roles || []).slice(0, 1).map(r => r.name),
  };
  const jobText = normalize([job.title, job.description, job.sector, job.board, job.company].filter(Boolean).join(' '));
  const jobSkillKeys = findSkills(jobText).map(s => s.key);
  const r = Scorer.scoreJob(job, profile, jobSkillKeys);
  return { score: r.score, breakdown: r.breakdown };
}

// Dependency bundle injected into the agent layer (server/agents.js).
function buildAgentDeps() {
  // Resolve a skill key → { key, label, category } over the full taxonomy so
  // gap recommendations carry a human label and a category fallback resource.
  const skillIndex = new Map();
  skillGroups.forEach(g => g.skills.forEach(s => {
    if (!skillIndex.has(s.key)) skillIndex.set(s.key, { key: s.key, label: s.label, category: g.category });
  }));
  const lookup = key => skillIndex.get(String(key).toLowerCase()) || { key, label: key, category: '' };

  return {
    findSkills,
    analyzeRoles,
    allSkills: () => skillGroups.flatMap(g => g.skills),
    scoreJob,
    recommend: roles => SecurityLearning.recommendGaps(roles, { lookup }),
  };
}

function filterJobs(region, sector, profileText = '') {
  return jobs.filter(job => {
    const regionMatch = region === 'all' ||
      (region === 'germany' && job.location.includes('Germany')) ||
      (region === 'switzerland' && job.location.includes('Switzerland')) ||
      (region === 'usa' && job.location.includes('United States'));

    const sectorMatch = sector === 'all' || job.sector === sector;
    const profileMatch = jobMatchesProfile(job, profileText);

    return regionMatch && sectorMatch && profileMatch;
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function serveStaticFile(req, res) {
  const filePath = req.url === '/' ? '/index.html' : req.url;
  const resolvedPath = path.join(publicDir, filePath);
  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const map = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json'
    };

    res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (parsedUrl.pathname === '/api/status' && req.method === 'GET') {
    sendJson(res, 200, { status: 'ok', backend: 'local', auth: 'optional' });
    return;
  }

  if (parsedUrl.pathname === '/api/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name, username, password } = JSON.parse(body || '{}');
        if (!name || !username || !password) {
          sendJson(res, 400, { error: 'Name, username, and password are required' });
          return;
        }

        if (getUser(username)) {
          sendJson(res, 409, { error: 'Username already exists' });
          return;
        }

        saveUser(username, password, name);
        const token = createToken(username);
        sendJson(res, 200, { token, user: { name, username } });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid request payload' });
      }
    });
    return;
  }

  if (parsedUrl.pathname === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body || '{}');
        const user = getUser(username);
        if (!user || !verifyPassword(password, user.password)) {
          sendJson(res, 401, { error: 'Invalid username or password' });
          return;
        }
        const token = createToken(user.username);
        sendJson(res, 200, { token, user: { name: user.name, username: user.username } });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid request payload' });
      }
    });
    return;
  }

  if (parsedUrl.pathname === '/api/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { text } = JSON.parse(body || '{}');
        const foundSkills = findSkills(text || '');
        const foundKeys = foundSkills.map(skill => skill.key);
        const allSkills = skillGroups.flatMap(group => group.skills);
        const missingSkills = allSkills.filter(skill => !foundKeys.includes(skill.key));
        const roles = analyzeRoles(foundKeys);
        const recommendations = buildAgentDeps().recommend(roles);
        sendJson(res, 200, { foundSkills, missingSkills, roles, recommendations });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid request payload' });
      }
    });
    return;
  }

  // ── AI capability status (so the UI shows/hides AI buttons) ──────────────
  if (parsedUrl.pathname === '/api/ai-status' && req.method === 'GET') {
    sendJson(res, 200, { llm: llm.isAvailable(), provider: llm.provider(), email: email.isAvailable() });
    return;
  }

  // ── Multi-agent architecture: registry (transparency) ────────────────────
  if (parsedUrl.pathname === '/api/agents' && req.method === 'GET') {
    sendJson(res, 200, { agents: agents.AGENT_REGISTRY });
    return;
  }

  // ── Multi-agent pipeline: Scout → Matcher with status log & error isolation
  if (parsedUrl.pathname === '/api/pipeline' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { cvText, jobs: jobList } = JSON.parse(body || '{}');
        const result = await agents.runPipeline({ cvText: cvText || '', jobs: jobList || [] }, buildAgentDeps());
        sendJson(res, 200, result);
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid request payload' });
      }
    });
    return;
  }

  // ── Writer Agent: AI cover letter (Claude) with template fallback ────────
  if (parsedUrl.pathname === '/api/generate-cover' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { jobTitle, company, name, skills, cvText } = JSON.parse(body || '{}');
        if (!llm.isAvailable()) { sendJson(res, 200, { ok: false, source: 'template' }); return; }
        const system = 'You are a professional career coach. Write a concise, compelling one-page cover letter. '
          + 'Use ONLY information provided; do not invent facts, employers or qualifications. '
          + 'Match the language of the CV/role (German or English).';
        const user = `Write a cover letter for this application.\n\n`
          + `Position: ${jobTitle || '[role]'}\nCompany: ${company || '[company]'}\n`
          + `Candidate name: ${name || '[name]'}\nKey skills to highlight: ${skills || '(infer from CV)'}\n\n`
          + `CV / background:\n${(cvText || '').slice(0, 6000) || '(none provided)'}\n\n`
          + `Return only the letter text (subject line, greeting, 3-4 paragraphs, sign-off).`;
        const text = await llm.chat({ system, user, maxTokens: 1400, temperature: 0.6 });
        sendJson(res, 200, { ok: true, source: 'ai', provider: llm.provider(), text });
      } catch (error) {
        sendJson(res, 200, { ok: false, source: 'template', error: String(error.message || error) });
      }
    });
    return;
  }

  // ── AI learning roadmap from skill gaps (Claude) ─────────────────────────
  if (parsedUrl.pathname === '/api/generate-roadmap' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { missingSkills, targetRole, foundSkills } = JSON.parse(body || '{}');
        if (!llm.isAvailable()) { sendJson(res, 200, { ok: false, source: 'template' }); return; }
        const miss = Array.isArray(missingSkills) ? missingSkills.join(', ') : (missingSkills || '');
        const have = Array.isArray(foundSkills) ? foundSkills.join(', ') : (foundSkills || '');
        const system = 'You are a senior IT-Security mentor. Produce a concrete, realistic learning roadmap '
          + 'to close skill gaps for a target role. Be specific: order skills by priority, suggest free '
          + 'resources (TryHackMe, HackTheBox, official docs), hands-on labs, and a rough time estimate per item. '
          + 'Keep it actionable and under ~400 words.';
        const user = `Target role: ${targetRole || 'IT Security professional'}\n`
          + `Skills already present: ${have || '(none detected)'}\n`
          + `Missing skills to acquire: ${miss || '(none)'}\n\n`
          + `Return a prioritized roadmap as a numbered list, each item: skill — why it matters — how to learn it — est. time.`;
        const text = await llm.chat({ system, user, maxTokens: 1200, temperature: 0.5 });
        sendJson(res, 200, { ok: true, source: 'ai', provider: llm.provider(), text });
      } catch (error) {
        sendJson(res, 200, { ok: false, source: 'template', error: String(error.message || error) });
      }
    });
    return;
  }

  // ── Writer Agent: AI CV tailoring (Claude) with template fallback ────────
  if (parsedUrl.pathname === '/api/generate-cv' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { cvText, targetRole, foundSkills } = JSON.parse(body || '{}');
        if (!llm.isAvailable()) { sendJson(res, 200, { ok: false, source: 'template' }); return; }
        if (!cvText || !cvText.trim()) { sendJson(res, 400, { error: 'CV text is required' }); return; }
        const skills = Array.isArray(foundSkills) ? foundSkills.join(', ') : (foundSkills || '');
        const system = 'You are a professional CV editor. Rewrite the candidate CV into a clean, well-structured, '
          + 'ATS-friendly CV tailored to the target role. Use ONLY information present in the source CV — '
          + 'never invent employers, dates, degrees or skills. Keep the candidate\'s language (German or English). '
          + 'Output plain text with clear section headers (Profile, Skills, Experience, Education, Languages).';
        const user = `Target role: ${targetRole || '(general)'}\n`
          + `Detected skills to emphasise: ${skills || '(infer from CV)'}\n\n`
          + `Source CV:\n${cvText.slice(0, 8000)}\n\n`
          + `Return only the rewritten CV as plain text.`;
        const text = await llm.chat({ system, user, maxTokens: 2000, temperature: 0.4 });
        sendJson(res, 200, { ok: true, source: 'ai', provider: llm.provider(), text });
      } catch (error) {
        sendJson(res, 200, { ok: false, source: 'template', error: String(error.message || error) });
      }
    });
    return;
  }

  // ── Auto email notification: high-match jobs (Resend) ────────────────────
  if (parsedUrl.pathname === '/api/notify-jobs' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { to, jobs } = JSON.parse(body || '{}');
        if (!to) { sendJson(res, 400, { error: 'Recipient email is required' }); return; }
        if (!Array.isArray(jobs) || jobs.length === 0) { sendJson(res, 200, { ok: false, reason: 'no-jobs' }); return; }
        if (!email.isAvailable()) { sendJson(res, 200, { ok: false, fallback: 'mailto' }); return; }
        const lines = jobs.slice(0, 15).map((j, i) =>
          `${i + 1}. ${j.title || 'Job'} — ${j.company || ''} (${Math.round((j.score || 0) * 100)}% match)`
          + (j.url ? `\n   ${j.url}` : '')
        ).join('\n\n');
        const subject = `CyberCareer: ${jobs.length} new high-match job${jobs.length > 1 ? 's' : ''} (>=70%)`;
        const text = `Hi,\n\nCyberCareer found ${jobs.length} job(s) matching your profile at 70% or higher:\n\n`
          + `${lines}\n\nOpen the app to generate a tailored CV and cover letter.\n\n— CyberCareer`;
        await email.sendEmail({ to, subject, text });
        sendJson(res, 200, { ok: true, sent: true, count: jobs.length });
      } catch (error) {
        sendJson(res, 200, { ok: false, fallback: 'mailto', error: String(error.message || error) });
      }
    });
    return;
  }

  // ── Email notification / send application (Resend) with mailto fallback ──
  if (parsedUrl.pathname === '/api/send-email' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { to, subject, text } = JSON.parse(body || '{}');
        if (!to || !subject) { sendJson(res, 400, { error: 'Recipient and subject are required' }); return; }
        if (!email.isAvailable()) { sendJson(res, 200, { ok: false, fallback: 'mailto' }); return; }
        const result = await email.sendEmail({ to, subject, text: text || '' });
        sendJson(res, 200, { ok: true, sent: true, id: result && result.id });
      } catch (error) {
        sendJson(res, 200, { ok: false, fallback: 'mailto', error: String(error.message || error) });
      }
    });
    return;
  }

  if (parsedUrl.pathname === '/api/profile' && req.method === 'POST') {
    const token = getToken(req);
    if (!token) {
      sendJson(res, 401, { error: 'Authorization required to save profile' });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { profile } = JSON.parse(body || '{}');
        if (!profile || typeof profile !== 'string') {
          sendJson(res, 400, { error: 'Profile text is required' });
          return;
        }

        saveProfileText(token, profile.trim());
        sendJson(res, 200, { status: 'ok', profileSaved: true });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid request payload' });
      }
    });
    return;
  }

  if (parsedUrl.pathname === '/api/jobs' && req.method === 'GET') {
    // Job search is public — no login required
    const token = getToken(req);
    const profileText = token ? getProfileText(token) : '';
    const region   = parsedUrl.searchParams.get('region')   || 'germany';
    const sector   = parsedUrl.searchParams.get('sector')   || 'all';
    const platform = parsedUrl.searchParams.get('platform') || 'bundesagentur';
    const distance = parsedUrl.searchParams.get('distance') || 'all';
    const location = buildSearchLocation(parsedUrl.searchParams);
    const keyword  = buildSearchKeyword(parsedUrl.searchParams);

    let jobs = [];
    let source = 'fallback';
    let platformBreakdown = {};

    if (platform === 'all') {
      // Run every configured source in parallel, then cross-source dedup.
      // Free sources always run; key/token-gated ones only when configured.
      const sources = buildAllPlatformSources({
        searchParams: parsedUrl.searchParams,
        keyword, location, region, distance
      });
      const settled = await Promise.allSettled(sources.map(s => s.run()));

      platformBreakdown = {};
      let merged = [];
      settled.forEach((s, i) => {
        const items = s.status === 'fulfilled' ? sources[i].pick(s.value) : [];
        platformBreakdown[sources[i].key] = items.length;
        merged = merged.concat(items);
      });

      // Fuzzy cross-source dedup: merges near-duplicates and records `also_on`.
      jobs = dedupeJobs(merged);
      source = 'all-platforms';

    } else if (platform === 'bundesagentur') {
      const result = await fetchBundesJobs(parsedUrl.searchParams);
      jobs   = result?.jobs || [];
      source = 'bundesagentur';

    } else if (platform === 'arbeitnow') {
      jobs   = await fetchArbeitnowJobs(keyword);
      source = 'arbeitnow';

    } else if (platform === 'remotive') {
      jobs   = await fetchRemotiveJobs(keyword);
      source = 'remotive';

    } else if (platform === 'linkedin') {
      jobs   = await fetchLinkedInJobs(keyword, location || 'Germany');
      source = 'linkedin';

    } else if (platform === 'indeed') {
      jobs   = await fetchIndeedRssJobs(keyword, location);
      source = 'indeed';

    } else if (platform === 'stepstone') {
      jobs   = await fetchStepstoneJobs(keyword, location || 'Deutschland');
      source = 'stepstone';

    } else if (platform === 'apify-indeed') {
      if (APIFY_TOKEN) {
        const result = await fetchIndeedJobs(keyword, location || 'Germany', buildSearchCountry(region), distance);
        jobs   = result?.items || [];
      }
      source = 'apify-indeed';

    } else if (platform === 'apify-stepstone') {
      if (APIFY_TOKEN) {
        const result = await fetchApifyJobs(keyword, location || 'Deutschland', distance);
        jobs   = result?.items || [];
      }
      source = 'apify-stepstone';

    } else if (platform === 'jooble') {
      const result = await fetchJoobleJobs(keyword, location || 'Germany', distance);
      jobs   = result?.items || [];
      source = 'jooble';

    } else if (platform === 'adzuna') {
      const result = await fetchAdzunaJobs(keyword, location || 'Germany', region);
      jobs   = result?.items || [];
      source = 'adzuna';
    }

    // Fallback to static data ONLY when no platform is specifically chosen
    if (jobs.length === 0 && source === 'fallback') {
      jobs = filterJobs(region, sector, profileText);
    }

    if (distance && distance !== 'all' && location) {
      jobs = await filterJobsByDistance(jobs, location, distance);
    }

    if (profileText && jobs.length > 0) {
      jobs = jobs.filter(job => jobMatchesProfile(job, profileText));
    }

    sendJson(res, 200, { jobs, source, platformBreakdown, profileUsed: !!profileText, query: { region, sector, platform, distance, location } });
    return;
  }

  if (parsedUrl.pathname === '/api/apify-job-search' && req.method === 'POST') {
    const token = getToken(req);
    if (!token) {
      sendJson(res, 401, { error: 'Authorization required for Apify job search' });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { keyword, location, radius } = JSON.parse(body || '{}');
        if (!keyword || !location) {
          sendJson(res, 400, { error: 'keyword and location are required' });
          return;
        }

        const apifyResult = await fetchApifyJobs(keyword, location);
        if (!apifyResult) {
          sendJson(res, 502, { error: 'Apify request failed or returned no data' });
          return;
        }

        const filteredItems = await filterJobsByDistance(apifyResult.items, location, radius);
        sendJson(res, 200, {
          source: 'apify',
          keyword,
          location,
          radius: radius || 'all',
          result: { ...apifyResult, items: filteredItems }
        });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid request payload' });
      }
    });
    return;
  }

  if (parsedUrl.pathname === '/api/apify-indeed-search' && req.method === 'POST') {
    const token = getToken(req);
    if (!token) {
      sendJson(res, 401, { error: 'Authorization required for Apify Indeed search' });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        let { keyword, location, country, radius } = JSON.parse(body || '{}');
        if (!keyword) keyword = 'IT Security';
        if (!location) location = 'Germany';
        if (!country) country = 'de';

        const apifyResult = await fetchIndeedJobs(keyword, location, country);
        if (!apifyResult) {
          sendJson(res, 502, { error: 'Apify Indeed request failed or returned no data' });
          return;
        }

        const filteredItems = await filterJobsByDistance(apifyResult.items, location, radius);
        sendJson(res, 200, {
          source: 'apify-indeed',
          keyword,
          location,
          country,
          radius: radius || 'all',
          result: { ...apifyResult, items: filteredItems }
        });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid request payload' });
      }
    });
    return;
  }

  if (parsedUrl.pathname === '/api/jooble-search' && req.method === 'POST') {
    const token = getToken(req);
    if (!token) {
      sendJson(res, 401, { error: 'Authorization required for Jooble search' });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { keyword, location, radius } = JSON.parse(body || '{}');
        const joobleResult = await fetchJoobleJobs(keyword, location, radius);
        if (!joobleResult) {
          sendJson(res, 502, { error: 'Jooble request failed or returned no data' });
          return;
        }

        const filteredItems = await filterJobsByDistance(joobleResult.items, location, radius);
        sendJson(res, 200, {
          source: 'jooble',
          keyword,
          location,
          radius: radius || 'all',
          result: { ...joobleResult, items: filteredItems }
        });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid request payload' });
      }
    });
    return;
  }

  // ── Admin DB viewer ──────────────────────────────────────────────────────
  if (parsedUrl.pathname === '/api/admin/db' && req.method === 'GET') {
    const username = validateToken(getToken(req));
    if (!username) { sendJson(res, 401, { error: 'Login required' }); return; }
    const now = Date.now();
    const users = Object.entries(storage.users || {}).map(([u, d]) => ({
      username: u, name: d.name, passwordHashed: d.password?.includes(':')
    }));
    const activeSessions = Object.values(storage.tokens || {}).filter(t => t.expires > now).length;
    const applications   = Object.entries(storage.applications || {}).map(([u, apps]) => ({
      user: u, count: apps.length, apps: apps.map(a => ({ title: a.title, company: a.company, status: a.status }))
    }));
    sendJson(res, 200, {
      users,
      totalUsers:       users.length,
      activeSessions,
      expiredTokens:    Object.values(storage.tokens || {}).filter(t => t.expires <= now).length,
      applicationUsers: applications.length,
      applications
    });
    return;
  }

  // ── Server-side PDF parsing ──────────────────────────────────────────────
  if (parsedUrl.pathname === '/api/parse-pdf' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { pdf } = JSON.parse(body || '{}');
        if (!pdf) { sendJson(res, 400, { error: 'pdf base64 string required' }); return; }
        const buffer = Buffer.from(pdf, 'base64');
        const text = await extractPdfText(buffer);
        if (!text || text.length < 10) {
          sendJson(res, 422, { error: 'No readable text found in PDF. Please paste your CV manually.' });
          return;
        }
        sendJson(res, 200, { text });
      } catch (e) {
        sendJson(res, 400, { error: 'PDF parse failed: ' + e.message });
      }
    });
    return;
  }

  // ── Scrape-All endpoint ──────────────────────────────────────────────────
  if (parsedUrl.pathname === '/api/scrape-all' && req.method === 'POST') {
    // Scrape-all is public — no login required to search jobs

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { keyword, location, region, sector, distance } = JSON.parse(body || '{}');
        const searchLocation = location || (region === 'germany' ? 'Germany' : region === 'switzerland' ? 'Switzerland' : 'United States');
        const searchDist     = distance || 'all';

        // Build searchParams for Bundesagentur helper (includes keyword + location)
        const sp = new URLSearchParams({ region: region || 'germany', sector: sector || 'all', keyword: keyword || '', location: searchLocation });
        const searchKeyword  = buildSearchKeyword(sp);

        // Free sources always run; Adzuna + Apify (StepStone/Indeed) are added
        // only when their key/token is configured (see buildAllPlatformSources).
        const sources = buildAllPlatformSources({
          searchParams: sp,
          keyword: searchKeyword,
          location: searchLocation,
          region: region || 'germany',
          distance: searchDist
        });
        const settled = await Promise.allSettled(sources.map(s => s.run()));

        const platformBreakdown = {};
        let merged = [];
        settled.forEach((s, i) => {
          const items = s.status === 'fulfilled' ? sources[i].pick(s.value) : [];
          platformBreakdown[sources[i].key] = items.length;
          merged = merged.concat(items);
        });

        // Fuzzy cross-source dedup: merges near-duplicates and records `also_on`.
        const jobs = dedupeJobs(merged);

        sendJson(res, 200, { jobs, platformBreakdown, source: 'all-platforms', total: jobs.length });
      } catch (err) {
        sendJson(res, 500, { error: 'Scrape-all failed', detail: err.message });
      }
    });
    return;
  }

  // ── Applications (Tracker Agent) ────────────────────────────────────────
  if (parsedUrl.pathname === '/api/applications' && req.method === 'GET') {
    const username = validateToken(getToken(req));
    if (!username) { sendJson(res, 401, { error: 'Authorization required' }); return; }
    const apps = storage.applications[username] || [];
    sendJson(res, 200, { applications: apps });
    return;
  }

  if (parsedUrl.pathname === '/api/applications' && req.method === 'POST') {
    const username = validateToken(getToken(req));
    if (!username) { sendJson(res, 401, { error: 'Authorization required' }); return; }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const app = JSON.parse(body || '{}');
        if (!app.title || !app.company) { sendJson(res, 400, { error: 'title and company are required' }); return; }
        if (!storage.applications[username]) storage.applications[username] = [];
        const existing = storage.applications[username].find(a => a.id === app.id);
        if (!existing) {
          storage.applications[username].push({ ...app, status: app.status || 'applied' });
        }
        saveStorage();
        sendJson(res, 200, { applications: storage.applications[username] });
      } catch (_) { sendJson(res, 400, { error: 'Invalid request payload' }); }
    });
    return;
  }

  if (parsedUrl.pathname.startsWith('/api/applications/') && req.method === 'PUT') {
    const username = validateToken(getToken(req));
    if (!username) { sendJson(res, 401, { error: 'Authorization required' }); return; }
    const id = parsedUrl.pathname.slice('/api/applications/'.length);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const updates = JSON.parse(body || '{}');
        if (!storage.applications[username]) { sendJson(res, 404, { error: 'Not found' }); return; }
        storage.applications[username] = storage.applications[username].map(a =>
          a.id === id ? { ...a, ...updates } : a
        );
        saveStorage();
        sendJson(res, 200, { applications: storage.applications[username] });
      } catch (_) { sendJson(res, 400, { error: 'Invalid request payload' }); }
    });
    return;
  }

  if (parsedUrl.pathname.startsWith('/api/applications/') && req.method === 'DELETE') {
    const username = validateToken(getToken(req));
    if (!username) { sendJson(res, 401, { error: 'Authorization required' }); return; }
    const id = parsedUrl.pathname.slice('/api/applications/'.length);
    if (storage.applications[username]) {
      storage.applications[username] = storage.applications[username].filter(a => a.id !== id);
      saveStorage();
    }
    sendJson(res, 200, { applications: storage.applications[username] || [] });
    return;
  }

  if (parsedUrl.pathname === '/api/newplan' && req.method === 'GET') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Authorization required for NewPlan access' });
      return;
    }

    const result = await fetchNewPlanResource(parsedUrl);
    if (result && result.error) {
      sendJson(res, 400, result);
      return;
    }

    sendJson(res, 200, result);
    return;
  }

  serveStaticFile(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('API available at /api/status, /api/analyze, /api/jobs');
});
