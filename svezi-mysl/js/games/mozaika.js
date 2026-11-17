/* Mozaika — zapamatovat si rozmístění barevných políček a zopakovat ho (prostorová paměť). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const LEVELS = [{ n: 3, k: 3 }, { n: 3, k: 4 }, { n: 4, k: 5 }, { n: 4, k: 6 }, { n: 5, k: 7 }, { n: 5, k: 9 }];

  SM.registerGame({
    id: 'mozaika',
    name: 'Mozaika',
    domain: 'pamet',
    trains: 'prostorovou paměť',
    short: 'Zopakujte rozmístění barevných políček.',
    duration: 'asi 1 až 2 minuty',
    maxLevel: LEVELS.length,
    howTo: [
      'Na chvíli uvidíte mřížku, ve které jsou některá políčka obarvená.',
      'Zapamatujte si, kde barevná políčka byla.',
      'Pak je v prázdné mřížce vybarvěte klepnutím a potvrďte tlačítkem „Hotovo“.'
    ],
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      const scores = [];
      for (let r = 0; r < N; r++) {
        ctx.progress((r + 1) + ' / ' + N);
        const cells = L.n * L.n;
        const target = U.sample(Array.from({ length: cells }, (_, i) => i), L.k);
        ctx.status('Zapamatujte si vzor.');
        ctx.stage.textContent = '';
        ctx.foot.textContent = '';
        const btns = [];
        const grid = h('div', { class: 'mosaic', style: { '--n': L.n } });
        for (let i = 0; i < cells; i++) {
          const b = h('button', { class: 'mosaic-cell' + (target.indexOf(i) !== -1 ? ' is-on' : ''), type: 'button', disabled: true, 'aria-label': 'Políčko ' + (i + 1) });
          btns.push(b);
          grid.appendChild(b);
        }
        ctx.stage.appendChild(grid);
        const size = () => {
          const sz = ctx.size();
          grid.style.setProperty('--side', Math.floor(Math.min(sz.w, sz.h - 8, 440)) + 'px');
        };
        size();
        ctx.on(window, 'resize', size);
        await ctx.sleep(2000 + 500 * L.k);
        btns.forEach((b) => { b.classList.remove('is-on'); b.disabled = false; b.setAttribute('aria-pressed', 'false'); });
        ctx.status('Vybarvěte políčka, která byla barevná.');
        const chosen = await new Promise((resolve) => {
          const sel = [];
          const done = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: true }, 'Hotovo');
          btns.forEach((b, i) => U.tap(b, () => {
            if (b.disabled) return;
            const at = sel.indexOf(i);
            if (at === -1) sel.push(i); else sel.splice(at, 1);
            b.classList.toggle('is-on', at === -1);
            b.setAttribute('aria-pressed', at === -1 ? 'true' : 'false');
            ctx.sound.tap();
            done.disabled = !sel.length;
            ctx.progress((r + 1) + ' / ' + N + ' · vybráno ' + sel.length + ' z ' + L.k);
          }));
          U.tap(done, () => { if (!done.disabled) { btns.forEach((b) => { b.disabled = true; }); resolve(sel.slice()); } });
          ctx.foot.appendChild(done);
        });
        ctx.foot.textContent = '';
        let hits = 0, extra = 0;
        btns.forEach((b, i) => {
          const t = target.indexOf(i) !== -1, c = chosen.indexOf(i) !== -1;
          b.classList.remove('is-on');
          if (t && c) { hits++; b.classList.add('is-hit'); }
          else if (c) { extra++; b.classList.add('is-extra'); }
          else if (t) b.classList.add('is-miss');
        });
        const score = Math.max(0, hits - extra) / L.k;
        scores.push(score);
        ctx.feedback(score === 1);
        ctx.status(score === 1 ? 'Přesně tak!' : 'Správně: ' + hits + ' z ' + L.k + (extra ? ', navíc: ' + extra : '') + '.');
        await ctx.sleep(score === 1 ? 1100 : 2300);
      }
      const perf = U.mean(scores);
      ctx.finish({
        perf: perf, levelDelta: perf >= 0.9 ? 1 : perf < 0.6 ? -1 : 0,
        big: Math.round(perf * 100) + ' %', bigLabel: 'políček jste trefili',
        details: [], metric: { perf: Math.round(perf * 100) }
      });
    }
  });
})();
