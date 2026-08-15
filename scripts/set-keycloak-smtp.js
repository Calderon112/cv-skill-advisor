#!/usr/bin/env node
'use strict';

// Pushes the SMTP settings into Keycloak, taking the API key from .env rather than
// from an argument.
//
//   node scripts/set-keycloak-smtp.js --admin-email you@example.com
//   node scripts/set-keycloak-smtp.js --admin-email you@example.com --url https://auth.example.de --realm careerai
//
// Why the key is read from a file and never passed on the command line: arguments are
// visible in the process list and land in shell history. It is also never printed —
// not raw, and not base64-encoded either, which is how an earlier version of this
// check leaked one into a terminal transcript.
//
// --admin-email is required because Keycloak's "test connection" sends its probe
// message to the administrator's own address. With no address there is no recipient,
// and the test fails with an unhelpful null before it ever reaches the mail server.

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const readline = require('readline');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const BASE = (arg('url', process.env.KC_URL || 'http://localhost:8080')).replace(/\/+$/, '');
const REALM = arg('realm', process.env.KC_REALM || 'careerai');
const ADMIN = arg('user', process.env.KC_ADMIN_USER || 'admin');
const ADMIN_EMAIL = arg('admin-email', '');
const FROM = arg('from', 'onboarding@resend.dev');
const ENV_FILE = arg('env', path.join(__dirname, '..', '.env'));

if (!ADMIN_EMAIL) {
  console.error('\n  --admin-email is required.\n');
  console.error('  Keycloak tests SMTP by mailing the administrator. Without an address on that');
  console.error('  account the test fails before it contacts the server, whatever the key is.\n');
  process.exit(1);
}

function readEnv(key) {
  if (!fs.existsSync(ENV_FILE)) return '';
  const line = fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/).find(l => l.startsWith(key + '='));
  return line ? line.slice(key.length + 1).trim() : '';
}

const RESEND_KEY = readEnv('RESEND_API_KEY');
if (!RESEND_KEY) {
  console.error(`\n  RESEND_API_KEY is empty in ${ENV_FILE}.`);
  console.error('  Put the new key there first — this script deliberately has no way to accept it');
  console.error('  on the command line.\n');
  process.exit(1);
}

function call(method, p, { token, form, json } = {}) {
  const lib = BASE.startsWith('https') ? https : http;
  const u = new URL(BASE + p);
  const body = form ? new URLSearchParams(form).toString() : json ? JSON.stringify(json) : null;
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  if (form) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (json) headers['Content-Type'] = 'application/json';
  if (body) headers['Content-Length'] = Buffer.byteLength(body);
  return new Promise((resolve, reject) => {
    const req = lib.request({ hostname: u.hostname, port: u.port, path: u.pathname + u.search, method, headers }, (res) => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => { let j = null; try { j = JSON.parse(d); } catch (_) {} resolve({ status: res.statusCode, body: j, raw: d }); });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function askPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const onData = () => process.stdout.write('\x1b[2K\x1b[200D' + prompt + '*'.repeat(rl.line.length));
    process.stdin.on('data', onData);
    rl.question(prompt, (a) => { process.stdin.removeListener('data', onData); rl.close(); process.stdout.write('\n'); resolve(a); });
  });
}

(async () => {
  console.log(`\n  Keycloak ${BASE}, realm "${REALM}"`);
  console.log(`  key read from ${ENV_FILE} (${RESEND_KEY.length} chars, never displayed)\n`);

  const pw = process.env.KC_ADMIN_PASSWORD || await askPassword(`  password for ${ADMIN}: `);
  const tok = await call('POST', '/realms/master/protocol/openid-connect/token', {
    form: { client_id: 'admin-cli', username: ADMIN, password: pw, grant_type: 'password' },
  });
  if (!tok.body?.access_token) {
    console.error('  cannot authenticate: ' + (tok.body?.error_description || tok.status));
    process.exit(1);
  }
  const token = tok.body.access_token;

  // 1. Give the administrator an address, so the test has somewhere to send.
  const admins = (await call('GET', `/admin/realms/master/users?username=${encodeURIComponent(ADMIN)}&exact=true`, { token })).body || [];
  if (!admins[0]) {
    console.error(`  no user "${ADMIN}" in the master realm`);
    process.exit(1);
  }
  if (admins[0].email !== ADMIN_EMAIL) {
    const up = await call('PUT', `/admin/realms/master/users/${admins[0].id}`, {
      token, json: { ...admins[0], email: ADMIN_EMAIL, emailVerified: true },
    });
    console.log(`  admin email -> ${ADMIN_EMAIL}  ${up.status === 204 ? 'ok' : 'HTTP ' + up.status}`);
  } else {
    console.log(`  admin email already ${ADMIN_EMAIL}`);
  }

  // 2. Store the SMTP settings on the realm.
  const realm = (await call('GET', `/admin/realms/${REALM}`, { token })).body;
  const smtpServer = {
    host: 'smtp.resend.com', port: '587',
    starttls: 'true', ssl: 'false', auth: 'true',
    user: 'resend', password: RESEND_KEY,
    from: FROM, fromDisplayName: 'CareerAI', replyTo: '', envelopeFrom: '',
  };
  const put = await call('PUT', `/admin/realms/${REALM}`, { token, json: { ...realm, smtpServer } });
  console.log(`  realm SMTP settings  ${put.status === 204 ? 'saved' : 'HTTP ' + put.status}`);

  // 3. Make Keycloak prove it. 204 means it connected, authenticated AND delivered —
  //    anything else is a failure, including a 2xx that is not 204.
  const test = await call('POST', `/admin/realms/${REALM}/testSMTPConnection`, { token, json: smtpServer });
  if (test.status === 204) {
    console.log(`\n  SUCCESS — Keycloak sent a test message to ${ADMIN_EMAIL}. Check that inbox.\n`);
  } else {
    const why = (test.body && (test.body.errorMessage || test.body.error)) || test.raw.slice(0, 200);
    console.log(`\n  FAILED (HTTP ${test.status}): ${why}`);
    console.log('  Common causes: the API key is revoked or belongs to another account (SMTP 535),');
    console.log(`  or "${FROM}" is not a sender your Resend account may use.\n`);
    process.exit(1);
  }
})().catch(e => { console.error('  failed: ' + e.message); process.exit(1); });
