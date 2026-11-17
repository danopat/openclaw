/* Co sem nepatří — najít slovo, které nezapadá mezi ostatní (pojmové myšlení, kategorie). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  SM.registerGame({
    id: 'nepatri',
    name: 'Co sem nepatří',
    domain: 'slova',
    trains: 'třídění pojmů a všeobecný přehled',
    short: 'Najděte slovo, které mezi ostatní nepatří.',
    duration: 'asi 1 až 2 minuty',
    maxLevel: 3,
    howTo: [
      'Uvidíte čtyři slova. Tři k sobě patří, jedno ne.',
      'Klepněte na slovo, které sem nepatří.',
      'Po odpovědi uvidíte vysvětlení.'
    ],
    async run(ctx) {
      const N = ctx.short ? 5 : 8;
      const pool = SM.content.ODD.filter((o) => (ctx.level === 1 ? o.lv === 1 : ctx.level === 2 ? o.lv <= 2 : o.lv >= 2));
      const items = U.sample(pool, N);
      let correct = 0;
      for (let i = 0; i < N; i++) {
        const it = items[i];
        ctx.progress((i + 1) + ' / ' + N);
        ctx.status('Které slovo sem nepatří?');
        K.show(ctx, h('p', { class: 'lead-q' }, 'Tři slova k sobě patří. Které je navíc?'));
        const opts = U.shuffle(it.w.concat([it.x])).map((w) => ({ label: w, value: w }));
        const r = await K.choose(ctx, opts, { answer: it.x, layout: 'grid' });
        if (r.correct) correct++;
        ctx.status((r.correct ? 'Správně! ' : 'Nepatří sem „' + it.x + '“. ') + it.why);
        await ctx.sleep(r.correct ? 1600 : 2600);
      }
      const acc = correct / N;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc, 0.85),
        big: correct + ' z ' + N, bigLabel: 'správně odhalených vetřelců',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
