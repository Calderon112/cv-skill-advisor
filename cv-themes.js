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
        rail: ['kontakt', 'sprachen', 'softskills', 'interessen'],
        main: ['berufserfahrung', 'skills', 'projekte', 'ausbildung', 'weiterbildung'],
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
    const parts = [];

    parts.push('<rect width="' + W + '" height="' + H + '" fill="#fff"/>');
    if (railW && theme.railFill) {
      // A bleeding rail runs the whole sheet, edge to edge, and is the first thing
      // drawn — the header sits on top of it rather than beside it.
      const bleed = !!theme.railBleed;
      parts.push('<rect x="' + (bleed ? railX - m : railX - 4) + '" y="' + (bleed ? 0 : m + 26) +
                 '" width="' + (bleed ? railW + m + 4 : railW + 8) +
                 '" height="' + (bleed ? H : H - m - 26) + '" fill="' + rgb(theme.railFill) + '"/>');
    }

    // Header: name, subtitle, and the photo where the theme puts one.
    const hasPhoto = theme.photo === 'top-right';
    const headW = hasPhoto ? mainW + railW + gap - 26 : mainW + railW + gap;
    parts.push('<rect x="' + m + '" y="' + m + '" width="' + Math.round(headW * 0.62) +
               '" height="6" rx="1" fill="' + rgb(theme.dark) + '"/>');
    parts.push('<rect x="' + m + '" y="' + (m + 9) + '" width="' + Math.round(headW * 0.4) +
               '" height="3.5" rx="1" fill="' + acc + '"/>');
    if (hasPhoto) {
      parts.push('<rect x="' + (W - m - 22) + '" y="' + m + '" width="22" height="22" rx="2" fill="#d4dae2"/>');
    }
    parts.push('<rect x="' + m + '" y="' + (m + 20) + '" width="' + (W - m * 2) + '" height="1.4" fill="' + acc + '"/>');

    // A heading plus a few text lines, in the style the theme asks for.
    function block(x, w, y, headingStyle) {
      const out = [];
      if (headingStyle === 'bar') {
        out.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="7" rx="1" fill="' + acc + '"/>');
        out.push('<rect x="' + (x + 3) + '" y="' + (y + 2.5) + '" width="' + Math.round(w * 0.42) +
                 '" height="2" rx="0.5" fill="#fff"/>');
      } else {
        out.push('<rect x="' + x + '" y="' + y + '" width="' + Math.round(w * 0.46) +
                 '" height="3" rx="0.5" fill="' + acc + '"/>');
        out.push('<rect x="' + x + '" y="' + (y + 5) + '" width="' + w + '" height="0.8" fill="' + acc + '"/>');
      }
      const top = y + (headingStyle === 'bar' ? 12 : 10);
      [1, 0.9, 0.72].forEach((f, i) => {
        out.push('<rect x="' + x + '" y="' + (top + i * 5) + '" width="' + Math.round(w * f) +
                 '" height="2.4" rx="0.6" fill="#c9d0d9"/>');
      });
      return { svg: out.join(''), next: top + 3 * 5 + 6 };
    }

    let y = m + 28;
    let guard = 0;
    while (y < H - 18 && guard++ < 6) {
      const b = block(mainX, mainW, y, theme.mainHeading);
      parts.push(b.svg);
      y = b.next;
    }
    if (railW) {
      let ry = m + 28;
      let g2 = 0;
      while (ry < H - 18 && g2++ < 6) {
        const b = block(railX, railW, ry, theme.railHeading);
        parts.push(b.svg);
        ry = b.next;
      }
    }

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
           '" role="img" aria-label="Layout-Vorschau: ' + theme.name + '">' +
           parts.join('') + '</svg>';
  }

  return { THEMES, DEFAULT_ID, get, list, preview };
});
