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
| A domain | ~5 €/year. Netcup or INWX for `.de`, Porkbun or Cloudflare for `.com`. For a test deployment, a free DuckDNS name works — see below. |
| Docker | `curl -fsSL https://get.docker.com \| sh` |
| Ports 80 and 443 open | Let's Encrypt validates over port 80. Without it there is no certificate. |

### The 1 GB trap

Every "free tier" that gives you 1 GB — AWS `t3.micro`, Oracle's AMD shape, most
PaaS free plans — is **too small**. Keycloak alone wants 700 MB–1 GB before
PostgreSQL, the app and Caddy. It does not run slowly on 1 GB; it is killed by the
OOM reaper part-way through booting, which reads like a crash with no clear cause.

Budget 2 GB, and 4 GB if you want headroom.

---

## Deploying on AWS

Skip this section if you are using a plain VPS — the numbered steps below apply to
any Docker host.

**Use Lightsail, not EC2.** It is the same infrastructure with flat pricing, a
static IP included, bandwidth included, and no VPC or security-group assembly. EC2
is the right answer when you need autoscaling or private subnets; for one server it
is a lot of ceremony for the same result.

| Lightsail plan | Verdict |
|---|---|
| 1 GB | Will not boot Keycloak. |
| **2 GB / 2 vCPU** | **Minimum that works.** |
| 4 GB / 2 vCPU | Comfortable. |

New Lightsail instances usually carry a free first period, and new AWS accounts get
signup credits — check what is offered at creation rather than trusting a number
written here.

1. **Lightsail → Create instance** → Linux/Unix → **Ubuntu 24.04 LTS** → 2 GB plan.
   Choose the **Frankfurt (eu-central-1)** region: closest to you, and it keeps
   personal data in the EU, which is one paragraph less to justify in a report.
2. **Networking → attach a static IP.** Without it the address changes on every
   stop/start and your DNS silently points at nothing.
3. **Networking → IPv4 Firewall**, add:

   | Application | Protocol | Port |
   |---|---|---|
   | SSH | TCP | 22 |
   | HTTP | TCP | 80 |
   | HTTPS | TCP | 443 |

   Port 80 is not optional — Let's Encrypt validates over it.
4. Connect (the browser SSH button works), then:

   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER && exit      # reconnect for the group to apply
   ```

5. Keycloak's JVM and PostgreSQL together will touch swap on a 2 GB instance.
   Lightsail images ship without any, and the first OOM kill is silent:

   ```bash
   sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
   sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

Then continue from step 1 below, using the static IP as your DNS target.

### A test deployment without buying a domain

[DuckDNS](https://duckdns.org) gives free subdomains that Let's Encrypt will
certify. Register two, point both at the static IP, and set:

```ini
APP_DOMAIN=careerai.duckdns.org
AUTH_DOMAIN=careerai-auth.duckdns.org
```

Everything else works unchanged. Swap in the real domain later by editing those two
lines and restarting — nothing else refers to them.

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
- [x] **PostgreSQL instead of the JSON file**, on its own database and role — see below.

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

Everything that matters lives in one PostgreSQL server: Keycloak's database holds
the accounts and credentials, the app's holds profiles, saved jobs and generated
documents. One dump captures both.

Create `/usr/local/bin/backup-careerai.sh`:

```sh
#!/bin/sh
set -eu

DEST=/var/backups/careerai
STAMP=$(date +%F_%H%M)
mkdir -p "$DEST"

# pg_dumpall, not pg_dump: it takes every database in the cluster plus the roles
# they depend on, so a restore onto an empty server recreates the `careerai` user
# as well. A per-database dump would restore tables owned by a role that no longer
# exists, and fail at the last step.
#
# POSTGRES_USER is the cluster superuser, which is why this works with one login.
docker exec careerai-postgres pg_dumpall -U "${KC_DB_USER:-keycloak}" \
  | gzip > "$DEST/careerai-$STAMP.sql.gz"

# Fail loudly rather than leaving a truncated file that looks like a backup.
gzip -t "$DEST/careerai-$STAMP.sql.gz"

find "$DEST" -name 'careerai-*.sql.gz' -mtime +30 -delete
echo "backup ok: $DEST/careerai-$STAMP.sql.gz"
```

Install it:

```bash
sudo install -m 700 backup-careerai.sh /usr/local/bin/
sudo /usr/local/bin/backup-careerai.sh          # run once, check it prints "backup ok"
sudo crontab -e
# 15 3 * * *  /usr/local/bin/backup-careerai.sh >> /var/log/careerai-backup.log 2>&1
```

### Restoring

```bash
gunzip -c /var/backups/careerai/careerai-2026-07-31_0315.sql.gz \
  | docker exec -i careerai-postgres psql -U keycloak postgres
docker compose -f docker-compose.prod.yml --env-file .env.prod restart keycloak cybercareer
```

**A backup you have never restored is not a backup.** Do it once now, while nothing
depends on it: restore into a throwaway container and confirm the accounts are
there, rather than discovering the dump was empty the day you need it.

### What the dump does *not* cover

- **`.env.prod`** — the client secret and both database passwords. Without it the
  restored databases are unreachable. Copy it once, somewhere private; it changes
  rarely. Never into the same public place as the dumps.
- **Caddy's certificates.** No need: Let's Encrypt reissues them automatically on a
  fresh server.
- **The server itself.** These files sit on the same instance they protect. Copy
  them off it — `scp` to your laptop, or an S3 bucket — or a lost instance takes
  the backups with it. That includes the day the AWS free plan closes the account.

## Storage

The development setup rewrote `storage.json` in full on every change with
`writeFileSync`. A crash or a full disk part-way through truncates the file, and a
truncated file is every account, session and saved job gone at once.

Production sets `STORAGE_BACKEND=postgres` and points `DATABASE_URL` at the same
server Keycloak uses. Writes are transactional, so a write either lands completely
or not at all.

PostgreSQL rather than SQLite: the stack already runs one, so this adds no service
and no native module to compile into the image, and it is the only option that
would let a second app instance share state.

The application gets **its own database and role**, created once by
`db-init/01-app-database.sh` when the volume is first initialised. Keycloak's schema
holds credentials; the application has no business being able to read it, and a bad
migration on either side cannot reach the other's tables.

> That init script runs **only on an empty volume**. Changing `APP_DB_PASSWORD` in
> `.env.prod` afterwards does not change it in PostgreSQL — the app will simply fail
> to connect. Change it with `ALTER USER` inside the database, or start from a fresh
> volume.

If `STORAGE_BACKEND=postgres` is set without a `DATABASE_URL`, the server refuses to
start. That is deliberate: an earlier version fell back to writing JSON files when
the configured backend was unavailable, which stored accounts in a flat file while
the configuration claimed a database, and nothing reported the mismatch.

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
- One PostgreSQL server backs both Keycloak and the app. It is a single point of
  failure and is not replicated: if the volume goes, the backups are what you have.
- No log aggregation or uptime alerting. `docker compose logs` is what you have.
