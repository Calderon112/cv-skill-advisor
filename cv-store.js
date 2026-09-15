/**
 * cv-store.js — more than one CV, because more than one application.
 *
 * The profile was a single object in localStorage, which is the right shape for "my
 * details" and the wrong one for what people actually do: a version tuned for TÜVIT
 * that leads with security coursework, another for a Systemhaus that leads with the
 * Werkstudent jobs. Keeping both meant keeping one and retyping the other.
 *
 * So the store holds a list, and one of them is active. Everything else in the
 * application keeps reading `state.profile` and has no idea this exists — the
 * active CV IS state.profile. That is deliberate: the alternative was teaching the
 * job search, the letter writer and the PDF generator about versions, and every one
 * of those would have been a place to forget.
 *
 * Storage is injected rather than reached for, so the migration — the one step that
 * can lose someone's existing CV — is testable without a browser.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CvStore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const KEY = 'careerai-cvs';
  // What the single-profile version wrote. Still written on every save, so a rollback
  // to a build without this file finds the active CV where it expects one.
  const LEGACY_KEY = 'careerai-profile';

  // The fields that describe the person rather than the application. A new CV starts
  // with these filled: nobody wants to retype their own phone number to tailor a
  // summary, and an empty contact block is the first thing the check complains about.
  const IDENTITY = ['firstName', 'lastName', 'email', 'phone', 'location', 'nationality', 'photo'];

  const clone = (v) => JSON.parse(JSON.stringify(v == null ? null : v));
  const str = (v) => String(v == null ? '' : v).trim();

  let seq = 0;
  // Date.now() alone repeats when a CV is duplicated straight after being created —
  // both land in the same millisecond and the second one overwrites the first.
  const newId = () => 'cv-' + Date.now().toString(36) + '-' + (seq++).toString(36);

  const nameFor = (profile, fallback) =>
    str(profile && profile.title) || str(fallback) || 'Lebenslauf';

  /**
   * @param storage   anything with getItem/setItem — localStorage, or a fake
   * @param makeEmpty () => a blank profile, so this file does not have to know the shape
   */
  function createStore(storage, makeEmpty) {
    const blank = () => (typeof makeEmpty === 'function' ? makeEmpty() : {});
    let data = null;

    function persist() {
      const item = active();
      try {
        storage.setItem(KEY, JSON.stringify(data));
        if (item) storage.setItem(LEGACY_KEY, JSON.stringify(item.profile));
        return { ok: true };
      } catch (e) {
        // Photos are data URLs and each CV carries its own copy, so this is reachable
        // with a handful of versions rather than hundreds. Reported, because a save
        // that fails in silence is how someone loses an afternoon's edits.
        return { ok: false, reason: (e && e.name === 'QuotaExceededError') ? 'quota' : 'storage' };
      }
    }

    /**
     * Read the store, or build one.
     *
     * The migration is the part that matters: someone using this application today
     * has a profile under the old key and no list. It becomes the first entry, and
     * the old key is left where it is rather than deleted — if this build is rolled
     * back, their CV is still there.
     */
    function load() {
      let parsed = null;
      try { parsed = JSON.parse(storage.getItem(KEY)); } catch (_) { parsed = null; }

      if (parsed && Array.isArray(parsed.items) && parsed.items.length) {
        data = parsed;
        if (!active()) data.activeId = data.items[0].id;
        return data;
      }

      let legacy = null;
      try { legacy = JSON.parse(storage.getItem(LEGACY_KEY)); } catch (_) { legacy = null; }

      const profile = legacy && typeof legacy === 'object' ? legacy : blank();
      const first = { id: newId(), name: nameFor(profile, 'Mein Lebenslauf'), updatedAt: Date.now(), profile };
      data = { version: 1, activeId: first.id, items: [first] };
      persist();
      return data;
    }

    const state = () => data || load();
    const items = () => state().items;
    const active = () => (data ? data.items.find((i) => i.id === data.activeId) || null : null);
    const activeProfile = () => { const a = state() && active(); return a ? a.profile : null; };

    /** Write the profile the application has been mutating back into the active CV. */
    function save(profile) {
      state();
      const item = active();
      if (!item) return { ok: false, reason: 'none' };
      // Assigned rather than assumed: several callers replace state.profile outright
      // — an import, a reset, a JSON Resume load — and after that the item no longer
      // points at the object the application is editing.
      item.profile = profile;
      item.updatedAt = Date.now();
      return persist();
    }

    function switchTo(id) {
      state();
      if (!data.items.some((i) => i.id === id)) return null;
      data.activeId = id;
      persist();
      return activeProfile();
    }

    function create(name) {
      state();
      const from = activeProfile() || {};
      const profile = blank();
      IDENTITY.forEach((k) => { if (from[k]) profile[k] = from[k]; });
      const item = { id: newId(), name: str(name) || 'Neuer Lebenslauf', updatedAt: Date.now(), profile };
      data.items.push(item);
      data.activeId = item.id;
      persist();
      return item;
    }

    function duplicate(name) {
      state();
      const from = active();
      if (!from) return null;
      const item = {
        id: newId(),
        name: str(name) || (from.name + ' (Kopie)'),
        updatedAt: Date.now(),
        // A deep copy. A shallow one shares the experience array, and editing the
        // copy would rewrite the original — the exact thing duplicating is for.
        profile: clone(from.profile),
      };
      data.items.push(item);
      data.activeId = item.id;
      persist();
      return item;
    }

    function rename(id, name) {
      state();
      const item = data.items.find((i) => i.id === id);
      if (!item || !str(name)) return null;
      item.name = str(name);
      persist();
      return item;
    }

    /** Refused for the last one: an application with no CV has no state to return to. */
    function remove(id) {
      state();
      if (data.items.length < 2) return { ok: false, reason: 'last' };
      const i = data.items.findIndex((x) => x.id === id);
      if (i === -1) return { ok: false, reason: 'unknown' };
      data.items.splice(i, 1);
      if (data.activeId === id) data.activeId = data.items[Math.min(i, data.items.length - 1)].id;
      persist();
      return { ok: true, profile: activeProfile() };
    }

    return { load, state, items, active, activeProfile, save, switchTo, create, duplicate, rename, remove };
  }

  return { createStore, KEY, LEGACY_KEY, IDENTITY };
});
