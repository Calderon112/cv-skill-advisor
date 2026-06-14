/**
 * linkedin.js — Public LinkedIn job listings (no auth required).
 *
 * Uses the guest search endpoint that LinkedIn exposes for unauthenticated
 * visitors. Returns HTML which we parse with regex.
 *
 * Anti-bot measures applied:
 *   • Realistic browser User-Agent (rotated per request)
 *   • Accept / Accept-Language / Referer headers
 *   • 300–700 ms polite delay before each request
 */

const { browserHeaders, stripHtml, sleep, maxPerSource } = require('./utils');

const GUEST_URL = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
const PAGE_SIZE = 25;   // LinkedIn returns ~25 cards per "start" offset
const MAX_START = 975;  // LinkedIn hard-stops guest paging around 1000 results

/** Parse one HTML page of LinkedIn job cards into normalized jobs. */
function parsePage(html, location) {
  const jobs = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/g;
  let m;
  while ((m = liRe.exec(html)) !== null) {
    const card    = m[1];
    const title   = (card.match(/class="[^"]*base-search-card__title[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/h3>/) || [])[1];
    const company = (card.match(/class="[^"]*base-search-card__subtitle[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/[ha]>/) || [])[1];
    const loc     = (card.match(/class="[^"]*job-search-card__location[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/span>/) || [])[1];
    const date    = (card.match(/datetime="([^"]+)"/) || [])[1];
    const jobUrl  = (card.match(/href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^?"]+)/) || [])[1];

    const t = stripHtml(title || '').trim();
    const c = stripHtml(company || '').trim();
    if (!t || !c) continue;

    jobs.push({
      platform:      'LinkedIn',
      source:        'linkedin',
      title:         t,
      company:       c,
      location:      stripHtml(loc || '').trim() || location || 'Germany',
      description:   'Full description available on LinkedIn.',
      jobUrl:        jobUrl || null,
      publishedDate: date || null,
      board:         'LinkedIn',
      remote:        false,
      jobType:       null,
      salary:        null
    });
  }
  return jobs;
}

async function fetch_({ keyword, location, maxPerSource: mps } = {}) {
  const cap = maxPerSource({ maxPerSource: mps });
  const out = [];
  try {
    for (let start = 0; out.length < cap && start <= MAX_START; start += PAGE_SIZE) {
      const params = new URLSearchParams({
        keywords: keyword || '',
        location: location || 'Germany',
        f_TPR:    'r604800',    // last 7 days
        start:    String(start)
      });

      await sleep(300 + Math.random() * 400);   // polite delay (anti-bot)

      const r = await fetch(`${GUEST_URL}?${params}`, {
        headers: browserHeaders('https://www.linkedin.com/jobs/search/', false)
      });
      if (!r.ok) break;
      const pageJobs = parsePage(await r.text(), location);
      if (!pageJobs.length) break;               // no more results
      out.push(...pageJobs);
      if (pageJobs.length < 10) break;           // near the end of results
    }
  } catch (err) {
    console.warn('[linkedin] fetch failed:', err.message);
  }
  return out.slice(0, cap);
}

module.exports = { fetch: fetch_ };
