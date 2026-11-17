/* Barvy a slova — Stroopova úloha na školní tabuli: odpovědět barvou křídy, ne přečteným slovem.
   Na vyšších úrovních se střídají pravidla (přepínání pozornosti). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const COLORS = [
    { id: 'red', name: 'červená', word: 'ČERVENÁ', css: 'var(--chalk-red)' },
    { id: 'blue', name: 'modrá', word: 'MODRÁ', css: 'var(--chalk-blue)' },
    { id: 'green', name: 'zelená', word: 'ZELENÁ', css: 'var(--chalk-green)' },
    { id: 'yellow', name: 'žlutá', word: 'ŽLUTÁ', css: 'var(--chalk-yellow)' }
  ];
  const LEVELS = [
    { k: 3, incong: 0.3, deadline: 0, sw: 0 },
    { k: 3, incong: 0.5, deadline: 0, sw: 0 },
    { k: 4, incong: 0.5, deadline: 0, sw: 0 },
    { k: 4, incong: 0.7, deadline: 3000, sw: 0 },
    { k: 4, incong: 0.7, deadline: 2300, sw: 0 },
    { k: 4, incong: 0.7, deadline: 0, sw: 0.3 },
    { k: 4, incong: 0.7, deadline: 3000, sw: 0.4 },
    { k: 4, incong: 0.7, deadline: 2400, sw: 0.5 }
  ];

  SM.registerGame({
    id: 'barvy',
    name: 'Barvy a slova',
    domain: 'rozhodovani',
    trains: 'sebeovládání a pružné přepínání pozornosti',
    short: 'Odpovězte barvou písma, ne slovem.',
    duration: 'asi 2 minuty',
    pace: { per: 'na reakci' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Na tabuli se objeví název barvy, napsaný barevnou křídou.',
        'Klepněte na barvu křídy, ne na to, co je napsáno. Když je slovo MODRÁ napsané červeně, správně je „červená“.'
      ];
      if (L.sw) steps.push('Sledujte pokyn nad tabulí. „Barva písma“: odpovídáte barvou křídy. „Co je napsáno“: odpovídáte podle přečteného slova.');
      if (L.deadline) steps.push('Na každou odpověď máte ' + U.num(L.deadline / 1000, 1) + ' s.');
      steps.push('Pokud špatně rozlišujete barvy, vyberte si raději jinou hru.');
      return steps;
    },

    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const TRIALS = ctx.short ? 14 : 24;
      const colors = COLORS.slice(0, L.k);
      let answer = null;

      const pill = h('span', { class: 'rule-pill is-ink' + (L.sw ? '' : ' is-hidden') });
      const word = h('span', { class: 'board-word' });
      const board = h('div', { class: 'board', 'aria-live': 'off' }, word);
      ctx.stage.appendChild(h('div', { class: 'board-wrap' }, pill, board));
      const setRule = (rule) => {
        pill.className = 'rule-pill ' + (rule === 'ink' ? 'is-ink' : 'is-word') + (L.sw ? '' : ' is-hidden');
        pill.textContent = '';
        pill.appendChild(U.svg(SM.icons[rule === 'ink' ? 'drop' : 'lines']));
        pill.appendChild(document.createTextNode(rule === 'ink' ? 'Barva písma' : 'Co je napsáno'));
      };

      const btnBox = h('div', { class: 'color-btns' });
      colors.forEach((c, i) => {
        const b = h('button', {
          class: 'btn color-btn', type: 'button',
          style: colors.length % 2 && i === colors.length - 1 ? { gridColumn: '1 / -1' } : null
        }, h('span', { class: 'swatch', style: { '--sw': c.css } }), c.name);
        U.tap(b, () => { if (answer) answer(c); });
        btnBox.appendChild(b);
      });
      ctx.foot.appendChild(btnBox);

      const incongFlags = U.shuffle(Array.from({ length: TRIALS }, (_, i) => i < Math.round(TRIALS * L.incong)));
      let rule = 'ink';
      let correct = 0, slow = 0;
      const rts = [];
      setRule(rule);
      ctx.status(L.sw ? 'Řiďte se pokynem nad tabulí.' : 'Jakou barvou je slovo napsané?');

      for (let t = 0; t < TRIALS; t++) {
        ctx.progress((t + 1) + ' / ' + TRIALS);
        if (L.sw && t > 0 && Math.random() < L.sw) rule = rule === 'ink' ? 'word' : 'ink';
        setRule(rule);
        word.textContent = '';
        await ctx.sleep(450 + Math.random() * 350);

        const ink = U.pick(colors);
        const text = incongFlags[t] ? U.pick(colors.filter((c) => c !== ink)) : ink;
        const target = rule === 'ink' ? ink : text;
        word.textContent = text.word;
        word.style.color = ink.css;
        word.setAttribute('aria-label', 'Slovo ' + text.name + ', napsané barvou ' + ink.name);

        const res = await new Promise((resolve) => {
          let start = 0;
          let timer = null;
          ctx.frame((ts) => { start = ts; });
          answer = (c) => {
            answer = null;
            if (timer) ctx.cancel(timer);
            resolve({ c: c, rt: performance.now() - (start || performance.now()) });
          };
          if (L.deadline) {
            timer = ctx.after(L.deadline, () => {
              if (!answer) return;
              answer = null;
              resolve({ c: null, rt: L.deadline });
            });
          }
        });

        const ok = res.c === target;
        if (ok) { correct++; rts.push(res.rt / SM.timeScale); }
        if (!res.c) {
          slow++;
          ctx.sound.wrong();
          ctx.status('Příště o něco rychleji.');
        } else {
          ctx.feedback(ok);
          if (!ok) ctx.status(rule === 'ink' ? 'Křída byla ' + ink.name + '.' : 'Napsáno bylo ' + text.name + '.');
        }
        await ctx.sleep(ok ? 400 : 1300);
        ctx.status(L.sw ? 'Řiďte se pokynem nad tabulí.' : 'Jakou barvou je slovo napsané?');
      }

      const acc = correct / TRIALS;
      const meanRT = rts.length ? U.mean(rts) : 0;
      const details = ['Průměrná reakce: ' + (rts.length ? U.num(meanRT / 1000, 2) + ' s' : '–')];
      if (slow) details.push('Pozdě: ' + slow + '×');
      ctx.finish({
        perf: 0.7 * U.clamp((acc - 0.5) / 0.5, 0, 1) + 0.3 * (rts.length ? U.clamp((2600 - meanRT) / 1800, 0, 1) : 0),
        acc: acc, rt: rts.length ? meanRT : null,
        levelDelta: acc >= 0.9 ? 1 : acc < 0.7 ? -1 : 0,
        big: correct + ' z ' + TRIALS,
        bigLabel: 'správných odpovědí',
        details: details,
        metric: { acc: Math.round(acc * 100), rt: Math.round(meanRT) }
      });
    }
  });
})();
