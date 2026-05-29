/**
 * routes/jobs.js — GET /api/jobs
 *
 * Public endpoint — no auth required.
 * Delegates to the appropriate scraper based on the ?platform= param.
 * Falls back to a small set of static sample jobs if all scrapers fail.
 */

const scrapers  = require('../scrapers');
const analysis  = require('../analysis');
const authLib   = require('../auth');
const storage   = require('../storage');

// Small static fallback for when no scraper returns data
const STATIC_JOBS = [
  { platform: 'Demo', source: 'static', title: 'SOC Analyst', company: 'SecureOps GmbH', location: 'Berlin, Germany', sector: 'cybersecurity', board: 'Demo', description: 'Monitor security events, investigate alerts, and support incident response.', jobUrl: null, publishedDate: null, remote: false, jobType: 'full-time', salary: null },
  { platform: 'Demo', source: 'static', title: 'Cloud Security Engineer', company: 'CyberGuard AG', location: 'Zurich, Switzerland', sector: 'cybersecurity', board: 'Demo', description: 'Design secure cloud infrastructure, manage IAM, and harden cloud services.', jobUrl: null, publishedDate: null, remote: false, jobType: 'full-time', salary: null },
  { platform: 'Demo', source: 'static', title: 'Penetration Tester', company: 'RedTeam Security', location: 'Frankfurt, Germany', sector: 'cybersecurity', board: 'Demo', description: 'Execute pentests, report vulnerabilities, and recommend remediation.', jobUrl: null, publishedDate: null, remote: false, jobType: 'full-time', salary: null }
];

async function handle(req, res, send, parsedUrl) {
  const params   = parsedUrl.searchParams;
  const platform = params.get('platform') || 'all';
  const keyword  = params.get('keyword')  || '';
  const sector   = params.get('sector')   || 'all';
  const region   = params.get('region')   || 'germany';
  const location = params.get('location') || '';
  const distance = params.get('distance') || 'all';

  // Optional: filter by saved CV profile
  const token       = authLib.extractToken(req);
  const profileText = token ? storage.getProfile(token) : '';

  const opts = { keyword, sector, region, location };

  let jobs        = [];
  let source      = 'fallback';
  let breakdown   = null;

  if (platform === 'all') {
    const result  = await scrapers.scrapeAll(opts);
    jobs          = result.jobs;
    breakdown     = result.breakdown;
    source        = 'all-platforms';
  } else if (platform === 'bundesagentur') {
    jobs   = await scrapers.bundesagentur.fetch(opts);
    source = 'bundesagentur';
  } else if (platform === 'arbeitnow') {
    jobs   = await scrapers.arbeitnow.fetch(opts);
    source = 'arbeitnow';
  } else if (platform === 'linkedin') {
    jobs   = await scrapers.linkedin.fetch(opts);
    source = 'linkedin';
  } else if (platform === 'remotive') {
    jobs   = await scrapers.remotive.fetch(opts);
    source = 'remotive';
  }

  // Fallback to static sample data
  if (jobs.length === 0 && source !== 'all-platforms') {
    jobs   = STATIC_JOBS;
    source = 'fallback';
  }

  // Filter by saved profile when present
  if (profileText && jobs.length > 0) {
    jobs = jobs.filter(j => analysis.jobMatchesProfile(j, profileText));
  }

  send(res, 200, { jobs, source, breakdown, profileUsed: !!profileText, query: Object.fromEntries(params) });
}

module.exports = { handle };
