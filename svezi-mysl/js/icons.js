/* Svěží mysl — ikony (inline SVG, kreslené v barvě textu: currentColor). */
(function () {
  'use strict';
  var SM = window.SM;
  var ui = function (paths, filled) {
    return filled
      ? '<svg viewBox="0 0 24 24">' + paths + '</svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  };

  SM.icons = {
    /* ----- Hry (48 × 48) ----- */
    pexeso: '<svg viewBox="0 0 48 48"><rect x="5" y="11" width="21" height="29" rx="4" transform="rotate(-12 15.5 25.5)" fill="currentColor" opacity=".4"/><path fill="currentColor" fill-rule="evenodd" d="M24 8h14a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4zM31 16.5l1.65 4.23 4.53.26-3.52 2.88 1.16 4.39L31 25.8l-3.82 2.46 1.16-4.39-3.52-2.88 4.53-.26z"/></svg>',
    nakup: '<svg viewBox="0 0 48 48"><path d="M14 18c0-7 4.5-10 10-10s10 3 10 10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" opacity=".55"/><path fill="currentColor" fill-rule="evenodd" d="M6 18h36a2 2 0 0 1 2 2.4l-4 17.2A4 4 0 0 1 36.1 41H11.9A4 4 0 0 1 8 37.6l-4-17.2A2 2 0 0 1 6 18zM15 24.5a1.5 1.5 0 0 0-1.5 1.5v8a1.5 1.5 0 0 0 3 0v-8a1.5 1.5 0 0 0-1.5-1.5zM24 24.5a1.5 1.5 0 0 0-1.5 1.5v8a1.5 1.5 0 0 0 3 0v-8a1.5 1.5 0 0 0-1.5-1.5zM33 24.5a1.5 1.5 0 0 0-1.5 1.5v8a1.5 1.5 0 0 0 3 0v-8a1.5 1.5 0 0 0-1.5-1.5z"/></svg>',
    okna: '<svg viewBox="0 0 48 48"><path fill="currentColor" opacity=".5" d="M24 4 3 20h42z"/><path fill="currentColor" fill-rule="evenodd" d="M8 21h32v22H8zM12.5 25h9v7h-9zM26.5 25h9v7h-9zM12.5 35h9v6h-9zM26.5 35h9v6h-9z"/><rect x="28" y="26.5" width="6" height="4" rx="1" fill="currentColor"/></svg>',
    blesk: '<svg viewBox="0 0 48 48"><g fill="currentColor" opacity=".4"><circle cx="40" cy="24" r="3"/><circle cx="35.3" cy="35.3" r="3"/><circle cx="24" cy="40" r="3"/><circle cx="12.7" cy="35.3" r="3"/><circle cx="8" cy="24" r="3"/><circle cx="12.7" cy="12.7" r="3"/><circle cx="24" cy="8" r="3"/></g><circle cx="35.3" cy="12.7" r="4.5" fill="currentColor"/><circle cx="24" cy="24" r="7" fill="currentColor"/></svg>',
    jiny: '<svg viewBox="0 0 48 48"><g fill="currentColor" opacity=".45"><circle cx="12" cy="12" r="4.5"/><circle cx="24" cy="12" r="4.5"/><circle cx="12" cy="24" r="4.5"/><circle cx="24" cy="24" r="4.5"/><circle cx="36" cy="24" r="4.5"/><circle cx="12" cy="36" r="4.5"/><circle cx="24" cy="36" r="4.5"/><circle cx="36" cy="36" r="4.5"/></g><path fill="currentColor" d="M36 6.5l6.2 10.8H29.8z"/></svg>',
    sipky: '<svg viewBox="0 0 48 48"><g fill="currentColor" opacity=".4"><path d="M15 21.5H8v-4L1 24l7 6.5v-4h7z"/><path d="M47 21.5h-7v-4L33 24l7 6.5v-4h7z"/></g><path fill="currentColor" d="M17 21.5h7v-4l7 6.5-7 6.5v-4h-7z"/></svg>',
    barvy: '<svg viewBox="0 0 48 48"><circle cx="18" cy="18" r="11" fill="currentColor" opacity=".35"/><circle cx="30" cy="18" r="11" fill="currentColor" opacity=".6"/><circle cx="24" cy="29.5" r="11" fill="currentColor"/></svg>',
    poradi: '<svg viewBox="0 0 48 48"><path d="M9 37 19 15l12 16 9-20" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" opacity=".5"/><circle cx="9" cy="37" r="5.5" fill="currentColor"/><rect x="13.5" y="9.5" width="11" height="11" rx="3" fill="currentColor"/><circle cx="31" cy="31" r="5.5" fill="currentColor"/><rect x="34.5" y="5.5" width="11" height="11" rx="3" fill="currentColor"/></svg>',

    /* ----- Ovládání (24 × 24) ----- */
    back: ui('<path d="M15 5l-7 7 7 7"/>'),
    chevron: ui('<path d="M9 5l7 7-7 7"/>'),
    close: ui('<path d="M6 6l12 12M18 6L6 18"/>'),
    check: ui('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    cross: ui('<path d="M7 7l10 10M17 7L7 17"/>'),
    play: ui('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>', true),
    replay: ui('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5V9H9"/>'),
    speaker: ui('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
    home: ui('<path d="M4 11l8-7 8 7"/><path d="M6.5 9.5v10h11v-10"/>'),
    chart: ui('<path d="M4.5 19.5h15"/><path d="M8 16v-4M12 16V7M16 16v-6"/>'),
    sliders: ui('<path d="M4 7h9M17.5 7H20M4 17h2.5M11 17h9"/><circle cx="15.2" cy="7" r="2.3"/><circle cx="8.8" cy="17" r="2.3"/>'),
    info: ui('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.2"/>'),
    star: ui('<path fill="currentColor" d="M12 2.8l2.75 5.9 6.45.75-4.8 4.4 1.3 6.35L12 17l-5.7 3.2 1.3-6.35-4.8-4.4 6.45-.75z"/>', true),
    sprout: ui('<path d="M12 21v-8.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path fill="currentColor" d="M12 13.5c0-4.2-2.8-7.2-7.8-7.2 0 4.5 3 7.2 7.8 7.2zM12 11.2c0-4.6 3.1-7.7 8.2-7.7 0 4.8-3.3 7.7-8.2 7.7z"/>', true),
    drop: ui('<path fill="currentColor" d="M12 3.2s6.2 6.6 6.2 10.9a6.2 6.2 0 0 1-12.4 0C5.8 9.8 12 3.2 12 3.2z"/>', true),
    lines: ui('<path d="M4 6.5h16M4 12h16M4 17.5h10"/>'),
    arrowRight: '<svg viewBox="0 0 64 40"><path fill="currentColor" d="M4 15h34V4l22 16-22 16V25H4z"/></svg>',

    /* ----- Logo ----- */
    logo: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" style="fill:var(--ink)"/><path d="M15 31.5 24 15.5l9 16z" fill="none" style="stroke:var(--bg)" stroke-width="2" stroke-linejoin="round" opacity=".45"/><circle cx="24" cy="15.5" r="6" style="fill:var(--per)"/><circle cx="15" cy="31.5" r="6" style="fill:var(--mem)"/><circle cx="33" cy="31.5" r="6" style="fill:var(--dec)"/></svg>'
  };
})();
