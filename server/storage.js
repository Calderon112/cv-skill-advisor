const fs = require('fs');
const path = require('path');
const { LowSync } = require('lowdb');
const { JSONFileSync } = require('lowdb/node');

const DEFAULT_STORAGE = {
  profiles: {},
  tokens: {},
  users: {},
  applications: {},
  emailTokens: {}
};

function createDb(storageFile) {
  const filePath = storageFile || path.join(__dirname, '..', 'storage.json');
  const adapter = new JSONFileSync(filePath);
  return new LowSync(adapter, DEFAULT_STORAGE);
}

function migrateLegacy(storageFile) {
  const filePath = storageFile || path.join(__dirname, '..', 'storage.json');
  if (!fs.existsSync(filePath)) return;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const db = createDb(storageFile);
      db.read();
      // Same reason as save(): preserve keys we do not know about rather than
      // truncating the file to a fixed shape on every startup.
      db.data = { ...DEFAULT_STORAGE, ...parsed };
      db.write();
    }
  } catch (err) {
    console.warn('Could not migrate legacy storage.json:', err.message);
  }
}

function load(storageFile) {
  const db = createDb(storageFile);
  db.read();
  db.data = db.data || DEFAULT_STORAGE;
  db.data.profiles = db.data.profiles || {};
  db.data.tokens = db.data.tokens || {};
  db.data.users = db.data.users || {};
  db.data.applications = db.data.applications || {};
  db.data.emailTokens = db.data.emailTokens || {};
  return db;
}

// Persists the whole object. This used to write an explicit whitelist of four
// keys, which silently discarded anything added afterwards — `emailTokens` was
// dropped on every single write, so confirmation links never resolved. Spreading
// the defaults first keeps the shape guaranteed without capping what may be saved.
function save(storageFile, storageObj) {
  const db = createDb(storageFile);
  db.data = { ...DEFAULT_STORAGE, ...(storageObj || {}) };
  db.write();
}

// ── Backend selection ────────────────────────────────────────────────────────
//
// STORAGE_BACKEND=sqlite swaps the JSON file for SQLite, which is what a deployed
// instance should use: this file rewrites the entire database on every change with
// writeFileSync, so a crash or a full disk part-way through truncates it — losing
// every account at once. SQLite writes in a transaction instead.
//
// Selection happens here rather than in server.js so the rest of the app never
// learns which backend it got. Defaults to JSON: switching the storage engine is
// not something an upgrade should do to someone silently.
//
// If sqlite is asked for but the runtime is too old, that is a configuration error
// worth failing loudly on — quietly writing to a different file than the operator
// configured is how data goes missing.
function selectedBackend() {
  if (String(process.env.STORAGE_BACKEND || 'json').toLowerCase() !== 'sqlite') return null;
  const sqlite = require('./sqlite-storage.js');
  if (!sqlite.isAvailable()) {
    throw new Error(
      `STORAGE_BACKEND=sqlite was requested but ${sqlite.reason()}\n` +
      'Upgrade Node to 22.5 or later, or unset STORAGE_BACKEND to keep using storage.json.'
    );
  }
  return sqlite;
}

module.exports = {
  migrateLegacy: (file) => (selectedBackend() || { migrateLegacy }).migrateLegacy(file),
  load:          (file) => (selectedBackend() || { load }).load(file),
  save:   (file, obj)   => (selectedBackend() || { save }).save(file, obj),
  // The JSON implementations stay reachable for tests and for one-off tooling.
  _json: { migrateLegacy, load, save },
};
