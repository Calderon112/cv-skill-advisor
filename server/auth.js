/**
 * auth.js — Password hashing and session token management.
 *
 * Uses Node.js built-in `crypto.scrypt` — no npm package required.
 * Format stored in DB:  "<hex-salt>:<hex-hash>"
 */

const crypto  = require('crypto');
const storage = require('./storage');

// ── Password hashing ──────────────────────────────────────────────────────

function hashPassword(plaintext) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plaintext, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(plaintext, stored) {
  // Legacy support: if no colon, password was stored in plaintext (migration path)
  if (!stored.includes(':')) return stored === plaintext;
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(plaintext, salt, 32).toString('hex');
  return actual === expected;
}

// ── Session tokens ────────────────────────────────────────────────────────

function createToken(username) {
  const token = crypto.randomBytes(24).toString('hex');
  storage.storeToken(token, username);
  return token;
}

function validateToken(rawToken) {
  return storage.lookupToken(rawToken);   // returns username or null
}

// Extract Bearer token from an HTTP request's Authorization header
function extractToken(req) {
  const header = req.headers.authorization || '';
  const match  = header.match(/^Bearer\s+(.+)$/);
  return match ? match[1] : null;
}

module.exports = { hashPassword, verifyPassword, createToken, validateToken, extractToken };
