/* Podnos — Kimova hra: prohlédnout si věci na podnosu a po zakrytí je poznat (zraková paměť a pozornost). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Věci: obrázek, název a 2. pád množného čísla do otázky „Kolik … bylo na podnosu?“ (null = nedá se dobře počítat). */
  const THINGS = [
    ['🔑', 'klíč', 'klíčů'], ['👓', 'brýle', null], ['☂️', 'deštník', 'deštníků'], ['⌚', 'hodinky', null], ['📱', 'telefon', 'telefonů'],
    ['📖', 'kniha', 'knih'], ['✂️', 'nůžky', null], ['🕯️', 'svíčka', 'svíček'], ['☕', 'hrnek', 'hrnků'], ['🍎', 'jablko', 'jablek'],
    ['🍌', 'banán', 'banánů'], ['🍋', 'citron', 'citronů'], ['🥕', 'mrkev', 'mrkví'], ['🥚', 'vejce', 'vajec'], ['🍐', 'hruška', 'hrušek'],
    ['🧦', 'ponožky', null], ['🧤', 'rukavice', null], ['🎩', 'klobouk', 'klobouků'], ['🧣', 'šála', 'šál'], ['👛', 'peněženka', 'peněženek'],
    ['💍', 'prsten', 'prstenů'], ['🔦', 'baterka', 'baterek'], ['🧸', 'medvídek', 'medvídků'], ['⚽', 'míč', 'míčů'], ['🎈', 'balonek', 'balonků'],
    ['📻', 'rádio', 'rádií'], ['⏰', 'budík', 'budíků'], ['🔔', 'zvonek', 'zvonků'], ['🪴', 'květináč', 'květináčů'], ['🌷', 'tulipán', 'tulipánů'],
    ['🥄', 'lžíce', 'lžic'], ['🧼', 'mýdlo', 'mýdel'], ['✉️', 'dopis', 'dopisů'], ['✏️', 'tužka', 'tužek'], ['🎁', 'dárek', 'dárků'],
    ['🧶', 'klubko', 'klubek'], ['💡', 'žárovka', 'žárovek'], ['🍪', 'sušenka', 'sušenek'], ['🎲', 'kostka', 'kostek'], ['🍯', 'med', null]
  ].map((t) => ({ e: t[0], name: t[1], g: t[2] }));

  /* Kreslené věci, které mohou mít barvu (f = výplň). Obrys je vždy tmavý, barva se k tomu vždy píše i slovem. */
  const OUT = '#2b2420';
  const st = (w, o) => ' stroke="' + OUT + '" stroke-width="' + w + '"' + (o ? ' stroke-opacity="' + o + '"' : '');
  const shine = (d) => '<path d="' + d + '" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/>';
  const DRAW = {
    hrnek: (f) => '<path d="M33 19h3a6 6 0 0 1 0 12h-3" fill="none"' + st(3.4) + '/><path d="M33 19h3a6 6 0 0 1 0 12h-3" fill="none" stroke="' + f + '" stroke-width="1.2"/>' +
      '<path d="M10 13h23v21a7 7 0 0 1-7 7h-9a7 7 0 0 1-7-7z" fill="' + f + '"' + st(2.2) + ' stroke-linejoin="round"/>' + shine('M14.5 18v13'),
    destnik: (f) => '<path d="M24 7C14 7 6 14 6 24c3-2.6 6-2.6 9 0 3-2.6 6-2.6 9 0 3-2.6 6-2.6 9 0 3-2.6 6-2.6 9 0C42 14 34 7 24 7z" fill="' + f + '"' + st(2.2) + ' stroke-linejoin="round"/>' +
      '<path d="M24 7c-4 4-6 10-6 17M24 7c4 4 6 10 6 17" fill="none"' + st(1.6, 0.35) + '/>' +
      '<path d="M24 24v14a3.5 3.5 0 0 1-7 0" fill="none"' + st(2.6) + ' stroke-linecap="round"/><path d="M24 7V4"' + st(2.6) + ' stroke-linecap="round"/>',
    cepice: (f) => '<path d="M9 33c0-11 6.7-19 15-19s15 8 15 19z" fill="' + f + '"' + st(2.2) + ' stroke-linejoin="round"/>' +
      '<path d="M19 15.5c-1 5-1 11 0 17M29 15.5c1 5 1 11 0 17" fill="none"' + st(1.6, 0.3) + '/>' +
      '<rect x="7" y="32" width="34" height="9" rx="3.5" fill="' + f + '"' + st(2.2) + '/><path d="M13 33v7M19 33v7M25 33v7M31 33v7M37 33v7"' + st(1.5, 0.3) + '/>' +
      '<circle cx="24" cy="10" r="5" fill="' + f + '"' + st(2.2) + '/>',
    mic: (f) => '<circle cx="24" cy="25" r="16" fill="' + f + '"' + st(2.2) + '/>' +
      '<path d="M8.6 21c9.6 4.4 21.2 4.4 30.8 0M9.4 31.5c9.2-4 20-4 29.2 0" fill="none"' + st(2, 0.4) + '/>' + shine('M15.5 16.5a11 11 0 0 1 6.5-4'),
    kniha: (f) => '<path d="M11 7h24a3 3 0 0 1 3 3v26H15a4 4 0 0 0-4 4z" fill="' + f + '"' + st(2.2) + ' stroke-linejoin="round"/>' +
      '<path d="M11 40a4 4 0 0 1 4-4h23v6H15a4 4 0 0 1-4-2z" fill="#fff"' + st(2.2) + ' stroke-linejoin="round"/>' +
      '<rect x="18" y="13" width="14" height="6" rx="1.5" fill="#fff" fill-opacity=".75"' + st(1.2, 0.4) + '/>',
    svicka: (f) => '<path d="M24 3.5c3.2 4.2 4.8 6.8 4.8 9.3a4.8 4.8 0 0 1-9.6 0c0-2.5 1.6-5.1 4.8-9.3z" fill="#f39c1f"' + st(1.8) + ' stroke-linejoin="round"/>' +
      '<path d="M24 17.5v4"' + st(2) + ' stroke-linecap="round"/><rect x="16" y="21" width="16" height="22" rx="2.5" fill="' + f + '"' + st(2.2) + '/>' + shine('M20 25v13'),
    ponozka: (f) => '<path d="M16 5h14v19.5l8.3 8.3a6.2 6.2 0 0 1-8.8 8.8L17.8 30A6 6 0 0 1 16 25.7z" fill="' + f + '"' + st(2.2) + ' stroke-linejoin="round"/>' +
      '<path d="M16 11.5h14"' + st(2) + '/><path d="M16 8.2h14"' + st(1.4, 0.3) + '/>',
    klubko: (f) => '<circle cx="22" cy="23" r="15" fill="' + f + '"' + st(2.2) + '/>' +
      '<path d="M9 18c8.5 1 16.5 7.5 19.5 18.5M12 32c4-8.5 12.5-14 23.5-13.5M15.5 10.5c6 4 9 10.5 9.5 20" fill="none"' + st(1.8, 0.4) + '/>' +
      '<path d="M35 29c4.5 1.5 7 5.5 6 11" fill="none"' + st(2.2) + ' stroke-linecap="round"/>'
  };
  /* rod: m / f / n kvůli tvaru přídavného jména (modrý deštník, modrá kniha, modré klubko). */
  const PAINTED = [
    ['hrnek', 'hrnků', 'm', 'hrnek'], ['deštník', 'deštníků', 'm', 'destnik'], ['čepice', 'čepic', 'f', 'cepice'], ['míč', 'míčů', 'm', 'mic'],
    ['kniha', 'knih', 'f', 'kniha'], ['svíčka', 'svíček', 'f', 'svicka'], ['ponožka', 'ponožek', 'f', 'ponozka'], ['klubko', 'klubek', 'n', 'klubko']
  ].map((p) => ({ name: p[0], g: p[1], rod: p[2], draw: DRAW[p[3]] }));
  /* Obrázkové věci se stejným názvem se s kreslenými nemíchají. */
  const CLASH = ['hrnek', 'deštník', 'míč', 'kniha', 'svíčka', 'ponožky', 'klubko'];
  /* Barvy, které se rozliší i při barvosleposti (liší se odstínem i světlostí). */
  const COLORS = [
    { id: 'cervena', hex: '#d63a2f', m: 'červený', f: 'červená', n: 'červené', acc: 'červenou' },
    { id: 'modra', hex: '#2c69d6', m: 'modrý', f: 'modrá', n: 'modré', acc: 'modrou' },
    { id: 'zluta', hex: '#f5c518', m: 'žlutý', f: 'žlutá', n: 'žluté', acc: 'žlutou' },
    { id: 'bila', hex: '#fbfaf5', m: 'bílý', f: 'bílá', n: 'bílé', acc: 'bílou' }
  ];
  const NEUTRAL = '#c3cbc7';
  const VERB = { m: ['měl', 'byl'], f: ['měla', 'byla'], n: ['mělo', 'bylo'] };

  /* kinds = různých věcí, objects = věcí celkem (některé se opakují), painted = kolik věcí má barvu,
     offer = obrázků v nabídce, trays = podnosů ve hře, count / color = otázek na počet a na barvu. */
  const LEVELS = [
    { kinds: 6, offer: 12, trays: 2 },
    { kinds: 9, offer: 16, trays: 2 },
    { kinds: 12, offer: 18, trays: 1 },
    { kinds: 15, offer: 21, trays: 1 },
    { kinds: 7, objects: 12, offer: 13, trays: 1, count: 2 },
    { kinds: 8, objects: 12, painted: 3, offer: 14, trays: 1, count: 1, color: 2 }
  ];
  /* Krátká verze do lekce: jeden podnos s 6–9 věcmi. */
  function shortOf(L) {
    if (!L.objects) return Object.assign({}, L, { kinds: Math.min(L.kinds, 9), offer: Math.min(L.offer, 16), trays: 1 });
    return Object.assign({}, L, { kinds: L.kinds - 2, objects: 8, offer: 11, painted: L.painted ? 2 : 0, count: 1, color: L.color ? 1 : 0 });
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const label = (x) => (x.color ? x.color[x.rod] + ' ' : '') + x.name;

  /* Jeden podnos: types = různé věci s počtem kusů, objs = jednotlivé kusy v náhodném pořadí. */
  function makeTray(L) {
    const painted = L.painted || 0;
    const pool = THINGS.filter((t) => (!L.objects || t.g) && (!painted || CLASH.indexOf(t.name) === -1));
    const colors = U.shuffle(COLORS);
    const types = U.sample(pool, L.kinds - painted).map((t) => Object.assign({}, t, { n: 1 }))
      .concat(U.sample(PAINTED, painted).map((p, i) => Object.assign({}, p, { n: 1, color: colors[i] })));
    let extra = (L.objects || L.kinds) - L.kinds;
    while (extra > 0) {
      const c = types.filter((x) => !x.color && x.n < 3);
      if (!c.length) break;
      U.pick(c).n++;
      extra--;
    }
    const objs = [];
    types.forEach((x) => { for (let i = 0; i < x.n; i++) objs.push(x); });
    return { types: types, objs: U.shuffle(objs) };
  }

  /* Obrázek věci: emoji, nebo kreslená věc (colored = ve své barvě, jinak šedě). */
  function pic(x, colored, cls) {
    if (x.e) return h('span', { class: 'emo' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true' }, x.e);
    const s = h('span', { class: 'tray-svg' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true' });
    s.innerHTML = '<svg viewBox="0 0 48 48">' + x.draw(colored && x.color ? x.color.hex : NEUTRAL) + '</svg>';
    return s;
  }

  SM.registerGame({
    id: 'podnos',
    name: 'Podnos',
    domain: 'pamet',
    trains: 'zrakovou paměť a pozornost',
    short: 'Zapamatujte si, co leží na podnosu.',
    duration: 'asi 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Na podnosu leží běžné věci. Prohlédněte si je a klepněte na „Mám zapamatováno“. Nejvýš na to máte minutu.',
        'Podnos pak přikryjeme ubrouskem. Z nabídky vyberte všechny věci, které na něm ležely, a klepněte na „Hotovo“.'
      ];
      if (L.objects) steps.push('Některé věci leží na podnosu víckrát. Zeptáme se, kolik kusů jich bylo.');
      if (L.painted) steps.push('Některé věci mají barvu. Zeptáme se i na ni.');
      return steps;
    },
    async run(ctx) {
      let L = LEVELS[ctx.level - 1];
      if (ctx.short) L = shortOf(L);
      const scores = [];
      let hits = 0, fa = 0, total = 0, qOk = 0, qAll = 0;
      for (let t = 0; t < L.trays; t++) {
        const tray = makeTray(L);
        const tag = L.trays > 1 ? 'Podnos ' + (t + 1) + ' z ' + L.trays : '';
        ctx.progress(tag);
        await study(tray);
        await cover();
        const last = t === L.trays - 1;
        const r = await recall(tray, last && !L.count && !L.color);
        hits += r.hit;
        fa += r.wrong;
        total += tray.types.length;
        scores.push(r.score);
        // Otázky na počet a na barvu.
        const qs = [];
        if (L.count) {
          const rep = U.shuffle(tray.types.filter((x) => x.n > 1));
          const one = U.shuffle(tray.types.filter((x) => x.n === 1 && !x.color));
          const pickC = L.count > 1 ? rep.slice(0, L.count - 1).concat(one.slice(0, 1)) : (Math.random() < 0.75 ? rep : one).slice(0, 1);
          pickC.forEach((x) => qs.push({ kind: 'count', x: x }));
        }
        if (L.color) U.sample(tray.types.filter((x) => x.color), L.color).forEach((x) => qs.push({ kind: 'color', x: x }));
        const order = U.shuffle(qs);
        for (let i = 0; i < order.length; i++) {
          ctx.progress('Otázka ' + (i + 1) + ' z ' + order.length);
          const ok = order[i].kind === 'count' ? await askCount(order[i].x) : await askColor(order[i].x);
          scores.push(ok);
          qOk += ok;
          qAll++;
        }
      }
      const acc = U.mean(scores);
      const details = [fa ? 'Vybráno navíc: ' + fa : 'Nic navíc'];
      if (qAll) details.push('Otázky: ' + qOk + ' z ' + qAll);
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.85, 0.5),
        big: hits + ' z ' + total,
        bigLabel: U.plural(total, 'věci', 'věcí', 'věcí') + ' jste si zapamatovali',
        details: details,
        metric: { hits: hits, fa: fa, n: total, q: qAll ? qOk + '/' + qAll : null }
      });

      function trayNode(tray) {
        const sz = ctx.size();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
        const W = Math.min(sz.w, 620) - 30;
        const H = Math.max(160, sz.h - 58); // okraj podnosu a proužek s časem
        const n = tray.objs.length;
        let g = U.fitGrid(n, W, H, 0.9, 6, 130);
        const minW = 4.4 * rem;
        if (g.w < minW) {
          // Úzký displej s velkým písmem: méně sloupců, aby se vešly názvy, a nižší řádky, ať je vidět co nejvíc.
          const cols = Math.max(2, Math.floor((W + 6) / (minW + 6)));
          const rows = Math.ceil(n / cols);
          g = { cols: cols, w: Math.floor((W - 6 * (cols - 1)) / cols), h: Math.floor(U.clamp((H - 6 * (rows - 1)) / rows, 3.4 * rem, minW / 0.9)) };
        }
        const list = tray.types.map((x) => (x.n > 1 ? x.n + ' × ' : '') + label(x)).join(', ');
        const box = h('div', { class: 'tray', role: 'img', 'aria-label': 'Na podnosu leží: ' + list + '.',
          style: { '--cols': g.cols, '--cw': g.w + 'px', '--chh': g.h + 'px' } });
        tray.objs.forEach((x) => {
          const turn = 'rotate(' + U.randInt(-14, 14) + 'deg) translate(' + U.randInt(-3, 3) + 'px, ' + U.randInt(-3, 3) + 'px)';
          box.appendChild(h('div', { class: 'tray-item', 'data-name': x.name, 'data-color': x.color ? x.color.id : null },
            h('span', { class: 'tray-pic', style: { transform: turn } }, pic(x, true)),
            h('span', { class: 'tray-lbl' }, label(x))));
        });
        return box;
      }

      function study(tray) {
        ctx.clear();
        ctx.status('Prohlédněte si, co leží na podnosu.');
        const box = h('div', { class: 'stack podnos', 'data-ask': 'study' });
        ctx.stage.appendChild(box);
        // Tlačítko a proužek s časem nejdřív, ať podnos dostane jen zbylé místo.
        const wait = K.study(ctx, { limit: 60000, container: box });
        box.insertBefore(trayNode(tray), box.firstChild);
        return wait;
      }

      async function cover() {
        const t = ctx.stage.querySelector('.tray');
        ctx.foot.textContent = '';
        ctx.status('Podnos přikrýváme ubrouskem…');
        if (t) t.appendChild(h('div', { class: 'tray-cloth' + (K.reducedMotion() ? ' is-still' : ''), 'aria-hidden': 'true' }));
        await ctx.sleep(1000);
      }

      /* Výběr věcí z nabídky. Vrací { score, hit, wrong }. */
      function recall(tray, last) {
        return new Promise((resolve) => {
          ctx.clear();
          const targets = tray.types;
          const names = targets.map((x) => x.name);
          const painted = targets.some((x) => x.draw);
          const nd = L.offer - targets.length;
          const pp = painted ? U.sample(PAINTED.filter((p) => names.indexOf(p.name) === -1), Math.min(2, nd)) : [];
          const pool = THINGS.filter((t) => names.indexOf(t.name) === -1 && (!painted || CLASH.indexOf(t.name) === -1));
          const all = U.shuffle(targets.concat(pp, U.sample(pool, nd - pp.length)));
          ctx.status('Co leželo na podnosu? Vyberte ' + targets.length + ' ' + U.plural(targets.length, 'věc', 'věci', 'věcí') + '.');
          const doneBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: true }, 'Hotovo');
          ctx.foot.appendChild(doneBtn); // nejdřív tlačítko, ať jde změřit zbylá plocha
          const fit = fitPick(all.length);
          const grid = h('div', { class: 'pick-grid' + (fit.tight ? ' is-tight' : ''), style: { '--cols': fit.cols, '--ph': fit.ph + 'px' } });
          const chosen = [];
          let locked = false;
          const count = () => {
            ctx.progress('Vybráno ' + chosen.length + ' z ' + targets.length);
            doneBtn.disabled = chosen.length === 0;
          };
          const tiles = all.map((x) => {
            const mark = h('span', { class: 'mark' }, U.svg(SM.icons.check));
            const b = h('button', { class: 'pick is-v', type: 'button', 'aria-pressed': 'false', 'data-name': x.name },
              pic(x, false), h('span', { class: 'lbl' }, x.name), mark);
            b.addEventListener('click', () => {
              if (locked) return;
              const i = chosen.indexOf(x);
              if (i === -1) chosen.push(x); else chosen.splice(i, 1);
              b.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
              ctx.sound.tap();
              count();
            });
            grid.appendChild(b);
            return { x: x, b: b, mark: mark };
          });
          ctx.stage.appendChild(h('div', { class: 'stack podnos', 'data-ask': 'pick' }, grid));
          count();
          doneBtn.addEventListener('click', async () => {
            if (locked || doneBtn.disabled) return;
            locked = true;
            grid.classList.add('is-locked');
            let hit = 0, wrong = 0;
            tiles.forEach((t) => {
              const isT = targets.indexOf(t.x) !== -1;
              const picked = chosen.indexOf(t.x) !== -1;
              t.b.setAttribute('aria-pressed', 'false');
              if (picked && isT) { hit++; t.b.classList.add('is-hit'); t.b.setAttribute('aria-label', t.x.name + ': správně'); }
              else if (picked) {
                wrong++;
                t.b.classList.add('is-false');
                t.mark.replaceChild(U.svg(SM.icons.cross), t.mark.firstChild);
                t.b.setAttribute('aria-label', t.x.name + ': na podnosu nebylo');
              } else if (isT) {
                t.b.classList.add('is-miss');
                t.b.appendChild(h('span', { class: 'tag' }, 'chybělo'));
                t.b.setAttribute('aria-label', t.x.name + ': chybělo');
              }
            });
            const n = targets.length;
            const score = Math.max(0, hit - wrong) / n;
            ctx.feedback(hit === n && wrong === 0);
            ctx.status(hit === n && !wrong ? 'Výborně, všechno správně!' : 'Správně: ' + hit + ' z ' + n + (wrong ? ' · navíc: ' + wrong : '') + '.');
            await K.next(ctx, last ? 'Zobrazit výsledek' : 'Pokračovat');
            resolve({ score: score, hit: hit, wrong: wrong });
          });
        });
      }

      /* Rozložení nabídky: počet sloupců, při kterém je dlaždice co největší a ještě se do ní vejde název věci.
         Když se nabídka nevejde celá (malý displej a největší písmo), dá se posouvat. */
      function fitPick(n) {
        const sz = ctx.size();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
        const gap = 8, rowGap = 0.75 * rem; // stejné mezery jako v CSS (.podnos .pick-grid)
        const W = Math.min(sz.w, 48 * rem) - 4;
        const H = sz.h - 12 - 0.6 * rem;
        const minW = 4.5 * rem, minH = 2.5 * rem, maxH = 5 * rem;
        const maxCols = U.clamp(Math.floor((W + gap) / (minW + gap)), 2, 6);
        let best = null;
        for (let cols = 2; cols <= maxCols; cols++) {
          const rows = Math.ceil(n / cols);
          const tw = (W - gap * (cols - 1)) / cols;
          const ph = Math.min(maxH, Math.floor((H - rowGap * (rows - 1)) / rows));
          if (ph < minH) continue;
          const size = Math.min(tw / 1.4, ph);
          if (!best || size > best.size + 0.5) best = { cols: cols, ph: ph, size: size };
        }
        if (best) return best;
        // Než se začne posouvat: hustší mřížka (menší mezery mezi řádky a okraje dlaždic, CSS .is-tight).
        const ph = Math.floor((H - 0.4 * rem * (Math.ceil(n / maxCols) - 1)) / Math.ceil(n / maxCols));
        return { cols: maxCols, ph: Math.round(Math.max(ph, 2 * rem)), tight: true };
      }

      function question(x, kind) {
        return h('div', { class: 'stack podnos', 'data-ask': kind, 'data-name': x.name },
          h('div', { class: 'podnos-q' }, pic(x, false, 'is-big'), h('p', null, x.name)));
      }

      /* Na malém displeji s velkým písmem se obrázek k otázce nemusí vejít; pak stačí otázka nahoře. */
      function fitCard() {
        const card = ctx.stage.querySelector('.podnos-q');
        if (card && ctx.stage.clientHeight < card.offsetHeight + 8) card.style.display = 'none';
      }

      async function askCount(x) {
        ctx.clear();
        ctx.status('Kolik ' + x.g + ' bylo na podnosu?');
        K.show(ctx, question(x, 'count'));
        const wait = K.choose(ctx, [1, 2, 3, 4].map((v) => ({ label: String(v), value: v })), { answer: x.n, layout: 'row', cls: 'is-mono' });
        fitCard();
        const r = await wait;
        ctx.status(r.correct ? 'Správně!' : 'Správně je ' + x.n + '.');
        await ctx.sleep(r.correct ? 1000 : 2200);
        return r.correct ? 1 : 0;
      }

      async function askColor(x) {
        const v = VERB[x.rod];
        ctx.clear();
        ctx.status('Jakou barvu ' + v[0] + ' ' + x.name + '?');
        K.show(ctx, question(x, 'color'));
        const opts = COLORS.map((c) => ({
          value: c.id, label: c.acc,
          node: h('span', { class: 'color-opt', 'data-color': c.id }, h('i', { class: 'swatch', style: { background: c.hex } }), c.acc)
        }));
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
        const wait = K.choose(ctx, opts, { answer: x.color.id, layout: ctx.size().w < 17 * rem ? 'col' : 'grid', cls: 'is-colors' });
        fitCard();
        const r = await wait;
        ctx.status(r.correct ? 'Správně!' : cap(x.name) + ' ' + v[1] + ' ' + x.color[x.rod] + '.');
        await ctx.sleep(r.correct ? 1000 : 2400);
        return r.correct ? 1 : 0;
      }
    }
  });
})();
