/**
 * pdf-parser.js — Server-side PDF text extraction (no external packages).
 *
 * Strategy:
 *   1. Scan uncompressed PDF streams for BT…ET text blocks (Tj / TJ operators).
 *   2. Decompress FlateDecode (zlib) streams and repeat step 1.
 *   3. Fallback: extract printable ASCII runs (filtered to avoid binary garbage).
 *
 * The garbled-text bug was caused by step 3 returning raw binary bytes
 * that happened to be in the Latin-1 range.  The fix: a "readability"
 * filter that rejects any line where more than 20% of characters are
 * outside printable ASCII (0x20–0x7E).
 */

const zlib = require('zlib');

// ── PDF string decoder ────────────────────────────────────────────────────

function decodePdfStr(s) {
  return s
    .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
}

// ── Text extraction from a decoded stream string ──────────────────────────

function pullText(streamStr, out) {
  const btEt = /BT([\s\S]*?)ET/g;
  let m;
  while ((m = btEt.exec(streamStr)) !== null) {
    const block = m[1];

    // (string) Tj  or  (string) '  or  (string) "
    const tj = /\(([^)]*)\)\s*(?:Tj|'|")/g;
    let t;
    while ((t = tj.exec(block)) !== null) {
      const txt = decodePdfStr(t[1]).trim();
      if (txt) out.push(txt);
    }

    // [(string)(string)…] TJ
    const tjArr = /\[([^\]]*)\]\s*TJ/g;
    while ((t = tjArr.exec(block)) !== null) {
      const parts = [];
      const sp = /\(([^)]*)\)/g;
      let s;
      while ((s = sp.exec(t[1])) !== null) {
        const txt = decodePdfStr(s[1]);
        if (txt.trim()) parts.push(txt);
      }
      if (parts.length) out.push(parts.join(''));
    }
  }
}

// ── Readability filter ────────────────────────────────────────────────────

function isReadable(line) {
  if (!line || line.length < 2) return false;
  let printable = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line.charCodeAt(i);
    if (c >= 0x20 && c <= 0x7e) printable++;
  }
  // At least 80% of characters must be standard printable ASCII
  return printable / line.length >= 0.8;
}

// ── Main entry point ──────────────────────────────────────────────────────

/**
 * Extracts readable text from a PDF Buffer.
 * @param {Buffer} buffer
 * @returns {string}  Cleaned plain text
 */
function extractText(buffer) {
  const chunks = [];
  const raw    = buffer.toString('binary');

  // Pass 1: uncompressed BT…ET blocks
  pullText(raw, chunks);

  // Pass 2: decompress FlateDecode streams
  const streamRe = /FlateDecode[^\n]*\nstream\r?\n([\s\S]*?)endstream/g;
  let m;
  while ((m = streamRe.exec(raw)) !== null) {
    try {
      const decompressed = zlib.inflateSync(Buffer.from(m[1], 'binary')).toString('latin1');
      pullText(decompressed, chunks);
    } catch (_) { /* stream may use a different codec */ }
  }

  if (chunks.length > 0) {
    return chunks.join(' ').replace(/\s{2,}/g, ' ').trim();
  }

  // Fallback: extract printable ASCII runs — apply readability filter to
  // avoid returning garbled binary data (the original bug).
  return buffer.toString('latin1')
    .replace(/[^\x20-\x7e\n\r\t]/g, ' ')
    .split(/[\n\r]+/)
    .map(l => l.trim())
    .filter(isReadable)
    .join('\n')
    .replace(/[ \t]{3,}/g, '  ')
    .trim();
}

module.exports = { extractText };
