/**
 * remotive.js — Free remote jobs API (worldwide, no key required).
 *
 * API: https://remotive.com/api/remote-jobs
 * Supports ?search=keyword&limit=N
 * Returns salary info where available.
 */

const { browserHeaders, stripHtml, maxPerSource } = require('./utils');

const API_URL = 'https://remotive.com/api/remote-jobs';

async function fetch_({ keyword, maxPerSource: mps } = {}) {
  try {
    const params = new URLSearchParams({ limit: String(maxPerSource({ maxPerSource: mps })) });
    if (keyword) params.set('search', keyword);

    const r = await fetch(`${API_URL}?${params}`, {
      headers: browserHeaders('https://remotive.com', true)
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.jobs || []).map(j => ({
      platform:      'Remotive',
      source:        'remotive',
      title:         j.title,
      company:       j.company_name,
      location:      j.candidate_required_location || 'Remote (worldwide)',
      description:   stripHtml(j.description).slice(0, 400),
      jobUrl:        j.url || null,
      publishedDate: j.publication_date?.slice(0, 10) || null,
      sector:        j.category || null,
      board:         'Remotive',
      remote:        true,
      jobType:       j.job_type || null,
      salary:        j.salary || null
    }));
  } catch (err) {
    console.warn('[remotive] fetch failed:', err.message);
    return [];
  }
}

module.exports = { fetch: fetch_ };
