/* Hodiny — přečíst čas na ručičkových hodinách a počítat s časem (orientace, prostorové vnímání). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const LEVELS = [
    { step: 60, opts: 3 },
    { step: 30, opts: 3 },
    { step: 15, opts: 4 },
    { step: 5, opts: 4 },
    { step: 5, opts: 4, add: true }
  ];
  const fmt = (t) => {
    const hr = Math.floor(t / 60) % 12 || 12;
    const m = t % 60;
    return hr + ':' + (m < 10 ? '0' : '') + m;
  };
  const norm = (t) => ((t % 720) + 720) % 720;

  function clock(t) {
    const hr = (t / 60) % 12;
    const m = t % 60;
    let marks = '';
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 * Math.PI) / 180;
      const r1 = i % 5 === 0 ? 80 : 85;
      marks += '<line x1="' + (100 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (100 - r1 * Math.cos(a)).toFixed(1) +
        '" x2="' + (100 + 90 * Math.sin(a)).toFixed(1) + '" y2="' + (100 - 90 * Math.cos(a)).toFixed(1) +
        '" stroke-width="' + (i % 5 === 0 ? 3 : 1.5) + '"/>';
    }
    let nums = '';
    for (let n = 1; n <= 12; n++) {
      const a = (n * 30 * Math.PI) / 180;
      nums += '<text x="' + (100 + 66 * Math.sin(a)).toFixed(1) + '" y="' + (100 - 66 * Math.cos(a) + 7.5).toFixed(1) + '">' + n + '</text>';
    }
    const ha = hr * 30, ma = m * 6;
    return '<svg class="clock" viewBox="0 0 200 200" role="img" aria-label="Ručičkové hodiny">' +
      '<circle cx="100" cy="100" r="94" class="clock-face"/>' +
      '<g class="clock-marks">' + marks + '</g><g class="clock-nums">' + nums + '</g>' +
      '<line x1="100" y1="100" x2="100" y2="52" class="clock-hour" transform="rotate(' + ha + ' 100 100)"/>' +
      '<line x1="100" y1="100" x2="100" y2="28" class="clock-min" transform="rotate(' + ma + ' 100 100)"/>' +
      '<circle cx="100" cy="100" r="6" class="clock-pin"/></svg>';
  }

  SM.registerGame({
    id: 'hodiny',
    name: 'Hodiny',
    domain: 'logika',
    trains: 'orientaci v čase a prostorové vnímání',
    short: 'Kolik ukazují ručičkové hodiny?',
    duration: 'asi 1 až 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const steps = [
        'Uvidíte ručičkové hodiny.',
        'Malá ručička ukazuje hodiny, velká minuty.',
        'Vyberte, kolik je hodin.'
      ];
      if (LEVELS[level - 1].add) steps.push('Někdy se zeptáme, kolik bude hodin za chvíli. Přičtěte minuty v duchu.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 4 : 6;
      let correct = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        const t = U.randInt(1, 12) * 60 + U.randInt(0, 60 / L.step - 1) * L.step;
        const add = L.add && i % 2 === 1 ? U.pick([10, 15, 20, 30, 45]) : 0;
        const answer = norm(t + add);
        ctx.status(add ? 'Kolik bude hodin za ' + add + ' minut?' : 'Kolik je hodin?');
        const box = K.show(ctx);
        box.innerHTML = clock(t);
        const cands = [norm(answer + 60), norm(answer - 60), norm(answer + L.step), norm(answer - L.step), norm(answer + 30)];
        const m = t % 60, hr = Math.floor(t / 60) % 12;
        if (m % 5 === 0 && m) cands.unshift(norm((m / 5) * 60 + hr * 5 + add)); // záměna ručiček
        if (add) cands.unshift(norm(t), norm(t + add + 10));
        const wrong = [];
        cands.forEach((c) => { if (c !== answer && wrong.indexOf(c) === -1) wrong.push(c); });
        const opts = U.shuffle([answer].concat(wrong.slice(0, L.opts - 1))).map((v) => ({ label: fmt(v), value: v }));
        const r = await K.choose(ctx, opts, { answer: answer, layout: L.opts === 4 ? 'grid' : 'row', cls: 'is-mono' });
        if (r.correct) correct++;
        ctx.status(r.correct ? 'Správně!' : 'Správně je ' + fmt(answer) + '.');
        await ctx.sleep(r.correct ? 900 : 2000);
      }
      const acc = correct / N;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc, 0.85),
        big: correct + ' z ' + N, bigLabel: 'správně přečtených časů',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
