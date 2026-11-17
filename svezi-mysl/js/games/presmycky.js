/* Přesmyčky — složit slovo z přeházených písmen (jazyk, pracovní paměť, plánování). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const LEVELS = [
    { min: 4, max: 4, pic: true },
    { min: 5, max: 5, pic: true },
    { min: 5, max: 6, pic: false },
    { min: 6, max: 7, pic: false },
    { min: 7, max: 8, pic: false }
  ];

  SM.registerGame({
    id: 'presmycky',
    name: 'Přesmyčky',
    domain: 'slova',
    trains: 'práci se slovy a soustředění',
    short: 'Složte slovo z přeházených písmen.',
    duration: 'asi 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      return [
        'Písmena jednoho slova jsou přeházená.',
        'Klepejte na písmena ve správném pořadí. Slovo se skládá nahoře.',
        L.pic ? 'Obrázek vám napoví, o jaké slovo jde.' : 'Napoví vám, do jaké skupiny slovo patří.',
        'Když se spletete, klepněte na „Vrátit písmeno“.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      const pool = SM.content.ANAGRAMS.filter((a) => [...a.w].length >= L.min && [...a.w].length <= L.max);
      const items = U.sample(pool, N);
      const scores = [];

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const letters = [...it.w];
        ctx.progress((i + 1) + ' / ' + items.length);
        let scrambled = letters;
        for (let t = 0; t < 20 && scrambled.join('') === it.w; t++) scrambled = U.shuffle(letters);
        let tries = 0;
        let solved = false;
        while (!solved && tries < 2 && ctx.alive) {
          ctx.status('Složte slovo z písmen.');
          const result = await round(it, letters, scrambled);
          if (result === it.w) { solved = true; break; }
          tries++;
          ctx.feedback(false);
          if (tries < 2) { ctx.status('To není ono. Zkuste to ještě jednou.'); await ctx.sleep(1300); }
        }
        if (solved) {
          ctx.feedback(true);
          ctx.status('Správně: ' + it.w + '!');
          scores.push(tries === 0 ? 1 : 0.6);
          await ctx.sleep(1200);
        } else {
          scores.push(0);
          showAnswer(it);
          ctx.status('Hledané slovo je ' + it.w + '.');
          await ctx.sleep(2400);
        }
      }

      const perf = U.mean(scores);
      const ok = scores.filter((s) => s > 0).length;
      ctx.finish({
        perf: perf, levelDelta: perf >= 0.85 ? 1 : perf < 0.5 ? -1 : 0,
        big: ok + ' z ' + items.length, bigLabel: 'slov jste složili',
        details: [], metric: { perf: Math.round(perf * 100) }
      });

      function hint(it) {
        return h('div', { class: 'ana-hint' },
          L.pic ? h('span', { class: 'emo ana-pic', 'aria-hidden': 'true' }, it.e) : null,
          h('span', null, 'Nápověda: ', h('strong', null, it.c)));
      }
      function showAnswer(it) {
        ctx.stage.textContent = '';
        ctx.foot.textContent = '';
        const slots = h('div', { class: 'ana-slots' }, [...it.w].map((ch) => h('span', { class: 'ana-slot is-filled is-shown' }, ch)));
        ctx.stage.appendChild(h('div', { class: 'stack' }, hint(it), slots));
      }
      function round(it, letters, scrambled) {
        return new Promise((resolve) => {
          ctx.stage.textContent = '';
          ctx.foot.textContent = '';
          const picked = [];
          const slotEls = letters.map(() => h('span', { class: 'ana-slot' }));
          const slots = h('div', { class: 'ana-slots', 'aria-live': 'polite' }, slotEls);
          const tiles = scrambled.map((ch, i) => {
            const b = h('button', { class: 'btn ana-tile', type: 'button', 'aria-label': 'Písmeno ' + ch }, ch);
            U.tap(b, () => {
              if (b.disabled || picked.length >= letters.length) return;
              b.disabled = true;
              picked.push(i);
              ctx.sound.tap();
              render();
              if (picked.length === letters.length) {
                const word = picked.map((k) => scrambled[k]).join('');
                ctx.after(350, () => resolve(word));
              }
            });
            return b;
          });
          const undo = h('button', { class: 'btn btn-secondary btn-small', type: 'button' }, 'Vrátit písmeno');
          U.tap(undo, () => {
            if (!picked.length || picked.length === letters.length) return;
            tiles[picked.pop()].disabled = false;
            render();
          });
          const render = () => {
            slotEls.forEach((s, k) => {
              s.textContent = k < picked.length ? scrambled[picked[k]] : '';
              s.classList.toggle('is-filled', k < picked.length);
            });
            undo.disabled = !picked.length;
          };
          ctx.stage.appendChild(h('div', { class: 'stack' }, hint(it), slots, h('div', { class: 'ana-tiles' }, tiles)));
          ctx.foot.appendChild(undo);
          render();
        });
      }
    }
  });
})();
