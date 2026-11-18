/* Balonky — vybrat balonky, jejichž čísla dají dohromady cílový součet; každý balonek jen jednou (sčítání a plánování). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Barvy balonků (jen ozdoba; čísla jsou vždy tmavá na světlém). */
  const COLORS = ['#f4a3a3', '#9fcdf2', '#f5df96', '#b5e0ab', '#d6b8f0', '#f6c49c', '#a9e4dc', '#f2b3d6'];

  /* k = kolik balonků dá jeden cíl, count = balonků celkem, hi = největší číslo, goals = cílů najednou (na jedné sadě balonků). */
  const LEVELS = [
    { k: 2, count: 6, hi: 10, goals: 1, rounds: 4 },
    { k: 3, count: 7, hi: 12, goals: 1, rounds: 3 },
    { k: 3, count: 8, hi: 20, goals: 1, rounds: 3 },
    { k: 2, count: 8, hi: 15, goals: 2, rounds: 2 },
    { k: 3, count: 9, hi: 20, goals: 2, rounds: 2 }
  ];

  /* Sada balonků a cíle: každý cíl jde složit z jiných balonků (k kusů). */
  function makeSet(L) {
    for (let t = 0; t < 300; t++) {
      const vals = Array.from({ length: L.count }, () => U.randInt(1, L.hi));
      const idx = U.shuffle(Array.from({ length: L.count }, (_, i) => i));
      const goals = [];
      for (let g = 0; g < L.goals; g++) {
        const part = idx.slice(g * L.k, (g + 1) * L.k);
        goals.push(part.reduce((a, i) => a + vals[i], 0));
      }
      if (new Set(goals).size !== goals.length) continue;
      return { vals: vals, goals: goals };
    }
    return null;
  }

  /* Jde cíl složit z k zbylých balonků? */
  function canMake(st, goal) {
    const free = st.vals.map((v, i) => i).filter((i) => !st.gone[i]);
    const rec = (from, left, sum) => (left === 0 ? sum === goal : free.slice(from).some((i, j) => rec(from + j + 1, left - 1, sum + st.vals[i])));
    return rec(0, st.k, 0);
  }

  SM.registerGame({
    id: 'balonky',
    name: 'Balonky',
    domain: 'logika',
    trains: 'sčítání a plánování',
    short: 'Vyberte balonky, které dají cílový součet.',
    duration: 'asi 2 minuty',
    pace: { per: 'na cíl' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Na balonkách jsou čísla. Vyberte ' + (L.k === 2 ? 'dva balonky' : 'tři balonky') + ', jejichž čísla dají dohromady cíl.',
        'Průběžný součet vidíte nahoře. Vybraný balonek zrušíte dalším klepnutím.',
        'Každý balonek se dá použít jen jednou.'
      ];
      if (L.goals > 1) steps.push('Na jedné sadě balonků hledáte dva cíle po sobě. Balonky použité na první cíl uletí.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const rounds = ctx.short ? 1 : L.rounds;
      let ok = 0, total = 0;
      for (let r = 0; r < rounds; r++) {
        const set = makeSet(ctx.short && L.goals === 1 ? Object.assign({}, L, { goals: 2 }) : L);
        const st = { vals: set.vals, gone: set.vals.map(() => false), k: L.k };
        for (let g = 0; g < set.goals.length; g++) {
          // Když hráč na první cíl použil jiné balonky, druhý cíl se z nich musí dát složit.
          if (g > 0 && !canMake(st, set.goals[g])) set.goals[g] = U.sample(st.vals.map((v, i) => i).filter((i) => !st.gone[i]), L.k).reduce((a, i) => a + st.vals[i], 0);
          total++;
          ctx.progress('Cíl ' + total + ' z ' + rounds * set.goals.length);
          if (await play(st, set.goals[g])) ok++;
        }
      }
      const acc = total ? ok / total : 0;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: ok + ' z ' + total, bigLabel: 'cílů napoprvé',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      /* Jeden cíl. Vrací true, když první úplný výběr dal cíl. */
      function play(st, goal) {
        return new Promise((resolve) => {
          const picked = [];
          let first = true;
          let done = false;
          const t0 = performance.now();
          ctx.clear();
          ctx.status('Vyberte ' + (L.k === 2 ? 'dva balonky' : 'tři balonky') + ' se součtem ' + goal + '.');
          const sumEl = h('p', { class: 'bal-sum', 'aria-live': 'polite' });
          const sky = h('div', { class: 'bal-sky' });
          const els = st.vals.map((v, i) => {
            const b = h('button', { class: 'bal' + (st.gone[i] ? ' is-gone' : ''), type: 'button', 'data-i': i, 'data-v': v, 'aria-label': 'Balonek ' + v, disabled: st.gone[i] || null,
              style: { '--c': COLORS[i % COLORS.length] } },
            h('span', { class: 'bal-body' }, String(v)), h('span', { class: 'bal-string', 'aria-hidden': 'true' }));
            U.tap(b, () => toggle(i));
            sky.appendChild(b);
            return b;
          });
          const goalEl = h('p', { class: 'terc-goal' }, h('span', null, 'Cíl'), h('b', null, String(goal)));
          ctx.stage.appendChild(h('div', { class: 'stack balonky', 'data-goal': goal, 'data-k': L.k }, goalEl, sumEl, sky));
          paint();
          fit();

          /* Velikost balonků podle místa (malý displej, velké písmo). */
          function fit() {
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
            const avail = ctx.stage.clientHeight - goalEl.offsetHeight - sumEl.offsetHeight - 2 * 0.9 * rem - 20;
            const W = Math.min(ctx.stage.clientWidth, 30 * rem) - 8;
            let bw = Math.max(44, 2.1 * rem);
            for (let w = 4 * rem; w >= Math.max(44, 2.1 * rem); w -= 1) {
              const cols = Math.max(1, Math.floor((W + 0.9 * rem) / (w + 0.9 * rem)));
              const rows = Math.ceil(els.length / cols);
              if (rows * (w * 1.5 + 0.6 * rem) <= avail) { bw = w; break; }
            }
            sky.style.setProperty('--bw', Math.floor(bw) + 'px');
          }

          function paint() {
            els.forEach((b, i) => b.classList.toggle('is-on', picked.indexOf(i) !== -1));
            const sum = picked.reduce((a, i) => a + st.vals[i], 0);
            sumEl.textContent = picked.length ? picked.map((i) => st.vals[i]).join(' + ') + ' = ' + sum : 'Zatím nic';
            sumEl.classList.toggle('is-empty', !picked.length);
            sumEl.classList.toggle('is-over', sum > goal);
          }
          function toggle(i) {
            if (done || st.gone[i] || !ctx.alive) return;
            const at = picked.indexOf(i);
            if (at !== -1) picked.splice(at, 1);
            else if (picked.length < L.k) picked.push(i);
            else return;
            ctx.sound.tap();
            paint();
            if (picked.length < L.k) return;
            const sum = picked.reduce((a, j) => a + st.vals[j], 0);
            if (sum === goal) {
              done = true;
              ctx.mark(first, (performance.now() - t0) / SM.timeScale);
              picked.forEach((j) => { st.gone[j] = true; els[j].classList.add('is-flying'); });
              ctx.feedback(true);
              ctx.status(first ? 'Výborně!' : 'Teď to sedí!');
              ctx.sleep(1200).then(() => resolve(first));
            } else {
              first = false;
              ctx.sound.wrong();
              ctx.status('Součet je ' + sum + ', cíl je ' + goal + '. Zrušte některý balonek a zkuste jiný.');
            }
          }
        });
      }
    }
  });
})();
