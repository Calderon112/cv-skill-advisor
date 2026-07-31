'use strict';

// ── Measured salary bands ────────────────────────────────────────────────────
//
// Replaces a hardcoded "42.000 – 52.000 €" that every entry-level role in every
// domain displayed, with a band computed from job ads actually scraped for that
// role — and, just as importantly, with the evidence behind it: how many ads were
// read, and how many of them stated a salary at all.
//
// Two decisions that make the number defensible rather than merely plausible:
//
//   Quartiles, not min–max. One unpaid-looking internship and one CISO posting
//   would otherwise produce "20.000 – 150.000 €", which is true and useless. The
//   25th–75th percentile describes where the middle half of the market sits.
//
//   A floor on the sample. Below MIN_SAMPLE ads with a salary the band is not
//   reported at all. German postings mostly omit pay — a band drawn from two ads
//   is an anecdote wearing the costume of a statistic.

const MIN_SAMPLE = 5;

// Annual gross, in EUR. Outside this range a figure is not an annual salary:
// below it is usually a monthly rate or an hourly one, above it a phone number, a
// postcode or a revenue figure caught by the regex.
const MIN_PLAUSIBLE = 18000;
const MAX_PLAUSIBLE = 250000;

/**
 * Pull annual salary figures out of one ad.
 *
 * German ads quote monthly pay often enough that ignoring it would silently drop
 * good data, so an explicit monthly marker converts; an ambiguous small number is
 * discarded rather than guessed at.
 *
 * @returns {number[]} plausible annual figures found (0, 1 or 2 of them)
 */
function extractAnnual(text) {
  const s = String(text || '');
  if (!s) return [];

  // 1.234,56 style separators removed so \d{4,6} sees whole numbers.
  const normalised = s.replace(/(\d)[.\s](?=\d{3}\b)/g, '$1');
  const monthly = /\b(pro\s*monat|monatlich|per\s*month|\/\s*monat|p\.?\s*m\.?)\b/i.test(s);
  const hourly = /\b(pro\s*stunde|stundenlohn|per\s*hour|\/\s*(h|std))\b/i.test(s);
  if (hourly) return [];   // an hourly rate says nothing about annual pay without hours

  // A bare number in the plausible window is not evidence of pay: German postcodes
  // are five digits, and 45879 Gelsenkirchen would have been read as a salary. The
  // figure has to be attached to a currency, either directly or as one end of a
  // range whose other end carries it.
  const CUR = '(?:€|EUR|eur)';
  const found = [];

  //  "50000 - 70000 €"  /  "€ 50000 bis 70000"
  const rangeRe = new RegExp(`(\\d{4,6})\\s*(?:-|–|—|bis|to)\\s*(\\d{4,6})\\s*${CUR}|${CUR}\\s*(\\d{4,6})\\s*(?:-|–|—|bis|to)\\s*(\\d{4,6})`, 'gi');
  let m;
  while ((m = rangeRe.exec(normalised)) !== null) {
    found.push(Number(m[1] || m[3]), Number(m[2] || m[4]));
  }

  //  "70000 €"  /  "€ 70000"
  if (!found.length) {
    const singleRe = new RegExp(`(\\d{4,6})\\s*${CUR}|${CUR}\\s*(\\d{4,6})`, 'gi');
    while ((m = singleRe.exec(normalised)) !== null) found.push(Number(m[1] || m[2]));
  }

  const out = [];
  for (let n of found) {
    if (monthly) n *= 12;
    if (n >= MIN_PLAUSIBLE && n <= MAX_PLAUSIBLE) out.push(n);
  }
  // A range gives two numbers; anything more is the regex catching noise.
  return out.slice(0, 2);
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

/**
 * Measure a band from scraped ads.
 *
 * @param {Array} jobs  [{ salary, title, description }]
 * @returns {object} always reports `read` and `withSalary` so the caller can be
 *   honest about coverage even when there is no band to show.
 */
function measureBand(jobs) {
  const list = Array.isArray(jobs) ? jobs : [];
  const values = [];

  for (const j of list) {
    // The salary field first — when a source fills it, it is the reliable one.
    // Falling back to the description finds the many ads that only mention pay in
    // prose, at the cost of the occasional false positive, which the plausibility
    // window and the quartiles both absorb.
    const found = extractAnnual(j.salary) .length
      ? extractAnnual(j.salary)
      : extractAnnual(j.description);
    if (found.length) values.push(found.length === 2 ? (found[0] + found[1]) / 2 : found[0]);
  }

  const sorted = values.slice().sort((a, b) => a - b);
  const result = {
    read: list.length,
    withSalary: sorted.length,
    enough: sorted.length >= MIN_SAMPLE,
    minSample: MIN_SAMPLE,
    low: null, high: null, median: null, currency: 'EUR',
  };
  if (!result.enough) return result;

  result.low = percentile(sorted, 0.25);
  result.high = percentile(sorted, 0.75);
  result.median = percentile(sorted, 0.5);
  return result;
}

/** "48.000 – 61.000 €", or null when there is nothing honest to print. */
function formatBand(band) {
  if (!band || !band.enough) return null;
  const fmt = (n) => n.toLocaleString('de-DE', { maximumFractionDigits: 0 });
  return `${fmt(band.low)} – ${fmt(band.high)} €`;
}

module.exports = { measureBand, formatBand, extractAnnual, _internals: { percentile, MIN_SAMPLE } };
