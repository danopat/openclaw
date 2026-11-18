/* Skládání krychle — rozložená krychle (síť) se značkami: kterou krychli z ní jde složit? (prostorová představivost).
   Po odpovědi se síť na obrazovce složí do krychle a otočí se do polohy správné odpovědi. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* ---------- Krychle: stěny jako směry v prostoru (x doprava, y nahoru, z k divákovi) ---------- */
  const DIRS = { F: [0, 0, 1], K: [0, 0, -1], R: [1, 0, 0], L: [-1, 0, 0], T: [0, 1, 0], B: [0, -1, 0] };
  const NAMES = Object.keys(DIRS);
  const vkey = (v) => v.join();
  const BYVEC = {};
  NAMES.forEach((n) => { BYVEC[vkey(DIRS[n])] = n; });
  const neg = (n) => BYVEC[vkey(DIRS[n].map((c) => -c))];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const right = (front, up) => BYVEC[vkey(cross(DIRS[up], DIRS[front]))];

  /* Jedenáct sítí krychle (sloupec, řádek). Hry je ještě náhodně otáčejí a zrcadlí. */
  const NETS = [
    [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], // kříž
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]],
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],
    [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [1, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
    [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]]
  ];
  /* Otočení a zrcadlení sítě v rovině, posun do kladných souřadnic. */
  function place(net, t) {
    let cells = net.map((c) => c.slice());
    for (let i = 0; i < t.rot; i++) cells = cells.map((c) => [-c[1], c[0]]);
    if (t.flip) cells = cells.map((c) => [-c[0], c[1]]);
    const mx = Math.min.apply(null, cells.map((c) => c[0])), my = Math.min.apply(null, cells.map((c) => c[1]));
    return cells.map((c) => [c[0] - mx, c[1] - my]);
  }
  /* Složení sítě: každé políčko dostane stěnu krychle a směr „nahoru“ své značky (kterou stěnou míří horní okraj políčka).
     Základní políčko je přední stěna, ostatní se ohýbají dozadu. Vrací i strom ohybů pro animaci. */
  function fold(cells, baseIdx) {
    const at = {};
    cells.forEach((c, i) => { at[c.join()] = i; });
    const info = cells.map(() => null);
    info[baseIdx] = { face: 'F', up: 'T', parent: -1, side: null };
    const queue = [baseIdx];
    while (queue.length) {
      const i = queue.shift();
      const c = cells[i], f = info[i];
      [[1, 0, 'r'], [-1, 0, 'l'], [0, -1, 'u'], [0, 1, 'd']].forEach((d) => {
        const j = at[(c[0] + d[0]) + ',' + (c[1] + d[1])];
        if (j == null || info[j]) return;
        let face, up;
        if (d[2] === 'r') { face = right(f.face, f.up); up = f.up; }
        else if (d[2] === 'l') { face = neg(right(f.face, f.up)); up = f.up; }
        else if (d[2] === 'u') { face = f.up; up = neg(f.face); }
        else { face = neg(f.up); up = f.face; }
        info[j] = { face: face, up: up, parent: i, side: d[2] };
        queue.push(j);
      });
    }
    return info;
  }

  /* ---------- Značky (v rámečku 100 × 100, „nahoru“ = k hornímu okraji). per = po kolika stupních vypadá stejně ---------- */
  const dot = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="9"/>';
  const SYMBOLS = {
    kruh: { per: 90, col: '#2c69d6', svg: '<circle cx="50" cy="50" r="27"/>' },
    ctverec: { per: 90, col: '#e07b00', svg: '<rect x="25" y="25" width="50" height="50" rx="4"/>' },
    kriz: { per: 90, col: '#3a9a4a', svg: '<path d="M40 18h20v22h22v20H60v22H40V60H18V40h22z"/>' },
    krouzek: { per: 90, col: '#8a4fd0', svg: '<circle cx="50" cy="50" r="24" fill="none" stroke-width="12"/>' },
    iks: { per: 90, col: '#c0392b', svg: '<path d="M27 20l23 23 23-23 7 7-23 23 23 23-7 7-23-23-23 23-7-7 23-23-23-23z"/>' },
    ctyri: { per: 90, col: '#4a4a4a', svg: dot(30, 30) + dot(70, 30) + dot(30, 70) + dot(70, 70) },
    sipka: { per: 360, col: '#2c69d6', svg: '<path d="M50 14l28 32H60v40H40V46H22z"/>' },
    trojuhelnik: { per: 360, col: '#e07b00', svg: '<path d="M50 18l34 62H16z"/>' },
    vlajka: { per: 360, col: '#3a9a4a', svg: '<path d="M30 14h8v72h-8zM38 16l36 14-36 14z"/>' },
    pulka: { per: 360, col: '#8a4fd0', svg: '<rect x="22" y="22" width="56" height="56" rx="4" fill="none" stroke-width="7"/><rect x="22" y="22" width="56" height="28"/>' },
    k1: { per: 90, col: '#2b2b2b', svg: dot(50, 50) },
    k2: { per: 180, col: '#2b2b2b', svg: dot(30, 30) + dot(70, 70) },
    k3: { per: 180, col: '#2b2b2b', svg: dot(28, 28) + dot(50, 50) + dot(72, 72) },
    k4: { per: 90, col: '#2b2b2b', svg: dot(30, 30) + dot(70, 30) + dot(30, 70) + dot(70, 70) },
    k5: { per: 90, col: '#2b2b2b', svg: dot(28, 28) + dot(72, 28) + dot(50, 50) + dot(28, 72) + dot(72, 72) },
    k6: { per: 180, col: '#2b2b2b', svg: dot(30, 26) + dot(70, 26) + dot(30, 50) + dot(70, 50) + dot(30, 74) + dot(70, 74) }
  };
  const symSvg = (name, deg) => {
    const s = SYMBOLS[name];
    return '<g transform="rotate(' + (deg || 0) + ' 50 50)" fill="' + s.col + '" stroke="' + s.col + '">' + s.svg + '</g>';
  };

  /* n = síť (0 = kříž, null = náhodná), sets = značky, opts = počet možností */
  const LEVELS = [
    { net: 0, sets: ['kruh', 'ctverec', 'kriz', 'krouzek', 'iks', 'ctyri'], opts: 3 },
    { net: null, sets: ['kruh', 'ctverec', 'kriz', 'krouzek', 'iks', 'ctyri'], opts: 4 },
    { net: null, sets: ['sipka', 'trojuhelnik', 'vlajka', 'kruh', 'kriz', 'ctverec'], opts: 4 },
    { net: null, sets: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'], opts: 4 }
  ];

  /* ---------- Otočení krychle (24 poloh) jako matice 3 × 3 ---------- */
  const mul = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
  const app = (M, v) => M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
  const RX = [[1, 0, 0], [0, 0, -1], [0, 1, 0]], RY = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const ROTS = (() => {
    const out = {};
    const stack = [I3];
    while (stack.length) {
      const m = stack.pop();
      const k = m.join(';');
      if (out[k]) continue;
      out[k] = m;
      stack.push(mul(RX, m), mul(RY, m));
    }
    return Object.keys(out).map((k) => out[k]);
  })();
  const turnName = (M, n) => BYVEC[vkey(app(M, DIRS[n]))];
  /* Co je vidět na krychli otočené maticí M: přední, pravá a horní stěna se značkou a jejím natočením ve stupních. */
  const LOCAL = { F: { up: 'T', right: 'R' }, R: { up: 'T', right: 'K' }, T: { up: 'K', right: 'R' } };
  function view(cube, M) {
    const inv = {};
    NAMES.forEach((n) => { inv[turnName(M, n)] = n; });
    return ['F', 'R', 'T'].map((pos) => {
      const f = inv[pos];
      const upNow = turnName(M, cube[f].up);
      const L = LOCAL[pos];
      const deg = upNow === L.up ? 0 : upNow === L.right ? 90 : upNow === neg(L.up) ? 180 : 270;
      return { sym: cube[f].sym, deg: deg };
    });
  }
  const vk = (v) => v.map((x) => x.sym + '@' + (x.deg % SYMBOLS[x.sym].per)).join('|');
  /* Jde tenhle pohled složit z krychle? (zkouší všech 24 poloh) */
  const possible = (cube, v) => ROTS.some((M) => vk(view(cube, M)) === vk(v));

  /* Úloha: síť, značky, správný pohled a špatné pohledy, které z krychle složit nejde. */
  function makeTask(L) {
    for (let t = 0; t < 200; t++) {
      const cells = place(NETS[L.net == null ? U.randInt(0, NETS.length - 1) : L.net], { rot: L.net === 0 ? U.pick([0, 2]) : U.randInt(0, 3), flip: L.net !== 0 && Math.random() < 0.5 });
      const base = U.randInt(0, 5);
      const info = fold(cells, base);
      if (new Set(info.map((x) => x.face)).size !== 6) continue;
      const syms = U.shuffle(L.sets);
      const cube = {};
      info.forEach((x, i) => { cube[x.face] = { sym: syms[i], up: x.up }; });
      const M = U.pick(ROTS);
      const right0 = view(cube, M);
      const wrong = [];
      const seen = {};
      seen[vk(right0)] = true;
      const tryAdd = (v) => { const k = vk(v); if (!seen[k] && !possible(cube, v)) { seen[k] = true; wrong.push(v); } };
      // záměny: dvě viditelné stěny prohozené, stěna se značkou ze stěny naproti, otočená směrová značka
      const opp = (pos) => {
        const inv = {};
        NAMES.forEach((n) => { inv[turnName(M, n)] = n; });
        return cube[neg(inv[pos])];
      };
      const cand = [];
      [[0, 1], [0, 2], [1, 2]].forEach((p) => { const v = right0.map((x) => Object.assign({}, x)); const a = v[p[0]].sym; v[p[0]].sym = v[p[1]].sym; v[p[1]].sym = a; cand.push(v); });
      ['F', 'R', 'T'].forEach((pos, i) => { const v = right0.map((x) => Object.assign({}, x)); v[i] = { sym: opp(pos).sym, deg: v[i].deg }; cand.push(v); });
      right0.forEach((x, i) => [90, 180, 270].forEach((d) => { const v = right0.map((y) => Object.assign({}, y)); v[i] = { sym: x.sym, deg: (x.deg + d) % 360 }; cand.push(v); }));
      U.shuffle(cand).forEach((v) => { if (wrong.length < L.opts - 1) tryAdd(v); });
      if (wrong.length < L.opts - 1) continue;
      const all = U.shuffle([right0].concat(wrong));
      return { cells: cells, info: info, base: base, cube: cube, M: M, syms: syms, views: all, idx: all.indexOf(right0) };
    }
    return null;
  }

  /* ---------- Kreslení ---------- */
  function netSvg(T) {
    const cols = 1 + Math.max.apply(null, T.cells.map((c) => c[0])), rows = 1 + Math.max.apply(null, T.cells.map((c) => c[1]));
    let out = '';
    T.cells.forEach((c, i) => {
      out += '<g transform="translate(' + (c[0] * 100) + ' ' + (c[1] * 100) + ')"><rect x="2" y="2" width="96" height="96" rx="6" class="kr-face"/>' +
        '<g transform="translate(14 14) scale(0.72)">' + symSvg(T.syms[i], 0) + '</g></g>';
    });
    return '<svg viewBox="-4 -4 ' + (cols * 100 + 8) + ' ' + (rows * 100 + 8) + '" aria-hidden="true" focusable="false">' + out + '</svg>';
  }
  /* Krychle v pohledu shora zprava: přední, pravá a horní stěna. */
  function cubeSvg(v) {
    const s = 100;
    const P = (x, y, z) => [(x - z) * s, -y * s + (x + z) * s / 2];
    const faces = { F: [P(0, 0, 1), P(1, 0, 1), P(0, 1, 1)], R: [P(1, 0, 1), P(1, 0, 0), P(1, 1, 1)], T: [P(0, 1, 1), P(1, 1, 1), P(0, 1, 0)] };
    const cls = { F: 'kr-f', R: 'kr-r', T: 'kr-t' };
    let out = '';
    ['F', 'R', 'T'].forEach((pos, i) => {
      const o = faces[pos][0], eu = [faces[pos][1][0] - o[0], faces[pos][1][1] - o[1]], ev = [faces[pos][2][0] - o[0], faces[pos][2][1] - o[1]];
      const m = [eu[0] / 100, eu[1] / 100, -ev[0] / 100, -ev[1] / 100, o[0] + ev[0], o[1] + ev[1]].map((x) => +x.toFixed(3));
      out += '<g transform="matrix(' + m.join(' ') + ')"><rect width="100" height="100" class="' + cls[pos] + '"/>' +
        '<g transform="translate(14 14) scale(0.72)">' + symSvg(v[i].sym, v[i].deg) + '</g></g>';
    });
    return '<svg viewBox="-106 -106 212 212" aria-hidden="true" focusable="false">' + out + '</svg>';
  }

  /* Skládání v CSS 3D: políčka jsou do sebe vnořená podle stromu ohybů, každé se ohne o 90° dozadu kolem společné hrany. */
  function foldScene(T, size) {
    const kids = T.cells.map(() => []);
    T.info.forEach((x, i) => { if (x.parent >= 0) kids[x.parent].push(i); });
    const els = [];
    const make = (i) => {
      const x = T.info[i];
      const el = h('div', { class: 'kr3-face kr3-' + (x.side || 'base') });
      el.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="1" y="1" width="98" height="98" rx="5" class="kr-face"/><g transform="translate(14 14) scale(0.72)">' + symSvg(T.syms[i], 0) + '</g></svg>';
      els[i] = el;
      kids[i].forEach((j) => el.appendChild(make(j)));
      return el;
    };
    const root = make(T.base);
    const cube = h('div', { class: 'kr3-cube' }, root);
    const wrap = h('div', { class: 'kr3', style: { '--kr': size + 'px' } }, cube);
    // Síť nejdřív leží rovně: posun kořene tak, aby byla vycentrovaná.
    const bc = T.cells[T.base];
    const cols = 1 + Math.max.apply(null, T.cells.map((c) => c[0])), rows = 1 + Math.max.apply(null, T.cells.map((c) => c[1]));
    const flat = 'translate(' + ((bc[0] - (cols - 1) / 2) * size) + 'px, ' + ((bc[1] - (rows - 1) / 2) * size) + 'px)';
    cube.style.transform = flat;
    return {
      node: wrap,
      fold() {
        els.forEach((el, i) => { if (T.info[i].parent >= 0) el.classList.add('is-folded'); });
        cube.style.transform = 'translateZ(' + (size / 2) + 'px)';
      },
      /* Otočit složenou krychli do polohy správné odpovědi (pohled shora zprava). */
      turn(scale) {
        // Matice v souřadnicích y nahoru → CSS (y dolů): C·V·M·C, sloupcově pro matrix3d.
        const a = -Math.PI / 4, b = Math.PI / 6;
        const Ry = [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
        const Rx = [[1, 0, 0], [0, Math.cos(b), -Math.sin(b)], [0, Math.sin(b), Math.cos(b)]];
        const R = mul(mul(Rx, Ry), T.M);
        const Cm = [[1, 0, 0], [0, -1, 0], [0, 0, 1]];
        const Q = mul(mul(Cm, R), Cm);
        const m = [Q[0][0], Q[1][0], Q[2][0], 0, Q[0][1], Q[1][1], Q[2][1], 0, Q[0][2], Q[1][2], Q[2][2], 0, 0, 0, 0, 1].map((x) => +x.toFixed(4));
        cube.style.transform = 'scale(' + (scale || 1).toFixed(2) + ') matrix3d(' + m.join(',') + ') translateZ(' + (size / 2) + 'px)';
      }
    };
  }

  SM.registerGame({
    id: 'krychle',
    name: 'Skládání krychle',
    domain: 'logika',
    trains: 'prostorovou představivost',
    short: 'Kterou krychli jde složit z rozložené sítě?',
    duration: 'asi 2 minuty',
    pace: { per: 'na úlohu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jedna úloha dané úrovně (pro kontrolu generátoru). */
    gen(level) { return makeTask(LEVELS[level - 1]); },
    /** Jde pohled složit z dané krychle? (pro kontrolu správnosti možností) */
    _possible: possible,
    howTo(level) {
      const steps = ['Nahoře je rozložená krychle: šest čtverců, které jde přehnout podél hran a složit z nich krychli.',
        'Vyberte krychli, která z ní jde složit. Na krychli jsou vidět tři stěny: přední, pravá a horní.',
        'Pomůže si hlídat, které značky jsou na krychli naproti sobě: ty nikdy nejsou vidět zároveň.'];
      if (level >= 3) steps.push('Záleží i na tom, kam míří šipka a ostatní značky se směrem.');
      steps.push('Po odpovědi se síť sama složí a uvidíte, jak to vyšlo.');
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
        big: ok + ' z ' + N, bigLabel: 'krychlí správně',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      async function one() {
        const T = makeTask(L);
        if (!T) return false;
        ctx.clear();
        const net = h('div', { class: 'kr-net' });
        net.innerHTML = netSvg(T);
        const stack = h('div', { class: 'stack krychle', 'data-a': T.idx }, net);
        ctx.stage.appendChild(stack);
        ctx.status('Kterou krychli jde složit?');
        const t0 = performance.now();
        const pr = K.choose(ctx, T.views.map((v, i) => {
          const n = h('span', { class: 'kr-cube', 'aria-hidden': 'true' });
          n.innerHTML = cubeSvg(v);
          return { value: i, node: n, aria: 'Krychle ' + (i + 1) };
        }), { answer: T.idx, layout: 'grid', cls: 'kr-opts', noMark: true });
        // Krychle v jedné řadě, ať zbyde co nejvíc místa na síť.
        ctx.foot.querySelector('.kr-opts').style.gridTemplateColumns = 'repeat(' + T.views.length + ', minmax(0, 1fr))';
        fit(net);
        const r = await pr;
        ctx.mark(r.correct, (performance.now() - t0) / SM.timeScale);
        ctx.status(r.correct ? 'Správně!' : 'Správná krychle je zvýrazněná.');
        await ctx.sleep(r.correct ? 900 : 1700);
        // Síť se složí a otočí do polohy správné krychle.
        const size = Math.round(Math.min(net.offsetHeight / 3.4, ctx.size().w / 5.2, 70));
        const sc = foldScene(T, size);
        const stage3 = h('div', { class: 'kr3-stage', style: { height: net.offsetHeight + 'px' } }, sc.node);
        net.replaceWith(stage3);
        ctx.status('Síť se skládá…');
        await ctx.sleep(K.reducedMotion() ? 50 : 400);
        sc.fold();
        await ctx.sleep(K.reducedMotion() ? 50 : 1300);
        // Možnosti zůstanou vidět (správná zvýrazněná), složená krychle se zvětší do zbylého místa.
        let nx = K.next(ctx, 'Další úloha', { keep: true });
        let room = ctx.stage.clientHeight - 16;
        // Na malém telefonu s velkým písmem by se krychle vedle možností nevešla: možnosti zmizí.
        if (room < size * 1.8) { nx = K.next(ctx, 'Další úloha'); room = ctx.stage.clientHeight - 16; }
        room = Math.max(110, room);
        stage3.style.height = room + 'px';
        sc.turn(U.clamp(room / (size * 1.9), 1, 2));
        ctx.status(r.correct ? 'Správně, složená krychle vypadá takhle.' : 'Složená krychle vypadá takhle.');
        await nx;
        return r.correct;
      }

      /* Síť vyplní místo, které zbylo nad možnostmi. */
      function fit(net) {
        const room = ctx.stage.clientHeight - 16;
        net.style.height = Math.round(U.clamp(room, 110, ctx.size().w * 0.8)) + 'px';
      }
    }
  });
})();
