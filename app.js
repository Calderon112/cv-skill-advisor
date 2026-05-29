// ── Skill / role data ─────────────────────────────────────────────────────
const skillGroups = [
  {
    category: 'Core cybersecurity skills',
    skills: [
      { key: 'network security',       label: 'Network security' },
      { key: 'cryptography',           label: 'Cryptography' },
      { key: 'incident response',      label: 'Incident response' },
      { key: 'risk assessment',        label: 'Risk assessment' },
      { key: 'vulnerability analysis', label: 'Vulnerability analysis' }
    ]
  },
  {
    category: 'Technical skills',
    skills: [
      { key: 'linux',                     label: 'Linux administration' },
      { key: 'cloud security',            label: 'Cloud security' },
      { key: 'penetration testing',       label: 'Penetration testing' },
      { key: 'web application security',  label: 'Web application security' },
      { key: 'python',                    label: 'Python programming' }
    ]
  },
  {
    category: 'Career skills',
    skills: [
      { key: 'communication',      label: 'Communication' },
      { key: 'teamwork',           label: 'Teamwork' },
      { key: 'documentation',      label: 'Technical documentation' },
      { key: 'problem solving',    label: 'Problem solving' },
      { key: 'project management', label: 'Project management' }
    ]
  }
];

const roles = [
  { name: 'SOC Analyst',              required: ['network security', 'incident response', 'linux', 'communication'] },
  { name: 'Cloud Security Engineer',  required: ['cloud security', 'network security', 'linux', 'documentation'] },
  { name: 'Penetration Tester',       required: ['penetration testing', 'web application security', 'python', 'linux'] },
  { name: 'Cybersecurity Consultant', required: ['risk assessment', 'vulnerability analysis', 'communication', 'problem solving'] }
];

