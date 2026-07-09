/**
 * career-path.js — Career pathways per domain, in the spirit of CyberSeek's
 * pathway chart but built from this project's own taxonomy and aimed at the
 * German market.
 *
 * Nothing is copied from CyberSeek: their data is US-sourced and licensed. What
 * is borrowed is the shape — feeder roles → entry → mid → advanced, each role
 * carrying skills and certifications.
 *
 * The LLM writes the pathway, but it does not invent the vocabulary: the prompt
 * is grounded in the skills and certifications of `security-skills.js` for that
 * domain, which keeps role requirements consistent with the gap analysis the
 * rest of the app performs. Without an LLM key the module still answers, from a
 * deterministic template built off the same taxonomy.
 */
const fs = require('fs');
const path = require('path');
const llm = require('./llm.js');
const { SECURITY_GROUPS, SECURITY_ROLES } = require('../security-skills.js');

// Bumped when the prompt or the response shape changes, so stale cache entries
// are ignored rather than served.
const SCHEMA_VERSION = 3;

// Each domain names the taxonomy category it draws its vocabulary from, and the
// role title its ladder is built around — deriving that title from the skills
// would put "Junior Penetration Tester" at the top of Software Development.
// Feeder domains borrow the category of the specialisation they lead into.
const DOMAINS = {
  // ── Security specialisations ──
  soc:          { label: 'Blue Team / SOC & Detection',        title: 'SOC Analyst',                 category: 'Defensive Security / Blue Team / SOC', kind: 'security' },
  pentest:      { label: 'Offensive Security / Pentesting',    title: 'Penetration Tester',          category: 'Offensive Security / Pentesting',      kind: 'security' },
  dfir:         { label: 'Incident Response & Forensics',      title: 'Incident Responder',          category: 'DFIR & Forensics',                     kind: 'security' },
  malware:      { label: 'Malware Analysis & Reverse Eng.',    title: 'Malware Analyst',             category: 'Malware Analysis & Reverse Engineering', kind: 'security' },
  appsec:       { label: 'Application & Web Security',         title: 'Application Security Engineer', category: 'Application & Web Security',         kind: 'security' },
  netsec:       { label: 'Network Security',                   title: 'Network Security Engineer',   category: 'Network Security',                     kind: 'security' },
  cloud:        { label: 'Cloud Security',                     title: 'Cloud Security Engineer',     category: 'Cloud Security',                       kind: 'security' },
  devsecops:    { label: 'DevSecOps',                          title: 'DevSecOps Engineer',          category: 'Cloud Security',                       kind: 'security' },
  iam:          { label: 'Identity & Access Management',       title: 'IAM Engineer',                category: 'Identity & Access Management',         kind: 'security' },
  grc:          { label: 'GRC, Compliance & Audit',            title: 'Information Security Officer', category: 'GRC, Compliance & Frameworks',        kind: 'security' },
  crypto:       { label: 'Cryptography & PKI',                 title: 'PKI Engineer',                category: 'Cryptography & PKI',                   kind: 'security' },
  otsec:        { label: 'OT / ICS / IoT Security',            title: 'OT Security Engineer',        category: 'OT / IoT / Mobile Security',           kind: 'security' },
  threatintel:  { label: 'Threat Intelligence',                title: 'Threat Intelligence Analyst', category: 'Defensive Security / Blue Team / SOC', kind: 'security' },
  vulnmgmt:     { label: 'Vulnerability Management',           title: 'Vulnerability Analyst',       category: 'Offensive Security / Pentesting',      kind: 'security' },
  secarch:      { label: 'Security Architecture',              title: 'Security Architect',          category: 'Network Security',                     kind: 'security' },
  privacy:      { label: 'Data Protection & Privacy',          title: 'Data Protection Officer',     category: 'GRC, Compliance & Frameworks',         kind: 'security' },
  mobile:       { label: 'Mobile & Embedded Security',         title: 'Mobile Security Engineer',    category: 'OT / IoT / Mobile Security',           kind: 'security' },

  // ── Pathways into security ──
  // `leadsToKeys` wires the chart: these are the six categories a beginner can
  // start from, and each says which specialisations it actually opens. The chart
  // shows all six for every domain, and only draws an edge from the ones that lead
  // there — a beginner should see every door, not just the ones behind them.
  'it-support': { label: 'IT Support & Helpdesk',              title: 'IT Support Specialist',       category: 'Operating Systems & Infrastructure',   kind: 'pathway', leadsTo: 'Blue Team / SOC & Detection',              leadsToKeys: ['soc', 'netsec', 'iam', 'vulnmgmt'],
    why: 'You handle real incidents from day one, learn how users break things, and see the whole estate — the exact instincts a SOC looks for.' },
  sysadmin:     { label: 'System Administration',              title: 'System Administrator',        category: 'Operating Systems & Infrastructure',   kind: 'pathway', leadsTo: 'Network Security, Cloud Security',         leadsToKeys: ['soc', 'netsec', 'cloud', 'iam', 'crypto', 'vulnmgmt', 'secarch'],
    why: 'You already run Windows and Linux, Active Directory and patching. Defending a system starts with knowing how it is built.' },
  network:      { label: 'Networking & Infrastructure',        title: 'Network Administrator',       category: 'Network Security',                     kind: 'pathway', leadsTo: 'Network Security',                        leadsToKeys: ['netsec', 'soc', 'otsec', 'secarch'],
    why: 'Routing, segmentation and firewalls are your daily work. Most attacks travel over a network somebody designed.' },
  devops:       { label: 'DevOps & Cloud',                     title: 'DevOps Engineer',             category: 'Cloud Security',                       kind: 'pathway', leadsTo: 'Cloud Security, DevSecOps',               leadsToKeys: ['cloud', 'devsecops', 'appsec'],
    why: 'You own pipelines, IAM policies and infrastructure as code — the three places cloud breaches actually happen.' },
  software:     { label: 'Software Development',               title: 'Software Developer',          category: 'Application & Web Security',           kind: 'pathway', leadsTo: 'Application Security, DevSecOps',         leadsToKeys: ['appsec', 'devsecops', 'malware', 'pentest', 'mobile', 'vulnmgmt'],
    why: 'You can read code, so you can find the flaw in it — and reverse the binary an attacker left behind.' },
  data:         { label: 'Data & Analytics',                   title: 'Data Analyst',                category: 'Defensive Security / Blue Team / SOC', kind: 'pathway', leadsTo: 'Detection Engineering, Threat Intelligence', leadsToKeys: ['soc', 'dfir', 'grc', 'threatintel', 'privacy'],
    why: 'Detection is a data problem: baselines, outliers, correlation. You already know how to make a dataset confess.' },
};

