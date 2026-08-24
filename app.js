// ── Skill / role data ─────────────────────────────────────────────────────
const skillGroups = [
  {
    category: 'Software Development',
    skills: [
      { key: 'javascript', label: 'JavaScript' },
      { key: 'typescript', label: 'TypeScript' },
      { key: 'python', label: 'Python' },
      { key: 'java', label: 'Java' },
      { key: 'c#', label: 'C# / .NET' },
      { key: 'react', label: 'React' },
      { key: 'node.js', label: 'Node.js' },
      { key: 'sql', label: 'SQL / Databases' },
      { key: 'git', label: 'Git / Version Control' },
      { key: 'rest api', label: 'REST APIs' },
    ]
  },
  {
    category: 'DevOps & Cloud',
    skills: [
      { key: 'docker', label: 'Docker' },
      { key: 'kubernetes', label: 'Kubernetes' },
      { key: 'aws', label: 'AWS' },
      { key: 'azure', label: 'Azure' },
      { key: 'gcp', label: 'Google Cloud' },
      { key: 'linux', label: 'Linux' },
      { key: 'ci/cd', label: 'CI/CD' },
      { key: 'terraform', label: 'Terraform / IaC' },
      { key: 'ansible', label: 'Ansible' },
      { key: 'monitoring', label: 'Monitoring (Grafana, Prometheus)' },
    ]
  },
  {
    category: 'Cybersecurity',
    skills: [
      { key: 'network security', label: 'Network security' },
      { key: 'penetration testing', label: 'Penetration testing' },
      { key: 'incident response', label: 'Incident response' },
      { key: 'vulnerability analysis', label: 'Vulnerability analysis' },
      { key: 'cryptography', label: 'Cryptography' },
      { key: 'siem', label: 'SIEM (Splunk, QRadar)' },
      { key: 'risk assessment', label: 'Risk assessment' },
      { key: 'web application security', label: 'Web application security' },
      { key: 'compliance', label: 'Compliance (ISO 27001, GDPR)' },
    ]
  },
  {
    category: 'Data & AI',
    skills: [
      { key: 'data analysis', label: 'Data analysis' },
      { key: 'machine learning', label: 'Machine learning' },
      { key: 'deep learning', label: 'Deep learning' },
      { key: 'pandas', label: 'Pandas / NumPy' },
      { key: 'power bi', label: 'Power BI / Tableau' },
      { key: 'excel', label: 'Excel / Spreadsheets' },
      { key: 'statistics', label: 'Statistics' },
      { key: 'nlp', label: 'NLP' },
      { key: 'data engineering', label: 'Data engineering' },
    ]
  },
  {
    category: 'Design & UX',
    skills: [
      { key: 'figma', label: 'Figma' },
      { key: 'ui/ux', label: 'UI/UX Design' },
      { key: 'adobe', label: 'Adobe Suite (Illustrator/Photoshop)' },
      { key: 'prototyping', label: 'Prototyping' },
      { key: 'user research', label: 'User research' },
      { key: 'accessibility', label: 'Accessibility (WCAG)' },
    ]
  },
  {
    category: 'Healthcare & Nursing',
    skills: [
      { key: 'patient care',         label: 'Patient care / Pflege',         aliases: ['patientenpflege','pflege','pflegefachkraft','pflegehilfskraft','kranken','altenpflege','grundpflege','nursing'] },
      { key: 'medical documentation', label: 'Medical documentation',         aliases: ['pflegedokumentation','medizinische dokumentation','dokumentation','pflegebericht'] },
      { key: 'anesthesia',            label: 'Anesthesia assistance',          aliases: ['anästhesie','anesthesia','narkose','operationssaal','op-saal'] },
      { key: 'obstetrics',            label: 'Obstetrics / Geburtshilfe',      aliases: ['entbindung','geburtshilfe','entbindungsstation','midwifery','hebamme'] },
      { key: 'first aid',             label: 'First aid / Erste Hilfe',        aliases: ['erste hilfe','notfallversorgung','notfallpflege','wundversorgung'] },
      { key: 'medication',            label: 'Medication administration',       aliases: ['medikamente','medikation','arzneimittel','injektionen','medication'] },
      { key: 'hygiene',               label: 'Hygiene & infection control',     aliases: ['desinfektion','infektionsschutz','sterilisation','hygienemaßnahmen'] },
      { key: 'empathy',               label: 'Empathy / Einfühlungsvermögen',   aliases: ['empathie','einfühlungsvermögen','einfühlsam','menschlich','mitgefühl'] },
      { key: 'patient communication', label: 'Patient communication',           aliases: ['patientenkommunikation','beratung','betreuung','betreuungspflege','pflegeberatung'] },
      { key: 'biology',               label: 'Biology / Biologie',              aliases: ['biologie','biologiekenntnisse','naturwissenschaft','anatomie','physiologie'] },
    ]
  },
  {
    category: 'Business & Management',
    skills: [
      { key: 'project management', label: 'Project management',    aliases: ['projektmanagement','projektleitung'] },
      { key: 'agile',              label: 'Agile / Scrum',          aliases: ['scrum','kanban'] },
      { key: 'communication',      label: 'Communication',          aliases: ['kommunikation','kommunikationsfähigkeit','kommunikationsstärke','kommunikativ'] },
      { key: 'leadership',         label: 'Leadership',             aliases: ['führung','führungskompetenz','teamleitung'] },
      { key: 'teamwork',           label: 'Teamwork',               aliases: ['teamfähigkeit','teamarbeit','teamgeist','zusammenarbeit'] },
      { key: 'problem solving',    label: 'Problem solving',        aliases: ['problemlösung','problemlösungskompetenz','analytisch'] },
      { key: 'documentation',      label: 'Documentation',          aliases: ['dokumentation','berichterstattung'] },
      { key: 'research',           label: 'Research & analysis',    aliases: ['recherche','forschung','analyse'] },
      { key: 'negotiation',        label: 'Negotiation',            aliases: ['verhandlung','verhandlungsgeschick'] },
      { key: 'client management',  label: 'Client management',      aliases: ['kundenbetreuung','kundenkommunikation'] },
      { key: 'reliability',        label: 'Reliability / Zuverlässigkeit', aliases: ['zuverlässigkeit','zuverlässig','verantwortungsbewusstsein','verantwortung'] },
      { key: 'adaptability',       label: 'Adaptability / Flexibilität',   aliases: ['flexibilität','anpassungsfähigkeit','flexibel','anpassung'] },
      { key: 'time management',    label: 'Time management',               aliases: ['zeitmanagement','selbstorganisation','priorisierung'] },
      { key: 'motivation',         label: 'Motivation / Engagement',       aliases: ['motivation','engagement','lernbereitschaft','eigeninitiative','fleiß'] },
      { key: 'organization',       label: 'Organisation / Planning',       aliases: ['organisationstalent','organisation','planung','organisationsfähigkeit'] },
      { key: 'social skills',      label: 'Social skills',                 aliases: ['sozialkompetenz','soziale kompetenz','sozialkommunikation'] },
    ]
  },
  {
    category: 'Finance & Accounting',
    skills: [
      { key: 'financial analysis', label: 'Financial analysis' },
      { key: 'accounting', label: 'Accounting' },
      { key: 'budgeting', label: 'Budgeting & forecasting' },
      { key: 'auditing', label: 'Auditing' },
      { key: 'sap', label: 'SAP / ERP' },
    ]
  },
  {
    category: 'Marketing & Sales',
    skills: [
      { key: 'seo', label: 'SEO / SEM' },
      { key: 'content marketing', label: 'Content marketing' },
      { key: 'social media', label: 'Social media management' },
      { key: 'google analytics', label: 'Google Analytics / GA4' },
      { key: 'crm', label: 'CRM (Salesforce, HubSpot)' },
      { key: 'sales', label: 'Sales & business development' },
      { key: 'email marketing', label: 'Email marketing' },
    ]
  },
  {
    category: 'HR & Recruiting',
    skills: [
      { key: 'recruitment', label: 'Recruitment & hiring' },
      { key: 'employee relations', label: 'Employee relations' },
      { key: 'payroll', label: 'Payroll & compensation' },
      { key: 'onboarding', label: 'Onboarding & training' },
      { key: 'hris', label: 'HRIS (Workday, SAP HR)' },
    ]
  },
  {
    category: 'Engineering & Science',
    skills: [
      { key: 'cad', label: 'CAD (AutoCAD, SolidWorks)' },
      { key: 'quality assurance', label: 'Quality assurance / QA' },
      { key: 'lean', label: 'Lean / Six Sigma' },
      { key: 'embedded systems', label: 'Embedded systems' },
      { key: 'matlab', label: 'MATLAB / Simulation' },
    ]
  }
];

const roles = [
  // Software
  { name: 'Software Developer',       required: ['javascript', 'python', 'git', 'rest api', 'problem solving'] },
  { name: 'Full-Stack Developer',      required: ['javascript', 'react', 'node.js', 'sql', 'git'] },
  { name: 'Backend Developer',         required: ['python', 'java', 'sql', 'rest api', 'docker'] },
  // DevOps
  { name: 'DevOps Engineer',           required: ['docker', 'kubernetes', 'ci/cd', 'linux', 'aws'] },
  { name: 'Cloud Architect',           required: ['aws', 'azure', 'terraform', 'kubernetes', 'monitoring'] },
  // Data / AI
  { name: 'Data Analyst',              required: ['data analysis', 'sql', 'excel', 'power bi', 'statistics'] },
  { name: 'Data Scientist',            required: ['machine learning', 'python', 'pandas', 'statistics', 'data analysis'] },
  { name: 'ML Engineer',               required: ['machine learning', 'deep learning', 'python', 'pandas', 'git'] },
  // Cybersecurity
  { name: 'SOC Analyst',               required: ['network security', 'incident response', 'siem', 'linux', 'documentation'] },
  { name: 'Penetration Tester',        required: ['penetration testing', 'vulnerability analysis', 'linux', 'python', 'web application security'] },
  { name: 'Security Architect',        required: ['risk assessment', 'network security', 'compliance', 'cloud security', 'documentation'] },
  // Design
  { name: 'UX Designer',               required: ['figma', 'ui/ux', 'user research', 'prototyping', 'communication'] },
  { name: 'UI/UX Designer',            required: ['figma', 'adobe', 'ui/ux', 'prototyping', 'accessibility'] },
  // Business
  { name: 'Project Manager',           required: ['project management', 'agile', 'communication', 'risk assessment', 'documentation'] },
  { name: 'Business Analyst',          required: ['data analysis', 'documentation', 'sql', 'communication', 'problem solving'] },
  { name: 'Management Consultant',     required: ['research', 'communication', 'problem solving', 'documentation', 'client management'] },
  // Finance
  { name: 'Financial Analyst',         required: ['financial analysis', 'excel', 'accounting', 'data analysis', 'communication'] },
  { name: 'Accountant',                required: ['accounting', 'auditing', 'excel', 'sap', 'documentation'] },
  // Marketing
  { name: 'Digital Marketing Manager', required: ['seo', 'content marketing', 'google analytics', 'social media', 'email marketing'] },
  { name: 'Sales Manager',             required: ['sales', 'crm', 'negotiation', 'communication', 'client management'] },
  // HR
  { name: 'HR Manager',                required: ['recruitment', 'employee relations', 'communication', 'payroll', 'hris'] },
  // Engineering
  { name: 'Mechanical Engineer',       required: ['cad', 'lean', 'quality assurance', 'documentation', 'matlab'] },
  { name: 'QA Engineer',               required: ['quality assurance', 'lean', 'documentation', 'problem solving', 'communication'] },
  // Healthcare
  { name: 'Pflegefachkraft',           required: ['patient care', 'medical documentation', 'medication', 'empathy', 'communication'] },
  { name: 'Pflegehilfskraft',          required: ['patient care', 'empathy', 'first aid', 'teamwork', 'hygiene'] },
  { name: 'Medical Assistant',         required: ['patient care', 'medical documentation', 'medication', 'hygiene', 'communication'] },
  { name: 'Hebamme / Midwife',         required: ['obstetrics', 'patient care', 'patient communication', 'empathy', 'first aid'] },
  { name: 'OP-Pflegefachkraft',        required: ['anesthesia', 'hygiene', 'patient care', 'medical documentation', 'teamwork'] },
];

const suggestionsBySkill = {
  javascript:             'Build interactive web apps and learn modern ES6+ features, async/await, and frameworks like React.',
  typescript:             'Add TypeScript to your JS projects for type safety and better tooling support.',
  python:                 'Write scripts for automation, data processing, and backend services. Great for multiple domains.',
  java:                   'Learn Java fundamentals and OOP patterns for enterprise backend development.',
  'c#':                   'Build .NET applications or Unity games — widely used in enterprise and game development.',
  react:                  'Build modern single-page applications with React, hooks, and component architecture.',
  'node.js':              'Create server-side JavaScript apps and APIs with Express.js or Fastify.',
  sql:                    'Learn SQL for querying relational databases (PostgreSQL, MySQL). Essential for most tech roles.',
  git:                    'Master Git version control — branching, merging, and pull request workflows.',
  'rest api':             'Design and consume RESTful APIs with proper HTTP methods, authentication, and documentation.',
  docker:                 'Containerize applications with Docker for consistent dev/prod environments.',
  kubernetes:             'Learn container orchestration with Kubernetes: deployments, services, and scaling.',
  aws:                    'Explore AWS cloud services: EC2, S3, Lambda, RDS. Earn AWS certifications.',
  azure:                  'Learn Microsoft Azure for enterprise cloud workloads and hybrid environments.',
  gcp:                    'Explore Google Cloud Platform services — BigQuery, Cloud Run, and GKE.',
  linux:                  'Build Linux sysadmin skills: shell scripting, process management, networking tools.',
  'ci/cd':                'Set up CI/CD pipelines with GitHub Actions, Jenkins, or GitLab CI.',
  terraform:              'Manage infrastructure as code with Terraform for reproducible cloud deployments.',
  ansible:                'Automate configuration management and deployments across servers with Ansible.',
  monitoring:             'Set up observability with Grafana, Prometheus, or Datadog for production systems.',
  'network security':     'Study firewalls, VPNs, IDS/IPS, and secure networking fundamentals.',
  'penetration testing':  'Practice ethical hacking on TryHackMe or HackTheBox. Learn tools like Metasploit, Burp Suite.',
  'incident response':    'Learn security incident lifecycle: detection, containment, eradication, and recovery.',
  'vulnerability analysis': 'Use scanners like Nessus or OpenVAS and manual pentesting techniques.',
  cryptography:           'Learn symmetric/asymmetric encryption, hashing, TLS, and digital signatures.',
  siem:                   'Get hands-on with Splunk or IBM QRadar for log correlation and threat detection.',
  'risk assessment':      'Study risk frameworks like ISO 27005 or NIST RMF. Learn threat modeling.',
  'web application security': 'Study OWASP Top 10, XSS, SQL injection, and secure coding practices.',
  compliance:             'Learn GDPR, ISO 27001, SOC 2, and NIST frameworks for security compliance.',
  'data analysis':        'Practice data cleaning, exploratory analysis, and visualization in Python or R.',
  'machine learning':     'Study supervised/unsupervised ML algorithms with scikit-learn and hands-on datasets.',
  'deep learning':        'Build neural networks with PyTorch or TensorFlow for CV, NLP, or time-series tasks.',
  pandas:                 'Master pandas and NumPy for data manipulation and numerical computation in Python.',
  'power bi':             'Build dashboards and reports in Power BI or Tableau to communicate data insights.',
  excel:                  'Learn advanced Excel: pivot tables, VLOOKUP, Power Query, and financial modeling.',
  statistics:             'Study probability, hypothesis testing, regression, and A/B testing for data roles.',
  nlp:                    'Build text classification, sentiment analysis, or chatbot systems using NLP libraries.',
  'data engineering':     'Learn ETL pipelines, Apache Spark, Airflow, and data warehouse design.',
  figma:                  'Design UIs and prototypes in Figma. Follow atomic design principles.',
  'ui/ux':                'Take a UX design course covering user research, wireframing, and usability testing.',
  adobe:                  'Learn Adobe Illustrator and Photoshop for graphic design and visual assets.',
  prototyping:            'Build clickable prototypes in Figma or InVision to validate designs early.',
  'user research':        'Learn to run user interviews, usability studies, and synthesize research findings.',
  accessibility:          'Study WCAG 2.1 guidelines and implement accessible UI patterns.',
  'project management':   'Learn Agile, Scrum, and Kanban. Consider PMP or Prince2 certification.',
  agile:                  'Practice Scrum ceremonies, sprint planning, and retrospectives on real projects.',
  communication:          'Practice technical writing, presentations, and concise stakeholder updates.',
  leadership:             'Lead a small team or open-source project to build management and mentoring skills.',
  teamwork:               'Contribute to collaborative projects following code review and agile practices.',
  'problem solving':      'Practice algorithmic thinking with LeetCode or real-world case studies.',
  documentation:          'Write clear technical docs, runbooks, and API documentation with tools like Confluence.',
  research:               'Develop systematic research skills: literature review, data collection, synthesis.',
  negotiation:            'Study interest-based negotiation and practice with role-play scenarios.',
  'client management':    'Build skills in expectation setting, escalation handling, and client communication.',
  'financial analysis':   'Learn financial statement analysis, DCF valuation, and ratio analysis.',
  accounting:             'Study double-entry bookkeeping, IFRS/GAAP standards, and balance sheet analysis.',
  budgeting:              'Practice building annual budgets, rolling forecasts, and variance analysis.',
  auditing:               'Learn internal audit methodologies and risk-based audit planning.',
  sap:                    'Get certified in SAP FI/CO or MM modules for enterprise resource planning.',
  seo:                    'Learn on-page SEO, technical SEO, backlink building, and keyword research.',
  'content marketing':    'Develop a content strategy with blogs, case studies, and lead magnets.',
  'social media':         'Build a content calendar and community management skills across platforms.',
  'google analytics':     'Master GA4 for traffic analysis, conversion funnels, and campaign reporting.',
  crm:                    'Get certified in Salesforce or HubSpot CRM for pipeline management.',
  sales:                  'Study SPIN Selling, solution selling, and objection handling techniques.',
  'email marketing':      'Build automated email workflows in Mailchimp or HubSpot for lead nurturing.',
  recruitment:            'Learn sourcing, structured interviewing, and employer branding strategies.',
  'employee relations':   'Study labor law, conflict resolution, and performance management frameworks.',
  payroll:                'Learn payroll processing, tax compliance, and benefits administration.',
  onboarding:             'Design structured onboarding programs that ramp new employees quickly.',
  hris:                   'Get certified in Workday or SAP HCM for HR information systems.',
  cad:                    'Master AutoCAD or SolidWorks for 2D/3D mechanical or architectural design.',
  'quality assurance':    'Learn ISO 9001, FMEA, control charts, and statistical process control.',
  lean:                   'Study Lean manufacturing and Six Sigma — consider Green Belt certification.',
  'embedded systems':     'Program microcontrollers (Arduino, STM32) with C/C++ for hardware projects.',
  matlab:                 'Learn MATLAB for numerical computing, simulations, and control system design.',
  'patient care':         'Erweitere deine Pflegekompetenz durch Fortbildungen (z.B. Palliativpflege, Wundversorgung, Demenzbetreuung).',
  'medical documentation':'Übe strukturierte Pflegedokumentation nach SIS® oder ATL-Methode. Gute Doku schützt Patienten und Pflegekräfte.',
  anesthesia:             'Vertiefe Kenntnisse in Anästhesiepflege: Monitoring, Beatmungsgeräte, Notfallmanagement im OP.',
  obstetrics:             'Fortbildungen in CTG-Überwachung, Geburtsvorbereitung und Wochenbettbetreuung stärken dein Profil.',
  'first aid':            'Erneuere deinen Erste-Hilfe-Kurs und lerne Reanimationstechniken (BLS/ALS) auf dem neuesten Stand.',
  medication:             'Lerne sichere Medikamentengabe: Dosierungsrechnung, Injektionstechniken, Interaktionsprüfung.',
  hygiene:                'Vertiefe Krankenhaushygiene (RKI-Richtlinien, MRSA-Prophylaxe, steriles Arbeiten).',
  empathy:                'Empathie ist in Pflege und Sozialarbeit entscheidend — übe aktives Zuhören und deeskalative Kommunikation.',
  'patient communication':'Kommunikationstraining für Pflege: Überbringen schlechter Nachrichten, Angehörigengespräche, interkulturelle Kommunikation.',
  biology:                'Vertiefe Anatomie & Physiologie als Grundlage für Pflegebeschreibungen und Diagnostikverständnis.',
  reliability:            'Zuverlässigkeit ist deine Stärke — betone in Bewerbungen konkrete Beispiele (Schichtpünktlichkeit, Eigeninitiative).',
  adaptability:           'Flexibilität ist in der Pflege sehr gefragt — hebe hervor, dass du Nacht- und Wochenendschichten übernehmen kannst.',
  'time management':      'Zeitmanagement in der Pflege: Lerne Prioritätensetzen bei mehreren Patienten und Schichtübergabe-Methoden (SBAR).',
  motivation:             'Deine Lernbereitschaft ist ein großer Vorteil — zeige sie durch Fortbildungsnachweise und Eigeninitiative.',
  organization:           'Organisationstalent in der Pflege: Pflegeplanung, Dienstplankoordination, Materialbewirtschaftung.',
  'social skills':        'Sozialkompetenz ist in der Pflege unverzichtbar — betone Erfahrungen mit vulnerablen Patientengruppen.',
};

// ── State ─────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'careerai-token';
const USER_KEY  = 'careerai-user';
const APPS_KEY  = 'careerai-apps';

// Which account the cached profile and application list on this device belong to.
//
// Without this, careerai-profile and careerai-apps were plain device-wide keys that
// no sign-out ever removed: signing in as a second user showed the first user's CV,
// photo, email, phone and nationality. Same browser, so the server never saw
// anything wrong — the data never left the machine, it just outlived the session
// that owned it. On a shared computer that is a personal-data leak.
//
// The username, not the display name: two accounts can share "Jardel Kenne".
const CACHE_OWNER_KEY = 'careerai-cache-owner';

// Device preferences, deliberately NOT cleared on sign-out: they belong to the
// browser, not the account. Everything else keyed per user must be listed in
// clearUserData below.
const PER_USER_KEYS = [APPS_KEY, 'careerai-profile'];

const state = {
  token:     localStorage.getItem(TOKEN_KEY) || null,
  user:      localStorage.getItem(USER_KEY)  || null,
  cvText:    '',
  analysis:  null,
  jobs:      [],
  matches:   [],
  apps:      JSON.parse(localStorage.getItem(APPS_KEY) || '[]'),
  docsCount: 0,
  online:    false
};

// ── Helpers ───────────────────────────────────────────────────────────────
const $   = id => document.getElementById(id);
const esc = s  => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const normalize = t => t.toLowerCase().replace(/[.,;:()\-\/]/g, ' ');

// Pages fetched per job board. Deeper searches return more offers but the boards
// rate-limit us: at 20 pages Arbeitnow starts refusing the second search of a
// session. 10 keeps the extra coverage without losing a source.
const SCRAPE_PAGE_DEPTH = 10;

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

// ── Toast notification system ──────────────────────────────────────────────
function toast(msg, type = 'info') {
  const wrap = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-container';
    document.body.appendChild(el);
    return el;
  })();
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 3500);
}

// ── Skill detection (multilingual) ────────────────────────────────────────
function findSkillsLocal(text) {
  return SkillMatcher.findSkills(text, skillGroups);
}

function analyzeRolesLocal(foundKeys) {
  return roles
    .map(role => {
      const missing = role.required.filter(k => !foundKeys.includes(k));
      const score   = (role.required.length - missing.length) / role.required.length;
      return { name: role.name, matched: role.required.length - missing.length, total: role.required.length, missing, score };
    })
    .filter(r => r.score >= 0.35)
    .sort((a, b) => b.score - a.score);
}

// Detect dominant domain from found skills
function detectDomain(foundKeys) {
  const domainScore = {};
  skillGroups.forEach(g => {
    const matches = g.skills.filter(s => foundKeys.includes(s.key)).length;
    if (matches > 0) domainScore[g.category] = matches;
  });
  return Object.entries(domainScore).sort((a,b) => b[1]-a[1])[0]?.[0] || 'Technology';
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ── API layer ─────────────────────────────────────────────────────────────
const baseUrl = window.location.protocol.startsWith('http') ? window.location.origin : '';

async function apiRequest(method, path, body) {
  const opts = { method, headers: { ...authHeaders() } };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(baseUrl + path, opts);
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));

    // The server refuses irreversible actions on a session that authenticated a while
    // ago. Send the user back through the provider with reauth=1, which re-prompts
    // even though the provider's own session is still valid. Handled centrally so no
    // individual caller has to remember this exists.
    if (r.status === 403 && err.code === 'reauth_required') {
      const providerId = await firstProviderId();
      if (providerId) {
        toast('Confirm it is you — signing in again.', 'info');
        setTimeout(() => { window.location.href = `${baseUrl}/api/auth/${providerId}/start?reauth=1`; }, 900);
        throw new Error(err.error || 'Re-authentication required.');
      }
    }
    throw new Error(err.error || `HTTP ${r.status}`);
  }
  return r.json();
}

// Cached: the provider list does not change while the page is open, and this runs on
// an error path where a second round trip would delay the redirect.
let _providerIdCache;
async function firstProviderId() {
  if (_providerIdCache !== undefined) return _providerIdCache;
  try {
    const d = await (await fetch(`${baseUrl}/api/auth/providers`)).json();
    _providerIdCache = (d.providers && d.providers[0] && d.providers[0].id) || null;
  } catch (_) { _providerIdCache = null; }
  return _providerIdCache;
}

const api = {
  get:    path        => apiRequest('GET',    path),
  post:   (path, b)   => apiRequest('POST',   path, b),
  put:    (path, b)   => apiRequest('PUT',    path, b),
  patch:  (path, b)   => apiRequest('PATCH',  path, b),
  delete: path        => apiRequest('DELETE', path)
};

// ── Auth modal ────────────────────────────────────────────────────────────
function showAuthModal() { $('auth-modal').classList.remove('hidden'); }
function hideAuthModal() { $('auth-modal').classList.add('hidden'); }

function setModalTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.modalTab === tab)
  );
  $('modal-login').classList.toggle('active',    tab === 'login');
  $('modal-register').classList.toggle('active', tab === 'register');
  // Reset panels have no tab of their own; the two tabs above take you back out.
  $('modal-forgot')?.classList.toggle('active', tab === 'forgot');
  $('modal-reset')?.classList.toggle('active',  tab === 'reset');
  // Hiding the tabs while resetting stops someone wandering off mid-flow and
  // losing a single-use link they cannot get back.
  document.querySelector('.modal-tabs')?.classList.toggle('hidden', tab === 'reset');
}

document.querySelectorAll('.modal-tab').forEach(b =>
  b.addEventListener('click', () => setModalTab(b.dataset.modalTab))
);

// ── Password reset ────────────────────────────────────────────────────────
$('forgot-link')?.addEventListener('click', () => setModalTab('forgot'));
$('forgot-back')?.addEventListener('click', () => setModalTab('login'));

$('modal-forgot')?.addEventListener('submit', async e => {
  e.preventDefault();
  const msg = $('forgot-msg');
  const btn = $('forgot-btn'); const orig = btn.textContent;
  msg.className = 'form-msg'; msg.textContent = '';
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await api.post('/api/auth/forgot-password', { email: $('forgot-email').value.trim() });
    msg.className = 'form-msg ok';
    // The server answers the same way whether or not the account exists, and so
    // does this. Confirming which addresses are registered would turn the form
    // into a way to enumerate the users of a job-seeking app.
    msg.textContent = r.message || 'If an account exists for that address, a reset link is on its way.';
  } catch (err) {
    msg.textContent = err.message || 'Could not send the reset link.';
  } finally { btn.disabled = false; btn.textContent = orig; }
});

let _resetToken = null;

$('modal-reset')?.addEventListener('submit', async e => {
  e.preventDefault();
  const msg = $('reset-msg');
  const btn = $('reset-btn'); const orig = btn.textContent;
  msg.className = 'form-msg'; msg.textContent = '';
  const pw = $('reset-password').value;
  if (pw.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; return; }
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    const r = await api.post('/api/auth/reset-password', { token: _resetToken, newPassword: pw });
    msg.className = 'form-msg ok';
    msg.textContent = r.revoked
      ? `Password changed — ${r.revoked} session(s) signed out. You can sign in now.`
      : 'Password changed. You can sign in now.';
    _resetToken = null;
    $('reset-password').value = '';
    setTimeout(() => setModalTab('login'), 1800);
  } catch (err) {
    msg.textContent = err.message || 'Could not set the new password.';
  } finally { btn.disabled = false; btn.textContent = orig; }
});

// Bound on submit, not on the button's click: that way Enter in either field
// confirms too, and the browser's password manager sees a real login form.
$('modal-login').addEventListener('submit', async e => {
  e.preventDefault();
  const username = $('login-username').value.trim();
  const password = $('login-password').value.trim();
  const msg = $('login-msg');
  msg.textContent = '';
  if (!username || !password) { msg.textContent = 'Enter username and password.'; return; }
  try {
    const data = await api.post('/api/login', { username, password });
    persistAuth(data.token, data.user.name, data.user.username);
    hideAuthModal();
    loadApplications();
    toast(`Welcome back, ${data.user.name}!`, 'success');
  } catch (e) {
    msg.textContent = e.message || 'Login failed.';
  }
});

$('modal-register').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    firstName: $('reg-firstname').value.trim(),
    lastName:  $('reg-lastname').value.trim(),
    birthDate: $('reg-birthdate').value,
    email:     $('reg-email').value.trim(),
    phone:     $('reg-phone').value.trim(),
    password:  $('reg-password').value,
  };
  const msg = $('register-msg');
  msg.className = 'form-msg';
  msg.textContent = '';

  // Cheap client-side checks for immediate feedback; the server re-validates all
  // of this, including the date and phone rules, and is the authority.
  if (!payload.firstName || !payload.lastName) { msg.textContent = 'First and last name are required.'; return; }
  if (!payload.birthDate) { msg.textContent = 'Please enter your date of birth.'; return; }
  if (!payload.email)     { msg.textContent = 'Please enter your email address.'; return; }
  if (!payload.phone)     { msg.textContent = 'Please enter your phone number.'; return; }
  if (payload.password.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; return; }

  const btn = $('register-btn'); const orig = btn.textContent;
  btn.disabled = true; btn.textContent = 'Creating account…';
  try {
    const data = await api.post('/api/register', payload);
    persistAuth(data.token, data.user.name, data.user.username);
    msg.className = 'form-msg ok';
    // The account exists either way — say plainly whether the email actually went
    // out rather than promising one that failed to send.
    msg.textContent = data.confirmationSent
      ? `Account created. Confirmation email sent to ${data.user.email}.`
      : 'Account created. Confirmation email could not be sent — you can resend it from My Account.';
    toast(data.confirmationSent
      ? `Welcome! Check ${data.user.email} to confirm your address.`
      : 'Welcome! Your email is not confirmed yet.', data.confirmationSent ? 'success' : 'info');
    setTimeout(hideAuthModal, data.confirmationSent ? 1400 : 2600);
    loadApplications();
  } catch (e) {
    msg.textContent = e.message || 'Registration failed.';
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
});

// ── Identity providers (OIDC) ─────────────────────────────────────────────
// Render one button per configured provider. With a self-hosted IdP this is a
// single button, and Google/GitHub/… are chosen on the provider's own page.
async function loadAuthProviders() {
  const wrap = $('auth-providers');
  const sep  = $('auth-providers-sep');
  if (!wrap) return;
  try {
    const r = await fetch(`${baseUrl}/api/auth/providers`);
    const d = await r.json();
    if (!d.available || !d.providers.length) return;   // block stays hidden

    // Two buttons per provider: sign in, and — when the provider can host a sign-up
    // form — create an account. Both are plain navigations, never fetch: the
    // provider's page has to own the tab, and its form must be served by it, not
    // reproduced here.
    //
    // With a single provider the buttons say just "Sign in" / "Create an account".
    // Naming it would leak plumbing the user does not care about — and it would be
    // actively misleading once that provider brokers Google and GitHub, because the
    // choice the user actually makes happens on the next page. Which provider is
    // used stays visible in the link the button navigates to.
    const solo = d.providers.length === 1;
    wrap.innerHTML = d.providers.map(p => `
      <button type="button" class="btn btn-primary btn-full provider-btn"
              data-auth-url="/api/auth/${esc(p.id)}/start">${solo ? 'Sign in' : `Sign in with ${esc(p.label)}`}</button>
      ${p.canRegister ? `
      <button type="button" class="btn btn-ghost btn-full provider-btn"
              data-auth-url="/api/auth/${esc(p.id)}/register">${solo ? 'Create an account' : `Create an account with ${esc(p.label)}`}</button>` : ''}
    `).join('');
    wrap.querySelectorAll('[data-auth-url]').forEach(b =>
      b.addEventListener('click', () => { window.location.href = baseUrl + b.dataset.authUrl; }));
    wrap.classList.remove('hidden');

    // oidc-only: the provider is the only way in. Remove the local tabs and both
    // password panels rather than leaving forms the server answers with 403.
    // oidc-only: the two buttons are the whole screen. No explanatory note — where
    // sign-in is handled is plumbing, and the user has no decision to make about it.
    if (d.localAuth === false) {
      document.querySelector('.modal-tabs')?.classList.add('hidden');
      document.querySelectorAll('.modal-panel').forEach(el => el.classList.add('hidden'));
      sep?.classList.add('hidden');
    } else {
      sep?.classList.remove('hidden');
    }
  } catch (_) { /* offline or no server — password login still works */ }
}

