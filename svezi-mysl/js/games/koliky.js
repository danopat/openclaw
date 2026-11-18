/* Paměťové kolíky — pevné obrázky pro čísla 1 až 10, na které se „věší“ věci, které si chceme zapamatovat v pořadí. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Vlastní kolíky podle tvaru nebo počtu (stejné jako ve Škole paměti). */
  const PEGS = [
    ['🕯️', 'svíčka', 'rovná jako jednička'], ['🦢', 'labuť', 'krk prohnutý jako dvojka'], ['☘️', 'trojlístek', 'tři lístky'],
    ['⛵', 'plachetnice', 'plachta jako čtyřka'], ['✋', 'ruka', 'pět prstů'], ['🐌', 'šnek', 'ulita zatočená jako šestka'],
    ['🚩', 'vlajka', 'praporek jako sedmička'], ['⛄', 'sněhulák', 'dvě koule jako osmička'], ['🎈', 'balonek', 'balonek na provázku jako devítka'],
    ['🎳', 'kuželky', 'kuželka a koule jako 1 a 0']
  ].map((p, i) => ({ n: i + 1, e: p[0], name: p[1], why: p[2] }));
  /* Věci k zapamatování (nákup a drobnosti z domácnosti). */
  const THINGS = [
    ['🍞', 'chléb'], ['🥛', 'mléko'], ['🧀', 'sýr'], ['🥚', 'vejce'], ['🧈', 'máslo'], ['🍎', 'jablka'], ['🍌', 'banány'], ['🍋', 'citron'],
    ['🥕', 'mrkev'], ['🥔', 'brambory'], ['🍅', 'rajčata'], ['🥒', 'okurka'], ['🧅', 'cibule'], ['🍯', 'med'], ['☕', 'káva'], ['🍵', 'čaj'],
    ['🍫', 'čokoláda'], ['🍪', 'sušenky'], ['🧂', 'sůl'], ['🍚', 'rýže'], ['🐟', 'ryba'], ['🍗', 'kuře'], ['🧼', 'mýdlo'], ['🧻', 'papír'],
    ['🔋', 'baterie'], ['💡', 'žárovka'], ['✉️', 'dopis'], ['💊', 'vitamíny'], ['🌷', 'tulipány'], ['🧦', 'ponožky']
  ].map((t) => ({ e: t[0], name: t[1] }));

  /* learn = jen kolíky (bez věcí), n = počet kolíků / věcí, back = otázky i od konce. */
  const LEVELS = [
    { learn: true, n: 5 },
    { learn: true, n: 10 },
    { n: 5 },
    { n: 7 },
    { n: 10 },
    { n: 10, back: true }
  ];
  const FROM_END = ['posledním', 'předposledním', 'třetím od konce'];

  function pegNode(p, thing, small) {
    return h('div', { class: 'peg' + (small ? ' is-small' : ''), 'data-n': p.n },
      h('span', { class: 'peg-n' }, String(p.n)),
      h('span', { class: 'peg-pic', 'aria-hidden': 'true' }, h('span', { class: 'emo' }, p.e), thing ? h('span', { class: 'emo peg-thing' }, thing.e) : null),
      h('span', { class: 'peg-text' }, h('b', null, thing ? thing.name : p.name), h('span', null, thing ? 'na kolíku ' + p.name : p.why)));
  }

  SM.registerGame({
    id: 'koliky',
    name: 'Paměťové kolíky',
    domain: 'pamet',
    trains: 'zapamatování věcí v pořadí pomocí kolíků',
    short: 'Pověste si věci na kolíky a zapamatujte si pořadí.',
    duration: 'asi 2 až 3 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      if (L.learn) {
        return [
          'Kolíky jsou obrázky pro čísla: 1 svíčka, 2 labuť, 3 trojlístek, 4 plachetnice, 5 ruka' + (L.n > 5 ? ', 6 šnek, 7 vlajka, 8 sněhulák, 9 balonek a 10 kuželky.' : '.'),
          'Prohlédněte si je a pak odpovídejte, který obrázek patří ke kterému číslu.',
          'Až kolíky umíte, můžete na ně „věšet“ věci a pamatovat si jejich pořadí.'
        ];
      }
      return [
        'Uvidíte ' + L.n + ' věcí v pořadí. Každá visí na svém kolíku: první na svíčce, druhá na labuti a tak dál.',
        'Představte si je spolu, třeba svíčku zapíchnutou do chleba. Čím legračnější obrázek, tím líp drží.',
        L.back ? 'Pak se zeptáme, co visí na kterém kolíku, i počítáno od konce.' : 'Pak se zeptáme, co visí na kterém kolíku a na kterém kolíku visí která věc.'
      ];
    },
    async run(ctx) {
      let L = LEVELS[ctx.level - 1];
      if (ctx.short && !L.learn) L = LEVELS[2]; // do lekce 5 věcí na kolících 1–5
      const pegs = PEGS.slice(0, L.n);
      let ok = 0, total = 0;
      if (L.learn) {
        await studyPegs(pegs);
        const qs = U.shuffle(pegs).slice(0, ctx.short ? 4 : Math.min(8, pegs.length + 1));
        for (let i = 0; i < qs.length; i++) {
          ctx.progress('Otázka ' + (i + 1) + ' z ' + qs.length);
          total++;
          if (await (i % 2 ? askNumberOfPeg(qs[i], pegs) : askPegOfNumber(qs[i], pegs))) ok++;
        }
      } else {
        const things = U.sample(THINGS, L.n);
        await studyThings(pegs, things);
        const qs = questions(pegs, things);
        for (let i = 0; i < qs.length; i++) {
          ctx.progress('Otázka ' + (i + 1) + ' z ' + qs.length);
          total++;
          if (await qs[i]()) ok++;
        }
      }
      const acc = total ? ok / total : 0;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.85, 0.6),
        big: ok + ' z ' + total, bigLabel: 'správných odpovědí',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      function studyPegs(list) {
        ctx.clear();
        ctx.status('Zapamatujte si kolíky.');
        ctx.stage.appendChild(h('div', { class: 'stack koliky', 'data-ask': 'study' },
          h('div', { class: 'peg-list' + (list.length > 5 ? ' is-two' : '') }, list.map((p) => pegNode(p, null, list.length > 5)))));
        return K.study(ctx, {});
      }

      function studyThings(list, things) {
        ctx.clear();
        ctx.status('Pověste si věci na kolíky.');
        ctx.stage.appendChild(h('div', { class: 'stack koliky', 'data-ask': 'study' },
          h('div', { class: 'peg-list' + (list.length > 5 ? ' is-two' : '') }, list.map((p, i) => pegNode(p, things[i], list.length > 5)))));
        return K.study(ctx, { limit: list.length * 8000 + 10000, container: ctx.stage.querySelector('.koliky') });
      }

      /* attrs: údaje pro automatický test (číslo kolíku nebo název věci), na obrazovce nejsou vidět. */
      async function show(q, node, kind, attrs) {
        ctx.clear();
        ctx.status(q);
        K.show(ctx, h('div', Object.assign({ class: 'koliky', 'data-ask': kind }, attrs || {}), node));
      }

      async function askPegOfNumber(p, list) {
        await show('Jaký obrázek patří k číslu ' + p.n + '?', h('p', { class: 'peg-big' }, String(p.n)), 'peg', { 'data-n': p.n });
        const opts = U.shuffle([p].concat(U.sample(list.filter((x) => x !== p), 2)));
        const r = await K.choose(ctx, opts.map((x) => ({ value: x.n, label: x.name, node: h('span', { class: 'peg-opt' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, x.e), x.name) })), { answer: p.n, layout: 'col' });
        ctx.status(r.correct ? 'Správně!' : 'K číslu ' + p.n + ' patří ' + p.name + ' (' + p.why + ').');
        await ctx.sleep(r.correct ? 900 : 2400);
        return r.correct;
      }

      async function askNumberOfPeg(p, list) {
        await show('Ke kterému číslu patří ' + p.name + '?', h('p', { class: 'peg-big emo' }, p.e), 'num', { 'data-n': p.n });
        const nums = U.shuffle([p.n].concat(U.sample(list.filter((x) => x !== p).map((x) => x.n), 3))).sort((a, b) => a - b);
        const r = await K.choose(ctx, nums.map((v) => ({ value: v, label: String(v) })), { answer: p.n, layout: 'row', cls: 'is-mono' });
        ctx.status(r.correct ? 'Správně!' : p.name.charAt(0).toUpperCase() + p.name.slice(1) + ' je kolík číslo ' + p.n + ' (' + p.why + ').');
        await ctx.sleep(r.correct ? 900 : 2400);
        return r.correct;
      }

      /* Otázky na věci: co visí na kolíku, na kterém kolíku visí věc, na vyšší úrovni i od konce. */
      function questions(list, things) {
        const n = list.length;
        const idx = U.shuffle(Array.from({ length: n }, (_, i) => i));
        const count = ctx.short ? 4 : Math.min(n, 6);
        const out = [];
        for (let k = 0; k < count; k++) {
          const i = idx[k];
          const kind = L.back && k % 3 === 2 ? 'back' : k % 2 ? 'where' : 'what';
          out.push(() => (kind === 'where' ? askWhere(list, things, i) : kind === 'back' ? askBack(list, things) : askWhat(list, things, i)));
        }
        return out;
      }

      function thingOpts(things, right) {
        const opts = U.shuffle([right].concat(U.sample(things.filter((x) => x !== right), 3)));
        return opts.map((x) => ({ value: x.name, label: x.name, node: h('span', { class: 'peg-opt' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, x.e), x.name) }));
      }

      async function askWhat(list, things, i) {
        const p = list[i];
        await show('Co visí na kolíku ' + p.n + ' (' + p.name + ')?', h('p', { class: 'peg-big emo' }, p.e), 'what', { 'data-n': p.n });
        const r = await K.choose(ctx, thingOpts(things, things[i]), { answer: things[i].name, layout: 'grid' });
        ctx.status(r.correct ? 'Správně!' : 'Na kolíku ' + p.n + ' visí ' + things[i].name + '.');
        await ctx.sleep(r.correct ? 900 : 2400);
        return r.correct;
      }

      async function askWhere(list, things, i) {
        const t = things[i];
        await show('Na kterém kolíku visí ' + t.name + '?', h('p', { class: 'peg-big emo' }, t.e), 'where', { 'data-n': i + 1 });
        const nums = U.shuffle([i + 1].concat(U.sample(list.filter((_, j) => j !== i).map((x) => x.n), 3))).sort((a, b) => a - b);
        const r = await K.choose(ctx, nums.map((v) => ({ value: v, label: String(v) })), { answer: i + 1, layout: 'row', cls: 'is-mono' });
        ctx.status(r.correct ? 'Správně!' : 'Visí na kolíku ' + (i + 1) + ' (' + list[i].name + ').');
        await ctx.sleep(r.correct ? 900 : 2400);
        return r.correct;
      }

      async function askBack(list, things) {
        const from = U.randInt(0, FROM_END.length - 1);
        const i = list.length - 1 - from;
        await show('Co visí na ' + FROM_END[from] + ' kolíku?', h('p', { class: 'peg-big' }, 'od konce'), 'back', { 'data-n': i + 1 });
        const r = await K.choose(ctx, thingOpts(things, things[i]), { answer: things[i].name, layout: 'grid' });
        ctx.status(r.correct ? 'Správně!' : 'Na kolíku ' + (i + 1) + ' visí ' + things[i].name + '.');
        await ctx.sleep(r.correct ? 900 : 2400);
        return r.correct;
      }
    }
  });
})();
