/* Hadí cesta — v mřížce je had: jedna nepřerušená cesta sousedními políčky od začátku ke konci, nevětví se
   a sám sebe se nedotýká ani šikmo. Čísla u řádků a sloupců říkají, kolik políček hada v nich leží
   (logické vyvozování, plánování cesty). Řešič ověří, že úloha má jediné řešení. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* n = velikost mřížky, len = délka hada, example = nejdřív vyřešená ukázka */
  const LEVELS = [
    { n: 4, len: [6, 9], example: true },
    { n: 5, len: [8, 12] },
    { n: 6, len: [11, 17] },
    { n: 7, len: [14, 22] }
  ];
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const far = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) >= 2; // ani šikmo se nedotýkají

  /* Může had pokračovat na políčko c? (jen se nesmí dotknout svých dřívějších částí) */
  function canGo(path, c, n) {
    if (c[0] < 0 || c[1] < 0 || c[0] >= n || c[1] >= n) return false;
    for (let i = 0; i < path.length; i++) {
      if (path[i][0] === c[0] && path[i][1] === c[1]) return false;
      if (i <= path.length - 3 && !far(path[i], c)) return false;
    }
    return true;
  }
  /* Počet řešení (nejvýš 2) pro čísla u řádků a sloupců, začátek, konec a dané části hada; budget = nejvýš kroků hledání. */
  function countSolutions(n, R, C, S, E, given, budget) {
    const total = R.reduce((a, b) => a + b, 0);
    const rc = Array(n).fill(0), cc = Array(n).fill(0);
    const path = [S];
    rc[S[0]]++; cc[S[1]]++;
    let found = 0, steps = 0;
    const isE = (c) => c[0] === E[0] && c[1] === E[1];
    const givenSet = {};
    given.forEach((g) => { givenSet[g.join()] = true; });
    function go() {
      if (found >= 2 || steps > budget) return;
      steps++;
      const head = path[path.length - 1];
      const left = total - path.length;
      const md = Math.abs(head[0] - E[0]) + Math.abs(head[1] - E[1]);
      if (md > left || (left - md) % 2) return; // do konce to nejde nebo nesedí sudost
      for (const d of D4) {
        const c = [head[0] + d[0], head[1] + d[1]];
        if (!canGo(path, c, n) || rc[c[0]] >= R[c[0]] || cc[c[1]] >= C[c[1]]) continue;
        if (isE(c)) {
          if (left !== 1) continue;
          const all = path.concat([c]);
          const keys = {};
          all.forEach((p) => { keys[p.join()] = true; });
          if (given.every((g) => keys[g.join()])) found++;
          continue;
        }
        path.push(c); rc[c[0]]++; cc[c[1]]++;
        go();
        path.pop(); rc[c[0]]--; cc[c[1]]--;
        if (found >= 2 || steps > budget) return;
      }
    }
    go();
    return steps > budget ? 99 : found;
  }
  function makePuzzle(L) {
    const n = L.n;
    for (let t = 0; t < 400; t++) {
      const path = [[U.randInt(0, n - 1), U.randInt(0, n - 1)]];
      const want = U.randInt(L.len[0], L.len[1]);
      while (path.length < want) {
        const head = path[path.length - 1];
        const opts = D4.map((d) => [head[0] + d[0], head[1] + d[1]]).filter((c) => canGo(path, c, n));
        if (!opts.length) break;
        path.push(U.pick(opts));
      }
      if (path.length < L.len[0]) continue;
      const R = Array(n).fill(0), C = Array(n).fill(0);
      path.forEach((p) => { R[p[0]]++; C[p[1]]++; });
      const S = path[0], E = path[path.length - 1];
      // Když řešení není jediné, prozradí se pár políček hada navíc.
      const given = [];
      const inner = U.shuffle(path.slice(1, -1));
      let cnt = countSolutions(n, R, C, S, E, given, 60000);
      while (cnt !== 1 && given.length < 3 && inner.length) {
        given.push(inner.pop());
        cnt = countSolutions(n, R, C, S, E, given, 60000);
      }
      if (cnt !== 1) continue;
      return { n: n, path: path, R: R, C: C, S: S, E: E, given: given };
    }
    return null;
  }

  SM.registerGame({
    id: 'had',
    name: 'Hadí cesta',
    domain: 'logika',
    trains: 'logické vyvozování a plánování cesty',
    short: 'Najděte, kudy se v mřížce plazí had.',
    duration: 'asi 3 minuty',
    pace: { per: 'na mřížku' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jedna úloha dané úrovně (pro kontrolu generátoru). */
    gen(level) { return makePuzzle(LEVELS[level - 1]); },
    howTo() {
      return ['V mřížce je schovaný had: jedna nepřerušená řada políček od hlavy (kroužek) k ocasu (kroužek). Políčka na sebe navazují stranou, ne šikmo.',
        'Had se nevětví a sám sebe se nedotýká, ani rohem.',
        'Čísla u řádků a sloupců říkají, kolik políček hada v nich je.',
        'Klepnutím políčko vybarvíte jako hada, dalším klepnutím označíte křížkem, že tam had není. Pak dejte „Zkontrolovat“.'];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : 2;
      let mistakes = 0, hints = 0;
      if (L.example && !ctx.short) await example();
      for (let i = 0; i < N; i++) {
        ctx.progress('Mřížka ' + (i + 1) + ' z ' + N);
        const r = await one(makePuzzle(ctx.short ? LEVELS[Math.min(1, ctx.level - 1)] : L));
        mistakes += r.mistakes; hints += r.hints;
      }
      const perf = U.clamp(1 - 0.12 * mistakes - 0.12 * hints / N, 0, 1);
      const details = [];
      if (mistakes) details.push('Chybné kontroly: ' + mistakes);
      if (hints) details.push('Nápověda: ' + hints + '×');
      ctx.finish({
        perf: perf, acc: perf,
        levelDelta: K.levelByAcc(perf, 0.85, 0.5),
        big: N + ' z ' + N, bigLabel: N === 1 ? 'mřížka vyřešena' : 'mřížky vyřešeny',
        details: details, metric: { mistakes: mistakes, hints: hints }
      });

      /* Kreslení mřížky s čísly; state[r][c]: 0 prázdné, 1 had, 2 křížek. Vrací { box, cells, paint }. */
      function board(P, state, fixed) {
        const n = P.n;
        // políčka i s mezerami (3 px) a okrajem, ať je vidět celá mřížka
        const size = Math.floor(U.clamp(Math.min((ctx.size().w - 16 - 3 * n) / (n + 1), (ctx.stage.clientHeight - 28 - 3 * n) / (n + 1)), 22, 64));
        const grid = h('div', { class: 'hd-grid', style: { gridTemplateColumns: 'repeat(' + (n + 1) + ', ' + size + 'px)', gridAutoRows: size + 'px', '--hd': size + 'px' } });
        const colTags = [], rowTags = [];
        grid.appendChild(h('span', { class: 'hd-corner' }));
        for (let c = 0; c < n; c++) { const t = h('span', { class: 'hd-num' }, String(P.C[c])); colTags.push(t); grid.appendChild(t); }
        const cells = [];
        for (let r = 0; r < n; r++) {
          const t = h('span', { class: 'hd-num' }, String(P.R[r]));
          rowTags.push(t);
          grid.appendChild(t);
          cells.push([]);
          for (let c = 0; c < n; c++) {
            const end = (r === P.S[0] && c === P.S[1]) || (r === P.E[0] && c === P.E[1]);
            const b = h('button', { class: 'hd-cell' + (end ? ' is-end' : '') + (fixed[r][c] ? ' is-fixed' : ''), type: 'button', 'data-r': r, 'data-c': c, 'aria-label': 'Řádek ' + (r + 1) + ', sloupec ' + (c + 1), disabled: fixed[r][c] });
            cells[r].push(b);
            grid.appendChild(b);
          }
        }
        const paint = (wrong) => {
          const rc = Array(n).fill(0), cc = Array(n).fill(0);
          for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
            const st = state[r][c];
            const el = cells[r][c];
            el.classList.toggle('is-snake', st === 1);
            el.classList.toggle('is-x', st === 2);
            el.classList.toggle('is-wrong', !!(wrong && wrong[r + ',' + c]));
            el.setAttribute('aria-pressed', st === 1 ? 'true' : 'false');
            if (st === 1) { rc[r]++; cc[c]++; }
          }
          rowTags.forEach((t, r) => { t.classList.toggle('is-ok', rc[r] === P.R[r]); t.classList.toggle('is-bad', rc[r] > P.R[r]); });
          colTags.forEach((t, c) => { t.classList.toggle('is-ok', cc[c] === P.C[c]); t.classList.toggle('is-bad', cc[c] > P.C[c]); });
        };
        return { grid: grid, cells: cells, paint: paint };
      }
      function fixedOf(P) {
        const f = Array.from({ length: P.n }, () => Array(P.n).fill(false));
        [P.S, P.E].concat(P.given).forEach((p) => { f[p[0]][p[1]] = true; });
        return f;
      }
      function solOf(P) {
        const s = {};
        P.path.forEach((p) => { s[p.join()] = true; });
        return s;
      }

      /* Vyřešená ukázka na první úrovni. */
      async function example() {
        const P = makePuzzle(L);
        ctx.clear();
        ctx.progress('Ukázka');
        const state = Array.from({ length: P.n }, () => Array(P.n).fill(2));
        P.path.forEach((p) => { state[p[0]][p[1]] = 1; });
        const b = board(P, state, Array.from({ length: P.n }, () => Array(P.n).fill(true)));
        ctx.stage.appendChild(h('div', { class: 'stack had is-example' }, b.grid));
        b.paint();
        ctx.status('Ukázka: had vede od kroužku ke kroužku a čísla u řádků a sloupců sedí.');
        await K.next(ctx, 'Rozumím, zkusím to');
      }

      async function one(P) {
        ctx.clear();
        const n = P.n;
        const fixed = fixedOf(P);
        const sol = solOf(P);
        const state = Array.from({ length: n }, () => Array(n).fill(0));
        [P.S, P.E].concat(P.given).forEach((p) => { state[p[0]][p[1]] = 1; });
        const box = h('div', { class: 'stack had', 'data-sol': P.path.map((p) => p.join(',')).join(';') });
        ctx.stage.appendChild(box);
        const check = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, 'Zkontrolovat');
        const hintBtn = h('button', { class: 'btn btn-secondary btn-lg hd-hint', type: 'button' }, 'Nápověda');
        ctx.foot.appendChild(h('div', { class: 'hd-actions' }, hintBtn, check));
        ctx.status('Klepnutím označte políčka hada. Křížek = tady had není.'); // dřív než měření místa
        const b = board(P, state, fixed);
        box.appendChild(b.grid);
        b.paint();
        const t0 = performance.now();
        let mistakesHere = 0, hintsHere = 0;
        return new Promise((resolve) => {
          let done = false;
          b.cells.forEach((row, r) => row.forEach((el, c) => U.tap(el, () => {
            if (done || fixed[r][c]) return;
            state[r][c] = (state[r][c] + 1) % 3;
            ctx.sound.tap();
            b.paint();
          })));
          U.tap(hintBtn, () => {
            if (done) return;
            // Nápověda: opraví jedno chybně vybarvené políčko, nebo doplní jedno chybějící políčko hada.
            let fix = null;
            for (let r = 0; r < n && !fix; r++) for (let c = 0; c < n && !fix; c++) if (state[r][c] === 1 && !sol[r + ',' + c]) fix = [r, c, 2];
            if (!fix) { const p = P.path.find((q) => state[q[0]][q[1]] !== 1); if (p) fix = [p[0], p[1], 1]; }
            if (!fix) return;
            state[fix[0]][fix[1]] = fix[2];
            hintsHere++;
            ctx.sound.tap();
            b.paint();
          });
          U.tap(check, async () => {
            if (done) return;
            const wrong = {};
            let missing = 0;
            for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
              const isSnake = !!sol[r + ',' + c];
              if (state[r][c] === 1 && !isSnake) wrong[r + ',' + c] = true;
              if (isSnake && state[r][c] !== 1) missing++;
            }
            const nWrong = Object.keys(wrong).length;
            if (!nWrong && !missing) {
              done = true;
              ctx.mark(true, (performance.now() - t0) / SM.timeScale);
              b.cells.forEach((row) => row.forEach((el) => { el.disabled = true; }));
              check.disabled = hintBtn.disabled = true;
              box.classList.add('is-done');
              ctx.feedback(true);
              ctx.status('Výborně, had je celý!');
              await ctx.sleep(1500);
              resolve({ mistakes: mistakesHere, hints: hintsHere });
              return;
            }
            mistakesHere++;
            ctx.feedback(false);
            b.paint(wrong);
            ctx.status(nWrong ? 'Červená políčka k hadovi nepatří.' + (missing ? ' A ještě ' + missing + ' ' + U.plural(missing, 'políčko chybí', 'políčka chybí', 'políček chybí') + '.' : '')
              : 'Zatím chybí ' + missing + ' ' + U.plural(missing, 'políčko', 'políčka', 'políček') + ' hada.');
          });
        });
      }
    }
  });
})();
