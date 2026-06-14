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
  const norm = normalize(text);
  const found = [];
  skillGroups.forEach(g => g.skills.forEach(s => {
    const keys = [s.key, ...(s.aliases || [])];
    if (keys.some(k => norm.includes(normalize(k)))) found.push(s);
  }));
  return found;
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
    throw new Error(err.error || `HTTP ${r.status}`);
  }
  return r.json();
}

const api = {
  get:    path        => apiRequest('GET',    path),
  post:   (path, b)   => apiRequest('POST',   path, b),
  put:    (path, b)   => apiRequest('PUT',    path, b),
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
}

document.querySelectorAll('.modal-tab').forEach(b =>
  b.addEventListener('click', () => setModalTab(b.dataset.modalTab))
);

$('login-btn').addEventListener('click', async () => {
  const username = $('login-username').value.trim();
  const password = $('login-password').value.trim();
  const msg = $('login-msg');
  msg.textContent = '';
  if (!username || !password) { msg.textContent = 'Enter username and password.'; return; }
  try {
    const data = await api.post('/api/login', { username, password });
    persistAuth(data.token, data.user.name);
    hideAuthModal();
    loadApplications();
    toast(`Welcome back, ${data.user.name}!`, 'success');
  } catch (e) {
    msg.textContent = e.message || 'Login failed.';
  }
});

$('register-btn').addEventListener('click', async () => {
  const name     = $('reg-name').value.trim();
  const username = $('reg-username').value.trim();
  const password = $('reg-password').value.trim();
  const msg = $('register-msg');
  msg.className = 'form-msg';
  msg.textContent = '';
  if (!name || !username || !password) { msg.textContent = 'All fields are required.'; return; }
  if (password.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; return; }
  try {
    const data = await api.post('/api/register', { name, username, password });
    persistAuth(data.token, data.user.name);
    msg.className = 'form-msg ok';
    msg.textContent = 'Account created! Welcome.';
    setTimeout(hideAuthModal, 800);
    loadApplications();
  } catch (e) {
    msg.textContent = e.message || 'Registration failed.';
  }
});

function persistAuth(token, name) {
  state.token = token;
  state.user  = name;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY,  name);
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

$('sidebar-auth-btn').addEventListener('click', () => {
  if (state.user) {
    state.token = null;
    state.user  = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    updateAuthUI();
    showAuthModal();
    toast('Signed out. See you soon!', 'info');
  } else {
    showAuthModal();
  }
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
};

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
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ pdf: b64 })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'PDF parse failed');
  return data.text || '';
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
  try {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (isPdf) {
      $('cv-status-pill').textContent = 'Reading PDF…';
      const text = await extractPdfText(file);
      if (!text) { toast('No selectable text in PDF. Paste your CV manually.', 'error'); return; }
      ta.value = text;
      toast('PDF loaded successfully.', 'success');
    } else {
      ta.value = await file.text();
      toast('File loaded.', 'success');
    }
    state.cvText = ta.value;
    $('cv-status-pill').textContent = 'Ready';
  } catch (e) {
    toast('Could not read file: ' + e.message, 'error');
    $('cv-status-pill').textContent = 'Error';
  }
}

