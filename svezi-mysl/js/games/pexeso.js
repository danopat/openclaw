/* Pexeso — hledání dvojic (zraková a prostorová paměť). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;

  // Snadno rozlišitelné obrázky (bez dvojic, které si jsou podobné).
  const SYMBOLS = ['🍎', '🍌', '🍇', '🍓', '🍍', '🥕', '🌽', '🍄', '🌻', '🌷', '🌲', '🐶', '🐱', '🐟', '🐦', '🐞', '🦋', '🐢',
    '🐘', '🚗', '🚲', '⛵', '🏠', '⏰', '☂️', '🎈', '⚽', '🔑', '📚', '🎩', '👓', '🧦', '🍦', '🎂', '☕', '🔔', '⭐', '🌙', '🍀', '🎁', '✂️', '🎺', '🦉', '🐝', '🥨', '🧸'];
  const LEVELS = [3, 4, 6, 8, 10, 12, 15]; // počet dvojic

  SM.registerGame({
    id: 'pexeso',
    name: 'Pexeso',
    domain: 'pamet',
    trains: 'zrakovou paměť a soustředění',
    short: 'Najděte dvojice stejných obrázků.',
    duration: '1 až 4 minuty',
    maxLevel: LEVELS.length,
    howTo: [
      'Kartičky leží obrázkem dolů.',
      'Klepněte na dvě kartičky. Když jsou stejné, zůstanou otočené.',
      'Když stejné nejsou, za chvíli se samy otočí zpět. Zapamatujte si, kde který obrázek leží.',
      'Najděte všechny dvojice s co nejméně pokusy.'
    ],

    run(ctx) {
      const pairs = ctx.short ? Math.min(8, LEVELS[ctx.level - 1]) : LEVELS[ctx.level - 1];
      const symbols = U.sample(SYMBOLS, pairs);
      const deck = U.shuffle(symbols.concat(symbols)).map((s) => ({ s: s, open: false, done: false, el: null }));
      let moves = 0, found = 0, first = null, busy = false;
      const t0 = performance.now();

      ctx.status('Najděte všechny dvojice.');
      const grid = U.h('div', { class: 'pex-grid' });
      ctx.stage.appendChild(grid);

      deck.forEach((card, i) => {
        card.el = U.h('button', { class: 'pex-card', type: 'button', 'aria-label': 'Kartička ' + (i + 1) + ', otočená' },
          U.h('span', { class: 'pex-inner' },
            U.h('span', { class: 'pex-face pex-back' }),
            U.h('span', { class: 'pex-face pex-front emo', 'aria-hidden': 'true' }, card.s)));
        U.tap(card.el, () => flip(card, i));
        grid.appendChild(card.el);
      });

      const layout = () => {
        const sz = ctx.size();
        const gap = sz.w < 500 ? 8 : 12;
        const f = U.fitGrid(deck.length, sz.w, sz.h, 0.82, gap, 230);
        grid.style.setProperty('--cols', f.cols);
        grid.style.setProperty('--cw', f.w + 'px');
        grid.style.setProperty('--ch', f.h + 'px');
        grid.style.setProperty('--gap', gap + 'px');
      };
      layout();
      ctx.on(window, 'resize', layout);

      const update = () => ctx.progress('Dvojice ' + found + '/' + pairs + ' · pokusy ' + moves);
      update();

      const show = (card, open) => {
        card.open = open;
        card.el.classList.toggle('is-open', open);
        card.el.setAttribute('aria-label', open ? 'Kartička: ' + card.s : 'Kartička, otočená');
      };

      async function flip(card) {
        if (busy || card.open || card.done || !ctx.alive) return;
        show(card, true);
        ctx.sound.flip();
        if (!first) { first = card; return; }
        moves++;
        const a = first;
        first = null;
        if (a.s === card.s) {
          a.done = card.done = true;
          a.el.classList.add('is-done');
          card.el.classList.add('is-done');
          found++;
          ctx.sound.correct();
          update();
          if (found === pairs) {
            ctx.status('Všechny dvojice nalezeny!');
            await ctx.sleep(900);
            finish();
          }
        } else {
          busy = true;
          update();
          await ctx.sleep(1300);
          show(a, false);
          show(card, false);
          busy = false;
        }
      }

      function finish() {
        const n = pairs;
        const great = 1.6 * n; // průměr hráče s dokonalou pamětí
        const weak = 3.2 * n;
        const perf = U.clamp((weak - moves) / (weak - great), 0, 1);
        const ms = performance.now() - t0;
        ctx.finish({
          perf: perf,
          levelDelta: moves <= 2 * n ? 1 : moves > weak ? -1 : 0,
          big: String(moves),
          bigLabel: U.plural(moves, 'pokus', 'pokusy', 'pokusů') + ' na ' + n + ' ' + U.plural(n, 'dvojici', 'dvojice', 'dvojic'),
          details: ['Čas: ' + U.fmtTime(ms)],
          metric: { moves: moves, pairs: n }
        });
      }
    }
  });
})();
