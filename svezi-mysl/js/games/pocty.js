/* Křížové počty — doplnit čísla do mřížky tak, aby platily příklady v řádcích i ve sloupcích (logika a počítání).
   Každé číslo je v mřížce jednou, počítá se zleva doprava a shora dolů. Řešič hlídá jediné řešení. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* n = velikost mřížky (čísla 1 až n·n), ops = povolené znaménka, give = předem doplněná čísla */
  const LEVELS = [
    { n: 2, ops: ['+', '−'], give: 1 },
    { n: 3, ops: ['+', '−'], give: 3 },
    { n: 3, ops: ['+', '−'], give: 2 },
    { n: 3, ops: ['+', '−', '×'], give: 2 }
  ];
  const calc = (vals, ops) => vals.reduce((acc, v, i) => (i === 0 ? v : ops[i - 1] === '+' ? acc + v : ops[i - 1] === '−' ? acc - v : acc * v), 0);

  /* Počet řešení (nejvýš 2): doplnit zbylá čísla tak, aby seděly výsledky všech řádků a sloupců. */
  function countSolutions(P, giv) {
    const n = P.n, N = n * n;
    const used = {};
    giv.forEach((v) => { if (v != null) used[v] = true; });
    const free = [];
    for (let v = 1; v <= N; v++) if (!used[v]) free.push(v);
    const cur = giv.slice();
    const empty = cur.map((v, i) => (v == null ? i : -1)).filter((i) => i >= 0);
    let found = 0;
    const lineOk = (cells, ops, res) => (cells.some((i) => cur[i] == null) ? true : calc(cells.map((i) => cur[i]), ops) === res);
    const rowsOk = () => P.rows.every((r, k) => lineOk(r, P.rowOps[k], P.rowRes[k])) && P.cols.every((c, k) => lineOk(c, P.colOps[k], P.colRes[k]));
    const taken = {};
    (function go(k) {
      if (found >= 2) return;
      if (k === empty.length) { found++; return; }
      for (const v of free) {
        if (taken[v]) continue;
        taken[v] = true;
        cur[empty[k]] = v;
        if (rowsOk()) go(k + 1);
        cur[empty[k]] = null;
        taken[v] = false;
        if (found >= 2) return;
      }
    })(0);
    return found;
  }
  function makePuzzle(L) {
    const n = L.n, N = n * n;
    const rows = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r * n + c));
    const cols = Array.from({ length: n }, (_, c) => Array.from({ length: n }, (_, r) => r * n + c));
    for (let t = 0; t < 400; t++) {
      const sol = U.shuffle(Array.from({ length: N }, (_, i) => i + 1));
      const rowOps = rows.map(() => Array.from({ length: n - 1 }, () => U.pick(L.ops)));
      const colOps = cols.map(() => Array.from({ length: n - 1 }, () => U.pick(L.ops)));
      const rowRes = rows.map((r, k) => calc(r.map((i) => sol[i]), rowOps[k]));
      const colRes = cols.map((c, k) => calc(c.map((i) => sol[i]), colOps[k]));
      if (rowRes.concat(colRes).some((x) => x < 0 || x > 99)) continue; // bez záporných a velkých výsledků
      const P = { n: n, rows: rows, cols: cols, rowOps: rowOps, colOps: colOps, rowRes: rowRes, colRes: colRes, sol: sol };
      let giv = sol.slice();
      for (const i of U.shuffle(Array.from({ length: N }, (_, k) => k))) {
        if (giv.filter((v) => v != null).length <= L.give) break;
        const g2 = giv.slice();
        g2[i] = null;
        if (countSolutions(P, g2) === 1) giv = g2;
      }
      if (giv.filter((v) => v != null).length > L.give) continue;
      P.giv = giv;
      return P;
    }
    return null;
  }

  SM.registerGame({
    id: 'pocty',
    name: 'Křížové počty',
    domain: 'logika',
    trains: 'logiku a počítání',
    short: 'Doplňte čísla, aby platily příklady v řádcích i sloupcích.',
    duration: 'asi 3 minuty',
    pace: { per: 'na mřížku' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jedna úloha dané úrovně (pro kontrolu generátoru). */
    gen(level) { return makePuzzle(LEVELS[level - 1]); },
    howTo(level) {
      const L = LEVELS[level - 1];
      const N = L.n * L.n;
      return ['Do prázdných políček patří čísla od 1 do ' + N + ', každé právě jednou.',
        'V každém řádku i sloupci je příklad a jeho výsledek. Počítá se postupně zleva doprava a shora dolů' + (L.ops.indexOf('×') !== -1 ? ', i u násobení' : '') + '.',
        'Klepněte na prázdné políčko a vyberte číslo dole. Když řádek nebo sloupec sedí, jeho výsledek zezelená.',
        '„Nápověda“ doplní jedno políčko.'];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : 2;
      let mistakes = 0, hints = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Mřížka ' + (i + 1) + ' z ' + N);
        const r = await one(makePuzzle(ctx.short ? LEVELS[Math.min(1, ctx.level - 1)] : L));
        mistakes += r.mistakes; hints += r.hints;
      }
      const perf = U.clamp(1 - 0.12 * mistakes / N - 0.15 * hints / N, 0, 1);
      const details = [];
      if (mistakes) details.push('Chybné pokusy: ' + mistakes);
      if (hints) details.push('Nápověda: ' + hints + '×');
      ctx.finish({
        perf: perf, acc: perf,
        levelDelta: K.levelByAcc(perf, 0.85, 0.5),
        big: N + ' z ' + N, bigLabel: N === 1 ? 'mřížka vyřešena' : 'mřížky vyřešeny',
        details: details, metric: { mistakes: mistakes, hints: hints }
      });

      async function one(P) {
        ctx.clear();
        const n = P.n, NN = n * n;
        const val = P.giv.slice();
        let sel = val.indexOf(null), mistakesHere = 0, hintsHere = 0, wrongShown = false;
        const t0 = performance.now();
        // mřížka: políčka, znaménka mezi nimi, výsledky na konci řádků a pod sloupci
        const size = 2 * n + 1;
        const grid = h('div', { class: 'kq-grid', style: { gridTemplateColumns: 'repeat(' + size + ', auto)' } });
        const cells = [], rowTags = [], colTags = [];
        for (let gr = 0; gr < size; gr++) {
          for (let gc = 0; gc < size; gc++) {
            const r = gr >> 1, c = gc >> 1;
            if (gr % 2 === 0 && gc % 2 === 0 && r < n && c < n) {
              const i = r * n + c;
              const b = h('button', { class: 'kq-cell' + (P.giv[i] != null ? ' is-given' : ''), type: 'button', 'data-i': i, disabled: P.giv[i] != null }, P.giv[i] != null ? String(P.giv[i]) : '');
              cells[i] = b;
              grid.appendChild(b);
            } else if (gr % 2 === 0 && gc % 2 === 1 && r < n) {
              grid.appendChild(h('span', { class: 'kq-op' }, c < n - 1 ? P.rowOps[r][c] : '='));
            } else if (gr % 2 === 1 && gc % 2 === 0 && c < n) {
              grid.appendChild(h('span', { class: 'kq-op' }, r < n - 1 ? P.colOps[c][r] : '='));
            } else if (gr % 2 === 0 && gc === size - 1 && r < n) {
              const t = h('span', { class: 'kq-res' }, String(P.rowRes[r]));
              rowTags[r] = t;
              grid.appendChild(t);
            } else if (gr === size - 1 && gc % 2 === 0 && c < n) {
              const t = h('span', { class: 'kq-res' }, String(P.colRes[c]));
              colTags[c] = t;
              grid.appendChild(t);
            } else grid.appendChild(h('span', { class: 'kq-gap' }));
          }
        }
        const hintBtn = h('button', { class: 'btn btn-secondary btn-small nt-hint', type: 'button' }, 'Nápověda');
        const box = h('div', { class: 'stack pocty', 'data-sol': P.sol.join(',') }, grid, hintBtn);
        ctx.stage.appendChild(box);
        const keys = Array.from({ length: NN }, (_, k) => h('button', { class: 'btn nt-key', type: 'button', 'data-v': k + 1 }, String(k + 1)));
        const del = h('button', { class: 'btn btn-secondary nt-key nt-del', type: 'button' }, 'Smazat');
        ctx.foot.appendChild(h('div', { class: 'nt-keys' }, keys, del));
        ctx.status('Doplňte čísla, aby příklady platily.'); // dřív než měření místa
        // velikost políček podle místa
        const room = Math.min(ctx.stage.clientHeight - hintBtn.offsetHeight - 44, ctx.size().w - 8);
        const cellPx = Math.floor(U.clamp(room / (n + (n + 1) * 0.68), 30, 72));
        grid.style.setProperty('--kq', cellPx + 'px');
        if (box.scrollHeight > ctx.stage.clientHeight) box.style.maxHeight = ctx.stage.clientHeight + 'px'; // jinak se dá posunout

        const lineState = (cellsIdx, ops, res) => {
          const vs = cellsIdx.map((i) => val[i]);
          if (vs.some((v) => v == null)) return 0;
          return calc(vs, ops) === res ? 1 : -1;
        };
        const paint = () => {
          cells.forEach((c, i) => {
            if (P.giv[i] != null) return;
            c.textContent = val[i] != null ? String(val[i]) : '';
            c.classList.toggle('is-sel', i === sel);
            c.classList.toggle('is-wrong', wrongShown && val[i] != null && val[i] !== P.sol[i]);
          });
          P.rows.forEach((r, k) => { const s = lineState(r, P.rowOps[k], P.rowRes[k]); rowTags[k].classList.toggle('is-ok', s === 1); rowTags[k].classList.toggle('is-bad', s === -1); });
          P.cols.forEach((c, k) => { const s = lineState(c, P.colOps[k], P.colRes[k]); colTags[k].classList.toggle('is-ok', s === 1); colTags[k].classList.toggle('is-bad', s === -1); });
          const placed = {};
          val.forEach((v, i) => { if (v != null && P.giv[i] == null) placed[v] = true; });
          keys.forEach((k, j) => { k.classList.toggle('is-used', !!placed[j + 1]); k.disabled = P.giv.indexOf(j + 1) !== -1; });
          box.dataset.sel = sel;
        };
        paint();
        return new Promise((resolve) => {
          let done = false;
          const nextEmpty = (from) => {
            for (let k = 1; k <= NN; k++) { const i = (from + k) % NN; if (val[i] == null && P.giv[i] == null) return i; }
            return -1;
          };
          const finishCheck = async () => {
            if (val.some((v) => v == null)) return;
            const ok = P.rows.every((r, k) => lineState(r, P.rowOps[k], P.rowRes[k]) === 1) && P.cols.every((c, k) => lineState(c, P.colOps[k], P.colRes[k]) === 1);
            if (ok) {
              done = true;
              ctx.mark(true, (performance.now() - t0) / SM.timeScale);
              cells.forEach((c) => { c.disabled = true; });
              keys.concat(del, hintBtn).forEach((b) => { b.disabled = true; });
              box.classList.add('is-done');
              ctx.feedback(true);
              ctx.status('Výborně, všechny příklady platí!');
              await ctx.sleep(1500);
              resolve({ mistakes: mistakesHere, hints: hintsHere });
            } else {
              mistakesHere++;
              wrongShown = true;
              ctx.feedback(false);
              ctx.status('Některé příklady nevycházejí. Červená čísla patří jinam.');
              paint();
            }
          };
          cells.forEach((c, i) => U.tap(c, () => { if (done || P.giv[i] != null) return; sel = i; ctx.sound.tap(); paint(); }));
          keys.forEach((k, j) => U.tap(k, () => {
            if (done || sel < 0 || k.disabled) return;
            const v = j + 1;
            const old = val.indexOf(v);
            if (old !== -1 && P.giv[old] == null) val[old] = null;
            val[sel] = v;
            ctx.sound.tap();
            const nx = nextEmpty(sel);
            if (nx !== -1) sel = nx;
            wrongShown = false;
            paint();
            finishCheck();
          }));
          U.tap(del, () => { if (done || sel < 0) return; val[sel] = null; wrongShown = false; ctx.sound.tap(); paint(); });
          U.tap(hintBtn, () => {
            if (done) return;
            const i = sel >= 0 && val[sel] !== P.sol[sel] ? sel : val.findIndex((v, k) => P.giv[k] == null && v !== P.sol[k]);
            if (i < 0) return;
            const old = val.indexOf(P.sol[i]);
            if (old !== -1 && P.giv[old] == null) val[old] = null;
            val[i] = P.sol[i];
            hintsHere++;
            ctx.sound.tap();
            const nx = nextEmpty(i);
            sel = nx !== -1 ? nx : i;
            paint();
            finishCheck();
          });
        });
      }
    }
  });
})();
