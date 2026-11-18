/* Vynesené karty — zapamatovat si, které mariášové karty už padly na stůl (pracovní paměť, sledování). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Barvy mariášových karet: název, přívlastek do otázky, barva symbolu a vlastní jednoduchý symbol (SVG 40 × 40). */
  const SUITS = [
    { id: 'srdce', name: 'srdce', adj: 'srdcov', color: '#c62828',
      svg: '<path d="M20 34C9 26 5 20 5 14a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 6-4 12-15 20z"/>' },
    { id: 'kule', name: 'kule', adj: 'kulov', color: '#d9901a',
      svg: '<circle cx="20" cy="21" r="13"/><path d="M8 21h24" stroke="#5a3a00" stroke-width="2.5"/><circle cx="20" cy="27" r="3" fill="#5a3a00"/><circle cx="20" cy="6" r="3"/>' },
    { id: 'listy', name: 'listy', adj: 'zelen', color: '#2e7d32',
      svg: '<path d="M20 4C30 12 32 24 20 36 8 24 10 12 20 4z"/><path d="M20 10v26" stroke="#123d14" stroke-width="2"/>' },
    { id: 'zaludy', name: 'žaludy', adj: 'žaludov', color: '#7a4a1e',
      svg: '<path d="M9 17a11 9 0 0 1 22 0z"/><path d="M11 17h18c0 10-4 17-9 17s-9-7-9-17z" fill-opacity=".75"/><path d="M20 4v5" stroke="#3d2408" stroke-width="2.5" stroke-linecap="round"/>' }
  ];
  /* Hodnoty od nejnižší; rod kvůli přívlastku (srdcové eso, srdcová sedma, srdcový král). */
  const RANKS = [
    ['sedma', 'á'], ['osma', 'á'], ['devítka', 'á'], ['desítka', 'á'], ['spodek', 'ý'], ['svršek', 'ý'], ['král', 'ý'], ['eso', 'é']
  ].map((r) => ({ name: r[0], end: r[1] }));
  const DECK = [];
  SUITS.forEach((s) => RANKS.forEach((r) => DECK.push({ id: s.id + '-' + r.name, suit: s, rank: r })));
  const title = (c) => c.suit.adj + c.rank.end + ' ' + c.rank.name;
  const fell = (c) => ({ 'á': 'Padla', 'ý': 'Padl', 'é': 'Padlo' })[c.rank.end];

  /* n = karet v rozdání, ms = jak dlouho je karta vidět, table = vybavování v tabulce všech karet (jinak otázky ano/ne). */
  const LEVELS = [
    { n: 4, ms: 2600 },
    { n: 6, ms: 2300 },
    { n: 8, ms: 2000, table: true },
    { n: 10, ms: 1700, table: true },
    { n: 12, ms: 1400, table: true }
  ];

  function suitSvg(s) {
    return '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><g fill="' + s.color + '">' + s.svg + '</g></svg>';
  }
  function cardNode(c, big) {
    const sym = h('span', { class: 'mcard-sym' });
    sym.innerHTML = suitSvg(c.suit);
    return h('div', { class: 'mcard' + (big ? ' is-big' : ''), 'data-card': c.id, style: { '--sc': c.suit.color } },
      h('span', { class: 'mcard-rank' }, c.rank.name), sym, h('span', { class: 'mcard-suit' }, c.suit.name));
  }

  SM.registerGame({
    id: 'karty',
    name: 'Vynesené karty',
    domain: 'pamet',
    trains: 'pracovní paměť a sledování, co už padlo',
    short: 'Zapamatujte si, které karty už padly.',
    duration: 'asi 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      return [
        'Na stůl se jedna po druhé vynese ' + L.n + ' mariášových karet. Každá je vidět jen chvíli.',
        L.table ? 'Potom uvidíte tabulku všech karet. Klepněte na ty, které padly, a dejte „Hotovo“.' : 'Potom se zeptáme na několik karet, jestli už padly.',
        'Barva karty je vždy napsaná i slovem: srdce, kule, listy, žaludy.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const deals = ctx.short ? 1 : 2;
      const scores = [];
      for (let d = 0; d < deals; d++) {
        ctx.progress(deals > 1 ? 'Rozdání ' + (d + 1) + ' z ' + deals : '');
        const played = U.sample(DECK, L.n);
        await deal(played);
        scores.push(L.table ? await table(played) : await questions(played));
      }
      const acc = U.mean(scores);
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.85, 0.5),
        big: Math.round(acc * 100) + ' %', bigLabel: 'správně zapamatovaných karet',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      /* Vynášení karet jedna po druhé; vynesené se otočí rubem nahoru na hromádku. */
      async function deal(played) {
        ctx.clear();
        ctx.status('Sledujte, které karty padnou.');
        const spot = h('div', { class: 'mcard-spot' });
        const pile = h('p', { class: 'mcard-pile' });
        const box = h('div', { class: 'stack karty', 'data-ask': 'deal', 'data-played': played.map((c) => c.id).join('|') }, spot, pile);
        ctx.stage.appendChild(box);
        await ctx.sleep(600);
        for (let i = 0; i < played.length; i++) {
          spot.textContent = '';
          const node = cardNode(played[i], true);
          node.setAttribute('aria-label', title(played[i]));
          spot.appendChild(node);
          SM.ui.announce(title(played[i]));
          pile.textContent = 'Vyneseno: ' + (i + 1) + ' z ' + played.length;
          await ctx.sleep(L.ms);
          node.classList.add('is-gone');
          await ctx.sleep(250);
        }
        spot.textContent = '';
      }

      /* Otázky ano / ne: polovina karet padla, polovina ne. */
      async function questions(played) {
        const others = U.sample(DECK.filter((c) => played.indexOf(c) === -1), 2);
        const qs = U.shuffle(U.sample(played, 2).concat(others));
        let ok = 0;
        for (let i = 0; i < qs.length; i++) {
          const c = qs[i];
          const was = played.indexOf(c) !== -1;
          ctx.clear();
          ctx.status(fell(c) + ' už ' + title(c) + '?');
          K.show(ctx, h('div', { class: 'karty', 'data-ask': 'yesno', 'data-card': c.id }, cardNode(c, true)));
          const r = await K.choose(ctx, [{ label: 'Ano', value: true }, { label: 'Ne', value: false }], { answer: was, layout: 'grid' });
          if (r.correct) ok++;
          ctx.status(r.correct ? 'Správně!' : was ? 'Tahle karta padla.' : 'Tahle karta nepadla.');
          await ctx.sleep(r.correct ? 800 : 1800);
        }
        return ok / qs.length;
      }

      /* Tabulka všech 32 karet: řádky hodnoty, sloupce barvy. Vrací (správně − navíc) / vynesené. */
      function table(played) {
        return new Promise((resolve) => {
          ctx.clear();
          ctx.status('Klepněte na všechny karty, které padly (' + played.length + ').');
          const picked = {};
          const head = h('div', { class: 'mtab-row is-head' }, h('span', null, ''), SUITS.map((s) => {
            const sym = h('span', { class: 'mtab-suit' });
            sym.innerHTML = suitSvg(s);
            sym.appendChild(h('small', null, s.name));
            return sym;
          }));
          const cells = {};
          const rows = RANKS.slice().reverse().map((r) => h('div', { class: 'mtab-row' }, h('span', { class: 'mtab-rank' }, r.name), SUITS.map((s) => {
            const c = DECK.find((x) => x.suit === s && x.rank === r);
            const b = h('button', { class: 'mtab-cell', type: 'button', 'data-card': c.id, 'aria-pressed': 'false', 'aria-label': title(c), style: { '--sc': s.color } });
            b.innerHTML = suitSvg(s);
            b.addEventListener('click', () => {
              if (locked) return;
              picked[c.id] = !picked[c.id];
              b.setAttribute('aria-pressed', picked[c.id] ? 'true' : 'false');
              done.disabled = !Object.keys(picked).some((k) => picked[k]);
              ctx.sound.tap();
            });
            cells[c.id] = b;
            return b;
          })));
          let locked = false;
          const done = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: true }, 'Hotovo');
          ctx.foot.appendChild(done);
          ctx.stage.appendChild(h('div', { class: 'stack karty', 'data-ask': 'table' }, h('div', { class: 'mtab' }, head, rows)));
          done.addEventListener('click', async () => {
            if (locked || done.disabled) return;
            locked = true;
            let hit = 0, wrong = 0;
            DECK.forEach((c) => {
              const was = played.indexOf(c) !== -1;
              const b = cells[c.id];
              if (picked[c.id] && was) { hit++; b.classList.add('is-hit'); }
              else if (picked[c.id]) { wrong++; b.classList.add('is-false'); }
              else if (was) b.classList.add('is-miss');
              b.setAttribute('aria-pressed', 'false');
            });
            const score = Math.max(0, hit - wrong) / played.length;
            ctx.feedback(hit === played.length && !wrong);
            ctx.status('Správně: ' + hit + ' z ' + played.length + (wrong ? ' · navíc: ' + wrong : '') + '. Oranžově jsou karty, které chyběly.');
            await K.next(ctx, 'Pokračovat');
            resolve(score);
          });
        });
      }
    }
  });
})();
