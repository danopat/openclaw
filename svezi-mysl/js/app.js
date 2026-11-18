/* Svěží mysl — kostra aplikace: obrazovky, navigace, spodní lišta, dialogy a běh her. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const store = SM.store;
  const sound = SM.sound;
  const I = SM.icons;

  const DOMAINS = [
    { id: 'pamet', name: 'Paměť', desc: 'Zapamatovat si a vybavit' },
    { id: 'postreh', name: 'Postřeh', desc: 'Rychle si všimnout' },
    { id: 'rozhodovani', name: 'Rozhodování', desc: 'Správně a včas zareagovat' },
    { id: 'slova', name: 'Slova', desc: 'Jazyk a slovní zásoba' },
    { id: 'logika', name: 'Počty a logika', desc: 'Čísla, čas, peníze a pravidla' }
  ];

  let app = null;
  let live = null;
  let cleanup = null;
  let modalEl = null;
  let hostTheme = null;

  /* ---------- Drobnosti ---------- */
  const icon = (name, cls) => U.svg(I[name], cls);
  const domain = (id) => DOMAINS.find((d) => d.id === id) || DOMAINS[0];
  function tile(id, cls) {
    const g = SM.games[id];
    const t = h('span', { class: 'tile dom-' + g.domain + (cls ? ' ' + cls : '') });
    t.appendChild(icon(g.id));
    return t;
  }
  function clearNode(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function announce(text) {
    if (!live) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 40);
  }
  const howTo = (g, level) => (typeof g.howTo === 'function' ? g.howTo(level) : g.howTo);

  /* ---------- Obrazovky ---------- */
  const TABS = [
    { id: 'cesta', route: '', icon: 'map', label: 'Cesta' },
    { id: 'hry', route: 'hry', icon: 'grid', label: 'Hry' },
    { id: 'sbirka', route: 'sbirka', icon: 'album', label: 'Sbírka' },
    { id: 'pokrok', route: 'pokrok', icon: 'chart', label: 'Pokrok' }
  ];
  function tabbar(active) {
    return h('nav', { class: 'tabbar', 'aria-label': 'Hlavní nabídka' }, TABS.map((t) => h('button', {
      class: 'tab' + (t.id === active ? ' is-active' : ''), type: 'button',
      'aria-current': t.id === active ? 'page' : null,
      onclick: () => go(t.route)
    }, icon(t.icon), h('span', null, t.label))));
  }

  /** opts: { tab, playing, focus: false, scrollTo: element } */
  function setScreen(node, opts) {
    opts = opts || {};
    if (cleanup) {
      const c = cleanup;
      cleanup = null;
      try { c(); } catch (e) { console.error(e); }
    }
    sound.stopSpeaking();
    closeModal();
    document.body.classList.toggle('is-playing', !!opts.playing);
    document.body.classList.toggle('has-tabs', !!opts.tab);
    clearNode(app);
    app.appendChild(node);
    if (opts.tab) {
      app.appendChild(tabbar(opts.tab));
      SM.ui.lastTab = (TABS.find((t) => t.id === opts.tab) || TABS[0]).route;
    }
    if (opts.scrollTo) {
      try { opts.scrollTo.scrollIntoView({ block: 'center' }); } catch (e) { opts.scrollTo.scrollIntoView(); }
    } else window.scrollTo(0, 0);
    if (opts.focus !== false) {
      const f = node.querySelector('h1');
      if (f) {
        f.setAttribute('tabindex', '-1');
        try { f.focus({ preventScroll: true }); } catch (e) { /* starší Safari */ }
      }
    }
  }

  /* ---------- Navigace (kotvy #nazev) ---------- */
  const VIEWS = {};
  function currentRoute() {
    try { return decodeURIComponent((location.hash || '').replace(/^#/, '')); } catch (e) { return ''; }
  }
  function route() {
    const r = currentRoute();
    if (r.indexOf('hra-') === 0 && SM.games[r.slice(4)]) { SM.screens.gameIntro(r.slice(4)); return; }
    if (r.indexOf('pokrok-') === 0 && SM.games[r.slice(7)]) { SM.screens.gameProgress(r.slice(7)); return; }
    if (r.indexOf('trik-') === 0 && SM.school && SM.school.byId(r.slice(5))) { SM.screens.trick(r.slice(5)); return; }
    (VIEWS[r] || VIEWS[''])();
  }
  function go(r) {
    if (currentRoute() === r) route();
    else location.hash = r;
  }

  function topbar(label, onBack, extra) {
    return h('div', { class: 'topbar' },
      h('button', { class: 'btn btn-quiet', type: 'button', onclick: onBack }, icon('back'), label || 'Zpět'),
      extra || null);
  }

  /* ---------- Dialogy ---------- */
  function closeModal() {
    if (modalEl && modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
    modalEl = null;
  }
  /** Okno nad obrazovkou. content: prvky; actions: [{ label, value, kind, icon, big }] → Promise(value) */
  function modal(content, actions, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      closeModal();
      const prev = document.activeElement;
      const finish = (v) => {
        closeModal();
        document.removeEventListener('keydown', onKey, true);
        if (prev && prev.focus) { try { prev.focus({ preventScroll: true }); } catch (e) { /* nic */ } }
        resolve(v);
      };
      const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); finish(null); } };
      const buttons = (actions || []).map((a) => h('button', {
        class: 'btn btn-block btn-' + (a.kind || 'secondary') + (a.big ? ' btn-lg' : ''), type: 'button',
        disabled: a.disabled || null,
        onclick: () => finish(a.value)
      }, a.icon ? icon(a.icon) : null, a.label));
      const box = h('div', { class: 'modal' + (opts.sheet ? ' is-sheet' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' },
        content, buttons.length ? h('div', { class: 'modal-actions' }, buttons) : null);
      modalEl = h('div', { class: 'modal-back' + (opts.sheet ? ' is-sheet' : '') }, box);
      modalEl.addEventListener('click', (e) => { if (e.target === modalEl) finish(null); });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(modalEl);
      const first = buttons.find((b) => !b.disabled);
      if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
    });
  }
  function dialog(title, text, actions) {
    return modal([h('h2', { id: 'modal-title' }, title), text ? h('p', null, text) : null], actions);
  }

  /* ---------- Běh jedné hry ---------- */
  /**
   * opts: { short, lesson: { i, total }, onDone(meta), onExit() }
   * meta = výsledek z SM.engine.recordGame (úroveň, body, rekord…)
   */
  function runGame(id, opts) {
    opts = opts || {};
    const g = SM.games[id];
    const st = store.game(id);
    const level = U.clamp(st.level || 1, 1, g.maxLevel);

    const status = h('p', { class: 'play-status', 'aria-live': 'polite' });
    const progress = h('span', { class: 'play-progress' });
    const stage = h('div', { class: 'play-stage' });
    const foot = h('div', { class: 'play-foot' });
    const fb = h('div', { class: 'fb', 'aria-hidden': 'true' });
    const exitBtn = h('button', { class: 'btn btn-secondary btn-small', type: 'button' }, icon('close'), 'Konec');
    let bar = null;
    if (opts.lesson) {
      bar = h('div', { class: 'lesson-bar', role: 'img', 'aria-label': 'Hra ' + (opts.lesson.i + 1) + ' z ' + opts.lesson.total },
        Array.from({ length: opts.lesson.total }, (_, k) => h('span', { class: k < opts.lesson.i ? 'is-done' : k === opts.lesson.i ? 'is-now' : '' })));
    }
    const root = h('main', { class: 'play play-' + id },
      bar,
      h('header', { class: 'play-head' }, exitBtn,
        h('div', { class: 'play-titles' }, h('h1', { class: 'play-title' }, g.name), progress)),
      status, stage, foot, fb);
    setScreen(root, { playing: true });

    let alive = true;
    const timers = [];
    const rafs = [];
    const listeners = [];
    const marks = []; // odpovědi { ok, ms } pro úspěšnost a rychlost
    const t0 = performance.now();
    let wake = null;
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then((w) => { if (alive) wake = w; else w.release(); }).catch(() => {});
      }
    } catch (e) { /* zámek obrazovky není k dispozici */ }

    const stop = () => {
      alive = false;
      timers.forEach((t) => clearTimeout(t));
      rafs.forEach((r) => cancelAnimationFrame(r));
      listeners.forEach((l) => l[0].removeEventListener(l[1], l[2], l[3]));
      if (wake) { try { wake.release(); } catch (e) { /* nic */ } wake = null; }
    };
    cleanup = stop;

    const ctx = {
      id: id,
      level: level,
      maxLevel: g.maxLevel,
      short: !!opts.short,
      stage: stage,
      foot: foot,
      sound: sound,
      get alive() { return alive; },
      status(text) { status.textContent = text || ''; },
      progress(text) { progress.textContent = text || ''; },
      sleep(ms) {
        return new Promise((resolve) => {
          if (!alive) return;
          timers.push(setTimeout(() => { if (alive) resolve(); }, ms * SM.timeScale));
        });
      },
      after(ms, fn) {
        const t = setTimeout(() => { if (alive) fn(); }, ms * SM.timeScale);
        timers.push(t);
        return t;
      },
      cancel(t) { clearTimeout(t); },
      /** Zaznamená jednu odpověď (správně/špatně, doba v ms). Výběr z možností to dělá sám. */
      mark(ok, msVal) { if (msVal > 0) marks.push({ ok: !!ok, ms: msVal }); },
      frame(fn) {
        const r = requestAnimationFrame((ts) => { if (alive) fn(ts); });
        rafs.push(r);
        return r;
      },
      on(el, type, fn, o) { el.addEventListener(type, fn, o); listeners.push([el, type, fn, o]); },
      size() { return { w: stage.clientWidth, h: stage.clientHeight }; },
      clear() { clearNode(stage); clearNode(foot); },
      feedback(ok, opt) {
        fb.className = 'fb';
        clearNode(fb);
        fb.appendChild(icon(ok ? 'check' : 'cross'));
        void fb.offsetWidth; // restart animace
        fb.className = 'fb ' + (ok ? 'is-ok' : 'is-bad');
        announce(ok ? 'Správně' : 'Chyba');
        if (!opt || !opt.silent) (ok ? sound.correct : sound.wrong)();
      },
      finish(res) {
        if (!alive) return;
        const ms = performance.now() - t0;
        stop();
        cleanup = null;
        // Rychlost: medián doby správných odpovědí (když hra nedodala vlastní míru).
        if (res.rt == null && marks.length) {
          const good = marks.filter((m) => m.ok).map((m) => m.ms);
          res.rt = U.median(good.length ? good : marks.map((m) => m.ms));
        }
        const meta = SM.engine.recordGame(id, level, res, ms);
        if (opts.onDone) opts.onDone(meta);
      }
    };

    exitBtn.addEventListener('click', () => {
      dialog(opts.lesson ? 'Ukončit lekci?' : 'Ukončit hru?',
        opts.lesson ? 'Dohrané hry se započítají, lekce ale zůstane nedokončená.' : 'Rozehraná hra se neuloží.', [
          { label: 'Hrát dál', value: false, kind: 'primary' },
          { label: opts.lesson ? 'Ukončit lekci' : 'Ukončit hru', value: true, kind: 'secondary' }
        ]).then((quit) => {
        if (!quit || !alive) return;
        if (opts.onExit) opts.onExit(); else go('');
      });
    });

    Promise.resolve()
      .then(() => g.run(ctx))
      .catch((e) => {
        console.error(e);
        if (alive) ctx.status('Hra narazila na chybu. Zkuste ji prosím spustit znovu.');
      });
  }

  /* ---------- Nastavení vzhledu ---------- */
  function applySettings() {
    const s = store.settings();
    const root = document.documentElement;
    root.setAttribute('data-scale', String(s.scale || 1));
    if (s.theme === 'light' || s.theme === 'dark') root.setAttribute('data-theme', s.theme);
    else if (hostTheme) root.setAttribute('data-theme', hostTheme);
    else root.removeAttribute('data-theme');
  }

  /* ---------- Sdílené pro obrazovky ---------- */
  SM.screens = SM.screens || {};
  SM.ui = {
    DOMAINS: DOMAINS, domain: domain, icon: icon, tile: tile, clearNode: clearNode, announce: announce, howTo: howTo,
    setScreen: setScreen, go: go, topbar: topbar, modal: modal, dialog: dialog, closeModal: closeModal,
    runGame: runGame, applySettings: applySettings, views: VIEWS, route: route
  };
  SM.go = go;

  /* ---------- Start ---------- */
  SM.boot = function () {
    if (SM.booted) return;
    SM.booted = true;
    app = document.getElementById('app');
    if (!app) {
      app = h('div', { id: 'app', class: 'app' });
      document.body.appendChild(app);
    }
    live = document.getElementById('sr-live');
    if (!live) {
      live = h('div', { id: 'sr-live', class: 'sr-only', 'aria-live': 'polite' });
      document.body.appendChild(live);
    }
    hostTheme = document.documentElement.getAttribute('data-theme');
    applySettings();
    SM.engine.checkStreak();
    window.addEventListener('hashchange', route);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { sound.stopSpeaking(); return; }
      if (SM.engine.checkStreak() && !document.body.classList.contains('is-playing') && currentRoute() === '') route();
    });
    if (!store.profile().onboarded) SM.screens.onboarding();
    else route();

    // Offline režim (jen na vlastním webu přes https, ne ve vloženém rámu).
    const okProto = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!SM.embedded && 'serviceWorker' in navigator && okProto && !U.inFrame() && SM.timeScale === 1) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    if (U.isStandalone() && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  };
})();
