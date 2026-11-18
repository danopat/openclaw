/* Co se změnilo — všimnout si změn (zraková paměť, pozornost): co se vyměnilo, co přibylo a od 4. úrovně víc změn v tabulce tvarů. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const ITEMS = ['🏺', '🕯️', '📚', '⏰', '🪴', '🧸', '🎁', '🍯', '☕', '🔔', '📷', '🎩', '👓', '🧶', '🍎', '🌵', '🎻', '📻', '🧦', '🪆', '🧺', '🥫', '⚽',
    '📎', '✂️', '🖊️', '📌', '🥄', '🍴', '🧂', '🍳', '🫖', '🧽', '📒', '🔑'];
  const COUNTS = [3, 4, 5, 6, 8, 10];
  const ADDED = [0, 2, 2, 3, 3, 4]; // kolik věcí přibude v režimu „co přibylo“ (od 2. úrovně)
  /* Režim „víc změn“: tabulka barevných tvarů; mění se vždy tvar (a k tomu barva), kvůli barvosleposti. */
  const MULTI = [null, null, null, { cells: 9, changes: 2, cols: 3 }, { cells: 12, changes: 3, cols: 4 }, { cells: 16, changes: 4, cols: 4 }];
  const SHAPES = {
    kruh: '<circle cx="20" cy="20" r="14"/>',
    ctverec: '<rect x="7" y="7" width="26" height="26" rx="3"/>',
    trojuhelnik: '<path d="M20 5 35 33H5z"/>',
    hvezda: '<path d="M20 4l4.7 10 10.8 1.2-8.1 7.3 2.3 10.7L20 27.7 10.3 33.2l2.3-10.7-8.1-7.3L15.3 14z"/>',
    kosoctverec: '<path d="M20 4 36 20 20 36 4 20z"/>',
    sestiuhelnik: '<path d="M12 6h16l8 14-8 14H12L4 20z"/>'
  };
  const SHAPE_KEYS = Object.keys(SHAPES);
  const COLORS = ['#2c69d6', '#e07b00', '#3a9a4a', '#8a4fd0'];

  SM.registerGame({
    id: 'zmena',
    name: 'Co se změnilo',
    domain: 'pamet',
    trains: 'zrakovou paměť a pozornost k detailům',
    short: 'Která věc na poličce je jiná?',
    duration: 'asi 1 až 2 minuty',
    maxLevel: COUNTS.length,
    howTo(level) {
      const steps = [
        'Na poličkách stojí několik věcí. Prohlédněte si je.',
        'Poličky se na chvíli zakryjí a jedna věc se vymění za jinou. Klepněte na místo, kde je teď něco jiného.'
      ];
      if (level >= 2) steps.push('Občas na poličkách něco přibude. Pak klepněte na všechny nové věci a dejte „Hotovo“.');
      if (level >= 4) steps.push('Někdy uvidíte tabulku tvarů a změní se jich víc najednou. Označte všechny, které jsou jiné.');
      return steps;
    },
    async run(ctx) {
      const L = ctx.level;
      const k = COUNTS[L - 1];
      const N = ctx.short ? 4 : 6;
      const scores = [];
      let found = 0, changes = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        const mode = L >= 4 ? ['swap', 'added', 'multi'][i % 3] : L >= 2 && i % 3 === 2 ? 'added' : 'swap';
        let r;
        if (mode === 'added') r = await roundAdded(k, ADDED[L - 1]);
        else if (mode === 'multi') r = await roundMulti(MULTI[L - 1]);
        else r = await roundSwap(k);
        scores.push(r.score);
        found += r.hit;
        changes += r.of;
      }
      const acc = U.mean(scores);
      ctx.finish({
        perf: acc, acc: acc, levelDelta: acc >= 0.85 ? 1 : acc < 0.5 ? -1 : 0,
        big: found + ' z ' + changes, bigLabel: 'změn jste odhalili',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      function colsFor(n) { return n <= 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : 5; }

      /* Původní úloha: jedna věc se vymění. */
      async function roundSwap(n) {
        const pick = U.sample(ITEMS, n + 1);
        const shown = pick.slice(0, n);
        const changed = U.randInt(0, n - 1);
        ctx.status('Zapamatujte si, co je na poličkách.');
        ctx.stage.textContent = '';
        ctx.foot.textContent = '';
        const slots = shown.map((e) => h('button', { class: 'shelf-slot emo', type: 'button', disabled: true }, e));
        ctx.stage.appendChild(h('div', { class: 'shelf', style: { '--cols': colsFor(n) } }, slots));
        await ctx.sleep(1500 + n * 600);
        slots.forEach((s) => { s.textContent = ''; s.classList.add('is-covered'); });
        ctx.status('Pozor, něco se mění…');
        await ctx.sleep(1000);
        shown[changed] = pick[n];
        slots.forEach((s, j) => { s.classList.remove('is-covered'); s.textContent = shown[j]; s.disabled = false; });
        ctx.status('Která věc je nová?');
        const choice = await new Promise((resolve) => {
          let done = false;
          slots.forEach((s, j) => U.tap(s, () => { if (!done) { done = true; resolve(j); } }));
        });
        const ok = choice === changed;
        slots[changed].classList.add('is-correct');
        if (!ok) slots[choice].classList.add('is-wrong');
        ctx.feedback(ok);
        ctx.status(ok ? 'Správně!' : 'Nová byla tato věc. Předtím tu stálo ' + pick[changed] + '.');
        await ctx.sleep(ok ? 1000 : 2300);
        return { score: ok ? 1 : 0, hit: ok ? 1 : 0, of: 1 };
      }

      /* Výběr všech změněných míst; vrací { score, hit, of }. */
      function markAll(box, slots, targets, label) {
        return new Promise((resolve) => {
          const chosen = {};
          let locked = false;
          const done = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: true }, 'Hotovo');
          ctx.foot.textContent = '';
          ctx.foot.appendChild(done);
          slots.forEach((s, j) => {
            s.disabled = false;
            s.setAttribute('aria-pressed', 'false');
            s.addEventListener('click', () => {
              if (locked) return;
              chosen[j] = !chosen[j];
              s.setAttribute('aria-pressed', chosen[j] ? 'true' : 'false');
              done.disabled = !Object.keys(chosen).some((x) => chosen[x]);
              ctx.sound.tap();
            });
          });
          box.dataset.new = targets.join(',');
          ctx.status(label);
          done.addEventListener('click', async () => {
            if (locked || done.disabled) return;
            locked = true;
            let hit = 0, wrong = 0;
            slots.forEach((s, j) => {
              const isT = targets.indexOf(j) !== -1;
              s.setAttribute('aria-pressed', 'false');
              s.disabled = true;
              if (chosen[j] && isT) { hit++; s.classList.add('is-correct'); }
              else if (chosen[j]) { wrong++; s.classList.add('is-wrong'); }
              else if (isT) s.classList.add('is-miss');
            });
            box.classList.add('is-done');
            const all = hit === targets.length && !wrong;
            ctx.feedback(all);
            ctx.status(all ? 'Výborně, všechno správně!' : 'Správně: ' + hit + ' z ' + targets.length + (wrong ? ' · navíc: ' + wrong : '') + '.');
            await ctx.sleep(all ? 1100 : 2300);
            resolve({ score: Math.max(0, hit - wrong) / targets.length, hit: hit, of: targets.length });
          });
        });
      }

      /* Co přibylo: na prázdná místa přibudou nové věci. */
      async function roundAdded(n, a) {
        const total = n + a;
        const pick = U.sample(ITEMS, total); // prvních n stojí na poličce, zbylé přibudou
        const newPos = U.sample(Array.from({ length: total }, (_, j) => j), a);
        const content = Array(total).fill(null);
        let used = 0;
        for (let j = 0; j < total; j++) if (newPos.indexOf(j) === -1) content[j] = pick[used++];
        ctx.status('Zapamatujte si, co je na poličkách.');
        ctx.stage.textContent = '';
        ctx.foot.textContent = '';
        const slots = content.map((e, j) => h('button', { class: 'zm-slot emo', type: 'button', disabled: true, 'data-i': j }, e || ''));
        const box = h('div', { class: 'zm shelf', 'data-mode': 'added', style: { '--cols': colsFor(total) } }, slots);
        ctx.stage.appendChild(box);
        await ctx.sleep(1500 + n * 600);
        slots.forEach((s) => { s.textContent = ''; s.classList.add('is-covered'); });
        ctx.status('Pozor, něco přibývá…');
        await ctx.sleep(1000);
        newPos.forEach((j) => { content[j] = pick[used++]; });
        slots.forEach((s, j) => { s.classList.remove('is-covered'); s.textContent = content[j] || ''; });
        return markAll(box, slots, newPos.slice().sort((x, y) => x - y), 'Přibyly ' + a + ' věci. Označte je.');
      }

      function shapeNode(c) {
        const s = h('span', { class: 'zm-shape', 'aria-hidden': 'true' });
        s.innerHTML = '<svg viewBox="0 0 40 40"><g fill="' + c.color + '" stroke="#1d1d1d" stroke-width="1.5" stroke-linejoin="round">' + SHAPES[c.shape] + '</g></svg>';
        return s;
      }

      /* Víc změn: tabulka tvarů, po zakrytí se několik tvarů změní (vždy tvar, k tomu i barva). */
      async function roundMulti(cfg) {
        const cells = Array.from({ length: cfg.cells }, () => ({ shape: U.pick(SHAPE_KEYS), color: U.pick(COLORS) }));
        const changed = U.sample(Array.from({ length: cfg.cells }, (_, j) => j), cfg.changes).sort((x, y) => x - y);
        ctx.stage.textContent = '';
        ctx.foot.textContent = '';
        const slots = cells.map((c, j) => h('button', { class: 'zm-slot is-shape', type: 'button', disabled: true, 'data-i': j, 'aria-label': 'Tvar ' + (j + 1) }, shapeNode(c)));
        const box = h('div', { class: 'zm shelf is-grid', 'data-mode': 'multi', style: { '--cols': cfg.cols } }, slots);
        ctx.stage.appendChild(h('div', { class: 'stack' }, box));
        ctx.status('Zapamatujte si tvary v tabulce.');
        const wait = K.study(ctx, { limit: cfg.cells * 900 + 3000, container: box.parentNode });
        // Velikost políček podle zbylého místa, ať je vidět celá tabulka.
        const rows = Math.ceil(cfg.cells / cfg.cols);
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
        const cell = Math.floor(U.clamp(Math.min((ctx.size().w - 40) / cfg.cols, (ctx.stage.clientHeight - 2.6 * rem - 24) / rows) - 8, 40, 5.5 * rem));
        box.style.gridTemplateColumns = 'repeat(' + cfg.cols + ', ' + cell + 'px)';
        await wait;
        const bar = box.parentNode.querySelector('.timebar');
        if (bar) bar.remove();
        ctx.foot.textContent = '';
        slots.forEach((s) => { s.textContent = ''; s.classList.add('is-covered'); });
        ctx.status('Pozor, něco se mění…');
        await ctx.sleep(1000);
        changed.forEach((j) => {
          cells[j] = { shape: U.pick(SHAPE_KEYS.filter((x) => x !== cells[j].shape)), color: U.pick(COLORS.filter((x) => x !== cells[j].color)) };
        });
        slots.forEach((s, j) => { s.classList.remove('is-covered'); s.appendChild(shapeNode(cells[j])); });
        return markAll(box, slots, changed, 'Změnily se ' + cfg.changes + ' tvary. Označte je.');
      }
    }
  });
})();
