// ── Generic OIDC relying party ───────────────────────────────────────────────
//
// One implementation, any provider. Nothing here is specific to Keycloak, Google
// or GitHub: everything is read from the provider's OpenID discovery document
// (/.well-known/openid-configuration), so adding a provider is a .env change, not
// a code change. That is what makes "and many others" cheap.
//
// The intended shape is a self-hosted identity provider (Keycloak, Authentik,
// Zitadel, Logto) which itself brokers Google/GitHub/LinkedIn. The app then knows
// about exactly one login button, and the admin console of the IdP is where
// accounts and social connections are managed.
//
// Flow implemented: Authorization Code + PKCE (S256).
//   1. /api/auth/:provider/start   → 302 to the IdP's authorization endpoint
//   2. user authenticates at the IdP (its own form, its own social buttons)
//   3. /api/auth/callback?code=…   → exchange code for tokens, fetch userinfo
//
// Registration goes through the provider too (buildAuthUrl with { register: true }),
// so there is exactly one place where an account can be created and exactly one
// place where accounts are administered. Signing out uses the provider's
// end_session_endpoint (buildLogoutUrl): dropping only our own session cookie would
// leave the IdP session live, and the next "sign in" would silently walk straight
// back in without ever showing a form.
//
'use strict';

const crypto = require('crypto');

const DISCOVERY_TTL_MS = 10 * 60 * 1000;  // re-read discovery every 10 minutes
const STATE_TTL_MS     = 10 * 60 * 1000;  // a login attempt must complete in 10 min

const b64url = (buf) => Buffer.from(buf).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// ── Provider registry, from the environment ─────────────────────────────────
//
//   OIDC_PROVIDERS=keycloak,google
//   OIDC_KEYCLOAK_ISSUER=http://localhost:8080/realms/careerai
//   OIDC_KEYCLOAK_CLIENT_ID=careerai-web
//   OIDC_KEYCLOAK_CLIENT_SECRET=…
//   OIDC_KEYCLOAK_LABEL=Keycloak            (button text, optional)
//   OIDC_KEYCLOAK_SCOPES=openid profile email   (optional)
//
function loadProviders(env) {
  const ids = String(env.OIDC_PROVIDERS || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  const providers = new Map();
  for (const id of ids) {
    const KEY = id.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const issuer = String(env[`OIDC_${KEY}_ISSUER`] || '').replace(/\/+$/, '');
    const clientId = env[`OIDC_${KEY}_CLIENT_ID`] || '';
    if (!issuer || !clientId) continue;   // half-configured provider → not offered
    providers.set(id, {
      id,
      issuer,
      // Where *this server* reaches the provider, when that differs from the URL
      // the browser uses. In Docker the browser hits http://localhost:8080 while
      // the app container must use http://keycloak:8080 — same provider, two
      // routes. Only back-channel calls (discovery, token, userinfo) use this; the
      // authorization redirect always uses the public issuer, since that one is
      // followed by the browser.
      internalIssuer: String(env[`OIDC_${KEY}_INTERNAL_ISSUER`] || '').replace(/\/+$/, '') || issuer,
      clientId,
      clientSecret: env[`OIDC_${KEY}_CLIENT_SECRET`] || '',
      label:  env[`OIDC_${KEY}_LABEL`]  || id.charAt(0).toUpperCase() + id.slice(1),
      scopes: env[`OIDC_${KEY}_SCOPES`] || 'openid profile email',
      // Escape hatch for providers whose sign-up page we cannot derive (see
      // registrationTarget below). Rarely needed; Keycloak never needs it.
      registrationEndpoint: String(env[`OIDC_${KEY}_REGISTRATION_ENDPOINT`] || '').trim(),
    });
  }
  return providers;
}

// Built on first use, NOT at module load. server.js parses .env *after* its
// requires, so reading process.env eagerly here saw an empty environment and
// silently offered no providers at all.
let providers = null;
function registry() {
  if (!providers) providers = loadProviders(process.env);
  return providers;
}

/** Providers safe to expose to the browser — never the client secret. */
function publicProviders() {
  return [...registry().values()].map(p => ({ id: p.id, label: p.label }));
}

function isAvailable() { return registry().size > 0; }
function getProvider(id) { return registry().get(String(id || '').toLowerCase()) || null; }

// Re-read the environment (used by tests; also handy after editing .env).
function reload(env) { providers = loadProviders(env || process.env); return publicProviders(); }

// ── Discovery ───────────────────────────────────────────────────────────────
const discoveryCache = new Map();   // issuer → { doc, fetchedAt }

// Rewrite a back-channel endpoint onto the route this server can actually reach.
// The provider advertises its public URLs; when we talk to it over a private
// network name those URLs are unreachable from here.
function toInternal(provider, endpoint) {
  if (provider.internalIssuer === provider.issuer) return endpoint;
  const url = String(endpoint || '');
  return url.startsWith(provider.issuer)
    ? provider.internalIssuer + url.slice(provider.issuer.length)
    : url;
}

async function discover(provider) {
  const hit = discoveryCache.get(provider.issuer);
  if (hit && Date.now() - hit.fetchedAt < DISCOVERY_TTL_MS) return hit.doc;

  const url = `${provider.internalIssuer}/.well-known/openid-configuration`;
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`OIDC discovery failed for ${provider.id} (HTTP ${r.status} from ${url})`);
  const doc = await r.json();

  // The spec requires the issuer in the document to match the one we asked, or a
  // rogue endpoint could impersonate a provider we trust. Compared against the
  // *public* issuer: that is the provider's canonical identity, and the value that
  // will appear in the ID token regardless of which route we used to reach it.
  const declared = String(doc.issuer || '').replace(/\/+$/, '');
  if (declared !== provider.issuer) {
    throw new Error(`OIDC issuer mismatch for ${provider.id}: configured ${provider.issuer}, document says ${declared}`);
  }
  if (!doc.authorization_endpoint || !doc.token_endpoint) {
    throw new Error(`OIDC discovery for ${provider.id} is missing authorization_endpoint or token_endpoint`);
  }

  discoveryCache.set(provider.issuer, { doc, fetchedAt: Date.now() });
  return doc;
}

