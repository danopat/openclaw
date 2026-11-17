/* Telefonní číslo — zapamatovat si řadu číslic a napsat ji (krátkodobá paměť, rozsah paměti na čísla). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  function digits(n) {
    let s = '';
    while (s.length < n) {
      const d = String(U.randInt(0, 9));
      if (s.length >= 2 && s[s.length - 1] === d && s[s.length - 2] === d) continue;
      s += d;
    }
    return s;
  }
  const group = (s) => s.replace(/(\d{3})(?=\d)/g, '$1 ');

  SM.registerGame({
    id: 'telefon',
    name: 'Telefonní číslo',
    domain: 'pamet',
    trains: 'krátkodobou paměť na čísla',
    short: 'Zapamatujte si číslo a napište ho.',
    duration: 'asi 1 až 2 minuty',
    maxLevel: 7,
    howTo(level) {
      return [
        'Na chvíli uvidíte telefonní číslo (na začátku ' + (level + 2) + ' číslic).',
        'Pomůže, když si ho v duchu řeknete po skupinách, třeba „šest set pět, dvanáct…“.',
        'Číslo zmizí. Napište ho na klávesnici a klepněte na „Hotovo“.',
        'Když se to povede, další číslo bude o číslici delší.'
      ];
    },
    async run(ctx) {
      const start = ctx.level + 2;
      const N = ctx.short ? 4 : 6;
      let len = start, ok = 0, maxOk = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        const num = digits(len);
        ctx.status('Zapamatujte si číslo.');
        K.show(ctx, h('div', { class: 'phone-card' }, h('span', { class: 'phone-label' }, 'Telefon'), h('span', { class: 'phone-num' }, group(num))));
        await ctx.sleep(Math.max(2600, len * 900));
        ctx.status('Napište číslo, které jste viděli.');
        ctx.stage.textContent = '';
        const typed = await K.keypad(ctx, { length: len });
        const good = typed === num;
        ctx.feedback(good);
        ctx.stage.textContent = '';
        const cmp = h('div', { class: 'phone-card is-check' }, h('span', { class: 'phone-label' }, good ? 'Správně' : 'Mělo být'),
          h('span', { class: 'phone-num' }, [...num].map((d, k) => h('span', { class: typed[k] === d ? 'is-ok' : 'is-bad' }, d))));
        ctx.stage.appendChild(h('div', { class: 'stack' }, cmp));
        if (good) { ok++; maxOk = Math.max(maxOk, len); len = Math.min(len + 1, 12); }
        else len = Math.max(3, len - 1);
        ctx.status(good ? 'Výborně!' : 'Nevadí, příště to bude o číslici kratší.');
        await ctx.sleep(good ? 1100 : 2200);
      }
      ctx.finish({
        perf: ok / N,
        levelDelta: maxOk >= start + 1 ? 1 : maxOk < start ? -1 : 0,
        big: String(maxOk), bigLabel: 'nejdelší správně zapamatované číslo (číslic)',
        details: ['Povedlo se: ' + ok + ' z ' + N], metric: { span: maxOk, ok: ok }
      });
    }
  });
})();
