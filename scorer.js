/**
 * scorer.js — Weighted, deterministic job scoring with a transparent breakdown.
 *
 * Ported from the KPK matching engine. Produces a 0..1 score plus a per-component
 * breakdown so the UI can explain *why* a job ranks where it does. Measured against
 * the JOB's requirements, so adding skills/experience can only ever raise a score.
 *
 * UMD: works server-side (require) and in the browser (window.Scorer).
 *
 * Component weights (sum = 100):
 *   skills 45 · role 20 · location 10 · remote 10 · seniority 10 · salary 5
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Scorer = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const WEIGHTS = { skills: 45, role: 20, location: 10, remote: 10, seniority: 10, salary: 5 };

  const tokens = (t) => new Set(String(t || '').toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter((x) => x.length > 1));

  function scoreSkills(profileKeys, jobKeys) {
    const prof = new Set((profileKeys || []).map((s) => String(s).toLowerCase()));
    const job = (jobKeys || []).map((s) => String(s).toLowerCase());
    const jobSet = new Set(job);
    const matched = [...jobSet].filter((k) => prof.has(k));
    const missing = [...jobSet].filter((k) => !prof.has(k));
    let frac;
    if (jobSet.size) frac = matched.length / jobSet.size;
    else if (prof.size) frac = 0.5; // candidate has skills, job lists none to match
    else frac = 0.6;                // no signal either way
    return { frac, matched, missing };
  }

  function scoreRole(targetRoles, title) {
    if (!targetRoles || !targetRoles.length) return 0.6;
    const titleTokens = tokens(title);
    for (const role of targetRoles) {
      const rt = tokens(role);
      if (!rt.size) continue;
      const overlap = [...rt].filter((t) => titleTokens.has(t));
      if (overlap.length && overlap.length / rt.size >= 0.5) return 1.0;
    }
    return 0.0;
  }

  function scoreLocation(profileLoc, jobLoc, remoteType) {
    if (remoteType && /remote/i.test(remoteType)) return 1.0;
    if (!profileLoc) return 0.6;
    const p = tokens(profileLoc), j = tokens(jobLoc);
    return [...p].some((t) => j.has(t)) ? 1.0 : 0.2;
  }

  function scoreRemote(preferred, remoteType) {
    if (!preferred) return 0.6;
    if (!remoteType) return 0.5;
    const pref = preferred.toLowerCase(), rt = remoteType.toLowerCase();
    if (pref.includes(rt) || rt.includes(pref)) return 1.0;
    if (pref === 'hybrid' && (rt === 'remote' || rt === 'on-site')) return 0.7;
    return 0.3;
  }

  const LEVEL_YEARS = { intern: 0, internship: 0, praktikum: 0, junior: 1, entry: 1, einsteiger: 1,
    mid: 3, intermediate: 3, professional: 3, senior: 6, lead: 8, principal: 10, staff: 9 };

  function inferLevel(text) {
    if (!text) return null;
    const low = text.toLowerCase();
    for (const kw in LEVEL_YEARS) if (low.includes(kw)) return LEVEL_YEARS[kw];
    return null;
  }

  function scoreSeniority(years, job) {
    const target = inferLevel(`${job.experience_level || ''} ${job.title || ''}`);
    if (target === null) return 0.6;
    const diff = Math.abs((years || 0) - target);
    if (diff <= 1) return 1.0;
    if (diff <= 3) return 0.6;
    return 0.25;
  }

  function scoreSalary(minSalary, job) {
    if (!minSalary) return 0.6;
    const ref = job.salary_max || job.salary_min;
    if (!ref) return 0.5;
    if (ref >= minSalary) return 1.0;
    return Math.max(0.1, ref / minSalary);
  }

  /**
   * @param {object} job      { title, description, location, remote_type, experience_level, salary_min/max }
   * @param {object} profile  { skills:[keys], targetRoles:[], location, preferredRemote, experienceYears, minSalary }
   * @param {string[]} jobSkillKeys  skill keys detected in the job (provided by caller)
   * @returns {{score:number, score100:number, breakdown:object}}
   */
  function scoreJob(job, profile, jobSkillKeys) {
    profile = profile || {};
    const remoteType = job.remote_type || (job.remote ? 'remote' : '') || '';

    const sk = scoreSkills(profile.skills || [], jobSkillKeys || []);
    const components = {
      skills: sk.frac,
      role: scoreRole(profile.targetRoles || [], job.title || ''),
      location: scoreLocation(profile.location || '', job.location || '', remoteType),
      remote: scoreRemote(profile.preferredRemote || '', remoteType),
      seniority: scoreSeniority(profile.experienceYears || 0, job),
      salary: scoreSalary(profile.minSalary, job),
    };

    const points = {};
    let total = 0;
    for (const k in WEIGHTS) { points[k] = Math.round(components[k] * WEIGHTS[k] * 10) / 10; total += points[k]; }
    total = Math.round(total * 10) / 10;

    return {
      score: Math.round((total / 100) * 1000) / 1000,
      score100: total,
      breakdown: { points, weights: WEIGHTS, skillsMatched: sk.matched, skillsMissing: sk.missing },
    };
  }

  return { scoreJob, WEIGHTS };
});
