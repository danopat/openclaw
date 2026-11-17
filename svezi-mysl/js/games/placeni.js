/* Placení — zaplatit přesnou částku mincemi a bankovkami, spočítat, kolik vrátí (počty v běžném životě). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const LEVELS = [
    { min: 3, max: 20, money: [1, 2, 5, 10] },
    { min: 11, max: 50, money: [1, 2, 5, 10, 20] },
    { min: 21, max: 99, money: [1, 2, 5, 10, 20, 50] },
    { min: 61, max: 390, money: [1, 2, 5, 10, 20, 50, 100, 200] },
    { min: 61, max: 390, money: [1, 2, 5, 10, 20, 50, 100, 200], change: true }
  ];
  const GOODS = [['🍞', 'Chléb'], ['🥛', 'Mléko'], ['🧈', 'Máslo'], ['🍎', 'Jablka'], ['☕', 'Káva'], ['🧀', 'Sýr'], ['🥚', 'Vejce'],
    ['🍌', 'Banány'], ['📰', 'Noviny'], ['💐', 'Květiny'], ['🧼', 'Mýdlo'], ['🍫', 'Čokoláda'], ['🍯', 'Med'], ['🍪', 'Sušenky']];
  const NOTES = [100, 200];

  function minPieces(amount) {
    let n = 0;
    [200, 100, 50, 20, 10, 5, 2, 1].forEach((v) => { n += Math.floor(amount / v); amount %= v; });
    return n;
  }
  function piece(v, small) {
    const note = NOTES.indexOf(v) !== -1;
    return h('span', { class: (note ? 'note-money' : 'coin') + ' m' + v + (small ? ' is-small' : ''), 'aria-hidden': 'true' },
      h('b', null, String(v)), h('small', null, 'Kč'));
  }

  SM.registerGame({
    id: 'placeni',
    name: 'Placení',
    domain: 'logika',
    trains: 'počítání v hlavě a zacházení s penězi',
    short: 'Zaplaťte přesnou částku.',
    duration: 'asi 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const steps = [
        'Jste u pokladny. Uvidíte, kolik nákup stojí.',
        'Klepáním na mince a bankovky je položte na pult. Klepnutím na peníze na pultu je zase vrátíte.',
        'Až bude na pultu přesná částka, klepněte na „Zaplatit“.'
      ];
      if (LEVELS[level - 1].change) steps.push('Někdy se zeptáme, kolik vám prodavač vrátí.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 3 : 5;
      const scores = [];
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        const good = U.pick(GOODS);
        const price = U.randInt(L.min, L.max);
        if (L.change && i % 2 === 1) scores.push(await changeRound(good, price));
        else scores.push(await payRound(good, price));
      }
      const perf = U.mean(scores);
      const ok = scores.filter((s) => s >= 0.6).length;
      ctx.finish({
        perf: perf, levelDelta: perf >= 0.85 ? 1 : perf < 0.5 ? -1 : 0,
        big: ok + ' z ' + N, bigLabel: 'nákupů jste zaplatili správně',
        details: [], metric: { perf: Math.round(perf * 100) }
      });

      function receipt(good, price, extra) {
        return h('div', { class: 'receipt' },
          h('div', { class: 'receipt-row' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, good[0]), h('span', null, good[1]), h('strong', null, price + ' Kč')),
          extra || null);
      }

      function payRound(good, price) {
        return new Promise((resolve) => {
          let tries = 0;
          const onTable = [];
          ctx.status('Zaplaťte přesně ' + price + ' Kč.');
          ctx.stage.textContent = '';
          ctx.foot.textContent = '';
          const sumEl = h('strong', null, '0 Kč');
          const table = h('div', { class: 'counter', 'aria-label': 'Pult' });
          const tray = h('div', { class: 'tray' });
          const pay = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: true }, 'Zaplatit');
          const sum = () => onTable.reduce((s, v) => s + v, 0);
          const render = () => {
            table.textContent = '';
            if (!onTable.length) table.appendChild(h('span', { class: 'counter-empty' }, 'Pult je zatím prázdný'));
            onTable.forEach((v, idx) => {
              const b = h('button', { class: 'money-btn', type: 'button', 'aria-label': 'Vrátit ' + v + ' Kč' }, piece(v, true));
              U.tap(b, () => { onTable.splice(idx, 1); ctx.sound.tap(); render(); });
              table.appendChild(b);
            });
            sumEl.textContent = sum() + ' Kč';
            pay.disabled = !onTable.length;
          };
          L.money.forEach((v) => {
            const b = h('button', { class: 'money-btn', type: 'button', 'aria-label': 'Položit ' + v + ' Kč' }, piece(v));
            U.tap(b, () => { if (onTable.length < 30) { onTable.push(v); ctx.sound.tap(); render(); } });
            tray.appendChild(b);
          });
          U.tap(pay, async () => {
            if (pay.disabled) return;
            const s = sum();
            if (s === price) {
              pay.disabled = true;
              ctx.feedback(true);
              const best = onTable.length <= minPieces(price);
              ctx.status(best ? 'Přesně tak, a nejmenším počtem mincí!' : 'Správně zaplaceno!');
              await ctx.sleep(1400);
              resolve((tries === 0 ? 1 : 0.6) * (best ? 1 : 0.9));
              return;
            }
            tries++;
            ctx.feedback(false);
            if (tries >= 2) {
              pay.disabled = true;
              onTable.length = 0;
              [200, 100, 50, 20, 10, 5, 2, 1].forEach((v) => { if (L.money.indexOf(v) !== -1) { while (sum() + v <= price) onTable.push(v); } });
              render();
              pay.disabled = true;
              ctx.status('Takto by to šlo: ' + price + ' Kč.');
              await ctx.sleep(2600);
              resolve(0);
              return;
            }
            ctx.status(s < price ? 'Ještě chybí ' + (price - s) + ' Kč.' : 'To je o ' + (s - price) + ' Kč víc.');
          });
          ctx.stage.appendChild(h('div', { class: 'stack shop' },
            receipt(good, price),
            h('p', { class: 'counter-sum' }, 'Na pultu: ', sumEl),
            table, tray));
          ctx.foot.appendChild(pay);
          render();
        });
      }

      async function changeRound(good, price) {
        const paid = price <= 100 ? 100 : price <= 200 ? 200 : 500;
        const answer = paid - price;
        ctx.status('Kolik vám vrátí?');
        K.show(ctx, receipt(good, price, h('p', { class: 'receipt-note' }, 'Platíte ' + (paid === 500 ? 'pětistovkou' : paid === 200 ? 'dvousetkorunou' : 'stokorunou') + '.')));
        const wrong = [];
        [answer + 10, answer - 10, answer + 1, answer - 1, answer + 100].forEach((v) => { if (v > 0 && v !== answer && wrong.indexOf(v) === -1) wrong.push(v); });
        const opts = U.shuffle([answer].concat(wrong.slice(0, 3))).map((v) => ({ label: v + ' Kč', value: v }));
        const r = await K.choose(ctx, opts, { answer: answer, layout: 'grid', cls: 'is-mono' });
        ctx.status(r.correct ? 'Správně!' : paid + ' − ' + price + ' = ' + answer + ' Kč.');
        await ctx.sleep(r.correct ? 1000 : 2400);
        return r.correct ? 1 : 0;
      }
    }
  });
})();
