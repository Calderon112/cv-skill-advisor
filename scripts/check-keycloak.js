#!/usr/bin/env node
'use strict';

// Reads back the realm's security settings and says which are still weak.
//
//   node scripts/check-keycloak.js
//   node scripts/check-keycloak.js --url http://localhost:8080 --realm careerai
//
// The admin password is asked for at the prompt with echo off, is never written to
// disk, never passed as an argv (which would put it in the process list and the shell
// history), and never printed. Nothing this prints is a secret — only settings.

const https = require('https');
const http = require('http');
const readline = require('readline');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const BASE = (arg('url', process.env.KC_URL || 'http://localhost:8080')).replace(/\/+$/, '');
const REALM = arg('realm', process.env.KC_REALM || 'careerai');
const USER = arg('user', process.env.KC_ADMIN_USER || 'admin');

function request(method, path, { token, form } = {}) {
  const lib = BASE.startsWith('https') ? https : http;
  const url = new URL(BASE + path);
  const body = form ? new URLSearchParams(form).toString() : null;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    headers['Content-Length'] = Buffer.byteLength(body);
  }
  return new Promise((resolve, reject) => {
    const req = lib.request({ hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers }, (res) => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(d); } catch (_) { /* leave null */ }
        resolve({ status: res.statusCode, body: parsed, raw: d });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function askPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Suppress echo so the password never appears on screen or in a scrollback buffer.
    const onData = (char) => {
      if ([ '\n', '\r', '' ].includes(char.toString())) process.stdin.removeListener('data', onData);
      else process.stdout.write('\x1b[2K\x1b[200D' + prompt + '*'.repeat(rl.line.length));
    };
    process.stdin.on('data', onData);
    rl.question(prompt, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });
}

const OK = '  \x1b[32mok\x1b[0m   ';
const BAD = '  \x1b[31mFIX\x1b[0m  ';
const INFO = '  --   ';

(async () => {
  console.log(`\nKeycloak ${BASE}, realm "${REALM}"\n`);

  const pw = process.env.KC_ADMIN_PASSWORD || await askPassword(`password for ${USER}: `);

  const tok = await request('POST', '/realms/master/protocol/openid-connect/token', {
    form: { client_id: 'admin-cli', username: USER, password: pw, grant_type: 'password' },
  });
  if (!tok.body || !tok.body.access_token) {
    console.error(`  cannot authenticate: ${(tok.body && (tok.body.error_description || tok.body.error)) || tok.status}`);
    process.exit(1);
  }
  const token = tok.body.access_token;

  const realm = await request('GET', `/admin/realms/${REALM}`, { token });
  if (realm.status !== 200 || !realm.body) {
    console.error(`  cannot read realm "${REALM}" (HTTP ${realm.status})`);
    process.exit(1);
  }
  const r = realm.body;
  const mins = (s) => `${Math.round((s || 0) / 60)} min`;

  console.log('Brute force');
  console.log((r.bruteForceProtected ? OK : BAD) + 'bruteForceProtected: ' + r.bruteForceProtected);
  if (r.bruteForceProtected) {
    console.log((r.permanentLockout ? BAD : OK) + 'permanentLockout: ' + r.permanentLockout
      + (r.permanentLockout ? '   <-- anyone who knows a username can disable that account for good' : ''));
    console.log(INFO + 'maxLoginFailures: ' + r.failureFactor);
    if (!r.permanentLockout) {
      console.log(INFO + 'waitIncrement: ' + mins(r.waitIncrementSeconds)
        + ' | maxWait: ' + mins(r.maxFailureWaitSeconds)
        + ' | failureReset: ' + Math.round((r.maxDeltaTimeSeconds || 0) / 3600) + ' h');
    }
  }

  console.log('\nAccount recovery');
  console.log((r.resetPasswordAllowed ? OK : BAD) + 'resetPasswordAllowed: ' + r.resetPasswordAllowed
    + (r.resetPasswordAllowed ? '' : '   <-- a locked-out user has no way back without you'));
  const smtp = r.smtpServer && r.smtpServer.host;
  console.log((smtp ? OK : BAD) + 'SMTP configured: ' + (smtp ? r.smtpServer.host : 'no')
    + (smtp ? '' : '   <-- password-reset mail cannot be sent'));
  console.log((r.verifyEmail ? OK : INFO.trim() + '  ') + 'verifyEmail: ' + r.verifyEmail);

  console.log('\nSecond factor');
  const actions = await request('GET', `/admin/realms/${REALM}/authentication/required-actions`, { token });
  const otp = (actions.body || []).find(a => /CONFIGURE_TOTP/i.test(a.alias));
  if (!otp) {
    console.log(BAD + 'CONFIGURE_TOTP not found');
  } else {
    console.log((otp.enabled ? OK : BAD) + 'OTP available: ' + otp.enabled);
    console.log((otp.defaultAction ? OK : BAD) + 'OTP required for new users: ' + otp.defaultAction
      + (otp.defaultAction ? '' : '   <-- available but nobody is asked to set it up'));
  }
  console.log(INFO + 'otpPolicy: ' + r.otpPolicyType + ', ' + r.otpPolicyDigits + ' digits, ' + r.otpPolicyPeriod + 's');

  console.log('\nPasswords');
  console.log((r.passwordPolicy ? OK : BAD) + 'passwordPolicy: ' + (r.passwordPolicy || 'none set'));

  console.log('\nRegistration');
  console.log(INFO + 'registrationAllowed: ' + r.registrationAllowed);
  console.log('');
})().catch((e) => { console.error('  failed:', e.message); process.exit(1); });
