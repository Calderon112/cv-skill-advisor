# Identity & accounts

Two things were added: a **My Account** page (identity manager) and **sign-in through
an identity provider**.

Both are optional. With no provider configured the app behaves exactly as before —
username and password — and the account page still works.

---

## How the provider sign-in works

```
  browser                 CareerAI                     identity provider
     │                        │                              │
     │  click "Continue with" │                              │
     ├───────────────────────►│                              │
     │                        │  302 to /authorize           │
     │◄───────────────────────┤   (+ state, PKCE, nonce)     │
     │                                                       │
     │  the provider's own login form ─────────────────────► │
     │  (its own Google / GitHub buttons live here)          │
     │                                                       │
     │◄──────────────── 302 to /api/auth/callback?code=… ────┤
     ├───────────────────────►│                              │
     │                        │  POST /token   (code+verifier)
     │                        ├─────────────────────────────►│
     │                        │◄──── id_token + access_token │
     │                        │  GET /userinfo               │
     │                        ├─────────────────────────────►│
     │                        │◄──── sub, email, name        │
     │  302 to /#auth_token=… │                              │
     │◄───────────────────────┤                              │
```

The flow is **Authorization Code + PKCE (S256)**. There is no provider-specific code
anywhere: everything comes from the provider's discovery document at
`<issuer>/.well-known/openid-configuration`. See [server/oidc.js](../server/oidc.js).

**Why one IdP rather than one button per network.** Point CareerAI at a single
self-hosted provider and configure Google, GitHub, LinkedIn and Microsoft *inside
that provider*. Adding a network is then a config change in its admin console, and
this app never learns a new API. That admin console is also where you see every
account and every session.

---

## Two views of "all accounts" — read this first

There are **two separate account stores**, and they show different things. This
matters if you expect the Keycloak console to list everyone.

| Where | Shows | Does **not** show |
|-------|-------|-------------------|
| **CareerAI → Admin page** | *Every* account: password accounts and provider accounts, with sign-in methods and who is online | — |
| **Keycloak → admin console** | Only users who exist **in Keycloak**, and their Keycloak sessions | Accounts created directly in CareerAI with username + password |

Your existing accounts (`jkenne`, `jardel`, `mec`, …) live in `storage.json`. They
were never created in Keycloak, so **they will not appear in the Keycloak console** —
no matter how it is configured. Keycloak only knows the users who authenticate
through it.

So:

- To see **everyone**, use the CareerAI **Admin** page (`ADMIN_USERS` in `.env`).
- To see **who Keycloak authenticated, and manage their social connections**, use the
  Keycloak console.

If you want Keycloak to be the single source of truth for every user, that is a
migration: stop offering password login, create the existing people as Keycloak
users, and let them link by verified email on first sign-in. Not done here.

---

## Setup with Keycloak

### 0. Choose where the app runs

The OIDC redirect URI and the issuer must be reachable **both** from your browser
and from the Node process. That makes the deployment mode significant.

**Mode A — app on the host, Keycloak in Docker (recommended, simplest).**
`localhost:8080` resolves the same way for the browser and for Node.

```bash
docker compose --profile identity up keycloak   # note the trailing service name
npm start                                       # app on the host
```

> Name the service. `--profile identity up` on its own starts Keycloak **plus** the
> default `cybercareer` service — profiles *add* services, they do not restrict to
> them. If the app is already running on the host, that second copy fails with
> `ports are not available: … 0.0.0.0:3000`. Harmless, but Keycloak stays up and
> the error is confusing.

**Mode B — both in Docker.** Inside the app container `localhost:8080` is the *app
container itself*, not Keycloak. Two routes to the same provider are needed, which
is what `OIDC_*_INTERNAL_ISSUER` is for:

```ini
OIDC_KEYCLOAK_ISSUER=http://localhost:8080/realms/careerai           # the browser's route
OIDC_KEYCLOAK_INTERNAL_ISSUER=http://keycloak:8080/realms/careerai   # the container's route
```

The login redirect uses the public issuer (the browser follows it); discovery, the
token exchange and `/userinfo` use the internal one. The issuer identity is still
validated against the public URL, which is what appears in the ID token.

### 1. Start it

```bash
docker compose --profile identity up
```

Keycloak comes up on <http://localhost:8080>. First start takes a minute or two
while it initialises its database.

### Logging into the Keycloak console

1. Open <http://localhost:8080>
2. Click **Administration Console**
3. Sign in with `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD` — **`admin` / `admin`**
   unless you set them in `.env`. Change them before exposing this anywhere.

Where to look once inside (select the `careerai` realm first, top-left):

| To see | Go to |
|--------|-------|
| All Keycloak users | **Users** (leave the search box empty → *List all users*) |
| Who is signed in right now | **Sessions** — every active session across the realm |
| Sessions for one person | **Users → …→ Sessions** tab |
| Which social logins are wired up | **Identity providers** |
| Sign someone out | **Sessions →** the row's **⋮ → Sign out**, or **Users → … → Sessions** |

> If **Sessions** is empty, nobody has logged in *through Keycloak* yet. Password
> logins straight into CareerAI never reach Keycloak and so never appear here.

