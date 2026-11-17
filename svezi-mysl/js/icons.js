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

    prislovi: '<svg viewBox="0 0 48 48"><path fill="currentColor" fill-rule="evenodd" d="M10 7h28a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H22l-9 8v-8h-3a6 6 0 0 1-6-6V13a6 6 0 0 1 6-6zM14 15h8v7l-4 7h-3.5l3-7H14zM27 15h8v7l-4 7h-3.5l3-7H27z"/></svg>',
    protiklady: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M24 7a17 17 0 0 0 0 34z" fill="currentColor"/></svg>',
    presmycky: '<svg viewBox="0 0 48 48"><rect x="4" y="17" width="14" height="14" rx="3" fill="currentColor" opacity=".45" transform="rotate(-12 11 24)"/><rect x="17" y="11" width="14" height="14" rx="3" fill="currentColor"/><rect x="30" y="19" width="14" height="14" rx="3" fill="currentColor" opacity=".7" transform="rotate(12 37 26)"/><rect x="17" y="30" width="14" height="5" rx="2.5" fill="currentColor" opacity=".45"/></svg>',
    nepatri: '<svg viewBox="0 0 48 48"><g fill="currentColor" opacity=".45"><rect x="6" y="8" width="30" height="6" rx="3"/><rect x="6" y="18" width="30" height="6" rx="3"/><rect x="6" y="28" width="30" height="6" rx="3"/></g><rect x="14" y="38" width="30" height="6" rx="3" fill="currentColor"/></svg>',
    hodiny: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M24 12v12l8 5" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    placeni: '<svg viewBox="0 0 48 48"><circle cx="18" cy="27" r="13" fill="currentColor" opacity=".45"/><circle cx="30" cy="21" r="13" fill="currentColor"/><circle cx="30" cy="21" r="8" fill="none" style="stroke:var(--tile-bg, #fff)" stroke-width="2"/></svg>',
    rada: '<svg viewBox="0 0 48 48"><circle cx="8" cy="30" r="4" fill="currentColor" opacity=".55"/><circle cx="20" cy="27" r="6" fill="currentColor" opacity=".75"/><circle cx="36" cy="23" r="8.5" fill="currentColor"/><path d="M33.5 20.5a2.8 2.8 0 1 1 3.4 2.6c-.9.3-.9.8-.9 1.6M36 27.2v.3" fill="none" style="stroke:var(--tile-bg, #fff)" stroke-width="2" stroke-linecap="round"/></svg>',
    tvary: '<svg viewBox="0 0 48 48"><path d="M5 9h9v18h9v9H5z" fill="currentColor"/><path d="M43 39h-9V21h-9v-9h18z" fill="currentColor" opacity=".45"/></svg>',
    telefon: '<svg viewBox="0 0 48 48"><g fill="currentColor"><circle cx="14" cy="9" r="3.6"/><circle cx="24" cy="9" r="3.6"/><circle cx="34" cy="9" r="3.6"/><circle cx="14" cy="19" r="3.6"/><circle cx="24" cy="19" r="3.6"/><circle cx="34" cy="19" r="3.6"/><circle cx="14" cy="29" r="3.6"/><circle cx="24" cy="29" r="3.6"/><circle cx="34" cy="29" r="3.6"/><circle cx="24" cy="39" r="3.6"/></g></svg>',
    jmena: '<svg viewBox="0 0 48 48"><circle cx="19" cy="15" r="8" fill="currentColor"/><path d="M4 41c0-8.5 6.5-14.5 15-14.5S34 32.5 34 41z" fill="currentColor"/><rect x="29" y="22" width="16" height="11" rx="2.5" fill="currentColor" opacity=".55"/></svg>',
    zmena: '<svg viewBox="0 0 48 48"><g fill="currentColor" opacity=".45"><circle cx="13" cy="13" r="7"/><circle cx="35" cy="13" r="7"/><circle cx="13" cy="35" r="7"/></g><path fill="currentColor" d="M35 26l2.4 5.6 6 .5-4.6 4 1.4 6-5.2-3.2-5.2 3.2 1.4-6-4.6-4 6-.5z"/></svg>',
    mozaika: '<svg viewBox="0 0 48 48"><g fill="currentColor" opacity=".25"><rect x="18" y="5" width="12" height="12" rx="2"/><rect x="5" y="18" width="12" height="12" rx="2"/><rect x="31" y="18" width="12" height="12" rx="2"/><rect x="18" y="31" width="12" height="12" rx="2"/></g><g fill="currentColor"><rect x="5" y="5" width="12" height="12" rx="2"/><rect x="31" y="5" width="12" height="12" rx="2"/><rect x="18" y="18" width="12" height="12" rx="2"/><rect x="5" y="31" width="12" height="12" rx="2"/><rect x="31" y="31" width="12" height="12" rx="2"/></g></svg>',
    sber: '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M24 15c-4-3-12-3.5-15.5 3.5C4.5 27.5 11 41 17.5 41c3 0 4.5-1.2 6.5-1.2s3.5 1.2 6.5 1.2C37 41 43.5 27.5 39.5 18.5 36 11.5 28 12 24 15z"/><path d="M24 15c0-4 2-7.5 6.5-9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M27 11c3-4 8-4 10-3-1 3-5 5-10 3z" fill="currentColor" opacity=".55"/></svg>',
    kolik: '<svg viewBox="0 0 48 48"><g fill="currentColor"><circle cx="12" cy="12" r="5"/><circle cx="31" cy="9" r="5"/><circle cx="22" cy="24" r="5"/><circle cx="38" cy="28" r="5"/><circle cx="11" cy="36" r="5"/></g><circle cx="29" cy="40" r="5" fill="currentColor" opacity=".4"/></svg>',

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
    flame: ui('<path fill="currentColor" d="M12.2 2.4c.6 3.3-1.4 5.1-2.9 6.7C7.6 10.9 6 12.7 6 15.4 6 19 8.7 21.6 12 21.6s6-2.6 6-6.2c0-2.6-1.2-4.5-2.5-5.9-.3 1.6-1.2 2.7-2.3 3.1.7-3.7-.1-7.6-1-10.2z"/>', true),
    target: ui('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>'),
    postcard: ui('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M12.5 8.5v7.5"/><rect x="15" y="8.2" width="3.6" height="3.6" rx=".6"/><path d="M5.8 10.5h4M5.8 13.5h4"/>'),
    grid: ui('<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>'),
    sunrise: ui('<path d="M3.5 18.5h17"/><path d="M7.3 18.5a4.7 4.7 0 0 1 9.4 0"/><path d="M12 6v3.2M5.4 9.4l2.1 2.1M18.6 9.4l-2.1 2.1"/>'),
    trophy: ui('<path d="M8 4h8v5.5a4 4 0 0 1-8 0z"/><path d="M8 6H5.2a3 3 0 0 0 3 4.2M16 6h2.8a3 3 0 0 1-3 4.2"/><path d="M12 13.5V17M8.5 20.5h7M10 17h4"/>'),
    chest: ui('<path d="M4 11.5h16V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><path d="M4 11.5V9a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2.5"/><rect x="10.3" y="10" width="3.4" height="4.6" rx=".8" fill="currentColor"/>'),
    lock: ui('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
    map: ui('<path d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z"/><path d="M9 4.5v13M15 6.5v13"/>'),
    album: ui('<rect x="3.5" y="7.5" width="12.5" height="13" rx="2"/><path d="M8 7.5V5.5a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H16"/>'),
    person: ui('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c0-4.2 3.4-7.2 7.5-7.2s7.5 3 7.5 7.2"/>'),
    shield: ui('<path d="M12 3.2 5 5.8v5.7c0 4.4 3 7.7 7 9.2 4-1.5 7-4.8 7-9.2V5.8z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.6"/>'),
    bolt: ui('<path fill="currentColor" d="M13.2 2.5 5.5 13.6h5.3l-1 7.9 7.7-11.2h-5.3z"/>', true),

    /* ----- Logo ----- */
    logo: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" style="fill:var(--ink)"/><path d="M15 31.5 24 15.5l9 16z" fill="none" style="stroke:var(--bg)" stroke-width="2" stroke-linejoin="round" opacity=".45"/><circle cx="24" cy="15.5" r="6" style="fill:var(--per)"/><circle cx="15" cy="31.5" r="6" style="fill:var(--mem)"/><circle cx="33" cy="31.5" r="6" style="fill:var(--dec)"/></svg>'
  };
})();
