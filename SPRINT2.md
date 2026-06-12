# CyberCareer — Sprint 2 Report
**IT Security Skill Advisor · Jardel Calderon Kenne Tedjeu · Westfälische Hochschule, Gelsenkirchen**

> This document is the technical anchor for the Sprint 2 presentation. It states **what was set out, what was built, what is new vs Sprint 1**, answers the Sprint 1 review feedback point‑by‑point, and explains **how** each feature was implemented at the code level.

---

## 1. Sprint Summary (the anchor)

**What I set out to build:** Sprint 2 was planned to deliver the *Writer Agent* (AI cover letters), grow the skill database to *200+ IT‑Security skills*, add the *Jooble + Apify* job sources, *email notifications*, and an *advanced user profile* — while directly answering the Sprint 1 review (clarify the agent architecture, and turn the gap analysis from a bare score into concrete "learn X" guidance).

**What I actually built:** All five planned items shipped **plus** a substantial response to the feedback and a new job‑centric workspace. The multi‑agent architecture is now **explicit and testable** (`server/agents.js` with strict input/output contracts, a shared `AgentContext`, failure isolation, and a runnable `POST /api/pipeline`). The gap analysis became **actionable** (`security-learning.js`: per‑skill "how + where to learn", prioritised). The LLM layer became **provider‑agnostic and free‑tier‑capable** (Anthropic / Gemini / OpenRouter / OpenAI with automatic fallback). The skill taxonomy reached **232 skills**. Job coverage expanded to **7 sources** with a domain‑relevance filter. CVs are now parsed by an **LLM into the full structured profile** (experience, education, certifications), with a regex fallback. Finally, a **Job Workspace** ties everything together: select a saved job → see a real *skills‑match %* → see the exact *gaps* → an **"Oracle"** that lists courses (YouTube / Udemy / Coursera), hands‑on platforms and certifications → generate a **cover letter grounded in your experience and the job's requirements**.

**What is new vs Sprint 1:** Sprint 1 produced a working end‑to‑end pipeline (upload CV → gap score → aggregated jobs) on a single hard‑coded backend with a 15‑skill DB and an implicit agent design. Sprint 2 turns that foundation into a **decoupled, documented multi‑agent system**, replaces the bare score with **explained, prioritised learning paths**, makes the AI **free to run** (Gemini/OpenRouter) and **provider‑resilient**, and adds the **per‑job decision workspace** that was previously missing. Test coverage grew from **42 → 65** unit tests (Sprint‑1 suite + a dedicated *Multi‑Agent Architecture* section + a *Skill‑Gap Recommendations* section).

---

## 2. How the Sprint 1 review feedback was addressed

| Reviewer feedback (Sprint 1) | Response in Sprint 2 | Where |
|---|---|---|
| *"Verbesserungspotenzial bei der Architektur der Agenten — unklar, wie klar sie getrennt sind und ob die Kommunikation robust ist."* | Agents are now **fully decoupled objects** (`{ name, description, run(input, ctx, deps) }`). They **never call each other** — an **orchestrator** passes typed data through a shared **`AgentContext`**. Every `run()` **validates its input contract** and throws a descriptive error on violation. The pipeline **isolates failures** (a failing agent is logged and skipped; downstream agents are skipped; the pipeline still returns cleanly). Exposed at runtime via `GET /api/agents` (registry) and `POST /api/pipeline`. Proven by 10 dedicated unit tests. | `server/agents.js`, `ARCHITECTURE.md`, `/api/agents`, `/api/pipeline` |
| *"Noch nützlicher durch konkretere, erklärte Skill‑Gap‑Empfehlungen — nicht nur ein Score, sondern 'Dir fehlt X, lerne Y'."* | New **recommendation engine**: every missing skill becomes *"why it matters + how to learn it + where"* (TryHackMe, Splunk, OWASP, PortSwigger, BSI Grundschutz, OSCP…). `recommendGaps()` **prioritises** the gaps required by the most target roles. Surfaced in the analysis panel **and** in the new Job Workspace "Oracle". | `security-learning.js`, Job Workspace |
| *"Für zukünftige Präsentationen mehr technische Details und eine ausführlichere Demonstration der Agentenlogik."* | The agent logic is now **demonstrable live** (`POST /api/pipeline` runs Scout → Matcher and returns the per‑agent status log `agentLog`), **documented** (`ARCHITECTURE.md` with data‑flow diagrams), and covered by this technical report. | `ARCHITECTURE.md`, `/api/pipeline` |
| *Praise: "Die Sprint‑Checkliste im README ist eine sehr gute Idee."* | Kept and extended; this report doubles as the Sprint‑2 checklist. | `README.md`, `SPRINT2.md` |

