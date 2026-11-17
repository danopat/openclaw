/* Svítící okna — zopakovat pořadí rozsvícených oken (pracovní paměť, obdoba Corsiho kostek). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  function gridFor(level) {
    if (level <= 4) return { cols: 3, rows: 3 };
    if (level <= 6) return { cols: 4, rows: 3 };
    return { cols: 4, rows: 4 };
  }

  SM.registerGame({
    id: 'okna',
    name: 'Svítící okna',
    domain: 'pamet',
    trains: 'pracovní paměť a zapamatování pořadí',
    short: 'Zopakujte, v jakém pořadí se rozsvítila okna.',
    duration: 'asi 2 minuty',
    maxLevel: 8,
    howTo: [
      'Je večer a v domě se jedno po druhém rozsvěcují okna.',
      'Sledujte, v jakém pořadí se rozsvítí. Každé okno zazní svým tónem.',
      'Potom klepněte na okna ve stejném pořadí.',
      'Když se to povede, další řada bude o jedno okno delší.'
    ],

    async run(ctx) {
      const ROUNDS = ctx.short ? 5 : 8;
      const startSpan = ctx.level + 1;
      const grid = gridFor(ctx.level);
      const N = grid.cols * grid.rows;
      const onMs = ctx.level <= 4 ? 700 : 600;
      const offMs = ctx.level <= 4 ? 300 : 250;
      let span = startSpan, maxOk = 0, okRounds = 0;
      let expect = null;
      const flashTimers = {};

      const scene = h('div', { class: 'okna-scene is-watching' });
      const moon = h('div', { class: 'okna-moon', 'aria-hidden': 'true' });
      const house = h('div', { class: 'house' });
      const facade = h('div', { class: 'facade', style: { '--cols': grid.cols } });
      const wins = [];
      for (let i = 0; i < N; i++) {
        const w = h('button', { class: 'win', type: 'button', 'aria-label': 'Okno ' + (i + 1) });
        U.tap(w, () => onTap(i));
        facade.appendChild(w);
        wins.push(w);
      }
      house.appendChild(h('div', { class: 'roof', 'aria-hidden': 'true' }));
      house.appendChild(facade);
      scene.appendChild(moon);
      scene.appendChild(house);
      ctx.stage.appendChild(scene);

      const layout = () => {
        const sz = ctx.size();
        const winW = (0.74 - (grid.cols - 1) * 0.045) / grid.cols;
        const ratio = 0.26 + 0.14 + grid.rows * winW * 1.25 + (grid.rows - 1) * 0.045;
        const hw = Math.floor(Math.min(sz.w * 0.86, (sz.h - 24) / ratio, 520));
        scene.style.setProperty('--hw', hw + 'px');
        moon.hidden = sz.w - hw < 150;
      };
      layout();
      ctx.on(window, 'resize', layout);

      const lit = (i, on) => wins[i].classList.toggle('is-lit', on);
      const flash = (i) => {
        clearTimeout(flashTimers[i]);
        lit(i, true);
        flashTimers[i] = ctx.after(260, () => lit(i, false));
      };

      function onTap(i) {
        if (!expect || !ctx.alive) return;
        const want = expect.seq[expect.pos];
        if (i === want) {
          flash(i);
          ctx.sound.note(i);
          expect.pos++;
          if (expect.pos === expect.seq.length) { const r = expect.resolve; expect = null; r(true); }
        } else {
          wins[i].classList.add('is-wrong');
          ctx.after(600, () => wins[i].classList.remove('is-wrong'));
          const r = expect.resolve;
          expect = null;
          r(false);
        }
      }
      const collect = (seq) => new Promise((resolve) => { expect = { seq: seq, pos: 0, resolve: resolve }; });

      const all = [];
      for (let i = 0; i < N; i++) all.push(i);

      for (let r = 0; r < ROUNDS; r++) {
        ctx.progress('Kolo ' + (r + 1) + ' z ' + ROUNDS);
        const len = Math.min(span, N);
        const seq = U.sample(all, len);
        scene.classList.add('is-watching');
        ctx.status('Dívejte se: ' + len + ' ' + U.plural(len, 'okno', 'okna', 'oken') + '.');
        await ctx.sleep(1000);
        for (const i of seq) {
          lit(i, true);
          ctx.sound.note(i);
          await ctx.sleep(onMs);
          lit(i, false);
          await ctx.sleep(offMs);
        }
        scene.classList.remove('is-watching');
        ctx.status('Teď vy: klepněte na okna ve stejném pořadí.');
        const ok = await collect(seq);
        scene.classList.add('is-watching');
        if (ok) {
          okRounds++;
          maxOk = Math.max(maxOk, len);
          span = Math.min(span + 1, N);
          ctx.feedback(true);
          ctx.status('Výborně!');
          await ctx.sleep(1100);
        } else {
          span = Math.max(2, span - 1);
          ctx.feedback(false);
          ctx.status('Správné pořadí bylo takto:');
          await ctx.sleep(500);
          seq.forEach((i, k) => {
            wins[i].classList.add('is-shown');
            wins[i].appendChild(h('span', { class: 'num', 'aria-hidden': 'true' }, String(k + 1)));
          });
          await ctx.sleep(2200);
          seq.forEach((i) => {
            wins[i].classList.remove('is-shown');
            const num = wins[i].querySelector('.num');
            if (num) wins[i].removeChild(num);
          });
          await ctx.sleep(400);
        }
      }

      ctx.finish({
        perf: okRounds / ROUNDS,
        levelDelta: maxOk >= startSpan + 1 ? 1 : maxOk < startSpan ? -1 : 0,
        big: String(maxOk),
        bigLabel: 'nejdelší správně zopakovaná řada oken',
        details: ['Povedlo se: ' + okRounds + ' z ' + ROUNDS + ' kol'],
        metric: { maxSpan: maxOk, ok: okRounds }
      });
    }
  });
})();
