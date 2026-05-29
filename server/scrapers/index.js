/**
 * scrapers/index.js — Aggregator that runs all scrapers in parallel.
 *
 * Deduplicates results by (normalised title + company).
 * Each individual scraper is isolated: if one fails, others still return.
 */

const bundesagentur = require('./bundesagentur');
const arbeitnow     = require('./arbeitnow');
const linkedin      = require('./linkedin');
const remotive      = require('./remotive');

/**
 * Run all scrapers concurrently and merge their results.
 * @param {object} opts - { keyword, sector, location, region }
 * @returns {{ jobs: object[], breakdown: object }}
 */
async function scrapeAll(opts = {}) {
  const [bRes, aRes, lRes, rRes] = await Promise.allSettled([
    bundesagentur.fetch(opts),
    arbeitnow.fetch(opts),
    linkedin.fetch(opts),
    remotive.fetch(opts)
  ]);

  const bJobs = bRes.status === 'fulfilled' ? (bRes.value || []) : [];
  const aJobs = aRes.status === 'fulfilled' ? (aRes.value || []) : [];
  const lJobs = lRes.status === 'fulfilled' ? (lRes.value || []) : [];
  const rJobs = rRes.status === 'fulfilled' ? (rRes.value || []) : [];

  const breakdown = {
    Bundesagentur: bJobs.length,
    Arbeitnow:     aJobs.length,
    LinkedIn:      lJobs.length,
    Remotive:      rJobs.length
  };

  // Deduplicate by lower-cased "title|company"
  const seen = new Set();
  const jobs = [...bJobs, ...aJobs, ...lJobs, ...rJobs].filter(job => {
    const key = `${String(job.title || '').toLowerCase().trim()}|${String(job.company || '').toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { jobs, breakdown, total: jobs.length };
}

module.exports = { scrapeAll, bundesagentur, arbeitnow, linkedin, remotive };
