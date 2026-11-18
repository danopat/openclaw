/* Otočené stavby — čtyři stavby z kostek, tři jsou stejné, jen otočené, jedna je jiná (otáčení těles v představě).
   Po odpovědi se stavby krok za krokem otočí do stejné polohy. Kreslení kostek sdílí se Stavbou z kostek (SM.cubes). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;
  const C = SM.cubes;

  /* Otočení o 90° (kostky [x, y, z]): kolem svislé osy, kolem vodorovných os; zrcadlo zleva doprava. */
  const RZ = (v) => [-v[1], v[0], v[2]];
  const RZI = (v) => [v[1], -v[0], v[2]];
  const RX = (v) => [v[0], -v[2], v[1]];
  const RXI = (v) => [v[0], v[2], -v[1]];
  const RY = (v) => [v[2], v[1], -v[0]];
  const MIR = (v) => [-v[0], v[1], v[2]];
  function norm(vs) {
    const mn = [0, 1, 2].map((i) => Math.min.apply(null, vs.map((v) => v[i])));
    return vs.map((v) => [v[0] - mn[0], v[1] - mn[1], v[2] - mn[2]]);
  }
  const key = (vs) => norm(vs).map((v) => v.join(',')).sort().join(';');
  const rot = (vs, ops) => norm(ops.reduce((acc, op) => acc.map(op), vs));
  const ZROTS = [[], [RZ], [RZ, RZ], [RZ, RZ, RZ]];
  const ALL = [];
  [[], [RX], [RX, RX], [RX, RX, RX], [RY], [RY, RY, RY]].forEach((t) => ZROTS.forEach((z) => ALL.push(t.concat(z))));
  const TWO = [];
  [[], [RX], [RX, RX], [RX, RX, RX]].forEach((t) => ZROTS.forEach((z) => TWO.push(t.concat(z))));
  /* Dají se dvě sady kostek otočením (ze seznamu rots) převést jedna na druhou? */
  const same = (A, B, rots) => { const kb = key(B); return rots.some((r) => key(rot(A, r)) === kb); };

  /* building = stavba stojící na zemi (výšková mapa), snake = lomený „had“ z kostek ve vzduchu.
     odd: count = o kostku víc nebo míň, move = jedna kostka jinde, mirror = zrcadlová. rots: z = jen kolem svislé osy, xz = kolem dvou os. */
  const LEVELS = [
    { kind: 'building', n: 3, maxH: 2, cubes: [4, 5], odd: 'count', rots: 'z' },
    { kind: 'building', n: 3, maxH: 2, cubes: [5, 6], odd: 'move', rots: 'z' },
    { kind: 'building', n: 3, maxH: 3, cubes: [5, 7], odd: 'mirror', rots: 'z' },
    { kind: 'snake', len: [6, 7], odd: 'mirror', rots: 'xz' }
  ];
  const WHY = { more: 'Má o kostku víc.', less: 'Má o kostku míň.', move: 'Jedna kostka je jinde.', mirror: 'Je zrcadlově obrácená.' };
  const SWAP = (v) => [v[1], v[0], v[2]]; // zrcadlo, které v kresbě vypadá jako převrácení zleva doprava

  /* Je dobře vidět každá kostka? (vrchní kostky sloupců celou stěnou, ostatní aspoň kouskem; u hada každá celou stěnou) */
  function fair(vs, snake) {
    const cnt = C.shown(vs);
    const has = {};
    vs.forEach((v) => { has[v.join()] = true; });
    return vs.every((v, i) => cnt[i] >= (snake || !has[[v[0], v[1], v[2] + 1].join()] ? 2 : 1));
  }
  const heightsOf = (vs) => {
    const n = 1 + Math.max.apply(null, vs.map((v) => Math.max(v[0], v[1])));
    const H = Array.from({ length: n }, () => Array(n).fill(0));
    vs.forEach((v) => { H[v[1]][v[0]] = Math.max(H[v[1]][v[0]], v[2] + 1); });
    return H;
  };
  function building(L) {
    for (let t = 0; t < 600; t++) {
      const H = Array.from({ length: L.n }, () => Array.from({ length: L.n }, () => (Math.random() < 0.42 ? 0 : U.randInt(1, L.maxH))));
      const total = C.count(H);
      if (total < L.cubes[0] || total > L.cubes[1] || !C.connected(H)) continue;
      const v = norm(C.fromHeights(H));
      if (new Set(ZROTS.map((r) => key(rot(v, r)))).size < 4) continue; // bez otočné souměrnosti, ať každá poloha vypadá jinak
      if (L.odd === 'mirror' && same(v, v.map(MIR), ZROTS)) continue; // zrcadlo musí být opravdu jiné
      return v;
    }
    return null;
  }
  function snake(L) {
    const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    for (let t = 0; t < 600; t++) {
      const len = U.randInt(L.len[0], L.len[1]);
      const cells = [[0, 0, 0]];
      const has = { '0,0,0': true };
      let dir = null, ok = true;
      while (ok && cells.length < len) {
        const d = U.pick(DIRS.filter((q) => !dir || q[0] * dir[0] + q[1] * dir[1] + q[2] * dir[2] === 0));
        const arm = U.randInt(1, 2);
        for (let i = 0; i < arm && cells.length < len; i++) {
          const last = cells[cells.length - 1];
          const nx = [last[0] + d[0], last[1] + d[1], last[2] + d[2]];
          // nová kostka se smí dotýkat jen té předchozí, aby byl tvar čitelný
          const touch = DIRS.some((q) => { const k = [nx[0] + q[0], nx[1] + q[1], nx[2] + q[2]].join(); return has[k] && k !== last.join(); });
          if (has[nx.join()] || touch) { ok = false; break; }
          has[nx.join()] = true;
          cells.push(nx);
        }
        dir = d;
      }
      if (!ok || cells.length < len) continue;
      const v = norm(cells);
      if (same(v, v.map(MIR), ALL)) continue;
      return v;
    }
    return null;
  }
  /* Jiná stavba: o kostku víc nebo míň, nebo jedna kostka přesunutá. Pořád stojí na zemi a drží pohromadě. */
  function changed(v, mode) {
    const H = heightsOf(v);
    const n = H.length;
    for (let t = 0; t < 300; t++) {
      const G = H.map((r) => r.slice());
      const cells = [];
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) cells.push([x, y]);
      const tops = cells.filter((c) => G[c[1]][c[0]] > 0);
      let why = mode;
      if (mode === 'count') why = Math.random() < 0.6 || C.count(G) <= 4 ? 'more' : 'less';
      if (why === 'less' || why === 'move') { const c = U.pick(tops); G[c[1]][c[0]]--; }
      if (why === 'more' || why === 'move') { const c = U.pick(cells); if (G[c[1]][c[0]] >= 3) continue; G[c[1]][c[0]]++; }
      if (!C.connected(G)) continue;
      const w = norm(C.fromHeights(G));
      if (same(v, w, ZROTS) || same(v, w.map(MIR), ZROTS) && why === 'move') continue; // přesun nesmí dát jen otočenou nebo zrcadlovou stavbu
      return { vox: w, why: why };
    }
    return null;
  }

  /* Úloha: základní tvar, jiný tvar a čtyři polohy. */
  function makeTask(L) {
    const rots = L.rots === 'z' ? ZROTS : TWO;
    for (let t = 0; t < 200; t++) {
      const base = L.kind === 'snake' ? snake(L) : building(L);
      if (!base) continue;
      let odd, why = L.odd;
      if (L.odd === 'mirror') odd = norm(base.map(MIR));
      else {
        const c = changed(base, L.odd);
        if (!c) continue;
        odd = c.vox;
        why = c.why;
      }
      const pick = L.rots === 'z' ? U.shuffle([0, 1, 2, 3]) : U.sample(rots.map((_, i) => i), 4);
      const oddAt = U.randInt(0, 3);
      const items = pick.map((ri, i) => ({ src: i === oddAt ? odd : base, ops: rots[ri] }));
      items.forEach((it) => { it.vox = rot(it.src, it.ops); });
      const same3 = items.filter((_, i) => i !== oddAt).map((it) => key(it.vox));
      if (new Set(same3).size < 3) continue; // stejné stavby musí být opravdu v různých polohách
      if (!items.every((it) => fair(it.vox, L.kind === 'snake'))) continue;
      return { items: items, oddAt: oddAt, why: why };
    }
    return null;
  }

  /* Nejkratší řada otočení, která převede kostky do cílové polohy (stavy = podoby tvaru). */
  function path(from, goal, L) {
    const gens = L.rots === 'z' ? [RZ, RZI] : [RZ, RZI, RX, RXI];
    const target = key(goal);
    const prev = {};
    const start = key(from);
    prev[start] = null;
    const queue = [norm(from)];
    while (queue.length) {
      const cur = queue.shift();
      const ck = key(cur);
      if (ck === target) {
        const frames = [];
        let k = ck, node = cur;
        while (prev[k]) { frames.unshift(node); node = prev[k].vox; k = prev[k].k; }
        return frames;
      }
      gens.forEach((g) => {
        const nx = norm(cur.map(g));
        const nk = key(nx);
        if (!(nk in prev)) { prev[nk] = { k: ck, vox: cur }; queue.push(nx); }
      });
    }
    return [];
  }

  SM.registerGame({
    id: 'stavby',
    name: 'Otočené stavby',
    domain: 'logika',
    trains: 'otáčení těles v představě',
    short: 'Tři stavby jsou stejné, jen otočené. Která je jiná?',
    duration: 'asi 3 minuty',
    pace: { per: 'na úlohu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jedna úloha dané úrovně (pro kontrolu generátoru). */
    gen(level) { return makeTask(LEVELS[level - 1]); },
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = ['Uvidíte čtyři stavby z kostek. Tři jsou úplně stejné, jen jinak otočené. Jedna je jiná.'];
      steps.push(L.rots === 'z' ? 'Stavby stojí na zemi a otáčejí se jen dokola, jako na otočném talíři.' : 'Kostky tvoří lomený tvar a otáčí se i převrací.');
      steps.push({ count: 'Jiná stavba má o kostku víc nebo míň.', move: 'Jiná stavba má jednu kostku jinde.', mirror: 'Jiná stavba je zrcadlová: jako levá a pravá rukavice.' }[L.odd] + ' Klepněte na ni.');
      steps.push('Potom se stavby otočí do stejné polohy, takže uvidíte, v čem se liší.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      let ok = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Úloha ' + (i + 1) + ' z ' + N);
        if (await one()) ok++;
      }
      const acc = ok / N;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: ok + ' z ' + N, bigLabel: 'jiných staveb nalezeno',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      async function one() {
        const T = makeTask(L);
        if (!T) return false;
        ctx.clear();
        // Otáčení po odpovědi: všechny stavby do polohy první stejné stavby, krok za krokem (předem, kvůli společnému měřítku).
        const ref = T.items.findIndex((_, i) => i !== T.oddAt);
        // Zrcadlová stavba skončí jako přesný zrcadlový obraz ostatních (v kresbě převrácená zleva doprava).
        const goal = (it, i) => (i === T.oddAt && T.why === 'mirror' ? norm(rot(T.items[ref].src, T.items[ref].ops).map(SWAP)) : rot(it.src, T.items[ref].ops));
        const paths = T.items.map((it, i) => path(it.vox, goal(it, i), L));
        const steps = Math.max.apply(null, paths.map((p) => p.length));
        const frames = [T.items.map((it) => C.layout(it.vox, { s: 20 }))];
        for (let k = 1; k <= steps; k++) frames.push(T.items.map((it, i) => C.layout(paths[i][Math.min(k, paths[i].length) - 1] || it.vox, { s: 20 })));
        // Společné měřítko pro všechny stavby i snímky, aby se kresby nezvětšovaly a nezmenšovaly.
        let W = 0, Hh = 0;
        frames.forEach((lays) => lays.forEach((l) => { W = Math.max(W, l.w); Hh = Math.max(Hh, l.h); }));
        const cards = T.items.map((it, i) => h('button', { class: 'st-card', type: 'button', 'aria-label': 'Stavba ' + (i + 1) }));
        const draw = (lays) => { cards.forEach((c, i) => { c.innerHTML = C.toSvg(lays[i], { w: W, h: Hh }); }); };
        draw(frames[0]);
        const wrap = h('div', { class: 'st-grid' }, cards);
        const stack = h('div', { class: 'stack stavby', 'data-a': T.oddAt }, wrap);
        ctx.stage.appendChild(stack);
        ctx.status('Která stavba je jiná?');
        fit(wrap);
        const t0 = performance.now();
        const choice = await new Promise((resolve) => {
          let done = false;
          cards.forEach((c, i) => U.tap(c, () => { if (!done && ctx.alive) { done = true; resolve(i); } }));
        });
        const okk = choice === T.oddAt;
        ctx.mark(okk, (performance.now() - t0) / SM.timeScale);
        cards.forEach((c) => { c.disabled = true; });
        stack.classList.add('is-done');
        cards[T.oddAt].classList.add('is-correct');
        if (!okk) cards[choice].classList.add('is-wrong');
        ctx.feedback(okk);
        ctx.status((okk ? 'Správně! ' : 'Jiná byla tahle. ') + WHY[T.why]);
        fit(wrap);
        await ctx.sleep(okk ? 1200 : 2200);

        if (steps > 0) {
          ctx.status('Stavby se otáčejí stejně…');
          fit(wrap);
          const list = K.reducedMotion() ? [frames[frames.length - 1]] : frames.slice(1);
          for (const lays of list) {
            await ctx.sleep(K.reducedMotion() ? 200 : 750);
            draw(lays);
          }
        }
        ctx.status('Teď stojí stejně. ' + WHY[T.why]);
        const nx = K.next(ctx, 'Další úloha');
        fit(wrap);
        await nx;
        return okk;
      }

      /* Mřížka staveb vyplní místo nad tlačítky (2 × 2 čtverce). */
      function fit(wrap) {
        const w = Math.min(ctx.size().w, 560);
        const side = Math.floor(Math.min((w - 12) / 2, (ctx.stage.clientHeight - 24) / 2));
        wrap.style.gridTemplateColumns = 'repeat(2, ' + Math.max(90, side) + 'px)';
        wrap.style.gridAutoRows = Math.max(90, side) + 'px';
      }
    }
  });
})();
