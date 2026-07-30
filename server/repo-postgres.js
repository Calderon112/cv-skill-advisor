'use strict';

// ── PostgreSQL implementation of the repository ──────────────────────────────
//
// Same interface as server/repo.js, so server.js does not know which one it is
// talking to. What changes is what a write costs: the JSON store holds every
// account in memory and rewrites the whole file on each change, which means two app
// instances silently overwrite each other. Here a write touches one row, so several
// instances can share a database — the point of moving at all.
//
// Postgres rather than SQLite because the stack already runs one for Keycloak: one
// engine instead of two, no native module to compile into a node:20-slim image, and
// it is what a job runner would need later.
//
// Every method is async. The JSON repo was synchronous, so callers must be awaited
// once this backend is selected — see the migration note in server.js.

const { Pool } = require('pg');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  username    TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  email       TEXT GENERATED ALWAYS AS (lower(data->>'email')) STORED,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- findByEmail runs on every OIDC callback; without this it is a full scan.
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  username    TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  expires     BIGINT NOT NULL,
  data        JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_username_idx ON sessions (username);
-- The session list and the admin counters both filter on expiry.
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires);

CREATE TABLE IF NOT EXISTS applications (
  username    TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  id          TEXT NOT NULL,
  data        JSONB NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (username, id)
);

