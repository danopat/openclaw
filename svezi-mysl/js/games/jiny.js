/* Jeden je jiný — zrakové vyhledávání (postřeh, pozornost, rychlost). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const PAIRS = {
    easy: [['🍎', '🍌'], ['🐶', '🐟'], ['🌻', '🚗'], ['⚽', '🎈'], ['🌲', '🐱'], ['☕', '🌙'], ['🐘', '🍓'], ['⭐', '🍄'], ['🏠', '🐢'], ['🔔', '🍇']],
    medium: [['🍎', '🍅'], ['🐟', '🐠'], ['🌸', '🌼'], ['🚗', '🚕'], ['🍋', '🍊'], ['🐝', '🐞'], ['🌳', '🌲'], ['🍪', '🍩'], ['🐔', '🐤'], ['🐑', '🐐'], ['🍐', '🍏']],
    hard: [['🙂', '🙃'], ['🌘', '🌒'], ['🕐', '🕓'], ['😐', '😑'], ['👆', '👇'], ['🌗', '🌓'], ['🙈', '🙉']]
  };
  const LEVELS = [
    { cols: 3, rows: 3, set: 'easy' },
    { cols: 4, rows: 4, set: 'easy' },
    { cols: 4, rows: 4, set: 'medium' },
    { cols: 5, rows: 5, set: 'medium' },
    { cols: 5, rows: 5, set: 'hard' },
    { cols: 6, rows: 6, set: 'medium' },
    { cols: 6, rows: 6, set: 'hard' },
    { cols: 6, rows: 7, set: 'hard' }
  ];
  const TIMEOUT = 15000;

  SM.registerGame({
    id: 'jiny',
    name: 'Jeden je jiný',
    domain: 'postreh',
    trains: 'postřeh, soustředění a rychlé prohledávání očima',
    short: 'Najděte obrázek, který se liší.',
    duration: 'asi 1 až 2 minuty',
    maxLevel: LEVELS.length,
    howTo: [
      'Uvidíte mřížku stejných obrázků. Jeden z nich je ale jiný.',
      'Co nejrychleji ho najděte a klepněte na něj.',
      'Na vyšších úrovních bude obrázků víc a rozdíl menší.'
    ],

    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const TRIALS = ctx.short ? 6 : 10;
      const cells = L.cols * L.rows;
      const rts = [];
      let errors = 0, misses = 0;
      let grid = null;
      let dims = { cols: L.cols, rows: L.rows };

      const layout = () => {
        if (!grid) return;
        const sz = ctx.size();
        dims = sz.w > sz.h * 1.25 ? { cols: Math.max(L.cols, L.rows), rows: Math.min(L.cols, L.rows) } : { cols: Math.min(L.cols, L.rows), rows: Math.max(L.cols, L.rows) };
        const gap = 6;
        const cell = Math.floor(Math.min((sz.w - gap * (dims.cols - 1)) / dims.cols, (sz.h - gap * (dims.rows - 1)) / dims.rows, 110));
        grid.style.setProperty('--cols', dims.cols);
        grid.style.setProperty('--cell', cell + 'px');
        grid.style.setProperty('--gap', gap + 'px');
      };
      ctx.on(window, 'resize', layout);
      ctx.status('Najděte obrázek, který je jiný.');

      for (let t = 0; t < TRIALS; t++) {
        ctx.progress('Úkol ' + (t + 1) + ' z ' + TRIALS);
        const pair = U.pick(PAIRS[L.set]);
        const swap = Math.random() < 0.5;
        const base = swap ? pair[1] : pair[0];
        const odd = swap ? pair[0] : pair[1];
        const oddIdx = U.randInt(0, cells - 1);

        ctx.stage.textContent = '';
        grid = h('div', { class: 'odd-grid emo', role: 'group', 'aria-label': 'Mřížka obrázků' });
        const btns = [];
        const outcome = await new Promise((resolve) => {
          let start = 0;
          let finished = false;
          const end = (v) => { if (!finished) { finished = true; resolve(v); } };
          for (let i = 0; i < cells; i++) {
            const b = h('button', { class: 'odd-cell', type: 'button', 'aria-label': 'Obrázek ' + (i + 1) }, i === oddIdx ? odd : base);
            U.tap(b, () => {
              if (finished) return;
              if (i === oddIdx) {
                b.classList.add('is-found');
                end({ found: true, rt: performance.now() - start });
              } else {
                errors++;
                b.classList.remove('is-wrong');
                void b.offsetWidth;
                b.classList.add('is-wrong');
                ctx.sound.wrong();
              }
            });
            btns.push(b);
            grid.appendChild(b);
          }
          ctx.stage.appendChild(grid);
          layout();
          ctx.frame((ts) => { start = ts; });
          ctx.after(TIMEOUT, () => end({ found: false }));
        });

        if (outcome.found) {
          rts.push(outcome.rt / SM.timeScale);
          ctx.feedback(true);
          await ctx.sleep(700);
        } else {
          misses++;
          btns[oddIdx].classList.add('is-hint');
          ctx.status('Tady je. Nevadí, jdeme dál.');
          ctx.sound.wrong();
          await ctx.sleep(1800);
          ctx.status('Najděte obrázek, který je jiný.');
        }
      }

      const T = (1.2 + 0.08 * cells) * 1000;
      const meanRT = rts.length ? U.mean(rts) : TIMEOUT;
      const perf = rts.length ? U.clamp(1 - (meanRT - 0.6 * T) / (1.6 * T), 0, 1) * (1 - Math.min(0.5, 0.05 * errors)) : 0;
      ctx.finish({
        perf: perf,
        levelDelta: misses === 0 && meanRT <= T && errors <= 1 ? 1 : meanRT > 2.2 * T || misses >= 3 ? -1 : 0,
        big: U.num(meanRT / 1000, 1) + ' s',
        bigLabel: 'průměrně vám trvalo najít jiný obrázek',
        details: ['Nalezeno: ' + rts.length + ' z ' + TRIALS, 'Klepnutí vedle: ' + errors],
        metric: { rt: Math.round(meanRT), errors: errors, misses: misses }
      });
    }
  });
})();