const suggestionsBySkill = {
  'network security':        'Study firewalls, VPNs, IDS/IPS, and secure networking fundamentals.',
  cryptography:              'Learn symmetric and asymmetric encryption, hashing, and digital signatures.',
  'incident response':       'Practice incident investigation, containment, and recovery workflows.',
  'risk assessment':         'Understand risk frameworks such as ISO 27005 or NIST RMF.',
  'vulnerability analysis':  'Use vulnerability scanners and manual pentesting techniques.',
  linux:                     'Use Linux systems regularly for administration and security tooling.',
  'cloud security':          'Explore AWS, Azure, or GCP security controls and cloud architecture.',
  'penetration testing':     'Practice on labs such as TryHackMe, Hack The Box, or open-source environments.',
  'web application security':'Study OWASP Top 10 and secure web application design.',
  python:                    'Write automation scripts for log analysis, testing, and security tooling.',
  communication:             'Practice explaining technical findings to non-technical stakeholders.',
  teamwork:                  'Work on collaborative projects and follow agile practices.',
  documentation:             'Document procedures, findings, and improvement plans clearly.',
  'problem solving':         'Solve practical security challenges and scenario-based exercises.',
  'project management':      'Track tasks, deadlines, and priorities for cybersecurity projects.'
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

function findSkillsLocal(text) {
  const norm = normalize(text);
  const found = [];
  skillGroups.forEach(g => g.skills.forEach(s => { if (norm.includes(s.key)) found.push(s); }));
  return found;
}

function analyzeRolesLocal(foundKeys) {
  return roles
    .map(role => {
      const missing = role.required.filter(k => !foundKeys.includes(k));
      const score   = (role.required.length - missing.length) / role.required.length;
      return { name: role.name, matched: role.required.length - missing.length, total: role.required.length, missing, score };
    })
    .filter(r => r.score >= 0.4)
    .sort((a, b) => b.score - a.score);
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ── API layer ─────────────────────────────────────────────────────────────
const baseUrl = window.location.protocol.startsWith('http') ? window.location.origin : '';

async function apiRequest(method, path, body) {
  const opts = {
    method,
    headers: { ...authHeaders() }
  };
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
  $('sidebar-username').textContent  = name || 'Not signed in';
  $('user-avatar').textContent       = name ? name[0].toUpperCase() : '?';
  $('sidebar-auth-btn').textContent  = name ? 'Sign out' : 'Sign in';
}

$('sidebar-auth-btn').addEventListener('click', () => {
  if (state.user) {
    state.token = null;
    state.user  = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    updateAuthUI();
  } else {
    showAuthModal();
  }
});

// ── Navigation ────────────────────────────────────────────────────────────
const PIPE_MAP = { scout: 'pipe-01', matcher: 'pipe-02', writer: 'pipe-03', tracker: 'pipe-04' };

function navigate(page) {
  document.querySelectorAll('.page').forEach(p    => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b  => b.classList.remove('active'));
  document.querySelectorAll('.pipe-step').forEach(s => s.classList.remove('active'));

  const pageEl = $(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  document.querySelectorAll(`.nav-btn[data-page="${page}"]`).forEach(b => b.classList.add('active'));

  const pipeEl = PIPE_MAP[page] ? $(PIPE_MAP[page]) : null;
  if (pipeEl) pipeEl.classList.add('active');

  if (page === 'matcher') runMatcher();
  if (page === 'tracker') loadApplications();
  if (page === 'writer')  syncWriterCv();
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

// ── PDF extraction — server-side (no CDN dependency) ─────────────────────
async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  // Convert to base64 in chunks to avoid call-stack overflow on large files
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
      const text = await extractPdfText(file);
      if (!text) { alert('No selectable text in PDF. Please paste your CV manually.'); return; }
      ta.value = text;
    } else {
      ta.value = await file.text();
    }
    state.cvText = ta.value;
  } catch (e) {
    alert('Could not read file: ' + e.message);
  }
}

// ── Scout Agent: CV Analysis ──────────────────────────────────────────────
async function analyzeCV() {
  const text = $('cv-input').value.trim();
  if (!text) { alert('Please paste or drop your CV first.'); return; }

  state.cvText = text;
  setAgentStatus('scout', 'running');
  $('cv-status-pill').textContent = 'Analyzing…';

  let result;
  try {
    result = state.online ? await api.post('/api/analyze', { text }) : localAnalyze(text);
  } catch (_) {
    result = localAnalyze(text);
  }

  state.analysis = result;
  renderAnalysisResults(result);
  renderLearningSuggestions(result.missingSkills);
  syncWriterCv();
  setAgentStatus('scout', 'done');
  $('cv-status-pill').textContent = 'Done';
  updateStats();
}

function localAnalyze(text) {
  const foundSkills = findSkillsLocal(text);
  const foundKeys   = foundSkills.map(s => s.key);
  const allSkills   = skillGroups.flatMap(g => g.skills);
  return {
    foundSkills,
    missingSkills: allSkills.filter(s => !foundKeys.includes(s.key)),
    roles:         analyzeRolesLocal(foundKeys)
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
    `<strong>${score}%</strong> of tracked skills detected &nbsp;·&nbsp; Top match: <strong>${topRoles}</strong>`;

  $('found-skills').innerHTML = result.foundSkills.length
    ? result.foundSkills.map(s => `<li>${esc(s.label)}</li>`).join('')
    : '<li>No skills detected</li>';

  $('missing-skills').innerHTML = result.missingSkills.length
    ? result.missingSkills.slice(0, 8).map(s => `<li>${esc(s.label)}</li>`).join('')
    : '<li>All tracked skills present!</li>';

  $('recommended-roles').innerHTML = result.roles.length
    ? result.roles.map(r => `<li><strong>${esc(r.name)}</strong> — ${r.matched}/${r.total} matched</li>`).join('')
    : '<li>Add more cybersecurity skills for role recommendations.</li>';

  panel.classList.remove('hidden');
}

function renderLearningSuggestions(missingSkills) {
  const panel = $('learning-panel');
  const grid  = $('suggestions-grid');
  const suggestions = missingSkills.slice(0, 6)
    .map(s => suggestionsBySkill[s.key] || `Build experience with ${s.label}.`);

  if (!suggestions.length) { panel.classList.add('hidden'); return; }

  grid.innerHTML  = suggestions.map(s => `<div class="suggestion-card">${esc(s)}</div>`).join('');
  panel.classList.remove('hidden');
}

// ── Scout Agent: Job Search ───────────────────────────────────────────────
async function searchJobs() {
  // Job search is public — no login required

  const region   = $('region-select').value;
  const platform = $('platform-select').value;
  const sector   = $('sector-select').value;
  const distance = $('distance-select').value;
  const location = $('search-location-input').value.trim();
  const keyword  = ($('job-keyword-input')?.value || '').trim();

  setAgentStatus('scout', 'running');
  $('search-status-pill').textContent = 'Searching…';

  // "All platforms" via the dedicated route takes a long time — redirect to scrapeAll
  if (platform === 'all') { await scrapeAllPlatforms(); return; }

  const btn = $('search-jobs-btn');
  const origLabel = btn.innerHTML;
  btn.innerHTML = '<span>⏳</span> Searching…';
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

    const r    = await fetch(url, { headers: authHeaders() });
    if (!r.ok) throw new Error(`Server error ${r.status}`);
    const data = await r.json();
    state.jobs = data.jobs || [];

    $('platform-breakdown').classList.add('hidden');
    $('scrape-all-progress').classList.add('hidden');
  } catch (err) {
    console.error('searchJobs error:', err);
    state.jobs = [];
  } finally {
    btn.innerHTML = origLabel;
    btn.disabled  = false;
  }

  const platformLabels = {
    bundesagentur: 'Bundesagentur', arbeitnow: 'Arbeitnow',
    linkedin: 'LinkedIn', remotive: 'Remotive',
    indeed: 'Indeed', stepstone: 'StepStone',
    'apify-indeed': 'Indeed (Apify)'
  };

  renderJobResults(state.jobs, platformLabels[platform] || platform);
  setAgentStatus('scout', state.jobs.length > 0 ? 'done' : 'error');
  $('search-status-pill').textContent = `${state.jobs.length} found`;
  updateStats();
}

function renderJobResults(jobs, sourceLabel) {
  const panel = $('jobs-results-panel');
  const grid  = $('job-results');

  $('job-count-badge').textContent = jobs.length;
  panel.classList.remove('hidden');

  if (!jobs.length) {
    grid.innerHTML = `<div class="job-card"><p class="job-card-meta">No jobs found. Try a different platform or sector.</p></div>`;
    return;
  }

  grid.innerHTML = jobs.map((job, i) => {
    const date    = job.publishedDate ? String(job.publishedDate).slice(0, 10) : null;
    const isNew   = date && (Date.now() - new Date(date).getTime()) < 7 * 86400000;
    const salary  = job.salary ? `💰 ${esc(job.salary)}` : '';
    const remote  = job.remote ? `<span class="chip remote">Remote</span>` : '';
    const jobType = job.jobType ? `<span class="chip">${esc(job.jobType)}</span>` : '';

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
        ${remote}
        ${jobType}
        ${job.distance ? `<span class="chip">${job.distance} km</span>` : ''}
        ${date ? `<span class="chip date ${isNew ? 'new' : ''}">${date}</span>` : ''}
      </div>
      ${job.jobUrl ? `<a class="job-card-link" href="${esc(job.jobUrl)}" target="_blank" rel="noreferrer">View job →</a>` : ''}
      <button class="track-btn" data-job-idx="${i}">+ Track Application</button>
    </article>
    `;
  }).join('');

  grid.querySelectorAll('.track-btn').forEach(btn =>
    btn.addEventListener('click', e => {
      const job = jobs[Number(e.target.dataset.jobIdx)];
      if (job) prefillTracker(job);
    })
  );
}

function prefillTracker(job) {
  navigate('tracker');
  $('add-app-form').classList.remove('hidden');
  $('app-title').value    = job.title    || '';
  $('app-company').value  = job.company  || '';
  $('app-location').value = job.location || '';
  $('app-url').value      = job.jobUrl   || '';
  $('app-notes').value    = '';
}

// ── Geolocation ───────────────────────────────────────────────────────────
$('current-location-button').addEventListener('click', () => {
  const status = $('location-status');
  if (!navigator.geolocation) { status.textContent = 'Geolocation not supported.'; return; }
  status.textContent = 'Getting location…';
  navigator.geolocation.getCurrentPosition(
    pos => {
      $('search-location-input').value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      status.textContent = 'Location filled.';
    },
    () => { status.textContent = 'Could not get location. Allow location access in your browser.'; }
  );
});

$('region-select').addEventListener('change', () => {
  const r = $('region-select').value;
  const hint = { germany: 'Best for Germany: Bundesagentur', switzerland: 'Best for Switzerland: Jooble or Indeed', usa: 'Best for USA: Jooble or Indeed' };
  $('platform-suggestion').textContent = hint[r] || '';
  if (r === 'germany') $('platform-select').value = 'bundesagentur';
  else if ($('platform-select').value === 'bundesagentur') $('platform-select').value = 'jooble';
});

// ── Scrape All Platforms ──────────────────────────────────────────────────
async function scrapeAllPlatforms() {
  // Job search is public — no login required

  const region   = $('region-select').value;
  const sector   = $('sector-select').value;
  const distance = $('distance-select').value;
  const location = $('search-location-input').value.trim();
  const keyword  = ($('job-keyword-input')?.value || '').trim();
  const progress = $('scrape-all-progress');
  const breakdown= $('platform-breakdown');

  const scrapeBtn = $('scrape-all-btn');
  if (scrapeBtn) { scrapeBtn.innerHTML = '<span>⏳</span> Scraping…'; scrapeBtn.disabled = true; }

  // Show progress banner
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
    const r    = await fetch(`${baseUrl}/api/scrape-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ region, sector, distance, location, keyword })
    });

    const data = await r.json();
    state.jobs  = data.jobs || [];

    // Mark all platform dots done
    platforms.forEach(p => {
      const el = $(`sp-${p}`);
      if (!el) return;
      const nameMap = { bundesagentur: 'Bundesagentur', arbeitnow: 'Arbeitnow', linkedin: 'LinkedIn', remotive: 'Remotive' };
      const name = nameMap[p] || p;
      const count = data.platformBreakdown?.[name] ?? 0;
      const done  = count > 0;
      el.className = `scrape-platform ${done ? 'done' : 'error'}`;
      el.querySelector('.sp-dot').className = `sp-dot ${done ? 'done' : 'error'}`;
      el.textContent = `${name}: ${count}`;
    });

    // Platform breakdown chips
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

    renderJobResults(state.jobs, 'All Platforms');
    setAgentStatus('scout', state.jobs.length > 0 ? 'done' : 'error');
    $('search-status-pill').textContent = `${state.jobs.length} found`;
    updateStats();

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
    $('search-status-pill').textContent = 'Error — check console';
  } finally {
    const btn = $('scrape-all-btn');
    if (btn) { btn.innerHTML = '<span>⚡</span> Scrape All Platforms'; btn.disabled = false; }
  }
}

