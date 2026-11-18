/* Kde co leží — zapamatovat si, ve které místnosti leží které věci (paměť na umístění, „kde mám zase brýle?“). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Místnosti: název a tvar „v …“ do otázky. */
  const ROOMS = {
    kuchyn: ['Kuchyň', 'v kuchyni'], obyvak: ['Obývák', 'v obýváku'], predsin: ['Předsíň', 'v předsíni'],
    loznice: ['Ložnice', 'v ložnici'], koupelna: ['Koupelna', 'v koupelně'], pracovna: ['Pracovna', 'v pracovně']
  };
  /* Půdorysy jako mřížka (grid-template-areas). */
  /* narrow = rozložení do dvou sloupců pro úzký displej (aby se názvy věcí nelámaly). */
  const PLANS = [
    { rooms: ['kuchyn', 'obyvak', 'predsin'], areas: '"kuchyn obyvak" "predsin obyvak"', cols: 2 },
    { rooms: ['kuchyn', 'obyvak', 'predsin', 'loznice'], areas: '"kuchyn obyvak" "predsin loznice"', cols: 2 },
    { rooms: ['kuchyn', 'obyvak', 'koupelna', 'predsin', 'loznice'], areas: '"kuchyn obyvak obyvak" "koupelna predsin loznice"', cols: 3,
      narrow: '"kuchyn obyvak" "koupelna obyvak" "predsin loznice"' },
    { rooms: ['kuchyn', 'obyvak', 'pracovna', 'koupelna', 'predsin', 'loznice'], areas: '"kuchyn obyvak pracovna" "koupelna predsin loznice"', cols: 3,
      narrow: '"kuchyn obyvak" "pracovna loznice" "koupelna predsin"' }
  ];
  /* Věci: obrázek, název a sloveso do otázky „Kde ležely klíče?“. */
  const ITEMS = [
    ['🔑', 'klíče', 'ležely'], ['👓', 'brýle', 'ležely'], ['👛', 'peněženka', 'ležela'], ['💊', 'léky', 'ležely'], ['☂️', 'deštník', 'ležel'],
    ['📱', 'telefon', 'ležel'], ['⌚', 'hodinky', 'ležely'], ['📖', 'kniha', 'ležela'], ['📰', 'noviny', 'ležely'], ['🧦', 'ponožky', 'ležely'],
    ['🧣', 'šála', 'ležela'], ['🧤', 'rukavice', 'ležely'], ['🎩', 'klobouk', 'ležel'], ['✂️', 'nůžky', 'ležely'], ['🔦', 'baterka', 'ležela'],
    ['🕯️', 'svíčka', 'stála'], ['🧸', 'medvídek', 'seděl'], ['⚽', 'míč', 'ležel'], ['📷', 'fotoaparát', 'ležel'], ['💍', 'prsten', 'ležel'],
    ['🧶', 'klubko', 'leželo'], ['🍎', 'jablko', 'leželo'], ['☕', 'hrnek', 'stál'], ['💡', 'žárovka', 'ležela'], ['🧴', 'krém', 'stál'],
    ['🧺', 'košík', 'stál'], ['📻', 'rádio', 'stálo'], ['🎁', 'dárek', 'ležel'], ['🔋', 'baterie', 'ležela'], ['✉️', 'dopis', 'ležel']
  ];
  /* items = počet věcí, q = otázek na jeden plánek, kinds = druhy otázek (where = kde, what = co bylo v místnosti, count = kolik), time = limit v s. */
  const LEVELS = [
    { plan: 0, items: 4, q: 3, kinds: ['where'] },
    { plan: 1, items: 6, q: 4, kinds: ['where'] },
    { plan: 1, items: 7, q: 4, kinds: ['where', 'where', 'what'] },
    { plan: 2, items: 9, q: 5, kinds: ['where', 'what', 'where', 'count'] },
    { plan: 3, items: 11, q: 5, kinds: ['where', 'what', 'where', 'count'], time: 50 }
  ];

  function layout(L) {
    const plan = PLANS[L.plan];
    for (let t = 0; t < 200; t++) {
      const items = U.sample(ITEMS, L.items);
      const where = {};
      const per = {};
      plan.rooms.forEach((r) => { per[r] = []; });
      let ok = true;
      items.forEach((it) => {
        const free = plan.rooms.filter((r) => per[r].length < 3);
        if (!free.length) { ok = false; return; }
        const r = U.pick(free);
        per[r].push(it);
        where[it[1]] = r;
      });
      // Aspoň dvě místnosti s věcmi, ať se nedá hádat.
      if (ok && plan.rooms.filter((r) => per[r].length).length >= Math.min(2, plan.rooms.length)) return { plan: plan, items: items, where: where, per: per };
    }
    return null;
  }

  function questions(L, lay, n) {
    const out = [];
    const usedItems = U.shuffle(lay.items);
    const roomsWith = U.shuffle(lay.plan.rooms.filter((r) => lay.per[r].length));
    let wi = 0;
    let ri = 0;
    for (let i = 0; i < n; i++) {
      const kind = L.kinds[i % L.kinds.length];
      if (kind === 'where' || !roomsWith.length) out.push({ kind: 'where', item: usedItems[wi++ % usedItems.length] });
      else if (kind === 'what') out.push({ kind: 'what', room: roomsWith[ri++ % roomsWith.length] });
      else out.push({ kind: 'count', room: U.pick(lay.plan.rooms) });
    }
    return U.shuffle(out);
  }

  SM.registerGame({
    id: 'byt',
    name: 'Kde co leží',
    domain: 'pamet',
    trains: 'paměť na to, kde co leží',
    short: 'Zapamatujte si, kde v bytě co leží.',
    duration: 'asi 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Uvidíte plánek bytu. V místnostech leží běžné věci, třeba klíče nebo brýle.',
        'Zapamatujte si, co kde leží, a klepněte na „Mám zapamatováno“.' + (L.time ? ' Na prohlížení máte ' + L.time + ' sekund.' : ''),
        'Potom věci zmizí. Na otázku „Kde ležely klíče?“ odpovíte klepnutím na místnost.'
      ];
      if (L.kinds.indexOf('what') !== -1) steps.push('Někdy se zeptáme, co všechno bylo v jedné místnosti.');
      if (L.kinds.indexOf('count') !== -1) steps.push('A někdy, kolik věcí v místnosti bylo.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const plans = ctx.short ? 1 : 2;
      const scores = [];
      for (let p = 0; p < plans; p++) {
        const lay = layout(L);
        await study(lay, p);
        const qs = questions(L, lay, ctx.short ? 3 : L.q);
        for (let i = 0; i < qs.length; i++) {
          ctx.progress((plans > 1 ? 'Byt ' + (p + 1) + ' z ' + plans + ' · ' : '') + 'otázka ' + (i + 1) + ' z ' + qs.length);
          const q = qs[i];
          scores.push(q.kind === 'where' ? await askWhere(lay, q.item) : q.kind === 'what' ? await askWhat(lay, q.room) : await askCount(lay, q.room));
        }
      }
      const acc = U.mean(scores);
      const ok = scores.filter((s) => s === 1).length;
      ctx.finish({
        perf: acc, levelDelta: acc >= 0.85 ? 1 : acc < 0.5 ? -1 : 0,
        big: ok + ' z ' + scores.length, bigLabel: 'správných odpovědí',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      /* Plánek. withItems = ukázat věci, asButtons = místnosti jako tlačítka. */
      function planNode(lay, withItems, asButtons) {
        const narrow = lay.plan.narrow && ctx.size().w < 520;
        const grid = h('div', { class: 'plan', style: {
          gridTemplateAreas: narrow ? lay.plan.narrow : lay.plan.areas,
          gridTemplateColumns: 'repeat(' + (narrow ? 2 : lay.plan.cols) + ', minmax(0, 1fr))'
        } });
        const rooms = {};
        lay.plan.rooms.forEach((r) => {
          const el = h(asButtons ? 'button' : 'div', { class: 'room', 'data-room': r, style: { gridArea: r }, type: asButtons ? 'button' : null },
            h('span', { class: 'room-name' }, ROOMS[r][0]),
            withItems ? lay.per[r].map((it) => h('span', { class: 'ri', 'data-item': it[1] }, h('span', { class: 'emo', 'aria-hidden': 'true' }, it[0]), h('span', null, it[1]))) : null);
          rooms[r] = el;
          grid.appendChild(el);
        });
        return { grid: grid, rooms: rooms };
      }

      function study(lay, p) {
        ctx.clear();
        ctx.progress(plans > 1 ? 'Byt ' + (p + 1) + ' z ' + plans : '');
        ctx.status('Zapamatujte si, kde co leží.');
        const pl = planNode(lay, true, false);
        const box = h('div', { class: 'stack byt', 'data-ask': 'study' }, pl.grid);
        ctx.stage.appendChild(box);
        return K.study(ctx, { limit: L.time ? L.time * 1000 : null, container: box });
      }

      function askWhere(lay, it) {
        return new Promise((resolve) => {
          ctx.clear();
          ctx.status('Kde ' + it[2] + ' ' + it[1] + '?');
          const pl = planNode(lay, false, true);
          ctx.stage.appendChild(h('div', { class: 'stack byt', 'data-ask': 'where', 'data-item': it[1] },
            h('p', { class: 'byt-q' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, it[0]), ' ' + it[1]), pl.grid));
          let done = false;
          Object.keys(pl.rooms).forEach((r) => {
            const b = pl.rooms[r];
            b.setAttribute('aria-label', ROOMS[r][0]);
            U.tap(b, async () => {
              if (done || !ctx.alive) return;
              done = true;
              const right = lay.where[it[1]];
              const ok = r === right;
              b.classList.add(ok ? 'is-correct' : 'is-wrong');
              if (!ok) pl.rooms[right].classList.add('is-correct');
              pl.rooms[right].appendChild(h('span', { class: 'ri' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, it[0]), h('span', null, it[1])));
              ctx.feedback(ok);
              ctx.status(ok ? 'Správně!' : 'Bylo to ' + ROOMS[right][1] + '.');
              await ctx.sleep(ok ? 1000 : 2000);
              resolve(ok ? 1 : 0);
            });
          });
        });
      }

      function askWhat(lay, room) {
        return new Promise((resolve) => {
          ctx.clear();
          const targets = lay.per[room];
          ctx.status('Co bylo ' + ROOMS[room][1] + '? Vyberte všechno.');
          const others = U.shuffle(lay.items.filter((it) => targets.indexOf(it) === -1)).slice(0, 3)
            .concat(U.sample(ITEMS.filter((it) => lay.items.indexOf(it) === -1), 2));
          const all = U.shuffle(targets.concat(others));
          const sz = ctx.size();
          const cols = sz.w >= 560 ? 3 : 2;
          const rows = Math.ceil(all.length / cols);
          const ph = U.clamp(Math.floor((sz.h - 8 - 8 * (rows - 1)) / rows), 46, 72);
          const grid = h('div', { class: 'pick-grid', style: { '--cols': cols, '--ph': ph + 'px' } });
          const chosen = [];
          let locked = false;
          const doneBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: true }, 'Hotovo');
          const tiles = all.map((it) => {
            const mark = h('span', { class: 'mark' }, U.svg(SM.icons.check));
            const b = h('button', { class: 'pick', type: 'button', 'aria-pressed': 'false', 'data-item': it[1] },
              h('span', { class: 'emo', 'aria-hidden': 'true' }, it[0]), h('span', { class: 'lbl' }, it[1]), mark);
            b.addEventListener('click', () => {
              if (locked) return;
              const i = chosen.indexOf(it);
              if (i === -1) chosen.push(it); else chosen.splice(i, 1);
              b.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
              doneBtn.disabled = !chosen.length;
              ctx.sound.tap();
            });
            grid.appendChild(b);
            return { it: it, b: b, mark: mark };
          });
          ctx.stage.appendChild(h('div', { class: 'stack byt', 'data-ask': 'what', 'data-room': room }, grid));
          ctx.foot.appendChild(doneBtn);
          doneBtn.addEventListener('click', async () => {
            if (locked || doneBtn.disabled) return;
            locked = true;
            grid.classList.add('is-locked');
            let hit = 0;
            let wrong = 0;
            tiles.forEach((t) => {
              const isT = targets.indexOf(t.it) !== -1;
              const picked = chosen.indexOf(t.it) !== -1;
              t.b.setAttribute('aria-pressed', 'false');
              if (picked && isT) { hit++; t.b.classList.add('is-hit'); }
              else if (picked) { wrong++; t.b.classList.add('is-false'); t.mark.replaceChild(U.svg(SM.icons.cross), t.mark.firstChild); }
              else if (isT) { t.b.classList.add('is-miss'); t.b.appendChild(h('span', { class: 'tag' }, 'bylo tam')); }
            });
            const score = Math.max(0, hit - wrong) / targets.length;
            ctx.feedback(score === 1);
            ctx.status(score === 1 ? 'Přesně tak!' : 'Správně: ' + hit + ' z ' + targets.length + (wrong ? ', navíc: ' + wrong : '') + '.');
            doneBtn.disabled = true;
            await ctx.sleep(score === 1 ? 1200 : 2400);
            resolve(score);
          });
        });
      }

      async function askCount(lay, room) {
        const n = lay.per[room].length;
        ctx.status('Kolik věcí bylo ' + ROOMS[room][1] + '?');
        K.show(ctx, h('div', { class: 'byt', 'data-ask': 'count', 'data-room': room }, h('p', { class: 'byt-q' }, ROOMS[room][0])));
        const r = await K.choose(ctx, [0, 1, 2, 3].map((v) => ({ label: String(v), value: v })), { answer: n, layout: 'row', cls: 'is-mono' });
        const names = lay.per[room].map((it) => it[1]).join(', ');
        ctx.status(r.correct ? 'Správně!' : n === 0 ? 'Nebylo tam nic.' : n === 1 ? 'Byla tam jedna věc: ' + names + '.' : 'Byly tam ' + n + ' věci: ' + names + '.');
        await ctx.sleep(r.correct ? 1000 : 2400);
        return r.correct ? 1 : 0;
      }
    }
  });
})();
