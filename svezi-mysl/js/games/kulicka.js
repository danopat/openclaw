/* Kde je kulička? — sledovat hrnek s kuličkou, zatímco se hrnky prohazují (pozornost a sledování pohybu). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* cups = počet hrnků, swaps = počet prohození, start = doba jednoho prohození v ms (zrychluje se podle úspěchu),
     near = prohazují se jen sousední hrnky, balls = počet kuliček. */
  const LEVELS = [
    { cups: 3, swaps: 3, start: 1000, near: true },
    { cups: 3, swaps: 5, start: 850, near: true },
    { cups: 4, swaps: 5, start: 800 },
    { cups: 4, swaps: 7, start: 700 },
    { cups: 5, swaps: 8, start: 650 },
    { cups: 4, swaps: 6, start: 800, balls: 2 }
  ];
  const MIN = 220;
  const MAX = 1500;
  /* Hliněný hrnek dnem vzhůru, s uchem. */
  const CUP = '<svg viewBox="0 0 100 90" aria-hidden="true" focusable="false">' +
    '<path class="cup-handle" d="M78 20c15 1 17 27 3 31"/>' +
    '<path class="cup-shape" d="M30 5h40a7 7 0 0 1 7 6l11 63H12l11-63a7 7 0 0 1 7-6z"/>' +
    '<path class="cup-shine" d="M31 15 24 62"/><rect class="cup-rim" x="5" y="71" width="90" height="14" rx="7"/></svg>';

  SM.registerGame({
    id: 'kulicka',
    name: 'Kde je kulička?',
    domain: 'postreh',
    trains: 'sledování pohybu a vytrvalou pozornost',
    short: 'Uhlídejte hrnek s kuličkou.',
    duration: 'asi 2 minuty',
    pace: { title: 'Doba prohození', short: 'Doba', ms: true }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const two = L.balls === 2;
      return [
        two ? 'Pod dvěma hrnky jsou kuličky. Na začátku je uvidíte.' : 'Pod jedním hrnkem je kulička. Na začátku ji uvidíte.',
        'Potom se hrnky několikrát prohodí. Sledujte ' + (two ? 'oba hrnky s kuličkou.' : 'hrnek s kuličkou.'),
        two ? 'Nakonec klepněte na oba hrnky, pod kterými kuličky jsou.' : 'Nakonec klepněte na hrnek, pod kterým kulička je.',
        'Když se daří, hrnky se míchají rychleji.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 5 : 8;
      const reduced = K.reducedMotion();
      let dur = L.start;
      let streak = 0;
      const durs = [];
      const scores = [];
      for (let r = 0; r < N; r++) {
        ctx.progress((r + 1) + ' / ' + N);
        durs.push(dur);
        const s = await round(L, dur);
        scores.push(s);
        if (s === 1) {
          streak++;
          if (streak >= 2) { dur = Math.max(MIN, Math.round(dur * 0.85)); streak = 0; }
        } else {
          streak = 0;
          if (s === 0) dur = Math.min(MAX, Math.round(dur * 1.25));
        }
      }
      const acc = U.mean(scores);
      const ok = scores.filter((x) => x === 1).length;
      const end = U.geomean(durs.slice(-4));
      ctx.finish({
        perf: acc, acc: acc, rt: end,
        levelDelta: acc >= 0.85 ? 1 : acc < 0.5 ? -1 : 0,
        big: ok + ' z ' + N, bigLabel: 'uhlídaných kol',
        details: ['Nejrychlejší míchání: ' + U.num(Math.min.apply(null, durs) / 1000, 2) + ' s na jedno prohození'],
        metric: { acc: Math.round(acc * 100), dur: Math.round(end) }
      });

      /* Jedno kolo. Vrací 1 (vše správně), 0,5 (u dvou kuliček jedna správně) nebo 0. */
      async function round(L, d) {
        const n = L.cups;
        const balls = L.balls || 1;
        ctx.clear();
        const box = h('div', { class: 'cups', style: { '--n': n }, 'data-state': 'show' }, h('span', { class: 'cups-table', 'aria-hidden': 'true' }));
        const pos = []; // pos[c] = na kterém místě zleva stojí hrnek c
        const cups = [];
        const ballCups = U.sample(Array.from({ length: n }, (_, i) => i), balls);
        const place = (c) => { cups[c].style.transform = 'translate(' + pos[c] * 100 + '%, 0)'; };
        for (let c = 0; c < n; c++) {
          pos.push(c);
          const b = h('button', { class: 'cup', type: 'button', disabled: true, 'data-cup': c });
          if (ballCups.indexOf(c) !== -1) b.appendChild(h('span', { class: 'cup-ball', 'aria-hidden': 'true' }));
          const body = h('span', { class: 'cup-body' });
          body.innerHTML = CUP;
          b.appendChild(body);
          cups.push(b);
          box.appendChild(b);
          place(c);
        }
        ctx.stage.appendChild(box);

        // Ukázat kuličky, pak přiklopit.
        ctx.status(balls === 2 ? 'Zapamatujte si, kde jsou kuličky.' : 'Zapamatujte si, kde je kulička.');
        await ctx.sleep(450);
        ballCups.forEach((c) => cups[c].classList.add('is-up'));
        await ctx.sleep(1500);
        ballCups.forEach((c) => cups[c].classList.remove('is-up'));
        await ctx.sleep(650);

        // Míchání.
        ctx.status('Sledujte ' + (balls === 2 ? 'kuličky.' : 'kuličku.'));
        box.setAttribute('data-state', 'mix');
        let last = '';
        for (let s = 0; s < L.swaps; s++) {
          let a, b;
          for (let t = 0; t < 20; t++) {
            const ballPos = pos[U.pick(ballCups)];
            if (L.near) {
              a = U.randInt(0, n - 2);
              b = a + 1;
              if (Math.random() < 0.6 && ballPos > 0 && ballPos < n - 1) { a = ballPos; b = ballPos + (Math.random() < 0.5 ? -1 : 1); }
            } else {
              a = U.randInt(0, n - 1);
              b = U.randInt(0, n - 2);
              if (b >= a) b++;
              if (Math.random() < 0.5) a = ballPos;
              if (b === a) b = (a + 1) % n;
            }
            const key = Math.min(a, b) + '-' + Math.max(a, b);
            if (key !== last) { last = key; break; }
          }
          const ca = pos.indexOf(a);
          const cb = pos.indexOf(b);
          await swap(ca, cb, d);
          await ctx.sleep(90);
        }

        // Volba.
        box.setAttribute('data-state', 'pick');
        ctx.status(balls === 2 ? 'Pod kterými dvěma hrnky jsou kuličky?' : 'Pod kterým hrnkem je kulička?');
        cups.forEach((b, c) => { b.disabled = false; b.setAttribute('aria-label', 'Hrnek ' + (pos[c] + 1) + '. zleva'); });
        const picked = await new Promise((resolve) => {
          const sel = [];
          cups.forEach((b, c) => U.tap(b, () => {
            if (b.disabled || sel.indexOf(c) !== -1) return;
            sel.push(c);
            b.classList.add('is-picked');
            b.disabled = true;
            ctx.sound.tap();
            if (sel.length === balls) resolve(sel);
          }));
        });
        box.setAttribute('data-state', 'done');
        cups.forEach((b) => { b.disabled = true; });
        const good = picked.filter((c) => ballCups.indexOf(c) !== -1).length;
        cups.forEach((b, c) => { if (picked.indexOf(c) !== -1 || ballCups.indexOf(c) !== -1) b.classList.add('is-up'); });
        ballCups.forEach((c) => cups[c].classList.add('is-ball'));
        const score = good / balls;
        ctx.feedback(score === 1);
        ctx.status(score === 1 ? 'Správně!' : score > 0 ? 'Jedna kulička správně, druhá byla jinde.' : 'Kulička byla jinde. Nevadí, jdeme dál.');
        await ctx.sleep(score === 1 ? 1300 : 2200);
        return score;

        /* Prohození dvou hrnků po obloucích. */
        function swap(ca, cb, ms) {
          const pa = pos[ca];
          const pb = pos[cb];
          pos[ca] = pb;
          pos[cb] = pa;
          if (reduced || !cups[ca].animate) {
            cups[ca].classList.add('is-swapping');
            cups[cb].classList.add('is-swapping');
            return ctx.sleep(ms / 2).then(() => {
              place(ca);
              place(cb);
              cups[ca].classList.remove('is-swapping');
              cups[cb].classList.remove('is-swapping');
              return ctx.sleep(ms / 2);
            });
          }
          const kf = (from, to, lift) => [
            { transform: 'translate(' + from * 100 + '%, 0)' },
            { transform: 'translate(' + (from + to) * 50 + '%, ' + lift + 'px)' },
            { transform: 'translate(' + to * 100 + '%, 0)' }
          ];
          const time = ms * SM.timeScale;
          place(ca);
          place(cb);
          cups[ca].animate(kf(pa, pb, -16), { duration: time, easing: 'ease-in-out' });
          cups[cb].animate(kf(pb, pa, 16), { duration: time, easing: 'ease-in-out' });
          return ctx.sleep(ms);
        }
      }
    }
  });
})();
