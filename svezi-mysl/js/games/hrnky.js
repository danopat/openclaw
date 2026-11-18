/* Tři hrnky: měnit, nebo ne? — pokus s pravděpodobností (známá úloha se třemi dveřmi).
   Hráč vybere hrnek, jeden prázdný se zvedne a hráč se rozhodne, jestli volbu změní. Na konci statistika a vysvětlení obrázkem.
   Nejde o výkon: úspěšnost je, jak často hráč zvolil výhodnější možnost (vyměnit). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const CUP = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path class="hr-handle" d="M74 34c16 0 18 30 2 32" fill="none" stroke-width="9" stroke-linecap="round"/>' +
    '<path class="hr-cup" d="M24 14h52l8 74H16z"/><path class="hr-rim" d="M14 84h72v8H14z"/><path class="hr-band" d="M21 40h58l1.6 12H19.4z"/></svg>';
  const BALL = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="72" r="15" class="hr-ball"/><circle cx="45" cy="67" r="4.5" fill="#fff" opacity=".7"/></svg>';

  SM.registerGame({
    id: 'hrnky',
    name: 'Tři hrnky',
    domain: 'rozhodovani',
    trains: 'úvahy o pravděpodobnosti',
    short: 'Pod kterým hrnkem je kulička? Měnit, nebo ne?',
    duration: 'asi 3 minuty',
    maxLevel: 1,
    howTo() {
      return ['Pod jedním ze tří hrnků je kulička. Vyberte hrnek.',
        'Potom zvednu jeden z ostatních hrnků, pod kterým kulička není.',
        'Rozhodněte se: necháte si svůj hrnek, nebo ho vyměníte za ten druhý, ještě zakrytý?',
        'Je to pokus: zkoušejte obojí. Na konci uvidíte, co vycházelo líp, a proč.'];
    },
    async run(ctx) {
      const N = ctx.short ? 5 : 10;
      const st = { stay: { n: 0, win: 0 }, swap: { n: 0, win: 0 } };
      for (let i = 0; i < N; i++) {
        ctx.progress('Kolo ' + (i + 1) + ' z ' + N);
        await round();
      }
      await explain();
      const acc = st.swap.n / N;
      const wins = st.stay.win + st.swap.win;
      ctx.finish({
        perf: 1, acc: acc,
        levelDelta: 0,
        big: wins + ' z ' + N, bigLabel: 'kol s kuličkou',
        details: ['Vyměnili jste ' + st.swap.n + '× a vyhráli ' + st.swap.win + '×.', 'Nechali jste si hrnek ' + st.stay.n + '× a vyhráli ' + st.stay.win + '×.'],
        metric: { swap: st.swap.n, swapWin: st.swap.win, stay: st.stay.n, stayWin: st.stay.win }
      });

      async function round() {
        const ball = U.randInt(0, 2);
        ctx.clear();
        const cups = [0, 1, 2].map((i) => h('button', { class: 'hr-slot', type: 'button', 'aria-label': 'Hrnek ' + (i + 1) },
          h('span', { class: 'hr-under' }), h('span', { class: 'hr-cupwrap' })));
        cups.forEach((c) => { c.querySelector('.hr-cupwrap').innerHTML = CUP; });
        const table = h('div', { class: 'hr-table', 'data-ball': ball }, cups);
        ctx.stage.appendChild(h('div', { class: 'stack hrnky' }, table));
        ctx.status('Pod kterým hrnkem je kulička?');
        const first = await new Promise((resolve) => {
          let done = false;
          cups.forEach((c, i) => U.tap(c, () => { if (!done && ctx.alive) { done = true; resolve(i); } }));
        });
        ctx.sound.tap();
        cups.forEach((c) => { c.disabled = true; });
        cups[first].classList.add('is-picked');
        table.dataset.pick = first;
        // Zvednu prázdný hrnek, který hráč nevybral.
        const empty = U.pick([0, 1, 2].filter((i) => i !== first && i !== ball));
        const other = [0, 1, 2].find((i) => i !== first && i !== empty);
        await ctx.sleep(600);
        cups[empty].classList.add('is-up');
        ctx.status('Pod tímhle hrnkem nic není. Necháte si svůj, nebo ho vyměníte?');
        table.dataset.ask = '1';
        // Rozhodnutí není správně ani špatně, proto obyčejná tlačítka bez zelené a červené.
        const choice = await new Promise((resolve) => {
          let done = false;
          ctx.foot.textContent = '';
          [['stay', 'Nechat si svůj'], ['swap', 'Vyměnit']].forEach((o) => {
            const b = h('button', { class: 'btn btn-secondary btn-lg hr-decide', type: 'button', 'data-v': o[0] }, o[1]);
            U.tap(b, () => { if (!done && ctx.alive) { done = true; ctx.sound.tap(); resolve(o[0]); } });
            ctx.foot.appendChild(b);
          });
        });
        ctx.foot.textContent = '';
        delete table.dataset.ask;
        const final = choice === 'swap' ? other : first;
        if (choice === 'swap') { cups[first].classList.remove('is-picked'); cups[other].classList.add('is-picked'); }
        await ctx.sleep(500);
        // Odkrýt: kulička se ukáže pod svým hrnkem.
        cups[ball].querySelector('.hr-under').innerHTML = BALL;
        cups.forEach((c, i) => { if (i !== empty) c.classList.add('is-up'); });
        const win = final === ball;
        st[choice].n++;
        if (win) st[choice].win++;
        if (win) ctx.feedback(true); // prohra je jen smůla, ne chyba
        ctx.status(win ? 'Kulička je vaše!' : 'Kulička byla pod jiným hrnkem.');
        table.classList.add('is-done');
        await ctx.sleep(win ? 1200 : 1600);
      }

      /* Statistika a vysvětlení obrázkem: tři možná místa kuličky, co se stane, když nezměníte a když změníte. */
      async function explain() {
        ctx.clear();
        ctx.progress('Jak to vyšlo');
        ctx.status('Co vycházelo líp?');
        const row = (label, s) => h('tr', null, h('th', null, label), h('td', null, s.n + '×'), h('td', null, 'kulička ' + s.win + '×'));
        const mini = (ball) => h('span', { class: 'hr-mini', role: 'img', 'aria-label': 'Kulička pod ' + (ball + 1) + '. hrnkem' },
          [0, 1, 2].map((i) => h('span', { class: 'hr-m' + (i === ball ? ' is-ball' : '') + (i === 0 ? ' is-pick' : '') })));
        const res = (win) => h('td', { class: win ? 'hr-good' : 'hr-bad' }, win ? 'výhra' : 'prohra');
        const stats = h('table', { class: 'hr-stats' }, h('tbody', null, row('Vyměnit', st.swap), row('Nechat si', st.stay)));
        const why = [h('p', null, 'Proč? Vyberete třeba první hrnek (orámovaný):'),
          h('table', { class: 'hr-cases' },
            h('thead', null, h('tr', null, h('th', null, 'Kulička'), h('th', null, 'Nechat si'), h('th', null, 'Vyměnit'))),
            h('tbody', null, [0, 1, 2].map((b) => h('tr', null, h('td', null, mini(b)), res(b === 0), res(b !== 0))))),
          h('p', { class: 'hr-sum' }, 'Výměna vyhraje ve 2 případech ze 3. Vyplatí se měnit.')];
        const box = h('div', { class: 'stack hr-explain' }, stats, why);
        ctx.stage.appendChild(box);
        let nx = K.next(ctx, 'Hotovo');
        box.style.maxHeight = ctx.stage.clientHeight + 'px'; // když se nevejde ani tak, dá se posunout
        if (box.scrollHeight > ctx.stage.clientHeight + 14) { // dolní okraj seznamu se nepočítá
          // Malý displej nebo velké písmo: nejdřív výsledky, pak vysvětlení.
          why.forEach((el) => { el.hidden = true; });
          nx = K.next(ctx, 'Proč to tak je?');
          await nx;
          stats.hidden = true;
          why.forEach((el) => { el.hidden = false; });
          ctx.status('Proč se vyplatí měnit?');
          nx = K.next(ctx, 'Hotovo');
        }
        await nx;
      }
    }
  });
})();
