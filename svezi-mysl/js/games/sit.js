/* Číselná síť — rozmístit čísla do kroužků tak, aby součty na čarách odpovídaly zadání (logika a sčítání).
   Každá úloha má jediné řešení (ověřuje řešič), některá čísla jsou předem doplněná. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Tvary sítí v rámečku 100 × 100: kroužky, čáry (seznamy kroužků) a kde u čáry stojí její součet. */
  const SHAPES = {
    tri6: {
      n: 6,
      pos: [[50, 10], [30, 48], [70, 48], [10, 86], [50, 86], [90, 86]],
      lines: [[0, 1, 3], [3, 4, 5], [5, 2, 0]],
      labels: [[17, 40], [50, 99], [83, 40]]
    },
    tri9: {
      n: 9,
      pos: [[50, 8], [36, 34.7], [22, 61.3], [8, 88], [36, 88], [64, 88], [92, 88], [78, 61.3], [64, 34.7]],
      lines: [[0, 1, 2, 3], [3, 4, 5, 6], [6, 7, 8, 0]],
      labels: [[16, 36], [50, 99], [84, 36]]
    },
    grid9: {
      n: 9,
      pos: [[18, 18], [48, 18], [78, 18], [18, 48], [48, 48], [78, 48], [18, 78], [48, 78], [78, 78]],
      lines: [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8]],
      labels: [[95, 18], [95, 48], [95, 78], [18, 96], [48, 96], [78, 96]],
      diag: [[0, 4, 8], [2, 4, 6]],
      diagLabels: [[3, 3], [95, 3]]
    }
  };
  /* shape, give = kolik čísel je předem doplněných, diag = počítají se i úhlopříčky */
  const LEVELS = [
    { shape: 'tri6', give: 2 },
    { shape: 'tri9', give: 3 },
    { shape: 'grid9', give: 3 },
    { shape: 'grid9', give: 2, diag: true }
  ];

  /* Počet řešení (nejvýš limit): doplnit zbylá čísla do prázdných kroužků, aby seděly součty všech čar. */
  function countSolutions(sh, lines, targets, giv, limit) {
    const n = sh.n;
    const used = {};
    giv.forEach((v) => { if (v != null) used[v] = true; });
    const free = [];
    for (let v = 1; v <= n; v++) if (!used[v]) free.push(v);
    const empty = giv.map((v, i) => (v == null ? i : -1)).filter((i) => i >= 0);
    const cur = giv.slice();
    const byCell = Array.from({ length: n }, () => []);
    lines.forEach((ln, li) => ln.forEach((i) => byCell[i].push(li)));
    let found = 0;
    const lineOk = (li) => {
      let s = 0, open = 0;
      lines[li].forEach((i) => { if (cur[i] == null) open++; else s += cur[i]; });
      return open ? s + open <= targets[li] : s === targets[li];
    };
    if (!lines.every((_, li) => lineOk(li))) return 0;
    const taken = {};
    (function go(k) {
      if (found >= limit) return;
      if (k === empty.length) { found++; return; }
      const cell = empty[k];
      for (const v of free) {
        if (taken[v]) continue;
        taken[v] = true;
        cur[cell] = v;
        if (byCell[cell].every(lineOk)) go(k + 1);
        cur[cell] = null;
        taken[v] = false;
        if (found >= limit) return;
      }
    })(0);
    return found;
  }

  function makePuzzle(L) {
    const sh = SHAPES[L.shape];
    const lines = sh.lines.concat(L.diag ? sh.diag : []);
    const labels = sh.labels.concat(L.diag ? sh.diagLabels : []);
    for (let t = 0; t < 300; t++) {
      const sol = U.shuffle(Array.from({ length: sh.n }, (_, i) => i + 1));
      const targets = lines.map((ln) => ln.reduce((a, i) => a + sol[i], 0));
      let giv = sol.slice();
      for (const i of U.shuffle(Array.from({ length: sh.n }, (_, k) => k))) {
        if (giv.filter((v) => v != null).length <= L.give) break;
        const g2 = giv.slice();
        g2[i] = null;
        if (countSolutions(sh, lines, targets, g2, 2) === 1) giv = g2;
      }
      if (giv.filter((v) => v != null).length > L.give + 1) continue; // úloha by byla moc snadná
      return { sh: sh, lines: lines, labels: labels, targets: targets, sol: sol, giv: giv };
    }
    return null;
  }

  SM.registerGame({
    id: 'sit',
    name: 'Číselná síť',
    domain: 'logika',
    trains: 'logické uvažování a sčítání',
    short: 'Doplňte čísla do kroužků, aby seděly součty na čarách.',
    duration: 'asi 3 minuty',
    pace: { per: 'na síť' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jedna úloha dané úrovně (pro kontrolu generátoru). */
    gen(level) { return makePuzzle(LEVELS[level - 1]); },
    howTo(level) {
      const L = LEVELS[level - 1];
      const n = SHAPES[L.shape].n;
      const steps = ['Do prázdných kroužků patří čísla od 1 do ' + n + ', každé právě jednou. Některá už jsou doplněná.',
        'Číslo u čáry říká, kolik má být součet kroužků na ní.' + (L.diag ? ' Počítají se i obě úhlopříčky.' : ''),
        'Klepněte na prázdný kroužek a potom na číslo dole. Když čára sedí, její součet zezelená, když ne, zčervená.',
        'Když si nevíte rady, „Nápověda“ doplní jeden kroužek.'];
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : 2;
      let mistakes = 0, hints = 0, solved = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Síť ' + (i + 1) + ' z ' + N);
        const r = await one(makePuzzle(L));
        mistakes += r.mistakes; hints += r.hints; solved++;
      }
      const perf = U.clamp(1 - 0.12 * mistakes - 0.15 * hints / N, 0, 1);
      const details = [];
      if (mistakes) details.push('Chybné pokusy: ' + mistakes);
      if (hints) details.push('Nápověda: ' + hints + '×');
      ctx.finish({
        perf: perf, acc: perf,
        levelDelta: K.levelByAcc(perf, 0.85, 0.5),
        big: solved + ' z ' + N, bigLabel: 'sítí vyřešeno',
        details: details, metric: { mistakes: mistakes, hints: hints }
      });

      async function one(P) {
        ctx.clear();
        const n = P.sh.n;
        const val = P.giv.slice();
        let sel = val.indexOf(null);
        let mistakesHere = 0, hintsHere = 0, wrongShown = false;
        const t0 = performance.now();
        // čáry a součty (SVG), kroužky jako tlačítka nad nimi
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '-6 -4 112 110');
        svg.setAttribute('aria-hidden', 'true');
        let lineSvg = '';
        P.lines.forEach((ln) => {
          lineSvg += '<polyline class="nt-line" points="' + ln.map((i) => P.sh.pos[i].join(',')).join(' ') + '"/>';
        });
        svg.innerHTML = lineSvg;
        const tags = P.lines.map((_, li) => h('span', { class: 'nt-sum', style: { left: (P.labels[li][0] + 6) / 112 * 100 + '%', top: (P.labels[li][1] + 4) / 110 * 100 + '%' } }, String(P.targets[li])));
        const cells = P.sh.pos.map((p, i) => h('button', {
          class: 'nt-cell' + (P.giv[i] != null ? ' is-given' : ''), type: 'button', 'data-i': i,
          style: { left: (p[0] + 6) / 112 * 100 + '%', top: (p[1] + 4) / 110 * 100 + '%' }, disabled: P.giv[i] != null
        }, P.giv[i] != null ? String(P.giv[i]) : ''));
        const board = h('div', { class: 'nt-board' }, svg, tags, cells);
        const hintBtn = h('button', { class: 'btn btn-secondary btn-small nt-hint', type: 'button' }, 'Nápověda');
        const box = h('div', { class: 'stack sit', 'data-sol': P.sol.join(',') }, board, hintBtn);
        ctx.stage.appendChild(box);
        // čísla k doplnění
        const keys = Array.from({ length: n }, (_, k) => h('button', { class: 'btn nt-key', type: 'button', 'data-v': k + 1 }, String(k + 1)));
        const del = h('button', { class: 'btn btn-secondary nt-key nt-del', type: 'button' }, 'Smazat');
        ctx.foot.appendChild(h('div', { class: 'nt-keys' }, keys, del));
        ctx.status('Doplňte čísla do kroužků.'); // pokyn dřív než měření místa (víc řádků textu zmenší plochu)
        fit(board, box);

        const paint = () => {
          cells.forEach((c, i) => {
            if (P.giv[i] != null) return;
            c.textContent = val[i] != null ? String(val[i]) : '';
            c.classList.toggle('is-sel', i === sel);
            c.classList.toggle('is-wrong', wrongShown && val[i] != null && val[i] !== P.sol[i]);
          });
          P.lines.forEach((ln, li) => {
            const vs = ln.map((i) => val[i]);
            const full = vs.every((v) => v != null);
            const s = vs.reduce((a, v) => a + (v || 0), 0);
            tags[li].classList.toggle('is-ok', full && s === P.targets[li]);
            tags[li].classList.toggle('is-bad', full ? s !== P.targets[li] : s >= P.targets[li]);
          });
          const placed = {};
          val.forEach((v, i) => { if (v != null && P.giv[i] == null) placed[v] = true; });
          keys.forEach((k, j) => { k.classList.toggle('is-used', !!placed[j + 1] || P.giv.indexOf(j + 1) !== -1); k.disabled = P.giv.indexOf(j + 1) !== -1; });
          box.dataset.sel = sel;
        };
        paint();
        ctx.status('Doplňte čísla do kroužků.');
        return new Promise((resolve) => {
          let done = false;
          const nextEmpty = (from) => {
            for (let k = 1; k <= n; k++) { const i = (from + k) % n; if (val[i] == null && P.giv[i] == null) return i; }
            return -1;
          };
          const finishCheck = async () => {
            if (val.some((v) => v == null)) return;
            const okAll = P.lines.every((ln, li) => ln.reduce((a, i) => a + val[i], 0) === P.targets[li]);
            if (okAll) {
              done = true;
              ctx.mark(true, (performance.now() - t0) / SM.timeScale);
              cells.forEach((c) => { c.disabled = true; });
              keys.concat(del, hintBtn).forEach((b) => { b.disabled = true; });
              box.classList.add('is-done');
              ctx.feedback(true);
              ctx.status('Výborně, všechny součty sedí!');
              await ctx.sleep(1500);
              resolve({ mistakes: mistakesHere, hints: hintsHere });
            } else {
              mistakesHere++;
              wrongShown = true;
              ctx.feedback(false);
              ctx.status('Některé součty nesedí. Červená čísla jsou na špatném místě.');
              paint();
            }
          };
          cells.forEach((c, i) => U.tap(c, () => {
            if (done || P.giv[i] != null) return;
            sel = i;
            ctx.sound.tap();
            paint();
          }));
          keys.forEach((k, j) => U.tap(k, () => {
            if (done || sel < 0 || k.disabled) return;
            const v = j + 1;
            const old = val.indexOf(v);
            if (old !== -1 && P.giv[old] == null) val[old] = null; // číslo se přesune
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
            // doplní kroužek, kde chybí nebo je špatně číslo (nejdřív vybraný)
            let i = sel >= 0 && val[sel] !== P.sol[sel] ? sel : val.findIndex((v, k) => P.giv[k] == null && v !== P.sol[k]);
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

      /* Síť jako čtverec, co největší do místa nad čísly. */
      function fit(board, box) {
        const hint = box.querySelector('.nt-hint');
        const room = ctx.stage.clientHeight - (hint ? hint.offsetHeight + 24 : 0) - 12;
        const side = Math.floor(U.clamp(Math.min(room, ctx.size().w - 8, 460), 160, 460));
        board.style.width = side + 'px';
        board.style.height = side + 'px';
      }
    }
  });
})();
