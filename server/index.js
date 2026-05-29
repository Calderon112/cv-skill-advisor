/**
 * server/index.js — HTTP server entry point.
 *
 * Responsibilities:
 *   • Load environment variables and storage
 *   • Dispatch incoming requests to the correct route handler
 *   • Serve static files from /public
 *
 * Start with:  node server/index.js
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

// ── SSL bypass (dev only — Windows blocks external HTTPS by default) ───────
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// ── Load .env ──────────────────────────────────────────────────────────────
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  });
}

// ── Modules ────────────────────────────────────────────────────────────────
const storage      = require('./storage');
const analysis     = require('./analysis');
const authRoute    = require('./routes/auth');
const jobsRoute    = require('./routes/jobs');
const scrapeRoute  = require('./routes/scrape');
const appsRoute    = require('./routes/applications');
const adminRoute   = require('./routes/admin');

storage.load();

// ── Helpers ────────────────────────────────────────────────────────────────
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon'
};

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  const urlPath  = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(PUBLIC_DIR, urlPath);

  // Security: prevent path traversal outside public/
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ── Router ─────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = parsed;

  if (req.method === 'OPTIONS') { send(res, 204, {}); return; }

  // ── Status ─────────────────────────────────────────────────────────────
  if (pathname === '/api/status' && req.method === 'GET') {
    return send(res, 200, { status: 'ok', version: '2.0' });
  }

  // ── Auth ───────────────────────────────────────────────────────────────
  if (pathname === '/api/register' && req.method === 'POST') return authRoute.register(req, res, send);
  if (pathname === '/api/login'    && req.method === 'POST') return authRoute.login(req, res, send);
  if (pathname === '/api/profile'  && req.method === 'POST') return authRoute.saveProfile(req, res, send);

  // ── CV analysis ────────────────────────────────────────────────────────
  if (pathname === '/api/analyze' && req.method === 'POST') {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end', () => {
      try {
        const { text } = JSON.parse(raw || '{}');
        send(res, 200, analysis.analyzeCV(text || ''));
      } catch (_) { send(res, 400, { error: 'Invalid payload.' }); }
    });
    return;
  }

  // ── PDF parsing ────────────────────────────────────────────────────────
  if (pathname === '/api/parse-pdf' && req.method === 'POST') return adminRoute.parsePdf(req, res, send);

  // ── Jobs ───────────────────────────────────────────────────────────────
  if (pathname === '/api/jobs'      && req.method === 'GET')  return jobsRoute.handle(req, res, send, parsed);
  if (pathname === '/api/scrape-all'&& req.method === 'POST') return scrapeRoute.handle(req, res, send);

  // ── Applications ───────────────────────────────────────────────────────
  if (pathname === '/api/applications' && req.method === 'GET')  return appsRoute.list(req, res, send);
  if (pathname === '/api/applications' && req.method === 'POST') return appsRoute.create(req, res, send);
  if (pathname.startsWith('/api/applications/') && req.method === 'PUT') {
    const id = pathname.slice('/api/applications/'.length);
    return appsRoute.update(req, res, send, id);
  }
  if (pathname.startsWith('/api/applications/') && req.method === 'DELETE') {
    const id = pathname.slice('/api/applications/'.length);
    return appsRoute.remove(req, res, send, id);
  }

  // ── Admin ──────────────────────────────────────────────────────────────
  if (pathname === '/api/admin/db' && req.method === 'GET') return adminRoute.dbSnapshot(req, res, send);

  // ── Static files ───────────────────────────────────────────────────────
  serveStatic(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`CareerAI server running → http://localhost:${PORT}`);
  console.log(`Public files served from: ${PUBLIC_DIR}`);
});
