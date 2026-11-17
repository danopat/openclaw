/* Řetězové počty — od výchozího čísla krok za krokem v hlavě (počty zpaměti a pracovní paměť). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const sign = (s, n) => [h('span', { class: 'op-sign' }, s), String(n)];

  /* Početní kroky. make(v, L) vrátí { n, r } (n = číslo v kroku, r = mezivýsledek), nebo null, když se krok nehodí. */
  const OPS = {
    add: {
      chip: (n) => sign('+', n), say: (n) => 'plus ' + n, line: (v, n, r) => v + ' + ' + n + ' = ' + r,
      make(v, L) { const n = L.small ? U.randInt(1, 9) : U.randInt(3, 24); return v + n <= L.cap ? { n: n, r: v + n } : null; }
    },
    sub: {
      chip: (n) => sign('−', n), say: (n) => 'minus ' + n, line: (v, n, r) => v + ' − ' + n + ' = ' + r,
      make(v, L) {
        if (v < 4) return null;
        const n = L.small ? U.randInt(1, Math.min(9, v - 2)) : U.randInt(2, Math.min(24, v - 2));
        return { n: n, r: v - n };
      }
    },
    mul: {
      chip: (n) => sign('×', n), say: (n) => 'krát ' + n, line: (v, n, r) => v + ' × ' + n + ' = ' + r,
      make(v, L) {
        const ms = [2, 3, 4, 5].filter((m) => v <= 25 && v * m <= L.cap);
        if (!ms.length) return null;
        const m = U.pick(ms);
        return { n: m, r: v * m };
      }
    },
    div: {
      chip: (n) => sign(':', n), say: (n) => 'děleno ' + n, line: (v, n, r) => v + ' : ' + n + ' = ' + r,
      make(v) {
        const ds = [2, 3, 4, 5, 10].filter((d) => v % d === 0 && v / d >= 2);
        if (!ds.length) return null;
        const d = U.pick(ds);
        return { n: d, r: v / d };
      }
    },
    half: {
      chip: () => 'polovina', say: () => 'vezměte polovinu', line: (v, n, r) => 'polovina z ' + v + ' = ' + r,
      make(v) { return v % 2 === 0 && v >= 4 ? { r: v / 2 } : null; }
    },
    double: {
      chip: () => 'dvojnásobek', say: () => 'vezměte dvojnásobek', line: (v, n, r) => 'dvojnásobek ' + v + ' = ' + r,
      make(v, L) { return v >= 3 && v * 2 <= L.cap ? { r: v * 2 } : null; }
    },
    quarter: {
      chip: () => 'čtvrtina', say: () => 'vezměte čtvrtinu', line: (v, n, r) => 'čtvrtina z ' + v + ' = ' + r,
      make(v) { return v % 4 === 0 && v >= 8 ? { r: v / 4 } : null; }
    },
    pct: {
      chip: () => '10 %', say: () => 'vezměte deset procent', line: (v, n, r) => '10 % z ' + v + ' = ' + r,
      make(v) { return v % 10 === 0 && v >= 20 ? { r: v / 10 } : null; }
    }
  };
  const BASIC = ['add', 'sub'];

  /* all = všechny kroky najednou na očích; jinak se ukazují po jednom. answer = výběr, nebo klávesnice. */
  const LEVELS = [
    { steps: 3, ops: ['add', 'sub'], small: true, start: [3, 15], cap: 30, all: true, answer: 'choose' },
    { steps: 3, ops: ['add', 'sub'], start: [8, 30], cap: 60, all: true, answer: 'choose' },
    { steps: 4, ops: ['add', 'sub', 'mul'], start: [3, 15], cap: 120, all: true, answer: 'choose', special: 1 },
    { steps: 4, ops: ['add', 'sub', 'mul', 'half'], start: [3, 15], cap: 120, all: false, answer: 'choose', special: 1 },
    { steps: 5, ops: ['add', 'sub', 'mul', 'div', 'half'], start: [4, 20], cap: 200, all: false, answer: 'keypad', special: 2 },
    { steps: 5, ops: ['add', 'sub', 'mul', 'div', 'half', 'double', 'quarter', 'pct'], start: [4, 20], cap: 200, all: false, answer: 'keypad', special: 2 }
  ];

  function makeChain(L) {
    for (let tries = 0; tries < 400; tries++) {
      const start = U.randInt(L.start[0], L.start[1]);
      let v = start;
      let prev = null;
      let special = 0;
      const steps = [];
      for (let s = 0; s < L.steps; s++) {
        const basic = U.shuffle(BASIC.filter((o) => L.ops.indexOf(o) !== -1 && o !== prev));
        const other = U.shuffle(L.ops.filter((o) => BASIC.indexOf(o) === -1 && o !== prev));
        const order = Math.random() < 0.5 ? basic.concat(other) : other.concat(basic);
        let st = null;
        for (let k = 0; k < order.length && !st; k++) {
          const r = OPS[order[k]].make(v, L);
          if (r) st = { op: order[k], n: r.n, from: v, r: r.r };
        }
        if (!st) break;
        steps.push(st);
        if (BASIC.indexOf(st.op) === -1) special++;
        prev = st.op;
        v = st.r;
      }
      if (steps.length === L.steps && special >= (L.special || 0) && v >= 1 && v <= L.cap) return { start: start, steps: steps, answer: v };
    }
    // Pojistka (nemělo by nastat): samé sčítání.
    const start = U.randInt(2, 9);
    const steps = [];
    let v = start;
    for (let s = 0; s < L.steps; s++) { const n = U.randInt(1, 9); steps.push({ op: 'add', n: n, from: v, r: v + n }); v += n; }
    return { start: start, steps: steps, answer: v };
  }

  function wrongOptions(chain) {
    const a = chain.answer;
    const last = chain.steps[chain.steps.length - 1];
    const near = [];
    [last.from, a + 1, a - 1, a + 2, a - 2, a + 10, a - 10].forEach((x) => { if (x > 0 && x !== a && near.indexOf(x) === -1) near.push(x); });
    return U.shuffle(near).slice(0, 3);
  }

  const spoken = (chain) => 'Začněte číslem ' + chain.start + ', potom ' + chain.steps.map((s) => OPS[s.op].say(s.n)).join(', ') + '.';

  function chainRow(chain) {
    const row = h('div', { class: 'chain', role: 'img', 'aria-label': spoken(chain) + ' Kolik vyjde?' });
    row.appendChild(h('span', { class: 'chain-num', 'data-op': 'start', 'data-n': chain.start }, String(chain.start)));
    chain.steps.forEach((s) => {
      row.appendChild(h('span', { class: 'chain-arrow', 'aria-hidden': 'true' }, '→'));
      row.appendChild(h('span', { class: 'chain-op', 'data-op': s.op, 'data-n': s.n == null ? '' : s.n }, OPS[s.op].chip(s.n)));
    });
    row.appendChild(h('span', { class: 'chain-arrow', 'aria-hidden': 'true' }, '→'));
    row.appendChild(h('span', { class: 'chain-num is-q' }, '?'));
    return row;
  }

  function stepCard(label, big, say, attrs) {
    return h('div', { class: 'chain-card' },
      h('p', { class: 'chain-label' }, label),
      h('span', Object.assign({ class: 'chain-big' }, attrs), big),
      say ? h('p', { class: 'chain-say' }, say) : null);
  }

  function solution(chain) {
    return h('div', { class: 'chain-sol' },
      h('p', { class: 'chain-sol-start' }, 'Začátek: ' + chain.start),
      chain.steps.map((s, i) => h('p', { class: i === chain.steps.length - 1 ? 'is-last' : '' }, OPS[s.op].line(s.from, s.n, s.r))));
  }

  SM.registerGame({
    id: 'retez',
    name: 'Řetězové počty',
    domain: 'logika',
    trains: 'počítání zpaměti a udržení mezivýsledku v hlavě',
    short: 'Počítejte v hlavě krok za krokem.',
    duration: 'asi 2 až 3 minuty',
    pace: { per: 'na příklad' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = ['Začnete jedním číslem. Za ním následuje několik početních kroků, třeba „+ 7“, „× 2“ nebo „polovina“.'];
      if (L.all) steps.push('Počítejte v hlavě zleva doprava, jeden krok po druhém.');
      else steps.push('Kroky se ukazují po jednom. Až máte mezivýsledek v hlavě, klepněte na „Další“. Předchozí kroky už neuvidíte.');
      steps.push(L.answer === 'keypad' ? 'Nakonec výsledek napište na klávesnici.' : 'Nakonec vyberte, kolik vám vyšlo.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      let correct = 0;
      const times = [];
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        const chain = makeChain(L);
        const t1 = performance.now();

        if (L.all) {
          ctx.status('Kolik vyjde?');
          K.show(ctx, chainRow(chain));
        } else {
          ctx.status('Počítejte v hlavě.');
          K.show(ctx, stepCard('Začněte číslem', String(chain.start), null, { 'data-op': 'start', 'data-n': chain.start }));
          await K.next(ctx, 'Další');
          for (let s = 0; s < chain.steps.length; s++) {
            const st = chain.steps[s];
            K.show(ctx, stepCard('Krok ' + (s + 1) + ' z ' + chain.steps.length, OPS[st.op].chip(st.n), OPS[st.op].say(st.n),
              { 'data-op': st.op, 'data-n': st.n == null ? '' : st.n }));
            await K.next(ctx, s === chain.steps.length - 1 ? 'Mám výsledek' : 'Další');
          }
          ctx.status('Kolik vám vyšlo?');
        }

        let ok;
        if (L.answer === 'keypad') {
          const box = K.show(ctx, h('p', { class: 'lead-q' }, 'Napište výsledek.'));
          const val = await K.keypad(ctx, { max: 3, container: box });
          ok = parseInt(val, 10) === chain.answer;
          ctx.feedback(ok);
        } else {
          if (!L.all) K.show(ctx, h('p', { class: 'lead-q' }, 'Vyberte výsledek.'));
          const opts = [chain.answer].concat(wrongOptions(chain)).sort((x, y) => x - y).map((v) => ({ label: String(v), value: v }));
          const r = await K.choose(ctx, opts, { answer: chain.answer, layout: 'grid', cls: 'is-mono' });
          ok = r.correct;
        }
        if (ok) correct++;
        times.push((performance.now() - t1) / SM.timeScale);

        ctx.foot.textContent = '';
        K.show(ctx, solution(chain));
        if (ok) {
          ctx.status('Správně, vyšlo ' + chain.answer + '.');
          await ctx.sleep(1500);
        } else {
          ctx.status('Vyšlo by ' + chain.answer + '. Takhle:');
          await K.next(ctx, i === N - 1 ? 'Pokračovat' : 'Další příklad');
        }
      }
      const acc = correct / N;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc, 0.8, 0.5), rt: U.median(times),
        big: correct + ' z ' + N, bigLabel: 'příkladů spočítaných správně',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