// The callback hands us the token in the URL fragment (never a query string, so it
// stays out of server logs and Referer headers). Consume it and scrub the URL.
function consumeAuthFragment() {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return false;
  const p = new URLSearchParams(raw);
  const token = p.get('auth_token');
  const error = p.get('auth_error');
  const linked = p.get('linked');
  const confirmed = p.get('confirmed');
  const confirmError = p.get('confirm_error');
  const resetTok = p.get('reset');
  if (!token && !error && !linked && !confirmed && !confirmError && !resetTok) return false;

  history.replaceState(null, '', window.location.pathname + window.location.search);

  // Held in memory only, and the fragment was already scrubbed above: a reset
  // token in the address bar would survive in history and in a shared screenshot.
  if (resetTok) {
    _resetToken = resetTok;
    showAuthModal();
    setModalTab('reset');
    setTimeout(() => $('reset-password')?.focus(), 80);
    return true;
  }

  if (error)  { toast(error, 'error'); showAuthModal(); return true; }
  if (linked) { toast(`${linked} linked to your account.`, 'success'); return true; }
  if (confirmError) { toast(confirmError, 'error'); return true; }
  if (confirmed) {
    toast(`${confirmed} confirmed. Thank you!`, 'success');
    // Refresh the badge if the account page is already open behind the redirect.
    if ($('page-account')?.classList.contains('active')) loadAccount();
    return true;
  }

  persistAuth(token, p.get('auth_name') || 'You', p.get('auth_user') || '');
  hideAuthModal();
  loadApplications();
  toast('Signed in.', 'success');
  return true;
}

// Wipe everything on this device that belonged to whoever was signed in. Both the
// stored copy and the in-memory copy: dropping only localStorage would leave the
// previous user's CV on screen until a reload.
function clearUserData() {
  PER_USER_KEYS.forEach(k => localStorage.removeItem(k));
  localStorage.removeItem(CACHE_OWNER_KEY);
  state.apps     = [];
  state.cvText   = '';
  state.analysis = null;
  state.matches  = [];
  if (typeof emptyProfile === 'function') state.profile = emptyProfile();
}

// Update only the name shown in the UI, for the account already signed in. Separate
// from persistAuth so that renaming yourself never looks like a change of user.
function setDisplayName(name) {
  state.user = name;
  localStorage.setItem(USER_KEY, name);
  updateAuthUI();
}

// One-off migration for a cache that predates CACHE_OWNER_KEY: ask the server who
// the open session belongs to and stamp that, so the guard has something to compare
// against on the next sign-in. Silent on failure — the cache simply stays
// unattributed and gets cleared the next time a sign-in cannot match it.
async function adoptCacheOwner() {
  try {
    const d = await api.get('/api/account');
    if (d && d.username) localStorage.setItem(CACHE_OWNER_KEY, d.username);
  } catch (_) { /* offline or expired token — nothing to attribute */ }
}

/**
 * @param username the account identifier from the server. Used to decide whether the
 *   cached profile/applications on this device belong to the person signing in.
 *   Absent (an older caller) is treated as "not the same person" — clearing a cache
 *   we cannot attribute is the safe direction, the server refills it.
 */
function persistAuth(token, name, username) {
  const owner = localStorage.getItem(CACHE_OWNER_KEY);
  const id    = username || '';
  if (!id || owner !== id) {
    clearUserData();
    if (id) localStorage.setItem(CACHE_OWNER_KEY, id);
  }

  state.token = token;
  state.user  = name;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY,  name);
  // The profile is read from localStorage at startup, so after a wipe the in-memory
  // copy has to be re-read and the already-rendered form redrawn — otherwise the
  // previous user's values sit in the inputs until a reload.
  if (typeof loadProfile === 'function')          loadProfile();
  if (typeof renderProfileForm === 'function')    renderProfileForm();
  if (typeof updateProfileSummary === 'function') updateProfileSummary();
  updateAuthUI();
}

function updateAuthUI() {
  const name = state.user || '';
  const initial = name ? name[0].toUpperCase() : '?';
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('sidebar-username', name || 'Not signed in');
  set('user-avatar', initial);
  set('sidebar-auth-btn', name ? 'Sign out' : 'Sign in');
  set('topbar-avatar', initial);
  if (typeof refreshGettingStarted === 'function') refreshGettingStarted();
}

$('sidebar-auth-btn').addEventListener('click', async () => {
  if (!state.user) { showAuthModal(); return; }

  const token = state.token;

  // Ask the server to end the session before we throw the token away — afterwards we
  // could not prove which session to close. It also tells us whether the identity
  // provider needs a visit to close its own session.
  let providerLogout = null;
  try {
    const r = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) providerLogout = (await r.json()).url || null;
  } catch (_) { /* offline: still sign out locally below */ }

  state.token = null;
  state.user  = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // The CV, photo and application list must go with the session. Leaving them was
  // how the next person to sign in on this browser ended up looking at them.
  clearUserData();
  if (typeof renderProfileForm === 'function') renderProfileForm();
  updateAuthUI();

  // The provider ends its session and redirects back to the app, which reloads at
  // the sign-in screen — so no toast or modal here, the navigation replaces them.
  if (providerLogout) { window.location.href = providerLogout; return; }

  showAuthModal();
  toast('Signed out. See you soon!', 'info');
});

// ── Navigation ────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  'getting-started': 'Getting Started',
  jobs:              'Jobs',
  search:            'Job Search',
  resumes:           'Resumes',
  letters:           'Cover Letters',
  interviews:        'Interviews',
  profile:           'Professional Profile',
  career:            'Career Pathway',
  account:           'My Account',
  feedback:          'Feedback',
  admin:             'Admin',
};

// ── Inline help ───────────────────────────────────────────────────────────
//
// The figures this app shows are the result of steps the reader cannot see: a
// search returns 1000 postings, deduplication takes it to 145, a sector filter to
// 5. Each number is correct and the sequence is baffling without an explanation.
//
// Those explanations were already written — as title="" attributes. A title needs
// a hover, and a phone has none, so on the device most people use the app the
// explanation simply did not exist. This is the same text, reachable by tapping.
//
// One delegated listener rather than per-element wiring: most of these figures are
// rendered after a search, so anything bound at startup would miss them.
const HELP_TEXTS = {
  dedup: `<strong>Same job, several boards</strong><br>
    Employers post to many platforms at once. We compare titles and companies and
    keep one card per posting, noting where else it appeared. This number is what
    remains after that merge — nothing was discarded for being unsuitable.`,

  domain: `<strong>Filtered by sector</strong><br>
    Only postings whose title or description mentions your chosen sector are kept.
    This is usually the biggest drop, and it is reversible: set the sector to
    <strong>All</strong> and every deduplicated result comes back.`,

  matchScore: `<strong>How the percentage is built</strong><br>
    A fixed weighting, identical for every job, so the same CV and posting always
    give the same number: skills 45%, role 20%, location 10%, remote 10%,
    seniority 10%, pay 5%.<br><br>
    Meaning-based re-ranking then reorders the shortlist, so "Ethical Hacking" on
    your CV still matches a "Penetration Tester" posting.`,

  salaryMeasured: `<strong>Measured, not estimated</strong><br>
    The middle half of the salaries actually stated in the job ads we read — the
    25th to 75th percentile, which ignores one unpaid internship and one director
    role at the extremes.<br><br>
    Most German postings publish no salary at all, so the count of ads that did is
    shown beside it. Below five, no range is displayed.`,

  salaryReference: `<strong>Orientation figure, not a measurement</strong><br>
    Too few job ads stated a salary to calculate anything honest, so this is a
    typical band for this career stage. It is the same figure for every role at
    this level, and it is not evidence.`,

  criticScore: `<strong>The letter was graded before you saw it</strong><br>
    One agent writes the letter, a second scores it out of 100 against the actual
    posting and sends it back with specific objections. The loop repeats until it
    clears the bar.<br><br>
    The score and the number of revisions are shown so a weak letter is visible
    rather than quietly handed over.`,

  employment: `<strong>Filtered by position type</strong><br>
    Only postings whose title or description names the type you chose — Werkstudent,
    internship, apprenticeship or junior. The words are looked for in German and in
    English.<br><br>
    German postings are usually explicit about this, because it is what the
    applicant searches for. A posting that does not say so is dropped, so set this
    back to <strong>Any position</strong> if the list looks too short.`,

  liveCount: `<strong>Counted live, right now</strong><br>
    Queried from the official Bundesagentur für Arbeit API for the whole of
    Germany when this page opened. A low number usually means the exact job title
    is uncommon, not that the career is closed.`,
};

let _helpAnchor = null;

function closeHelpPopover() {
  _helpAnchor = null;
  document.querySelectorAll('.help-pop').forEach(p => p.remove());
  document.querySelectorAll('.help-dot[aria-expanded="true"]')
    .forEach(b => b.setAttribute('aria-expanded', 'false'));
}

// Fixed positioning means the panel does not travel with its button, so it has to
// be moved by hand. Repositioned rather than closed: someone scrolls to read a long
// explanation, and closing on the first scroll would snatch it away exactly as they
// started reading.
function positionHelpPopover() {
  const pop = document.querySelector('.help-pop');
  if (!pop || !_helpAnchor || !_helpAnchor.isConnected) return;
  const r = _helpAnchor.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) { closeHelpPopover(); return; }
  const w = pop.offsetWidth, h = pop.offsetHeight;
  const left = Math.min(Math.max(10, r.left + r.width / 2 - w / 2), window.innerWidth - w - 10);
  let top = r.bottom + 8;
  if (top + h > window.innerHeight - 10) top = Math.max(10, r.top - h - 8);
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
}

function openHelpPopover(btn) {
  // data-help-text wins: callers use it to append the figures for the search on
  // screen, and it already contains the general text.
  const key = btn.dataset.help;
  const text = btn.dataset.helpText || HELP_TEXTS[key] || '';
  if (!text) return;
  closeHelpPopover();

  const pop = document.createElement('div');
  pop.className = 'help-pop';
  pop.setAttribute('role', 'dialog');
  pop.innerHTML = text + '<button type="button" class="help-close">Got it</button>';
  document.body.appendChild(pop);

  // Positioned after insertion so the real height is known, and clamped to the
  // viewport because these buttons sit near the right edge on a phone.
  _helpAnchor = btn;
  positionHelpPopover();

  btn.setAttribute('aria-expanded', 'true');
  pop.querySelector('.help-close').addEventListener('click', closeHelpPopover);
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.help-dot');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    if (btn.getAttribute('aria-expanded') === 'true') closeHelpPopover(); else openHelpPopover(btn);
    return;
  }
  if (!e.target.closest('.help-pop')) closeHelpPopover();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeHelpPopover(); });
// Follow the button instead of closing. Fixed coordinates do not travel with the
// page, and dismissing on the first scroll would take the explanation away from
// anyone who scrolled in order to read it.
window.addEventListener('resize', positionHelpPopover);
window.addEventListener('scroll', positionHelpPopover, true);

/** Markup for a help button. `key` indexes HELP_TEXTS. */
function helpDot(key, label) {
  return `<button type="button" class="help-dot" data-help="${esc(key)}"
    aria-expanded="false" aria-label="${esc(label || 'What does this mean?')}">?</button>`;
}

// ── Mobile navigation drawer ──────────────────────────────────────────────
// Below 900px the sidebar is off-canvas. Everything here is a no-op on desktop,
// where the drawer classes are never applied by the stylesheet.
(function wireNavDrawer() {
  const app = $('app');
  const toggle = $('nav-toggle');
  const backdrop = $('nav-backdrop');
  if (!app || !toggle || !backdrop) return;

  const isOpen = () => app.classList.contains('nav-open');

  const open = () => {
    backdrop.hidden = false;
    // Next frame, so the transition has a starting opacity to animate from.
    requestAnimationFrame(() => app.classList.add('nav-open'));
    toggle.setAttribute('aria-expanded', 'true');
    lockBodyScroll();
  };

  const close = () => {
    if (!isOpen()) return;
    app.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    unlockBodyScroll();
    // Keep it out of the accessibility tree once faded out, not before.
    setTimeout(() => { if (!isOpen()) backdrop.hidden = true; }, 250);
  };

  toggle.addEventListener('click', () => (isOpen() ? close() : open()));
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Choosing a destination should reveal it, not leave the drawer covering it.
  document.querySelectorAll('.sidebar .nav-btn').forEach(b => b.addEventListener('click', close));

  // Rotating to landscape can cross the breakpoint with the drawer still open,
  // which would leave the body scroll-locked on a layout that has no drawer.
  window.addEventListener('resize', () => { if (window.innerWidth > 900) close(); });
})();

function navigate(page) {
  document.querySelectorAll('.page').forEach(p   => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const pageEl = $(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  document.querySelectorAll(`.nav-btn[data-page="${page}"]`).forEach(b => b.classList.add('active'));

  const title = $('topbar-title');
  if (title) title.textContent = PAGE_TITLES[page] || 'CareerAI';

  if (page === 'jobs')            loadApplications();
  if (page === 'resumes')         syncWriterCv();
  if (page === 'profile')         renderProfileForm();
  if (page === 'getting-started') refreshGettingStarted();
  if (page === 'career')          initCareerPath();
  if (page === 'account')         loadAccount();
  if (page === 'feedback')        loadFeedbackAdmin();
  if (page === 'admin')           loadAdmin();

  // scroll main content to top on page change
  const main = document.querySelector('.main-content');
  if (main) main.scrollTop = 0;
}

document.querySelectorAll('[data-page]').forEach(btn =>
  btn.addEventListener('click', () => navigate(btn.dataset.page))
);

// ── Agent status ──────────────────────────────────────────────────────────
function setAgentStatus(agent, status) {
  const dot  = $(`nav-dot-${agent}`);
  const pill = $(`dash-status-${agent}`);
  const labels = { idle: 'Idle', running: 'Running…', done: 'Done', error: 'Error' };
  if (dot)  dot.className  = 'status-dot' + (status !== 'idle' ? ` ${status}` : '');
  if (pill) { pill.textContent = labels[status] || status; pill.className = `status-pill ${status}`; }
}

// ── API status ────────────────────────────────────────────────────────────
async function checkApiStatus() {
  try {
    const data = await api.get('/api/status');
    state.online = data.status === 'ok';
  } catch (_) {
    state.online = false;
  }
  const el = $('api-indicator');
  el.textContent = state.online ? '● Online' : '● Offline';
  el.className   = 'api-indicator' + (state.online ? ' online' : '');
}

// ── PDF extraction ─────────────────────────────────────────────────────────
async function extractPdfText(file) {
  const buf    = await file.arrayBuffer();
  const bytes  = new Uint8Array(buf);
  let binary   = '';
  const CHUNK  = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  const b64 = btoa(binary);
  const r = await fetch(`${baseUrl}/api/parse-pdf`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body:    JSON.stringify({ pdf: b64 })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'PDF parse failed');
  return { text: data.text || '', photo: data.photo || '', images: data.images || [] };
}

// ── OCR (image-based CVs) ───────────────────────────────────────────────────
// Some CV templates bake the name/contact/skills column into a graphic, so that
// text is invisible to any PDF text parser. We OCR those image panels with
// tesseract.js (German + English), loaded lazily from CDN only when needed.
let _tesseractLoading = null;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (_tesseractLoading) return _tesseractLoading;
  _tesseractLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    s.onload = () => resolve(window.Tesseract);
    s.onerror = () => reject(new Error('Could not load the OCR library (are you offline?)'));
    document.head.appendChild(s);
  });
  return _tesseractLoading;
}

async function ocrImages(images, onProgress) {
  if (!images || !images.length) return '';
  const T = await loadTesseract();
  const worker = await T.createWorker(['deu', 'eng']);
  let all = '';
  try {
    for (let i = 0; i < images.length; i++) {
      if (onProgress) onProgress(i + 1, images.length);
      const { data: { text } } = await worker.recognize(images[i]);
      if (text && text.trim()) all += '\n' + text.trim();
    }
  } finally {
    await worker.terminate();
  }
  return all.trim();
}

// Downscale any image data URL to a compact JPEG (keeps localStorage small) and
// store it as the profile photo. Shared by the manual upload and PDF extraction.
function setProfilePhoto(dataUrl) {
  return new Promise(resolve => {
    if (!dataUrl) { resolve(false); return; }
    const img = new Image();
    img.onload = () => {
      const max = 320;
      let { width, height } = img;
      if (width > height && width > max) { height = height * max / width; width = max; }
      else if (height > max) { width = width * max / height; height = max; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      if (!state.profile) state.profile = emptyProfile();
      state.profile.photo = canvas.toDataURL('image/jpeg', 0.82);
      saveProfileToStorage();
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

// ── Drop zone ─────────────────────────────────────────────────────────────
function setupDropZone() {
  const zone  = $('cv-drop-zone');
  const input = $('cv-file-input');
  const ta    = $('cv-input');

  zone.addEventListener('click', () => input ? input.click() : ta.focus());
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files?.[0];
    if (file) await handleCvFile(file);
  });
  input?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (file) { await handleCvFile(file); input.value = ''; }
  });
}

async function handleCvFile(file) {
  const ta = $('cv-input');

  // Said before the file is read, not after the server refuses it. Parsing a PDF
  // runs server-side and needs a session; without one the upload used to look like
  // it had started — progress strip up, status pill changed — and then failed with
  // a message the user had to connect back to a button they pressed a moment ago.
  // A .txt or pasted text needs no session, so the check is scoped to PDFs.
  const needsServer = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
  if (needsServer && !state.token) {
    toast('Sign in first — reading a PDF happens on the server. You can paste the text instead.', 'error');
    $('cv-status-pill').textContent = 'Sign in required';
    ta?.focus();
    return;
  }

  setCvProgressStep('parsing');

  // Keep a handle on the original file so "Open original PDF" can show it next to the
  // extracted text. Object URL, not a copy: the bytes never leave the browser and are
  // never uploaded. Revoke the previous one first — each createObjectURL pins its blob
  // in memory until revoked, so dropping several CVs in a row would leak all of them.
  if (state.cvFileUrl) { try { URL.revokeObjectURL(state.cvFileUrl); } catch (_) {} }
  state.cvFileUrl  = null;
  state.cvFileName = file.name || '';
  state.cvFileSize = file.size || 0;
  state.cvFileIsPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
  if (state.cvFileIsPdf) {
    try { state.cvFileUrl = URL.createObjectURL(file); } catch (_) { /* non-fatal */ }
  }

  try {
    const isPdf = state.cvFileIsPdf;
    if (isPdf) {
      $('cv-status-pill').textContent = 'Reading PDF…';
      const { text, photo, images } = await extractPdfText(file);
      let fullText = text || '';
      let gotPhoto = false;
      if (photo) gotPhoto = await setProfilePhoto(photo);

      // Image-based CV: OCR the graphic panels to recover hidden name/contact/skills.
      let ocrText = '';
      if (images && images.length) {
        $('cv-status-pill').textContent = 'Reading image (OCR)…';
        toast('Image-based CV detected — running OCR…', 'info');
        try {
          ocrText = await ocrImages(images, (i, n) => {
            $('cv-status-pill').textContent = `OCR ${i}/${n}…`;
          });
        } catch (e) {
          toast('OCR unavailable: ' + e.message, 'error');
        }
        if (ocrText) fullText = (fullText + '\n\n' + ocrText).trim();
      }

      if (!fullText) { toast('No readable text in PDF. Paste your CV manually.', 'error'); return; }
      ta.value = fullText;
      if (gotPhoto && typeof renderProfileForm === 'function') renderProfileForm();
      const bits = [];
      if (gotPhoto) bits.push('photo extracted');
      if (ocrText) bits.push('text recovered via OCR');
      toast(bits.length ? `PDF loaded — ${bits.join(' + ')}.` : 'PDF loaded successfully.', 'success');
    } else {
      ta.value = await file.text();
      toast('File loaded.', 'success');
    }
    state.cvText = ta.value;

    // Straight on into the analysis, rather than stopping with the text sitting in
    // a textarea and waiting for a second click.
    //
    // The progress strip lists four steps — Reading CV, Analyzing skills, Building
    // profile, Done — and setCvProgressStep('done') marks every earlier one
    // completed. Ending here therefore drew ticks against two steps that had not
    // run: the user saw a finished bar, an empty profile, and no reason for either.
    // Either the strip was lying or the import was unfinished; it was both.
    await analyzeCV();
  } catch (e) {
    toast('Could not read file: ' + e.message, 'error');
    $('cv-status-pill').textContent = 'Error';
    // The strip stops where it failed. A completed-looking bar over a failed import
    // is the same lie in the other direction.
    setCvProgressStep('parsing');
  }
}

// ── Viewing what the parser actually read ──────────────────────────────────
//
// The analysis is only ever as good as this text. When a PDF extracts badly — a
// two-column layout interleaved, an image-only CV that needed OCR — the skills panel
// looks wrong for no visible reason. Showing the raw text makes the difference
// between "the parser mis-read the file" and "the file says something else" obvious.
function renderExtractedView() {
  const pre  = $('cv-extracted-text');
  const meta = $('cv-extracted-meta');
  const open = $('cv-open-original');
  if (!pre) return;

  const text = state.cvText || $('cv-input')?.value || '';
  pre.textContent = text || 'Nothing extracted yet.';

  if (meta) {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const from  = state.cvFileName
      ? `${state.cvFileName}${state.cvFileSize ? ` · ${Math.round(state.cvFileSize / 1024)} KB` : ''}`
      : 'pasted text';
    meta.textContent = `${from} — ${words} words, ${chars} characters extracted`;
  }

  // Only offered for a PDF dropped in this session: the object URL dies with the page,
  // and nothing is stored server-side to rebuild it from.
  if (open) {
    if (state.cvFileUrl) {
      open.href = state.cvFileUrl;
      open.classList.remove('hidden');
    } else {
      open.removeAttribute('href');
      open.classList.add('hidden');
    }
  }
}

$('cv-view-extracted')?.addEventListener('click', () => {
  const view = $('cv-extracted-view');
  const btn  = $('cv-view-extracted');
  if (!view) return;
  const willShow = view.classList.contains('hidden');
  if (willShow) renderExtractedView();
  view.classList.toggle('hidden', !willShow);
  btn.textContent = willShow ? 'Hide extracted text' : 'View extracted text';
});

$('cv-copy-extracted')?.addEventListener('click', async () => {
  const text = state.cvText || $('cv-input')?.value || '';
  if (!text) { toast('Nothing to copy yet.', 'error'); return; }
  try {
    await navigator.clipboard.writeText(text);
    toast('Extracted text copied.', 'success');
  } catch (_) {
    toast('Your browser blocked clipboard access — select the text and copy manually.', 'error');
  }
});

// ── CV analysis + profile extraction ───────────────────────────────────────
async function analyzeCV() {
  const text = $('cv-input').value.trim();
  if (!text) { toast('Please paste or drop your CV first.', 'error'); return; }

  state.cvText = text;
  // Keep an open viewer in step with the text just analysed, instead of showing the
  // previous CV's extraction.
  if (!$('cv-extracted-view')?.classList.contains('hidden')) renderExtractedView();
  $('cv-status-pill').textContent = 'Analyzing…';
  setCvProgressStep('analyzing');

  // Local multilingual analysis (covers all domains + DE/EN aliases)
  const result = localAnalyze(text);

  state.analysis = result;
  // Build the form from this CV's own headings. Deliberately not awaited: the
  // profile is already usable, and a model round trip should not hold up the
  // screen the user is looking at.
  loadCvSchema(text);
  renderAnalysisResults(result);
  renderLearningSuggestions(result);

  // Try AI extraction for the full structured profile (experience, education,
  // …). Falls back to the regex parser when no LLM key is configured.
  let llmProfile = null;
  try {
    $('cv-status-pill').textContent = 'AI extracting…';
    setCvProgressStep('building');
    const r = await fetch(`${baseUrl}/api/extract-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ text })
    });
    const d = await r.json();
    if (d && d.ok && d.profile) llmProfile = d.profile;
  } catch (_) { /* offline / no key → regex fallback */ }

  // Auto-build the structured profile from the CV (LLM result preferred).
  extractProfileFromCV(text, result, llmProfile);

  syncWriterCv();
  $('cv-status-pill').textContent = 'Done';
  refreshGettingStarted();
  updateStats();
  toast(`Profile built — ${result.foundSkills.length} skills detected${llmProfile ? ' (AI-parsed)' : ''}.`, 'success');
  setCvProgressStep('done');
  refreshGettingStarted();
  updateStats();
}

function localAnalyze(text) {
  const foundSkills = findSkillsLocal(text);
  const foundKeys   = foundSkills.map(s => s.key);
  const allSkills   = skillGroups.flatMap(g => g.skills);
  return {
    foundSkills,
    missingSkills: allSkills.filter(s => !foundKeys.includes(s.key)),
    roles:         analyzeRolesLocal(foundKeys),
    domain:        detectDomain(foundKeys)
  };
}

// Guarantee we have a CV-based analysis to score & rank jobs against. If the user
// hasn't run "Analyze CV" yet, derive one from their saved profile skills (or CV
// text) so matching always reflects the CV — high-fit jobs end up on top.
function ensureAnalysis() {
  if (state.analysis && state.analysis.foundSkills && state.analysis.foundSkills.length) {
    return state.analysis;
  }
  const p = state.profile || {};
  if (p.skills && p.skills.length) {
    const foundKeys = p.skills.map(s => s.key || normalize(s.label || s));
    const allSkills = skillGroups.flatMap(g => g.skills);
    state.analysis = {
      foundSkills:   p.skills.map(s => ({ key: s.key || normalize(s.label || s), label: s.label || s })),
      missingSkills: allSkills.filter(s => !foundKeys.includes(s.key)),
      roles:         analyzeRolesLocal(foundKeys),
      domain:        detectDomain(foundKeys),
    };
    return state.analysis;
  }
  const cv = state.cvText || (typeof profileToText === 'function' ? profileToText() : '');
  if (cv && cv.trim()) { state.analysis = localAnalyze(cv); return state.analysis; }
  return null;
}

// Minimum match to consider a job a "strong fit" (used for ranking emphasis + email).
const HIGH_MATCH_THRESHOLD = 0.75;

function renderAnalysisResults(result) {
  const panel   = $('analysis-results-panel');
  const allCount = skillGroups.flatMap(g => g.skills).length;
  const score    = allCount > 0 ? Math.round(result.foundSkills.length / allCount * 100) : 0;
  const topRoles = result.roles.length
    ? result.roles.slice(0, 3).map(r => `${r.name} (${Math.round(r.score * 100)}%)`).join(' · ')
    : 'No strong role match found';

  $('analysis-summary').innerHTML =
    `<strong>${score}%</strong> of tracked skills detected &nbsp;·&nbsp; Domain: <strong>${result.domain || 'General'}</strong> &nbsp;·&nbsp; Top match: <strong>${topRoles}</strong>`;

  $('found-skills').innerHTML = result.foundSkills.length
    ? result.foundSkills.map(s => `<li>${esc(s.label)}</li>`).join('')
    : '<li>No skills detected</li>';

  $('missing-skills').innerHTML = result.missingSkills.length
    ? result.missingSkills.slice(0, 10).map(s => `<li>${esc(s.label)}</li>`).join('')
    : '<li>All tracked skills present!</li>';

  // Concrete, explained gap recommendations: per role, each missing skill with
  // its specific "learn how" resource (via SecurityLearning if available).
  const skillMeta = k => {
    for (const g of skillGroups) for (const s of g.skills) if (s.key === k) return { key: s.key, label: s.label, category: g.category };
    return { key: k, label: k, category: '' };
  };
  const SL = (typeof window !== 'undefined' && window.SecurityLearning) || null;
  const learnLine = key => {
    const meta = skillMeta(key);
    if (SL) {
      const rec = SL.learningFor(meta);
      return `<strong>${esc(rec.label)}</strong> — ${esc(rec.how)}: ${esc(rec.resource)}`;
    }
    const tip = suggestionsBySkill[key] || `Build experience with ${meta.label}.`;
    return `<strong>${esc(meta.label)}</strong> — ${esc(tip)}`;
  };
  $('recommended-roles').innerHTML = result.roles.length
    ? result.roles.map(r => {
        const missKeys = r.missing || [];
        let gap;
        if (!missKeys.length) {
          gap = `<div class="role-gap ok">All required skills present ✓</div>`;
        } else {
          const items = missKeys.map(k => `<li class="role-learn">→ ${learnLine(k)}</li>`).join('');
          gap = `<div class="role-gap">Missing ${missKeys.length}:<ul class="gap-list" style="margin:8px 0;padding-left:20px">${items}</ul></div>`;
        }
        return `<li><strong>${esc(r.name)}</strong> — ${r.matched}/${r.total} matched${gap}</li>`;
      }).join('')
    : '<li>Add more skills for role recommendations.</li>';

  panel.classList.remove('hidden');
}

function renderLearningSuggestions(result) {
  const panel = $('learning-panel');
  const grid  = $('suggestions-grid');
  const SL = (typeof window !== 'undefined' && window.SecurityLearning) || null;
  const skillMeta = k => {
    for (const g of skillGroups) for (const s of g.skills) if (s.key === k) return { key:s.key, label:s.label, category:g.category };
    return {key:k,label:k,category:''};
  };

  let suggestions = [];
  if (SL && result.roles && result.roles.length) {
    suggestions = SL.recommendGaps(result.roles, { lookup: skillMeta, topRoles: 2, limit: 6 })
      .map(rec => ({ skill: rec.label, tip: `${rec.how}: ${rec.resource}`, meta: `→ needed for ${rec.forRoles.join(', ')}` }));
  } else if (result.missingSkills) {
    suggestions = result.missingSkills.slice(0, 6)
      .map(s => ({ skill: s.label, tip: suggestionsBySkill[s.key] || `Build experience with ${s.label}.`, meta: '' }));
  }

  if (!suggestions.length) { panel.classList.add('hidden'); return; }

  grid.innerHTML = suggestions.map(s =>
    `<div class="suggestion-card"><strong style="color:var(--cyan);font-size:11px;display:block;margin-bottom:5px">${esc(s.skill)}</strong>${esc(s.tip)}${s.meta ? `<span style="display:block;margin-top:6px;font-size:10px;opacity:.6">${esc(s.meta)}</span>` : ''}</div>`
  ).join('');

  // AI roadmap button + output (uses an LLM when a key is configured)
  let aiWrap = $('roadmap-ai-wrap');
  if (!aiWrap) {
    aiWrap = document.createElement('div');
    aiWrap.id = 'roadmap-ai-wrap';
    aiWrap.style.marginTop = '14px';
    aiWrap.innerHTML =
      '<button id="roadmap-ai-btn" class="btn btn-primary btn-sm">Generate AI roadmap</button>' +
      '<div id="roadmap-ai-out" class="suggestion-card hidden" style="margin-top:12px;white-space:pre-wrap;line-height:1.6"></div>';
    panel.appendChild(aiWrap);
    aiWrap.querySelector('#roadmap-ai-btn').addEventListener('click', generateAIRoadmap);
  }
  panel.classList.remove('hidden');
}

async function generateAIRoadmap() {
  const btn = $('roadmap-ai-btn');
  const out = $('roadmap-ai-out');
  if (!state.analysis) { toast('Analyze your CV first.', 'error'); return; }
  const missing = (state.analysis.missingSkills || []).slice(0, 15).map(s => s.label);
  const found   = (state.analysis.foundSkills || []).map(s => s.label);
  const role    = state.analysis.roles?.[0]?.name || state.profile?.title || 'IT Security professional';

  const orig = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = 'Generating…';
  try {
    const r = await api.post('/api/generate-roadmap', { missingSkills: missing, foundSkills: found, targetRole: role });
    if (r && r.ok && r.source === 'ai' && r.text) {
      out.textContent = r.text;
      out.classList.remove('hidden');
      toast('AI roadmap generated!', 'success');
    } else {
      toast('AI not configured — add an LLM API key to enable. Showing skill tips instead.', 'info');
    }
  } catch (_) {
    toast('Could not reach AI. Showing skill tips instead.', 'error');
  }
  btn.disabled = false; btn.innerHTML = orig;
}

// ── Scout Agent: Job Search ───────────────────────────────────────────────
async function searchJobs() {
  const region   = $('region-select').value;
  // No platform dropdown in the current UI → default to the all-platforms scrape.
  const platform = $('platform-select')?.value || 'all';
  const sector   = $('sector-select').value;
  const employment = $('employment-select')?.value || 'all';
  const distance = $('distance-select').value;
  const location = $('search-location-input').value.trim();
  const keyword  = ($('job-keyword-input')?.value || '').trim();

  console.log(`[search] click → platform=${platform} keyword="${keyword}" region=${region} location="${location}"`);
  if (platform === 'all') { await scrapeAllPlatforms(); return; }

  const btn = $('search-jobs-btn');
  const origLabel = btn.innerHTML;
  btn.innerHTML = 'Searching…';
  btn.disabled  = true;
  setAgentStatus('scout', 'running');
  $('search-status-pill').textContent = 'Searching…';

  try {
    const url = new URL(`${baseUrl}/api/jobs`);
    url.searchParams.set('region',   region);
    url.searchParams.set('platform', platform);
    url.searchParams.set('sector',   sector);
    url.searchParams.set('distance', distance);
    if (keyword)  url.searchParams.set('keyword',  keyword);
    if (location) url.searchParams.set('location', location);
    url.searchParams.set('pages', String(SCRAPE_PAGE_DEPTH));

    const r    = await fetch(url, { headers: authHeaders() });
    if (!r.ok) throw new Error(`Server error ${r.status}`);
    const data = await r.json();
    state.jobs = data.jobs || [];

    $('platform-breakdown').classList.add('hidden');
    $('scrape-all-progress').classList.add('hidden');
  } catch (err) {
    console.error('searchJobs error:', err);
    toast('Job search failed: ' + err.message, 'error');
    state.jobs = [];
  } finally {
    btn.innerHTML = origLabel;
    btn.disabled  = false;
  }

  const platformLabels = {
    bundesagentur: 'Bundesagentur', arbeitnow: 'Arbeitnow',
    linkedin: 'LinkedIn', remotive: 'Remotive',
    indeed: 'Indeed', stepstone: 'StepStone',
    'apify-indeed': 'Indeed (Apify)', 'apify-stepstone': 'StepStone (Apify)',
    jooble: 'Jooble', adzuna: 'Adzuna'
  };

  state.semanticSims = null;                 // fresh search → drop stale relevance
  renderJobResults(state.jobs, platformLabels[platform] || platform);
  setAgentStatus('scout', state.jobs.length > 0 ? 'done' : 'error');
  $('search-status-pill').textContent = `${state.jobs.length} found`;
  if (state.jobs.length > 0) toast(`${state.jobs.length} jobs found!`, 'success');
  updateStats();
  fetchSemanticScores(state.jobs);           // RAG re-rank (no-op without a key)
}

// Detect whether a job is remote — uses explicit flags first, then keyword
// heuristics over title/description (covers EN/DE/FR: remote, homeoffice, …).
function detectRemote(job) {
  if (job.remote === true) return true;
  if (job.remote_type && /remote/i.test(job.remote_type)) return true;
  const txt = `${job.title || ''} ${job.description || ''} ${job.location || ''} ${job.board || ''}`.toLowerCase();
  return /\bremote\b|home[\s-]?office|t[ée]l[ée]travail|fully remote|100% remote|mobiles arbeiten|work from home|\bwfh\b/.test(txt);
}

// Filter the full job list by the user-selected work mode (all / remote / on-site).
function filterByWorkMode(jobs) {
  const mode = $('workmode-filter') ? $('workmode-filter').value : 'all';
  if (mode === 'remote') return jobs.filter(detectRemote);
  if (mode === 'onsite') return jobs.filter(j => !detectRemote(j));
  return jobs;
}

// Re-render the already-scraped jobs applying the current work-mode filter
// (instant, no re-scrape).
function rerenderJobs() {
  renderJobResults(filterByWorkMode(state.jobs || []), state.jobsLabel || 'Jobs');
}

// Stable key for matching a job to its semantic score.
function jobKey(job) {
  return `${(job.title || '').toLowerCase().trim()}|${(job.company || '').toLowerCase().trim()}`;
}

// RAG semantic matching: embed the profile + each job server-side, get a cosine
// similarity per job, then re-rank. Gracefully no-ops when no embeddings key is
// set (server replies available:false) so the keyword flow is unaffected.
async function fetchSemanticScores(jobs) {
  try {
    const profileText = (typeof profileToText === 'function' ? profileToText() : '') || state.cvText || '';
    if (!profileText || !Array.isArray(jobs) || !jobs.length) return;
    const payload = jobs.slice(0, 300).map(j => ({ id: jobKey(j), text: `${j.title || ''} — ${j.description || ''}` }));
    const r = await fetch(`${baseUrl}/api/semantic-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ profile: profileText, jobs: payload }),
    });
    const d = await r.json();
    if (!d || !d.available || !Array.isArray(d.scores) || !d.scores.length) return;
    state.semanticSims = {};
    // Use the calibrated relevance (rel) for display/ranking; fall back to raw sim.
    d.scores.forEach(s => { state.semanticSims[s.id] = (typeof s.rel === 'number' ? s.rel : s.sim); });
    rerenderJobs();
    $('search-status-pill').textContent = `${(state.jobs || []).length} found · AI-ranked`;
  } catch (_) { /* embeddings unavailable → keep keyword order */ }
}