// ── CV analysis + profile extraction ───────────────────────────────────────
async function analyzeCV() {
  const text = $('cv-input').value.trim();
  if (!text) { toast('Please paste or drop your CV first.', 'error'); return; }

  state.cvText = text;
  $('cv-status-pill').textContent = 'Analyzing…';

  // Local multilingual analysis (covers all domains + DE/EN aliases)
  const result = localAnalyze(text);

  state.analysis = result;
  renderAnalysisResults(result);
  renderLearningSuggestions(result);

  // Try AI extraction for the full structured profile (experience, education,
  // …). Falls back to the regex parser when no LLM key is configured.
  let llmProfile = null;
  try {
    $('cv-status-pill').textContent = 'AI extracting…';
    const r = await fetch(`${baseUrl}/api/extract-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  const platform = $('platform-select').value;
  const sector   = $('sector-select').value;
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
    const pages = Number($('depth-select')?.value) || 5;
    url.searchParams.set('pages', String(pages));

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

  renderJobResults(state.jobs, platformLabels[platform] || platform);
  setAgentStatus('scout', state.jobs.length > 0 ? 'done' : 'error');
  $('search-status-pill').textContent = `${state.jobs.length} found`;
  if (state.jobs.length > 0) toast(`${state.jobs.length} jobs found!`, 'success');
  updateStats();
  notifyHighMatches(state.jobs);
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

function renderJobResults(jobs, sourceLabel) {
  const panel = $('jobs-results-panel');
  const grid  = $('job-results');

  // Pre-compute the match score once per job, then rank surest → least sure so the
  // strongest fits (your ≥70% jobs) always sit at the top of the list.
  let ranked = jobs.map(job => ({
    job,
    detail: state.analysis ? scoreJobDetailed(job, state.analysis) : null,
  }));
  if (state.analysis) ranked.sort((a, b) => b.detail.score - a.detail.score);

  $('job-count-badge').textContent = ranked.length;
  panel.classList.remove('hidden');

  if (!ranked.length) {
    grid.innerHTML = `<div class="job-card"><p class="job-card-meta">No jobs found. Try a different platform, sector, or keywords.</p></div>`;
    return;
  }

  grid.innerHTML = ranked.map(({ job, detail }, i) => {
    const date    = job.publishedDate ? String(job.publishedDate).slice(0, 10) : null;
    const isNew   = date && (Date.now() - new Date(date).getTime()) < 7 * 86400000;
    const salary  = job.salary ? `${esc(job.salary)}` : '';
    const remote  = job.remote ? `<span class="chip remote">Remote</span>` : '';
    const jobType = job.jobType ? `<span class="chip">${esc(job.jobType)}</span>` : '';

    // Weighted score + breakdown tooltip, plus the skills this job wants that
    // you don't have yet ("what you're missing").
    let scoreHtml = '';
    let gapHtml   = '';
    if (detail) {
      const { score, breakdown } = detail;
      const pct   = Math.round(score * 100);
      const color = pct >= 70 ? 'var(--teal)' : pct >= 40 ? 'var(--cyan)' : 'var(--text-dim)';
      const tip = breakdown
        ? 'Score breakdown — ' + Object.entries(breakdown.points)
            .map(([k, v]) => `${k}: ${v}/${breakdown.weights[k]}`).join(' · ')
        : '';
      scoreHtml = `<span class="chip" title="${esc(tip)}" style="color:${color};border-color:${color}33">${pct}% match</span>`;

      const missing = (breakdown && breakdown.skillsMissing) || [];
      if (missing.length) {
        const shown = missing.slice(0, 6).map(k => `<span class="gap-chip">${esc(skillLabel(k))}</span>`).join('');
        const more  = missing.length > 6 ? `<span class="gap-more">+${missing.length - 6} more</span>` : '';
        gapHtml = `<div class="job-card-gaps"><span class="gap-label">You're missing:</span> ${shown}${more}</div>`;
      }
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
      const job = ranked[Number(e.target.dataset.jobIdx)]?.job;
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

// ── Auto email notification for high-match jobs (≥70%) ──────────────────────
const NOTIFY_KEY = 'careerai-notify-jobs';
const NOTIFY_EMAIL_KEY = 'careerai-notify-email';

function setupNotifyToggle() {
  const cb = $('notify-jobs-toggle');
  if (!cb) return;
  const row = $('notify-email-row');
  const input = $('notify-email-input');

  cb.checked = localStorage.getItem(NOTIFY_KEY) === '1';
  if (input) input.value = localStorage.getItem(NOTIFY_EMAIL_KEY) || (state.profile && state.profile.email) || '';
  if (row) row.classList.toggle('hidden', !cb.checked);

  cb.addEventListener('change', () => {
    localStorage.setItem(NOTIFY_KEY, cb.checked ? '1' : '0');
    if (row) row.classList.toggle('hidden', !cb.checked);
    if (cb.checked) {
      if (input && !input.value) input.value = (state.profile && state.profile.email) || '';
      const mail = ((input && input.value) || '').trim();
      if (mail) { localStorage.setItem(NOTIFY_EMAIL_KEY, mail); toast(`High-match jobs will be emailed to ${mail}.`, 'success'); }
      else if (input) input.focus();
    }
  });

  if (input) input.addEventListener('change', () => {
    const mail = input.value.trim();
    if (mail) localStorage.setItem(NOTIFY_EMAIL_KEY, mail);
  });
}

async function notifyHighMatches(jobs) {
  const cb = $('notify-jobs-toggle');
  if (!cb || !cb.checked || !state.analysis) return;

  const high = (jobs || [])
    .map(j => ({ ...j, score: calculateMatchScore(j, state.analysis) }))
    .filter(j => j.score >= 0.7)
    .sort((a, b) => b.score - a.score);
  if (!high.length) return;

  const to = (($('notify-email-input') && $('notify-email-input').value) || '').trim()
    || localStorage.getItem(NOTIFY_EMAIL_KEY) || (state.profile && state.profile.email) || '';
  if (!to) return;

  const payload = high.slice(0, 15).map(j => ({
    title: j.title, company: j.company, score: j.score, url: j.jobUrl || j.url || ''
  }));

  try {
    const r = await api.post('/api/notify-jobs', { to, jobs: payload });
    if (r && r.ok && r.sent) toast(`Emailed ${r.count} high-match job(s) to ${to}.`, 'success');
    else toast(`${high.length} high-match job(s) found — add RESEND_API_KEY to receive them by email.`, 'info');
  } catch (_) {
    toast(`${high.length} high-match job(s) found (email not sent).`, 'info');
  }
}

// ── Geolocation ───────────────────────────────────────────────────────────
$('current-location-button').addEventListener('click', () => {
  const status = $('location-status');
  if (!navigator.geolocation) { status.textContent = 'Geolocation not supported by this browser — type your city below.'; return; }
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
    (err) => {
      status.textContent = err.code === err.PERMISSION_DENIED
        ? 'Location blocked. Click the location/🔒 icon in your browser\'s address bar → Allow, then retry — or just type your city below.'
        : err.code === err.POSITION_UNAVAILABLE
          ? 'Location unavailable on this device — type your city below instead.'
          : 'Location request timed out — type your city below instead.';
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
});


// ── Scrape All Platforms ──────────────────────────────────────────────────
async function scrapeAllPlatforms() {
  const region   = $('region-select').value;
  const sector   = $('sector-select').value;
  const distance = $('distance-select').value;
  const location = $('search-location-input').value.trim();
  const keyword  = ($('job-keyword-input')?.value || '').trim();
  const pages    = Number($('depth-select')?.value) || 5;
  const progress = $('scrape-all-progress');
  const breakdown= $('platform-breakdown');

  const scrapeBtn = $('scrape-all-btn');
  if (scrapeBtn) { scrapeBtn.innerHTML = 'Scraping…'; scrapeBtn.disabled = true; }

  progress.classList.remove('hidden');
  breakdown.classList.add('hidden');
  $('jobs-results-panel').classList.add('hidden');

  const platforms = ['bundesagentur', 'arbeitnow', 'linkedin', 'remotive'];
  platforms.forEach(p => {
    const el = $(`sp-${p}`);
    if (!el) return;
    el.className = 'scrape-platform';
    el.querySelector('.sp-dot').className = 'sp-dot spinning';
  });

  setAgentStatus('scout', 'running');
  $('search-status-pill').textContent = 'Scraping all…';

  try {
    const r = await fetch(`${baseUrl}/api/scrape-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ region, sector, distance, location, keyword, pages })
    });
    const data = await r.json();
    state.jobs  = data.jobs || [];

    platforms.forEach(p => {
      const el = $(`sp-${p}`);
      if (!el) return;
      const nameMap = { bundesagentur: 'Bundesagentur', arbeitnow: 'Arbeitnow', linkedin: 'LinkedIn', remotive: 'Remotive' };
      const name  = nameMap[p] || p;
      const count = data.platformBreakdown?.[name] ?? 0;
      const done  = count > 0;
      el.className = `scrape-platform ${done ? 'done' : 'error'}`;
      el.querySelector('.sp-dot').className = `sp-dot ${done ? 'done' : 'error'}`;
      el.textContent = `${name}: ${count}`;
    });

    if (data.platformBreakdown) {
      breakdown.innerHTML = Object.entries(data.platformBreakdown)
        .map(([name, count]) => `
          <div class="pb-chip">
            <div class="pb-chip-count">${count}</div>
            <div class="pb-chip-name">${esc(name)}</div>
          </div>
        `).join('') + `
          <div class="pb-chip">
            <div class="pb-chip-count" style="color:var(--orange)">${state.jobs.length}</div>
            <div class="pb-chip-name">Total (deduped)</div>
          </div>
        `;
      breakdown.classList.remove('hidden');
    }

    state.jobsLabel = 'All Platforms';
    rerenderJobs();
    setAgentStatus('scout', state.jobs.length > 0 ? 'done' : 'error');
    $('search-status-pill').textContent = `${state.jobs.length} found`;
    if (state.jobs.length > 0) toast(`${state.jobs.length} jobs collected from all platforms!`, 'success');
    updateStats();
    notifyHighMatches(state.jobs);

  } catch (err) {
    console.error('scrapeAll error:', err);
    platforms.forEach(p => {
      const el = $(`sp-${p}`);
      if (!el) return;
      el.className = 'scrape-platform error';
      const dot = el.querySelector('.sp-dot');
      if (dot) dot.className = 'sp-dot error';
    });
    setAgentStatus('scout', 'error');
    $('search-status-pill').textContent = 'Error';
    toast('Scrape failed: ' + err.message, 'error');
  } finally {
    const btn = $('scrape-all-btn');
    if (btn) { btn.innerHTML = 'Scrape All Platforms'; btn.disabled = false; }
  }
}

$('scrape-all-btn').addEventListener('click', scrapeAllPlatforms);
$('analyze-btn').addEventListener('click', analyzeCV);
$('workmode-filter').addEventListener('change', rerenderJobs);

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

function scoreJobDetailed(job, analysis) {
  if (!analysis || !analysis.foundSkills.length || typeof window.Scorer === 'undefined') {
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
  return window.Scorer.scoreJob(job, profile, jobSkillKeys);
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

function buildImprovedCV(cvText, targetJob, analysis) {
  const skills   = analysis?.foundSkills?.map(s => s.label) || [];
  const domain   = analysis?.domain || 'Technology';
  const topRole  = targetJob || analysis?.roles?.[0]?.name || `${domain} Professional`;
  const date     = new Date().toLocaleDateString('en-GB');
  const missing  = analysis?.missingSkills?.slice(0, 3).map(s => s.label) || [];

  const domainSections = {
    'Software Development':  'TECHNICAL PROJECTS\n──────────────────────────────────────────────────────────\n  [Project Name] — Brief description and technologies used\n  [Project Name] — Brief description and technologies used',
    'DevOps & Cloud':        'INFRASTRUCTURE & TOOLS\n──────────────────────────────────────────────────────────\n  Cloud: [AWS / Azure / GCP]\n  IaC:   [Terraform / Ansible]\n  CI/CD: [Jenkins / GitHub Actions]',
    'Data & AI':             'DATA PROJECTS\n──────────────────────────────────────────────────────────\n  [Dataset/Project] — Model type, accuracy, outcome\n  [Dashboard/Report] — Tools, audience, business impact',
    'Cybersecurity':         'CERTIFICATIONS & TOOLS\n──────────────────────────────────────────────────────────\n  [CompTIA Security+, CEH, OSCP or equivalent]\n  Tools: [Splunk, Nessus, Burp Suite, Wireshark]',
    'Finance & Accounting':  'FINANCIAL ACHIEVEMENTS\n──────────────────────────────────────────────────────────\n  [Reduced costs by X% / Managed portfolio of €Xm]\n  [Certification: ACCA, CFA, CPA or equivalent]',
    'Marketing & Sales':     'CAMPAIGN RESULTS\n──────────────────────────────────────────────────────────\n  [Campaign name] — +X% leads, €X revenue generated\n  [Channel/Tool] — X% CTR, X ROAS',
    'Design & UX':           'PORTFOLIO HIGHLIGHTS\n──────────────────────────────────────────────────────────\n  [Project] — Problem, process, and measurable outcome\n  Portfolio: [figma.com/xxx or behance.net/xxx]',
    'Healthcare & Nursing':  'PRAKTISCHE ERFAHRUNGEN\n──────────────────────────────────────────────────────────\n  [Institution] — Bereich, Dauer, Hauptaufgaben\n  [Institution] — Bereich, Dauer, Hauptaufgaben\n\nZERTIFIKATE & FORTBILDUNGEN\n──────────────────────────────────────────────────────────\n  [Pflegehilfskraft-Ausbildung · Institution · Jahr]\n  [Erste-Hilfe-Kurs · Jahr] · [Hygieneschulung · Jahr]',
  };

  const domainSection = domainSections[domain] || domainSections['Software Development'];

  return `╔══════════════════════════════════════════════════════════╗
║            CURRICULUM VITAE — CareerAI Draft              ║
╚══════════════════════════════════════════════════════════╝

PROFESSIONAL PROFILE
──────────────────────────────────────────────────────────
Results-driven ${topRole} with expertise in ${
  skills.length ? skills.slice(0, 4).join(', ') : domain.toLowerCase() + ' best practices'
}. Passionate about delivering high-quality work and continuously expanding technical skills to meet evolving industry demands.

  Target Role:  ${topRole}
  Domain:       ${domain}
  Generated:    ${date}

CORE COMPETENCIES
──────────────────────────────────────────────────────────
${skills.length
  ? skills.map(s => `  ✓  ${s}`).join('\n')
  : '  ✓  [Add your key skills here]'}
${missing.length ? '\n  SKILLS TO DEVELOP SOON:\n' + missing.map(s => `  ○  ${s}`).join('\n') : ''}

PROFESSIONAL EXPERIENCE
──────────────────────────────────────────────────────────
${cvText.split('\n').filter(l => l.trim()).slice(0, 30).map(l => '  ' + l).join('\n')}

${domainSection}

EDUCATION
──────────────────────────────────────────────────────────
  [Degree · Institution · Year]

LANGUAGES
──────────────────────────────────────────────────────────
  [e.g. English (fluent) · German (B2) · French (A2)]

──────────────────────────────────────────────────────────
Generated by CareerAI Writer Agent — ${date}`;
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

──────────────────────────────────────────────────────────
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
    const r = await api.post('/api/generate-cv', { cvText, targetRole: target, foundSkills });
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
    const r = await api.post('/api/generate-cover', { jobTitle, company, name, skills, cvText });
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

  const newApp = { ...app, id: genId(), status: 'applied', createdAt: new Date().toISOString() };
  state.apps.push(newApp);
  saveAppsLocally();

  if (state.token && state.online) {
    try {
      const data = await api.post('/api/applications', newApp);
      if (data.applications) { state.apps = data.applications; saveAppsLocally(); }
    } catch (_) {}
  }

  renderKanban();
  updateStats();
  toast(`${newApp.title} @ ${newApp.company} added to tracker!`, 'success');
}

async function moveApplication(id, newStatus) {
  state.apps = state.apps.map(a => a.id === id ? { ...a, status: newStatus } : a);
  saveAppsLocally();
  if (state.token && state.online) {
    try { await api.put(`/api/applications/${id}`, { status: newStatus }); } catch (_) {}
  }
  renderKanban();
  toast(`Moved to ${newStatus}.`, 'info');
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

function renderKanban() {
  dedupeApps();
  setupKanbanDnD();
  const emptyEl = $('jobs-empty');
  if (emptyEl) emptyEl.classList.toggle('hidden', state.apps.length > 0);

  STATUSES.forEach(status => {
    const col   = $(`col-${status}`);
    const count = $(`cnt-${status}`);
    if (!col) return;

    const apps = state.apps.filter(a => a.status === status);
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
          ${app.deadline ? `<div class="app-card-deadline" style="color:${deadlineColor}">${deadlineLabel}${esc(app.deadline)}</div>` : ''}
          ${app.url ? `<a class="app-card-link" href="${esc(app.url)}" target="_blank" rel="noreferrer">View job →</a>` : ''}
          ${app.notes ? `<div class="app-card-notes">${esc(app.notes)}</div>` : ''}
          <div class="app-card-actions">
            ${prev ? `<button class="move-btn" data-id="${app.id}" data-to="${prev}">← ${esc(STATUS_LABELS[prev] || prev)}</button>` : ''}
            ${next ? `<button class="move-btn" data-id="${app.id}" data-to="${next}">${esc(STATUS_LABELS[next] || next)} →</button>` : ''}
            <button class="delete-btn" data-id="${app.id}" data-confirm="0">✕</button>
          </div>
        </div>
      `;
    }).join('');

    col.querySelectorAll('.move-btn').forEach(btn =>
      btn.addEventListener('click', e => moveApplication(e.target.dataset.id, e.target.dataset.to))
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

async function openJobWorkspace(app) {
  jwCurrentApp = app;
  $('jw-title').textContent = app.title || 'Job';
  $('jw-company').textContent = [app.company, app.location].filter(Boolean).join(' · ');
  const out = $('jw-cover-output');
  out.classList.add('hidden'); out.value = '';
  $('job-workspace').classList.remove('hidden');

  // Oracle = AI consultation: read the posting, compare to the profile. Falls
  // back to the local keyword analysis when no LLM key is configured.
  $('jw-match').innerHTML =
    `<div style="display:flex;align-items:center;gap:12px;color:var(--text-muted)">`
    + `<span class="jw-orb jw-thinking">${ORACLE_ICON}</span>`
    + `<span>The AI consultant is analysing the job<span class="jw-dots"></span></span></div>`;
  $('jw-gaps').innerHTML = '';
  $('jw-oracle').innerHTML = '';
  let consult = null;
  try {
    const profileText = (typeof profileToText === 'function' ? profileToText() : '') || state.cvText || '';
    const r = await fetch(`${baseUrl}/api/job-consult`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle: app.title, company: app.company, jobDescription: app.description || '', profileText })
    });
    const d = await r.json();
    if (d && d.ok && d.consult) consult = d.consult;
  } catch (_) { /* offline / no key → keyword fallback */ }

  if (jwCurrentApp !== app) return;     // a newer card was opened meanwhile
  if (consult) { renderJobConsult(consult); return; }

  // AI consultation unavailable → keyword fallback, clearly labelled + retry.
  renderJobWorkspace();
  $('jw-match').insertAdjacentHTML('afterbegin',
    `<div class="jw-oracle-item" style="margin-bottom:12px;border-color:var(--orange);background:var(--orange-dim)">`
    + `⚠️ The AI consultant didn't answer (provider busy or free-tier rate-limit). `
    + `Showing a basic keyword analysis — click <strong>Re-check match</strong> to retry the full AI consultation.</div>`);
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
  const color = pct >= 70 ? 'var(--teal)' : pct >= 40 ? 'var(--cyan)' : 'var(--orange)';
  $('jw-match').innerHTML =
    `<span class="jw-match-score" style="color:${color}">${pct}%</span> match`
    + `<div class="jw-bar"><div style="width:${pct}%;background:${color}"></div></div>`
    + (c.matchSummary ? `<p style="font-size:13px;color:var(--text-muted);margin-top:8px">${esc(c.matchSummary)}</p>` : '');

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
      `<span class="jw-match-score" style="color:${color}">${pct}%</span> skills match`
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

async function generateJobCover() {
  const app = jwCurrentApp;
  if (!app) return;
  const btn = $('jw-cover'); const orig = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = 'Generating…';
  const p = state.profile || {};
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  const skills = (p.skills || []).slice(0, 6).map(s => s.label || s).join(', ');
  const cvText = (typeof profileToText === 'function' ? profileToText() : '') || state.cvText || '';
  let text = '', usedAI = false;
  try {
    const r = await api.post('/api/generate-cover', {
      jobTitle: app.title, company: app.company, name, skills, cvText, jobDescription: app.description || ''
    });
    if (r && r.ok && r.source === 'ai' && r.text) { text = r.text; usedAI = true; }
  } catch (_) {}
  if (!text && typeof buildCoverLetter === 'function') {
    text = buildCoverLetter({ jobTitle: app.title, company: app.company, name, skills });
  }
  const out = $('jw-cover-output');
  out.value = text || 'Could not generate a cover letter.';
  out.classList.remove('hidden');
  btn.disabled = false; btn.innerHTML = orig;
  toast(usedAI ? 'Cover letter generated (AI)!' : 'Cover letter generated.', 'success');
}

(function wireJobWorkspace() {
  const overlay = $('job-workspace');
  if (!overlay) return;
  const close = () => overlay.classList.add('hidden');
  $('jw-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  $('jw-recheck').addEventListener('click', () => { if (jwCurrentApp) openJobWorkspace(jwCurrentApp); toast('Re-consulting with your current profile…', 'info'); });
  $('jw-cover').addEventListener('click', generateJobCover);
  $('jw-update-profile').addEventListener('click', () => {
    jwReturnApp = jwCurrentApp;          // remember the job to re-match after saving
    close();
    if (typeof navigate === 'function') navigate('profile');
    toast('Update your profile and click "Save Profile" — we\'ll re-check this job automatically.', 'info');
  });
})();

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
      : `Go to **Job Search**.\nPick your region and platform, then click **Search Jobs** or **Scrape All Platforms** to query 4 sources at once.`
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

function initChat() {
  const panel    = $('chat-panel');
  const toggleBtn= $('chat-toggle-btn');
  const closeBtn = $('chat-close-btn');
  const input    = $('chat-input');
  const sendBtn  = $('chat-send-btn');

  if (!panel || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    toggleBtn.classList.remove('has-new');
    if (!panel.classList.contains('hidden')) {
      setTimeout(() => input.focus(), 50);
    }
  });

  closeBtn.addEventListener('click', () => panel.classList.add('hidden'));

  function sendMessage(text) {
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

    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      typing.remove();
      addChatMsg(getChatResponse(msg), 'bot');
      if (panel.classList.contains('hidden')) toggleBtn.classList.add('has-new');
    }, delay);
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
  const highMatches = state.analysis
    ? state.jobs.filter(j => calculateMatchScore(j, state.analysis) >= 0.7).length
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
  skills: [], experience: [], education: [], certifications: []
});

function loadProfile() {
  try { state.profile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || emptyProfile(); }
  catch (_) { state.profile = emptyProfile(); }
}

function saveProfileToStorage() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
}

