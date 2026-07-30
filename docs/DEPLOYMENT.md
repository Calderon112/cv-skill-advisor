# Going live

Taking CareerAI from a laptop to a public URL. Roughly an hour, most of it waiting
for DNS.

What you end up with:

```
                    ┌──────────── your server ────────────┐
   browser ──443──► │  Caddy  ──► cybercareer:3000        │
                    │    │    ──► keycloak:8080 ──► postgres│
                    │    └── Let's Encrypt, auto-renewed   │
                    └──────────────────────────────────────┘
```

Only Caddy publishes a port. The app and Keycloak are unreachable except through
it, so nobody can bypass TLS by connecting to :3000 directly.

---

## What you need first

| | |
|---|---|
| A server | 2 GB RAM minimum — Keycloak and PostgreSQL together want ~1 GB. Hetzner CX22 (~4.50 €/month, Germany) is enough. |
| A domain | ~5 €/year. Netcup or INWX for `.de`, Porkbun or Cloudflare for `.com`. |
| Docker | `curl -fsSL https://get.docker.com \| sh` |
| Ports 80 and 443 open | Let's Encrypt validates over port 80. Without it there is no certificate. |

---

## 1. DNS

Two records, both pointing at the server's public IP:

```
A   careerai        <server IP>        →  careerai.example.de
A   auth.careerai   <server IP>        →  auth.careerai.example.de
```

Wait until both resolve before going further — Caddy fails to get a certificate
otherwise, and Let's Encrypt only allows **5 attempts per domain per week**.

```bash
dig +short careerai.example.de
dig +short auth.careerai.example.de
```

Both must print your server's IP.

## 2. The code and the configuration

```bash
git clone <your repo> careerai && cd careerai
cp .env.prod.example .env.prod
chmod 600 .env.prod
```

Fill in `.env.prod`. Generate the two passwords rather than inventing them:

```bash
openssl rand -base64 32     # KC_DB_PASSWORD
openssl rand -base64 24     # KC_ADMIN_PASSWORD
```

Leave `OIDC_KEYCLOAK_CLIENT_SECRET` empty for now — it does not exist yet.

## 3. First start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
docker compose -f docker-compose.prod.yml logs -f caddy
```

Watch for `certificate obtained successfully`. If instead you see repeated ACME
failures, DNS has not propagated — stop, wait, and try again rather than looping.

The app will not work yet: Keycloak has no realm.

## 4. Secure the Keycloak admin

Open `https://auth.careerai.example.de`, sign in with `KC_ADMIN_USER` /
`KC_ADMIN_PASSWORD`, and **change the password immediately**.

Then delete `KC_ADMIN_USER` and `KC_ADMIN_PASSWORD` from `.env.prod`. They are read
on every start and are visible to anyone who can run `docker inspect` on the host.
The administrator already exists in the database; those lines only created it.

## 5. Realm and client

In the admin console:

1. **Create realm** → `careerai` (must equal `KC_REALM`).
2. **Clients → Create client**
   - Client ID: `careerai-web`
   - Client authentication: **On**
   - Valid redirect URIs: `https://careerai.example.de/api/auth/callback`
   - Valid post logout redirect URIs: `https://careerai.example.de/`
   - Web origins: `https://careerai.example.de`
3. **Credentials** tab → copy the secret into `OIDC_KEYCLOAK_CLIENT_SECRET`.
4. **Realm settings → Login** → **User registration: On** (so people can sign up).

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d cybercareer
```

The sign-in button should now appear at `https://careerai.example.de`.

## 6. Email

Keycloak sends the verification and password-reset mail, and it has **its own** SMTP
settings — the app's `RESEND_API_KEY` never reaches it.

**Realm settings → Email**:

```
From                : noreply@careerai.example.de
Host                : smtp.resend.com        (or Brevo, or your provider)
Port                : 587
Encryption          : Enable StartTLS  ✔
Authentication      : On
Username            : resend
Password            : your Resend API key
```

Use **Test connection** before saving. Then **Realm settings → Login → Verify
email: On**.

Sending from your own domain needs three DNS records, which your mail provider
shows you when you add the domain:

| Type | Name | Purpose |
|---|---|---|
| `MX` | `send.careerai.example.de` | bounce handling |
| `TXT` | `send.careerai.example.de` | SPF |
| `TXT` | `resend._domainkey.careerai.example.de` | DKIM |

To *receive* mail without exposing a private address, Cloudflare Email Routing
forwards `contact@careerai.example.de` to any inbox, free.

## 7. Google and GitHub sign-in

Configure them **inside Keycloak**, not in this app: **Identity providers → Add
provider**. The redirect URI to register at Google/GitHub is Keycloak's:

```
https://auth.careerai.example.de/realms/careerai/broker/google/endpoint
https://auth.careerai.example.de/realms/careerai/broker/github/endpoint
```

Nothing changes in CareerAI — the new button appears on Keycloak's login page.

---

## Pre-launch checklist

Security posture, verified against the running code rather than assumed:

