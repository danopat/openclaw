/* Přelévání — přeléváním mezi nádobami odměřit zadané množství vody (plánování několik kroků dopředu). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* steps = délka nejkratšího řešení (od–do), tasks = úloh ve hře. */
  const LEVELS = [
    { steps: [2, 2], tasks: 3 },
    { steps: [3, 3], tasks: 3 },
    { steps: [4, 5], tasks: 2 },
    { steps: [6, 9], tasks: 2 }
  ];

  const key = (s) => s.join(',');
  /* Přelití z nádoby i do j. */
  function pour(s, cap, i, j) {
    const t = s.slice();
    const amount = Math.min(t[i], cap[j] - t[j]);
    t[i] -= amount;
    t[j] += amount;
    return { s: t, amount: amount };
  }
  /* Prohledávání do šířky: nejkratší cesta k množství goal (v kterékoli nádobě). Vrací pole tahů [i, j], nebo null. */
  function solve(start, cap, goal) {
    const prev = {};
    prev[key(start)] = null;
    const q = [start];
    while (q.length) {
      const s = q.shift();
      if (s.indexOf(goal) !== -1) {
        const path = [];
        let k = key(s);
        while (prev[k]) { path.unshift(prev[k].move); k = prev[k].from; }
        return path;
      }
      for (let i = 0; i < cap.length; i++) {
        for (let j = 0; j < cap.length; j++) {
          if (i === j || !s[i] || s[j] === cap[j]) continue;
          const t = pour(s, cap, i, j).s;
          if (!(key(t) in prev)) { prev[key(t)] = { from: key(s), move: [i, j] }; q.push(t); }
        }
      }
    }
    return null;
  }

  function makeTask(L) {
    for (let t = 0; t < 500; t++) {
      const a = U.randInt(6, 12);
      const b = U.randInt(3, a - 1);
      const c = U.randInt(2, b - 1);
      const cap = [a, b, c];
      const start = [a, 0, 0];
      const goals = U.shuffle(Array.from({ length: a - 1 }, (_, i) => i + 1)).filter((g) => g !== b && g !== c);
      for (const g of goals) {
        const p = solve(start, cap, g);
        if (p && p.length >= L.steps[0] && p.length <= L.steps[1]) return { cap: cap, start: start, goal: g, best: p.length };
      }
    }
    return { cap: [8, 5, 3], start: [8, 0, 0], goal: 4, best: 6 };
  }

  SM.registerGame({
    id: 'prelevani',
    name: 'Přelévání',
    domain: 'rozhodovani',
    trains: 'plánování několika kroků dopředu',
    short: 'Přeléváním odměřte zadané množství vody.',
    duration: 'asi 2 až 3 minuty',
    pace: { per: 'na úlohu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo() {
      return [
        'Máte tři nádoby. Na každé je napsáno, kolik se do ní vejde. Největší je plná vody.',
        'Klepněte na nádobu, ze které chcete lít, a pak na tu, do které. Voda teče, dokud se druhá nádoba nenaplní nebo první nevyprázdní.',
        'Cílem je mít v některé nádobě přesně zadané množství. Zkuste to na co nejméně přelití. Pomůže „Zpět“ i „Nápověda“.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : L.tasks;
      const scores = [];
      for (let i = 0; i < N; i++) {
        ctx.progress(N > 1 ? 'Úloha ' + (i + 1) + ' z ' + N : '');
        scores.push(await play(makeTask(L)));
      }
      const acc = U.mean(scores);
      const ok = scores.filter((s) => s >= 0.99).length;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.45),
        big: ok + ' z ' + N, bigLabel: N > 1 ? 'úloh nejkratší cestou' : 'úloha nejkratší cestou',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      /* Jedna úloha. Vrací hodnocení 0–1 (nejkratší cesta = 1). */
      function play(task) {
        return new Promise((resolve) => {
          const cap = task.cap;
          let st = task.start.slice();
          const hist = [];
          let sel = -1, moves = 0, hints = 0, done = false;
          const t0 = performance.now();
          ctx.clear();
          ctx.status('Odměřte ' + task.goal + ' l. Klepněte, odkud lít, a pak kam.');
          const goalEl = h('p', { class: 'terc-goal' }, h('span', null, 'Cíl'), h('b', null, task.goal + ' l'));
          const row = h('div', { class: 'vessels' });
          const maxCap = Math.max.apply(null, cap);
          const els = cap.map((c, i) => {
            const water = h('span', { class: 'v-water' });
            const b = h('button', { class: 'vessel', type: 'button', 'data-i': i, style: { '--fill': '0', '--hgt': (0.45 + 0.55 * c / maxCap).toFixed(3) } },
              h('span', { class: 'v-glass' }, water, h('span', { class: 'v-cap', 'aria-hidden': 'true' }, c + ' l')),
              h('span', { class: 'v-num' }, ''));
            U.tap(b, () => tap(i));
            row.appendChild(b);
            return b;
          });
          const back = h('button', { class: 'btn btn-secondary btn-small', type: 'button', disabled: true }, 'Zpět');
          const hintBtn = h('button', { class: 'btn btn-secondary btn-small', type: 'button' }, 'Nápověda');
          U.tap(back, undo);
          U.tap(hintBtn, hint);
          ctx.foot.appendChild(back);
          ctx.foot.appendChild(hintBtn);
          const box = h('div', { class: 'stack prelevani', 'data-cap': cap.join(','), 'data-goal': task.goal, 'data-best': task.best }, goalEl, row);
          ctx.stage.appendChild(box);
          const sz = ctx.size();
          const vh = Math.floor(U.clamp(sz.h - goalEl.offsetHeight - 110, 120, 300));
          row.style.setProperty('--vh', vh + 'px');
          paint();
          // Když se nádoby s popisky nevejdou (malý displej, velké písmo), nejvyšší se sníží o to, co přečnívá.
          const over = K.overflow(box);
          if (over > 0) row.style.setProperty('--vh', Math.max(100, vh - over) + 'px');

          function paint() {
            els.forEach((b, i) => {
              b.style.setProperty('--fill', (st[i] / cap[i]).toFixed(3));
              const num = b.querySelector('.v-num');
              num.textContent = '';
              num.appendChild(h('b', null, st[i] + ' l'));
              num.appendChild(h('small', null, 'z ' + cap[i] + ' l'));
              b.setAttribute('aria-label', 'Nádoba na ' + cap[i] + ' litrů, v ní ' + st[i] + ' l');
              b.classList.toggle('is-sel', i === sel);
              b.classList.toggle('is-goal', st[i] === task.goal);
            });
            box.dataset.state = st.join(',');
            back.disabled = !hist.length || done;
          }
          function clearHint() { els.forEach((b) => b.classList.remove('is-from', 'is-to')); }
          function tap(i) {
            if (done || !ctx.alive) return;
            if (sel < 0) {
              if (!st[i]) { ctx.status('Tahle nádoba je prázdná, z ní lít nejde.'); return; }
              sel = i;
              ctx.sound.tap();
              ctx.status('Kam to přelít?');
              paint();
              return;
            }
            if (i === sel) { sel = -1; ctx.status('Klepněte, odkud lít, a pak kam.'); paint(); return; }
            if (st[i] === cap[i]) { ctx.status('Tahle nádoba je už plná.'); return; }
            const r = pour(st, cap, sel, i);
            hist.push(st);
            st = r.s;
            moves++;
            sel = -1;
            clearHint();
            ctx.sound.tap();
            ctx.status('Přelito ' + r.amount + ' l.');
            paint();
            if (st.indexOf(task.goal) !== -1) finish();
          }
          function undo() {
            if (done || !hist.length) return;
            st = hist.pop();
            moves++; // i krok zpět se počítá
            sel = -1;
            clearHint();
            ctx.sound.tap();
            ctx.status('Vráceno o krok zpět.');
            paint();
          }
          function hint() {
            if (done || !ctx.alive) return;
            const p = solve(st, cap, task.goal);
            if (!p || !p.length) return;
            hints++;
            sel = -1;
            clearHint();
            els[p[0][0]].classList.add('is-from');
            els[p[0][1]].classList.add('is-to');
            paint();
            ctx.status('Nápověda: přelijte z nádoby na ' + cap[p[0][0]] + ' l do nádoby na ' + cap[p[0][1]] + ' l.');
          }
          function finish() {
            done = true;
            back.disabled = true;
            hintBtn.disabled = true;
            const score = U.clamp(task.best / Math.max(task.best, moves) - 0.15 * hints, 0, 1);
            ctx.mark(score >= 0.99, (performance.now() - t0) / SM.timeScale);
            ctx.feedback(true);
            ctx.status(moves <= task.best ? 'Výborně, nejkratší cestou!' : 'Hotovo! Přelití: ' + moves + ', nejkratší cesta jich má ' + task.best + '.');
            ctx.sleep(1500).then(() => resolve(score));
          }
        });
      }
    }
  });
})();
