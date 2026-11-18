/* Co se změnilo — všimnout si, která věc na poličce se vyměnila (zraková paměť, pozornost). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const ITEMS = ['🏺', '🕯️', '📚', '⏰', '🪴', '🧸', '🎁', '🍯', '☕', '🔔', '📷', '🎩', '👓', '🧶', '🍎', '🌵', '🎻', '📻', '🧦', '🪆', '🧺', '🥫', '⚽'];
  const COUNTS = [3, 4, 5, 6, 8, 10];

  SM.registerGame({
    id: 'zmena',
    name: 'Co se změnilo',
    domain: 'pamet',
    trains: 'zrakovou paměť a pozornost k detailům',
    short: 'Která věc na poličce je jiná?',
    duration: 'asi 1 až 2 minuty',
    maxLevel: COUNTS.length,
    howTo: [
      'Na poličkách stojí několik věcí. Prohlédněte si je.',
      'Poličky se na chvíli zakryjí a jedna věc se vymění za jinou.',
      'Klepněte na místo, kde je teď něco jiného.'
    ],
    async run(ctx) {
      const k = COUNTS[ctx.level - 1];
      const N = ctx.short ? 4 : 6;
      const cols = k <= 4 ? 2 : k <= 6 ? 3 : k <= 8 ? 4 : 5;
      let correct = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        const pick = U.sample(ITEMS, k + 1);
        const shown = pick.slice(0, k);
        const changed = U.randInt(0, k - 1);
        ctx.status('Zapamatujte si, co je na poličkách.');
        ctx.stage.textContent = '';
        ctx.foot.textContent = '';
        const slots = shown.map((e) => h('button', { class: 'shelf-slot emo', type: 'button', disabled: true }, e));
        const shelf = h('div', { class: 'shelf', style: { '--cols': cols } }, slots);
        ctx.stage.appendChild(shelf);
        shelf.style.setProperty('--es', Math.floor(slots[0].clientWidth * 0.72) + 'px'); // obrázek se vejde i do úzké poličky
        await ctx.sleep(1500 + k * 600);
        slots.forEach((s) => { s.textContent = ''; s.classList.add('is-covered'); });
        ctx.status('Pozor, něco se mění…');
        await ctx.sleep(1000);
        shown[changed] = pick[k];
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
        if (ok) correct++;
        ctx.status(ok ? 'Správně!' : 'Nová byla tato věc. Předtím tu stálo ' + pick[changed] + '.');
        await ctx.sleep(ok ? 1000 : 2300);
      }
      const acc = correct / N;
      ctx.finish({
        perf: acc, levelDelta: acc >= 0.85 ? 1 : acc < 0.5 ? -1 : 0,
        big: correct + ' z ' + N, bigLabel: 'změn jste odhalili',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
