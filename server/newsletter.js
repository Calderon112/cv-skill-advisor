'use strict';

// ── Newsletter ───────────────────────────────────────────────────────────────
//
// Two mails are composed here: the one that asks a subscriber to confirm, and
// whatever goes out afterwards. Nothing is sent from this module — the caller
// owns that, as it does for the feedback digest.
//
// Double opt-in is not a preference. A newsletter sent to recipients in Germany
// has to be asked for provably: UWG §7 makes an unsolicited commercial mail an
// actionable nuisance, and the GDPR requires the consent to be demonstrable per
// address. So an address sits in `pending` until the person clicks a link that
// only reached the mailbox they claimed. Until then nothing else is ever sent to
// it — which also means a typed-in address belonging to someone else costs them
// exactly one mail, and never a subscription.
//
// The wording that was agreed to is stored with the address rather than hardcoded
// at send time, because a consent record that cannot show *what* was consented to
// is not a record.

/** The sentence a subscriber agrees to. Stored per address, with the timestamp. */
const CONSENT_DE = 'Ich möchte den CareerAI-Newsletter mit Produktneuigkeiten und '
  + 'Hinweisen zum deutschen IT-Arbeitsmarkt per E-Mail erhalten. '
  + 'Die Einwilligung kann jederzeit über den Abmeldelink widerrufen werden.';

const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000;   // a week to find the mail

/** Is this plausibly an address? Deliberately loose: the confirmation is the test. */
function looksLikeEmail(value) {
  const s = String(value || '').trim();
  return s.length >= 6 && s.length <= 254 && /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/.test(s);
}

function normalise(value) { return String(value || '').trim().toLowerCase(); }

/**
 * The confirmation mail.
 *
 * Plain text, like the digest: it lands in a mailbox and every client renders it
 * the same way. It states who is writing, what was asked for and what happens if
 * the reader did nothing — because for a mistyped address, that reader is a
 * stranger and the honest thing is to tell them to ignore it.
 */
function composeConfirm({ baseUrl, token, consentText }) {
  const link = `${baseUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  return {
    subject: 'Bitte bestätigen Sie Ihren CareerAI-Newsletter',
    text: [
      'Guten Tag,',
      '',
      'jemand — vermutlich Sie — hat diese Adresse für den CareerAI-Newsletter angemeldet.',
      '',
      'Bitte bestätigen Sie die Anmeldung über diesen Link:',
      link,
      '',
      'Der Link ist sieben Tage gültig.',
      '',
      'Sie haben sich nicht angemeldet? Dann ignorieren Sie diese Nachricht einfach.',
      'Ohne Bestätigung senden wir Ihnen nichts weiter, und die Adresse wird nicht gespeichert.',
      '',
      'Ihre Einwilligung im Wortlaut:',
      consentText || CONSENT_DE,
      '',
      '— CareerAI',
    ].join('\n'),
  };
}

/**
 * A newsletter issue.
 *
 * Every mail carries its own unsubscribe link. Not a reply-to, not an address to
 * write to: one click, no login, no reason asked. It is required, and it is also
 * the only version of this that a reader trusts.
 *
 * `items` are links with a source and a date rather than prose. This project
 * refuses to invent facts everywhere else — the import guard, the date anchoring —
 * and a summary of the news generated at send time would be the one place it
 * published something nobody checked.
 */
function composeIssue({ baseUrl, token, title, intro, items }) {
  const link = `${baseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
  const lines = [String(title || 'CareerAI'), '', String(intro || '').trim(), ''];

  (items || []).forEach((it) => {
    const when = String(it.date || '').trim();
    lines.push('• ' + String(it.title || '').trim() + (when ? '  (' + when + ')' : ''));
    if (it.note) lines.push('  ' + String(it.note).trim());
    if (it.url) lines.push('  ' + String(it.url).trim());
    if (it.source) lines.push('  Quelle: ' + String(it.source).trim());
    lines.push('');
  });

  lines.push('—');
  lines.push('Sie erhalten diese E-Mail, weil Sie den CareerAI-Newsletter bestätigt haben.');
  lines.push('Abmelden mit einem Klick: ' + link);
  return { subject: String(title || 'CareerAI'), text: lines.join('\n') };
}

module.exports = {
  CONSENT_DE, CONFIRM_TTL_MS,
  looksLikeEmail, normalise, composeConfirm, composeIssue,
};
