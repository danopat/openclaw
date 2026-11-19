/* Mozaika — zapamatovat si rozmístění barevných políček a zopakovat ho (prostorová paměť). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* n = velikost mřížky, k = barevných políček, seq = kolik vzorů za sebou, timed = ms na každý vzor (jinak si čas určí hráč) */
  const LEVELS = [{ n: 3, k: 3 }, { n: 3, k: 4 }, { n: 4, k: 5 }, { n: 4, k: 6 }, { n: 5, k: 7 }, { n: 5, k: 9 },
    { n: 4, k: 5, seq: 2 }, { n: 4, k: 5, seq: 3 }, { n: 5, k: 6, seq: 3, timed: 5000 }];

  SM.registerGame({
    id: 'mozaika',
    name: 'Mozaika',
    domain: 'pamet',
    trains: 'prostorovou paměť',
    short: 'Zopakujte rozmístění barevných políček.',
    duration: 'asi 1 až 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = ['Na chvíli uvidíte mřížku, ve které jsou některá políčka obarvená.', 'Zapamatujte si, kde barevná políčka byla.'];
      if (L.seq) {
        steps.push('Vzory jsou ' + L.seq + ' za sebou. ' + (L.timed ? 'Každý uvidíte ' + (L.timed / 1000) + ' sekund.' : 'Až si vzor zapamatujete, klepněte na tlačítko a přijde další.'));
        steps.push('Potom vzory vybarvíte jeden po druhém ve stejném pořadí.');
      } else steps.push('Pak je v prázdné mřížce vybarvěte klepnutím a potvrďte tlačítkem „Hotovo“.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const seq = L.seq || 1;
      const N = seq > 1 ? (ctx.short ? 1 : 2) : (ctx.short ? 3 : 5);
      const cells = L.n * L.n;
      const scores = [];
      for (let r = 0; r < N; r++) {
        const pats = Array.from({ length: seq }, () => U.sample(Array.from({ length: cells }, (_, i) => i), L.k));
        for (let p = 0; p < seq; p++) {
          ctx.progress(seq > 1 ? 'Vzor ' + (p + 1) + ' z ' + seq + (N > 1 ? ' · kolo ' + (r + 1) + ' z ' + N : '') : (r + 1) + ' / ' + N);
          await show(pats[p], p);
        }
        for (let p = 0; p < seq; p++) {
          ctx.progress(seq > 1 ? 'Vybarvěte vzor ' + (p + 1) + ' z ' + seq : (r + 1) + ' / ' + N);
          scores.push(await repeat(pats[p], p));
        }
      }
      const perf = U.mean(scores);
      ctx.finish({
        perf: perf, levelDelta: perf >= 0.9 ? 1 : perf < 0.6 ? -1 : 0,
        big: Math.round(perf * 100) + ' %', bigLabel: 'políček jste trefili',
        details: seq > 1 ? [seq + ' vzory za sebou'] : [], metric: { perf: Math.round(perf * 100) }
      });

      function grid(on) {
        const btns = [];
        const g = h('div', { class: 'mosaic', style: { '--n': L.n } });
        for (let i = 0; i < cells; i++) {
          const b = h('button', { class: 'mosaic-cell' + (on && on.indexOf(i) !== -1 ? ' is-on' : ''), type: 'button', disabled: true, 'aria-label': 'Políčko ' + (i + 1) });
          btns.push(b);
          g.appendChild(b);
        }
        ctx.stage.textContent = '';
        ctx.stage.appendChild(g);
        const size = () => {
          const sz = ctx.size();
          g.style.setProperty('--side', Math.floor(Math.min(sz.w, sz.h - 8, 440)) + 'px');
        };
        size();
        ctx.on(window, 'resize', size);
        return { g: g, btns: btns };
      }
      /* Ukázat vzor: jeden vzor jako dřív (pevný čas), víc vzorů po klepnutí, nebo na nejvyšší úrovni 5 sekund. */
      async function show(target, p) {
        ctx.foot.textContent = '';
        ctx.status(seq > 1 ? 'Zapamatujte si ' + (p + 1) + '. vzor.' : 'Zapamatujte si vzor.');
        const G = grid(target);
        if (seq === 1) { await ctx.sleep(2000 + 500 * L.k); return; }
        const wrap = h('div', { class: 'stack' });
        G.g.replaceWith(wrap);
        wrap.appendChild(G.g);
        await K.study(ctx, { limit: L.timed || 0, container: L.timed ? wrap : null, label: p < seq - 1 ? 'Další vzor' : 'Mám zapamatováno' });
        ctx.foot.textContent = '';
        ctx.stage.textContent = '';
        await ctx.sleep(400);
      }
      /* Vybarvit vzor zpaměti → skóre 0–1 */
      async function repeat(target, p) {
        const G = grid(null);
        G.g.dataset.target = target.join(',');
        const btns = G.btns;
        btns.forEach((b) => { b.disabled = false; b.setAttribute('aria-pressed', 'false'); });
        ctx.status(seq > 1 ? 'Vybarvěte ' + (p + 1) + '. vzor.' : 'Vybarvěte políčka, která byla barevná.');
        const chosen = await new Promise((resolve) => {
          const sel = [];
          const done = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: true }, 'Hotovo');
          btns.forEach((b, i) => U.tap(b, () => {
            if (b.disabled) return;
            const at = sel.indexOf(i);
            if (at === -1) sel.push(i); else sel.splice(at, 1);
            b.classList.toggle('is-on', at === -1);
            b.setAttribute('aria-pressed', at === -1 ? 'true' : 'false');
            ctx.sound.tap();
            done.disabled = !sel.length;
          }));
          U.tap(done, () => { if (!done.disabled) { btns.forEach((b) => { b.disabled = true; }); resolve(sel.slice()); } });
          ctx.foot.appendChild(done);
        });
        ctx.foot.textContent = '';
        let hits = 0, extra = 0;
        btns.forEach((b, i) => {
          const t = target.indexOf(i) !== -1, c = chosen.indexOf(i) !== -1;
          b.classList.remove('is-on');
          if (t && c) { hits++; b.classList.add('is-hit'); }
          else if (c) { extra++; b.classList.add('is-extra'); }
          else if (t) b.classList.add('is-miss');
        });
        const score = Math.max(0, hits - extra) / L.k;
        ctx.feedback(score === 1);
        ctx.status(score === 1 ? 'Přesně tak!' : 'Správně: ' + hits + ' z ' + L.k + (extra ? ', navíc: ' + extra : '') + '.');
        await ctx.sleep(score === 1 ? 1100 : 2300);
        return score;
      }
    }
  });
})();
