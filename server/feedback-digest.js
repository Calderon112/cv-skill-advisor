'use strict';

// ── Feedback digest ──────────────────────────────────────────────────────────
//
// One summary mail per period, listing everything received since the last one.
//
// Not one mail per submission, which is the obvious design and the wrong one here.
// /api/feedback is public and unauthenticated by design — that is what makes the
// answers worth having — so wiring it directly to an email send turns it into an
// amplifier: at the rate limit already in force (10/hour/address) a single client can
// generate 240 messages a day, against a free Resend tier of 100. Several addresses,
// and it is unbounded. The inbox floods, the quota burns, and the account gets
// suspended for volume.
//
// A digest is bounded by construction: one mail per period whatever the volume. It
// also reads better — five pieces of feedback in one place beat five interruptions.

const DEFAULT_HOURS = 24;
const LAST_SENT_KEY = 'feedbackDigestLastSentAt';

function plural(n, one, many) { return `${n} ${n === 1 ? one : many}`; }

/** Plain text: it lands in a mailbox, and every client renders it identically. */
function compose(entries, since) {
  const rated = entries.filter(e => e.rating);
  const avg = rated.length
    ? Math.round((rated.reduce((n, e) => n + e.rating, 0) / rated.length) * 10) / 10
    : null;

  const byArea = {};
  for (const e of entries) byArea[e.area || 'unspecified'] = (byArea[e.area || 'unspecified'] || 0) + 1;

  const lines = [
    `${plural(entries.length, 'new response', 'new responses')} since ${new Date(since).toLocaleString('en-GB')}.`,
    avg ? `Average rating: ${avg}/5 across ${plural(rated.length, 'rating', 'ratings')}.` : 'No ratings given.',
    `Areas: ${Object.entries(byArea).map(([a, n]) => `${a} (${n})`).join(', ')}`,
    '',
    '─'.repeat(60),
    '',
  ];

  for (const e of entries) {
    lines.push(`${e.rating ? `${e.rating}/5` : 'no rating'}  ·  ${e.area || 'unspecified'}  ·  ${new Date(e.at).toLocaleString('en-GB')}`);
    if (e.liked) lines.push(`  worked:  ${e.liked}`);
    if (e.improve) lines.push(`  change:  ${e.improve}`);
    lines.push('');
  }

  lines.push('─'.repeat(60));
  lines.push('Anonymous by design — there is no sender to reply to, and nothing recorded');
  lines.push('about who wrote any of this.');

  return lines.join('\n');
}

/**
 * @param deps.repo   the repository (feedback + meta)
 * @param deps.email  server/email.js
 * @returns { sent, count, reason } — reason explains a no-send, for the caller to log
 */
async function runOnce({ repo, email, to, now = Date.now() }) {
  if (!to) return { sent: false, count: 0, reason: 'no recipient configured' };
  if (!email.isAvailable()) return { sent: false, count: 0, reason: 'no email provider configured' };

  // First run has no marker: start from now rather than mailing the entire history.
  const last = (await repo.meta.get(LAST_SENT_KEY)) ?? null;
  if (last === null) {
    await repo.meta.set(LAST_SENT_KEY, now);
    return { sent: false, count: 0, reason: 'first run — baseline recorded, nothing sent' };
  }

  const all = await repo.feedback.list(500);
  const fresh = all.filter(e => e.at > last).sort((a, b) => a.at - b.at);
  if (!fresh.length) {
    // Marker deliberately NOT advanced: nothing was reported, so nothing is consumed.
    return { sent: false, count: 0, reason: 'nothing new' };
  }

  await email.sendEmail({
    to,
    subject: `CareerAI — ${plural(fresh.length, 'new response', 'new responses')}`,
    text: compose(fresh, last),
  });

  // Only after a successful send. A failure here leaves the marker where it was, so
  // the next run retries the same entries instead of losing them.
  await repo.meta.set(LAST_SENT_KEY, now);
  return { sent: true, count: fresh.length };
}

/**
 * Schedules runOnce. Returns a stop function.
 * Checks hourly rather than sleeping for the whole period, so a restart does not push
 * the next digest a full day out.
 */
function start({ repo, email, to, everyHours = DEFAULT_HOURS, log = console.log }) {
  if (!to) { log('[feedback] digest off — FEEDBACK_DIGEST_TO is not set'); return () => {}; }

  const periodMs = Math.max(1, Number(everyHours) || DEFAULT_HOURS) * 60 * 60 * 1000;
  let lastAttempt = 0;

  const tick = async () => {
    if (Date.now() - lastAttempt < periodMs) return;
    lastAttempt = Date.now();
    try {
      const r = await runOnce({ repo, email, to });
      if (r.sent) log(`[feedback] digest sent to ${to} — ${r.count} response(s)`);
      else if (r.reason !== 'nothing new') log(`[feedback] digest skipped: ${r.reason}`);
    } catch (err) {
      log(`[feedback] digest failed: ${err.message}`);
    }
  };

  const timer = setInterval(tick, 60 * 60 * 1000);
  timer.unref();          // never keeps the process alive on its own
  setTimeout(tick, 30_000).unref();   // one check shortly after boot
  log(`[feedback] digest on — every ${everyHours}h to ${to}`);
  return () => clearInterval(timer);
}

module.exports = { start, runOnce, compose, LAST_SENT_KEY };
