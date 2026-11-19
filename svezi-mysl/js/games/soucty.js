/* Součtové čtverce — mřížka jako malé sudoku: v každém řádku a sloupci je každé číslo 1 až N právě jednou.
   Navíc jsou zadané součty obou úhlopříček. Řešič hlídá jediné řešení (logické vyvozování a sčítání). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* n = velikost, give = předem doplněných políček */
  const LEVELS = [{ n: 4, give: 7 }, { n: 4, give: 5 }, { n: 5, give: 10 }, { n: 5, give: 8 }];

  /* Náhodný latinský čtverec: posunuté řádky, pak promíchané řádky, sloupce a čísla. */
  function latin(n) {
    const base = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r + c) % n));
    const rp = U.shuffle(Array.from({ length: n }, (_, i) => i)), cp = U.shuffle(Array.from({ length: n }, (_, i) => i)), sp = U.shuffle(Array.from({ length: n }, (_, i) => i + 1));
    return rp.map((r) => cp.map((c) => sp[base[r][c]]));
  }
  const diagSums = (g) => { const n = g.length; let a = 0, b = 0; for (let i = 0; i < n; i++) { a += g[i][i]; b += g[i][n - 1 - i]; } return [a, b]; };

  /* Počet řešení (nejvýš 2) pro doplněná políčka a součty úhlopříček. */
  function countSolutions(n, giv, D) {
    const g = giv.map((row) => row.slice());
    let found = 0;
    const cells = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (g[r][c] == null) cells.push([r, c]);
    const diagOk = () => {
      let a = 0, b = 0, ea = 0, eb = 0;
      for (let i = 0; i < n; i++) {
        if (g[i][i] == null) ea++; else a += g[i][i];
        if (g[i][n - 1 - i] == null) eb++; else b += g[i][n - 1 - i];
      }
      return (ea ? a + ea <= D[0] && a + ea * n >= D[0] : a === D[0]) && (eb ? b + eb <= D[1] && b + eb * n >= D[1] : b === D[1]);
    };
    (function go(k) {
      if (found >= 2) return;
      if (k === cells.length) { found++; return; }
      const [r, c] = cells[k];
      for (let v = 1; v <= n; v++) {
        let clash = false;
        for (let i = 0; i < n && !clash; i++) if (g[r][i] === v || g[i][c] === v) clash = true;
        if (clash) continue;
        g[r][c] = v;
        if (diagOk()) go(k + 1);
        g[r][c] = null;
        if (found >= 2) return;
      }
    })(0);
    return found;
  }
  function makePuzzle(L) {
    const n = L.n;
    for (let t = 0; t < 200; t++) {
      const sol = latin(n);
      const D = diagSums(sol);
      let giv = sol.map((row) => row.slice());
      const order = U.shuffle(Array.from({ length: n * n }, (_, i) => i));
      for (const i of order) {
        if (giv.reduce((a, row) => a + row.filter((v) => v != null).length, 0) <= L.give) break;
        const r = Math.floor(i / n), c = i % n;
        const g2 = giv.map((row) => row.slice());
        g2[r][c] = null;
        if (countSolutions(n, g2, D) === 1) giv = g2;
      }
      if (giv.reduce((a, row) => a + row.filter((v) => v != null).length, 0) > L.give + 1) continue;
      return { n: n, sol: sol, giv: giv, D: D };
    }
    return null;
  }

  SM.registerGame({
    id: 'soucty',
    name: 'Součtové čtverce',
    domain: 'logika',
    trains: 'logické vyvozování a sčítání',
    short: 'Malé sudoku se součty na úhlopříčkách.',
    duration: 'asi 3 minuty',
    pace: { per: 'na čtverec' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jedna úloha dané úrovně (pro kontrolu generátoru). */
    gen(level) { return makePuzzle(LEVELS[level - 1]); },
    howTo(level) {
      const n = LEVELS[level - 1].n;
      return ['Doplňte čísla od 1 do ' + n + ' tak, aby v každém řádku i sloupci bylo každé číslo právě jednou, jako v sudoku.',
        'Čísla v rozích u šipek říkají, kolik je součet políček na úhlopříčce.',
        'Klepněte na prázdné políčko a vyberte číslo dole. Stejné číslo dvakrát v řádku nebo sloupci se hned zbarví červeně.',
        '„Nápověda“ doplní jedno políčko.'];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : 2;
      let mistakes = 0, hints = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Čtverec ' + (i + 1) + ' z ' + N);
        const r = await one(makePuzzle(ctx.short ? LEVELS[0] : L));
        mistakes += r.mistakes; hints += r.hints;
      }
      const perf = U.clamp(1 - 0.12 * mistakes / N - 0.15 * hints / N, 0, 1);
      const details = [];
      if (mistakes) details.push('Chybné pokusy: ' + mistakes);
      if (hints) details.push('Nápověda: ' + hints + '×');
      ctx.finish({
        perf: perf, acc: perf,
        levelDelta: K.levelByAcc(perf, 0.85, 0.5),
        big: N + ' z ' + N, bigLabel: N === 1 ? 'čtverec vyřešen' : 'čtverce vyřešeny',
        details: details, metric: { mistakes: mistakes, hints: hints }
      });

      async function one(P) {
        ctx.clear();
        const n = P.n;
        const val = P.giv.map((row) => row.slice());
        let sel = null, mistakesHere = 0, hintsHere = 0;
        const t0 = performance.now();
        const grid = h('div', { class: 'sq-grid', style: { gridTemplateColumns: 'repeat(' + n + ', var(--sq))' } });
        const cells = [];
        // součty úhlopříček nad mřížkou; políčka každé úhlopříčky mají vlastní barevný nádech
        const tagA = h('span', { class: 'sq-diag is-a' }, '↘ součet ' + P.D[0]), tagB = h('span', { class: 'sq-diag is-b' }, '↙ součet ' + P.D[1]);
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            const given = P.giv[r][c] != null;
            const b = h('button', { class: 'sq-cell' + (given ? ' is-given' : '') + (r === c ? ' on-a' : '') + (r === n - 1 - c ? ' on-b' : ''), type: 'button', 'data-r': r, 'data-c': c, disabled: given }, given ? String(P.giv[r][c]) : '');
            cells.push(b);
            grid.appendChild(b);
          }
        }
        const hintBtn = h('button', { class: 'btn btn-secondary btn-small nt-hint', type: 'button' }, 'Nápověda');
        const head = h('div', { class: 'sq-diags' }, tagA, tagB);
        const box = h('div', { class: 'stack soucty', 'data-sol': P.sol.map((row) => row.join('')).join('/') }, head, grid, hintBtn);
        ctx.stage.appendChild(box);
        const keys = Array.from({ length: n }, (_, k) => h('button', { class: 'btn nt-key', type: 'button', 'data-v': k + 1 }, String(k + 1)));
        const del = h('button', { class: 'btn btn-secondary nt-key nt-del', type: 'button' }, 'Smazat');
        ctx.foot.appendChild(h('div', { class: 'nt-keys', style: { gridTemplateColumns: 'repeat(' + (n + 1) + ', minmax(0, 1fr))' } }, keys, del));
        ctx.status('Doplňte čísla 1 až ' + n + ', v řádku i sloupci každé jednou.'); // dřív než měření místa
        const room = Math.min(ctx.stage.clientHeight - hintBtn.offsetHeight - head.offsetHeight - 48, ctx.size().w - 8);
        grid.style.setProperty('--sq', Math.floor(U.clamp((room - 4 * (n - 1)) / n, 26, 72)) + 'px');
        if (box.scrollHeight > ctx.stage.clientHeight) box.style.maxHeight = ctx.stage.clientHeight + 'px'; // jinak se dá posunout
        const firstEmpty = () => { for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (val[r][c] == null) return [r, c]; return null; };
        sel = firstEmpty();
        const conflict = (r, c) => {
          const v = val[r][c];
          if (v == null) return false;
          for (let i = 0; i < n; i++) { if (i !== c && val[r][i] === v) return true; if (i !== r && val[i][c] === v) return true; }
          return false;
        };
        const paint = () => {
          cells.forEach((b) => {
            const r = +b.dataset.r, c = +b.dataset.c;
            if (P.giv[r][c] == null) b.textContent = val[r][c] != null ? String(val[r][c]) : '';
            b.classList.toggle('is-sel', !!sel && sel[0] === r && sel[1] === c);
            b.classList.toggle('is-wrong', conflict(r, c));
          });
          const full = val.every((row) => row.every((v) => v != null));
          const d = diagSums(val.map((row) => row.map((v) => v || 0)));
          const da = val.every((row, i) => row[i] != null), db = val.every((row, i) => row[n - 1 - i] != null);
          tagA.classList.toggle('is-ok', da && d[0] === P.D[0]); tagA.classList.toggle('is-bad', da && d[0] !== P.D[0]);
          tagB.classList.toggle('is-ok', db && d[1] === P.D[1]); tagB.classList.toggle('is-bad', db && d[1] !== P.D[1]);
          box.dataset.sel = sel ? sel.join(',') : '';
          return full;
        };
        paint();
        return new Promise((resolve) => {
          let done = false;
          const nextEmpty = () => {
            const flat = [];
            for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) flat.push([r, c]);
            const at = sel ? sel[0] * n + sel[1] : -1;
            for (let k = 1; k <= flat.length; k++) { const p = flat[(at + k + flat.length) % flat.length]; if (val[p[0]][p[1]] == null) return p; }
            return sel;
          };
          const check = async () => {
            if (!val.every((row) => row.every((v) => v != null))) return;
            const ok = cells.every((b) => !conflict(+b.dataset.r, +b.dataset.c)) && diagSums(val)[0] === P.D[0] && diagSums(val)[1] === P.D[1];
            if (ok) {
              done = true;
              ctx.mark(true, (performance.now() - t0) / SM.timeScale);
              cells.forEach((b) => { b.disabled = true; });
              keys.concat(del, hintBtn).forEach((b) => { b.disabled = true; });
              box.classList.add('is-done');
              ctx.feedback(true);
              ctx.status('Výborně, čtverec je hotový!');
              await ctx.sleep(1500);
              resolve({ mistakes: mistakesHere, hints: hintsHere });
            } else {
              mistakesHere++;
              ctx.feedback(false);
              ctx.status('Něco nesedí: zkontrolujte červená čísla a součty úhlopříček.');
            }
          };
          cells.forEach((b) => U.tap(b, () => { if (done || b.disabled) return; sel = [+b.dataset.r, +b.dataset.c]; ctx.sound.tap(); paint(); }));
          keys.forEach((k, j) => U.tap(k, () => {
            if (done || !sel) return;
            val[sel[0]][sel[1]] = j + 1;
            ctx.sound.tap();
            sel = nextEmpty() || sel;
            paint();
            check();
          }));
          U.tap(del, () => { if (done || !sel) return; val[sel[0]][sel[1]] = null; ctx.sound.tap(); paint(); });
          U.tap(hintBtn, () => {
            if (done) return;
            let p = sel && val[sel[0]][sel[1]] !== P.sol[sel[0]][sel[1]] ? sel : null;
            for (let r = 0; r < n && !p; r++) for (let c = 0; c < n && !p; c++) if (val[r][c] !== P.sol[r][c]) p = [r, c];
            if (!p) return;
            val[p[0]][p[1]] = P.sol[p[0]][p[1]];
            hintsHere++;
            ctx.sound.tap();
            sel = nextEmpty() || p;
            paint();
            check();
          });
        });
      }
    }
  });
})();
