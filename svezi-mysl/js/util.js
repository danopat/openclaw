/* Svěží mysl — pomocné funkce. Klasické skripty bez sestavování: aplikace běží
   i po otevření index.html přímo ze souboru. Vše žije ve jmenném prostoru window.SM. */
(function () {
  'use strict';
  var SM = (window.SM = window.SM || {});
  SM.games = SM.games || {};
  SM.registerGame = function (game) { SM.games[game.id] = game; };

  // ?ts=0.1 zrychlí všechna čekání (jen pro automatické testy).
  SM.timeScale = (function () {
    var m = /[?&]ts=([0-9.]+)/.exec(location.search);
    var v = m ? parseFloat(m[1]) : 1;
    return v > 0 && v <= 1 ? v : 1;
  })();

  var U = (SM.util = {});

  /** Vytvoří element: h('button', {class: 'btn', onclick: fn}, 'Text', child) */
  U.h = function (tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style' && typeof v === 'object') {
          Object.keys(v).forEach(function (p) {
            if (p.indexOf('--') === 0) el.style.setProperty(p, v[p]);
            else el.style[p] = v[p];
          });
        } else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      });
    }
    for (var i = 2; i < arguments.length; i++) U.append(el, arguments[i]);
    return el;
  };
  U.append = function (el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { U.append(el, k); }); return; }
    el.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  };
  /** SVG ikona z řetězce. */
  U.svg = function (markup, cls) {
    var span = document.createElement('span');
    span.innerHTML = markup.trim();
    var s = span.firstChild;
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (cls) s.setAttribute('class', cls);
    return s;
  };

  /** Okamžitá reakce na dotyk (pointerdown) + ovládání klávesnicí (click s detail 0). */
  U.tap = function (el, fn) {
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      fn(e);
    });
    el.addEventListener('click', function (e) {
      if (e.detail === 0) fn(e);
    });
  };

  /** Zamíchá kopii pole; volitelně s vlastním generátorem náhody (rnd() → 0..1). */
  U.shuffle = function (arr, rnd) {
    rnd = rnd || Math.random;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  /** Opakovatelná náhoda (mulberry32): stejné semínko → stejná posloupnost. */
  U.rng = function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.daysBetween = function (a, b) {
    var da = U.parseDayKey(a), db = U.parseDayKey(b);
    return Math.round((Date.UTC(db.getFullYear(), db.getMonth(), db.getDate()) - Date.UTC(da.getFullYear(), da.getMonth(), da.getDate())) / 86400000);
  };
  U.sample = function (arr, n) { return U.shuffle(arr).slice(0, n); };
  U.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  U.randInt = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  U.clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
  U.mean = function (arr) {
    if (!arr.length) return 0;
    return arr.reduce(function (s, x) { return s + x; }, 0) / arr.length;
  };
  U.geomean = function (arr) {
    if (!arr.length) return 0;
    return Math.exp(U.mean(arr.map(function (x) { return Math.log(Math.max(x, 1e-6)); })));
  };

  /** Česká množná čísla: 1 hra, 2–4 hry, 0/5+ her. */
  U.plural = function (n, one, few, many) {
    if (n === 1) return one;
    if (n >= 2 && n <= 4 && Math.floor(n) === n) return few;
    return many;
  };
  U.num = function (x, digits) {
    return x.toFixed(digits == null ? 1 : digits).replace('.', ',');
  };
  /** 4200 → „4,2 s“; 75000 → „1 min 15 s“ */
  U.fmtTime = function (ms) {
    var s = ms / 1000;
    if (s < 10) return U.num(s, 1) + ' s';
    if (s < 60) return Math.round(s) + ' s';
    var m = Math.floor(s / 60);
    var r = Math.round(s - m * 60);
    if (r === 60) { m += 1; r = 0; }
    return m + ' min' + (r ? ' ' + r + ' s' : '');
  };
  U.fmtMinutes = function (ms) {
    var m = Math.round(ms / 60000);
    return m < 1 && ms > 0 ? 'méně než 1 min' : m + ' min';
  };

  var WEEKDAYS = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
  var WEEKDAYS_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  var MONTHS_GEN = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
  U.dayKey = function (d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  };
  U.parseDayKey = function (key) {
    var p = key.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  };
  U.addDays = function (d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
  /** Pořadové číslo dne (pro střídání denního tréninku). */
  U.dayNumber = function (d) {
    d = d || new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  };
  U.longDate = function (d) {
    d = d || new Date();
    return WEEKDAYS[d.getDay()] + ' ' + d.getDate() + '. ' + MONTHS_GEN[d.getMonth()];
  };
  U.shortDate = function (d) { return d.getDate() + '. ' + (d.getMonth() + 1) + '.'; };
  U.weekdayShort = function (d) { return WEEKDAYS_SHORT[d.getDay()]; };
  U.greeting = function (d) {
    var hour = (d || new Date()).getHours();
    if (hour >= 4 && hour < 9) return 'Dobré ráno';
    if (hour >= 9 && hour < 12) return 'Dobré dopoledne';
    if (hour >= 12 && hour < 18) return 'Dobré odpoledne';
    return 'Dobrý večer';
  };

  /**
   * Najde rozložení mřížky (počet sloupců) s co největšími dlaždicemi.
   * aspect = šířka / výška dlaždice.
   */
  U.fitGrid = function (n, W, H, aspect, gap, maxSize) {
    aspect = aspect || 1;
    gap = gap == null ? 8 : gap;
    maxSize = maxSize || 220;
    var best = null;
    for (var cols = 1; cols <= n; cols++) {
      var rows = Math.ceil(n / cols);
      if (rows * cols - n >= cols) continue;
      var byW = (W - gap * (cols - 1)) / cols;
      var byH = ((H - gap * (rows - 1)) / rows) * aspect;
      var w = Math.min(byW, byH, maxSize);
      if (!best || w > best.w + 0.5) best = { cols: cols, rows: rows, w: w, h: w / aspect };
    }
    if (!best || best.w < 20) {
      var c = Math.ceil(Math.sqrt(n));
      best = { cols: c, rows: Math.ceil(n / c), w: 40, h: 40 / aspect };
    }
    best.w = Math.floor(best.w);
    best.h = Math.floor(best.h);
    return best;
  };

  U.isIOS = function () {
    return /iP(hone|ad|od)/.test(navigator.platform || '') ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
      /iPhone|iPad|iPod/.test(navigator.userAgent);
  };
  U.isStandalone = function () {
    return navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  };
  U.inFrame = function () {
    try { return window.top !== window.self; } catch (e) { return true; }
  };
})();
