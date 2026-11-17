/* Co bude dál — doplnit pokračování řady čísel nebo obrázků (logické uvažování). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const PICS = [['🍎', '🍐'], ['🔴', '🔵'], ['⭐', '🌙'], ['🐶', '🐱'], ['☀️', '☁️'], ['🌷', '🍀'], ['🔺', '🟦']];

  // Generátory řad podle úrovně. Vrací { terms, answer, options? }.
  function genPattern() {
    const p = U.pick(PICS);
    const third = U.pick(PICS.filter((x) => x !== p))[0];
    const kind = U.pick(['AB', 'AAB', 'ABB', 'ABC']);
    const unit = kind === 'AB' ? [p[0], p[1]] : kind === 'AAB' ? [p[0], p[0], p[1]] : kind === 'ABB' ? [p[0], p[1], p[1]] : [p[0], p[1], third];
    const seq = [];
    for (let i = 0; i < 7; i++) seq.push(unit[i % unit.length]);
    return { terms: seq.slice(0, 6), answer: seq[6], options: U.shuffle([p[0], p[1], third]).slice(0, 3).concat([]).filter((v, i, a) => a.indexOf(v) === i), pic: true };
  }
  function arith(a, d, n) { const t = []; for (let i = 0; i < n; i++) t.push(a + d * i); return t; }
  const GEN = [
    () => (Math.random() < 0.5 ? genPattern() : (() => { const d = U.pick([1, 2]); const t = arith(U.randInt(1, 10), d, 6); return { terms: t.slice(0, 5), answer: t[5] }; })()),
    () => { const d = U.pick([2, 3, 4, 5, 10, -1, -2, -3]); const a = d < 0 ? U.randInt(20, 40) : U.randInt(1, 20); const t = arith(a, d, 6); return { terms: t.slice(0, 5), answer: t[5] }; },
    () => {
      if (Math.random() < 0.5) { const a = U.randInt(1, 4); const t = [a]; for (let i = 1; i < 6; i++) t.push(t[i - 1] * 2); return { terms: t.slice(0, 5), answer: t[5] }; }
      const a = U.randInt(1, 10); const t = [a]; for (let i = 1; i < 6; i++) t.push(t[i - 1] + i); return { terms: t.slice(0, 5), answer: t[5] };
    },
    () => {
      if (Math.random() < 0.5) { const a = U.randInt(1, 9), x = U.pick([2, 3, 5]), y = U.pick([1, -1, -2]); const t = [a]; for (let i = 1; i < 7; i++) t.push(t[i - 1] + (i % 2 ? x : y)); return { terms: t.slice(0, 6), answer: t[6] }; }
      const a = U.randInt(1, 6), b = U.randInt(20, 30); const t = []; for (let i = 0; i < 7; i++) t.push(i % 2 === 0 ? a + i : b - i); return { terms: t.slice(0, 6), answer: t[6] };
    },
    () => {
      const r = Math.random();
      if (r < 0.34) { const t = [1, 4, 9, 16, 25, 36]; const s = U.randInt(0, 1); return { terms: t.slice(s, s + 4), answer: t[s + 4] }; }
      if (r < 0.67) { const a = U.randInt(1, 3), b = U.randInt(1, 4); const t = [a, b]; for (let i = 2; i < 7; i++) t.push(t[i - 1] + t[i - 2]); return { terms: t.slice(0, 6), answer: t[6] }; }
      const a = U.randInt(2, 4); const t = [a]; for (let i = 1; i < 5; i++) t.push(t[i - 1] * 3); return { terms: t.slice(0, 4), answer: t[4] };
    }
  ];

  SM.registerGame({
    id: 'rada',
    name: 'Co bude dál',
    domain: 'logika',
    trains: 'logické uvažování a hledání pravidel',
    short: 'Doplňte, co v řadě přijde dál.',
    duration: 'asi 1 až 2 minuty',
    pace: { per: 'na odpověď' }, // rychlost pro přehled pokroku
    maxLevel: GEN.length,
    howTo: [
      'Uvidíte řadu čísel nebo obrázků, která pokračuje podle nějakého pravidla.',
      'Zjistěte pravidlo, například „vždy o dvě víc“.',
      'Vyberte, co bude v řadě následovat.'
    ],
    async run(ctx) {
      const N = ctx.short ? 4 : 6;
      let correct = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        ctx.status('Co bude dál?');
        const q = GEN[ctx.level - 1]();
        const row = h('div', { class: 'seq' + (q.pic ? ' emo is-pic' : '') },
          q.terms.map((t) => h('span', { class: 'seq-item' }, String(t))),
          h('span', { class: 'seq-item is-q' }, '?'));
        K.show(ctx, row);
        let opts;
        if (q.pic) opts = q.options;
        else {
          const d = q.terms[q.terms.length - 1] - q.terms[q.terms.length - 2];
          const set = [];
          [q.answer + 1, q.answer - 1, q.answer + d, q.answer + 2, q.answer - 2, q.answer + 10].forEach((v) => { if (v !== q.answer && set.indexOf(v) === -1) set.push(v); });
          opts = [q.answer].concat(set.slice(0, 3));
        }
        if (opts.indexOf(q.answer) === -1) opts[0] = q.answer;
        const r = await K.choose(ctx, U.shuffle(opts).map((v) => ({ label: String(v), value: v })), { answer: q.answer, layout: 'grid', cls: q.pic ? 'is-emoji' : 'is-mono' });
        row.lastChild.textContent = String(q.answer);
        row.lastChild.classList.add(r.correct ? 'is-ok' : 'is-fixed');
        if (r.correct) correct++;
        ctx.status(r.correct ? 'Správně!' : 'Správně je ' + q.answer + '.');
        await ctx.sleep(r.correct ? 1000 : 2200);
      }
      const acc = correct / N;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: correct + ' z ' + N, bigLabel: 'řad jste doplnili správně',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
