/**
 * routes/applications.js — /api/applications CRUD
 *
 * All operations require a valid session token.
 * Data is stored per-user in storage.json.
 */

const authLib = require('../auth');
const storage = require('../storage');

function readBody(req) {
  return new Promise(resolve => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end',  () => { try { resolve(JSON.parse(raw || '{}')); } catch (_) { resolve({}); } });
  });
}

function requireAuth(req, res, send) {
  const token    = authLib.extractToken(req);
  const username = token ? authLib.validateToken(token) : null;
  if (!username) { send(res, 401, { error: 'Login required to manage applications.' }); return null; }
  return username;
}

async function list(req, res, send) {
  const username = requireAuth(req, res, send);
  if (!username) return;
  send(res, 200, { applications: storage.getApplications(username) });
}

async function create(req, res, send) {
  const username = requireAuth(req, res, send);
  if (!username) return;
  const app = await readBody(req);
  if (!app.title || !app.company) return send(res, 400, { error: 'title and company are required.' });
  const apps = storage.addApplication(username, app);
  send(res, 200, { applications: apps });
}

async function update(req, res, send, id) {
  const username = requireAuth(req, res, send);
  if (!username) return;
  const updates = await readBody(req);
  const apps    = storage.updateApplication(username, id, updates);
  send(res, 200, { applications: apps });
}

async function remove(req, res, send, id) {
  const username = requireAuth(req, res, send);
  if (!username) return;
  const apps = storage.removeApplication(username, id);
  send(res, 200, { applications: apps });
}

module.exports = { list, create, update, remove };
