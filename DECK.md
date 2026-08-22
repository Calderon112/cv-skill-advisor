# CyberCareer — Sprint 3 defence deck

Fourteen slides, seven minutes. Spoken lines are quoted. Lines marked **Stage** are for you.
Every figure was measured against the running system; nothing here is estimated.

| # | Part | Time |
|---|---|---|
| 1–3 | The problem & your solution | 1:00 |
| 4–8 | Live demo | 3:30 |
| 9–12 | Architecture & key technical decisions | 1:00 |
| 13 | Reflection | 1:00 |
| 14 | Reserve — Q&A | — |

---

## Slide 1 — Problem · 0:00–0:35

**Visual.** Two boxes: `"log correlation"` (my CV) and `"SIEM"` (the job ad). A dashed red arrow
between them breaks on a ✕, labelled `KEYWORD MATCH · includes()`. A violet curve loops underneath
and connects them, labelled `EMBEDDINGS · cosine 0.69`.

> I'm an IT-Security master's student in Gelsenkirchen. Looking for a job here means three
> frustrations.
>
> Job platforms match **strings, not meaning**. I write "log correlation" on my CV. The posting
> says "SIEM". Zero match — the same skill, two vocabularies.
>
> A posting rejects me and never tells me **what I am missing**.
>
> And I don't know which jobs exist. I knew "penetration tester" because it sounds exciting. I had
> never heard of an IAM Engineer.

---

## Slide 2 — Solution, measured · 0:35–1:00

**Visual.** Horizontal bar chart of calibrated relevance for one profile against four real postings.

| Posting | Calibrated relevance |
|---|---|
| SOC Analyst | **51 %** |
| Penetration Tester | 33 % |
| Pflegefachkraft | 0 % |
| Mitarbeiter Gastronomie | 0 % |

> **CyberCareer** reads my CV, aggregates real German postings, and tells me where I stand — and
> where I can go.
>
> At its core is **RAG**. My profile and every posting become embeddings, compared by meaning.
> My CV never writes "SIEM", and the SOC posting still comes first — while a nursing job scores zero.
>
> The same layer grounds my career assistant: it answers only from a knowledge base and **returns
> its sources**. No invented certification.

**Stage.** Do **not** say "I stopped searching for keywords." Semantic ranking applies to *postings*.
Skill detection is still a substring match — you own that on slide 13.

---

## Slide 3 — Who it serves

- **The student with no security experience.** Sees the seventeen job families that exist, the seven
  jobs that hire beginners, and the exact skills between them and the first one.
- **The career changer already in IT.** A sysadmin learns that four doors open from where they
  stand, and which two skills sit behind each.
- **Anyone whose CV and the market speak different words.** That is the one problem this system
  actually solves.

Everything else — eleven job boards, the career chart, the cover-letter agent — follows from that.

---

## Slide 4 — Demo safety brief

> ⚠ Read this before you click anything.

- Both free LLM quotas — Gemini and OpenRouter — are spent. **Do not generate a cover letter live**,
  and **do not run the LangGraph pipeline**. The jury would watch an HTTP 429.
- Scrape **once**. Arbeitnow rate-limits the second search of a session and reports zero.
- Read every count **off the screen**. They move between runs.
- The embeddings quota is separate and still works: **semantic ranking is safe to demo**.

---

## Slide 5 — Demo 1/4 · 0:45

**Screenshot.** `01-cv-skills.png` — the Profile page after uploading your CV, detected skills visible.

> Skill detection here is keyword-based — and while preparing this defence I audited it. On a German
> CV that says "DSGVO", it detected **nothing**. On a French CV, it detected the NIST framework,
> because `includes()` finds `n-i-s-t` inside the word "administrateur".
>
> Seventy-five green tests never saw it. My test file contained **its own copy** of the matcher.
> The tests exercised a clone, not the code I ship.

**Stage.** Nobody expects a student to open with their own defects. This buys the jury's trust for
every number that follows.

---

## Slide 6 — Demo 2/4 · 1:00

**Screenshot.** `02-scrape.png` — the per-platform counts and the orange *In this domain* tile.

> Around five hundred raw postings. Roughly the same after fuzzy cross-source deduplication.
> Seventy or so **relevant** to this domain. The number that matters is the last one.
>
> That filter had a real defect. It read a metadata field that Bundesagentur copies from my own
> query onto every result. **The filter was validating its own question.** I found it by scraping
> real jobs — not by re-reading the code.
>
> Now switch the city to Gelsenkirchen. A handful of results. That is not a bug — that is the
> market. My product exists to tell me that.

---

## Slide 7 — Demo 3/4 · 1:30

**Screenshots.** `03-chart.png` — Career Pathway with *SOC Analyst (Tier 1)* selected, path lit.
`04-plan.png` — the learning plan, ticked skills and numbered steps with Lab / Course / Video links.

