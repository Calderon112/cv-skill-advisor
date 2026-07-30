#!/usr/bin/env node
'use strict';

// The reverse of import-storage-to-postgres.js: rebuild storage.json from the
// database.
//
//   node scripts/export-postgres-to-storage.js --url postgres://… --out storage.json
//
// Written because the import had a companion bug that emptied storage.json, and
// having only a one-way tool at that moment was uncomfortable. A migration you cannot
// reverse is a migration you cannot test.
//
// Refuses to overwrite a non-empty file unless --force is given, so running it in the
// wrong direction cannot destroy the thing it is meant to rescue.

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const URL_ = arg('url', process.env.DATABASE_URL);
const OUT = path.resolve(arg('out', path.join(__dirname, '..', 'storage.json')));
const FORCE = process.argv.includes('--force');

if (!URL_) { console.error('\n  --url or DATABASE_URL required\n'); process.exit(1); }

if (fs.existsSync(OUT) && !FORCE) {
  const existing = JSON.parse(fs.readFileSync(OUT, 'utf8') || '{}');
  const populated = Object.keys(existing.users || {}).length;
  if (populated) {
    console.error(`\n  ${OUT} already holds ${populated} accounts.`);
    console.error('  Refusing to overwrite. Move it aside, or pass --force.\n');
    process.exit(1);
  }
}

(async () => {
  const pool = new Pool({ connectionString: URL_ });
  const out = { profiles: {}, tokens: {}, users: {}, applications: {}, emailTokens: {}, feedback: [] };

  for (const r of (await pool.query('SELECT username, data FROM users')).rows) out.users[r.username] = r.data;
  for (const r of (await pool.query('SELECT token, data FROM sessions')).rows) out.tokens[r.token] = r.data;
  for (const r of (await pool.query('SELECT username, data FROM applications ORDER BY username, position, id')).rows) {
    (out.applications[r.username] ||= []).push(r.data);
  }
  for (const r of (await pool.query('SELECT username, text FROM profiles')).rows) out.profiles[r.username] = r.text;
  for (const r of (await pool.query('SELECT token, data FROM email_tokens')).rows) out.emailTokens[r.token] = r.data;
  for (const r of (await pool.query(
    'SELECT rating, liked, improve, area, (extract(epoch from created_at)*1000)::bigint AS at FROM feedback ORDER BY created_at')).rows) {
    out.feedback.push({ rating: r.rating, liked: r.liked, improve: r.improve, area: r.area, at: Number(r.at) });
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\n  wrote ${OUT}`);
  console.log(`    users        ${Object.keys(out.users).length}`);
  console.log(`    tokens       ${Object.keys(out.tokens).length}`);
  console.log(`    applications ${Object.values(out.applications).reduce((n, l) => n + l.length, 0)} across ${Object.keys(out.applications).length} accounts`);
  console.log(`    profiles     ${Object.keys(out.profiles).length}`);
  console.log(`    emailTokens  ${Object.keys(out.emailTokens).length}`);
  console.log(`    feedback     ${out.feedback.length}\n`);
  await pool.end();
})().catch(e => { console.error('  failed: ' + e.message); process.exit(1); });
