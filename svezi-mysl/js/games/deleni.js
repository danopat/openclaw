/* Dělení tvaru — tvar ze čtverečků rozdělit na zadaný počet stejných dílů. Díly smí být pootočené, ne zrcadlené
   (prostorová představivost, ochota zkoušet). Tvar vzniká z pootočených kopií náhodného dílku; uznává se každé správné rozdělení. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* k = počet dílů, s = velikost dílu */
  const LEVELS = [{ k: 2, s: [3, 4] }, { k: 3, s: [3, 4] }, { k: 4, s: [3, 4] }, { k: 3, s: [5, 6] }];
  const COLORS = ['#e07b00', '#2c69d6', '#3a9a4a', '#8a4fd0'];
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const norm = (cells) => {
    const mr = Math.min.apply(null, cells.map((c) => c[0])), mc = Math.min.apply(null, cells.map((c) => c[1]));
    return cells.map((c) => [c[0] - mr, c[1] - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  };
  const key = (cells) => norm(cells).map((c) => c.join(',')).join(';');
  const rot = (cells) => cells.map((c) => [c[1], -c[0]]);
  const rots = (cells) => { const out = []; let c = cells; for (let i = 0; i < 4; i++) { out.push(norm(c)); c = rot(c); } return out; };
  /* Jsou dva díly stejné až na pootočení? */
  const same = (a, b) => { const kb = key(b); return rots(a).some((r) => key(r) === kb); };
  const connected = (cells) => {
    if (!cells.length) return false;
    const has = {};
    cells.forEach((c) => { has[c.join()] = true; });
    const seen = {};
    const st = [cells[0]];
    seen[cells[0].join()] = true;
    let n = 0;
    while (st.length) {
      const c = st.pop();
      n++;
      D4.forEach((d) => { const k = (c[0] + d[0]) + ',' + (c[1] + d[1]); if (has[k] && !seen[k]) { seen[k] = true; st.push([c[0] + d[0], c[1] + d[1]]); } });
    }
    return n === cells.length;
  };

  /* Tvar: k pootočených kopií jednoho dílku přiložených k sobě; vrací { cells, sol: číslo dílu u políčka }. */
  function makePuzzle(L) {
    for (let t = 0; t < 600; t++) {
      const size = U.randInt(L.s[0], L.s[1]);
      // náhodný dílek
      let piece = [[0, 0]];
      while (piece.length < size) {
        const c = U.pick(piece), d = U.pick(D4), nx = [c[0] + d[0], c[1] + d[1]];
        if (!piece.some((p) => p[0] === nx[0] && p[1] === nx[1])) piece.push(nx);
      }
      piece = norm(piece);
      if (piece.every((p) => p[0] === 0) || piece.every((p) => p[1] === 0)) continue; // rovná tyčka je moc snadná
      const forms = rots(piece);
      const placed = [];
      const occ = {};
      let okk = true;
      for (let i = 0; i < L.k && okk; i++) {
        let done = false;
        for (let tries = 0; tries < 80 && !done; tries++) {
          const f = U.pick(forms);
          let off;
          if (!placed.length) off = [0, 0];
          else {
            // přiložit k některému políčku, které už leží
            const base = U.pick(U.pick(placed)), d = U.pick(D4), anchor = U.pick(f);
            off = [base[0] + d[0] - anchor[0], base[1] + d[1] - anchor[1]];
          }
          const cells = f.map((c) => [c[0] + off[0], c[1] + off[1]]);
          if (cells.some((c) => occ[c.join()])) continue;
          cells.forEach((c) => { occ[c.join()] = i + 1; });
          placed.push(cells);
          done = true;
        }
        if (!done) okk = false;
      }
      if (!okk) continue;
      const all = [].concat.apply([], placed);
      const mr = Math.min.apply(null, all.map((c) => c[0])), mc = Math.min.apply(null, all.map((c) => c[1]));
      const rows = 1 + Math.max.apply(null, all.map((c) => c[0])) - mr, cols = 1 + Math.max.apply(null, all.map((c) => c[1])) - mc;
      if (rows > 6 || cols > 6) continue;
      // bez děr uvnitř tvaru (díry by mátly)
      const inShape = {};
      all.forEach((c) => { inShape[(c[0] - mr) + ',' + (c[1] - mc)] = true; });
      const outside = {};
      const st = [];
      for (let r = -1; r <= rows; r++) for (let c = -1; c <= cols; c++) if (r < 0 || c < 0 || r === rows || c === cols) { outside[r + ',' + c] = true; st.push([r, c]); }
      while (st.length) {
        const p = st.pop();
        D4.forEach((d) => {
          const q = [p[0] + d[0], p[1] + d[1]];
          if (q[0] < -1 || q[1] < -1 || q[0] > rows || q[1] > cols) return;
          const k = q.join();
          if (!outside[k] && !inShape[k]) { outside[k] = true; st.push(q); }
        });
      }
      let hole = false;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!inShape[r + ',' + c] && !outside[r + ',' + c]) hole = true;
      if (hole) continue;
      const sol = {};
      placed.forEach((cells, i) => cells.forEach((c) => { sol[(c[0] - mr) + ',' + (c[1] - mc)] = i + 1; }));
      return { rows: rows, cols: cols, k: L.k, size: size, sol: sol, cells: Object.keys(sol) };
    }
    return null;
  }
  /* Je rozdělení správné? Vrací null, nebo krátké vysvětlení, co nesedí. */
  function verdict(P, paint) {
    const groups = {};
    P.cells.forEach((k) => { const v = paint[k]; (groups[v] = groups[v] || []).push(k.split(',').map(Number)); });
    for (let i = 1; i <= P.k; i++) {
      const g = groups[i] || [];
      if (g.length !== P.size) return 'Díl ' + i + ' má ' + g.length + ' ' + U.plural(g.length, 'políčko', 'políčka', 'políček') + ', má jich mít ' + P.size + '.';
      if (!connected(g)) return 'Díl ' + i + ' není v jednom kuse.';
    }
    for (let i = 2; i <= P.k; i++) if (!same(groups[1], groups[i])) return 'Díly ' + 1 + ' a ' + i + ' nemají stejný tvar.';
    return null;
  }

  SM.registerGame({
    id: 'deleni',
    name: 'Dělení tvaru',
    domain: 'logika',
    trains: 'prostorovou představivost',
    short: 'Rozdělte tvar na stejné díly.',
    duration: 'asi 3 minuty',
    pace: { per: 'na tvar' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jedna úloha dané úrovně (pro kontrolu generátoru). */
    gen(level) { return makePuzzle(LEVELS[level - 1]); },
    /** Kontrola rozdělení (pro testy). */
    _verdict: verdict,
    howTo(level) {
      const L = LEVELS[level - 1];
      return ['Tvar ze čtverečků rozdělte na ' + L.k + ' stejné díly. Díly smí být pootočené, ale ne obrácené zrcadlově.',
        'Dole vyberte číslo dílu a klepejte na políčka, která k němu patří. Dalším klepnutím políčko zase uvolníte.',
        'Zkoušet se smí: tlačítko Zpět vrátí poslední krok, Začít znovu vše smaže.',
        'Když jsou všechna políčka obarvená, hra rozdělení hned zkontroluje.'];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : 2;
      let tries = 0, hints = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Tvar ' + (i + 1) + ' z ' + N);
        const r = await one(makePuzzle(ctx.short ? LEVELS[Math.min(1, ctx.level - 1)] : L));
        tries += r.tries; hints += r.hints;
      }
      const perf = U.clamp(1 - 0.12 * tries / N - 0.15 * hints / N, 0, 1);
      const details = [];
      if (tries) details.push('Nepovedené pokusy: ' + tries);
      if (hints) details.push('Nápověda: ' + hints + '×');
      ctx.finish({
        perf: perf, acc: perf,
        levelDelta: K.levelByAcc(perf, 0.85, 0.5),
        big: N + ' z ' + N, bigLabel: N === 1 ? 'tvar rozdělený' : 'tvary rozdělené',
        details: details, metric: { tries: tries, hints: hints }
      });

      async function one(P) {
        ctx.clear();
        const paint = {};
        const history = [];
        let cur = 1, triesHere = 0, hintsHere = 0, done = false;
        const t0 = performance.now();
        const size = Math.floor(U.clamp(Math.min((ctx.size().w - 16) / P.cols, 64), 30, 64));
        const grid = h('div', { class: 'dl-grid', style: { gridTemplateColumns: 'repeat(' + P.cols + ', ' + size + 'px)', gridAutoRows: size + 'px' } });
        const cells = {};
        for (let r = 0; r < P.rows; r++) for (let c = 0; c < P.cols; c++) {
          const k = r + ',' + c;
          if (P.sol[k]) { cells[k] = h('button', { class: 'dl-cell', type: 'button', 'data-k': k, 'aria-label': 'Políčko ' + (r + 1) + ', ' + (c + 1) }); grid.appendChild(cells[k]); }
          else grid.appendChild(h('span', { class: 'dl-gap' }));
        }
        const box = h('div', { class: 'stack deleni', 'data-sol': P.cells.map((k) => k + ':' + P.sol[k]).join(';') }, grid);
        ctx.stage.appendChild(box);
        const pal = Array.from({ length: P.k }, (_, i) => h('button', { class: 'btn dl-pick', type: 'button', 'data-v': i + 1, 'aria-pressed': 'false', style: { '--dl': COLORS[i] } }, String(i + 1)));
        const undo = h('button', { class: 'btn btn-secondary dl-tool', type: 'button' }, 'Zpět');
        const reset = h('button', { class: 'btn btn-secondary dl-tool', type: 'button' }, 'Začít znovu');
        const hintBtn = h('button', { class: 'btn btn-secondary dl-tool', type: 'button' }, 'Nápověda');
        ctx.foot.appendChild(h('div', { class: 'dl-bar' }, h('div', { class: 'dl-pal', style: { gridTemplateColumns: 'repeat(' + P.k + ', minmax(0, 1fr))' } }, pal), h('div', { class: 'dl-tools' }, undo, reset, hintBtn)));
        ctx.status('Rozdělte tvar na ' + P.k + ' stejné díly po ' + P.size + ' políčkách.'); // dřív než měření místa
        // velikost políček i podle výšky
        const room = ctx.stage.clientHeight - 24;
        const sz = Math.floor(U.clamp(Math.min(size, (room - 3 * P.rows) / P.rows), 26, 64));
        grid.style.gridTemplateColumns = 'repeat(' + P.cols + ', ' + sz + 'px)';
        grid.style.gridAutoRows = sz + 'px';
        const draw = () => {
          Object.keys(cells).forEach((k) => {
            const v = paint[k];
            cells[k].textContent = v ? String(v) : '';
            cells[k].style.setProperty('--dl', v ? COLORS[v - 1] : 'transparent');
            cells[k].classList.toggle('is-on', !!v);
          });
          pal.forEach((b, i) => b.setAttribute('aria-pressed', i + 1 === cur ? 'true' : 'false'));
          box.dataset.cur = cur;
        };
        draw();
        ctx.status('Rozdělte tvar na ' + P.k + ' stejné díly po ' + P.size + ' políčkách.');
        return new Promise((resolve) => {
          const check = async () => {
            if (P.cells.some((k) => !paint[k])) return;
            const why = verdict(P, paint);
            if (!why) {
              done = true;
              ctx.mark(true, (performance.now() - t0) / SM.timeScale);
              Object.keys(cells).forEach((k) => { cells[k].disabled = true; });
              pal.concat(undo, reset, hintBtn).forEach((b) => { b.disabled = true; });
              box.classList.add('is-done');
              ctx.feedback(true);
              ctx.status('Výborně, díly jsou stejné!');
              await ctx.sleep(1500);
              resolve({ tries: triesHere, hints: hintsHere });
            } else {
              triesHere++;
              ctx.feedback(false);
              ctx.status(why + ' Zkuste to jinak.');
            }
          };
          pal.forEach((b, i) => U.tap(b, () => { if (done) return; cur = i + 1; ctx.sound.tap(); draw(); }));
          Object.keys(cells).forEach((k) => U.tap(cells[k], () => {
            if (done) return;
            history.push(Object.assign({}, paint));
            if (paint[k] === cur) delete paint[k]; else paint[k] = cur;
            ctx.sound.tap();
            draw();
            check();
          }));
          U.tap(undo, () => { if (done || !history.length) return; const prev = history.pop(); Object.keys(paint).forEach((k) => delete paint[k]); Object.assign(paint, prev); ctx.sound.tap(); draw(); });
          U.tap(reset, () => { if (done) return; history.push(Object.assign({}, paint)); Object.keys(paint).forEach((k) => delete paint[k]); ctx.sound.tap(); draw(); ctx.status('Rozdělte tvar na ' + P.k + ' stejné díly po ' + P.size + ' políčkách.'); });
          U.tap(hintBtn, () => {
            if (done) return;
            // obarví celý jeden díl podle řešení (ten, kde je nejvíc chyb)
            let best = 1, worst = -1;
            for (let i = 1; i <= P.k; i++) {
              const bad = P.cells.filter((k) => P.sol[k] === i && paint[k] !== i).length;
              if (bad > worst) { worst = bad; best = i; }
            }
            if (worst <= 0) return;
            history.push(Object.assign({}, paint));
            P.cells.forEach((k) => { if (P.sol[k] === best) paint[k] = best; else if (paint[k] === best) delete paint[k]; });
            hintsHere++;
            ctx.sound.tap();
            draw();
            ctx.status('Díl ' + best + ' je doplněný. Zbytek zkuste sami.');
            check();
          });
        });
      }
    }
  });
})();
