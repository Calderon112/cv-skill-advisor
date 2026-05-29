/**
 * router.js — Client-side page navigation (no URL changes).
 *
 * Each "page" is a <section id="page-{name}"> element.
 * The active nav button gets the .active class.
 * Hooks let agents react to page changes.
 */

const PIPE_MAP = {
  scout:   'pipe-01',
  matcher: 'pipe-02',
  writer:  'pipe-03',
  tracker: 'pipe-04'
};

// Registered lifecycle hooks: { onEnter: { pageName: fn } }
const hooks = { onEnter: {} };

export function onEnter(page, fn) {
  hooks.onEnter[page] = fn;
}

export function navigate(page) {
  // Hide all pages, deactivate all nav buttons and pipe steps
  document.querySelectorAll('.page').forEach(p    => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b  => b.classList.remove('active'));
  document.querySelectorAll('.pipe-step').forEach(s => s.classList.remove('active'));

  // Activate target page
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  // Activate matching nav button(s)
  document.querySelectorAll(`[data-page="${page}"]`).forEach(b => {
    if (b.classList.contains('nav-btn')) b.classList.add('active');
  });

  // Highlight pipeline step
  const pipeId = PIPE_MAP[page];
  if (pipeId) document.getElementById(pipeId)?.classList.add('active');

  // Run lifecycle hook if registered
  hooks.onEnter[page]?.();
}

// Wire every [data-page] element as a navigation trigger
export function initRouter() {
  document.querySelectorAll('[data-page]').forEach(el =>
    el.addEventListener('click', () => navigate(el.dataset.page))
  );
}