---

## 3. Architecture deep‑dive (the "more technical detail" the reviewer asked for)

### 3.1 Multi‑agent system — `server/agents.js`

Design principles enforced in code:

1. **Single responsibility** — each agent does exactly one job.
2. **Strict contracts** — `expect(condition, message)` guards validate every input; a violation throws (e.g. *"Matcher: missing analysis (Scout output)"*).
3. **No direct coupling** — agents are plain objects; only the orchestrator wires them.
4. **Robust communication** — a shared `AgentContext` carries data + a status log (`running → done | error | skipped`) + an `errors[]` list.
5. **Dependency injection** — pure helpers (skill detection, scoring, the LLM writer, the application store, the recommender) are passed in via `deps`, so the module has **no global state / no side effects** and is fully unit‑testable.

```
        ┌────────┐ analysis  ┌─────────┐ matches  ┌────────┐
  CV ──▶│ Scout  │──────────▶│ Matcher │─────────▶│ Writer │──▶ documents
        └────────┘           └─────────┘          └────────┘
            │ status/errors       │ status/errors      │
            └───────────▶ AgentContext (shared log) ◀──┘
                                ▲
                       ┌────────┴────────┐
                       │     Tracker     │  application lifecycle (CRUD)
                       └─────────────────┘
```

| # | Agent | Responsibility | Input contract | Output contract |
|---|-------|----------------|----------------|-----------------|
| 01 | **Scout** | CV → skills, gaps, role‑fit, learning recs | `{ cvText:string }` | `{ foundSkills, foundKeys, missingSkills, roles, recommendations }` |
| 02 | **Matcher** | Rank jobs vs the analysis | `{ analysis, jobs[] }` | `{ matches:[{job,score,breakdown}], highCount }` |
| 03 | **Writer** | Tailored cover letter / CV | `{ profile, job, kind }` | `{ generated, kind, text }` |
| 04 | **Tracker** | Application lifecycle | `{ action, payload }` | `{ applications }` / `{ application }` / `{ removed }` |

**Orchestrator** (`runPipeline`): runs each step inside `try/catch`; on throw it records the error in `ctx.errors`, marks the agent `error` in the log, and **skips dependent downstream agents** — the call always returns `{ analysis, matching, agentLog, errors, ok }` instead of crashing.

**Runtime surface:** `GET /api/agents` returns the machine‑readable registry; `POST /api/pipeline` runs Scout → Matcher and returns the analysis, the matches, and the full `agentLog`.

### 3.2 Provider‑agnostic LLM layer — `server/llm.js`

A single `chat({ system, user, maxTokens, temperature })` API in front of **four providers**, using only Node's built‑in `https` (zero npm deps):

- **Anthropic** (Claude) — native Messages API.
- **Gemini / OpenRouter / OpenAI** — share one code path because all three speak the **OpenAI `chat/completions`** format (`chatOpenAICompatible`).
- **Selection & resilience:** `LLM_PROVIDER` picks the primary; any other provider that also has a key acts as an **automatic fallback**. Transient errors (`408/425/429/500/502/503/504`, timeouts, DNS) are **retried with quadratic backoff** before moving to the next provider.
- **Free‑tier capable:** with `LLM_PROVIDER=gemini` + a free AI‑Studio key (Gemini) and a free OpenRouter `:free` key as backup, the app runs at **0 €** (rate‑limited, not billed).

This directly powers the Writer Agent, the AI CV extraction, the learning roadmap, and the Job‑Workspace cover letter.

### 3.3 Job aggregation — `buildAllPlatformSources()`

One source list assembled per search; the **4 free sources always run**, while Adzuna and the Apify scrapers are added **only when their key/token is configured** (so an unset key never wastes a request). Results are merged, **fuzzy‑deduplicated across sources** (`also_on`), then **filtered by domain relevance** (`jobMatchesSector`).

