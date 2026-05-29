/**
 * storage.js — JSON file-based persistence layer.
 *
 * All reads and writes go through this module.
 * The rest of the server only calls the exported functions;
 * it never touches storage.json directly.
 */

const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'storage.json');

let db = { profiles: {}, tokens: {}, users: {}, applications: {} };

// ── Load / Save ───────────────────────────────────────────────────────────

function load() {
  try {
    if (fs.existsSync(FILE)) {
      db = JSON.parse(fs.readFileSync(FILE, 'utf8') || '{}');
    }
    db.profiles     = db.profiles     || {};
    db.tokens       = db.tokens       || {};
    db.users        = db.users        || {};
    db.applications = db.applications || {};
  } catch (err) {
    console.error('[storage] load failed:', err.message);
    db = { profiles: {}, tokens: {}, users: {}, applications: {} };
  }
}

function save() {
  try { fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8'); }
  catch (err) { console.error('[storage] save failed:', err.message); }
}

// ── Users ─────────────────────────────────────────────────────────────────

function getUser(username) {
  const data = db.users[username];
  if (!data) return null;
  return { username, ...data };   // always include the username field
}

function userExists(username) {
  return Boolean(db.users[username]);
}

function createUser(username, hashedPassword, name) {
  db.users[username] = { password: hashedPassword, name };
  save();
}

function allUsers() {
  return Object.entries(db.users).map(([username, d]) => ({
    username,
    name:           d.name,
    passwordHashed: d.password?.includes(':')
  }));
}

// ── Sessions (tokens) ─────────────────────────────────────────────────────

function storeToken(token, username) {
  db.tokens[token] = {
    username,
    created: Date.now(),
    expires: Date.now() + 24 * 60 * 60 * 1000   // 24 h
  };
  save();
  return token;
}

function lookupToken(token) {
  if (!token) return null;
  const session = db.tokens[token];
  if (!session) return null;
  if (session.expires && Date.now() > session.expires) {
    delete db.tokens[token];
    save();
    return null;
  }
  return session.username || null;
}

function countSessions() {
  const now = Date.now();
  const all = Object.values(db.tokens);
  return {
    active:  all.filter(t => t.expires > now).length,
    expired: all.filter(t => t.expires <= now).length
  };
}

// ── CV Profiles ───────────────────────────────────────────────────────────

function getProfile(token) {
  return db.profiles[token] || '';
}

function saveProfile(token, text) {
  db.profiles[token] = text;
  save();
}

// ── Applications ──────────────────────────────────────────────────────────

function getApplications(username) {
  return db.applications[username] || [];
}

function addApplication(username, app) {
  if (!db.applications[username]) db.applications[username] = [];
  const exists = db.applications[username].find(a => a.id === app.id);
  if (!exists) db.applications[username].push({ ...app, status: app.status || 'applied' });
  save();
  return db.applications[username];
}

function updateApplication(username, id, updates) {
  if (!db.applications[username]) return [];
  db.applications[username] = db.applications[username].map(a =>
    a.id === id ? { ...a, ...updates } : a
  );
  save();
  return db.applications[username];
}

function removeApplication(username, id) {
  if (!db.applications[username]) return [];
  db.applications[username] = db.applications[username].filter(a => a.id !== id);
  save();
  return db.applications[username];
}

function allApplicationSummaries() {
  return Object.entries(db.applications).map(([user, apps]) => ({
    user,
    count: apps.length,
    apps:  apps.map(a => ({ title: a.title, company: a.company, status: a.status }))
  }));
}

module.exports = {
  load, save,
  getUser, userExists, createUser, allUsers,
  storeToken, lookupToken, countSessions,
  getProfile, saveProfile,
  getApplications, addApplication, updateApplication, removeApplication, allApplicationSummaries
};
