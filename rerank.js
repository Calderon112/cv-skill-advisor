/**
 * rerank.js — Outcome-based re-ranking (ported from KPK sprint3).
 *
 * Learns from applications that got a positive response (interview / offer in the
 * Tracker) and boosts jobs that share skills with those past successes — up to
 * +8 points on the 0-100 score. "This kind of role got you interviews → similar
 * ones rank higher."
 *
 * UMD: works server-side (require) and in the browser (window.Rerank).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Rerank = api;
})(typeof self !== 'undefined' ? self : this, function () {
  // Tracker statuses that indicate a positive employer response.
  const POSITIVE = new Set(['interview', 'offer']);
  const MAX_BOOST = 8;

  /**
   * Aggregate skills/titles from applications that got a positive response.
   * @param {Array} apps        tracker applications [{ status, title, notes }]
   * @param {Function} detectKeys (text) => string[]  skill keys found in text
   */
  function successSignal(apps, detectKeys) {
    const positive = (apps || []).filter(a => POSITIVE.has(a.status));
    const skills = {};
    const titles = [];
    positive.forEach(a => {
      const keys = detectKeys ? detectKeys(`${a.title || ''} ${a.notes || ''}`) : [];
      keys.forEach(k => { const key = String(k).toLowerCase(); skills[key] = (skills[key] || 0) + 1; });
      if (a.title) titles.push(a.title);
    });
    return { count: positive.length, skills, titles: titles.slice(0, 8) };
  }

  /** Bonus points for a job sharing skills with past successful applications. */
  function boostFor(jobSkillKeys, signal) {
    if (!signal || !signal.count) return { points: 0, matched: [] };
    const set = new Set((jobSkillKeys || []).map(s => String(s).toLowerCase()));
    const matched = Object.keys(signal.skills).filter(k => set.has(k)).sort();
    const points = Math.min(MAX_BOOST, matched.length * 2);
    return { points: Math.round(points * 10) / 10, matched };
  }

  function summary(signal) {
    if (!signal || !signal.count) return '';
    const top = Object.entries(signal.skills).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
    return `${signal.count} past application(s) got responses; common skills: ${top.join(', ')}.`;
  }

  return { successSignal, boostFor, summary, POSITIVE: [...POSITIVE], MAX_BOOST };
});
