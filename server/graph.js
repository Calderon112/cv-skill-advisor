/**
 * graph.js — LangGraph orchestration of the multi-agent pipeline.
 *
 * Turns the hand-rolled Scout→Matcher→Writer pipeline (agents.js) into an
 * explicit StateGraph and adds what a linear pipeline could not do cleanly:
 *   • conditional routing  — only write a letter when there is a job to write for;
 *   • a Writer⇄Critic loop — the Critic scores each draft and sends it back to the
 *     Writer to improve, until it is good enough (or a revision cap is hit).
 *
 * The Writer is grounded with RAG (retrieved learning/role context) so the letter
 * cites concrete, relevant material. Scout/Matcher reuse the existing agents.js
 * agents unchanged; the LLM and RAG layers are injected (no new coupling).
 */
'use strict';

const { StateGraph, START, END, Annotation } = require('@langchain/langgraph');
const { ScoutAgent, MatcherAgent } = require('./agents.js');

const QUALITY_BAR = Number(process.env.GRAPH_QUALITY_BAR) || 80; // 0..100
const MAX_REVISIONS = Number(process.env.GRAPH_MAX_REVISIONS) || 2;

// Shared, typed state = the old AgentContext, expressed as graph "channels".
const GraphState = Annotation.Root({
  cvText:         Annotation(),
  jobs:           Annotation(),
  profile:        Annotation(),
  jobDescription: Annotation(),
  analysis:       Annotation(),
  matching:       Annotation(),
  job:            Annotation(),
  draft:          Annotation(),
  score:          Annotation(),
  feedback:       Annotation(),
  revisions:      Annotation({ reducer: (_, b) => b, default: () => 0 }),
  // trace accumulates across nodes so the UI can show the execution path.
  trace:          Annotation({ reducer: (a, b) => a.concat(b), default: () => [] }),
});

function firstJson(text) {
  try { return JSON.parse((text.match(/\{[\s\S]*\}/) || [])[0]); } catch (_) { return null; }
}

/**
 * Build + run the graph for one request.
 * @param input { cvText, jobs, profile, job, jobDescription }
 * @param deps  buildAgentDeps() bundle (findSkills, analyzeRoles, allSkills, scoreJob, recommend)
 * @param llm   server/llm.js (chat)
 * @param rag   server/rag.js (retrieve, isAvailable) — optional
 */
async function runGraph(input, deps, llm, rag) {
  // ── Nodes ────────────────────────────────────────────────────────────────
  const scout = (s) => {
    const analysis = ScoutAgent.run({ cvText: s.cvText || '' }, null, deps);
    return { analysis, trace: [{ node: 'Scout', note: `${analysis.foundKeys.length} skills · top role: ${analysis.roles?.[0]?.name || '—'}` }] };
  };

  const matcher = (s) => {
    const matching = MatcherAgent.run({ analysis: s.analysis, jobs: s.jobs || [] }, null, deps);
    const job = (matching.matches[0] && matching.matches[0].job) || s.job || null;
    return { matching, job, trace: [{ node: 'Matcher', note: `${matching.matches.length} jobs scored · ${matching.highCount} strong` }] };
  };

  const writer = async (s) => {
    const role = s.analysis?.roles?.[0]?.name || s.job?.title || 'the role';
    // RAG grounding: pull concrete resources relevant to the role + top skills.
    let grounding = '';
    try {
      if (rag && rag.isAvailable && rag.isAvailable()) {
        const q = `${role} ${(s.analysis?.foundKeys || []).slice(0, 6).join(' ')}`;
        const hits = await rag.retrieve(q, 3);
        grounding = hits.map((h) => `- ${h.title}: ${h.text}`).join('\n');
      }
    } catch (_) { /* grounding is best-effort */ }

    const refine = s.revisions > 0 && s.feedback
      ? `\n\nThis is revision ${s.revisions + 1}. Improve the PREVIOUS draft using the critique.\nCRITIQUE: ${s.feedback}\nPREVIOUS DRAFT:\n${s.draft}`
      : '';
    const system = 'You are the Writer agent. Write a concise, specific cover letter (max ~220 words) '
      + 'tailored to the job and grounded in the candidate profile and the context. Avoid clichés and generic filler.';
    const user = `JOB:\n${s.jobDescription || s.job?.title || '(unspecified role)'}\n\n`
      + `CANDIDATE PROFILE:\n${(typeof s.profile === 'string' ? s.profile : JSON.stringify(s.profile || {})).slice(0, 1600)}\n\n`
      + `RELEVANT CONTEXT (cite where useful):\n${grounding || '(none)'}${refine}`;
    // Generous budget: gemini-2.5-flash spends part of max_tokens on hidden
    // "thinking", so a small cap truncates the actual letter.
    const text = await llm.chat({ system, user, maxTokens: 2000, temperature: 0.55 });
    return { draft: text, revisions: s.revisions + 1, trace: [{ node: 'Writer', note: `draft v${s.revisions + 1} · ${text.length} chars` }] };
  };

  const critic = async (s) => {
    const system = 'You are a demanding Critic agent. Rate the cover letter 0-100 for specificity (does it name concrete '
      + 'skills/tools from the profile?), relevance to the job, and impact. Be strict: a generic letter scores below 70. '
      + 'ALWAYS give one concrete, actionable improvement. Reply ONLY as JSON: {"score": <integer 0-100>, "feedback": "<one concrete improvement>"}';
    const user = `JOB:\n${s.jobDescription || s.job?.title || ''}\n\nCOVER LETTER:\n${s.draft}`;
    const raw = await llm.chat({ system, user, maxTokens: 1500, temperature: 0.2 });
    const j = firstJson(raw) || {};
    const score = Math.max(0, Math.min(100, Number(j.score) || 70));
    const feedback = String(j.feedback || '').slice(0, 300);
    return { score, feedback, trace: [{ node: 'Critic', note: `score ${score}/100 · ${feedback || 'ok'}` }] };
  };

  // ── Conditional edges (the graph-only behaviour) ─────────────────────────
  const afterMatch = (s) => (s.job ? 'writer' : END);
  const afterCritic = (s) => (s.score < QUALITY_BAR && s.revisions < MAX_REVISIONS ? 'writer' : END);

  const graph = new StateGraph(GraphState)
    .addNode('scout', scout)
    .addNode('matcher', matcher)
    .addNode('writer', writer)
    .addNode('critic', critic)
    .addEdge(START, 'scout')
    .addEdge('scout', 'matcher')
    .addConditionalEdges('matcher', afterMatch, { writer: 'writer', [END]: END })
    .addEdge('writer', 'critic')
    .addConditionalEdges('critic', afterCritic, { writer: 'writer', [END]: END })
    .compile();

  const final = await graph.invoke({
    cvText: input.cvText || '',
    jobs: input.jobs || [],
    profile: input.profile || {},
    job: input.job || null,
    jobDescription: input.jobDescription || '',
  }, { recursionLimit: 25 });

  return {
    coverLetter: final.draft || '',
    score: final.score ?? null,
    feedback: final.feedback || '',
    revisions: final.revisions || 0,
    qualityBar: QUALITY_BAR,
    trace: final.trace || [],
  };
}

module.exports = { runGraph, GraphState };