const isDomain = (d) => Object.prototype.hasOwnProperty.call(DOMAINS, d);
const listDomains = () => Object.entries(DOMAINS).map(([key, d]) => ({
  key, label: d.label, kind: d.kind, title: d.title, leadsToKeys: d.leadsToKeys || null, why: d.why || null,
}));

function skillsOf(category) {
  const g = SECURITY_GROUPS.find((x) => x.category === category);
  return g ? g.skills.map((s) => s.label) : [];
}
const CERTS = skillsOf('Certifications');

/** Roles already declared in the taxonomy, so the LLM reuses our titles. */
function knownRoles(domainSkills) {
  const set = new Set(domainSkills.map((s) => s.toLowerCase()));
  return SECURITY_ROLES
    .filter((r) => r.required.some((k) => set.has(k.toLowerCase())))
    .map((r) => r.name);
}

// ── Persistent cache: pathways are stable and expensive, generate once ───────
const CACHE_FILE = process.env.CAREER_CACHE_FILE || path.join(__dirname, '..', '.career-paths.json');
let _cache = {};
(function loadCache() {
  try { _cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) || {}; } catch (_) { _cache = {}; }
})();
// Merge with whatever is on disk before writing. Two server processes can share
// this file — a second instance started on another port holds a snapshot from its
// own startup, and a blind overwrite would drop everything generated since.
function saveCache() {
  try {
    let onDisk = {};
    try { onDisk = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) || {}; } catch (_) { /* first write */ }
    _cache = { ...onDisk, ..._cache };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(_cache, null, 2));
  } catch (_) { /* best effort */ }
}
const cacheKey = (domain) => `${domain}|v${SCHEMA_VERSION}`;

