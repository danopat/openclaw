/* Najdi pravidlo — ze tří příkladů proměny obrázku odvodit pravidlo a použít ho na čtvrtý (abstraktní uvažování). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Obrázek = mřížka 3 × 3; políčko je prázdné, nebo tvar (kolečko, čtvereček, trojúhelník), plný nebo prázdný. */
  const SHAPES = ['c', 's', 't'];
  const rc = (i) => [Math.floor(i / 3), i % 3];
  const at = (r, c) => r * 3 + c;
  const move = (pic, f) => { const out = Array(9).fill(null); pic.forEach((x, i) => { if (x) { const p = rc(i); const q = f(p[0], p[1]); out[at(q[0], q[1])] = x; } }); return out; };
  /* Pravidla: funkce a popis slovy. */
  const RULES = {
    rot: { f: (p) => move(p, (r, c) => [c, 2 - r]), text: 'obrázek se otočí o čtvrt otáčky doprava' },
    flip: { f: (p) => move(p, (r, c) => [r, 2 - c]), text: 'obrázek se zrcadlově převrátí zleva doprava' },
    right: { f: (p) => move(p, (r, c) => [r, (c + 1) % 3]), text: 'všechno se posune o políčko doprava (z kraje zpět na začátek)' },
    down: { f: (p) => move(p, (r, c) => [(r + 1) % 3, c]), text: 'všechno se posune o políčko dolů (zespodu zpět nahoru)' },
    fill: { f: (p) => p.map((x) => (x ? { s: x.s, f: !x.f } : null)), text: 'plné tvary budou prázdné a prázdné plné' },
    swap: { f: (p) => p.map((x) => (x ? { s: x.s === 'c' ? 's' : x.s === 's' ? 'c' : 't', f: x.f } : null)), text: 'kolečka se změní na čtverečky a čtverečky na kolečka' }
  };
  const NAMES = Object.keys(RULES);
  const apply = (rules, p) => rules.reduce((acc, r) => RULES[r].f(acc), p);
  const same = (a, b) => a.every((x, i) => (!x && !b[i]) || (x && b[i] && x.s === b[i].s && x.f === b[i].f));
  const textOf = (rules) => rules.map((r) => RULES[r].text).join(' a zároveň ');

  /* rules = kolik pravidel naráz, opts = možností. */
  const LEVELS = [{ rules: 1, opts: 3 }, { rules: 1, opts: 4 }, { rules: 2, opts: 4 }, { rules: 2, opts: 5 }];

  function randomPic() {
    for (let t = 0; t < 50; t++) {
      const p = Array(9).fill(null);
      const n = U.randInt(3, 4);
      U.sample(Array.from({ length: 9 }, (_, i) => i), n).forEach((i) => { p[i] = { s: U.pick(SHAPES), f: Math.random() < 0.5 }; });
      if (p.some((x) => x && x.f) && p.some((x) => x && !x.f) && p.some((x) => x && x.s !== 't')) return p;
    }
    return [{ s: 'c', f: true }, null, null, null, { s: 's', f: false }, null, null, null, { s: 't', f: true }];
  }

  /* Všechna pravidla (i dvojice), která se dají zaměnit. */
  const combos = (k) => (k === 1 ? NAMES.map((a) => [a]) : NAMES.flatMap((a) => NAMES.filter((b) => b !== a).map((b) => [a, b])).concat(NAMES.map((a) => [a])));

  function makeTask(L) {
    for (let t = 0; t < 500; t++) {
      const rules = U.sample(NAMES, L.rules);
      const ex = [randomPic(), randomPic(), randomPic()];
      const outs = ex.map((p) => apply(rules, p));
      if (ex.some((p, i) => same(p, outs[i]))) continue;
      const test = randomPic();
      const answer = apply(rules, test);
      if (same(answer, test)) continue;
      // Odpověď musí být jednoznačná: každé pravidlo, které sedí na všechny příklady, dá stejný výsledek.
      const fits = combos(L.rules).filter((c) => ex.every((p, i) => same(apply(c, p), outs[i])));
      if (fits.some((c) => !same(apply(c, test), answer))) continue;
      // Špatné možnosti: jiná pravidla použitá na stejný obrázek (podobné chyby).
      const wrong = [];
      U.shuffle(combos(L.rules)).forEach((c) => {
        if (wrong.length >= L.opts - 1) return;
        const w = apply(c, test);
        if (same(w, answer) || same(w, test) || wrong.some((x) => same(x, w))) return;
        wrong.push(w);
      });
      if (wrong.length < L.opts - 1) continue;
      return { rules: rules, ex: ex, outs: outs, test: test, answer: answer, wrong: wrong };
    }
    return null;
  }

  function shapeSvg(x) {
    const fill = x.f ? 'currentColor' : 'none';
    if (x.s === 'c') return '<circle cx="10" cy="10" r="6.5" fill="' + fill + '" stroke="currentColor" stroke-width="2.2"/>';
    if (x.s === 's') return '<rect x="4" y="4" width="12" height="12" rx="1.5" fill="' + fill + '" stroke="currentColor" stroke-width="2.2"/>';
    return '<path d="M10 3.5 16.5 15.5H3.5z" fill="' + fill + '" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>';
  }
  function picNode(p, cls) {
    const g = h('span', { class: 'rpic' + (cls ? ' ' + cls : '') });
    p.forEach((x) => {
      const c = h('span', { class: 'rpic-c' });
      if (x) c.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true">' + shapeSvg(x) + '</svg>';
      g.appendChild(c);
    });
    return g;
  }
  const describe = (p) => p.map((x, i) => (x ? (x.f ? 'plný ' : 'prázdný ') + ({ c: 'kroužek', s: 'čtvereček', t: 'trojúhelník' })[x.s] + ' v řádku ' + (rc(i)[0] + 1) + ', sloupci ' + (rc(i)[1] + 1) : null)).filter(Boolean).join('; ');

  SM.registerGame({
    id: 'pravidlo',
    name: 'Najdi pravidlo',
    domain: 'logika',
    trains: 'abstraktní uvažování: z příkladů odvodit pravidlo',
    short: 'Podle tří příkladů doplňte čtvrtý obrázek.',
    duration: 'asi 2 až 3 minuty',
    pace: { per: 'na úlohu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      return [
        'Uvidíte tři příklady: obrázek vlevo se podle stejného pravidla promění na obrázek vpravo.',
        L.rules > 1 ? 'Na této úrovni platí dvě pravidla zároveň, třeba otočení a výměna tvarů.' : 'Pravidlo může být třeba otočení, zrcadlení, posunutí nebo výměna plných a prázdných tvarů.',
        'U čtvrtého obrázku vyberte, jak bude vypadat po proměně. Po odpovědi pravidlo vypíšeme slovy.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      let ok = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Úloha ' + (i + 1) + ' z ' + N);
        if (await task(makeTask(L))) ok++;
      }
      const acc = ok / N;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: ok + ' z ' + N, bigLabel: 'pravidel uhodnutých',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      async function task(t) {
        ctx.clear();
        ctx.status('Jak bude vypadat poslední obrázek?');
        const arrow = () => h('span', { class: 'rarrow', 'aria-hidden': 'true' }, '→');
        const rows = t.ex.map((p, i) => h('div', { class: 'rrow', 'aria-label': 'Příklad ' + (i + 1) + ': ' + describe(p) + ' se změní na ' + describe(t.outs[i]) }, picNode(p), arrow(), picNode(t.outs[i])));
        const q = h('span', { class: 'rpic is-q', 'aria-label': 'Hledaný obrázek' }, '?');
        rows.push(h('div', { class: 'rrow is-test', 'aria-label': 'Úkol: ' + describe(t.test) }, picNode(t.test), arrow(), q));
        const opts = U.shuffle([t.answer].concat(t.wrong));
        const box = h('div', { class: 'stack pravidlo', 'data-right': opts.indexOf(t.answer) }, h('div', { class: 'rrows' }, rows));
        ctx.stage.appendChild(box);
        const t0 = performance.now();
        const wait = K.choose(ctx, opts.map((p, k) => ({ value: k, label: 'Možnost ' + (k + 1), aria: 'Možnost ' + (k + 1) + ': ' + describe(p), node: picNode(p, 'is-opt') })), { answer: opts.indexOf(t.answer), layout: 'row', cls: 'is-rules', noMark: true });
        fit(box);
        const r = await wait;
        ctx.mark(r.correct, (performance.now() - t0) / SM.timeScale);
        q.replaceWith(picNode(t.answer, 'is-done'));
        const txt = textOf(t.rules);
        ctx.status((r.correct ? 'Správně! ' : 'Pravidlo: ') + txt.charAt(0).toUpperCase() + txt.slice(1) + '.');
        await K.next(ctx, 'Pokračovat', { keep: false });
        return r.correct;
      }

      /* Velikost obrázků podle místa. */
      function fit(box) {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
        const avail = ctx.stage.clientHeight - 24;
        const size = Math.floor(U.clamp((avail - 3 * 0.5 * rem) / 4, 44, 96));
        box.style.setProperty('--rp', size + 'px');
        ctx.foot.style.setProperty('--rp', Math.floor(U.clamp(size, 44, 72)) + 'px');
      }
    }
  });
})();
