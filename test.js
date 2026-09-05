/**
 * CyberCareer — Sprint 1 Test Suite
 * Run: node tests/test.js
 * No external test framework needed — pure Node.js
 */

const zlib   = require('zlib');
const crypto = require('crypto');
const agents = require('./server/agents.js');
const reasoning = require('./server/reasoning.js');
const employment = require('./server/employment.js');
const explainer = require('./server/score-explainer.js');
const cvSchema = require('./server/cv-schema.js');
const experience = require('./server/experience.js');
const Scorer = require('./scorer.js');
const dedup  = require('./server/dedup.js');
const rerank = require('./rerank.js');
const { buildReport } = require('./server/report.js');
const SecurityLearning = require('./security-learning.js');
const embeddings = require('./server/embeddings.js');
const graph = require('./server/graph.js');
const skillMatcher = require('./skill-matcher.js');
const { SECURITY_GROUPS } = require('./security-skills.js');

// ── Colour helpers ────────────────────────────────────────────────────────
const c = {
  green:  s => `\x1b[32m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
};

// ── Mini test runner ──────────────────────────────────────────────────────
let passed = 0, failed = 0, skipped = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    results.push({ status: 'pass', name });
    process.stdout.write(c.green('  ✓ ') + c.dim(name) + '\n');
  } catch (err) {
    failed++;
    results.push({ status: 'fail', name, error: err.message });
    process.stdout.write(c.red('  ✗ ') + name + '\n');
    process.stdout.write(c.red('    → ') + err.message + '\n');
  }
}

function skip(name) {
  skipped++;
  results.push({ status: 'skip', name });
  process.stdout.write(c.yellow('  ⊘ ') + c.dim(name) + ' (skipped)\n');
}

function section(name) {
  console.log('\n' + c.bold(c.cyan('▸ ' + name)));
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label || 'assertEqual'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(arr, item, label) {
  if (!arr.includes(item)) {
    throw new Error(`${label || 'assertIncludes'}: expected array to include ${JSON.stringify(item)}, got [${arr.join(', ')}]`);
  }
}

// ── Copy only the pure functions from server.js (no I/O, no network) ─────

// --- normalize & findSkills ---
const skillGroups = [
  { category: 'Core cybersecurity skills', skills: [
    { key: 'network security',       label: 'Network security' },
    { key: 'cryptography',           label: 'Cryptography' },
    { key: 'incident response',      label: 'Incident response' },
    { key: 'risk assessment',        label: 'Risk assessment' },
    { key: 'vulnerability analysis', label: 'Vulnerability analysis' },
  ]},
  { category: 'Technical skills', skills: [
    { key: 'linux',                     label: 'Linux administration' },
    { key: 'cloud security',            label: 'Cloud security' },
    { key: 'penetration testing',       label: 'Penetration testing' },
    { key: 'web application security',  label: 'Web application security' },
    { key: 'python',                    label: 'Python programming' },
  ]},
  { category: 'Career skills', skills: [
    { key: 'communication',      label: 'Communication' },
    { key: 'teamwork',           label: 'Teamwork' },
    { key: 'documentation',      label: 'Technical documentation' },
    { key: 'problem solving',    label: 'Problem solving' },
    { key: 'project management', label: 'Project management' },
  ]},
];

const roles = [
  { name: 'SOC Analyst',              required: ['network security', 'incident response', 'linux', 'communication'] },
  { name: 'Cloud Security Engineer',  required: ['cloud security', 'network security', 'linux', 'documentation'] },
  { name: 'Penetration Tester',       required: ['penetration testing', 'web application security', 'python', 'linux'] },
  { name: 'Cybersecurity Consultant', required: ['risk assessment', 'vulnerability analysis', 'communication', 'problem solving'] },
];

// Exercise the real matcher rather than a copy of it.
const normalize = skillMatcher.normalize;
const findSkills = (text) => skillMatcher.findSkills(text, skillGroups);

function analyzeRoles(foundKeys) {
  return roles
    .map(role => {
      const missing = role.required.filter(s => !foundKeys.includes(s));
      return {
        name:    role.name,
        matched: role.required.length - missing.length,
        total:   role.required.length,
        missing,
        score:   (role.required.length - missing.length) / role.required.length,
      };
    })
    .filter(r => r.score >= 0.4)
    .sort((a, b) => b.score - a.score);
}

function hashPassword(plaintext) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plaintext, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(plaintext, stored) {
  if (!stored.includes(':')) return stored === plaintext;
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(plaintext, salt, 32).toString('hex');
  return actual === expected;
}

function decodePdfStr(s) {
  return s
    .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
}

function stripHtml(str) {
  return (str || '').replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function kwTokens(keyword) {
  return (keyword || '').toLowerCase().split(/\s+/).filter(t => t.length > 2);
}

function matchesKeyword(tokens, ...fields) {
  if (!tokens.length) return true;
  const hay = fields.map(f => (f || '').toLowerCase()).join(' ');
  return tokens.some(t => hay.includes(t));
}

function jobMatchesProfile(job, profileText) {
  if (!profileText) return true;
  const normalizedProfile = normalize(profileText);
  const profileSkills = findSkills(profileText).map(s => s.key);
  const combinedJobText = [job.title, job.company, job.location, job.description]
    .filter(Boolean).join(' ').toLowerCase();
  if (profileSkills.length > 0) return profileSkills.some(s => combinedJobText.includes(s));
  return normalizedProfile.split(' ').some(t => t && combinedJobText.includes(t));
}

// ─────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────

console.log(c.bold('\n CyberCareer — Sprint 1 Test Suite\n') + c.dim('  Running all unit tests…'));

// ── 1. normalize() ────────────────────────────────────────────────────────
section('normalize()');

test('lowercases all text', () => {
  assertEqual(normalize('Linux Administration'), 'linux administration', 'lowercase');
});

test('strips punctuation chars . , ; : ( ) - /', () => {
  const result = normalize('Python, Linux; Security: (good)-test/ok');
  assert(!result.includes(','), 'comma removed');
  assert(!result.includes(';'), 'semicolon removed');
  assert(!result.includes(':'), 'colon removed');
  assert(!result.includes('('), 'paren removed');
  assert(!result.includes('-'), 'dash removed');
  assert(!result.includes('/'), 'slash removed');
});

test('preserves spaces and alphanumeric chars', () => {
  const result = normalize('network security 2024');
  assert(result.includes('network security'), 'kept words');
  assert(result.includes('2024'), 'kept numbers');
});

// ── 2. findSkills() ───────────────────────────────────────────────────────
section('findSkills()');

test('detects single skill in plain text', () => {
  const found = findSkills('I have experience with python scripting');
  assertIncludes(found.map(s => s.key), 'python', 'python detected');
});

test('detects multiple skills', () => {
  const cv = 'I work with linux systems, network security, and penetration testing';
  const found = findSkills(cv);
  const keys  = found.map(s => s.key);
  assertIncludes(keys, 'linux',              'linux detected');
  assertIncludes(keys, 'network security',   'network security detected');
  assertIncludes(keys, 'penetration testing','penetration testing detected');
});

test('returns empty array for text with no skills', () => {
  const found = findSkills('I love cooking pasta and hiking on weekends');
  assertEqual(found.length, 0, 'no skills found');
});

// ── 2b. Matching over the full security taxonomy ──────────────────────────
const secKeys = (text) => skillMatcher.findSkills(text, SECURITY_GROUPS).map(s => s.key);

test('respects word boundaries (no substring false positives)', () => {
  // "admiNISTrateur" must not detect the NIST framework.
  const keys = secKeys('Administrateur systeme Linux, administration reseau');
  assert(!keys.includes('nist'), 'nist not detected inside "administrateur"');
});

test('detects keys whose punctuation normalize() strips', () => {
  const keys = secKeys('Experience in Cross-Site Scripting, TCP/IP and Single Sign-On');
  assertIncludes(keys, 'cross-site scripting', 'xss key reachable');
  assertIncludes(keys, 'tcp/ip',               'tcp/ip key reachable');
  assertIncludes(keys, 'single sign-on',       'sso key reachable');
});

test('detects German and French surface forms via aliases', () => {
  assertIncludes(secKeys('Erfahrung mit DSGVO'),        'gdpr', 'DSGVO → gdpr');
  assertIncludes(secKeys('Conformite au RGPD'),         'gdpr', 'RGPD → gdpr');
  assertIncludes(secKeys('Penetrationstests bei Bosch'),'penetration testing', 'Penetrationstests → pentest');
  assertIncludes(secKeys('J ai mene des pentests'),     'penetration testing', 'pentests → pentest');
});

test('log correlation counts as log analysis, never as SIEM', () => {
  const keys = secKeys('J ai fait de la correlation de logs pendant mon stage');
  assertIncludes(keys, 'log analysis', 'correlation de logs → log analysis');
  assert(!keys.includes('siem'), 'siem stays a gap: correlating logs is not SIEM tooling');
});

test('detects acronyms via aliases', () => {
  assertIncludes(secKeys('Deployed MFA and SSO with Keycloak'), 'multi-factor authentication', 'MFA');
  assertIncludes(secKeys('Hardened the WAF and reviewed XSS'),  'web application firewall',    'WAF');
});

test('is case-insensitive', () => {
  const found = findSkills('Expert in CRYPTOGRAPHY and LINUX');
  const keys  = found.map(s => s.key);
  assertIncludes(keys, 'cryptography', 'crypto uppercase');
  assertIncludes(keys, 'linux',        'linux uppercase');
});

test('handles punctuation around skills', () => {
  const found = findSkills('Skills: python, linux; incident response.');
  const keys  = found.map(s => s.key);
  assertIncludes(keys, 'python',           'python with comma');
  assertIncludes(keys, 'linux',            'linux with semicolon');
  assertIncludes(keys, 'incident response','incident response with dot');
});

test('detects all 15 skills when all present', () => {
  const allSkillText = skillGroups.flatMap(g => g.skills.map(s => s.key)).join(' ');
  const found = findSkills(allSkillText);
  assertEqual(found.length, 15, 'all 15 skills detected');
});

test('no duplicate skills in result', () => {
  const found = findSkills('python python python linux linux');
  const keys  = found.map(s => s.key);
  const unique = new Set(keys);
  assertEqual(keys.length, unique.size, 'no duplicates');
});

// ── 3. analyzeRoles() ─────────────────────────────────────────────────────
section('analyzeRoles()');

test('returns SOC Analyst when all required skills present', () => {
  const keys = ['network security', 'incident response', 'linux', 'communication'];
  const result = analyzeRoles(keys);
  assert(result.some(r => r.name === 'SOC Analyst'), 'SOC Analyst in results');
});

test('SOC Analyst has 100% score with full match', () => {
  const keys   = ['network security', 'incident response', 'linux', 'communication'];
  const result = analyzeRoles(keys);
  const soc    = result.find(r => r.name === 'SOC Analyst');
  assertEqual(soc.score, 1, 'score is 1.0');
  assertEqual(soc.matched, 4, 'matched 4/4');
  assertEqual(soc.missing.length, 0, 'no missing skills');
});

test('filters out roles below 40% match', () => {
  const keys   = ['python']; // only matches Penetration Tester 1/4 = 25%
  const result = analyzeRoles(keys);
  assert(result.every(r => r.score >= 0.4), 'all results have score >= 0.4');
});

test('results are sorted by score descending', () => {
  const keys = ['network security', 'incident response', 'linux', 'communication',
                 'penetration testing', 'web application security', 'python'];
  const result = analyzeRoles(keys);
  for (let i = 1; i < result.length; i++) {
    assert(result[i - 1].score >= result[i].score, 'scores descending');
  }
});

test('returns empty array when no skills match any role', () => {
  const result = analyzeRoles(['teamwork']); // teamwork not in any role.required
  assertEqual(result.length, 0, 'empty result');
});

test('correctly lists missing skills', () => {
  const keys   = ['network security', 'incident response', 'linux']; // missing 'communication'
  const result = analyzeRoles(keys);
  const soc    = result.find(r => r.name === 'SOC Analyst');
  assert(soc, 'SOC Analyst found (3/4 = 75%)');
  assertIncludes(soc.missing, 'communication', 'communication listed as missing');
  assertEqual(soc.missing.length, 1, 'only 1 missing skill');
});

// ── 4. hashPassword / verifyPassword ─────────────────────────────────────
section('hashPassword() / verifyPassword()');

test('hashed password verifies correctly', () => {
  const hash = hashPassword('securePass123!');
  assert(verifyPassword('securePass123!', hash), 'correct password verifies');
});

test('wrong password fails verification', () => {
  const hash = hashPassword('correctPass');
  assert(!verifyPassword('wrongPass', hash), 'wrong password rejected');
});

test('each hash is unique (different salts)', () => {
  const h1 = hashPassword('same');
  const h2 = hashPassword('same');
  assert(h1 !== h2, 'hashes differ');
});

test('hash format contains salt:hash', () => {
  const hash = hashPassword('test');
  assert(hash.includes(':'), 'contains colon separator');
  const parts = hash.split(':');
  assertEqual(parts.length, 2, 'exactly two parts');
  assert(parts[0].length > 0, 'salt non-empty');
  assert(parts[1].length > 0, 'hash non-empty');
});

test('legacy plaintext password (no colon) verifies by equality', () => {
  assert(verifyPassword('legacy123', 'legacy123'), 'legacy plaintext match');
  assert(!verifyPassword('wrong', 'legacy123'), 'legacy plaintext mismatch');
});

// ── 5. decodePdfStr() ────────────────────────────────────────────────────
section('decodePdfStr()');

test('decodes \\n to newline', () => {
  assertEqual(decodePdfStr('line1\\nline2'), 'line1\nline2', 'newline');
});

test('decodes escaped parentheses', () => {
  assertEqual(decodePdfStr('\\(hello\\)'), '(hello)', 'parens');
});

test('decodes escaped backslash', () => {
  assertEqual(decodePdfStr('path\\\\file'), 'path\\file', 'backslash');
});

test('leaves normal text untouched', () => {
  assertEqual(decodePdfStr('Hello World'), 'Hello World', 'plain text');
});

// ── 6. stripHtml() ───────────────────────────────────────────────────────
section('stripHtml()');

test('removes basic HTML tags', () => {
  const result = stripHtml('<p>Hello <strong>World</strong></p>');
  assert(!result.includes('<'), 'no < remaining');
  assert(!result.includes('>'), 'no > remaining');
  assert(result.includes('Hello'), 'text preserved');
  assert(result.includes('World'), 'inner text preserved');
});

test('collapses multiple spaces', () => {
  const result = stripHtml('<p>   hello   </p>');
  assert(!result.includes('   '), 'no triple spaces');
});

test('handles null / undefined gracefully', () => {
  assertEqual(stripHtml(null),      '', 'null → empty');
  assertEqual(stripHtml(undefined), '', 'undefined → empty');
  assertEqual(stripHtml(''),        '', 'empty → empty');
});

// ── 7. kwTokens() ────────────────────────────────────────────────────────
section('kwTokens()');

test('splits keyword into lowercase tokens', () => {
  const tokens = kwTokens('IT Security');
  assertIncludes(tokens, 'security', 'security token');
});

test('filters tokens shorter than 3 chars', () => {
  const tokens = kwTokens('IT Security AI');
  assert(!tokens.includes('it'), 'it filtered');
  assert(!tokens.includes('ai'), 'ai filtered');
  assertIncludes(tokens, 'security', 'security kept');
});

test('returns empty array for empty string', () => {
  assertEqual(kwTokens('').length, 0, 'empty');
  assertEqual(kwTokens(null).length, 0, 'null');
});

// ── 8. matchesKeyword() ──────────────────────────────────────────────────
section('matchesKeyword()');

test('returns true when any token matches', () => {
  const tokens = kwTokens('python security');
  assert(matchesKeyword(tokens, 'Python developer job'), 'python matches');
});

test('returns false when no token matches', () => {
  const tokens = kwTokens('kubernetes golang');
  assert(!matchesKeyword(tokens, 'Java Spring developer'), 'no match');
});

test('returns true when tokens array is empty (match-all)', () => {
  assert(matchesKeyword([], 'anything'), 'empty tokens = match all');
});

// ── 9. jobMatchesProfile() ───────────────────────────────────────────────
section('jobMatchesProfile()');

test('returns true when profile is empty', () => {
  const job = { title: 'SOC Analyst', company: 'Acme', location: 'Berlin', description: 'network security' };
  assert(jobMatchesProfile(job, ''), 'empty profile matches all');
});

test('matches job when profile skills appear in job text', () => {
  const job = { title: 'Penetration Tester', company: 'SecCo', location: 'Germany', description: 'python linux' };
  const profile = 'I am experienced in linux and python scripting';
  assert(jobMatchesProfile(job, profile), 'profile skills match job');
});

test('does not match job unrelated to profile', () => {
  const job = { title: 'Java Developer', company: 'Dev Inc', location: 'Munich', description: 'spring boot microservices' };
  const profile = 'Expert in network security, incident response, and linux';
  assert(!jobMatchesProfile(job, profile), 'unrelated job not matched');
});

// ── 10. Edge cases ────────────────────────────────────────────────────────
section('Edge cases & robustness');

test('findSkills on empty string returns []', () => {
  assertEqual(findSkills('').length, 0, 'empty string');
});

test('analyzeRoles on empty array returns []', () => {
  assertEqual(analyzeRoles([]).length, 0, 'empty keys');
});

test('normalize on empty string returns empty string', () => {
  assertEqual(normalize(''), '', 'empty normalize');
});

test('findSkills detects multi-word skills (web application security)', () => {
  const found = findSkills('I specialize in web application security testing');
  assertIncludes(found.map(s => s.key), 'web application security', 'multi-word skill');
});

test('score is between 0 and 1 for all roles', () => {
  const keys = ['network security', 'linux'];
  const result = analyzeRoles(keys);
  result.forEach(r => {
    assert(r.score >= 0 && r.score <= 1, `score in [0,1] for ${r.name}`);
  });
});

// ── 11. Multi-Agent Architecture (server/agents.js) ──────────────────────
// Async-aware test helper for the orchestration pipeline.
async function atest(name, fn) {
  try {
    await fn();
    passed++;
    process.stdout.write(c.green('  ✓ ') + c.dim(name) + '\n');
  } catch (err) {
    failed++;
    process.stdout.write(c.red('  ✗ ') + name + '\n' + c.red('    → ') + err.message + '\n');
  }
}

// Dependency bundle injected into the agents (mirrors server.js buildAgentDeps).
const agentDeps = {
  findSkills,
  analyzeRoles,
  allSkills: () => skillGroups.flatMap(g => g.skills),
  scoreJob: (job, analysis) => {
    const fk = analysis.foundSkills.map(s => s.key);
    const text = `${job.title || ''} ${job.description || ''}`.toLowerCase();
    const matched = fk.filter(k => text.includes(k));
    return { score: fk.length ? matched.length / fk.length : 0, breakdown: { matched } };
  },
};

// ── 11. Fuzzy cross-source deduplication (server/dedup.js) ───────────────
section('Fuzzy deduplication');

test('similarity: identical strings = 1', () => {
  assertEqual(dedup.similarity('python developer', 'python developer'), 1, 'identical');
});

test('similarity: unrelated strings are low', () => {
  assert(dedup.similarity('python developer', 'marketing manager') < 0.4, 'low similarity');
});

test('isDuplicate: merges (m/w/d) and company-form variants', () => {
  const a = { title: 'Python Developer (m/w/d)', company: 'Acme GmbH' };
  const b = { title: 'Python Developer', company: 'Acme AG' };
  assert(dedup.isDuplicate(a, b).dup, 'recognised as duplicate');
});

test('isDuplicate: keeps genuinely different jobs separate', () => {
  const a = { title: 'Python Developer', company: 'Acme' };
  const b = { title: 'Marketing Manager', company: 'Globex' };
  assert(!dedup.isDuplicate(a, b).dup, 'not a duplicate');
});

test('dedupeJobs: merges cross-source duplicates and records also_on', () => {
  const jobs = [
    { title: 'SOC Analyst (m/w/d)', company: 'SecureOps GmbH', board: 'Bundesagentur' },
    { title: 'SOC Analyst', company: 'SecureOps AG', board: 'LinkedIn' },
    { title: 'Penetration Tester', company: 'RedTeam', board: 'Remotive' },
  ];
  const out = dedup.dedupeJobs(jobs);
  assertEqual(out.length, 2, 'two unique jobs');
  assertIncludes(out[0].also_on, 'LinkedIn', 'duplicate source recorded');
});

test('dedupeJobs: handles empty input', () => {
  assertEqual(dedup.dedupeJobs([]).length, 0, 'empty');
});

// ── 12. Outcome-based re-ranking (rerank.js) ─────────────────────────────
section('Outcome-based re-ranking');

const detectKeys = (text) => findSkills(text).map(s => s.key);

test('successSignal: aggregates skills only from interview/offer apps', () => {
  const apps = [
    { status: 'interview', title: 'SOC Analyst with linux and python' },
    { status: 'offer',     title: 'Penetration tester python' },
    { status: 'applied',   title: 'Cloud security engineer' }, // ignored (not positive)
  ];
  const sig = rerank.successSignal(apps, detectKeys);
  assertEqual(sig.count, 2, 'only positive apps counted');
  assert(sig.skills['python'] >= 2, 'python aggregated from both successes');
});

test('boostFor: rewards jobs sharing skills with past successes', () => {
  const sig = rerank.successSignal(
    [{ status: 'offer', title: 'linux python network security' }], detectKeys);
  const { points, matched } = rerank.boostFor(['python', 'linux'], sig);
  assert(points > 0, 'positive boost');
  assertIncludes(matched, 'python', 'python matched');
});

test('boostFor: no signal → no boost', () => {
  const { points } = rerank.boostFor(['python'], { count: 0, skills: {} });
  assertEqual(points, 0, 'zero boost without history');
});

test('boostFor: boost is capped at MAX_BOOST', () => {
  const skills = {}; ['a','b','c','d','e','f'].forEach(k => skills[k] = 1);
  const { points } = rerank.boostFor(['a','b','c','d','e','f'], { count: 6, skills });
  assert(points <= rerank.MAX_BOOST, 'capped at MAX_BOOST');
});

(async function runAgentTests() {
  section('Multi-Agent Architecture');

  test('registry exposes exactly 4 separated agents', () => {
    const names = agents.AGENT_REGISTRY.map(a => a.name);
    assertEqual(agents.AGENT_REGISTRY.length, 4, '4 agents');
    ['Scout', 'Matcher', 'Writer', 'Tracker'].forEach(n => assertIncludes(names, n, `${n} present`));
  });

  test('Scout agent: CV → skills, gaps and roles', () => {
    const out = agents.ScoutAgent.run({ cvText: 'linux python network security communication' }, null, agentDeps);
    assert(out.foundSkills.length >= 3, 'skills detected');
    assert(Array.isArray(out.missingSkills), 'missing skills array');
    assert(out.roles.some(r => r.name === 'SOC Analyst'), 'role-fit computed');
  });

  test('Scout agent: enforces input contract (throws on bad input)', () => {
    let threw = false;
    try { agents.ScoutAgent.run({ cvText: 42 }, null, agentDeps); } catch (_) { threw = true; }
    assert(threw, 'rejects non-string cvText');
  });

  test('Matcher agent: ranks jobs by score descending', () => {
    const analysis = agents.ScoutAgent.run({ cvText: 'python linux' }, null, agentDeps);
    const jobs = [
      { id: 'a', title: 'Receptionist', description: 'front desk' },
      { id: 'b', title: 'Python Developer', description: 'python linux backend' },
    ];
    const out = agents.MatcherAgent.run({ analysis, jobs }, null, agentDeps);
    assertEqual(out.matches[0].job.id, 'b', 'best match first');
    for (let i = 1; i < out.matches.length; i++) {
      assert(out.matches[i - 1].score >= out.matches[i].score, 'scores descending');
    }
  });

  test('Matcher agent: enforces contract (throws without analysis)', () => {
    let threw = false;
    try { agents.MatcherAgent.run({ jobs: [] }, null, agentDeps); } catch (_) { threw = true; }
    assert(threw, 'requires Scout analysis');
  });

  test('Writer agent: degrades gracefully when no writer configured', async () => {
    const out = await agents.WriterAgent.run({ profile: { name: 'X' }, job: {} }, null, {});
    assertEqual(out.generated, false, 'no document but no crash');
  });

  test('Tracker agent: CRUD via injected store', () => {
    const db = [];
    const store = {
      list: () => db,
      add: (a) => { const item = { id: '1', ...a }; db.push(item); return item; },
      update: (id, u) => Object.assign(db.find(x => x.id === id), u),
      remove: (id) => { const i = db.findIndex(x => x.id === id); if (i >= 0) db.splice(i, 1); },
    };
    agents.TrackerAgent.run({ action: 'add', payload: { title: 'SOC' } }, null, { store });
    const listed = agents.TrackerAgent.run({ action: 'list' }, null, { store });
    assertEqual(listed.applications.length, 1, 'application added & listed');
  });

  test('Tracker agent: rejects unknown action', () => {
    let threw = false;
    try { agents.TrackerAgent.run({ action: 'explode' }, null, { store: {} }); } catch (_) { threw = true; }
    assert(threw, 'unknown action throws');
  });

  await atest('Pipeline: Scout → Matcher communicate via shared context', async () => {
    const result = await agents.runPipeline(
      { cvText: 'python linux network security', jobs: [{ id: 'j', title: 'Python Dev', description: 'python linux' }] },
      agentDeps
    );
    assert(result.analysis && result.analysis.foundSkills.length > 0, 'Scout output present');
    assert(result.matching && result.matching.matches.length === 1, 'Matcher received jobs');
    assert(result.agentLog.some(l => l.agent === 'Scout' && l.status === 'done'), 'status log records Scout');
    assertEqual(result.ok, true, 'pipeline ok');
  });

  await atest('Pipeline: isolates a failing agent (no crash, error logged)', async () => {
    const brokenDeps = { ...agentDeps, findSkills: () => { throw new Error('boom'); } };
    const result = await agents.runPipeline({ cvText: 'x', jobs: [] }, brokenDeps);
    assertEqual(result.analysis, null, 'failed Scout returns null');
    assertEqual(result.matching, null, 'downstream Matcher skipped');
    assert(result.errors.length === 1, 'error captured');
    assertEqual(result.ok, false, 'pipeline reports failure without throwing');
  });

  // ───────────────────────────────────────────────────────────────────────
  // Skill-Gap Recommendations (Sprint-2 feature: concrete "learn Y" advice)
  // ───────────────────────────────────────────────────────────────────────
  section('Deliberation coverage — the model runs on every pass');

  {
    const CV = [
      'BERUFSERFAHRUNG', '02.2023 - 09.2023', 'Praktikum Softwareentwicklung',
      'Muster GmbH, Essen', 'Entwicklung von Webanwendungen im agilen Team.',
      '', 'Kenntnisse: Python, Linux, Wireshark.',
    ].join('\n');

    const baseDeps = {
      findSkills: () => [{ key: 'python', label: 'Python' }],
      analyzeRoles: () => [{ name: 'SOC Analyst', missing: [] }],
      allSkills: () => [{ key: 'python', label: 'Python' }],
      scoreJob: (j) => ({ score: j.s, breakdown: {} }),
      recommend: () => [],
    };
    const yearsLlm = (years, evidence) => ({
      isAvailable: () => true,
      chat: async ({ system }) => (/PROFESSIONAL experience/.test(system)
        ? JSON.stringify({ years, evidence }) : '[]'),
    });
    const scoutReason = (llm) => agents.ScoutAgent.reason(
      agents.ScoutAgent.run({ cvText: CV }, null, baseDeps), { cvText: CV },
      { ...baseDeps, reasoning, llm });

    await atest('Scout consults the model even when the dates already parsed', async () => {
      const r = await scoutReason(yearsLlm(0.6, 'Praktikum Softwareentwicklung'));
      assertEqual(r.yearsOpinion, 0.6, 'the model was asked and answered');
    });

    await atest('a disagreeing model does not change the number that is scored', async () => {
      // experienceYears feeds the match score. A figure that varies run to run makes
      // the same CV score differently against the same posting, which is the one
      // property the product sells.
      const r = await scoutReason(yearsLlm(4, 'Praktikum Softwareentwicklung'));
      assertEqual(r.experienceYears, 0.6, 'the computed value still stands');
      assertEqual(r.yearsOpinion, 4, 'the disagreement is recorded, not discarded');
      assert(/disagree/.test(r.experienceSource), 'and it is visible in the source');
    });

    await atest('an opinion quoting something absent from the CV is dropped entirely', async () => {
      const r = await scoutReason(yearsLlm(4, 'drei Jahre im SOC bei Siemens'));
      assertEqual(r.yearsOpinion, null, 'no evidence, no opinion');
      assertEqual(r.experienceYears, 0.6, 'and nothing downstream moved');
    });

    // The Matcher's cap is a budget, not a design limit: one model call per posting.
    {
      const jobs = Array.from({ length: 12 }, (_, i) => ({ title: 'Job ' + i, s: 1 - i / 100, description: 'x'.repeat(200) }));
      const withCap = (topN) => {
        let calls = 0;
        const deps = {
          scoreJob: (j) => ({ score: j.s, breakdown: {} }),
          llm: { isAvailable: () => true },
          reasoning: {
            ADJUDICATE_TOP_N: () => topN,
            ADJUDICATE_CONCURRENCY: 4,
            adjudicate: async () => { calls++; return { verdict: 'ok', blockers: [], reason: '' }; },
          },
        };
        return { deps, calls: () => calls };
      };

      await atest('cap 0 judges every match, not just the head', async () => {
        const { deps, calls } = withCap(0);
        const base = agents.MatcherAgent.run({ analysis: { foundKeys: [] }, jobs }, null, deps);
        const r = await agents.MatcherAgent.reason(base, { analysis: { foundKeys: [] } }, deps);
        assertEqual(calls(), 12, 'one call per posting');
        assertEqual(r.adjudicated, 12, 'and all of them reported as judged');
      });

      await atest('a cap below the result count still stops there', async () => {
        const { deps, calls } = withCap(5);
        const base = agents.MatcherAgent.run({ analysis: { foundKeys: [] }, jobs }, null, deps);
        await agents.MatcherAgent.reason(base, { analysis: { foundKeys: [] } }, deps);
        assertEqual(calls(), 5, 'the budget is respected');
      });
    }

    test('GRAPH_ADJUDICATE_TOP_N is read at call time, not at import', () => {
      const before = process.env.GRAPH_ADJUDICATE_TOP_N;
      process.env.GRAPH_ADJUDICATE_TOP_N = '7';
      assertEqual(reasoning.ADJUDICATE_TOP_N(), 7, 'a value set after require still applies');
      process.env.GRAPH_ADJUDICATE_TOP_N = 'nonsense';
      assertEqual(reasoning.ADJUDICATE_TOP_N(), 25, 'an unparseable value falls back to the default');
      if (before === undefined) delete process.env.GRAPH_ADJUDICATE_TOP_N;
      else process.env.GRAPH_ADJUDICATE_TOP_N = before;
    });
  }

  section('Experience — seniority had been reading a value nobody set');

  // scorer.js gives seniority 10 of its 100 points and reads profile.experienceYears.
  // scoreJob() never supplied it, so every candidate was scored as having none.
  {
    const NOW = new Date('2026-08-24T00:00:00Z');
    const years = (text) => experience.deriveExperienceYears(text, NOW);

    const STUDENT = [
      'BERUFSERFAHRUNG',
      '02.2023 - 09.2023', 'Praktikum Softwareentwicklung', 'Beispiel Suarl, Douala',
      '',
      'AUSBILDUNG',
      '05.2025 - heute', 'M.Sc. Internet-Sicherheit', 'Westfaelische Hochschule GE',
      '09.2017 - 02.2021', 'B.Sc. Computer Science', 'Uni Beispiel | Note: 3,4',
      '06.2021 - 01.2024', 'Deutsch A1-C1', 'Sprachlerninstitut Bafoussam',
    ].join('\n');

    test('a study period is not work experience', () => {
      // Seven months of internship. Counting the education block as well would
      // report nine years and present a student as a senior hire.
      assertEqual(years(STUDENT), 0.6, 'only the internship counts');
    });

    test('consecutive roles add up', () => {
      const cv = '01.2021 - heute\nIT-Security Analyst\nMuster GmbH\n\n03.2018 - 12.2020\nSysadmin\nAndere GmbH';
      assert(years(cv) > 8 && years(cv) < 8.5, `about 8.3 years, got ${years(cv)}`);
    });

    test('overlapping roles are counted once', () => {
      // Two jobs held in the same year are one year of experience, not two.
      assertEqual(years('01.2022 - 12.2022 Analyst\n06.2022 - 12.2022 Berater'), 0.9, 'merged, not summed');
    });

    test('an open range runs to today', () => {
      assert(years('05.2025 - heute\nIT-Security Analyst\nMuster GmbH') > 1, 'heute resolves to now');
    });

    test('month names are understood, German and English', () => {
      assertEqual(years('Feb 2023 - Sep 2023\nPraktikum\nMuster GmbH'), 0.6, 'Feb-Sep is seven months');
    });

    test('a CV with no parseable date reports null, not zero', () => {
      // The distinction the model exists for: "no date I could read" is a question,
      // "no experience" is an answer.
      assertEqual(years('Kenntnisse: Python, Linux, Wireshark'), null, 'unknown stays unknown');
    });

    test('a reversed range is discarded rather than counted backwards', () => {
      assertEqual(years('09.2023 - 02.2023 Praktikum\nMuster GmbH'), null, 'typo ignored');
    });

    test('the value actually moves the score it feeds', () => {
      const job = { title: 'Senior IT Security Engineer', description: 'SIEM, Splunk' };
      const at = (y) => Scorer.scoreJob(job, { skills: ['siem'], targetRoles: [], experienceYears: y }, ['siem']).score;
      assert(at(5) > at(0), 'five years scores above the zero everyone used to get');
    });
  }

  section('Edited sections reach the generated CV');

  {
    // The panel writes p.cvSchema; the generator reads p.experience and friends.
    // Without the mapping the panel was a display of the profile rather than the
    // profile itself, and an edit there changed nothing in the download.
    const src = require('fs').readFileSync('./app.js', 'utf8');
    const grab = (n) => {
      const i = src.indexOf('function ' + n + '(');
      let d = 0, j = src.indexOf('{', i);
      for (let k = j; k < src.length; k++) {
        if (src[k] === '{') d++;
        else if (src[k] === '}') { d--; if (!d) return src.slice(i, k + 1); }
      }
    };
    const SCHEMA_TARGET = eval(src.slice(
      src.indexOf('const SCHEMA_TARGET = ['),
      src.indexOf('];', src.indexOf('const SCHEMA_TARGET = [')) + 2
    ).replace('const SCHEMA_TARGET =', ''));
    eval(grab('schemaTargetFor'));
    eval(grab('splitPeriod'));
    // applySchemaToProfile calls this; pulling one function out of a file means
    // pulling out what it depends on too.
    eval(grab('joinValues'));
    eval(grab('applySchemaToProfile'));

    test('a heading routes to the field the generator reads', () => {
      assertEqual(schemaTargetFor('BERUFSERFAHRUNG'), 'experience', 'German');
      assertEqual(schemaTargetFor('Work Experience'), 'experience', 'English');
      assertEqual(schemaTargetFor('PROJEKTE'), 'projects', 'projects');
      assertEqual(schemaTargetFor('WEITERBILDUNG'), 'certifications', 'further training');
      assertEqual(schemaTargetFor('Lieblingsfarbe'), null, 'an unknown heading is not forced anywhere');
    });

    test('SOFT SKILLS does not land in the technical skills', () => {
      // The looser /SKILLS/ pattern would otherwise claim it, and soft skills would
      // be printed as technical ones.
      assertEqual(schemaTargetFor('SOFT SKILLS'), 'softSkills', 'soft');
      assertEqual(schemaTargetFor('FÄHIGKEITEN'), 'skills', 'technical');
    });

    test('a period splits into start and end', () => {
      const d = splitPeriod('02.2023 – 09.2023');
      assertEqual(d.start, '02.2023', 'start');
      assertEqual(d.end, '09.2023', 'end');
      assertEqual(splitPeriod('Nov. 2020 – Gegenwärtig').end, 'Gegenwärtig', 'open range');
      assertEqual(splitPeriod('2025').end, '', 'a single date has no end');
    });

    test('entries, rows and lists each reach their field', () => {
      const p = {};
      applySchemaToProfile(p, [
        { heading: 'BERUFSERFAHRUNG', kind: 'entries', items: [
          { period: '02.2023 – 09.2023', title: 'Praktikum', org: 'DIGITAL-X',
            bullets: ['Entwicklung von Webanwendungen', 'Mitarbeit im Team'] }] },
        { heading: 'FÄHIGKEITEN', kind: 'rows', items: [
          { label: 'Security Tools', value: 'Kali Linux, Wireshark' }] },
        { heading: 'INTERESSEN', kind: 'list', items: ['Sport', 'Lesen'] },
      ]);
      assertEqual(p.experience[0].role, 'Praktikum', 'role');
      assertEqual(p.experience[0].desc.split('\n').length, 2, 'one bullet per line, as the PDF prints them');
      assertEqual(p.skillRows[0].category, 'Security Tools', 'the candidate\'s own grouping');
      assertEqual(p.interests, 'Sport\nLesen', 'list joined by lines');
    });

    test('a value wrapped across lines is joined without doubling its comma', () => {
      // A skills column reads "HTML , CSS , Django ," and continues "PHP , XML , SQL"
      // on the next line. The comma is already there, and joining with ", " printed
      // "Django ,, PHP".
      const out = joinValues(['HTML , CSS , Django ,', 'PHP , XML , SQL']);
      assertEqual(out, 'HTML, CSS, Django, PHP, XML, SQL', 'got: ' + out);
      assert(!/,,/.test(out), 'no doubled separator');
    });

    test('nothing is lost when the wrap falls inside a bracket', () => {
      const out = joinValues(['GUIProgrammierung(Javafx,', 'Swing , Scenebuilder)', 'Ms-Office Kenntnisse']);
      assert(/Scenebuilder\)/.test(out), 'the bracket closes: ' + out);
      assert(/Ms-Office Kenntnisse/.test(out), 'the item after it survives: ' + out);
    });

    test('an empty section never wipes a field the parser filled', () => {
      const p = { experience: [{ role: 'Kept' }] };
      applySchemaToProfile(p, [{ heading: 'BERUFSERFAHRUNG', kind: 'entries', items: [] }]);
      assertEqual(p.experience[0].role, 'Kept', 'nothing to write, nothing written');
    });
  }

  section('CV templates');

  {
    const T = require('./cv-themes.js');

    test('every theme places every section exactly once', () => {
      const KEYS = ['kontakt', 'ausbildung', 'sprachen', 'softskills', 'interessen',
                    'berufserfahrung', 'skills', 'projekte', 'weiterbildung'];
      T.list().forEach((t) => {
        const placed = t.layout.rail.concat(t.layout.main);
        assertEqual(placed.length, KEYS.length, `${t.id}: ${placed.length} sections placed`);
        KEYS.forEach(k => assertIncludes(placed, k, `${t.id} places ${k}`));
        assertEqual(new Set(placed).size, placed.length, `${t.id}: no section placed twice`);
      });
    });

    test('an unknown id falls back rather than returning nothing', () => {
      assertEqual(T.get('does-not-exist').id, T.DEFAULT_ID, 'unknown id');
      assertEqual(T.get('').id, T.DEFAULT_ID, 'empty id');
      assertEqual(T.get(undefined).id, T.DEFAULT_ID, 'no id at all');
    });

    test('a single-column theme declares no rail width', () => {
      T.list().filter(t => t.rail === 'none').forEach((t) => {
        assertEqual(t.railWidth, 0, `${t.id} rail width`);
        assertEqual(t.layout.rail.length, 0, `${t.id} lists nothing in the rail`);
      });
    });

    test('the ATS template avoids what a text extractor loses', () => {
      const ats = T.get('ats');
      assertEqual(ats.rail, 'none', 'one column: two columns interleave when extracted');
      assertEqual(ats.mainHeading, 'rule', 'no filled bar: colour behind text can take the heading with it');
      assertEqual(ats.photo, 'none', 'no photo');
    });

    test('a bleeding rail carries its own text colours', () => {
      // Body dark and muted grey both disappear on a strong colour, so a theme that
      // paints one has to say what to write on it.
      T.list().filter(t => t.railBleed).forEach((t) => {
        assert(t.railText, `${t.id} declares a text colour for the rail`);
        assert(t.railMuted, `${t.id} declares a muted one`);
        assert(t.railFill, `${t.id} actually fills the rail`);
      });
    });

    test('no theme prints a self-assessment the CV never made', () => {
      // The commercial builders draw four-of-five dots beside every language and
      // tool. A CV says "Deutsch – Fließend (C1)"; it does not say four out of five.
      // Rendering five would be this application inventing a rating, which is the
      // one thing every other guard here exists to prevent.
      T.list().forEach((t) => {
        assert(!('ratings' in t) && !('dots' in t), `${t.id} declares no rating scale`);
      });
    });

    test('every theme carries a note saying when to use it', () => {
      T.list().forEach(t => assert(t.note && t.note.length > 20, `${t.id} has advice`));
    });

    test('a theme names only a font jsPDF carries without an embedded file', () => {
      // Helvetica, Times and Courier ship inside jsPDF. Any other family would have
      // to be embedded, and a name jsPDF does not know falls back to Helvetica
      // silently — the template would then differ from its own description.
      const BUILT_IN = ['helvetica', 'times', 'courier'];
      T.list().filter(t => t.font).forEach((t) => {
        assertIncludes(BUILT_IN, t.font, `${t.id} names a built-in face`);
      });
    });

    test('a band header carries its own text colours', () => {
      // The same reason a bleeding rail does: body dark and muted grey both
      // disappear on a strong colour, so a theme that paints one has to say what
      // gets written on it.
      T.list().filter(t => t.header === 'band').forEach((t) => {
        assert(t.bandFill, `${t.id} says what colour the band is`);
        assert(t.bandText, `${t.id} declares a text colour for the band`);
        assert(t.bandMuted, `${t.id} declares a muted one`);
      });
    });

    test('a heading with no rule and no bar is set apart by tracking', () => {
      // "plain" removes both marks under a heading. Without letter-spacing to carry
      // it, a bold capital line at 9pt is indistinguishable from body text.
      T.list().filter(t => t.mainHeading === 'plain').forEach((t) => {
        assert(t.headingTrack > 0, `${t.id} tracks its headings`);
      });
    });

    test('no theme sets the dates in a column of their own', () => {
      // A timeline template draws a rule and a dot, and the dates stay inside the
      // entry. Dates set in their own column are the shape this project's parser
      // could not read back: a text extractor reads columns one after another, so
      // they arrive detached from the entries and get paired by order — stamping
      // entries with dates the candidate never wrote.
      T.list().forEach((t) => {
        assert(!('dateColumn' in t) && !('datesRail' in t), `${t.id} declares no date column`);
        // The generator only marks stations in a single column; a theme asking for
        // both a rail and a timeline would silently get no timeline.
        if (t.entryMark === 'timeline') assertEqual(t.rail, 'none', `${t.id} is single-column`);
      });
    });

    test('the preview shows the band and the timeline it claims', () => {
      const band = T.list().find(t => t.header === 'band');
      const tl = T.list().find(t => t.entryMark === 'timeline');
      assert(T.preview(band).indexOf(`rgb(${band.bandFill.join(',')})`) !== -1,
             'the band is painted in the preview, in its own colour');
      assert(T.preview(tl).indexOf('<circle') !== -1, 'the stations are marked in the preview');
      assert(T.preview(T.get('klassisch')).indexOf('<circle') === -1,
             'a theme with no timeline gets no dots');
    });

    test('the preview is drawn from the theme, and reflects its layout', () => {
      const two = T.preview(T.get('klassisch'));
      const one = T.preview(T.get('ats'));
      assert(/^<svg /.test(two) && /<\/svg>$/.test(two), 'valid SVG');
      // The two-column preview paints a rail field; the single-column one cannot.
      assert(two.length > one.length, 'the two-column preview carries more marks');
      assert(one.indexOf(`rgb(${T.get('ats').accent.join(',')})`) !== -1, 'uses its own accent');
    });
  }

  section('Date columns — the timeline that belongs to no entry');

  {
    const appSrc = require('fs').readFileSync('./app.js', 'utf8');
    // The three declarations are read and evaluated together. A regex literal match
    // broke the moment DATE_ONLY became a composed `new RegExp(...)` across two
    // lines, and an eval of `const` alone binds inside the eval, not out here.
    const _di = appSrc.indexOf('const DATE_POINT =');
    const DATE_ONLY = eval(appSrc.slice(_di, appSrc.indexOf(", 'i');", _di) + 7) + '; DATE_ONLY');
    const grab = (n) => {
      const i = appSrc.indexOf('function ' + n + '(');
      let d = 0, j = appSrc.indexOf('{', i);
      for (let k = j; k < appSrc.length; k++) {
        if (appSrc[k] === '{') d++;
        else if (appSrc[k] === '}') { d--; if (!d) return appSrc.slice(i, k + 1); }
      }
    };
    eval(grab('detachedDateRun'));

    test('a run of detached dates is recognised as a column', () => {
      // Many CV templates set the dates in their own vertical column. The extractor
      // reads columns one after the other, so five dates arrive in a row, detached
      // from the five entries they describe.
      const lines = [
        'Werkstudent IT System Integration', 'Alberdingk-Boley, Krefeld',
        'Nov. 2020 - Gegenwärtig', 'Juli 2019 - Dez. 2019', 'Nov. 2017 - Aug. 2018',
        'Sep. 2010 - Juli 2017', 'Juni 2024 - Nov. 2024',
      ];
      assertEqual(detachedDateRun(lines).size, 5, 'all five dropped');
    });

    test('a date that belongs to its entry is kept', () => {
      // The fix must not cost every CV its dates. One or two dates with content
      // between them are an ordinary entry header.
      const lines = ['02.2023 - 09.2023', 'Praktikum Softwareentwicklung', 'DIGITAL-X Suarl'];
      assertEqual(detachedDateRun(lines).size, 0, 'nothing dropped');
    });

    test('two consecutive dates are not yet a column', () => {
      // Two in a row happens in an ordinary block. Three is where a column starts.
      assertEqual(detachedDateRun(['05.2025 - heute', '09.2017 - 02.2021']).size, 0, 'two kept');
      assertEqual(detachedDateRun(['05.2025 - heute', '09.2017 - 02.2021', '06.2021 - 01.2024']).size, 3, 'three dropped');
    });

    test('the section a CV carries is not silently absent', () => {
      // PRAKTISCHE KENNTNISSE was missing from a generated CV because it was not on
      // the known-headings list: a whole section of the source, gone without a word.
      assert(cvSchema.looksLikeHeading('PRAKTISCHE KENNTNISSE'), 'now recognised');
      const cv = ['BERUFSERFAHRUNG', 'Werkstudent', 'PRAKTISCHE KENNTNISSE', 'Java, SQL'].join('\n');
      const found = cvSchema.detectSections(cv).map(s => s.heading);
      assertIncludes(found, 'PRAKTISCHE KENNTNISSE', 'and it survives detection');
    });
  }

  section('CV schema — the form is built from the document');

  {
    const CV = [
      'BERUFSERFAHRUNG',
      '02.2023 - 09.2023', 'Praktikum Softwareentwicklung', 'DIGITAL-X Suarl, Douala',
      'Entwicklung von Webanwendungen mit HTML, SCSS und PHP',
      'TECHNISCHE FÄHIGKEITEN',
      'Security Tools: Kali Linux, Wireshark, IDA Pro',
      'PROJEKTE',
      'Uni-Projekt: VPN-Konfiguration', 'Westfälische Hochschule Gelsenkirchen, 2025',
      'SOFT SKILLS', 'Analytisches Denken', 'Teamfähigkeit',
    ].join('\n');

    const secs = () => cvSchema.detectSections(CV);
    const say = (obj) => ({ isAvailable: () => true, chat: async () => JSON.stringify(obj) });

    test('headings are found without a model at all', () => {
      const found = secs().map(s => s.heading);
      assertIncludes(found, 'BERUFSERFAHRUNG', 'German heading');
      assertIncludes(found, 'TECHNISCHE FÄHIGKEITEN', 'with umlauts');
      assertIncludes(found, 'PROJEKTE', 'the section the fixed form has no box for');
      assertEqual(found.length, 4, 'four sections, no more');
    });

    test('a name in capitals at the top of a CV is not a section', () => {
      // A CV opens with the candidate's name, and a name set in capitals passes
      // every shape test a heading passes. One real CV produced a section called
      // "JARDEL GALDOS KENNE" holding the personal statement.
      const cv = [
        'Jardel Galdos Kenne', 'Backend Developer',
        'JARDEL GALDOS KENNE', 'Ich studiere derzeit Informatik in Gelsenkirchen.',
        'KONTAKT', 'E-Mail: someone@example.com',
      ].join('\n');
      const found = cvSchema.detectSections(cv).map(s => s.heading);
      assertEqual(found.length, 1, 'only the real heading');
      assertEqual(found[0], 'KONTAKT', 'and it is KONTAKT');
    });

    test('a short capitalised skill is not a section', () => {
      // "SAP" sat in a capitalised skill list and became a section that swallowed
      // the line beneath it.
      assert(!cvSchema.looksLikeHeading('SAP'), 'three letters');
      assert(!cvSchema.looksLikeHeading('SQL'), 'nor three more');
      assert(cvSchema.looksLikeHeading('PROJEKTE'), 'a real one still passes');
      assert(cvSchema.looksLikeHeading('FÄHIGKEITEN'), 'umlauts included');
    });

    test('a skill list keeps its acronyms', () => {
      const cv = ['FÄHIGKEITEN', 'HTML, CSS, Django', 'SAP', 'Jira', 'KONTAKT', 'x@y.de'].join('\n');
      const s = cvSchema.detectSections(cv).find(x => x.heading === 'FÄHIGKEITEN');
      assert(/SAP/.test(s.body) && /Jira/.test(s.body), 'SAP and Jira stay in the skills block');
    });

    test('a sentence is not a heading', () => {
      assert(!cvSchema.looksLikeHeading('Entwicklung von Webanwendungen mit HTML, SCSS und PHP.'),
        'length and the full stop rule it out');
      assert(cvSchema.looksLikeHeading('WEITERBILDUNG'), 'a short capitalised label is');
    });

    await atest('a section the CV does not have is dropped', async () => {
      const out = await cvSchema.buildSchema({ cvText: CV, sections: secs() },
        say({ sections: [{ heading: 'ZERTIFIKATE', kind: 'list', items: ['CISSP'] }] }));
      assertEqual(out, null, 'an invented heading leaves nothing to render');
    });

    await atest('an invented entry is dropped', async () => {
      const out = await cvSchema.buildSchema({ cvText: CV, sections: secs() },
        say({ sections: [{ heading: 'BERUFSERFAHRUNG', kind: 'entries', items: [
          { title: 'Senior Security Engineer', org: 'Siemens AG', period: '2019 - 2023', bullets: [] },
        ] }] }));
      assertEqual(out, null, 'a job the CV never mentions cannot reach the form');
    });

    await atest('one invented bullet does not sink a real entry', async () => {
      // A real job with one fabricated line is still a real job. The line goes, the
      // job stays, and the removal is reported rather than done in silence.
      const out = await cvSchema.buildSchema({ cvText: CV, sections: secs() },
        say({ sections: [{ heading: 'BERUFSERFAHRUNG', kind: 'entries', items: [
          { title: 'Praktikum Softwareentwicklung', org: 'DIGITAL-X Suarl, Douala',
            period: '02.2023 - 09.2023',
            bullets: ['Entwicklung von Webanwendungen mit HTML, SCSS und PHP',
                      'Leitung eines Teams von acht Entwicklern'] },
        ] }] }));
      assertEqual(out.sections[0].items[0].bullets.length, 1, 'only the real bullet survives');
      assert(out.dropped.some(d => /bullet/.test(d.why)), 'and the removal is reported');
    });

    await atest('faithful content passes through unchanged', async () => {
      const out = await cvSchema.buildSchema({ cvText: CV, sections: secs() },
        say({ sections: [{ heading: 'TECHNISCHE FÄHIGKEITEN', kind: 'rows', items: [
          { label: 'Security Tools', value: 'Kali Linux, Wireshark, IDA Pro' },
        ] }] }));
      assertEqual(out.sections[0].kind, 'rows', 'the shape the model chose');
      assertEqual(out.sections[0].items[0].value, 'Kali Linux, Wireshark, IDA Pro', 'verbatim');
    });

    await atest('no model configured still yields the sections', async () => {
      const out = await cvSchema.buildSchema({ cvText: CV, sections: secs() }, { isAvailable: () => false });
      assertEqual(out, null, 'the caller falls back to the deterministic split');
      assert(secs().length === 4, 'which is still four editable blocks');
    });
  }

  section('Score explanation — the model describes, the formula decides');

  // The match score is deterministic and published; this layer only puts it into
  // words. A caption that disagrees with the figure printed above it is worse than
  // no caption, because the reader cannot tell which of the two to believe.
  {
    const BD = {
      points:  { skills: 28, role: 20, location: 10, remote: 10, seniority: 5, salary: 2.5 },
      weights: { skills: 45, role: 20, location: 10, remote: 10, seniority: 10, salary: 5 },
      skillsMatched: ['python', 'linux', 'wireshark'],
      skillsMissing: ['splunk', 'siem'],
    };
    const JOB = { title: 'SOC Analyst', company: 'Acme' };
    const say = (reply) => ({ isAvailable: () => true, chat: async () => reply });
    const run = (reply, score) => explainer.explainScore(
      { score100: score === undefined ? 76 : score, breakdown: BD, job: JOB, language: 'en' }, say(reply));

    await atest('accepts an explanation that stays inside the breakdown', async () => {
      const r = await run('You cover the technical core with Python and Linux, but Splunk is missing, which costs 17 of the 45 skill points.');
      assert(r && /Splunk/.test(r.text), 'faithful explanation kept');
      assertEqual(r.worst, 'skills', 'largest shortfall identified by arithmetic, not by the model');
    });

    await atest('accepts the scale itself — "76 out of 100"', async () => {
      const r = await run('You scored 76 out of 100. The gap is in skills.');
      assert(r, '100 is the scale, not an invented figure');
    });

    await atest('accepts a count of the missing skills', async () => {
      const r = await run('You are missing 2 of the skills this posting asks for.');
      assert(r, 'list lengths are derivable from the breakdown');
    });

    await atest('rejects an invented percentage', async () => {
      const r = await run('Your real match is closer to 78% once the home lab is counted.');
      assertEqual(r, null, 'a figure absent from the breakdown is refused');
    });

    await atest('rejects an explanation that contradicts the total', async () => {
      const r = await run('This role matches you at 91 out of 100.');
      assertEqual(r, null, 'the total is final');
    });

    await atest('no model configured leaves the breakdown to speak for itself', async () => {
      const r = await explainer.explainScore(
        { score100: 76, breakdown: BD, job: JOB }, { isAvailable: () => false });
      assertEqual(r, null, 'the table is the answer; the sentences are a convenience');
    });

    await atest('a model failure is not an error the caller has to handle', async () => {
      const boom = { isAvailable: () => true, chat: async () => { throw new Error('boom'); } };
      const r = await explainer.explainScore({ score100: 76, breakdown: BD, job: JOB }, boom);
      assertEqual(r, null, 'degrades instead of throwing');
    });

    await atest('the explainer never produces a score of its own', async () => {
      const r = await run('Skills are the weak point: 28 of 45.');
      assert(r && r.score === undefined && r.score100 === undefined,
        'it returns text and a component name, never a number');
    });
  }

  section('Employer recruiting platforms');

  {
    const ats = require('./server/ats.js');

    test('four connectors, one per documented platform', () => {
      ['greenhouse', 'lever', 'smartrecruiters', 'personio'].forEach((k) =>
        assert(typeof ats.CONNECTORS[k] === 'function', k + ' connector'));
    });

    test('the registry can be extended without a deployment', () => {
      const extra = JSON.stringify([{ company: 'Beispiel AG', platform: 'greenhouse', id: 'beispiel' }]);
      const list = ats.registry({ ATS_REGISTRY: extra });
      assert(list.some(e => e.company === 'Beispiel AG'), 'the added employer is there');
      assert(list.length > 1, 'and the built-in ones remain');
    });

    test('a malformed registry does not take the built-in one down with it', () => {
      assert(ats.registry({ ATS_REGISTRY: 'not json at all' }).length >= 2, 'built-ins survive');
      assert(ats.registry({ ATS_REGISTRY: '[{"company":"X"}]' }).length >= 2,
        'an entry with no platform or id is skipped, not fatal');
    });

    test('an unknown platform is refused rather than called', () => {
      const list = ats.registry({ ATS_REGISTRY: '[{"company":"X","platform":"myspace","id":"x"}]' });
      assert(!list.some(e => e.platform === 'myspace'), 'no connector, no entry');
    });

    await atest('an employer nobody configured returns nothing, quietly', async () => {
      const out = await ats.fetchAtsJobs({ keyword: 'security', employer: 'kein-solcher-arbeitgeber' });
      assertEqual(out.length, 0, 'no rows');
    });

    test('every shipped identifier is one that was checked', () => {
      // SmartRecruiters answers 200 with an empty list for a company that does not
      // exist, so a guessed identifier looks like an employer with no vacancies.
      // Only verified ones belong in the file.
      assert(ats.ATS_EMPLOYERS.length > 0, 'the list is not empty');
      ats.ATS_EMPLOYERS.forEach((e) => {
        assert(e.company && e.platform && e.id, 'complete entry: ' + JSON.stringify(e));
        assert(ats.CONNECTORS[e.platform], e.platform + ' has a connector');
      });

    test('a sitemap entry carries the address of the sitemap, not a company slug', () => {
      // The sitemap connector's id is a URL, and one written as a bare company name
      // would be fetched as a relative path and fail silently.
      ats.ATS_EMPLOYERS.filter((e) => e.platform === 'sitemap').forEach((e) => {
        assert(/^https:\/\//.test(e.id), e.company + ' has an absolute https address');
      });
    });

    test('robots.txt Disallow closes a path', () => {
      // TÜV NORD disallows /api/ — their internal endpoint — in the same file that
      // announces the sitemaps. Reading the first while honouring the second is the
      // whole basis for this connector being legitimate, so it is pinned here.
      assert(ats.blocked(['/api/'], 'https://www.tuev-nord-group.com/api/jobs'), '/api/ is closed');
      assert(!ats.blocked(['/api/'], 'https://www.tuev-nord-group.com/de/jobs/x-1'),
        'the announced job path stays open');
      assert(ats.blocked(['/*/externaljobs/*qtvc='], 'https://jobs.siemens.com/de/externaljobs/x?qtvc=1'),
        'a wildcard rule is honoured');
    });

    test('a job path is a path segment, not a substring of the whole URL', () => {
      // Two real failures. On jobs.siemens.com the host contains "jobs", so testing
      // the whole URL passed every page on the site; and an unanchored "position"
      // matched inside "disposition", which is how a French press release about a
      // document update arrived as a vacancy at Atos.
      assert(ats.pathNamesAJob('https://jobs.zalando.com/de/jobs/2720430-software-engineer'), 'a real posting');
      assert(!ats.pathNamesAJob('https://atos.net/fr/mise-a-disposition-du-document-de-reference'),
        'disposition is not a position');
      assert(!ats.pathNamesAJob('https://jobs.siemens.com/de_DE/externaljobs/AccountValidation'),
        'a portal screen on a jobs host is not a job');
    });

    test('a title is read out of the slug the way a German title is written', () => {
      // The sitemaps carry no titles and the slug is what there is. Three things had
      // to be got out of it: the posting id, which sits at either end depending on
      // the site; the file extension REWE leaves on; and the case, which is lost
      // entirely and matters more in German than in English.
      assertEqual(ats.titleFromUrl('https://x.de/de/jobs/stellv-teamleitung-geotechnik-10567'),
        'Stellv Teamleitung Geotechnik', 'trailing id removed, nouns capitalised');
      assertEqual(ats.titleFromUrl('https://jobs.zalando.com/de/jobs/2720430-senior-machine-learning-engineer'),
        'Senior Machine Learning Engineer', 'leading id removed');
      assertEqual(ats.titleFromUrl('https://jobs.rewe-group.com/verkaeufer-mit-kassiertaetigkeit-viersen.html'),
        'Verkaeufer mit Kassiertaetigkeit Viersen', 'extension gone, "mit" stays lower case');
      assertEqual(ats.titleFromUrl('https://x.de/jobs/fachkraft-fuer-arbeitssicherheit-m-w-d-1234'),
        'Fachkraft fuer Arbeitssicherheit (m/w/d)', 'the gender note is restored');
    });
    });
  }

  section('Employer filter — who is hiring, not who is mentioned');

  {
    const employers = require('./server/employers.js');
    const jobs = [
      { title: 'IT Security Engineer', company: 'Siemens AG' },
      { title: 'IT Security Engineer', company: 'Siemens Healthineers AG' },
      { title: 'Systemadministrator', company: 'FERCHAU GmbH Niederlassung Nürnberg' },
      { title: 'Techniker', company: 'I.K. Hofmann GmbH Unit 1' },
      { title: 'Entwickler', company: 'Musterfirma GmbH' },
      { title: 'Cloud Engineer', company: 'Robert Bosch GmbH' },
    ];

    test('a named employer is matched on the company, not the posting', () => {
      // "Siemens" as a keyword returned 500 rows of which 68 were Siemens: agency
      // adverts read "unser Kunde Siemens" and rank like Siemens itself.
      const out = employers.filterByEmployer(jobs, 'all', 'siemens');
      assertEqual(out.length, 2, 'both Siemens entities, nothing else');
    });

    test('subsidiaries posting under their own name still count', () => {
      // "Siemens" alone would miss Healthineers and Energy, which are separate
      // companies posting separately.
      assertEqual(employers.majorEmployer('Siemens Healthineers AG'), 'siemens', 'healthineers');
      assertEqual(employers.majorEmployer('Robert Bosch GmbH'), 'bosch', 'bosch');
      assertEqual(employers.majorEmployer('Musterfirma GmbH'), null, 'an unlisted company is not forced onto the list');
    });

    test('major keeps the listed employers, direct only drops the agencies', () => {
      assertEqual(employers.filterByEmployer(jobs, 'major').length, 3, 'Siemens x2 + Bosch');
      assertEqual(employers.filterByEmployer(jobs, 'direct').length, 4, 'everything except the two agencies');
      assertEqual(employers.filterByEmployer(jobs, 'all').length, 6, 'all leaves the set alone');
    });

    test('an agency is recognised by its name, never by the posting text', () => {
      // An employer's own advert routinely says "keine Zeitarbeit" or describes
      // working with contractors. Matching that would exclude the very postings this
      // filter exists to keep.
      assert(employers.isAgency('FERCHAU GmbH Niederlassung Nürnberg'), 'named firm');
      assert(employers.isAgency('Office People Personalmanagement GmbH'), 'by its trade');
      assert(!employers.isAgency('Siemens AG'), 'not the employer itself');
    });

    test('the IT mode keeps IT employers and drops the rest', () => {
      // "Show me the IT employers" is a different question from "show me the large
      // employers". A Konzern hires IT people too, but answering the second when the
      // first was asked buries the answer.
      const mixed = [
        { company: 'TÜV Informationstechnik GmbH' },
        { company: 'secunet Security Networks AG' },
        { company: 'Bechtle AG' },
        { company: 'Volkswagen AG' },
        { company: 'Beiersdorf AG' },
      ];
      const it = employers.filterByEmployer(mixed, 'it').map(j => j.company);
      assertEqual(it.length, 3, 'got: ' + it.join(', '));
      assert(!it.some(c => /Volkswagen|Beiersdorf/.test(c)), 'industrial groups excluded');
      assertEqual(employers.filterByEmployer(mixed, 'major').length, 5, 'all five are large employers');
    });

    test('the certification bodies are four companies, not one', () => {
      // "TÜV" is 1,906 open positions across TÜV SÜD, Rheinland, NORD and Thüringen,
      // which post separately. A single name would have found one of them.
      ['TÜV SÜD AG', 'TÜV Rheinland Group', 'TÜV NORD Systems', 'TÜV Informationstechnik GmbH']
        .forEach(c => assertEqual(employers.majorEmployer(c), 'tuev', c));
    });

    test('the breakdown reports what the set actually contains', () => {
      // So the interface can offer the employers present rather than a list of names
      // that may return nothing.
      const b = employers.employerBreakdown(jobs);
      assertEqual(b.siemens, 2, 'two Siemens');
      assertEqual(b.bosch, 1, 'one Bosch');
      assert(!('volkswagen' in b), 'nobody who is not there');
    });
  }

  section('Position type — Werkstudent and friends');

  // The filter existed and /api/scrape-all honoured it, while /api/jobs accepted
  // the same parameter and dropped it: a caller asking for working-student roles
  // got the unfiltered list and no indication why.
  {
    const m = (title, description, kind) => employment.jobMatchesEmployment({ title, description }, kind);

    test('werkstudent: matches the German title', () => {
      assert(m('Werkstudent IT-Security (m/w/d)', '', 'werkstudent'), 'Werkstudent detected');
    });
    test('werkstudent: matches the English equivalent', () => {
      assert(m('Working Student Cyber Security', '', 'werkstudent'), 'working student detected');
    });
    test('werkstudent: matches a body-only mention under a full-time title', () => {
      assert(m('IT Security Engineer', 'Auch als studentische Hilfskraft moeglich', 'werkstudent'),
        'German postings open the role in the body, not the title');
    });
    test('werkstudent: rejects a senior posting', () => {
      assert(!m('Head of IT-Security', 'Vollzeit, unbefristet', 'werkstudent'), 'senior role excluded');
    });
    test('werkstudent: does not swallow an internship', () => {
      assert(!m('Praktikum Informationssicherheit', '', 'werkstudent'), 'Praktikum is its own category');
    });
    test('praktikum and ausbildung are distinct categories', () => {
      assert(m('Praktikum Informationssicherheit', '', 'praktikum'), 'Praktikum matches its own kind');
      assert(m('Duales Studium Cyber Security', '', 'ausbildung'), 'duales Studium is Ausbildung');
    });
    // "intern " was in the Praktikum list for the English noun and matched the
    // German adverb, which means "internally": "Weiterbildungen sowohl intern als
    // auch extern". A live search returned a Teamleiter and a Manager as
    // internships because of it.
    test('praktikum: the German adverb "intern" is not an internship', () => {
      assert(!m('Teamleiter IT Sicherheit', 'Wir bieten Weiterbildungen sowohl intern als auch extern an', 'praktikum'),
        'internally-versus-externally does not make a posting an internship');
      assert(!m('Manager Projekt IT-Sicherheit', 'leitest Schulungen intern wie extern', 'praktikum'),
        'nor does running training internally');
    });

    test('praktikum: the English noun still matches', () => {
      assert(m('Security Internship 2026', '', 'praktikum'), 'internship detected');
      assert(m('Praktikum Informationssicherheit', '', 'praktikum'), 'and the German one');
    });

    test('all: filters nothing', () => {
      assert(m('Head of IT-Security', '', 'all'), 'the default keeps every posting');
    });
    test('every category carries a query hint, or the sources never return it', () => {
      Object.keys(employment.EMPLOYMENT_TERMS).forEach((k) => {
        assert(employment.EMPLOYMENT_QUERY_HINT[k], `${k} has a query hint`);
      });
    });
  }

  section('Skill matching — negation');

  // "No CISSP" registered as a CISSP hit: the matcher tested for the surface form
  // and nothing else, so a CV stating an absence produced the certification.
  // Sprint-3 review finding.
  {
    const G = [{ category: 'x', skills: [
      { key: 'cissp', label: 'CISSP' }, { key: 'splunk', label: 'Splunk' }, { key: 'python', label: 'Python' },
    ] }];
    const has = (t, k) => skillMatcher.findSkills(t, G).some(s => s.key === k);

    test('negation: "No CISSP" is not a CISSP hit', () => {
      assert(!has('No CISSP', 'cissp'), 'denied certification not detected');
    });
    test('negation: German "Keine Erfahrung mit Splunk"', () => {
      assert(!has('Keine Erfahrung mit Splunk', 'splunk'), 'kein/keine understood');
    });
    test('negation: French "Pas de certification CISSP"', () => {
      assert(!has('Pas de certification CISSP', 'cissp'), 'pas de understood');
    });
    test('negation: a plain statement is still detected', () => {
      assert(has('CISSP certified since 2024', 'cissp'), 'no false negative on a normal CV line');
    });
    test('negation: does not survive a sentence boundary', () => {
      assert(has('No CISSP yet. CISSP exam booked for June', 'cissp'),
        'a later positive occurrence still counts');
    });
    test('negation: does not survive a contrastive "but"', () => {
      assert(has('No CISSP but Splunk daily', 'splunk'), 'the negation governs CISSP, not Splunk');
    });
    test('negation: "no problem working with Splunk" still claims Splunk', () => {
      assert(has('I have no problem working with Splunk', 'splunk'),
        'the cue denies its own noun, not the skill');
    });
  }

  section('Skill-Gap Recommendations');

  test('learningFor: maps a security skill to concrete resource', () => {
    const rec = SecurityLearning.learningFor({ key: 'siem', label: 'SIEM', category: 'Defensive Security / Blue Team / SOC' });
    assert(rec.key === 'siem', 'key preserved');
    assert(rec.label === 'SIEM', 'label preserved');
    assert(rec.how && rec.how.length > 0, 'how is non-empty');
    assert(rec.resource && rec.resource.length > 0, 'resource is non-empty');
    assert(rec.resource.toLowerCase().includes('splunk'), 'SIEM resource mentions Splunk');
  });

  test('learningFor: falls back to category default for unknown skill', () => {
    const rec = SecurityLearning.learningFor({ key: 'unknown-xyz', label: 'Unknown', category: 'Network Security' });
    assert(rec.how && rec.how.length > 0, 'how is non-empty (from category fallback)');
    assert(rec.resource && rec.resource.length > 0, 'resource is non-empty (from category fallback)');
  });

  // These two exercise the REAL role list and the real threshold from app.js. The
  // harness above keeps a four-role copy for the older tests, and a copy is exactly
  // how "Pflegefachkraft" could be offered to a security candidate without any test
  // noticing — the copy has no healthcare roles in it.
  {
    const appSrc = require('fs').readFileSync('./app.js', 'utf8');
    const realRoles = eval(appSrc.slice(
      appSrc.indexOf('const roles = ['),
      appSrc.indexOf('];', appSrc.indexOf('const roles = [')) + 2
    ).replace('const roles =', ''));
    const freq = {};
    realRoles.forEach(r => r.required.forEach(k => { freq[k] = (freq[k] || 0) + 1; }));
    const realAnalyze = (found) => realRoles
      .map((r) => {
        const missing = r.required.filter(k => !found.includes(k));
        const matched = r.required.filter(k => found.includes(k));
        return {
          name: r.name,
          score: (r.required.length - missing.length) / r.required.length,
          distinctive: matched.some(k => (freq[k] || 0) <= 3),
        };
      })
      .filter(r => r.score >= 0.35 && r.distinctive);

    test('a role needs a distinctive skill, not just generic ones', () => {
      // An IT-security CV was offered "Pflegefachkraft" at 2/5, reached on
      // "communication" and a "medical documentation" the matcher had pulled out of
      // "technische Dokumentation" — two things almost every CV contains.
      const names = realAnalyze(['communication', 'documentation', 'linux', 'wireshark', 'penetration testing']).map(r => r.name);
      assert(!names.some(n => /Pflege|Medical|OP-/.test(n)), 'no healthcare role: ' + names.join(', '));
      assert(names.length > 0, 'security roles are still offered');
    });

    test('a healthcare CV still gets healthcare roles', () => {
      // The fix must not amount to deleting the other domains from the taxonomy.
      const names = realAnalyze(['patient care', 'medication', 'empathy', 'hygiene', 'communication']).map(r => r.name);
      assert(names.some(n => /Pflege|Medical/.test(n)), 'got: ' + names.join(', '));
    });

    test('"technische Dokumentation" is not a medical skill', () => {
      const groups = eval(appSrc.slice(
        appSrc.indexOf('const skillGroups = ['),
        appSrc.indexOf('];', appSrc.indexOf('const skillGroups = [')) + 2
      ).replace('const skillGroups =', ''));
      const found = skillMatcher.findSkills('UML-Modellierung und technische Dokumentation.', groups).map(x => x.label);
      assert(!found.includes('Medical documentation'), 'got: ' + found.join(', '));
      assertIncludes(found, 'Documentation', 'the ordinary one is still detected');
    });
  }

  test('learningFor: the fallback names no platform', () => {
    // This test used to require the fallback to mention TryHackMe, which is how the
    // bug survived: the taxonomy covers more than security, and a candidate short of
    // "Patient care" or "Empathie" was told to close the gap on a hacking range.
    const rec = SecurityLearning.learningFor({ key: 'xyz', label: 'Unknown', category: 'Unknown Category' });
    assert(rec.how === 'Build hands-on experience', 'DEFAULT how');
    assert(rec.resource && rec.resource.length > 0, 'the fallback still says something useful');
    assert(!/TryHackMe|HackTheBox|PortSwigger|MITRE/i.test(rec.resource),
      'a fallback for an unknown domain must not name a security platform');
  });

  test('recommendGaps: prioritises skills by how many target roles require them', () => {
    const roles = [
      { name: 'SOC Analyst', score: 0.8, missing: ['siem', 'log analysis', 'incident response'] },
      { name: 'Pentester', score: 0.6, missing: ['siem', 'metasploit', 'nmap'] },
    ];
    const skillMeta = key => ({ key, label: key.toUpperCase(), category: '' });
    const recs = SecurityLearning.recommendGaps(roles, { lookup: skillMeta, topRoles: 2, limit: 8 });

    assert(recs.length > 0, 'returns recommendations');
    assert(recs[0].key === 'siem', 'siem ranked first (needed by both roles)');
    assert(recs[0].priority === 2, 'siem has priority=2 (two roles)');
    assert(recs[0].forRoles.length === 2, 'siem.forRoles has both role names');
  });

  test('recommendGaps: respects topRoles limit', () => {
    const roles = [
      { name: 'Role1', missing: ['skill1'] },
      { name: 'Role2', missing: ['skill2'] },
      { name: 'Role3', missing: ['skill3'] },
    ];
    const skillMeta = key => ({ key, label: key });
    const recs = SecurityLearning.recommendGaps(roles, { lookup: skillMeta, topRoles: 1, limit: 8 });

    assert(recs.length === 1, 'only considers top 1 role → 1 rec');
    assert(recs[0].key === 'skill1', 'recommendation is from Role1');
  });

  test('Scout agent output includes recommendations when deps.recommend injected', async () => {
    const mockRecommend = () => [
      { key: 'test', label: 'Test Skill', how: 'practice', resource: 'test platform' }
    ];
    const deps = {
      findSkills: () => [{ key: 'python', label: 'Python' }],
      analyzeRoles: () => [{ name: 'Test Role', missing: ['test'] }],
      allSkills: () => [{ key: 'python', label: 'Python' }, { key: 'test', label: 'Test Skill' }],
      recommend: mockRecommend,
    };
    const result = await agents.ScoutAgent.run({ cvText: 'python test' }, {}, deps);
    assert(Array.isArray(result.recommendations), 'recommendations is an array');
    assert(result.recommendations.length === 1, 'recommendation included');
    assert(result.recommendations[0].key === 'test', 'recommendation has correct key');
  });

  test('Scout agent gracefully omits recommendations if no recommender injected', async () => {
    const deps = {
      findSkills: () => [{ key: 'python', label: 'Python' }],
      analyzeRoles: () => [],
      allSkills: () => [{ key: 'python', label: 'Python' }],
      // no recommend dep
    };
    const result = await agents.ScoutAgent.run({ cvText: 'python' }, {}, deps);
    assert(Array.isArray(result.recommendations), 'recommendations is still an array (empty)');
    assert(result.recommendations.length === 0, 'no recommendations without injected recommender');
  });


  section('Agent reasoning layer');

  // A stub model: returns whatever the test scripted, so these exercise the guard
  // rather than a provider. The guard is the security boundary — a model that
  // invents a qualification must not be able to put it in a cover letter.
  const stubLlm = (reply) => ({ isAvailable: () => true, chat: async () => reply });
  const VOCAB = [
    { key: 'firewall', label: 'Firewall' },
    { key: 'siem', label: 'SIEM' },
    { key: 'kubernetes', label: 'Kubernetes' },
  ];
  const CV = 'Ich habe zu Hause ein Labor mit pfSense aufgebaut und den Netzwerkverkehr segmentiert. '
           + 'Im Studium Grundlagen der IT-Sicherheit, Python und Linux.';

  await atest('Scout reasoning: accepts an inferred skill backed by a verbatim CV quote', async () => {
    const out = await reasoning.inferSkills(
      { cvText: CV, foundKeys: [], vocabulary: VOCAB },
      stubLlm(JSON.stringify([
        { key: 'firewall', evidence: 'ein Labor mit pfSense aufgebaut', confidence: 0.9 },
      ])));
    assert(out && out.inferred.length === 1, 'one skill inferred');
    assert(out.inferred[0].key === 'firewall', 'the firewall skill');
    assert(out.inferred[0].evidence.includes('pfSense'), 'evidence carried through');
  });

  await atest('Scout reasoning: REJECTS a skill whose evidence is not in the CV', async () => {
    const out = await reasoning.inferSkills(
      { cvText: CV, foundKeys: [], vocabulary: VOCAB },
      stubLlm(JSON.stringify([
        { key: 'siem', evidence: 'drei Jahre Splunk im SOC', confidence: 0.95 },
      ])));
    assert(out && out.inferred.length === 0, 'nothing accepted');
    assert(out.rejected.length === 1 && /evidence/.test(out.rejected[0].why), 'rejected for missing evidence');
  });

  await atest('Scout reasoning: rejects a key outside the taxonomy', async () => {
    const out = await reasoning.inferSkills(
      { cvText: CV, foundKeys: [], vocabulary: VOCAB },
      stubLlm(JSON.stringify([{ key: 'quantum-crypto', evidence: 'pfSense', confidence: 1 }])));
    assert(out.inferred.length === 0 && out.rejected.length === 1, 'invented key refused');
  });

  await atest('Scout reasoning: no model configured leaves the analysis untouched', async () => {
    const out = await reasoning.inferSkills(
      { cvText: CV, foundKeys: [], vocabulary: VOCAB }, { isAvailable: () => false });
    assert(out === null, 'returns null so the caller keeps the deterministic result');
  });

  await atest('Scout reasoning: malformed model output does not throw', async () => {
    const out = await reasoning.inferSkills(
      { cvText: CV, foundKeys: [], vocabulary: VOCAB }, stubLlm('sorry, I cannot help'));
    assert(out === null, 'unparseable reply degrades to null');
  });

  const LONG_POSTING = 'Wir suchen eine erfahrene Fachkraft. Voraussetzung sind mindestens zehn Jahre '
    + 'Berufserfahrung im Bereich IT-Sicherheit sowie ein abgeschlossenes Studium. Kenntnisse in Python '
    + 'und Linux werden vorausgesetzt. Die Stelle ist unbefristet und in Vollzeit zu besetzen.';

  await atest('Matcher reasoning: a blocked verdict must cite the requirement', async () => {
    const v = await reasoning.adjudicate(
      { job: { title: 'Senior Analyst' }, jobDescription: LONG_POSTING, foundKeys: ['python'], score: 0.81 },
      stubLlm(JSON.stringify({ verdict: 'blocked', blockers: ['mindestens zehn Jahre Berufserfahrung'], reason: 'Junior profile.' })));
    assert(v.verdict === 'blocked' && v.blockers.length === 1, 'blocked with a cited requirement');
  });

  await atest('Matcher reasoning: "blocked" with no cited requirement is downgraded to ok', async () => {
    const v = await reasoning.adjudicate(
      { job: { title: 'Analyst' }, jobDescription: LONG_POSTING, foundKeys: [], score: 0.7 },
      stubLlm(JSON.stringify({ verdict: 'blocked', blockers: [], reason: 'feels wrong' })));
    assert(v.verdict === 'ok', 'an opinion without evidence cannot exclude a candidate');
  });

  await atest('Matcher reasoning: a posting too short to state a requirement is not judged', async () => {
    const v = await reasoning.adjudicate(
      { job: { title: 'Analyst' }, jobDescription: 'Full description on LinkedIn.', foundKeys: [], score: 0.9 },
      stubLlm(JSON.stringify({ verdict: 'blocked', blockers: ['x'], reason: 'y' })));
    assert(v === null, 'no description, no verdict');
  });

  await atest('Matcher reasoning: blocked matches are demoted, never rescored', async () => {
    const deps = {
      scoreJob: (job) => ({ score: job.s, breakdown: {} }),
      llm: { isAvailable: () => true },
      reasoning: {
        ADJUDICATE_TOP_N: 2,
        adjudicate: async ({ job }) => (job.title === 'Senior'
          ? { verdict: 'blocked', blockers: ['10 years'], reason: 'too senior' }
          : { verdict: 'ok', blockers: [], reason: '' }),
      },
    };
    const jobs = [
      { title: 'Senior', s: 0.9, description: 'x'.repeat(200) },
      { title: 'Junior', s: 0.8, description: 'x'.repeat(200) },
    ];
    const base = agents.MatcherAgent.run({ analysis: { foundKeys: [] }, jobs }, null, deps);
    assert(base.matches[0].job.title === 'Senior', 'deterministic ranking puts Senior first');
    const out = await agents.MatcherAgent.reason(base, { analysis: { foundKeys: [] } }, deps);
    assert(out.matches[0].job.title === 'Junior', 'blocked match demoted below the eligible one');
    assert(out.matches[1].score === 0.9, 'the blocked match keeps its original score');
    assert(out.blockedCount === 1, 'blocked count reported');
  });

  section('Market report');

  await atest('buildReport: aggregates skills, locations and totals', async () => {
    const jobs = [
      { title: 'Python Developer', description: 'python linux', company: 'Acme', location: 'Berlin, DE' },
      { title: 'Python Engineer',  description: 'python',       company: 'Globex', location: 'Berlin' },
      { title: 'SOC Analyst',      description: 'incident response', company: 'SecOps', location: 'Munich' },
    ];
    const report = await buildReport(jobs, { findSkills }, 'python');
    assertEqual(report.total_jobs, 3, 'counts all jobs');
    assert(report.top_skills.length > 0, 'skills aggregated');
    assert(report.top_locations.some(l => l.name === 'Berlin' && l.count === 2), 'Berlin counted twice');
    assert(typeof report.summary === 'string' && report.summary.length > 0, 'summary produced');
  });

  // ── RAG: embeddings maths (pure, no API) ─────────────────────────────────
  section('RAG — embeddings');

  await atest('cosine: identical vectors = 1, orthogonal = 0', async () => {
    assert(Math.abs(embeddings.cosine([1, 2, 3], [1, 2, 3]) - 1) < 1e-9, 'identical → 1');
    assert(Math.abs(embeddings.cosine([1, 0], [0, 1]) - 0) < 1e-9, 'orthogonal → 0');
    assertEqual(embeddings.cosine([1, 2], [1, 2, 3]), 0, 'length mismatch → 0');
  });

  await atest('relevance: calibrates raw cosine to an honest 0..1', async () => {
    assertEqual(embeddings.relevance(0.55), 0, 'at/below floor → 0');
    assertEqual(embeddings.relevance(0.40), 0, 'below floor clamps to 0');
    assertEqual(embeddings.relevance(0.82), 1, 'at/above ceil → 1');
    const mid = embeddings.relevance(0.685); // midpoint of [0.55, 0.82]
    assert(mid > 0.45 && mid < 0.55, `midpoint ≈ 0.5 (got ${mid.toFixed(3)})`);
    assert(embeddings.relevance(0.56) < embeddings.relevance(0.81), 'monotonic (preserves ranking)');
  });

  // ── LangGraph: routing + Writer⇄Critic loop (mocked LLM, deterministic) ───
  section('LangGraph — multi-agent pipeline');

  const gDeps = {
    findSkills: () => [{ key: 'siem', label: 'SIEM' }],
    analyzeRoles: () => [{ name: 'SOC Analyst', score: 0.8 }],
    allSkills: () => [{ key: 'siem', label: 'SIEM' }, { key: 'edr', label: 'EDR' }],
    scoreJob: () => ({ score: 0.8, breakdown: {} }),
    recommend: () => [],
  };
  const noRag = { isAvailable: () => false, retrieve: async () => [] };

  await atest('graph: Writer⇄Critic loop refines until the quality bar', async () => {
    let criticCalls = 0;
    const mockLlm = {
      isAvailable: () => true,
      chat: async ({ system }) => {
        if (/Critic/.test(system)) { criticCalls++; return JSON.stringify({ score: criticCalls === 1 ? 50 : 95, feedback: 'add specifics' }); }
        return 'Dear Manager, a tailored letter mentioning SIEM and Splunk.';
      },
    };
    const r = await graph.runGraph(
      { cvText: 'siem splunk', profile: { title: 'SOC' }, job: { title: 'SOC Analyst' }, jobDescription: 'monitor SIEM alerts' },
      gDeps, mockLlm, noRag,
    );
    assert(r.coverLetter.length > 0, 'produces a letter');
    assertEqual(r.revisions, 2, 'looped once (score 50 → refine → 95)');
    assertEqual(r.score, 95, 'final Critic score above the bar');
    assert(r.trace.some(t => t.node === 'Scout') && r.trace.some(t => t.node === 'Critic'), 'trace records the path');
  });

  await atest('graph: conditional route — no job → no letter (ends after Matcher)', async () => {
    const mockLlm = { isAvailable: () => true, chat: async () => 'x' };
    const r = await graph.runGraph({ cvText: 'siem', profile: {}, job: null, jobDescription: '' }, gDeps, mockLlm, noRag);
    assertEqual(r.coverLetter, '', 'routed straight to END');
    assertEqual(r.revisions, 0, 'Writer never ran');
  });

  await atest('graph: per-node error isolation (LLM failure → trace, no crash)', async () => {
    const throwLlm = { isAvailable: () => true, chat: async () => { throw new Error('boom'); } };
    const r = await graph.runGraph({ cvText: 'siem', profile: {}, job: { title: 'X' }, jobDescription: 'x' }, gDeps, throwLlm, noRag);
    assert(r.trace.some(t => /error/i.test(t.note)), 'error captured in the trace, pipeline still returns');
  });

  await atest('graph: a Critic that could not run reports no score, it does not invent one', async () => {
    const throwLlm = { isAvailable: () => true, chat: async () => { throw new Error('boom'); } };
    const r = await graph.runGraph({ cvText: 'siem', profile: {}, job: { title: 'X' }, jobDescription: 'x' }, gDeps, throwLlm, noRag);
    assertEqual(r.scored, false, 'the run is marked unscored');
    assertEqual(r.score, null, 'no grade is handed to the caller');
  });

  // The Sprint-3 review produced "40+ custom detection rules" and a 22% false-
  // positive reduction from a CV saying only "Splunk and Python". The rubric was
  // paying for numbers and the Critic never saw the CV, so it could not have known.
  await atest('graph: an invented metric caps the score and cannot clear the bar', async () => {
    const FABRICATED = 'I wrote 40+ custom detection rules and cut false positives by 22%.';
    const judgeLlm = {
      isAvailable: () => true,
      chat: async ({ system }) => (/Critic/.test(system)
        // A Critic that lists fabrications and then awards 88 anyway: the cap must
        // override its own arithmetic, not trust it.
        ? JSON.stringify({ score: 88, feedback: 'Nicely written.',
                           unsupported: ['40+ custom detection rules', 'cut false positives by 22%'] })
        : FABRICATED),
    };
    const r = await graph.runGraph(
      { cvText: 'Splunk and Python only.', profile: {}, job: { title: 'SOC Analyst' }, jobDescription: 'x'.repeat(150) },
      gDeps, judgeLlm, noRag);
    assert(r.score <= 45, `score capped at 45, got ${r.score}`);
    assert(r.score < r.qualityBar, 'a fabricating letter cannot clear the quality bar');
    assertEqual(r.unsupported.length, 2, 'both invented claims surfaced to the caller');
    assert(r.revisions > 1, 'the loop sent it back for revision');
  });

  await atest('graph: an honest letter is not penalised for having no numbers', async () => {
    const honestLlm = {
      isAvailable: () => true,
      chat: async ({ system }) => (/Critic/.test(system)
        ? JSON.stringify({ score: 86, feedback: 'Good.', unsupported: [] })
        : 'I have used Splunk and Python during my studies.'),
    };
    const r = await graph.runGraph(
      { cvText: 'Splunk and Python only.', profile: {}, job: { title: 'SOC Analyst' }, jobDescription: 'x'.repeat(150) },
      gDeps, honestLlm, noRag);
    assertEqual(r.score, 86, 'no cap applied when nothing is unsupported');
    assertEqual(r.unsupported.length, 0, 'no claims flagged');
  });

  await atest('graph: the Critic receives the profile, or it cannot check anything', async () => {
    let criticSawProfile = false;
    const spyLlm = {
      isAvailable: () => true,
      chat: async ({ system, user }) => {
        if (/Critic/.test(system)) {
          criticSawProfile = /<profile>[\s\S]*Splunk home lab[\s\S]*<\/profile>/.test(user);
          return JSON.stringify({ score: 90, feedback: 'ok', unsupported: [] });
        }
        return 'draft';
      },
    };
    await graph.runGraph(
      { cvText: 'Splunk home lab', profile: {}, job: { title: 'X' }, jobDescription: 'x'.repeat(150) },
      gDeps, spyLlm, noRag);
    assert(criticSawProfile, 'the CV reaches the Critic as ground truth');
  });

  const total = passed + failed + skipped;
  const bar   = '─'.repeat(50);

  console.log('\n' + c.dim(bar));
  console.log(c.bold('  Test Results'));
  console.log(c.dim(bar));
  console.log(`  ${c.green('✓ Passed')}  ${String(passed).padStart(3)}/${total}`);
  if (failed  > 0) console.log(`  ${c.red('✗ Failed')}  ${String(failed).padStart(3)}/${total}`);
  if (skipped > 0) console.log(`  ${c.yellow('⊘ Skipped')} ${String(skipped).padStart(3)}/${total}`);
  console.log(c.dim(bar));

  if (failed === 0) {
    console.log(c.green(c.bold('\n  All tests passed — Sprint 1 + Multi-Agent architecture verified!\n')));
  } else {
    console.log(c.red(c.bold(`\n   ${failed} test(s) failed — please review above.\n`)));
    process.exit(1);
  }
})();
