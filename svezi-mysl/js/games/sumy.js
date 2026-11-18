/* Součty z paměti — zapamatovat si pár čísel a pak poznat, které součty z nich jdou složit (pracovní paměť a počítání). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* k = kolik čísel si zapamatovat, lo–hi = jejich rozsah, size = nejvíc sčítanců (2 = jen dvojice, 3 = i trojice),
     cand = čísel v nabídce, valid = kolik z nich jde složit (od–do). */
  const LEVELS = [
    { k: 3, lo: 2, hi: 10, size: 2, cand: 5, valid: [1, 2] },
    { k: 3, lo: 2, hi: 20, size: 2, cand: 5, valid: [1, 2] },
    { k: 3, lo: 4, hi: 50, size: 2, cand: 6, valid: [1, 3] },
    { k: 4, lo: 2, hi: 30, size: 3, cand: 7, valid: [2, 3] },
    { k: 4, lo: 4, hi: 100, size: 3, cand: 8, valid: [2, 4] }
  ];
  const HINT_COST = 0.25; // o kolik nápověda sníží hodnocení sady

  /* Součty 2 až maxSize čísel → { součet: sčítanci } (u každého součtu rozklad s nejmenším počtem čísel). */
  function sums(nums, maxSize) {
    const out = {};
    for (let mask = 1; mask < (1 << nums.length); mask++) {
      const parts = nums.filter((_, i) => mask & (1 << i));
      if (parts.length < 2 || parts.length > maxSize) continue;
      const s = parts.reduce((a, b) => a + b, 0);
      if (!out[s] || out[s].length > parts.length) out[s] = parts;
    }
    return out;
  }

  function makeSet(L) {
    for (let t = 0; t < 500; t++) {
      const nums = [];
      for (let g = 0; nums.length < L.k && g < 200; g++) {
        const v = U.randInt(L.lo, L.hi);
        if (nums.every((x) => Math.abs(x - v) >= 2)) nums.push(v);
      }
      if (nums.length < L.k) continue;
      const any = sums(nums, nums.length); // všechny součty skupin (ty nesmějí být mezi návnadami)
      if (nums.some((v) => any[v])) continue; // zapamatované číslo nesmí samo vycházet jako součet jiných
      const ok = sums(nums, L.size);
      const okVals = Object.keys(ok).map(Number);
      const valid = U.sample(okVals, Math.min(okVals.length, U.randInt(L.valid[0], L.valid[1])));
      const bad = {};
      Object.keys(any).forEach((s) => { bad[s] = true; });
      nums.forEach((v) => { bad[v] = true; });
      const steps = L.hi >= 50 ? [1, 2, 3, 4, 5, 10] : [1, 2, 3, 4];
      const distract = [];
      const need = L.cand - valid.length;
      for (let tries = 0; distract.length < need && tries < 400; tries++) {
        const base = U.pick(okVals);
        const v = base + U.pick(steps) * (Math.random() < 0.5 ? -1 : 1);
        if (v < 3 || bad[v] || distract.indexOf(v) !== -1) continue;
        distract.push(v);
      }
      if (distract.length < need) continue;
      return { nums: nums, valid: valid, ok: ok, cands: valid.concat(distract).sort((a, b) => a - b) };
    }
    return null;
  }

  SM.registerGame({
    id: 'sumy',
    name: 'Součty z paměti',
    domain: 'pamet',
    trains: 'pracovní paměť a počítání zpaměti',
    short: 'Zapamatujte si čísla a hledejte jejich součty.',
    duration: 'asi 2 minuty',
    pace: { per: 'na sadu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      return [
        'Ukážeme vám ' + (L.k === 3 ? 'tři' : 'čtyři') + ' čísla v rámečcích. Zapamatujte si je a klepněte na „Mám zapamatováno“. Čas nehraje roli.',
        'Pak uvidíte nová čísla v kolečkách. Klepněte na všechna, která jdou složit sečtením ' + (L.size === 2 ? 'dvou' : 'dvou nebo tří') + ' zapamatovaných čísel. Aspoň jedno takové je tam vždycky.',
        'Když zapomenete, tlačítko „Ukázat čísla“ je na chvíli připomene. Hodnocení se tím trochu sníží.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 2 : 4;
      const res = [];
      for (let i = 0; i < N; i++) {
        const set = makeSet(L);
        ctx.progress('Sada ' + (i + 1) + ' z ' + N);
        await study(set);
        res.push(await recall(set, i === N - 1));
      }
      const acc = U.mean(res.map((r) => r.score));
      const sum = (k) => res.reduce((a, r) => a + r[k], 0);
      const hits = sum('hit'), fa = sum('fa'), hints = sum('hints'), valid = sum('valid');
      const details = [fa ? 'Vybráno navíc: ' + fa : 'Nic navíc'];
      if (hints) details.push('Nápověda: ' + hints + '×');
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.85, 0.5),
        big: hits + ' z ' + valid,
        bigLabel: U.plural(valid, 'součtu', 'součtů', 'součtů') + ' jste našli',
        details: details,
        metric: { hits: hits, fa: fa, hints: hints, valid: valid }
      });

      function cards(nums, small) {
        return h('div', { class: 'sumy-cards' + (small ? ' is-small' : '') }, nums.map((v) => h('span', { class: 'sumy-card' }, String(v))));
      }

      function study(set) {
        ctx.clear();
        ctx.status('Zapamatujte si tato čísla.');
        ctx.stage.appendChild(h('div', { class: 'stack sumy', 'data-ask': 'study' }, cards(set.nums)));
        return K.study(ctx, {});
      }

      /* Průměr koleček tak, aby se nabídka vešla na plochu (pod kolečkem je ještě řádek s vysvětlením). */
      function circle(n) {
        const sz = ctx.size();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
        const W = Math.min(sz.w, 30 * rem) - 4;
        const H = sz.h - 3.8 * rem - 16; // místo pro připomenutá čísla
        const below = 1.6 * rem + 0.5 * rem;
        let best = 0;
        for (let cols = 2; cols <= n; cols++) {
          const rows = Math.ceil(n / cols);
          const d = Math.min((W - 0.9 * rem * (cols - 1)) / cols, (H - rows * below) / rows);
          if (d > best) best = d;
        }
        return Math.floor(U.clamp(best, 2.9 * rem, 4.6 * rem));
      }

      /* Výběr součtů. Vrací { score, hit, fa, valid, hints }. */
      function recall(set, last) {
        return new Promise((resolve) => {
          ctx.clear();
          ctx.status('Klepněte na všechny součty ' + (L.size === 2 ? 'dvou' : 'dvou nebo tří') + ' zapamatovaných čísel.');
          const peek = h('div', { class: 'sumy-peek', 'aria-live': 'polite' });
          const grid = h('div', { class: 'sumy-cands', role: 'group', 'aria-label': 'Čísla k výběru' });
          const chosen = {};
          let locked = false;
          let peeking = false;
          let hints = 0;
          const t0 = performance.now();
          const doneBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: true }, 'Hotovo');
          // Nápověda sedí na místě, kde se pak čísla na chvíli ukážou.
          const hintBtn = h('button', { class: 'btn btn-secondary btn-small sumy-hint', type: 'button' }, 'Ukázat čísla');
          peek.appendChild(hintBtn);
          const picked = () => set.cands.filter((v) => chosen[v]);
          const slots = set.cands.map((v) => {
            const b = h('button', { class: 'sumy-cand', type: 'button', 'aria-pressed': 'false', 'data-v': v }, String(v));
            const why = h('span', { class: 'sumy-why' });
            b.addEventListener('click', () => {
              if (locked) return;
              chosen[v] = !chosen[v];
              b.setAttribute('aria-pressed', chosen[v] ? 'true' : 'false');
              doneBtn.disabled = !picked().length;
              ctx.sound.tap();
            });
            grid.appendChild(h('div', { class: 'sumy-slot' }, b, why));
            return { v: v, b: b, why: why };
          });
          ctx.foot.appendChild(doneBtn);
          grid.style.setProperty('--d', circle(set.cands.length) + 'px');
          ctx.stage.appendChild(h('div', { class: 'stack sumy', 'data-ask': 'pick', 'data-size': L.size }, peek, grid));

          U.tap(hintBtn, async () => {
            if (locked || peeking || !ctx.alive) return;
            peeking = true;
            hints++;
            ctx.sound.tap();
            peek.textContent = '';
            peek.appendChild(cards(set.nums, true));
            await ctx.sleep(2000);
            if (locked) return;
            peek.textContent = '';
            peek.appendChild(hintBtn);
            peeking = false;
          });

          doneBtn.addEventListener('click', async () => {
            if (locked || doneBtn.disabled) return;
            locked = true;
            const ms = (performance.now() - t0) / SM.timeScale;
            grid.classList.add('is-locked');
            let hit = 0, fa = 0;
            slots.forEach((s) => {
              const isV = set.valid.indexOf(s.v) !== -1;
              const sel = !!chosen[s.v];
              s.b.setAttribute('aria-pressed', 'false');
              s.b.setAttribute('aria-disabled', 'true');
              if (isV) s.why.textContent = set.ok[s.v].join(' + ');
              if (sel && isV) { hit++; s.b.classList.add('is-hit'); s.b.setAttribute('aria-label', s.v + ': správně, ' + s.why.textContent); }
              else if (sel) { fa++; s.b.classList.add('is-false'); s.why.textContent = 'nejde'; s.b.setAttribute('aria-label', s.v + ': nejde složit'); }
              else if (isV) {
                s.b.classList.add('is-miss');
                s.b.setAttribute('aria-label', s.v + ': šlo složit, ' + s.why.textContent);
                s.b.parentNode.appendChild(h('span', { class: 'sumy-tag', 'aria-hidden': 'true' }, 'chybělo'));
              }
            });
            peek.textContent = '';
            peek.appendChild(cards(set.nums, true));
            const n = set.valid.length;
            const score = U.clamp((hit - fa) / n - HINT_COST * hints, 0, 1);
            ctx.mark(hit === n && !fa, ms);
            ctx.feedback(hit === n && !fa);
            ctx.status(hit === n && !fa ? 'Výborně, našli jste všechno!' : 'Správně: ' + hit + ' z ' + n + (fa ? ' · navíc: ' + fa : '') + '.');
            await K.next(ctx, last ? 'Zobrazit výsledek' : 'Další čísla');
            resolve({ score: score, hit: hit, fa: fa, valid: n, hints: hints });
          });
        });
      }
    }
  });
})();