function renderJobResults(jobs, sourceLabel) {
  const panel = $('jobs-results-panel');
  const grid  = $('job-results');

  // Make sure we have a CV-based analysis (from profile/CV) so jobs get scored.
  ensureAnalysis();

  // No keyword ranking on the cards. We only float jobs the Oracle has actually
  // assessed to the top (by their real AI score); everything else keeps the order
  // it was scraped in.
  let ranked = jobs.map(job => {
    const detail = state.analysis ? scoreJobDetailed(job, state.analysis) : null;
    const sem = state.semanticSims ? state.semanticSims[jobKey(job)] : undefined;
    return { job, detail, sem, hybrid: hybridRelevance(detail, sem) };
  });
  ranked.sort((a, b) => {
    const aAi = a.detail && a.detail.breakdown && a.detail.breakdown.aiAssessed;
    const bAi = b.detail && b.detail.breakdown && b.detail.breakdown.aiAssessed;
    if (aAi && bAi) return (b.detail.score || 0) - (a.detail.score || 0);
    if (aAi) return -1;
    if (bAi) return 1;
    // Neither AI-assessed → float up by HYBRID relevance (keyword + semantic);
    // when embeddings are off, hybrid is undefined and scrape order is preserved.
    const ah = typeof a.hybrid === 'number' ? a.hybrid : -1;
    const bh = typeof b.hybrid === 'number' ? b.hybrid : -1;
    return bh - ah;
  });

  $('job-count-badge').textContent = ranked.length;
  panel.classList.remove('hidden');

  if (!ranked.length) {
    grid.innerHTML = `<div class="job-card"><p class="job-card-meta">No jobs found. Try a different platform, sector, or keywords.</p></div>`;
    return;
  }

  grid.innerHTML = ranked.map(({ job, detail, sem, hybrid }, i) => {
    const date    = job.publishedDate ? String(job.publishedDate).slice(0, 10) : null;
    const isNew   = date && (Date.now() - new Date(date).getTime()) < 7 * 86400000;
    const salary  = job.salary ? `${esc(job.salary)}` : '';
    const remote  = job.remote ? `<span class="chip remote">Remote</span>` : '';
    const jobType = job.jobType ? `<span class="chip">${esc(job.jobType)}</span>` : '';

    // No keyword "match %" on cards — the Oracle (open a job) gives the real match.
    // We only surface a score chip once the AI consultant has assessed this job.
    let scoreHtml = '';
    const gapHtml  = '';
    if (detail && detail.breakdown && detail.breakdown.aiAssessed) {
      const pct   = Math.round(detail.score * 100);
      const color = pct >= 75 ? 'var(--teal)' : pct >= 40 ? 'var(--cyan)' : 'var(--text-dim)';
      scoreHtml = `<span class="chip" title="AI consultant's match for this job" style="color:${color};border-color:${color}33">${pct}% match <span style="font-size:9px;font-weight:800">AI</span></span>`;
    } else if (typeof hybrid === 'number') {
      // Hybrid relevance = keyword (scorer.js) fused with semantic (RAG embeddings),
      // shown until the Oracle assesses the job.
      const rp = Math.round(hybrid * 100);
      scoreHtml = `<span class="chip" title="Hybrid relevance: keyword score + semantic embeddings" style="color:var(--blue-neon);border-color:rgba(6,182,212,0.3)">🧠 ${rp}% relevant</span>`;
    }

    return `
    <article class="job-card">
      <div class="job-card-top">
        <div>
          <div class="job-card-title">${esc(job.title)}</div>
          <div class="job-card-meta">${esc(job.company)} · ${esc(job.location)}</div>
        </div>
        ${isNew ? '<span class="new-badge">New</span>' : ''}
      </div>
      ${salary ? `<div class="job-card-salary">${salary}</div>` : ''}
      <div class="job-card-desc">${esc(job.description || '')}</div>
      <div class="job-card-chips">
        <span class="chip platform">${esc(job.board || job.platform || sourceLabel || '')}</span>
        ${remote}${jobType}${scoreHtml}
        ${Array.isArray(job.also_on) && job.also_on.length ? `<span class="chip also-on">also on ${esc(job.also_on.join(', '))}</span>` : ''}
        ${job.distance ? `<span class="chip">${job.distance} km</span>` : ''}
        ${date ? `<span class="chip date ${isNew ? 'new' : ''}">${date}</span>` : ''}
      </div>
      ${gapHtml}
      ${job.jobUrl ? `<a class="job-card-link" href="${esc(job.jobUrl)}" target="_blank" rel="noreferrer">View job →</a>` : ''}
      <button class="track-btn" data-job-idx="${i}">+ Save to Jobs</button>
    </article>
    `;
  }).join('');

  grid.querySelectorAll('.track-btn').forEach(btn =>
    btn.addEventListener('click', e => {
      // currentTarget, not target. An automatic page translation wraps the button's
      // text in a <font> element, so the tap lands on that instead of the button and
      // e.target.dataset is empty — the button then does nothing at all, silently.
      // Reported from a phone reading the app through Safari's translation.
      const job = ranked[Number(e.currentTarget.dataset.jobIdx)]?.job;
      if (job) prefillTracker(job);
    })
  );
}

// Carries the rich job data (description, skills) from a search result into the
// saved application, so the per-job workspace can compute match + gaps later.
let pendingJobData = null;

function prefillTracker(job) {
  navigate('jobs');
  $('add-app-form').classList.remove('hidden');
  $('app-title').value    = job.title    || '';
  $('app-company').value  = job.company  || '';
  $('app-location').value = job.location || '';
  $('app-url').value      = job.jobUrl   || '';
  $('app-notes').value    = '';
  pendingJobData = {
    description: job.description || '',
    sector: job.sector || '',
    board: job.board || job.platform || ''
  };
  $('app-title').focus();
  toast('Job details pre-filled. Add deadline and save!', 'info');
}

// ── Geolocation ───────────────────────────────────────────────────────────
$('current-location-button').addEventListener('click', () => {
  const status = $('location-status');
  if (!navigator.geolocation) { status.textContent = 'Geolocation not supported by this browser — type your city in the Location field above.'; return; }
  status.textContent = 'Getting location…';
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      status.textContent = 'Resolving city…';
      try {
        const r = await fetch(`${baseUrl}/api/reverse-geocode?lat=${lat}&lon=${lon}`);
        const d = await r.json();
        if (d.city) {
          $('search-location-input').value = d.city;
          status.textContent = `Location set: ${d.city}`;
          return;
        }
      } catch (_) { /* fall through to coordinates */ }
      $('search-location-input').value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      status.textContent = 'Location set (coordinates — city lookup unavailable).';
    },
    async (err) => {
      // A denied permission is the user's decision — asking the network instead would
      // route around it, so that one case only gets instructions.
      if (err.code === err.PERMISSION_DENIED) {
        status.textContent = 'Location blocked. Click the location/🔒 icon in your browser\'s address bar → Allow, then retry — or just type your city in the Location field above.';
        return;
      }

      // POSITION_UNAVAILABLE and TIMEOUT both mean the browser has no position source
      // it can use — the normal state of a desktop PC with no Wi-Fi scanning. Rather
      // than dead-ending, fall back to placing the network itself.
      status.textContent = 'No location sensor available — checking your network…';
      try {
        const r = await fetch(`${baseUrl}/api/geolocate-by-ip`);
        const d = await r.json();
        if (d.city) {
          $('search-location-input').value = d.city;
          // No message on success. The city appearing in the Location field is the
          // feedback, and this status line sits directly above the Job Title field —
          // anything written here reads as a note about the wrong input.
          status.textContent = '';
          return;
        }
      } catch (_) { /* offline, or the lookup service is unreachable */ }

      status.textContent = err.code === err.POSITION_UNAVAILABLE
        ? 'Location unavailable on this device, and the network lookup failed — type your city in the Location field above.'
        : 'Location request timed out — type your city in the Location field above.';
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
});


// ── Scrape All Platforms ──────────────────────────────────────────────────
async function scrapeAllPlatforms() {
  const region   = $('region-select').value;
  const sector   = $('sector-select').value;
  const employment = $('employment-select')?.value || 'all';
  const distance = $('distance-select').value;
  const location = $('search-location-input').value.trim();
  const keyword  = ($('job-keyword-input')?.value || '').trim();
  const pages    = SCRAPE_PAGE_DEPTH;
  const progress = $('scrape-all-progress');
  const breakdown= $('platform-breakdown');

  const scrapeBtn = $('scrape-all-btn');
  if (scrapeBtn) { scrapeBtn.innerHTML = 'Scraping…'; scrapeBtn.disabled = true; }

  const platforms = ['bundesagentur', 'arbeitnow', 'linkedin', 'remotive'];
  const PLATFORM_NAMES = { bundesagentur: 'Bundesagentur', arbeitnow: 'Arbeitnow', linkedin: 'LinkedIn', remotive: 'Remotive' };

  // Rebuilds the whole chip, dot included, so calling it any number of times gives
  // the same result. The previous code set el.textContent on the success path, which
  // DELETES the child <span class="sp-dot">. The next scrape then read that span
  // back as null and threw — and because that happened before the try block, the
  // finally never ran and the button stayed disabled. That, not any upstream job
  // board, is why a second scrape did nothing until the page was reloaded.
  const setPlatformChip = (p, state_, label) => {
    const el = $(`sp-${p}`);
    if (!el) return;
    el.className = `scrape-platform${state_ === 'spinning' ? '' : ' ' + state_}`;
    el.innerHTML = `<span class="sp-dot ${state_}"></span> ${esc(label)}`;
  };

  // Everything that touches the DOM now sits inside the try, so any failure still
  // reaches the finally that re-enables the button.
  try {
    progress?.classList.remove('hidden');
    breakdown?.classList.add('hidden');
    $('jobs-results-panel')?.classList.add('hidden');
    platforms.forEach(p => setPlatformChip(p, 'spinning', PLATFORM_NAMES[p]));
    setAgentStatus('scout', 'running');
    const pill = $('search-status-pill');
    if (pill) pill.textContent = 'Scraping all…';

    const r = await fetch(`${baseUrl}/api/scrape-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ region, sector, distance, location, keyword, pages, employment })
    });
    const data = await r.json();

    // Every click replaces the list with the results of THIS run. Accumulating across
    // runs was worse in practice: because LinkedIn's guest endpoint returns a different
    // slice of ~10 cards each call, a second scrape often added nothing, the list did
    // not visibly change, and the button looked dead. A search control has to answer
    // the query you just pressed it with.
    const fresh = data.jobs || [];
    state.jobs = fresh;

    platforms.forEach(p => {
      const name  = PLATFORM_NAMES[p] || p;
      const count = data.platformBreakdown?.[name] ?? 0;
      setPlatformChip(p, count > 0 ? 'done' : 'error', `${name}: ${count}`);
    });

    if (data.platformBreakdown) {
      // Per-source counts, then the two steps that shrink them. Without the middle
      // steps the last tile looks broken: the sources add up to ~1000 and the final
      // number is 22, with nothing on screen explaining where the rest went. The
      // server already returns rawTotal and dedupTotal — they were simply unused.
      const raw   = data.rawTotal   ?? Object.values(data.platformBreakdown).reduce((a, b) => a + b, 0);
      const dedup = data.dedupTotal ?? raw;
      const kept = fresh.length;
      const sectorKept = data.sectorTotal ?? kept;

      // The help button carries the numbers for THIS search, appended to the
      // general explanation — "140 were dropped" says more than any static text.
      const chip = (count, name, colour, help) => `
          <div class="pb-chip">
            <div class="pb-chip-count"${colour ? ` style="color:${colour}"` : ''}>${count}</div>
            <div class="pb-chip-name">${esc(name)}${help || ''}</div>
          </div>`;

      const withNumbers = (key, extra) =>
        `<button type="button" class="help-dot" data-help="${key}"
           data-help-text="${esc(HELP_TEXTS[key] + '<br><br>' + extra)}"
           aria-expanded="false" aria-label="What does this mean?">?</button>`;

      breakdown.innerHTML =
        Object.entries(data.platformBreakdown)
          .map(([name, count]) => chip(count, name)).join('')
        + chip(dedup, 'After dedup', 'var(--text-muted)',
            withNumbers('dedup',
              `<strong>This search:</strong> ${raw} results from all sources, ${raw - dedup} of them the same posting on more than one platform.`))
        + chip(sectorKept, 'In this domain', 'var(--orange)',
            withNumbers('domain',
              `<strong>This search:</strong> ${dedup - sectorKept} of ${dedup} dropped by the sector filter. Set the sector to "All" to see them.`))
        + (data.employment && data.employment !== 'all'
            ? chip(kept, 'This position type', 'var(--cyan)',
                withNumbers('employment',
                  `<strong>This search:</strong> ${sectorKept - kept} of ${sectorKept} dropped because they are not ${esc(data.employment)} postings.`))
            : '');
      breakdown.classList.remove('hidden');
    }

    state.jobsLabel = 'All Platforms';
    state.semanticSims = null;                // fresh search → drop stale relevance
    rerenderJobs();
    setAgentStatus('scout', state.jobs.length > 0 ? 'done' : 'error');
    $('search-status-pill').textContent = `${state.jobs.length} found`;
    if (state.jobs.length > 0) toast(`${state.jobs.length} jobs collected from all platforms!`, 'success');
    updateStats();
    fetchSemanticScores(state.jobs);          // RAG re-rank (no-op without a key)

  } catch (err) {
    console.error('scrapeAll error:', err);
    platforms.forEach(p => setPlatformChip(p, 'error', PLATFORM_NAMES[p]));
    setAgentStatus('scout', 'error');
    const pill = $('search-status-pill');
    if (pill) pill.textContent = 'Error';
    toast('Scrape failed: ' + err.message, 'error');
  } finally {
    const btn = $('scrape-all-btn');
    if (btn) { btn.innerHTML = 'Scrape All Platforms'; btn.disabled = false; }
  }
}

$('scrape-all-btn').addEventListener('click', scrapeAllPlatforms);

// Enter in the location or keyword field runs the search, same as the button.
['search-location-input', 'job-keyword-input'].forEach(id => {
  $(id).addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!$('scrape-all-btn').disabled) scrapeAllPlatforms();
  });
});
$('analyze-btn').addEventListener('click', analyzeCV);
$('workmode-filter').addEventListener('change', rerenderJobs);

// ── Market report (aggregate trend stats + LLM summary) ─────────────────────
const _marketBtn = $('market-report-btn');
if (_marketBtn) _marketBtn.addEventListener('click', async () => {
  if (!state.jobs.length) { toast('Search for jobs first.', 'error'); return; }
  const out = $('market-report');
  const orig = _marketBtn.innerHTML;
  _marketBtn.disabled = true; _marketBtn.innerHTML = 'Analyzing…';
  try {
    const keyword = ($('job-keyword-input')?.value || '').trim();
    const report = await api.post('/api/market-report', { jobs: state.jobs, query: keyword });
    renderMarketReport(report);
    out.classList.remove('hidden');
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (e) {
    toast('Could not build report: ' + e.message, 'error');
  }
  _marketBtn.disabled = false; _marketBtn.innerHTML = orig;
});

function renderMarketReport(r) {
  const out = $('market-report');
  const bars = (items, color) => items.map(it => {
    const max = items[0]?.count || 1;
    const w = Math.round((it.count / max) * 100);
    return `<div class="mr-row"><span class="mr-label">${esc(it.name)}</span>`
      + `<span class="mr-bar"><span class="mr-fill" style="width:${w}%;background:${color}"></span></span>`
      + `<span class="mr-count">${it.count}</span></div>`;
  }).join('');
  const remote = Object.entries(r.remote_split || {}).map(([k, v]) => `${esc(k)}: ${v}`).join(' · ');
  const sal = r.salary && r.salary.min
    ? `${r.salary.min.toLocaleString()}–${(r.salary.max || r.salary.min).toLocaleString()} € (from ${r.salary.count} listings)`
    : 'not enough salary data';
  out.innerHTML = `
    <div class="card-header"><h2>Market Report <span class="count-badge">${r.total_jobs}</span></h2></div>
    <p style="font-size:13px;line-height:1.55;margin-bottom:14px">${esc(r.summary || '')}</p>
    <div class="three-col">
      <div><h3 class="col-label">Most requested skills</h3>${bars(r.top_skills, 'var(--cyan)')}</div>
      <div><h3 class="col-label">Top locations</h3>${bars(r.top_locations, 'var(--teal)')}</div>
      <div><h3 class="col-label">Top companies</h3>${bars(r.top_companies, 'var(--orange)')}</div>
    </div>
    <p class="hint" style="margin-top:12px">Work mode — ${esc(remote)} &nbsp;·&nbsp; Salary range — ${esc(sal)}</p>`;
}

// ── Match scoring (used inline on job cards) ────────────────────────────────
// Weighted 6-criteria scoring (skills/role/location/remote/seniority/salary)
// with a transparent breakdown — uses the shared scorer.js engine.
// Turn an internal skill key (e.g. "rest api") into its display label ("REST APIs").
function skillLabel(key) {
  for (const g of skillGroups) {
    const s = g.skills.find(x => x.key === key);
    if (s) return s.label;
  }
  return key;
}

// Authoritative AI match scores, keyed by job identity. Once the Oracle has
// deeply analysed a job, its score becomes the single source of truth shown
// everywhere (card + workspace), so the same job never shows two numbers.
const aiMatchByJob = {};
// title|company alone collides when the same employer posts the same title in two
// cities. Add location as a discriminant — it is present on both search results and
// saved applications, so the Oracle score still carries over between them.
function jobKey(job) {
  return `${normalize(job.title || '')}|${normalize(job.company || '')}|${normalize(job.location || '')}`.trim();
}

// Hybrid relevance for a non-Oracle job: fuse the deterministic keyword score
// (scorer.js) with the calibrated semantic similarity (RAG). Only defined when
// embeddings are available (sem present), so the no-key flow is unchanged.
// Keyword weight in the hybrid score; semantic gets the rest. Leans on semantic
// (0.6) because the keyword taxonomy is security-heavy and generalises poorly to
// other domains, whereas embeddings capture meaning across any field.
const HYBRID_KW = Number(window.HYBRID_KW_WEIGHT) || 0.4;
function hybridRelevance(detail, sem) {
  if (typeof sem !== 'number') return undefined;
  const kw = detail && typeof detail.score === 'number' && !(detail.breakdown && detail.breakdown.aiAssessed)
    ? detail.score : undefined;
  return (typeof kw === 'number' && kw > 0) ? (HYBRID_KW * kw + (1 - HYBRID_KW) * sem) : sem;
}

function scoreJobDetailed(job, analysis) {
  if (!analysis || !analysis.foundSkills.length || typeof window.Scorer === 'undefined') {
    // Even without a local analysis, surface an AI score if the Oracle assessed this job.
    const ai = aiMatchByJob[jobKey(job)];
    if (ai != null) return { score: ai, breakdown: { aiAssessed: true, points: {}, weights: {} } };
    return { score: 0, breakdown: null };
  }
  const p = state.profile || {};
  const profile = {
    skills: analysis.foundSkills.map(s => s.key),
    targetRoles: [p.title || analysis.roles?.[0]?.name].filter(Boolean),
    location: p.location || '',
    preferredRemote: '',
    experienceYears: 0,
    minSalary: null,
  };
  const jobText = normalize([job.title, job.description, job.sector, job.board].filter(Boolean).join(' '));
  const jobSkillKeys = findSkillsLocal(jobText).map(s => s.key);
  const r = window.Scorer.scoreJob(job, profile, jobSkillKeys);

  // Outcome-based re-ranking boost: jobs similar to past interviews/offers rank higher.
  const signal = getRerankSignal();
  if (window.Rerank && signal && signal.count) {
    const { points, matched } = window.Rerank.boostFor(jobSkillKeys, signal);
    if (points > 0) {
      r.score100 = Math.min(100, (r.score100 != null ? r.score100 : r.score * 100) + points);
      r.score = Math.round((r.score100 / 100) * 1000) / 1000;
      if (r.breakdown) { r.breakdown.rerankBoost = points; r.breakdown.rerankMatched = matched; }
    }
  }

  // If the AI consultant has deeply assessed this job, its score wins — keeping the
  // deterministic breakdown (skills/gaps) but unifying the headline % everywhere.
  const ai = aiMatchByJob[jobKey(job)];
  if (ai != null) {
    r.score = ai;
    r.score100 = Math.round(ai * 100);
    if (r.breakdown) r.breakdown.aiAssessed = true;
  }
  return r;
}

// Memoised "success signal" from the Tracker (apps that got interview/offer).
let _rerankCache = { key: '', signal: null };
function getRerankSignal() {
  if (typeof window.Rerank === 'undefined') return null;
  const apps = state.apps || [];
  const key = apps.map(a => `${a.status}:${a.title || ''}`).join('|');
  if (key !== _rerankCache.key) {
    _rerankCache = {
      key,
      signal: window.Rerank.successSignal(apps, t => findSkillsLocal(t).map(s => s.key)),
    };
  }
  return _rerankCache.signal;
}

function calculateMatchScore(job, analysis) {
  return scoreJobDetailed(job, analysis).score;
}

// ── Writer: CV text source (profile → cvText) ───────────────────────────────
function syncWriterCv() {
  const ta = $('cv-for-writer');
  if (!ta) return;
  const source = profileToText() || state.cvText;
  if (source && !ta.value.trim()) ta.value = source;
}

// Writer options (language / tone / length) read from the page selects.
function readWriterOptions(prefix) {
  return {
    language: $(`${prefix}-lang`)?.value || 'auto',
    tone:     $(`${prefix}-tone`)?.value || 'professional',
    length:   $(`${prefix}-length`)?.value || 'standard',
  };
}

// jsPDF's standard fonts only cover Windows-1252, so decorative Unicode (box-drawing
// rules, ✓/○ bullets, arrows) renders as garbage like "%P" / "%Ë". Replace those with
// safe equivalents before drawing. The bullet "•" and dashes are CP1252-safe and kept.
function pdfSafeText(s) {
  return String(s)
    .replace(/[╔╗╚╝╠╣╦╩╬]/g, '')        // box corners/junctions → drop
    .replace(/[═━─_]{3,}/g, m => '-'.repeat(Math.min(m.length, 60))) // rules → dashes
    .replace(/[═━─]/g, '-')
    .replace(/[║│┃]/g, '|')
    .replace(/[✓✔☑]/g, '•')          // checkmarks → bullet
    .replace(/[○◦▪▫◆■□●]/g, '•')     // misc bullets → bullet
    .replace(/→/g, '->').replace(/←/g, '<-').replace(/↑/g, '^').replace(/↓/g, 'v')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

// Render any plain-text document to a clean, paginated PDF (jsPDF).
function downloadTextAsPDF(rawText, filename, title) {
  const lib = window.jspdf;
  if (!lib || !lib.jsPDF) { toast('PDF library not loaded — refresh the page.', 'error'); return; }
  if (!rawText || !rawText.trim()) { toast('Nothing to export yet.', 'error'); return; }
  const text = pdfSafeText(rawText);

  const doc = new lib.jsPDF({ unit: 'pt', format: 'a4' });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 48, W = PAGE_W - M * 2;
  let y = M;

  if (title) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(124, 58, 237);
    doc.text(title, M, y); y += 10;
    doc.setDrawColor(124, 58, 237); doc.setLineWidth(1.5); doc.line(M, y, M + W, y); y += 18;
  }
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(20, 20, 30);

  // Preserve blank lines; wrap long lines to the page width.
  String(text).split('\n').forEach(line => {
    const wrapped = line.trim() ? doc.splitTextToSize(line, W) : [''];
    wrapped.forEach(seg => {
      if (y > PAGE_H - M) { doc.addPage(); y = M; }
      doc.text(seg, M, y); y += 16;
    });
  });

  doc.save(filename);
  toast(`${filename} downloaded.`, 'success');
}

const _cvPdfBtn = $('download-cv-pdf-btn');
if (_cvPdfBtn) _cvPdfBtn.addEventListener('click', () => {
  // Download the polished, photo-bearing CV (profile design), tailored to the
  // typed target role — same clean output as the Profile and per-job downloads.
  const target = $('target-job-input')?.value.trim();
  const built = buildProfilePdfDoc(state.profile, target ? { title: target } : null);
  if (!built) return;
  const fileName = (built.name.replace(/\s+/g, '_') || 'CareerAI') + '_CV.pdf';
  built.doc.save(fileName);
  toast(`${fileName} downloaded!`, 'success');
});
const _coverPdfBtn = $('download-cover-pdf-btn');
if (_coverPdfBtn) _coverPdfBtn.addEventListener('click', () => {
  const co = $('cover-company')?.value.trim().replace(/\s+/g, '_') || 'Cover';
  downloadTextAsPDF($('generated-cover-output').value, `${co}_Cover_Letter.pdf`, 'Cover Letter');
});

// Clean, ATS-friendly plain-text CV built from the structured profile (falls back to
// raw CV text). Uses only Windows-1252-safe characters so it reads well on screen,
// copies cleanly, and exports without garbage. The downloadable PDF uses the polished
// design (buildProfilePdfDoc); this text is the editable preview / fallback.
function buildImprovedCV(cvText, targetJob, analysis) {
  const p = state.profile || {};
  const name    = [p.firstName, p.lastName].filter(Boolean).join(' ') || '[Your Name]';
  const topRole = targetJob || p.title || analysis?.roles?.[0]?.name || 'Professional';
  const contact = [p.email, p.phone, p.location, p.nationality].filter(Boolean).join(' • ');
  const skills  = (p.skills && p.skills.length)
    ? p.skills.map(s => s.label || s)
    : (analysis?.foundSkills?.map(s => s.label) || []);
  const date = new Date().toLocaleDateString('en-GB');
  const rule = '-'.repeat(54);
  const out = [];

  out.push(name);
  out.push(topRole);
  if (contact)      out.push(contact);
  if (p.languages)  out.push('Languages: ' + p.languages);
  out.push('');

  out.push('PROFESSIONAL PROFILE', rule);
  out.push(p.summary
    || `Results-driven ${topRole} with expertise in ${skills.slice(0, 4).join(', ') || 'the field'}. `
       + 'Committed to delivering high-quality work and continuously developing technical skills.');
  out.push('');

  out.push('CORE COMPETENCIES', rule);
  out.push(skills.length ? skills.map(s => '• ' + s).join('\n') : '• [Add your key skills here]');
  out.push('');

  if (p.experience && p.experience.length) {
    out.push('PROFESSIONAL EXPERIENCE', rule);
    p.experience.forEach(x => {
      const head  = [x.role, x.org].filter(Boolean).join(' — ');
      const dates = [x.start, x.end].filter(Boolean).join(' – ');
      if (head)       out.push(head + (dates ? `  (${dates})` : ''));
      if (x.location) out.push(x.location);
      if (x.desc)     out.push(x.desc);
      out.push('');
    });
  } else if (cvText && cvText.trim()) {
    out.push('PROFESSIONAL EXPERIENCE', rule);
    cvText.split('\n').filter(l => l.trim()).slice(0, 30).forEach(l => out.push(l.trim()));
    out.push('');
  }

  if (p.education && p.education.length) {
    out.push('EDUCATION', rule);
    p.education.forEach(x => {
      const head  = [x.degree, x.org].filter(Boolean).join(' — ');
      const dates = [x.start, x.end].filter(Boolean).join(' – ');
      if (head)       out.push(head + (dates ? `  (${dates})` : ''));
      if (x.location) out.push(x.location);
    });
    out.push('');
  }

  if (p.certifications && p.certifications.length) {
    out.push('CERTIFICATIONS', rule);
    p.certifications.forEach(c => out.push('• ' + [c.name, c.year].filter(Boolean).join(' · ')));
    out.push('');
  }

  out.push(rule);
  out.push(`Tailored for: ${topRole}  •  ${date}`);
  return out.join('\n');
}

function buildCoverLetter({ jobTitle, company, name, skills: skillsStr }) {
  const skillList = (skillsStr || '').split(',').map(s => s.trim()).filter(Boolean);
  const autoSkills = state.analysis?.foundSkills?.slice(0, 3).map(s => s.label) || [];
  const allSkills  = skillList.length ? skillList : autoSkills;
  const date       = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const domain     = state.analysis?.domain || 'Technology';
  const topSkills  = allSkills.length
    ? allSkills.slice(0, 3).join(', ')
    : `${domain.toLowerCase()} analysis, technical problem-solving, and collaborative teamwork`;

  return `${name || '[Your Name]'}
[Address · City · Country]
[your@email.com] · [+xx xxx xxxxxx]

${date}

Hiring Manager
${company || '[Company Name]'}

Dear Hiring Team,

Re: Application for the Position of ${jobTitle || '[Job Title]'}

I am writing to express my strong interest in the ${jobTitle || '[Job Title]'} position at ${company || '[Company]'}. With a solid background in ${domain} and hands-on experience in ${topSkills}, I am confident in my ability to make a meaningful contribution to your team from day one.

${allSkills.length ? `Key competencies I bring to this role:\n${allSkills.map(s => `  •  ${s}`).join('\n')}\n` : ''}
Throughout my career, I have consistently demonstrated the ability to ${
  domain.includes('Software') ? 'design, build, and ship high-quality software solutions' :
  domain.includes('Data')     ? 'transform complex datasets into actionable business insights' :
  domain.includes('Security') ? 'identify threats, respond to incidents, and strengthen security posture' :
  domain.includes('Finance')  ? 'deliver accurate financial analysis and support data-driven decisions' :
  domain.includes('Marketing')? 'develop campaigns that drive engagement, leads, and measurable ROI' :
  'deliver results in fast-paced, cross-functional environments'
}. I am proactive, detail-oriented, and committed to continuous improvement.

I am particularly drawn to ${company || 'your organisation'} because of your reputation for excellence and innovation in the field. My technical skills and passion for ${domain.toLowerCase()} make me an excellent fit for this role and your culture.

I would welcome the opportunity to discuss how my background aligns with your team's goals. I am available for an interview at your convenience and can be reached at the contact details above.

Thank you for considering my application.

Yours sincerely,
${name || '[Your Name]'}

------------------------------------------------------
Generated by CareerAI Writer Agent — ${date}`;
}

$('generate-cv-btn').addEventListener('click', async () => {
  let cvText = $('cv-for-writer').value.trim();
  if (!cvText) cvText = profileToText();
  const target = $('target-job-input').value.trim();
  if (!cvText) { toast('Complete your Professional Profile first, or paste CV text.', 'error'); return; }

  const btn = $('generate-cv-btn');
  const orig = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = 'Generating…';

  let text = '', usedAI = false;
  try {
    const foundSkills = (state.analysis?.foundSkills || []).map(s => s.label);
    const r = await api.post('/api/generate-cv', { cvText, targetRole: target, foundSkills, options: readWriterOptions('cv-opt') });
    if (r && r.ok && r.source === 'ai' && r.text) { text = r.text; usedAI = true; }
  } catch (_) { /* fall back to template */ }

  if (!text) text = buildImprovedCV(cvText, target, state.analysis);

  $('generated-cv-output').value = text;
  $('cv-output-block').classList.remove('hidden');
  state.docsCount++;
  updateStats();
  btn.disabled = false; btn.innerHTML = orig;
  toast(usedAI ? 'AI CV generated!' : 'CV draft generated (template).', 'success');
});

$('generate-cover-btn').addEventListener('click', async () => {
  const jobTitle = $('cover-job-title').value.trim();
  const company  = $('cover-company').value.trim();
  if (!jobTitle || !company) { toast('Enter at least a job title and company name.', 'error'); return; }
  const p = state.profile || {};
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ');
  const name   = $('cover-name').value.trim() || fullName;
  const skills = $('cover-skills').value.trim() || (p.skills || []).slice(0, 4).map(s => s.label || s).join(', ');
  const cvText = (typeof profileToText === 'function' ? profileToText() : '') || state.cvText || '';

  const btn = $('generate-cover-btn');
  const orig = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = 'Generating…';

  let text = '', usedAI = false;
  try {
    // Try the real AI endpoint first.
    const r = await api.post('/api/generate-cover', { jobTitle, company, name, skills, cvText, options: readWriterOptions('cover-opt') });
    if (r && r.ok && r.source === 'ai' && r.text) { text = r.text; usedAI = true; }
  } catch (_) { /* fall back to template */ }

  if (!text) text = buildCoverLetter({ jobTitle, company, name, skills });

  $('generated-cover-output').value = text;
  $('cover-output-block').classList.remove('hidden');
  state.docsCount++;
  updateStats();
  btn.disabled = false; btn.innerHTML = orig;
  toast(usedAI ? 'AI cover letter generated!' : 'Cover letter generated (template).', 'success');
});

function copyText(id) {
  const el = $(id);
  if (!el) return;
  navigator.clipboard.writeText(el.value)
    .then(() => toast('Copied to clipboard!', 'success'))
    .catch(() => { el.select(); document.execCommand('copy'); toast('Copied!', 'success'); });
}

function downloadText(id, filename) {
  const el = $(id);
  if (!el) return;
  const a = Object.assign(document.createElement('a'), {
    href:     URL.createObjectURL(new Blob([el.value], { type: 'text/plain' })),
    download: filename
  });
  a.click();
  toast(`${filename} downloaded.`, 'success');
}

$('copy-cv-btn').addEventListener('click',       () => copyText('generated-cv-output'));
$('download-cv-btn').addEventListener('click',   () => downloadText('generated-cv-output', 'cv-draft.txt'));
$('copy-cover-btn').addEventListener('click',    () => copyText('generated-cover-output'));
$('download-cover-btn').addEventListener('click',() => downloadText('generated-cover-output', 'cover-letter.txt'));

// Send the cover letter by email (Resend if configured, otherwise mailto fallback)
$('email-cover-btn').addEventListener('click', async () => {
  const text = $('generated-cover-output').value.trim();
  if (!text) { toast('Generate a cover letter first.', 'error'); return; }
  const to = (prompt('Recipient email (e.g. HR / hiring manager):') || '').trim();
  if (!to) return;
  const jobTitle = $('cover-job-title').value.trim() || 'your position';
  const company  = $('cover-company').value.trim();
  const subject  = `Application for ${jobTitle}${company ? ' at ' + company : ''}`;

  const mailtoFallback = () => {
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    toast('Opening your email client…', 'info');
  };

  try {
    const r = await api.post('/api/send-email', { to, subject, text });
    if (r && r.ok && r.sent) toast(`Email sent to ${to}!`, 'success');
    else mailtoFallback();
  } catch (_) {
    mailtoFallback();
  }
});

// ── Tracker Agent ─────────────────────────────────────────────────────────
const STATUSES = ['applied', 'review', 'interview', 'offer', 'rejected'];
const NEXT = { applied: 'review', review: 'interview', interview: 'offer', offer: null, rejected: null };
const PREV = { applied: null, review: 'applied', interview: 'review', offer: 'interview', rejected: null };
// Friendly column labels (internal key → displayed name). New saves land in
// "Saved" (the internal `applied` status).
const STATUS_LABELS = { applied: 'Saved', review: 'Applied', interview: 'Interview', offer: 'Offer', rejected: 'Rejected' };

function saveAppsLocally() {
  localStorage.setItem(APPS_KEY, JSON.stringify(state.apps));
}

function deadlineUrgency(deadline) {
  if (!deadline) return '';
  const diff = (new Date(deadline).getTime() - Date.now()) / 86400000;
  if (diff < 0)  return 'overdue';
  if (diff < 3)  return 'urgent';
  if (diff < 7)  return 'soon';
  return '';
}

async function loadApplications() {
  setAgentStatus('tracker', 'running');
  if (state.token && state.online) {
    try {
      const data = await api.get('/api/applications');
      if (data.applications) {
        state.apps = data.applications;
        saveAppsLocally();
      }
    } catch (_) {}
  }
  renderKanban();
  setAgentStatus('tracker', state.apps.length > 0 ? 'done' : 'idle');
  updateStats();
}

async function addApplication(app) {
  // Guard against duplicates (double-click, or saving the same job twice).
  const norm = s => String(s || '').trim().toLowerCase();
  const exists = (state.apps || []).some(a =>
    norm(a.title) === norm(app.title) && norm(a.company) === norm(app.company));
  if (exists) { toast(`"${app.title}" is already in your tracker.`, 'info'); return; }

  const now = new Date().toISOString();
  const newApp = { ...app, id: genId(), status: 'applied', createdAt: now,
    history: [{ status: 'applied', at: now }] };
  state.apps.push(newApp);
  saveAppsLocally();

  // Paint before talking to the server. The local list is already correct, so the
  // round trip decides nothing about what to draw — it only delayed it. On a phone
  // reaching Stockholm that was several hundred milliseconds of a button that
  // looked broken.
  renderKanban();
  updateStats();
  toast(`${newApp.title} @ ${newApp.company} added to tracker!`, 'success');

  if (state.token && state.online) {
    try {
      const data = await api.post('/api/applications', newApp);
      // The server owns the ids, so redraw once its version arrives.
      if (data.applications) { state.apps = data.applications; saveAppsLocally(); renderKanban(); updateStats(); }
    } catch (_) {
      toast('Saved on this device — the server could not be reached.', 'info');
    }
  }
}

async function moveApplication(id, newStatus) {
  const at = new Date().toISOString();
  state.apps = state.apps.map(a => {
    if (a.id !== id) return a;
    const history = (a.history || []).concat({ status: newStatus, at });
    return { ...a, status: newStatus, history };
  });
  saveAppsLocally();
  if (jwCurrentApp && jwCurrentApp.id === id) jwCurrentApp = state.apps.find(a => a.id === id);

  // Same reason as addApplication: the card's new column is already decided
  // locally. Waiting for the PUT before moving it made every drag feel laggy.
  renderKanban();
  toast(`Moved to ${esc(STATUS_LABELS[newStatus] || newStatus)}.`, 'info');

  if (state.token && state.online) {
    try {
      await api.put(`/api/applications/${id}`, { status: newStatus, history: state.apps.find(a => a.id === id)?.history });
    } catch (_) {
      toast('Moved on this device — the server could not be reached.', 'info');
    }
  }
}

// Patch an application's data (e.g. saved documents) + persist locally and server-side.
async function updateAppData(id, patch) {
  state.apps = state.apps.map(a => a.id === id ? { ...a, ...patch } : a);
  saveAppsLocally();
  if (jwCurrentApp && jwCurrentApp.id === id) jwCurrentApp = state.apps.find(a => a.id === id);
  if (state.token && state.online) {
    try { await api.put(`/api/applications/${id}`, patch); } catch (_) {}
  }
}

async function deleteApplication(id) {
  const app = state.apps.find(a => a.id === id);
  state.apps = state.apps.filter(a => a.id !== id);
  saveAppsLocally();
  if (state.token && state.online) {
    try { await api.delete(`/api/applications/${id}`); } catch (_) {}
  }
  renderKanban();
  updateStats();
  toast(`${app?.title || 'Application'} removed.`, 'info');
}

// Remove duplicate applications (same title + company), keeping the first —
// cleans up any duplicates created before the save guard existed.
function dedupeApps() {
  const seen = new Set();
  const out = [];
  for (const a of (state.apps || [])) {
    const key = `${String(a.title || '').trim().toLowerCase()}|${String(a.company || '').trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  if (out.length !== (state.apps || []).length) {
    state.apps = out;
    saveAppsLocally();
  }
}

// Wire each column as a drop target (once). Dropping a card sets its status to
// the target column — the drag-and-drop equivalent of the ← / → buttons.
function setupKanbanDnD() {
  STATUSES.forEach(status => {
    const col = $(`col-${status}`);
    if (!col || col._dndReady) return;
    col._dndReady = true;
    col.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; col.classList.add('drag-over'); });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      if (id) moveApplication(id, status);
    });
  });
}

