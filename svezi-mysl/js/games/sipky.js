/* Šipky — řídit se prostřední šipkou a nenechat se zmást okolními (úloha typu flanker:
   výběrová pozornost, potlačení rušivé reakce, rychlé rozhodnutí). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const LEVELS = [
    { incong: 0.3, deadline: 0, jitter: false, n: 5 },
    { incong: 0.5, deadline: 0, jitter: false, n: 5 },
    { incong: 0.5, deadline: 2500, jitter: false, n: 5 },
    { incong: 0.5, deadline: 2000, jitter: false, n: 5 },
    { incong: 0.6, deadline: 1600, jitter: true, n: 5 },
    { incong: 0.6, deadline: 1300, jitter: true, n: 5 },
    { incong: 0.6, deadline: 1100, jitter: true, n: 7 },
    { incong: 0.7, deadline: 900, jitter: true, n: 7 }
  ];

  SM.registerGame({
    id: 'sipky',
    name: 'Šipky',
    domain: 'rozhodovani',
    trains: 'soustředění a rychlé rozhodování, když vás něco plete',
    short: 'Řiďte se jen prostřední šipkou.',
    duration: 'asi 1 až 2 minuty',
    pace: { per: 'na reakci' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Uprostřed obrazovky se objeví řada šipek.',
        'Důležitá je jen ta prostřední. Ukazuje doleva, nebo doprava?',
        'Klepněte na velké tlačítko se stejným směrem. Okolní šipky vás budou zkoušet splést.'
      ];
      if (L.deadline) steps.push('Na odpověď máte ' + U.num(L.deadline / 1000, 1) + ' s. Snažte se být rychlí, ale přesní.');
      else steps.push('Odpovídejte rychle, ale hlavně správně.');
      return steps;
    },

    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const TRIALS = ctx.short ? 14 : 24;
      const field = h('div', { class: 'arrow-field' });
      ctx.stage.appendChild(field);
      let answer = null;

      const mkBtn = (dir) => {
        const b = h('button', { class: 'btn btn-secondary dir-btn' + (dir < 0 ? ' is-left' : ''), type: 'button', 'aria-label': dir < 0 ? 'Doleva' : 'Doprava' },
          U.svg(SM.icons.arrowRight), dir < 0 ? 'Doleva' : 'Doprava');
        U.tap(b, () => { if (answer) answer(dir); });
        return b;
      };
      ctx.foot.appendChild(mkBtn(-1));
      ctx.foot.appendChild(mkBtn(1));
      ctx.on(window, 'keydown', (e) => {
        if (!answer) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); answer(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); answer(1); }
      });

      const arrowW = () => {
        const sz = ctx.size();
        return Math.floor(U.clamp(sz.w / (L.n + (L.n - 1) * 0.16 + 0.6), 36, 92));
      };

      const order = U.shuffle(Array.from({ length: TRIALS }, (_, i) => i < Math.round(TRIALS * L.incong)));
      let correct = 0, slow = 0;
      const rtsC = [], rtsI = [];
      ctx.status('Kam ukazuje prostřední šipka?');

      for (let t = 0; t < TRIALS; t++) {
        ctx.progress((t + 1) + ' / ' + TRIALS);
        field.textContent = '';
        field.appendChild(h('div', { class: 'fixation', 'aria-hidden': 'true' }, '+'));
        await ctx.sleep(500 + Math.random() * 400);

        const dir = Math.random() < 0.5 ? -1 : 1;
        const incong = order[t];
        const aw = arrowW();
        const row = h('div', { class: 'arrows', role: 'img', 'aria-label': 'Prostřední šipka ukazuje ' + (dir < 0 ? 'doleva' : 'doprava'), style: { '--aw': aw + 'px' } });
        const mid = Math.floor(L.n / 2);
        for (let i = 0; i < L.n; i++) {
          const d = i === mid ? dir : incong ? -dir : dir;
          const svg = U.svg('<svg viewBox="0 0 64 40"><path d="M4 15h34V4l22 16-22 16V25H4z"/></svg>', 'arrow' + (d < 0 ? ' is-left' : ''));
          row.appendChild(svg);
        }
        if (L.jitter) {
          row.style.left = (50 + (Math.random() * 2 - 1) * 6) + '%';
          row.style.top = (50 + (Math.random() * 2 - 1) * 22) + '%';
        }
        field.textContent = '';
        field.appendChild(row);

        const res = await new Promise((resolve) => {
          let start = 0;
          let timer = null;
          ctx.frame((ts) => { start = ts; });
          answer = (d) => {
            answer = null;
            if (timer) ctx.cancel(timer);
            resolve({ d: d, rt: performance.now() - (start || performance.now()) });
          };
          if (L.deadline) {
            timer = ctx.after(L.deadline, () => {
              if (!answer) return;
              answer = null;
              resolve({ d: 0, rt: L.deadline });
            });
          }
        });

        const ok = res.d === dir;
        if (ok) {
          correct++;
          (incong ? rtsI : rtsC).push(res.rt / SM.timeScale);
        }
        if (res.d === 0) {
          slow++;
          ctx.status('Příště o něco rychleji.');
          ctx.sound.wrong();
        } else if (!ok) {
          ctx.status('Pozor, platí jen prostřední šipka.');
        } else {
          ctx.status('Kam ukazuje prostřední šipka?');
        }
        if (res.d !== 0) ctx.feedback(ok);
        await ctx.sleep(ok ? 450 : 1100);
        if (!ok) ctx.status('Kam ukazuje prostřední šipka?');
      }

      const acc = correct / TRIALS;
      const all = rtsC.concat(rtsI);
      const meanRT = all.length ? U.mean(all) : 0;
      const speed = all.length ? U.clamp((1800 - meanRT) / 1200, 0, 1) : 0;
      const details = ['Průměrná reakce: ' + (all.length ? U.num(meanRT / 1000, 2) + ' s' : '–')];
      if (rtsC.length >= 3 && rtsI.length >= 3) {
        const diff = U.mean(rtsI) - U.mean(rtsC);
        details.push('Matoucí šipky vás zdržely o ' + U.num(Math.max(0, diff) / 1000, 2) + ' s');
      }
      if (slow) details.push('Pozdě: ' + slow + '×');
      ctx.finish({
        perf: 0.7 * U.clamp((acc - 0.5) / 0.5, 0, 1) + 0.3 * speed,
        acc: acc, rt: all.length ? meanRT : null,
        levelDelta: acc >= 0.9 ? 1 : acc < 0.7 ? -1 : 0,
        big: correct + ' z ' + TRIALS,
        bigLabel: 'správných odpovědí',
        details: details,
        metric: { acc: Math.round(acc * 100), rt: Math.round(meanRT) }
      });
    }
  });
})();
