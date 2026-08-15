# CyberCareer — Multi-Agent Architecture

> Sprint-2 response to the Sprint-1 review note:
> *"Verbesserungspotenzial liegt bei der Architektur der drei Agenten (Scout,
> Matcher, Tracker): Es bleibt unklar, wie klar sie voneinander getrennt sind und
> ob die Kommunikation zwischen ihnen robust gestaltet ist."*

This document makes the agent separation and their communication **explicit**.

## Overview

```
        ┌─────────┐   analysis    ┌──────────┐   matches    ┌─────────┐
  CV ──▶│  Scout  │──────────────▶│ Matcher  │─────────────▶│ Writer  │──▶ documents
        └─────────┘               └──────────┘              └─────────┘
             │ status / errors          │ status / errors        │
             └────────────────▶ AgentContext (shared log) ◀──────┘
                                        ▲
                              ┌─────────┴──────────┐
                              │      Tracker       │  application lifecycle (CRUD)
                              └────────────────────┘
```

Implementation: [`server/agents.js`](server/agents.js). Orchestrated by the
`POST /api/pipeline` endpoint; registry exposed at `GET /api/agents`.

## The four agents (single responsibility)

| # | Agent | Responsibility | Input contract | Output contract |
|---|-------|----------------|----------------|-----------------|
| 01 | **Scout** | CV → skills, gaps, role-fit, learning recs | `{ cvText: string }` | `{ foundSkills, foundKeys, missingSkills, roles, recommendations }` |
| 02 | **Matcher** | Rank jobs against the analysis | `{ analysis, jobs[] }` | `{ matches:[{job,score,breakdown}], highCount }` |
| 03 | **Writer** | Tailored cover letter / CV | `{ profile, job, kind }` | `{ generated, kind, text }` |
| 04 | **Tracker** | Application lifecycle | `{ action, payload }` | `{ applications }` / `{ application }` / `{ removed }` |

## How separation is guaranteed

1. **No direct coupling.** Agents never import or call each other. Each is a plain
   object `{ name, description, run(input, ctx, deps) }`. The only thing that wires
   them together is the **orchestrator** (`runPipeline`).
2. **Strict contracts.** Every `run()` validates its input first (`expect(...)`).
   A contract violation throws a descriptive error (e.g. *"Matcher: missing
   analysis (Scout output)"*) — covered by unit tests.
3. **Dependency injection.** Pure helpers (skill detection, scoring, the LLM
   writer, the application store) are passed in via `deps`. The agent module has
   **no global state and no side effects**, which is why it is fully unit-testable.

## How communication is made robust

- **Typed hand-off via a shared `AgentContext`.** The orchestrator passes Scout's
  output as Matcher's input; data flows one way, explicitly.
- **Failure isolation.** Each step runs in a `try/catch`. If an agent throws, the
  error is recorded in `ctx.errors`, a `status: 'error'` entry is added to the log,
  and downstream agents that depend on it are **skipped** — the pipeline still
  returns cleanly (`ok: false`) instead of crashing.
- **Observability.** Every transition (`running → done / error / skipped`) is
  appended to `ctx.log`, returned to the caller as `agentLog`. The UI/tests can
  see exactly what each agent did.

## Verification (unit tests)

`node test.js` runs the original Sprint-1 suite **plus** a dedicated
*Multi-Agent Architecture* section that proves the design:

- registry exposes exactly 4 separated agents
- Scout / Matcher / Tracker enforce their input contracts (throw on violation)
- Matcher ranks jobs by score descending
- Writer degrades gracefully when no LLM writer is configured
- the pipeline lets Scout and Matcher **communicate via the shared context**
- the pipeline **isolates a failing agent** (no crash, error logged, downstream skipped)

## API surface

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/agents` | Machine-readable registry of the 4 agents |
| POST | `/api/pipeline` | Run Scout → Matcher; returns `{ analysis, matching, agentLog, errors, ok }` |
| POST | `/api/analyze` | CV → skills / gaps / role-fit |
| POST | `/api/scrape-all` | Parallel multi-source scrape → fuzzy-deduped jobs + `scrapeLog` |
| POST | `/api/job-consult` | **Oracle** — deep AI match (%, strengths, gaps, advice) |
| POST | `/api/generate-cv` · `/api/generate-cover` · `/api/generate-roadmap` · `/api/generate-interview` | Writer / Interview generation (LLM + template fallback) |
| POST | `/api/market-report` | Aggregated job-market stats + LLM summary |
| GET | `/api/ai-status` | Which LLM provider + email provider are configured |

## Engine modules (deterministic, unit-tested)

| Module | Responsibility |
|--------|----------------|
| `security-skills.js` | 232-skill IT-Security taxonomy |
| `scorer.js` | Weighted 6-criteria match score + breakdown |
| `server/dedup.js` | Fuzzy cross-source de-duplication (Sørensen-Dice) |
| `rerank.js` | Outcome-based re-ranking from past interview/offer outcomes |
| `server/report.js` | Market-trend report |
| `server/agents.js` | The 4-agent orchestration layer |
| `server/llm.js` | Multi-provider LLM client (Anthropic/Gemini/OpenRouter/OpenAI) with fallback |

> The deterministic match score is a fast estimate used for ranking; once the **Oracle**
> (LLM) has assessed a job, its score becomes authoritative and is shown everywhere.

## Tests

`node tests/test.js` → **70 unit tests** (pure functions, multi-agent contracts,
fuzzy dedup, outcome re-ranking, market report). No external framework.
