/**
 * arbeitnow.js — Free public job board API (Germany-focused, tech-heavy).
 *
 * API: https://www.arbeitnow.com/api/job-board-api
 * No key required. Returns up to 100 jobs per page.
 * Supports ?search=keyword for server-side filtering.
 */

const { browserHeaders, stripHtml, sleep, maxPerSource } = require('./utils');

const API_URL = 'https://www.arbeitnow.com/api/job-board-api';

function normalizeJob(j) {
  return {
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
    salary:        null
  };
}

async function fetch_({ keyword, maxPerSource: mps } = {}) {
  const cap = maxPerSource({ maxPerSource: mps });
  const kw  = (keyword || '').toLowerCase();
  const out = [];
  try {
    for (let page = 1; out.length < cap; page++) {
      const url = `${API_URL}?page=${page}` + (keyword ? `&search=${encodeURIComponent(keyword)}` : '');
      const r = await fetch(url, { headers: browserHeaders('https://www.arbeitnow.com', true) });
      if (!r.ok) break;
      const data = await r.json();
      const jobs = data.data || [];
      if (!jobs.length) break;

      // Client-side filter as a safety net when the API ignores ?search
      const filtered = kw
        ? jobs.filter(j =>
            j.title?.toLowerCase().includes(kw) ||
            (j.tags || []).some(t => t.toLowerCase().includes(kw)))
        : jobs;
      out.push(...filtered.map(normalizeJob));

      const lastPage = Number(data?.meta?.last_page) || 0;
      if (lastPage && page >= lastPage) break;     // no more pages
      if (jobs.length < 100) break;                // short page = last page
      await sleep(150 + Math.random() * 150);      // polite anti-quota delay
    }
  } catch (err) {
    console.warn('[arbeitnow] fetch failed:', err.message);
  }
  return out.slice(0, cap);
}

module.exports = { fetch: fetch_ };