| Source | Auth | Pagination | Notes |
|---|---|---|---|
| Bundesagentur für Arbeit | free | `size=200` | + job‑detail URL built from `referenznummer` |
| Arbeitnow | free | pages 1–5 | keyword‑token pre‑filter |
| LinkedIn (guest) | free | — | bot‑limited |
| Remotive | free | `limit=200` | remote only |
| **Adzuna** *(new)* | free key | pages 1–5 (≤250) | aggregates StepStone/Indeed legitimately |
| **Jooble** *(new)* | free key | pages 1–5 | 140k+ sources |
| **StepStone / Indeed via Apify** *(new)* | paid token | server runs | gated on `APIFY_TOKEN` |

**Domain relevance** (`jobMatchesSector` + `DOMAIN_MATCH_TERMS`): when a sector ≠ *all* is chosen, jobs are kept only if their **title + description** contain domain terms (e.g. cybersecurity: `security, cyber, soc, siem, pentest, threat, iso 27001, informationssicherheit, mitre…`). Live result: a *Cybersecurity* search dropped from **803 → 33 on‑topic jobs**, removing social‑media/marketing noise.

---

## 4. New features — what & how

### 4.1 Writer Agent — AI cover letters (`POST /api/generate-cover`)
- Inputs `{ jobTitle, company, name, skills, cvText, jobDescription }`.
- System prompt grounds the letter in the **candidate's real CV experience** and forces it to **address the job posting's specific requirements**; "use only provided info, do not invent".
- Generous `maxTokens: 4000` so reasoning‑heavy models (e.g. `gemini-2.5-flash`) don't truncate the output. Falls back to a deterministic template when no LLM key is set.

### 4.2 AI CV extraction (`POST /api/extract-profile`)
- Sends the CV text to the LLM with a **strict JSON schema** (contact, location, nationality, languages, title, summary, **experience[]**, **education[]**, **certifications[]**); robust JSON extraction tolerates fenced/extra prose.
- **Fallback:** a dependency‑free **section parser** (`cvSection` + `parseCvEntries`) reads `EXPERIENCE / EDUCATION / CERTIFICATIONS` blocks (`"Role — Org (start – end)"`, location, description) and a contact‑line locator. Works offline; the LLM handles arbitrary formats.
- Result: importing a CV now fills the **entire** structured profile, not just name/email/skills.

### 4.3 232‑skill IT‑Security taxonomy (`security-skills.js`)
- 13 categories (Network, AppSec, Offensive, Blue‑Team/SOC, Cloud, Crypto/PKI, IAM, GRC, DFIR, Malware/RE, OS/Infra, OT/IoT/Mobile, Certifications) + 7 extended security roles with `required` skills. Merged into the legacy 15‑skill base, de‑duplicated by key.

### 4.4 Skill‑gap recommendation engine (`security-learning.js`)
- `LEARNING_RESOURCES` maps each security skill → `{ how, resource }` (named, credible: TryHackMe paths, Splunk Fundamentals, PortSwigger Academy, OWASP, BSI Grundschutz, OSCP…), with a per‑category fallback.
- `recommendGaps(roles, { lookup, topRoles, limit })` returns the gaps **prioritised by how many target roles require each skill** (highest‑leverage first), each with a concrete learning action and the roles it unlocks.

### 4.5 Job Workspace (the integrative feature)
Clicking a **saved** job card opens a modal that orchestrates the existing engines around one offer:
- **Skills‑match %** = coverage of the job's detected skills by the profile (honest: when a posting is too thin to detect skills — e.g. brief Bundesagentur entries — it says so instead of showing a misleading score).
- **Skills to reach 100%** = the job's skills not yet in the profile.
- **🔮 Oracle** = for each gap and each suggested certification: **▶ YouTube**, **Udemy**, **Coursera** links + a "where to learn & practice" row (Udemy, TryHackMe, HackTheBox, Cybrary, PortSwigger).
- **Re‑check match** = recompute after editing the profile.
- **Generate cover letter** = Writer Agent, tailored to *this* job's description + the candidate's experience.
- The save flow now stores the job **description** so the workspace can compute match/gaps later.

