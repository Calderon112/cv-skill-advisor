# AI-Assisted Job Application Agent for IT Security

An **LLM-based job-application assistant** that reads a candidate's CV, searches ten
German and international job portals at once, scores every posting against the
profile with a published formula, and drafts a cover letter through a multi-agent
pipeline in which one agent grades another's output before the user ever sees it.

**Live application:** <https://careerai-jk.duckdns.org>
**Project website:** <https://calderon112.github.io/cv-skill-advisor/>

Final-year project, Westfälische Hochschule Gelsenkirchen.

---

## Demo

<!-- ─────────────────────────────────────────────────────────────────────────
     TO ADD THE VIDEO — two options, both work on GitHub.

     1. Hosted by GitHub (best: a real player, no third party)
        Edit this file on github.com, drag the .mp4 into the editor, and GitHub
        replaces it with a https://github.com/user-attachments/assets/... URL.
        Leave that URL ALONE ON ITS OWN LINE. Do not wrap it in link syntax —
        a bare URL is what becomes a player. Limit: 100 MB.

     2. YouTube, if the file is too large. GitHub will not embed the player:
        [![Watch the demo](docs/video-thumbnail.png)](https://youtu.be/YOUR_ID)

     Neither <video> nor <iframe> survives: GitHub strips both when rendering.
     ───────────────────────────────────────────────────────────────────────── -->

*Two minutes, from an empty profile to a finished application. Video coming shortly —
in the meantime the app is live at <https://careerai-jk.duckdns.org>.*

---

## 1. Project overview

### Problem statement

Applying for a security job in Germany means repeating the same work for every
posting. Candidates must:

- **Search a dozen portals separately** — Bundesagentur, StepStone, LinkedIn, Xing,
  and the remote boards each hold different vacancies with no common interface.
- **Guess whether they qualify.** A posting lists twenty requirements and gives no
  indication which of them the reader already meets, or which single missing skill
  is the one keeping them out.
- **Rewrite the CV and the cover letter every time**, because a generic application
  is discarded and a tailored one costs an hour.

The result is a slow, repetitive process in which the effort goes into logistics
rather than into the applications themselves.

### Motivation

A Large Language Model can read a posting the way a person does. It does not merely
detect the keyword "Splunk" in a CV — it can judge whether the described experience
actually answers the requirement, explain the gap in plain language, and write a
letter that cites concrete evidence from the candidate's own history.

The difficulty is that a model will produce a fluent letter whether or not it has
anything to say. The design question is therefore not "can a model write this" but
"how do we know the output is worth sending".

### Project goal

A deployed web application that:

1. Extracts a structured profile from an uploaded CV, including scanned PDFs
2. Searches every configured job source in parallel and merges duplicates across them
3. Scores every posting against the profile with a deterministic, published formula
4. Names the specific skills missing for each posting
5. Writes a cover letter and has a second agent grade it before delivery
6. Measures salary bands from real postings, and says so plainly when it cannot
7. Delegates identity to an external provider so no password is held locally

### Solution approach

The system combines **agentic AI** with a verification strategy at every point where
a model's output would otherwise be taken on trust:

- A **LangGraph pipeline** of four agents writes the cover letter. A Critic scores
  each draft out of 100 against the actual posting and returns specific objections
  until the draft clears a quality bar.
- A **deterministic scoring engine** produces the match percentage. The weighting is
  fixed and published, so the same CV and posting always yield the same number and
  it can be checked by hand. The model is used to re-rank, never to invent the score.
- **Salary figures are measured, not estimated.** Where too few postings state pay to
  compute anything honest, the interface says so rather than showing a plausible
  number in the same typeface as a measured one.

---

## 2. Main features

### CV import and profile

A PDF is uploaded and skills, experience, education and photograph are extracted
automatically. Scans without a text layer go through OCR. Manual entry is available
for anyone who prefers it, and the finished profile exports back to a formatted PDF
suitable for sending.

### Multi-platform job search

Eight sources are queried in parallel and merged with no API key configured; three more join when their optional keys are set, for eleven in total. Filters cover region, city, radius,
sector and keywords, with geolocation for "near me". A typical search returns
results in about five seconds.

Duplicates are merged across sources using Sørensen-Dice similarity on title and
company, which absorbs the "(m/w/d)" suffixes and GmbH/AG variants that make the
same vacancy look like three. The card records where else the posting appeared.

### Match scoring

Every job card carries a percentage produced by a fixed weighting — skills 45%, role
20%, location 10%, remote 10%, seniority 10%, pay 5%. Vector embeddings then
re-rank the shortlist by meaning, so a CV that says "Ethical Hacking" still matches
a "Penetration Tester" posting.

Each card lists the skills the candidate is missing for that specific job.

### Deep analysis of a single posting (the Oracle)

For any saved job, an LLM reads the full posting against the full profile and
returns strengths, gaps, relevant certifications and advice. Once a posting has been
analysed this way, that assessment becomes the one shown on its card.

### Cover letter generation (LangGraph agent pipeline)

Four agents in sequence, with a loop:

- **Scout** — reads the CV and extracts the evidence available
- **Matcher** — establishes what the posting actually requires
- **Writer** — drafts the letter from profile, CV text and retrieved context
- **Critic** — scores the draft out of 100 against the posting and returns objections

The Writer revises until the draft clears the bar or the revision limit is reached.
The final score and the number of revisions are both displayed, so a weak letter is
visible rather than quietly handed over.

#### Which agents reason, and which do not

Each agent runs a deterministic core first, and only Scout, Matcher and the two
letter agents deliberate on top of it. The split is a design decision, not an
omission:

| Agent | Deterministic core | Deliberation |
|---|---|---|
| Scout | Skill lookup over the 246-entry taxonomy | Proposes skills the CV *demonstrates* without naming them |
| Matcher | Published score formula (skills 45 / role 20 / location 10 / remote 10 / seniority 10 / pay 5) | Decides eligibility — hard blockers the weights cannot express |
| Writer | — | Drafts and revises against the Critic's objections |
| Critic | — | Scores the draft, decides whether it goes back |

The match score itself is never produced by a model. An applicant must be able to
ask why a posting scored 72 and get the same answer tomorrow; a model deciding that
number would make it irreproducible and unexplainable. The model is used where
variability is useful and verifiable, not where it destroys an explanation.

Both deliberative passes are constrained by a guard that runs on their output:

- A skill Scout infers is accepted only if its quoted evidence appears **verbatim**
  in the CV, and only if the key exists in the taxonomy. Measured against the
  production model, this rejects real overreach: asked to read a CV describing a
  pfSense home lab, the model proposed `firewall` with a paraphrased quote and the
  guard threw it out. The bias is deliberate — losing a true skill costs less than
  putting an invented qualification into a letter the applicant has to defend.
- A `blocked` verdict from Matcher is discarded unless it cites the requirement it
  relies on. On two postings scoring an identical 0.82, the senior role was blocked
  on three quoted requirements (eight years' experience, a completed degree, C1
  German) and the Werkstudent role passed, its "wünschenswert" items correctly read
  as non-binding.

Without an API key, both passes return nothing and the agents fall back to their
deterministic results. No feature disappears; the reasoning does.

Language (auto/English/German), tone and length are selectable. A pre-composed
application email opens directly in Gmail.

### Career pathway

Per domain, the ladder from entry to senior roles with the skills and certifications
expected at each stage, a live count of open positions from the official
Bundesagentur API, and a salary band measured from real postings where the data
allows it.

### Skill-gap analysis and learning plan

What is missing for a target role, with concrete resources rather than generic
advice: TryHackMe, HackTheBox, SANS, Coursera, MITRE ATT&CK, OWASP, Splunk.

### Application tracker

A kanban board from saved through to offer, with drag and drop, status history and a
conversion funnel. Documents generated for a posting are stored alongside it and
survive a page refresh.

### Interview preparation

Questions generated from the specific posting and the candidate's own profile,
rather than a generic list.

### CareerBot

A chat assistant grounded in the product documentation through retrieval, so it
answers questions about the product instead of improvising.

### Market report

Aggregates the postings found into skill demand, locations, remote share and salary
statistics, with an LLM summary.

### Identity and account management

Sign-in is delegated to an OpenID Connect provider, which itself brokers Google,
GitHub and others. An account page lists linked providers and active sessions, each
revocable individually. Feedback is collected anonymously by construction.

---

## 3. Technologies used

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 22.5+ | Language and runtime |
| **HTTP (built-in)** | — | REST API, no web framework |
| **LangGraph** | 1.4 | Agent pipeline orchestration |
| **LangChain Core** | 1.2 | Agent primitives |
| **PostgreSQL** | 16 | Production storage |
| **lowdb** | 6.0 | Local development storage |
| **pdf-parse** | 1.1 | PDF text extraction |
| **node:crypto (scrypt)** | built-in | Password hashing |

No web framework is used. The server is the Node `http` module with a routing chain,
which keeps the dependency surface small for a security-focused project.

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Vanilla JavaScript** | ES2022 | Application logic, no framework |
| **HTML / CSS** | — | Interface, no build step |
| **jsPDF** | 2.5.1 | Client-side PDF generation |
| **Tesseract.js** | on demand | OCR for image-only CVs |

There is no build pipeline. The interface is served as plain files, which means the
source in the repository is exactly what runs in the browser.

### Identity and infrastructure

| Technology | Version | Purpose |
|---|---|---|
| **Keycloak** | 26.0 | Identity provider, brokers Google/GitHub |
| **Caddy** | 2 | TLS termination, automatic certificates |
| **Docker Compose** | v2 | Local and production orchestration |
| **PostgreSQL** | 16 | Keycloak and application databases, separate roles |

### LLM

| Item | Value |
|---|---|
| **Providers supported** | GWDG Chat AI, Anthropic, Google Gemini, OpenRouter, OpenAI |
| **Selection** | GWDG first when configured, then the rest; forced with `LLM_PROVIDER` |
| **Fallback** | Without any key every AI feature degrades to a deterministic template |
| **Embeddings** | Gemini or OpenAI, cached on disk |
| **Authentication** | Environment variable, never committed |

### Job sources

| Source | Access | Description coverage |
|---|---|---|
| **Bundesagentur für Arbeit** | Official REST API | Full text via the detail endpoint |
| **Adzuna** | Official API, key | Full text |
| **Careerjet** | Affiliate API | Snippets, 116–300 characters |
| **Jobicy** | Public API, no key | Full text |
| **Remotive** | Public API, no key | Full text |
| **Arbeitnow** | Public API, no key | Full text |
| **Jooble** | Official API, key | Full text |
| **LinkedIn** | Undocumented guest endpoint | None |
| **StepStone** | HTML parsing | None |
| **Xing** | HTML parsing | None |

The last three are fragile by nature and are documented as such in section 12.

---

## 4. Architecture

### Backend

A **Node.js HTTP server** with a deliberately flat structure: a routing chain in
`server.js` delegating to focused modules under `server/`.

```
Request → http-guards → route → module → (LLM / job sources / storage)
```

Every cross-cutting concern passes through one place before any route sees the
request: authentication, rate limiting, body size, the static allow-list and the
response headers. This is deliberate — a guard living inside a route body is a guard
nobody can audit, which is how an endpoint stays open by accident.

### Frontend

A single-page application in plain JavaScript, with no framework and no build step.
Navigation switches sections in the DOM; the URL does not change.

```
Getting Started   Professional Profile   Job Search   Career Pathway
Jobs (kanban)     Interviews             My Account   Feedback   Admin
```

### LLM agent pipeline (LangGraph)

```
DeepAgentService
  └── StateGraph
        ├── Scout    → reads CV, extracts available evidence
        ├── Matcher  → establishes the posting's real requirements
        ├── Writer   → drafts the letter
        └── Critic   → scores it, returns objections
              └── loops back to Writer until the bar is met
```

The graph decides its own path. When a source returns a pointer rather than a
description — "Full description on LinkedIn" — that text is treated as absent, so
the Critic does not grade a letter against a sentence containing no requirements.

### Search flow

```
Search request
    ↓
buildAllPlatformSources  (only sources whose key is configured)
    ↓
Every configured source is queried in parallel, each isolated: one failure shrinks the
sample, it never fails the search
    ↓
Bundesagentur enrichment  (detail endpoint: real description, title, salary)
    ↓
Cross-source deduplication  (Sørensen-Dice on title + company)
    ↓
Sector filter  (synonym table, with physical-security exclusions)
    ↓
Deterministic scoring + semantic re-ranking
    ↓
Ranked results, each naming its missing skills
```

### Cover letter flow

```
User opens a saved job
    ↓
Job description enriched if it was only a pointer
    ↓
Scout → Matcher → Writer ⇄ Critic  (LangGraph)
    ↓
Letter + score + revision count
    ↓
Application email composed in the letter's language
    ↓
Stored on the application, surviving a refresh
```

### Production deployment

```
                    ┌──────────────── AWS EC2 ────────────────┐
  browser ──443──►  │  Caddy  ──►  CareerAI (Node)            │
                    │    │    ──►  Keycloak  ──►  PostgreSQL  │
                    │    └── Let's Encrypt, auto-renewed      │
                    └─────────────────────────────────────────┘
```

Only Caddy publishes a port. The application and Keycloak are reachable solely on
the internal Docker network, so nobody can bypass TLS by connecting to :3000.

---

## 5. Project flow

### Job search

1. User selects region, city, radius, sector and keywords
2. Backend queries every configured source in parallel, each with its own timeout
3. Bundesagentur results are enriched from the official detail endpoint — the
   search response returns a catalogue entry with no description
4. Results are deduplicated across sources; the card records where else it appeared
5. The sector filter keeps postings whose title or description matches the domain
6. Each posting is scored against the profile, then re-ranked semantically
7. Results are displayed with per-source counts and the two figures that reduce them

### Cover letter generation

1. User opens a saved job and clicks **Generate cover letter**
2. If the description is only a pointer, the full posting is fetched first
3. The LangGraph pipeline runs: Scout, Matcher, Writer, Critic
4. The Critic scores the draft and returns objections; the Writer revises
5. The loop ends when the bar is cleared or the revision limit is reached
6. The letter, its score and the revision count are displayed together
7. An application email is composed in the same language the letter was written in

### Sign-in

1. User clicks the sign-in button
2. The application redirects to the identity provider with PKCE (S256)
3. The provider authenticates — with its own form, or via Google or GitHub
4. The provider redirects back with an authorization code
5. The backend exchanges the code for tokens over TLS and reads `/userinfo`
6. A local account is found by subject, attached by confirmed email, or created
7. A session token is returned in the URL fragment, consumed and scrubbed

### Auto-fix of the deployment (production update)

1. Take a backup: `sudo /usr/local/bin/backup-careerai.sh`
2. `git pull`
3. `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`
4. Compose recreates only what changed; Keycloak and PostgreSQL are untouched

---

## 6. Prerequisites

| Component | Minimum version | Note |
|---|---|---|
| **Node.js** | 22.5 | Required for the SQLite and PostgreSQL backends |
| **npm** | 9+ | Included with Node.js |
| **Docker Desktop** | any | For the containerised run and for Keycloak |
| **Docker Compose** | v2 | `docker compose`, not `docker-compose` |
| **An LLM API key** | optional | Without one, AI features fall back to templates |

> **Without any API key** the application starts and every feature remains usable.
> Cover letters, CV rewriting and the chat degrade to deterministic templates rather
> than failing. Google Gemini has a free tier and needs no credit card.

---

## 7. Installation

### With Docker Compose

```bash
git clone https://github.com/Calderon112/cv-skill-advisor.git
cd cv-skill-advisor
cp .env.example .env          # required; the file may stay empty
docker compose up --build
```

The application is then reachable at `http://localhost:3000`. A local demo account
is seeded: `student` / `security`.

### With Node.js

```bash
git clone https://github.com/Calderon112/cv-skill-advisor.git
cd cv-skill-advisor
npm install
cp .env.example .env
npm start
```

### With single sign-on

To run the identity stack, which brokers Google and GitHub:

```bash
docker compose --profile identity up keycloak
```

Name the service. A bare `--profile identity up` also starts the application
container, which collides with `npm start` on port 3000 — profiles add services,
they do not restrict to them. Realm and client setup is in
[docs/IDENTITY.md](docs/IDENTITY.md).

### Configuration

Every value in `.env` is optional. The most useful ones:

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Free tier, no card. Enables every AI feature |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | Best-performing job source |
| `CAREERJET_AFFID` | Largest German volume |
| `PUBLIC_BASE_URL` | Public URL; the OIDC redirect URI derives from it |
| `AUTH_MODE` | `both` (default) or `oidc-only` to disable local passwords |
| `ADMIN_USERS` | Comma-separated usernames granted the admin page |
| `STORAGE_BACKEND` | `json` (default) or `postgres` |

See [.env.example](.env.example) for the complete list with explanations.

---

## 8. Usage

### Step 1: Start the application

```bash
docker compose up --build      # or: npm start
```

Open `http://localhost:3000`.

### Step 2: Build the profile

Go to **Professional Profile**. Either drop a CV as PDF, which extracts skills,
experience, education and photograph automatically, or fill the form manually. A
scanned CV without a text layer is passed through OCR.

### Step 3: Search for jobs

Go to **Job Search**. Choose region, city, radius and sector, enter keywords, and
click **Scrape All Platforms**. Every configured source is queried in parallel.

The result shows per-source counts followed by two figures that reduce them: how
many remain after duplicates are merged, and how many survive the sector filter.
Each carries a **?** explaining what it means and, for the sector filter, how to
undo it.

### Step 4: Read the results

Each card carries:

- **Match percentage** with the weighting behind it, reachable through its **?**
- **Missing skills** for that specific posting
- **Source** and where else the posting appeared
- **Salary**, when the posting states one

### Step 5: Save and analyse

Click **Save to Jobs** on a posting. It moves to the kanban board, and the full
description is fetched at that moment if the search only had a pointer.

Open the saved job to see the deep analysis: match, gaps, and the Oracle's
assessment of strengths and weaknesses.

### Step 6: Generate the application

Click **Generate cover letter**. The agent pipeline runs and returns the letter with
the Critic's score and the number of revisions it took. Adjust language, tone and
length as required, export to PDF, and open the pre-composed email in Gmail.

---

## 9. Production deployment

### Why a separate compose file

The development stack is not safe to expose. Keycloak runs `start-dev` with an
embedded database and no TLS, the application publishes port 3000 directly, and
storage is a JSON file rewritten in full on every change.

[docker-compose.prod.yml](docker-compose.prod.yml) changes all four.

### Isolation strategy

| Measure | Description |
|---|---|
| **Only Caddy publishes a port** | The application and Keycloak are reachable solely on the internal Docker network. TLS cannot be bypassed. |
| **Read-only root filesystem** | Code execution in the app container cannot write a backdoor into `/app` that survives a restart. A tmpfs provides `/tmp`. |
| **All capabilities dropped** | A web server needs no Linux kernel capabilities. `no-new-privileges` prevents escalation through a setuid binary. |
| **Separate database roles** | Keycloak's schema holds credentials. The application role has no rights on it, and a bad migration on either side cannot reach the other's tables. |
| **Automatic TLS** | Caddy obtains and renews Let's Encrypt certificates without being asked. |
| **Transactional storage** | PostgreSQL rather than a JSON file rewritten whole on every change, where a crash mid-write truncates every account at once. |

### Deployment

```bash
cp .env.prod.example .env.prod        # fill in domains and secrets
chmod 600 .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

The full procedure — DNS, certificates, realm and client creation, SMTP, backups and
a pre-launch checklist — is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

### Backups

[scripts/backup-careerai.sh](scripts/backup-careerai.sh) dumps both databases and
the roles they depend on, verifies the archive, and refuses to leave a file behind
on failure. A backup job that fails silently and writes a plausible-looking file is
worse than none at all.

```bash
sudo install -m 700 scripts/backup-careerai.sh /usr/local/bin/
sudo crontab -e
# 15 3 * * *  /usr/local/bin/backup-careerai.sh >> /var/log/careerai-backup.log 2>&1
```

---

## 10. Security of the tool

Cross-cutting checks live in [server/http-guards.js](server/http-guards.js), applied
before any route sees the request.

| Risk | Countermeasure |
|---|---|
| **A stranger spending the LLM budget** | Every endpoint that costs money or CPU requires a session. Enforced centrally before dispatch, so a route added later cannot ship unguarded. |
| **Source disclosure** | Static files are an **allow-list**, not a deny-list. `/storage.json`, `/.env` and `/server.js` return 404, and a new file in the project root is unreachable until named on purpose. |
| **Cross-site request abuse** | CORS names one origin rather than `*`, so another site cannot spend the quota from a visitor's browser. |
| **Cross-site scripting** | CSP with no `unsafe-inline` for scripts: an injected `<script>` does not execute. All inline handlers were removed from the markup. |
| **Clickjacking** | `frame-ancestors 'none'` plus `X-Frame-Options: DENY`. |
| **Brute force** | Rate limits per IP and bucket on credentials, LLM calls, scrapers and outbound email. Keycloak adds temporary lockout with an increasing delay. |
| **Memory exhaustion** | Body size checked on the declared length before a byte is read, with the streaming readers capping themselves as a second line. |
| **Password disclosure** | scrypt with a per-user salt. Under `oidc-only` no password is held at all. |
| **Account takeover via provider** | A provider sign-in only attaches to an existing account when **both** sides have confirmed the email address. Otherwise anyone registering a victim's address at the provider could collect their account. |
| **Token leakage in logs** | The session token is returned in the URL **fragment**, never the query string. Fragments are not sent to servers, so it stays out of access logs and `Referer` headers. |
| **Data minimisation** | Feedback records no session, no username and no IP, so a submission cannot be traced to an account — including by an administrator. The admin interface states this rather than leaving it to be inferred. |

---

## 11. Project structure

```
cv-skill-advisor/
|
+-- server.js                          HTTP server and routing chain
+-- app.js                             Frontend logic
+-- index.html                         Interface shell
+-- styles.css                         Stylesheet, light and dark
+-- page-boot.js                       Consent banner, theme, extracted for the CSP
+-- theme-boot.js                      Theme applied before first paint
|
+-- server/                            Backend modules
|   +-- http-guards.js                 Auth, rate limits, body caps, CSP, allow-list
|   +-- oidc.js                        Generic OpenID Connect relying party
|   +-- graph.js                       LangGraph pipeline: Scout, Matcher, Writer, Critic
|   +-- agents.js                      Scout and Matcher implementations
|   +-- llm.js                         Multi-provider LLM client with fallback
|   +-- rag.js                         Retrieval for the grounded chat
|   +-- embeddings.js                  Vector embeddings and disk cache
|   +-- salary-band.js                 Salary measured from real postings
|   +-- dedup.js                       Cross-source deduplication
|   +-- report.js                      Market report aggregation
|   +-- career-path.js                 Career ladder generation and cache
|   +-- storage.js                     Storage backend selection
|   +-- repo.js                        Repository interface
|   +-- repo-postgres.js               PostgreSQL backend
|   +-- sqlite-storage.js              SQLite backend, built-in node:sqlite
|   +-- email.js                       Outbound mail via Resend
|   +-- feedback-digest.js             Periodic anonymous feedback summary
|   +-- usage.js                       LLM usage counters
|
+-- scorer.js                          Deterministic weighted match score
+-- rerank.js                          Outcome-based re-ranking
+-- skill-matcher.js                   Skill detection
+-- security-skills.js                 246 IT-security skills across 15 groups
+-- security-learning.js               Learning resources per skill
|
+-- docs/
|   +-- index.html                     Project website, GitHub Pages
|   +-- DEPLOYMENT.md                  Production deployment, AWS, backups
|   +-- IDENTITY.md                    Single sign-on, Keycloak, social providers
|
+-- scripts/
|   +-- backup-careerai.sh             Nightly database backup
|
+-- db-init/
|   +-- 01-app-database.sh             Creates the application's own role and database
|
+-- docker-compose.yml                 Local development, optional Keycloak profile
+-- docker-compose.prod.yml            Production: Keycloak, PostgreSQL, Caddy
+-- Caddyfile                          TLS termination and reverse proxy
+-- Dockerfile                         Application image, node:24-slim
+-- .env.example                       Every variable, documented
+-- .env.prod.example                  Production variables
+-- test.js                            81 unit tests, no framework
```

---

## 12. Known limitations

These are measured rather than assumed. Each was found by testing the deployed
system, not by inspection.

### Three job sources are fragile

LinkedIn is read through an undocumented guest endpoint; StepStone and Xing by
parsing HTML with browser-like headers. All three break when those sites change
their markup, and all three sit outside the terms of service of the platforms
concerned. The other seven are official APIs.

LinkedIn additionally returns no description at all — 0 of 28 postings on a live
check — so its results support matching only by their title.

### Salary data is mostly unavailable

German postings rarely publish pay. On a live check across three role titles, **zero
of 34 advertisements stated a salary**. The Bundesagentur is the exception: it
publishes structured annual figures, which the application now reads.

Where at least five postings state pay, the band shown is the interquartile range of
those figures with the sample size beside it. Where they do not, the interface shows
an orientation figure in muted type and says explicitly that it is not a
measurement. Both cases are labelled; neither is presented as the other.

### CV rewriting is grounded by instruction, not verified

The model is told to use only what the source CV contains and never to invent
employers, dates or degrees. Nothing checks automatically that it complied. A
verification pass comparing entities between source and output would close this and
has not been built.

### The sector filter judges on titles more often than it should

Because several sources return no description, roughly two thirds of postings are
filtered on their job title alone. A title using a synonym outside the table is
discarded with no second chance. The synonym lists were widened where real German
titles were being missed, but the underlying cause is the missing description text.

### Single instance

Sessions last 24 hours with no refresh-token rotation. Rate limits are held per
process in memory and reset on restart. PostgreSQL is not replicated: if the volume
is lost, the nightly backups are what remains.

### No propagated sign-out

Signing out of the application ends the local session but not the one at the
identity provider, so clicking sign-in again may return the user straight in without
a prompt.

---

## 13. Testing

```bash
npm test
```

81 unit tests with no external framework, covering text normalisation, skill
detection, role analysis, password hashing, PDF decoding, HTML sanitisation, keyword
matching, CV-to-job matching, fuzzy deduplication, outcome-based re-ranking, the
market report, retrieval relevance calibration, and the LangGraph Writer/Critic loop
including its failure modes — among them the case where the Critic cannot run and
must not report a score nobody computed.

---

## 14. Documentation

| Document | Contents |
|---|---|
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment, AWS, DNS, TLS, backups, pre-launch checklist |
| [docs/IDENTITY.md](docs/IDENTITY.md) | Single sign-on, Keycloak realm and client, Google and GitHub brokering |
| [.env.example](.env.example) | Every configuration variable with its purpose and constraints |
| [docs/index.html](docs/index.html) | Project website — the self-contained overview |
