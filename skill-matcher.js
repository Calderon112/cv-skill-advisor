/**
 * skill-matcher.js — Keyword-layer skill detection, shared by server, frontend and tests.
 *
 * UMD module: works both server-side (require) and in the browser (window.SkillMatcher).
 *
 * Matching is exact-surface with word boundaries, over the skill key plus its
 * declared aliases. Boundaries matter: a plain substring test detects `nist`
 * inside "admiNISTrateur". Keys and aliases are normalized like the haystack, so
 * a key may carry punctuation (`tcp/ip`, `cross-site scripting`) that normalize()
 * would otherwise strip from the text but not from the key.
 *
 * This layer is deliberately literal. Paraphrases ("log correlation" for SIEM) are
 * out of scope here and belong to the semantic layer (server/embeddings.js).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.SkillMatcher = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function normalize(text) {
    return String(text).toLowerCase().replace(/[.,;:()\-\/]/g, ' ');
  }

  // Word characters for boundary purposes. Anchors are only added on edges that
  // are word characters: a key like `comptia security+` ends on `+`, and a `\b`
  // there would demand a following word char and never match.
  const EDGE = /[a-z0-9]/;

  function toRegex(surface) {
    const norm = normalize(surface).trim();
    const escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const body = escaped.replace(/\s+/g, '\\s+');
    const left = EDGE.test(norm[0]) ? '(?<![a-z0-9])' : '';
    const right = EDGE.test(norm[norm.length - 1]) ? '(?![a-z0-9])' : '';
    return new RegExp(left + body + right);
  }

  // Compiled patterns are cached per skill *object*, not per key: the same key can
  // appear in two taxonomies with different aliases, and keying by string would
  // serve the first one's patterns to the second.
  const _cache = new WeakMap();

  function regexesFor(skill) {
    let res = _cache.get(skill);
    if (!res) {
      res = [skill.key, ...(skill.aliases || [])].map(toRegex);
      _cache.set(skill, res);
    }
    return res;
  }

  // ── Negation ──────────────────────────────────────────────────────────────
  //
  // "No CISSP" used to register as a CISSP hit: the matcher tested for presence of
  // the surface form and nothing else. A CV stating an absence therefore produced
  // the certification, and the Writer had a detected skill to build a sentence on.
  // Reported in the Sprint-3 review.
  //
  // Cues in three languages because the CVs are German, and students write them in
  // English too.
  const NEGATION_CUES = [
    'no', 'not', 'without', 'never', 'lacking', 'lack of', 'missing', 'none',
    'kein', 'keine', 'keinen', 'keiner', 'ohne', 'nicht', 'fehlt', 'fehlende',
    'pas de', 'sans', 'aucun', 'aucune',
  ];
  // Short on purpose. A long window swallows "I have no problem working with
  // Splunk"; three or four words is enough for the constructions that actually
  // appear ("no CISSP", "ohne Zertifizierung", "keine Erfahrung mit Splunk").
  const NEG_WINDOW = 30;
  const NEG_RE = new RegExp('(?:^|[^a-z0-9])(?:' + NEGATION_CUES.join('|') + ')(?![a-z0-9])', 'i');

  // Constructions where the cue denies its own noun and not the skill behind it:
  // "no problem working with Splunk" claims Splunk, it does not disclaim it. Word
  // distance cannot separate these — "no problem working with Splunk" and "keine
  // Erfahrung mit Splunk" put two or three words between cue and skill either way —
  // so the phrases are named instead. A heuristic with a listed scope beats one
  // that silently guesses.
  const NEUTRALISED = /\b(?:no|not a)\s+(?:problem|issue|trouble|doubt|stranger)\b|\bkein\s+problem\b|\bkeine\s+(?:schwierigkeit|probleme)\b/i;

  /**
   * Is the occurrence at `index` denied by something just before it?
   *
   * `rawText` is consulted for punctuation, not `normalizedText`: normalize()
   * turns `.` `;` `(` into spaces, which destroys exactly the sentence boundaries
   * this needs. The two strings are index-aligned — normalize() replaces each of
   * those characters with a single space and toLowerCase does not change length —
   * so an offset found in one is valid in the other.
   */
  function negatedAt(normalizedText, rawText, index) {
    const from = Math.max(0, index - NEG_WINDOW);
    let window = normalizedText.slice(from, index);
    const rawWindow = (rawText || normalizedText).slice(from, index);

    // Stop at a sentence end or a contrastive turn: in "No CISSP, but Security+ is
    // done", the negation governs CISSP and must not reach Security+.
    const stop = Math.max(
      rawWindow.lastIndexOf('.'), rawWindow.lastIndexOf(';'), rawWindow.lastIndexOf('!'),
      rawWindow.lastIndexOf('?'), rawWindow.lastIndexOf('\n'),
      window.lastIndexOf(' but '), window.lastIndexOf(' aber '), window.lastIndexOf(' mais '),
    );
    if (stop !== -1) window = window.slice(stop + 1);

    if (NEUTRALISED.test(window)) return false;
    return NEG_RE.test(window);
  }

  /**
   * Present if AT LEAST ONE occurrence is not negated.
   *
   * Every occurrence is examined rather than the first: "No CISSP yet — CISSP exam
   * booked for June" states the skill after denying it, and stopping at the first
   * match would drop it.
   */
  function skillPresent(skill, normalizedText, rawText) {
    return regexesFor(skill).some((re) => {
      const global = new RegExp(re.source, 'g');
      let m;
      let sawOccurrence = false;
      while ((m = global.exec(normalizedText)) !== null) {
        sawOccurrence = true;
        if (!negatedAt(normalizedText, rawText, m.index)) return true;
        if (global.lastIndex === m.index) global.lastIndex += 1;   // zero-width guard
      }
      return sawOccurrence ? false : false;
    });
  }

  /**
   * Detect every skill of `groups` present in `text`. Returns `{ key, label }` pairs:
   * aliases are a matching detail and must not leak into API payloads or LLM prompts.
   */
  function findSkills(text, groups) {
    const raw = String(text || '');
    const normalized = normalize(raw);
    const found = [];
    (groups || []).forEach((group) => {
      (group.skills || []).forEach((skill) => {
        if (skillPresent(skill, normalized, raw)) found.push({ key: skill.key, label: skill.label });
      });
    });
    return found;
  }

  return { normalize, findSkills, skillPresent, toRegex, publicSkill: (s) => ({ key: s.key, label: s.label }) };
});
