# CareerAI — job-application assistant for IT security

An AI-assisted job-application tool for cybersecurity and IT roles on the German
market. It reads your CV, searches nine job portals at once, scores every posting
against your profile with a published formula, and drafts a cover letter through a
multi-agent pipeline in which one agent grades another's output.

**Live application:** <https://careerai-jk.duckdns.org>
**Project website:** <https://calderon112.github.io/cv-skill-advisor/>

Final-year project, Westfälische Hochschule Gelsenkirchen.

---

## Contents

- [Quick start](#quick-start)
- [What it does](#what-it-does)
- [Match scoring](#match-scoring)
- [The writing pipeline](#the-writing-pipeline)
- [Job sources](#job-sources)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Production deployment](#production-deployment)
- [Tests](#tests)
- [Privacy and GDPR](#privacy-and-gdpr)
- [Known limitations](#known-limitations)

---

## Quick start

No API key is required. Without one, every AI feature falls back to a deterministic
template rather than failing.

### With Docker Compose (recommended)

```bash
git clone https://github.com/Calderon112/cv-skill-advisor.git
cd cv-skill-advisor
cp .env.example .env          # required; the file may stay empty
docker compose up --build
```

Open <http://localhost:3000>. A local demo account is seeded: `student` / `security`.

### With Node.js

Requires **Node.js 22.5 or later** — the SQLite and PostgreSQL storage backends use
`node:sqlite` and modern APIs that older releases do not have.

```bash
git clone https://github.com/Calderon112/cv-skill-advisor.git
cd cv-skill-advisor
npm install
cp .env.example .env
npm start
```

### With single sign-on

To run the full identity stack — Keycloak brokering Google, GitHub and others:

```bash
docker compose --profile identity up keycloak
```

Name the service. A bare `--profile identity up` also starts the application
container, which collides with `npm start` on port 3000. Setup is documented in
[docs/IDENTITY.md](docs/IDENTITY.md).

---

## What it does

**Professional profile.** Upload a CV as PDF and skills, experience, education and
photo are extracted automatically. Scanned CVs go through OCR. Manual entry is
available, and the finished profile exports back to a formatted PDF.

**Multi-platform search.** Nine sources queried in parallel, deduplicated across
them, filtered by region, city, radius, domain and keywords. Roughly five seconds
end to end.

**Match scoring.** A deterministic percentage with a published weighting, plus
semantic re-ranking through vector embeddings. Every job card lists the skills you
are missing for that posting.

**Document generation.** Cover letters through the multi-agent pipeline, tailored
CVs, interview questions and a pre-composed application email that opens in Gmail.
Language, tone and length are selectable.

**Career pathway.** Entry, mid-level and senior roles per domain with the skills and
certifications expected at each stage, a live count of open positions from the
official Bundesagentur API, and a salary band measured from real postings where the
data allows it.

**Skill-gap analysis.** What is missing for a target role, with concrete learning
resources: TryHackMe, HackTheBox, SANS, Coursera, MITRE ATT&CK, OWASP, Splunk.

**Application tracker.** A kanban board from saved through to offer, with drag and
drop, a status history and a conversion funnel. Generated documents are stored with
their posting.

**CareerBot.** A chat assistant grounded in the product documentation through RAG,
so it answers questions about the product rather than improvising.

**Market report.** Aggregates the postings found into skill demand, locations,
remote share and salary statistics.

---

## Match scoring

The percentage on each job card is deterministic: the same inputs always produce the
same number, and it can be checked by hand.

| Criterion | Weight |
|---|---|
| Skills overlap | 45% |
| Role match | 20% |
| Location | 10% |
| Remote arrangement | 10% |
| Seniority | 10% |
| Salary fit | 5% |

Vector embeddings then re-rank the shortlist by meaning, so a posting for
"Penetration Tester" still surfaces for a CV that says "Ethical Hacking".

The Oracle (`POST /api/job-consult`) performs a deeper LLM analysis of a single
posting against the profile and returns strengths, gaps and advice. Once a job has
been analysed, that score becomes the one shown on the card.

---

## The writing pipeline

A single prompt produces a letter that nobody has judged. This pipeline builds the
judgement in, using LangGraph:

```
Scout  ->  Matcher  ->  Writer  <->  Critic  ->  letter + score
                          ^_____________|
                       revise until the bar is met
```

The Critic scores the draft out of 100 against the actual posting and returns
specific objections. The Writer revises. Each run reports how many revisions it took
and the final score, so a weak letter is visible instead of silently shipped.

Two failure modes are handled explicitly. When the Critic cannot run, the loop
terminates on a bookkeeping score that is never displayed as a judgement. When a
source returns a pointer rather than a description — "Full description on LinkedIn"
— that text is treated as absent so the Critic does not grade a letter against a
sentence containing no requirements.

---

## Job sources

Official APIs, no token required:

| Source | Notes |
|---|---|
| Bundesagentur für Arbeit | Germany's official employment agency |
| Arbeitnow | Germany-focused |
| Remotive | Remote roles worldwide |

Official APIs, key required:

| Source | Environment variable |
|---|---|
| Adzuna | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` |
| Jooble | `JOOBLE_API_KEY` |
| Apify (StepStone, Indeed) | `APIFY_TOKEN` |

Read by parsing HTML or an undocumented endpoint, and therefore fragile:

| Source | Risk |
|---|---|
| LinkedIn | Undocumented guest endpoint |
| StepStone | HTML parsing |
| Xing | HTML parsing |

Cross-source deduplication uses Sørensen-Dice similarity on title and company,
merging near-duplicates such as "(m/w/d)" or GmbH/AG variants and recording where
else the posting appeared.

---

## Architecture

```
cv-skill-advisor/
├── server.js                  HTTP server and API routes
├── app.js                     Frontend logic
├── index.html                 UI shell
├── styles.css
├── server/
│   ├── http-guards.js         Auth, rate limits, body caps, CSP, static allow-list
│   ├── oidc.js                Generic OpenID Connect relying party
│   ├── graph.js               LangGraph pipeline (Scout, Matcher, Writer, Critic)
│   ├── agents.js              Scout and Matcher
│   ├── llm.js                 Multi-provider LLM client
│   ├── rag.js                 Retrieval for CareerBot
│   ├── embeddings.js          Vector embeddings and cache
│   ├── salary-band.js         Salary measured from real postings
│   ├── dedup.js               Cross-source deduplication
│   ├── report.js              Market report aggregation
│   ├── storage.js             Storage backend selection
│   ├── repo-postgres.js       PostgreSQL backend
│   └── email.js               Outbound mail
├── docs/
│   ├── index.html             Project website (GitHub Pages)
│   ├── DEPLOYMENT.md          Production deployment guide
│   └── IDENTITY.md            Single sign-on setup
├── scripts/backup-careerai.sh Nightly backup
├── docker-compose.yml         Local development
├── docker-compose.prod.yml    Production stack
└── Caddyfile                  TLS termination and reverse proxy
```

No frontend framework and no build step: the interface is served as plain HTML, CSS
and JavaScript.

The LLM client supports Anthropic, Google Gemini, OpenRouter and OpenAI with
automatic fallback and backoff. Without any key, every AI feature degrades to a
deterministic template.

---

## Configuration

Every value in `.env` is optional. See [.env.example](.env.example) for the full
list with explanations.

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Free tier, no credit card. Enables all AI features |
| `ANTHROPIC_API_KEY` | Alternative LLM provider |
| `PUBLIC_BASE_URL` | Public URL of the deployment; OIDC redirects derive from it |
| `AUTH_MODE` | `both` (default) or `oidc-only` to disable local passwords |
| `ADMIN_USERS` | Comma-separated usernames granted the admin page |
| `STORAGE_BACKEND` | `json` (default) or `postgres` |
| `RESEND_API_KEY` | Outbound email; falls back to a `mailto:` draft |

---

## Production deployment

The production stack runs Keycloak on PostgreSQL behind Caddy, which terminates TLS
and renews Let's Encrypt certificates automatically. Only Caddy publishes a port;
the application and Keycloak are reachable solely on the internal Docker network.

```bash
cp .env.prod.example .env.prod        # fill in domains and secrets
chmod 600 .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

The full procedure — DNS, certificates, realm and client creation, SMTP, backups and
a pre-launch checklist — is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Container hardening on the application service: read-only root filesystem, all Linux
capabilities dropped, `no-new-privileges`, and a database role separate from
Keycloak's so neither can read the other's tables.

---

## Tests

```bash
npm test
```

81 unit tests with no external framework, covering text normalisation, skill
detection, role analysis, password hashing, PDF decoding, HTML sanitisation, keyword
matching, CV-to-job matching, fuzzy deduplication, outcome-based re-ranking, the
market report, RAG relevance calibration, and the LangGraph Writer/Critic loop
including its failure modes.

---

## Privacy and GDPR

Feedback is anonymous by construction: the endpoint records no session, no username
and no IP address, so a submission cannot be traced back to an account — including by
an administrator. The admin interface states this rather than leaving it to be
inferred.

Personal data is minimised: the profile holds what the user enters, and nothing is
collected for analytics. Consent is requested explicitly before any storage, and the
consent notice describes where data actually goes.

Passwords, where local accounts are enabled, are hashed with scrypt and a per-user
salt. Sessions can be listed and revoked individually from the account page.

---

## Known limitations

These are measured rather than assumed.

- **Three job sources are fragile.** LinkedIn, StepStone and Xing are read by parsing
  HTML or an undocumented endpoint. They break when those sites change and sit
  awkwardly with their terms of service. The other six are official APIs.
- **Salary data is mostly unavailable.** German postings rarely publish pay: zero of
  34 advertisements stated a salary on a live check across three role titles. The app
  measures a band when enough data exists and clearly marks the figure as indicative
  when it does not.
- **CV rewriting is grounded by instruction, not verified.** The model is told to use
  only what the source CV contains; no automated check confirms that it complied.
- **Descriptions are often pointers.** Several sources return "Full description on
  LinkedIn" instead of the posting text, so matching sometimes works from the job
  title alone.
- **Single instance.** Sessions last 24 hours with no refresh-token rotation, rate
  limits are per process and in memory, and PostgreSQL is not replicated. Backups run
  nightly.

---

## Documentation

- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — production deployment, AWS, backups
- [docs/IDENTITY.md](docs/IDENTITY.md) — single sign-on, Keycloak, social providers
- [INSTALL.md](INSTALL.md) — local setup, API keys, troubleshooting
- [ARCHITECTURE.md](ARCHITECTURE.md) — design decisions
