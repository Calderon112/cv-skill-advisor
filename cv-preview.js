/**
 * cv-preview.js — draw the generated CV on a canvas, without a second layout.
 *
 * The profile page shows the CV beside the form as it is typed. The obvious way to
 * do that is an HTML mock-up of the document, and it is the wrong way: a mock-up is
 * a second description of the layout, and the two drift apart the first time a theme
 * changes shape. The reader is then told one thing and downloads another.
 *
 * The second obvious way is to frame the real PDF. That was tried and does not
 * survive contact with the browser: the built-in PDF viewer holds its own zoom
 * inside a small iframe and crops the left edge of the page — the whole rail of a
 * two-column theme — and it ignores #view=Fit, #zoom=page-fit and #zoom=<n> alike.
 * Scaling the frame with a CSS transform makes it worse, because Chromium
 * rasterises the frame's contents at the transformed size and the viewer inside
 * reacts to the changed pixel ratio by drawing the page as a sliver.
 *
 * So: no second layout, and no viewer. buildProfilePdfDoc() runs exactly as it does
 * for the download, against a jsPDF document wrapped in a recorder. jsPDF still does
 * all the thinking — text metrics, line wrapping through splitTextToSize, page
 * breaks — and the recorder keeps the drawing calls it was asked to perform. Those
 * are then repainted on a canvas at whatever size the column happens to be.
 *
 * There is one layout, and the preview cannot disagree with the file, because it is
 * a transcript of how the file was drawn.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CvPreview = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // A4 in points, the unit buildProfilePdfDoc() works in.
  const A4_W = 595.28;
  const A4_H = 841.89;

  // The calls worth keeping. Everything else the generator makes — splitTextToSize,
  // getNumberOfPages, output — is measurement or export and draws nothing.
  const DRAW = new Set(['text', 'rect', 'line', 'circle', 'addImage']);
  const STATE = new Set(['setFont', 'setFontSize', 'setTextColor', 'setFillColor',
    'setDrawColor', 'setLineWidth', 'setCharSpace']);

  /**
   * jsPDF accepts a colour as (r,g,b), as one grey level, or as a CSS string.
   * Normalised here so the canvas side has one shape to handle.
   */
  function colorOf(args) {
    if (args.length >= 3) return `rgb(${args[0] | 0},${args[1] | 0},${args[2] | 0})`;
    const v = args[0];
    if (typeof v === 'number') return `rgb(${v | 0},${v | 0},${v | 0})`;
    return String(v || '#000');
  }

  /**
   * Wrap a jsPDF document so every drawing call is both performed and kept.
   *
   * A Proxy rather than a hand-written stub: the generator calls sixteen different
   * methods today and a stub would have to be revisited each time it calls a
   * seventeenth — silently dropping whatever it drew with the new one. Forwarding
   * everything and recording the ones we know keeps the document correct whatever
   * happens, and the worst a new primitive can do is not appear in the preview.
   */
  function record(doc) {
    const pages = [[]];
    let page = 0;
    // Mirrors the graphics state jsPDF holds, so each drawing op can be replayed
    // without replaying the whole call sequence.
    const gs = {
      font: 'helvetica', style: 'normal', size: 12,
      text: '#000', fill: '#000', draw: '#000', lineWidth: 1, charSpace: 0,
    };

    const proxy = new Proxy(doc, {
      get(target, key) {
        const value = target[key];
        if (typeof value !== 'function') return value;
        return function (...args) {
          if (key === 'addPage') { pages.push([]); page++; }
          else if (STATE.has(key)) {
            if (key === 'setFont') { gs.font = args[0] || gs.font; gs.style = args[1] || 'normal'; }
            else if (key === 'setFontSize') gs.size = args[0];
            else if (key === 'setTextColor') gs.text = colorOf(args);
            else if (key === 'setFillColor') gs.fill = colorOf(args);
            else if (key === 'setDrawColor') gs.draw = colorOf(args);
            else if (key === 'setLineWidth') gs.lineWidth = args[0];
            else if (key === 'setCharSpace') gs.charSpace = args[0] || 0;
          } else if (DRAW.has(key)) {
            pages[page].push({ op: key, args: args.slice(), gs: Object.assign({}, gs) });
          }
          return value.apply(target, args);
        };
      },
    });

    return { proxy, pages };
  }

  const FAMILY = {
    helvetica: 'Helvetica, Arial, sans-serif',
    times: '"Times New Roman", Times, serif',
    courier: '"Courier New", Courier, monospace',
  };

  function fontOf(gs, scale) {
    const style = /bold/i.test(gs.style) ? 'bold' : 'normal';
    const slant = /italic|oblique/i.test(gs.style) ? 'italic ' : '';
    return `${slant}${style} ${(gs.size * scale).toFixed(2)}px ${FAMILY[gs.font] || FAMILY.helvetica}`;
  }

  /**
   * Repaint one recorded page onto a canvas.
   *
   * @param canvas  sized by the caller; the page is fitted to its width
   * @param ops     one entry of the recorder's pages array
   */
  function paint(canvas, ops) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const cssW = canvas.clientWidth || Math.round(canvas.width / dpr);
    const cssH = Math.round(cssW * (A4_H / A4_W));

    // Backing store at device resolution, CSS box at layout resolution: a preview
    // drawn at 1x on a 2x screen is the blurry thing every canvas gets wrong.
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.height = cssH + 'px';

    const scale = (cssW / A4_W) * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = 'alphabetic';

    (ops || []).forEach(({ op, args, gs }) => {
      if (op === 'text') {
        const [raw, x, y, opts] = args;
        const lines = Array.isArray(raw) ? raw : String(raw == null ? '' : raw).split('\n');
        ctx.font = fontOf(gs, scale);
        ctx.fillStyle = gs.text;
        // jsPDF's letter spacing, which the themes use for small-caps headings.
        if ('letterSpacing' in ctx) ctx.letterSpacing = (gs.charSpace * scale).toFixed(2) + 'px';
        const align = (opts && opts.align) || 'left';
        ctx.textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
        // jsPDF advances by the font size for each extra line of a single call.
        lines.forEach((line, i) => ctx.fillText(String(line), x * scale, (y + i * gs.size) * scale));
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      } else if (op === 'rect') {
        const [x, y, w, h, style] = args;
        if (!style || /F/i.test(style)) { ctx.fillStyle = gs.fill; ctx.fillRect(x * scale, y * scale, w * scale, h * scale); }
        if (style && /S|D/i.test(style)) {
          ctx.strokeStyle = gs.draw; ctx.lineWidth = Math.max(0.5, gs.lineWidth * scale);
          ctx.strokeRect(x * scale, y * scale, w * scale, h * scale);
        }
      } else if (op === 'line') {
        const [x1, y1, x2, y2] = args;
        ctx.strokeStyle = gs.draw;
        ctx.lineWidth = Math.max(0.5, gs.lineWidth * scale);
        ctx.beginPath();
        ctx.moveTo(x1 * scale, y1 * scale);
        ctx.lineTo(x2 * scale, y2 * scale);
        ctx.stroke();
      } else if (op === 'circle') {
        const [x, y, r, style] = args;
        ctx.beginPath();
        ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2);
        if (!style || /F/i.test(style)) { ctx.fillStyle = gs.fill; ctx.fill(); }
        if (style && /S|D/i.test(style)) {
          ctx.strokeStyle = gs.draw; ctx.lineWidth = Math.max(0.5, gs.lineWidth * scale); ctx.stroke();
        }
      } else if (op === 'addImage') {
        // (data, format, x, y, w, h) — drawn synchronously where the browser has
        // already decoded the source, which it has: the photo arrives as a data URL
        // the page itself produced.
        const [data, , x, y, w, h] = args;
        const img = new Image();
        img.onload = () => ctx.drawImage(img, x * scale, y * scale, w * scale, h * scale);
        img.src = data;
      }
    });
  }

  return { record, paint, A4_W, A4_H };
});
