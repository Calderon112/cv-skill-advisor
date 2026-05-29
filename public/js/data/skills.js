/**
 * data/skills.js — Skill groups, roles, and learning suggestions.
 * Mirrors server/analysis.js for offline / no-server-response fallback.
 */

export const SKILL_GROUPS = [
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
      { key: 'linux',                    label: 'Linux administration' },
      { key: 'cloud security',           label: 'Cloud security' },
      { key: 'penetration testing',      label: 'Penetration testing' },
      { key: 'web application security', label: 'Web application security' },
      { key: 'python',                   label: 'Python programming' }
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

export const ROLES = [
  { name: 'SOC Analyst',              required: ['network security', 'incident response', 'linux', 'communication'] },
  { name: 'Cloud Security Engineer',  required: ['cloud security', 'network security', 'linux', 'documentation'] },
  { name: 'Penetration Tester',       required: ['penetration testing', 'web application security', 'python', 'linux'] },
  { name: 'Cybersecurity Consultant', required: ['risk assessment', 'vulnerability analysis', 'communication', 'problem solving'] }
];

export const SUGGESTIONS = {
  'network security':       'Study firewalls, VPNs, IDS/IPS, and secure networking fundamentals.',
  cryptography:             'Learn symmetric/asymmetric encryption, hashing, and digital signatures.',
  'incident response':      'Practice investigation, containment, and recovery workflows.',
  'risk assessment':        'Understand ISO 27005 or NIST RMF frameworks.',
  'vulnerability analysis': 'Use vulnerability scanners and manual pentesting techniques.',
  linux:                    'Use Linux for administration and security tooling regularly.',
  'cloud security':         'Explore AWS/Azure/GCP security controls and cloud architecture.',
  'penetration testing':    'Practice on TryHackMe, Hack The Box, or open-source labs.',
  'web application security':'Study OWASP Top 10 and secure web application design.',
  python:                   'Write automation scripts for log analysis and security tooling.',
  communication:            'Practise explaining findings to non-technical stakeholders.',
  teamwork:                 'Collaborate on projects using agile practices.',
  documentation:            'Document procedures, findings, and improvement plans.',
  'problem solving':        'Solve CTF challenges and scenario-based exercises.',
  'project management':     'Track tasks, deadlines, and priorities for security projects.'
};

// ── Local analysis (used as offline fallback) ─────────────────────────────

function normalize(text) {
  return text.toLowerCase().replace(/[.,;:()\-/]/g, ' ');
}

export function findSkillsLocal(text) {
  const norm = normalize(text);
  return SKILL_GROUPS.flatMap(g => g.skills).filter(s => norm.includes(s.key));
}

export function analyzeRolesLocal(foundKeys) {
  return ROLES
    .map(role => {
      const missing = role.required.filter(k => !foundKeys.includes(k));
      const score   = (role.required.length - missing.length) / role.required.length;
      return { name: role.name, matched: role.required.length - missing.length, total: role.required.length, missing, score };
    })
    .filter(r => r.score >= 0.4)
    .sort((a, b) => b.score - a.score);
}

export function analyzeLocal(text) {
  const foundSkills   = findSkillsLocal(text);
  const foundKeys     = foundSkills.map(s => s.key);
  const allSkills     = SKILL_GROUPS.flatMap(g => g.skills);
  const missingSkills = allSkills.filter(s => !foundKeys.includes(s.key));
  return { foundSkills, missingSkills, roles: analyzeRolesLocal(foundKeys) };
}
