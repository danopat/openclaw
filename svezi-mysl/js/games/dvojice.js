/* Co k čemu patří — zapamatovat si dvojice (zboží a cena, spoj a čas, příbuzný a datum) a pak je spojit (asociativní paměť). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const MONTHS = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
  const DAYS = [['pondělí', 'v pondělí'], ['úterý', 'v úterý'], ['středa', 've středu'], ['čtvrtek', 've čtvrtek'], ['pátek', 'v pátek']];
  const time = (hr, mi) => hr + ':' + (mi < 10 ? '0' : '') + mi;
  /* n různých hodnot z generátoru gen() (porovnává se podle textu). */
  function distinct(n, gen) {
    const out = [];
    for (let t = 0; t < 500 && out.length < n; t++) {
      const v = gen();
      if (out.indexOf(v) === -1) out.push(v);
    }
    return out;
  }

  /*
   * Témata. items: [obrázek, název, tvar do otázky]; values(n) vrátí n různých hodnot (navíc pro chybné možnosti).
   * q(item) = otázka na hodnotu, rq(value) = otázka opačným směrem.
   */
  const THEMES = [
    {
      title: 'Ceník na trhu', emo: '🧺',
      items: [['🍎', 'jablka', 'jablek'], ['🍐', 'hrušky', 'hrušek'], ['🍅', 'rajčata', 'rajčat'], ['🥒', 'okurky', 'okurek'], ['🥔', 'brambory', 'brambor'],
        ['🧅', 'cibule', 'cibule'], ['🥕', 'mrkev', 'mrkve'], ['🍓', 'jahody', 'jahod'], ['🍒', 'třešně', 'třešní'], ['🍇', 'hrozny', 'hroznů'], ['🍑', 'broskve', 'broskví'], ['🍋', 'citrony', 'citronů']],
      values: (n) => U.sample([15, 19, 22, 25, 29, 32, 35, 39, 42, 45, 49, 55, 59, 65, 69, 75, 79, 89, 99], n).map((p) => p + ' Kč/kg'),
      q: (it) => 'Kolik stálo kilo ' + it[2] + '?',
      rq: (v) => 'Co stálo ' + v.replace('/kg', ' za kilo') + '?'
    },
    {
      title: 'Jízdní řád', emo: '🚌',
      items: [['🚌', 'autobus 133', 'autobus 133'], ['🚋', 'tramvaj 22', 'tramvaj 22'], ['🚆', 'vlak do Brna', 'vlak do Brna'], ['🚌', 'autobus 207', 'autobus 207'],
        ['🚎', 'trolejbus 58', 'trolejbus 58'], ['🚆', 'vlak do Kolína', 'vlak do Kolína'], ['🚋', 'tramvaj 9', 'tramvaj 9'], ['🚌', 'autobus 119', 'autobus 119']],
      values: (n) => distinct(n, () => time(U.randInt(6, 19), 5 * U.randInt(0, 11))),
      q: (it) => 'Kdy jede ' + it[2] + '?',
      rq: (v) => 'Co jede v ' + v + '?'
    },
    {
      title: 'Narozeniny v rodině', emo: '🎂',
      items: [['👧', 'vnučka Anna', 'vnučka Anna'], ['👨', 'syn Petr', 'syn Petr'], ['👩', 'sestra Jana', 'sestra Jana'], ['👴', 'bratr Karel', 'bratr Karel'],
        ['👦', 'vnuk Tomáš', 'vnuk Tomáš'], ['👩', 'dcera Eva', 'dcera Eva'], ['👵', 'švagrová Věra', 'švagrová Věra'], ['👨', 'soused Josef', 'soused Josef']],
      values: (n) => distinct(n, () => U.randInt(1, 28) + '. ' + U.pick(MONTHS)),
      q: (it) => 'Kdy má narozeniny ' + it[2] + '?',
      rq: (v) => 'Kdo má narozeniny ' + v + '?'
    },
    {
      title: 'Kódy', emo: '🔐', note: 'Jen cvičení. Skutečné PINy a hesla si nikam nezapisujte.',
      items: [['📫', 'schránka', 'schránka'], ['🚪', 'branka', 'branka'], ['🚲', 'kolo', 'kolo'], ['🧳', 'kufr', 'kufr'],
        ['🚗', 'garáž', 'garáž'], ['🗄️', 'skříňka', 'skříňka'], ['🔒', 'sklep', 'sklep']],
      // Smyšlená čtyřčíslí, aspoň tři různé číslice (žádné 1111).
      values: (n) => distinct(n, () => {
        let d;
        do { d = Array.from({ length: 4 }, () => U.randInt(0, 9)); } while (new Set(d).size < 3);
        return d.join(' ');
      }),
      q: (it) => 'Jaký kód má ' + it[2] + '?',
      rq: (v) => 'Co má kód ' + v + '?'
    },
    {
      title: 'Objednávky', emo: '🗓️',
      items: [['🦷', 'zubař', 'k zubaři'], ['👓', 'oční lékařka', 'k oční lékařce'], ['🩺', 'praktický lékař', 'k praktickému lékaři'], ['💆', 'rehabilitace', 'na rehabilitaci'],
        ['✂️', 'kadeřnice', 'ke kadeřnici'], ['🦶', 'pedikúra', 'na pedikúru'], ['💉', 'očkování', 'na očkování']],
      values: (n) => distinct(n, () => { const d = U.pick(DAYS); return d[0] + ' ' + time(U.randInt(7, 16), 15 * U.randInt(0, 3)); }),
      q: (it) => 'Kdy jdete ' + it[2] + '?',
      rq: (v) => { const p = v.split(' '); const d = DAYS.find((x) => x[0] === p[0]); return 'Kam jdete ' + d[1] + ' v ' + p[1] + '?'; }
    },
    {
      title: 'Drogerie', emo: '🛒',
      items: [['🧴', 'krém', 'krém'], ['🧼', 'mýdlo', 'mýdlo'], ['🧻', 'toaletní papír', 'toaletní papír'], ['🧽', 'houbička', 'houbičku'],
        ['🧺', 'prací prášek', 'prací prášek'], ['💊', 'vitamíny', 'vitamíny'], ['🕯️', 'svíčka', 'svíčku'], ['🧦', 'ponožky', 'ponožky']],
      values: (n) => U.sample([19, 24, 29, 34, 39, 45, 49, 55, 59, 69, 79, 89, 99, 109, 119, 129], n).map((p) => p + ' Kč'),
      q: (it) => 'Kolik se platilo za ' + it[2] + '?',
      rq: (v) => 'Co stálo ' + v + '?'
    },
    {
      title: 'Babiččin recept', emo: '🍰', recipe: true,
      dishes: [['bábovka', 'do bábovky'], ['perník', 'do perníku'], ['vánočka', 'do vánočky'], ['buchty', 'do buchet']],
      items: [['🌾', 'mouka', 'mouky', ['250 g', '300 g', '400 g', '500 g']], ['🍬', 'cukr', 'cukru', ['100 g', '120 g', '150 g', '180 g']],
        ['🧈', 'máslo', 'másla', ['80 g', '125 g', '200 g']], ['🥛', 'mléko', 'mléka', ['125 ml', '200 ml', '250 ml', '300 ml']],
        ['🥚', 'vejce', 'vajec', ['2 ks', '3 ks', '4 ks', '5 ks']], ['🍫', 'kakao', 'kakaa', ['1 lžíce', '2 lžíce', '3 lžíce']],
        ['🍇', 'rozinky', 'rozinek', ['50 g', '60 g', '70 g']], ['🍯', 'med', 'medu', ['1 lžíce', '2 lžíce', '3 lžíce']]]
    }
  ];

  /* Jeden seznam dvojic: { title, emo, note, pairs: [{ emo, item, value, q, rq }], extra: [hodnoty navíc] }. */
  function makeList(n, used) {
    const pool = THEMES.filter((t) => used.indexOf(t.title) === -1);
    const th = U.pick(pool.length ? pool : THEMES);
    used.push(th.title);
    if (th.recipe) return makeRecipe(th, n);
    const items = U.sample(th.items, Math.min(n, th.items.length));
    const vals = th.values(items.length + 4);
    return {
      title: th.title, emo: th.emo, note: th.note,
      pairs: items.map((it, i) => ({ emo: it[0], item: it[1], value: vals[i], q: th.q(it), rq: th.rq(vals[i]) })),
      extra: vals.slice(items.length)
    };
  }
  /* Recept: každá surovina má jiné množství (aby šlo hledat i opačným směrem). */
  function makeRecipe(th, n) {
    const dish = U.pick(th.dishes);
    for (let t = 0; t < 200; t++) {
      const items = U.sample(th.items, Math.min(n, th.items.length));
      const vals = items.map((it) => U.pick(it[3]));
      if (new Set(vals).size !== vals.length) continue;
      const extra = [];
      th.items.forEach((it) => it[3].forEach((v) => { if (vals.indexOf(v) === -1 && extra.indexOf(v) === -1) extra.push(v); }));
      return {
        title: th.title + ': ' + dish[0], emo: th.emo,
        pairs: items.map((it, i) => ({
          emo: it[0], item: it[1], value: vals[i], alt: it[3].filter((v) => v !== vals[i]),
          q: 'Kolik ' + it[2] + ' patří ' + dish[1] + '?', rq: 'Čeho dáte ' + dish[1] + ' ' + vals[i] + '?'
        })),
        extra: extra
      };
    }
    return makeList(n, []);
  }

  /* reverse = část otázek opačným směrem (hodnota → položka). */
  const LEVELS = [
    { n: 3, opts: 3 },
    { n: 4, opts: 3 },
    { n: 5, opts: 4 },
    { n: 6, opts: 4 },
    { n: 7, opts: 4, reverse: 0.4 },
    { n: 8, opts: 4, reverse: 0.5 }
  ];

  SM.registerGame({
    id: 'dvojice',
    name: 'Co k čemu patří',
    domain: 'pamet',
    trains: 'paměť na dvojice údajů, třeba zboží a cenu nebo spoj a čas',
    short: 'Zapamatujte si, co k čemu patří.',
    duration: 'asi 2 až 3 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Uvidíte krátký seznam dvojic, třeba ceník na trhu nebo jízdní řád.',
        'Prohlédněte si ho a klepněte na „Mám zapamatováno“.',
        'Potom ke každé položce vyberte, co k ní patřilo.'
      ];
      if (L.reverse) steps.push('Někdy se ptáme obráceně: k hodnotě hledáte položku.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const lists = ctx.short ? 1 : 2;
      const used = [];
      let correct = 0;
      let total = 0;
      for (let l = 0; l < lists; l++) {
        const list = makeList(L.n, used);
        await study(list, l);
        const asks = U.shuffle(list.pairs).slice(0, ctx.short ? Math.min(4, list.pairs.length) : list.pairs.length);
        for (let i = 0; i < asks.length; i++) {
          total++;
          ctx.progress((lists > 1 ? 'Seznam ' + (l + 1) + ' z ' + lists + ' · ' : '') + 'otázka ' + (i + 1) + ' z ' + asks.length);
          if (await ask(list, asks[i], L.reverse && Math.random() < L.reverse)) correct++;
        }
      }
      const acc = correct / total;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc, 0.85, 0.5),
        big: correct + ' z ' + total, bigLabel: 'správně spojených dvojic',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      function study(list, l) {
        ctx.clear();
        ctx.progress(lists > 1 ? 'Seznam ' + (l + 1) + ' z ' + lists : '');
        ctx.status('Zapamatujte si, co k čemu patří.');
        const card = h('div', { class: 'pairs-card' },
          h('p', { class: 'pairs-title' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, list.emo), list.title),
          list.pairs.map((p) => h('div', { class: 'pair-row' },
            h('span', { class: 'emo', 'aria-hidden': 'true' }, p.emo),
            h('span', { class: 'pair-item' }, p.item),
            h('span', { class: 'pair-value' }, p.value))),
          list.note ? h('p', { class: 'pairs-note' }, list.note) : null);
        const box = h('div', { class: 'stack' }, card);
        ctx.stage.appendChild(box);
        return K.study(ctx, { limit: ctx.level >= 4 ? (list.pairs.length * 5000 + 6000) : null, container: box });
      }

      async function ask(list, p, rev) {
        const others = list.pairs.filter((x) => x !== p);
        let opts;
        let answer;
        if (rev) {
          answer = p.item;
          opts = [p.item].concat(U.sample(others.map((x) => x.item), L.opts - 1));
          ctx.status(p.rq);
          K.show(ctx, h('div', { class: 'pair-q is-value', 'data-kind': 'r' }, h('span', { class: 'pair-q-text' }, p.value)));
        } else {
          answer = p.value;
          // U receptu nejdřív jiná množství téže suroviny (stejné jednotky), pak ostatní hodnoty.
          const wrong = [];
          (p.alt ? U.shuffle(p.alt) : []).concat(U.shuffle(others.map((x) => x.value)), U.shuffle(list.extra)).forEach((v) => {
            if (v !== p.value && wrong.indexOf(v) === -1) wrong.push(v);
          });
          opts = [p.value].concat(wrong.slice(0, L.opts - 1));
          ctx.status(p.q);
          K.show(ctx, h('div', { class: 'pair-q', 'data-kind': 'f' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, p.emo), h('span', { class: 'pair-q-text' }, p.item)));
        }
        const r = await K.choose(ctx, U.shuffle(opts).map((o) => ({ label: o, value: o })), { answer: answer, layout: 'col', cls: rev ? '' : 'is-mono' });
        ctx.status(r.correct ? 'Správně!' : 'Správně je: ' + answer + '.');
        await ctx.sleep(r.correct ? 900 : 2000);
        return r.correct;
      }
    }
  });
})();