// Conversion funnel: Saved → Applied → Interviews → Offers + response rate.
function renderFunnel() {
  const el = $('tracker-funnel');
  if (!el) return;
  const apps = state.apps || [];
  if (!apps.length) { el.classList.add('hidden'); return; }
  const count = s => apps.filter(a => a.status === s).length;
  const saved      = count('applied');                                  // status "applied" = label "Saved"
  const applied    = count('review') + count('interview') + count('offer') + count('rejected'); // actually sent
  const interviews = count('interview') + count('offer');               // reached the interview stage
  const offers     = count('offer');
  const card = (val, lbl, color) =>
    `<div class="funnel-card"><div class="funnel-val" style="color:${color}">${val}</div><div class="funnel-lbl">${esc(lbl)}</div></div>`;
  el.innerHTML =
      card(saved, 'Saved', 'var(--text)')
    + card(applied, 'Applied', 'var(--cyan)')
    + card(interviews, 'Interviews', 'var(--teal)')
    + card(offers, 'Offers', '#ffc940');
  el.classList.remove('hidden');
}

// When the application entered the tracker. Cards created before `createdAt`
// existed fall back to their first history entry, then to 0 (bottom of column).
function addedAt(app) {
  const raw = app.createdAt || app.history?.[0]?.at;
  const t = raw ? Date.parse(raw) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

function renderKanban() {
  dedupeApps();
  setupKanbanDnD();
  renderFunnel();
  const emptyEl = $('jobs-empty');
  if (emptyEl) emptyEl.classList.toggle('hidden', state.apps.length > 0);

  STATUSES.forEach(status => {
    const col   = $(`col-${status}`);
    const count = $(`cnt-${status}`);
    if (!col) return;

    // Newest arrival on top, so a freshly added card lands at the head of its
    // column. Sort is stable, so cards saved in the same millisecond keep their
    // insertion order.
    const apps = state.apps
      .filter(a => a.status === status)
      .sort((a, b) => addedAt(b) - addedAt(a));
    if (count) count.textContent = apps.length;

    col.innerHTML = apps.map(app => {
      const next    = NEXT[status];
      const prev    = PREV[status];
      const urgency = deadlineUrgency(app.deadline);
      const deadlineColor = urgency === 'overdue' ? '#ff4060' : urgency === 'urgent' ? 'var(--orange)' : urgency === 'soon' ? '#ffc940' : 'var(--text-muted)';
      const deadlineLabel = urgency === 'overdue' ? 'OVERDUE — ' : urgency === 'urgent' ? 'Due soon — ' : '';

      return `
        <div class="app-card" draggable="true" data-id="${app.id}">
          <div class="app-card-title">${esc(app.title)}</div>
          <div class="app-card-company">${esc(app.company)}${app.location ? ' · ' + esc(app.location) : ''}</div>
          ${app.documents ? `<div class="app-card-docs">📄 Documents ready</div>` : ''}
          ${app.deadline ? `<div class="app-card-deadline" style="color:${deadlineColor}">${deadlineLabel}${esc(app.deadline)}</div>` : ''}
          ${app.url ? `<a class="app-card-link" href="${esc(app.url)}" target="_blank" rel="noreferrer">View job →</a>` : ''}
          ${app.notes ? `<div class="app-card-notes">${esc(app.notes)}</div>` : ''}
          <div class="app-card-actions">
            ${prev ? `<button class="move-btn" data-id="${app.id}" data-to="${prev}" title="Move this job back to ${esc(STATUS_LABELS[prev] || prev)}">← ${esc(STATUS_LABELS[prev] || prev)}</button>` : ''}
            ${next ? `<button class="move-btn" data-id="${app.id}" data-to="${next}" title="Move this job forward to ${esc(STATUS_LABELS[next] || next)}">${esc(STATUS_LABELS[next] || next)} →</button>` : ''}
            <button class="delete-btn" data-id="${app.id}" data-confirm="0">✕</button>
          </div>
          <!-- Separate from the move buttons on purpose: those change the pipeline
               stage, this one prepares for the interview for THIS posting. Reading
               "Interview →" as the second thing is the mistake the layout invited. -->
          <button class="prep-btn" data-prep="${app.id}">🎤 Prep interview for this job</button>
        </div>
      `;
    }).join('');

    col.querySelectorAll('[data-prep]').forEach(btn =>
      btn.addEventListener('click', e => prepInterviewForJob(e.currentTarget.dataset.prep)));

    col.querySelectorAll('.move-btn').forEach(btn =>
      // Same reason as the tracker button: a translated page puts a <font> between
      // the tap and the element carrying the data attributes.
      btn.addEventListener('click', e => moveApplication(e.currentTarget.dataset.id, e.currentTarget.dataset.to))
    );

    // Click a card body (not a button/link) → open its job workspace.
    col.querySelectorAll('.app-card').forEach(card =>
      card.addEventListener('click', e => {
        if (e.target.closest('button, a')) return;
        const app = state.apps.find(a => a.id === card.dataset.id);
        if (app) openJobWorkspace(app);
      })
    );

    // Drag & drop: make each card the drag source (columns are the drop targets,
    // wired once in setupKanbanDnD).
    col.querySelectorAll('.app-card').forEach(card =>
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('dragging');
      })
    );
    col.querySelectorAll('.app-card').forEach(card =>
      card.addEventListener('dragend', () => card.classList.remove('dragging'))
    );

    // Inline delete confirmation (single click = "Sure?", second click = delete)
    col.querySelectorAll('.delete-btn').forEach(btn =>
      btn.addEventListener('click', e => {
        const b = e.target;
        if (b.dataset.confirm === '0') {
          b.textContent = 'Sure?';
          b.dataset.confirm = '1';
          b.style.color = '#ff4060';
          setTimeout(() => {
            if (b.dataset.confirm === '1') { b.textContent = '✕'; b.dataset.confirm = '0'; b.style.color = ''; }
          }, 3000);
        } else {
          deleteApplication(b.dataset.id);
        }
      })
    );
  });
}

$('add-app-btn').addEventListener('click', () =>
  $('add-app-form').classList.toggle('hidden')
);

$('cancel-app-btn').addEventListener('click', () =>
  $('add-app-form').classList.add('hidden')
);

$('save-app-btn').addEventListener('click', async () => {
  const btn = $('save-app-btn');
  if (btn.disabled) return;                 // ignore rapid double-clicks
  const title   = $('app-title').value.trim();
  const company = $('app-company').value.trim();
  if (!title)   { toast('Job title is required.', 'error'); return; }
  if (!company) { toast('Company name is required.', 'error'); return; }

  btn.disabled = true;
  try {
    await addApplication({
      title,
      company,
      location: $('app-location').value.trim(),
      deadline: $('app-deadline').value,
      url:      $('app-url').value.trim(),
      notes:    $('app-notes').value.trim(),
      ...(pendingJobData || {})   // description / sector / board, when saved from a search result
    });
    pendingJobData = null;
    ['app-title','app-company','app-location','app-deadline','app-url','app-notes']
      .forEach(id => { const el = $(id); if (el) el.value = ''; });
    $('add-app-form').classList.add('hidden');
  } finally {
    btn.disabled = false;
  }
});

// ── Job Workspace: per saved job → match % → gaps → Oracle → cover letter ────
let jwCurrentApp = null;
let jwReturnApp = null;   // job to re-open after the user updates their profile

// "AI consultant" mark for the Oracle — a robot advisor reading a dashboard,
// in the app's purple→cyan theme (inline SVG, no external image dependency).
const ORACLE_ICON = `<svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="jwOrb" x1="4" y1="4" x2="44" y2="44"><stop offset="0" stop-color="#A855F7"/><stop offset="1" stop-color="#06B6D4"/></linearGradient></defs>
  <circle cx="24" cy="24" r="23" fill="url(#jwOrb)" opacity=".16"/>
  <line x1="20" y1="9" x2="20" y2="13" stroke="url(#jwOrb)" stroke-width="2" stroke-linecap="round"/>
  <circle cx="20" cy="7.5" r="2" fill="#06B6D4"/>
  <rect x="9" y="13" width="22" height="18" rx="6" fill="#17132b" stroke="url(#jwOrb)" stroke-width="2"/>
  <circle cx="16" cy="22" r="2.4" fill="#06B6D4"/><circle cx="24" cy="22" r="2.4" fill="#06B6D4"/>
  <rect x="16" y="26.5" width="8" height="1.8" rx="0.9" fill="#A855F7"/>
  <rect x="30" y="28" width="13" height="12" rx="2.5" fill="#17132b" stroke="url(#jwOrb)" stroke-width="1.5"/>
  <path d="M33 37 L35.5 34.5 L38 36 L41 32.5" stroke="#10B981" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Cache AI consultations per job + profile, so re-opening a card costs no LLM
// call (this is the main source of Gemini free-tier rate-limits). The key includes
// a profile signature, so the consult refreshes automatically when your CV changes.
const _consultCache = {};
function profileSig() {
  const p = state.profile || {};
  return (p.skills || []).map(s => s.key || s.label || s).join(',') + '|' + (p.title || '');
}
function consultKey(app) {
  return `${app.id || (app.title + '|' + app.company)}::${profileSig()}`;
}

// Compact status timeline from an application's history (Saved → Applied → …).
function renderStatusTimeline(app) {
  const h = app && app.history;
  if (!Array.isArray(h) || !h.length) return '';
  const fmt = at => { try { return new Date(at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); } catch (_) { return ''; } };
  const steps = h.map(e =>
    `<span class="tl-step"><span class="tl-dot ${esc(e.status)}"></span>${esc(STATUS_LABELS[e.status] || e.status)}`
    + `<span class="tl-date">${fmt(e.at)}</span></span>`).join('<span class="tl-arrow">→</span>');
  return `<div class="jw-timeline">${steps}</div>`;
}

async function openJobWorkspace(app, force) {
  jwCurrentApp = app;
  $('jw-title').textContent = app.title || 'Job';
  $('jw-company').innerHTML = esc([app.company, app.location].filter(Boolean).join(' · '))
    + renderStatusTimeline(app);
  $('job-workspace').classList.remove('hidden');

  // Show previously saved documents (persisted on the application) right away.
  if (app.documents && (app.documents.cv || app.documents.cover || app.documents.email)) {
    renderJobDocs(app, app.documents);
  } else {
    $('jw-docs')?.classList.add('hidden');
  }

  // Cached consultation → render instantly, no AI call.
  const key = consultKey(app);
  if (!force && _consultCache[key]) {
    renderJobConsult(_consultCache[key]);
    $('jw-match').insertAdjacentHTML('afterbegin',
      `<div class="hint" style="margin-bottom:8px">Cached analysis — click <strong>Re-check match</strong> to refresh.</div>`);
    return;
  }

  // Oracle = AI consultation: read the posting, compare to the profile. Falls
  // back to the local keyword analysis when no LLM key is configured.
  $('jw-match').innerHTML =
    `<div style="display:flex;align-items:center;gap:12px;color:var(--text-muted)">`
    + `<span class="jw-orb jw-thinking">${ORACLE_ICON}</span>`
    + `<span>The AI consultant is analysing the job<span class="jw-dots"></span></span></div>`;
  $('jw-gaps').innerHTML = '';
  $('jw-oracle').innerHTML = '';

  // One attempt → returns { consult } or { reason }.
  async function attempt() {
    try {
      const profileText = (typeof profileToText === 'function' ? profileToText() : '') || state.cvText || '';
      const r = await fetch(`${baseUrl}/api/job-consult`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ jobTitle: app.title, company: app.company, jobDescription: app.description || '', profileText })
      });
      const d = await r.json();
      if (d && d.ok && d.consult) return { consult: d.consult };
      return { reason: (d && d.reason) || 'error' };
    } catch (_) { return { reason: 'offline' }; }
  }

  // Auto-retry transient failures (Gemini per-minute rate-limit / busy). The quota
  // resets within ~1 min, so we wait and retry instead of giving up immediately.
  const MAX = 3;
  for (let i = 1; i <= MAX; i++) {
    const res = await attempt();
    if (jwCurrentApp !== app) return;                 // user opened another card
    if (res.consult) { _consultCache[key] = res.consult; renderJobConsult(res.consult); return; }

    // Don't retry these — retrying won't help.
    if (res.reason === 'llm-not-configured' || res.reason === 'offline') break;

    if (i < MAX) {
      // Show a live countdown while we wait for the rate-limit window to reset.
      for (let s = 18; s > 0; s--) {
        if (jwCurrentApp !== app) return;
        $('jw-match').innerHTML =
          `<div class="jw-oracle-item" style="border-color:var(--orange);background:var(--orange-dim)">`
          + `AI busy (free-tier rate limit). Auto-retrying in <strong>${s}s</strong>… `
          + `<span class="hint">(attempt ${i + 1}/${MAX})</span></div>`;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  if (jwCurrentApp !== app) return;
  // Still failing after retries → keyword fallback, clearly labelled + manual retry.
  renderJobWorkspace();
  $('jw-match').insertAdjacentHTML('afterbegin',
    `<div class="jw-oracle-item" style="margin-bottom:12px;border-color:var(--orange);background:var(--orange-dim)">`
    + `⚠️ The AI consultant is still busy (free-tier rate-limit). `
    + `Showing a basic keyword analysis — click <strong>Re-check match</strong> to retry, `
    + `or add a free <strong>OpenRouter</strong> key as a fallback provider.</div>`);
}

// Render the AI consultation (opinion + strengths + gaps + certs + learning).
function renderJobConsult(c) {
  const yt = q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' tutorial')}`;
  const udemy = q => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(q)}`;
  const courses = q => `https://www.coursera.org/search?query=${encodeURIComponent(q)}`;
  const link = label => `<div class="jw-oracle-item"><strong>${esc(label)}</strong> — `
    + `<a class="jw-yt" href="${yt(label)}" target="_blank" rel="noreferrer">▶ YouTube</a>`
    + `<a href="${udemy(label)}" target="_blank" rel="noreferrer">Udemy</a>`
    + `<a href="${courses(label)}" target="_blank" rel="noreferrer">Coursera →</a></div>`;

  const pct = Math.max(0, Math.min(100, Math.round(Number(c.matchPercent) || 0)));
  const color = pct >= 75 ? 'var(--teal)' : pct >= 40 ? 'var(--cyan)' : 'var(--orange)';
  $('jw-match').innerHTML =
    `<span class="jw-match-score" style="color:${color}">${pct}%</span> match${helpDot('matchScore')}`
    + `<div class="jw-bar"><div style="width:${pct}%;background:${color}"></div></div>`
    + (c.matchSummary ? `<p style="font-size:13px;color:var(--text-muted);margin-top:8px">${esc(c.matchSummary)}</p>` : '');

  // Make this AI score authoritative for this job everywhere (cards converge to it).
  if (jwCurrentApp) {
    aiMatchByJob[jobKey(jwCurrentApp)] = pct / 100;
    if (state.jobs && state.jobs.length) rerenderJobs();
  }

  const strengths = Array.isArray(c.strengths) ? c.strengths : [];
  const missing   = Array.isArray(c.missing) ? c.missing : [];
  const certs     = Array.isArray(c.certifications) ? c.certifications : [];
  $('jw-gaps').innerHTML =
    (strengths.length ? `<h3>Your strengths for this job</h3>`
      + strengths.map(s => `<span class="jw-gap" style="border-color:var(--teal-dim);background:var(--teal-dim);color:var(--teal)">${esc(s)}</span>`).join('') : '')
    + (missing.length ? `<h3 style="margin-top:14px">Missing to reach 100%</h3>`
      + missing.map(s => `<span class="jw-gap">${esc(s)}</span>`).join('') : '');

  $('jw-oracle').innerHTML =
    `<div class="jw-oracle-head"><span class="jw-orb">${ORACLE_ICON}</span><h3 style="margin:0">Oracle — consultation</h3></div>`
    + (c.advice ? `<div class="jw-oracle-item">💬 ${esc(c.advice)}</div>` : '')
    + (missing.length ? `<div class="jw-oracle-item" style="border:none;padding:4px 2px;color:var(--text-muted);font-size:12px">How to acquire what's missing:</div>` + missing.map(link).join('')
        : `<div class="jw-oracle-item">No major gaps — lead your application with your strengths. ✓</div>`)
    + (certs.length ? `<div class="jw-oracle-item">🎓 <strong>Certifications to aim for:</strong></div>` + certs.map(link).join('') : '')
    + `<div class="jw-oracle-item">🧪 <strong>Where to learn & practice:</strong> `
      + `<a href="https://www.udemy.com/courses/search/?q=cyber%20security" target="_blank" rel="noreferrer">Udemy</a>`
      + `<a href="https://tryhackme.com" target="_blank" rel="noreferrer">TryHackMe</a>`
      + `<a href="https://www.hackthebox.com" target="_blank" rel="noreferrer">HackTheBox</a>`
      + `<a href="https://www.cybrary.it" target="_blank" rel="noreferrer">Cybrary</a>`
      + `<a class="jw-yt" href="${yt('IT security')}" target="_blank" rel="noreferrer">▶ YouTube</a></div>`;
}

function renderJobWorkspace() {
  const app = jwCurrentApp;
  if (!app) return;
  const profileSkills = (state.profile && state.profile.skills) || [];
  const an = { foundSkills: profileSkills, roles: (state.analysis && state.analysis.roles) || [] };

  // Skills the job asks for, vs what the profile already has.
  const jobText  = normalize([app.title, app.description, app.sector, app.board].filter(Boolean).join(' '));
  const jobSkills = findSkillsLocal(jobText);
  const have = new Set(profileSkills.map(s => s.key));
  const gaps = jobSkills.filter(s => !have.has(s.key));

  const total   = jobSkills.length;
  const matched = total - gaps.length;

  if (total === 0) {
    // No recognizable skills in the job's saved text — be honest, no fake %.
    void an;
    $('jw-match').innerHTML =
      `<span style="font-size:15px;color:var(--orange)">⚠️ Not enough job detail to compute a skills match</span>`
      + `<div style="font-size:12px;color:var(--text-muted);margin-top:6px">This saved job lists no recognizable skills in its text (Bundesagentur postings are very brief). Open the full posting, or re-save the job from a richer source (Adzuna / LinkedIn) for an accurate match.</div>`;
    $('jw-gaps').innerHTML = '';
  } else {
    // Headline = skill coverage (intuitive and consistent with the gaps below).
    const pct = profileSkills.length ? Math.round(matched / total * 100) : 0;
    const color = pct >= 70 ? 'var(--teal)' : pct >= 40 ? 'var(--cyan)' : 'var(--orange)';
    $('jw-match').innerHTML =
      `<span class="jw-match-score" style="color:${color}">${pct}%</span> skills match${helpDot('matchScore')}`
      + `<div class="jw-bar"><div style="width:${pct}%;background:${color}"></div></div>`
      + `<span style="font-size:12px;color:var(--text-muted)">${matched}/${total} of the job's skills are in your profile`
      + `${profileSkills.length ? '' : ' — import/analyze your CV first'}</span>`;
    $('jw-gaps').innerHTML = `<h3>Skills to reach 100%</h3>` + (gaps.length
      ? gaps.map(s => `<span class="jw-gap">${esc(s.label)}</span>`).join('')
      : `<span style="font-size:13px;color:var(--teal)">All ${total} of this job's skills are covered ✓</span>`);
  }

  // Oracle — how to acquire what's missing (courses, YouTube, certifications)
  const SL = (typeof window !== 'undefined' && window.SecurityLearning) || null;
  const meta = k => { for (const g of skillGroups) for (const s of g.skills) if (s.key === k) return { key: s.key, label: s.label, category: g.category }; return { key: k, label: k, category: '' }; };
  const yt = q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' tutorial')}`;
  const udemy = q => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(q)}`;
  const courses = q => `https://www.coursera.org/search?query=${encodeURIComponent(q)}`;
  const oracleItems = gaps.slice(0, 8).map(s => {
    const rec = SL ? SL.learningFor(meta(s.key)) : { how: 'Build hands-on experience', resource: 'a focused online course' };
    return `<div class="jw-oracle-item"><strong>${esc(s.label)}</strong> — ${esc(rec.how)}: ${esc(rec.resource)}<br>`
      + `<a class="jw-yt" href="${yt(s.label)}" target="_blank" rel="noreferrer">▶ YouTube</a>`
      + `<a href="${udemy(s.label)}" target="_blank" rel="noreferrer">Udemy</a>`
      + `<a href="${courses(s.label)}" target="_blank" rel="noreferrer">Coursera →</a></div>`;
  }).join('');

  // Certifications to aim for — each with its own learning links.
  const certGroup = skillGroups.find(g => g.category === 'Certifications');
  const certs = (certGroup ? certGroup.skills : []).filter(s => !have.has(s.key)).slice(0, 4).map(s => s.label);
  const certHtml = certs.length
    ? `<div class="jw-oracle-item">🎓 <strong>Certifications to aim for</strong> — prepare with:</div>`
      + certs.map(c => `<div class="jw-oracle-item"><strong>${esc(c)}</strong> — `
          + `<a class="jw-yt" href="${yt(c)}" target="_blank" rel="noreferrer">▶ YouTube</a>`
          + `<a href="${udemy(c)}" target="_blank" rel="noreferrer">Udemy</a>`
          + `<a href="${courses(c)}" target="_blank" rel="noreferrer">Coursera →</a></div>`).join('')
    : '';

  // Hands-on platforms — always shown, so the Oracle is useful even at 100%.
  const platformsHtml =
    `<div class="jw-oracle-item">🧪 <strong>Where to learn & practice:</strong> `
    + `<a href="https://www.udemy.com/courses/search/?q=cyber%20security" target="_blank" rel="noreferrer">Udemy</a>`
    + `<a href="https://tryhackme.com" target="_blank" rel="noreferrer">TryHackMe</a>`
    + `<a href="https://www.hackthebox.com" target="_blank" rel="noreferrer">HackTheBox</a>`
    + `<a href="https://www.cybrary.it" target="_blank" rel="noreferrer">Cybrary</a>`
    + `<a href="https://portswigger.net/web-security" target="_blank" rel="noreferrer">PortSwigger</a>`
    + `<a class="jw-yt" href="${yt('IT security')}" target="_blank" rel="noreferrer">▶ YouTube</a></div>`;

  const oracleBody = total === 0
    ? `<div class="jw-oracle-item">No skills could be detected from this job's saved text — open the posting to see its requirements, then re-save it for a precise gap analysis.</div>`
    : gaps.length
      ? oracleItems
      : `<div class="jw-oracle-item">You already match this job's skills — lead your cover letter with them. ✓ Keep growing with the resources below.</div>`;
  $('jw-oracle').innerHTML =
    `<div class="jw-oracle-head"><span class="jw-orb">${ORACLE_ICON}</span><h3 style="margin:0">Oracle — how to acquire what's missing</h3></div>`
    + oracleBody + certHtml + platformsHtml;
}

