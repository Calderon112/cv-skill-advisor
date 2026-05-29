/**
 * CyberCareer — Sprint 1 Test Suite
 * Run: node tests/test.js
 * No external test framework needed — pure Node.js
 */

const zlib   = require('zlib');
const crypto = require('crypto');

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

function normalize(text) {
  return text.toLowerCase().replace(/[.,;:()\-\/]/g, ' ');
}

function findSkills(text) {
  const normalized = normalize(text);
  const found = [];
  skillGroups.forEach(group => {
    group.skills.forEach(skill => {
      if (normalized.includes(skill.key)) found.push(skill);
    });
  });
  return found;
}

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

// ─────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────

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
  console.log(c.green(c.bold('\n  All tests passed — Sprint 1 functions verified!\n')));
} else {
  console.log(c.red(c.bold(`\n  ❌ ${failed} test(s) failed — please review above.\n`)));
  process.exit(1);
}
