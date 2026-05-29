/**
 * state.js — Single shared state object for the whole application.
 *
 * All agents read from and write to this object.
 * Persisted fields (token, user, apps) are also mirrored in localStorage.
 */

export const state = {
  // Auth
  token: localStorage.getItem('careerai-token') || null,
  user:  localStorage.getItem('careerai-user')  || null,

  // Agent data
  cvText:    '',
  analysis:  null,       // { foundSkills, missingSkills, roles }
  jobs:      [],         // all jobs returned by last search
  matches:   [],         // jobs with .score added by Matcher Agent
  apps:      JSON.parse(localStorage.getItem('careerai-apps') || '[]'),

  // Stats
  docsCount: 0,
  online:    false
};

export function persistAuth(token, name) {
  state.token = token;
  state.user  = name;
  localStorage.setItem('careerai-token', token);
  localStorage.setItem('careerai-user',  name);
}

export function clearAuth() {
  state.token = null;
  state.user  = null;
  localStorage.removeItem('careerai-token');
  localStorage.removeItem('careerai-user');
}

export function persistApps() {
  localStorage.setItem('careerai-apps', JSON.stringify(state.apps));
}