// Detect a document's language (DE vs EN) from its text — used to keep the email in
// the same language the AI wrote the cover letter in when "Auto" is selected.
function detectDocLang(text) {
  const t = String(text || '');
  if (/[äöüß]|\b(und|der|die|das|für|mit|nicht|eine|Ihre|Sehr geehrte|Bewerbung|Kenntnisse|Erfahrung|Stelle)\b/.test(t)) return 'de';
  return 'en';
}

// Localised application email (subject + body) so it matches the cover letter's language.
function buildApplicationEmail({ title, company, name, email, lang }) {
  if (lang === 'de') {
    return {
      subject: `Bewerbung als ${title}${company ? ' bei ' + company : ''}`,
      body: `Sehr geehrte Damen und Herren,\n\n`
        + `anbei sende ich Ihnen meinen Lebenslauf und mein Anschreiben für die Position als ${title}`
        + `${company ? ' bei ' + company : ''}. Über die Gelegenheit zu einem persönlichen Gespräch würde ich mich sehr freuen.\n\n`
        + `Mit freundlichen Grüßen,\n${name || '[Ihr Name]'}\n${email || ''}`,
    };
  }
  return {
    subject: `Application for ${title}${company ? ' at ' + company : ''}`,
    body: `Dear Hiring Team,\n\nPlease find attached my CV and cover letter for the ${title} position`
      + `${company ? ' at ' + company : ''}. I would welcome the opportunity to discuss how my `
      + `background fits your needs.\n\nKind regards,\n${name || '[Your name]'}\n${email || ''}`,
  };
}

// Gmail compose URL (web). Attachments can't be pre-filled by any site (browser
// security), so we pre-fill recipient/subject/body and the user attaches the PDFs.
function gmailComposeUrl({ to, subject, body }) {
  const q = new URLSearchParams({ view: 'cm', fs: '1', to: to || '', su: subject || '', body: body || '' });
  return 'https://mail.google.com/mail/?' + q.toString();
}

// The graph writes the letter; this turns it into the finished deliverable —
// pre-composed email, Copy/PDF panel, and a copy persisted on the application so
// it survives a refresh. It used to live in "Generate documents", which is gone.
async function persistJobLetter(app, letterText) {
  if (!app || !letterText) return;
  const p = state.profile || {};
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');

  // Pre-compose the email in the SAME language as the cover letter. When "Auto",
  // follow the language the AI actually wrote the cover in (detected from its text).
  const langChoice = $('jw-lang')?.value || 'auto';
  const emailLang = langChoice !== 'auto' ? langChoice : detectDocLang(letterText);
  const mail = buildApplicationEmail({ title: app.title, company: app.company, name, email: p.email, lang: emailLang });

  const documents = { cover: letterText, mail, generatedAt: new Date().toISOString(), ai: true };
  renderJobDocs(app, documents);
  state.docsCount += 1; updateStats();

  await updateAppData(app.id, { documents });
  renderKanban();
}

function renderJobDocs(app, docs) {
  const wrap = $('jw-docs');
  const block = (key, title, text) => `
    <div class="jw-doc">
      <div class="jw-doc-head"><strong>${esc(title)}</strong>
        <span>
          <button class="btn btn-ghost btn-xs" data-copy="${key}">Copy</button>
          <button class="btn btn-ghost btn-xs" data-pdf="${key}">PDF</button>
        </span>
      </div>
      <textarea id="jw-doc-${key}" class="field" rows="9" readonly>${esc(text)}</textarea>
    </div>`;
  const savedNote = docs.generatedAt
    ? `<div class="hint" style="margin-bottom:8px">Saved documents (generated ${new Date(docs.generatedAt).toLocaleString('en-GB')}${docs.ai ? ', AI' : ''}). Click <strong>Generate documents</strong> to refresh.</div>`
    : '';
  // Pre-composed email (subject + body). Support legacy saved docs that stored a
  // single `email` string by splitting its first "Subject:/Betreff:" line off.
  let mail = docs.mail;
  if (!mail && docs.email) {
    const lines = String(docs.email).split('\n');
    const subj = (lines[0].match(/^(?:Subject|Betreff):\s*(.*)$/) || [])[1] || '';
    mail = { subject: subj, body: lines.slice(subj ? 1 : 0).join('\n').trim() };
  }

  wrap.innerHTML = savedNote
    + block('cover', 'Cover Letter', docs.cover || '')
    + (mail ? `
    <div class="jw-doc">
      <div class="jw-doc-head"><strong>Application email</strong></div>
      <div class="hint" style="margin:2px 0 8px">Opens Gmail with the subject &amp; message ready. Attach your CV and the cover letter PDF (downloaded above) — sites can't pre-attach files.</div>
      <button id="jw-gmail-btn" class="btn btn-primary btn-sm">✉ Open in Gmail</button>
    </div>` : '');
  wrap.classList.remove('hidden');

  const tag = (app.company || 'job').replace(/\s+/g, '_');
  wrap.querySelectorAll('[data-copy]').forEach(b =>
    b.addEventListener('click', () => copyText(`jw-doc-${b.dataset.copy}`)));
  wrap.querySelectorAll('[data-pdf]').forEach(b =>
    b.addEventListener('click', () => {
      const key = b.dataset.pdf;
      downloadTextAsPDF($(`jw-doc-${key}`).value, `${tag}_${key}.pdf`, 'Cover Letter');
    }));

  const gmailBtn = $('jw-gmail-btn');
  if (gmailBtn && mail) gmailBtn.addEventListener('click', () => {
    window.open(gmailComposeUrl({ subject: mail.subject, body: mail.body }), '_blank', 'noopener');
    toast('Gmail opened — now attach your CV & cover letter PDFs.', 'info');
  });
}

(function wireJobWorkspace() {
  const overlay = $('job-workspace');
  if (!overlay) return;
  const close = () => overlay.classList.add('hidden');
  $('jw-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  $('jw-recheck').addEventListener('click', () => { if (jwCurrentApp) openJobWorkspace(jwCurrentApp, true); toast('Re-consulting with your current profile…', 'info'); });
  $('jw-graph-btn')?.addEventListener('click', runAgentGraph);
  $('jw-update-profile').addEventListener('click', () => {
    jwReturnApp = jwCurrentApp;          // remember the job to re-match after saving
    close();
    if (typeof navigate === 'function') navigate('profile');
    toast('Update your profile and click "Save Profile" — we\'ll re-check this job automatically.', 'info');
  });
})();

// Run the LangGraph multi-agent pipeline (Scout → Matcher → Writer ⇄ Critic) on
// the current job and show the execution trace + self-improved letter + score.
async function runAgentGraph() {
  const app = jwCurrentApp;
  if (!app) return;
  const btn = $('jw-graph-btn'); const orig = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = 'Writing…';
  const panel = $('jw-graph-panel');
  panel.classList.remove('hidden');
  panel.innerHTML = '<div class="hint">Scout → Matcher → Writer ⇄ Critic …</div>';
  const cvText = (typeof profileToText === 'function' ? profileToText() : '') || state.cvText || '';
  // Live trace: each node's step is appended as the SSE stream delivers it.
  panel.innerHTML = '<div class="jw-graph-head">🔗 LangGraph · running…</div><ol class="jw-graph-trace"></ol>';
  const ol = panel.querySelector('.jw-graph-trace');
  const addStep = (t) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${esc(t.node)}</strong> — ${esc(t.note)}`;
    ol.appendChild(li);
  };
  const renderDone = (d) => {
    // The Critic hands the loop a passing score when it cannot run, so the graph
    // terminates. That score is bookkeeping, not a judgement — never show it as one.
    const scored = d.scored !== false && d.score != null;
    const pass = scored && d.score >= d.qualityBar;
    const verdict = scored
      ? `Critic <strong style="color:${pass ? 'var(--teal)' : 'var(--orange)'}">${d.score}/100</strong> (bar ${d.qualityBar})${helpDot('criticScore')}`
      : `Critic <strong style="color:var(--orange)">not evaluated</strong> — the judge could not run`;

    panel.querySelector('.jw-graph-head').innerHTML =
      `🔗 LangGraph · <strong>${d.revisions}</strong> revision(s) · ${verdict}`;
    if (d.feedback) panel.insertAdjacentHTML('beforeend', `<div class="hint" style="margin-top:6px"><strong>Last critique:</strong> ${esc(d.feedback)}</div>`);

    // The graph is now the only writer, so its letter has to become the finished
    // deliverable here — Copy/PDF panel, application email, and saved on the job.
    if (d.coverLetter) persistJobLetter(app, d.coverLetter);

    toast(scored
      ? `Cover letter ready — ${d.revisions} revision(s), score ${d.score}/100.`
      : `Cover letter ready — ${d.revisions} revision(s), not evaluated.`, scored ? 'success' : 'info');
  };

  try {
    const r = await fetch(`${baseUrl}/api/graph-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        cvText, profile: state.profile || {},
        job: { title: app.title, company: app.company },
        jobDescription: app.description || '',
        options: { ...readWriterOptions('cover-opt'), language: $('jw-lang')?.value || 'auto' },
      }),
    });
    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('text/event-stream') || !r.body) {
      const d = await r.json().catch(() => null); // available:false (no key) or error
      panel.innerHTML = `<div class="hint">The agent graph needs an LLM key. ${esc((d && (d.reason || d.error)) || '')}</div>`;
      return;
    }
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const line = buf.slice(0, idx); buf = buf.slice(idx + 2);
        if (!line.startsWith('data:')) continue;
        let ev; try { ev = JSON.parse(line.slice(5).trim()); } catch (_) { continue; }
        if (ev.type === 'step') addStep(ev.step);
        else if (ev.type === 'done') renderDone(ev.result);
        else if (ev.type === 'error') panel.insertAdjacentHTML('beforeend', `<div class="hint">Error: ${esc(ev.error)}</div>`);
      }
    }
  } catch (e) {
    panel.insertAdjacentHTML('beforeend', `<div class="hint">Graph failed: ${esc(e.message)}</div>`);
  } finally {
    btn.disabled = false; btn.innerHTML = orig;
  }
}

