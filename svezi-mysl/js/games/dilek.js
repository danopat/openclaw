/* Chybějící dílek — vybrat dílek, který přesně zapadne do otvoru (pozorné porovnávání tvarů, představa otáčení). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* size = počet políček dílku, rot = dílky jsou pootočené (0 = ne, 1 = o 90°, 2 = libovolně), mirror = mezi špatnými je zrcadlový,
     opts = počet dílků v nabídce. */
  const LEVELS = [
    { size: [4, 4], rot: 0, opts: 3 },
    { size: [4, 5], rot: 1, opts: 3 },
    { size: [5, 5], rot: 2, opts: 4 },
    { size: [5, 6], rot: 2, opts: 4, mirror: true },
    { size: [6, 7], rot: 2, opts: 4, mirror: true }
  ];
  const BOARD = 6;

  /* Tvar = pole [řádek, sloupec]; normalizace posune tvar do rohu a seřadí políčka. */
  const norm = (cells) => {
    const r0 = Math.min.apply(null, cells.map((c) => c[0])), c0 = Math.min.apply(null, cells.map((c) => c[1]));
    return cells.map((c) => [c[0] - r0, c[1] - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  };
  const sig = (cells) => norm(cells).map((c) => c.join(':')).join('|');
  const rot90 = (cells) => norm(cells.map((c) => [c[1], -c[0]]));
  const mirror = (cells) => norm(cells.map((c) => [c[0], -c[1]]));
  function rotations(cells) {
    const out = [norm(cells)];
    for (let i = 0; i < 3; i++) out.push(rot90(out[out.length - 1]));
    return out;
  }
  const sameUpToRot = (a, b) => rotations(a).some((r) => sig(r) === sig(b));

  /* Náhodný souvislý tvar o n políčkách. */
  function grow(n) {
    const cells = [[0, 0]];
    const has = (r, c) => cells.some((x) => x[0] === r && x[1] === c);
    while (cells.length < n) {
      const base = U.pick(cells);
      const d = U.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      const r = base[0] + d[0], c = base[1] + d[1];
      if (!has(r, c)) cells.push([r, c]);
    }
    return norm(cells);
  }
  const span = (cells) => [Math.max.apply(null, cells.map((c) => c[0])) + 1, Math.max.apply(null, cells.map((c) => c[1])) + 1];

  /* Špatný dílek: posunuté jedno políčko, nebo jiný tvar stejné velikosti; nesmí jít otočením převést na správný. */
  function wrongPiece(shape, used) {
    for (let t = 0; t < 200; t++) {
      let cand;
      if (Math.random() < 0.7) {
        const cells = shape.slice();
        cells.splice(U.randInt(0, cells.length - 1), 1);
        const has = (r, c) => cells.some((x) => x[0] === r && x[1] === c);
        const free = [];
        cells.forEach((x) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach((d) => { if (!has(x[0] + d[0], x[1] + d[1])) free.push([x[0] + d[0], x[1] + d[1]]); }));
        cells.push(U.pick(free));
        cand = norm(cells);
        if (!connected(cand)) continue;
      } else cand = grow(shape.length);
      if (sameUpToRot(cand, shape) || sameUpToRot(cand, mirror(shape))) continue;
      if (used.some((u) => sameUpToRot(cand, u))) continue;
      const sp = span(cand);
      if (sp[0] > 4 || sp[1] > 4) continue;
      return cand;
    }
    return null;
  }
  function connected(cells) {
    const key = (c) => c[0] + ':' + c[1];
    const set = new Set(cells.map(key));
    const seen = new Set([key(cells[0])]);
    const q = [cells[0]];
    while (q.length) {
      const c = q.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach((d) => {
        const k = (c[0] + d[0]) + ':' + (c[1] + d[1]);
        if (set.has(k) && !seen.has(k)) { seen.add(k); q.push([c[0] + d[0], c[1] + d[1]]); }
      });
    }
    return seen.size === cells.length;
  }

  function makeTask(L) {
    for (let t = 0; t < 300; t++) {
      const shape = grow(U.randInt(L.size[0], L.size[1]));
      const sp = span(shape);
      if (sp[0] > 4 || sp[1] > 4) continue;
      const mir = mirror(shape);
      const chiral = !sameUpToRot(mir, shape);
      if (L.mirror && !chiral) continue;
      const turn = L.rot === 0 ? 0 : L.rot === 1 ? U.pick([1, 3]) : U.randInt(1, 3);
      const show = (cells) => { let c = norm(cells); const k = L.rot === 0 ? 0 : L.rot === 1 ? U.pick([1, 3]) : U.randInt(0, 3); for (let i = 0; i < k; i++) c = rot90(c); return c; };
      let right = norm(shape);
      for (let i = 0; i < turn; i++) right = rot90(right);
      const wrongs = [];
      if (L.mirror) wrongs.push(show(mir));
      while (wrongs.length < L.opts - 1) {
        const w = wrongPiece(shape, wrongs);
        if (!w) break;
        wrongs.push(show(w));
      }
      if (wrongs.length < L.opts - 1) continue;
      const r0 = U.randInt(0, BOARD - sp[0]), c0 = U.randInt(0, BOARD - sp[1]);
      const hole = shape.map((c) => [c[0] + r0, c[1] + c0]);
      return { hole: hole, right: right, wrongs: wrongs, shape: shape };
    }
    return null;
  }

  function pieceNode(cells, cls) {
    const sp = span(cells);
    const g = h('span', { class: 'piece' + (cls ? ' ' + cls : ''), style: { '--pr': sp[0], '--pc': sp[1] } });
    cells.forEach((c) => g.appendChild(h('i', { style: { gridRow: c[0] + 1, gridColumn: c[1] + 1 } })));
    return g;
  }

  SM.registerGame({
    id: 'dilek',
    name: 'Chybějící dílek',
    domain: 'postreh',
    trains: 'pozorné porovnávání tvarů a představu otáčení',
    short: 'Který dílek zapadne do otvoru?',
    duration: 'asi 2 minuty',
    pace: { per: 'na úlohu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = ['V desce chybí kus. Klepněte na dílek, který do otvoru přesně zapadne.'];
      if (L.rot === 0) steps.push('Dílky jsou natočené stejně jako otvor.');
      else steps.push('Dílky můžou být pootočené, ale ne převrácené. Tlačítko „Otočit“ je všechny pootočí, ať si to můžete vyzkoušet.');
      if (L.mirror) steps.push('Pozor: jeden dílek je zrcadlově převrácený, ten nezapadne.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 4 : 6;
      let ok = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Úloha ' + (i + 1) + ' z ' + N);
        if (await task(makeTask(L))) ok++;
      }
      const acc = ok / N;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.85, 0.5),
        big: ok + ' z ' + N, bigLabel: 'dílků správně',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      async function task(t) {
        ctx.clear();
        ctx.status('Který dílek zapadne do otvoru?');
        const holeSet = new Set(t.hole.map((c) => c[0] * BOARD + c[1]));
        const board = h('div', { class: 'dboard', style: { '--n': BOARD } });
        const cells = [];
        for (let i = 0; i < BOARD * BOARD; i++) {
          const el = h('span', { class: 'dcell' + (holeSet.has(i) ? ' is-hole' : '') + ((Math.floor(i / BOARD) + i) % 2 ? ' is-alt' : '') });
          cells.push(el);
          board.appendChild(el);
        }
        const opts = U.shuffle([{ cells: t.right, ok: true }].concat(t.wrongs.map((w) => ({ cells: w, ok: false }))));
        const nodes = opts.map((o) => pieceNode(o.cells));
        let turn = 0;
        const rotateBtn = L.rot ? h('button', { class: 'btn btn-secondary btn-small dilek-rot', type: 'button' }, SM.ui.icon('replay'), 'Otočit') : null;
        const box = h('div', { class: 'stack dilek', 'data-right': opts.findIndex((o) => o.ok) }, board, rotateBtn);
        ctx.stage.appendChild(box);
        const t0 = performance.now();
        const wait = K.choose(ctx, opts.map((o, k) => ({ value: k, label: 'Dílek ' + (k + 1), aria: 'Dílek ' + (k + 1), node: nodes[k] })), { answer: opts.findIndex((o) => o.ok), layout: 'row', cls: 'is-pieces', noMark: true });
        if (rotateBtn) {
          U.tap(rotateBtn, () => {
            turn = (turn + 1) % 4;
            nodes.forEach((n) => { n.style.transform = 'rotate(' + turn * 90 + 'deg)'; });
            ctx.sound.tap();
          });
        }
        const r = await wait;
        ctx.mark(r.correct, (performance.now() - t0) / SM.timeScale);
        if (rotateBtn) rotateBtn.disabled = true;
        // Správný dílek se vsune do otvoru.
        t.hole.forEach((c) => cells[c[0] * BOARD + c[1]].classList.add('is-filled'));
        ctx.status(r.correct ? 'Správně, zapadne přesně!' : 'Do otvoru zapadne dílek označený zeleně.');
        await ctx.sleep(r.correct ? 1100 : 2200);
        return r.correct;
      }
    }
  });
})();
