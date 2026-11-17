/* Svěží mysl — obrazovky, navigace a běh her. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const store = SM.store;
  const sound = SM.sound;
  const I = SM.icons;

  const DOMAINS = [
    { id: 'pamet', name: 'Paměť', desc: 'Zapamatovat si, co vidíte' },
    { id: 'postreh', name: 'Postřeh', desc: 'Rychle si všimnout podstatného' },
    { id: 'rozhodovani', name: 'Rozhodování', desc: 'Správně a včas zareagovat' }
  ];
  const GROUPS = {
    pamet: ['pexeso', 'nakup', 'okna'],
    postreh: ['blesk', 'jiny'],
    rozhodovani: ['sipky', 'barvy', 'poradi']
  };
  const ORDER = [].concat(GROUPS.pamet, GROUPS.postreh, GROUPS.rozhodovani);

  let app = null;
  let live = null;
  let cleanup = null;
  let modalEl = null;
  let hostTheme = null;

  /* ---------- Drobnosti ---------- */
  const icon = (name, cls) => U.svg(I[name], cls);
  const domainName = (id) => (DOMAINS.find((d) => d.id === id) || {}).name || '';
  function tile(id, cls) {
    const g = SM.games[id];
    const t = h('span', { class: 'tile dom-' + g.domain + (cls ? ' ' + cls : '') });
    t.appendChild(icon(g.id));
    return t;
  }
  function clearNode(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  const doneMark = () => h('span', { class: 'state done-mark' }, icon('check'), h('span', { class: 'sr-only' }, 'Hotovo'));
  function announce(text) {
    if (!live) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 40);
  }
  function howTo(g, level) { return typeof g.howTo === 'function' ? g.howTo(level) : g.howTo; }

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
    clearNode(app);
    app.appendChild(node);
    window.scrollTo(0, 0);
    const focusEl = node.querySelector('h1');
    if (focusEl) {
      focusEl.setAttribute('tabindex', '-1');
      try { focusEl.focus({ preventScroll: true }); } catch (e) { /* starší Safari */ }
    }
  }

  /* ---------- Navigace (kotvy #nazev) ---------- */
  const VIEWS = {
    '': viewHome,
    pokrok: viewProgress,
    nastaveni: viewSettings,
    'o-treninku': viewAbout,
    'denni-trenink': viewDaily
  };
  function currentRoute() {
    try { return decodeURIComponent((location.hash || '').replace(/^#/, '')); } catch (e) { return ''; }
  }
  function route() {
    const r = currentRoute();
    if (r.indexOf('hra-') === 0 && SM.games[r.slice(4)]) { viewIntro(r.slice(4), {}); return; }
    (VIEWS[r] || viewHome)();
  }
  function go(r) {
    if (currentRoute() === r) route();
    else location.hash = r;
  }
  SM.go = go;

  function topbar(label, onBack, crumb) {
    return h('div', { class: 'topbar' },
      h('button', { class: 'btn btn-quiet', type: 'button', onclick: onBack }, icon('back'), label || 'Zpět'),
      crumb ? h('span', { class: 'crumb' }, crumb) : null);
  }

  /* ---------- Dialog (místo confirm(), který v některých prostředích nefunguje) ---------- */
  function closeModal() {
    if (modalEl && modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
    modalEl = null;
  }
  /** actions: [{ label, value, kind: 'primary'|'secondary'|'danger' }] → Promise(value) */
  function dialog(title, text, actions) {
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
      const buttons = actions.map((a) => h('button', {
        class: 'btn btn-block btn-' + (a.kind || 'secondary'),
        type: 'button',
        onclick: () => finish(a.value)
      }, a.label));
      const box = h('div', { class: 'modal', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title', 'aria-describedby': 'modal-text' },
        h('h2', { id: 'modal-title' }, title),
        text ? h('p', { id: 'modal-text' }, text) : null,
        h('div', { class: 'modal-actions' }, buttons));
      modalEl = h('div', { class: 'modal-back' }, box);
      modalEl.addEventListener('click', (e) => { if (e.target === modalEl) finish(null); });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(modalEl);
      buttons[0].focus();
    });
  }

  /* ---------- Denní trénink ---------- */
  function planFor(date) {
    const n = U.dayNumber(date);
    const M = GROUPS.pamet, P = GROUPS.postreh, D = GROUPS.rozhodovani;
    const fourth = n % 2 ? M[(n + 1) % 3] : D[(n + 1) % 3];
    return [P[n % 2], M[n % 3], D[n % 3], fourth];
  }
  function ensurePlan() {
    let d = store.daily();
    if (d.date !== U.dayKey() || !d.plan || !d.plan.length) d = store.setDaily(planFor(new Date()));
    return d;
  }
  function nextInPlan(d) { return d.plan.filter((id) => d.done.indexOf(id) === -1)[0] || null; }

  /* ---------- Domů ---------- */
  function streakNote() {
    const s = store.streak();
    const today = !!store.day(U.dayKey());
    if (s >= 2) return 'Trénujete ' + s + ' ' + U.plural(s, 'den', 'dny', 'dní') + ' v řadě';
    if (s === 1 && today) return 'Dnes už máte natrénováno';
    if (s === 1) return 'Včera jste trénovali. Navažte dnes!';
    return null;
  }

  function viewHome() {
    const now = new Date();
    const page = h('main', { class: 'page' });

    page.appendChild(h('header', { class: 'home-head' },
      h('div', { class: 'brand' }, U.svg(I.logo), h('span', null, 'Svěží mysl')),
      h('button', { class: 'btn btn-quiet head-icon', type: 'button', 'aria-label': 'Nastavení', onclick: () => go('nastaveni') }, icon('sliders'))));

    const note = streakNote();
    page.appendChild(h('section', { class: 'hello' },
      h('p', { class: 'hello-date' }, 'Dnes je ', h('strong', null, U.longDate(now))),
      h('h1', null, U.greeting(now) + '!'),
      note ? h('p', { class: 'streak' }, icon('sprout'), note) : null));

    const d = ensurePlan();
    const total = d.plan.length;
    const doneCount = d.plan.filter((id) => d.done.indexOf(id) !== -1).length;
    const allDone = doneCount >= total;
    page.appendChild(h('section', { class: 'today', 'aria-labelledby': 'today-title' },
      h('div', { class: 'today-top' },
        h('h2', { id: 'today-title' }, 'Dnešní trénink'),
        h('span', { class: 'today-meta' }, total + ' ' + U.plural(total, 'krátká hra', 'krátké hry', 'krátkých her') + ' · asi 10 minut')),
      h('ul', { class: 'today-steps' }, d.plan.map((id) => {
        const done = d.done.indexOf(id) !== -1;
        return h('li', { class: 'today-step' + (done ? ' is-done' : '') },
          tile(id),
          h('span', { class: 'name' }, SM.games[id].name),
          done ? doneMark() : null);
      })),
      allDone ? h('p', { class: 'today-done-note' }, icon('check'), 'Dnešní trénink máte splněný. Výborně!') : null,
      h('button', {
        class: 'btn btn-lg btn-block ' + (allDone ? 'btn-secondary' : 'btn-primary'),
        type: 'button',
        onclick: () => {
          if (allDone) store.setDaily(d.plan);
          go('denni-trenink');
        }
      }, icon(allDone ? 'replay' : 'play'),
      doneCount === 0 ? 'Začít trénink' : allDone ? 'Projít trénink znovu' : 'Pokračovat (' + doneCount + ' ze ' + total + ')')));

    DOMAINS.forEach((dm) => {
      page.appendChild(h('h2', { class: 'section-title' },
        h('span', { class: 'dom-dot dom-' + dm.id }), dm.name, h('small', null, dm.desc)));
      const ul = h('ul', { class: 'game-list' });
      GROUPS[dm.id].forEach((id) => {
        const g = SM.games[id];
        const st = store.game(id);
        ul.appendChild(h('li', null, h('button', { class: 'game-row', type: 'button', onclick: () => go('hra-' + id) },
          tile(id),
          h('span', { class: 'txt' },
            h('span', { class: 'name' }, g.name),
            h('span', { class: 'sub' }, g.short),
            h('span', { class: 'sub' }, st.plays ? 'Úroveň ' + st.level + ' z ' + g.maxLevel : 'Zatím nehráno')),
          icon('chevron', 'chev'))));
      });
      page.appendChild(ul);
    });

    page.appendChild(h('nav', { class: 'home-nav', 'aria-label': 'Další' },
      h('button', { class: 'btn nav-btn', type: 'button', onclick: () => go('pokrok') }, icon('chart'), 'Můj pokrok'),
      h('button', { class: 'btn nav-btn', type: 'button', onclick: () => go('nastaveni') }, icon('sliders'), 'Nastavení'),
      h('button', { class: 'btn nav-btn', type: 'button', onclick: () => go('o-treninku') }, icon('info'), 'O tréninku')));

    if (!SM.embedded && U.isIOS() && !U.isStandalone() && !U.inFrame() && !store.flag('installHintHidden')) {
      const hint = h('aside', { class: 'hint', 'aria-label': 'Tip' },
        h('p', null, h('strong', null, 'Tip: '), 'Přidejte si Svěží mysl na plochu. V Safari klepněte na tlačítko Sdílet (čtvereček se šipkou nahoru) a vyberte „Přidat na plochu“. Aplikace pak funguje i bez internetu a výsledky zůstanou uložené.'),
        h('button', {
          class: 'btn btn-secondary btn-small', type: 'button',
          onclick: () => { store.setFlag('installHintHidden', true); hint.remove(); }
        }, 'Rozumím'));
      page.appendChild(hint);
    }

    setScreen(page);
  }

  /* ---------- Úvod ke hře ---------- */
  function viewIntro(id, opts) {
    opts = opts || {};
    const g = SM.games[id];
    const st = store.game(id);
    const level = U.clamp(st.level || 1, 1, g.maxLevel);
    const steps = howTo(g, level);
    const page = h('main', { class: 'page intro' });

    page.appendChild(topbar(opts.daily ? 'Domů' : 'Zpět', () => go(''),
      opts.daily ? 'Dnešní trénink · ' + (opts.step + 1) + '. hra ze ' + opts.total : null));

    page.appendChild(h('div', { class: 'intro-hero' },
      tile(id),
      h('div', null,
        h('h1', null, g.name),
        h('p', { class: 'trains' }, 'Trénuje ' + g.trains + '.'))));

    page.appendChild(h('div', { class: 'pills' },
      h('span', { class: 'pill dom-' + g.domain }, h('span', { class: 'dom-dot' }), domainName(g.domain)),
      h('span', { class: 'pill' }, 'Úroveň ' + level + ' z ' + g.maxLevel),
      h('span', { class: 'pill' }, g.duration || 'asi 2 minuty')));

    page.appendChild(h('h2', null, 'Jak se hraje'));
    page.appendChild(h('ol', { class: 'howto' }, steps.map((s) => h('li', null, h('span', null, s)))));

    const speakText = g.name + '. ' + steps.join(' ');
    const actions = h('div', { class: 'intro-actions' },
      h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => startGame(id, opts) },
        icon('play'), 'Začít hru'),
      sound.canSpeak ? h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: () => sound.speak(speakText) },
        icon('speaker'), 'Přečíst pokyny nahlas') : null);
    page.appendChild(actions);

    setScreen(page);
    if (store.settings().autoSpeak) sound.speak(speakText);
  }

  /* ---------- Běh hry ---------- */
  function startGame(id, opts) {
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
    const root = h('main', { class: 'play play-' + id },
      h('header', { class: 'play-head' }, exitBtn, h('div', { class: 'play-titles' }, h('h1', { class: 'play-title' }, g.name), progress)),
      status, stage, foot, fb);
    setScreen(root, { playing: true });

    let alive = true;
    const timers = [];
    const rafs = [];
    const listeners = [];
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
        showResult(id, level, res, ms, opts);
      }
    };

    exitBtn.addEventListener('click', () => {
      dialog('Ukončit hru?', 'Rozehraná hra se neuloží.', [
        { label: 'Hrát dál', value: false, kind: 'primary' },
        { label: 'Ukončit hru', value: true, kind: 'secondary' }
      ]).then((quit) => {
        if (!quit || !alive) return;
        if (opts.daily) viewDaily(); else viewIntro(id, opts);
      });
    });

    Promise.resolve()
      .then(() => g.run(ctx))
      .catch((e) => {
        console.error(e);
        if (alive) ctx.status('Hra narazila na chybu. Zkuste ji prosím spustit znovu.');
      });
  }

  /* ---------- Výsledek ---------- */
  function showResult(id, level, res, ms, opts) {
    const g = SM.games[id];
    const perf = U.clamp(res.perf || 0, 0, 1);
    const newLevel = U.clamp(res.newLevel != null ? res.newLevel : level + (res.levelDelta || 0), 1, g.maxLevel);
    const points = Math.round((level - 1) * 10 + perf * 10);
    const rec = store.recordResult({ id: id, level: level, newLevel: newLevel, points: points, ms: ms, metric: res.metric });
    if (opts.daily) store.markDailyDone(id);
    if (newLevel > level) sound.levelUp(); else sound.done();

    const praise = perf >= 0.85 ? 'Výborně!' : perf >= 0.6 ? 'Skvělá práce!' : perf >= 0.3 ? 'Dobrá práce!' : 'Děkujeme za trénink!';
    let levelText;
    if (newLevel > level) levelText = 'Postupujete na úroveň ' + newLevel + ' z ' + g.maxLevel + '.';
    else if (newLevel < level) levelText = 'Příště to bude o kousek lehčí (úroveň ' + newLevel + ').';
    else if (level === g.maxLevel && perf >= 0.6) levelText = 'Hrajete na nejvyšší úrovni. Klobouk dolů!';
    else levelText = 'Příště zůstáváte na úrovni ' + newLevel + '.';

    const page = h('main', { class: 'page' });
    const box = h('section', { class: 'result' },
      h('div', { class: 'result-badge' }, icon('star')),
      h('h1', null, praise),
      h('p', { class: 'result-figure' },
        h('span', { class: 'result-big' }, res.big),
        h('span', { class: 'result-big-label' }, res.bigLabel)),
      res.details && res.details.length ? h('ul', { class: 'result-details' }, res.details.map((d) => h('li', null, d))) : null,
      h('p', { class: 'result-points' },
        h('span', null, 'Body: ' + points),
        rec.isBest ? h('span', { class: 'record' }, icon('star'), 'Nový osobní rekord') : null),
      h('p', { class: 'level-note' + (newLevel > level ? ' is-up' : '') }, levelText));

    const actions = h('div', { class: 'result-actions' });
    if (opts.daily) {
      const d = ensurePlan();
      const next = nextInPlan(d);
      if (next) {
        actions.appendChild(h('button', {
          class: 'btn btn-primary btn-lg btn-block', type: 'button',
          onclick: () => viewIntro(next, { daily: true, step: d.plan.indexOf(next), total: d.plan.length })
        }, icon('play'), 'Další hra: ' + SM.games[next].name));
      } else {
        actions.appendChild(h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => viewDaily() },
          icon('check'), 'Dokončit trénink'));
      }
      actions.appendChild(h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: () => go('') }, icon('home'), 'Domů'));
    } else {
      actions.appendChild(h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => startGame(id, opts) },
        icon('replay'), 'Hrát znovu'));
      actions.appendChild(h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: () => go('') }, icon('home'), 'Zpět na přehled'));
    }
    box.appendChild(actions);
    page.appendChild(box);
    setScreen(page);
    announce(praise + ' ' + res.big + ' ' + res.bigLabel + '. ' + levelText);
  }

  /* ---------- Denní trénink: přehled ---------- */
  function viewDaily() {
    const d = ensurePlan();
    const next = nextInPlan(d);
    const page = h('main', { class: 'page' });
    page.appendChild(topbar('Domů', () => go('')));

    if (!next) {
      const s = store.streak();
      const box = h('section', { class: 'result' },
        h('div', { class: 'result-badge' }, icon('sprout')),
        h('h1', null, 'Dnešní trénink je hotový!'),
        h('p', null, s >= 2 ? 'Trénujete už ' + s + ' ' + U.plural(s, 'den', 'dny', 'dní') + ' v řadě. Zítra vás čekají jiné hry.' : 'Zítra vás čekají jiné hry. Těšíme se na vás.'),
        h('ul', { class: 'today-steps', style: { width: '100%', maxWidth: '30rem', textAlign: 'left' } }, d.plan.map((id) =>
          h('li', { class: 'today-step' }, tile(id), h('span', { class: 'name' }, SM.games[id].name),
            doneMark()))),
        h('div', { class: 'result-actions' },
          h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => go('pokrok') }, icon('chart'), 'Můj pokrok'),
          h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: () => go('') }, icon('home'), 'Domů')));
      page.appendChild(box);
      setScreen(page);
      return;
    }

    const started = d.done.length > 0;
    page.appendChild(h('h1', { style: { fontSize: 'var(--fs-2xl)', margin: '0.75rem 0 0.5rem' } }, 'Dnešní trénink'));
    page.appendChild(h('p', { style: { color: 'var(--ink-2)', marginBottom: '1.25rem' } },
      'Čtyři krátké hry za sebou, každá trvá asi dvě minuty. Mezi hrami si klidně odpočiňte. Hry se každý den obměňují.'));
    page.appendChild(h('ol', { class: 'today-steps', style: { marginBottom: '1.5rem' } }, d.plan.map((id, i) => {
      const done = d.done.indexOf(id) !== -1;
      const isNext = id === next;
      return h('li', { class: 'today-step' + (done ? ' is-done' : '') },
        tile(id),
        h('span', { class: 'name' }, (i + 1) + '. ' + SM.games[id].name),
        done ? doneMark() : isNext ? h('span', { class: 'state' }, 'Na řadě') : null);
    })));
    page.appendChild(h('button', {
      class: 'btn btn-primary btn-lg btn-block', type: 'button',
      onclick: () => viewIntro(next, { daily: true, step: d.plan.indexOf(next), total: d.plan.length })
    }, icon('play'), (started ? 'Pokračovat: ' : 'Začít: ') + SM.games[next].name));
    setScreen(page);
  }

  /* ---------- Můj pokrok ---------- */
  function sparkline(entries) {
    // entries: [{ t, p, lv }] — posledních max. 12 výsledků
    const n = entries.length;
    const W = 300, H = 64, padX = 6, padY = 8;
    const vals = entries.map((e) => e.p);
    const top = Math.max(10, Math.ceil(Math.max.apply(null, vals) / 10) * 10);
    const x = (i) => padX + (n === 1 ? (W - 2 * padX) / 2 : (i * (W - 2 * padX)) / (n - 1));
    const y = (v) => H - padY - (v / top) * (H - 2 * padY);
    const pts = vals.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' ');
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('role', 'img');
    const best = Math.max.apply(null, vals);
    svg.setAttribute('aria-label', 'Vývoj bodů v posledních ' + n + ' hrách: od ' + vals[0] + ' do ' + vals[n - 1] + ', nejvíce ' + best + '.');
    const mk = (tag, attrs) => {
      const el = document.createElementNS(ns, tag);
      Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
      svg.appendChild(el);
      return el;
    };
    mk('line', { class: 'grid-line', x1: 0, x2: W, y1: H - padY, y2: H - padY, 'vector-effect': 'non-scaling-stroke' });
    mk('polygon', { class: 'area', points: x(0).toFixed(1) + ',' + (H - padY) + ' ' + pts + ' ' + x(n - 1).toFixed(1) + ',' + (H - padY) });
    mk('polyline', { class: 'trend', points: pts, 'vector-effect': 'non-scaling-stroke' });
    const cursor = mk('line', { class: 'cursor', x1: 0, x2: 0, y1: 0, y2: H, 'vector-effect': 'non-scaling-stroke', visibility: 'hidden' });

    const wrap = h('div', { class: 'spark' });
    const plot = h('div', { style: { position: 'relative' } });
    plot.appendChild(svg);
    // Koncový bod jako HTML prvek, aby zůstal kulatý i při roztažení grafu.
    const dot = (cls, i) => h('span', {
      class: cls,
      style: {
        position: 'absolute', width: '12px', height: '12px', borderRadius: '50%',
        left: 'calc(' + ((x(i) / W) * 100).toFixed(2) + '% - 6px)',
        top: 'calc(' + ((y(vals[i]) / H) * 64).toFixed(1) + 'px - 6px)',
        background: 'var(--ink)', boxShadow: '0 0 0 2px var(--surface)', pointerEvents: 'none'
      }
    });
    const endDot = dot('end-dot', n - 1);
    plot.appendChild(endDot);
    const hover = dot('hover-dot', n - 1);
    hover.hidden = true;
    plot.appendChild(hover);
    wrap.appendChild(plot);

    const fmt = (e) => U.shortDate(new Date(e.t)) + ': ' + e.p + ' b.';
    const left = h('span', null, 'Naposledy: ', h('strong', null, vals[n - 1] + ' b.'));
    const right = h('span', null, 'Rekord: ', h('strong', null, best + ' b.'));
    const read = h('div', { class: 'spark-read' }, left, right);
    wrap.appendChild(read);

    const show = (clientX) => {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const rel = ((clientX - r.left) / r.width) * W;
      let i = n === 1 ? 0 : Math.round(((rel - padX) / (W - 2 * padX)) * (n - 1));
      i = U.clamp(i, 0, n - 1);
      cursor.setAttribute('x1', x(i));
      cursor.setAttribute('x2', x(i));
      cursor.setAttribute('visibility', 'visible');
      hover.style.left = 'calc(' + ((x(i) / W) * 100).toFixed(2) + '% - 6px)';
      hover.style.top = 'calc(' + ((y(vals[i]) / H) * 64).toFixed(1) + 'px - 6px)';
      hover.hidden = false;
      endDot.hidden = true;
      clearNode(left);
      left.appendChild(h('strong', null, fmt(entries[i])));
    };
    const hide = () => {
      cursor.setAttribute('visibility', 'hidden');
      hover.hidden = true;
      endDot.hidden = false;
      clearNode(left);
      left.appendChild(document.createTextNode('Naposledy: '));
      left.appendChild(h('strong', null, vals[n - 1] + ' b.'));
    };
    svg.addEventListener('pointermove', (e) => show(e.clientX));
    svg.addEventListener('pointerdown', (e) => show(e.clientX));
    svg.addEventListener('pointerleave', hide);
    svg.addEventListener('pointercancel', hide);
    return wrap;
  }

  function viewProgress() {
    const page = h('main', { class: 'page' });
    page.appendChild(topbar('Domů', () => go('')));
    page.appendChild(h('h1', { style: { fontSize: 'var(--fs-2xl)', margin: '0.75rem 0 0' } }, 'Můj pokrok'));

    const total = store.totalGames();
    if (!total) {
      page.appendChild(h('div', { class: 'empty', style: { marginTop: '1rem' } },
        h('p', { style: { marginBottom: '1rem' } }, 'Zatím tu nic není. Zahrajte si první hru a uvidíte tu, jak se vám daří.'),
        h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => go('denni-trenink') }, icon('play'), 'Začít dnešní trénink')));
      setScreen(page);
      return;
    }

    const days = store.lastDays(7);
    const daysOn = days.filter((d) => d.n > 0).length;
    const weekMs = days.reduce((s, d) => s + d.ms, 0);
    const streak = store.streak();
    page.appendChild(h('div', { class: 'kpis' },
      h('div', { class: 'kpi' }, h('span', { class: 'kpi-label' }, 'Dny v řadě'), h('span', { class: 'kpi-value' }, String(streak)),
        h('span', { class: 'kpi-sub' }, streak ? 'Pokračujte i zítra' : 'Navažte dnes')),
      h('div', { class: 'kpi' }, h('span', { class: 'kpi-label' }, 'Posledních 7 dní'), h('span', { class: 'kpi-value' }, daysOn + ' ze 7'),
        h('span', { class: 'kpi-sub' }, 'celkem ' + U.fmtMinutes(weekMs))),
      h('div', { class: 'kpi' }, h('span', { class: 'kpi-label' }, 'Odehráno'), h('span', { class: 'kpi-value' }, String(total)),
        h('span', { class: 'kpi-sub' }, U.plural(total, 'hra', 'hry', 'her') + ' celkem'))));

    page.appendChild(h('h2', { class: 'section-title' }, 'Posledních 7 dní'));
    const todayKey = U.dayKey();
    page.appendChild(h('div', { class: 'week', role: 'list' }, days.map((d) => h('div', {
      class: 'day' + (d.n ? ' is-on' : '') + (d.key === todayKey ? ' is-today' : ''),
      role: 'listitem',
      'aria-label': U.longDate(d.date) + ': ' + (d.n ? d.n + ' ' + U.plural(d.n, 'hra', 'hry', 'her') + ', ' + U.fmtMinutes(d.ms) : 'bez tréninku')
    },
    h('span', { class: 'day-dot' }, d.n ? icon('check') : null),
    h('span', { class: 'day-name' }, d.key === todayKey ? 'Dnes' : U.weekdayShort(d.date)),
    h('span', { class: 'day-min' }, d.n ? U.fmtMinutes(d.ms).replace('méně než 1 min', '<1 min') : '–')))));

    page.appendChild(h('h2', { class: 'section-title' }, 'Hry'));
    const list = h('ul', { class: 'gp-list' });
    ORDER.forEach((id) => {
      const g = SM.games[id];
      const st = store.game(id);
      const hist = store.history(id);
      const card = h('li', { class: 'gp' },
        h('div', { class: 'gp-head' }, tile(id),
          h('div', null,
            h('div', { class: 'gp-title' }, g.name),
            h('div', { class: 'gp-sub' }, st.plays ? 'Hráno ' + st.plays + '× · ' + domainName(g.domain) : 'Zatím nehráno · ' + domainName(g.domain)))),
        h('div', { class: 'gp-meter' },
          h('div', { class: 'meter', role: 'meter', 'aria-valuemin': '1', 'aria-valuemax': String(g.maxLevel), 'aria-valuenow': String(st.level), 'aria-label': 'Úroveň' },
            h('i', { style: { width: ((st.level / g.maxLevel) * 100).toFixed(1) + '%' } })),
          h('span', { class: 'meter-label' }, 'Úroveň ' + st.level + ' z ' + g.maxLevel)));
      if (hist.length >= 2) card.appendChild(sparkline(hist.slice(-12)));
      if (hist.length) {
        const rows = hist.slice(-10).reverse();
        card.appendChild(h('details', null,
          h('summary', null, 'Posledních ' + rows.length + ' ' + U.plural(rows.length, 'výsledek', 'výsledky', 'výsledků')),
          h('div', { class: 'table-wrap' }, h('table', { class: 'hist' },
            h('thead', null, h('tr', null, h('th', null, 'Datum'), h('th', null, 'Úroveň'), h('th', null, 'Body'), h('th', null, 'Délka'))),
            h('tbody', null, rows.map((r) => h('tr', null,
              h('td', null, U.shortDate(new Date(r.t))),
              h('td', null, String(r.lv)),
              h('td', null, String(r.p)),
              h('td', null, U.fmtTime(r.ms)))))))));
      }
      list.appendChild(card);
    });
    page.appendChild(list);
    page.appendChild(h('p', { style: { color: 'var(--ink-2)', fontSize: 'var(--fs-s)', marginTop: '1.25rem' } },
      'Body: každá úroveň přidává 10 bodů a dalších až 10 bodů získáte za výkon v ní. Výsledky jsou uložené jen v tomto zařízení.'));
    setScreen(page);
  }

  /* ---------- Nastavení ---------- */
  function applySettings() {
    const s = store.settings();
    const root = document.documentElement;
    root.setAttribute('data-scale', String(s.scale || 1));
    if (s.theme === 'light' || s.theme === 'dark') root.setAttribute('data-theme', s.theme);
    else if (hostTheme) root.setAttribute('data-theme', hostTheme);
    else root.removeAttribute('data-theme');
  }

  function segmented(name, label, options, value, onChange) {
    return h('div', { class: 'seg', role: 'radiogroup', 'aria-label': label }, options.map((o) => {
      const input = h('input', { type: 'radio', name: name, id: name + '-' + o.value, value: String(o.value) });
      input.checked = String(value) === String(o.value);
      input.addEventListener('change', () => { if (input.checked) onChange(o.value); });
      return h('label', { for: name + '-' + o.value }, input, h('span', { style: o.style || null }, o.label));
    }));
  }
  function switchRow(id, title, desc, checked, onChange) {
    const input = h('input', { type: 'checkbox', role: 'switch', id: id });
    input.checked = !!checked;
    input.addEventListener('change', () => onChange(input.checked));
    return h('label', { class: 'switch-row', for: id },
      h('span', { class: 'txt' }, h('strong', null, title), desc ? h('span', { style: { color: 'var(--ink-2)', fontSize: 'var(--fs-s)' } }, desc) : null),
      h('span', { class: 'switch' }, input, h('i')));
  }

  function viewSettings() {
    const s = store.settings();
    const page = h('main', { class: 'page' });
    page.appendChild(topbar('Domů', () => go('')));
    page.appendChild(h('h1', { style: { fontSize: 'var(--fs-2xl)', margin: '0.75rem 0 0' } }, 'Nastavení'));
    const box = h('div', { class: 'settings' });

    box.appendChild(h('section', { class: 'setting' },
      h('h2', null, 'Velikost písma'),
      segmented('scale', 'Velikost písma', [
        { value: 1, label: 'Běžné' },
        { value: 2, label: 'Větší' },
        { value: 3, label: 'Největší' }
      ], s.scale || 1, (v) => { store.setSetting('scale', v); applySettings(); }),
      h('p', { class: 'sample-text' }, 'Ukázka: Dobré ráno! Dnes vás čekají čtyři krátké hry.')));

    box.appendChild(h('section', { class: 'setting' },
      h('h2', null, 'Vzhled'),
      segmented('theme', 'Vzhled', [
        { value: 'auto', label: 'Podle zařízení' },
        { value: 'light', label: 'Světlý' },
        { value: 'dark', label: 'Tmavý' }
      ], s.theme || 'auto', (v) => { store.setSetting('theme', v); applySettings(); })));

    box.appendChild(h('section', { class: 'setting' },
      switchRow('set-sound', 'Zvuky', 'Jemné tóny při správné a chybné odpovědi.', s.sound !== false, (v) => {
        store.setSetting('sound', v);
        if (v) sound.correct();
      })));

    if (sound.canSpeak) {
      box.appendChild(h('section', { class: 'setting' },
        switchRow('set-speak', 'Předčítat pokyny', 'Před každou hrou se pokyny přečtou nahlas.', !!s.autoSpeak, (v) => {
          store.setSetting('autoSpeak', v);
          if (v) sound.speak('Pokyny budu předčítat nahlas.');
        })));
    }

    const resetBtn = h('button', { class: 'btn btn-secondary btn-block', type: 'button' }, 'Smazat všechny výsledky');
    resetBtn.addEventListener('click', () => {
      dialog('Smazat všechny výsledky?', 'Smažou se úrovně, body i historie. Nastavení zůstane. Tento krok nejde vrátit.', [
        { label: 'Ponechat výsledky', value: false, kind: 'primary' },
        { label: 'Smazat', value: true, kind: 'danger' }
      ]).then((yes) => {
        if (!yes) return;
        store.reset();
        announce('Výsledky byly smazány.');
        resetBtn.textContent = 'Výsledky jsou smazané';
        resetBtn.disabled = true;
      });
    });
    box.appendChild(h('section', { class: 'setting' },
      h('h2', null, 'Moje data'),
      h('p', null, 'Výsledky se ukládají jen v tomto zařízení. Nikam se neodesílají a nikdo jiný je nevidí.'),
      resetBtn));

    page.appendChild(box);
    setScreen(page);
  }

  /* ---------- O tréninku ---------- */
  function viewAbout() {
    const page = h('main', { class: 'page' });
    page.appendChild(topbar('Domů', () => go('')));
    const p = (t) => h('p', null, t);
    const li = (b, t) => h('li', null, h('strong', null, b), ' ' + t);
    page.appendChild(h('article', { class: 'prose' },
      h('h1', null, 'O tréninku'),
      p('Svěží mysl nabízí krátká cvičení pro paměť, postřeh a rozhodování. Obtížnost se sama přizpůsobuje: když se daří, hry ztěžkou, když ne, uleví. Trénink má být trochu náročný, ale nemá stresovat.'),
      h('h2', null, 'Co jednotlivé oblasti trénují'),
      h('ul', { class: 'domain-legend' },
        h('li', { class: 'dom-pamet' }, h('span', { class: 'dom-dot' }), h('span', null, h('strong', null, 'Paměť: '), 'zapamatovat si obrázky, seznam nebo pořadí a vybavit si je.')),
        h('li', { class: 'dom-postreh' }, h('span', { class: 'dom-dot' }), h('span', null, h('strong', null, 'Postřeh: '), 'rychle zachytit, co se objevilo, i na okraji zorného pole.')),
        h('li', { class: 'dom-rozhodovani' }, h('span', { class: 'dom-dot' }), h('span', null, h('strong', null, 'Rozhodování: '), 'nenechat se zmást, přepínat mezi pravidly a odpovědět včas.'))),
      h('h2', null, 'Jak trénovat'),
      h('ul', null,
        li('Pravidelně:', 'ideálně 10 až 15 minut denně, alespoň pětkrát týdně.'),
        li('V klidu:', 'hrajte, když jste odpočatí, v tichu a s brýlemi na čtení, pokud je nosíte.'),
        li('Bez stresu:', 'chyby k tréninku patří. Důležité je vracet se k němu.')),
      h('h2', null, 'Co mysli pomáhá ještě víc'),
      p('Výzkumy ukazují, že na duševní svěžest ve stáří má velký vliv celý životní styl. Trénink v aplikaci je jen jedna část:'),
      h('ul', null,
        li('Pohyb:', 'každodenní chůze, cvičení nebo práce na zahradě.'),
        li('Lidé kolem vás:', 'rozhovory, návštěvy, spolky, hry s vnoučaty.'),
        li('Sluch a zrak:', 'nechte si je zkontrolovat a používejte naslouchátko nebo brýle, pokud je potřebujete.'),
        li('Zdraví srdce a cév:', 'krevní tlak, cukr a cholesterol pod kontrolou, nekouřit a s alkoholem střídmě.'),
        li('Spánek a nové věci:', 'dostatek spánku a chuť učit se něco nového, třeba jazyk nebo hudební nástroj.')),
      h('div', { class: 'note-box' },
        h('p', null, h('strong', null, 'Upozornění. '), 'Svěží mysl je tréninková aplikace, ne zdravotnický prostředek. Nic nediagnostikuje ani neléčí a nenahrazuje vyšetření. Pokud si vy nebo vaši blízcí všimnete, že se paměť nebo orientace zhoršuje, poraďte se s praktickým lékařem.'),
        h('p', null, 'Všechny výsledky zůstávají jen v tomto zařízení.')),
      h('div', { class: 'intro-actions' },
        h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => go('denni-trenink') }, icon('play'), 'Začít dnešní trénink'),
        h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: () => go('') }, icon('home'), 'Domů'))));
    setScreen(page);
  }

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
    window.addEventListener('hashchange', route);
    document.addEventListener('visibilitychange', () => { if (document.hidden) sound.stopSpeaking(); });
    route();

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
