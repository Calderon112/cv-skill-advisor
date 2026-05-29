/**
 * utils.js — Shared helpers for all scrapers.
 */

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
];

/** Returns HTTP headers that mimic a real browser request. */
function browserHeaders(referer = '', acceptJson = false) {
  return {
    'User-Agent':                USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept':                    acceptJson
      ? 'application/json,text/javascript,*/*;q=0.01'
      : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language':           'en-US,en;q=0.9,de;q=0.8',
    'Accept-Encoding':           'gzip, deflate, br',
    'Connection':                'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest':            'document',
    'Sec-Fetch-Mode':            'navigate',
    'DNT':                       '1',
    'Cache-Control':             'no-cache',
    ...(referer ? { Referer: referer } : {})
  };
}

/** Strip HTML tags and collapse whitespace. */
function stripHtml(str) {
  return (str || '').replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

/** Polite delay to avoid hammering servers. */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

module.exports = { browserHeaders, stripHtml, sleep };
