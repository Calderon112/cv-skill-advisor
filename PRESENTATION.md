# CyberCareer — Sprint 3 defence

Four questions, seven minutes. Spoken lines are quoted; **Stage** lines are for you.
Every figure was measured against the running system.

| Part | Time |
|---|---|
| 1. The problem & your solution | 1:00 |
| 2. Live demo | 3:30 |
| 3. Architecture & key technical decisions | 1:00 |
| 4. Reflection | 1:00 |
| Buffer | 0:30 |

---

## 1. The problem & your solution — 1:00

### Who this is for

Master's students in IT security, in Germany. I am one of them. I built this for the five things
that cost us the most time, and I built one feature for each.

| The pain | The feature |
|---|---|
| Writing a CV takes hours, and it must be rewritten for every application | **Writer agent** — a tailored CV from your profile and the posting |
| A cover letter for *every single* application | **Writer ⇄ Critic loop** — drafts it, grades it, rewrites it below 80/100 |
| You are rejected and never told *what was missing* | **The Oracle** — reads one posting against your profile and returns a match percentage, your strengths, your gaps and the certifications to aim for |
| Knowing what to improve is not knowing *how* | **Learning plan** — one step per missing skill, with a lab, a course and a video |
| You don't know where you stand, nor how to get where you want | **Career Pathway** — 57 security jobs, the six that hire beginners, and the path between them |
| You get the interview and freeze | **Interview prep** — questions built from the skills the target role actually requires |

Underneath all six sits one idea.

### The idea

> I'm an IT-Security master's student in Gelsenkirchen. Every application costs me hours: a CV to
> rewrite, a cover letter to invent, and a rejection that never tells me what was missing.
>
> And the platforms do not even understand me. They match **strings, not meaning**. I write "log
> correlation" on my CV. The posting says "SIEM". Zero match — the same skill, two vocabularies.
>
> **CyberCareer** reads my CV once, then does the rest: it ranks real German postings by meaning,
> tells me what each one is missing from my profile, writes the letter, and shows me the path from
> where I am to where I want to be.
>
> At its core is **RAG**. My profile and every posting become embeddings, compared by meaning. My CV
> never writes "SIEM", and the SOC posting still comes first — at fifty-one percent — while a
> nursing job scores zero.

**Verified.** Live measurement on a realistic profile against four real postings:
SOC Analyst **51 %**, Penetration Tester **33 %**, Pflegefachkraft **0 %**, Gastronomie **0 %**.
The word "SIEM" appears nowhere in the profile.

**Stage.** Do **not** say "I stopped searching for keywords." Semantic ranking applies to *postings*.
Skill detection is still a substring match — you own that in part 4.

---

## 2. Live demo — 3:30

> ⚠ **Safety brief.** The LLM quota comes and goes. Check it before you walk in:
> `curl -X POST localhost:3000/api/generate-interview -d '{"role":"SOC Analyst"}'` — if it answers
> `"source":"ai"`, the model is up and you may demo the Writer and the Oracle. If it answers
> `"source":"template"`, skip them and lean on the chart, which needs no model.
> Scrape **once**: Arbeitnow rate-limits the second search of a session.

### 2.1 The CV, and three bugs I found in my own code — 0:45

**Stage.** Upload your CV. Show the detected skills. Screenshot: `01-cv-skills.png`.

> Skill detection here is keyword-based — and while preparing this defence I audited it. On a German
> CV that says "DSGVO", it detected **nothing**. On a French CV, it detected the NIST framework,
> because `includes()` finds `n-i-s-t` inside the word "administrateur".
>
> Seventy-five green tests never saw it. My test file contained **its own copy** of the matcher.
> The tests exercised a clone, not the code I ship.

**Stage.** Nobody expects a student to open with their own defects. This buys the jury's trust for
every number that follows.

### 2.2 Seven job boards, one filter that told the truth — 1:00

