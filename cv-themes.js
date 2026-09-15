/**
 * cv-themes.js — the CV layouts, as data.
 *
 * The generator used to hard-code one design: two columns, a grey rail on the
 * right, teal section bars, and a fixed decision about which section went where.
 * Adding a second design by copying that function would have doubled a body of code
 * that took several rounds to get right, and every extraction bug would then have
 * to be fixed twice.
 *
 * So a theme is a description and the generator is an interpreter. `layout` is the
 * part that actually distinguishes one CV design from another — not the colour.
 * Moving KONTAKT from the rail into the main column changes the document far more
 * than changing the accent does.
 *
 * The preview thumbnails in the picker are drawn FROM these objects rather than
 * hand-drawn per theme, so a theme added here cannot end up illustrated by a
 * picture of a different one.
 *
 * Section keys used by `layout`, each matching a renderer in the generator:
 *   kontakt · ausbildung · sprachen · softskills · interessen
 *   berufserfahrung · skills · projekte · weiterbildung
 *
 * The axes a theme can move on, beyond `layout` and colour:
 *   rail        none | left | right, with railWidth, railFill, railBleed
 *   header      band → a coloured field across the top (bandFill/bandText/bandMuted)
 *   headerAlign center → name, title and photo centred
 *   font        helvetica | times | courier — the three jsPDF carries without an
 *               embedded font file; anything else falls back silently
 *   mainHeading bar | rule | plain — plain needs headingTrack, or a bold capital
 *               line at 9pt is indistinguishable from the body
 *   entryMark   timeline → a hairline and a dot beside each entry. Single column
 *               only, and the dates stay inside the entry: dates set in a column of
 *               their own are the shape this project's own parser could not read
 *               back, and it is not about to print one.
 *   photo       top-right | top-center | rail | band | none
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CvThemes = api;
})(typeof self !== 'undefined' ? self : this, function () {

  const THEMES = {

    // The German standard: evidence on the left, scannable facts on the right.
    klassisch: {
      id: 'klassisch',
      name: 'Klassisch',
      // Shown under the name in the picker. A theme choice with no advice is a
      // choice made at random, and the differences here are consequential.
      note: 'Zweispaltig, wie in Deutschland üblich. Für die direkte Bewerbung per E-Mail.',
      rail: 'right',
      railWidth: 168,
      margin: 40,
      gap: 18,
      accent: [42, 122, 150],
      dark: [28, 40, 56],
      grey: [100, 116, 139],
      railFill: [238, 242, 245],
      // Filled bar with white type in the main column, hairline under teal type in
      // the rail: two headings of equal weight facing each other would compete.
      mainHeading: 'bar',
      railHeading: 'rule',
      photo: 'top-right',
      layout: {
        rail: ['kontakt', 'ausbildung', 'sprachen', 'softskills', 'interessen'],
        main: ['berufserfahrung', 'skills', 'projekte', 'weiterbildung'],
      },
    },

    // One column, no rail, no photo.
    //
    // This is not a plainer version of the one above, it is a different tool. An
    // applicant tracking system reads a PDF by extracting its text, and a
    // two-column layout interleaves the columns exactly as this project's own
    // parser did when it first read a two-column CV: the rail's contents landed in
    // the middle of the experience section. A CV that looks better can arrive
    // scrambled, and the applicant never finds out.
    ats: {
      id: 'ats',
      name: 'ATS-sicher',
      note: 'Einspaltig, ohne Foto. Für Bewerbungsportale, die den Lebenslauf maschinell auslesen.',
      rail: 'none',
      railWidth: 0,
      margin: 52,
      gap: 0,
      accent: [38, 50, 66],
      dark: [17, 24, 34],
      grey: [90, 102, 118],
      railFill: null,
      // A rule rather than a filled bar: a solid block of colour behind a heading
      // is an image to a text extractor, and the heading can be lost with it.
      mainHeading: 'rule',
      railHeading: 'rule',
      photo: 'none',
      layout: {
        rail: [],
        main: ['kontakt', 'berufserfahrung', 'skills', 'projekte',
               'ausbildung', 'weiterbildung', 'sprachen', 'softskills', 'interessen'],
      },
    },

    // One column, tighter, with the facts up front. For a CV that would otherwise
    // run to a second page carrying three lines.
    kompakt: {
      id: 'kompakt',
      name: 'Kompakt',
      note: 'Einspaltig und dicht gesetzt. Wenn der Lebenslauf sonst knapp auf zwei Seiten läuft.',
      rail: 'none',
      railWidth: 0,
      margin: 44,
      gap: 0,
      accent: [120, 63, 154],
      dark: [28, 28, 40],
      grey: [104, 104, 122],
      railFill: null,
      mainHeading: 'rule',
      railHeading: 'rule',
      photo: 'top-right',
      layout: {
        rail: [],
        main: ['kontakt', 'skills', 'berufserfahrung', 'projekte',
               'ausbildung', 'weiterbildung', 'sprachen', 'softskills', 'interessen'],
      },
    },

    // A coloured rail running the full height of the sheet, with the photo and the
    // facts set on it in white. This is the shape the commercial CV builders sell,
    // and it is reachable with the drawing primitives already in use — a filled
    // rectangle from edge to edge, and light text on it.
    //
    // What it deliberately does NOT copy is the rating dots those builders print
    // beside every language and tool. A CV says "Deutsch – Fließend (C1)"; it does
    // not say four bars out of five. Rendering four would be this application
    // inventing a self-assessment the candidate never made, which is the one thing
    // every other guard in this project exists to prevent.
    modern: {
      id: 'modern',
      name: 'Modern',
      note: 'Farbige Seitenspalte über die ganze Seite, Foto darin. Für Initiativbewerbungen und Portfolios.',
      rail: 'left',
      railWidth: 185,
      margin: 38,
      gap: 24,
      accent: [23, 58, 95],
      dark: [24, 34, 48],
      grey: [104, 118, 134],
      railFill: [23, 58, 95],
      // Set on the rail's own colour, so the rail needs its own text colours.
      railText: [255, 255, 255],
      railMuted: [176, 198, 219],
      railBleed: true,
      mainHeading: 'rule',
      railHeading: 'rule',
      photo: 'rail',
      layout: {
        // ausbildung sits with the rail because that is where its renderer draws —
        // at the rail's x, using the rail's cursor. Listing it under main ran it in
        // the main pass while it painted on the rail, so its position depended on
        // pass order rather than on this declaration.
        rail: ['kontakt', 'sprachen', 'ausbildung', 'softskills', 'interessen'],
        main: ['berufserfahrung', 'skills', 'projekte', 'weiterbildung'],
      },
    },

    // A serif document with a centred head.
    //
    // jsPDF carries Helvetica, Times and Courier without an embedded font file, so
    // this changes the face of the whole document and costs nothing to ship. It is
    // the one axis none of the templates above move on, and it changes more at a
    // glance than any of the colours do.
    //
    // Single column, because a serif CV is read by a person start to finish, and
    // because the wide margins are the point rather than a side effect.
    elegant: {
      id: 'elegant',
      name: 'Elegant',
      note: 'Einspaltig mit Serifenschrift, zentriertem Kopf und breiten Rändern. Für Hochschule, Forschung und Beratung.',
      font: 'times',
      rail: 'none',
      railWidth: 0,
      margin: 58,
      gap: 0,
      accent: [122, 74, 40],
      dark: [38, 33, 28],
      grey: [112, 104, 94],
      railFill: null,
      mainHeading: 'rule',
      railHeading: 'rule',
      // Small capitals are not available without an embedded font; letter-spaced
      // capitals are the same effect reached with the faces jsPDF already has.
      headingTrack: 1.1,
      headerAlign: 'center',
      photo: 'top-center',
      layout: {
        rail: [],
        main: ['kontakt', 'berufserfahrung', 'ausbildung', 'skills', 'projekte',
               'weiterbildung', 'sprachen', 'softskills', 'interessen'],
      },
    },

    // A coloured band across the top, name and photo set on it.
    //
    // The band is the loudest thing any of these templates do, and it is doing one
    // job: on a desk holding forty printed applications, the top inch is the whole
    // of the first impression. Everything below it is deliberately quiet — rule
    // headings, a pale rail — because a band AND filled heading bars is two
    // templates fighting on one sheet.
    akzent: {
      id: 'akzent',
      name: 'Akzent',
      note: 'Farbiger Kopfbereich über die volle Seitenbreite, Foto darin, ruhige Spalten darunter. Für Bewerbungen, die auf einem Stapel liegen.',
      header: 'band',
      bandFill: [17, 63, 87],
      bandText: [255, 255, 255],
      bandMuted: [172, 201, 220],
      rail: 'right',
      railWidth: 162,
      margin: 40,
      gap: 20,
      accent: [17, 63, 87],
      dark: [26, 36, 48],
      grey: [100, 114, 130],
      railFill: [238, 243, 247],
      mainHeading: 'rule',
      railHeading: 'rule',
      photo: 'band',
      layout: {
        rail: ['kontakt', 'ausbildung', 'sprachen', 'softskills', 'interessen'],
        main: ['berufserfahrung', 'skills', 'projekte', 'weiterbildung'],
      },
    },

    // No colour at all, and no rules under the headings.
    //
    // This is not the ATS template with the accent removed. That one is shaped by
    // what a text extractor can read; this one is shaped by restraint — wide
    // margins, headings carried by capitals and letter-spacing, and nothing else on
    // the page. Where a document has no colour, a rule under every heading becomes
    // the only mark on the sheet and starts to read as the design.
    schlicht: {
      id: 'schlicht',
      name: 'Schlicht',
      note: 'Einspaltig, ohne Farbe, viel Weißraum, Überschriften nur durch Sperrung. Wenn der Inhalt allein sprechen soll.',
      rail: 'none',
      railWidth: 0,
      margin: 64,
      gap: 0,
      accent: [26, 26, 26],
      dark: [26, 26, 26],
      grey: [122, 122, 122],
      railFill: null,
      mainHeading: 'plain',
      railHeading: 'plain',
      headingTrack: 2.2,
      photo: 'top-right',
      layout: {
        rail: [],
        main: ['kontakt', 'berufserfahrung', 'skills', 'projekte',
               'ausbildung', 'weiterbildung', 'sprachen', 'softskills', 'interessen'],
      },
    },

    // A timeline down the column, with a dot at each station.
    //
    // The dates stay inside the entry, in the running text. They are deliberately
    // NOT set in a column of their own, which is the exact shape this project's own
    // parser could not read back: a text extractor reads columns one after another,
    // so dates set beside their entries arrive detached from them, and pairing them
    // by order stamps entries with dates the candidate never wrote. The line drawn
    // here carries no text at all, so nothing about it can be mis-extracted.
    chronik: {
      id: 'chronik',
      name: 'Chronik',
      note: 'Einspaltig mit Zeitstrahl an den Stationen; die Daten bleiben im Eintrag. Für einen Werdegang mit vielen Stationen.',
      rail: 'none',
      railWidth: 0,
      margin: 46,
      gap: 0,
      accent: [21, 101, 92],
      dark: [24, 34, 38],
      grey: [100, 116, 118],
      railFill: null,
      mainHeading: 'rule',
      railHeading: 'rule',
      entryMark: 'timeline',
      photo: 'top-right',
      layout: {
        rail: [],
        main: ['kontakt', 'berufserfahrung', 'ausbildung', 'projekte',
               'weiterbildung', 'skills', 'sprachen', 'softskills', 'interessen'],
      },
    },
  };

  const DEFAULT_ID = 'klassisch';

  function get(id) {
    return THEMES[String(id || '').toLowerCase()] || THEMES[DEFAULT_ID];
  }

  function list() {
    return Object.keys(THEMES).map((k) => THEMES[k]);
  }

  const rgb = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';

  /**
   * A thumbnail of the layout, as an SVG string, drawn from the theme itself.
   *
   * Deliberately abstract: grey bars for text, coloured bars for headings, the rail
   * where the rail is. A miniature of the real document at this size is a smudge,
   * while the thing a person is actually choosing between — one column or two,
   * where the facts sit, how loud the headings are — reads instantly.
   */
  function preview(theme, width, height) {
    const W = width || 132;
    const H = height || 186;
    const m = 9;
    const railW = theme.rail === 'none' ? 0 : Math.round(W * 0.31);
    const gap = railW ? 6 : 0;
    const onLeft = theme.rail === 'left';
    const mainW = W - m * 2 - railW - gap;
    const mainX = onLeft ? W - m - mainW : m;
    const railX = onLeft ? m : W - m - railW;
    const acc = rgb(theme.accent);
    const band = theme.header === 'band';
    const centred = theme.headerAlign === 'center';
    const timeline = theme.entryMark === 'timeline' && !railW;
    const parts = [];

    parts.push('<rect width="' + W + '" height="' + H + '" fill="#fff"/>');

    // A band across the top carries the header, and everything else starts below it.
    const bandH = band ? 30 : 0;
    if (band) {
      parts.push('<rect x="0" y="0" width="' + W + '" height="' + bandH +
                 '" fill="' + rgb(theme.bandFill || theme.accent) + '"/>');
    }

    if (railW && theme.railFill) {
      // A bleeding rail runs the whole sheet, edge to edge, and is drawn before the
      // header — which then sits on top of it rather than beside it.
      const bleed = !!theme.railBleed;
      const top = bleed ? 0 : Math.max(bandH + 4, m + 26);
      parts.push('<rect x="' + (bleed ? railX - m : railX - 4) + '" y="' + top +
                 '" width="' + (bleed ? railW + m + 4 : railW + 8) +
                 '" height="' + (H - top) + '" fill="' + rgb(theme.railFill) + '"/>');
    }

    // Header: name, subtitle, and the photo where the theme puts one. On a bleeding
    // rail it starts where the main column starts — the name is not printed across
    // the coloured band in the document, and must not be here either.
    const photoAt = theme.photo;
    const photoW = band ? bandH - 12 : 22;
    const headX = (theme.railBleed && railW) ? mainX : m;
    let headW = W - m - headX;
    if (photoAt === 'top-right' || (band && photoAt !== 'none')) headW -= photoW + 6;

    let hy = band ? 8 : m;
    if (photoAt === 'top-center') {
      parts.push('<rect x="' + Math.round((W - photoW) / 2) + '" y="' + hy + '" width="' + photoW +
                 '" height="' + photoW + '" rx="2" fill="#d4dae2"/>');
      hy += photoW + 5;
    }
    if (photoAt === 'top-right') {
      parts.push('<rect x="' + (W - m - photoW) + '" y="' + m + '" width="' + photoW +
                 '" height="' + photoW + '" rx="2" fill="#d4dae2"/>');
    }
    if (band && photoAt !== 'none') {
      parts.push('<rect x="' + (W - m - photoW) + '" y="' + Math.round((bandH - photoW) / 2) +
                 '" width="' + photoW + '" height="' + photoW + '" rx="2" fill="#ffffff" opacity="0.82"/>');
    }

    const nameW = Math.round(headW * 0.62);
    const subW = Math.round(headW * 0.4);
    const centreOn = (w) => Math.round(headX + (headW - w) / 2);
    parts.push('<rect x="' + (centred ? centreOn(nameW) : headX) + '" y="' + hy + '" width="' + nameW +
               '" height="6" rx="1" fill="' + (band ? '#ffffff' : rgb(theme.dark)) + '"/>');
    parts.push('<rect x="' + (centred ? centreOn(subW) : headX) + '" y="' + (hy + 9) + '" width="' + subW +
               '" height="3.5" rx="1" fill="' + (band ? rgb(theme.bandMuted || [255, 255, 255]) : acc) + '"/>');
    hy += 20;
    // The band separates the header by itself; a rule under it as well would be two
    // answers to one question, which is why the document prints only one of them.
    if (!band) {
      parts.push('<rect x="' + headX + '" y="' + hy + '" width="' + (W - m - headX) +
                 '" height="' + (centred ? 0.8 : 1.4) + '" fill="' + acc + '"/>');
    }

    const contentTop = band ? bandH + 10 : Math.max(hy + 8, m + 28);

    // A heading plus a few text lines, in the style the theme asks for.
    function block(x, w, y, headingStyle, marked) {
      const out = [];
      if (headingStyle === 'bar') {
        out.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="7" rx="1" fill="' + acc + '"/>');
        out.push('<rect x="' + (x + 3) + '" y="' + (y + 2.5) + '" width="' + Math.round(w * 0.42) +
                 '" height="2" rx="0.5" fill="#fff"/>');
      } else if (headingStyle === 'plain') {
        // Capitals and letter-spacing, and nothing under them. Drawn as a short run
        // of separated ticks, because a solid bar is what the other styles use.
        for (let i = 0; i < 5; i++) {
          out.push('<rect x="' + (x + i * 7) + '" y="' + y + '" width="4.5" height="3" rx="0.5" fill="' + acc + '"/>');
        }
      } else {
        out.push('<rect x="' + x + '" y="' + y + '" width="' + Math.round(w * 0.46) +
                 '" height="3" rx="0.5" fill="' + acc + '"/>');
        out.push('<rect x="' + x + '" y="' + (y + 5) + '" width="' + w + '" height="0.8" fill="' + acc + '"/>');
      }
      const top = y + (headingStyle === 'bar' ? 12 : headingStyle === 'plain' ? 9 : 10);
      // Entries indented past the timeline, which is a rule and a dot and carries no
      // text — the dates stay in the entry.
      const tx = marked ? x + 7 : x;
      const tw = marked ? w - 7 : w;
      [1, 0.9, 0.72].forEach((f, i) => {
        out.push('<rect x="' + tx + '" y="' + (top + i * 5) + '" width="' + Math.round(tw * f) +
                 '" height="2.4" rx="0.6" fill="#c9d0d9"/>');
      });
      if (marked) {
        out.push('<rect x="' + (x + 1.2) + '" y="' + (top - 1) + '" width="0.8" height="' +
                 (3 * 5 - 2) + '" fill="' + acc + '"/>');
        out.push('<circle cx="' + (x + 1.6) + '" cy="' + (top - 2) + '" r="1.8" fill="' + acc + '"/>');
      }
      return { svg: out.join(''), next: top + 3 * 5 + 6 };
    }

    let y = contentTop;
    let guard = 0;
    while (y < H - 18 && guard++ < 6) {
      // The first block of a timeline layout is the contact block, which is not a
      // station — the same as in the document, where only entries carry a dot.
      const b = block(mainX, mainW, y, theme.mainHeading, timeline && guard > 1);
      parts.push(b.svg);
      y = b.next;
    }
    if (railW) {
      let ry = contentTop;
      let g2 = 0;
      while (ry < H - 18 && g2++ < 6) {
        const b = block(railX, railW, ry, theme.railHeading, false);
        parts.push(b.svg);
        ry = b.next;
      }
    }

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
           '" role="img" aria-label="Layout-Vorschau: ' + theme.name + '">' +
           parts.join('') + '</svg>';
  }

  // ── Customisation: colour, typeface, section order ────────────────────────
  //
  // A template stays a fixed design. A profile may carry `design` on top of it —
  //
  //   { accent: '#1d6a80', font: 'times',
  //     order: { rail: [...], main: [...] }, hidden: ['interessen'] }
  //
  // — and resolve() applies that to a COPY. THEMES is one object shared by every
  // caller on the page; a customisation written into it would repaint the template
  // for every other CV the moment one of them was edited.

  const FONTS = ['helvetica', 'times', 'courier'];

  const SECTION_LABELS = {
    kontakt: 'Kontakt', berufserfahrung: 'Berufserfahrung', ausbildung: 'Ausbildung',
    skills: 'Kenntnisse', projekte: 'Projekte', weiterbildung: 'Weiterbildung',
    sprachen: 'Sprachen', softskills: 'Soft Skills', interessen: 'Interessen',
  };

  // One click each, and each clears the contrast rule below with room to spare —
  // 6.1 : 1 at the lowest — so a swatch can never produce the warning a colour
  // picked by hand can.
  const SWATCHES = [
    { name: 'Petrol', hex: '#1d6a80' },
    { name: 'Marine', hex: '#173a5f' },
    { name: 'Königsblau', hex: '#1c4ea3' },
    { name: 'Waldgrün', hex: '#1f5e3b' },
    { name: 'Aubergine', hex: '#5b2a6e' },
    { name: 'Bordeaux', hex: '#7a1f35' },
    { name: 'Kupfer', hex: '#8a4b1c' },
    { name: 'Anthrazit', hex: '#2f3a45' },
  ];

  // WCAG AA for normal-size text, as one comparison against white, because the
  // accent is used in exactly two ways and both need it: as heading type on white
  // paper, and as the field white type is set on — the heading bars, a full-height
  // rail, a band. The headings are 9.5pt bold, which is not WCAG "large text", so
  // the 3 : 1 allowance for large text does not apply. Every template shipped here
  // clears it; the lowest is Klassisch at 4.86 : 1.
  const MIN_CONTRAST = 4.5;

  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHex(c) {
    return '#' + (c || [0, 0, 0]).map((v) => Math.max(0, Math.min(255, v | 0))
      .toString(16).padStart(2, '0')).join('');
  }

  function luminance(c) {
    const ch = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2]);
  }

  function contrast(a, b) {
    const x = luminance(a);
    const y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }

  const sameColour = (a, b) => Array.isArray(a) && Array.isArray(b) && a.every((v, i) => v === b[i]);

  /**
   * A template with a profile's customisation applied, as a copy.
   *
   * @returns {{theme: object, warnings: Array<{code: string, ratio?: number}>}}
   */
  function resolve(themeOrId, design) {
    const base = (themeOrId && typeof themeOrId === 'object') ? themeOrId : get(themeOrId);
    const d = design || {};
    const warnings = [];
    const theme = Object.assign({}, base, {
      layout: { rail: (base.layout.rail || []).slice(), main: (base.layout.main || []).slice() },
    });

    const accent = hexToRgb(d.accent);
    if (accent) {
      // Surfaces painted in the template's own accent follow the new one; surfaces
      // that merely sit near it do not. Modern's rail and Akzent's band ARE the
      // accent — a navy rail under petrol headings is two colours where the design
      // has one. Klassisch's rail is a pale grey, and turning that petrol would print
      // the whole column as a solid block.
      if (sameColour(base.railFill, base.accent)) theme.railFill = accent;
      if (sameColour(base.bandFill, base.accent)) theme.bandFill = accent;
      theme.accent = accent;
      const ratio = contrast(accent, [255, 255, 255]);
      if (ratio < MIN_CONTRAST) warnings.push({ code: 'ACCENT_CONTRAST', ratio: Math.round(ratio * 100) / 100 });
    }

    if (FONTS.indexOf(d.font) !== -1) theme.font = d.font;

    // A section can move up or down within its column, and be hidden. It cannot move
    // to the other column: every renderer draws at its own column's x with its own
    // column's cursor, so a rail section listed under main still paints on the rail
    // while running in the main pass — the bug Modern's layout once had. Offering
    // that move would be offering a preview that lies.
    const hidden = Array.isArray(d.hidden) ? d.hidden : [];
    ['rail', 'main'].forEach((col) => {
      const allowed = theme.layout[col];
      const wanted = (d.order && Array.isArray(d.order[col])) ? d.order[col] : [];
      const ordered = [];
      wanted.forEach((k) => { if (allowed.indexOf(k) !== -1 && ordered.indexOf(k) === -1) ordered.push(k); });
      // Anything the saved order does not mention is appended in template order, so
      // a section added to a template later is not lost to a profile saved before it.
      allowed.forEach((k) => { if (ordered.indexOf(k) === -1) ordered.push(k); });
      theme.layout[col] = ordered.filter((k) => hidden.indexOf(k) === -1);
    });

    return { theme, warnings };
  }

  return {
    THEMES, DEFAULT_ID, get, list, preview,
    resolve, contrast, hexToRgb, rgbToHex,
    FONTS, SWATCHES, SECTION_LABELS, MIN_CONTRAST,
  };
});
