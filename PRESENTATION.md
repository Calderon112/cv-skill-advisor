# CyberCareer — Presentation script

Sprint 3 · Westfälische Hochschule, Gelsenkirchen

Four questions, 6 min 30 total. Spoken lines are in English. Lines marked **Stage** are
directions for you, not for the audience.

| # | Part | Time |
|---|---|---|
| 1 | The problem & your solution | 1:00 |
| 2 | Live demo | 3:30 |
| 3 | Architecture & key technical decisions | 1:00 |
| 4 | Reflection | 1:00 |

---

## 1. The problem & your solution — 1:00

> I'm an IT-Security master's student in Gelsenkirchen. Looking for a job here means three
> frustrations.
>
> First, job platforms match **strings, not meaning**. I write "log correlation" on my CV.
> The posting says "SIEM". Zero match — same skill, two vocabularies.
>
> Second, a posting rejects me but never tells me **what I am missing**.
>
> Third, I don't know which jobs exist. I knew "penetration tester" because it sounds exciting.
> I had never heard of an IAM Engineer.
>
> **CyberCareer** is a multi-agent system. It reads my CV, aggregates real German job postings,
> and tells me where I stand — and where I can go.
>
> At its core is **RAG**. My profile and every posting become embeddings and are compared by
> meaning. My CV says "log correlation" and never says "SIEM" — and the SOC posting still comes
> out on top, at fifty-one percent, while a nursing job scores zero.
>
> The same layer grounds my career assistant: it answers only from a knowledge base and
> **returns its sources** with every answer. No invented certification.

**Stage.** Say "log correlation → SIEM" slowly. It carries the whole minute.
Do not name LangGraph, the Critic or cosine calibration yet — those answer question 3.

**Verified.** Real measurement against the running system, on a realistic profile and four
postings: SOC 51%, penetration tester 33%, Pflegefachkraft 0%, Gastronomie 0%. The word "SIEM"
appears nowhere in the profile.

**Do not say** "I stopped searching for keywords." It would be false. Semantic ranking applies
to **job postings**. **Skill detection is still keyword-based** — that is the honest limit, and
you own it in part 4.

---

## 2. Live demo — 3:30

> ⚠ **Before you start.** Both free LLM quotas — Gemini and OpenRouter — are spent. Do **not**
> generate a cover letter live; the jury will watch an HTTP 429. Build the demo on what runs
> without a model, and turn the outage into the closing argument.

### 2.1 The CV, and three bugs I found in my own code — 0:45

**Stage.** Upload your CV. Show the detected skills.

> Skill detection here is keyword-based — and while preparing this defence I audited it. On a
> German CV that says "DSGVO", it detected **nothing**. On a French CV, it detected the NIST
> framework — because `includes()` finds `n-i-s-t` inside the word "administrateur".
>
> Seventy-five green tests never saw it. My test file contained **its own copy** of the matcher.
> The tests exercised a clone, not the code I ship.

**Stage.** Nobody expects a student to open with their own defects. This is your strongest
thirty seconds.

### 2.2 Seven job boards, in parallel — 1:00

**Stage.** Search. Domain **All cybersecurity**, location **Germany**. About 4 seconds.

> Around five hundred raw postings. Roughly the same after fuzzy cross-source deduplication.
> Seventy or so relevant to this domain. The number that matters is the last one.
>
> And that filter had a real defect. It read a metadata field that Bundesagentur copies from my
> own query onto every result. **The filter was validating its own question.** I found it by
> scraping real jobs — not by re-reading the code.

**Stage.** Read the three figures **off the screen**, not from this page. They move with every
run — 534 / 493 / 71 was one measurement, not a constant.

**Stage.** Switch the location to Gelsenkirchen. A handful of results.

> This is my city. That is not a bug — that is the market. My product exists to tell me that.

### 2.3 The career chart — 1:30

**Stage.** Open **Career Pathway**. It runs entirely without a model — safe ground.

> Fifty-seven security jobs on one chart. Six feeder roles that hire beginners with no security
> experience. Seventeen entry-level positions, seventeen mid, seventeen senior.

**Stage.** Click **Software Developer** → six junior roles light up.
Click **SOC Analyst (Tier 1)** → the path traces back to the feeder roles and up to SOC Lead.

> Two things a static chart cannot do. The skills my CV already proves are **ticked in green**.
> And that number of open positions is **live from the Bundesagentur**, fetched when I clicked —
> not a twelve-month-old American average.

**Stage.** Click **Build my learning plan**.