**Stage.** Search. Domain **All cybersecurity**, location **Germany**. Screenshot: `02-scrape.png`.

> Around five hundred raw postings. Roughly the same after fuzzy cross-source deduplication.
> Seventy or so **relevant**. The number that matters is the last one.
>
> That filter had a real defect. It read a metadata field that Bundesagentur copies from my own
> query onto every result. **The filter was validating its own question.** I found it by scraping
> real jobs — not by re-reading the code.
>
> Now switch the city to Gelsenkirchen. A handful of results. That is not a bug — that is the market.
> My product exists to tell me that.

### 2.3 The Oracle — what this posting is missing from me — 0:30

**Stage.** Open one job card, click the Oracle. **Only if the model is up.** Screenshot: `03-oracle.png`.

> A rejection never tells you why. This does. It reads the posting against my profile and returns a
> match percentage, the strengths I should lead with, the gaps that will sink me, and the
> certification that would close them.
>
> That percentage becomes the single source of truth on the card — it replaces my own keyword score.

### 2.4 The career chart — where I am, and how to get out — 1:00

**Stage.** Open **Career Pathway**. Runs without a model — safe ground.
Screenshots: `04-chart.png`, `05-plan.png`.

> Fifty-seven security jobs on one chart. Six feeder roles that hire beginners with no security
> experience. Seventeen entry-level positions, seventeen mid, seventeen senior.
>
> Click *Software Developer*: six junior roles light up. Click *SOC Analyst Tier 1*: the path traces
> back to where I could start, and up to SOC Lead.
>
> Two things a static chart cannot do. The skills my CV already proves are **ticked in green**. And
> the open-position count is **live from the Bundesagentur**, fetched when I clicked.
>
> The plan does not tell me to learn networking. I know networking. It tells me exactly what is
> missing, with a lab, a course and a video for each.

### 2.5 The outage, on purpose — 0:15

**Stage.** Point at the orange **Outline** badge, or at the interview prep when no model is reachable.

> No model right now. The chart still works. The plan still works. The interview questions are built
> from the skills the role actually requires, and the app **says so** — it does not pretend they were
> tailored by an AI.
>
> Every layer degrades, and every layer admits it.

---

## 3. Architecture & key technical decisions — 1:00

### The workflow

```
[1 CV upload] → [2 Scout] → [3 Seven boards] → [4 Matcher]
 pdf-parse       232-skill    parallel scrape    weighted score
 in memory       taxonomy     fuzzy dedup        skills 45 · role 20 · …
 └──────────── NO MODEL NEEDED — the floor the app never falls below ────────────┘
                                    │
                                    ▼
       [5 RAG re-rank] ──→ [6 LangGraph run] ──→ [7 Outputs]
        3 072-dim           Scout → Matcher       ranked jobs · skill gaps
        calibrated cosine   → Writer ⇄ Critic     cover letter · learning plan
        40 % keyword        Writer retrieves      career chart · interview prep
        + 60 % meaning      context first (RAG)   tracker
                            loop while score < 80
```

### What each layer buys

| Layer | Contributes | Remove it and… |
|---|---|---|
| **Deterministic core** | 232 skills, seven boards in parallel, fuzzy dedup, a six-criterion score you can audit by hand | …there is no product. This is the floor. |
| **RAG** — 0 npm packages | Ranks postings by meaning; grounds the assistant, which returns its sources; feeds the Writer context before it drafts | …ranking falls back to keywords, the assistant can invent a certification, the letter is written from nothing |
| **LangGraph** — 16 of 27 packages, 24 MB | Typed shared state, a conditional edge, the Writer⇄Critic loop, per-node error isolation, a live trace | …a linear chain: no loop, no branch, one failing agent takes the run down |

