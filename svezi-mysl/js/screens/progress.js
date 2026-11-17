/* Svěží mysl — Pokrok: série, body za týden, výsledky jednotlivých her. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const E = SM.engine;
  const store = SM.store;
  const ui = SM.ui;
  const clearNode = ui.clearNode;

  /* Sloupcový graf bodů za posledních 7 dní s čarou denního cíle (HTML, aby text zůstal ostrý). */
  function xpChart(days, goal) {
    const max = Math.max(goal, Math.max.apply(null, days.map((d) => d.xp)));
    const top = Math.ceil((max * 1.1) / 10) * 10;
    const todayKey = U.dayKey();
    const best = Math.max.apply(null, days.map((d) => d.xp));
    const read = h('p', { class: 'xc-read', 'aria-live': 'polite' }, 'Klepněte na sloupec pro podrobnosti.');
    const cols = days.map((d) => {
      const isToday = d.key === todayKey;
      const label = U.longDate(d.date) + ': ' + d.xp + ' bodů' + (d.xp >= goal ? ', cíl splněn' : '');
      const showVal = d.xp > 0 && (isToday || d.xp === best);
      const col = h('button', { class: 'xc-col' + (isToday ? ' is-today' : ''), type: 'button', 'aria-label': label, title: label },
        h('span', { class: 'xc-bar', style: { height: ((d.xp / top) * 100).toFixed(1) + '%' } },
          showVal ? h('span', { class: 'xc-val' }, String(d.xp)) : null));
      col.addEventListener('click', () => { read.textContent = label; });
      return col;
    });
    return h('figure', { class: 'xpchart' },
      h('div', { class: 'xc-plot' },
        h('div', { class: 'xc-goal', style: { bottom: ((goal / top) * 100).toFixed(1) + '%' } }, h('span', null, 'cíl ' + goal)),
        cols),
      h('div', { class: 'xc-axis', 'aria-hidden': 'true' }, days.map((d) => h('span', { class: d.key === todayKey ? 'is-today' : '' }, d.key === todayKey ? 'Dnes' : U.weekdayShort(d.date)))),
      read,
      h('details', { class: 'table-details' }, h('summary', null, 'Zobrazit jako tabulku'),
        h('div', { class: 'table-wrap' }, h('table', { class: 'hist' },
          h('thead', null, h('tr', null, h('th', null, 'Den'), h('th', null, 'Body'), h('th', null, 'Her'), h('th', null, 'Cíl'))),
          h('tbody', null, days.map((d) => h('tr', null,
            h('td', null, U.weekdayShort(d.date) + ' ' + U.shortDate(d.date)), h('td', null, String(d.xp)), h('td', null, String(d.n)),
            h('td', null, d.xp >= goal ? 'splněn' : d.frozen ? 'záchranný den' : '–'))))))));
  }


  /* ---------- Úspěšnost a rychlost ---------- */
  const ST = SM.stats;
  const plHry = (n) => U.plural(n, 'hra', 'hry', 'her');

  /* Šipka a slovo: lepší/horší, nebo zhruba stejně. words = [lepší, horší]. */
  function trendChip(dir, words) {
    if (!dir) return null;
    const txt = dir === 'up' ? words[0] : dir === 'down' ? words[1] : 'zhruba stejně';
    return h('span', { class: 'trend-chip is-' + dir }, dir === 'same' ? null : ui.icon(dir === 'up' ? 'trendUp' : 'trendDown'), txt);
  }
  const speedWords = (id) => (ST.pace(id) && ST.pace(id).ms ? ['kratší', 'delší'] : ['rychlejší', 'pomalejší']);

  function gameCard(id) {
    const g = SM.games[id];
    const st = store.game(id);
    const s = ST.summary(id);
    const c = s.compare;
    const stat = (label, value, chip) => h('div', { class: 'gp-stat' },
      h('span', { class: 'gp-stat-label' }, label), h('strong', { class: 'gp-stat-value' }, value), chip);
    const since = (w) => [w[0] + ' než na začátku', w[1] + ' než na začátku'];
    return h('li', { class: 'gp' },
      h('div', { class: 'gp-head' }, ui.tile(id),
        h('div', null, h('div', { class: 'gp-title' }, g.name), h('div', { class: 'gp-sub' }, 'Hráno ' + st.plays + '× · ' + ui.domain(g.domain).name))),
      h('div', { class: 'gp-meter' },
        h('div', { class: 'meter', role: 'meter', 'aria-valuemin': '1', 'aria-valuemax': String(g.maxLevel), 'aria-valuenow': String(st.level), 'aria-label': 'Úroveň' },
          h('i', { style: { width: ((st.level / g.maxLevel) * 100).toFixed(1) + '%' } })),
        h('span', { class: 'meter-label' }, 'Úroveň ' + st.level + ' z ' + g.maxLevel)),
      h('div', { class: 'gp-stats' },
        stat('Úspěšnost', ST.fmtAcc(s.accNow), c ? trendChip(ST.accTrend(c.accStart, c.accEnd), since(['lepší', 'horší'])) : null),
        ST.pace(id) && s.rtNow != null ? stat(ST.speedTitle(id), ST.fmtRt(id, s.rtNow, true),
          c ? trendChip(ST.rtTrend(c.rtStart, c.rtEnd), since(speedWords(id))) : null) : null),
      h('button', { class: 'btn btn-secondary btn-block gp-more', type: 'button', onclick: () => ui.go('pokrok-' + id) },
        h('span', null, 'Vývoj v čase'), ui.icon('chevron')));
  }

  function segmented(name, label, options, value, onChange) {
    return h('div', { class: 'seg trend-seg', role: 'radiogroup', 'aria-label': label }, options.map((o) => {
      const input = h('input', { type: 'radio', name: name, id: name + '-' + o.value, value: String(o.value) });
      input.checked = String(value) === String(o.value);
      input.addEventListener('change', () => { if (input.checked) onChange(o.value); });
      return h('label', { for: name + '-' + o.value }, input, h('span', null, o.label));
    }));
  }

  /* Pěkná horní mez osy rychlosti. */
  function niceTop(maxMs, ms) {
    const steps = ms ? [100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000] : [500, 1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 15000, 20000, 30000, 45000, 60000, 90000, 120000];
    for (let i = 0; i < steps.length; i++) if (steps[i] >= maxMs * 1.08) return steps[i];
    return Math.ceil((maxMs * 1.1) / 60000) * 60000;
  }

  /* Spojnicový graf jedné veličiny v čase (jedna řada, bez legendy; hodnota se ukáže po klepnutí). */
  function trendChart(id, metric, days) {
    const g = SM.games[id];
    const ser = ST.series(id, metric, days);
    const pts = ser.points;
    const fig = h('figure', { class: 'tchart dom-' + g.domain });
    if (!pts.length) {
      fig.appendChild(h('p', { class: 'tc-empty' }, days ? 'Za posledních ' + days + ' dní tu nejsou žádné výsledky.' : 'Zatím tu nejsou žádné výsledky.'));
      return fig;
    }
    let yMin, yMax, ticks, fmt, name;
    if (metric === 'acc') {
      yMin = 0; yMax = 100; ticks = [0, 50, 100]; fmt = (v) => ST.fmtAcc(v); name = 'Úspěšnost';
    } else if (metric === 'lv') {
      yMin = 1; yMax = Math.max(2, g.maxLevel); name = 'Úroveň';
      ticks = [];
      const step = g.maxLevel > 8 ? 2 : 1;
      for (let v = 1; v <= yMax; v += step) ticks.push(v);
      fmt = (v) => 'úroveň ' + v;
    } else {
      const pace = ST.pace(id) || {};
      yMin = 0; yMax = niceTop(Math.max.apply(null, pts.map((p) => p.v)), pace.ms); ticks = [0, yMax / 2, yMax];
      fmt = (v) => ST.fmtRt(id, v); name = ST.speedTitle(id);
    }
    const W = 320, H = 160, PX = 14, PT = 16, PB = 14;
    const n = pts.length;
    let xs;
    if (ser.mode === 'day') {
      const d0 = pts[0].day, d1 = pts[n - 1].day;
      xs = pts.map((p) => (d1 === d0 ? W / 2 : PX + ((p.day - d0) / (d1 - d0)) * (W - 2 * PX)));
    } else xs = pts.map((p, i) => (n === 1 ? W / 2 : PX + (i / (n - 1)) * (W - 2 * PX)));
    const y = (v) => PT + (1 - (v - yMin) / (yMax - yMin)) * (H - PT - PB);
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', name + (ser.mode === 'day' ? ' po dnech' : ' po jednotlivých hrách') + ': ' +
      (n === 1 ? fmt(pts[0].v) : 'na začátku ' + fmt(pts[0].v) + ', naposledy ' + fmt(pts[n - 1].v)) + '. Všechny hodnoty jsou v tabulce pod grafem.');
    const mk = (tag, attrs) => {
      const el = document.createElementNS(ns, tag);
      Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
      svg.appendChild(el);
      return el;
    };
    ticks.forEach((t) => mk('line', { class: 'grid-line', x1: 0, x2: W, y1: y(t), y2: y(t), 'vector-effect': 'non-scaling-stroke' }));
    if (n > 1) mk('polyline', { class: 'tline', points: pts.map((p, i) => xs[i].toFixed(1) + ',' + y(p.v).toFixed(1)).join(' '), 'vector-effect': 'non-scaling-stroke' });
    const cursor = mk('line', { class: 'cursor', x1: 0, x2: 0, y1: 0, y2: H, 'vector-effect': 'non-scaling-stroke', visibility: 'hidden' });
    // Popisky osy y v levém okraji, aby nepřekrývaly body grafu.
    const tickText = ticks.map((t) => (metric === 'lv' ? String(t) : fmt(t)));
    const axis = h('div', { class: 'tc-axis', 'aria-hidden': 'true', style: { width: (Math.max.apply(null, tickText.map((t) => t.length)) * 0.62 + 0.2).toFixed(2) + 'em' } },
      ticks.map((t, i) => h('span', { class: 'tc-tick', style: { top: y(t).toFixed(1) + 'px' } }, tickText[i])));
    const area = h('div', { class: 'tc-area' }, svg);
    const plot = h('div', { class: 'tc-plot' }, axis, area);
    const place = (el, i) => { el.style.left = 'calc(' + ((xs[i] / W) * 100).toFixed(2) + '% - 6px)'; el.style.top = (y(pts[i].v) - 6).toFixed(1) + 'px'; };
    const showDots = n <= 20;
    pts.forEach((p, i) => {
      if (!showDots && i !== n - 1) return;
      const d = h('span', { class: 'tc-dot' });
      place(d, i);
      area.appendChild(d);
    });
    const hot = h('span', { class: 'tc-dot is-hot' });
    hot.hidden = true;
    area.appendChild(hot);
    const label = (p) => (ser.mode === 'day'
      ? U.shortDate(p.date) + ': ' + fmt(p.v) + ' (' + p.n + ' ' + plHry(p.n) + ')'
      : p.idx + '. hra, ' + U.shortDate(p.date) + ': ' + fmt(p.v));
    const read = h('p', { class: 'tc-read', 'aria-live': 'polite' });
    const idle = () => { U.append(read, ['Naposledy: ', h('strong', null, label(pts[n - 1]))]); };
    idle();
    const show = (clientX) => {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const x = ((clientX - r.left) / r.width) * W;
      let best = 0;
      xs.forEach((v, i) => { if (Math.abs(v - x) < Math.abs(xs[best] - x)) best = i; });
      cursor.setAttribute('x1', xs[best]);
      cursor.setAttribute('x2', xs[best]);
      cursor.setAttribute('visibility', 'visible');
      place(hot, best);
      hot.hidden = false;
      clearNode(read);
      read.appendChild(h('strong', null, label(pts[best])));
    };
    const hide = () => {
      cursor.setAttribute('visibility', 'hidden');
      hot.hidden = true;
      clearNode(read);
      idle();
    };
    area.addEventListener('pointermove', (e) => show(e.clientX));
    area.addEventListener('pointerdown', (e) => show(e.clientX));
    area.addEventListener('pointerleave', hide);
    area.appendChild(h('div', { class: 'tc-x', 'aria-hidden': 'true' },
      h('span', null, U.shortDate(pts[0].date)), n > 1 ? h('span', null, U.shortDate(pts[n - 1].date)) : null));
    fig.appendChild(plot);
    fig.appendChild(read);
    const notes = {
      acc: 'Hra se přizpůsobuje: když se daří, přidá obtížnost. Úspěšnost se proto drží spíš stejně a zlepšení poznáte hlavně podle vyšší úrovně.',
      rt: ST.pace(id) && ST.pace(id).ms ? 'Čím níž čára vede, tím kratší doba vám stačí.' : 'Čím níž čára vede, tím rychleji odpovídáte.',
      lv: 'Vyšší úroveň znamená těžší úlohy.'
    };
    fig.appendChild(h('figcaption', { class: 'tc-note' }, notes[metric] + (ser.mode === 'day' ? ' Jeden bod je jeden den.' : ' Jeden bod je jedna hra.')));
    return fig;
  }

  function viewGameProgress(id) {
    const g = SM.games[id];
    const s = ST.summary(id);
    const pace = ST.pace(id);
    const page = h('main', { class: 'page game-progress' });
    page.appendChild(ui.topbar('Pokrok', () => ui.go('pokrok')));
    page.appendChild(h('div', { class: 'gpd-head' }, ui.tile(id),
      h('div', null, h('h1', null, g.name), h('p', { class: 'gp-sub' }, ui.domain(g.domain).name + (s.n ? ' · hráno ' + s.n + '×' : '')))));
    if (!s.n) {
      page.appendChild(h('div', { class: 'empty' }, h('p', null, 'Tahle hra zatím nemá žádné výsledky. Po první hře tu uvidíte úspěšnost' + (pace ? ' a rychlost' : '') + '.')));
      page.appendChild(h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => ui.go('hra-' + id) }, ui.icon('play'), 'Zahrát si'));
      ui.setScreen(page, { tab: 'pokrok' });
      return;
    }
    const kpi = (label, value, sub) => h('div', { class: 'kpi' }, h('span', { class: 'kpi-label' }, label), h('span', { class: 'kpi-value' }, value), h('span', { class: 'kpi-sub' }, sub));
    const kpis = [
      kpi('Úroveň', s.level + ' z ' + g.maxLevel, 'na začátku ' + s.levelStart),
      kpi('Úspěšnost', ST.fmtAcc(s.accNow), s.recent === 1 ? 'poslední hra' : 'posledních ' + s.recent + ' ' + plHry(s.recent))
    ];
    if (pace && s.rtNow != null) kpis.push(kpi(ST.speedTitle(id), ST.fmtRt(id, s.rtNow), pace.per || 'méně je lépe'));
    page.appendChild(h('div', { class: 'kpis' + (kpis.length === 2 ? ' is-two' : '') }, kpis));

    page.appendChild(h('h2', { class: 'section-title' }, 'Na začátku a teď'));
    if (s.compare) {
      const c = s.compare;
      const row = (label, a, b, dir, words) => h('div', { class: 'cmp-row' },
        h('span', { class: 'cmp-label' }, label), h('span', { class: 'cmp-values' }, a + ' → ' + b), trendChip(dir, words));
      const rows = [
        row('Úroveň', String(s.levelStart), String(s.level), s.level > s.levelStart ? 'up' : s.level < s.levelStart ? 'down' : 'same', ['vyšší', 'nižší']),
        row('Úspěšnost', ST.fmtAcc(c.accStart), ST.fmtAcc(c.accEnd), ST.accTrend(c.accStart, c.accEnd), ['lepší', 'horší'])
      ];
      if (pace && c.rtStart != null && c.rtEnd != null) rows.push(row(ST.speedTitle(id), ST.fmtRt(id, c.rtStart), ST.fmtRt(id, c.rtEnd), ST.rtTrend(c.rtStart, c.rtEnd), speedWords(id)));
      page.appendChild(h('div', { class: 'cmp' }, rows));
      page.appendChild(h('p', { class: 'muted-note' }, 'Srovnání prvních ' + c.k + ' a posledních ' + c.k + ' her. Úroveň je ta, na které teď hrajete.'));
    } else {
      page.appendChild(h('p', { class: 'muted-note' }, 'Po čtyřech hrách tu uvidíte, jak se vám daří ve srovnání se začátkem.'));
    }

    page.appendChild(h('h2', { class: 'section-title' }, 'Vývoj v čase'));
    const metrics = [{ value: 'acc', label: 'Úspěšnost' }];
    if (pace) metrics.push({ value: 'rt', label: pace.short || ST.speedTitle(id) });
    metrics.push({ value: 'lv', label: 'Úroveň' });
    let metric = 'acc';
    let days = 30;
    const box = h('div', { class: 'trend-box' });
    const render = () => { clearNode(box); box.appendChild(trendChart(id, metric, days)); };
    page.appendChild(segmented('metrika', 'Co zobrazit', metrics, metric, (v) => { metric = v; render(); }));
    page.appendChild(segmented('obdobi', 'Období', [{ value: '30', label: '30 dní' }, { value: 'vse', label: 'Celou dobu' }], '30',
      (v) => { days = v === 'vse' ? null : 30; render(); }));
    page.appendChild(box);
    render();

    const rows = store.history(id).slice(-60).reverse();
    page.appendChild(h('details', { class: 'table-details' },
      h('summary', null, 'Všechny výsledky v tabulce (' + rows.length + ')'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'hist' },
        h('thead', null, h('tr', null, h('th', null, 'Datum'), h('th', null, 'Úroveň'), h('th', null, 'Úspěšnost'), pace ? h('th', null, ST.speedTitle(id)) : null)),
        h('tbody', null, rows.map((r) => {
          const rt = ST.rt(r);
          return h('tr', null, h('td', null, U.shortDate(new Date(r.t))), h('td', null, String(r.lv)), h('td', null, ST.fmtAcc(ST.acc(r))),
            pace ? h('td', null, rt != null ? ST.fmtRt(id, rt) : '–') : null);
        }))))));
    page.appendChild(h('button', { class: 'btn btn-primary btn-lg btn-block gpd-play', type: 'button', onclick: () => ui.go('hra-' + id) }, ui.icon('play'), 'Zahrát si'));
    ui.setScreen(page, { tab: 'pokrok' });
  }
  SM.screens.gameProgress = viewGameProgress;

  function viewProgress() {
    const p = store.profile();
    const page = h('main', { class: 'page' });
    page.appendChild(h('div', { class: 'path-intro' }, h('h1', null, 'Můj pokrok')));
    const streak = E.streak();
    page.appendChild(h('div', { class: 'kpis' },
      h('div', { class: 'kpi' }, h('span', { class: 'kpi-label' }, 'Série'), h('span', { class: 'kpi-value' }, streak + ' ' + U.plural(streak, 'den', 'dny', 'dní')),
        h('span', { class: 'kpi-sub' }, 'nejdelší ' + (p.bestStreak || 0) + ' · záchranné dny ' + p.freezes + '/' + E.MAX_FREEZES)),
      h('div', { class: 'kpi' }, h('span', { class: 'kpi-label' }, 'Body celkem'), h('span', { class: 'kpi-value' }, (p.xp || 0).toLocaleString('cs-CZ')),
        h('span', { class: 'kpi-sub' }, 'dnes ' + E.xpToday() + ' z ' + E.goal())),
      h('div', { class: 'kpi' }, h('span', { class: 'kpi-label' }, 'Lekce'), h('span', { class: 'kpi-value' }, String(p.lessons || 0)),
        h('span', { class: 'kpi-sub' }, (p.perfect || 0) + ' bez chyby'))));

    page.appendChild(h('h2', { class: 'section-title' }, 'Body za posledních 7 dní'));
    page.appendChild(xpChart(store.lastDays(7), E.goal()));

    page.appendChild(h('h2', { class: 'section-title' }, 'Hry'));
    const played = Object.keys(SM.games).filter((id) => store.game(id).plays > 0);
    if (!played.length) {
      page.appendChild(h('div', { class: 'empty' }, h('p', null, 'Zatím tu nejsou žádné výsledky. Objeví se po první lekci.')));
    }
    const list = h('ul', { class: 'gp-list' });
    played.sort((a, b) => store.game(b).last - store.game(a).last).forEach((id) => list.appendChild(gameCard(id)));
    page.appendChild(list);
    const unplayed = Object.keys(SM.games).filter((id) => !store.game(id).plays);
    if (unplayed.length && played.length) {
      page.appendChild(h('p', { class: 'muted-note' }, 'Zatím nehrané: ' + unplayed.map((id) => SM.games[id].name).join(', ') + '.'));
    }
    page.appendChild(h('p', { class: 'muted-note' }, 'Úspěšnost a rychlost jsou z posledních 5 her. Výsledky jsou uložené jen v tomto zařízení.'));
    page.appendChild(h('div', { class: 'link-row' },
      h('button', { class: 'btn nav-btn', type: 'button', onclick: () => ui.go('nastaveni') }, ui.icon('sliders'), 'Nastavení'),
      h('button', { class: 'btn nav-btn', type: 'button', onclick: () => ui.go('o-treninku') }, ui.icon('info'), 'O tréninku')));
    ui.setScreen(page, { tab: 'pokrok' });
  }
  ui.views.pokrok = viewProgress;
})();