### 2. Create a realm and a client

In the admin console:

1. **Create realm** → name it `careerai`.
2. **Clients → Create client**
   - Client ID: `careerai-web`
   - Client authentication: **On** (confidential — this app keeps a secret server-side)
   - Valid redirect URIs: `http://localhost:3000/api/auth/callback`
   - Valid post logout redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`
3. **Credentials** tab → copy the client secret.

### 3. Tell CareerAI about it

In `.env`:

```ini
PUBLIC_BASE_URL=http://localhost:3000
OIDC_PROVIDERS=keycloak
OIDC_KEYCLOAK_ISSUER=http://localhost:8080/realms/careerai
OIDC_KEYCLOAK_CLIENT_ID=careerai-web
OIDC_KEYCLOAK_CLIENT_SECRET=<the secret you just copied>
OIDC_KEYCLOAK_LABEL=Keycloak
```

Restart the app. A **Continue with Keycloak** button appears on the login screen.

### 4. Add Google / GitHub / … inside Keycloak

**Identity providers → Add provider**, pick Google or GitHub, and paste the client
id/secret you get from:

- Google → <https://console.cloud.google.com> → APIs & Services → Credentials
- GitHub → Settings → Developer settings → OAuth Apps

The redirect URI to register **at Google/GitHub** is Keycloak's, not this app's:

```
http://localhost:8080/realms/careerai/broker/google/endpoint
http://localhost:8080/realms/careerai/broker/github/endpoint
```

Nothing changes in CareerAI. The new network simply appears as a button on
Keycloak's login page.

> You must create those OAuth apps yourself — the client id and secret are tied to
> your Google/GitHub account and cannot be generated from here.

---

## Other providers

`OIDC_PROVIDERS` accepts any number of entries, and any OIDC-compliant provider
works with no code change. Alternatives to Keycloak, all open source:

| Provider  | Notes                                                   |
|-----------|---------------------------------------------------------|
| Authentik | Friendlier admin UI, Python; needs Postgres + Redis     |
| Zitadel   | Go, modern, multi-tenant; needs Postgres                |
| Logto     | Lightest to run, good developer UX; needs Postgres      |
| Keycloak  | Most documented, single container in dev mode (default) |

You can also point straight at a public provider (`OIDC_GOOGLE_ISSUER=https://accounts.google.com`)
and skip self-hosting — but then each network is its own block in `.env`, and there
is no single admin console listing your users.

**GitHub is not an OIDC provider** for user login (it is plain OAuth 2.0 and
publishes no discovery document), so it cannot go in `OIDC_PROVIDERS` directly.
Reach it through Keycloak's GitHub broker, as above.

---

## What the account page does

| Section          | Behaviour |
|------------------|-----------|
| Identity         | Display name and email. The email is what links a provider sign-in to an existing account, so it must be unique. |
| Password         | Set or change it. Provider-created accounts have none, so no current password is asked. **Changing it revokes every other session.** |
| Linked accounts  | Link or unlink providers. Unlinking your only sign-in method is refused. |
| Active sessions  | Device, browser, IP, how you signed in, last activity. Revoke one or all others. |
| Danger zone      | Deletes the account, its saved jobs and its server-side profile. |

## Admin page

Visible only with the admin role, granted by `ADMIN_USERS` in `.env`:

```ini
ADMIN_USERS=student
```

It lists every account, each one's sign-in methods, and who is currently online.

> `/api/admin/db` previously required only *a* login, meaning any registered user
> could read every account and every saved application. It is now role-gated.

---

## Security notes

- **PKCE (S256)** on every request, so an intercepted authorization code is useless.
- **`state`** is single-use and expires after 10 minutes — consumed before the token
  exchange, so a replay finds nothing. Held in memory, never persisted.
- **`nonce`** is checked against the ID token, binding it to the request we started.
- **Auto-linking requires `email_verified`.** An unverified email never links to an
  existing account: otherwise anyone able to register your address at the provider
  could take over your CareerAI account. Unverified sign-ins get a fresh account.
- **The session token is returned in the URL fragment**, not the query string.
  Fragments are never sent to a server, so it stays out of access logs and
  `Referer` headers. The app consumes it and scrubs the URL immediately.
- **The ID token's signature is not verified**, and that is deliberate: it arrives
  over TLS as the direct response to our own authenticated call to the token
  endpoint, which OIDC Core §3.1.3.7 accepts in place of signature validation.
  Issuer, audience, expiry and nonce *are* checked, and `/userinfo` is treated as
  the authoritative source of identity claims. If you ever accept tokens from
  anywhere other than your own token-endpoint call, this must become full JWKS
  signature verification.

### Still open

- Sessions last 24 h with no refresh-token rotation; a signed-in user is simply
  logged out afterwards.
- Signing out of CareerAI does not sign the user out of the identity provider
  (no RP-initiated logout yet), so clicking "Continue with…" again may sign them
  straight back in without a prompt.
- `storage.profiles` is keyed by **session token**, not by username — a pre-existing
  quirk, which means the server-side profile text does not follow a user across
  logins. Account deletion cleans up all of that user's entries.
