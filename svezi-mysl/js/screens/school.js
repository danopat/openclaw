/* Svěží mysl — Škola paměti: karta na Cestě, přehled triků (#skola) a lekce jednoho triku (#trik-<id>). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const E = SM.engine;
  const ui = SM.ui;
  const S = SM.school;

  const STEPS = ['Jak na to', 'Ukázka', 'Vyzkoušejte si', 'Do života'];

  /* Karta na Cestě: jen když čeká nový trik. */
  SM.screens.schoolCard = function () {
    const open = S.LIST.find((t) => E.trickState(t.id) === 'open');
    if (!open) return null;
    const done = E.tricksDone();
    return h('aside', { class: 'riddle-card school-card' },
      ui.icon('cap'),
      h('div', { class: 'riddle-card-body' },
        h('p', { class: 'riddle-card-title' }, 'Škola paměti'),
        h('p', { class: 'riddle-card-text' }, (done ? 'Další trik' : 'Krátké lekce o paměťových tricích. První trik') + ': ' + open.title + '.')),
      h('button', { class: 'btn btn-small btn-primary', type: 'button', onclick: () => ui.go('trik-' + open.id) }, 'Otevřít'));
  };

  function viewSchool() {
    const page = h('main', { class: 'page school-page' });
    page.appendChild(ui.topbar('Cesta', () => ui.go('')));
    page.appendChild(h('div', { class: 'path-intro' },
      h('h1', null, 'Škola paměti'),
      h('p', null, 'Krátké lekce o paměťových tricích, každá asi na dvě minuty. Triky se dají naučit v každém věku.')));
    const list = h('ol', { class: 'trick-list' });
    S.LIST.forEach((t, i) => {
      const st = E.trickState(t.id);
      const btn = st === 'locked' ? null : h('button', { class: 'btn btn-small ' + (st === 'open' ? 'btn-primary' : 'btn-secondary'), type: 'button', onclick: () => ui.go('trik-' + t.id) }, st === 'open' ? 'Začít' : 'Zopakovat');
      list.appendChild(h('li', { class: 'trick-row is-' + st, 'data-id': t.id },
        h('span', { class: 'trick-no', 'aria-hidden': 'true' }, st === 'done' ? ui.icon('check') : st === 'locked' ? ui.icon('lock') : String(i + 1)),
        h('div', { class: 'trick-text' },
          h('p', { class: 'trick-title' }, (i + 1) + '. ' + t.title),
          h('p', { class: 'trick-sub' }, st === 'locked' ? 'Odemkne se po předchozím triku.' : st === 'done' ? 'Hotovo. ' + t.short : t.short)),
        btn));
    });
    page.appendChild(list);
    page.appendChild(h('p', { class: 'muted-note school-note' },
      'Ve velké americké studii ACTIVE se lidem nad 65 let po nácviku paměťových strategií zlepšily výsledky v paměťových úlohách a rozdíl byl měřitelný ještě po pěti letech. Že by to chránilo před demencí, se ale neprokázalo.'));
    ui.setScreen(page, { tab: 'cesta' });
  }

  /* Lekce jednoho triku ve čtyřech krocích. */
  SM.screens.trick = function (id) {
    const t = S.byId(id);
    if (!t || E.trickState(id) === 'locked') { ui.go('skola'); return; }
    const no = S.LIST.indexOf(t) + 1;
    let step = 0;
    let good = 0;
    const page = h('main', { class: 'page trick-page', 'data-id': id });
    page.appendChild(ui.topbar('Škola paměti', () => ui.go('skola')));
    const bar = h('div', { class: 'lesson-bar trick-bar', role: 'img' });
    const body = h('div', { class: 'trick-body', 'aria-live': 'polite' });
    page.appendChild(bar);
    page.appendChild(body);
    ui.setScreen(page, { tab: 'cesta' });
    render();

    function next(label, fn, quiet) {
      return h('button', { class: 'btn btn-lg btn-block ' + (quiet ? 'btn-secondary' : 'btn-primary'), type: 'button', onclick: fn }, label);
    }
    function go(s) {
      step = s;
      render();
      window.scrollTo(0, 0);
    }
    function render() {
      ui.clearNode(bar);
      STEPS.forEach((_, k) => bar.appendChild(h('span', { class: k < step ? 'is-done' : k === step ? 'is-now' : '' })));
      bar.setAttribute('aria-label', 'Krok ' + (step + 1) + ' ze ' + STEPS.length + ': ' + STEPS[step]);
      ui.clearNode(body);
      body.dataset.step = step;
      if (step === 0) explain();
      else if (step === 1) example();
      else if (step === 2) study();
      else task();
    }
    function head(sub) {
      body.appendChild(h('p', { class: 'trick-kicker' }, 'Trik ' + no + ' · ' + STEPS[step]));
      body.appendChild(h('h1', null, sub || t.title));
    }
    function explain() {
      head();
      body.appendChild(h('div', { class: 'trick-pic', 'aria-hidden': 'true' }, h('span', null, t.pic)));
      t.explain.forEach((p) => body.appendChild(h('p', { class: 'trick-p' }, p)));
      body.appendChild(next('Ukázka', () => go(1)));
    }
    function example() {
      head('Ukázka');
      body.appendChild(h('div', { class: 'trick-example' }, t.example));
      if (SM.sound.canSpeak) body.appendChild(h('button', { class: 'btn btn-quiet btn-small', type: 'button', onclick: () => SM.sound.speak(t.example) }, ui.icon('speaker'), 'Přečíst nahlas'));
      body.appendChild(next('Vyzkoušet', () => go(2)));
    }
    function study() {
      head('Vyzkoušejte si');
      body.appendChild(h('p', { class: 'trick-p' }, t.study.title));
      const list = h('ul', { class: 'trick-items' }, t.study.items.map((it) => h('li', null,
        h('span', { class: 'emo', 'aria-hidden': 'true' }, it[0]),
        h('span', { class: 'trick-item-text' }, h('b', null, it[1]), it[2] ? h('span', null, it[2]) : null))));
      body.appendChild(list);
      if (t.study.word) body.appendChild(h('p', { class: 'trick-word' }, t.study.word));
      body.appendChild(next('Mám zapamatováno', () => quiz(0)));
    }
    function quiz(k) {
      const q = t.questions[k];
      ui.clearNode(body);
      body.dataset.step = 'q' + k;
      body.appendChild(h('p', { class: 'trick-kicker' }, 'Trik ' + no + ' · otázka ' + (k + 1) + ' z ' + t.questions.length));
      if (q.pic) body.appendChild(h('div', { class: 'trick-pic is-face', 'aria-hidden': 'true' }, h('span', null, q.pic)));
      body.appendChild(h('h1', { class: 'trick-q' }, q.q));
      const answer = q.opts[0];
      const opts = h('div', { class: 'choices is-col trick-opts', role: 'group', 'aria-label': 'Možnosti odpovědi' });
      const after = h('div', { class: 'trick-after' });
      let locked = false;
      U.shuffle(q.opts).forEach((o) => {
        const b = h('button', { class: 'btn choice', type: 'button', 'data-v': o }, o);
        b.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const ok = o === answer;
          if (ok) good++;
          opts.classList.add('is-locked');
          Array.from(opts.children).forEach((x) => {
            if (x.getAttribute('data-v') === answer) x.classList.add('is-correct');
            else if (x === b) x.classList.add('is-wrong');
          });
          if (ok) SM.sound.correct(); else SM.sound.wrong();
          after.appendChild(h('p', { class: 'riddle-verdict' + (ok ? ' is-ok' : '') }, ui.icon(ok ? 'check' : 'info'), ok ? 'Správně!' : 'Správně je: ' + answer));
          after.appendChild(next(k + 1 < t.questions.length ? 'Další otázka' : 'Pokračovat', () => (k + 1 < t.questions.length ? quiz(k + 1) : go(3))));
          try { after.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { after.scrollIntoView(); }
        });
        opts.appendChild(b);
      });
      body.appendChild(opts);
      body.appendChild(after);
    }
    function task() {
      head('Do života');
      body.appendChild(h('p', { class: 'trick-score' }, 'V procvičení: ' + good + ' z ' + t.questions.length + ' správně.'));
      body.appendChild(h('div', { class: 'trick-example is-task' }, t.task));
      const g = SM.games[t.game];
      body.appendChild(next('Hotovo', () => {
        const sum = E.finishTrick(E.begin(), t.id);
        const big = sum.events.filter((e) => e.type === 'badge' || e.type === 'freeze' || e.type === 'streak');
        const back = () => ui.go('skola');
        if (big.length) SM.screens.celebrate(big, back); else back();
      }));
      if (g) body.appendChild(next('Procvičit ve hře ' + g.name, () => { E.finishTrick(E.begin(), t.id); ui.go('hra-' + g.id); }, true));
    }
  };

  ui.views.skola = viewSchool;
})();
