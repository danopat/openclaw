/* Stavba z kostek — kolik kostek je ve stavbě nakreslené ve 3D, včetně schovaných (prostorová představivost). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Kreslení staveb z kostek v SVG (izometrie). Výšková mapa heights[r][c]: r = řádek odzadu dopředu, c = sloupec zleva.
     Znovu se dá použít pro další hry (pohled z boku, otočené stavby). */
  SM.cubes = {
    svg(heights, s) {
      const n = heights.length, m = heights[0].length;
      const maxH = Math.max.apply(null, heights.map((row) => Math.max.apply(null, row)));
      const W = (n + m) * s + 4, H = (n + m) * s / 2 + s + maxH * s + 4;
      const ox = n * s + 2, oy = maxH * s + 2;
      const cubes = [];
      for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) for (let z = 0; z < heights[r][c]; z++) cubes.push([r, c, z]);
      cubes.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]);
      const pt = (x, y) => x.toFixed(1) + ',' + y.toFixed(1);
      let out = '';
      cubes.forEach((q) => {
        const x = ox + (q[1] - q[0]) * s, y = oy + (q[1] + q[0]) * s / 2 - q[2] * s;
        const top = [pt(x, y), pt(x + s, y + s / 2), pt(x, y + s), pt(x - s, y + s / 2)];
        const left = [pt(x - s, y + s / 2), pt(x, y + s), pt(x, y + 2 * s), pt(x - s, y + 1.5 * s)];
        const right = [pt(x, y + s), pt(x + s, y + s / 2), pt(x + s, y + 1.5 * s), pt(x, y + 2 * s)];
        out += '<polygon class="cb-t" points="' + top.join(' ') + '"/><polygon class="cb-l" points="' + left.join(' ') + '"/><polygon class="cb-r" points="' + right.join(' ') + '"/>';
      });
      return '<svg viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" width="' + W.toFixed(0) + '" height="' + H.toFixed(0) + '" aria-hidden="true">' + out + '</svg>';
    },
    count(heights) { return heights.reduce((a, row) => a + row.reduce((b, v) => b + v, 0), 0); }
  };

  /* n = velikost podstavy, maxH = nejvyšší sloupec, hidden = smí být schované kostky, compare = porovnat dvě stavby. */
  /* max = nejvýš kostek ve stavbě, aby se daly spočítat. */
  const LEVELS = [
    { n: 2, maxH: 2, hidden: false, max: 6 },
    { n: 3, maxH: 2, hidden: false, max: 10 },
    { n: 3, maxH: 3, hidden: true, max: 14 },
    { n: 4, maxH: 3, hidden: true, max: 18 },
    { n: 3, maxH: 3, hidden: true, compare: true, max: 14 }
  ];

  /* Je každá kostka aspoň zčásti vidět? (vrchní kostka sloupce, nebo nižší sousedé vpředu) */
  function allVisible(H) {
    const n = H.length;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        for (let z = 0; z < H[r][c] - 1; z++) {
          const front = r + 1 < n ? H[r + 1][c] : 0, right = c + 1 < n ? H[r][c + 1] : 0;
          if (front > z && right > z) return false;
        }
      }
    }
    return true;
  }
  function makeHeights(L) {
    for (let t = 0; t < 500; t++) {
      const H = Array.from({ length: L.n }, () => Array.from({ length: L.n }, () => U.randInt(0, L.maxH)));
      // Zadní řady bývají vyšší, aby stavba byla přehledná; aspoň polovina políček obsazená.
      H.forEach((row, r) => row.forEach((v, c) => { if (r === 0 && c === 0) H[r][c] = Math.max(1, v); }));
      const filled = H.flat().filter((v) => v > 0).length;
      if (filled < Math.ceil(L.n * L.n / 2)) continue;
      if (SM.cubes.count(H) > L.max) continue;
      const vis = allVisible(H);
      if (!L.hidden && !vis) continue;
      if (L.hidden && vis && L.n > 2) continue; // na vyšších úrovních aspoň jedna schovaná kostka
      return H;
    }
    return [[2, 1], [1, 1]];
  }

  SM.registerGame({
    id: 'kostky',
    name: 'Stavba z kostek',
    domain: 'logika',
    trains: 'prostorovou představivost',
    short: 'Kolik kostek je ve stavbě?',
    duration: 'asi 2 minuty',
    pace: { per: 'na stavbu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = ['Stavba je složená ze stejných kostek. Žádná kostka nevisí ve vzduchu: pod každou je jiná kostka nebo podlaha.'];
      steps.push(L.compare ? 'Uvidíte dvě stavby. Klepněte na tu, ve které je víc kostek, nebo na „Stejně“.' : 'Spočítejte, kolik kostek stavba má, a vyberte číslo.');
      if (L.hidden) steps.push('Počítají se i kostky, které nejsou vidět, protože jsou schované pod jinými nebo za nimi.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      let ok = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Stavba ' + (i + 1) + ' z ' + N);
        if (await (L.compare ? compare() : count())) ok++;
      }
      const acc = ok / N;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: ok + ' z ' + N, bigLabel: L.compare ? 'porovnání správně' : 'staveb spočítaných správně',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      function size(n, twin) {
        const sz = ctx.size();
        const W = (twin ? (sz.w - 24) / 2 : Math.min(sz.w, 420)) - 8;
        return Math.floor(U.clamp(W / (2 * n), 16, 46));
      }

      async function count() {
        const H = makeHeights(L);
        const total = SM.cubes.count(H);
        ctx.clear();
        ctx.status('Kolik kostek je ve stavbě?');
        const pic = h('div', { class: 'cubes' });
        pic.innerHTML = SM.cubes.svg(H, size(L.n, false));
        ctx.stage.appendChild(h('div', { class: 'stack kostky', 'data-a': total, 'aria-label': 'Stavba z kostek' }, pic));
        const nums = U.shuffle([total, total + 1, total - 1, total + U.pick([2, -2])].filter((v, i, a) => v > 0 && a.indexOf(v) === i)).sort((a, b) => a - b);
        const t0 = performance.now();
        const r = await K.choose(ctx, nums.map((v) => ({ value: v, label: String(v) })), { answer: total, layout: 'row', cls: 'is-mono', noMark: true });
        ctx.mark(r.correct, (performance.now() - t0) / SM.timeScale);
        const hiddenN = total - visibleCount(H);
        const kn = (v, a, b, c) => v + ' ' + U.plural(v, a, b, c);
        ctx.status(r.correct ? 'Správně, ' + kn(total, 'kostka', 'kostky', 'kostek') + '!' : 'Stavba má ' + kn(total, 'kostku', 'kostky', 'kostek') +
          (hiddenN > 0 ? ', z toho ' + kn(hiddenN, 'schovanou', 'schované', 'schovaných') + '.' : '.'));
        await ctx.sleep(r.correct ? 1100 : 2600);
        return r.correct;
      }

      async function compare() {
        let A, B;
        for (let t = 0; t < 50; t++) {
          A = makeHeights(L);
          B = makeHeights(L);
          if (Math.abs(SM.cubes.count(A) - SM.cubes.count(B)) <= 2) break;
        }
        const a = SM.cubes.count(A), b = SM.cubes.count(B);
        const answer = a > b ? 'L' : b > a ? 'R' : '=';
        ctx.clear();
        ctx.status('Ve které stavbě je víc kostek?');
        const s = size(L.n, true);
        const left = h('div', { class: 'cubes' }), right = h('div', { class: 'cubes' });
        left.innerHTML = SM.cubes.svg(A, s);
        right.innerHTML = SM.cubes.svg(B, s);
        ctx.stage.appendChild(h('div', { class: 'stack kostky', 'data-a': answer }, h('div', { class: 'cubes-two' }, left, right)));
        const t0 = performance.now();
        const r = await K.choose(ctx, [{ value: 'L', label: 'V\u00a0levé' }, { value: '=', label: 'Stejně' }, { value: 'R', label: 'V\u00a0pravé' }], { answer: answer, layout: 'row', noMark: true });
        ctx.mark(r.correct, (performance.now() - t0) / SM.timeScale);
        const kn = (v) => v + ' ' + U.plural(v, 'kostka', 'kostky', 'kostek');
        ctx.status((r.correct ? 'Správně! ' : '') + 'Vlevo: ' + kn(a) + ', vpravo: ' + kn(b) + '.');
        await ctx.sleep(r.correct ? 1300 : 2600);
        return r.correct;
      }

      function visibleCount(H) {
        let v = 0;
        const n = H.length;
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) for (let z = 0; z < H[r][c]; z++) {
          const front = r + 1 < n ? H[r + 1][c] : 0, rightH = c + 1 < n ? H[r][c + 1] : 0;
          if (z === H[r][c] - 1 || front <= z || rightH <= z) v++;
        }
        return v;
      }
    }
  });
})();
