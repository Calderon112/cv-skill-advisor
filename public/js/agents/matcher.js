/**
 * agents/matcher.js — Matcher Agent (02)
 *
 * Scores every job found by Scout against the analysed CV.
 * Score = fraction of detected skills that appear in the job text,
 *         plus a 15% bonus when the job title also matches a skill.
 */

import { state }    from '../state.js';
import { updateStats } from './scout.js';

const $ = id => document.getElementById(id);
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function normalize(t) { return t.toLowerCase().replace(/[.,;:()\-/]/g, ' '); }

function score(job, analysis) {
  if (!analysis?.foundSkills?.length) return 0;
  const keys    = analysis.foundSkills.map(s => s.key);
  const jobText = normalize([job.title, job.description, job.sector, job.board].filter(Boolean).join(' '));
  const matched = keys.filter(k => jobText.includes(k));
  const base    = matched.length / keys.length;
  const bonus   = keys.some(k => normalize(job.title || '').includes(k)) ? 0.15 : 0;
  return Math.min(1, base + bonus);
}

export function runMatcher() {
  const empty   = $('matcher-empty');
  const content = $('matcher-content');

  if (!state.jobs.length || !state.analysis) {
    empty?.classList.remove('hidden');
    content?.classList.add('hidden');
    return;
  }

  empty?.classList.add('hidden');
  content?.classList.remove('hidden');

  state.matches = state.jobs
    .map(job => ({ ...job, score: score(job, state.analysis) }))
    .sort((a, b) => b.score - a.score);

  renderMatches(state.matches);
  updateStats();
}

function renderMatches(matches) {
  const grid = $('match-results');
  if (!grid) return;

  grid.innerHTML = matches.map(job => {
    const pct  = Math.round(job.score * 100);
    const tier = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low';
    const matchedSkills = (state.analysis?.foundSkills || [])
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
        ${matchedSkills.length
          ? matchedSkills.map(s => `<span class="match-skill">${esc(s.label)}</span>`).join('')
          : '<span class="match-skill" style="opacity:.4">No direct skill overlap</span>'}
      </div>
      ${job.jobUrl ? `<a class="job-card-link" href="${esc(job.jobUrl)}" target="_blank" rel="noreferrer">View job →</a>` : ''}
    </div>`;
  }).join('');
}
