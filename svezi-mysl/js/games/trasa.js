/* Cesta podle šipek — projít plánek městečka podle pokynů rovně, doleva a doprava (prostorová orientace, sledování pokynů). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Místa na plánku: obrázek, název a „kam“ do otázky „Jak se dostanete na poštu?“. Názvy nejvýš 7 písmen, ať se vejdou. */
  const PLACES = [
    ['🏤', 'pošta', 'na poštu'], ['💊', 'lékárna', 'do lékárny'], ['🚉', 'nádraží', 'na nádraží'], ['🏫', 'škola', 'do školy'],
    ['⛪', 'kostel', 'ke kostelu'], ['🏪', 'obchod', 'do obchodu'], ['🏦', 'banka', 'do banky'], ['🏛️', 'muzeum', 'do muzea'],
    ['☕', 'kavárna', 'do kavárny'], ['🥖', 'pekárna', 'do pekárny'], ['🌳', 'park', 'do parku'], ['🏨', 'hotel', 'do hotelu'],
    ['🎬', 'kino', 'do kina'], ['🎭', 'divadlo', 'do divadla'], ['⛲', 'kašna', 'ke kašně']
  ].map((p) => ({ e: p[0], name: p[1], to: p[2] }));
  /* Překážky, přes které se nedá projít. */
  const BLOCKS = [{ id: 'rybnik', e: '🦆', name: 'rybník' }, { id: 'stavba', e: '🚧', name: 'stavba' }];

  const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // nahoru, doprava, dolů, doleva (jak je to vidět na plánku)
  const LOOK = ['nahoru', 'doprava', 'dolů', 'doleva'];
  const STEP = { F: ['stepUp', 'rovně'], L: ['turnLeft', 'doleva'], R: ['turnRight', 'doprava'] };
  const turn = (d, s) => (s === 'R' ? (d + 1) % 4 : s === 'L' ? (d + 3) % 4 : d);
  const words = (steps) => steps.map((s) => STEP[s][1]).join(', ');

  /* n = velikost plánku, len = počet pokynů, facing = chodec se na začátku nemusí dívat nahoru,
     mode: tap = klepnout na místo, kam pokyny vedou; pick = vybrat správnou řadu pokynů; build = poskládat pokyny;
     memo = pokyny jsou vidět jen chvíli; dist = délka nejkratší cesty při skládání. */
  const LEVELS = [
    { n: 5, len: [4, 6], mode: 'tap' },
    { n: 5, len: [7, 8], mode: 'tap' },
    { n: 5, len: [7, 8], mode: 'tap', facing: true },
    { n: 5, len: [6, 7], mode: 'pick', facing: true },
    { n: 6, mode: 'build', facing: true, dist: [5, 8] },
    { n: 5, len: [6, 7], mode: 'tap', facing: true, memo: true }
  ];

  /* Náhodná procházka bez opakování políček: pokyny, políčka cesty a cíl. */
  function walk(n, len, facing) {
    for (let t = 0; t < 5000; t++) {
      const start = U.randInt(0, n * n - 1);
      const d0 = facing ? U.randInt(0, 3) : 0;
      let r = Math.floor(start / n), c = start % n, d = d0;
      const seen = {};
      seen[start] = true;
      const steps = [];
      const cells = [start];
      let ok = true;
      while (steps.length < len) {
        const prev = steps[steps.length - 1];
        const canTurn = len - steps.length > 1 && prev !== 'L' && prev !== 'R' && (steps.length > 0 || facing);
        let s = 'F';
        if (canTurn && Math.random() < (steps.length ? 0.4 : 0.3)) s = Math.random() < 0.5 ? 'L' : 'R';
        if (s === 'F') {
          const nr = r + DIRS[d][0], nc = c + DIRS[d][1];
          if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr * n + nc]) { ok = false; break; }
          r = nr; c = nc;
          seen[r * n + c] = true;
          cells.push(r * n + c);
        } else d = turn(d, s);
        steps.push(s);
      }
      if (!ok || steps.every((s) => s === 'F')) continue;
      return { start: start, d0: d0, steps: steps, cells: cells, end: r * n + c };
    }
    return null;
  }

  /* Kam pokyny vedou: index políčka, nebo -1 (mimo plánek nebo do políčka, kam se nesmí). */
  function follow(n, start, d0, steps, blocked) {
    let r = Math.floor(start / n), c = start % n, d = d0;
    for (let k = 0; k < steps.length; k++) {
      if (steps[k] !== 'F') { d = turn(d, steps[k]); continue; }
      r += DIRS[d][0];
      c += DIRS[d][1];
      if (r < 0 || c < 0 || r >= n || c >= n) return -1;
      if (blocked && k < steps.length - 1 && blocked(r * n + c)) return -1;
    }
    return r * n + c;
  }

  /* Plánek k procházce: cíl na konci cesty, další místa i tam, kam by se došlo s chybou (záměna doleva/doprava). */
  function makeMap(L, w) {
    const n = L.n;
    const grid = Array(n * n).fill(null);
    const onPath = {};
    w.cells.forEach((i) => { onPath[i] = true; });
    const places = U.sample(PLACES, n === 5 ? 4 : 5);
    grid[w.end] = { place: places[0] };
    const free = (i) => i >= 0 && !onPath[i] && !grid[i];
    const mirror = w.steps.map((s) => (s === 'L' ? 'R' : s === 'R' ? 'L' : s));
    const k = w.steps.findIndex((s) => s !== 'F');
    const flipFirst = w.steps.map((s, j) => (j === k ? (s === 'L' ? 'R' : 'L') : s));
    let pi = 1;
    [mirror, flipFirst, w.steps.concat('F')].forEach((st) => {
      const e = follow(n, w.start, w.d0, st, null);
      if (pi < places.length && free(e)) grid[e] = { place: places[pi++] };
    });
    const rest = U.shuffle(Array.from({ length: n * n }, (_, i) => i).filter(free));
    while (pi < places.length && rest.length) grid[rest.pop()] = { place: places[pi++] };
    for (let b = 0; b < (n === 5 ? 2 : 3) && rest.length; b++) grid[rest.pop()] = { block: BLOCKS[b % 2] };
    return { n: n, grid: grid, target: w.end, start: w.start, d0: w.d0 };
  }

  /* Nejmenší počet pokynů ze startu do cíle (ostatní místa a překážky se obcházejí). */
  function shortest(n, grid, start, d0, target) {
    const seen = {};
    seen[start * 4 + d0] = 0;
    const q = [[start, d0]];
    while (q.length) {
      const cur = q.shift();
      const i = cur[0], d = cur[1];
      const k = seen[i * 4 + d];
      ['L', 'R'].forEach((s) => {
        const nd = turn(d, s);
        if (seen[i * 4 + nd] == null) { seen[i * 4 + nd] = k + 1; q.push([i, nd]); }
      });
      const r = Math.floor(i / n) + DIRS[d][0], c = (i % n) + DIRS[d][1];
      if (r < 0 || c < 0 || r >= n || c >= n) continue;
      const j = r * n + c;
      if (j === target) return k + 1;
      if (grid[j]) continue;
      if (seen[j * 4 + d] == null) { seen[j * 4 + d] = k + 1; q.push([j, d]); }
    }
    return Infinity;
  }

  /* Plánek pro skládání pokynů: start, cíl, další místa a překážky; nejkratší cesta v zadaném rozsahu. */
  function makeBuild(L) {
    const n = L.n;
    for (let t = 0; t < 800; t++) {
      const grid = Array(n * n).fill(null);
      const cells = U.shuffle(Array.from({ length: n * n }, (_, i) => i));
      const start = cells.pop();
      const d0 = U.randInt(0, 3);
      const places = U.sample(PLACES, 5);
      places.forEach((p) => { grid[cells.pop()] = { place: p }; });
      for (let b = 0; b < 4; b++) grid[cells.pop()] = { block: BLOCKS[b % 2] };
      const target = grid.findIndex((g) => g && g.place === places[0]);
      const best = shortest(n, grid, start, d0, target);
      if (best >= L.dist[0] && best <= L.dist[1]) return { n: n, grid: grid, target: target, start: start, d0: d0, best: best };
    }
    return null;
  }

  SM.registerGame({
    id: 'trasa',
    name: 'Cesta podle šipek',
    domain: 'logika',
    trains: 'prostorovou orientaci a sledování pokynů',
    short: 'Projděte městečko podle šipek.',
    duration: 'asi 2 až 3 minuty',
    pace: { per: 'na úlohu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Na plánku městečka stojí chodec, modrá šipka. Šipka ukazuje, kam se dívá.',
        'Pokyn „rovně“ je krok o jedno políčko dopředu. „Doleva“ a „doprava“ znamená otočit se na místě, tak jak to vidí chodec.'
      ];
      if (L.mode === 'tap') steps.push(L.memo ? 'Pokyny uvidíte jen chvíli, zapamatujte si je. Potom klepněte na místo, kam vedly.' : 'Projděte pokyny v duchu a klepněte na místo, kam vedou.');
      if (L.mode === 'pick') steps.push('Ze tří řad pokynů vyberte tu, která vede do zadaného místa.');
      if (L.mode === 'build') steps.push('Tlačítky dole doveďte chodce do zadaného místa, co nejkratší cestou. Rybník, stavba ani jiné budovy se projít nedají.');
      steps.push('Po každé úloze uvidíte celou cestu krok za krokem.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = L.mode === 'build' ? (ctx.short ? 2 : 3) : (ctx.short ? 3 : 5);
      const scores = [];
      for (let k = 0; k < N; k++) {
        ctx.progress('Úloha ' + (k + 1) + ' z ' + N);
        const sc = L.mode === 'pick' ? await taskPick() : L.mode === 'build' ? await taskBuild() : await taskTap();
        scores.push(sc);
        await K.next(ctx, k === N - 1 ? 'Zobrazit výsledek' : 'Další úloha');
      }
      const acc = U.mean(scores);
      const ok = scores.filter((s) => s >= 0.99).length;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: ok + ' z ' + N, bigLabel: L.mode === 'build' ? 'cest nejkratší možnou trasou' : 'úloh správně',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      function rem() { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 18; }

      /* Velikost políčka tak, aby se plánek vešel pod to, co už je na ploše. reserve = místo pro tlačítko, které přibude dole. */
      function cellSize(n, stack, reserve) {
        const sz = ctx.size();
        const H = sz.h - stack.scrollHeight - 20 - (reserve || 0);
        const W = Math.min(sz.w, 560) - 16;
        return Math.floor(U.clamp((Math.min(W, H) - 12 - 3 * (n - 1)) / n, 30, 88));
      }

      function townNode(map, size) {
        const n = map.n;
        const gap = 3;
        const box = h('div', { class: 'town' + (K.reducedMotion() ? ' is-still' : ''), style: { '--n': n, '--cell': size + 'px', '--gap': gap + 'px' },
          'data-n': n, 'data-start': map.start, 'data-d0': map.d0, 'data-target': map.target });
        const cells = map.grid.map((g, i) => {
          let el;
          if (g && g.place) {
            el = h('button', { class: 'town-cell is-place', type: 'button', 'data-i': i, 'data-name': g.place.name, 'aria-label': g.place.name },
              h('span', { class: 'emo', 'aria-hidden': 'true' }, g.place.e), h('span', { class: 'town-lbl', 'aria-hidden': 'true' }, g.place.name));
          } else if (g && g.block) {
            el = h('div', { class: 'town-cell is-block is-' + g.block.id, 'data-i': i, 'data-block': g.block.id },
              h('span', { class: 'emo', 'aria-hidden': 'true' }, g.block.e), h('span', { class: 'town-lbl' }, g.block.name));
          } else el = h('div', { class: 'town-cell', 'data-i': i });
          box.appendChild(el);
          return el;
        });
        const walker = h('div', { class: 'walker', 'aria-hidden': 'true' });
        walker.innerHTML = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17"/><path d="M20 7.5 29 27 20 22 11 27z"/></svg>';
        box.appendChild(walker);
        const t = { box: box, cells: cells, walker: walker, n: n, i: map.start, a: map.d0 * 90 };
        t.dir = () => (((t.a / 90) % 4) + 4) % 4;
        t.put = () => {
          const r = Math.floor(t.i / n), c = t.i % n;
          walker.style.transform = 'translate(' + c * (size + gap) + 'px, ' + r * (size + gap) + 'px) rotate(' + t.a + 'deg)';
        };
        t.put();
        return t;
      }

      /* Pokyny jako štítky; kroky rovně za sebou se spojí do jednoho („rovně 2×“). */
      function routeNode(steps, small) {
        const groups = [];
        steps.forEach((s, k) => {
          const g = groups[groups.length - 1];
          if (s === 'F' && g && g.s === 'F') g.n++;
          else groups.push({ s: s, n: 1, k0: k });
        });
        return h('div', { class: 'route' + (small ? ' is-small' : ''), 'aria-label': 'Pokyny: ' + words(steps) },
          groups.map((g) => h('span', { class: 'route-step', 'data-s': g.s, 'data-n': g.n, 'data-k0': g.k0, 'aria-hidden': 'true' },
            SM.ui.icon(STEP[g.s][0]),
            small ? (g.n > 1 ? h('b', null, String(g.n)) : null) : h('span', null, STEP[g.s][1] + (g.n > 1 ? ' ' + g.n + '×' : '')))));
      }

      function note(d) { return h('p', { class: 'route-note' }, 'Modrá šipka je chodec. Teď se dívá ' + LOOK[d] + '.'); }

      /* Přehraje cestu krok za krokem: chodec jde, zvýrazňuje se pokyn a za chodcem zůstávají stopy. */
      async function replay(t, map, steps, route) {
        t.cells.forEach((el) => el.classList.remove('is-trail'));
        t.i = map.start;
        t.a = map.d0 * 90;
        t.put();
        const chipsEls = route ? Array.from(route.querySelectorAll('.route-step')) : [];
        await ctx.sleep(350);
        for (let k = 0; k < steps.length; k++) {
          chipsEls.forEach((el) => {
            const k0 = +el.dataset.k0, k1 = k0 + +el.dataset.n;
            el.classList.toggle('is-now', k >= k0 && k < k1);
            el.classList.toggle('is-done', k >= k1);
          });
          if (steps[k] === 'F') {
            t.cells[t.i].classList.add('is-trail');
            const d = t.dir();
            t.i = (Math.floor(t.i / t.n) + DIRS[d][0]) * t.n + (t.i % t.n) + DIRS[d][1];
          } else t.a += steps[k] === 'R' ? 90 : -90;
          t.put();
          await ctx.sleep(K.reducedMotion() ? 300 : 520);
        }
        chipsEls.forEach((el) => { el.classList.remove('is-now'); el.classList.add('is-done'); });
      }

      /* Úloha „kam pokyny vedou“ (i s pokyny jen na chvíli). Vrací 1 nebo 0. */
      async function taskTap() {
        const w = walk(L.n, U.randInt(L.len[0], L.len[1]), L.facing);
        const map = makeMap(L, w);
        ctx.clear();
        const stack = h('div', { class: 'stack trasa', 'data-ask': L.memo ? 'memo' : 'tap' });
        ctx.stage.appendChild(stack);
        const route = routeNode(w.steps);
        stack.appendChild(note(w.d0));
        stack.appendChild(route);
        let wait = null;
        if (L.memo) {
          ctx.status('Zapamatujte si pokyny.');
          wait = K.study(ctx, { limit: w.steps.length * 1500 + 3000, container: stack });
        } else ctx.status('Kam vedou pokyny? Klepněte tam.');
        const t = townNode(map, cellSize(L.n, stack, 0));
        stack.insertBefore(t.box, stack.firstChild);
        let hidden = null;
        if (wait) {
          await wait;
          ctx.foot.textContent = '';
          const bar = stack.querySelector('.timebar');
          if (bar) bar.remove();
          hidden = h('div', { class: 'route is-hidden', 'aria-label': 'Pokyny jsou skryté' },
            Array.from(route.children).map(() => h('span', { class: 'route-step', 'aria-hidden': 'true' }, '?')));
          route.replaceWith(hidden);
          stack.dataset.ask = 'tap';
          ctx.status('Kam vedly pokyny? Klepněte tam.');
        }
        const t0 = performance.now();
        const choice = await new Promise((resolve) => {
          let done = false;
          t.cells.forEach((el, i) => {
            if (map.grid[i] && map.grid[i].place) U.tap(el, () => { if (!done && ctx.alive) { done = true; resolve(i); } });
          });
        });
        const ok = choice === map.target;
        ctx.mark(ok, (performance.now() - t0) / SM.timeScale);
        t.box.classList.add('is-locked');
        t.cells[map.target].classList.add('is-correct');
        if (!ok) t.cells[choice].classList.add('is-wrong');
        ctx.feedback(ok);
        if (hidden) hidden.replaceWith(route);
        ctx.status(ok ? 'Správně! Takhle vedla cesta:' : 'Pokyny vedly ' + map.grid[map.target].place.to + '. Podívejte se na cestu:');
        await replay(t, map, w.steps, route);
        return ok ? 1 : 0;
      }

      /* Úloha „vyberte správné pokyny“. Vrací 1 nebo 0. */
      async function taskPick() {
        let w = null, map = null, alts = [];
        for (let g = 0; g < 50 && alts.length < 2; g++) {
          w = walk(L.n, U.randInt(L.len[0], L.len[1]), L.facing);
          map = makeMap(L, w);
          const blocked = (i) => !!map.grid[i];
          const flip = (k) => w.steps.map((s, j) => (j === k ? (s === 'L' ? 'R' : 'L') : s));
          const turns = w.steps.map((s, k) => (s !== 'F' ? k : -1)).filter((k) => k >= 0);
          const fwd = w.steps.map((s, k) => (s === 'F' && k < w.steps.length - 1 ? k : -1)).filter((k) => k >= 0);
          const cands = [
            w.steps.map((s) => (s === 'L' ? 'R' : s === 'R' ? 'L' : s)),
            flip(U.pick(turns)),
            fwd.length ? w.steps.filter((_, j) => j !== U.pick(fwd)) : null,
            w.steps.slice(0, -1).concat('F', 'F')
          ];
          const seen = {};
          seen[w.steps.join('')] = true;
          alts = [];
          U.shuffle(cands).forEach((st) => {
            if (!st || alts.length >= 2 || seen[st.join('')]) return;
            if (follow(L.n, w.start, w.d0, st, blocked) === map.target) return;
            seen[st.join('')] = true;
            alts.push(st);
          });
        }
        const place = map.grid[map.target].place;
        ctx.clear();
        ctx.status('Kudy vede cesta ' + place.to + '?');
        const stack = h('div', { class: 'stack trasa', 'data-ask': 'pick' });
        ctx.stage.appendChild(stack);
        // Místo poznámky o chodci jen vysvětlivka značek (směr chodce ukazuje šipka na plánku).
        stack.appendChild(h('p', { class: 'route-legend' },
          ['F', 'L', 'R'].map((s) => h('span', null, SM.ui.icon(STEP[s][0]), STEP[s][1]))));
        const seqs = U.shuffle([w.steps].concat(alts));
        const nodes = seqs.map((st) => routeNode(st, true));
        const opts = seqs.map((st, k) => ({ value: k, node: nodes[k], aria: 'Pokyny: ' + words(st) }));
        const answer = seqs.indexOf(w.steps);
        const wait = K.choose(ctx, opts, { answer: answer, layout: 'col', cls: 'is-routes' });
        // Malý displej s velkým písmem: když by se plánek nevešel ani s nejmenšími políčky, ustoupí mu vysvětlivka značek.
        if (cellSize(L.n, stack, 0) <= 30) stack.firstChild.style.display = 'none';
        const t = townNode(map, cellSize(L.n, stack, 0));
        stack.insertBefore(t.box, stack.firstChild);
        t.cells[map.target].classList.add('is-target');
        const r = await wait;
        t.box.classList.add('is-locked');
        ctx.status(r.correct ? 'Správně! Takhle vede cesta:' : 'Správné pokyny jsou označené zeleně. Takhle vede cesta:');
        await replay(t, map, w.steps, nodes[answer]);
        return r.correct ? 1 : 0;
      }

      /* Úloha „doveďte chodce“: pokyny se skládají tlačítky. Vrací hodnocení 0–1 podle délky proti nejkratší cestě. */
      function taskBuild() {
        return new Promise((resolve) => {
          const map = makeBuild(L);
          const place = map.grid[map.target].place;
          ctx.clear();
          ctx.status('Doveďte chodce ' + place.to + '.');
          const stack = h('div', { class: 'stack trasa', 'data-ask': 'build', 'data-best': map.best });
          ctx.stage.appendChild(stack);
          const used = [];
          const hist = [];
          let blockedN = 0;
          let finished = false;
          const t0 = performance.now();
          const line = h('div', { class: 'route is-small is-build', 'aria-live': 'polite' });
          const noteEl = note(map.d0);
          stack.appendChild(noteEl);
          stack.appendChild(line);
          const pad = h('div', { class: 'trasa-pad' });
          const back = h('button', { class: 'btn btn-secondary btn-small trasa-back', type: 'button', disabled: true }, 'Zpět o krok');
          [['L', 'turnLeft', 'doleva'], ['F', 'stepUp', 'rovně'], ['R', 'turnRight', 'doprava']].forEach((b) => {
            const btn = h('button', { class: 'btn trasa-key', type: 'button', 'data-s': b[0] }, SM.ui.icon(b[1]), h('span', null, b[2]));
            U.tap(btn, () => press(b[0]));
            pad.appendChild(btn);
          });
          U.tap(back, undo);
          ctx.foot.appendChild(pad);
          ctx.foot.appendChild(back);
          line.style.minHeight = (2.3 * rem()) + 'px'; // místo pro řádek pokynů
          const t = townNode(map, cellSize(L.n, stack, 0));
          stack.insertBefore(t.box, stack.firstChild);
          t.cells[map.target].classList.add('is-target');
          drawLine();

          function drawLine() {
            line.textContent = '';
            if (!used.length) line.appendChild(h('span', { class: 'route-empty' }, 'Zatím žádný pokyn'));
            used.forEach((s) => line.appendChild(h('span', { class: 'route-step', 'data-s': s, 'aria-label': STEP[s][1] }, SM.ui.icon(STEP[s][0]))));
            back.disabled = !used.length || finished;
            noteEl.textContent = 'Chodec se teď dívá ' + LOOK[t.dir()] + '. Hledejte nejkratší cestu.';
          }
          function bump(text) {
            blockedN++;
            ctx.sound.wrong();
            t.walker.classList.remove('is-shake');
            void t.walker.offsetWidth;
            t.walker.classList.add('is-shake');
            ctx.status(text);
          }
          function press(s) {
            if (finished || !ctx.alive) return;
            if (s === 'F') {
              const d = t.dir();
              const r = Math.floor(t.i / t.n) + DIRS[d][0], c = (t.i % t.n) + DIRS[d][1];
              if (r < 0 || c < 0 || r >= t.n || c >= t.n) { bump('Tudy to nejde, tam plánek končí.'); return; }
              const j = r * t.n + c;
              const g = map.grid[j];
              if (g && g.block) { bump('Tudy to nejde, je tam ' + g.block.name + '.'); return; }
              if (g && j !== map.target) { bump('Tudy to nejde, je tam ' + g.place.name + '. Cesta vede ' + place.to + '.'); return; }
              hist.push([t.i, t.a]);
              t.cells[t.i].classList.add('is-trail');
              t.i = j;
            } else {
              hist.push([t.i, t.a]);
              t.a += s === 'R' ? 90 : -90;
            }
            used.push(s);
            ctx.sound.tap();
            t.put();
            ctx.status('Doveďte chodce ' + place.to + '.');
            drawLine();
            if (t.i === map.target) done();
          }
          function undo() {
            if (finished || !hist.length) return;
            const prev = hist.pop();
            used.pop();
            if (prev[0] !== t.i) t.cells[prev[0]].classList.remove('is-trail');
            t.i = prev[0];
            t.a = prev[1];
            ctx.sound.tap();
            t.put();
            drawLine();
          }
          function done() {
            finished = true;
            pad.classList.add('is-locked');
            back.disabled = true;
            t.box.classList.add('is-locked');
            t.cells[map.target].classList.add('is-correct');
            const score = U.clamp(map.best / Math.max(map.best, used.length) - 0.1 * blockedN, 0, 1);
            const best = used.length <= map.best;
            ctx.mark(best && !blockedN, (performance.now() - t0) / SM.timeScale);
            ctx.feedback(best);
            ctx.status(best ? 'Jste tam, a nejkratší cestou!' : 'Jste tam! Pokynů: ' + used.length + ', nejkratší cesta jich má ' + map.best + '.');
            ctx.sleep(900).then(() => resolve(score));
          }
        });
      }
    }
  });
})();