// ── CareerBot Chat Assistant ────────────────────────────────────────────────
const chatKnowledge = [
  {
    match: msg => /^(hi|hello|hey|good morning|good evening|yo)\b/.test(msg),
    reply: () => `Hi! I'm CareerBot, your AI career assistant.\n\nI can help you with:\n• **Profile** — upload your CV or fill it in manually\n• **Job search** — 4 platforms at once\n• **CV & cover letters** — auto-generated\n• **Tracking** — your applications\n\nWhat would you like to do?`
  },
  {
    match: msg => /interview/.test(msg),
    reply: () => `Go to the **Interviews** page. Enter your target role and I'll generate likely questions plus preparation tips.\n\n${state.profile?.title ? `Your target role is set to **${state.profile.title}** — that will be used automatically.` : 'Tip: set a target role in your Profile for tailored questions.'}`
  },
  {
    match: msg => /cover letter|motivation letter|cover/.test(msg),
    reply: () => `Use the **Cover Letters** page to generate a personalised letter for a specific company and role.\n\n${state.profile ? 'Your profile details (name, skills, domain) are filled in automatically.' : 'Complete your Profile first for the best result.'}`
  },
  {
    match: msg => /improve my cv|resume|cv generator|improve my resume|generate.*cv|build.*cv/.test(msg),
    reply: () => `Go to the **Resumes** page to generate an improved CV tailored to your domain and target role.\n\n${state.profile ? 'It pulls everything from your Professional Profile.' : 'Complete your Profile first so it has your details.'}\n\nYou can then **Download as PDF** from your Profile.`
  },
  {
    match: msg => /career guidance|guidance|advice|tip|how do i|help me/.test(msg),
    reply: () => {
      const tips = [
        'Tailor your CV to each job — use the exact keywords from the job description.',
        'Apply within 24-48h of a posting going live — early applicants get noticed far more often.',
        'Quantify your results: "Improved performance by 40%" beats "improved performance".',
        'A well-personalised cover letter can triple your response rate.',
        'Keep your CV to 1 page for under 5 years of experience, 2 pages maximum.',
        'Keep LinkedIn and your CV consistent — recruiters cross-check them.',
        'Prepare 3 STAR examples (Situation, Task, Action, Result) for interviews.',
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }
  },
  {
    match: msg => /profile|skill|analy/.test(msg),
    reply: () => state.analysis
      ? `Your profile shows **${state.analysis.foundSkills.length} skills** in the **${state.analysis.domain}** field.\n\nTop matching roles:\n${state.analysis.roles.slice(0,3).map(r=>`• ${r.name} (${Math.round(r.score*100)}%)`).join('\n')}\n\nGo to **Job Search** to see jobs that fit you.`
      : `Go to **Professional Profile**. You can either **upload your CV** (auto-extract your skills) or **fill it in manually**.`
  },
  {
    match: msg => /\bjob\b|search|offer|position|vacanc/.test(msg),
    reply: () => state.jobs.length
      ? `I found **${state.jobs.length} jobs** for you!\n\nEach one shows a **match score** if your profile is complete. Open **Job Search** to review them.`
      : `Go to **Job Search**.\nPick your region and platform, then click **Search Jobs** or **Scrape All Platforms** to query every configured platform at once.`
  },
  {
    match: msg => /match|score|fit/.test(msg),
    reply: () => state.analysis
      ? `The **match score** appears right on each job card in **Job Search**.\n\nIt's based on your skills vs the job text, plus a title bonus and a domain bonus.`
      : `Complete your **Professional Profile** first, then run a **job search** — each job will then show its match %.`
  },
  {
    match: msg => /track|applicat|kanban|pipeline/.test(msg),
    reply: () => `The **Jobs** page is your tracking board:\n\nSaved → Applied → Interview → Offer → Rejected\n\nYou currently track **${state.apps.length} job(s)**.\n\nClick **+ Save to Jobs** on any job to add it.`
  },
  {
    match: msg => /login|account|sign in|sign up|register/.test(msg),
    reply: () => state.user
      ? `You're signed in as **${state.user}**. Your applications sync to the server automatically.`
      : `You can use the app **without an account**.\n\nCreating one lets you:\n• Sync your applications\n• Save your progress\n\nClick **Sign in** at the bottom of the sidebar.`
  },
  {
    match: msg => /platform|source|bundesagentur|linkedin|remotive|arbeitnow/.test(msg),
    reply: () => `Available sources:\n\n**Bundesagentur** — official German listings\n**Arbeitnow** — tech jobs in Germany\n**LinkedIn** — public listings worldwide\n**Remotive** — remote jobs worldwide\n\nUse **Scrape All Platforms** to query all 4 in parallel in ~5 seconds.`
  },
  {
    match: msg => /pdf|upload|file|import/.test(msg),
    reply: () => `Go to **Professional Profile → Import from CV** and drop your CV file.\n\nSupported formats:\n• **PDF** (selectable text, not scans)\n• **TXT** (plain text)\n\nYour skills and details are extracted automatically. You can also **Download as PDF** once your profile is ready.`
  },
  {
    match: () => true,
    reply: () => `I can help you with:\n\n• Your **skills** and CV analysis\n• **Job search** and platforms\n• Job **matching**\n• **Generating** CVs and cover letters\n• **Tracking** applications\n• Career **advice**\n\nTry one of the quick buttons below, or ask me anything!`
  }
];

function getChatResponse(message) {
  const msg = message.toLowerCase().trim();
  for (const entry of chatKnowledge) {
    if (entry.match(msg)) return entry.reply();
  }
  return chatKnowledge[chatKnowledge.length - 1].reply();
}

function addChatMsg(text, from) {
  const box = $('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-msg ${from}`;
  const safe = text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g,'<br>');
  div.innerHTML = `<div class="chat-bubble">${safe}</div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

// ── Body scroll lock for overlays ─────────────────────────────────────────
//
// An overlay that only hides itself with a class leaves the document behind it
// scrollable. On a phone that is very visible: the page slides around under the
// open panel as you try to scroll the panel's own content.
//
// `overflow: hidden` on <body> is the usual answer and iOS Safari ignores it for
// touch scrolling, so the body has to come out of flow entirely — which loses the
// scroll position, hence putting it back by hand on release.
let _scrollLockY = 0;
let _scrollLockDepth = 0;

function lockBodyScroll() {
  if (_scrollLockDepth++ > 0) return;      // already locked by another overlay
  _scrollLockY = window.scrollY;
  const b = document.body.style;
  b.position = 'fixed';
  b.top = `-${_scrollLockY}px`;
  b.left = '0';
  b.right = '0';
  b.width = '100%';
}

function unlockBodyScroll() {
  if (_scrollLockDepth === 0) return;
  if (--_scrollLockDepth > 0) return;      // another overlay still open
  const b = document.body.style;
  b.position = b.top = b.left = b.right = b.width = '';
  window.scrollTo(0, _scrollLockY);
}

function initChat() {
  const panel    = $('chat-panel');
  const toggleBtn= $('chat-toggle-btn');
  const closeBtn = $('chat-close-btn');
  const input    = $('chat-input');
  const sendBtn  = $('chat-send-btn');

  if (!panel || !toggleBtn) return;

  const openChat = () => {
    panel.classList.remove('hidden');
    lockBodyScroll();
    setTimeout(() => input.focus(), 50);
  };
  const closeChat = () => {
    if (panel.classList.contains('hidden')) return;   // never unlock twice
    panel.classList.add('hidden');
    unlockBodyScroll();
  };

  toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.remove('has-new');
    if (panel.classList.contains('hidden')) openChat(); else closeChat();
  });

  closeBtn.addEventListener('click', closeChat);
  // Escape closes it, like every other overlay in the app.
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeChat(); });

  async function sendMessage(text) {
    const msg = (text != null ? text : input.value).trim();
    if (!msg) return;
    addChatMsg(msg, 'user');
    input.value = '';
    input.focus();

    // Typing indicator
    const box = $('chat-messages');
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot chat-typing';
    typing.innerHTML = '<div class="chat-bubble"><div class="chat-dot"></div><div class="chat-dot"></div><div class="chat-dot"></div></div>';
    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;

    // Try the grounded RAG endpoint first; fall back to keyword answers when no
    // embeddings/LLM key is configured or the request fails.
    let reply = null, sources = null;
    try {
      const profileText = (typeof profileToText === 'function' ? profileToText() : '') || state.cvText || '';
      const r = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ message: msg, profile: profileText }),
      });
      const d = await r.json();
      if (d && d.available && d.reply) { reply = d.reply; sources = d.sources; }
    } catch (_) { /* offline → fall back below */ }

    typing.remove();
    if (reply) {
      const cite = sources && sources.length ? `\n\n**Sources:** ${sources.slice(0, 3).join(' · ')}` : '';
      addChatMsg(reply + cite, 'bot');
    } else {
      addChatMsg(getChatResponse(msg), 'bot');
    }
    if (panel.classList.contains('hidden')) toggleBtn.classList.add('has-new');
  }

  sendBtn.addEventListener('click', () => sendMessage());

  // Enter submits (Shift+Enter would add a newline, but this is a single-line input)
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // Quick-action buttons
  document.querySelectorAll('#chat-quick button').forEach(b =>
    b.addEventListener('click', () => sendMessage(b.dataset.msg))
  );
}

// ── Stats ───────────────────────────────────────────────────────────────────
function updateStats() {
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  const highMatches = ensureAnalysis()
    ? state.jobs.filter(j => calculateMatchScore(j, state.analysis) >= HIGH_MATCH_THRESHOLD).length
    : 0;
  set('stat-jobs',    state.jobs.length);
  set('stat-matches', highMatches);
  set('stat-docs',    state.docsCount);
  set('stat-apps',    state.apps.length);
}

// ════════════════════════════════════════════════════════════════════════════
//  PROFESSIONAL PROFILE
// ════════════════════════════════════════════════════════════════════════════
const PROFILE_KEY = 'careerai-profile';

const emptyProfile = () => ({
  firstName: '', lastName: '', email: '', phone: '', location: '', nationality: '',
  languages: '', title: '', summary: '', photo: '',
  // Rendered by the generated CV when present, filled by the CV parser. The
  // manual form does not expose them yet, so a hand-built profile simply omits
  // those sections instead of printing empty headings.
  softSkills: '', interests: '',
  // The CV's own skills block, label and values as written. Distinct from `skills`,
  // which is the taxonomy-matched list the job scoring needs.
  skillRows: [],
  // Sections read from the imported CV, in its own headings and order. Empty for a
  // profile typed by hand, which uses the fixed fields above.
  cvSchema: [],
  skills: [], experience: [], education: [], certifications: [], projects: []
});

function loadProfile() {
  try { state.profile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || emptyProfile(); }
  catch (_) { state.profile = emptyProfile(); }
}

function saveProfileToStorage() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
}

// ── The CV's own sections, as an editable form ─────────────────────────────
//
// The fixed form below assumes a shape — name, title, skills, experience,
// education, certifications — and that assumption is wrong as often as it is
// right. A student CV leads with PROJEKTE and has almost no employment history; a
// career changer has WEITERBILDUNG and no certifications; a German CV separates
// SOFT SKILLS from TECHNISCHE FÄHIGKEITEN and an English one does not. Whatever
// did not fit the shape was lost, and whatever was never there showed as an empty
// box.
//
// So an imported CV builds its own form. The fixed one stays for manual entry,
// where there is no document to take a shape from.
//
// Everything rendered here is editable and written straight back into
// state.profile.cvSchema, which the CV generator reads before falling back to the
// fixed fields.

// esc() is the one declared near the top of this file — same escaping, and a second
// copy here shadowed nothing and only collided.
function renderCvSchema(schema, meta) {
  const panel = $('cv-schema-panel');
  const body  = $('cv-schema-body');
  if (!panel || !body) return;

  if (!schema || !schema.length) { panel.classList.add('hidden'); return; }
  panel.classList.remove('hidden');

  const pill = $('cv-schema-pill');
  if (pill) pill.textContent = `${schema.length} section${schema.length > 1 ? 's' : ''}`;
  const note = $('cv-schema-note');
  if (note && meta && meta.structured === false) {
    note.textContent = 'Built from the headings your CV carries. Field layout needs an API key, '
      + 'so each section is shown as plain text you can edit.';
  }

  body.innerHTML = schema.map((sec, si) => {
    const rows = (function () {
      if (sec.kind === 'rows') {
        return sec.items.map((r, i) => `
          <div class="pf-row" data-s="${si}" data-i="${i}">
            <input class="field pf-third" data-f="label" value="${esc(r.label)}" placeholder="Label">
            <input class="field" data-f="value" value="${esc(r.value)}" placeholder="Value">
          </div>`).join('');
      }
      if (sec.kind === 'list') {
        return `<textarea class="field" data-s="${si}" data-f="list" rows="${Math.min(8, sec.items.length + 1)}"
                  placeholder="One per line">${esc(sec.items.join('\n'))}</textarea>`;
      }
      if (sec.kind === 'text') {
        return `<textarea class="field" data-s="${si}" data-f="text" rows="4">${esc(sec.items.join('\n\n'))}</textarea>`;
      }
      return sec.items.map((e, i) => `
        <div class="pf-entry" data-s="${si}" data-i="${i}">
          <div class="pf-row">
            <input class="field pf-third" data-f="period" value="${esc(e.period)}" placeholder="Period">
            <input class="field" data-f="title" value="${esc(e.title)}" placeholder="Title">
          </div>
          <input class="field" data-f="org" value="${esc(e.org)}" placeholder="Organisation">
          <textarea class="field" data-f="bullets" rows="${Math.min(6, (e.bullets || []).length + 1)}"
            placeholder="One bullet per line">${esc((e.bullets || []).join('\n'))}</textarea>
        </div>`).join('');
    })();

    // The heading is editable too. It is the candidate's word, and a CV that calls
    // the block "PROJEKTE & LABORE" should keep saying that in the generated
    // document rather than being normalised into "Projects".
    return `
      <div class="pf-section" data-s="${si}">
        <input class="field pf-heading" data-f="heading" value="${esc(sec.heading)}">
        ${rows}
      </div>`;
  }).join('');

  // Rejections are shown, not swallowed. If the model proposed a line the CV does
  // not contain, the person whose CV it is should know it was proposed.
  const warn = $('cv-schema-dropped');
  if (warn) {
    const d = (meta && meta.dropped) || [];
    if (d.length) {
      warn.textContent = `${d.length} item${d.length > 1 ? 's were' : ' was'} discarded for not appearing in your CV: `
        + d.slice(0, 3).map(x => x.text || x.why).join(' · ');
      warn.classList.remove('hidden');
    } else {
      warn.classList.add('hidden');
    }
  }

  body.addEventListener('input', collectCvSchema);
  collectCvSchema();
}

/** Read the panel back into the profile. Called on every edit. */
function collectCvSchema() {
  const body = $('cv-schema-body');
  if (!body) return;
  const out = [];
  body.querySelectorAll('.pf-section').forEach((secEl) => {
    const heading = secEl.querySelector('.pf-heading')?.value.trim() || '';
    const listTa  = secEl.querySelector('[data-f="list"]');
    const textTa  = secEl.querySelector('[data-f="text"]');
    const rowEls  = secEl.querySelectorAll('.pf-row[data-i]');
    const entryEls = secEl.querySelectorAll('.pf-entry');

    if (listTa) {
      out.push({ heading, kind: 'list', items: listTa.value.split('\n').map(s => s.trim()).filter(Boolean) });
    } else if (textTa) {
      out.push({ heading, kind: 'text', items: [textTa.value.trim()].filter(Boolean) });
    } else if (entryEls.length) {
      out.push({ heading, kind: 'entries', items: [...entryEls].map((el) => ({
        period: el.querySelector('[data-f="period"]')?.value.trim() || '',
        title:  el.querySelector('[data-f="title"]')?.value.trim() || '',
        org:    el.querySelector('[data-f="org"]')?.value.trim() || '',
        bullets: (el.querySelector('[data-f="bullets"]')?.value || '')
          .split('\n').map(s => s.trim()).filter(Boolean),
      })) });
    } else if (rowEls.length) {
      out.push({ heading, kind: 'rows', items: [...rowEls].map((el) => ({
        label: el.querySelector('[data-f="label"]')?.value.trim() || '',
        value: el.querySelector('[data-f="value"]')?.value.trim() || '',
      })) });
    }
  });
  if (!state.profile) state.profile = emptyProfile();
  state.profile.cvSchema = out;
  saveProfileToStorage();
}

/**
 * Ask the server for the sections, then render them.
 *
 * Best-effort throughout: no session, no key, a refused answer — each degrades to
 * the fixed form, which is still there. A CV import that used to produce a profile
 * must never produce nothing because this step failed.
 */
async function loadCvSchema(cvText) {
  if (!cvText || cvText.trim().length < 40) return;
  try {
    const r = await fetch(`${baseUrl}/api/cv-schema`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ cvText }),
    });
    if (!r.ok) return;
    const data = await r.json();
    // The structured layout when the model produced one, the raw blocks otherwise —
    // a section per heading, its text in one editable box.
    const schema = data.schema || (data.sections || []).map(s => ({
      heading: s.heading, kind: 'text', items: [s.body],
    }));
    renderCvSchema(schema, { structured: data.structured, dropped: data.dropped });
  } catch (_) { /* the fixed form is still there */ }
}

// ── Reading a CV's own sections, verbatim ───────────────────────────────────
//
// Two parsers that work on the text a PDF extractor actually produces, which is
// not the text the document appears to contain.
//
// Bullet glyphs are the trap. In a two-column CV the "•" characters are laid out
// separately from the text they belong to, and every extractor this project has
// been tried with returns them collected at the END of the page:
//
//     Entwicklung von Webanwendungen mit HTML, SCSS, PHP …
//     Mitarbeit im agilen Entwicklungsteam an Kundenprojekten
//     …
//     •  •  •  •  •  •  •  •  •  •  •  •  •  •
//
// So a description line never starts with a bullet, and any parser keyed on one
// finds nothing. Structure has to carry the meaning instead: position, a trailing
// year, a colon.

// "Security Tools: Kali Linux, Wireshark, IDA Pro, Ghidra, EDB"
// The label before the colon is the group the CV chose; the values after it are
// the candidate's own words.
const SKILL_ROW = /^([A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß \/&+-]{2,34}):\s*(.+)$/;

/**
 * The CV's technical-skills block, exactly as written.
 *
 * The taxonomy matcher runs separately and is what the job scoring needs — it maps
 * free text onto canonical keys. It is the wrong source for the generated CV: it
 * replaced "Kali Linux, Wireshark, IDA Pro, Ghidra, EDB" with the labels of
 * whatever it matched, including a "Medical documentation" that came from a
 * health-domain entry triggered by the words "technische Dokumentation". The
 * document has to say what the candidate says.
 */
function parseSkillRows(block) {
  const rows = [];
  let current = null;
  String(block || '').split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    const m = line.match(SKILL_ROW);
    if (m) {
      current = { category: m[1].trim(), values: m[2].trim() };
      rows.push(current);
      return;
    }
    // A wrapped continuation of the previous row: "Penetration Testing, Malware-
    // Analyse, Digitale Forensik, ARP-" / "Spoofing".
    if (current) current.values += (/[-–]$/.test(current.values) ? '' : ' ') + line;
  });
  return rows
    .map((r) => ({ category: r.category, values: r.values.replace(/\s{2,}/g, ' ').trim() }))
    .filter((r) => r.values);
}

/**
 * The PROJEKTE block.
 *
 * A project is recognised by its second line, not its first: the institution and
 * year sit directly under the title — "Westfälische Hochschule Gelsenkirchen,
 * 2025". Everything between that and the next such pair is the description.
 */
function parseProjectBlock(block) {
  const lines = String(block || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const ORG_YEAR = /^(.*?),\s*((?:19|20)\d{2})\s*$/;
  const projects = [];

  for (let i = 0; i < lines.length; i++) {
    const next = lines[i + 1] ? lines[i + 1].match(ORG_YEAR) : null;
    if (!next) continue;
    const project = { name: lines[i], org: next[1].trim(), year: next[2], desc: '' };
    const body = [];
    for (let j = i + 2; j < lines.length; j++) {
      // Stop where the next project starts, which is again a line whose successor
      // carries an institution and a year.
      if (lines[j + 1] && ORG_YEAR.test(lines[j + 1])) break;
      const line = lines[j].replace(/^[•▸·*-]\s*/, '');
      // A source line is not a bullet. The PDF wraps long ones, so
      // "…mit IDA Pro und Ghidra (Disassemblierung," and "Code-Analyse)" arrive as
      // two lines and became two bullets, the second of them a fragment ending in a
      // stray bracket. A line continues the previous one when it opens in lower
      // case, closes a bracket the previous one opened, or follows a line left
      // hanging on a comma or a hyphen.
      const prev = body.length ? body[body.length - 1] : '';
      const opens = (prev.match(/\(/g) || []).length - (prev.match(/\)/g) || []).length;
      const continues = prev && (
        /^[a-zäöüß)]/.test(line) || opens > 0 || /[,;–-]$/.test(prev)
      );
      if (continues) body[body.length - 1] = prev.replace(/[-–]$/, '') + ' ' + line;
      else body.push(line);
    }
    project.desc = body.join('\n');
    projects.push(project);
    i += 1 + body.length;
  }
  return projects.filter((p) => p.name && p.name.length < 140);
}

// ── CV section parsing (best-effort, tuned for structured CVs) ──────────────
// Longest first: this is a regex alternation, and a heading is only a boundary
// if its whole name is listed. SOFT SKILLS, INTERESSEN, WEITERBILDUNG and
// PROJETS were missing, so nothing stopped the preceding block — a SPRACHEN
// section ran on and swallowed the soft skills and the interests beneath it.
const CV_SECTION_NAMES = 'TECHNISCHE FÄHIGKEITEN|TECHNISCHE FAEHIGKEITEN|WORK EXPERIENCE|BERUFSERFAHRUNG|PERSONAL SKILLS|CERTIFICATIONS|ZERTIFIZIERUNGEN|SOFT SKILLS|SOFTSKILLS|WEITERBILDUNG|KOMPETENZEN|COMPETENCES|CERTIFICATES|ZERTIFIKATE|REFERENCES|EXPERIENCE|ERFAHRUNG|EDUCATION|AUSBILDUNG|INTERESSEN|LANGUAGES|OBJECTIVE|FORMATION|INTERESTS|PROJECTS|PROJEKTE|SUMMARY|STUDIUM|SPRACHEN|HOBBIES|PROFILE|PROJETS|LANGUES|SKILLS|PROFIL';

// Grab the text block under a section heading, up to the next known heading.
function cvSection(text, names) {
  const re = new RegExp(`(?:^|\\n)[ \\t]*(?:${names})[ \\t]*:?[ \\t]*\\n([\\s\\S]*?)(?=\\n[ \\t]*(?:${CV_SECTION_NAMES})[ \\t]*:?[ \\t]*(?:\\n|$)|$)`, 'i');
  const mm = text.match(re);
  return mm ? mm[1].trim() : '';
}

// Parse entries shaped "Role — Organisation (start – end)" + location/desc lines.
function parseCvEntries(block, withDesc) {
  const entries = [];
  let cur = null;
  for (const raw of block.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const dm = line.match(/\(([^)]*\d{4}[^)]*)\)\s*$/);
    const isHeader = /\s[—–-]\s/.test(line) && (dm || /\b\d{4}\b/.test(line));
    if (isHeader) {
      if (cur) { delete cur._loc; entries.push(cur); }
      let head = line, dates = '';
      if (dm) { dates = dm[1]; head = line.slice(0, dm.index).trim(); }
      const segs = head.split(/\s+[—–-]\s+/);
      const dd = dates.split(/\s*[–-]\s*/).map(s => s.trim());
      cur = { role: (segs[0] || '').trim(), org: segs.slice(1).join(' — ').trim(),
              location: '', start: dd[0] || '', end: dd[1] || '', desc: '', _loc: false };
    } else if (cur) {
      const looksLocation = !cur._loc && line.length < 45 && !/[.!]$/.test(line) && /[A-ZÄÖÜ]/.test(line);
      if (looksLocation) { cur.location = line; cur._loc = true; }
      // Joined with a newline, not a space. The generated CV renders one bullet
      // per line; joining with a space collapsed an entry's two bullets into a
      // single run-on sentence and there was no way to recover the split.
      else if (withDesc) cur.desc = (cur.desc ? cur.desc + '\n' : '') + line;
    }
  }
  if (cur) { delete cur._loc; entries.push(cur); }
  return entries;
}

// Apply an AI-extracted profile object onto the working profile (LLM wins where
// it has a value). Skills stay taxonomy-driven for accurate keys.
function applyLlmProfile(p, lp) {
  const s = v => (typeof v === 'string' ? v.trim() : '');
  ['firstName','lastName','email','phone','location','nationality','languages','title','summary']
    .forEach(k => { if (s(lp[k])) p[k] = s(lp[k]); });
  if (Array.isArray(lp.experience)) {
    const exp = lp.experience.map(e => ({
      role: s(e.role), org: s(e.org), location: s(e.location), start: s(e.start), end: s(e.end), desc: s(e.desc)
    })).filter(e => e.role || e.org);
    if (exp.length) p.experience = exp;
  }
  if (Array.isArray(lp.education)) {
    const edu = lp.education.map(e => ({
      degree: s(e.degree), org: s(e.org), location: s(e.location), start: s(e.start), end: s(e.end)
    })).filter(e => e.degree || e.org);
    if (edu.length) p.education = edu;
  }
  if (Array.isArray(lp.certifications)) {
    const certs = lp.certifications.map(c => ({ name: s(c.name), year: s(c.year) })).filter(c => c.name);
    if (certs.length) p.certifications = certs;
  }
}

// Extract structured profile fields from raw CV text + analysis. When an
// AI-extracted profile (llmProfile) is supplied, it is preferred and the regex
// parsing below is skipped (skills still come from the taxonomy analysis).
function extractProfileFromCV(text, analysis, llmProfile) {
  const p = state.profile || emptyProfile();

  if (llmProfile && typeof llmProfile === 'object') {
    applyLlmProfile(p, llmProfile);
    if (analysis && analysis.foundSkills && analysis.foundSkills.length) {
      // Category carried through. The generated CV groups skills the way a German
      // CV does — "Security Tools: Kali, Wireshark, Ghidra" — and without it every
      // skill fell into one undifferentiated "Kenntnisse" row.
      p.skills = analysis.foundSkills.map(sk => ({ key: sk.key, label: sk.label, category: sk.category || '' }));
    }
    if (!p.title && analysis && analysis.roles && analysis.roles.length) p.title = analysis.roles[0].name;
    // The document's own sections, on this path too. They fill only what the model
    // left empty, and skipping them here is the reason an imported CV came back
    // without its projects or its skills block on every machine where an API key was
    // configured: this branch always wins there, and the parsing sat below it.
    applyCvSections(p, text);
    state.profile = p;
    saveProfileToStorage();
    renderProfileForm();
    return;
  }

  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (email) p.email = email[0];

  const phone = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  if (phone) p.phone = phone[0].trim();

  // Name: first line with 2-3 capitalised words, no digits/@
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 6)) {
    if (!/[@\d]/.test(line) && /^[A-ZÄÖÜ][\wäöüéè'-]+(\s+[A-ZÄÖÜ][\wäöüéè'-]+){1,3}$/.test(line) && line.length < 45) {
      const parts = line.split(/\s+/);
      p.firstName = p.firstName || parts[0];
      p.lastName  = p.lastName  || parts.slice(1).join(' ');
      break;
    }
  }

  // Languages
  const langMap = { english: 'English', anglais: 'English', englisch: 'English',
    french: 'French', français: 'French', franzosisch: 'French', französisch: 'French',
    german: 'German', allemand: 'German', deutsch: 'German',
    spanish: 'Spanish', espagnol: 'Spanish', spanisch: 'Spanish',
    italian: 'Italian', arabic: 'Arabic', arabe: 'Arabic' };
  const low = text.toLowerCase();
  const langs = [...new Set(Object.keys(langMap).filter(k => low.includes(k)).map(k => langMap[k]))];
  if (langs.length) p.languages = langs.join(', ');

  // Skills from analysis
  if (analysis?.foundSkills?.length) {
    p.skills = analysis.foundSkills.map(s => ({ key: s.key, label: s.label, category: s.category || '' }));
  }
  // Title from top role
  if (!p.title && analysis?.roles?.length) p.title = analysis.roles[0].name;

  // Summary: paragraph after a Profil/Profile/Summary heading
  const m = text.match(/(?:profil|profile|summary|über mich|about me)[\s:]*\n?([\s\S]{40,400}?)(?:\n\s*\n|$)/i);
  if (m && !p.summary) p.summary = m[1].replace(/\s+/g, ' ').trim();

  // Location: from the contact line (email • phone • City • Country), else a
  // German postal code + city, or an Address/Wohnort line.
  if (!p.location) {
    const contactLine = lines.find(l => /@/.test(l) && /[•·|]/.test(l));
    if (contactLine) {
      const parts = contactLine.split(/[•·|]/).map(s => s.trim()).filter(Boolean);
      const cand = parts.find(s => !/@/.test(s) && !/\d{5,}/.test(s) && /^[A-ZÄÖÜ]/.test(s)
        && s.length < 30 && !/(native|proficiency|fluent|beginner|technical|languages?)/i.test(s));
      if (cand) p.location = cand;
    }
    if (!p.location) {
      const plz = text.match(/\b\d{5}\s+([A-ZÄÖÜ][a-zäöüß.\- ]{2,30})/);
      const locLine = text.match(/(?:address|adresse|wohnort|location|standort)[\s:]+([A-ZÄÖÜ][\wäöüß .,'-]{2,40})/i);
      const loc = (plz && plz[1].trim()) || (locLine && locLine[1].trim());
      if (loc) p.location = loc;
    }
  }

  // Experience (best-effort section parse).
  if (!p.experience || !p.experience.length) {
    const exp = parseCvEntries(cvSection(text, 'EXPERIENCE|WORK EXPERIENCE|ERFAHRUNG|BERUFSERFAHRUNG'), true);
    if (exp.length) p.experience = exp;
  }

  // Education (best-effort section parse) — header role maps to the degree.
  if (!p.education || !p.education.length) {
    const edu = parseCvEntries(cvSection(text, 'EDUCATION|AUSBILDUNG|STUDIUM|FORMATION'), false)
      .map(e => ({ degree: e.role, org: e.org, location: e.location, start: e.start, end: e.end }));
    if (edu.length) p.education = edu;
  }

  // Certifications: parse a CERTIFICATIONS section ("Name · Year") first, else
  // fall back to detected certification skills (CISSP, Security+, OSCP, …).
  if (!p.certifications || !p.certifications.length) {
    let certs = [];
    const certBlock = cvSection(text, 'CERTIFICATIONS|CERTIFICATES|ZERTIFIKATE|ZERTIFIZIERUNGEN');
    if (certBlock) {
      certs = certBlock.split('\n')
        .map(l => l.trim().replace(/^[:••-]\s*/, ''))
        .filter(Boolean)
        .map(line => {
          const ym = line.match(/(\d{4})\s*$/);
          const name = line.replace(/\s*[·(]?\s*\d{4}\)?\s*$/, '').replace(/[·:,\s]+$/, '').trim();
          return name ? { name, year: ym ? ym[1] : '' } : null;
        })
        .filter(Boolean);
    }
    if (!certs.length) {
      const certGroup = skillGroups.find(g => g.category === 'Certifications');
      const certKeys = new Set((certGroup ? certGroup.skills : []).map(s => s.key));
      certs = (analysis && analysis.foundSkills ? analysis.foundSkills : [])
        .filter(s => certKeys.has(s.key)).map(s => ({ name: s.label, year: '' }));
    }
    if (certs.length) p.certifications = certs;
  }

  // Projects, soft skills and interests. These section names were already listed
  // in CV_SECTION_NAMES — used as boundaries, so a PROJEKTE heading would stop the
  // BERUFSERFAHRUNG block from running on — but nothing ever read what sat between
  // them. The generated CV renders all three, and on a student CV the projects
  // section is usually the strongest evidence on the page: no employer yet, but
  // three university projects naming Ghidra, Wireshark and a VPN configuration.



  applyCvSections(p, text);

  state.profile = p;
  saveProfileToStorage();
  renderProfileForm();
}

/**
 * The CV's own sections, applied to a profile however that profile was built.
 *
 * This used to sit inline at the end of extractProfileFromCV(), below an early
 * return taken whenever the model had produced a profile. With an API key
 * configured that branch always wins, so projects, the skills block, soft skills
 * and interests were parsed by code that never ran — and the generated CV was
 * missing exactly those sections on every machine where the AI path succeeded.
 *
 * Every assignment below is conditional on the field being empty, so this adds to
 * the model's result rather than overwriting it.
 */
function applyCvSections(p, text) {
// Projects, read by structure rather than by bullet glyph — see parseProjectBlock.
if (!p.projects || !p.projects.length) {
  const projects = parseProjectBlock(cvSection(text, 'PROJECTS|PROJEKTE|PROJETS'));
  if (projects.length) p.projects = projects;
}

// The technical-skills block, in the candidate's own words and the candidate's own
// groupings. Kept separate from p.skills, which stays the taxonomy-matched list the
// job scoring needs: that list is right for matching and wrong for a document,
// having once turned "Kali Linux, Wireshark, IDA Pro, Ghidra, EDB" into labels
// including a "Medical documentation" matched from "technische Dokumentation".
if (!p.skillRows || !p.skillRows.length) {
  const rows = parseSkillRows(cvSection(text, 'SKILLS|KOMPETENZEN|COMPETENCES|TECHNISCHE FÄHIGKEITEN|TECHNISCHE FAEHIGKEITEN'));
  if (rows.length) p.skillRows = rows;
}

// Short, one-per-line sections. Capped at ten entries and eighty characters: a
// heading this parser mistook for a list would otherwise pour a whole paragraph
// into the rail, where there is no room for it.
const listSection = (names) => cvSection(text, names)
  .split(/\r?\n/)
  .map((l) => l.trim().replace(/^[•▸·*-]\s*/, ''))
  .filter((l) => l && l.length < 80)
  .slice(0, 10)
  .join('\n');

if (!p.softSkills) { const v = listSection('SOFT SKILLS|SOFTSKILLS|PERSONAL SKILLS'); if (v) p.softSkills = v; }
if (!p.interests)  { const v = listSection('INTERESTS|HOBBIES|INTERESSEN');           if (v) p.interests = v; }
if (!p.languages)  { const v = listSection('LANGUAGES|SPRACHEN|LANGUES');             if (v) p.languages = v; }
}

// Build a plain-text CV from the structured profile (for the Resume generator)
function profileToText() {
  const p = state.profile;
  if (!p) return state.cvText || '';
  const out = [];
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  if (name) out.push(name);
  const contact = [p.email, p.phone, p.location, p.nationality].filter(Boolean).join(' · ');
  if (contact) out.push(contact);
  if (p.languages) out.push('Languages: ' + p.languages);
  if (p.title) out.push('\nTarget: ' + p.title);
  if (p.summary) out.push('\n' + p.summary);
  if (p.skills?.length) out.push('\nSkills: ' + p.skills.map(s => s.label || s).join(', '));
  if (p.experience?.length) {
    out.push('\nExperience:');
    p.experience.forEach(e => out.push(`  ${[e.role, e.org].filter(Boolean).join(' — ')} ${[e.start, e.end].filter(Boolean).join('–')}\n  ${e.desc || ''}`));
  }
  if (p.education?.length) {
    out.push('\nEducation:');
    p.education.forEach(e => out.push(`  ${[e.degree, e.org].filter(Boolean).join(' — ')} ${[e.start, e.end].filter(Boolean).join('–')}`));
  }
  if (p.certifications?.length) {
    out.push('\nCertifications:');
    p.certifications.forEach(c => out.push(`  ${[c.name, c.year].filter(Boolean).join(' · ')}`));
  }
  return out.join('\n').trim();
}

// Profile completeness (for Getting Started)
function profileComplete() {
  const p = state.profile;
  if (!p) return false;
  return !!(p.firstName || p.lastName) && (p.skills?.length > 0);
}

function profileCompletionScore() {
  const p = state.profile || {};
  let score = 0;
  if (p.firstName && p.lastName) score += 10;
  if (p.email) score += 10;
  if (p.phone) score += 10;
  if (p.title) score += 10;
  if (p.summary) score += 10;
  if (p.skills?.length) score += 20;
  if (p.experience?.length) score += 15;
  if (p.education?.length || p.certifications?.length) score += 15;
  return Math.min(100, score);
}

function updateProfileSummary() {
  const score = profileCompletionScore();
  const skills = (state.profile?.skills || []).length;
  const exp = (state.profile?.experience || []).length;
  const edu = (state.profile?.education || []).length;
  const fill = $('pf-completion-fill');
  const pct = $('pf-completion-pct');
  const sk = $('pf-summary-skills');
  const ex = $('pf-summary-exp');
  const ed = $('pf-summary-edu');
  if (fill) fill.style.width = `${score}%`;
  if (pct) pct.textContent = `${score}%`;
  if (sk) sk.textContent = String(skills);
  if (ex) ex.textContent = String(exp);
  if (ed) ed.textContent = String(edu || (state.profile?.certifications?.length || 0));
}

function setCvProgressStep(stepKey) {
  const steps = document.querySelectorAll('#cv-progress-steps .progress-step');
  if (!steps.length) return;
  const container = $('cv-progress-steps');
  container.classList.remove('hidden');
  steps.forEach(step => {
    const key = step.dataset.step;
    step.classList.toggle('active', key === stepKey);
    step.classList.toggle('completed', key !== stepKey && key !== 'done');
  });
}

// ── Profile: mode toggle (Import from CV / Manual entry) ─────────────────────
document.querySelectorAll('.profile-mode-btn').forEach(btn =>
  btn.addEventListener('click', () => setProfileMode(btn.dataset.mode))
);

function setProfileMode(mode) {
  document.querySelectorAll('.profile-mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));
  const imp = $('profile-import'); const man = $('profile-manual');
  if (imp) imp.classList.toggle('hidden', mode !== 'import');
  if (man) man.classList.toggle('hidden', mode !== 'manual');
  if (mode === 'manual') renderProfileForm();
}

const _editExtractedBtn = $('profile-edit-extracted');
if (_editExtractedBtn) _editExtractedBtn.addEventListener('click', () => setProfileMode('manual'));

// ── Profile: Photo upload (compressed to keep storage small) ────────────────
function handlePhotoFile(file) {
  if (!file || !file.type.startsWith('image/')) { toast('Please choose an image file.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      // Downscale to max 320px on the long side, output JPEG
      const max = 320;
      let { width, height } = img;
      if (width > height && width > max) { height = height * max / width; width = max; }
      else if (height > max) { width = width * max / height; height = max; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      state.profile.photo = canvas.toDataURL('image/jpeg', 0.82);
      saveProfileToStorage();
      renderProfileForm();
      toast('Photo added.', 'success');
    };
    img.onerror = () => toast('Could not read that image.', 'error');
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

const _photoBtn   = $('pf-photo-btn');
const _photoInput = $('pf-photo-input');
const _photoRemove= $('pf-photo-remove');
if (_photoBtn && _photoInput) {
  _photoBtn.addEventListener('click', () => _photoInput.click());
  _photoInput.addEventListener('change', e => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f); _photoInput.value = ''; });
}
if (_photoRemove) _photoRemove.addEventListener('click', () => {
  state.profile.photo = ''; saveProfileToStorage(); renderProfileForm(); toast('Photo removed.', 'info');
});

const _pfReset = $('pf-reset');
if (_pfReset) _pfReset.addEventListener('click', () => {
  if (!confirm('Delete your saved profile data? This cannot be undone.')) return;
  state.profile = emptyProfile();
  saveProfileToStorage();
  renderProfileForm();
  updateProfileSummary();
  toast('Profile data deleted.', 'info');
});

// ── Profile → structured CV PDF (jsPDF) ─────────────────────────────────────
// Builds the polished, photo-bearing CV from the structured profile and returns
// the jsPDF doc. `overrides` lets callers tailor a copy (e.g. the target job title)
// without mutating the saved profile. Used by the Profile "Download PDF" button.
function buildProfilePdfDoc(profile, overrides) {
  const p = Object.assign({}, profile || emptyProfile(), overrides || {});
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name';

  const lib = window.jspdf;
  if (!lib || !lib.jsPDF) { toast('PDF library not loaded — try refreshing the page.', 'error'); return null; }

  const doc = new lib.jsPDF({ unit: 'pt', format: 'a4' });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();

  // Two columns, in the proportions a German Lebenslauf uses: the narrow rail on
  // the right carries the facts a recruiter scans for — contact, education,
  // languages — and the wide column carries the evidence.
  const M = 40;
  const GAP = 18;
  const SIDE_W = 168;
  const MAIN_X = M;
  const MAIN_W = PAGE_W - M * 2 - SIDE_W - GAP;
  const SIDE_X = PAGE_W - M - SIDE_W;

  const TEAL  = [42, 122, 150];
  const DARK  = [28, 40, 56];
  const GREY  = [100, 116, 139];
  const RAIL  = [238, 242, 245];
  const WHITE = [255, 255, 255];

  let yMain = 0, ySide = 0;

  // The rail's grey field, repainted on every page — including pages where it
  // holds nothing, because a column that vanishes halfway through a document
  // reads as a rendering fault rather than as a design.
  function paintRail(from) {
    doc.setFillColor(RAIL[0], RAIL[1], RAIL[2]);
    doc.rect(SIDE_X - 10, from - 12, SIDE_W + 20, PAGE_H - from - M + 12, 'F');
  }

  function setFont(size, style, color) {
    doc.setFont('helvetica', style || 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  }

  function nextPage() {
    doc.addPage();
    paintRail(M);
    yMain = M;
    ySide = M;
  }

  // Wrapped text inside one column. Each column paginates on its own cursor;
  // when either runs out of room both restart at the top of a new page, which
  // keeps the two from drifting onto different sheets.
  function write(str, x, w, size, style, color, lead) {
    setFont(size, style, color);
    const lines = doc.splitTextToSize(String(str), w);
    const step = lead || size + 3;
    const isMain = (x === MAIN_X);
    lines.forEach(function (line) {
      let y = isMain ? yMain : ySide;
      if (y + step > PAGE_H - M) { nextPage(); y = M; }
      doc.text(line, x, y);
      y += step;
      if (isMain) yMain = y; else ySide = y;
    });
  }

  // Main-column heading: white on a filled teal bar.
  function mainSection(label) {
    yMain += 10;
    if (yMain + 30 > PAGE_H - M) nextPage();
    doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.rect(MAIN_X, yMain - 2, MAIN_W, 17, 'F');
    setFont(9.5, 'bold', WHITE);
    doc.text(String(label).toUpperCase(), MAIN_X + 8, yMain + 10);
    yMain += 28;
  }

  // Rail heading: teal type over a hairline rather than a second filled bar. The
  // rail is already a block of colour and a bar inside it would fight the one
  // opposite for the reader's eye.
  function railSection(label) {
    ySide += 12;
    if (ySide + 28 > PAGE_H - M) nextPage();
    setFont(9.5, 'bold', TEAL);
    doc.text(String(label).toUpperCase(), SIDE_X, ySide);
    ySide += 4;
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.setLineWidth(0.8);
    doc.line(SIDE_X, ySide, SIDE_X + SIDE_W, ySide);
    ySide += 13;
  }

  // The dot is drawn separately and the body indented past it, so a wrapped
  // second line aligns under the first word instead of under the bullet.
  function bulletList(items, x, w) {
    const isMain = (x === MAIN_X);
    (items || []).forEach(function (raw) {
      const line = String(raw).trim();
      if (!line) return;
      let y = isMain ? yMain : ySide;
      if (y + 12 > PAGE_H - M) { nextPage(); y = M; }
      setFont(9, 'normal', DARK);
      doc.text('•', x, y);
      const lines = doc.splitTextToSize(line, w - 10);
      lines.forEach(function (l) {
        if (y + 12.5 > PAGE_H - M) { nextPage(); y = M; }
        doc.text(l, x + 10, y);
        y += 12.5;
      });
      // Five points between bullets, not two. At two, a bullet that wraps onto a
      // second line is indistinguishable from the next bullet starting, and a
      // three-bullet entry reads as one block of grey.
      y += 5;
      if (isMain) yMain = y; else ySide = y;
    });
  }

  // A description may arrive as an array, or as one string holding several
  // points. Both shapes exist in saved profiles: the CV parser produces lines,
  // the manual form produces a textarea.
  function splitLines(value) {
    if (Array.isArray(value)) return value;
    return String(value || '').split(/\r?\n|;|·|•/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  // ── Header ────────────────────────────────────────────────────────────────
  const PHOTO = 96;
  let y = M;
  if (p.photo) {
    try { doc.addImage(p.photo, 'JPEG', PAGE_W - M - PHOTO, y, PHOTO, PHOTO); }
    catch (_) { /* an unreadable photo must not cost the whole document */ }
  }
  const headW = PAGE_W - M * 2 - (p.photo ? PHOTO + 20 : 0);

  setFont(23, 'bold', DARK);
  doc.splitTextToSize(name, headW).forEach(function (l) { doc.text(l, M, y + 20); y += 26; });
  if (p.title) {
    setFont(12.5, 'bold', TEAL);
    doc.splitTextToSize(p.title, headW).forEach(function (l) { doc.text(l, M, y + 12); y += 16; });
  }
  if (p.summary) {
    setFont(9.5, 'normal', GREY);
    doc.splitTextToSize(p.summary, headW).slice(0, 3).forEach(function (l) { doc.text(l, M, y + 10); y += 13; });
  }
  y = Math.max(y + 12, M + (p.photo ? PHOTO + 14 : 0));
  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(2);
  doc.line(M, y, PAGE_W - M, y);

  const headerBottom = y + 22;
  paintRail(headerBottom);
  yMain = headerBottom;
  ySide = headerBottom;

  // ── Rail ──────────────────────────────────────────────────────────────────
  const contact = [
    p.location    ? ['Ort', p.location] : null,
    p.email       ? ['E-Mail', p.email] : null,
    p.phone       ? ['Tel', p.phone] : null,
    p.nationality ? ['Nationalität', p.nationality] : null,
  ].filter(Boolean);

  if (contact.length) {
    railSection('Kontakt');
    contact.forEach(function (kv) {
      write(kv[0] + ':', SIDE_X, SIDE_W, 8.5, 'bold', DARK, 11);
      write(kv[1], SIDE_X, SIDE_W, 8.5, 'normal', GREY, 11);
      ySide += 3;
    });
  }

  if (p.education && p.education.length) {
    railSection('Ausbildung');
    p.education.forEach(function (x) {
      const dates = [x.start, x.end].filter(Boolean).join(' – ');
      if (dates)    write(dates, SIDE_X, SIDE_W, 8, 'normal', GREY, 10);
      if (x.degree) write(x.degree, SIDE_X, SIDE_W, 9, 'bold', DARK, 11);
      const sub = [x.org, x.grade ? 'Note: ' + x.grade : ''].filter(Boolean).join(' | ');
      if (sub)      write(sub, SIDE_X, SIDE_W, 8.5, 'normal', GREY, 11);
      ySide += 8;
    });
  }

  if (p.languages) {
    railSection('Sprachen');
    // Commas count as separators here and nowhere else. The profile form holds
    // languages in a single-line <input>, so the parser has to join them with ", "
    // — and rendering that verbatim produced one run-on paragraph where the CV
    // shows three lines. A description may legitimately contain commas, which is
    // why this is not in splitLines().
    const langs = splitLines(p.languages)
      .reduce(function (acc, line) { return acc.concat(line.split(/\s*,\s*/)); }, [])
      .map(function (l) { return l.trim(); })
      .filter(Boolean);
    langs.forEach(function (l) {
      write(l, SIDE_X, SIDE_W, 8.5, 'normal', DARK, 12);
    });
  }

  if (p.softSkills && splitLines(p.softSkills).length) {
    railSection('Soft Skills');
    bulletList(splitLines(p.softSkills), SIDE_X, SIDE_W);
  }

  if (p.interests && splitLines(p.interests).length) {
    railSection('Interessen');
    bulletList(splitLines(p.interests), SIDE_X, SIDE_W);
  }

  // ── Main column ───────────────────────────────────────────────────────────
  if (p.experience && p.experience.length) {
    mainSection('Berufserfahrung');
    p.experience.forEach(function (x) {
      const dates = [x.start, x.end].filter(Boolean).join(' – ');
      if (dates)  write(dates, MAIN_X, MAIN_W, 8, 'normal', GREY, 11);
      if (x.role) write(x.role, MAIN_X, MAIN_W, 10.5, 'bold', TEAL, 13);
      const org = [x.org, x.location].filter(Boolean).join(', ');
      if (org)    write(org, MAIN_X, MAIN_W, 9.5, 'bold', DARK, 12);
      if (x.desc) bulletList(splitLines(x.desc), MAIN_X, MAIN_W);
      // Entries need more air between them than bullets do inside one, or the
      // reader cannot see where a job ends and the next begins.
      yMain += 14;
    });
  }

  // The CV's own rows when the parser found them, the taxonomy match otherwise.
  //
  // The order matters. The taxonomy list is built for job scoring: it maps free text
  // onto canonical keys, and printing those keys turned "Kali Linux, Wireshark, IDA
  // Pro, Ghidra, EDB" into a single "Kenntnisse" row that included a "Medical
  // documentation" matched from "technische Dokumentation". A document has to say
  // what the candidate wrote, in the groups the candidate chose.
  const rows = (p.skillRows && p.skillRows.length)
    ? p.skillRows.reduce(function (acc, r) { acc[r.category] = [r.values]; return acc; }, {})
    : null;

  if (rows || (p.skills && p.skills.length)) {
    mainSection('Technische Fähigkeiten');
    const groups = rows || (function () {
      const g = {};
      p.skills.forEach(function (s) {
        const label = s.label || s.key || s;
        const cat = String(s.category || '').trim() || 'Kenntnisse';
        (g[cat] = g[cat] || []).push(label);
      });
      return g;
    })();
    Object.keys(groups).forEach(function (cat) {
      const LABEL_W = 104;
      if (yMain + 14 > PAGE_H - M) nextPage();
      setFont(9, 'bold', TEAL);
      doc.text(cat + ':', MAIN_X, yMain);
      const lines = doc.splitTextToSize(groups[cat].join(', '), MAIN_W - LABEL_W);
      setFont(9, 'normal', DARK);
      let y1 = yMain;
      lines.forEach(function (l) {
        if (y1 + 12 > PAGE_H - M) { nextPage(); y1 = M; }
        doc.text(l, MAIN_X + LABEL_W, y1);
        y1 += 12;
      });
      yMain = y1 + 5;
    });
  }

  if (p.projects && p.projects.length) {
    mainSection('Projekte');
    p.projects.forEach(function (x) {
      if (x.name) write(x.name, MAIN_X, MAIN_W, 10, 'bold', TEAL, 13);
      const sub = [x.org, x.year].filter(Boolean).join(', ');
      if (sub)    write(sub, MAIN_X, MAIN_W, 8, 'normal', GREY, 11);
      if (x.desc) bulletList(splitLines(x.desc), MAIN_X, MAIN_W);
      // Entries need more air between them than bullets do inside one, or the
      // reader cannot see where a job ends and the next begins.
      yMain += 14;
    });
  }

  if (p.certifications && p.certifications.length) {
    mainSection('Weiterbildung');
    p.certifications.forEach(function (x) {
      const head = [x.name, x.year].filter(Boolean).join(' – ');
      if (head)   write(head, MAIN_X, MAIN_W, 9.5, 'bold', TEAL, 12);
      if (x.desc) bulletList(splitLines(x.desc), MAIN_X, MAIN_W);
      yMain += 3;
    });
  }

  return { doc, name };
}

// Profile page: download the CV exactly as the profile defines it.
function downloadProfilePDF() {
  const built = buildProfilePdfDoc(state.profile);
  if (!built) return;
  const fileName = (built.name.replace(/\s+/g, '_') || 'CareerAI') + '_CV.pdf';
  built.doc.save(fileName);
  toast(`${fileName} downloaded!`, 'success');
}

['pf-download-pdf', 'pf-download-pdf-2'].forEach(id => {
  const b = $(id);
  if (b) b.addEventListener('click', downloadProfilePDF);
});

// ── Profile: render the manual form from state.profile ───────────────────────
function renderProfileForm() {
  const p = state.profile || emptyProfile();
  const setVal = (id, v) => { const el = $(id); if (el) el.value = v || ''; };
  setVal('pf-firstName', p.firstName);
  setVal('pf-lastName',  p.lastName);
  setVal('pf-email',     p.email);
  setVal('pf-phone',     p.phone);
  setVal('pf-location',  p.location);
  setVal('pf-nationality', p.nationality);
  setVal('pf-languages', p.languages);
  setVal('pf-title',     p.title);
  setVal('pf-summary',   p.summary);
  renderSkillTags();
  renderRepeatList('exp');
  renderRepeatList('edu');
  renderRepeatList('cert');

  // Avatar (photo or initials)
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  const av = $('pf-avatar');
  if (av) {
    if (p.photo) {
      av.textContent = '';
      av.style.backgroundImage = `url(${p.photo})`;
      av.style.backgroundSize = 'cover';
      av.style.backgroundPosition = 'center';
    } else {
      av.style.backgroundImage = '';
      av.textContent = name ? name.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase() : '?';
    }
  }

  // Photo preview + remove button
  const prev = $('pf-photo-preview');
  if (prev) {
    if (p.photo) { prev.innerHTML = `<img src="${p.photo}" alt="photo" />`; }
    else { prev.innerHTML = '<span>Photo</span>'; }
  }
  const rm = $('pf-photo-remove');
  if (rm) rm.classList.toggle('hidden', !p.photo);
  const upBtn = $('pf-photo-btn');
  if (upBtn) upBtn.textContent = p.photo ? 'Change photo' : 'Upload photo';

  // Missing-field warnings (like the template)
  const warn = $('pf-contact-warn');
  if (warn) {
    const missing = [];
    if (!p.location)            missing.push('current location');
    if (!p.phone)               missing.push('phone number');
    if (!p.email)               missing.push('email');
    warn.innerHTML = missing.length
      ? missing.map(m => `<span class="pf-warn-item">Missing ${m}</span>`).join('')
      : '';
  }
  updateProfileSummary();
}

// ── Profile: skill tags ───────────────────────────────────────────────────────
function renderSkillTags() {
  const wrap = $('pf-skill-tags');
  if (!wrap) return;
  const skills = state.profile.skills || [];
  wrap.innerHTML = skills.length
    ? skills.map((s, i) => `<span class="skill-tag">${esc(s.label || s)}<button data-i="${i}" title="Remove">✕</button></span>`).join('')
    : '<span class="hint">No skills yet. Add some, or import from your CV.</span>';
  wrap.querySelectorAll('.skill-tag button').forEach(b =>
    b.addEventListener('click', e => {
      state.profile.skills.splice(Number(e.currentTarget.dataset.i), 1);
      saveProfileToStorage(); renderSkillTags();
    })
  );
}

function addSkillFromInput() {
  const input = $('pf-skill-input');
  const val = input.value.trim();
  if (!val) return;
  state.profile.skills = state.profile.skills || [];
  // Match against known skills (incl. aliases) for a clean label
  const norm = normalize(val);
  let label = val;
  for (const g of skillGroups) for (const s of g.skills) {
    if ([s.key, ...(s.aliases || [])].some(k => normalize(k) === norm || norm.includes(normalize(k)))) { label = s.label; break; }
  }
  if (!state.profile.skills.some(s => (s.label || s).toLowerCase() === label.toLowerCase())) {
    state.profile.skills.push({ key: norm, label });
    saveProfileToStorage(); renderSkillTags();
  }
  input.value = '';
  input.focus();
}

const _skillAdd = $('pf-skill-add');
if (_skillAdd) _skillAdd.addEventListener('click', addSkillFromInput);
const _skillInput = $('pf-skill-input');
if (_skillInput) _skillInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkillFromInput(); } });

// ── Profile: repeatable lists (experience / education / certifications) ──────
const REPEAT_DEFS = {
  exp:  { key: 'experience',     fields: [['role','Role/Title'],['org','Company/Institution'],['location','Location'],['start','Start (e.g. 09.2023)'],['end','End (e.g. 06.2024)'],['desc','Description']] },
  edu:  { key: 'education',      fields: [['degree','Degree/Programme'],['org','Institution'],['location','Location'],['start','Start'],['end','End']] },
  cert: { key: 'certifications', fields: [['name','Certificate name'],['year','Year']] },
};

function renderRepeatList(type) {
  const def  = REPEAT_DEFS[type];
  const list = $(`pf-${type}-list`);
  if (!list) return;
  const arr = state.profile[def.key] || [];
  list.innerHTML = arr.length
    ? arr.map((item, i) => `
      <div class="repeat-item" data-i="${i}">
        ${def.fields.map(([f, ph]) => f === 'desc'
          ? `<textarea class="field" rows="2" data-f="${f}" placeholder="${ph}">${esc(item[f] || '')}</textarea>`
          : `<input class="field" type="text" data-f="${f}" placeholder="${ph}" value="${esc(item[f] || '')}" />`).join('')}
        <button class="repeat-del" data-i="${i}" title="Remove">Remove</button>
      </div>`).join('')
    : '<span class="hint">Nothing yet — click “Add” above.</span>';

  // live-bind inputs
  list.querySelectorAll('.repeat-item').forEach(row => {
    const i = Number(row.dataset.i);
    row.querySelectorAll('[data-f]').forEach(inp =>
      inp.addEventListener('input', () => {
        state.profile[def.key][i][inp.dataset.f] = inp.value;
        saveProfileToStorage();
      })
    );
    row.querySelector('.repeat-del').addEventListener('click', () => {
      state.profile[def.key].splice(i, 1);
      saveProfileToStorage(); renderRepeatList(type);
    });
  });
}

function addRepeatItem(type) {
  const def = REPEAT_DEFS[type];
  state.profile[def.key] = state.profile[def.key] || [];
  const blank = {};
  def.fields.forEach(([f]) => blank[f] = '');
  state.profile[def.key].push(blank);
  saveProfileToStorage(); renderRepeatList(type);
}

['exp','edu','cert'].forEach(type => {
  const btn = $(`pf-add-${type === 'exp' ? 'exp' : type}`);
  if (btn) btn.addEventListener('click', () => addRepeatItem(type));
});

// ── Profile: save (read manual form) ─────────────────────────────────────────
const _pfSave = $('pf-save');
if (_pfSave) _pfSave.addEventListener('click', () => {
  const get = id => ($(id)?.value || '').trim();
  const p = state.profile;
  p.firstName = get('pf-firstName'); p.lastName = get('pf-lastName');
  p.email = get('pf-email'); p.phone = get('pf-phone');
  p.location = get('pf-location'); p.nationality = get('pf-nationality');
  p.languages = get('pf-languages'); p.title = get('pf-title'); p.summary = get('pf-summary');
  saveProfileToStorage();

  // Feed skills into analysis so job matching works
  if (p.skills?.length) {
    const foundKeys = p.skills.map(s => s.key || normalize(s.label || s));
    const allSkills = skillGroups.flatMap(g => g.skills);
    state.analysis = {
      foundSkills:   p.skills.map(s => ({ key: s.key || normalize(s.label||s), label: s.label || s })),
      missingSkills: allSkills.filter(s => !foundKeys.includes(s.key)),
      roles:         analyzeRolesLocal(foundKeys),
      domain:        detectDomain(foundKeys)
    };
  }
  const msg = $('pf-save-msg');
  if (msg) { msg.className = 'form-msg ok'; msg.textContent = 'Profile saved ✓'; setTimeout(() => msg.textContent = '', 2500); }
  refreshGettingStarted();
  updateStats();
  toast('Profile saved!', 'success');

  // If we got here from a job's "Update profile", return to it and re-match.
  if (jwReturnApp) {
    const app = jwReturnApp; jwReturnApp = null;
    if (typeof navigate === 'function') navigate('jobs');
    setTimeout(() => openJobWorkspace(app), 250);
  }
});

// ════════════════════════════════════════════════════════════════════════════
//  GETTING STARTED
// ════════════════════════════════════════════════════════════════════════════
function refreshGettingStarted() {
  const steps = [
    !!state.user,
    profileComplete(),
    state.apps.length > 0,
    state.docsCount > 0,
  ];
  const done = steps.filter(Boolean).length;
  const bar  = $('gs-progress-bar');
  const txt  = $('gs-progress-text');
  if (bar) bar.style.width = `${(done / steps.length) * 100}%`;
  if (txt) txt.textContent = `${done} of ${steps.length} steps completed.`;
  steps.forEach((ok, i) => {
    const step = $(`gs-step-${i + 1}`);
    if (step) {
      step.classList.toggle('done', ok);
      const chk = step.querySelector('.gs-check');
      if (chk) chk.textContent = ok ? '✓' : String(i + 1);
    }
  });
  const accBtn = $('gs-btn-account');
  if (accBtn) accBtn.textContent = state.user ? `Signed in as ${state.user}` : 'Sign in';
}

const _gsAccount = $('gs-btn-account');
if (_gsAccount) _gsAccount.addEventListener('click', () => { if (!state.user) showAuthModal(); });

// ════════════════════════════════════════════════════════════════════════════
//  INTERVIEWS
// ════════════════════════════════════════════════════════════════════════════
function generateInterview(role) {
  const domain = state.analysis?.domain || '';
  const skills = (state.profile?.skills || state.analysis?.foundSkills || []).map(s => s.label || s).slice(0, 6);

  const common = [
    'Tell me about yourself and your background.',
    `Why are you interested in the ${role || 'this'} position?`,
    'What are your greatest strengths and one weakness you are working on?',
    'Where do you see yourself in 5 years?',
    'Describe a challenge you faced and how you handled it.',
    'Why should we hire you over other candidates?',
  ];

  const byDomain = {
    'Healthcare & Nursing': [
      'How do you handle a patient or family member who is anxious or upset?',
      'Describe your experience with patient documentation and hygiene protocols.',
      'How do you prioritise when caring for several patients at once?',
      'Tell me about a time you worked under pressure during a shift.',
    ],
    'Software Development': [
      'Walk me through a project you built and the tech choices you made.',
      'How do you debug a tricky production issue?',
      'Explain the difference between REST and other API styles.',
      'How do you ensure your code is maintainable and tested?',
    ],
    'Data & AI': [
      'How would you approach cleaning a messy dataset?',
      'Explain a machine learning model you have used and why.',
      'How do you validate that your analysis is correct?',
      'Describe a dashboard or report that drove a decision.',
    ],
    'Cybersecurity': [
      'Walk me through how you would respond to a security incident.',
      'How do you stay current with new threats and vulnerabilities?',
      'Explain the OWASP Top 10 at a high level.',
    ],
    'Marketing & Sales': [
      'Describe a campaign you ran and its measurable results.',
      'How do you handle objections from a prospect?',
      'Which metrics matter most for your channels?',
    ],
    'Finance & Accounting': [
      'Walk me through the three financial statements.',
      'Describe a time your analysis influenced a financial decision.',
    ],
  };

  const roleQs = byDomain[domain] || [
    'What relevant experience do you bring to this role?',
    'Describe a time you solved a difficult problem at work.',
    'How do you keep your skills up to date?',
  ];

  const tips = [
    'Use the STAR method: Situation, Task, Action, Result.',
    'Research the company beforehand — mention something specific.',
    'Prepare 2-3 questions to ask the interviewer.',
    skills.length ? `Be ready to give concrete examples of: ${skills.join(', ')}.` : 'Prepare concrete examples for each skill on your CV.',
    'Send a short thank-you message within 24 hours.',
  ];

  return { role: role || state.profile?.title || domain || 'your target role', common, roleQs, tips };
}

/**
 * `derivedFrom` is the honest label. The old version headed the second block
 * "Role-specific (Data Analyst)" even when the questions were a canned HR list
 * that had never seen the role — the same lie as a Critic score nobody computed.
 */
function renderInterview(role, common, roleSpecific, tips, usedAI, derivedFrom) {
  const section = arr => (arr || []).map(q => `<li>${esc(q)}</li>`).join('');
  const heading = usedAI
    ? `Role-specific (${esc(role)})`
    : 'Technical questions';
  const note = usedAI
    ? ''
    : `<div class="hint" style="margin-bottom:8px">No model was reachable — these are built from
        ${esc(derivedFrom || 'the built-in taxonomy')}.</div>`;

  // With neither a known role nor a parsed CV there is nothing technical to ask.
  // An empty numbered list under a confident heading is worse than no block.
  const technicalBlock = (roleSpecific || []).length
    ? `<div class="iv-block"><h3 class="col-label">${heading}</h3>${note}<ol class="iv-list">${section(roleSpecific)}</ol></div>`
    : `<div class="iv-block"><h3 class="col-label">${heading}</h3>
         <div class="hint">Upload your CV or name a role this app knows, and the technical questions
         will be built from the skills it actually requires.</div></div>`;

  $('interview-content').innerHTML = `
    <div class="iv-block"><h3 class="col-label">Common questions</h3><ol class="iv-list">${section(common)}</ol></div>
    ${technicalBlock}
    <div class="iv-block"><h3 class="col-label">Tips</h3><ul class="iv-list">${section(tips)}</ul></div>`;
  $('interview-output').classList.remove('hidden');
  state.docsCount++;
  refreshGettingStarted();
  updateStats();
  toast(usedAI ? 'AI interview prep generated!' : 'Interview prep built from your skills (no model).', usedAI ? 'success' : 'info');
}

// ── Interview prep tied to one saved job ───────────────────────────────────
//
// The board's "Interview →" button only advances the pipeline stage. Preparing for
// the interview is a different action and belongs to a specific posting: its title,
// its company, and — for jobs saved from a search — its actual description, which is
// what turns generic role questions into questions about this posting.
function interviewJob() {
  if (!state.interviewJobId) return null;
  return (state.apps || []).find(a => a.id === state.interviewJobId) || null;
}

function renderInterviewContext() {
  const el = $('interview-context');
  if (!el) return;
  const job = interviewJob();
  if (!job) { el.classList.add('hidden'); el.innerHTML = ''; return; }

  el.innerHTML = `
    <div>
      <strong>${esc(job.title)}</strong>
      <div class="hint">${esc(job.company || 'Unknown company')}${job.location ? ' · ' + esc(job.location) : ''}${
        job.description ? ' · questions drawn from the posting' : ' · no posting text saved, questions from the role only'
      }</div>
    </div>
    <button class="btn btn-ghost btn-xs" id="interview-context-clear">Not this job</button>`;
  el.classList.remove('hidden');
  $('interview-context-clear')?.addEventListener('click', () => {
    state.interviewJobId = null;
    renderInterviewContext();
    toast('Interview prep is no longer tied to a job.', 'info');
  });
}

function prepInterviewForJob(id) {
  const job = (state.apps || []).find(a => a.id === id);
  if (!job) { toast('That job is no longer in your tracker.', 'error'); return; }

  state.interviewJobId = id;
  navigate('interviews');
  const roleInput = $('interview-role');
  if (roleInput) roleInput.value = job.title || '';
  renderInterviewContext();
  // Generate straight away: the user already said which job they mean, so making
  // them press a second button adds nothing.
  $('generate-interview-btn')?.click();
}

const _interviewBtn = $('generate-interview-btn');
if (_interviewBtn) _interviewBtn.addEventListener('click', async () => {
  const job  = interviewJob();
  // The typed field still wins: the user may retitle the role for a job-linked prep.
  const role = $('interview-role').value.trim() || job?.title || state.profile?.title || '';
  const btn = _interviewBtn; const orig = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = 'Generating…';

  // The server answers either way: the model when it is reachable, otherwise
  // questions derived from the role's own required skills.
  let done = false;
  try {
    const skills = (state.profile?.skills || state.analysis?.foundSkills || []).map(s => s.label || s).slice(0, 10);
    const r = await api.post('/api/generate-interview', {
      role, skills,
      domain: state.analysis?.domain || '',
      company: job?.company || '',
      jobDescription: job?.description || '',
    });
    if (r && r.data) {
      renderInterview(role || 'your target role', r.data.common, r.data.roleSpecific, r.data.tips,
        r.ok && r.source === 'ai', r.data.derivedFrom);
      done = true;
    }
  } catch (_) { /* the server is unreachable — fall back locally */ }

  if (!done) {
    const d = generateInterview(role);
    renderInterview(d.role, d.common, d.roleQs, d.tips, false, 'the built-in question bank');
  }
  btn.disabled = false; btn.innerHTML = orig;
});

const _ivCopy = $('copy-interview-btn');
if (_ivCopy) _ivCopy.addEventListener('click', () => {
  const text = $('interview-content').innerText;
  navigator.clipboard.writeText(text).then(() => toast('Copied!', 'success')).catch(() => {});
});

// ════════════════════════════════════════════════════════════════════════════
//  TOPBAR — Add New Job dropdown + avatar
// ════════════════════════════════════════════════════════════════════════════
const _addJobBtn  = $('add-job-btn');
const _addJobMenu = $('add-job-menu');
if (_addJobBtn && _addJobMenu) {
  _addJobBtn.addEventListener('click', e => { e.stopPropagation(); _addJobMenu.classList.toggle('hidden'); });
  document.addEventListener('click', () => _addJobMenu.classList.add('hidden'));
  _addJobMenu.querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => {
      _addJobMenu.classList.add('hidden');
      if (b.dataset.add === 'manual') { navigate('jobs'); $('add-app-form').classList.remove('hidden'); $('app-title').focus(); }
      else { navigate('search'); }
    })
  );
}
const _topAvatar = $('topbar-avatar');
if (_topAvatar) _topAvatar.addEventListener('click', () => navigate('profile'));

// Merge the extended IT-Security taxonomy (200+ skills) loaded by security-skills.js,
// de-duplicating by key so existing multi-domain skills stay and none is detected twice.
// A duplicate key still contributes its aliases to the surviving entry.
function mergeSecuritySkills() {
  const groups = (typeof window !== 'undefined' && window.SECURITY_GROUPS) || [];
  if (!groups.length) return;
  const byKey = new Map(skillGroups.flatMap(g => g.skills).map(s => [s.key, s]));
  groups.forEach(group => {
    const skills = [];
    group.skills.forEach(s => {
      const existing = byKey.get(s.key);
      if (existing) {
        existing.aliases = [...new Set([...(existing.aliases || []), ...(s.aliases || [])])];
      } else {
        byKey.set(s.key, s);
        skills.push(s);
      }
    });
    if (skills.length) skillGroups.push({ category: group.category, skills });
  });
}

// ── My Account (identity manager) ─────────────────────────────────────────
let accountData = null;

// "Windows · Chrome" from a User-Agent. Deliberately coarse: the point is for the
// user to recognise their own devices, not to fingerprint them.
function describeDevice(ua) {
  const s = String(ua || '');
  if (!s) return 'Unknown device';
  const os =
    /Windows NT/.test(s) ? 'Windows' :
    /Android/.test(s)    ? 'Android' :
    /iPhone|iPad/.test(s)? 'iOS'     :
    /Mac OS X/.test(s)   ? 'macOS'   :
    /Linux/.test(s)      ? 'Linux'   : 'Unknown OS';
  const browser =
    /Edg\//.test(s)      ? 'Edge'    :
    /OPR\//.test(s)      ? 'Opera'   :
    /Chrome\//.test(s)   ? 'Chrome'  :
    /Firefox\//.test(s)  ? 'Firefox' :
    /Safari\//.test(s)   ? 'Safari'  : 'Unknown browser';
  return `${os} · ${browser}`;
}

function relativeTime(ms) {
  if (!ms) return 'unknown';
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

async function loadAccount() {
  const signedOut = $('account-signed-out');
  const body = $('account-body');
  if (!body) return;

  if (!state.token) {
    signedOut.classList.remove('hidden');
    body.classList.add('hidden');
    return;
  }

  try {
    accountData = await api.get('/api/account');
  } catch (e) {
    signedOut.classList.remove('hidden');
    body.classList.add('hidden');
    toast(e.message || 'Could not load your account.', 'error');
    return;
  }

  signedOut.classList.add('hidden');
  body.classList.remove('hidden');
  const d = accountData;

  $('ac-name').value  = d.name || '';
  $('ac-email').value = d.email || '';
  $('ac-role').textContent = d.role;
  $('ac-meta').textContent = `Username: ${d.username}`
    + (d.birthDate ? ` · born ${new Date(d.birthDate + 'T00:00:00').toLocaleDateString('en-GB')}` : '')
    + (d.phone ? ` · ${d.phone}` : '')
    + (d.createdAt ? ` · joined ${new Date(d.createdAt).toLocaleDateString('en-GB')}` : '');

  // Email confirmation status, with a resend when it is still pending.
  const ev = $('ac-email-state');
  if (ev) {
    if (!d.email) {
      ev.innerHTML = '<span class="hint">No email address set.</span>';
    } else if (d.emailVerified) {
      ev.innerHTML = '<span class="pill ok">email confirmed</span>';
    } else {
      ev.innerHTML = '<span class="pill warn">email not confirmed</span>'
        + (d.canResendConfirmation
          ? ' <button class="btn btn-ghost btn-xs" id="ac-resend">Resend confirmation</button>'
          : ' <span class="hint">No email provider configured on the server.</span>');
      $('ac-resend')?.addEventListener('click', async (e) => {
        const b = e.currentTarget; b.disabled = true; b.textContent = 'Sending…';
        try {
          const r = await api.post('/api/account/resend-confirmation');
          toast(`Confirmation email sent to ${r.email}.`, 'success');
        } catch (err) {
          toast(err.message || 'Could not send the email.', 'error');
        } finally { b.disabled = false; b.textContent = 'Resend confirmation'; }
      });
    }
  }

  // A provider-created account has no password yet, so there is nothing to confirm.
  $('ac-password-state').textContent = d.hasPassword ? '' : 'No password set — you sign in through a provider.';
  $('ac-current-wrap').classList.toggle('hidden', !d.hasPassword);
  // oidc-only: no local password exists to change, and the endpoint refuses anyway.
  $('ac-password-card')?.classList.toggle('hidden', d.localAuth === false);

  // Show the admin nav entry only to admins. The server enforces this regardless;
  // hiding the button just avoids offering a page that would 403.
  $('nav-admin')?.classList.toggle('hidden', d.role !== 'admin');

  renderAccountProviders(d);
  renderAccountSessions(d);
}

function renderAccountProviders(d) {
  const wrap = $('ac-providers');
  const linked = d.providers.map(p => `
    <div class="ac-row">
      <div>
        <strong>${esc(p.label)}</strong>
        <div class="hint">${esc(p.email || 'linked')}${p.linkedAt ? ` · since ${new Date(p.linkedAt).toLocaleDateString('en-GB')}` : ''}</div>
      </div>
      <button class="btn btn-ghost btn-xs" data-unlink="${esc(p.id)}">Unlink</button>
    </div>`).join('');

  const linkable = d.linkable.map(p => `
    <div class="ac-row">
      <div><strong>${esc(p.label)}</strong><div class="hint">Not linked</div></div>
      <button class="btn btn-ghost btn-xs" data-link="${esc(p.id)}">Link</button>
    </div>`).join('');

  wrap.innerHTML = (linked + linkable)
    || '<p class="hint">No identity provider is configured on this server.</p>';

  wrap.querySelectorAll('[data-link]').forEach(b => b.addEventListener('click', async () => {
    try {
      // Ask the server for the authorization URL over an authenticated fetch, then
      // navigate. This keeps the bearer token out of the URL entirely.
      const { url } = await api.post(`/api/auth/${b.dataset.link}/link-start`);
      window.location.href = url;
    } catch (e) { toast(e.message || 'Could not start linking.', 'error'); }
  }));

  wrap.querySelectorAll('[data-unlink]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm(`Unlink ${b.dataset.unlink} from your account?`)) return;
    try {
      await api.delete(`/api/account/providers/${b.dataset.unlink}`);
      toast('Provider unlinked.', 'success');
      loadAccount();
    } catch (e) { toast(e.message || 'Could not unlink.', 'error'); }
  }));
}

function renderAccountSessions(d) {
  const wrap = $('ac-sessions');
  wrap.innerHTML = d.sessions.map(s => `
    <div class="ac-row">
      <div>
        <strong>${esc(describeDevice(s.ua))}</strong>${s.current ? ' <span class="pill">this device</span>' : ''}
        <div class="hint">
          signed in with ${esc(s.viaLabel || s.via)}${s.ip ? ` · ${esc(s.ip)}` : ''} · active ${esc(relativeTime(s.lastSeen))}
        </div>
      </div>
      ${s.current ? '' : `<button class="btn btn-ghost btn-xs" data-revoke="${esc(s.id)}">Revoke</button>`}
    </div>`).join('') || '<p class="hint">No active sessions.</p>';

  wrap.querySelectorAll('[data-revoke]').forEach(b => b.addEventListener('click', async () => {
    try {
      await api.delete(`/api/account/sessions/${b.dataset.revoke}`);
      toast('Session revoked.', 'success');
      loadAccount();
    } catch (e) { toast(e.message || 'Could not revoke.', 'error'); }
  }));
}

(function wireAccountPage() {
  const idForm = $('ac-identity-form');
  if (!idForm) return;

  $('account-signin-btn')?.addEventListener('click', showAuthModal);

  idForm.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('ac-identity-msg');
    msg.className = 'form-msg'; msg.textContent = '';
    try {
      const d = await api.patch('/api/account', {
        name:  $('ac-name').value.trim(),
        email: $('ac-email').value.trim(),
      });
      msg.className = 'form-msg ok';
      msg.textContent = 'Saved.';
      // The sidebar shows the display name, so keep it in step. Deliberately NOT
      // persistAuth: this is the same person renaming themselves, and running the
      // cache-owner guard here would read it as a different user and wipe their CV.
      setDisplayName(d.name);
      loadAccount();
    } catch (err) { msg.textContent = err.message || 'Could not save.'; }
  });

  $('ac-password-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('ac-password-msg');
    msg.className = 'form-msg'; msg.textContent = '';
    try {
      const r = await api.post('/api/account/password', {
        currentPassword: $('ac-current-password').value,
        newPassword:     $('ac-new-password').value,
      });
      msg.className = 'form-msg ok';
      msg.textContent = r.revoked ? `Password updated — ${r.revoked} other session(s) signed out.` : 'Password updated.';
      $('ac-current-password').value = ''; $('ac-new-password').value = '';
      loadAccount();
    } catch (err) { msg.textContent = err.message || 'Could not update password.'; }
  });

  $('ac-revoke-others').addEventListener('click', async () => {
    if (!confirm('Sign out every other device?')) return;
    try {
      const r = await api.delete('/api/account/sessions');
      toast(`${r.revoked} session(s) signed out.`, 'success');
      loadAccount();
    } catch (e) { toast(e.message || 'Could not sign out other sessions.', 'error'); }
  });

  $('ac-delete').addEventListener('click', async () => {
    if (!confirm('Delete your account, your saved jobs and your server-side profile? This cannot be undone.')) return;
    if (!confirm('Last check — really delete your account?')) return;
    try {
      await api.delete('/api/account');
      state.token = null; state.user = null;
      localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
      // "This cannot be undone" has to be true on the device too: the account is
      // gone from the server, so leaving the CV cached here would be the worst
      // version of the leak.
      clearUserData();
      if (typeof renderProfileForm === 'function') renderProfileForm();
      updateAuthUI();
      toast('Account deleted.', 'info');
      showAuthModal();
    } catch (e) { toast(e.message || 'Could not delete the account.', 'error'); }
  });
})();

// ── Admin: every account, and who is online ───────────────────────────────
async function loadAdmin() {
  const wrap = $('admin-body');
  if (!wrap) return;
  wrap.innerHTML = '<p class="hint">Loading…</p>';
  let d;
  try {
    d = await api.get('/api/admin/db');
  } catch (e) {
    wrap.innerHTML = `<div class="card"><p class="hint">${esc(e.message || 'Could not load.')}</p></div>`;
    return;
  }

  const rows = d.users.map(u => `
    <tr>
      <td><strong>${esc(u.username)}</strong>${u.role === 'admin' ? ' <span class="pill">admin</span>' : ''}</td>
      <td>${esc(u.name || '')}</td>
      <td>${esc(u.email || '—')}</td>
      <td>${u.authMethods.length ? u.authMethods.map(m => `<span class="pill">${esc(m)}</span>`).join(' ') : '<span class="hint">none</span>'}</td>
      <td>${u.online ? `<span class="pill ok">online · ${u.activeSessions}</span>` : '<span class="hint">offline</span>'}</td>
      <td>${u.createdAt ? esc(new Date(u.createdAt).toLocaleDateString('en-GB')) : '—'}</td>
    </tr>`).join('');

  wrap.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>Accounts</h2>
        <span class="hint">${d.totalUsers} account(s) · ${d.activeSessions} active session(s)</span>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Username</th><th>Name</th><th>Email</th><th>Sign-in methods</th><th>Status</th><th>Joined</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6" class="hint">No accounts yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
    <div class="card" id="admin-feedback"><p class="hint">Loading feedback…</p></div>`;

  renderAdminFeedback();
}

// Feedback is submitted anonymously on purpose: /api/feedback records no session, no
// username and no IP. It therefore cannot be shown per user, and the table below is
// deliberately not joinable with the accounts above — saying so in the UI stops
// anyone assuming the link exists and merely happens to be missing.
async function renderAdminFeedback() {
  const box = $('admin-feedback');
  if (!box) return;
  let f;
  try {
    f = await api.get('/api/admin/feedback');
  } catch (e) {
    box.innerHTML = `<p class="hint">${esc(e.message || 'Could not load feedback.')}</p>`;
    return;
  }

  const rows = (f.entries || []).map(e => `
    <tr>
      <td>${e.rating ? '★'.repeat(e.rating) + '<span class="hint">' + '☆'.repeat(5 - e.rating) + '</span>' : '<span class="hint">—</span>'}</td>
      <td>${e.area ? `<span class="pill">${esc(e.area)}</span>` : '<span class="hint">—</span>'}</td>
      <td>${esc(e.liked || '') || '<span class="hint">—</span>'}</td>
      <td>${esc(e.improve || '') || '<span class="hint">—</span>'}</td>
      <td>${e.at ? esc(new Date(e.at).toLocaleDateString('en-GB')) : '—'}</td>
    </tr>`).join('');

  box.innerHTML = `
    <div class="card-header">
      <h2>Feedback</h2>
      <span class="hint">
        ${f.total} submission(s)${f.averageRating ? ` · average ${f.averageRating}/5` : ''} · anonymous
      </span>
    </div>
    <p class="hint" style="margin-bottom:12px">
      Submitted without a session, a username or an IP address, so it cannot be traced
      back to an account — including by you.
    </p>
    <div class="admin-table-wrap">
      <table class="admin-table admin-table-prose">
        <thead><tr><th>Rating</th><th>Area</th><th>What worked</th><th>What to improve</th><th>Date</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" class="hint">No feedback yet.</td></tr>'}</tbody>
      </table>
    </div>`;
}

$('admin-refresh')?.addEventListener('click', loadAdmin);

// ── Init ──────────────────────────────────────────────────────────────────
(async function init() {
  mergeSecuritySkills();
  loadProfile();
  await checkApiStatus();
  updateAuthUI();
  setupDropZone();

  renderKanban();
  renderProfileForm();
  updateProfileSummary();
  refreshGettingStarted();
  updateStats();
  initChat();

  if (state.token && !state.user) {
    state.token = null;
    localStorage.removeItem(TOKEN_KEY);
    clearUserData();
  }

  loadAuthProviders();
  // Must run after loadProfile/updateAuthUI: a provider redirect lands here with a
  // token in the fragment, and consuming it signs the user in for this session.
  const cameBackFromProvider = consumeAuthFragment();

  // Caches written before the per-user split carry no owner. We do NOT wipe them:
  // the structured profile lives only in this browser, so deleting it would destroy
  // the user's CV with no server copy to restore from. Instead we adopt it for
  // whoever is signed in now, which is the only account that could have written it
  // in the session that is still open. From then on persistAuth guards it.
  //
  // After consumeAuthFragment, and skipped when it ran: a provider sign-in already
  // set the owner from auth_user. This call is async, so starting it earlier let it
  // resolve *after* that and stamp the previous user's name onto the new user's cache.
  if (!cameBackFromProvider && state.token && !localStorage.getItem(CACHE_OWNER_KEY)) {
    adoptCacheOwner();
  }

  if (state.token && state.online && !cameBackFromProvider) {
    loadApplications();
  }
  // Keep the admin nav entry honest on a normal load, not only after visiting the
  // account page. Failure is fine — the button simply stays hidden.
  if (state.token && state.online) {
    api.get('/api/account')
      .then(d => $('nav-admin')?.classList.toggle('hidden', d.role !== 'admin'))
      .catch(() => {});
  }
})();




// ── Career Pathway ────────────────────────────────────────────────────────
// Four columns of role nodes on a shared row grid, so neighbours line up and the
// curves between them stay near-horizontal. Every transition is drawn once;
// hovering previews a role's next steps, selecting one traces the whole path
// from the feeder roles up to it.
//
// The pathway itself is written server-side by the model and cached there. This
// page draws it, ticks the skills the CV already proves, asks Bundesagentur how
// many of those positions are open, and can hand the selected role to the Writer
// agent to turn the remaining gaps into a study plan.
//
// View state (domain, selected role, comparison set) lives in the URL, so a link
// reopens exactly what the sender was looking at.

// A three-line title ("Junior Application Security Engineer") plus its domain label
// needs 96px. At 88 the nodes overlapped their neighbours.
const CP_ROW_HEIGHT = 112;
const CP_MAX_COMPARE = 3;
const CP_LEVEL_KEYS = ['feeder', 'entry', 'mid', 'adv'];

// "Where are you now?" — routes a visitor straight to the column that hires at their
// level. The chart is wide and scrolls horizontally, so without this a beginner lands
// on the left edge and an experienced analyst has to hunt rightwards for their own
// rung. Chip values match the data-level set on .cp-col by cpColumns().
function cpWireWhereChips() {
  const bar = $('cp-where');
  if (!bar || bar.dataset.wired === '1') return;
  bar.dataset.wired = '1';

  bar.querySelectorAll('[data-goto]').forEach(chip => chip.addEventListener('click', () => {
    const level = chip.dataset.goto;
    const col = document.querySelector(`.cp-col[data-level="${level}"]`);
    if (!col) { toast('Open a domain first — the chart is still loading.', 'info'); return; }

    bar.querySelectorAll('[data-goto]').forEach(c => c.classList.toggle('is-active', c === chip));
    // Only the chart scrolls, not the page: scrollIntoView on a horizontally
    // scrolling child would drag the whole window sideways too.
    const chart = $('cp-chart');
    if (chart) chart.scrollTo({ left: Math.max(0, col.offsetLeft - 24), behavior: 'smooth' });
    document.querySelectorAll('.cp-col').forEach(c => c.classList.toggle('is-focused', c === col));
  }));
}

let _cpWired = false;
let _cpData = null;
let _cpSelected = null;
let _cpHover = null;
let _cpCompare = [];
let _cpSuggestIndex = -1;
let _cpPathways = [];   // the six beginner categories, from /api/career-domains
let _cpDomains = [];    // every domain, so a ?domain= in the URL can be validated

// ── Boot ────────────────────────────────────────────────────────────────────

async function initCareerPath() {
  if (!$('cp-cols')) return;

  if (!_cpWired) {
    _cpWired = true;
    $('cp-compare-clear')?.addEventListener('click', () => { _cpCompare = []; cpRenderCompare(); cpSyncUrl(); });
    window.addEventListener('resize', () => cpDrawLinks());
    window.addEventListener('popstate', () => cpApplyUrl());
    cpWireKeyboard();
  }

  if (!_cpData) cpApplyUrl();
}

/** Read ?role / ?compare and restore that exact view of the chart. */
function cpApplyUrl() {
  const q = new URLSearchParams(location.search);
  _cpCompare = (q.get('compare') || '').split('|').filter(Boolean).slice(0, CP_MAX_COMPARE);
  loadCareerGraph(q.get('role') || null);
}

/** Push the current view into the URL without reloading the page. */
function cpSyncUrl(push = false) {
  const q = new URLSearchParams(location.search);
  q.delete('domain');
  if (_cpSelected) q.set('role', _cpSelected); else q.delete('role');
  if (_cpCompare.length) q.set('compare', _cpCompare.join('|')); else q.delete('compare');
  const url = `${location.pathname}?${q}`;
  if (push) history.pushState(null, '', url); else history.replaceState(null, '', url);
}

function cpStatus(msg) {
  const el = $('cp-status');
  el.textContent = msg || '';
  el.classList.toggle('hidden', !msg);
}

/**
 * One chart for the whole field. There is no domain to pick: every security job
 * is on it, and the specialisation a role belongs to is written under its name.
 */
async function loadCareerGraph(selectRole = null) {
  _cpData = null; _cpSelected = null; _cpHover = null;
  $('cp-cols').innerHTML = '';
  $('cp-links').innerHTML = '';
  $('cp-chart').classList.remove('has-focus');
  $('cp-detail').classList.add('hidden');
  $('cp-compare').classList.add('hidden');
  $('cp-summary').classList.add('hidden');
  $('cp-source').classList.add('hidden');
  cpStatus('Loading the career chart…');

  try {
    const r = await fetch(`${baseUrl}/api/career-graph`);
    const p = await r.json();
    if (!r.ok) throw new Error(p.error || `HTTP ${r.status}`);
    cpStatus('');
    _cpData = p;
    renderCareerChart(p);
    _cpCompare = _cpCompare.filter(t => cpFindRole(t));
    cpRenderCompare();
    if (selectRole && cpFindRole(selectRole)) cpSelect(selectRole);
    else cpSyncUrl();
  } catch (err) {
    cpStatus(`Could not load the chart: ${err.message}`);
  }
}

// ── Model helpers ───────────────────────────────────────────────────────────

/** Skill labels and keys detected in the user's CV, lowercased. */
function cpOwnedSkills() {
  const set = new Set();
  (state.analysis?.foundSkills || []).forEach(s => {
    if (s.key)   set.add(String(s.key).toLowerCase());
    if (s.label) set.add(String(s.label).toLowerCase());
  });
  return set;
}

// The chart used to open on the feeder roles, which already assume an IT job.
// A student has none, so the graph began where they are not. This node is the
// beginning of the path, built client-side rather than asked of the model — the
// answer would be the same for every domain.
const CP_START_TITLE = 'You — student or career changer';

/**
 * The feeder column. For a security specialisation it is the six beginner
 * categories, always all six — a newcomer should see every door, not only the
 * three the model happened to name. Only the ones that actually open onto this
 * domain get an edge; the rest stand there, unlit, as options for another path.
 *
 * A pathway domain keeps the model's own feeders: the jobs before IT support are
 * not the six categories, they are trainee roles.
 */
function cpFeederRoles(p) {
  if (p.kind !== 'security' || !_cpPathways.length) return p.feeder || [];
  const entry = (p.levels?.[0]?.roles || []).map(r => r.title);
  const labelOf = (key) => _cpDomains.find(x => x.key === key)?.label || key;

  return _cpPathways.map(d => {
    const opens = (d.leadsToKeys || []).includes(p.domain);
    return {
      title: d.title,
      why: d.why || d.label,
      // A door that does not open here still says where it does open, otherwise it
      // stands in the chart with no edge and no explanation.
      sub: opens ? null : `leads to ${(d.leadsToKeys || []).slice(0, 2).map(labelOf).join(', ')}`,
      next: opens ? entry : [],
      opens,
      elsewhere: (d.leadsToKeys || []).map(k => ({ key: k, label: labelOf(k) })),
    };
  });
}

function cpStartNode(p) {
  return {
    title: CP_START_TITLE,
    why: 'No professional experience yet. Everything below is reachable from here.',
    next: cpFeederRoles(p).map(f => f.title),
  };
}

function cpColumns(p) {
  return [
    { title: 'Start here', years: 'no experience required', level: 'start', roles: [cpStartNode(p)] },
    { title: 'Feeder roles', years: 'the jobs that lead in', level: 'feeder', roles: cpFeederRoles(p) },
    ...(p.levels || []).map((l, i) => ({ title: l.name, years: l.years, level: CP_LEVEL_KEYS[i + 1] || 'adv', roles: l.roles || [] })),
  ];
}

function cpAllRoles() {
  if (!_cpData) return [];
  return [cpStartNode(_cpData), ...cpFeederRoles(_cpData), ...(_cpData.levels || []).flatMap(l => l.roles || [])];
}
function cpFindRole(title) { return cpAllRoles().find(r => r.title === title) || null; }
function cpIsStart(title) { return title === CP_START_TITLE; }
function cpIsFeeder(title) { return _cpData ? cpFeederRoles(_cpData).some(r => r.title === title) : false; }

/** The first entry-level role: what a beginner is actually aiming at. */
function cpFirstEntryRole() {
  return _cpData?.levels?.[0]?.roles?.[0] || null;
}
function cpEdges() { return cpAllRoles().flatMap(r => (r.next || []).map(n => [r.title, n])); }

/** Every role that can reach `title`, walking the edges backwards. */
function cpAncestors(title) {
  const back = new Map();
  cpEdges().forEach(([u, v]) => { if (!back.has(v)) back.set(v, []); back.get(v).push(u); });
  const seen = new Set();
  const queue = [title];
  while (queue.length) {
    for (const u of back.get(queue.shift()) || []) {
      if (seen.has(u)) continue;
      seen.add(u); queue.push(u);
    }
  }
  return seen;
}

// ── Chart ───────────────────────────────────────────────────────────────────

function renderCareerChart(p) {
  // Only speak up when the content is *not* what it appears to be. A pathway the
  // model wrote needs no label; the deterministic outline does, so nobody mistakes
  // a mechanical ladder for an analysis.
  const badge = $('cp-source');
  const isOutline = p.source !== 'llm';
  badge.textContent = isOutline ? 'Some ladders are outlines' : '';
  badge.classList.toggle('is-template', isOutline);
  badge.classList.toggle('hidden', !isOutline);

  const summary = $('cp-summary');
  if (p.summary) { summary.textContent = p.summary; summary.classList.remove('hidden'); }
  cpWireWhereChips();

  const cols = cpColumns(p);
  const rows = Math.max(...cols.map(c => c.roles.length), 1);

  $('cp-cols').innerHTML = cols.map(col => `
    <div class="cp-col" data-level="${col.level}" style="--cp-rows: repeat(${rows}, ${CP_ROW_HEIGHT}px)">
      <div class="cp-col-head">
        <div class="cp-col-title">${esc(col.title)}</div>
        <div class="cp-col-years">${esc(col.years || '')}</div>
      </div>
      ${col.roles.map(r => `
        <button type="button" class="cp-node${cpIsFeeder(r.title) || cpIsStart(r.title) ? '' : ' has-add'}" role="treeitem" aria-selected="false"
                data-title="${esc(r.title)}" data-level="${col.level}"
                aria-label="${esc(r.title)}, ${esc(col.title)}${r.salary ? ', ' + esc(r.salary) : ''}"
                ${r.why ? `title="${esc(r.why)}"` : ''}>
          <i class="cp-dot lvl-${col.level}" aria-hidden="true"></i>
          <span class="cp-node-body">
            <span class="cp-node-title">${esc(r.title)}</span>
            ${r.domainLabel || r.titleDe || r.sub ? `<span class="cp-node-sub">${esc(r.domainLabel || r.titleDe || r.sub)}</span>` : ''}
          </span>
          ${cpIsFeeder(r.title) ? '' : `<span class="cp-node-add" role="button" tabindex="0"
              data-add="${esc(r.title)}" aria-label="Add ${esc(r.title)} to comparison">+ compare</span>`}
        </button>`).join('')}
    </div>`).join('');

  const cols_ = $('cp-cols');
  cols_.querySelectorAll('.cp-node').forEach(btn => {
    btn.addEventListener('click', e => {
      if (e.target.closest('[data-add]')) return;
      cpSelect(btn.dataset.title, true);
    });
    btn.addEventListener('mouseenter', () => { if (!_cpSelected) { _cpHover = btn.dataset.title; cpPaint(); } });
    btn.addEventListener('mouseleave', () => { if (!_cpSelected) { _cpHover = null; cpPaint(); } });
  });
  cols_.querySelectorAll('[data-add]').forEach(el => {
    const add = () => cpToggleCompare(el.dataset.add);
    el.addEventListener('click', e => { e.stopPropagation(); add(); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); add(); } });
  });

  cpPaint();
}