> Node.js on the native HTTP module. **No framework, no build step.** That is a decision — every
> dependency is something I must defend.
>
> **RAG is load-bearing**: it answers the problem I opened with, for zero dependencies — seventy
> lines and an in-memory cosine. **LangGraph is not.** It powers two routes and pulls sixteen of my
> twenty-seven packages. What it gives me is about forty lines of plain JavaScript. I chose it
> because it makes the orchestration *explicit* — the loop is a declared edge, not a `while` buried
> in a function. I would not defend it as necessary.
>
> And **no vector database**: sixty-five knowledge chunks, a few hundred postings. An in-memory
> cosine answers in milliseconds. A vector DB would have bought nothing but a diagram.
>
> There is **no local model**. Four cloud providers with automatic fallback: Gemini, OpenRouter,
> Anthropic, OpenAI.

---

## 4. Reflection — 1:00

| I believed | What actually happened |
|---|---|
| 75 green tests mean the code works | The suite tested a **copy** of the matcher. The shipped one found nothing on a German CV. |
| A fallback is harmless | The Critic returned the passing score when it crashed. The UI printed "80/100". Nobody had graded anything. |
| A fallback is harmless *(again)* | The interview prep printed six generic HR questions under the heading "Role-specific". |
| Iterate on the schema as you go | Three schema changes while the cache filled — fifty model calls burned for nothing. |

> My biggest learning: **green tests prove nothing about the code you ship.** My test file held its
> own copy of the skill matcher. I now test the module I ship.
>
> My second, and it took me two bugs to see it: **a graceful fallback must never impersonate the
> thing it replaces.** My Critic returned a passing score so its loop would terminate, and the
> interface printed it as a grade. My interview prep printed canned HR questions under the heading
> "Role-specific". Both worked. Both lied. Now one says "not evaluated", the other says "built from
> the required skills of SOC Analyst".
>
> What I would do differently: freeze the data contract **before** generating, not during.
>
> What's next: my skill matcher is still keyword-based. "Log correlation" will never find "SIEM"
> through a synonym table. That belongs to the semantic layer — which I already have, for ranking.
> Extending it to skill detection is the first item on my backlog.

---

## Questions to expect

**Why not React?** My frontend has no build step and ships as one file. A framework would add a
toolchain I would have to defend, without enabling a single feature I need.

**Is LangGraph necessary?** No — and I say so above. RAG is. That distinction is the point.

**Do you run Ollama?** No. Four cloud providers with fallback. A local model would remove the quota
problem and keep CV text off the network — backlog, not code.

**Where do the salary figures come from?** Written by the model, grounded in my 232-skill taxonomy.
They are estimates and the interface never claims otherwise. The job counts are exact and live.

**Did you copy CyberSeek?** I borrowed the shape of the chart. Their data is US-sourced and licensed.
Mine comes from my own taxonomy, targets the German market, is personalised to my CV, and counts
openings that are real today.

---

## Screenshots to capture

| File | What to show |
|---|---|
| `01-cv-skills.png` | Profile page after CV upload, detected skills |
| `02-scrape.png` | Per-platform counts and the *In this domain* tile |
| `03-oracle.png` | One job card with the Oracle's match %, strengths, gaps, certifications |
| `04-chart.png` | Career Pathway, *SOC Analyst (Tier 1)* selected, path lit |
| `05-plan.png` | Learning plan — ticked skills, numbered steps, Lab/Course/Video links |

---

## Pre-flight

- [ ] Server on port 3000 — `Remove-Item Env:PORT; npm start`
- [ ] Hard refresh — `Ctrl` + `F5`
- [ ] Check the model: does `/api/generate-interview` answer `"source":"ai"`?
- [ ] One scrape only, or a minute between them
- [ ] Rehearse the demo once, with a timer

---

Verified while writing: semantic ranking 51 / 33 / 0 / 0 % on a profile that never writes "SIEM";
hybrid relevance = 40 % keyword + 60 % semantic; deterministic weights skills 45 · role 20 ·
location 10 · remote 10 · seniority 10 · salary 5; 57 chart nodes and 63 transitions; 65 knowledge
chunks; 81 passing tests; four LLM providers and no Ollama.
