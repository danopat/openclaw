/* Popořadě — spojování čísel a písmen ve správném pořadí (obdoba testu cesty, Trail Making):
   prohledávání očima, rychlost a střídání dvou řad. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const LEVELS = [
    { n: 8, alt: false, hint: true },
    { n: 12, alt: false, hint: true },
    { n: 16, alt: false, hint: false },
    { n: 8, alt: true, hint: true },
    { n: 12, alt: true, hint: true },
    { n: 16, alt: true, hint: false },
    { n: 20, alt: true, hint: false },
    { n: 24, alt: true, hint: false }
  ];
  const LETTERS = 'ABCDEFGHIJKL';
  const STUCK_MS = 7000;

  function labels(L) {
    const out = [];
    for (let i = 0; i < L.n; i++) {
      if (!L.alt) out.push({ t: String(i + 1), letter: false });
      else if (i % 2 === 0) out.push({ t: String(i / 2 + 1), letter: false });
      else out.push({ t: LETTERS[(i - 1) / 2], letter: true });
    }
    return out;
  }

  SM.registerGame({
    id: 'poradi',
    name: 'Popořadě',
    domain: 'rozhodovani',
    trains: 'rychlé hledání očima a přepínání mezi dvěma řadami',
    short: 'Klepejte na čísla a písmena popořadě.',
    duration: 'asi 1 až 3 minuty',
    pace: { per: 'na políčko' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      if (!L.alt) {
        return [
          'Na obrazovce jsou rozházená kolečka s čísly.',
          'Klepejte na ně popořadě: 1, 2, 3 a tak dále. Spojí se čarou.',
          'Když se spletete, kolečko zčervená. Nic se neděje, hledejte dál.'
        ];
      }
      return [
        'Na obrazovce jsou kolečka s čísly a čtverečky s písmeny.',
        'Klepejte na ně a střídejte číslo a písmeno: 1, A, 2, B, 3, C a tak dále.',
        'Když se spletete, políčko zčervená. Nic se neděje, hledejte dál.'
      ];
    },

    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const BOARDS = ctx.short ? 1 : 2;
      const labs = labels(L);
      let errors = 0, hints = 0, totalMs = 0;

      for (let b = 0; b < BOARDS; b++) {
        ctx.progress('Kolo ' + (b + 1) + ' z ' + BOARDS);
        const res = await board(b);
        errors += res.errors;
        hints += res.hints;
        totalMs += res.ms;
        ctx.feedback(true);
        ctx.status('Hotovo! Čas: ' + U.fmtTime(res.ms) + '.');
        await ctx.sleep(1400);
      }

      const items = L.n * BOARDS;
      const perItem = totalMs / items / 1000;
      const fast = L.alt ? 1.8 : 1.1;
      const slowT = L.alt ? 5 : 3.2;
      const good = L.alt ? 2.4 : 1.5;
      ctx.finish({
        perf: U.clamp(1 - (perItem - fast) / (slowT - fast), 0, 1) * (1 - Math.min(0.4, errors * 0.04)),
        acc: items / (items + errors), rt: perItem * 1000,
        levelDelta: perItem <= good && errors <= 2 && hints === 0 ? 1 : perItem >= slowT || errors >= 6 ? -1 : 0,
        big: U.fmtTime(totalMs),
        bigLabel: BOARDS === 1 ? 'celkový čas' : 'celkový čas za ' + BOARDS + ' kola',
        details: ['Na jedno políčko: ' + U.num(perItem, 1) + ' s', 'Chyby: ' + errors].concat(hints ? ['Nápověda: ' + hints + '×'] : []),
        metric: { perItem: Math.round(perItem * 100) / 100, errors: errors }
      });

      function place(n, W, H) {
        // Rozhozená mřížka: každé políčko ve své buňce, s náhodným posunem → nic se nepřekrývá.
        const aspect = W / Math.max(H, 1);
        let cols = Math.max(2, Math.round(Math.sqrt(n * 1.35 * aspect)));
        let rows = Math.ceil((n * 1.35) / cols);
        while (cols * rows < n) rows++;
        const cells = U.sample(Array.from({ length: cols * rows }, (_, i) => i), n);
        return cells.map((c) => {
          const cx = c % cols, cy = Math.floor(c / cols);
          return {
            x: (cx + 0.5 + (Math.random() - 0.5) * 0.3) / cols,
            y: (cy + 0.5 + (Math.random() - 0.5) * 0.3) / rows,
            cols: cols, rows: rows
          };
        });
      }

      function board() {
        return new Promise((resolve) => {
          ctx.stage.textContent = '';
          const sz = ctx.size();
          const pos = place(L.n, sz.w, sz.h);
          const wrap = h('div', { class: 'trail' });
          const ns = 'http://www.w3.org/2000/svg';
          const svg = document.createElementNS(ns, 'svg');
          svg.setAttribute('class', 'trail-lines');
          svg.setAttribute('aria-hidden', 'true');
          wrap.appendChild(svg);
          let next = 0, errs = 0, hintCount = 0, start = 0, stuckTimer = null, finished = false;
          const dots = [];

          const size = () => {
            const s = ctx.size();
            const cw = s.w / pos[0].cols, ch = s.h / pos[0].rows;
            const d = Math.floor(U.clamp(Math.min(cw, ch) * 0.62, 44, 84));
            wrap.style.setProperty('--d', d + 'px');
            svg.setAttribute('viewBox', '0 0 ' + s.w + ' ' + s.h);
            Array.prototype.forEach.call(svg.querySelectorAll('line'), (ln) => {
              const a = +ln.getAttribute('data-a'), b = +ln.getAttribute('data-b');
              ln.setAttribute('x1', pos[a].x * s.w); ln.setAttribute('y1', pos[a].y * s.h);
              ln.setAttribute('x2', pos[b].x * s.w); ln.setAttribute('y2', pos[b].y * s.h);
            });
          };
          const line = (a, b) => {
            const ln = document.createElementNS(ns, 'line');
            ln.setAttribute('data-a', a);
            ln.setAttribute('data-b', b);
            svg.appendChild(ln);
            size();
          };
          const armStuck = () => {
            if (stuckTimer) ctx.cancel(stuckTimer);
            stuckTimer = ctx.after(STUCK_MS, () => {
              if (finished || !dots[next]) return;
              dots[next].classList.add('is-hint');
              hintCount++;
            });
          };
          const showNext = () => {
            if (L.hint) ctx.status('Další: ' + labs[next].t);
            else ctx.status(L.alt ? 'Střídejte: 1 → A → 2 → B …' : 'Popořadě: 1 → 2 → 3 …');
          };

          labs.forEach((lab, i) => {
            const d = h('button', {
              class: 'dot' + (lab.letter ? ' is-letter' : ''), type: 'button', 'aria-label': lab.t,
              style: { left: (pos[i].x * 100).toFixed(2) + '%', top: (pos[i].y * 100).toFixed(2) + '%' }
            }, lab.t);
            U.tap(d, () => {
              if (finished || d.classList.contains('is-done')) return;
              if (i === next) {
                d.classList.remove('is-hint', 'is-wrong');
                d.classList.add('is-done');
                if (i > 0) line(i - 1, i);
                ctx.sound.tap();
                next++;
                if (next === labs.length) {
                  finished = true;
                  if (stuckTimer) ctx.cancel(stuckTimer);
                  resolve({ ms: (performance.now() - start) / SM.timeScale, errors: errs, hints: hintCount });
                  return;
                }
                showNext();
                armStuck();
              } else {
                errs++;
                d.classList.remove('is-wrong');
                void d.offsetWidth;
                d.classList.add('is-wrong');
                ctx.sound.wrong();
                ctx.after(700, () => d.classList.remove('is-wrong'));
              }
            });
            dots.push(d);
            wrap.appendChild(d);
          });
          ctx.stage.appendChild(wrap);
          size();
          ctx.on(window, 'resize', size);
          showNext();
          start = performance.now();
          armStuck();
        });
      }
    }
  });
})();