// ── Pending login attempts (state / PKCE / nonce) ────────────────────────────
//
// Held in memory, not in storage.json: these live for seconds, are useless after
// the callback, and must not survive a restart. Single-use — a replayed `state`
// finds nothing and is rejected.
const pending = new Map();

function sweepPending() {
  const now = Date.now();
  for (const [state, entry] of pending) {
    if (now - entry.createdAt > STATE_TTL_MS) pending.delete(state);
  }
}

// ── Where "create an account" sends the browser ─────────────────────────────
//
// There is no single way to ask an OIDC provider for its sign-up form, so this
// tries three, most-reliable first:
//
//   1. OIDC_<ID>_REGISTRATION_ENDPOINT, if the operator set one.
//   2. Keycloak's /registrations endpoint. It is the sibling of the authorization
//      endpoint, takes the identical query parameters, and has existed in every
//      Keycloak version — unlike prompt=create, which needs Keycloak 25+.
//   3. prompt=create (OIDC "Initiating User Registration", advertised in discovery
//      as prompt_values_supported).
//
// If none apply we return null and the caller sends the user to the normal login
// page, which for every provider we know of carries its own "Register" link. That
// degrades to one extra click — never to a local password form.
//
// @returns {{ endpoint?: string, prompt?: string } | null}
function registrationTarget(provider, doc) {
  if (provider.registrationEndpoint) return { endpoint: provider.registrationEndpoint };

  const authEndpoint = String(doc.authorization_endpoint || '');
  if (authEndpoint.endsWith('/protocol/openid-connect/auth')) {
    return { endpoint: authEndpoint.replace(/\/auth$/, '/registrations') };
  }

  const prompts = Array.isArray(doc.prompt_values_supported) ? doc.prompt_values_supported : [];
  if (prompts.includes('create')) return { prompt: 'create' };

  return null;
}

