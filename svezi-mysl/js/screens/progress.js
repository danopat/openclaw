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

  /* Malý graf vývoje skóre jedné hry (posledních max. 12 výsledků). */
  function sparkline(entries) {
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
    svg.setAttribute('aria-label', 'Vývoj skóre v posledních ' + n + ' hrách: od ' + vals[0] + ' do ' + vals[n - 1] + ', nejvíce ' + best + '.');
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
    const dot = (i) => h('span', {
      class: 'spark-dot',
      style: { left: 'calc(' + ((x(i) / W) * 100).toFixed(2) + '% - 6px)', top: 'calc(' + ((y(vals[i]) / H) * 64).toFixed(1) + 'px - 6px)' }
    });
    const endDot = dot(n - 1);
    const hover = dot(n - 1);
    hover.hidden = true;
    plot.appendChild(endDot);
    plot.appendChild(hover);
    wrap.appendChild(plot);
    const fmt = (e) => U.shortDate(new Date(e.t)) + ': skóre ' + e.p;
    const left = h('span', null, 'Naposledy: ', h('strong', null, String(vals[n - 1])));
    wrap.appendChild(h('div', { class: 'spark-read' }, left, h('span', null, 'Rekord: ', h('strong', null, String(best)))));
    const show = (clientX) => {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      let i = n === 1 ? 0 : Math.round(((((clientX - r.left) / r.width) * W - padX) / (W - 2 * padX)) * (n - 1));
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
      left.appendChild(h('strong', null, String(vals[n - 1])));
    };
    svg.addEventListener('pointermove', (e) => show(e.clientX));
    svg.addEventListener('pointerdown', (e) => show(e.clientX));
    svg.addEventListener('pointerleave', hide);
    svg.addEventListener('pointercancel', hide);
    return wrap;
  }

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
      page.appendChild(h('div', { class: 'empty' }, h('p', null, 'Zatím jste nehráli žádnou hru. Výsledky se tu objeví po první lekci.')));
    }
    const list = h('ul', { class: 'gp-list' });
    played.sort((a, b) => store.game(b).last - store.game(a).last).forEach((id) => {
      const g = SM.games[id];
      const st = store.game(id);
      const hist = store.history(id);
      const card = h('li', { class: 'gp' },
        h('div', { class: 'gp-head' }, ui.tile(id),
          h('div', null, h('div', { class: 'gp-title' }, g.name), h('div', { class: 'gp-sub' }, 'Hráno ' + st.plays + '× · ' + ui.domain(g.domain).name))),
        h('div', { class: 'gp-meter' },
          h('div', { class: 'meter', role: 'meter', 'aria-valuemin': '1', 'aria-valuemax': String(g.maxLevel), 'aria-valuenow': String(st.level), 'aria-label': 'Úroveň' },
            h('i', { style: { width: ((st.level / g.maxLevel) * 100).toFixed(1) + '%' } })),
          h('span', { class: 'meter-label' }, 'Úroveň ' + st.level + ' z ' + g.maxLevel)));
      if (hist.length >= 2) card.appendChild(sparkline(hist.slice(-12)));
      const rows = hist.slice(-10).reverse();
      card.appendChild(h('details', null,
        h('summary', null, 'Posledních ' + rows.length + ' ' + U.plural(rows.length, 'výsledek', 'výsledky', 'výsledků')),
        h('div', { class: 'table-wrap' }, h('table', { class: 'hist' },
          h('thead', null, h('tr', null, h('th', null, 'Datum'), h('th', null, 'Úroveň'), h('th', null, 'Skóre'), h('th', null, 'Body'), h('th', null, 'Délka'))),
          h('tbody', null, rows.map((r) => h('tr', null,
            h('td', null, U.shortDate(new Date(r.t))), h('td', null, String(r.lv)), h('td', null, String(r.p)),
            h('td', null, r.xp != null ? '+' + r.xp : '–'), h('td', null, U.fmtTime(r.ms)))))))));
      list.appendChild(card);
    });
    page.appendChild(list);
    const unplayed = Object.keys(SM.games).filter((id) => !store.game(id).plays);
    if (unplayed.length && played.length) {
      page.appendChild(h('p', { class: 'muted-note' }, 'Zatím nehrané: ' + unplayed.map((id) => SM.games[id].name).join(', ') + '.'));
    }
    page.appendChild(h('p', { class: 'muted-note' }, 'Skóre hry: každá úroveň přidává 10 a dalších až 10 získáte za výkon v ní. Výsledky jsou uložené jen v tomto zařízení.'));
    page.appendChild(h('div', { class: 'link-row' },
      h('button', { class: 'btn nav-btn', type: 'button', onclick: () => ui.go('nastaveni') }, ui.icon('sliders'), 'Nastavení'),
      h('button', { class: 'btn nav-btn', type: 'button', onclick: () => ui.go('o-treninku') }, ui.icon('info'), 'O tréninku')));
    ui.setScreen(page, { tab: 'pokrok' });
  }
  ui.views.pokrok = viewProgress;
})();
