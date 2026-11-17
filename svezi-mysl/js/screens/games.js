/* Svěží mysl — karta Hry: volné hraní, procvičování, úvod ke hře a výsledek hry. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const E = SM.engine;
  const store = SM.store;
  const ui = SM.ui;

  const byDomain = (d) => Object.keys(SM.games).filter((id) => SM.games[id].domain === d)
    .sort((a, b) => E.introUnit(a) - E.introUnit(b));

  function viewGames() {
    const page = h('main', { class: 'page' });
    page.appendChild(SM.screens.statBar());
    const total = Object.keys(SM.games).length;
    const open = E.unlockedGames().length;
    page.appendChild(h('div', { class: 'path-intro' },
      h('h1', null, 'Hry'),
      h('p', null, open < total ? 'Odemčeno ' + open + ' z ' + total + ' her. Další přibývají na cestě po Česku.' : 'Všech ' + total + ' her je odemčeno. Hrajte, co vás baví.')));

    page.appendChild(h('section', { class: 'practice' },
      h('div', null,
        h('h2', null, 'Procvičování'),
        h('p', null, 'Tři hry, které jste hráli nejméně. Asi 6 minut.')),
      h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => {
        SM.screens.lesson({ games: E.practicePlan(), kind: 'practice', title: 'Procvičování', back: 'hry' });
      } }, ui.icon('bolt'), 'Procvičit')));

    ui.DOMAINS.forEach((dm) => {
      const ids = byDomain(dm.id);
      if (!ids.length) return;
      page.appendChild(h('h2', { class: 'section-title' }, h('span', { class: 'dom-dot dom-' + dm.id }), dm.name, h('small', null, dm.desc)));
      const ul = h('ul', { class: 'game-list' });
      ids.forEach((id) => {
        const g = SM.games[id];
        const st = store.game(id);
        const locked = !E.isUnlocked(id);
        const unit = E.UNITS[E.introUnit(id)];
        ul.appendChild(h('li', null, h('button', { class: 'game-row' + (locked ? ' is-locked' : ''), type: 'button', onclick: () => ui.go('hra-' + id) },
          locked ? h('span', { class: 'tile is-locked' }, ui.icon('lock')) : ui.tile(id),
          h('span', { class: 'txt' },
            h('span', { class: 'name' }, g.name),
            h('span', { class: 'sub' }, g.short),
            h('span', { class: 'sub' }, locked ? 'Odemkne se na zastávce ' + unit.name : st.plays ? 'Úroveň ' + st.level + ' z ' + g.maxLevel + ' · hráno ' + st.plays + '×' : 'Zatím nehráno')),
          !locked && !st.plays ? h('span', { class: 'tag-new' }, 'Nová') : ui.icon('chevron', 'chev'))));
      });
      page.appendChild(ul);
    });
    ui.setScreen(page, { tab: 'hry' });
  }
  ui.views.hry = viewGames;

  /* ---------- Úvod ke hře (volné hraní) ---------- */
  SM.screens.gameIntro = function (id) {
    const g = SM.games[id];
    const st = store.game(id);
    const level = U.clamp(st.level || 1, 1, g.maxLevel);
    const steps = ui.howTo(g, level);
    const locked = !E.isUnlocked(id);
    const page = h('main', { class: 'page intro' });
    page.appendChild(ui.topbar('Hry', () => ui.go('hry')));
    page.appendChild(h('div', { class: 'intro-hero' }, ui.tile(id), h('div', null,
      h('h1', null, g.name), h('p', { class: 'trains' }, 'Trénuje ' + g.trains + '.'))));
    page.appendChild(h('div', { class: 'pills' },
      h('span', { class: 'pill dom-' + g.domain }, h('span', { class: 'dom-dot' }), ui.domain(g.domain).name),
      h('span', { class: 'pill' }, 'Úroveň ' + level + ' z ' + g.maxLevel),
      h('span', { class: 'pill' }, g.duration || 'asi 2 minuty')));
    page.appendChild(h('h2', null, 'Jak se hraje'));
    page.appendChild(h('ol', { class: 'howto' }, steps.map((s) => h('li', null, h('span', null, s)))));
    const speakText = g.name + '. ' + steps.join(' ');
    const actions = h('div', { class: 'intro-actions' });
    if (locked) {
      const unit = E.UNITS[E.introUnit(id)];
      actions.appendChild(h('p', { class: 'lock-note' }, ui.icon('lock'), h('span', null, 'Tato hra se odemkne na zastávce ' + unit.name + '. Můžete ji ale odemknout hned.')));
      actions.appendChild(h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => {
        E.unlockEarly(id);
        SM.screens.gameIntro(id);
      } }, ui.icon('lock'), 'Odemknout hned'));
    } else {
      actions.appendChild(h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => play(id) }, ui.icon('play'), 'Začít hru'));
    }
    if (SM.sound.canSpeak) actions.appendChild(h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: () => SM.sound.speak(speakText) }, ui.icon('speaker'), 'Přečíst pokyny nahlas'));
    page.appendChild(actions);
    ui.setScreen(page);
    if (!locked && store.settings().autoSpeak) SM.sound.speak(speakText);
  };

  function play(id) {
    const snap = E.begin();
    store.profile().seen[id] = true;
    store.save();
    ui.runGame(id, {
      onDone: (meta) => result(id, meta, E.finish(snap, { kind: 'free', results: [meta] })),
      onExit: () => SM.screens.gameIntro(id)
    });
  }

  /* ---------- Výsledek volné hry ---------- */
  function result(id, meta, sum) {
    const g = SM.games[id];
    const res = meta.res;
    const perf = meta.perf;
    const praise = perf >= 0.85 ? 'Výborně!' : perf >= 0.6 ? 'Skvělá práce!' : perf >= 0.3 ? 'Dobrá práce!' : 'Děkujeme za trénink!';
    let levelText;
    if (meta.newLevel > meta.level) levelText = 'Postupujete na úroveň ' + meta.newLevel + ' z ' + g.maxLevel + '.';
    else if (meta.newLevel < meta.level) levelText = 'Příště to bude o kousek lehčí (úroveň ' + meta.newLevel + ').';
    else if (meta.level === g.maxLevel && perf >= 0.6) levelText = 'Hrajete na nejvyšší úrovni. Klobouk dolů!';
    else levelText = 'Příště zůstáváte na úrovni ' + meta.newLevel + '.';
    const chips = [];
    sum.events.forEach((e) => {
      if (e.type === 'streak') chips.push(h('span', { class: 'xp-chip is-up' }, ui.icon('flame'), 'Série: ' + e.to + ' ' + U.plural(e.to, 'den', 'dny', 'dní')));
      if (e.type === 'goal') chips.push(h('span', { class: 'xp-chip is-up' }, ui.icon('target'), 'Denní cíl splněn'));
    });
    const big = sum.events.filter((e) => e.type === 'badge' || e.type === 'freeze');

    const page = h('main', { class: 'page' });
    const box = h('section', { class: 'result' },
      h('div', { class: 'result-badge' }, ui.icon('star')),
      h('h1', null, praise),
      h('p', { class: 'result-figure' }, h('span', { class: 'result-big' }, res.big), h('span', { class: 'result-big-label' }, res.bigLabel)),
      res.details && res.details.length ? h('ul', { class: 'result-details' }, res.details.map((d) => h('li', null, d))) : null,
      h('p', { class: 'gate-chips' },
        h('span', { class: 'xp-chip' }, ui.icon('star'), '+' + sum.xp + ' bodů'),
        meta.isBest ? h('span', { class: 'xp-chip is-record' }, 'Nový osobní rekord') : null,
        chips),
      h('p', { class: 'goal-line' }, SM.screens.ring(sum.xpToday / sum.goal), 'Dnes ' + sum.xpToday + ' z ' + sum.goal + ' bodů'),
      h('p', { class: 'level-note' + (meta.newLevel > meta.level ? ' is-up' : '') }, levelText));
    const after = (fn) => () => (big.length ? SM.screens.celebrate(big, fn) : fn());
    box.appendChild(h('div', { class: 'result-actions' },
      h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: after(() => play(id)) }, ui.icon('replay'), 'Hrát znovu'),
      h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: after(() => ui.go('hry')) }, ui.icon('grid'), 'Zpět na hry')));
    page.appendChild(box);
    ui.setScreen(page);
    if (meta.newLevel > meta.level) SM.sound.levelUp(); else SM.sound.done();
    ui.announce(praise + ' ' + res.big + ' ' + res.bigLabel + '. ' + levelText);
  }
})();
