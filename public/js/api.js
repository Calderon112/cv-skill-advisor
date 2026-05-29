/**
 * api.js — Thin fetch wrapper for all server calls.
 *
 * All functions return parsed JSON or throw an Error.
 * The token is read from state on every call so it stays fresh.
 */

import { state } from './state.js';

const BASE = window.location.origin;

function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra };
  if (state.token) h.Authorization = `Bearer ${state.token}`;
  return h;
}

async function request(method, path, body) {
  const opts = { method, headers: headers() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(BASE + path, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

export const api = {
  get:    path        => request('GET',    path),
  post:   (path, b)   => request('POST',   path, b),
  put:    (path, b)   => request('PUT',    path, b),
  delete: path        => request('DELETE', path),

  // Named shortcuts
  status:       ()     => request('GET',  '/api/status'),
  register:     body   => request('POST', '/api/register',  body),
  login:        body   => request('POST', '/api/login',     body),
  analyze:      text   => request('POST', '/api/analyze',   { text }),
  parsePdf:     b64    => request('POST', '/api/parse-pdf', { pdf: b64 }),
  searchJobs:   params => request('GET',  '/api/jobs?' + new URLSearchParams(params)),
  scrapeAll:    body   => request('POST', '/api/scrape-all', body),
  getApps:      ()     => request('GET',  '/api/applications'),
  createApp:    body   => request('POST', '/api/applications', body),
  updateApp:    (id,b) => request('PUT',  `/api/applications/${id}`, b),
  deleteApp:    id     => request('DELETE',`/api/applications/${id}`),
  adminDb:      ()     => request('GET',  '/api/admin/db')
};