function cpSelect(title, push = false) {
  _cpSelected = _cpSelected === title ? null : title;   // click again to clear
  _cpHover = null;
  cpPaint();
  const role = _cpSelected ? cpFindRole(_cpSelected) : null;
  if (!role) $('cp-detail').classList.add('hidden');
  else if (cpIsStart(role.title)) cpRenderStart(role);
  else if (cpIsFeeder(role.title)) cpRenderFeeder(role);
  else cpRenderDetail(role);
  cpSyncUrl(push);
}

/** Which nodes stay lit: the focus, everything that leads to it, and its next steps. */
function cpTraced() {
  const focus = _cpSelected || _cpHover;
  if (!focus) return null;
  const role = cpFindRole(focus);
  const set = new Set([focus, ...(role?.next || [])]);
  if (_cpSelected) cpAncestors(focus).forEach(t => set.add(t));   // path-tracing, on click only
  return { focus, set };
}

function cpPaint() {
  const cols = $('cp-cols');
  const traced = cpTraced();
  // Dimming only makes sense when something is lit. A node with no path of its own
  // would otherwise darken the whole chart and look like a crash.
  const dim = Boolean(traced) && traced.set.size > 1;
  cols.classList.toggle('has-focus', dim);
  $('cp-chart').classList.toggle('has-focus', dim);
  cols.querySelectorAll('.cp-node').forEach(n => {
    const t = n.dataset.title;
    n.classList.toggle('is-active', traced?.focus === t);
    n.classList.toggle('is-next', Boolean(traced) && traced.focus !== t && traced.set.has(t));
    n.classList.toggle('is-compared', _cpCompare.includes(t));
    n.setAttribute('aria-selected', String(traced?.focus === t));
  });
  cpDrawLinks();
}