// ── Prompt ──────────────────────────────────────────────────────────────────
const SYSTEM = [
  'You map career pathways in IT security for the GERMAN job market.',
  'Draw on what you know about real roles, tools, salaries and certifications — the vocabulary',
  'you are given is a hint about the house style, not a closed list. Prefer its wording when it',
  'fits, and otherwise name whatever the market actually asks for.',
  'Salaries are gross annual EUR ranges typical for Germany, written like "48.000 – 62.000 €".',
  'Role titles are the ones German job ads actually use. Give the German title when one is common.',
  'Answer with a single valid JSON object and nothing else: no prose, no markdown fence,',
  'no comments, no trailing commas, and never the literal "..." — every array must be complete.',
].join(' ');

function buildUser(domain) {
  const d = DOMAINS[domain];
  const skills = skillsOf(d.category);
  const roles = knownRoles(skills);

  // Every array is written out in full: an example containing "..." gets copied
  // verbatim by the model and the response stops being valid JSON.
  const role = '{"title": "…", "titleDe": "…", "salary": "…", "education": "…", '
    + '"skills": ["…", "…", "…", "…"], "certs": ["…"], "commonTitles": ["…", "…", "…"], "next": ["exact title of a role in the following level"]}';
  const shape = `{
  "summary": "two sentences on what this domain does and who it suits",
  "feeder": [
    {"title": "role that leads into this domain", "why": "one short sentence", "next": ["exact title of an Entry-level role"]},
    {"title": "…", "why": "…", "next": ["…"]},
    {"title": "…", "why": "…", "next": ["…"]}
  ],
  "levels": [
    {"name": "Entry-level", "years": "0–2 yrs", "roles": [${role}, ${role}]},
    {"name": "Mid-level",   "years": "2–5 yrs", "roles": [${role}, ${role}]},
    {"name": "Advanced",    "years": "5+ yrs",  "roles": [${role}, ${role}]}
  ]
}`;

  return [
    `Domain: ${d.label}`,
    `The ladder is built around the role "${d.title}".`,
    d.kind === 'pathway'
      ? `This is an ENTRY PATH into security. Show how the role evolves and where it crosses into security (${d.leadsTo}).`
      : 'This is a security specialisation. Show progression inside it.',
    '',
    'House vocabulary — reuse this wording where it fits, but add whatever real skills,',
    'tools and certifications the German market expects if they are missing here:',
    `  skills: ${skills.join(', ')}`,
    `  certifications: ${CERTS.join(', ')}`,
    roles.length ? `  role titles we already use: ${roles.join(', ')}` : '',
    '',
    'Exactly 3 feeder roles, exactly 2 roles per level, 4 to 6 skills and 1 to 3 certifications per role.',
    '"commonTitles" lists 3 real job-ad titles employers use for that role, German ones welcome.',
    '"education" is one short phrase, e.g. "Bachelor in Informatik or Ausbildung Fachinformatiker".',
    '"next" wires the chart: each role names the role(s) it typically leads to in the following',
    'level, copying their titles EXACTLY. Advanced roles have an empty "next".',
    '',
    `Return exactly this JSON shape, with every field filled in:\n${shape}`,
  ].filter(Boolean).join('\n');
}

/**
 * Models wrap JSON in ```json fences, prepend a sentence, leave a trailing comma,
 * or drop a bare `...` into an array to mean "and so on". Strip all of that
 * before parsing rather than failing the whole generation over punctuation.
 */
