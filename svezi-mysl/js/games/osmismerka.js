/* Osmisměrka s tajenkou — najít v mřížce písmen slova na jedno téma (zrakové vyhledávání, slovní zásoba, soustředění). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const THEMES = [
    ['Ovoce', ['JABLKO', 'HRUŠKA', 'ŠVESTKA', 'MERUŇKA', 'BROSKEV', 'TŘEŠEŇ', 'VIŠEŇ', 'JAHODA', 'MALINA', 'BORŮVKA', 'RYBÍZ', 'CITRON', 'BANÁN', 'MELOUN', 'OŘECH', 'KIWI']],
    ['Zelenina', ['MRKEV', 'PETRŽEL', 'CELER', 'CIBULE', 'ČESNEK', 'ZELÍ', 'KAPUSTA', 'OKURKA', 'RAJČE', 'PAPRIKA', 'DÝNĚ', 'CUKETA', 'HRÁŠEK', 'FAZOLE', 'SALÁT', 'KOPR', 'PÓREK']],
    ['Nábytek', ['STŮL', 'ŽIDLE', 'SKŘÍŇ', 'POSTEL', 'KŘESLO', 'POHOVKA', 'KOMODA', 'POLICE', 'LAVICE', 'STOLIČKA', 'VĚŠÁK', 'LAMPA', 'ZRCADLO', 'KOBEREC']],
    ['Česká města', ['PRAHA', 'BRNO', 'OSTRAVA', 'PLZEŇ', 'OLOMOUC', 'LIBEREC', 'ZLÍN', 'KLADNO', 'MOST', 'OPAVA', 'JIHLAVA', 'TÁBOR', 'PÍSEK', 'TELČ', 'KOLÍN', 'CHEB', 'TŘEBOŇ']],
    ['Domácí zvířata', ['KOČKA', 'PES', 'KŮŇ', 'KRÁVA', 'KOZA', 'OVCE', 'PRASE', 'SLEPICE', 'HUSA', 'KACHNA', 'KRÁLÍK', 'KOHOUT', 'OSEL', 'MORČE']],
    ['Lesní zvířata', ['LIŠKA', 'ZAJÍC', 'JELEN', 'SRNA', 'VLK', 'MEDVĚD', 'JEŽEK', 'VEVERKA', 'JEZEVEC', 'KANČ', 'RYS', 'KUNA', 'SOVA', 'DATEL']],
    ['Ptáci', ['VRABEC', 'SÝKORA', 'KOS', 'DROZD', 'ČÁP', 'VRÁNA', 'STRAKA', 'HOLUB', 'LABUŤ', 'KUKAČKA', 'SLAVÍK', 'PĚNKAVA', 'SKŘIVAN', 'ČÍŽEK']],
    ['Květiny', ['RŮŽE', 'TULIPÁN', 'NARCIS', 'LILIE', 'KOPRETINA', 'FIALKA', 'KARAFIÁT', 'MÁK', 'CHRPA', 'SNĚŽENKA', 'ASTRA', 'JIŘINA', 'MACEŠKA', 'PIVOŇKA']],
    ['Stromy', ['DUB', 'BUK', 'LÍPA', 'BŘÍZA', 'JAVOR', 'JASAN', 'JEDLE', 'SMRK', 'BOROVICE', 'MODŘÍN', 'OLŠE', 'VRBA', 'TOPOL', 'KAŠTAN', 'JEŘÁB']],
    ['V kuchyni', ['HRNEC', 'PÁNEV', 'TALÍŘ', 'MISKA', 'LŽÍCE', 'VIDLIČKA', 'NŮŽ', 'HRNEK', 'SKLENICE', 'KONVICE', 'CEDNÍK', 'VAŘEČKA', 'MÍSA', 'PEKÁČ', 'STRUHADLO']],
    ['Oblečení', ['KABÁT', 'BUNDA', 'SVETR', 'KOŠILE', 'HALENKA', 'SUKNĚ', 'KALHOTY', 'ŠATY', 'VESTA', 'ČEPICE', 'ŠÁLA', 'RUKAVICE', 'PONOŽKY', 'BOTY', 'KLOBOUK', 'ZÁSTĚRA']],
    ['Počasí', ['DÉŠŤ', 'SNÍH', 'VÍTR', 'BOUŘE', 'MLHA', 'MRÁZ', 'SLUNCE', 'DUHA', 'KROUPY', 'MRAK', 'BLESK', 'HROM', 'NÁLEDÍ', 'VICHR']],
    ['Na zahradě', ['RÝČ', 'HRÁBĚ', 'MOTYKA', 'KONEV', 'HADICE', 'ZÁHON', 'PLOT', 'BRANKA', 'ALTÁN', 'TRÁVA', 'KOMPOST', 'KOLEČKO', 'NŮŽKY', 'SEMÍNKO']],
    ['Hudba', ['HOUSLE', 'KLAVÍR', 'KYTARA', 'BUBEN', 'FLÉTNA', 'TRUBKA', 'VIOLA', 'HARFA', 'VARHANY', 'ZPĚV', 'NOTA', 'TÓN', 'PÍSEŇ', 'POLKA', 'VALČÍK']],
    ['Řemesla', ['PEKAŘ', 'ŘEZNÍK', 'TRUHLÁŘ', 'KOVÁŘ', 'ZEDNÍK', 'KREJČÍ', 'MALÍŘ', 'ŠVEC', 'HRNČÍŘ', 'TESAŘ', 'ZÁMEČNÍK', 'KOLÁŘ', 'SKLÁŘ', 'MLYNÁŘ']],
    ['Sporty', ['FOTBAL', 'HOKEJ', 'TENIS', 'PLAVÁNÍ', 'BĚH', 'LYŽE', 'BRUSLE', 'ŠACHY', 'GOLF', 'KUŽELKY', 'VOLEJBAL', 'BOX', 'JÓGA', 'VESLOVÁNÍ']],
    ['Doprava', ['AUTO', 'VLAK', 'TRAMVAJ', 'AUTOBUS', 'KOLO', 'LOĎ', 'LETADLO', 'METRO', 'TAXI', 'KOČÁR', 'MOTORKA', 'SANĚ', 'PARNÍK', 'VOZ']],
    ['Česká jídla', ['GULÁŠ', 'ŘÍZEK', 'KNEDLÍK', 'POLÉVKA', 'OMÁČKA', 'BÁBOVKA', 'KOLÁČ', 'BUCHTA', 'PALAČINKA', 'VDOLEK', 'BRAMBORÁK', 'SVÍČKOVÁ', 'ŠKVARKY', 'TVAROH']]
  ];
  /* Tajenky: známá přísloví a pochvaly v délkách 7 až 27 písmen. */
  const TAJENKY = ['Ráno moudřejší večera.', 'Bez práce nejsou koláče.', 'Kdo hledá, najde.', 'Trpělivost růže přináší.', 'Čistota půl zdraví.',
    'Lepší pozdě než nikdy.', 'Ruka ruku myje.', 'Všeho moc škodí.', 'Mráz kopřivu nespálí.', 'Dvakrát měř, jednou řež.',
    'Hlad je nejlepší kuchař.', 'Lež má krátké nohy.', 'Vrána k vráně sedá.', 'Zvyk je železná košile.', 'Pýcha předchází pád.',
    'Tichá voda břehy mele.', 'Jablko nepadá daleko od stromu.', 'Opakování matka moudrosti.', 'Nechval dne před večerem.',
    'Sejde z očí, sejde z mysli.', 'Kdo si hraje, nezlobí.', 'Pomalu, ale jistě.', 'Výborně!', 'Dobrá práce!', 'Jen tak dál!',
    'Krásný den!', 'Hezký den!', 'Skvělá paměť!', 'Bystrá hlava!', 'Máte oko jako rys!', 'Zlaté ručičky!', 'Dobrou chuť!',
    'Hurá, hotovo!', 'Paměť slouží!', 'Kdo dřív přijde, ten dřív mele.', 'Komu se nelení, tomu se zelení.', 'Ranní ptáče dál doskáče.',
    'Darovanému koni na zuby nehleď.', 'Kde se dva perou, třetí se směje.', 'Mluviti stříbro, mlčeti zlato.', 'Na každém šprochu pravdy trochu.'];
  const letters = (t) => t.toUpperCase().replace(/[^A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, '');
  const FILL = 'AAAAAEEEEEOOOOIIIINNNNTTTSSSRRRLLLKKKVVVDDDMMMPPPUUJJBCHZYÁÁÍÍÉĚŘČŠŽŮÝ';
  const ALL_DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]];

  /* n = velikost, words = počet slov, dirs = počet směrů (2 = → ↓, 4 = i pozpátku, 8 = i šikmo), taj = s tajenkou. */
  const LEVELS = [
    { n: 6, words: 4, dirs: 2 },
    { n: 7, words: 5, dirs: 4 },
    { n: 8, words: 6, dirs: 8 },
    { n: 8, words: 6, dirs: 8, taj: true },
    { n: 9, words: 7, dirs: 8, taj: true }
  ];

  /* Kolikrát se slovo v mřížce vyskytuje (všech 8 směrů). */
  function occurrences(g, n, w) {
    let k = 0;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      ALL_DIRS.forEach((d) => {
        for (let i = 0; i < w.length; i++) {
          const rr = r + d[0] * i, cc = c + d[1] * i;
          if (rr < 0 || cc < 0 || rr >= n || cc >= n || g[rr * n + cc] !== w[i]) return;
        }
        k++;
      });
    }
    return w.length > 1 && w === w.split('').reverse().join('') ? k / 2 : k;
  }

  function tryPlace(g, n, w, dirs) {
    for (let t = 0; t < 80; t++) {
      const d = U.pick(dirs);
      const r0 = U.randInt(0, n - 1), c0 = U.randInt(0, n - 1);
      const cells = [];
      for (let i = 0; i < w.length; i++) {
        const r = r0 + d[0] * i, c = c0 + d[1] * i;
        if (r < 0 || c < 0 || r >= n || c >= n) break;
        const cur = g[r * n + c];
        if (cur && cur !== w[i]) break;
        cells.push(r * n + c);
      }
      if (cells.length !== w.length) continue;
      cells.forEach((k, i) => { g[k] = w[i]; });
      return cells;
    }
    return null;
  }

  /* Mřížka: { n, g: písmena, words: [{ w, cells }], theme, taj }. */
  function build(n, count, dirsN, taj) {
    const dirs = ALL_DIRS.slice(0, dirsN);
    const maxTaj = Math.max.apply(null, TAJENKY.map((t) => letters(t).length));
    for (let attempt = 0; attempt < 600; attempt++) {
      const th = U.pick(THEMES);
      const g = new Array(n * n).fill('');
      const placed = [];
      const pool = U.shuffle(th[1].filter((w) => w.length <= n));
      for (let i = 0; i < pool.length; i++) {
        const empties = g.filter((x) => !x).length;
        if (!taj && placed.length >= count) break;
        if (taj && placed.length >= count && empties <= maxTaj) break;
        const cells = tryPlace(g, n, pool[i], dirs);
        if (cells) placed.push({ w: pool[i], cells: cells });
      }
      if (placed.length < count) continue;
      const empty = [];
      g.forEach((x, i) => { if (!x) empty.push(i); });
      let tajenka = null;
      if (taj) {
        const fits = TAJENKY.filter((t) => letters(t).length === empty.length);
        if (!fits.length) continue;
        tajenka = U.pick(fits);
        const ls = letters(tajenka);
        empty.forEach((k, i) => { g[k] = ls[i]; });
      } else empty.forEach((k) => { g[k] = FILL[U.randInt(0, FILL.length - 1)]; });
      // Každé slovo musí v mřížce být právě jednou.
      if (placed.some((p) => occurrences(g, n, p.w) !== 1)) continue;
      return { n: n, g: g, words: placed, theme: th[0], taj: tajenka };
    }
    return null;
  }

  SM.registerGame({
    id: 'osmismerka',
    name: 'Osmisměrka',
    domain: 'slova',
    trains: 'pečlivé hledání očima, slovní zásobu a soustředění',
    short: 'Najděte v mřížce schovaná slova.',
    duration: 'asi 3 minuty',
    pace: { per: 'na slovo' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const where = L.dirs === 2 ? 'vodorovně zleva doprava nebo svisle shora dolů' : L.dirs === 4 ? 'vodorovně nebo svisle, i pozpátku' : 'vodorovně, svisle i šikmo, i pozpátku';
      const steps = [
        'V mřížce písmen jsou schovaná slova ze seznamu. Vedou ' + where + '.',
        'Slovo označíte klepnutím na jeho první a pak na poslední písmeno.',
        'Když nevíte, tlačítko „Nápověda“ ukáže první písmeno slova.'
      ];
      if (L.taj) steps.push('Písmena, která zbudou, dají přečtená po řádcích tajenku. CH se píše jako dvě písmena.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const narrow = ctx.size().w < 520;
      const n = narrow ? Math.min(L.n, 8) : L.n;
      const taj = L.taj && !ctx.short;
      const pz = build(n, ctx.short ? Math.min(L.words, 5) : L.words, L.dirs, taj) || build(n, 4, L.dirs, false);
      const t0 = performance.now();
      const res = await play(pz);
      const ms = (performance.now() - t0) / SM.timeScale;
      let tajOk = null;
      if (pz.taj && ctx.alive) tajOk = await askTajenka(pz, res.left);
      const items = pz.words.length + (pz.taj ? 1 : 0);
      const good = res.clean + (tajOk ? 1 : 0);
      const acc = good / items;
      ctx.finish({
        perf: acc, acc: acc, rt: ms / pz.words.length,
        levelDelta: acc >= 0.85 && res.hints <= 1 ? 1 : acc < 0.5 ? -1 : 0,
        big: res.clean + ' z ' + pz.words.length, bigLabel: 'slov nalezených bez nápovědy',
        details: ['Čas: ' + U.fmtTime(ms)].concat(pz.taj ? ['Tajenka: ' + pz.taj] : []),
        metric: { words: pz.words.length, clean: res.clean, hints: res.hints, taj: tajOk == null ? null : !!tajOk }
      });

      /* Hledání slov. Vrací { clean, hints, left: indexy nevyškrtaných písmen }. */
      function play(pz) {
        return new Promise((resolve) => {
          const N = pz.n;
          const found = {};
          const hinted = {};
          const hit = new Array(N * N).fill(0);
          let start = -1;
          let hints = 0;
          ctx.clear();
          ctx.status('Najděte slova: ' + pz.theme.toLowerCase() + '.');
          const chips = {};
          const list = h('div', { class: 'ws-words', 'aria-label': 'Hledaná slova' }, pz.words.map((p) => {
            const c = h('span', { class: 'ws-word', 'data-w': p.w }, p.w);
            chips[p.w] = c;
            return c;
          }));
          const box = h('div', { class: 'ws' }, list);
          ctx.stage.appendChild(box);
          const hintBtn = h('button', { class: 'btn btn-secondary btn-small ws-hint', type: 'button' }, 'Nápověda');
          ctx.foot.appendChild(hintBtn);
          const sz = ctx.size();
          const free = sz.h - list.offsetHeight - 12;
          const cell = Math.floor(U.clamp(Math.min((Math.min(sz.w, 540) - (N - 1) * 3) / N, (free - (N - 1) * 3) / N), 30, 60));
          const grid = h('div', { class: 'ws-grid', style: { '--n': N, '--cell': cell + 'px' } });
          const els = pz.g.map((ch, i) => {
            const b = h('button', { class: 'ws-cell', type: 'button', 'data-i': i, 'aria-label': ch + ', řádek ' + (Math.floor(i / N) + 1) + ', sloupec ' + (i % N + 1) }, ch);
            U.tap(b, () => tap(i));
            grid.appendChild(b);
            return b;
          });
          box.appendChild(grid);
          const update = () => ctx.progress('Nalezeno ' + Object.keys(found).length + ' z ' + pz.words.length);
          update();

          function line(a, b) {
            const r1 = Math.floor(a / N), c1 = a % N, r2 = Math.floor(b / N), c2 = b % N;
            const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
            const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1;
            if (!(r1 === r2 || c1 === c2 || Math.abs(r2 - r1) === Math.abs(c2 - c1))) return null;
            return Array.from({ length: len }, (_, i) => (r1 + dr * i) * N + (c1 + dc * i));
          }
          function tap(i) {
            if (!ctx.alive) return;
            if (start < 0) {
              start = i;
              els[i].classList.add('is-start');
              ctx.sound.tap();
              return;
            }
            els[start].classList.remove('is-start');
            if (start === i) { start = -1; return; }
            const cells = line(start, i);
            const a = start;
            start = -1;
            if (!cells) {
              ctx.status('Označte první a poslední písmeno slova v jedné řadě.');
              tap(i);
              return;
            }
            const word = cells.map((k) => pz.g[k]).join('');
            const p = pz.words.find((x) => !found[x.w] && (x.w === word || x.w === word.split('').reverse().join('')));
            if (!p) {
              ctx.sound.wrong();
              [a, i].forEach((k) => { els[k].classList.remove('is-shake'); void els[k].offsetWidth; els[k].classList.add('is-shake'); });
              ctx.status('To není žádné z hledaných slov. Zkuste to znovu.');
              return;
            }
            mark(p, false);
          }
          function mark(p, byHint) {
            found[p.w] = byHint ? 'hint' : 'ok';
            const color = Object.keys(found).length % 5;
            p.cells.forEach((k) => {
              hit[k]++;
              els[k].classList.add('is-found', 'c' + color);
              els[k].classList.remove('is-hint');
            });
            chips[p.w].classList.add('is-found');
            ctx.sound.correct();
            ctx.status(byHint ? 'Tady je: ' + p.w + '.' : 'Ano, ' + p.w + '!');
            update();
            if (Object.keys(found).length === pz.words.length) {
              hintBtn.disabled = true;
              grid.classList.add('is-done');
              const left = [];
              hit.forEach((x, k) => { if (!x) left.push(k); });
              ctx.sleep(900).then(() => resolve({ clean: pz.words.filter((x) => found[x.w] === 'ok').length, hints: hints, left: left }));
            }
          }
          U.tap(hintBtn, () => {
            if (!ctx.alive || hintBtn.disabled) return;
            const p = pz.words.find((x) => !found[x.w] && hinted[x.w]) || U.pick(pz.words.filter((x) => !found[x.w]));
            if (!p) return;
            hints++;
            if (hinted[p.w]) { mark(p, true); return; }
            hinted[p.w] = true;
            els[p.cells[0]].classList.add('is-hint');
            ctx.sound.tap();
            ctx.status('Slovo ' + p.w + ' začíná označeným písmenem. Další nápověda ukáže celé slovo.');
          });
        });
      }

      /* Tajenka: zbylá písmena se zvýrazní a hráč vybere, co říkají. */
      async function askTajenka(pz, left) {
        const grid = ctx.stage.querySelector('.ws-grid');
        left.forEach((k) => grid.children[k].classList.add('is-taj'));
        ctx.foot.textContent = '';
        ctx.status('Zbylá písmena čtená po řádcích dají tajenku. Co říká?');
        const len = letters(pz.taj).length;
        const others = U.shuffle(TAJENKY.filter((t) => t !== pz.taj)).sort((a, b) => Math.abs(letters(a).length - len) - Math.abs(letters(b).length - len)).slice(0, 2);
        const wait = K.choose(ctx, U.shuffle([pz.taj].concat(others)).map((t) => ({ label: t, value: t })), { answer: pz.taj, layout: 'col' });
        // Malý displej s velkým písmem: seznam (už nalezených) slov uvolní místo mřížce, ať jde tajenka přečíst.
        const box = grid.parentNode;
        const list = box.querySelector('.ws-words');
        if (list && K.overflow(box) > 0) list.style.display = 'none';
        const r = await wait;
        ctx.status(r.correct ? 'Správně: ' + pz.taj : 'Tajenka zní: ' + pz.taj);
        await ctx.sleep(r.correct ? 1600 : 2600);
        return r.correct;
      }
    }
  });
})();
