/**
 * arbeitnow.js — Free public job board API (Germany-focused, tech-heavy).
 *
 * API: https://www.arbeitnow.com/api/job-board-api
 * No key required. Returns up to 100 jobs per page.
 * Supports ?search=keyword for server-side filtering.
 */

const { browserHeaders, stripHtml } = require('./utils');

const API_URL = 'https://www.arbeitnow.com/api/job-board-api';

async function fetch_({ keyword } = {}) {
  try {
    const url = keyword
      ? `${API_URL}?search=${encodeURIComponent(keyword)}`
      : `${API_URL}?page=1`;

    const r = await fetch(url, {
      headers: browserHeaders('https://www.arbeitnow.com', true)
    });
    if (!r.ok) return [];
    const data = await r.json();
    const jobs = data.data || [];

    // Client-side filter when search param is not supported
    const kw = (keyword || '').toLowerCase();
    const filtered = kw && jobs.length === (data.data || []).length
      ? jobs.filter(j =>
          j.title?.toLowerCase().includes(kw) ||
          (j.tags || []).some(t => t.toLowerCase().includes(kw))
        )
      : jobs;

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
      salary:        null
    }));
  } catch (err) {
    console.warn('[arbeitnow] fetch failed:', err.message);
    return [];
  }
}

module.exports = { fetch: fetch_ };
