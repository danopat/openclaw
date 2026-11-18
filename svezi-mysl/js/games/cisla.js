/* Hledání čísel — najít v mřížce číslic zadaná čísla (soustředění, pečlivé prohledávání očima). Základ jako Osmisměrka. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const ALL_DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]];
  /* Letopočty pro tematickou variantu (jen čísla, bez popisků). */
  const YEARS = ['1348', '1415', '1620', '1781', '1848', '1868', '1881', '1918', '1938', '1945', '1948', '1968', '1989', '1993', '2004',
    '1212', '1306', '1526', '1648', '1866', '1883', '1902', '1929', '1953', '1969', '1977', '1998'];

  /* n = velikost mřížky, count = kolik čísel hledat, len = počet číslic, dirs = směry (2 = → ↓, 4 = i pozpátku, 8 = i šikmo). */
  const LEVELS = [
    { n: 6, count: 3, len: [4, 4], dirs: 2 },
    { n: 7, count: 4, len: [4, 4], dirs: 4 },
    { n: 8, count: 5, len: [4, 4], dirs: 4 },
    { n: 8, count: 5, len: [4, 5], dirs: 8 },
    { n: 9, count: 6, len: [4, 5], dirs: 8 }
  ];

  /* Kolikrát se číslo v mřížce vyskytuje (všech 8 směrů; souměrné jako 1221 se počítá jednou). */
  function occurrences(g, n, w) {
    let k = 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        ALL_DIRS.forEach((d) => {
          for (let i = 0; i < w.length; i++) {
            const rr = r + d[0] * i, cc = c + d[1] * i;
            if (rr < 0 || cc < 0 || rr >= n || cc >= n || g[rr * n + cc] !== w[i]) return;
          }
          k++;
        });
      }
    }
    return w === w.split('').reverse().join('') ? k / 2 : k;
  }

  function tryPlace(g, n, w, dirs) {
    for (let t = 0; t < 80; t++) {
      const d = U.pick(dirs);
      const r0 = U.randInt(0, n - 1), c0 = U.randInt(0, n - 1);
      const cells = [];
      for (let i = 0; i < w.length; i++) {
        const r = r0 + d[0] * i, c = c0 + d[1] * i;
        if (r < 0 || c < 0 || r >= n || c >= n) break;
        const cur = g[r * n + c];
        if (cur && cur !== w[i]) break;
        cells.push(r * n + c);
      }
      if (cells.length !== w.length) continue;
      cells.forEach((k, i) => { g[k] = w[i]; });
      return cells;
    }
    return null;
  }

  /* Mřížka { n, g, words: [{ w, cells }], years }. */
  function build(L, n, count) {
    const dirs = ALL_DIRS.slice(0, L.dirs);
    const years = Math.random() < 0.4;
    for (let attempt = 0; attempt < 600; attempt++) {
      const g = new Array(n * n).fill('');
      const placed = [];
      const pool = years ? U.shuffle(YEARS)
        : Array.from({ length: count * 4 }, () => String(U.randInt(1, 9)) + Array.from({ length: U.randInt(L.len[0], L.len[1]) - 1 }, () => U.randInt(0, 9)).join(''));
      for (let i = 0; i < pool.length && placed.length < count; i++) {
        if (placed.some((p) => p.w === pool[i])) continue;
        const cells = tryPlace(g, n, pool[i], dirs);
        if (cells) placed.push({ w: pool[i], cells: cells });
      }
      if (placed.length < count) continue;
      g.forEach((x, i) => { if (!x) g[i] = String(U.randInt(0, 9)); });
      if (placed.some((p) => occurrences(g, n, p.w) !== 1)) continue;
      return { n: n, g: g, words: placed, years: years };
    }
    return null;
  }

  SM.registerGame({
    id: 'cisla',
    name: 'Hledání čísel',
    domain: 'postreh',
    trains: 'soustředění a pečlivé prohledávání očima',
    short: 'Najděte v mřížce zadaná čísla.',
    duration: 'asi 2 až 3 minuty',
    pace: { per: 'na číslo' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const where = L.dirs === 2 ? 'vodorovně zleva doprava nebo svisle shora dolů' : L.dirs === 4 ? 'vodorovně nebo svisle, i pozpátku' : 'vodorovně, svisle i šikmo, i pozpátku';
      return [
        'V mřížce číslic jsou schovaná čísla ze seznamu. Vedou ' + where + '.',
        'Číslo označíte klepnutím na jeho první a pak na poslední číslici.',
        'Když nevíte, tlačítko „Nápověda“ ukáže první číslici. Druhá nápověda ukáže celé číslo.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const n = ctx.size().w < 520 ? Math.min(L.n, 8) : L.n;
      const pz = build(L, n, ctx.short ? Math.min(L.count, 3) : L.count) || build(LEVELS[0], 6, 3);
      const t0 = performance.now();
      const res = await play(pz);
      const ms = (performance.now() - t0) / SM.timeScale;
      const acc = res.clean / pz.words.length;
      ctx.finish({
        perf: acc, acc: acc, rt: ms / pz.words.length,
        levelDelta: acc >= 0.85 && res.hints <= 1 ? 1 : acc < 0.5 ? -1 : 0,
        big: res.clean + ' z ' + pz.words.length, bigLabel: 'čísel nalezených bez nápovědy',
        details: ['Čas: ' + U.fmtTime(ms)],
        metric: { words: pz.words.length, clean: res.clean, hints: res.hints }
      });

      /* Hledání. Vrací { clean, hints }. */
      function play(pz) {
        return new Promise((resolve) => {
          const N = pz.n;
          const found = {};
          const hinted = {};
          let start = -1;
          let hints = 0;
          ctx.clear();
          const what = pz.years ? 'letopočty' : 'čísla';
          ctx.status('Najděte ' + what + ' ze seznamu.');
          const chips = {};
          const list = h('div', { class: 'ws-words is-num', 'aria-label': 'Hledaná čísla' }, pz.words.map((p) => {
            const c = h('span', { class: 'ws-word', 'data-w': p.w }, p.w);
            chips[p.w] = c;
            return c;
          }));
          const box = h('div', { class: 'ws cisla' }, list);
          ctx.stage.appendChild(box);
          const hintBtn = h('button', { class: 'btn btn-secondary btn-small ws-hint', type: 'button' }, 'Nápověda');
          ctx.foot.appendChild(hintBtn);
          const sz = ctx.size();
          const free = sz.h - list.offsetHeight - 12;
          const cell = Math.floor(U.clamp(Math.min((Math.min(sz.w, 540) - (N - 1) * 3) / N, (free - (N - 1) * 3) / N), 30, 60));
          const grid = h('div', { class: 'ws-grid is-num', style: { '--n': N, '--cell': cell + 'px' } });
          const els = pz.g.map((ch, i) => {
            const b = h('button', { class: 'ws-cell', type: 'button', 'data-i': i, 'aria-label': ch + ', řádek ' + (Math.floor(i / N) + 1) + ', sloupec ' + (i % N + 1) }, ch);
            U.tap(b, () => tap(i));
            grid.appendChild(b);
            return b;
          });
          box.appendChild(grid);
          const update = () => ctx.progress('Nalezeno ' + Object.keys(found).length + ' z ' + pz.words.length);
          update();

          function line(a, b) {
            const r1 = Math.floor(a / N), c1 = a % N, r2 = Math.floor(b / N), c2 = b % N;
            if (!(r1 === r2 || c1 === c2 || Math.abs(r2 - r1) === Math.abs(c2 - c1))) return null;
            const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
            const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1;
            return Array.from({ length: len }, (_, i) => (r1 + dr * i) * N + (c1 + dc * i));
          }
          function tap(i) {
            if (!ctx.alive) return;
            if (start < 0) {
              start = i;
              els[i].classList.add('is-start');
              ctx.sound.tap();
              return;
            }
            els[start].classList.remove('is-start');
            if (start === i) { start = -1; return; }
            const cells = line(start, i);
            const a = start;
            start = -1;
            if (!cells) {
              ctx.status('Označte první a poslední číslici v jedné řadě.');
              tap(i);
              return;
            }
            const num = cells.map((k) => pz.g[k]).join('');
            const p = pz.words.find((x) => !found[x.w] && (x.w === num || x.w === num.split('').reverse().join('')));
            if (!p) {
              ctx.sound.wrong();
              [a, i].forEach((k) => { els[k].classList.remove('is-shake'); void els[k].offsetWidth; els[k].classList.add('is-shake'); });
              ctx.status('To není žádné z hledaných čísel. Zkuste to znovu.');
              return;
            }
            mark(p, false);
          }
          function mark(p, byHint) {
            found[p.w] = byHint ? 'hint' : 'ok';
            const color = Object.keys(found).length % 5;
            p.cells.forEach((k) => {
              els[k].classList.add('is-found', 'c' + color);
              els[k].classList.remove('is-hint');
            });
            chips[p.w].classList.add('is-found');
            ctx.sound.correct();
            ctx.status(byHint ? 'Tady je: ' + p.w + '.' : 'Ano, ' + p.w + '!');
            update();
            if (Object.keys(found).length === pz.words.length) {
              hintBtn.disabled = true;
              grid.classList.add('is-done');
              ctx.sleep(900).then(() => resolve({ clean: pz.words.filter((x) => found[x.w] === 'ok').length, hints: hints }));
            }
          }
          U.tap(hintBtn, () => {
            if (!ctx.alive || hintBtn.disabled) return;
            const p = pz.words.find((x) => !found[x.w] && hinted[x.w]) || U.pick(pz.words.filter((x) => !found[x.w]));
            if (!p) return;
            hints++;
            if (hinted[p.w]) { mark(p, true); return; }
            hinted[p.w] = true;
            els[p.cells[0]].classList.add('is-hint');
            ctx.sound.tap();
            ctx.status('Číslo ' + p.w + ' začíná označenou číslicí. Další nápověda ukáže celé číslo.');
          });
        });
      }
    }
  });
})();
