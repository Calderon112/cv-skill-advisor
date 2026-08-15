# Installation Guide

CyberCareer runs in two ways: **Docker** (recommended — nothing to install but Docker
itself) or **directly with Node.js**. Both serve the same application on
<http://localhost:3000>.

Every API key is **optional**. With no key at all the app still parses CVs, detects
skill gaps, scrapes real job offers and generates documents from deterministic
templates. Keys only unlock the AI layer: LLM writing, RAG semantic matching and the
grounded CareerBot.

---

## Option 1 — Docker (recommended)

### Requirements

- [Docker](https://docs.docker.com/get-docker/) 20.10+ with Compose v2
  (bundled with Docker Desktop on Windows and macOS)

### Install and run

```bash
git clone https://github.com/Calderon112/cv-skill-advisor.git
cd cv-skill-advisor

# The container reads .env at startup. It may stay empty.
cp .env.example .env

docker compose up --build
```

Open <http://localhost:3000> and sign in with `student` / `security`.

Add `-d` to run it in the background. Stop it with `docker compose down`.

### Where your data lives

The container keeps its writable state in the named volume `cybercareer-data`,
mounted at `/app/data`:

| File | Contents |
|---|---|
| `storage.json` | Accounts (scrypt-hashed passwords), sessions, applications |
| `.embeddings-cache.json` | RAG embedding cache, so a restart does not re-embed |
| `.usage-stats.json` | LLM and embedding token counters |

Nothing is written into the image, so rebuilding never destroys your data. To wipe
everything, including your account: `docker compose down -v`.

### Changing the port

`docker compose up` reads `PORT` from `.env` for the **host** side of the mapping.
Set `PORT=8080` there to serve the app on <http://localhost:8080>; the container
itself always listens on 3000.

### Without Compose

```bash
docker build -t cybercareer .
docker run -p 3000:3000 --env-file .env -v cybercareer-data:/app/data cybercareer
```

---

## Option 2 — Node.js

### Requirements

- Node.js **20 or later** (`node -v`)

### Install and run

```bash
git clone https://github.com/Calderon112/cv-skill-advisor.git
cd cv-skill-advisor

npm install
cp .env.example .env

npm start
```

Open <http://localhost:3000> and sign in with `student` / `security`.

State is written next to the sources: `storage.json`, `.embeddings-cache.json` and
`.usage-stats.json`. All three are gitignored, and all three can be deleted safely —
they are recreated on the next run.

---

## Enabling the AI features

Add **one** provider key to `.env`. The first one present is used, in this order:
Anthropic, Gemini, OpenRouter, OpenAI. `LLM_PROVIDER` forces a specific one.

```env
# Google Gemini — free tier, no credit card.
# Key: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_key_here
```

Gemini is the recommended starting point: the same key also powers the **RAG layer**
(semantic job ranking and the grounded CareerBot), because embeddings reuse
`GEMINI_API_KEY` or `OPENAI_API_KEY`.

Restart the app, then check <http://localhost:3000/api/status>.

Job search itself needs no key — Bundesagentur für Arbeit, Arbeitnow, Remotive and
LinkedIn guest are free. `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`, `APIFY_TOKEN` and
`JOOBLE_API_KEY` add more sources. See `.env.example` for the full list.

---

## Privacy

The application is fully local: your CV text is held in memory for the session and
never written to disk, and no analytics or tracking data is collected. Accounts,
sessions and applications live in `storage.json` on your machine. See
`gdpr-banner.html` for the full privacy policy in German and English.
