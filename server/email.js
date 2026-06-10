/**
 * email.js — Send email via the Resend HTTP API (no npm dependency).
 *
 * Set RESEND_API_KEY (and optionally RESEND_FROM) in `.env` to enable real
 * sending. Without a key, `isAvailable()` is false and the frontend falls back
 * to a `mailto:` draft so the feature still works.
 */
const https = require('https');

function isAvailable() {
  return !!process.env.RESEND_API_KEY;
}

function sendEmail({ to, subject, text }) {
  return new Promise((resolve, reject) => {
    if (!process.env.RESEND_API_KEY) {
      reject(new Error('No email provider configured'));
      return;
    }
    const from = process.env.RESEND_FROM || 'CyberCareer <onboarding@resend.dev>';
    const body = JSON.stringify({ from, to: [to], subject, text });

    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Resend HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          return;
        }
        try { resolve(JSON.parse(data || '{}')); }
        catch (_) { resolve({ ok: true }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('Email request timed out')));
    req.write(body);
    req.end();
  });
}

module.exports = { sendEmail, isAvailable };