> It does not tell me to learn networking. I know networking. It tells me exactly what is
> missing — for this role, DHCP and VLAN — with a lab, a course and a video for each, and an
> estimate in weeks.

**Stage.** Read the number of weeks off the screen. It depends on the role you clicked.

### 2.4 The outage, on purpose — 0:15

**Stage.** Point at the orange **Outline** badge.

> No model is reachable right now — my free quota is spent. The chart still works. The plan
> still works, built from my own learning taxonomy. The application **says so**, and degrades.
> It never pretends.

**Why this ordering.** You open by exposing your own bugs, so the jury trusts every number that
follows. You close on graceful degradation, which turns the one thing that could embarrass you
into a design principle.

---

## 3. Architecture & key technical decisions — 1:00

> Node.js on the native HTTP module. **No framework, no build step.** Vanilla JavaScript on the
> front. That is a decision, not laziness — every dependency is something I have to defend.
>
> Four agents — Scout, Matcher, Writer, Critic — orchestrated as a **LangGraph state graph**.
> Not a linear pipeline, because a chain cannot express the two things I needed: conditional
> routing — no job, no letter — and a **self-improvement loop**. The Writer drafts a cover
> letter, the Critic grades it out of a hundred against a rubric, and below eighty the graph
> sends it back to the Writer, at most twice.
>
> **RAG, three times.** Semantic job ranking with 3,072-dimensional embeddings and a calibrated
> cosine. An assistant grounded in a knowledge base, returning its sources. And inside the graph:
> the Writer retrieves context before it writes, so the letter is anchored rather than invented.
>
> **No vector database.** Seventy knowledge chunks, a few hundred postings — an in-memory cosine
> is the right tool. A vector DB would have been engineering theatre.
>
> Every layer degrades. No key, and the app falls back to deterministic templates.
> Eighty-one unit tests, no framework. Containerised with Docker.

**Stage.** If you overrun, cut the vector-database sentence. Keep "no framework" and the
Writer⇄Critic loop.

---

## 4. Reflection — 1:00

> My biggest learning: **green tests prove nothing about the code you ship**. My test file held
> its own copy of the skill matcher. Seventy-five tests passed for three sprints while the real
> matcher missed every German CV and hallucinated NIST from the word "administrator". I now test
> the module I ship.
>
> My second learning is about honesty in AI systems. When my Critic agent could not run — a rate
> limit — its fallback returned the passing score so the loop would terminate. My interface
> displayed that as "Critic 80 out of 100". **The system was reporting a quality nobody had
> measured.** I separated the bookkeeping value from the judgement. It now says "not evaluated".
>
> What I would do differently: I changed the data schema three times **while** the cache was
> filling, and burned fifty model calls for nothing. Freeze the contract, then generate.
>
> What's next: my skill matcher is still keyword-based. "Log correlation" will never find "SIEM"
> through a synonym table, however long. That belongs to the semantic layer — which I already
> have, for job ranking. Extending it to skill detection is the first item on my backlog.

---

## Questions to expect

**Why not React?**
Because my frontend has no build step and ships as one file. A framework would add a toolchain I
would have to defend, without enabling a single feature I need.

**Where do the salary figures come from?**
Written by the model, grounded in my own taxonomy. They are estimates and the interface never
claims otherwise. The job counts, by contrast, are live and exact — one call to the Bundesagentur
API.

**Did you copy CyberSeek?**
I borrowed the shape of the chart. Their data is US-sourced and licensed. Mine comes from my own
232-skill taxonomy, targets the German market, is personalised to my CV, and counts openings that
are real today.

**Why is `ALLOW_INSECURE_TLS=1` in your console?**
My network intercepts TLS. It is documented as development-only, and the server prints that
warning on every start precisely so it is never forgotten in production.

---

## Pre-flight, ten minutes before

- [ ] Server on port 3000 — `Remove-Item Env:PORT; npm start`
- [ ] Hard refresh the browser — `Ctrl` + `F5`
- [ ] One scrape only, or wait a minute between them — Arbeitnow rate-limits the second
- [ ] Open Career Pathway and click one role, so the first load is already warm
- [ ] Rehearse the four moves once, with a timer

---

Figures verified against the running system on the day of writing: 57 chart nodes, 63 transitions,
81 passing tests, and a semantic ranking of 51% / 33% / 0% / 0% for SOC, pentest, nursing and
catering against a profile that never says "SIEM". Scrape counts and job counts move between runs —
read them off the screen.
