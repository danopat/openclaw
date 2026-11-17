/* Otočené tvary — poznat, zda je tvar jen otočený, nebo zrcadlově obrácený (prostorová představivost). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const SIZES = [4, 5, 6, 7];
  const norm = (cells) => {
    const mx = Math.min.apply(null, cells.map((c) => c[0]));
    const my = Math.min.apply(null, cells.map((c) => c[1]));
    return cells.map((c) => [c[0] - mx, c[1] - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  };
  const key = (cells) => norm(cells).map((c) => c.join(',')).join(';');
  const rot = (cells, k) => {
    let c = cells;
    for (let i = 0; i < k; i++) c = c.map((p) => [p[1], -p[0]]);
    return norm(c);
  };
  const mirror = (cells) => norm(cells.map((p) => [-p[0], p[1]]));

  function shape(n) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const cells = [[0, 0]];
      const has = (x, y) => cells.some((c) => c[0] === x && c[1] === y);
      while (cells.length < n) {
        const base = U.pick(cells);
        const dir = U.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
        const x = base[0] + dir[0], y = base[1] + dir[1];
        if (!has(x, y)) cells.push([x, y]);
      }
      const m = key(mirror(cells));
      const chiral = [0, 1, 2, 3].every((k) => key(rot(cells, k)) !== m);
      const w = Math.max.apply(null, norm(cells).map((c) => c[0])) + 1;
      const hh = Math.max.apply(null, norm(cells).map((c) => c[1])) + 1;
      if (chiral && w <= 4 && hh <= 4) return norm(cells);
    }
    return norm([[0, 0], [0, 1], [0, 2], [1, 2]]);
  }
  function draw(cells, cls) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '-0.2 -0.2 4.4 4.4');
    svg.setAttribute('class', 'shape ' + (cls || ''));
    svg.setAttribute('aria-hidden', 'true');
    const w = Math.max.apply(null, cells.map((c) => c[0])) + 1;
    const hh = Math.max.apply(null, cells.map((c) => c[1])) + 1;
    const ox = (4 - w) / 2, oy = (4 - hh) / 2;
    cells.forEach((c) => {
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', c[0] + ox + 0.04);
      r.setAttribute('y', c[1] + oy + 0.04);
      r.setAttribute('width', 0.92);
      r.setAttribute('height', 0.92);
      r.setAttribute('rx', 0.12);
      svg.appendChild(r);
    });
    return svg;
  }

  SM.registerGame({
    id: 'tvary',
    name: 'Otočené tvary',
    domain: 'logika',
    trains: 'prostorovou představivost',
    short: 'Je tvar jen otočený, nebo obrácený?',
    duration: 'asi 1 až 2 minuty',
    maxLevel: SIZES.length,
    howTo: [
      'Uvidíte dva tvary z kostiček.',
      'Pravý tvar je otočený. Představte si, že ho natočíte zpátky.',
      'Je to stejný tvar? Nebo je zrcadlově obrácený, jako levá a pravá rukavice?'
    ],
    async run(ctx) {
      const n = SIZES[ctx.level - 1];
      const N = ctx.short ? 6 : 10;
      const flags = U.shuffle(Array.from({ length: N }, (_, i) => i < N / 2));
      let correct = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        ctx.status('Je to stejný tvar, jen otočený?');
        const a = shape(n);
        const same = flags[i];
        const k = ctx.level === 1 ? U.pick([1, 3]) : U.randInt(1, 3);
        const b = rot(same ? a : mirror(a), k);
        K.show(ctx, h('div', { class: 'shapes' }, draw(a), draw(b, 'is-b')));
        const r = await K.choose(ctx, [
          { label: 'Ano, stejný', value: true },
          { label: 'Ne, obrácený', value: false }
        ], { answer: same, layout: 'row' });
        if (r.correct) correct++;
        ctx.status(r.correct ? 'Správně!' : same ? 'Byl to stejný tvar, jen otočený.' : 'Tvar byl zrcadlově obrácený.');
        await ctx.sleep(r.correct ? 800 : 1900);
      }
      const acc = correct / N;
      ctx.finish({
        perf: U.clamp((acc - 0.5) / 0.5, 0, 1), levelDelta: K.levelByAcc(acc, 0.85, 0.6),
        big: correct + ' z ' + N, bigLabel: 'správných odpovědí',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
