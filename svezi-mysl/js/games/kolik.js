/* Kolik jich je — odhadnout počet věcí, které se na okamžik ukázaly (rychlé vnímání množství). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const LEVELS = [
    { min: 2, max: 4, D: 1600 },
    { min: 3, max: 6, D: 1300 },
    { min: 4, max: 8, D: 1100 },
    { min: 5, max: 9, D: 900 },
    { min: 6, max: 12, D: 800 }
  ];
  const PICS = ['🐦', '🍎', '⭐', '🐞', '🌸', '🐟', '🍄'];

  SM.registerGame({
    id: 'kolik',
    name: 'Kolik jich je',
    domain: 'postreh',
    trains: 'rychlé vnímání množství',
    short: 'Kolik věcí se na okamžik ukázalo?',
    duration: 'asi 1 minuta',
    pace: { per: 'na odpověď' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo: [
      'Na okamžik se objeví několik stejných obrázků.',
      'Nepočítejte je po jednom, zkuste počet odhadnout jedním pohledem.',
      'Pak vyberte, kolik jich bylo.'
    ],
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 5 : 8;
      let correct = 0;
      const field = h('div', { class: 'count-field emo' });
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        ctx.status('Dívejte se…');
        ctx.foot.textContent = '';
        ctx.stage.textContent = '';
        ctx.stage.appendChild(field);
        field.textContent = '';
        await ctx.sleep(700);
        const k = U.randInt(L.min, L.max);
        const pic = U.pick(PICS);
        const cols = 5, rows = 4;
        U.sample(Array.from({ length: cols * rows }, (_, j) => j), k).forEach((c) => {
          const x = ((c % cols) + 0.5 + (Math.random() - 0.5) * 0.4) / cols * 100;
          const y = (Math.floor(c / cols) + 0.5 + (Math.random() - 0.5) * 0.4) / rows * 100;
          field.appendChild(h('span', { class: 'count-dot', style: { left: x.toFixed(1) + '%', top: y.toFixed(1) + '%' } }, pic));
        });
        await ctx.sleep(L.D);
        field.textContent = '';
        ctx.status('Kolik jich bylo?');
        const set = [k];
        [k + 1, k - 1, k + 2, k - 2].forEach((v) => { if (v >= 1 && set.length < 4 && set.indexOf(v) === -1) set.push(v); });
        const r = await K.choose(ctx, set.sort((a, b) => a - b).map((v) => ({ label: String(v), value: v })), { answer: k, layout: 'row', cls: 'is-mono' });
        if (r.correct) correct++;
        ctx.status(r.correct ? 'Správně!' : 'Bylo jich ' + k + '.');
        await ctx.sleep(r.correct ? 800 : 1700);
      }
      const acc = correct / N;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: correct + ' z ' + N, bigLabel: 'správných odhadů',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
