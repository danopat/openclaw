/* Příbuzenstvo — kdo je komu kdo v rodině (jazyk a logické uvažování o vztazích). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;
  const C = SM.content;

  /* groups = skupiny vět z C.KIN, opts = počet možností, tree = otázky nad rodokmenem. */
  const LEVELS = [
    { groups: [1], opts: 3 },
    { groups: [2], opts: 3 },
    { groups: [1, 2], opts: 4 },
    { groups: [3], opts: 4 },
    { tree: true }
  ];

  /* ---------- Věty o vztazích ---------- */
  function kinQuestion(L, used) {
    const pool = C.KIN.filter((k) => L.groups.indexOf(k.l) !== -1 && !used[k.q]);
    const k = U.pick(pool.length ? pool : C.KIN.filter((x) => L.groups.indexOf(x.l) !== -1));
    used[k.q] = true;
    const blank = h('span', { class: 'blank' }, ' ');
    const card = h('p', { class: 'quote-card kin-card', 'data-q': k.q }, k.q + ' ', blank, '.');
    const opts = U.shuffle([k.a].concat(U.sample(k.d, L.opts - 1)));
    return { node: card, blank: blank, answer: k.a, options: opts, status: 'Doplňte správné slovo.' };
  }

  /* ---------- Rodokmen ---------- */
  function makeTree() {
    const F = C.FAMILY;
    for (let tries = 0; tries < 100; tries++) {
      const t = { gm: U.pick(F.grand.f), gp: U.pick(F.grand.m), mids: [] };
      const usedMid = {};
      const usedKid = {};
      const n = U.randInt(2, 3);
      for (let i = 0; i < n; i++) {
        const g = Math.random() < 0.5 ? 'f' : 'm';
        const name = U.pick(F.parents[g].filter((x) => !usedMid[x]));
        usedMid[name] = true;
        const kids = [];
        const cnt = U.randInt(i === 0 ? 1 : 0, 3);
        for (let k = 0; k < cnt; k++) {
          const kg = Math.random() < 0.5 ? 'f' : 'm';
          const row = U.pick(F.kids[kg].filter((x) => !usedKid[x[0]]));
          usedKid[row[0]] = true;
          kids.push({ n: row[0], g: kg, pm: row[1], pf: row[2] });
        }
        t.mids.push({ n: name, g: g, kids: kids });
      }
      const total = t.mids.reduce((s, m) => s + m.kids.length, 0);
      if (total >= 3 && total <= 7) return t;
    }
    return null;
  }

  /* Všechny otázky, které mají v tomto rodokmenu jedinou správnou odpověď. */
  function treeQuestions(t) {
    const F = C.FAMILY;
    const all = [];
    t.mids.forEach((m) => m.kids.forEach((k) => all.push({ k: k, m: m })));
    const qs = [];
    const counts = (a) => {
      const set = [a];
      [a + 1, a - 1, a + 2, a + 3].forEach((x) => { if (x >= 0 && set.indexOf(x) === -1 && set.length < 4) set.push(x); });
      return set.map(String);
    };
    const names = (answer, same, pool) => {
      const others = U.shuffle(same.filter((x) => x !== answer));
      const extra = U.shuffle(pool.filter((x) => x !== answer && others.indexOf(x) === -1));
      return [answer].concat(others.concat(extra).slice(0, 3));
    };
    const grand = Math.random() < 0.5 ? 'babička ' + t.gm : 'dědeček ' + t.gp;
    qs.push({ type: 'count', q: 'Kolik vnoučat má ' + grand + '?', a: String(all.length), opts: counts(all.length) });
    all.forEach((x) => {
      const k = x.k;
      const m = x.m;
      const sameGenderKids = (g) => all.filter((y) => y.k.g === g).map((y) => y.k.n);
      const mids = (g) => t.mids.filter((y) => y.g === g).map((y) => y.n);
      qs.push({ type: 'sib', q: 'Kolik sourozenců má ' + k.n + '?', a: String(m.kids.length - 1), opts: counts(m.kids.length - 1) });
      qs.push({
        type: 'parent', q: 'Jak se jmenuje ' + (m.g === 'f' ? k.pf + ' maminka' : k.pm + ' tatínek') + '?', a: m.n,
        opts: names(m.n, mids(m.g).concat([m.g === 'f' ? t.gm : t.gp]), F.parents[m.g])
      });
      const others = t.mids.filter((y) => y !== m);
      const bro = others.filter((y) => y.g === 'm');
      const sis = others.filter((y) => y.g === 'f');
      if (bro.length === 1) qs.push({ type: 'uncle', q: 'Jak se jmenuje ' + k.pm + ' strýc?', a: bro[0].n, opts: names(bro[0].n, mids('m').concat([t.gp]), F.parents.m) });
      if (sis.length === 1) qs.push({ type: 'uncle', q: 'Jak se jmenuje ' + k.pf + ' teta?', a: sis[0].n, opts: names(sis[0].n, mids('f').concat([t.gm]), F.parents.f) });
      const cousins = all.filter((y) => y.m !== m).map((y) => y.k);
      const mc = cousins.filter((c) => c.g === 'm');
      const fc = cousins.filter((c) => c.g === 'f');
      if (mc.length === 1) qs.push({ type: 'cousin', q: 'Jak se jmenuje ' + k.pm + ' bratranec?', a: mc[0].n, opts: names(mc[0].n, sameGenderKids('m').filter((n) => n !== k.n), F.kids.m.map((r) => r[0]).filter((n) => n !== k.n)) });
      if (fc.length === 1) qs.push({ type: 'cousin', q: 'Jak se jmenuje ' + k.pf + ' sestřenice?', a: fc[0].n, opts: names(fc[0].n, sameGenderKids('f').filter((n) => n !== k.n), F.kids.f.map((r) => r[0]).filter((n) => n !== k.n)) });
    });
    return qs;
  }

  function treeNode(t) {
    return h('div', { class: 'ftree' },
      h('p', { class: 'ftree-top' }, 'babička ', h('strong', null, t.gm), ' a dědeček ', h('strong', null, t.gp)),
      h('p', { class: 'ftree-label' }, 'Jejich děti a vnoučata:'),
      h('div', { class: 'ftree-kids' }, t.mids.map((m) => h('p', { class: 'ftree-branch', 'data-name': m.n, 'data-g': m.g },
        h('strong', { class: 'ftree-mid' }, m.n),
        h('span', { class: 'ftree-sub' }, m.kids.length
          ? [' · děti: ', m.kids.map((k, i) => [i ? ', ' : '', h('span', { class: 'ftree-kid', 'data-kid': k.n, 'data-g': k.g }, k.n)])]
          : ' · bez dětí')))));
  }

  SM.registerGame({
    id: 'rodina',
    name: 'Příbuzenstvo',
    domain: 'slova',
    trains: 'jazyk a uvažování o rodinných vztazích',
    short: 'Kdo je komu kdo v rodině?',
    duration: 'asi 1 až 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      if (LEVELS[level - 1].tree) return [
        'Uvidíte malý rodokmen: babičku s dědečkem, jejich děti a vnoučata.',
        'Odpovězte na otázky, například kolik má babička vnoučat nebo jak se jmenuje něčí teta.'
      ];
      return [
        'Uvidíte větu o příbuzných, třeba „Syn mé sestry je můj …“.',
        'Vyberte slovo, které do věty patří.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      const used = {};
      let correct = 0;
      let tree = null;
      let pool = [];
      let lastType = null;
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        let q;
        if (L.tree) {
          if (!tree || i % 2 === 0 || !pool.length) {
            tree = makeTree();
            pool = U.shuffle(treeQuestions(tree));
          }
          // Různé druhy otázek za sebou.
          const idx = Math.max(0, pool.findIndex((x) => x.type !== lastType && !used[x.q]));
          const tq = pool.splice(idx, 1)[0];
          used[tq.q] = true;
          lastType = tq.type;
          // Počty seřazené vzestupně, jména zamíchaná.
          const numeric = tq.opts.every((o) => /^\d+$/.test(o));
          q = { node: treeNode(tree), answer: tq.a, options: numeric ? tq.opts.slice().sort((x, y) => x - y) : U.shuffle(tq.opts), status: tq.q };
        } else q = kinQuestion(L, used);
        ctx.status(q.status);
        if (L.tree) {
          // Rodokmen přímo na plochu: když se nevejde, dá se posunout a odpovědi zůstanou vidět.
          ctx.clear();
          ctx.stage.appendChild(q.node);
        } else K.show(ctx, q.node);
        const r = await K.choose(ctx, q.options.map((o) => ({ label: o, value: o })), { answer: q.answer, layout: q.options.length > 3 ? 'grid' : 'col' });
        if (q.blank) {
          q.blank.textContent = q.answer;
          q.blank.classList.add(r.correct ? 'is-ok' : 'is-fixed');
        }
        if (r.correct) correct++;
        if (L.tree) ctx.status(r.correct ? 'Správně!' : 'Správně je: ' + q.answer + '.');
        await ctx.sleep(r.correct ? 1100 : 2400);
      }
      const acc = correct / N;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: correct + ' z ' + N, bigLabel: 'správných odpovědí',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
