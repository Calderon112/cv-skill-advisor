'use strict';

// ── SQLite storage backend ───────────────────────────────────────────────────
//
// Same interface as server/storage.js (migrateLegacy / load / save), so the two
// are interchangeable and server.js never learns which one it got.
//
// Why replace the JSON file for a deployed instance: storage.json was rewritten
// whole on every single change with fs.writeFileSync. A crash or a full disk
// midway through leaves a truncated file, and a truncated file is every account,
// every session and every saved job gone. SQLite writes inside a transaction with
// WAL, so a write either lands completely or not at all.
//
// This uses node:sqlite, built into Node since 22.5 — deliberately NOT
// better-sqlite3, which is a native module needing a compiler on the host and in
// the image. If the runtime is too old, load() and save() report it and the
// caller falls back to JSON rather than losing data silently.
//
// Storage shape: one row per top-level collection rather than one blob for
// everything, so saving a session token does not rewrite every user record too.

const fs = require('fs');
const path = require('path');

const COLLECTIONS = ['profiles', 'tokens', 'users', 'applications', 'emailTokens'];

let DatabaseSync = null;
let unavailableReason = '';
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch (e) {
  unavailableReason = `node:sqlite is not available on Node ${process.version} (needs >= 22.5): ${e.message}`;
}

function isAvailable() { return !!DatabaseSync; }
function reason() { return unavailableReason; }

function emptyStorage() {
  return { profiles: {}, tokens: {}, users: {}, applications: {}, emailTokens: {} };
}

// The database sits beside the JSON file it replaces, so a deployment that mounts
// one path keeps working. SQLITE_DB_FILE overrides it outright.
function dbPathFor(storageFile) {
  if (process.env.SQLITE_DB_FILE) return process.env.SQLITE_DB_FILE;
  const base = storageFile || path.join(__dirname, '..', 'storage.json');
  return base.replace(/\.json$/i, '') + '.sqlite';
}

let handle = null;      // { db, file }

function open(storageFile) {
  const file = dbPathFor(storageFile);
  if (handle && handle.file === file) return handle.db;
  if (!DatabaseSync) throw new Error(unavailableReason);

  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  // WAL survives a crash mid-write; without it a killed process can leave the
  // main database file inconsistent.
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = NORMAL');
  db.exec('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  handle = { db, file };
  return db;
}

/**
 * One-time import of an existing storage.json. Runs only when the database has no
 * rows yet, so it never overwrites live data on a later restart. The JSON file is
 * left untouched — it becomes the pre-migration backup.
 */
function migrateLegacy(storageFile) {
  if (!DatabaseSync) return;
  const db = open(storageFile);
  const existing = db.prepare('SELECT COUNT(*) AS n FROM kv').get();
  if (existing && existing.n > 0) return;

  const jsonFile = storageFile || path.join(__dirname, '..', 'storage.json');
  let parsed = emptyStorage();
  if (fs.existsSync(jsonFile)) {
    try {
      const raw = fs.readFileSync(jsonFile, 'utf8');
      if (raw.trim()) parsed = { ...emptyStorage(), ...JSON.parse(raw) };
    } catch (err) {
      // Refuse to start on a corrupt source rather than silently creating an
      // empty database and losing every account.
      throw new Error(`Cannot migrate ${jsonFile} into SQLite — it is not valid JSON: ${err.message}`);
    }
  }
  writeAll(db, parsed);
  const counts = COLLECTIONS.map(c => `${c}=${Object.keys(parsed[c] || {}).length}`).join(' ');
  console.log(`Migrated ${jsonFile} into SQLite (${counts})`);
}

function writeAll(db, storageObj) {
  const stmt = db.prepare(
    'INSERT INTO kv(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  db.exec('BEGIN');
  try {
    for (const key of COLLECTIONS) {
      stmt.run(key, JSON.stringify((storageObj && storageObj[key]) || {}));
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/** Mirrors server/storage.js: returns an object carrying `.data`. */
function load(storageFile) {
  const db = open(storageFile);
  const data = emptyStorage();
  for (const row of db.prepare('SELECT key, value FROM kv').all()) {
    if (!COLLECTIONS.includes(row.key)) continue;
    try { data[row.key] = JSON.parse(row.value) || {}; } catch (_) { data[row.key] = {}; }
  }
  return { data };
}

function save(storageFile, storageObj) {
  writeAll(open(storageFile), storageObj);
}

module.exports = { migrateLegacy, load, save, isAvailable, reason, _internals: { dbPathFor, COLLECTIONS } };
