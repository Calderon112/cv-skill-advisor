// GDPR banner, theme toggle and the robot speech bubble. Extracted verbatim from an
// inline <script> in index.html so the Content-Security-Policy can drop
// script-src 'unsafe-inline' — with it, any injected <script> would still run.
const GDPR_KEY = 'careerai-gdpr-consent';

function gdprInit() {
  if (!localStorage.getItem(GDPR_KEY)) {
    document.getElementById('gdpr-banner').style.display = 'flex';
  } else {
    document.getElementById('gdpr-banner').style.display = 'none';
  }
}

function gdprAccept() {
  localStorage.setItem(GDPR_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
  document.getElementById('gdpr-banner').style.display = 'none';
}

function gdprReject() {
  localStorage.setItem(GDPR_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
  document.getElementById('gdpr-banner').style.display = 'none';
}

function showPrivacyModal() {
  document.getElementById('privacy-modal').style.display = 'flex';
}

function closePrivacyModal() {
  document.getElementById('privacy-modal').style.display = 'none';
}

document.getElementById('privacy-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('privacy-modal')) closePrivacyModal();
});

// Wired here, NOT with onclick="" in the markup. The CSP sets script-src 'self'
// with no 'unsafe-inline', and an inline handler attribute is inline script: the
// browser refuses to run it. The buttons stayed visible and did nothing at all,
// with the consent banner covering the page — the app was unusable in production
// while working fine locally, where the header is not sent.
(function wireConsentBanner() {
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
  on('gdpr-accept', gdprAccept);
  on('gdpr-reject', gdprReject);
  on('privacy-close', closePrivacyModal);
  on('gdpr-policy-link', e => { e.preventDefault(); showPrivacyModal(); });
})();

// Lance au chargement
gdprInit();

// Light / dark theme toggle (persisted in localStorage)
(function themeToggle() {
  const btns = document.querySelectorAll('.theme-toggle');
  if (!btns.length) return;
  const apply = (theme) => {
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    btns.forEach(b => { b.textContent = theme === 'light' ? '☀️' : '🌙'; });
  };
  apply(localStorage.getItem('careerai-theme') || 'dark');
  btns.forEach(btn => btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('careerai-theme', next); } catch (e) {}
    apply(next);
  }));
})();

// Robot speech bubble — alternating phrases, synced with the pop animation
(function rotateSpeech() {
  const bubble = document.querySelector('.robot-speech');
  if (!bubble) return;
  const phrases = [
    'Welcome <span class="speech-wave">👋</span>',
    'Let\'s find your job! <span class="speech-wave">🚀</span>',
    'Ready to get hired? <span class="speech-wave">💼</span>',
  ];
  let i = 0;
  // Swap text while the bubble is hidden (start of each animation cycle)
  bubble.addEventListener('animationiteration', () => {
    i = (i + 1) % phrases.length;
    bubble.innerHTML = phrases[i];
  });
})();