CREATE TABLE IF NOT EXISTS profiles (
  username    TEXT PRIMARY KEY REFERENCES users(username) ON DELETE CASCADE,
  text        TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS email_tokens (
  token       TEXT PRIMARY KEY,
  username    TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  expires     BIGINT NOT NULL,
  data        JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS email_tokens_username_idx ON email_tokens (username);

-- Anonymous by construction. No username column, no foreign key to users, no IP:
-- there is nothing to join against, so the anonymity cannot be quietly undone later
-- by adding one. Deleting an account therefore does not delete their feedback,
-- because nothing records that it was theirs.
CREATE TABLE IF NOT EXISTS feedback (
  id          BIGSERIAL PRIMARY KEY,
  rating      SMALLINT,
  liked       TEXT NOT NULL DEFAULT '',
  improve     TEXT NOT NULL DEFAULT '',
  area        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feedback_created_idx ON feedback (created_at DESC);

-- Server-level bookkeeping that belongs to no user.
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value JSONB
);
`;

/**
 * @param connectionString  postgres://user:pass@host:5432/db
 * @param ssl               true behind a managed provider that requires it
 */
function createPostgresRepo({ connectionString, ssl = false }) {
  const pool = new Pool({
    connectionString,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    max: 10,
  });

  async function init() {
    await pool.query(SCHEMA);
  }

  // ── Sessions ──────────────────────────────────────────────────────────────
  const sessions = {
    async create(token, record) {
      await pool.query(
        'INSERT INTO sessions (token, username, expires, data) VALUES ($1,$2,$3,$4) ON CONFLICT (token) DO UPDATE SET data = EXCLUDED.data',
        [token, record.username, record.expires, record],
      );
    },
    async get(token) {
      const { rows } = await pool.query('SELECT data FROM sessions WHERE token = $1', [token]);
      return rows[0] ? rows[0].data : null;
    },
    async touch(token, patch) {
      // jsonb || jsonb merges right-biased, so this is a partial update of one row
      // rather than reading the record back and writing all of it.
      const { rows } = await pool.query(
        'UPDATE sessions SET data = data || $2::jsonb WHERE token = $1 RETURNING data',
        [token, JSON.stringify(patch)],
      );
      return rows[0] ? rows[0].data : null;
    },
    async delete(token) {
      await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    },
    async listForUser(username, now = Date.now()) {
      const { rows } = await pool.query(
        'SELECT token, data FROM sessions WHERE username = $1 AND expires > $2',
        [username, now],
      );
      return rows.map(r => ({ token: r.token, ...r.data }));
    },
    async revokeForUser(username, opts = {}) {
      const { except = null, shortIdOnly = null } = opts;
      // username is always in the predicate, so a caller can never reach another
      // account's sessions even if the other arguments are wrong.
      const params = [username];
      let sql = 'DELETE FROM sessions WHERE username = $1';
      if (except) { params.push(except); sql += ` AND token <> $${params.length}`; }
      if (shortIdOnly) { params.push(shortIdOnly + '%'); sql += ` AND token LIKE $${params.length}`; }
      const { rowCount } = await pool.query(sql, params);
      return rowCount;
    },
    async stats(now = Date.now()) {
      const { rows } = await pool.query(
        `SELECT
           count(*) FILTER (WHERE expires >  $1) AS active,
           count(*) FILTER (WHERE expires <= $1) AS expired
         FROM sessions`, [now]);
      const byUserRows = await pool.query(
        'SELECT username, count(*) AS n FROM sessions WHERE expires > $1 GROUP BY username', [now]);
      const byUser = {};
      for (const r of byUserRows.rows) byUser[r.username] = Number(r.n);
      return { active: Number(rows[0].active), expired: Number(rows[0].expired), byUser };
    },
  };

  // ── Users ─────────────────────────────────────────────────────────────────
  const users = {
    async get(username) {
      const { rows } = await pool.query('SELECT data FROM users WHERE username = $1', [username]);
      return rows[0] ? rows[0].data : null;
    },
    async put(username, data) {
      await pool.query(
        'INSERT INTO users (username, data) VALUES ($1,$2) ON CONFLICT (username) DO UPDATE SET data = EXCLUDED.data',
        [username, data],
      );
    },
    async patch(username, patch) {
      const { rows } = await pool.query(
        `INSERT INTO users (username, data) VALUES ($1, $2::jsonb)
         ON CONFLICT (username) DO UPDATE SET data = users.data || $2::jsonb
         RETURNING data`,
        [username, JSON.stringify(patch)],
      );
      return rows[0].data;
    },
    async delete(username) {
      // The child tables declare ON DELETE CASCADE, so this removes sessions,
      // applications, the profile and any pending email token in one statement —
      // no list of collections to keep in step by hand.
      await pool.query('DELETE FROM users WHERE username = $1', [username]);
    },
    async entries() {
      const { rows } = await pool.query('SELECT username, data FROM users ORDER BY username');
      return rows.map(r => [r.username, r.data]);
    },
    async findByEmail(email) {
      const wanted = String(email || '').trim().toLowerCase();
      if (!wanted) return null;
      const { rows } = await pool.query('SELECT username, data FROM users WHERE email = $1', [wanted]);
      return rows[0] ? { username: rows[0].username, ...rows[0].data } : null;
    },
    async findByProviderSub(providerId, sub) {
      if (!sub) return null;
      const { rows } = await pool.query(
        `SELECT username, data FROM users WHERE data->'providers'->$1->>'sub' = $2`,
        [providerId, String(sub)],
      );
      return rows[0] ? { username: rows[0].username, ...rows[0].data } : null;
    },
  };

  // ── Applications ──────────────────────────────────────────────────────────
  const applications = {
    async listFor(username) {
      const { rows } = await pool.query(
        'SELECT data FROM applications WHERE username = $1 ORDER BY position, id', [username]);
      return rows.map(r => r.data);
    },
    async replaceFor(username, apps) {
      const client = await pool.connect();
      try {
        // One transaction: a failure halfway must not leave the list truncated.
        await client.query('BEGIN');
        await client.query('DELETE FROM applications WHERE username = $1', [username]);
        for (let i = 0; i < apps.length; i++) {
          await client.query(
            'INSERT INTO applications (username, id, data, position) VALUES ($1,$2,$3,$4)',
            [username, String(apps[i].id), apps[i], i]);
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },
    async add(username, app) {
      await pool.query(
        `INSERT INTO applications (username, id, data, position)
         VALUES ($1,$2,$3,(SELECT coalesce(max(position),-1)+1 FROM applications WHERE username=$1))
         ON CONFLICT (username, id) DO NOTHING`,
        [username, String(app.id), app]);
      return applications.listFor(username);
    },
    async deleteAllFor(username) {
      await pool.query('DELETE FROM applications WHERE username = $1', [username]);
    },
    async entries() {
      const { rows } = await pool.query(
        'SELECT username, data FROM applications ORDER BY username, position, id');
      const byUser = new Map();
      for (const r of rows) {
        if (!byUser.has(r.username)) byUser.set(r.username, []);
        byUser.get(r.username).push(r.data);
      }
      return [...byUser.entries()];
    },
  };

  // ── Profile text ──────────────────────────────────────────────────────────
  const profiles = {
    async get(username) {
      if (!username) return '';
      const { rows } = await pool.query('SELECT text FROM profiles WHERE username = $1', [username]);
      return rows[0] ? rows[0].text : '';
    },
    async set(username, text) {
      if (!username) return;
      await pool.query(
        'INSERT INTO profiles (username, text) VALUES ($1,$2) ON CONFLICT (username) DO UPDATE SET text = EXCLUDED.text',
        [username, text]);
    },
    async delete(username) {
      await pool.query('DELETE FROM profiles WHERE username = $1', [username]);
    },
  };

  // ── Email confirmation tokens ─────────────────────────────────────────────
  const emailTokens = {
    async create(token, record) {
      await pool.query(
        'INSERT INTO email_tokens (token, username, expires, data) VALUES ($1,$2,$3,$4)',
        [token, record.username, record.expires, record]);
    },
    async get(token) {
      const { rows } = await pool.query('SELECT data FROM email_tokens WHERE token = $1', [token]);
      return rows[0] ? rows[0].data : null;
    },
    async delete(token) {
      await pool.query('DELETE FROM email_tokens WHERE token = $1', [token]);
    },
    async deleteForUser(username) {
      const { rowCount } = await pool.query('DELETE FROM email_tokens WHERE username = $1', [username]);
      return rowCount;
    },
  };

  // ── Feedback ──────────────────────────────────────────────────────────────
  const feedback = {
    async add(entry) {
      const { rows } = await pool.query(
        `INSERT INTO feedback (rating, liked, improve, area, created_at)
         VALUES ($1,$2,$3,$4, to_timestamp($5/1000.0)) RETURNING id, created_at`,
        [entry.rating ?? null, entry.liked || '', entry.improve || '', entry.area || '', entry.at || Date.now()],
      );
      return { ...entry, id: rows[0].id };
    },
    async list(limit = 200) {
      const { rows } = await pool.query(
        `SELECT id, rating, liked, improve, area,
                (extract(epoch from created_at) * 1000)::bigint AS at
         FROM feedback ORDER BY created_at DESC LIMIT $1`, [limit]);
      return rows.map(r => ({ ...r, at: Number(r.at) }));
    },
    async count() {
      const { rows } = await pool.query('SELECT count(*) AS n FROM feedback');
      return Number(rows[0].n);
    },
  };

  const meta = {
    async get(key) {
      const { rows } = await pool.query('SELECT value FROM meta WHERE key = ', [key]);
      return rows[0] ? rows[0].value : null;
    },
    async set(key, value) {
      await pool.query(
        'INSERT INTO meta (key, value) VALUES (,) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, JSON.stringify(value)]);
    },
  };

  async function deleteAccount(username) {
    // Feedback is untouched on purpose: nothing records who wrote it, so there is
    // nothing to delete. That is the cost of real anonymity, and it is the point.
    await users.delete(username);   // cascades to every child table
  }

  async function close() { await pool.end(); }

  return { init, close, sessions, users, applications, profiles, emailTokens, feedback, meta, deleteAccount, _pool: pool };
}

module.exports = { createPostgresRepo, SCHEMA };
