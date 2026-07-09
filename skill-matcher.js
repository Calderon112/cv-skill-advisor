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

  function skillPresent(skill, normalizedText) {
    return regexesFor(skill).some((re) => re.test(normalizedText));
  }

  /**
   * Detect every skill of `groups` present in `text`. Returns `{ key, label }` pairs:
   * aliases are a matching detail and must not leak into API payloads or LLM prompts.
   */
  function findSkills(text, groups) {
    const normalized = normalize(text || '');
    const found = [];
    (groups || []).forEach((group) => {
      (group.skills || []).forEach((skill) => {
        if (skillPresent(skill, normalized)) found.push({ key: skill.key, label: skill.label });
      });
    });
    return found;
  }

  return { normalize, findSkills, skillPresent, toRegex, publicSkill: (s) => ({ key: s.key, label: s.label }) };
});