function parseJson(text) {
  let s = String(text || '').replace(/```(?:json)?/gi, '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('no JSON object in model output');
  s = s.slice(start, end + 1);
  s = s.replace(/,\s*(\.\.\.|…)\s*(?=[\]}])/g, '');   // trailing ellipsis element
  s = s.replace(/(\.\.\.|…)\s*,/g, '');               // leading ellipsis element
  s = s.replace(/,\s*(?=[\]}])/g, '');                // trailing comma
  return JSON.parse(s);
}

function validate(p) {
  if (!p || typeof p !== 'object') return false;
  if (!Array.isArray(p.levels) || p.levels.length < 2) return false;
  return p.levels.every((l) => l && typeof l.name === 'string' && Array.isArray(l.roles) && l.roles.length);
}

// ── Deterministic fallback: no key, or the model returned garbage ────────────
// It draws the same chart the LLM would: three feeder roles, two roles per
// level, wired together — so the page never degrades into an empty frame.
function templatePathway(domain) {
  const d = DOMAINS[domain];
  const skills = skillsOf(d.category);
  const roles = knownRoles(skills);
  const slice = (from, n) => skills.slice(from, from + n);
  // Taxonomy role names carry a qualifier — "SOC Analyst (Tier 1)" — which would
  // compound into "SOC Analyst (Tier 1) (Tier 1)" once we add our own.
  const plain = (s) => String(s).replace(/\s*\([^)]*\)\s*$/, '').trim();
  const base = d.title;

  // A sibling role only if the taxonomy actually names a distinct one. Inventing
  // it gives "IT Support Specialist Specialist". And a feeder domain borrows the
  // vocabulary of the specialisation it leads into, so its `roles` are security
  // roles — "Penetration Tester" has no business in Software Development.
  const sibling = d.kind !== 'security' ? null
    : roles.map(plain).find(r => r !== base && !r.includes(base) && !base.includes(r)) || null;

  const entry = [`Junior ${base}`, `${base} (Tier 1)`];
  const mid = sibling ? [base, sibling] : [base];
  const adv = [`Senior ${base}`, `${base} Architect`];

  const role = (title, salary, skillsList, certs, next) => ({
    title, titleDe: '', salary, education: 'Bachelor in Informatik or Ausbildung Fachinformatiker',
    skills: skillsList, certs, commonTitles: [title], next,
  });

  const midRoles = [role(mid[0], '55.000 – 70.000 €', slice(6, 5), ['CompTIA CySA+'], [adv[0]])];
  if (sibling) midRoles.push(role(sibling, '60.000 – 78.000 €', slice(9, 5), ['GIAC GCIH'], [adv[0], adv[1]]));

  return {
    summary: `${d.label} on the German market: how the ladder is usually climbed, from the roles people `
      + `arrive with to the senior positions ${base}s grow into.`,
    feeder: [
      { title: 'IT Support / Helpdesk', why: 'First exposure to systems, users and incidents.', next: [entry[0]] },
      { title: 'System Administrator', why: 'Operational depth on Windows and Linux.', next: [entry[0], entry[1]] },
      { title: 'Network Administrator', why: 'Understanding of traffic, segmentation and firewalls.', next: [entry[1]] },
    ],
    levels: [
      { name: 'Entry-level', years: '0–2 yrs', roles: [
        role(entry[0], '42.000 – 52.000 €', slice(0, 5), ['CompTIA Security+'], [mid[0]]),
        role(entry[1], '45.000 – 55.000 €', slice(3, 5), ['CompTIA Security+'], mid),
      ] },
      { name: 'Mid-level', years: '2–5 yrs', roles: midRoles },
      { name: 'Advanced', years: '5+ yrs', roles: [
        role(adv[0], '75.000 – 95.000 €', slice(12, 5), ['CISSP'], []),
        role(adv[1], '85.000 – 110.000 €', slice(2, 5), ['CISSP', 'CISM'], []),
      ] },
    ],
  };
}

/**
 * Pathway for one domain. Cached on disk: the answer does not depend on the
 * user, only on the domain, so the first visitor pays for everyone.
 */
async function pathwayFor(domain, { refresh = false } = {}) {
  if (!isDomain(domain)) throw new Error(`unknown domain: ${domain}`);
  const key = cacheKey(domain);
  if (!refresh && _cache[key]) return { ..._cache[key], cached: true };

  let payload = null;
  let lastErr = null;

  if (llm.isAvailable()) {
    // Two attempts: the first failure is usually malformed JSON, and a second
    // sampling at a lower temperature almost always parses.
    for (const temperature of [0.3, 0.1]) {
      try {
        const text = await llm.chat({ system: SYSTEM, user: buildUser(domain), maxTokens: 3000, temperature });
        const parsed = parseJson(text);
        if (!validate(parsed)) throw new Error('model output failed validation');
        payload = { ...parsed, source: 'llm', model: llm.provider() };
        break;
      } catch (err) { lastErr = err; }
    }
  }

  const generated = Boolean(payload);
  if (!payload) {
    payload = { ...templatePathway(domain), source: 'template' };
    if (lastErr) payload.note = `Model unavailable: ${lastErr.message}`;
  }

  payload.domain = domain;
  payload.label = DOMAINS[domain].label;
  payload.kind = DOMAINS[domain].kind;

  // Only a real generation is worth keeping. Caching a template would freeze a
  // transient failure — a rate limit, a bad sample — into a permanent answer.
  if (generated) { _cache[key] = payload; saveCache(); }
  return { ...payload, cached: false };
}

/**
 * Every domain at a glance: what leads into it and what the first role is.
 * Never calls the model — an overview of eighteen domains would fire eighteen
 * generations. Cached pathways are used as they are; the rest fall back to the
 * deterministic outline, which is enough to name the roles.
 */
function overview() {
  return Object.entries(DOMAINS).map(([key, d]) => {
    const cached = _cache[cacheKey(key)];
    const p = cached || templatePathway(key);
    return {
      key,
      label: d.label,
      kind: d.kind,
      title: d.title,
      summary: p.summary || '',
      feeder: (p.feeder || []).map(f => f.title),
      entry: (p.levels?.[0]?.roles || []).map(r => r.title),
      advanced: (p.levels?.[p.levels.length - 1]?.roles || []).map(r => r.title),
      // A way in leads to a security domain, not to a senior version of itself.
      leadsTo: d.leadsTo || null,
      source: cached ? 'llm' : 'template',
    };
  });
}

/**
 * One chart for the whole field, the way CyberSeek does it: the six beginner
 * categories, then every security job laid out by seniority, each wired to the
 * next rung of its own specialisation.
 *
 * Assembled from the per-domain pathways rather than asked of the model: it must
 * exist even when every quota is spent. One role per level per domain keeps the
 * chart readable — seventeen domains times two roles would be a wall.
 */
function graph() {
  const security = Object.entries(DOMAINS).filter(([, d]) => d.kind === 'security');
  const pathways = Object.entries(DOMAINS).filter(([, d]) => d.kind === 'pathway');

  const levels = [
    { name: 'Entry-level', years: '0–2 yrs', roles: [] },
    { name: 'Mid-level', years: '2–5 yrs', roles: [] },
    { name: 'Advanced', years: '5+ yrs', roles: [] },
  ];
  const entryOf = {};   // domain key → the title a feeder should point at

  const seen = new Set();
  security.forEach(([key, d]) => {
    const p = _cache[cacheKey(key)] || templatePathway(key);
    (p.levels || []).slice(0, 3).forEach((lvl, i) => {
      const role = (lvl.roles || [])[0];
      if (!role || seen.has(role.title)) return;
      seen.add(role.title);
      if (i === 0) entryOf[key] = role.title;

      // Wire this role to the first role of the next level of the same domain.
      const following = (p.levels || [])[i + 1]?.roles?.[0]?.title;
      levels[i].roles.push({
        ...role,
        domain: key,
        domainLabel: d.label,
        next: following && !seen.has(following) ? [following] : (following ? [following] : []),
      });
    });
  });

  const feeder = pathways.map(([, d]) => ({
    title: d.title,
    why: d.why || d.label,
    next: (d.leadsToKeys || []).map(k => entryOf[k]).filter(Boolean),
  }));

  return {
    domain: 'all',
    kind: 'all',
    label: 'IT Security',
    summary: 'Every security job on one chart: where people come from, the first roles that hire '
      + 'them, and what those roles grow into. Click a job to trace its path and see what it asks for.',
    source: security.every(([k]) => _cache[cacheKey(k)]) ? 'llm' : 'mixed',
    feeder,
    levels,
  };
}

module.exports = { DOMAINS, isDomain, listDomains, pathwayFor, overview, graph };
