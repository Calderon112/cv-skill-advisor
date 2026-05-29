/**
 * auth.js — Auth modal (login / register) and sidebar user display.
 */

import { state, persistAuth, clearAuth } from './state.js';
import { api } from './api.js';

const $ = id => document.getElementById(id);

// ── Modal visibility ──────────────────────────────────────────────────────

export function showAuthModal() { $('auth-modal').classList.remove('hidden'); }
export function hideAuthModal() { $('auth-modal').classList.add('hidden');    }

// ── Sidebar user chip ─────────────────────────────────────────────────────

export function updateAuthUI() {
  const name = state.user || '';
  $('sidebar-username').textContent = name || 'Not signed in';
  $('user-avatar').textContent      = name ? name[0].toUpperCase() : '?';
  $('sidebar-auth-btn').textContent = name ? 'Sign out' : 'Sign in';
}

// ── Tab switcher ──────────────────────────────────────────────────────────

function setTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.modalTab === tab)
  );
  $('modal-login').classList.toggle('active',    tab === 'login');
  $('modal-register').classList.toggle('active', tab === 'register');
}

// ── Event handlers ────────────────────────────────────────────────────────

export function initAuth() {
  // Tab switcher
  document.querySelectorAll('.modal-tab').forEach(b =>
    b.addEventListener('click', () => setTab(b.dataset.modalTab))
  );

  // Login
  $('login-btn').addEventListener('click', async () => {
    const msg = $('login-msg');
    msg.textContent = '';
    try {
      const data = await api.login({
        username: $('login-username').value.trim(),
        password: $('login-password').value.trim()
      });
      persistAuth(data.token, data.user.name);
      updateAuthUI();
      hideAuthModal();
    } catch (e) { msg.textContent = e.message || 'Login failed.'; }
  });

  // Register
  $('register-btn').addEventListener('click', async () => {
    const msg = $('register-msg');
    msg.className = 'form-msg';
    msg.textContent = '';
    try {
      const data = await api.register({
        name:     $('reg-name').value.trim(),
        username: $('reg-username').value.trim(),
        password: $('reg-password').value.trim()
      });
      persistAuth(data.token, data.user.name);
      updateAuthUI();
      msg.className = 'form-msg ok';
      msg.textContent = 'Account created!';
      setTimeout(hideAuthModal, 700);
    } catch (e) { msg.textContent = e.message || 'Registration failed.'; }
  });

  // Sign out / Sign in toggle
  $('sidebar-auth-btn').addEventListener('click', () => {
    if (state.user) { clearAuth(); updateAuthUI(); }
    else            { showAuthModal(); }
  });
}