/** Whether this provider can host a sign-up form (used to decide if the button shows). */
async function supportsRegistration(providerId) {
  const provider = getProvider(providerId);
  if (!provider) return false;
  try {
    return registrationTarget(provider, await discover(provider)) !== null;
  } catch (_) {
    return false;   // provider unreachable — do not offer a button that cannot work
  }
}

/**
 * Begin a login. Returns the URL to redirect the browser to.
 * @param providerId  key from OIDC_PROVIDERS
 * @param redirectUri must exactly match a redirect URI registered at the IdP
 * @param opts        { linkTo } — username to link this identity to instead of
 *                    signing in, used by the account page's "Link" button.
 *                    { register } — ask for the provider's sign-up form instead of
 *                    its sign-in form. The callback is identical either way: the
 *                    provider creates the account, then redirects back with a code.
 */
async function buildAuthUrl(providerId, redirectUri, opts) {
  const provider = getProvider(providerId);
  if (!provider) throw new Error(`Unknown OIDC provider: ${providerId}`);
  const doc = await discover(provider);

  sweepPending();

  const state        = b64url(crypto.randomBytes(32));
  const nonce        = b64url(crypto.randomBytes(32));
  const codeVerifier = b64url(crypto.randomBytes(32));
  const codeChallenge = b64url(crypto.createHash('sha256').update(codeVerifier).digest());

  pending.set(state, {
    providerId: provider.id,
    codeVerifier,
    nonce,
    redirectUri,
    linkTo: (opts && opts.linkTo) || null,
    createdAt: Date.now(),
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    scope: provider.scopes,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  let endpoint = doc.authorization_endpoint;
  if (opts && opts.register) {
    const target = registrationTarget(provider, doc);
    if (target && target.endpoint) endpoint = target.endpoint;
    else if (target && target.prompt) params.set('prompt', target.prompt);
    // else: fall through to the login page and let the user click "Register" there.
  }
  return `${endpoint}?${params.toString()}`;
}

/**
 * RP-initiated logout (OIDC Session Management). Ends the session at the provider,
 * not just here, then returns the browser to `postLogoutRedirectUri`.
 *
 * `idToken` is what makes this seamless: with it the provider knows exactly which
 * session to end and skips its "really sign out?" confirmation page. Without it we
 * fall back to client_id, which still works but may prompt.
 *
 * Built from the *public* end_session_endpoint — the browser follows this URL, so
 * the internal Docker route would be unreachable.
 *
 * @returns the URL, or null when the provider advertises no logout endpoint.
 */
async function buildLogoutUrl(providerId, opts) {
  const provider = getProvider(providerId);
  if (!provider) return null;
  const doc = await discover(provider);
  if (!doc.end_session_endpoint) return null;

  const params = new URLSearchParams();
  if (opts && opts.idToken) params.set('id_token_hint', opts.idToken);
  else params.set('client_id', provider.clientId);
  if (opts && opts.postLogoutRedirectUri) {
    params.set('post_logout_redirect_uri', opts.postLogoutRedirectUri);
    // Keycloak rejects a post_logout_redirect_uri that is not registered on the
    // client unless it can tie the request to a client, so send both.
    if (!params.has('client_id')) params.set('client_id', provider.clientId);
  }
  return `${doc.end_session_endpoint}?${params.toString()}`;
}

// A JWT payload we decode but do not signature-verify. That is sound *here* and
// only here: the token came to us over TLS straight from the IdP's token endpoint
// in response to our own authenticated request, which OIDC Core §3.1.3.7 accepts
// in place of signature validation. We still check issuer/audience/expiry/nonce,
// and treat /userinfo as the authoritative source for identity claims.
function decodeJwtPayload(jwt) {
  const parts = String(jwt || '').split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch (_) { return null; }
}

/**
 * Finish a login: validate `state`, exchange `code`, and return the identity.
 * @returns { providerId, linkTo, sub, email, emailVerified, name, preferredUsername }
 */
async function handleCallback(query) {
  const { code, state, error, error_description: errorDescription } = query;

  if (error) throw new Error(`The identity provider refused the login: ${errorDescription || error}`);
  if (!code || !state) throw new Error('Missing code or state in the callback');

  sweepPending();
  const entry = pending.get(state);
  // Single-use: consume it before anything can go wrong, so a replay finds nothing.
  pending.delete(state);
  if (!entry) throw new Error('Unknown, expired or already-used login state — start the login again');

  const provider = getProvider(entry.providerId);
  if (!provider) throw new Error(`Provider ${entry.providerId} is no longer configured`);
  const doc = await discover(provider);

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: entry.redirectUri,
    client_id: provider.clientId,
    code_verifier: entry.codeVerifier,
  });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' };
  // Confidential clients authenticate with HTTP Basic; public clients (no secret,
  // e.g. a Keycloak client with "Client authentication" off) rely on PKCE alone.
  if (provider.clientSecret) {
    headers.Authorization = 'Basic ' + Buffer.from(
      `${encodeURIComponent(provider.clientId)}:${encodeURIComponent(provider.clientSecret)}`
    ).toString('base64');
  }

  const tokenRes = await fetch(toInternal(provider, doc.token_endpoint), { method: 'POST', headers, body });
  const tokens = await tokenRes.json().catch(() => null);
  if (!tokenRes.ok || !tokens) {
    const detail = tokens && (tokens.error_description || tokens.error);
    throw new Error(`Token exchange failed (HTTP ${tokenRes.status})${detail ? ': ' + detail : ''}`);
  }

  const claims = decodeJwtPayload(tokens.id_token) || {};
  if (tokens.id_token) {
    const iss = String(claims.iss || '').replace(/\/+$/, '');
    if (iss && iss !== provider.issuer) throw new Error('ID token issuer does not match the configured provider');
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud].filter(Boolean);
    if (aud.length && !aud.includes(provider.clientId)) throw new Error('ID token was not issued for this client');
    if (claims.exp && Date.now() / 1000 > Number(claims.exp)) throw new Error('ID token has expired');
    // Binds this token to the authorization request we started — replay defence.
    if (claims.nonce && claims.nonce !== entry.nonce) throw new Error('ID token nonce does not match the login request');
  }

  // /userinfo is authoritative and reflects the current state of the account at
  // the IdP; the ID token is a snapshot from login time.
  let info = {};
  if (doc.userinfo_endpoint && tokens.access_token) {
    try {
      const r = await fetch(toInternal(provider, doc.userinfo_endpoint), {
        headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: 'application/json' },
      });
      if (r.ok) info = await r.json();
    } catch (_) { /* fall back to the ID token claims */ }
  }

  const merged = { ...claims, ...info };
  const sub = merged.sub;
  if (!sub) throw new Error('The identity provider returned no subject identifier');

  return {
    providerId: provider.id,
    providerLabel: provider.label,
    linkTo: entry.linkTo,
    // Kept so signing out can end the session at the provider too. It is a bearer
    // artifact, so the caller stores it with the session and nowhere else — never
    // in a URL, never sent to the browser.
    idToken: String(tokens.id_token || ''),
    sub: String(sub),
    email: String(merged.email || '').trim().toLowerCase(),
    // Only a provider-asserted verified email may auto-link to an existing local
    // account. Trusting an unverified one would let anyone who can register that
    // address at the IdP take over the matching CareerAI account.
    emailVerified: merged.email_verified === true || merged.email_verified === 'true',
    name: String(merged.name || [merged.given_name, merged.family_name].filter(Boolean).join(' ') || '').trim(),
    preferredUsername: String(merged.preferred_username || '').trim(),
  };
}

module.exports = {
  isAvailable,
  publicProviders,
  getProvider,
  reload,
  buildAuthUrl,
  buildLogoutUrl,
  supportsRegistration,
  handleCallback,
  // exported for tests
  _internals: { loadProviders, decodeJwtPayload, registrationTarget, pending },
};
