/* Bleskový pohled — rychlost zpracování a rozdělená pozornost.
   Vychází z výzkumného paradigmatu „užitečného zorného pole“ (UFOV): střed + okraj,
   doba zobrazení se přizpůsobuje (2 správně za sebou → kratší, chyba → delší). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const LEVELS = [
    { pos: 4, distract: false, start: 500 },
    { pos: 4, distract: false, start: 300 },
    { pos: 8, distract: false, start: 500 },
    { pos: 8, distract: false, start: 300 },
    { pos: 8, distract: false, start: 180 },
    { pos: 8, distract: true, start: 500 },
    { pos: 8, distract: true, start: 300 },
    { pos: 8, distract: true, start: 180 },
    { pos: 8, distract: true, start: 110 },
    { pos: 8, distract: true, start: 70 }
  ];
  const CENTER = [{ e: '🐞', name: 'Beruška' }, { e: '🐝', name: 'Včela' }];
  const TARGET = '🌻';
  const DISTRACT = '🌿';
  const NAMES8 = ['nahoře', 'vpravo nahoře', 'vpravo', 'vpravo dole', 'dole', 'vlevo dole', 'vlevo', 'vlevo nahoře'];
  const NAMES4 = ['nahoře', 'vpravo', 'dole', 'vlevo'];

  SM.registerGame({
    id: 'blesk',
    name: 'Bleskový pohled',
    domain: 'postreh',
    trains: 'rychlost vnímání a pozornost na okraji zorného pole',
    short: 'Zachyťte, co se na okamžik mihlo.',
    duration: 'asi 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Dívejte se na křížek uprostřed kruhu.',
        'Na okamžik se uprostřed objeví beruška, nebo včela. Současně se někde na okraji kruhu mihne slunečnice.'
      ];
      if (L.distract) steps.push('Na okraji budou i zelené lístky. Slunečnice je mezi nimi jen jedna.');
      steps.push('Pak odpovíte, kdo byl uprostřed, a klepnete na místo, kde byla slunečnice.');
      steps.push('Když se daří, obrázky se ukazují kratší dobu. Nevadí, když si nejste jistí: tipněte si.');
      return steps;
    },

    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const TRIALS = ctx.short ? 10 : 16;
      const P = L.pos;
      const names = P === 8 ? NAMES8 : NAMES4;
      let dur = L.start, streak = 0, correct = 0;
      const durs = [];
      let onSlot = null;

      const field = h('div', { class: 'blesk emo' });
      field.appendChild(h('div', { class: 'blesk-ring', 'aria-hidden': 'true' }));
      const center = h('div', { class: 'slot is-center', 'aria-hidden': 'true', style: { left: '50%', top: '50%' } });
      field.appendChild(center);
      const slots = [];
      for (let k = 0; k < P; k++) {
        const ang = ((-90 + (k * 360) / P) * Math.PI) / 180;
        const s = h('button', {
          class: 'slot', type: 'button', disabled: true, 'aria-label': 'Slunečnice byla ' + names[k],
          style: { left: (50 + 38 * Math.cos(ang)).toFixed(2) + '%', top: (50 + 38 * Math.sin(ang)).toFixed(2) + '%' }
        });
        U.tap(s, () => { if (onSlot) onSlot(k); });
        field.appendChild(s);
        slots.push(s);
      }
      ctx.stage.appendChild(field);

      const layout = () => {
        const sz = ctx.size();
        const S = Math.floor(Math.min(sz.w, sz.h - 8, 560));
        field.style.setProperty('--S', S + 'px');
        field.style.setProperty('--slot', Math.floor(S * (P === 4 ? 0.2 : 0.17)) + 'px');
      };
      layout();
      ctx.on(window, 'resize', layout);

      const reset = () => {
        center.className = 'slot is-center';
        center.textContent = '';
        slots.forEach((s) => { s.className = 'slot'; s.textContent = ''; s.disabled = true; });
      };
      const fixation = () => {
        reset();
        center.appendChild(h('span', { class: 'fix' }, '+'));
      };
      const mask = () => {
        center.textContent = '';
        center.classList.add('is-mask');
        slots.forEach((s) => { s.textContent = ''; s.classList.add('is-mask'); });
      };

      // Zobrazení na přesný počet snímků obrazovky (requestAnimationFrame).
      const flash = (c, k) => new Promise((resolve) => {
        ctx.frame((onset) => {
          center.textContent = c.e;
          slots[k].textContent = TARGET;
          if (L.distract) slots.forEach((s, i) => { if (i !== k) s.textContent = DISTRACT; });
          const check = (now) => {
            if (now - onset >= dur * SM.timeScale - 8) { mask(); resolve(now - onset); }
            else ctx.frame(check);
          };
          ctx.frame(check);
        });
      });

      const askCenter = () => new Promise((resolve) => {
        ctx.status('Kdo byl uprostřed?');
        CENTER.forEach((c) => {
          const b = h('button', { class: 'btn choice-btn', type: 'button' },
            h('span', { class: 'emo', 'aria-hidden': 'true' }, c.e), c.name);
          U.tap(b, () => { ctx.foot.textContent = ''; resolve(c); });
          ctx.foot.appendChild(b);
        });
      });

      const askPlace = () => new Promise((resolve) => {
        ctx.status('Klepněte, kde byla slunečnice.');
        slots.forEach((s) => { s.disabled = false; s.classList.add('is-choice'); });
        onSlot = (k) => {
          onSlot = null;
          slots.forEach((s) => { s.disabled = true; s.classList.remove('is-choice'); });
          resolve(k);
        };
      });

      for (let t = 0; t < TRIALS; t++) {
        ctx.progress('Úkol ' + (t + 1) + ' z ' + TRIALS);
        ctx.status('Dívejte se na křížek uprostřed.');
        fixation();
        await ctx.sleep(800 + Math.random() * 400);
        const c = U.pick(CENTER);
        const k = U.randInt(0, P - 1);
        center.textContent = '';
        await flash(c, k);
        await ctx.sleep(250);
        reset();
        const a1 = await askCenter();
        const a2 = await askPlace();
        const ok = a1 === c && a2 === k;

        center.textContent = c.e;
        slots[k].textContent = TARGET;
        slots[k].classList.add('is-correct');
        if (a2 !== k) slots[a2].classList.add('is-wrong');
        ctx.feedback(ok);
        if (ok) ctx.status('Správně!');
        else if (a1 !== c && a2 !== k) ctx.status('Uprostřed byla ' + c.name.toLowerCase() + ' a slunečnice byla tady.');
        else if (a1 !== c) ctx.status('Uprostřed byla ' + c.name.toLowerCase() + '.');
        else ctx.status('Slunečnice byla tady.');

        durs.push(dur);
        if (ok) {
          correct++;
          streak++;
          if (streak >= 2) { dur = Math.max(17, Math.round(dur * 0.8)); streak = 0; }
        } else {
          streak = 0;
          dur = Math.min(1000, Math.round(dur * 1.25));
        }
        await ctx.sleep(ok ? 1000 : 1800);
      }

      const thr = U.geomean(durs.slice(ctx.short ? -6 : -8));
      ctx.finish({
        perf: U.clamp(0.5 + Math.log2(L.start / thr), 0, 1),
        levelDelta: thr <= 0.75 * L.start ? 1 : thr >= 1.35 * L.start ? -1 : 0,
        big: U.num(thr / 1000, 2) + ' s',
        bigLabel: 'tak krátce vám stačilo obrázky vidět',
        details: ['Správně: ' + correct + ' z ' + TRIALS, 'Začátek: ' + U.num(L.start / 1000, 2) + ' s'],
        metric: { thr: Math.round(thr), correct: correct }
      });
    }
  });
})();