$('scrape-all-btn').addEventListener('click', scrapeAllPlatforms);
$('analyze-btn').addEventListener('click', analyzeCV);
$('search-jobs-btn').addEventListener('click', searchJobs);
$('go-match-btn').addEventListener('click', () => navigate('matcher'));
$('go-match-from-jobs-btn').addEventListener('click', () => navigate('matcher'));

// ── Matcher Agent ─────────────────────────────────────────────────────────
function calculateMatchScore(job, analysis) {
  if (!analysis || !analysis.foundSkills.length) return 0;
  const foundKeys  = analysis.foundSkills.map(s => s.key);
  const jobText    = normalize([job.title, job.description, job.sector, job.board].filter(Boolean).join(' '));
  const matched    = foundKeys.filter(k => jobText.includes(k));
  const base       = matched.length / foundKeys.length;
  const titleBonus = foundKeys.some(k => normalize(job.title || '').includes(k)) ? 0.15 : 0;
  return Math.min(1, base + titleBonus);
}

function runMatcher() {
  const empty   = $('matcher-empty');
  const content = $('matcher-content');

  if (!state.jobs.length || !state.analysis) {
    empty.classList.remove('hidden');
    content.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  content.classList.remove('hidden');
  setAgentStatus('matcher', 'running');

  state.matches = state.jobs
    .map(job => ({ ...job, score: calculateMatchScore(job, state.analysis) }))
    .sort((a, b) => b.score - a.score);

  renderMatches(state.matches);
  setAgentStatus('matcher', 'done');
  updateStats();
}

function renderMatches(matches) {
  const grid = $('match-results');

  grid.innerHTML = matches.map(job => {
    const pct  = Math.round(job.score * 100);
    const tier = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low';
    const matched = (state.analysis?.foundSkills || [])
      .filter(s => normalize([job.title, job.description, job.sector].join(' ')).includes(s.key))
      .slice(0, 5);

    return `
      <div class="match-card ${tier}">
        <div class="match-header">
          <div>
            <div class="match-title">${esc(job.title)}</div>
            <div class="match-company">${esc(job.company)} · ${esc(job.location)}</div>
          </div>
          <div class="score-circle ${tier}">${pct}%</div>
        </div>
        <div class="score-bar-wrap">
          <div class="score-bar ${tier}" style="width:${pct}%"></div>
        </div>
        <div class="match-skills">
          ${matched.length
            ? matched.map(s => `<span class="match-skill">${esc(s.label)}</span>`).join('')
            : '<span class="match-skill" style="opacity:0.4">No direct skill overlap</span>'}
        </div>
        ${job.jobUrl ? `<a class="job-card-link" href="${esc(job.jobUrl)}" target="_blank" rel="noreferrer">View job →</a>` : ''}
      </div>
    `;
  }).join('');
}

// ── Writer Agent ──────────────────────────────────────────────────────────
function syncWriterCv() {
  const ta = $('cv-for-writer');
  if (ta && state.cvText && !ta.value.trim()) ta.value = state.cvText;
}

function buildImprovedCV(cvText, targetJob, analysis) {
  const skills  = analysis?.foundSkills?.map(s => s.label) || [];
  const topRole = targetJob || analysis?.roles?.[0]?.name || 'Cybersecurity Professional';
  const date    = new Date().toLocaleDateString('en-GB');

  return `╔══════════════════════════════════════════════════════════╗
║            CURRICULUM VITAE — CareerAI Draft              ║
╚══════════════════════════════════════════════════════════╝

PROFESSIONAL PROFILE
──────────────────────────────────────────────────────────
Results-driven ${topRole} with expertise in${
  skills.length ? ' ' + skills.slice(0, 4).join(', ') : ' cybersecurity operations and threat analysis'
}. Committed to protecting organizational assets and continuously developing technical skills.

  Target Role:  ${topRole}
  Generated:    ${date}

CORE COMPETENCIES
──────────────────────────────────────────────────────────
${skills.length
  ? skills.map(s => `  ✓  ${s}`).join('\n')
  : '  ✓  [Add your key skills here]'}

PROFESSIONAL EXPERIENCE
──────────────────────────────────────────────────────────
${cvText.split('\n').filter(l => l.trim()).slice(0, 30).map(l => '  ' + l).join('\n')}

EDUCATION
──────────────────────────────────────────────────────────
  [Degree · Institution · Year]

CERTIFICATIONS
──────────────────────────────────────────────────────────
  [CompTIA Security+, CEH, CISSP, or equivalent]

TECHNICAL SKILLS
──────────────────────────────────────────────────────────
${skills.length
  ? skills.map(s => `  •  ${s}`).join('\n')
  : '  •  [List your technical skills here]'}

LANGUAGES
──────────────────────────────────────────────────────────
  [e.g. English (fluent) · German (B2)]

──────────────────────────────────────────────────────────
Generated by CareerAI Writer Agent`;
}

function buildCoverLetter({ jobTitle, company, name, skills: skillsStr }) {
  const skillList = (skillsStr || '').split(',').map(s => s.trim()).filter(Boolean);
  const date      = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const topSkills = skillList.length
    ? skillList.slice(0, 3).join(', ')
    : 'cybersecurity analysis, technical problem-solving, and collaborative teamwork';

  return `${name || '[Your Name]'}
[Address · City · Country]
[your@email.com] · [+xx xxx xxxxxx]

${date}

Hiring Manager
${company || '[Company Name]'}

Dear Hiring Team,

Re: Application for the Position of ${jobTitle || '[Job Title]'}

I am writing to express my strong interest in the ${jobTitle || '[Job Title]'} position at ${company || '[Company]'}. With a solid background in cybersecurity and hands-on experience in ${topSkills}, I am confident in my ability to contribute meaningfully to your team.

${skillList.length ? `My key competencies include:\n${skillList.map(s => `  •  ${s}`).join('\n')}\n` : ''}
My professional background has equipped me with a deep understanding of the evolving threat landscape, security operations, and best practices for protecting critical systems and data. I take a proactive approach to identifying risks and implementing effective security controls.

I am particularly drawn to ${company || 'your organization'} because of your commitment to excellence in cybersecurity. My technical skills and dedication to continuous learning make me an excellent fit for this role and your culture.

I would welcome the opportunity to discuss how my experience aligns with your team's needs. I am available for a phone call or interview at your convenience.

Thank you for considering my application.

Yours sincerely,
${name || '[Your Name]'}

──────────────────────────────────────────────────────────
Generated by CareerAI Writer Agent`;
}

$('generate-cv-btn').addEventListener('click', () => {
  const cvText = $('cv-for-writer').value.trim();
  const target = $('target-job-input').value.trim();
  if (!cvText) { alert('Please paste your CV text or run the Scout Agent first.'); return; }

  setAgentStatus('writer', 'running');
  $('generated-cv-output').value = buildImprovedCV(cvText, target, state.analysis);
  $('cv-output-block').classList.remove('hidden');
  setAgentStatus('writer', 'done');
  state.docsCount++;
  updateStats();
});

$('generate-cover-btn').addEventListener('click', () => {
  setAgentStatus('writer', 'running');
  $('generated-cover-output').value = buildCoverLetter({
    jobTitle: $('cover-job-title').value.trim(),
    company:  $('cover-company').value.trim(),
    name:     $('cover-name').value.trim(),
    skills:   $('cover-skills').value.trim()
  });
  $('cover-output-block').classList.remove('hidden');
  setAgentStatus('writer', 'done');
  state.docsCount++;
  updateStats();
});

function copyText(id) {
  const el = $(id);
  if (!el) return;
  navigator.clipboard.writeText(el.value).catch(() => { el.select(); document.execCommand('copy'); });
}

function downloadText(id, filename) {
  const el = $(id);
  if (!el) return;
  const a  = Object.assign(document.createElement('a'), {
    href:     URL.createObjectURL(new Blob([el.value], { type: 'text/plain' })),
    download: filename
  });
  a.click();
}

$('copy-cv-btn').addEventListener('click',      () => copyText('generated-cv-output'));
$('download-cv-btn').addEventListener('click',  () => downloadText('generated-cv-output', 'cv-draft.txt'));
$('copy-cover-btn').addEventListener('click',   () => copyText('generated-cover-output'));
$('download-cover-btn').addEventListener('click', () => downloadText('generated-cover-output', 'cover-letter.txt'));

// ── Tracker Agent ─────────────────────────────────────────────────────────
const STATUSES = ['applied', 'review', 'interview', 'offer', 'rejected'];
const NEXT = { applied: 'review', review: 'interview', interview: 'offer', offer: null, rejected: null };
const PREV = { applied: null, review: 'applied', interview: 'review', offer: 'interview', rejected: null };

function saveAppsLocally() {
  localStorage.setItem(APPS_KEY, JSON.stringify(state.apps));
}

async function loadApplications() {
  setAgentStatus('tracker', 'running');
  if (state.token && state.online) {
    try {
      const data = await api.get('/api/applications');
      state.apps = data.applications || state.apps;
      saveAppsLocally();
    } catch (_) {}
  }
  renderKanban();
  setAgentStatus('tracker', state.apps.length > 0 ? 'done' : 'idle');
  updateStats();
}

async function addApplication(app) {
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
}

async function moveApplication(id, newStatus) {
  state.apps = state.apps.map(a => a.id === id ? { ...a, status: newStatus } : a);
  saveAppsLocally();

  if (state.token && state.online) {
    try { await api.put(`/api/applications/${id}`, { status: newStatus }); } catch (_) {}
  }

  renderKanban();
}

async function deleteApplication(id) {
  state.apps = state.apps.filter(a => a.id !== id);
  saveAppsLocally();

  if (state.token && state.online) {
    try { await api.delete(`/api/applications/${id}`); } catch (_) {}
  }

  renderKanban();
  updateStats();
}

function renderKanban() {
  STATUSES.forEach(status => {
    const col   = $(`col-${status}`);
    const count = $(`cnt-${status}`);
    if (!col) return;

    const apps = state.apps.filter(a => a.status === status);
    if (count) count.textContent = apps.length;

    col.innerHTML = apps.map(app => {
      const next = NEXT[status];
      const prev = PREV[status];
      return `
        <div class="app-card">
          <div class="app-card-title">${esc(app.title)}</div>
          <div class="app-card-company">${esc(app.company)}${app.location ? ' · ' + esc(app.location) : ''}</div>
          ${app.deadline ? `<div class="app-card-deadline">⏰ ${esc(app.deadline)}</div>` : ''}
          ${app.url ? `<a class="app-card-link" href="${esc(app.url)}" target="_blank" rel="noreferrer">View job →</a>` : ''}
          ${app.notes ? `<div class="app-card-notes">${esc(app.notes)}</div>` : ''}
          <div class="app-card-actions">
            ${prev ? `<button class="move-btn" data-id="${app.id}" data-to="${prev}">← ${prev}</button>` : ''}
            ${next ? `<button class="move-btn" data-id="${app.id}" data-to="${next}">${next} →</button>` : ''}
            <button class="delete-btn" data-id="${app.id}">✕</button>
          </div>
        </div>
      `;
    }).join('');

    col.querySelectorAll('.move-btn').forEach(btn =>
      btn.addEventListener('click', e => moveApplication(e.target.dataset.id, e.target.dataset.to))
    );
    col.querySelectorAll('.delete-btn').forEach(btn =>
      btn.addEventListener('click', e => {
        if (confirm('Delete this application?')) deleteApplication(e.target.dataset.id);
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
  const title   = $('app-title').value.trim();
  const company = $('app-company').value.trim();
  if (!title || !company) { alert('Job title and company are required.'); return; }

  await addApplication({
    title,
    company,
    location: $('app-location').value.trim(),
    deadline: $('app-deadline').value,
    url:      $('app-url').value.trim(),
    notes:    $('app-notes').value.trim()
  });

  ['app-title','app-company','app-location','app-deadline','app-url','app-notes']
    .forEach(id => { const el = $(id); if (el) el.value = ''; });
  $('add-app-form').classList.add('hidden');
});

// ── Stats dashboard ───────────────────────────────────────────────────────
function updateStats() {
  $('stat-jobs').textContent    = state.jobs.length;
  $('stat-matches').textContent = state.matches.filter(m => m.score >= 0.7).length;
  $('stat-docs').textContent    = state.docsCount;
  $('stat-apps').textContent    = state.apps.length;
}

// ── Init ──────────────────────────────────────────────────────────────────
(async function init() {
  await checkApiStatus();
  updateAuthUI();
  setupDropZone();

  // Prefill sample CV
  $('cv-input').value = 'Experience: Linux administration, server deployment, network monitoring, log analysis, technical documentation. Skills: communication, teamwork, problem solving.';
  state.cvText = $('cv-input').value;

  // Restore apps from local storage
  renderKanban();
  updateStats();

  // Clear token if user name is missing (corrupted session)
  if (state.token && !state.user) {
    state.token = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  // Auto-load server applications if logged in
  if (state.token && state.online) {
    loadApplications();
  }
})();
