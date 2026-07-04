/**
 * rag.js — Tiny retrieval layer for the grounded CareerBot.
 *
 * Builds a knowledge base from the concrete skill-learning resources
 * (security-learning.js) plus a small app FAQ, embeds it once (cached), and
 * retrieves the top-k most relevant chunks for a user question. No vector DB —
 * an in-memory cosine search is plenty for a KB of ~70 chunks.
 */
const path = require('path');
const embeddings = require('./embeddings');
const SecurityLearning = require(path.join(__dirname, '..', 'security-learning.js'));

// Static app FAQ — grounds answers about how CareerAI itself works.
const APP_FAQ = [
  { title: 'What CareerAI does', text: 'CareerAI analyzes your CV, detects skill gaps against IT-Security roles, scores and ranks real job offers from German and international platforms, and generates tailored CVs and cover letters.' },
  { title: 'Job match score', text: 'Each job shows a match %. It is a weighted, deterministic score: skills 45%, role 20%, location 10%, remote 10%, seniority 10%, salary 5%. Semantic similarity can further re-rank results. Jobs are ordered surest-first and each card lists the skills you are missing.' },
  { title: 'Job sources', text: 'The app aggregates Bundesagentur, Arbeitnow, LinkedIn, Remotive, and (with keys) Adzuna, Jooble and StepStone/Indeed via Apify. Search depth is configurable — more pages means more jobs but slower.' },
  { title: 'CV and cover letter generation', text: 'The Writer agent generates a tailored CV and cover letters grounded in your profile and the target job description. It uses an LLM when a key is configured, with a template fallback otherwise.' },
  { title: 'Photo on CV', text: 'Upload a photo in Professional Profile (JPG/PNG), or let the app auto-extract it from your uploaded CV PDF. The photo appears top-right on the generated CV PDF.' },
  { title: 'Privacy', text: 'The app runs locally; your data stays on your machine. Optional AI providers (Anthropic/Gemini/OpenAI) only receive the text needed to generate a document when you trigger it.' },
];

let _kb = null;    // [{ id, title, text }]
let _vecs = null;  // number[][] aligned with _kb
let _building = null;

/** Assemble the KB chunks (skill resources + FAQ). */
function buildChunks() {
  const chunks = [];
  const res = SecurityLearning.LEARNING_RESOURCES || {};
  for (const skill of Object.keys(res)) {
    const r = res[skill];
    chunks.push({
      id: `skill:${skill}`,
      title: skill,
      text: `Skill: ${skill}. How to learn it: ${r.how}. Recommended resource: ${r.resource}.`,
    });
  }
  APP_FAQ.forEach((f, i) => chunks.push({ id: `faq:${i}`, title: f.title, text: `${f.title}. ${f.text}` }));
  return chunks;
}

/** Embed the KB once (idempotent). Safe to call repeatedly. */
async function ensureIndex() {
  if (_kb && _vecs) return;
  if (_building) return _building;
  _building = (async () => {
    const chunks = buildChunks();
    const vecs = await embeddings.embed(chunks.map((c) => c.text));
    _kb = chunks;
    _vecs = vecs;
  })();
  try { await _building; } finally { _building = null; }
}

/**
 * Retrieve the top-k KB chunks most relevant to `query`.
 * @returns {Promise<Array<{id,title,text,score}>>}
 */
async function retrieve(query, k = 4) {
  if (!embeddings.isAvailable()) return [];
  await ensureIndex();
  const [qv] = await embeddings.embed([query]);
  return _kb
    .map((c, i) => ({ ...c, score: embeddings.cosine(qv, _vecs[i]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

module.exports = { retrieve, ensureIndex, isAvailable: embeddings.isAvailable };
