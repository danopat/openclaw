/* Sběr ovoce — sbírat jen ovoce a ostatní nechat být (potlačení reakce, úloha typu go/no-go). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const FRUIT = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝'];
  const OTHER = ['⚽', '🔑', '👓', '📚', '☂️', '🎈', '🧦', '⏰', '🚗', '🔔', '🧸', '✂️'];
  const VEG = ['🥕', '🥦', '🌽', '🥒', '🍆', '🧅', '🧄', '🥔', '🫑', '🍄'];
  const LEVELS = [
    { T: 1700, others: 'easy' },
    { T: 1400, others: 'easy' },
    { T: 1250, others: 'veg' },
    { T: 1050, others: 'veg' },
    { T: 900, others: 'mix' }
  ];

  SM.registerGame({
    id: 'sber',
    name: 'Sběr ovoce',
    domain: 'rozhodovani',
    trains: 'rychlé rozhodování a sebeovládání',
    short: 'Sbírejte jen ovoce, nic jiného.',
    duration: 'asi 1 minuta',
    pace: { per: 'na reakci' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      return [
        'Na pult budou jedna po druhé přicházet různé věci.',
        'Když uvidíte ovoce, rychle klepněte na „Do košíku“.',
        L.others === 'easy' ? 'Když přijde něco jiného, neklepejte a počkejte.' : 'Pozor na zeleninu: tu do košíku nedávejte.',
        'Každá věc zůstane na pultu jen chvíli.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 14 : 22;
      const flags = U.shuffle(Array.from({ length: N }, (_, i) => i < Math.round(N * 0.6)));
      const others = L.others === 'easy' ? OTHER : L.others === 'veg' ? VEG : OTHER.concat(VEG);
      let hits = 0, misses = 0, fa = 0, cr = 0;
      const rts = [];
      let respond = null;

      const item = h('div', { class: 'catch-item emo', 'aria-live': 'off' });
      const plate = h('div', { class: 'catch-plate' }, item);
      ctx.stage.appendChild(plate);
      const take = h('button', { class: 'btn btn-primary catch-btn', type: 'button' }, 'Do košíku');
      U.tap(take, () => { if (respond) respond(); });
      U.tap(plate, () => { if (respond) respond(); });
      ctx.foot.appendChild(take);
      ctx.on(window, 'keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (respond) respond(); } });
      ctx.status('Sbírejte jen ovoce.');

      for (let t = 0; t < N; t++) {
        ctx.progress((t + 1) + ' / ' + N + ' · v košíku ' + hits);
        item.textContent = '';
        item.className = 'catch-item emo';
        await ctx.sleep(450 + Math.random() * 300);
        const target = flags[t];
        const e = target ? U.pick(FRUIT) : U.pick(others);
        item.textContent = e;
        item.classList.add('is-in');
        const tapped = await new Promise((resolve) => {
          const start = performance.now();
          const timer = ctx.after(L.T, () => { respond = null; resolve(null); });
          respond = () => { respond = null; ctx.cancel(timer); resolve((performance.now() - start) / SM.timeScale); };
        });
        if (target && tapped != null) { hits++; rts.push(tapped); item.classList.add('is-taken'); ctx.sound.correct(); }
        else if (target) { misses++; item.classList.add('is-missed'); }
        else if (tapped != null) { fa++; ctx.feedback(false); ctx.status('Tohle není ovoce.'); }
        else cr++;
        await ctx.sleep(tapped != null && !target ? 900 : 250);
        if (!target && tapped != null) ctx.status('Sbírejte jen ovoce.');
      }
      const acc = (hits + cr) / N;
      ctx.finish({
        perf: 0.75 * acc + 0.25 * (rts.length ? U.clamp((L.T - U.mean(rts)) / L.T, 0, 1) : 0),
        acc: acc, rt: rts.length ? U.mean(rts) : null,
        levelDelta: acc >= 0.9 ? 1 : acc < 0.7 ? -1 : 0,
        big: Math.round(acc * 100) + ' %', bigLabel: 'správných rozhodnutí',
        details: ['V košíku: ' + hits + ' ks ovoce', fa ? 'Omylem sebráno: ' + fa : 'Nic navíc', misses ? 'Uteklo: ' + misses : 'Nic neuteklo'],
        metric: { acc: Math.round(acc * 100), fa: fa, miss: misses }
      });
    }
  });
})();
