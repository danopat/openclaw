/* Přísloví — doplnit chybějící slovo do známého českého přísloví (jazyk, dlouhodobá paměť). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  SM.registerGame({
    id: 'prislovi',
    name: 'Přísloví',
    domain: 'slova',
    trains: 'slovní zásobu a dlouhodobou paměť',
    short: 'Doplňte chybějící slovo do přísloví.',
    duration: 'asi 1 až 2 minuty',
    pace: { per: 'na odpověď' }, // rychlost pro přehled pokroku
    maxLevel: 2,
    howTo(level) {
      return [
        'Uvidíte známé české přísloví, ve kterém chybí jedno slovo.',
        'Vyberte slovo, které do přísloví patří.',
        level >= 2 ? 'Na výběr máte čtyři slova.' : 'Na výběr máte tři slova.'
      ];
    },
    async run(ctx) {
      const N = ctx.short ? 5 : 8;
      const nOpts = ctx.level >= 2 ? 4 : 3;
      const items = U.sample(SM.content.PROVERBS, N);
      let correct = 0;
      for (let i = 0; i < N; i++) {
        const it = items[i];
        ctx.progress((i + 1) + ' / ' + N);
        ctx.status('Které slovo chybí?');
        const parts = it.t.split('___');
        const blank = h('span', { class: 'blank' }, '…');
        K.show(ctx, h('blockquote', { class: 'quote-card' }, parts[0], blank, parts[1]));
        const opts = U.shuffle([it.a].concat(U.sample(it.d, nOpts - 1))).map((w) => ({ label: w, value: w }));
        const r = await K.choose(ctx, opts, { answer: it.a, layout: nOpts === 4 ? 'grid' : 'col' });
        blank.textContent = it.a;
        blank.classList.add(r.correct ? 'is-ok' : 'is-fixed');
        if (r.correct) correct++;
        ctx.status(r.correct ? 'Správně!' : 'Správně je „' + it.a + '“.');
        await ctx.sleep(r.correct ? 1200 : 2300);
      }
      const acc = correct / N;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc),
        big: correct + ' z ' + N, bigLabel: 'přísloví jste doplnili správně',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
