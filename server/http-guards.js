'use strict';

const fs = require('fs');
const path = require('path');

// ── HTTP mediation layer ─────────────────────────────────────────────────────
//
// Every cross-cutting check a request passes before any route sees it: who may call,
// how often, how large a body, what a static request may reach, and the headers that
// go back. Extracted from server.js because that file had grown past 4000 lines with
// 47 routes in one if-chain, and a guard that lives inside one route body is a guard
// nobody can audit — which is exactly how /api/send-email stayed open.
//
// Dependencies are injected rather than imported, so this module holds no opinion
// about how sessions or configuration work and can be tested on its own.
//
// @param deps.authenticate   async (token) => username | null
// @param deps.getToken       (req) => string
// @param deps.publicBaseUrl  () => string
// @param deps.publicDir      absolute path static files are resolved against
function createGuards({ authenticate, getToken, publicBaseUrl, publicDir }) {
  // ── Request body limits ─────────────────────────────────────────────────────
  //
  // 23 handlers accumulated `body += chunk` with no ceiling: a single POST could grow
  // the string until the process died, and /api/parse-pdf invited it by design since it
  // takes a base64 PDF. Patching 23 call sites would leave the 24th unguarded, so the
  // declared size is checked once before dispatch and the streaming readers cap
  // themselves as a second line.
  const BODY_LIMIT_DEFAULT = 256 * 1024;          // JSON payloads
  const BODY_LIMITS = { '/api/parse-pdf': 12 * 1024 * 1024 };   // a base64 CV

  function bodyLimitFor(pathname) {
    return BODY_LIMITS[pathname] || BODY_LIMIT_DEFAULT;
  }

  /**
   * Refuses on the DECLARED size, before a byte of payload is read. Content-Length is
   * the client's claim, so the readers below still count what actually arrives.
   * @returns true when the request was rejected.
   */
  function enforceBodyLimit(req, res, pathname) {
    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') return false;
    const declared = Number(req.headers['content-length'] || 0);
    const max = bodyLimitFor(pathname);
    if (declared && declared > max) {
      sendJson(res, 413, { error: `Payload too large — limit is ${Math.round(max / 1024)} KB.`, code: 'payload_too_large' });
      return true;
    }
    return false;
  }

  // ── Rate limiting (per IP + bucket, sliding window) ───────────────────────
  // Protects the LLM/embedding endpoints from abuse and runaway API cost. Purely
  // in-memory (fine for a single-process app); resets on restart.
  const _rlBuckets = new Map(); // "ip|bucket" → [timestamps]
  function clientIp(req) {
    const fwd = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    return fwd || (req.socket && req.socket.remoteAddress) || 'unknown';
  }
  // Returns true when the caller has exceeded `max` requests in `windowMs`.
  function rateLimited(req, bucket, max, windowMs) {
    const key = `${clientIp(req)}|${bucket}`;
    const now = Date.now();
    const hits = (_rlBuckets.get(key) || []).filter((t) => now - t < windowMs);
    if (hits.length >= max) { _rlBuckets.set(key, hits); return true; }
    hits.push(now);
    _rlBuckets.set(key, hits);
    return false;
  }
  // Stale buckets are never read again; without this the map grows for every IP that
  // ever called, for the life of the process.
  setInterval(() => {
    const now = Date.now();
    for (const [key, hits] of _rlBuckets) {
      if (!hits.length || now - hits[hits.length - 1] > 60 * 60 * 1000) _rlBuckets.delete(key);
    }
  }, 10 * 60 * 1000).unref();

  // ── Which routes are metered, in one table ──────────────────────────────────
  //
  // Applied centrally before dispatch, not sprinkled through 47 route bodies. The
  // per-route approach is what let /api/send-email stay unmetered and unauthenticated:
  // nothing forces you to remember. A new expensive route added below without an entry
  // here is at least visible in one place.
  //
  // `max` requests per `windowMs`, per client IP, per bucket.
  const HOUR = 60 * 60 * 1000, MIN = 60 * 1000;
  const RATE_LIMITS = [
    // Credentials: brute-force defence, not cost control.
    { path: '/api/login',            bucket: 'login',  max: 10,  windowMs: 15 * MIN, msg: 'Too many sign-in attempts — wait 15 minutes.' },
    { path: '/api/register',         bucket: 'signup', max: 5,   windowMs: HOUR,     msg: 'Too many accounts created from this address.' },
    { path: '/api/account/password', bucket: 'pwd',    max: 10,  windowMs: HOUR,     msg: 'Too many password changes — wait an hour.' },
    // Money: every one of these calls a paid or quota-limited third party.
    { path: '/api/generate-cover',    bucket: 'llm',    max: 20, windowMs: HOUR, msg: 'Generation limit reached — try again later.' },
    { path: '/api/generate-cv',       bucket: 'llm',    max: 20, windowMs: HOUR, msg: 'Generation limit reached — try again later.' },
    { path: '/api/generate-roadmap',  bucket: 'llm',    max: 20, windowMs: HOUR, msg: 'Generation limit reached — try again later.' },
    { path: '/api/generate-interview',bucket: 'llm',    max: 20, windowMs: HOUR, msg: 'Generation limit reached — try again later.' },
    { path: '/api/extract-profile',   bucket: 'llm',    max: 20, windowMs: HOUR, msg: 'Generation limit reached — try again later.' },
    { path: '/api/job-consult',       bucket: 'llm',    max: 20, windowMs: HOUR, msg: 'Generation limit reached — try again later.' },
    { path: '/api/market-report',     bucket: 'llm',    max: 10, windowMs: HOUR, msg: 'Report limit reached — try again later.' },
    // CPU and third-party scraping.
    { path: '/api/parse-pdf',        bucket: 'pdf',    max: 20, windowMs: HOUR, msg: 'Too many PDF uploads — wait a while.' },
    { path: '/api/scrape-all',       bucket: 'scrape', max: 20, windowMs: HOUR, msg: 'Too many searches — wait a while.' },
    { path: '/api/jobs',             bucket: 'scrape', max: 60, windowMs: HOUR, msg: 'Too many searches — wait a while.' },
    { path: '/api/apify-job-search', bucket: 'scrape', max: 20, windowMs: HOUR, msg: 'Too many searches — wait a while.' },
    { path: '/api/apify-indeed-search', bucket: 'scrape', max: 20, windowMs: HOUR, msg: 'Too many searches — wait a while.' },
    { path: '/api/jooble-search',    bucket: 'scrape', max: 20, windowMs: HOUR, msg: 'Too many searches — wait a while.' },
    { path: '/api/job-count',        bucket: 'scrape', max: 120, windowMs: HOUR, msg: 'Too many lookups — wait a while.' },
    { path: '/api/reverse-geocode',  bucket: 'geo',    max: 30, windowMs: HOUR, msg: 'Too many location lookups.' },
    { path: '/api/geolocate-by-ip',  bucket: 'geo',    max: 30, windowMs: HOUR, msg: 'Too many location lookups.' },
    // Multi-agent run: the most expensive single call in the app.
    { path: '/api/pipeline',         bucket: 'llm',    max: 10, windowMs: HOUR, msg: 'Pipeline limit reached — try again later.' },
    // Sends real mail, so it is an abuse channel even though it is cheap to compute.
    { path: '/api/account/resend-confirmation', bucket: 'email', max: 5, windowMs: HOUR, msg: 'Too many confirmation emails — wait an hour.' },
    // A confirmation token is 32 random bytes, so guessing is hopeless — but an
    // unmetered endpoint is still free load, and the limit costs nothing.
    { path: '/api/auth/confirm',     bucket: 'confirm', max: 30, windowMs: HOUR, msg: 'Too many attempts.' },
    // Public and unauthenticated by design, which also makes it the easiest thing on
    // the app to flood. Ten an hour is far more than an honest person needs and far
    // less than a script wants.
    { path: '/api/feedback',         bucket: 'feedback', max: 10, windowMs: HOUR, msg: 'Thanks — you have sent several already. Try again later.' },
  ];

  // ── Which routes require a session, in one table ────────────────────────────
  //
  // Rate limiting bounds abuse; it does not forbid it. A stranger could still spend 20
  // LLM generations an hour on your budget, every hour, for ever. Everything that costs
  // real money or real CPU now needs an account.
  //
  // Enforced before dispatch, like the rate limiter, so a route added later cannot
  // quietly ship without a guard — the failure that left /api/send-email open. The
  // per-route validateToken calls stay where they are: they are the ones that need the
  // username, and a second check costs nothing.
  const AUTH_REQUIRED = new Set([
    // Language-model calls — each one is billed or quota-limited.
    '/api/chat', '/api/generate-cover', '/api/generate-cv', '/api/generate-roadmap',
    '/api/generate-interview', '/api/extract-profile', '/api/job-consult',
    '/api/market-report', '/api/pipeline', '/api/graph-run', '/api/graph-stream',
    '/api/semantic-match',
    // CPU, and a large upload.
    '/api/parse-pdf', '/api/analyze',
    // Paid third-party scrapers (Apify bills per run, Jooble is key-gated).
    '/api/apify-job-search', '/api/apify-indeed-search', '/api/jooble-search', '/api/newplan',
  ]);

  // Job search stays open by default: it is the app's shop window, it runs mostly on
  // free sources, and it is already rate-limited — a visitor should be able to see what
  // the thing does before creating an account. Set PUBLIC_JOB_SEARCH=0 to close it too.
  const PUBLIC_JOB_SEARCH_ROUTES = ['/api/jobs', '/api/scrape-all', '/api/job-count'];
  function authRequiredFor(pathname) {
    if (AUTH_REQUIRED.has(pathname)) return true;
    if (String(process.env.PUBLIC_JOB_SEARCH || '1') === '0'
        && PUBLIC_JOB_SEARCH_ROUTES.includes(pathname)) return true;
    return false;
  }

  /**
   * True when this request should be refused; sends the 401 itself.
   *
   * ASYNC, because looking a session up is a database read once the SQL backend is
   * in use. The caller MUST await it: an un-awaited call returns a Promise, which is
   * always truthy, so `if (enforceAuth(...))` would refuse every request — and the
   * mirror-image mistake inside would let every request through. That is why
   * `validateToken` was renamed to `authenticate` in this refactor: any call site
   * that was not updated throws ReferenceError instead of quietly returning a
   * truthy Promise where a username was expected.
   */
  async function enforceAuth(req, res, pathname) {
    if (!authRequiredFor(pathname)) return false;
    if (await authenticate(getToken(req))) return false;
    sendJson(res, 401, { error: 'Sign in to use this feature.', code: 'login_required' });
    return true;
  }

  /** True when this request should be refused; sends the 429 itself. */
  function enforceRateLimit(req, res, pathname) {
    const rule = RATE_LIMITS.find(r => r.path === pathname);
    if (!rule) return false;
    if (!rateLimited(req, rule.bucket, rule.max, rule.windowMs)) return false;
    sendJson(res, 429, { error: rule.msg, code: 'rate_limited' });
    return true;
  }

  // The SPA is served by this same server, so same-origin requests need no CORS at all.
  // The wildcard that used to sit here let any website on the internet call every public
  // endpoint from a visitor's browser — free use of the LLM budget and the scrapers, and
  // a ready-made amplifier. Named origin only; override with CORS_ORIGIN when a separate
  // front-end host is genuinely needed.
  //
  // Non-browser clients ignore CORS entirely, so this is not an authentication control —
  // it stops other people's web pages from spending your quota, nothing more.
  function corsOrigin() {
    return String(process.env.CORS_ORIGIN || publicBaseUrl()).replace(/\/+$/, '');
  }

  function sendJson(res, status, data) {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': corsOrigin(),
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      // The response varies by origin, so shared caches must not reuse one answer
      // across origins.
      Vary: 'Origin',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    });
    res.end(JSON.stringify(data));
  }

  // Files the browser is allowed to fetch. An ALLOW-LIST, not a deny-list.
  //
  // publicDir is the project root, so this used to hand out every file in it: GET /.env
  // returned every API key and the Keycloak client secret, GET /storage.json returned 14
  // accounts, 10 password hashes and 112 live session tokens, and /.git/config and the
  // whole server source came with it. No traversal trick was needed — the paths are
  // simply what they look like.
  //
  // A deny-list would have to anticipate every future secret file. Naming what the front
  // end actually needs fails closed instead: a new file is unreachable until it is added
  // here on purpose.
  // Derived from what index.html actually loads — checked, not guessed. Adding a new
  // front-end file means adding it here; that is the point.
  const STATIC_ALLOW = new Set([
    '/index.html', '/gdpr-banner.html',
    '/styles.css',
    '/app.js', '/jspdf.umd.min.js',
    '/rerank.js', '/scorer.js', '/security-learning.js', '/security-skills.js', '/skill-matcher.js',
    // Extracted from inline <script> blocks so the CSP can refuse inline script.
    '/theme-boot.js', '/page-boot.js',
  ]);
  // Subdirectories the front end legitimately loads from, with the extensions allowed
  // inside them. Everything else under them stays unreachable.
  const STATIC_DIRS = [{ prefix: '/public/', exts: ['.js', '.css', '.html', '.svg', '.png', '.jpg', '.webp', '.woff2'] }];

  function staticTargetFor(urlPath) {
    if (urlPath === '/') return '/index.html';
    if (STATIC_ALLOW.has(urlPath)) return urlPath;
    for (const d of STATIC_DIRS) {
      if (urlPath.startsWith(d.prefix) && d.exts.includes(path.extname(urlPath).toLowerCase())) {
        return urlPath;
      }
    }
    return null;
  }

  function serveStaticFile(req, res) {
    // The pathname only: req.url carries the query string, and decoding it here keeps
    // %2e%2e style escapes from reaching the filesystem as "..".
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch (_) {
      res.writeHead(400, { 'Content-Type': 'text/plain' }); res.end('Bad request'); return;
    }

    const target = staticTargetFor(urlPath);
    if (!target) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const resolvedPath = path.join(publicDir, target);
    // Belt and braces: even an allow-listed name must resolve inside publicDir.
    if (!path.resolve(resolvedPath).startsWith(path.resolve(publicDir) + path.sep)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return;
    }

    fs.readFile(resolvedPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }

      const ext = path.extname(resolvedPath).toLowerCase();
      const map = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json'
      };

      // No caching for the frontend so users always run the latest code (avoids
      // "fixed but still broken" reports caused by a stale cached app.js).
      res.writeHead(200, {
        'Content-Type': map[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store, max-age=0',
        ...securityHeaders(),
      });
      res.end(data);
    });
  }

  // ── Security headers ────────────────────────────────────────────────────────
  //
  // script-src has NO 'unsafe-inline': the two inline <script> blocks that used to force
  // it were moved into theme-boot.js and page-boot.js. An injected <script> now does not
  // execute, which is the whole point of a CSP.
  //
  // style-src keeps 'unsafe-inline' for 44 inline style attributes in the markup — a far
  // smaller concession, since CSS injection cannot run code.
  //
  // cdn.jsdelivr.net is loaded on demand for tesseract.js (OCR of image-only CVs).
  // connect-src allows https: because the browser talks to the OIDC provider, whose
  // host is configuration rather than a constant.
  function securityHeaders() {
    const headers = {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join('; '),
      // Stops a browser from second-guessing Content-Type — the classic way a served
      // .json or .txt gets executed as script.
      'X-Content-Type-Options': 'nosniff',
      // Clickjacking. frame-ancestors above covers modern browsers; this covers the rest.
      'X-Frame-Options': 'DENY',
      // CVs and job searches are private; never leak the URL to third-party sites.
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'geolocation=(self), camera=(), microphone=(), payment=()',
    };
    // HSTS only where TLS actually terminates. Sent over plain HTTP it is ignored, and
    // on localhost it would pin the whole machine's localhost to HTTPS for a year —
    // a genuinely painful thing to undo.
    if (String(process.env.ENABLE_HSTS || '') === '1') {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    }
    return headers;
  }
  return {
    sendJson,
    corsOrigin,
    securityHeaders,
    serveStaticFile,
    bodyLimitFor,
    rateLimited,
    enforceAuth,
    enforceRateLimit,
    enforceBodyLimit,
    // exported for tests
    _internals: { staticTargetFor, authRequiredFor, AUTH_REQUIRED, RATE_LIMITS, STATIC_ALLOW },
  };
}

module.exports = { createGuards };