### 4.6 Supporting capabilities
- **Email notifications** — **active** via the **Resend HTTP API** (`server/email.js`, zero‑dependency), with an **in‑app recipient field** (no more `prompt()`) and a `mailto:` fallback when no key is set. `POST /api/notify-jobs` sends the ≥70 % matches; `GET /api/ai-status` reports `email:true` once `RESEND_API_KEY` is configured.
- **Advanced profile**: photo, contact, languages, summary, skills (tags), repeatable experience/education/certifications, **Generate‑as‑PDF**.
- **Reverse geocoding** (`/api/reverse-geocode`, Nominatim) so "Use my location" fills a **city name** instead of raw coordinates, with clear permission‑error messaging.

---

## 5. Reliability / UX / security fixes (engineering quality)

| Fix | Why it mattered | How |
|---|---|---|
| **`Cache-Control: no-store`** on all static files | Browsers cached old `app.js`, so fixes appeared "not applied" | header added in `serveStaticFile` |
| **PDF parsing** | v2 of `pdf-parse` is a class, not a callable → garbled fallback | pinned `pdf-parse` v1.x + `async` fix on the parse route |
| **Duplicate applications** | one Save created two cards | dedupe guard (title+company) in `addApplication`, button‑disable, and a `dedupeApps()` self‑heal on render |
| **Kanban drag & drop** | manual ←/→ only | HTML5 DnD: cards are sources, columns are drop targets → status change |
| **Bundesagentur job URLs** | "View job" missing | build `…/jobsuche/jobdetail/<referenznummer>` when no external URL |
| **AI output truncated** (cover letter **and** learning roadmap) | reasoning models (e.g. `gemini-2.5-flash`) spend part of the token budget on internal reasoning | raised `maxTokens` to **4000** on both endpoints (verified: cover letter 281 → 1994 chars; roadmap → 2327 chars, complete) |
| **`.gitignore` was UTF‑16** | git couldn't read it → `.env` was never ignored | rewritten as UTF‑8; secrets confirmed never committed |
| **Workflow‑aligned navigation** | order didn't match the user journey | reordered to *Getting Started → Profile → Job Search → Jobs → Interviews*; removed redundant *Resumes* / *Cover Letters* pages (now done in‑context) |

---

## 6. Tests & quality

- **65 / 65 unit tests pass** (`node test.js`), no external framework.
- Sprint‑1 suite (42) + new **Multi‑Agent Architecture** section (registry exposes 4 separated agents; contract enforcement; Matcher ranking; Writer graceful degradation; pipeline communication via shared context; pipeline failure isolation) + **Skill‑Gap Recommendations** section (`learningFor` mapping + category/DEFAULT fallback; `recommendGaps` prioritisation; Scout output includes recommendations when the recommender is injected).

---

## 7. Privacy / GDPR note (changed surface)

When an LLM key is configured, CV text is sent to the selected provider (Anthropic / **Gemini** / OpenRouter). On Google's **free** tier, prompt data may be used to improve their models. This is now **explicitly disclosed in the in‑app Datenschutzerklärung** (new section *"4b. KI‑Verarbeitung"*: which providers receive the CV/job text, the free‑tier data‑usage warning, and the Resend email path). Without a key, the app degrades to **local‑only** behaviour (template letters, regex CV parsing) — preserving the Sprint‑1 "GDPR by design / 100 % local" baseline as the default.

---

## 8. Tech additions at a glance

| Area | Sprint 1 | Sprint 2 |
|---|---|---|
| Agents | implicit | **explicit, contract‑checked, isolated** (`server/agents.js`, `/api/agents`, `/api/pipeline`) |
| Skill DB | 15 skills, 4 roles | **232 skills, 13 categories, 7 roles** |
| Gap output | score only | **prioritised "learn X — how/where"** (`security-learning.js`) |
| LLM | Anthropic only | **Anthropic / Gemini / OpenRouter / OpenAI** + fallback + retry (free‑tier capable) |
| Job sources | 4 free | **7** (+ Adzuna, Jooble, Apify) + dedup + **domain filter** |
| CV import | regex (basics) | **LLM full extraction** + regex fallback |
| Per‑job | none | **Job Workspace**: match → gaps → Oracle → tailored cover letter |
| Tests | 42 | **65** |

---

### Repository
`https://github.com/Calderon112/cv-skill-advisor`
