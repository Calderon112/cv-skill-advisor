/**
 * report.js — Market-trend report (ported from KPK sprint3).
 *
 * Aggregates a list of scraped jobs into demand / location / remote / salary
 * stats and (when an LLM key is configured) a short natural-language summary.
 */
'use strict';

const llm = require('./llm.js');

function city(loc) {
  if (!loc) return '';
  return String(loc).split(/[,/(]/)[0].trim();
}

function topN(counter, n) {
  return Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

// Pull numbers out of a free-text salary like "50.000–70.000 EUR".
function parseSalary(str) {
  if (!str) return { min: null, max: null };
  const nums = String(str).replace(/[.\s]/g, '').match(/\d{4,6}/g);
  if (!nums || !nums.length) return { min: null, max: null };
  const vals = nums.map(Number).sort((a, b) => a - b);
  return { min: vals[0], max: vals[vals.length - 1] };
}

/**
 * @param {Array} jobs  scraped jobs [{ title, company, location, description, remote, salary }]
 * @param {object} deps { findSkills(text)->[{label}], stripHtml? }
 * @returns {Promise<object>} aggregated report incl. summary
 */
async function buildReport(jobs, deps, query) {
  jobs = Array.isArray(jobs) ? jobs : [];
  const total = jobs.length;
  const skills = {}, companies = {}, locations = {}, remote = {};
  const salLo = [], salHi = [];

  jobs.forEach(j => {
    const text = `${j.title || ''} ${j.description || ''}`;
    (deps.findSkills ? deps.findSkills(text) : []).forEach(s => {
      const k = s.label || s.key || s;
      skills[k] = (skills[k] || 0) + 1;
    });
    if (j.company) companies[j.company] = (companies[j.company] || 0) + 1;
    const c = city(j.location);
    if (c) locations[c] = (locations[c] || 0) + 1;
    const rt = j.remote_type || (j.remote ? 'remote' : 'on-site');
    remote[String(rt).toLowerCase()] = (remote[String(rt).toLowerCase()] || 0) + 1;
    const sal = parseSalary(j.salary);
    if (sal.min) salLo.push(sal.min);
    if (sal.max) salHi.push(sal.max);
  });

  let salary = null;
  if (salLo.length || salHi.length) {
    const lows = salLo.slice().sort((a, b) => a - b);
    const highs = salHi.slice().sort((a, b) => a - b);
    salary = {
      count: salLo.length + salHi.length,
      min: lows.length ? lows[0] : null,
      max: highs.length ? highs[highs.length - 1] : null,
      median_low: lows.length ? lows[Math.floor(lows.length / 2)] : null,
      median_high: highs.length ? highs[Math.floor(highs.length / 2)] : null,
    };
  }

  const report = {
    query: query || null,
    total_jobs: total,
    top_skills: topN(skills, 12),
    top_companies: topN(companies, 8),
    top_locations: topN(locations, 8),
    remote_split: remote,
    salary,
  };
  report.summary = await makeSummary(report, query);
  return report;
}

async function makeSummary(report, query) {
  if (!report.total_jobs) return 'No jobs to analyze yet.';
  const topSkills = report.top_skills.slice(0, 5).map(s => s.name).join(', ');
  const templ = topSkills
    ? `${report.total_jobs} jobs analyzed. Most requested skills: ${topSkills}.`
    : `${report.total_jobs} jobs analyzed.`;

  if (!llm.isAvailable()) return templ;

  const facts = `Jobs: ${report.total_jobs}. `
    + `Top skills: ${report.top_skills.slice(0, 8).map(s => `${s.name} (${s.count})`).join(', ')}. `
    + `Top locations: ${report.top_locations.slice(0, 5).map(l => `${l.name} (${l.count})`).join(', ')}. `
    + `Remote split: ${JSON.stringify(report.remote_split)}. `
    + `Salary: ${JSON.stringify(report.salary)}.`;
  try {
    const text = await llm.chat({
      system: 'You are a job-market analyst. 2-3 sentences, concrete, no fluff. Plain text only — no markdown.',
      user: `Summarize this job-market snapshot${query ? ' for ' + query : ''}:\n${facts}`,
      maxTokens: 200,
      temperature: 0.3,
    });
    return (text || templ).trim();
  } catch (_) {
    return templ;
  }
}

module.exports = { buildReport };