- [x] **Expensive endpoints require a session.** Every LLM call, PDF parse and paid
      scraper returns 401 without a token — enforced centrally in
      [server/http-guards.js](../server/http-guards.js), before dispatch, so a route
      added later cannot ship unguarded. Confirmed empirically: `/api/chat`,
      `/api/generate-cover`, `/api/parse-pdf`, `/api/graph-stream` all 401.
- [x] **Static files are an allow-list.** `/storage.json`, `/.env`, `/server.js` all
      return 404. A new file in the project root is unreachable until named on purpose.
- [x] **CORS names one origin**, not `*`, so other people's pages cannot spend your
      LLM quota from a visitor's browser.
- [x] **CSP without `unsafe-inline` for scripts**, plus `X-Frame-Options: DENY`,
      `nosniff` and `Referrer-Policy: no-referrer`.
- [x] **Rate limits** on credentials, LLM calls, scrapers and outbound email.
- [x] **Body size limits** enforced before reading the payload.
- [x] **Passwords are scrypt with a per-user salt** (when local accounts are enabled).
- [x] **SQLite instead of the JSON file** — see below.

Things you must still do yourself:

- [ ] `ALLOW_INSECURE_TLS` is **not** in `.env.prod`. The server refuses to start
      with it under `NODE_ENV=production`, but check anyway.
- [ ] Keycloak admin password changed, and the bootstrap lines removed from `.env.prod`.
- [ ] `.env.prod` is `chmod 600` and git-ignored.
- [ ] Backups configured (below). Nothing here backs itself up.
- [ ] `ADMIN_USERS` set to your own account, so the Admin page is not orphaned.
- [ ] Consider restricting `/admin/*` on the auth domain to your own IP — the
      commented block in [Caddyfile](../Caddyfile).

## Backups

Two things carry state. Losing either loses your users.

```bash
#!/bin/sh
# /root/backup-careerai.sh  —  crontab: 0 3 * * * /root/backup-careerai.sh
set -eu
DEST=/var/backups/careerai/$(date +%F)
mkdir -p "$DEST"

# Keycloak: accounts, credentials, sessions
docker exec careerai-postgres pg_dump -U keycloak keycloak | gzip > "$DEST/keycloak.sql.gz"

# The app: profiles, saved jobs, generated documents.
# .backup is SQLite's own consistent-snapshot command; copying the file while the
# app is writing can capture a torn database.
docker exec cybercareer node -e "
  const {DatabaseSync}=require('node:sqlite');
  new DatabaseSync('/app/data/storage.sqlite').exec(\"VACUUM INTO '/app/data/backup.sqlite'\");
"
docker cp cybercareer:/app/data/backup.sqlite "$DEST/storage.sqlite"
docker exec cybercareer rm -f /app/data/backup.sqlite

find /var/backups/careerai -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +
```

Restore is the reverse: `gunzip < keycloak.sql.gz | docker exec -i careerai-postgres
psql -U keycloak keycloak`, and copy `storage.sqlite` back into the volume.

**A backup you have never restored is not a backup.** Try it once, now, while
nothing depends on it.

## Storage

The development setup rewrote `storage.json` in full on every change with
`writeFileSync`. A crash or a full disk part-way through truncates the file, and a
truncated file is every account, session and saved job gone at once.

Production sets `STORAGE_BACKEND=sqlite`. Writes go into a transaction with WAL, so
a write either lands completely or not at all. It uses `node:sqlite`, built into
Node since 22.5 — no native module, nothing to compile. That is why the image is
now `node:24-slim`; on Node 20 the module does not exist and the server refuses to
start rather than writing somewhere unexpected.

Your existing `storage.json` is imported automatically on first start and then left
alone as a pre-migration backup. The import is a one-off: it only runs when the
database is empty, so restarting never re-imports over live data.

## Updating

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Take a backup first. Compose recreates only what changed.

## When something breaks

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 cybercareer
docker compose -f docker-compose.prod.yml logs --tail=100 keycloak
```

| Symptom | Cause |
|---|---|
| Caddy loops on ACME errors | DNS not resolving yet, or port 80 blocked. Fix before retrying — 5 attempts per week. |
| `invalid redirect_uri` at sign-in | The URI in Keycloak does not match `https://<APP_DOMAIN>/api/auth/callback` character for character. |
| Sign-in button missing | `OIDC_KEYCLOAK_CLIENT_SECRET` empty, or the realm name differs from `KC_REALM`. `GET /api/auth/providers` returns `available:false`. |
| Keycloak exits at boot | PostgreSQL was not ready, or `KC_DB_PASSWORD` differs between the two services. |
| Server refuses to start | `ALLOW_INSECURE_TLS=1` with `NODE_ENV=production`. Remove it. |
| Keycloak emails not sending | Its SMTP is configured in its own admin console, not from `.env.prod`. |

## Known limitations

- Sessions last 24 h with no refresh-token rotation.
- Rate limits are per process and in memory; they reset on restart and are not
  shared if you ever run more than one instance.
- SQLite suits a single instance. Running several app containers against one file
  would need PostgreSQL for the app too.
- No log aggregation or uptime alerting. `docker compose logs` is what you have.
