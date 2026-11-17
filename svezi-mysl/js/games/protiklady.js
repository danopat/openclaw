/* Protiklady — najít slovo opačného významu (slovní zásoba, pojmové myšlení). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  SM.registerGame({
    id: 'protiklady',
    name: 'Protiklady',
    domain: 'slova',
    trains: 'slovní zásobu a pohotovost',
    short: 'Najděte slovo s opačným významem.',
    duration: 'asi 1 minuta',
    maxLevel: 3,
    howTo: [
      'Uvidíte jedno slovo, například VYSOKÝ.',
      'Vyberte slovo, které znamená pravý opak. Tady by to bylo „nízký“.',
      'Na vyšších úrovních je víc možností a slova jsou těžší.'
    ],
    async run(ctx) {
      const N = ctx.short ? 6 : 10;
      const all = SM.content.OPPOSITES;
      const pool = ctx.level === 1 ? all.filter((o) => o.lv === 1) : ctx.level === 2 ? all : all.filter((o) => o.lv === 2);
      const nOpts = ctx.level === 1 ? 3 : 4;
      const items = U.sample(pool, N);
      let correct = 0;
      const rts = [];
      for (let i = 0; i < N; i++) {
        const it = items[i];
        ctx.progress((i + 1) + ' / ' + N);
        ctx.status('Co je opakem tohoto slova?');
        K.show(ctx, h('p', { class: 'word-card' }, it.w.toUpperCase()));
        const opts = U.shuffle([it.a].concat(U.sample(it.d, nOpts - 1))).map((w) => ({ label: w, value: w }));
        const r = await K.choose(ctx, opts, { answer: it.a, layout: nOpts === 4 ? 'grid' : 'col' });
        if (r.correct) { correct++; rts.push(r.rt); }
        ctx.status(r.correct ? 'Správně!' : 'Opakem slova „' + it.w + '“ je „' + it.a + '“.');
        await ctx.sleep(r.correct ? 800 : 2000);
      }
      const acc = correct / N;
      ctx.finish({
        perf: 0.8 * acc + 0.2 * (rts.length ? U.clamp((6000 - U.mean(rts)) / 4000, 0, 1) : 0),
        levelDelta: K.levelByAcc(acc),
        big: correct + ' z ' + N, bigLabel: 'správných odpovědí',
        details: rts.length ? ['Průměrně: ' + U.num(U.mean(rts) / 1000, 1) + ' s'] : [],
        metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
