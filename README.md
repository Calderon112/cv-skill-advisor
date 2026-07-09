# CyberCareer — IT Security Job Advisor
### Sprint 1 · Foundation · May 2025

> An AI-powered career advisor for IT Security students — analyzes your CV, detects skill gaps, matches you to real job offers from German platforms, and suggests how to acquire missing skills.

---

## 🚀 Quick Start

### With Docker

```bash
git clone https://github.com/Calderon112/cv-skill-advisor.git
cd cv-skill-advisor
cp .env.example .env          # required, may stay empty
docker compose up --build
```

### With Node.js 20+

```bash
git clone https://github.com/Calderon112/cv-skill-advisor.git
cd cv-skill-advisor
npm install
cp .env.example .env          # optional — defaults work without any key
npm start
```

Then open <http://localhost:3000>. **Default login** → `student` / `security`

Full setup, API keys, data locations and troubleshooting: **[INSTALL.md](INSTALL.md)**.

---

## 🏗️ Architecture — Sprint 1

```
cv-skill-advisor/
├── server.js          ← Node.js backend (HTTP + all API routes)
├── index.html         ← Main UI shell
├── app.js             ← Frontend logic (4 agents)
├── storage.json       ← Local DB (auto-created on first run)
├── .env               ← API keys (never commit this)
├── .env.example       ← Template
├── tests/
│   └── test.js        ← Unit test suite (42 tests, no framework)
├── gdpr/
│   └── gdpr-banner.html ← GDPR consent banner + privacy policy
└── README.md
```

### Multi-Agent System

| Agent | Role | Status |
|---|---|---|
| **Scout** | CV upload, PDF parsing, skill extraction | ✅ Sprint 1 |
| **Matcher** | Job search, gap analysis, skill comparison | ✅ Sprint 1 |
| **Writer** | CV, cover letter, email & roadmap generation | ✅ Sprint 2-3 |
| **Tracker** | Application tracking, status & documents | ✅ Sprint 1-3 |

The agents are explicitly separated and orchestrated — see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## ✨ Sprint 2 & 3 — Features delivered

### Matching & job discovery
- **Extended security taxonomy** — 232 IT-Security skills across 14 sub-domains (`security-skills.js`).
- **Real multi-source scraping** — Bundesagentur, Arbeitnow, Remotive, LinkedIn, **Xing**, free **StepStone** (+ Adzuna / Apify / Jooble when keys are set), run in parallel with a per-source **scrape log** (counts + timing) shown in the UI and server console.
- **Fuzzy cross-source de-duplication** (`server/dedup.js`) — Sørensen-Dice on title+company; merges near-duplicates ("(m/w/d)", GmbH/AG) and records "also on …".
- **Weighted scoring engine** (`scorer.js`) — deterministic 6-criteria score (skills 45 · role 20 · location 10 · remote 10 · seniority 10 · salary 5) with a transparent breakdown.
- **Outcome-based re-ranking** (`rerank.js`) — boosts jobs similar to applications that reached interview/offer.
- **The Oracle** — `POST /api/job-consult`: the LLM reads a posting + your profile and returns a deep match %, strengths, gaps, certifications and advice. **Its score is the single source of truth** shown on the job card once analysed (cached per job + profile signature, with auto-retry on rate-limits).
- **Market Report** (`server/report.js`) — aggregates scraped jobs into skill/location/company/salary stats + an LLM summary.

### Writer (document generation)
- **AI CV, cover letter, email & learning roadmap** — `POST /api/generate-cv` · `/api/generate-cover` · `/api/generate-roadmap`, each with a deterministic template fallback.
- **Writer options** — language (DE/EN), tone, length.
- **PDF export** of any generated document (jsPDF).
- **One-click documents from the Tracker** — generate CV + cover letter + email for a saved job; **documents are persisted** on the application and survive a refresh.
- **AI interview prep** — `POST /api/generate-interview`: role-specific questions + tips.

### Tracker
- Kanban with **drag-and-drop**, deadline urgency, **status-history timeline**, and a **conversion funnel** (Saved → Applied → Interviews → Offers + response rate).

### AI providers
- Multi-provider LLM client (`server/llm.js`): **Anthropic, Google Gemini (free), OpenRouter (free), OpenAI** — automatic fallback + retry/backoff. Without any key, every AI feature degrades to a deterministic template.

### Quality
- **75 unit tests** (`npm test`) — pure functions, multi-agent contracts, fuzzy dedup, re-ranking, market report, RAG and LangGraph. No external framework.

---

## ⚙️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | Node.js (no framework) | Zero dependencies, fast, easy deploy |
| Frontend | Vanilla JS + HTML/CSS | No build step required |
| PDF parsing | `pdf-parse` | Handles UTF-16, CMap, modern PDFs |
| Auth | scrypt (built-in Node.js crypto) | Secure password hashing, no external lib |
| Job APIs | Bundesagentur, Arbeitnow, Remotive, LinkedIn (guest) | Free, no token required |
| Storage | JSON file (`storage.json`) | Simple local persistence for Sprint 1 |