// ── CV section parsing (best-effort, tuned for structured CVs) ──────────────
const CV_SECTION_NAMES = 'PROFILE|PROFIL|SUMMARY|OBJECTIVE|SKILLS|KOMPETENZEN|COMPETENCES|EXPERIENCE|WORK EXPERIENCE|ERFAHRUNG|BERUFSERFAHRUNG|EDUCATION|AUSBILDUNG|STUDIUM|FORMATION|CERTIFICATIONS|CERTIFICATES|ZERTIFIKATE|ZERTIFIZIERUNGEN|LANGUAGES|SPRACHEN|LANGUES|INTERESTS|HOBBIES|REFERENCES|PROJECTS|PROJEKTE';

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
      else if (withDesc) cur.desc = (cur.desc ? cur.desc + ' ' : '') + line;
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
      p.skills = analysis.foundSkills.map(sk => ({ key: sk.key, label: sk.label }));
    }
    if (!p.title && analysis && analysis.roles && analysis.roles.length) p.title = analysis.roles[0].name;
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
    p.skills = analysis.foundSkills.map(s => ({ key: s.key, label: s.label }));
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

  state.profile = p;
  saveProfileToStorage();
  renderProfileForm();
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

// ── Profile: Download as PDF (jsPDF — direct download) ──────────────────────
function downloadProfilePDF() {
  const p = state.profile || emptyProfile();
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name';

  const lib = window.jspdf;
  if (!lib || !lib.jsPDF) { toast('PDF library not loaded — try refreshing the page.', 'error'); return; }

  const doc = new lib.jsPDF({ unit: 'pt', format: 'a4' });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 48;                 // margin
  const W = PAGE_W - M * 2;     // content width
  let y = M;

  const PURPLE = [124, 58, 237];
  const DARK   = [15, 23, 42];
  const GREY   = [71, 85, 105];
  const LIGHT  = [148, 163, 184];

  function ensure(space) {
    if (y + space > PAGE_H - M) { doc.addPage(); y = M; }
  }
  function text(str, x, size, style, color, maxW) {
    doc.setFont('helvetica', style || 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(String(str), maxW || W);
    lines.forEach(line => { ensure(size + 4); doc.text(line, x, y); y += size + 4; });
  }
  function sectionTitle(t) {
    y += 8; ensure(22);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
    doc.text(t.toUpperCase(), M, y);
    y += 6;
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(1);
    doc.line(M, y, M + W, y);
    y += 12;
  }

  // Photo (top-right) if present
  const PHOTO_W = 90, PHOTO_H = 110;
  let headerRight = M + W;
  if (p.photo) {
    try {
      const px = M + W - PHOTO_W;
      doc.addImage(p.photo, 'JPEG', px, y - 6, PHOTO_W, PHOTO_H);
      headerRight = px - 12;
    } catch (_) { /* ignore bad image */ }
  }
  const headerW = headerRight - M;

  // Header
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text(name, M, y); y += 26;
  if (p.title) { text(p.title, M, 13, 'bold', PURPLE, headerW); }
  const contact = [p.email, p.phone, p.location, p.nationality].filter(Boolean).join('   •   ');
  if (contact) text(contact, M, 10, 'normal', GREY, headerW);
  if (p.languages) text('Languages: ' + p.languages, M, 10, 'normal', GREY, headerW);
  // Make sure we clear the photo height before the divider
  if (p.photo && y < M + PHOTO_H) y = M + PHOTO_H;
  y += 6;
  doc.setDrawColor(PURPLE[0], PURPLE[1], PURPLE[2]); doc.setLineWidth(2);
  doc.line(M, y, M + W, y); y += 8;

  // Summary
  if (p.summary) { sectionTitle('Profile'); text(p.summary, M, 11, 'normal', DARK); }

  // Skills
  if (p.skills && p.skills.length) {
    sectionTitle('Skills');
    text((p.skills.map(s => s.label || s)).join('  •  '), M, 11, 'normal', DARK);
  }

  // Experience
  if (p.experience && p.experience.length) {
    sectionTitle('Experience');
    p.experience.forEach(x => {
      const head = [x.role, x.org].filter(Boolean).join(' — ');
      const dates = [x.start, x.end].filter(Boolean).join(' – ');
      if (head) text(head + (dates ? `   (${dates})` : ''), M, 11, 'bold', DARK);
      if (x.location) text(x.location, M, 10, 'italic', LIGHT);
      if (x.desc) text(x.desc, M, 10, 'normal', GREY);
      y += 4;
    });
  }

  // Education
  if (p.education && p.education.length) {
    sectionTitle('Education');
    p.education.forEach(x => {
      const head = [x.degree, x.org].filter(Boolean).join(' — ');
      const dates = [x.start, x.end].filter(Boolean).join(' – ');
      if (head) text(head + (dates ? `   (${dates})` : ''), M, 11, 'bold', DARK);
      if (x.location) text(x.location, M, 10, 'italic', LIGHT);
      y += 4;
    });
  }

  // Certifications
  if (p.certifications && p.certifications.length) {
    sectionTitle('Certifications');
    p.certifications.forEach(x => {
      text([x.name, x.year].filter(Boolean).join(' · '), M, 11, 'normal', DARK);
    });
  }

  const fileName = (name.replace(/\s+/g, '_') || 'CareerAI') + '_CV.pdf';
  doc.save(fileName);
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
      state.profile.skills.splice(Number(e.target.dataset.i), 1);
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

const _interviewBtn = $('generate-interview-btn');
if (_interviewBtn) _interviewBtn.addEventListener('click', () => {
  const role = $('interview-role').value.trim() || state.profile?.title || '';
  const data = generateInterview(role);
  const section = arr => arr.map(q => `<li>${esc(q)}</li>`).join('');
  $('interview-content').innerHTML = `
    <div class="iv-block"><h3 class="col-label">Common questions</h3><ol class="iv-list">${section(data.common)}</ol></div>
    <div class="iv-block"><h3 class="col-label">Role-specific (${esc(data.role)})</h3><ol class="iv-list">${section(data.roleQs)}</ol></div>
    <div class="iv-block"><h3 class="col-label">Tips</h3><ul class="iv-list">${section(data.tips)}</ul></div>`;
  $('interview-output').classList.remove('hidden');
  state.docsCount++;
  refreshGettingStarted();
  updateStats();
  toast('Interview prep generated!', 'success');
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
function mergeSecuritySkills() {
  const groups = (typeof window !== 'undefined' && window.SECURITY_GROUPS) || [];
  if (!groups.length) return;
  const seen = new Set(skillGroups.flatMap(g => g.skills.map(s => s.key)));
  groups.forEach(group => {
    const skills = group.skills.filter(s => !seen.has(s.key));
    skills.forEach(s => seen.add(s.key));
    if (skills.length) skillGroups.push({ category: group.category, skills });
  });
}

// ── Init ──────────────────────────────────────────────────────────────────
(async function init() {
  mergeSecuritySkills();
  loadProfile();
  await checkApiStatus();
  updateAuthUI();
  setupDropZone();

  renderKanban();
  renderProfileForm();
  refreshGettingStarted();
  updateStats();
  initChat();
  setupNotifyToggle();

  if (state.token && !state.user) {
    state.token = null;
    localStorage.removeItem(TOKEN_KEY);
  }
  if (state.token && state.online) {
    loadApplications();
  }
})();
