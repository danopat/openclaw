/* Pohled z boku — stavba z kostek a oko: co z toho místa uvidíte? (prostorová představivost, představa tělesa z jiné strany).
   Kreslení kostek sdílí se Stavbou z kostek (SM.cubes). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;
  const C = SM.cubes;

  /* n = řady (odzadu dopředu), m = sloupce, maxH = nejvyšší sloupec, max = nejvýš kostek,
     dirs = odkud oko kouká, opts = počet možností, ask = obrácená otázka: které oko vidí tento pohled? */
  const LEVELS = [
    { n: 2, m: 2, maxH: 2, max: 6, dirs: ['front'], opts: 3 },
    { n: 3, m: 3, maxH: 2, max: 10, dirs: ['front'], opts: 4 },
    { n: 3, m: 3, maxH: 3, max: 12, dirs: ['front', 'side'], opts: 4 },
    { n: 4, m: 4, maxH: 3, max: 16, dirs: ['front', 'side'], opts: 4 },
    { n: 3, m: 3, maxH: 3, max: 12, ask: true }
  ];
  const EYES = ['front', 'side', 'top']; // čísla oček v obrácené otázce: 1 zepředu, 2 zprava, 3 shora
  const SHADES = ['#f7dca6', '#e4b465', '#c58f3f', '#97672a'];

  const maxOf = (H) => Math.max.apply(null, H.map((r) => Math.max.apply(null, r)));
  const rev = (a) => a.slice().reverse();
  /* Obrys stavby: výšky sloupců tak, jak je vidí oko zleva doprava. Zprava je vlevo přední řada. */
  function skyline(H, dir) {
    const n = H.length, m = H[0].length;
    if (dir === 'front') return Array.from({ length: m }, (_, x) => Math.max.apply(null, H.map((row) => row[x])));
    return Array.from({ length: n }, (_, i) => Math.max.apply(null, H[n - 1 - i]));
  }
  /* Mřížky pohledů: řádky shora dolů; true = je vidět kostka. */
  const skyGrid = (sky, rows) => Array.from({ length: rows }, (_, r) => sky.map((v) => v >= rows - r));
  const topGrid = (H) => H.map((row) => row.map((v) => v > 0));
  const gkey = (g) => g.length + 'x' + g[0].length + ':' + g.map((row) => row.map((b) => (b ? 1 : 0)).join('')).join('/');
  const mirror = (g) => g.map(rev);
  const turn = (g) => g[0].map((_, c) => g.map((row) => row[c]).reverse()); // otočení o 90°
  function syms(g) {
    const out = [];
    let t = g;
    for (let i = 0; i < 4; i++) { out.push(t, mirror(t)); t = turn(t); }
    return out;
  }
  /* Co oko opravdu vidí: u každého políčka vzdálenost nejbližší kostky (0 = nejblíž), shora výška (0 = nejvyšší). */
  function elevation(H, dir) {
    const n = H.length, m = H[0].length, top = maxOf(H);
    if (dir === 'top') return H.map((row) => row.map((v) => (v > 0 ? top - v : null)));
    const cols = dir === 'front' ? m : n;
    return Array.from({ length: top }, (_, r) => Array.from({ length: cols }, (_, c) => {
      const z = top - 1 - r;
      if (dir === 'front') {
        for (let y = n - 1; y >= 0; y--) if (H[y][c] > z) return n - 1 - y;
        return null;
      }
      const y = n - 1 - c;
      for (let x = m - 1; x >= 0; x--) if (H[y][x] > z) return m - 1 - x;
      return null;
    }));
  }

  /* Mřížka pohledu jako SVG. Políčko: true / číslo odstínu = kostka, false / null = prázdno. */
  function grid(g, opt) {
    opt = opt || {};
    const rows = g.length, cols = g[0].length, u = 10;
    let out = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = g[r][c];
        const on = v !== false && v != null;
        out += '<rect x="' + (c * u + 0.6) + '" y="' + (r * u + 0.6) + '" width="' + (u - 1.2) + '" height="' + (u - 1.2) + '" rx="1.2" class="' + (on ? 'pv-on' : 'pv-off') + '"' +
          (on && opt.shades ? ' style="fill:' + SHADES[Math.min(v, SHADES.length - 1)] + '"' : '') + '/>';
      }
    }
    if (opt.ground) out += '<path d="M-1.5 ' + (rows * u + 0.8) + 'H' + (cols * u + 1.5) + '" class="pv-ground"/>';
    const s = h('span', { class: 'pv-grid', 'aria-hidden': 'true' });
    s.innerHTML = '<svg viewBox="-2 -1 ' + (cols * u + 4) + ' ' + (rows * u + 3.5) + '" focusable="false">' + out + '</svg>';
    return s;
  }

  /* Oko se šipkou (a v obrácené otázce číslo) do kresby stavby. */
  function eyes(H, list) {
    const n = H.length, m = H[0].length, top = maxOf(H);
    const f = (v) => v.toFixed(1);
    return (P, s) => {
      let svg = '';
      const pts = [];
      list.forEach((e) => {
        let a, b;
        if (e.dir === 'front') { a = P(m / 2, n + 2.8, top / 2); b = P(m / 2, n + 0.45, top / 2); }
        else if (e.dir === 'side') { a = P(m + 2.8, n / 2, top / 2); b = P(m + 0.45, n / 2, top / 2); }
        else { a = P(m / 2, n / 2, top + 2.7); b = P(m / 2, n / 2, top + 0.35); }
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len, nx = -uy, ny = ux;
        const r = 0.62 * s, hs = 0.6 * s;
        const st = [a[0] + ux * (r + 3), a[1] + uy * (r + 3)];
        const base = [b[0] - ux * hs, b[1] - uy * hs];
        svg += '<path class="pv-shaft" d="M' + f(st[0]) + ' ' + f(st[1]) + 'L' + f(base[0]) + ' ' + f(base[1]) + '" stroke-width="' + f(0.24 * s) + '"/>' +
          '<path class="pv-head" d="M' + f(b[0]) + ' ' + f(b[1]) + 'L' + f(base[0] + nx * hs * 0.65) + ' ' + f(base[1] + ny * hs * 0.65) + 'L' + f(base[0] - nx * hs * 0.65) + ' ' + f(base[1] - ny * hs * 0.65) + 'Z"/>' +
          '<g class="pv-eye"><path d="M' + f(a[0] - r) + ' ' + f(a[1]) + 'Q' + f(a[0]) + ' ' + f(a[1] - r * 1.05) + ' ' + f(a[0] + r) + ' ' + f(a[1]) + 'Q' + f(a[0]) + ' ' + f(a[1] + r * 1.05) + ' ' + f(a[0] - r) + ' ' + f(a[1]) + 'Z"/>' +
          '<circle cx="' + f(a[0]) + '" cy="' + f(a[1]) + '" r="' + f(r * 0.38) + '"/></g>';
        pts.push([a[0], a[1], r + 3], [b[0], b[1], 3]);
        if (e.label) {
          const lx = a[0] - ux * r * 2, ly = a[1] - uy * r * 2;
          svg += '<g class="pv-num"><circle cx="' + f(lx) + '" cy="' + f(ly) + '" r="' + f(0.55 * s) + '"/><text x="' + f(lx) + '" y="' + f(ly + 0.24 * s) + '" font-size="' + f(0.7 * s) + '" text-anchor="middle">' + e.label + '</text></g>';
          pts.push([lx, ly, 0.55 * s + 3]);
        }
      });
      return { svg: svg, pts: pts };
    };
  }

  /* Je vidět vrchní kostka každého sloupce? (jinak by se výška sloupce nedala poznat) */
  function fair(H) {
    const vox = C.fromHeights(H);
    const cnt = C.shown(vox);
    return vox.every((v, i) => v[2] !== H[v[1]][v[0]] - 1 || cnt[i] >= 2);
  }
  function makeHeights(L) {
    for (let t = 0; t < 600; t++) {
      const H = Array.from({ length: L.n }, () => Array.from({ length: L.m }, () => (Math.random() < 0.22 ? 0 : U.randInt(1, L.maxH))));
      const flat = [].concat.apply([], H);
      if (flat.filter((v) => v > 0).length < Math.ceil(L.n * L.m / 2)) continue;
      if (flat.reduce((a, b) => a + b, 0) > L.max || maxOf(H) < Math.min(2, L.maxH)) continue;
      if (!C.connected(H) || !fair(H)) continue;
      return H;
    }
    return null;
  }

  /* Úloha „co uvidí oko“: správný obrys a záměny (zrcadlově, z druhé strany, jeden sloupec jinak). */
  function viewTask(L) {
    for (let t = 0; t < 300; t++) {
      const H = makeHeights(L);
      if (!H) continue;
      const dir = U.pick(L.dirs);
      const F = skyline(H, dir), S = skyline(H, dir === 'front' ? 'side' : 'front');
      if (L.n > 2 && F.join() === rev(F).join()) continue; // souměrný obrys by byl moc snadný
      const vars = [];
      F.forEach((v, i) => [v + 1, v - 1].forEach((w) => {
        if (w < 0 || w > L.maxH) return;
        const c = F.slice();
        c[i] = w;
        if (c.some((q) => q > 0)) vars.push(c);
      }));
      const key = (a) => a.length + ':' + a.join();
      const seen = {};
      seen[key(F)] = true;
      const wrong = [];
      [rev(F), S, rev(S)].concat(U.shuffle(vars)).forEach((c) => {
        if (wrong.length < L.opts - 1 && !seen[key(c)]) { seen[key(c)] = true; wrong.push(c); }
      });
      if (wrong.length < L.opts - 1) continue;
      const all = U.shuffle([F].concat(wrong));
      const rows = Math.max(2, Math.max.apply(null, all.map((a) => Math.max.apply(null, a))));
      const idx = all.indexOf(F);
      return {
        H: H, dir: dir, eyes: [{ dir: dir }], idx: idx, answer: idx,
        options: all.map((a, i) => ({ value: i, aria: 'Obrázek ' + (i + 1) + ', výšky sloupců zleva: ' + a.join(', '), node: grid(skyGrid(a, rows), { ground: true }) }))
      };
    }
    return null;
  }
  /* Obrácená otázka: tři očka, ukázaný je pohled jednoho z nich. Pohledy se nesmějí plést ani zrcadlově či pootočené. */
  function askTask(L) {
    for (let t = 0; t < 400; t++) {
      const H = makeHeights(L);
      if (!H) continue;
      const top = maxOf(H);
      const V = { front: skyGrid(skyline(H, 'front'), top), side: skyGrid(skyline(H, 'side'), top), top: topGrid(H) };
      const forms = {};
      EYES.forEach((d) => { forms[d] = (d === 'top' ? syms(V[d]) : [V[d], mirror(V[d])]).map(gkey); });
      const clash = EYES.some((a) => EYES.some((b) => a !== b && forms[a].some((k) => forms[b].indexOf(k) !== -1)));
      if (clash) continue;
      const dir = U.pick(EYES);
      const n = EYES.indexOf(dir) + 1;
      return {
        H: H, dir: dir, ask: true, shown: V[dir], eyes: EYES.map((d, i) => ({ dir: d, label: String(i + 1) })), idx: n - 1, answer: n,
        options: [1, 2, 3].map((k) => ({ value: k, label: String(k), aria: 'Očko číslo ' + k }))
      };
    }
    return null;
  }

  SM.registerGame({
    id: 'pohled',
    name: 'Pohled z boku',
    domain: 'logika',
    trains: 'prostorovou představivost',
    short: 'Co uvidí oko, které se dívá na stavbu?',
    duration: 'asi 2 minuty',
    pace: { per: 'na stavbu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jedna úloha dané úrovně (pro kontrolu generátoru). */
    gen(level) { const L = LEVELS[level - 1]; return L.ask ? askTask(L) : viewTask(L); },
    howTo(level) {
      const L = LEVELS[level - 1];
      if (L.ask) {
        return ['Ke stavbě se dívají tři očka s čísly: zepředu, zprava a shora.',
          'Vedle stavby je nakreslené, co vidí jedno z nich. Vyberte číslo očka, které stavbu vidí takhle.',
          'Po odpovědi si můžete nechat ukázat, co očko opravdu vidí.'];
      }
      return ['Na stavbu z kostek se dívá oko. Šipka ukazuje, odkud se dívá.',
        'Vyberte obrázek, který oko uvidí. Vidí jen obrys stavby, jako stín na zdi: sloupce kostek vedle sebe.',
        'Po odpovědi si můžete nechat ukázat, co oko opravdu vidí. Bližší kostky jsou světlejší.'];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      let ok = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Stavba ' + (i + 1) + ' z ' + N);
        if (await one()) ok++;
      }
      const acc = ok / N;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: ok + ' z ' + N, bigLabel: L.ask ? 'oček správně' : 'pohledů správně',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      async function one() {
        const T = L.ask ? askTask(L) : viewTask(L);
        if (!T) return false;
        ctx.clear();
        const pic = h('div', { class: 'cubes pv-pic' });
        pic.innerHTML = C.toSvg(C.layout(C.fromHeights(T.H), { s: 20, extra: eyes(T.H, T.eyes) }));
        const asked = T.ask ? h('div', { class: 'pv-asked' }, h('span', null, 'Takhle stavbu vidí:'), grid(T.shown, { ground: T.dir !== 'top' })) : null;
        const elev = h('div', { class: 'pv-elev', hidden: true },
          grid(elevation(T.H, T.dir), { shades: true, ground: T.dir !== 'top' }),
          h('p', { class: 'pv-note' }, T.dir === 'top' ? 'Takhle vidí stavbu očko shora. Vyšší kostky jsou světlejší.' : 'Takhle stavbu vidí oko. Bližší kostky jsou světlejší.'));
        const stack = h('div', { class: 'stack pohled', 'data-a': T.idx }, pic, elev, asked);
        ctx.stage.appendChild(stack);
        ctx.status(T.ask ? 'Které očko vidí stavbu takhle?' : 'Co uvidí oko?');
        const t0 = performance.now();
        const pr = K.choose(ctx, T.options, { answer: T.answer, layout: T.ask ? 'row' : 'grid', cls: T.ask ? 'is-mono pv-nums' : 'pv-views', noMark: true });
        fit(pic, stack);
        const r = await pr;
        ctx.mark(r.correct, (performance.now() - t0) / SM.timeScale);
        ctx.status(r.correct ? 'Správně!' : 'Správná odpověď je zvýrazněná.');
        await ctx.sleep(r.correct ? 900 : 1700);
        // Ověření: ukázat, co oko opravdu vidí. Po chybě se to ukáže samo.
        let showing = false;
        const tog = h('button', { class: 'btn btn-secondary pv-toggle', type: 'button' });
        const show = (v) => {
          showing = v;
          pic.hidden = v;
          elev.hidden = !v;
          if (asked) asked.hidden = v;
          tog.textContent = v ? 'Ukázat stavbu' : 'Co oko vidí?';
        };
        U.tap(tog, () => { ctx.sound.tap(); show(!showing); fitAll(); });
        show(!r.correct);
        if (!r.correct) ctx.status('Takhle stavbu vidí ' + (T.ask ? 'očko číslo ' + T.answer : 'oko') + '.');
        const nx = K.next(ctx, 'Další stavba');
        ctx.foot.insertBefore(tog, ctx.foot.firstChild);
        fitAll();
        await nx;
        return r.correct;

        function fitAll() { fit(pic, stack); fit(elev.querySelector('.pv-grid'), stack); }
      }

      /* Kresba se zvětší nebo zmenší podle místa, které zbylo nad tlačítky. */
      function fit(el, stack) {
        if (!el || el.closest('[hidden]')) return;
        el.style.height = '';
        const others = Array.from(stack.children).filter((c) => !c.hidden && !c.contains(el)).reduce((a, c) => a + c.offsetHeight + 14, 0);
        const sibling = el.parentNode === stack ? 0 : Array.from(el.parentNode.children).filter((c) => c !== el).reduce((a, c) => a + c.offsetHeight + 8, 0);
        const room = ctx.stage.clientHeight - others - sibling - 20;
        el.style.height = Math.round(U.clamp(room, 90, Math.max(140, ctx.size().w * 0.85))) + 'px';
      }
    }
  });
})();