> Fifty-eight security jobs on one chart. Seven feeder roles that hire beginners with no security
> experience. Seventeen entry-level positions, seventeen mid, seventeen senior.
>
> Two things a static chart cannot do. The skills my CV already proves are **ticked in green**.
> And the open-position count is **live from the Bundesagentur**, fetched when I clicked — not a
> twelve-month-old American average.
>
> The plan does not tell me to learn networking. I know networking. It tells me exactly what is
> missing, with a lab, a course and a video for each.

---

## Slide 8 — Demo 4/4 · 0:15

**Screenshot.** `05-degraded.png` — a domain still carrying the orange **Outline** badge.

> No model is reachable right now — my free quota is spent. The chart still works. The plan still
> works, built from my own learning taxonomy. The application **says so**, and degrades. It never
> pretends.

---

## Slide 9 — Workflow: from a PDF to a cover letter

**Visual.** A seven-step pipeline, colour-coded by the layer that powers each step.
Green = deterministic (no model). Violet = RAG. Amber = LangGraph.

```
[1 CV upload] → [2 Scout] → [3 Seven boards] → [4 Matcher]
 pdf-parse       232-skill    parallel scrape    weighted score
 in memory       taxonomy     fuzzy dedup        skills 45 · role 20
 └──────────────── NO MODEL NEEDED — the floor the app never falls below ─────────────┘
                                     │
                                     ▼
        [5 RAG re-rank] ──→ [6 LangGraph run] ──→ [7 Outputs]
         3 072-dim            Scout → Matcher       ranked jobs · skill gaps
         calibrated cosine    → Writer ⇄ Critic     cover letter · learning plan
         40 % keyword         Writer retrieves      career chart · tracker
         + 60 % meaning       context first (RAG)
                              loop while score < 80
```

> The first four steps use no model at all: a taxonomy of 232 skills, seven scrapers in parallel,
> fuzzy de-duplication, and a weighted score — skills forty-five points, role twenty, then location,
> remote, seniority, salary.
>
> **RAG enters at step five.** The final relevance is forty percent keyword and sixty percent
> meaning. That mix is why a posting can rank high without sharing a single word with my CV.
>
> **LangGraph enters at step six**, only when I ask for a letter. It holds the shared state, decides
> whether a letter is even needed, and runs the Writer against the Critic until the letter clears
> the bar.

---

## Slide 10 — Architecture · 0:00–0:30

**Visual.** Browser (vanilla JS, no build) → Node server on the native `http` module, containing
four agents, LangGraph, RAG and seven scrapers, all sitting on a multi-provider LLM client with
fallback and retry → Gemini · OpenRouter · Anthropic · OpenAI, and the job boards.

> Node.js on the native HTTP module. **No framework, no build step.** Vanilla JavaScript on the
> front. That is a decision, not laziness — every dependency is something I must defend.
>
> **No vector database.** Sixty-five knowledge chunks and a few hundred postings: an in-memory
> cosine is the right tool. A vector DB would have been engineering theatre.

**Stage.** There is **no Ollama** in this system. Four cloud providers, nothing local. Do not claim
otherwise — the answer is on slide 14.

---

## Slide 11 — Architecture: the state graph · 0:30–1:00

**Visual.**

```
START → Scout → Matcher ──(a job?)──no──→ END
                   │yes
                   ▼
                Writer ⇄ Critic        Critic → Writer while score < 80, max 2 revisions
                   │                   Critic → END otherwise
                   ▼
                  END
```

> Four agents — Scout, Matcher, Writer, Critic — orchestrated as a **LangGraph state graph**. Not a
> linear pipeline, because a chain cannot express conditional routing — no job, no letter — nor a
> **self-improvement loop**: the Critic grades the letter against a rubric, and below eighty the
> graph sends it back to the Writer, at most twice.
>
> **RAG appears three times.** Semantic job ranking with 3,072-dimensional embeddings and a
> calibrated cosine. An assistant grounded in sixty-five knowledge chunks, returning its sources.
> And inside the graph: the Writer retrieves context *before* it writes, so the letter is anchored
> rather than invented.
>
> Every layer degrades. No key, and the app falls back to deterministic templates. Eighty-one unit
> tests. Containerised with Docker.

---

## Slide 12 — What each layer buys

| Layer | What it contributes | Remove it and… |
|---|---|---|
| **Deterministic core**<br>taxonomy · scorer · scrapers | 232 skills, eleven job boards in parallel, fuzzy cross-source dedup, a transparent six-criterion score you can audit by hand. | …there is no product. This is the floor. |
| **RAG**<br>embeddings · cosine · 65 chunks | **1.** Ranks postings by meaning — SOC 51 % for a CV that never writes "SIEM". **2.** Grounds the assistant, which returns its sources. **3.** Feeds the Writer context before it drafts. | …ranking falls back to keywords, the assistant can hallucinate a certification, and the letter is written from nothing. |
| **LangGraph**<br>state · edges · loop | Typed shared state, conditional routing (no job → no letter), a Writer⇄Critic self-improvement loop, per-node error isolation, a live trace streamed to the UI. | …a linear chain: no loop, no branch, and one failing agent takes the whole run down. |