---

## 🔌 API Integrations

### Free — No token required

| Platform | Endpoint | Notes |
|---|---|---|
| **Bundesagentur für Arbeit** | `rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs` | Germany's official job board |
| **Arbeitnow** | `arbeitnow.com/api/job-board-api` | Germany-focused, 100 jobs/page |
| **Remotive** | `remotive.com/api/remote-jobs` | Remote IT jobs worldwide |
| **LinkedIn (guest)** | `linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search` | No login, limited results |

### Optional — Token required

| Platform | Env variable | How to get |
|---|---|---|
| Apify (StepStone) | `APIFY_TOKEN` | apify.com — free tier available |
| Apify (Indeed.de) | `APIFY_TOKEN` | Same token as above |
| Jooble | `JOOBLE_API_KEY` | jooble.org/api — free registration |

---

## 🧪 Running Tests

```bash
npm test                            # or: docker compose exec cybercareer npm test
```

**75 unit tests** covering:
- `normalize()` — text preprocessing
- `findSkills()` — skill detection from CV text
- `analyzeRoles()` — role matching & scoring
- `hashPassword()` / `verifyPassword()` — auth security
- `decodePdfStr()` — PDF text decoding
- `stripHtml()` — HTML sanitization
- `kwTokens()` / `matchesKeyword()` — job keyword matching
- `jobMatchesProfile()` — CV-to-job matching
- Fuzzy cross-source dedup, outcome-based re-ranking, market report
- RAG (cosine, calibrated relevance) and the LangGraph Writer⇄Critic loop
- Edge cases & robustness

---

## 🔒 GDPR & Data Privacy

This application is **fully local** — all data stays on your machine.

### What is stored
| Data | Where | How long |
|---|---|---|
| Username + hashed password | `storage.json` | Until manually deleted |
| Session token | `storage.json` + LocalStorage | 24h, then auto-expired |
| Applications (title, company, status) | `storage.json` | Until manually deleted |
| CV text | RAM only | Current session only |

### What is NOT stored
- Raw passwords (scrypt-hashed with unique salt)
- CV content on disk
- Any analytics or tracking data

### Delete all your data
```bash
# Option 1: delete the file
rm storage.json

# Option 2: clear browser storage
# F12 → Application → LocalStorage → Clear all
```

See `gdpr/gdpr-banner.html` for the full privacy policy (German/English).

---

## 🔧 Configuration — `.env`

```env
# Server
PORT=3000

# Optional API keys
APIFY_TOKEN=your_apify_token_here
JOOBLE_API_KEY=your_jooble_key_here

# Bundesagentur (already works without this)
BUNDES_API_KEY=jobboerse-jobsuche
```

---

## 🐛 Known Issues & Fixes

### "Could not read file: pdf.js not loaded"
This error appears with complex PDFs (UTF-16 encoded, generated by Word/Canva/Adobe).

**Fix:**
```bash
npm install pdf-parse
```
Then in `server.js`, update `extractPdfText()` to use `pdf-parse` as primary parser
(see fix instructions in the PR or CHANGELOG).

### Port 3000 already in use
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
node server.js
```

---

## 📋 Sprint 1 Checklist

- [x] Architecture design (multi-agent: Scout / Matcher / Writer / Tracker)
- [x] Tech stack setup (Node.js, vanilla JS, no build step)
- [x] Legal & GDPR research → `gdpr/gdpr-banner.html`
- [x] CV Parser (PDF + text, server-side, no CDN dependency)
- [x] IT Security skills database (15 skills, 4 roles)
- [x] Gap analysis engine (score, matched, missing)
- [x] Bundesagentur API integration (free, no token)
- [x] Multi-platform job aggregation (Arbeitnow, Remotive, LinkedIn guest)
- [x] Authentication (register / login / token / scrypt hashing)
- [x] Application tracker (CRUD)
- [x] Unit test suite (42 tests — `node tests/test.js`)
- [x] README documentation

### Sprint 2 — Planned
- [ ] Cover letter generation (Writer Agent with LLM API)
- [ ] Improved skill database (200+ skills)
- [ ] Jooble & Apify integration with UI toggle
- [ ] Email notifications for new matching jobs
- [ ] Export applications to PDF/Excel

---

## 👨‍🎓 About

Built as a personal learning project by an IT Security student (Gelsenkirchen, NRW).

The goal: help students and professionals in cybersecurity find relevant jobs in Germany,
understand what skills they're missing, and get a concrete plan to acquire them.

**Built with:** Node.js · vanilla JavaScript · zero-build frontend

---

## 📄 License

MIT License — free to use, modify, and distribute.
