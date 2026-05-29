/**
 * agents/scout.js — Scout Agent (01)
 *
 * Responsibilities:
 *   • Parse PDF CVs via the server endpoint
 *   • Analyse CV text for skills / role fit
 *   • Search jobs across platforms
 *   • Render analysis results and job cards
 */

import { state }                from '../state.js';
import { api }                  from '../api.js';
import { analyzeLocal, SUGGESTIONS } from '../data/skills.js';
import { showAuthModal }        from '../auth.js';
import { navigate }             from '../router.js';

const $ = id => document.getElementById(id);
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ── Agent status display ──────────────────────────────────────────────────

export function setAgentStatus(agent, status) {
  const dot  = $(`nav-dot-${agent}`);
  const pill = $(`dash-status-${agent}`);
  const labels = { idle: 'Idle', running: 'Running…', done: 'Done', error: 'Error' };
  if (dot)  dot.className  = 'status-dot' + (status !== 'idle' ? ` ${status}` : '');
  if (pill) { pill.textContent = labels[status] || status; pill.className = `status-pill ${status}`; }
}

// ── PDF extraction ────────────────────────────────────────────────────────

async function extractPdfText(file) {
  const bytes  = new Uint8Array(await file.arrayBuffer());
  let binary   = '';
  const CHUNK  = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK)
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  const data = await api.parsePdf(btoa(binary));
  return data.text || '';
}

// ── Drop zone ─────────────────────────────────────────────────────────────

export function initDropZone() {
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
    if (file) await handleFile(file, ta);
  });
  input?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (file) { await handleFile(file, ta); input.value = ''; }
  });
}

async function handleFile(file, ta) {
  const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
  if (isPdf) {
    try   { ta.value = await extractPdfText(file); }
    catch (e) { alert('PDF error: ' + e.message); return; }
  } else {
    ta.value = await file.text();
  }
  state.cvText = ta.value;
}

// ── CV Analysis ───────────────────────────────────────────────────────────

export async function analyzeCV() {
  const text = $('cv-input').value.trim();
  if (!text) { alert('Please paste or drop your CV first.'); return; }
  state.cvText = text;
  setAgentStatus('scout', 'running');
  $('cv-status-pill').textContent = 'Analyzing…';

  let result;
  try   { result = await api.analyze(text); }
  catch (_) { result = analyzeLocal(text); }

  state.analysis = result;
  renderAnalysis(result);
  renderSuggestions(result.missingSkills);
  syncWriterCv();
  setAgentStatus('scout', 'done');
  $('cv-status-pill').textContent = 'Done';
  updateStats();
}

function renderAnalysis(r) {
  const allCount = 15;  // total tracked skills
  const score    = Math.round(r.foundSkills.length / allCount * 100);
  const topRoles = r.roles.length
    ? r.roles.slice(0, 3).map(x => `${x.name} (${Math.round(x.score * 100)}%)`).join(' · ')
    : 'No strong role match';

  $('analysis-summary').innerHTML = `<strong>${score}%</strong> of tracked skills detected &nbsp;·&nbsp; ${topRoles}`;
  $('found-skills').innerHTML    = r.foundSkills.length ? r.foundSkills.map(s => `<li>${esc(s.label)}</li>`).join('') : '<li>No skills detected</li>';
  $('missing-skills').innerHTML  = r.missingSkills.length ? r.missingSkills.slice(0, 8).map(s => `<li>${esc(s.label)}</li>`).join('') : '<li>All tracked skills present!</li>';
  $('recommended-roles').innerHTML = r.roles.length ? r.roles.map(x => `<li><strong>${esc(x.name)}</strong> — ${x.matched}/${x.total}</li>`).join('') : '<li>Add more skills for role recommendations.</li>';
  $('analysis-results-panel').classList.remove('hidden');
}

function renderSuggestions(missingSkills) {
  const panel = $('learning-panel');
  const grid  = $('suggestions-grid');
  const items = missingSkills.slice(0, 6).map(s => SUGGESTIONS[s.key] || `Build experience with ${s.label}.`);
  if (!items.length) { panel?.classList.add('hidden'); return; }
  if (grid) grid.innerHTML = items.map(s => `<div class="suggestion-card">${esc(s)}</div>`).join('');
  panel?.classList.remove('hidden');
}

// ── Job search ────────────────────────────────────────────────────────────

