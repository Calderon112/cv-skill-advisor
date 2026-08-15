#!/usr/bin/env node
'use strict';

// Moves storage.json into PostgreSQL.
//
//   node scripts/import-storage-to-postgres.js                     # dry run, writes nothing
//   node scripts/import-storage-to-postgres.js --write             # actually import
//   node scripts/import-storage-to-postgres.js --write --file ./backup.json
//
// Dry run is the default because this is a one-way trip into a database that may
// already hold data. Run it once to read the plan, then again with --write.
//
// Idempotent: every insert is ON CONFLICT DO NOTHING keyed on the natural identifier,
// so re-running after a partial failure resumes instead of duplicating. The one
// exception is feedback, which has no natural key — see below.

const fs = require('fs');
const path = require('path');
const { createPostgresRepo, SCHEMA } = require('../server/repo-postgres');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const WRITE = process.argv.includes('--write');
const FILE = path.resolve(arg('file', path.join(__dirname, '..', 'storage.json')));
const URL_ = arg('url', process.env.DATABASE_URL);

if (!URL_) {
  console.error('\n  DATABASE_URL is not set and --url was not given.\n');
  process.exit(1);
}
if (!fs.existsSync(FILE)) {
  console.error(`\n  ${FILE} does not exist.\n`);
  process.exit(1);
}

const store = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const users = store.users || {};
const usernames = new Set(Object.keys(users));

// Sessions, applications and profiles all carry a username that Postgres enforces as
// a foreign key. Rows pointing at a deleted account cannot be inserted — and should
// not be: a session for an account that no longer exists can never be used again.
const orphanSessions = Object.entries(store.tokens || {}).filter(([, s]) => !usernames.has(s.username));
const orphanApps = Object.keys(store.applications || {}).filter(u => !usernames.has(u));
const orphanProfiles = Object.keys(store.profiles || {}).filter(u => !usernames.has(u));
const orphanEmailTokens = Object.entries(store.emailTokens || {}).filter(([, t]) => !usernames.has(t.username));

const plan = {
  users: Object.keys(users).length,
  sessions: Object.keys(store.tokens || {}).length - orphanSessions.length,
  applications: Object.entries(store.applications || {})
    .filter(([u]) => usernames.has(u)).reduce((n, [, list]) => n + list.length, 0),
  profiles: Object.keys(store.profiles || {}).filter(u => usernames.has(u)).length,
  emailTokens: Object.keys(store.emailTokens || {}).length - orphanEmailTokens.length,
  feedback: (store.feedback || []).length,
};

console.log(`\n  source : ${FILE}`);
console.log(`  target : ${URL_.replace(/:\/\/([^:]+):[^@]*@/, '://$1:****@')}`);
console.log(`  mode   : ${WRITE ? 'WRITE' : 'dry run (nothing will be written)'}\n`);
console.log('  to import:');
Object.entries(plan).forEach(([k, v]) => console.log(`    ${k.padEnd(14)} ${v}`));

const skipped = orphanSessions.length + orphanApps.length + orphanProfiles.length + orphanEmailTokens.length;
if (skipped) {
  console.log('\n  skipped — they reference an account that no longer exists:');
  if (orphanSessions.length) {
    const names = [...new Set(orphanSessions.map(([, s]) => s.username).filter(Boolean))];
    const nameless = orphanSessions.filter(([, s]) => !s.username).length;
    const detail = [
      names.length ? `deleted accounts: ${names.join(', ')}` : '',
      nameless ? `${nameless} with no username recorded at all` : '',
    ].filter(Boolean).join('; ');
    console.log(`    sessions       ${orphanSessions.length}  (${detail})`);
  }
  if (orphanApps.length) console.log(`    applications   ${orphanApps.join(', ')}`);
  if (orphanProfiles.length) console.log(`    profiles       ${orphanProfiles.join(', ')}`);
  if (orphanEmailTokens.length) console.log(`    emailTokens    ${orphanEmailTokens.length}`);
}

if (!WRITE) {
  console.log('\n  Dry run. Re-run with --write to apply.\n');
  process.exit(0);
}

