/* Terč — vybrat z každého kruhu terče jedno číslo tak, aby součet dal zadaný cíl (sčítání zpaměti, hledání kombinací). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* rings = počet čísel v kruzích od středu, ranges = rozsahy čísel, minus = kruh, který se odečítá, targets = cílů na jeden terč. */
  const LEVELS = [
    { rings: [3, 5], ranges: [[1, 9], [1, 9]], boards: 3, targets: 1 },
    { rings: [3, 5, 6], ranges: [[1, 9], [1, 9], [5, 20]], boards: 3, targets: 1 },
    { rings: [3, 5, 6], ranges: [[1, 9], [2, 15], [5, 25]], boards: 2, targets: 2 },
    { rings: [3, 4, 6], ranges: [[5, 15], [1, 9], [10, 30]], boards: 2, targets: 2, minus: 1 }
  ];

  function makeBoard(L) {
    for (let t = 0; t < 200; t++) {
      const rings = L.rings.map((n, k) => U.sample(Array.from({ length: L.ranges[k][1] - L.ranges[k][0] + 1 }, (_, i) => i + L.ranges[k][0]), n).sort((a, b) => a - b));
      // Všechny možné součty (s počtem cest, jak je dosáhnout).
      const sums = {};
      const walk = (k, acc) => {
        if (k === rings.length) { sums[acc] = (sums[acc] || 0) + 1; return; }
        rings[k].forEach((v) => walk(k + 1, acc + (k === L.minus ? -v : v)));
      };
      walk(0, 0);
      // Cíle s jedním nebo dvěma řešeními (ne příliš snadné hádání), kladné.
      const good = Object.keys(sums).map(Number).filter((s) => s > 0 && sums[s] <= 2);
      if (good.length < L.targets) continue;
      return { rings: rings, targets: U.sample(good, L.targets) };
    }
    return null;
  }

  SM.registerGame({
    id: 'terc',
    name: 'Terč',
    domain: 'logika',
    trains: 'sčítání zpaměti a hledání kombinací',
    short: 'Z každého kruhu vyberte číslo, ať součet dá cíl.',
    duration: 'asi 2 minuty',
    pace: { per: 'na cíl' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Terč má ' + (L.rings.length === 2 ? 'dva kruhy' : 'tři kruhy') + ' s čísly. Z každého kruhu vyberte jedno číslo.',
        'Vybraná čísla se sečtou a součet má dát cíl nahoře. Průběžný součet vidíte pod terčem.',
        'Vybrané číslo změníte klepnutím na jiné ve stejném kruhu.'
      ];
      if (L.targets > 1) steps.push('Na jednom terči hledáte dva cíle po sobě.');
      if (L.minus != null) steps.push('Pozor: čísla z prostředního kruhu se odečítají.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const boards = ctx.short ? 1 : L.boards;
      const per = ctx.short ? Math.max(2, L.targets) : L.targets;
      let ok = 0, total = 0;
      for (let b = 0; b < boards; b++) {
        const board = makeBoard(Object.assign({}, L, { targets: per }));
        for (let t = 0; t < board.targets.length; t++) {
          total++;
          ctx.progress('Cíl ' + total + ' z ' + boards * per);
          if (await play(board, board.targets[t])) ok++;
        }
      }
      const acc = total ? ok / total : 0;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: ok + ' z ' + total, bigLabel: 'cílů napoprvé',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      /* Jeden cíl. Vrací true, když byl první úplný výběr správně. */
      function play(board, target) {
        return new Promise((resolve) => {
          const n = board.rings.length;
          const sel = Array(n).fill(null);
          let first = true;
          let done = false;
          const t0 = performance.now();
          ctx.clear();
          ctx.status('Vyberte z každého kruhu jedno číslo.');
          const goal = h('p', { class: 'terc-goal' }, h('span', null, 'Cíl'), h('b', null, String(target)));
          const sumEl = h('p', { class: 'terc-sum', 'aria-live': 'polite' });
          const box = h('div', { class: 'stack terc', 'data-target': target, 'data-rings': JSON.stringify(board.rings), 'data-minus': L.minus != null ? L.minus : '' }, goal);
          ctx.stage.appendChild(box);
          const sz = ctx.size();
          const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
          const D = Math.floor(U.clamp(Math.min(sz.w - 8, sz.h - goal.offsetHeight - 3.2 * rem - 30), 220, 440));
          const btn = Math.floor(U.clamp(D * 0.135, 40, 3.2 * rem));
          const radii = n === 2 ? [0.21, 0.39] : [0.165, 0.305, 0.44];
          const disc = h('div', { class: 'terc-board', style: { width: D + 'px', height: D + 'px', '--b': btn + 'px' } });
          radii.slice().reverse().forEach((r, k) => disc.appendChild(h('span', { class: 'terc-ring r' + (n - 1 - k), style: { width: (2 * r + 0.11) * D + 'px', height: (2 * r + 0.11) * D + 'px' } })));
          const els = board.rings.map((vals, k) => vals.map((v, j) => {
            const a = (-90 + (360 / vals.length) * j + (k % 2 ? 180 / vals.length : 0)) * Math.PI / 180;
            const x = D / 2 + radii[k] * D * Math.cos(a) - btn / 2;
            const y = D / 2 + radii[k] * D * Math.sin(a) - btn / 2;
            const b = h('button', { class: 'terc-n' + (k === L.minus ? ' is-minus' : ''), type: 'button', 'data-ring': k, 'data-v': v, style: { left: x + 'px', top: y + 'px' },
              'aria-label': (k === L.minus ? 'minus ' : '') + v + ', ' + (k + 1) + '. kruh' }, (k === L.minus ? '−' : '') + v);
            U.tap(b, () => choose(k, j));
            disc.appendChild(b);
            return b;
          }));
          box.appendChild(disc);
          box.appendChild(sumEl);
          paint();

          function value(k) { return sel[k] == null ? null : board.rings[k][sel[k]] * (k === L.minus ? -1 : 1); }
          function paint() {
            els.forEach((ring, k) => ring.forEach((b, j) => b.classList.toggle('is-on', sel[k] === j)));
            const parts = sel.map((_, k) => value(k));
            let txt = '';
            parts.forEach((v, k) => {
              const s = v == null ? '?' : String(Math.abs(v));
              txt += k === 0 ? s : (k === L.minus ? ' − ' : ' + ') + s;
            });
            const full = parts.every((v) => v != null);
            const sum = full ? parts.reduce((a, b) => a + b, 0) : null;
            sumEl.textContent = txt + (full ? ' = ' + sum : '') + '   (cíl ' + target + ')';
            sumEl.classList.toggle('is-ok', full && sum === target);
          }
          function choose(k, j) {
            if (done || !ctx.alive) return;
            sel[k] = sel[k] === j ? null : j;
            ctx.sound.tap();
            paint();
            if (sel.some((x) => x == null)) return;
            const sum = sel.reduce((a, _, kk) => a + value(kk), 0);
            if (sum === target) {
              done = true;
              ctx.mark(first, (performance.now() - t0) / SM.timeScale);
              ctx.feedback(true);
              ctx.status(first ? 'Výborně, zásah!' : 'Teď to sedí!');
              disc.classList.add('is-done');
              ctx.sleep(1200).then(() => resolve(first));
            } else {
              first = false;
              ctx.sound.wrong();
              ctx.status('Součet je ' + sum + ', cíl je ' + target + '. Zkuste vyměnit některé číslo.');
            }
          }
        });
      }
    }
  });
})();
