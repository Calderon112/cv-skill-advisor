/**
 * routes/scrape.js — POST /api/scrape-all
 *
 * Public endpoint. Runs all scrapers in parallel and returns
 * merged + deduplicated results with a per-platform breakdown.
 */

const scrapers = require('../scrapers');

function readBody(req) {
  return new Promise(resolve => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end',  () => { try { resolve(JSON.parse(raw || '{}')); } catch (_) { resolve({}); } });
  });
}

async function handle(req, res, send) {
  const { keyword, region, sector, location } = await readBody(req);
  try {
    const result = await scrapers.scrapeAll({ keyword, region, sector, location });
    send(res, 200, result);
  } catch (err) {
    send(res, 500, { error: 'Scrape-all failed.', detail: err.message });
  }
}

module.exports = { handle };
