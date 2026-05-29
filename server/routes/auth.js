/**
 * routes/auth.js — /api/register, /api/login, /api/profile
 */

const storage  = require('../storage');
const authLib  = require('../auth');

function readBody(req) {
  return new Promise(resolve => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end',  () => { try { resolve(JSON.parse(raw || '{}')); } catch (_) { resolve({}); } });
  });
}

async function register(req, res, send) {
  const { name, username, password } = await readBody(req);
  if (!name || !username || !password) {
    return send(res, 400, { error: 'Name, username, and password are required.' });
  }
  if (storage.userExists(username)) {
    return send(res, 409, { error: 'Username already exists.' });
  }
  storage.createUser(username, authLib.hashPassword(password), name);
  const token = authLib.createToken(username);
  send(res, 200, { token, user: { name, username } });
}

async function login(req, res, send) {
  const { username, password } = await readBody(req);
  const user = storage.getUser(username);
  if (!user || !authLib.verifyPassword(password, user.password)) {
    return send(res, 401, { error: 'Invalid username or password.' });
  }
  const token = authLib.createToken(username);
  send(res, 200, { token, user: { name: user.name, username } });
}

async function saveProfile(req, res, send, username) {
  const token = authLib.extractToken(req);
  if (!token) return send(res, 401, { error: 'Authorization required to save profile.' });
  const { profile } = await readBody(req);
  if (!profile || typeof profile !== 'string') {
    return send(res, 400, { error: 'profile text is required.' });
  }
  storage.saveProfile(token, profile.trim());
  send(res, 200, { status: 'ok' });
}

module.exports = { register, login, saveProfile };
