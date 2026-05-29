/**
 * analysis.js — CV skill detection and role-fit scoring.
 *
 * Pure functions: no I/O, no side effects.
 * The same skill data is mirrored in public/js/data/skills.js for offline use.
 */

const SKILL_GROUPS = [
  {
    category: 'Core cybersecurity',
    skills: [
      { key: 'network security',       label: 'Network security' },
      { key: 'cryptography',           label: 'Cryptography' },
      { key: 'incident response',      label: 'Incident response' },
      { key: 'risk assessment',        label: 'Risk assessment' },
      { key: 'vulnerability analysis', label: 'Vulnerability analysis' }
    ]
  },
  {
    category: 'Technical',
    skills: [
      { key: 'linux',                     label: 'Linux administration' },
      { key: 'cloud security',            label: 'Cloud security' },
      { key: 'penetration testing',       label: 'Penetration testing' },
      { key: 'web application security',  label: 'Web application security' },
      { key: 'python',                    label: 'Python programming' }
    ]
  },
  {
    category: 'Career',
    skills: [
      { key: 'communication',      label: 'Communication' },
      { key: 'teamwork',           label: 'Teamwork' },
      { key: 'documentation',      label: 'Technical documentation' },
      { key: 'problem solving',    label: 'Problem solving' },
      { key: 'project management', label: 'Project management' }
    ]
  }
];

const ROLES = [
  { name: 'SOC Analyst',              required: ['network security', 'incident response', 'linux', 'communication'] },
  { name: 'Cloud Security Engineer',  required: ['cloud security', 'network security', 'linux', 'documentation'] },
  { name: 'Penetration Tester',       required: ['penetration testing', 'web application security', 'python', 'linux'] },
  { name: 'Cybersecurity Consultant', required: ['risk assessment', 'vulnerability analysis', 'communication', 'problem solving'] }
];

// ── Helpers ───────────────────────────────────────────────────────────────

function normalize(text) {
  return text.toLowerCase().replace(/[.,;:()\-/]/g, ' ');
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Finds which tracked skills appear in a CV text.
 * @returns {Array<{key, label}>}
 */
function findSkills(text) {
  const norm  = normalize(text);
  const found = [];
  SKILL_GROUPS.forEach(g => g.skills.forEach(s => {
    if (norm.includes(s.key)) found.push(s);
  }));
  return found;
}

/**
 * Returns role-fit analysis for the given found skill keys.
 * Only roles with a score >= 0.4 are returned (sorted best-first).
 */
function analyzeRoles(foundKeys) {
  return ROLES
    .map(role => {
      const missing = role.required.filter(k => !foundKeys.includes(k));
      const score   = (role.required.length - missing.length) / role.required.length;
      return { name: role.name, matched: role.required.length - missing.length, total: role.required.length, missing, score };
    })
    .filter(r => r.score >= 0.4)
    .sort((a, b) => b.score - a.score);
}

/**
 * Full CV analysis: skills found, skills missing, matching roles.
 */
function analyzeCV(text) {
  const foundSkills  = findSkills(text);
  const foundKeys    = foundSkills.map(s => s.key);
  const allSkills    = SKILL_GROUPS.flatMap(g => g.skills);
  const missingSkills = allSkills.filter(s => !foundKeys.includes(s.key));
  const roles        = analyzeRoles(foundKeys);
  return { foundSkills, missingSkills, roles };
}

/**
 * Check whether a job description overlaps with the user's profile text.
 * Used to filter job results by profile relevance.
 */
function jobMatchesProfile(job, profileText) {
  if (!profileText) return true;
  const profileSkills  = findSkills(profileText).map(s => s.key);
  const combinedJobText = normalize([job.title, job.company, job.location, job.description, job.sector].filter(Boolean).join(' '));
  if (profileSkills.length > 0) return profileSkills.some(k => combinedJobText.includes(k));
  return normalize(profileText).split(' ').some(t => t && combinedJobText.includes(t));
}

module.exports = { SKILL_GROUPS, ROLES, normalize, findSkills, analyzeRoles, analyzeCV, jobMatchesProfile };