export async function searchJobs() {
  const platform = $('platform-select').value;
  if (platform === 'all') { await scrapeAll(); return; }

  const btn = $('search-jobs-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = '<span>⏳</span> Searching…'; btn.disabled = true;
  setAgentStatus('scout', 'running');
  $('search-status-pill').textContent = 'Searching…';

  try {
    const params = {
      platform,
      keyword:  $('job-keyword-input')?.value?.trim() || '',
      sector:   $('sector-select').value,
      region:   $('region-select').value,
      distance: $('distance-select').value,
      location: $('search-location-input').value.trim()
    };
    const data = await api.searchJobs(params);
    state.jobs = data.jobs || [];
    $('platform-breakdown').classList.add('hidden');
    $('scrape-all-progress').classList.add('hidden');
  } catch (err) {
    console.error('[scout] searchJobs error:', err);
    state.jobs = [];
  } finally {
    btn.innerHTML = orig; btn.disabled = false;
  }

  const labels = { bundesagentur:'Bundesagentur', arbeitnow:'Arbeitnow', linkedin:'LinkedIn', remotive:'Remotive', indeed:'Indeed', stepstone:'StepStone' };
  renderJobs(state.jobs, labels[platform] || platform);
  setAgentStatus('scout', state.jobs.length > 0 ? 'done' : 'error');
  $('search-status-pill').textContent = `${state.jobs.length} found`;
  updateStats();
}

export async function scrapeAll() {
  const btn = $('scrape-all-btn');
  if (btn) { btn.innerHTML = '<span>⏳</span> Scraping…'; btn.disabled = true; }
  const progress  = $('scrape-all-progress');
  const breakdown = $('platform-breakdown');
  const platforms = ['bundesagentur', 'arbeitnow', 'linkedin', 'remotive'];

  progress.classList.remove('hidden');
  breakdown.classList.add('hidden');
  $('jobs-results-panel').classList.add('hidden');
  platforms.forEach(p => {
    const el = $(`sp-${p}`);
    if (el) { el.className = 'scrape-platform'; el.querySelector('.sp-dot').className = 'sp-dot spinning'; }
  });
  setAgentStatus('scout', 'running');
  $('search-status-pill').textContent = 'Scraping all…';

  try {
    const data = await api.scrapeAll({
      keyword:  $('job-keyword-input')?.value?.trim() || '',
      sector:   $('sector-select').value,
      region:   $('region-select').value,
      location: $('search-location-input').value.trim()
    });
    state.jobs = data.jobs || [];

    const nameMap = { bundesagentur:'Bundesagentur', arbeitnow:'Arbeitnow', linkedin:'LinkedIn', remotive:'Remotive' };
    platforms.forEach(p => {
      const el = $(`sp-${p}`);
      if (!el) return;
      const name  = nameMap[p] || p;
      const count = data.breakdown?.[name] ?? 0;
      el.className = `scrape-platform ${count > 0 ? 'done' : 'error'}`;
      el.textContent = `${name}: ${count}`;
    });

    if (data.breakdown) {
      breakdown.innerHTML = Object.entries(data.breakdown).map(([n, c]) => `
        <div class="pb-chip"><div class="pb-chip-count">${c}</div><div class="pb-chip-name">${esc(n)}</div></div>
      `).join('') + `<div class="pb-chip"><div class="pb-chip-count" style="color:var(--orange)">${state.jobs.length}</div><div class="pb-chip-name">Total</div></div>`;
      breakdown.classList.remove('hidden');
    }

    renderJobs(state.jobs, 'All Platforms');
    setAgentStatus('scout', state.jobs.length > 0 ? 'done' : 'error');
    $('search-status-pill').textContent = `${state.jobs.length} found`;
    updateStats();
  } catch (err) {
    console.error('[scout] scrapeAll error:', err);
    platforms.forEach(p => { const el = $(`sp-${p}`); if (el) { el.className = 'scrape-platform error'; } });
    setAgentStatus('scout', 'error');
    $('search-status-pill').textContent = 'Error';
  } finally {
    if (btn) { btn.innerHTML = '<span>⚡</span> Scrape All Platforms'; btn.disabled = false; }
  }
}

// ── Job cards renderer ────────────────────────────────────────────────────

export function renderJobs(jobs, sourceLabel) {
  const panel = $('jobs-results-panel');
  const grid  = $('job-results');
  $('job-count-badge').textContent = jobs.length;
  panel.classList.remove('hidden');

  if (!jobs.length) {
    grid.innerHTML = `<div class="job-card"><p class="job-card-meta">No jobs found. Try a different keyword or platform.</p></div>`;
    return;
  }

  grid.innerHTML = jobs.map((job, i) => {
    const date   = job.publishedDate ? String(job.publishedDate).slice(0, 10) : null;
    const isNew  = date && (Date.now() - new Date(date).getTime()) < 7 * 86400000;
    return `
    <article class="job-card">
      <div class="job-card-top">
        <div>
          <div class="job-card-title">${esc(job.title)}</div>
          <div class="job-card-meta">${esc(job.company)} · ${esc(job.location)}</div>
        </div>
        ${isNew ? '<span class="new-badge">New</span>' : ''}
      </div>
      ${job.salary ? `<div class="job-card-salary">💰 ${esc(job.salary)}</div>` : ''}
      <div class="job-card-desc">${esc(job.description || '')}</div>
      <div class="job-card-chips">
        <span class="chip platform">${esc(job.board || job.platform || sourceLabel || '')}</span>
        ${job.remote ? '<span class="chip remote">Remote</span>' : ''}
        ${job.jobType ? `<span class="chip">${esc(job.jobType)}</span>` : ''}
        ${date ? `<span class="chip date ${isNew ? 'new' : ''}">${date}</span>` : ''}
      </div>
      ${job.jobUrl ? `<a class="job-card-link" href="${esc(job.jobUrl)}" target="_blank" rel="noreferrer">View job →</a>` : ''}
      <button class="track-btn" data-job-idx="${i}">+ Track Application</button>
    </article>`;
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

// Sync CV text to Writer Agent textarea
export function syncWriterCv() {
  const ta = $('cv-for-writer');
  if (ta && state.cvText && !ta.value.trim()) ta.value = state.cvText;
}

// ── Stats ─────────────────────────────────────────────────────────────────

export function updateStats() {
  $('stat-jobs').textContent    = state.jobs.length;
  $('stat-matches').textContent = state.matches.filter(m => m.score >= 0.7).length;
  $('stat-docs').textContent    = state.docsCount;
  $('stat-apps').textContent    = state.apps.length;
}
