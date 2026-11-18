/* Slovní žebřík — dostat se od jednoho slova k druhému, v každém kroku se mění jen jedno písmeno (slovní pohotovost, plánování). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Jen běžná slova v základním tvaru. Žebříky se hledají mezi slovy, která se liší jedním písmenem. */
  const WORDS = [
    'PES', 'LES', 'VES', 'LED', 'MED', 'LEV', 'LET', 'NOS', 'NOC', 'MOC', 'KOS', 'KOŠ', 'ROK', 'BOK', 'BUK', 'LUK', 'RAK', 'SUD', 'SAD', 'HAD',
    'DUB', 'ZUB', 'SÝR', 'DŮM', 'VŮZ', 'SŮL', 'ČAJ', 'MÍČ',
    'HORA', 'NORA', 'NOTA', 'NOHA', 'KOZA', 'KOSA', 'KASA', 'ROSA', 'KOST', 'MOST', 'MOŠT', 'LÍPA', 'LUPA', 'LUNA', 'VODA', 'SODA', 'SOVA',
    'VÁZA', 'VÁHA', 'MÍSA', 'MÍRA', 'PÍLA', 'SÍLA', 'RUKA', 'ZIMA', 'KOLO', 'PERO'
  ];
  const diff = (a, b) => (a.length !== b.length ? 99 : a.split('').filter((ch, i) => ch !== b[i]).length);
  const NB = {};
  WORDS.forEach((w) => { NB[w] = WORDS.filter((x) => diff(w, x) === 1); });
  /* Vzdálenost (počet kroků) ke všem slovům z cíle. */
  function dist(goal) {
    const d = {};
    d[goal] = 0;
    const q = [goal];
    while (q.length) {
      const w = q.shift();
      NB[w].forEach((x) => { if (d[x] == null) { d[x] = d[w] + 1; q.push(x); } });
    }
    return d;
  }

  /* steps = délka žebříku, trap = mezi možnostmi je i slovo lišící se jedním písmenem, které k cíli nevede. */
  const LEVELS = [{ steps: 2 }, { steps: 3 }, { steps: 3, trap: true }, { steps: 4, trap: true }];

  function makeLadder(L) {
    for (let t = 0; t < 300; t++) {
      const goal = U.pick(WORDS);
      const d = dist(goal);
      const starts = WORDS.filter((w) => d[w] === L.steps);
      if (!starts.length) continue;
      const start = U.pick(starts);
      // Cesta: v každém kroku jediné slovo, které vede nejkratší cestou dál (aby odpověď byla jednoznačná).
      const path = [start];
      let ok = true;
      for (let k = L.steps; k > 0; k--) {
        const nxt = NB[path[path.length - 1]].filter((x) => d[x] === k - 1);
        if (nxt.length !== 1) { ok = false; break; }
        path.push(nxt[0]);
      }
      if (ok) return { path: path, d: d };
    }
    return { path: ['PES', 'LES', 'LED'], d: dist('LED') };
  }

  SM.registerGame({
    id: 'zebrik',
    name: 'Slovní žebřík',
    domain: 'slova',
    trains: 'slovní pohotovost a pružnost myšlení',
    short: 'Po jednom písmenu od slova ke slovu.',
    duration: 'asi 2 minuty',
    pace: { per: 'na krok' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Žebřík vede od horního slova k dolnímu. V každém kroku se smí změnit jen jedno písmeno a vzniknout musí zase slovo.',
        'Ze tří nabízených slov vyberte to, které pravidlo splňuje a vede k cíli. Změněné písmeno se pak zvýrazní.'
      ];
      if (L.trap) steps.push('Pozor: některá nabízená slova se taky liší jen jedním písmenem, ale k cíli by nevedla. Dívejte se i na cílové slovo.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : 3;
      let ok = 0, total = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Žebřík ' + (i + 1) + ' z ' + N);
        const r = await ladder(makeLadder(L));
        ok += r.ok;
        total += r.total;
      }
      const acc = total ? ok / total : 0;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.85, 0.5),
        big: ok + ' z ' + total, bigLabel: 'kroků napoprvé',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      function rungNode(w, prev) {
        return h('div', { class: 'rung', 'data-w': w || '' }, (w || '').split('').map((ch, i) => h('span', { class: 'rung-l' + (prev && prev[i] !== ch ? ' is-changed' : '') }, ch)));
      }

      async function ladder(ld) {
        const p = ld.path;
        ctx.clear();
        const rungs = p.map((w, i) => (i === 0 || i === p.length - 1 ? rungNode(w) : h('div', { class: 'rung is-empty' }, w.split('').map(() => h('span', { class: 'rung-l' }, '?')))));
        rungs[0].classList.add('is-start');
        rungs[p.length - 1].classList.add('is-goal');
        ctx.stage.appendChild(h('div', { class: 'stack zebrik', 'data-path': p.join('|') }, h('div', { class: 'rungs' }, rungs)));
        let ok = 0;
        for (let k = 1; k < p.length - 1; k++) {
          const cur = p[k - 1], right = p[k], remaining = p.length - 1 - k;
          ctx.status('Které slovo patří na další příčku? Cíl: ' + p[p.length - 1] + '.');
          rungs.forEach((el, j) => el.classList.toggle('is-now', j === k));
          // Možnosti: správné slovo, past (liší se o písmeno, ale k cíli nevede) a slova, která se liší víc písmeny.
          const traps = L.trap ? NB[cur].filter((x) => x !== right && p.indexOf(x) === -1 && (ld.d[x] == null || ld.d[x] > remaining)) : [];
          const far = WORDS.filter((x) => x.length === cur.length && diff(cur, x) >= 2 && x !== p[p.length - 1] && p.indexOf(x) === -1);
          const others = U.shuffle(traps).slice(0, 1).concat(U.shuffle(far)).slice(0, 2);
          const t0 = performance.now();
          const r = await K.choose(ctx, U.shuffle([right].concat(others)).map((w) => ({ value: w, label: w })), { answer: right, layout: 'row', cls: 'is-words', noMark: true });
          ctx.mark(r.correct, (performance.now() - t0) / SM.timeScale);
          if (r.correct) ok++;
          const filled = rungNode(right, cur);
          rungs[k].replaceWith(filled);
          rungs[k] = filled;
          ctx.status(r.correct ? 'Správně!' : diff(cur, r.value) > 1 ? 'Slovo ' + r.value + ' se liší víc než jedním písmenem. Správně je ' + right + '.' : 'Ze slova ' + r.value + ' by se k cíli nedalo dojít. Správně je ' + right + '.');
          await ctx.sleep(r.correct ? 900 : 2400);
          ctx.foot.textContent = '';
        }
        // Poslední krok k cíli se doplní sám a zvýrazní se změněné písmeno.
        const last = rungNode(p[p.length - 1], p[p.length - 2]);
        last.classList.add('is-goal');
        rungs[p.length - 1].replaceWith(last);
        rungs.forEach((el) => el.classList.remove('is-now'));
        ctx.feedback(true, { silent: true });
        ctx.status('Žebřík je hotový: ' + p.join(' → ') + '.');
        await K.next(ctx, 'Pokračovat');
        return { ok: ok, total: p.length - 2 };
      }
    }
  });
})();
