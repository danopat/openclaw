/* Jména a tváře — seznámit se s novými sousedy a vybavit si jejich jména (asociativní paměť). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  function people(k) {
    const C = SM.content;
    const faces = { f: U.shuffle(C.FACES.f), m: U.shuffle(C.FACES.m) };
    const names = { f: U.shuffle(C.NAMES.f), m: U.shuffle(C.NAMES.m) };
    const jobs = U.shuffle(C.JOBS);
    const out = [];
    for (let i = 0; i < k; i++) {
      const g = i % 2 === 0 ? (Math.random() < 0.5 ? 'f' : 'm') : out[i - 1].g === 'f' ? 'm' : 'f';
      out.push({ g: g, face: faces[g].pop(), name: names[g].pop(), job: jobs[i][g], je: jobs[i].e });
    }
    return out;
  }
  const title = (p) => (p.g === 'f' ? 'paní ' : 'pan ') + p.name;

  SM.registerGame({
    id: 'jmena',
    name: 'Jména a tváře',
    domain: 'pamet',
    trains: 'paměť na jména a tváře',
    short: 'Zapamatujte si jména nových sousedů.',
    duration: 'asi 2 minuty',
    maxLevel: 5,
    howTo(level) {
      return [
        'Do domu se nastěhovali noví sousedé (' + (level + 1) + '). Postupně se vám představí.',
        'Zapamatujte si, jak se kdo jmenuje. Pomůže spojit si jméno s tváří nebo povoláním.',
        'Potom uvidíte tvář a vyberete správné jméno.'
      ];
    },
    async run(ctx) {
      const k = ctx.level + 1;
      const rounds = ctx.short ? 1 : 2;
      let correct = 0, total = 0;
      for (let r = 0; r < rounds; r++) {
        const ps = people(k);
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          ctx.progress('Seznámení ' + (i + 1) + ' z ' + ps.length);
          ctx.status('Seznamte se:');
          K.show(ctx, h('div', { class: 'person-card' },
            h('span', { class: 'person-face emo', 'aria-hidden': 'true' }, p.face),
            h('span', { class: 'person-name' }, title(p)),
            h('span', { class: 'person-job' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, p.je), ' ' + p.job)));
          await new Promise((resolve) => {
            const b = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, i < ps.length - 1 ? 'Další soused' : 'Můžeme začít');
            U.tap(b, () => resolve());
            ctx.foot.appendChild(b);
          });
        }
        const order = U.shuffle(ps);
        for (let i = 0; i < order.length; i++) {
          const p = order[i];
          total++;
          ctx.progress('Otázka ' + (i + 1) + ' z ' + order.length);
          ctx.status('Jak se jmenuje tento soused?');
          K.show(ctx, h('div', { class: 'person-card' },
            h('span', { class: 'person-face emo', 'aria-hidden': 'true' }, p.face),
            ctx.level <= 2 ? h('span', { class: 'person-job' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, p.je), ' ' + p.job) : null));
          let names = ps.map((x) => x.name);
          if (names.length > 4) names = [p.name].concat(U.sample(names.filter((n) => n !== p.name), 3));
          const res = await K.choose(ctx, U.shuffle(names).map((n) => ({ label: n, value: n })), { answer: p.name, layout: 'grid' });
          if (res.correct) correct++;
          ctx.status(res.correct ? 'Správně, to je ' + title(p) + '.' : 'To je ' + title(p) + '.');
          await ctx.sleep(res.correct ? 1000 : 2000);
        }
      }
      const acc = correct / total;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc, 0.9, 0.6),
        big: correct + ' z ' + total, bigLabel: 'jmen jste si správně vybavili',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