(async () => {
  const repo = createPostgresRepo({ connectionString: URL_, ssl: process.env.DATABASE_SSL === '1' });
  const pool = repo._pool;
  await pool.query(SCHEMA);

  const before = await counts(pool);
  const client = await pool.connect();
  const done = { users: 0, sessions: 0, applications: 0, profiles: 0, emailTokens: 0, feedback: 0 };

  try {
    // One transaction for the whole import: a failure halfway leaves the database
    // exactly as it was, rather than half-populated and impossible to reason about.
    await client.query('BEGIN');

    for (const [username, data] of Object.entries(users)) {
      const r = await client.query(
        'INSERT INTO users (username, data) VALUES ($1,$2) ON CONFLICT (username) DO NOTHING',
        [username, data]);
      done.users += r.rowCount;
    }

    for (const [token, s] of Object.entries(store.tokens || {})) {
      if (!usernames.has(s.username)) continue;
      const r = await client.query(
        'INSERT INTO sessions (token, username, expires, data) VALUES ($1,$2,$3,$4) ON CONFLICT (token) DO NOTHING',
        [token, s.username, s.expires || 0, s]);
      done.sessions += r.rowCount;
    }

    for (const [username, list] of Object.entries(store.applications || {})) {
      if (!usernames.has(username)) continue;
      for (let i = 0; i < list.length; i++) {
        const app = list[i];
        const r = await client.query(
          'INSERT INTO applications (username, id, data, position) VALUES ($1,$2,$3,$4) ON CONFLICT (username, id) DO NOTHING',
          [username, String(app.id), app, i]);
        done.applications += r.rowCount;
      }
    }

    for (const [username, text] of Object.entries(store.profiles || {})) {
      if (!usernames.has(username)) continue;
      const r = await client.query(
        'INSERT INTO profiles (username, text) VALUES ($1,$2) ON CONFLICT (username) DO NOTHING',
        [username, text || '']);
      done.profiles += r.rowCount;
    }

    for (const [token, t] of Object.entries(store.emailTokens || {})) {
      if (!usernames.has(t.username)) continue;
      const r = await client.query(
        'INSERT INTO email_tokens (token, username, expires, data) VALUES ($1,$2,$3,$4) ON CONFLICT (token) DO NOTHING',
        [token, t.username, t.expires || 0, t]);
      done.emailTokens += r.rowCount;
    }

    // Feedback has no natural key — it is anonymous, so there is nothing to deduplicate
    // on. Importing twice WOULD duplicate it, so it is only imported into an empty
    // table. Anything else would need a judgement this script cannot make.
    const existingFeedback = Number((await client.query('SELECT count(*) AS n FROM feedback')).rows[0].n);
    if (existingFeedback === 0) {
      for (const f of store.feedback || []) {
        await client.query(
          'INSERT INTO feedback (rating, liked, improve, area, created_at) VALUES ($1,$2,$3,$4, to_timestamp($5/1000.0))',
          [f.rating ?? null, f.liked || '', f.improve || '', f.area || '', f.at || Date.now()]);
        done.feedback++;
      }
    } else if ((store.feedback || []).length) {
      console.log(`\n  feedback: table already holds ${existingFeedback} rows — skipped, it has no key to deduplicate on.`);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n  FAILED, nothing was written: ' + err.message + '\n');
    client.release();
    await repo.close();
    process.exit(1);
  } finally {
    client.release();
  }

  const after = await counts(pool);
  console.log('\n  inserted:');
  Object.entries(done).forEach(([k, v]) => console.log(`    ${k.padEnd(14)} ${v}`));
  console.log('\n  table totals (before -> after):');
  Object.keys(after).forEach(k => console.log(`    ${k.padEnd(14)} ${before[k]} -> ${after[k]}`));

  // Prove the accounts actually arrived, rather than trusting the insert count.
  const sample = await pool.query('SELECT username, data->>\'email\' AS email FROM users ORDER BY username LIMIT 5');
  console.log('\n  spot check:');
  sample.rows.forEach(r => console.log(`    ${r.username.padEnd(16)} ${r.email || '(no email)'}`));

  console.log(`\n  Done. Keep ${path.basename(FILE)} as a backup until you have signed in against Postgres.\n`);
  await repo.close();
})().catch(e => { console.error('  failed: ' + e.message); process.exit(1); });

async function counts(pool) {
  const out = {};
  for (const t of ['users', 'sessions', 'applications', 'profiles', 'email_tokens', 'feedback']) {
    out[t] = Number((await pool.query(`SELECT count(*) AS n FROM ${t}`)).rows[0].n);
  }
  return out;
}
