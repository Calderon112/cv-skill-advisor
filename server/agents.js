/**
 * agents.js — Explicit multi-agent architecture for CyberCareer.
 *
 * Addresses the Sprint-1 feedback: "unclear how the agents are separated and
 * whether their communication is robust".
 *
 * Design principles
 * ─────────────────
 * 1. Single responsibility — each agent does exactly one job and nothing else.
 * 2. Strict contracts    — every agent validates its input and returns a typed
 *                          output; a contract violation throws immediately.
 * 3. No direct coupling  — agents NEVER call each other. An orchestrator passes
 *                          typed data between them through a shared AgentContext.
 * 4. Robust communication— the orchestrator runs agents in sequence, isolates
 *                          failures (one agent failing never crashes the pipeline)
 *                          and records a status log for observability.
 * 5. Dependency injection — pure helpers (skill detection, scoring, writer, store)
 *                          are injected, so this module has no side effects and is
 *                          fully unit-testable.
 *
 *      ┌────────┐  analysis   ┌─────────┐  matches   ┌────────┐
 *  CV →│ Scout  │────────────▶│ Matcher │───────────▶│ Writer │→ documents
 *      └────────┘             └─────────┘            └────────┘
 *           │ status/errors        │ status/errors        │
 *           └──────────────▶ AgentContext (shared log) ◀──┘
 *                                   ▲
 *                         ┌─────────┴─────────┐
 *                         │     Tracker       │  (application lifecycle CRUD)
 *                         └───────────────────┘
 */

'use strict';

/** Shared communication channel between agents (carries data + status log). */
class AgentContext {
  constructor() {
    this.data = {};
    this.log = [];     // [{ agent, status: 'running'|'done'|'error', message, t }]
    this.errors = [];  // [{ agent, error }]
  }
  record(agent, status, message) {
    this.log.push({ agent, status, message, t: Date.now() });
  }
}

/** Small contract guard used by every agent. */
function expect(condition, message) {
  if (!condition) throw new Error(message);
}

// ── 01 · Scout Agent — CV → skills, gaps and role-fit ──────────────────────
const ScoutAgent = {
  name: 'Scout',
  description: 'Parses a CV into detected skills, missing skills and role-fit scores.',
  run(input, ctx, deps) {
    expect(input && typeof input.cvText === 'string', 'Scout: input.cvText must be a string');
    expect(deps && typeof deps.findSkills === 'function', 'Scout: deps.findSkills required');

    const foundSkills = deps.findSkills(input.cvText);
    const foundKeys = foundSkills.map(s => s.key);
    const allSkills = deps.allSkills();
    const missingSkills = allSkills.filter(s => !foundKeys.includes(s.key));
    const roles = deps.analyzeRoles(foundKeys);
    // Concrete, explained gap recommendations ("missing X → learn Y"), if a
    // recommender is injected. Optional, so the agent stays usable without it.
    const recommendations = typeof deps.recommend === 'function' ? deps.recommend(roles) : [];

    return { foundSkills, foundKeys, missingSkills, roles, recommendations };
  },
};

// ── 02 · Matcher Agent — analysis + jobs → ranked matches with gap breakdown ─
const MatcherAgent = {
  name: 'Matcher',
  description: 'Scores discovered jobs against the Scout analysis and ranks them.',
  run(input, ctx, deps) {
    expect(input && input.analysis, 'Matcher: missing analysis (Scout output)');
    expect(deps && typeof deps.scoreJob === 'function', 'Matcher: deps.scoreJob required');

    const jobs = Array.isArray(input.jobs) ? input.jobs : [];
    const matches = jobs
      .map(job => {
        const { score, breakdown } = deps.scoreJob(job, input.analysis);
        return { job, score, breakdown };
      })
      .sort((a, b) => b.score - a.score);

    return { matches, highCount: matches.filter(m => m.score >= 0.7).length };
  },
};

// ── 03 · Writer Agent — profile + job → tailored document ──────────────────
const WriterAgent = {
  name: 'Writer',
  description: 'Generates a tailored cover letter / CV from the profile and a job.',
  async run(input, ctx, deps) {
    expect(input && input.profile, 'Writer: input.profile required');
    if (!deps || typeof deps.writer !== 'function') {
      return { generated: false, reason: 'writer not configured' };
    }
    const kind = input.kind || 'cover';
    const text = await deps.writer({ profile: input.profile, job: input.job || {}, kind });
    expect(typeof text === 'string' && text.length > 0, 'Writer: empty document produced');
    return { generated: true, kind, text };
  },
};

// ── 04 · Tracker Agent — application lifecycle (CRUD) ──────────────────────
const TrackerAgent = {
  name: 'Tracker',
  description: 'Manages the application lifecycle (add / list / update / remove).',
  run(input, ctx, deps) {
    expect(input && input.action, 'Tracker: input.action required');
    expect(deps && deps.store, 'Tracker: deps.store required');
    const store = deps.store;
    switch (input.action) {
      case 'list':   return { applications: store.list() };
      case 'add':    return { application: store.add(input.payload) };
      case 'update': return { application: store.update(input.payload.id, input.payload.updates) };
      case 'remove': store.remove(input.payload.id); return { removed: input.payload.id };
      default: throw new Error(`Tracker: unknown action "${input.action}"`);
    }
  },
};

/**
 * Orchestrator — runs the analysis pipeline Scout → Matcher with robust,
 * isolated communication. A failing agent is logged and skipped; downstream
 * agents that depend on it are not run, but the pipeline always returns cleanly.
 */
async function runPipeline(input, deps) {
  const ctx = new AgentContext();

  async function step(agent, agentInput) {
    ctx.record(agent.name, 'running', agent.description);
    try {
      const out = await agent.run(agentInput, ctx, deps);
      ctx.record(agent.name, 'done', 'ok');
      return out;
    } catch (e) {
      ctx.errors.push({ agent: agent.name, error: e.message });
      ctx.record(agent.name, 'error', e.message);
      return null;
    }
  }

  const analysis = await step(ScoutAgent, { cvText: (input && input.cvText) || '' });
  ctx.data.analysis = analysis;

  let matching = null;
  if (analysis) {
    matching = await step(MatcherAgent, { analysis, jobs: (input && input.jobs) || [] });
  } else {
    ctx.record(MatcherAgent.name, 'skipped', 'no analysis from Scout');
  }
  ctx.data.matching = matching;

  return { analysis, matching, agentLog: ctx.log, errors: ctx.errors, ok: ctx.errors.length === 0 };
}

/** Machine-readable description of the architecture (used by /api/agents). */
const AGENT_REGISTRY = [ScoutAgent, MatcherAgent, WriterAgent, TrackerAgent].map((a, i) => ({
  id: String(i + 1).padStart(2, '0'),
  name: a.name,
  description: a.description,
}));

module.exports = {
  AgentContext,
  ScoutAgent,
  MatcherAgent,
  WriterAgent,
  TrackerAgent,
  runPipeline,
  AGENT_REGISTRY,
};