> Each layer earns its place. The deterministic core is the floor the application never falls below.
> **RAG buys meaning** — ranking, grounding, and the context the Writer needs. **LangGraph buys
> control** — a loop, a branch, and the guarantee that one broken agent does not take the run with it.
>
> That is also why **there is no vector database**. Sixty-five chunks and a few hundred postings: an
> in-memory cosine answers in milliseconds. Adding one would have bought nothing but a diagram.

**Stage.** If a juror asks what LangGraph really adds: point at the loop. A chain can call four
functions in order. It cannot send the letter back to the Writer because a judge scored it 63,
twice, and then stop.

---

## Slide 13 — Reflection · 1:00

| Belief before | What actually happened |
|---|---|
| 75 green tests mean the code works | The suite tested a *copy* of the matcher. The shipped one found nothing on a German CV. |
| A fallback is harmless | My Critic returned the passing score when it crashed. The UI printed "80/100". Nobody had graded anything. |
| Iterate on the schema as you go | Three schema changes while the cache filled — fifty model calls burned for nothing. |

> My biggest learning: **green tests prove nothing about the code you ship**. My test file held its
> own copy of the skill matcher. I now test the module I ship.
>
> My second: honesty must be built in. When my Critic could not run, its fallback returned the
> passing score so the loop would terminate — and my interface displayed it as a grade. **The system
> reported a quality nobody had measured.** It now says "not evaluated".
>
> What I would do differently: freeze the data contract **before** generating, not during.
>
> What's next: my skill matcher is still keyword-based. "Log correlation" will never find "SIEM"
> through a synonym table. That belongs to the semantic layer — which I already have, for job
> ranking. Extending it to skill detection is the first item on my backlog.

---

## Note on numbers used in this deck

Two reviewers independently found the same defect: the slide count of job
platforms disagreed with the README, which disagreed with the live interface. For
a pitch whose argument is that every figure can be checked, that is the worst
possible inconsistency, and it is the kind people notice.

The count is conditional, so state the condition:

> **Eight sources run with no API key configured. Eleven when every optional key
> is set** — Jooble, Adzuna and the Apify-backed Indeed each need their own.

Say "eleven" on a slide only where the deployment being demonstrated actually has
those keys. Otherwise say eight.

The same discipline applies to the security slide. "Enterprise-grade security by
default" invites a question it cannot survive, and this project's own README is
more honest than that phrase: no refresh-token rotation, rate limits held in
process memory, PostgreSQL unreplicated. Name what is actually there instead —
each of these is verifiable in the repository during Q&A:

- OIDC with PKCE (S256), single-use state, nonce validated
- CSP without `unsafe-inline`; static files served from an allow-list
- Containers run `read_only`, `cap_drop: ALL`, `no-new-privileges`
- No password stored by this application; identity is delegated entirely

Specific claims hold up under questioning. Superlatives do not.

---

## Slide 14 — Reserve · Q&A

**Why not React?**
My frontend has no build step and ships as one file. A framework would add a toolchain I would have
to defend, without enabling a single feature I need.

**Do you run a local model — Ollama?**
No. Four cloud providers with automatic fallback: Gemini, OpenRouter, Anthropic, OpenAI. A local
model would remove the quota problem and keep CV text off the network — that is on the backlog, not
in the code.

**Where do the salary figures come from?**
Written by the model, grounded in my own 232-skill taxonomy. They are estimates and the interface
never claims otherwise. The job counts, by contrast, are exact and live.

**Did you copy CyberSeek?**
I borrowed the shape of the chart. Their data is US-sourced and licensed. Mine comes from my own
taxonomy, targets the German market, is personalised to my CV, and counts openings that are real
today.

---

## Screenshots to capture

| File | What to show |
|---|---|
| `01-cv-skills.png` | Profile page after CV upload, detected skills |
| `02-scrape.png` | Per-platform counts and the *In this domain* tile |
| `03-chart.png` | Career Pathway, *SOC Analyst (Tier 1)* selected, path lit |
| `04-plan.png` | Learning plan open — ticked skills, numbered steps, Lab/Course/Video links |
| `05-degraded.png` | A domain carrying the orange **Outline** badge |

---

## Pre-flight, ten minutes before

- [ ] Server on port 3000 — `Remove-Item Env:PORT; npm start`
- [ ] Hard refresh the browser — `Ctrl` + `F5`
- [ ] One scrape only, or wait a minute between them
- [ ] Open Career Pathway and click one role, so the first load is warm
- [ ] Rehearse the four demo moves once, with a timer

---

Verified against the running system while writing: semantic ranking 51 / 33 / 0 / 0 % on a profile
that never writes "SIEM"; hybrid relevance = 40 % keyword + 60 % semantic; deterministic score
weights skills 45 · role 20 · location 10 · remote 10 · seniority 10 · salary 5; 58 chart nodes and
64 transitions; 65 knowledge chunks; 81 passing tests; four LLM providers and no Ollama.
Scrape counts and job counts move between runs — read them off the screen.
