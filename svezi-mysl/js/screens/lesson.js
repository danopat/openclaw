/* Svěží mysl — průběh lekce (několik miniher za sebou), souhrn a oslavy úspěchů. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const E = SM.engine;
  const store = SM.store;
  const ui = SM.ui;
  const fx = () => SM.fx;

  function lessonBar(i, total) {
    return h('div', { class: 'lesson-bar', role: 'img', 'aria-label': 'Hra ' + Math.min(i + 1, total) + ' z ' + total },
      Array.from({ length: total }, (_, k) => h('span', { class: k < i ? 'is-done' : k === i ? 'is-now' : '' })));
  }

  /**
   * Lekce: spec = { games: [id], kind: 'lesson'|'practice', u, n, title }
   */
  SM.screens.lesson = function (spec) {
    const snap = E.begin();
    const results = [];
    const total = spec.games.length;

    const quit = () => {
      if (results.length) E.finish(snap, { kind: 'partial', results: results });
      ui.go(spec.back || '');
    };

    function gate(i, prev) {
      const id = spec.games[i];
      const g = SM.games[id];
      const st = store.game(id);
      const first = !store.profile().seen[id] && !st.plays;
      const level = U.clamp(st.level || 1, 1, g.maxLevel);
      const steps = ui.howTo(g, level, { short: true });
      const page = h('main', { class: 'page gate' });
      page.appendChild(h('div', { class: 'gate-top' },
        h('button', { class: 'btn btn-quiet', type: 'button', 'aria-label': 'Ukončit lekci', onclick: () => {
          ui.dialog('Ukončit lekci?', results.length ? 'Dohrané hry se započítají, lekce ale zůstane nedokončená.' : 'Lekci můžete začít znovu kdykoli.', [
            { label: 'Pokračovat v lekci', value: false, kind: 'primary' },
            { label: 'Ukončit lekci', value: true }
          ]).then((v) => { if (v) quit(); });
        } }, ui.icon('close')),
        lessonBar(i, total)));

      if (prev) {
        const pg = SM.games[prev.id];
        page.appendChild(h('section', { class: 'gate-prev' },
          h('p', { class: 'gate-eyebrow' }, 'Hotovo: ' + pg.name),
          h('p', { class: 'gate-result' }, h('strong', null, prev.res.big), ' ', prev.res.bigLabel),
          h('p', { class: 'gate-chips' },
            h('span', { class: 'xp-chip' }, SM.ui.icon('star'), '+' + prev.xp + ' bodů'),
            prev.isBest ? h('span', { class: 'xp-chip is-record' }, 'Nový rekord') : null,
            prev.newLevel > prev.level ? h('span', { class: 'xp-chip is-up' }, 'Příště úroveň ' + prev.newLevel) : null)));
      }

      const intro = h('section', { class: 'gate-next' },
        h('p', { class: 'gate-eyebrow' }, (prev ? 'Další hra' : spec.title || 'Lekce') + ' · hra ' + (i + 1) + ' ze ' + total),
        h('div', { class: 'gate-game' }, ui.tile(id), h('div', null,
          h('h1', null, g.name),
          first ? h('span', { class: 'tag-new' }, 'Nová hra') : h('span', { class: 'gate-level' }, 'Úroveň ' + level + ' z ' + g.maxLevel))),
        h('p', { class: 'gate-rule' }, g.short));
      if (first) {
        intro.appendChild(h('ol', { class: 'howto' }, steps.map((s) => h('li', null, h('span', null, s)))));
      } else {
        intro.appendChild(h('details', { class: 'gate-more' }, h('summary', null, 'Připomenout pravidla'),
          h('ol', { class: 'howto' }, steps.map((s) => h('li', null, h('span', null, s))))));
      }
      page.appendChild(intro);
      const speakText = g.name + '. ' + steps.join(' ');
      page.appendChild(h('div', { class: 'intro-actions' },
        h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => play(i) }, ui.icon('play'), 'Začít hru'),
        SM.sound.canSpeak ? h('button', { class: 'btn btn-secondary btn-block', type: 'button', onclick: () => SM.sound.speak(speakText) }, ui.icon('speaker'), 'Přečíst nahlas') : null));
      ui.setScreen(page);
      if (store.settings().autoSpeak && first) SM.sound.speak(speakText);
    }

    function play(i) {
      const id = spec.games[i];
      store.profile().seen[id] = true;
      store.save();
      ui.runGame(id, {
        short: true,
        lesson: { i: i, total: total },
        onDone: (meta) => {
          results.push(meta);
          if (i + 1 < total) gate(i + 1, meta);
          else done();
        },
        onExit: quit
      });
    }

    function done() {
      const sum = E.finish(snap, { kind: spec.kind || 'lesson', u: spec.u, n: spec.n, results: results });
      summary(sum);
    }

    function summary(sum) {
      const page = h('main', { class: 'page summary' });
      const xpEl = h('span', { class: 'summary-xp-num' }, '+' + sum.xp);
      const streakEv = sum.events.find((e) => e.type === 'streak');
      const goalPct = sum.xpToday / sum.goal;
      page.appendChild(h('section', { class: 'summary-top' },
        h('div', { class: 'result-badge' }, ui.icon('star')),
        h('h1', null, spec.kind === 'practice' ? 'Procvičování dokončeno!' : 'Lekce dokončena!'),
        h('p', { class: 'summary-xp' }, xpEl, ' bodů'),
        h('p', { class: 'gate-chips' }, sum.parts.map((p) => h('span', { class: 'xp-chip' }, p.label + ' +' + p.xp)))));
      page.appendChild(h('div', { class: 'summary-tiles' },
        h('div', { class: 'sum-tile' + (streakEv ? ' is-lit' : '') }, ui.icon('flame', 'stat-flame'),
          h('strong', null, sum.streak + ' ' + U.plural(sum.streak, 'den', 'dny', 'dní')),
          h('span', null, streakEv ? 'Série prodloužena' : 'v řadě')),
        h('div', { class: 'sum-tile' + (goalPct >= 1 ? ' is-done' : '') }, SM.screens.ring(goalPct),
          h('strong', null, sum.xpToday + ' / ' + sum.goal),
          h('span', null, goalPct >= 1 ? 'Denní cíl splněn' : 'bodů k dennímu cíli'))));
      page.appendChild(h('ul', { class: 'summary-games' }, results.map((r) => h('li', null,
        ui.tile(r.id),
        h('span', { class: 'sg-txt' }, h('strong', null, SM.games[r.id].name), h('span', null, r.res.big + ' ' + r.res.bigLabel)),
        h('span', { class: 'sg-xp' }, '+' + r.xp)))));
      page.appendChild(h('div', { class: 'intro-actions' },
        h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => SM.screens.celebrate(sum.events, () => ui.go(spec.back || '')) }, 'Pokračovat')));
      ui.setScreen(page);
      SM.sound.levelUp();
      fx().confetti();
      fx().countUp(xpEl, sum.xp, '+');
    }

    gate(0, null);
  };

  /* ---------- Odměna (truhla) ---------- */
  SM.screens.reward = function (o) {
    const page = h('main', { class: 'page summary' });
    const xpEl = h('span', { class: 'summary-xp-num' }, '+' + o.summary.xp);
    page.appendChild(h('section', { class: 'summary-top' },
      h('div', { class: 'result-badge is-chest' }, ui.icon(o.icon || 'chest')),
      h('h1', null, o.title),
      h('p', { class: 'summary-xp' }, xpEl, ' bodů')));
    page.appendChild(h('div', { class: 'intro-actions' },
      h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => SM.screens.celebrate(o.summary.events, () => ui.go('')) }, 'Pokračovat')));
    ui.setScreen(page);
    fx().confetti();
    fx().countUp(xpEl, o.summary.xp, '+');
  };

  /* ---------- Oslavy: série, cíl, pohlednice, nové hry, odznaky ---------- */
  const ORDER = ['streak', 'goal', 'postcard', 'unlock', 'freeze', 'badge', 'finale'];
  SM.screens.celebrate = function (events, next) {
    const list = events.slice().sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
    let i = 0;
    const step = () => {
      if (i >= list.length) { next(); return; }
      show(list[i++], step);
    };
    step();
  };

  function show(ev, next) {
    const page = h('main', { class: 'page celebrate is-' + ev.type });
    let confetti = false;
    const add = (...n) => n.forEach((x) => { if (x) page.appendChild(x); });
    if (ev.type === 'streak') {
      const num = h('strong', null, String(ev.to));
      add(h('div', { class: 'cel-visual is-flame' }, ui.icon('flame', 'big-flame'), num),
        h('h1', null, ev.to === 1 ? 'Začala nová série!' : ev.to + ' ' + U.plural(ev.to, 'den', 'dny', 'dní') + ' v řadě!'),
        h('p', null, ev.to === 1 ? 'Zahrajte si i zítra a série poroste.' : 'Výborně, trénujete pravidelně. Tak dál!'),
        SM.screens.weekRow());
      fx().countUp(num, ev.to, '', ev.from);
    } else if (ev.type === 'goal') {
      confetti = true;
      add(h('div', { class: 'cel-visual is-goal' }, SM.screens.ring(1), ui.icon('check', 'cel-check')),
        h('h1', null, 'Denní cíl splněn!'),
        h('p', null, 'Dnes jste získali ' + E.xpToday() + ' bodů. Hrát můžete i dál, nebo si odpočiňte.'));
    } else if (ev.type === 'postcard') {
      confetti = true;
      const unit = E.UNITS[ev.u];
      add(h('p', { class: 'cel-eyebrow' }, 'Zastávka ' + (ev.u + 1) + ' je za vámi'),
        h('h1', null, 'Nová pohlednice!'),
        SM.screens.postcard(ev.u, true),
        h('p', null, 'Najdete ji ve Sbírce.'));
      SM.sound.speak && store.settings().autoSpeak && SM.sound.speak(unit.name + '. ' + unit.fact);
    } else if (ev.type === 'unlock') {
      const unit = E.UNITS[ev.u];
      add(h('p', { class: 'cel-eyebrow' }, 'Další zastávka: ' + unit.name),
        h('h1', null, ev.games.length === 1 ? 'Nová hra odemčena' : 'Nové hry odemčeny'),
        h('ul', { class: 'summary-games' }, ev.games.map((id) => h('li', null, ui.tile(id),
          h('span', { class: 'sg-txt' }, h('strong', null, SM.games[id].name, h('span', { class: 'tag-new' }, 'Nová')), h('span', null, SM.games[id].short))))),
        h('p', null, 'Potkáte je v lekcích na další zastávce. Zahrát si je můžete i hned v kartě Hry.'));
    } else if (ev.type === 'freeze') {
      add(h('div', { class: 'cel-visual is-freeze' }, ui.icon('shield')),
        h('h1', null, 'Získali jste záchranný den'),
        h('p', null, 'Za ' + ev.streak + ' dní v řadě. Když někdy jeden den vynecháte, záchranný den vaši sérii podrží.'));
    } else if (ev.type === 'badge') {
      confetti = true;
      const b = E.BADGES.find((x) => x.id === ev.id);
      add(h('p', { class: 'cel-eyebrow' }, 'Nový odznak'),
        SM.screens.medal(b, ev.tier, true),
        h('h1', null, b.name + (ev.tier > 1 ? ' · ' + ev.tier + '. stupeň' : '')),
        h('p', null, b.text(b.tiers[ev.tier - 1]).replace(/\.$/, '') + ': splněno!'));
    } else if (ev.type === 'finale') {
      confetti = true;
      add(h('div', { class: 'cel-visual is-finale' }, ui.icon('trophy')),
        h('h1', null, 'Prošli jste celou cestu!'),
        h('p', null, 'Máte pohlednice ze všech ' + E.UNITS.length + ' zastávek. Gratulujeme! Hrát můžete dál ve volných lekcích.'));
    }
    add(h('div', { class: 'intro-actions' }, h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: next }, 'Pokračovat')));
    ui.setScreen(page);
    if (confetti) { fx().confetti(); SM.sound.done(); }
  }
})();
