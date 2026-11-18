/* Sudoku — doplnit čísla tak, aby se v řádku, sloupci ani čtverci neopakovala (logické vyvozování). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const PICS = ['🍎', '🍐', '🍋', '🍇'];
  const PIC_NAMES = ['jablko', 'hruška', 'citron', 'hrozny'];
  /* n = velikost mřížky, br × bc = rozměr čtverce (řádky × sloupce), holes = prázdná políčka. */
  const LEVELS = [
    { n: 4, br: 2, bc: 2, holes: 6, pics: true },
    { n: 4, br: 2, bc: 2, holes: 9 },
    { n: 6, br: 2, bc: 3, holes: 16 },
    { n: 6, br: 2, bc: 3, holes: 21 },
    { n: 9, br: 3, bc: 3, holes: 40 },
    { n: 9, br: 3, bc: 3, holes: 47 }
  ];
  const keys = (n) => Array.from({ length: n }, (_, i) => i);

  /* Náhodné vyřešené sudoku: platný vzor, pak záměna čísel, řádků v pásech, pásů, sloupců ve sloupcích čtverců a těch sloupců. */
  function solution(L) {
    const n = L.n, br = L.br, bc = L.bc;
    const rows = [];
    U.shuffle(keys(n / br)).forEach((b) => U.shuffle(keys(br)).forEach((i) => rows.push(b * br + i)));
    const cols = [];
    U.shuffle(keys(n / bc)).forEach((s) => U.shuffle(keys(bc)).forEach((i) => cols.push(s * bc + i)));
    const digits = U.shuffle(keys(n)).map((d) => d + 1);
    const out = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) out.push(digits[(bc * (rows[r] % br) + Math.floor(rows[r] / br) + cols[c]) % n]);
    return out;
  }

  /* Počet řešení (nejvýš limit) — prohledávání s volbou políčka s nejmenším počtem možností. */
  function countSolutions(cells, L, limit) {
    const n = L.n;
    const full = (1 << n) - 1;
    const per = n / L.bc;
    const box = (r, c) => Math.floor(r / L.br) * per + Math.floor(c / L.bc);
    const rowM = new Array(n).fill(0);
    const colM = new Array(n).fill(0);
    const boxM = new Array(n).fill(0);
    const g = cells.slice();
    for (let i = 0; i < n * n; i++) {
      if (!g[i]) continue;
      const r = Math.floor(i / n), c = i % n, bit = 1 << (g[i] - 1);
      if ((rowM[r] | colM[c] | boxM[box(r, c)]) & bit) return 0;
      rowM[r] |= bit; colM[c] |= bit; boxM[box(r, c)] |= bit;
    }
    let count = 0;
    const bits = (m) => { let k = 0; while (m) { m &= m - 1; k++; } return k; };
    (function solve() {
      let best = -1, bestMask = 0, bestN = 99;
      for (let i = 0; i < n * n; i++) {
        if (g[i]) continue;
        const r = Math.floor(i / n), c = i % n;
        const mask = full & ~(rowM[r] | colM[c] | boxM[box(r, c)]);
        const k = bits(mask);
        if (k < bestN) { best = i; bestMask = mask; bestN = k; if (!k) return; }
      }
      if (best < 0) { count++; return; }
      const r = Math.floor(best / n), c = best % n, b = box(r, c);
      for (let d = 0; d < n && count < limit; d++) {
        const bit = 1 << d;
        if (!(bestMask & bit)) continue;
        g[best] = d + 1; rowM[r] |= bit; colM[c] |= bit; boxM[b] |= bit;
        solve();
        g[best] = 0; rowM[r] &= ~bit; colM[c] &= ~bit; boxM[b] &= ~bit;
      }
    })();
    return count;
  }

  /* Zadání s jediným řešením: odebírá políčka, dokud řešení zůstává jediné. */
  function makePuzzle(L) {
    const sol = solution(L);
    const cells = sol.slice();
    let holes = 0;
    U.shuffle(keys(L.n * L.n)).forEach((i) => {
      if (holes >= L.holes) return;
      const keep = cells[i];
      cells[i] = 0;
      if (countSolutions(cells, L, 2) === 1) holes++;
      else cells[i] = keep;
    });
    return { sol: sol, cells: cells };
  }

  SM.registerGame({
    id: 'sudoku',
    name: 'Sudoku',
    domain: 'logika',
    trains: 'logické vyvozování a soustředění',
    short: 'Doplňte čísla, aby se neopakovala.',
    duration: 'asi 2 až 5 minut',
    pace: { per: 'na políčko' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const what = L.pics ? 'obrázek' : 'číslo od 1 do ' + L.n;
      return [
        'Doplňte do každého prázdného políčka ' + what + '.',
        'V žádném řádku, sloupci ani silně orámovaném čtverci se nic nesmí opakovat.',
        'Klepněte na prázdné políčko a pak dole na ' + (L.pics ? 'obrázek.' : 'číslo.') + ' Chybu hned uvidíte a můžete ji opravit.',
        'Když nevíte dál, pomůže tlačítko „Nápověda“.'
      ];
    },
    async run(ctx) {
      let L = LEVELS[ctx.level - 1];
      if (ctx.short && L.n === 9) L = LEVELS[3]; // do lekce nanejvýš 6 × 6
      const puzzles = !ctx.short && L.n === 4 ? 2 : 1;
      if (L.n === 4 && !SM.store.flag('sudoku-ukazka')) {
        await example();
        SM.store.setFlag('sudoku-ukazka', true);
      }
      let mistakes = 0, hints = 0, cellsTotal = 0, firstOk = 0;
      const t0 = performance.now();
      for (let p = 0; p < puzzles; p++) {
        ctx.progress(puzzles > 1 ? 'Sudoku ' + (p + 1) + ' z ' + puzzles : '');
        const r = await play(makePuzzle(L));
        mistakes += r.mistakes; hints += r.hints; cellsTotal += r.cells; firstOk += r.firstOk;
      }
      const ms = (performance.now() - t0) / SM.timeScale;
      const acc = cellsTotal ? firstOk / cellsTotal : 0;
      const perf = U.clamp(1 - 0.08 * mistakes - 0.15 * hints, 0, 1);
      ctx.finish({
        perf: perf, acc: acc, rt: ms / Math.max(1, cellsTotal),
        levelDelta: perf >= 0.8 ? 1 : perf < 0.4 ? -1 : 0,
        big: U.fmtTime(ms), bigLabel: puzzles > 1 ? 'čas na obě sudoku' : 'čas na vyřešení',
        details: ['Chyby: ' + mistakes].concat(hints ? ['Nápověda: ' + hints + '×'] : []),
        metric: { mistakes: mistakes, hints: hints, cells: cellsTotal }
      });

      /* Ukázka pravidla na vyřešené mřížce 4 × 4 (jen poprvé). */
      async function example() {
        const S = { n: 4, br: 2, bc: 2 };
        const sol = solution(S);
        const grid = h('div', { class: 'sud is-example', style: { '--n': 4, '--cell': '3.4rem' } },
          sol.map((v, i) => h('span', { class: 'sud-cell' + edge(S, i), 'data-i': i }, String(v))));
        K.show(ctx, grid);
        const mark = (fn) => grid.querySelectorAll('.sud-cell').forEach((el, i) => el.classList.toggle('is-zone', fn(Math.floor(i / 4), i % 4)));
        const steps = [
          ['Ukázka: v každém řádku je každé číslo jen jednou.', (r) => r === 1],
          ['Také v každém sloupci je každé číslo jen jednou.', (r, c) => c === 2],
          ['A stejně tak v každém silně orámovaném čtverci.', (r, c) => r >= 2 && c < 2]
        ];
        for (let s = 0; s < steps.length; s++) {
          ctx.status(steps[s][0]);
          mark(steps[s][1]);
          await K.next(ctx, s === steps.length - 1 ? 'Začít hrát' : 'Další');
        }
      }

      function edge(S, i) {
        const r = Math.floor(i / S.n), c = i % S.n;
        return (r % S.br === 0 && r ? ' bt' : '') + (c % S.bc === 0 && c ? ' bl' : '');
      }

      /* Jedno sudoku. Vrací { mistakes, hints, cells, firstOk }. */
      function play(pz) {
        return new Promise((resolve) => {
          const n = L.n;
          const cur = pz.cells.slice();
          const missed = {};
          let sel = -1;
          let mistakesHere = 0, hintsHere = 0;
          const shown = (v) => (v ? (L.pics ? PICS[v - 1] : String(v)) : '');
          ctx.clear();
          ctx.status(L.pics ? 'Doplňte obrázky.' : 'Doplňte čísla.');

          // Klávesnice dole (nejdřív, aby šla změřit zbylá plocha pro mřížku).
          const pad = h('div', { class: 'sud-pad' + (n === 9 ? ' is-two' : '') });
          for (let d = 1; d <= n; d++) {
            const b = h('button', { class: 'btn sud-key' + (L.pics ? ' is-pic' : ''), type: 'button', 'data-v': d, 'aria-label': L.pics ? PIC_NAMES[d - 1] : String(d) }, shown(d));
            U.tap(b, () => put(d));
            pad.appendChild(b);
          }
          const del = h('button', { class: 'btn sud-key is-del', type: 'button', 'data-v': 0 }, 'Smazat');
          U.tap(del, () => put(0));
          pad.appendChild(del);
          const hintBtn = h('button', { class: 'btn btn-secondary btn-small sud-hint', type: 'button' }, 'Nápověda');
          U.tap(hintBtn, hint);
          ctx.foot.appendChild(pad);
          ctx.foot.appendChild(hintBtn);

          const sz = ctx.size();
          // okraj mřížky, mezery mezi políčky a okraje posuvné plochy kolem ní
          const cell = Math.floor(U.clamp(Math.min((Math.min(sz.w, 560) - 8 - (n - 1)) / n, (sz.h - 22 - (n - 1)) / n), 30, 68));
          const grid = h('div', { class: 'sud', style: { '--n': n, '--cell': cell + 'px' }, role: 'grid', 'aria-label': 'Sudoku ' + n + ' × ' + n });
          const els = cur.map((v, i) => {
            const given = !!pz.cells[i];
            const b = h('button', {
              class: 'sud-cell' + edge(L, i) + (given ? ' is-given' : ''), type: 'button', 'data-i': i,
              'data-given': given ? v : null, disabled: given || null,
              'aria-label': 'Řádek ' + (Math.floor(i / n) + 1) + ', sloupec ' + (i % n + 1) + (given ? ': ' + (L.pics ? PIC_NAMES[v - 1] : v) : ', prázdné')
            }, shown(v));
            if (!given) U.tap(b, () => select(i));
            grid.appendChild(b);
            return b;
          });
          // Když se mřížka nevejde ani s nejmenšími políčky (malý displej, velké písmo), posouvá se a nepřekrývá klávesnici.
          ctx.stage.appendChild(h('div', { class: 'stack' }, grid));
          const empties = cur.filter((v) => !v).length;
          select(cur.indexOf(0));

          function same(i, j) {
            const r1 = Math.floor(i / n), c1 = i % n, r2 = Math.floor(j / n), c2 = j % n;
            return r1 === r2 || c1 === c2 || (Math.floor(r1 / L.br) === Math.floor(r2 / L.br) && Math.floor(c1 / L.bc) === Math.floor(c2 / L.bc));
          }
          function paint() {
            els.forEach((el, i) => {
              el.classList.toggle('is-sel', i === sel);
              el.classList.toggle('is-zone', sel >= 0 && i !== sel && same(i, sel));
              el.classList.toggle('is-same', sel >= 0 && !!cur[sel] && cur[i] === cur[sel] && i !== sel);
              el.classList.toggle('is-wrong', !!cur[i] && cur[i] !== pz.sol[i]);
            });
          }
          function select(i) {
            if (i < 0 || pz.cells[i]) return;
            sel = i;
            ctx.sound.tap();
            paint();
          }
          function put(d) {
            if (sel < 0 || pz.cells[sel] || !ctx.alive) return;
            if (cur[sel] === pz.sol[sel] && d !== 0) return; // správně vyplněné políčko nepřepisujeme omylem
            cur[sel] = d;
            const el = els[sel];
            el.textContent = shown(d);
            el.setAttribute('data-v', d || '');
            if (d && d !== pz.sol[sel]) {
              mistakesHere++;
              missed[sel] = true;
              ctx.sound.wrong();
              el.classList.remove('is-shake');
              void el.offsetWidth;
              el.classList.add('is-shake');
              ctx.status('Tohle tam nepatří. Zkuste jiné' + (L.pics ? '.' : ' číslo.'));
            } else if (d) {
              ctx.sound.tap();
              ctx.status(L.pics ? 'Doplňte obrázky.' : 'Doplňte čísla.');
            }
            paint();
            check();
          }
          function hint() {
            if (!ctx.alive) return;
            let i = sel >= 0 && cur[sel] !== pz.sol[sel] ? sel : cur.findIndex((v, k) => v !== pz.sol[k]);
            if (i < 0) return;
            hintsHere++;
            missed[i] = true;
            sel = i;
            cur[i] = pz.sol[i];
            els[i].textContent = shown(cur[i]);
            els[i].setAttribute('data-v', cur[i]);
            els[i].classList.add('is-hinted');
            ctx.sound.tap();
            paint();
            check();
          }
          function check() {
            if (cur.some((v, i) => v !== pz.sol[i])) return;
            sel = -1;
            paint();
            grid.classList.add('is-done');
            pad.classList.add('is-locked');
            hintBtn.disabled = true;
            ctx.feedback(true);
            ctx.status('Vyřešeno!');
            ctx.sleep(1500).then(() => resolve({ mistakes: mistakesHere, hints: hintsHere, cells: empties, firstOk: empties - Object.keys(missed).length }));
          }
        });
      }
    }
  });
})();
