// ════════════════════════════════════════════════════════════════════
// PATCH — server.js : Fix extractPdfText() pour PDFs modernes
// ════════════════════════════════════════════════════════════════════
//
// ÉTAPE 1 : installe pdf-parse
//   npm install pdf-parse
//
// ÉTAPE 2 : ajoute ces lignes après les require() existants (ligne ~6)
// ════════════════════════════════════════════════════════════════════

let pdfParse;
try { pdfParse = require('pdf-parse'); } catch(_) { pdfParse = null; }

// ════════════════════════════════════════════════════════════════════
// ÉTAPE 3 : remplace entièrement la fonction extractPdfText()
// (lignes ~1059-1090 dans ton server.js)
// ════════════════════════════════════════════════════════════════════

async function extractPdfText(buffer) {
  // ── Tentative 1 : pdf-parse (gère UTF-16, CMap, PDFs Word/Canva/Adobe) ──
  if (pdfParse) {
    try {
      const data = await pdfParse(buffer, {
        // Disable test-file warnings
        version: 'v1.10.100'
      });
      const text = (data.text || '').trim();
      if (text.length > 30) {
        console.log(`[PDF] pdf-parse extracted ${text.length} chars`);
        return text;
      }
    } catch (err) {
      console.warn('[PDF] pdf-parse failed, trying manual extraction:', err.message);
    }
  }

  // ── Tentative 2 : extraction manuelle BT/ET (PDFs simples non-compressés) ──
  const chunks = [];
  const raw = buffer.toString('binary');
  pullTextFromStream(raw, chunks);

  // ── Tentative 3 : décompresser les streams FlateDecode ──
  const streamRe = /(?:FlateDecode)[^\n]*\nstream\r?\n([\s\S]*?)endstream/g;
  let m;
  while ((m = streamRe.exec(raw)) !== null) {
    try {
      const compressed   = Buffer.from(m[1], 'binary');
      const decompressed = zlib.inflateSync(compressed).toString('latin1');
      pullTextFromStream(decompressed, chunks);
    } catch (_) { /* stream pas deflate-compressé */ }
  }

  if (chunks.length > 0) {
    const result = chunks.join(' ').replace(/\s{2,}/g, ' ').trim();
    console.log(`[PDF] Manual extraction: ${result.length} chars`);
    return result;
  }

  // ── Fallback : ASCII brut (dernier recours) ──
  const fallback = buffer.toString('latin1')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .split(/\n|\r/)
    .map(l => l.trim())
    .filter(l => l.length > 3)
    .join('\n')
    .replace(/[ \t]{3,}/g, '  ')
    .trim();

  console.log(`[PDF] Fallback ASCII extraction: ${fallback.length} chars`);
  return fallback;
}

// ════════════════════════════════════════════════════════════════════
// ÉTAPE 4 : dans l'endpoint /api/parse-pdf (~ligne 1508)
// la fonction est maintenant async — mets await devant l'appel :
// ════════════════════════════════════════════════════════════════════

// AVANT :
//   const text = extractPdfText(buffer);

// APRÈS :
//   const text = await extractPdfText(buffer);

// ════════════════════════════════════════════════════════════════════
// RÉSULTAT : ton server.js gère maintenant :
//   ✅ PDFs Word (.docx exportés en PDF)
//   ✅ PDFs Canva
//   ✅ PDFs Adobe Acrobat
//   ✅ PDFs simples ASCII
//   ✅ PDFs avec FlateDecode compression
//   ✅ Fallback ASCII pour tout le reste
// ════════════════════════════════════════════════════════════════════
