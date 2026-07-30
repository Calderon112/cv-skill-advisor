'use strict';

// ── Data access layer ────────────────────────────────────────────────────────
//
// Every read and write of application state goes through here. Two reasons.
//
// 1. server.js reached into `storage.users[...]`, `storage.tokens[...]` and friends
//    from 47 places. Swapping the backing store would have meant touching all 47 and
//    hoping none were missed — the same failure shape that left /api/send-email
//    unguarded.
//
// 2. The interface is deliberately ROW-ORIENTED: getSession(token),
//    deleteSession(token), addApplication(username, app). It never hands out the whole
//    collection to be mutated and written back. That is what makes the Postgres
//    implementation a set of ordinary statements instead of a read-modify-write of one
//    giant blob — and it is what lets two app instances share a database without
//    overwriting each other.
//
// This first implementation is backed by the SAME in-memory object server.js already
// holds, so call sites can move over one at a time without ever having two sources of
// truth. Step 2 replaces the internals with SQL; the interface does not change.

/**
 * @param deps.getStore  () => the live storage object
 * @param deps.persist   () => void, flushes to disk (today: saveStorage)
 */
function createRepo({ getStore, persist }) {
  const store = () => {
    const s = getStore();
    // Defensive: a store loaded from an older file may be missing a collection.
    s.users ||= {};
    s.tokens ||= {};
    s.applications ||= {};
    s.profiles ||= {};
    s.emailTokens ||= {};
    return s;
  };

  // ── Sessions ──────────────────────────────────────────────────────────────
  const sessions = {
    create(token, record) { store().tokens[token] = record; persist(); },
    get(token) { return store().tokens[token] || null; },
    touch(token, patch) {
      const t = store().tokens[token];
      if (!t) return null;
      Object.assign(t, patch);
      return t;
    },
    delete(token) { delete store().tokens[token]; persist(); },

    /** Live sessions for one user, newest activity first. */
    listForUser(username, now = Date.now()) {
      return Object.entries(store().tokens)
        .filter(([, s]) => s.username === username && s.expires > now)
        .map(([token, s]) => ({ token, ...s }));
    },

    /**
     * Revokes sessions for one user.
     * @param opts.except      token to keep (the caller's own)
     * @param opts.shortIdOnly only the session whose token starts with this
     * @returns how many were removed
     */
    revokeForUser(username, opts = {}) {
      const { except = null, shortIdOnly = null } = opts;
      let n = 0;
      for (const [token, s] of Object.entries(store().tokens)) {
        if (s.username !== username) continue;
        if (token === except) continue;
        if (shortIdOnly && !token.startsWith(shortIdOnly)) continue;
        delete store().tokens[token];
        n++;
      }
      if (n) persist();
      return n;
    },

    /** Admin counters — never exposes the tokens themselves. */
    stats(now = Date.now()) {
      const all = Object.values(store().tokens);
      const byUser = {};
      for (const s of all) if (s.expires > now) byUser[s.username] = (byUser[s.username] || 0) + 1;
      return {
        active: all.filter(s => s.expires > now).length,
        expired: all.filter(s => s.expires <= now).length,
        byUser,
      };
    },
  };

  // ── Users ─────────────────────────────────────────────────────────────────
  const users = {
    get(username) { return store().users[username] || null; },
    put(username, data) { store().users[username] = data; persist(); },
    patch(username, patch) {
      const current = store().users[username] || {};
      store().users[username] = { ...current, ...patch };
      persist();
      return store().users[username];
    },
    delete(username) { delete store().users[username]; persist(); },
    entries() { return Object.entries(store().users); },
    findByEmail(email) {
      const wanted = String(email || '').trim().toLowerCase();
      if (!wanted) return null;
      for (const [username, d] of Object.entries(store().users)) {
        if (String(d.email || '').trim().toLowerCase() === wanted) return { username, ...d };
      }
      return null;
    },
    findByProviderSub(providerId, sub) {
      for (const [username, d] of Object.entries(store().users)) {
        const p = (d.providers || {})[providerId];
        if (p && String(p.sub) === String(sub)) return { username, ...d };
      }
      return null;
    },
  };

  // ── Applications ──────────────────────────────────────────────────────────
  const applications = {
    listFor(username) { return store().applications[username] || []; },
    replaceFor(username, apps) { store().applications[username] = apps; persist(); },
    add(username, app) {
      (store().applications[username] ||= []).push(app);
      persist();
      return store().applications[username];
    },
    deleteAllFor(username) { delete store().applications[username]; persist(); },
    entries() { return Object.entries(store().applications); },
  };

  // ── Profile text (used to match jobs) ─────────────────────────────────────
  const profiles = {
    get(username) { return (username && store().profiles[username]) || ''; },
    set(username, text) { if (username) { store().profiles[username] = text; persist(); } },
    delete(username) { delete store().profiles[username]; persist(); },
  };

  // ── Email confirmation tokens ─────────────────────────────────────────────
  const emailTokens = {
    create(token, record) { store().emailTokens[token] = record; persist(); },
    get(token) { return store().emailTokens[token] || null; },
    delete(token) { delete store().emailTokens[token]; persist(); },
    /** Used before issuing a new one, so a user never has two live links. */
    deleteForUser(username) {
      let n = 0;
      for (const [t, v] of Object.entries(store().emailTokens)) {
        if (v.username === username) { delete store().emailTokens[t]; n++; }
      }
      if (n) persist();
      return n;
    },
  };

  /** Everything belonging to one account, for account deletion. */
  function deleteAccount(username) {
    users.delete(username);
    applications.deleteAllFor(username);
    profiles.delete(username);
    sessions.revokeForUser(username);
    emailTokens.deleteForUser(username);
    persist();
  }

  return { sessions, users, applications, profiles, emailTokens, deleteAccount };
}

module.exports = { createRepo };
