/**
 * routes/admin.js — GET /api/admin/db
 *
 * Returns a sanitised snapshot of the database (no passwords).
 * Requires a valid session token — any logged-in user can view.
 */

const authLib = require('../auth');
const storage = require('../storage');
const pdfParser = require('../pdf-parser');

function readBody(req) {
  return new Promise(resolve => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end',  () => { try { resolve(JSON.parse(raw || '{}')); } catch (_) { resolve({}); } });
  });
}

async function dbSnapshot(req, res, send) {
  const token    = authLib.extractToken(req);
  const username = token ? authLib.validateToken(token) : null;
  if (!username) return send(res, 401, { error: 'Login required.' });

  const sessions = storage.countSessions();
  send(res, 200, {
    users:            storage.allUsers(),
    totalUsers:       storage.allUsers().length,
    activeSessions:   sessions.active,
    expiredTokens:    sessions.expired,
    applicationUsers: storage.allApplicationSummaries().length,
    applications:     storage.allApplicationSummaries()
  });
}

async function parsePdf(req, res, send) {
  const { pdf } = await readBody(req);
  if (!pdf) return send(res, 400, { error: 'pdf base64 string required.' });
  try {
    const buffer = Buffer.from(pdf, 'base64');
    const text   = pdfParser.extractText(buffer);
    if (!text || text.length < 10) {
      return send(res, 422, { error: 'No readable text found. Please paste your CV manually.' });
    }
    send(res, 200, { text });
  } catch (err) {
    send(res, 400, { error: 'PDF parse failed: ' + err.message });
  }
}

module.exports = { dbSnapshot, parsePdf };
