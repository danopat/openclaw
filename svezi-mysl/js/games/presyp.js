/* Přesýpací hodiny — dvoje přesýpací hodiny a úkol odměřit přesně zadaný čas (plánování, práce s časem).
   Obě hodiny se pustí naráz. Když některé doběhnou, smí se otočit kterékoli z nich. Čas běží zrychleně
   vždy do chvíle, kdy zase některé doběhnou. Řešič vybírá úlohy podle počtu potřebných otočení. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const PAIRS = [[3, 5], [4, 7], [5, 8], [4, 9], [5, 9], [7, 11], [6, 11], [5, 13], [7, 9], [3, 7], [5, 7]];
  /* flips = kolik otočení potřebuje nejkratší řešení */
  const LEVELS = [{ flips: [1, 1] }, { flips: [2, 2] }, { flips: [3, 3] }, { flips: [3, 5] }];
  const MAXT = 30;

  /* Do další chvíle, kdy některé hodiny doběhnou: { t, a, b } nebo null, když obě stojí. */
  function advance(s) {
    const run = [s.a, s.b].filter((x) => x > 0);
    if (!run.length) return null;
    const dt = Math.min.apply(null, run);
    return { t: s.t + dt, a: Math.max(0, s.a - dt), b: Math.max(0, s.b - dt) };
  }
  const flip = (s, f, C) => ({ t: s.t, a: f.indexOf('A') !== -1 ? C[0] - s.a : s.a, b: f.indexOf('B') !== -1 ? C[1] - s.b : s.b });
  const CHOICES = ['', 'A', 'B', 'AB'];
  /* Nejméně otočení, jak z pozice s (těsně po doběhnutí, ještě před otočením) dojít přesně na čas T. Vrací plán [volby] nebo null. */
  function plan(C, s, T) {
    const key = (q) => q.t + ':' + q.a + ':' + q.b;
    const seen = {};
    // prohledávání po vrstvách podle počtu otočení (0-1 BFS přes setřídění)
    const queue = [{ s: s, flips: 0, path: [] }];
    while (queue.length) {
      queue.sort((x, y) => x.flips - y.flips);
      const cur = queue.shift();
      const k = key(cur.s);
      if (seen[k] != null && seen[k] <= cur.flips) continue;
      seen[k] = cur.flips;
      for (const f of CHOICES) {
        const nx = advance(flip(cur.s, f, C));
        if (!nx || nx.t > T) continue;
        const item = { s: nx, flips: cur.flips + f.length, path: cur.path.concat([f]) };
        if (nx.t === T) return item;
        queue.push(item);
      }
    }
    return null;
  }
  function makePuzzle(L) {
    for (let t = 0; t < 300; t++) {
      const C = U.pick(PAIRS).slice();
      if (Math.random() < 0.5) C.reverse();
      // start: obě hodiny se pustí naráz, první doběhnutí je výchozí pozice
      const s0 = advance({ t: 0, a: C[0], b: C[1] });
      const opts = [];
      for (let T = Math.min(C[0], C[1]) + 1; T <= MAXT; T++) {
        if (T === C[0] || T === C[1]) continue;
        const p = plan(C, s0, T);
        if (p && p.flips >= L.flips[0] && p.flips <= L.flips[1]) opts.push({ T: T, p: p });
      }
      if (!opts.length) continue;
      const o = U.pick(opts);
      return { C: C, T: o.T, plan: o.p.path, flips: o.p.flips };
    }
    return null;
  }

  SM.registerGame({
    id: 'presyp',
    name: 'Přesýpací hodiny',
    domain: 'rozhodovani',
    trains: 'plánování a práci s časem',
    short: 'Odměřte přesný čas dvěma přesýpacími hodinami.',
    duration: 'asi 3 minuty',
    pace: { per: 'na úlohu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jedna úloha dané úrovně (pro kontrolu generátoru). */
    gen(level) { return makePuzzle(LEVELS[level - 1]); },
    howTo() {
      return ['Máte dvoje přesýpací hodiny a potřebujete odměřit přesně zadaný čas, třeba aby vajíčko bylo uvařené.',
        'Obě hodiny se pustí naráz. Čas pak běží zrychleně, vždy než některé hodiny doběhnou.',
        'V té chvíli můžete otočit kterékoli hodiny (i ty, kterým ještě písek teče) a pustit čas dál.',
        'Vyhráli jste, když některé hodiny doběhnou přesně v zadaném čase. Když by čas přeskočil, zkuste to znovu.'];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : 2;
      let restarts = 0, hints = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Úloha ' + (i + 1) + ' z ' + N);
        const r = await one(makePuzzle(ctx.short ? LEVELS[Math.min(1, ctx.level - 1)] : L));
        restarts += r.restarts; hints += r.hints;
      }
      const perf = U.clamp(1 - 0.15 * restarts / N - 0.1 * hints / N, 0, 1);
      const details = [];
      if (restarts) details.push('Začátek znovu: ' + restarts + '×');
      if (hints) details.push('Nápověda: ' + hints + '×');
      ctx.finish({
        perf: perf, acc: perf,
        levelDelta: K.levelByAcc(perf, 0.85, 0.5),
        big: N + ' z ' + N, bigLabel: N === 1 ? 'čas odměřený přesně' : 'časy odměřené přesně',
        details: details, metric: { restarts: restarts, hints: hints }
      });

      /* Přesýpací hodiny jako SVG: písek nahoře podle zbývajícího času, dole podle uplynulého. */
      function glassSvg(top, cap) {
        const f = cap ? top / cap : 0, g = 1 - f;
        const yTop = 12 + 38 * (1 - f); // hladina nahoře
        const yBot = 88 - 34 * g; // hladina dole
        return '<svg viewBox="0 0 60 100" aria-hidden="true" focusable="false">' +
          '<rect x="6" y="2" width="48" height="8" rx="3" class="ps-wood"/><rect x="6" y="90" width="48" height="8" rx="3" class="ps-wood"/>' +
          '<path d="M12 10h36c0 22-14 30-16 40 2 10 16 18 16 40H12c0-22 14-30 16-40-2-10-16-18-16-40z" class="ps-glass"/>' +
          (f > 0 ? '<path d="M' + (12 + (yTop - 10) * 0.42) + ' ' + yTop.toFixed(1) + 'H' + (48 - (yTop - 10) * 0.42) + 'L31 49h-2z" class="ps-sand"/>' : '') +
          (g > 0 ? '<path d="M' + (12 + (90 - yBot) * 0.02) + ' 90H48L' + (48 - (90 - yBot) * 0.42) + ' ' + yBot.toFixed(1) + 'H' + (12 + (90 - yBot) * 0.42) + 'z" class="ps-sand"/>' : '') +
          (f > 0 ? '<path d="M30 50V' + yBot.toFixed(1) + '" class="ps-stream"/>' : '') + '</svg>';
      }

      async function one(P) {
        ctx.clear();
        const C = P.C;
        let s = advance({ t: 0, a: C[0], b: C[1] }); // obě se pustí naráz; první zastávka = první doběhnutí
        let restarts = 0, hintsHere = 0;
        const t0 = performance.now();
        const pending = { A: false, B: false };
        const clock = h('div', { class: 'ps-clock' });
        const goal = h('p', { class: 'ps-goal' }, 'Cíl: ' + P.T + ' min');
        const glasses = ['A', 'B'].map((id, i) => {
          const pic = h('div', { class: 'ps-pic' });
          const info = h('span', { class: 'ps-left' });
          const btn = h('button', { class: 'btn btn-secondary ps-flip', type: 'button', 'aria-pressed': 'false', 'data-g': id }, 'Otočit ' + C[i]);
          const wrap = h('div', { class: 'ps-glasswrap' }, h('strong', { class: 'ps-cap' }, C[i] + ' min'), pic, info, btn);
          return { id: id, i: i, pic: pic, info: info, btn: btn, wrap: wrap };
        });
        const box = h('div', { class: 'stack presyp', 'data-plan': P.plan.join('|'), 'data-step': '0' }, h('div', { class: 'ps-top' }, goal, clock), h('div', { class: 'ps-row' }, glasses.map((g) => g.wrap)));
        ctx.stage.appendChild(box);
        const go = h('button', { class: 'btn btn-primary btn-lg ps-go', type: 'button' }, 'Pustit čas ▶');
        const hintBtn = h('button', { class: 'btn btn-secondary btn-lg ps-hint', type: 'button' }, 'Nápověda');
        const again = h('button', { class: 'btn btn-secondary btn-lg ps-again', type: 'button', hidden: true }, 'Začít znovu');
        ctx.foot.appendChild(h('div', { class: 'ps-actions' }, hintBtn, go, again));
        let step = 0;
        const draw = () => {
          clock.textContent = 'Uplynulo ' + s.t + ' min';
          glasses.forEach((g) => {
            const top = g.i === 0 ? s.a : s.b;
            g.pic.innerHTML = glassSvg(top, C[g.i]);
            g.info.textContent = top > 0 ? 'nahoře ' + top + ' min' : 'doběhly';
            g.btn.setAttribute('aria-pressed', pending[g.id] ? 'true' : 'false');
            g.wrap.classList.toggle('is-flip', pending[g.id]);
          });
          box.dataset.step = step;
        };
        const say = () => {
          const out = glasses.filter((g) => (g.i === 0 ? s.a : s.b) === 0).map((g) => C[g.i] + ' min');
          ctx.status('Doběhly hodiny ' + out.join(' a ') + '.');
        };
        draw();
        say();
        // Malý displej s velkým písmem: hodiny se zmenší, aby byla vidět tlačítka Otočit.
        let over = box.scrollHeight - ctx.stage.clientHeight + 8;
        if (over > 0) { box.classList.add('is-tight'); over = box.scrollHeight - ctx.stage.clientHeight + 8; }
        if (over > 0) glasses.forEach((g) => { g.pic.style.height = Math.max(40, g.pic.offsetHeight - over) + 'px'; g.pic.style.width = 'auto'; });
        if (box.scrollHeight > ctx.stage.clientHeight + 4) box.style.maxHeight = ctx.stage.clientHeight + 'px'; // jinak se dá posunout
        return new Promise((resolve) => {
          let done = false, busy = false;
          glasses.forEach((g) => U.tap(g.btn, () => {
            if (done || busy) return;
            pending[g.id] = !pending[g.id];
            ctx.sound.tap();
            draw();
          }));
          U.tap(hintBtn, () => {
            if (done || busy) return;
            const p = plan(C, s, P.T);
            hintsHere++;
            ctx.sound.tap();
            if (!p) { ctx.status('Odtud už to nevyjde. Začněte znovu.'); go.hidden = true; again.hidden = false; return; }
            pending.A = p.path[0].indexOf('A') !== -1;
            pending.B = p.path[0].indexOf('B') !== -1;
            draw();
            ctx.status(p.path[0] ? 'Teď otočte ' + glasses.filter((g) => pending[g.id]).map((g) => 'hodiny ' + C[g.i] + ' min').join(' a ') + ' a pusťte čas.' : 'Teď nic neotáčejte, jen pusťte čas.');
          });
          U.tap(again, () => {
            if (done) return;
            restarts++;
            ctx.sound.tap();
            s = advance({ t: 0, a: C[0], b: C[1] });
            step = 0;
            pending.A = pending.B = false;
            again.hidden = true; go.hidden = false;
            draw(); say();
          });
          U.tap(go, async () => {
            if (done || busy) return;
            const f = (pending.A ? 'A' : '') + (pending.B ? 'B' : '');
            const flipped = flip(s, f, C);
            const nx = advance(flipped);
            if (!nx) { ctx.status('Obě hodiny stojí. Některé otočte.'); ctx.feedback(false, { silent: true }); return; }
            busy = true;
            box.dataset.busy = '1';
            pending.A = pending.B = false;
            step++;
            if (nx.t > P.T) {
              // čas by přeskočil cíl: ukázat to a nabídnout nový začátek
              s = { t: P.T, a: Math.max(0, flipped.a - (P.T - s.t)), b: Math.max(0, flipped.b - (P.T - s.t)) };
              draw();
              ctx.feedback(false);
              ctx.status('V ' + P.T + '. minutě žádné hodiny nedoběhly, přesný čas se nepoznal. Zkuste to jinak.');
              go.hidden = true; again.hidden = false;
              busy = false;
              delete box.dataset.busy;
              return;
            }
            // zrychlený čas: písek ubývá po minutách
            const from = flipped;
            const dt = nx.t - s.t;
            const steps = K.reducedMotion() ? 1 : Math.min(dt, 8);
            for (let k = 1; k <= steps; k++) {
              const used = Math.round(dt * k / steps);
              s = { t: from.t + used, a: Math.max(0, from.a - used), b: Math.max(0, from.b - used) };
              draw();
              await ctx.sleep(K.reducedMotion() ? 0 : 140);
            }
            s = nx;
            draw();
            busy = false;
            delete box.dataset.busy;
            if (s.t === P.T) {
              done = true;
              ctx.mark(true, (performance.now() - t0) / SM.timeScale);
              [go, hintBtn, again].concat(glasses.map((g) => g.btn)).forEach((b) => { b.disabled = true; });
              box.classList.add('is-done');
              ctx.feedback(true);
              ctx.status('Přesně ' + P.T + ' minut! Výborně.');
              await ctx.sleep(1500);
              resolve({ restarts: restarts, hints: hintsHere });
              return;
            }
            say();
          });
        });
      }
    }
  });
})();