/** One bezier per declared transition. Edges inside the traced set are lit. */
function cpDrawLinks() {
  const svg = $('cp-links');
  const cols = $('cp-cols');
  if (!svg || !cols || !_cpData) return;

  const traced = cpTraced();
  const nodeOf = (t) => cols.querySelector(`.cp-node[data-title="${CSS.escape(t)}"]`);
  const origin = cols.getBoundingClientRect();

  const paths = cpEdges().map(([u, v]) => {
    const a = nodeOf(u), b = nodeOf(v);
    if (!a || !b) return '';
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const x1 = ra.right - origin.left;
    const y1 = ra.top - origin.top + ra.height / 2;
    const x2 = rb.left - origin.left - 7;
    const y2 = rb.top - origin.top + rb.height / 2;
    const dx = Math.max(28, (x2 - x1) * 0.5);
    const lit = traced && traced.set.has(u) && traced.set.has(v);
    return `<path${lit ? ' class="is-lit"' : ''} marker-end="url(#cp-arrow${lit ? '-lit' : ''})"
      d="M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}"/>`;
  }).join('');

  const marker = (id, fill) => `<marker id="${id}" viewBox="0 0 8 8" refX="6" refY="4"
      markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 z" fill="${fill}" stroke="none"/></marker>`;
  svg.innerHTML = `<defs>${marker('cp-arrow', 'var(--text-muted)')}${marker('cp-arrow-lit', 'var(--cyan)')}</defs>${paths}`;
}

// ── Keyboard: arrows walk the grid, Enter selects ────────────────────────────

function cpWireKeyboard() {
  $('cp-cols').addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const node = e.target.closest('.cp-node');
    if (!node) return;
    e.preventDefault();

    const cols = [...$('cp-cols').querySelectorAll('.cp-col')];
    const col = node.closest('.cp-col');
    const ci = cols.indexOf(col);
    const nodes = [...col.querySelectorAll('.cp-node')];
    const ri = nodes.indexOf(node);

    let target = null;
    if (e.key === 'ArrowUp')    target = nodes[ri - 1];
    if (e.key === 'ArrowDown')  target = nodes[ri + 1];
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const dest = cols[ci + (e.key === 'ArrowRight' ? 1 : -1)];
      if (dest) {
        const list = [...dest.querySelectorAll('.cp-node')];
        target = list[Math.min(ri, list.length - 1)];
      }
    }
    target?.focus();
  });
}

// ── Compare ─────────────────────────────────────────────────────────────────

function cpToggleCompare(title) {
  if (_cpCompare.includes(title)) _cpCompare = _cpCompare.filter(t => t !== title);
  else if (_cpCompare.length >= CP_MAX_COMPARE) return toast(`Compare up to ${CP_MAX_COMPARE} roles at a time.`, 'info');
  else _cpCompare.push(title);
  cpRenderCompare();
  cpPaint();
  cpSyncUrl();
}

function cpRenderCompare() {
  const bar = $('cp-compare-bar');
  const box = $('cp-compare');
  bar.classList.toggle('hidden', _cpCompare.length === 0);
  box.classList.toggle('hidden', _cpCompare.length < 2);

  $('cp-compare-chips').innerHTML = _cpCompare.map(t =>
    `<span class="cp-chip">${esc(t)}<button type="button" data-drop="${esc(t)}" aria-label="Remove ${esc(t)}">×</button></span>`).join('');
  $('cp-compare-chips').querySelectorAll('[data-drop]').forEach(b =>
    b.addEventListener('click', () => cpToggleCompare(b.dataset.drop)));

  if (_cpCompare.length < 2) return;

  const roles = _cpCompare.map(cpFindRole).filter(Boolean);
  const owned = cpOwnedSkills();
  const skills = [...new Set(roles.flatMap(r => r.skills || []))].sort();

  box.innerHTML = `
    <table class="cp-matrix">
      <caption class="cp-panel-note">A skill required by only some of these roles is a gap you would
        have to close when moving between them. Skills already in your CV are ticked.</caption>
      <thead>
        <tr><th scope="col">Skill</th>${roles.map(r => `<th scope="col">${esc(r.title)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${skills.map(s => {
          const marks = roles.map(r => (r.skills || []).includes(s));
          const shared = marks.every(Boolean);
          const inCv = owned.has(s.toLowerCase());
          return `<tr class="${shared ? '' : 'is-gap'}">
            <th scope="row">${esc(s)}${inCv ? ' <span class="cp-mark yes">✓</span>' : ''}</th>
            ${marks.map(m => `<td class="${m ? '' : 'cp-gap'}"><span class="cp-mark ${m ? 'yes' : 'no'}">${m ? 'required' : '—'}</span></td>`).join('')}
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ── Detail panel ────────────────────────────────────────────────────────────

function cpPanel(title, note, body, cls = '') {
  return `<div class="cp-panel ${cls}">
      <h4>${esc(title)}</h4>
      ${note ? `<div class="cp-panel-note">${esc(note)}</div>` : ''}
      ${body}
    </div>`;
}

/**
 * The beginner's panel. Someone with no experience does not need a salary band
 * for a Security Architect — they need to know which job to apply for first and
 * what to learn before they do.
 */
function cpRenderStart(role) {
  const target = cpFirstEntryRole();
  const feeders = cpFeederRoles(_cpData);
  const el = $('cp-detail');

  el.innerHTML = `
    <div class="cp-detail-head">
      <div>
        <div class="cp-detail-title">Starting from zero</div>
        <div class="cp-detail-sub">No experience is required to begin in ${esc(_cpData.label)}.</div>
      </div>
      ${target ? `<div class="cp-controls-actions">
        <button class="btn btn-primary btn-sm" id="cp-plan-btn">Plan my way to ${esc(target.title)}</button>
      </div>` : ''}
    </div>
    <div class="cp-grid">
      ${cpPanel('Your first job', 'These roles hire without security experience and teach you the ground you will stand on.',
        `<ul class="cp-list">${feeders.map(f => `<li>${esc(f.title)}</li>`).join('')}</ul>`)}

      ${feeders.length ? cpPanel('Why they lead in', '',
        `<div class="cp-plan-text">${feeders.map(f => `${esc(f.title)} — ${esc(f.why || '')}`).join('\n\n')}</div>`) : ''}

      ${target ? cpPanel(`Then aim for ${target.title}`,
        'The first security role of this pathway. These are the skills it asks for.',
        `<ul class="cp-list">${(target.skills || []).map(s =>
          `<li class="${cpOwnedSkills().has(String(s).toLowerCase()) ? 'has' : ''}">${esc(s)}</li>`).join('')}</ul>
         ${target.certs?.length ? `<div class="cp-stat"><div class="cp-figure-sub">Usual first certification<br>${esc(target.certs[0])}</div></div>` : ''}`) : ''}

      ${cpPanel('Open positions', 'Live count from Bundesagentur für Arbeit, all of Germany.' + helpDot('liveCount'),
        `<div class="cp-figure" id="cp-count">…</div>
         <div class="cp-figure-sub">${feeders[0] ? `listings for ${esc(feeders[0].title)}` : 'listings'}</div>
         <div class="cp-stat"><div class="cp-figure-sub">A feeder role is easier to land than a security role, and it is
           the fastest way to get paid while you learn.</div></div>`)}

      <div id="cp-plan" class="hidden"></div>
    </div>`;
  el.classList.remove('hidden');

  if (target) $('cp-plan-btn').addEventListener('click', () => cpBuildPlan(target));
  if (feeders[0]) cpLoadCount(feeders[0].title);
}

/**
 * A feeder role: not a security job, so no salary band or certification ladder.
 *
 * A feeder that does not open onto the domain on screen used to dim the whole
 * chart and then offer a plan towards a role it does not lead to. It now says so,
 * and sends the reader to the domains it actually opens.
 */
function cpRenderFeeder(role) {
  const next = (role.next || []).map(cpFindRole).filter(Boolean);
  const opens = next.length > 0;
  const target = opens ? next[0] : null;
  const el = $('cp-detail');

  el.innerHTML = `
    <div class="cp-detail-head">
      <div>
        <div class="cp-detail-title">${esc(role.title)}</div>
        <div class="cp-detail-sub">${opens
          ? `A way into ${esc(_cpData.label)}, not a security role itself.`
          : `This job does not lead into ${esc(_cpData.label)}.`}</div>
      </div>
      ${target ? `<div class="cp-controls-actions">
        <button class="btn btn-primary btn-sm" id="cp-plan-btn">Plan my move to ${esc(target.title)}</button>
      </div>` : ''}
    </div>
    <div class="cp-grid">
      ${role.why ? cpPanel('Why it leads into security', '', `<div class="cp-plan-text">${esc(role.why)}</div>`) : ''}

      ${opens ? cpPanel('It leads to', 'The security roles this job opens up.',
        `<ul class="cp-list">${next.map(r => `<li>${esc(r.title)}${r.domainLabel
          ? ` <span class="cp-figure-sub" style="display:inline">— ${esc(r.domainLabel)}</span>` : ''}</li>`).join('')}</ul>`) : ''}

      ${cpPanel('Open positions', 'Live count from Bundesagentur für Arbeit, all of Germany.' + helpDot('liveCount'),
        `<div class="cp-figure" id="cp-count">…</div>
         <div class="cp-figure-sub">listings matching this title</div>`)}

      <div id="cp-plan" class="hidden"></div>
    </div>`;
  el.classList.remove('hidden');

  if (target) $('cp-plan-btn').addEventListener('click', () => cpBuildPlan(target));
  cpLoadCount(role.title, role.salary);
}

function cpRenderDetail(role) {
  const owned = cpOwnedSkills();
  const li = (t, mark) => `<li class="${mark && owned.has(String(t).toLowerCase()) ? 'has' : ''}">${esc(t)}</li>`;
  const panel = (title, note, body, cls = '') => `
    <div class="cp-panel ${cls}">
      <h4>${esc(title)}</h4>
      ${note ? `<div class="cp-panel-note">${esc(note)}</div>` : ''}
      ${body}
    </div>`;

  const el = $('cp-detail');
  el.innerHTML = `
    <div class="cp-detail-head">
      <div>
        <div class="cp-detail-title">${esc(role.title)}</div>
        <div class="cp-detail-sub">${esc(role.domainLabel || role.titleDe || '')}</div>
      </div>
      <div class="cp-controls-actions">
        <button class="btn btn-ghost btn-sm" id="cp-add-compare">${_cpCompare.includes(role.title) ? 'Remove from comparison' : 'Add to comparison'}</button>
        <button class="btn btn-primary btn-sm" id="cp-plan-btn">Build my learning plan</button>
      </div>
    </div>
    <div class="cp-grid">
      ${/* Only worth a card when it adds titles the heading does not already show.
            In outline mode commonTitles is [role.title], so this claimed to report
            what employers write and printed the generated role name back. */''}
      ${role.commonTitles?.filter(t => t !== role.title).length ? panel('Also advertised as',
        'Other wordings employers use for this role.',
        `<ul class="cp-list">${role.commonTitles.filter(t => t !== role.title).map(t => li(t, false)).join('')}</ul>`) : ''}

      ${role.skills?.length ? panel('Skills for this step',
        `${role.skills.filter(s => owned.has(s.toLowerCase())).length} of ${role.skills.length} already in your profile.`,
        `<ul class="cp-list">${role.skills.map(t => li(t, true)).join('')}</ul>`) : ''}

      ${role.certs?.length ? panel('Certifications',
        'Commonly held at this level — not a requirement.',
        `<ul class="cp-list">${role.certs.map(t => li(t, true)).join('')}</ul>`) : ''}

      ${panel('Open positions', 'Live count from Bundesagentur für Arbeit, all of Germany.' + helpDot('liveCount'),
        `<div class="cp-figure" id="cp-count">…</div>
         <div class="cp-figure-sub" id="cp-count-note">counting…</div>
         <div class="cp-stat" id="cp-salary-box">
           <div class="cp-salary" id="cp-salary">…</div>
           <div class="cp-figure-sub" id="cp-salary-note">reading job ads…</div>
         </div>
         ${role.education ? `<div class="cp-stat"><div class="cp-figure-sub">Typical background at this level — not a requirement<br>${esc(role.education)}</div></div>` : ''}`)}

      <div id="cp-plan" class="hidden"></div>
    </div>`;
  el.classList.remove('hidden');

  $('cp-add-compare').addEventListener('click', () => { cpToggleCompare(role.title); cpRenderDetail(role); });
  $('cp-plan-btn').addEventListener('click', () => cpBuildPlan(role));
  cpLoadCount(role.title, role.salary);
}

// Ladder titles are constructed ("Junior X", "X (Tier 1)", "Senior X", "X Architect"),
// and German job ads do not contain those strings. Querying them literally returned 0
// and told a student the discipline has no openings: measured against Bundesagentur,
// "Junior Vulnerability Analyst" gives 0 while "Vulnerability Analyst" gives 8 and
// "Vulnerability Management" gives 98. Strip the seniority decoration and count the
// role itself.
function cpCountableTitle(title) {
  return String(title || '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')                       // "(Tier 1)", "(m/w/d)"
    .replace(/^(junior|senior|lead|principal|head of)\s+/i, '')
    .replace(/\s+(architect|manager|lead)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function cpLoadCount(title, referenceSalary) {
  const el = $('cp-count');
  if (!el) return;
  const query = cpCountableTitle(title) || title;
  const note = $('cp-count-note');
  try {
    const d = await (await fetch(`${baseUrl}/api/job-count?keyword=${encodeURIComponent(query)}`)).json();
    if (!el.isConnected) return;                    // the user moved on while we waited
    el.textContent = d.count == null ? '—' : d.count.toLocaleString('de-DE');
    // Name the query, so a low number can be read as "this wording is rare" rather
    // than "this career does not exist".
    if (note) note.textContent = `matching “${query}” — all seniorities`;
  } catch (_) {
    if (el.isConnected) el.textContent = '—';
    if (note) note.textContent = 'count unavailable';
  }
  cpLoadSalary(query, referenceSalary);
}

// Salary measured from the ads themselves. The figure printed here used to be a
// constant — every entry-level role in every domain showed the same band — so what
// matters as much as the number is the evidence beside it: how many ads were read,
// and how many of them stated pay at all. Most German postings do not.
// Measured when the ads allow it, clearly flagged as an orientation figure when
// they do not. In practice German postings almost never state pay — 0 of 34 on a
// live check — so the second branch is the common one, and the wording matters:
// the band it shows is a level-wide constant, and must not be mistaken for data.
async function cpLoadSalary(query, referenceSalary) {
  const el = $('cp-salary');
  const note = $('cp-salary-note');
  if (!el || !note) return;

  const showReference = (reason) => {
    if (!referenceSalary) {
      el.textContent = '—';
      el.classList.add('cp-salary-none');
      note.textContent = reason;
      return;
    }
    el.textContent = referenceSalary;
    el.classList.add('cp-salary-reference');
    note.innerHTML = esc(`orientation only, not measured — typical for this level, same figure for every role at this stage. ${reason}`) + helpDot('salaryReference');
  };

  try {
    const d = await (await fetch(`${baseUrl}/api/salary-band?keyword=${encodeURIComponent(query)}`)).json();
    if (!el.isConnected) return;

    if (d.display) {
      el.textContent = d.display;
      el.classList.remove('cp-salary-reference', 'cp-salary-none');
      note.innerHTML = esc(`gross per year — middle half of the ${d.withSalary} ad(s) that stated pay, out of ${d.read} read for “${query}”`) + helpDot('salaryMeasured');
      return;
    }
    showReference(d.read
      ? `Only ${d.withSalary} of ${d.read} live ads stated a salary; ${d.minSample || 5} are needed to measure one.`
      : 'No ads could be read for this role right now.');
  } catch (_) {
    if (el.isConnected) showReference('Live ads could not be read.');
  }
}

// ── Learning plan: the gaps of this role, handed to the Writer agent ─────────

async function cpBuildPlan(role) {
  const owned = cpOwnedSkills();
  const have = (role.skills || []).filter(s => owned.has(s.toLowerCase()));
  const missing = (role.skills || []).filter(s => !owned.has(s.toLowerCase()));
  const box = $('cp-plan');
  const btn = $('cp-plan-btn');

  box.className = 'cp-panel cp-plan';
  box.innerHTML = `<h4>Learning plan — ${esc(role.title)}</h4>
    <div class="cp-panel-note">Writing a roadmap for the ${missing.length} skill(s) you are missing…</div>`;
  box.classList.remove('hidden');
  btn.disabled = true;

  try {
    const r = await fetch(`${baseUrl}/api/generate-roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ targetRole: role.title, foundSkills: have, missingSkills: missing }),
    });
    const d = await r.json();
    // The workflow always comes back — it is built from the taxonomy. The model
    // only adds the mentor's commentary, so a rate limit costs the notes, not the plan.
    const steps = d.steps || [];
    const text = d.text || '';

    const stepHtml = steps.map(s => `
      <li class="cp-step">
        <div class="cp-step-num" aria-hidden="true">${s.step}</div>
        <div class="cp-step-body">
          <div class="cp-step-skill">${esc(s.skill)}<span class="cp-step-hours">≈ ${s.hours} h</span></div>
          <div class="cp-step-how">${esc(s.how)}</div>
          <div class="cp-step-res">${esc(s.resource)}</div>
          <div class="cp-step-links">
            ${(s.links || []).map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer"
                 class="cp-step-link">${esc(l.label)} ↗</a>`).join('')}
          </div>
        </div>
      </li>`).join('');

    // The full requirement list lives here, not on the role card: what matters is
    // not "this role uses SIEM" but "you have four of these six, learn the other two".
    const all = role.skills || [];
    const req = all.map(s => `<li class="${owned.has(s.toLowerCase()) ? 'has' : ''}">${esc(s)}</li>`).join('');

    box.innerHTML = `<h4>Learning plan — ${esc(role.title)}</h4>
      <div class="cp-panel-note">${have.length} of ${all.length} skill(s) already in your CV
        · about ${d.weeks || '?'} weeks at 6 h a week
        · ${d.ok ? `mentor notes by the Writer agent (${esc(d.provider || 'model')})` : 'no model reachable — the steps below still stand'}</div>

      ${all.length ? `<div class="cp-req">
        <div class="cp-notes-head">Skills and tools this role requires</div>
        <ul class="cp-list">${req}</ul>
      </div>` : ''}

      ${steps.length ? `<div class="cp-notes-head" style="margin-top:22px">What to learn, in order</div>
        <ol class="cp-steps">${stepHtml}</ol>`
        : `<div class="cp-plan-text">You already cover every skill this role asks for.</div>`}

      ${d.notes ? `<div class="cp-notes">
        <div class="cp-notes-head">Mentor's notes</div>
        <div class="cp-plan-text">${esc(d.notes)}</div>
      </div>` : ''}

      <div class="cp-plan-actions">
        <button class="btn btn-ghost btn-sm" id="cp-plan-pdf">Export plan as PDF</button>
      </div>`;

    const pdfText = [text, d.notes ? `\n\nMentor's notes\n\n${d.notes}` : ''].join('');
    $('cp-plan-pdf').addEventListener('click', () =>
      downloadTextAsPDF(pdfText, `learning-plan-${role.title.replace(/\W+/g, '-').toLowerCase()}.pdf`,
        `Learning plan — ${role.title}`));
  } catch (err) {
    box.innerHTML = `<h4>Learning plan</h4><div class="cp-panel-note">Could not build the plan: ${esc(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
}

// ── Feedback (anonymous) ───────────────────────────────────────────────────
//
// The submit path deliberately does NOT send authHeaders(). Not sending the token is
// the guarantee: even a future change to the server could not start recording who
// wrote what, because the identity never crosses the wire.
let _fbRating = null;

document.querySelectorAll('#fb-rating .fb-star').forEach(btn => {
  btn.addEventListener('click', () => {
    _fbRating = Number(btn.dataset.rating);
    document.querySelectorAll('#fb-rating .fb-star').forEach(b => {
      const on = Number(b.dataset.rating) <= _fbRating;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', String(Number(b.dataset.rating) === _fbRating));
    });
  });
});

$('fb-submit')?.addEventListener('click', async () => {
  const liked = $('fb-liked').value.trim();
  const improve = $('fb-improve').value.trim();
  const msg = $('fb-msg');
  msg.className = 'form-msg';

  if (!liked && !improve) {
    msg.textContent = 'Write at least one line — a score on its own says little.';
    return;
  }

  const btn = $('fb-submit');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending…';
  try {
    // Plain fetch, no auth header: see above.
    const r = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: _fbRating, liked, improve, area: $('fb-area').value }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);

    msg.className = 'form-msg ok';
    msg.textContent = 'Sent. Thank you — it is read.';
    $('fb-liked').value = '';
    $('fb-improve').value = '';
    $('fb-area').value = '';
    _fbRating = null;
    document.querySelectorAll('#fb-rating .fb-star').forEach(b => {
      b.classList.remove('is-on');
      b.setAttribute('aria-checked', 'false');
    });
  } catch (e) {
    msg.textContent = e.message || 'Could not send.';
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
});

// Shown only to an admin. The server is the real gate — this just avoids rendering an
// empty panel, and a 401/403 is the normal answer for everyone else.
async function loadFeedbackAdmin() {
  const box = $('fb-admin');
  if (!box || !state.token) return;
  try {
    const d = await api.get('/api/admin/feedback');
    const summary = $('fb-admin-summary');
    if (summary) {
      summary.textContent = d.total
        ? `${d.total} response${d.total > 1 ? 's' : ''}${d.averageRating ? ` · average ${d.averageRating}/5` : ''}`
        : 'nothing yet';
    }
    $('fb-admin-list').innerHTML = d.entries.length
      ? d.entries.map(e => `
        <div class="ac-row fb-entry">
          <div>
            ${e.rating ? `<span class="pill">${e.rating}/5</span> ` : ''}
            ${e.area ? `<span class="hint">${esc(e.area)}</span>` : ''}
            ${e.liked ? `<div class="fb-liked"><strong>Worked:</strong> ${esc(e.liked)}</div>` : ''}
            ${e.improve ? `<div class="fb-improve"><strong>Change:</strong> ${esc(e.improve)}</div>` : ''}
            <div class="hint">${new Date(e.at).toLocaleString('en-GB')}</div>
          </div>
        </div>`).join('')
      : '<p class="hint">No feedback yet.</p>';
    box.classList.remove('hidden');
  } catch (_) {
    // Not an admin, or signed out: leave the panel hidden.
    box.classList.add('hidden');
  }
}
