/* Svěží mysl — Hádanka dne: karta na Cestě a obrazovka s jednou hádankou na den (bez časového limitu). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const E = SM.engine;
  const ui = SM.ui;

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function picture(svg, cls) {
    const box = h('div', { class: 'riddle-pic' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true' });
    box.innerHTML = svg;
    return box;
  }

  /* Karta na obrazovce Cesta. */
  SM.screens.riddleCard = function () {
    const t = E.riddleToday();
    const d = t.done;
    return h('aside', { class: 'riddle-card' + (d ? ' is-done' : '') },
      ui.icon(d ? 'check' : 'bulb'),
      h('div', { class: 'riddle-card-body' },
        h('p', { class: 'riddle-card-title' }, 'Hádanka dne'),
        h('p', { class: 'riddle-card-text' }, d
          ? (d.ok ? 'Dnešní hádanku máte vyluštěnou. Zítra bude další.' : 'Dnešní hádanka je za vámi. Zítra bude další.')
          : 'Krátká hádanka na dnešek, bez spěchu. Za odpověď až 10 bodů.')),
      h('button', { class: 'btn btn-small ' + (d ? 'btn-secondary' : 'btn-primary'), type: 'button', onclick: () => ui.go('hadanka') }, d ? 'Ukázat' : 'Luštit'));
  };

  function viewRiddle() {
    const t = E.riddleToday();
    const r = t.r;
    const page = h('main', { class: 'page riddle-page' });
    page.appendChild(ui.topbar('Cesta', () => ui.go('')));
    page.appendChild(h('div', { class: 'path-intro' },
      h('h1', null, 'Hádanka dne'),
      h('p', null, cap(U.longDate()) + ' · ' + r.tag + ' · ' + r.diff)));
    const card = h('section', { class: 'riddle', 'data-id': r.id },
      h('p', { class: 'riddle-q' }, r.q),
      r.pic ? picture(r.pic) : null,
      SM.sound.canSpeak ? h('button', { class: 'btn btn-quiet btn-small riddle-speak', type: 'button', onclick: () => SM.sound.speak(r.q) }, ui.icon('speaker'), 'Přečíst nahlas') : null);
    page.appendChild(card);

    const opts = h('div', { class: 'choices is-col riddle-opts', role: 'group', 'aria-label': 'Možnosti odpovědi' });
    const after = h('div', { class: 'riddle-after', 'aria-live': 'polite' });
    let locked = false;
    const buttons = r.opts.map((o) => {
      const b = h('button', { class: 'btn choice', type: 'button', 'data-v': o }, o);
      b.addEventListener('click', () => {
        if (locked) return;
        const ok = o === r.a;
        const snap = E.begin();
        const sum = E.answerRiddle(snap, r, ok, o);
        if (ok) SM.sound.correct(); else SM.sound.wrong();
        reveal(o, ok, sum);
      });
      opts.appendChild(b);
      return b;
    });
    page.appendChild(opts);
    page.appendChild(after);
    if (t.done) reveal(t.done.v, t.done.ok, null);
    ui.setScreen(page, { tab: 'cesta' });

    /* Ukáže správnou odpověď, vysvětlení a body. sum = výsledek E.finish (jen hned po odpovědi). */
    function reveal(choice, ok, sum) {
      locked = true;
      opts.classList.add('is-locked');
      buttons.forEach((b) => {
        const v = b.getAttribute('data-v');
        if (v === r.a) b.classList.add('is-correct');
        else if (v === choice) b.classList.add('is-wrong');
        b.setAttribute('aria-disabled', 'true');
      });
      ui.clearNode(after);
      after.appendChild(h('h2', { class: 'riddle-verdict' + (ok ? ' is-ok' : '') }, ui.icon(ok ? 'check' : 'info'), ok ? 'Správně!' : 'Tentokrát ne. Správně je: ' + r.a));
      after.appendChild(h('div', { class: 'riddle-why' }, h('p', null, r.why), r.whyPic ? picture(r.whyPic, 'is-solution') : null));
      const big = sum ? sum.events.filter((e) => e.type === 'badge' || e.type === 'freeze') : [];
      if (sum) {
        after.appendChild(h('p', { class: 'gate-chips' },
          h('span', { class: 'xp-chip' }, ui.icon('star'), '+' + sum.xp + ' bodů'),
          sum.events.some((e) => e.type === 'goal') ? h('span', { class: 'xp-chip is-up' }, ui.icon('target'), 'Denní cíl splněn') : null));
        ui.announce((ok ? 'Správně. ' : 'Správně je ' + r.a + '. ') + r.why);
      } else {
        after.appendChild(h('p', { class: 'muted-note' }, 'Další hádanka bude zítra.'));
      }
      const back = () => ui.go('');
      after.appendChild(h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => (big.length ? SM.screens.celebrate(big, back) : back()) }, 'Zpět na cestu'));
    }
  }
  ui.views.hadanka = viewRiddle;
})();
