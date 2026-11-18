/* Svěží mysl — Cesta po Česku: zastávky, lekce, truhly a pohlednice (hlavní obrazovka). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const E = SM.engine;
  const store = SM.store;
  const ui = SM.ui;
  const UNITS = E.UNITS;

  /* ---------- Horní lišta se sérií a denním cílem ---------- */
  function ring(pct) {
    const c = 2 * Math.PI * 15;
    return U.svg('<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" class="ring-track"/><circle cx="18" cy="18" r="15" class="ring-fill" stroke-dasharray="' +
      (c * U.clamp(pct, 0, 1)).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 18 18)"/></svg>', 'ring');
  }
  SM.screens.ring = ring;

  function weekRow() {
    const todayKey = U.dayKey();
    return h('div', { class: 'week is-compact', role: 'list' }, store.lastDays(7).map((d) => h('div', {
      class: 'day' + (d.n ? ' is-on' : d.frozen ? ' is-frozen' : '') + (d.key === todayKey ? ' is-today' : ''), role: 'listitem',
      'aria-label': U.longDate(d.date) + ': ' + (d.n ? 'trénink' : d.frozen ? 'záchranný den' : 'bez tréninku')
    },
    h('span', { class: 'day-dot' }, d.n ? ui.icon('check') : d.frozen ? ui.icon('shield') : null),
    h('span', { class: 'day-name' }, d.key === todayKey ? 'Dnes' : U.weekdayShort(d.date)))));
  }
  SM.screens.weekRow = weekRow;

  function streakInfo() {
    const p = store.profile();
    const s = E.streak();
    ui.modal([
      h('div', { class: 'big-stat' }, ui.icon('flame', 'big-flame'), h('strong', null, String(s))),
      h('h2', { id: 'modal-title' }, s ? s + ' ' + U.plural(s, 'den', 'dny', 'dní') + ' v řadě' : 'Série zatím nezačala'),
      h('p', null, 'Série je počet dní za sebou, kdy si zahrajete alespoň jednu hru.' + (p.bestStreak ? ' Vaše nejdelší série: ' + p.bestStreak + ' ' + U.plural(p.bestStreak, 'den', 'dny', 'dní') + '.' : '')),
      weekRow(),
      h('p', { class: 'freeze-line' }, ui.icon('shield'), h('span', null, h('strong', null, 'Záchranné dny: ' + p.freezes + ' ze ' + E.MAX_FREEZES + '. '),
        'Když jeden den vynecháte, záchranný den vaši sérii podrží. Nový získáte za každých 7 dní v řadě.'))
    ], [{ label: 'Rozumím', value: true, kind: 'primary' }]);
  }
  function goalInfo() {
    const xp = E.xpToday(), goal = E.goal();
    ui.modal([
      h('div', { class: 'big-stat' }, ring(xp / goal), h('strong', null, xp + ' / ' + goal)),
      h('h2', { id: 'modal-title' }, xp >= goal ? 'Denní cíl je splněný' : 'Dnešní cíl: ' + goal + ' bodů'),
      h('p', null, 'Body dostanete za každou hru (5 až 10 podle výkonu), za dokončenou lekci a za truhly na cestě.'),
      h('p', null, xp >= goal ? 'Výborně! Hrát můžete i dál, body se počítají.' : 'Zbývá ' + (goal - xp) + ' bodů, to je asi ' + Math.max(1, Math.round((goal - xp) / 25)) + ' ' + U.plural(Math.max(1, Math.round((goal - xp) / 25)), 'lekce', 'lekce', 'lekcí') + '.')
    ], [
      { label: 'Rozumím', value: 'ok', kind: 'primary' },
      { label: 'Změnit denní cíl', value: 'set', kind: 'secondary' }
    ]).then((v) => { if (v === 'set') ui.go('nastaveni'); });
  }

  SM.screens.statBar = function () {
    const s = E.streak();
    const xp = E.xpToday(), goal = E.goal();
    const lit = E.isActive(U.dayKey());
    return h('div', { class: 'statbar' },
      h('button', { class: 'stat' + (lit ? ' is-lit' : ''), type: 'button', onclick: streakInfo, 'aria-label': 'Série: ' + s + ' ' + U.plural(s, 'den', 'dny', 'dní') + ' v řadě' },
        ui.icon('flame', 'stat-flame'), h('strong', null, String(s)), h('span', null, U.plural(s, 'den', 'dny', 'dní'))),
      h('button', { class: 'stat' + (xp >= goal ? ' is-done' : ''), type: 'button', onclick: goalInfo, 'aria-label': 'Dnes ' + xp + ' z ' + goal + ' bodů' },
        ring(xp / goal), h('strong', null, xp + '/' + goal), h('span', null, 'bodů')),
      riddleStat());
  };
  /* Nadpis stránky s tlačítkem Nastavení vpravo. */
  SM.screens.pageTitle = function (title, text) {
    return h('div', { class: 'path-intro' },
      h('div', { class: 'title-row' }, h('h1', null, title),
        h('button', { class: 'btn btn-quiet head-icon', type: 'button', 'aria-label': 'Nastavení', onclick: () => ui.go('nastaveni') }, ui.icon('sliders'))),
      text ? h('p', null, text) : null);
  };
  /* Žárovka v horní liště: Hádanka dne je vidět, i když je cesta posunutá k aktuální lekci. */
  function riddleStat() {
    if (!SM.riddles) return null;
    const done = !!E.riddleToday().done;
    const label = done ? 'Hádanka dne: dnes vyluštěno' : 'Hádanka dne: čeká na vás';
    return h('button', { class: 'stat stat-riddle' + (done ? ' is-done' : ''), type: 'button', 'aria-label': label, title: label, onclick: () => ui.go('hadanka') },
      ui.icon('bulb'), done ? null : h('span', { class: 'stat-dot', 'aria-hidden': 'true' }));
  };

  function noticeBox() {
    const p = store.profile();
    const n = p.notice;
    if (!n) return null;
    const text = n.type === 'freeze'
      ? 'Minule jste vynechali ' + (n.used === 1 ? 'jeden den' : n.used + ' dny') + ', ale záchranný den vaši sérii udržel (' + n.streak + ' ' + U.plural(n.streak, 'den', 'dny', 'dní') + ').'
      : 'Vaše série ' + n.streak + ' ' + U.plural(n.streak, 'dne', 'dnů', 'dní') + ' se přerušila. Nevadí, dnes můžete začít novou.';
    const box = h('aside', { class: 'notice' + (n.type === 'freeze' ? ' is-freeze' : '') },
      ui.icon(n.type === 'freeze' ? 'shield' : 'sprout'), h('p', null, text),
      h('button', { class: 'btn btn-secondary btn-small', type: 'button', onclick: () => { p.notice = null; store.save(); box.remove(); } }, 'Rozumím'));
    return box;
  }

  /* ---------- Cesta ---------- */
  const OFFS = [0, 1, 1.6, 1, 0, -1];
  function nodeLabel(node) {
    if (node.type === 'chest') return 'Truhla';
    if (node.type === 'postcard') return 'Pohlednice';
    return 'Lekce ' + (node.k + 1);
  }

  function viewPath() {
    const pos = E.position();
    const page = h('main', { class: 'page path-page' });
    page.appendChild(SM.screens.statBar());
    const note = noticeBox();
    if (note) page.appendChild(note);
    const doneCount = Object.keys(store.profile().done).length;
    page.appendChild(SM.screens.pageTitle('Cesta po Česku', E.finished() ? 'Celou cestu máte za sebou. Výborně!' :
      'Zastávka ' + (pos.u + 1) + ' z ' + UNITS.length + ': ' + UNITS[pos.u].name + '. Za každou zastávku získáte pohlednici.'));
    if (SM.screens.riddleCard) page.appendChild(SM.screens.riddleCard());
    const school = SM.screens.schoolCard ? SM.screens.schoolCard() : null;
    if (school) page.appendChild(school);

    let currentEl = null;
    UNITS.forEach((unit, u) => {
      const reached = u <= pos.u;
      const owned = !!store.profile().postcards[unit.id];
      const names = unit.intro.map((id) => SM.games[id].name);
      const sec = h('section', { class: 'unit' + (reached ? '' : ' is-locked'), style: { '--unit': unit.color }, 'aria-label': 'Zastávka ' + (u + 1) + ': ' + unit.name });
      sec.appendChild(h('div', { class: 'unit-head' },
        h('div', { class: 'unit-txt' },
          h('span', { class: 'unit-eyebrow' }, 'Zastávka ' + (u + 1)),
          h('h2', null, unit.name),
          h('p', null, names.length ? 'Nové hry: ' + names.join(', ') : 'Opakování a procvičování')),
        owned
          ? h('button', { class: 'unit-card', type: 'button', 'aria-label': 'Pohlednice ' + unit.name, onclick: () => SM.screens.postcardModal(u), html: SM.places.scene(unit.id) })
          : h('span', { class: 'unit-card is-empty', 'aria-hidden': 'true' }, ui.icon(reached ? 'postcard' : 'lock'))));
      const list = h('ol', { class: 'nodes' });
      E.nodes(u).forEach((node) => {
        const state = E.nodeState(u, node.n);
        const label = nodeLabel(node);
        const ic = state === 'locked' ? (node.type === 'lesson' ? 'lock' : node.type) : node.type === 'lesson' ? (state === 'done' ? 'check' : 'star') : node.type;
        const off = OFFS[node.n] * (u % 2 ? -1 : 1);
        const btn = h('button', {
          class: 'node is-' + node.type + ' is-' + state, type: 'button',
          'aria-label': label + (state === 'done' ? ', hotovo' : state === 'locked' ? ', zamčeno' : ', na řadě'),
          onclick: () => openNode(node, state)
        }, ui.icon(ic));
        const li = h('li', { class: 'node-wrap', style: { '--x': off } },
          state === 'current' ? h('span', { class: 'node-bubble' }, doneCount ? 'Pokračujte' : 'Začněte zde') : null,
          btn, h('span', { class: 'node-label' }, label));
        if (state === 'current') currentEl = li;
        list.appendChild(li);
      });
      sec.appendChild(list);
      page.appendChild(sec);
    });

    const fin = E.finished();
    const finale = h('section', { class: 'finale' + (fin ? '' : ' is-locked') },
      ui.icon(fin ? 'trophy' : 'lock'),
      h('h2', null, fin ? 'Cíl cesty' : 'Cíl cesty'),
      h('p', null, fin ? 'Gratulujeme, prošli jste celou cestu! Dál můžete hrát volné lekce, které se pokaždé sestaví z vašich her.' :
        'Až projdete všech ' + UNITS.length + ' zastávek, budete mít celou sbírku pohlednic.'),
      fin ? h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => SM.screens.lesson({ games: E.practicePlan(), kind: 'practice', title: 'Volná lekce' }) }, ui.icon('play'), 'Volná lekce') : null);
    page.appendChild(finale);
    if (!SM.embedded && U.isIOS() && !U.isStandalone() && !U.inFrame() && !store.flag('installHintHidden')) {
      const hint = h('aside', { class: 'hint', 'aria-label': 'Tip' },
        h('p', null, h('strong', null, 'Tip: '), 'Přidejte si Svěží mysl na plochu. V Safari klepněte na tlačítko Sdílet (čtvereček se šipkou nahoru) a vyberte „Přidat na plochu“. Aplikace pak funguje i bez internetu a výsledky zůstanou uložené.'),
        h('button', { class: 'btn btn-secondary btn-small', type: 'button', onclick: () => { store.setFlag('installHintHidden', true); hint.remove(); } }, 'Rozumím'));
      page.appendChild(hint);
    }
    ui.setScreen(page, { tab: 'cesta' });
    if (currentEl) {
      const bar = document.querySelector('.tabbar');
      const r = currentEl.getBoundingClientRect();
      if (r.bottom > window.innerHeight - (bar ? bar.offsetHeight : 0) - 12) {
        try { currentEl.scrollIntoView({ block: 'center' }); } catch (e) { currentEl.scrollIntoView(); }
      }
    }
  }
  ui.views[''] = viewPath;
  SM.screens.path = viewPath;

  /* ---------- Otevření uzlu ---------- */
  function openNode(node, state) {
    const unit = UNITS[node.u];
    if (state === 'locked') {
      ui.dialog('Tady ještě nejste', 'Tato část cesty se odemkne, až dokončíte předchozí lekce.', [{ label: 'Rozumím', value: true, kind: 'primary' }]);
      return;
    }
    if (node.type === 'chest') {
      if (state === 'done') {
        ui.dialog('Truhla je prázdná', 'Tuhle truhlu jste už otevřeli. Další čeká o kus dál na cestě.', [{ label: 'Rozumím', value: true, kind: 'primary' }]);
        return;
      }
      ui.modal([
        h('div', { class: 'big-stat is-chest' }, ui.icon('chest')),
        h('h2', { id: 'modal-title' }, 'Truhla s odměnou'),
        h('p', null, 'Za snahu na cestě na vás čeká ' + E.CHEST_XP + ' bodů navíc.')
      ], [{ label: 'Otevřít truhlu', value: true, kind: 'primary', big: true }, { label: 'Zpět', value: false }], { sheet: true }).then((v) => {
        if (!v) return;
        const snap = E.begin();
        const sum = E.finish(snap, { kind: 'chest', u: node.u, n: node.n });
        SM.sound.levelUp();
        SM.screens.reward({ title: 'Truhla otevřena!', icon: 'chest', summary: sum });
      });
      return;
    }
    const attempt = store.profile().done[E.nodeKey(node.u, node.n)] || 0;
    const plan = E.lessonPlan(node.u, node.n, attempt);
    const title = node.type === 'postcard' ? 'Závěrečná lekce' : 'Lekce ' + (node.k + 1);
    const content = [
      h('p', { class: 'sheet-eyebrow' }, 'Zastávka ' + (node.u + 1) + ' · ' + unit.name),
      h('h2', { id: 'modal-title' }, title),
      h('ul', { class: 'sheet-games' }, plan.map((id) => {
        const g = SM.games[id];
        const isNew = !store.game(id).plays;
        return h('li', null, ui.tile(id), h('span', { class: 'sg-txt' },
          h('strong', null, g.name, isNew ? h('span', { class: 'tag-new' }, 'Nová hra') : null), h('span', null, g.short)));
      })),
      h('p', { class: 'sheet-meta' }, plan.length + ' ' + U.plural(plan.length, 'hra', 'hry', 'her') + ' · asi ' + (plan.length * 2) + ' minut · až ' + (plan.length * 10 + 10) + ' bodů')
    ];
    if (node.type === 'postcard') {
      content.push(h('div', { class: 'sheet-reward' },
        h('span', { class: 'mini-card', html: SM.places.scene(unit.id) }),
        h('p', null, state === 'done' ? 'Pohlednici z tohoto místa už máte ve sbírce.' : 'Odměna: pohlednice ' + unit.name + ' do vaší sbírky.')));
    }
    ui.modal(content, [
      { label: state === 'done' ? 'Zopakovat lekci' : 'Začít lekci', value: true, kind: 'primary', big: true, icon: 'play' },
      { label: 'Zpět', value: false }
    ], { sheet: true }).then((v) => {
      if (v) SM.screens.lesson({ games: plan, kind: 'lesson', u: node.u, n: node.n, title: title });
    });
  }
})();
