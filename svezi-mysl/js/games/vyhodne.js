/* Výhodný nákup — které balení nebo která nabídka vyjde levněji (úsudek s čísly v běžném životě). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* u = jednotka balení, sizes = obvyklá balení, p = obvyklá cena za jednotku (Kč). */
  const GOODS = [
    { e: '🧀', n: 'Sýr', u: 'g', sizes: [100, 250, 500, 1000], p: 0.22 },
    { e: '☕', n: 'Káva', u: 'g', sizes: [250, 500, 1000], p: 0.44 },
    { e: '🧈', n: 'Máslo', u: 'g', sizes: [125, 250, 500], p: 0.24 },
    { e: '🍚', n: 'Rýže', u: 'g', sizes: [500, 1000, 2000], p: 0.05 },
    { e: '🍝', n: 'Těstoviny', u: 'g', sizes: [500, 1000, 2000], p: 0.06 },
    { e: '🥔', n: 'Brambory', u: 'g', sizes: [1000, 2000, 5000, 10000], p: 0.024 },
    { e: '🍯', n: 'Med', u: 'g', sizes: [250, 500, 1000], p: 0.32 },
    { e: '🍪', n: 'Sušenky', u: 'g', sizes: [100, 200, 500], p: 0.2 },
    { e: '🥛', n: 'Mléko', u: 'ml', sizes: [500, 1000, 2000], p: 0.026 },
    { e: '🧃', n: 'Džus', u: 'ml', sizes: [250, 1000, 2000], p: 0.045 },
    { e: '🥚', n: 'Vejce', u: 'ks', sizes: [6, 10, 30], p: 5 },
    { e: '🧻', n: 'Toaletní papír', u: 'role', sizes: [4, 8, 16, 24], p: 9 },
    { e: '🍵', n: 'Čaj', u: 'sacek', sizes: [20, 40, 100], p: 2.2 }
  ];
  /* Zboží pro akce: obvyklá cena jednoho kusu. */
  const PROMO = [
    { e: '🍫', n: 'Čokoláda', min: 25, max: 45 },
    { e: '🧈', n: 'Máslo', min: 45, max: 69 },
    { e: '🍪', n: 'Sušenky', min: 19, max: 39 },
    { e: '☕', n: 'Káva', min: 89, max: 159 },
    { e: '🧃', n: 'Džus', min: 29, max: 49 },
    { e: '🧀', n: 'Sýr', min: 29, max: 59 }
  ];
  // Nezlomitelná mezera drží názvy obchodů pohromadě (žádné „U“ osamocené na konci řádku).
  const SHOPS = ['U\u00a0Lípy', 'Na\u00a0Rohu', 'Večerka', 'Na\u00a0Náměstí', 'U\u00a0Nádraží'];

  /* kind: same = stejné balení ve dvou obchodech, pair = dvě balení, three = tři balení, promo = akce. */
  const LEVELS = [
    { kind: 'same', diff: 0.12 },
    { kind: 'pair', ratios: [2], diff: 0.12 },
    { kind: 'pair', ratios: [2, 3, 4, 5, 10], diff: 0.1 },
    { kind: 'three', diff: 0.08 },
    { kind: 'promo', diff: 0.07 }
  ];

  const pl = U.plural;
  function sizeText(g, s) {
    if (g.u === 'g') return s >= 1000 ? U.num(s / 1000, s % 1000 ? 1 : 0) + ' kg' : s + ' g';
    if (g.u === 'ml') return U.num(s / 1000, s % 1000 ? (s % 100 ? 2 : 1) : 0) + ' l';
    if (g.u === 'ks') return s + ' ' + pl(s, 'vejce', 'vejce', 'vajec');
    if (g.u === 'role') return s + ' ' + pl(s, 'role', 'role', 'rolí');
    return s + ' ' + pl(s, 'sáček', 'sáčky', 'sáčků');
  }
  /* Cena za srovnávací jednotku (1 kg, 1 l, 1 kus…). */
  const PER = { g: [1000, '1 kg'], ml: [1000, '1 l'], ks: [1, '1 vejce'], role: [1, '1 role'], sacek: [1, '1 sáček'] };
  const kc = (v) => (v >= 50 ? Math.round(v) : U.num(v, v >= 10 ? 1 : 2)) + ' Kč';
  /* „Pěkná“ cena jako v obchodě: 39, 149, 1 290… */
  function nice(v) {
    if (v < 10) return Math.max(1, Math.round(v));
    if (v < 1000) return Math.max(9, Math.round(v / 10) * 10 - 1);
    return Math.round(v / 100) * 100 - 10;
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  /* Nejlepší nabídka musí být o diff levnější než druhá nejlepší, jinak se úloha vygeneruje znovu. */
  function clearWinner(offers, diff) {
    const vals = offers.map((o) => o.v).sort((a, b) => a - b);
    return vals[1] >= vals[0] * (1 + diff);
  }

  function makeTask(L) {
    for (let tries = 0; tries < 300; tries++) {
      const t = L.kind === 'promo' ? promoTask() : packTask(L);
      if (t && clearWinner(t.offers, L.diff)) {
        let best = 0;
        t.offers.forEach((o, i) => { if (o.v < t.offers[best].v) best = i; });
        t.answer = best;
        return t;
      }
    }
    return L === LEVELS[0] ? null : makeTask(LEVELS[0]);
  }

  function packTask(L) {
    const g = U.pick(GOODS);
    const per = PER[g.u];
    let sizes;
    if (L.kind === 'same') {
      const s = U.pick(g.sizes);
      sizes = [s, s];
    } else if (L.kind === 'pair') {
      const pairs = [];
      g.sizes.forEach((a) => g.sizes.forEach((b) => { if (b > a && L.ratios.indexOf(b / a) !== -1) pairs.push([a, b]); }));
      if (!pairs.length) return null;
      sizes = U.shuffle(U.pick(pairs));
    } else {
      if (g.sizes.length < 3) return null;
      sizes = U.sample(g.sizes, 3);
    }
    const shops = U.sample(SHOPS, sizes.length);
    const offers = sizes.map((s, i) => {
      const price = nice(g.p * s * rand(0.78, 1.28));
      return {
        g: g, size: s, price: price, v: price / s,
        title: L.kind === 'same' ? 'Obchod ' + shops[i] : g.n,
        lines: [sizeText(g, s)],
        after: per[1] + ' vyjde na ' + kc(price / s * per[0])
      };
    });
    if (L.kind === 'same' && offers[0].price === offers[1].price) return null;
    return {
      offers: offers,
      question: L.kind === 'same' ? g.n + ' ' + sizeText(g, sizes[0]) + '. Kde nakoupíte levněji?' : 'Které balení je výhodnější?',
      head: g
    };
  }

  function promoTask() {
    const g = U.pick(PROMO);
    const shops = U.sample(SHOPS, 2);
    const type = U.pick(['3za2', 'druhy', 'sleva']);
    let need, base, total, label, orig = null;
    if (type === '3za2') {
      need = 3; base = nice(rand(g.min, g.max)); total = 2 * base; label = 'Akce: 3 za cenu 2';
    } else if (type === 'druhy') {
      need = 2; base = 2 * Math.round(rand(g.min, g.max) / 2); total = base + base / 2; label = 'Druhý kus za polovinu';
    } else {
      need = U.pick([1, 2]);
      const s = U.pick([20, 25, 30, 50]);
      orig = 10 * Math.round(rand(g.min * 1.2, g.max * 1.3) / 10);
      base = Math.round(orig * (1 - s / 100));
      total = need * base;
      label = 'Sleva ' + s + ' %';
    }
    // Druhý obchod bez akce: o něco levnější, nebo dražší než akce.
    const promoWins = Math.random() < 0.55;
    const target = total / need * (promoWins ? rand(1.1, 1.3) : rand(0.72, 0.92));
    const regular = Math.max(5, Math.round(target));
    const pieces = need + ' ' + pl(need, 'kus', 'kusy', 'kusů');
    const promo = {
      price: orig || base, v: total,
      title: 'Obchod ' + shops[0], lines: [g.n + ', 1 kus', label],
      priceNote: orig ? 'po slevě ' + base + ' Kč' : null,
      after: 'Za ' + pieces + ' zaplatíte ' + total + ' Kč'
    };
    const plain = {
      price: regular, v: regular * need,
      title: 'Obchod ' + shops[1], lines: [g.n + ', 1 kus', 'bez akce'],
      after: 'Za ' + pieces + ' zaplatíte ' + regular * need + ' Kč'
    };
    return {
      offers: U.shuffle([promo, plain]),
      question: 'Potřebujete ' + pieces + '. Kde zaplatíte méně?',
      head: g
    };
  }

  function offerNode(o, emo) {
    const unit = h('span', { class: 'offer-after' });
    const node = h('span', { class: 'offer', 'data-v': o.v },
      h('span', { class: 'offer-emo emo', 'aria-hidden': 'true' }, emo),
      h('span', { class: 'offer-text' },
        h('span', { class: 'offer-title' }, o.title),
        o.lines.map((l) => h('span', { class: 'offer-line' + (/^Akce|^Druhý|^Sleva/.test(l) ? ' is-promo' : '') }, l))),
      h('span', { class: 'offer-price' }, h('strong', null, String(o.price), h('span', { class: 'offer-kc' }, ' Kč')), o.priceNote ? h('small', null, o.priceNote) : null),
      unit);
    return { node: node, unit: unit };
  }

  SM.registerGame({
    id: 'vyhodne',
    name: 'Výhodný nákup',
    domain: 'logika',
    trains: 'úsudek s cenami a množstvím při nakupování',
    short: 'Poznejte, co vyjde levněji.',
    duration: 'asi 2 minuty',
    pace: { per: 'na nákup' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      if (L.kind === 'same') return ['Stejné zboží je ve dvou obchodech za různou cenu.', 'Klepněte na obchod, kde nakoupíte levněji.'];
      if (L.kind === 'promo') return [
        'Jeden obchod má akci, druhý ne. Dozvíte se, kolik kusů potřebujete.',
        'Spočítejte, kolik celkem zaplatíte v každém obchodě, a klepněte na ten levnější.',
        'Pozor: akce není vždycky výhodnější.'
      ];
      return [
        'Uvidíte stejné zboží v různě velkých baleních.',
        'Porovnejte, kolik vás stojí stejné množství, třeba 1 kg. Větší balení nebývá vždy levnější.',
        'Klepněte na výhodnější balení.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      let correct = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        const t = makeTask(L);
        ctx.status(t.question);
        const made = t.offers.map((o) => offerNode(o, t.head.e));
        ctx.clear();
        const wrap = h('div', { class: 'offers-wrap' });
        ctx.stage.appendChild(wrap);
        const opts = t.offers.map((o, k) => ({
          node: made[k].node, value: k,
          aria: o.title + ', ' + o.lines.join(', ') + ', ' + o.price + ' korun' + (o.priceNote ? ', ' + o.priceNote : '')
        }));
        const r = await K.choose(ctx, opts, { answer: t.answer, layout: 'col', cls: 'is-offers', container: wrap });
        made.forEach((m, k) => { m.unit.textContent = t.offers[k].after; });
        made[t.answer].node.appendChild(h('span', { class: 'offer-best' }, U.svg(SM.icons.check), 'Výhodnější'));
        if (r.correct) correct++;
        ctx.status(r.correct ? 'Správně, tahle nabídka je výhodnější.' : 'Výhodnější je nabídka s nápisem „Výhodnější“. Podívejte se proč:');
        if (r.correct) await ctx.sleep(2400);
        else await K.next(ctx, i === N - 1 ? 'Pokračovat' : 'Další nákup');
      }
      const acc = correct / N;
      ctx.finish({
        perf: acc, levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: correct + ' z ' + N, bigLabel: 'nákupů vybraných výhodně',
        details: [], metric: { acc: Math.round(acc * 100) }
      });
    }
  });
})();
