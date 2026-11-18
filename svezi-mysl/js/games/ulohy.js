/* Slovní úlohy — krátké úlohy z běžného života: porozumět textu a převést ho na výpočet. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const R = U.randInt;
  /* Šablony: vytvoří { q, a (správně), wrong: [podobné chyby], hint (první krok), why (řešení) }.
     Úroveň: 1 = jeden krok, 2 = dva kroky, 3 = zlomky a procenta, 4 = dvě neznámé. */
  const T = [
    [1, () => { const a = R(14, 30), b = R(3, 9); return { q: 'Babička upekla ' + a + ' koláčů a ' + b + ' jich dala sousedům. Kolik koláčů jí zbylo?', a: a - b, wrong: [a + b, a - b + 1, a - b - 2], hint: 'Od upečených koláčů odečtěte ty rozdané.', why: a + ' − ' + b + ' = ' + (a - b) }; }],
    [1, () => { const p = R(3, 6), n = R(4, 9); return { q: 'Rohlík stojí ' + p + ' Kč. Kolik zaplatíte za ' + n + ' rohlíků?', a: p * n, wrong: [p + n, p * n + p, p * (n - 1)], hint: 'Cenu jednoho rohlíku vynásobte počtem rohlíků.', why: n + ' × ' + p + ' Kč = ' + p * n + ' Kč' }; }],
    [1, () => { const a = R(8, 16), d = R(50, 62); return { q: 'Vnukovi je ' + a + ' let. Babička je o ' + d + ' let starší. Kolik let je babičce?', a: a + d, wrong: [d - a, a + d - 10, a + d + 1], hint: 'K věku vnuka přičtěte rozdíl.', why: a + ' + ' + d + ' = ' + (a + d) }; }],
    [1, () => { const n = R(3, 5), k = R(4, 7); return { q: 'Máte ' + n * k + ' tulipánů a rozdělíte je stejně do ' + n + ' váz. Kolik tulipánů bude v každé váze?', a: k, wrong: [k + 1, k - 1, n * k - n], hint: 'Počet tulipánů vydělte počtem váz.', why: n * k + ' : ' + n + ' = ' + k }; }],
    [2, () => { const a = R(15, 30), b = R(3, 9), c = R(2, 8); return { q: 'V autobuse sedělo ' + a + ' lidí. Na zastávce ' + b + ' vystoupilo a ' + c + ' nastoupilo. Kolik lidí je teď v autobuse?', a: a - b + c, wrong: [a + b - c, a - b - c, a + b + c], hint: 'Nejdřív odečtěte ty, kdo vystoupili, potom přičtěte ty, kdo nastoupili.', why: a + ' − ' + b + ' + ' + c + ' = ' + (a - b + c) }; }],
    [2, () => { const n = R(3, 6), p = R(4, 7), m = R(19, 29); return { q: 'Koupíte ' + n + ' rohlíků po ' + p + ' Kč a mléko za ' + m + ' Kč. Kolik zaplatíte celkem?', a: n * p + m, wrong: [n + p + m, n * p, (n + 1) * p + m], hint: 'Spočítejte nejdřív, kolik stojí rohlíky.', why: n + ' × ' + p + ' + ' + m + ' = ' + (n * p + m) + ' Kč' }; }],
    [2, () => { const n = R(3, 6), p = R(9, 15); return { q: 'Koupíte ' + n + ' jogurtů po ' + p + ' Kč a platíte stokorunou. Kolik dostanete zpátky?', a: 100 - n * p, wrong: [n * p, 100 - n * p + p, 100 - p], hint: 'Spočítejte cenu jogurtů a odečtěte ji od 100 Kč.', why: '100 − ' + n + ' × ' + p + ' = ' + (100 - n * p) + ' Kč' }; }],
    [2, () => { const N = R(15, 25) * 10, k = R(12, 25), d = R(3, 6); return { q: 'Kniha má ' + N + ' stran. Každý den přečtete ' + k + ' stran. Kolik stran vám zbude po ' + d + ' dnech?', a: N - k * d, wrong: [k * d, N - k - d, N - k * (d - 1)], hint: 'Zjistěte, kolik stran přečtete za ' + d + ' dny.', why: N + ' − ' + d + ' × ' + k + ' = ' + (N - k * d) }; }],
    [3, () => { const p = R(8, 30) * 100, q = U.pick([10, 20, 25, 50]); const a = p - p * q / 100; return { q: 'Bunda stála ' + p + ' Kč. Zlevnili ji o ' + q + ' %. Kolik teď stojí?', a: a, wrong: [p * q / 100, p - q, a + p * 0.05], hint: 'Spočítejte, kolik je ' + q + ' % z ' + p + ' Kč.', why: q + ' % z ' + p + ' je ' + (p * q / 100) + ', takže ' + p + ' − ' + (p * q / 100) + ' = ' + a + ' Kč' }; }],
    [3, () => { const n = R(4, 10) * 3; return { q: 'V košíku je ' + n + ' jablek. Třetina z nich je červená. Kolik jablek není červených?', a: n - n / 3, wrong: [n / 3, n - 3, n / 2], hint: 'Nejdřív zjistěte, kolik je třetina z ' + n + '.', why: 'třetina z ' + n + ' je ' + n / 3 + ', takže ' + n + ' − ' + n / 3 + ' = ' + (n - n / 3) }; }],
    [3, () => { const n = U.pick([8, 12, 16]); return { q: 'Pizza je nakrájená na ' + n + ' dílků. Snědli jste čtvrtinu. Kolik dílků zbylo?', a: n - n / 4, wrong: [n / 4, n - 4, n / 2], hint: 'Kolik je čtvrtina z ' + n + ' dílků?', why: 'čtvrtina z ' + n + ' je ' + n / 4 + ', zbylo ' + n + ' − ' + n / 4 + ' = ' + (n - n / 4) }; }],
    [4, () => { const r = R(3, 8), s = R(4, 10); const hl = r + s, l = 4 * r + 2 * s; return { q: 'Na dvoře jsou slepice a králíci. Mají dohromady ' + hl + ' hlav a ' + l + ' nohou. Kolik je tam králíků?', a: r, wrong: [s, Math.round(l / 4), hl - r + 1], hint: 'Kdyby všechna zvířata měla jen dvě nohy, měla by ' + 2 * hl + ' nohou. Každý králík má o dvě navíc.', why: '(' + l + ' − ' + 2 * hl + ') : 2 = ' + r + ' králíků' }; }],
    [4, () => { const y = R(5, 12), d = R(2, 6); const sum = 2 * y + d; return { q: 'Dvě vnučky mají dohromady ' + sum + ' let. Starší je o ' + d + ' roky starší. Kolik let je mladší?', a: y, wrong: [y + d, sum / 2, y - 1], hint: 'Odečtěte rozdíl a zbytek rozdělte napůl.', why: '(' + sum + ' − ' + d + ') : 2 = ' + y }; }],
    [4, () => { const k = R(15, 30), d = R(10, 25); const sum = 2 * k + d; return { q: 'Káva a koláč stojí dohromady ' + sum + ' Kč. Koláč je o ' + d + ' Kč dražší než káva. Kolik stojí káva?', a: k, wrong: [sum - d, k + d, Math.round(sum / 2)], hint: 'Pozor, není to ' + (sum - d) + ' Kč. Odečtěte rozdíl a zbytek rozdělte napůl.', why: '(' + sum + ' − ' + d + ') : 2 = ' + k + ' Kč' }; }]
  ];
  const LEVELS = [{ max: 1 }, { max: 2 }, { max: 3 }, { max: 4 }];

  function makeTask(L, used) {
    for (let t = 0; t < 100; t++) {
      const pool = T.map((x, i) => [x, i]).filter((x) => x[0][0] <= L.max && (x[0][0] >= L.max - 1 || L.max === 1) && used.indexOf(x[1]) === -1);
      const pick = U.pick(pool.length ? pool : T.map((x, i) => [x, i]).filter((x) => x[0][0] <= L.max));
      const task = pick[0][1]();
      const opts = [task.a].concat(task.wrong).filter((v, i, a) => v > 0 && Number.isInteger(v) && a.indexOf(v) === i);
      if (opts.length < 4 || opts[0] !== task.a) continue;
      task.opts = opts.slice(0, 4);
      task.id = pick[1];
      return task;
    }
    return null;
  }

  SM.registerGame({
    id: 'ulohy',
    name: 'Slovní úlohy',
    domain: 'logika',
    trains: 'porozumění textu a převod na výpočet',
    short: 'Krátké úlohy z běžného života.',
    duration: 'asi 3 minuty',
    pace: { per: 'na úlohu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const steps = [
        'Přečtěte si krátkou úlohu z běžného života a vyberte správnou odpověď ze čtyř možností. Čas nehraje roli.',
        'Tlačítko „Nápověda“ ukáže první krok. Po odpovědi uvidíte celé řešení.'
      ];
      if (level >= 3) steps.push('Na této úrovni přibývají zlomky a procenta' + (level >= 4 ? ' a úlohy se dvěma neznámými (slepice a králíci).' : '.'));
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 2 : 4;
      const used = [];
      let score = 0, good = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Úloha ' + (i + 1) + ' z ' + N);
        const t = makeTask(L, used);
        used.push(t.id);
        const r = await ask(t);
        score += r;
        if (r === 1) good++;
      }
      const acc = score / N;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: good + ' z ' + N, bigLabel: 'úloh bez nápovědy',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      /* Jedna úloha. Vrací 1 (správně bez nápovědy), 0,5 (s nápovědou) nebo 0. */
      async function ask(t) {
        ctx.clear();
        ctx.status('Vyberte odpověď.');
        const hintEl = h('p', { class: 'uloha-hint', 'aria-live': 'polite' });
        let hinted = false;
        const hintBtn = h('button', { class: 'btn btn-quiet btn-small uloha-hint-btn', type: 'button' }, SM.ui.icon('bulb'), 'Nápověda');
        U.tap(hintBtn, () => {
          if (hinted) return;
          hinted = true;
          hintBtn.disabled = true;
          hintEl.textContent = t.hint;
          ctx.sound.tap();
        });
        const nb = (x) => String(x).replace(/ (Kč|%)/g, '\u00a0$1');
        const box = h('div', { class: 'stack ulohy', 'data-a': t.a }, h('p', { class: 'uloha-q' }, nb(t.q)), hintBtn, hintEl);
        ctx.stage.appendChild(box);
        const t0 = performance.now();
        const unit = /stojí|zaplatíte|zpátky/.test(t.q) ? '\u00a0Kč' : '';
        const r = await K.choose(ctx, U.shuffle(t.opts).map((v) => ({ value: v, label: v + unit })), { answer: t.a, layout: 'grid', cls: 'is-answers', noMark: true });
        ctx.mark(r.correct && !hinted, (performance.now() - t0) / SM.timeScale);
        hintBtn.disabled = true;
        box.appendChild(h('p', { class: 'uloha-why' }, h('b', null, r.correct ? 'Správně. ' : 'Správně je ' + t.a + unit + '. '), 'Řešení: ' + nb(t.why) + '.'));
        ctx.status(r.correct ? 'Správně!' : 'Tentokrát ne.');
        await K.next(ctx, 'Pokračovat');
        return r.correct ? (hinted ? 0.5 : 1) : 0;
      }
    }
  });
})();
