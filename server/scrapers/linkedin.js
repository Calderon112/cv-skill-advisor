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

const { browserHeaders, stripHtml, sleep } = require('./utils');

const GUEST_URL = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';

async function fetch_({ keyword, location } = {}) {
  try {
    const params = new URLSearchParams({
      keywords: keyword || '',
      location: location || 'Germany',
      f_TPR:    'r604800',    // last 7 days
      start:    '0'
    });

    await sleep(300 + Math.random() * 400);

    const r = await fetch(`${GUEST_URL}?${params}`, {
      headers: browserHeaders('https://www.linkedin.com/jobs/search/', false)
    });
    if (!r.ok) return [];
    const html = await r.text();
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
  } catch (err) {
    console.warn('[linkedin] fetch failed:', err.message);
    return [];
  }
}

module.exports = { fetch: fetch_ };
