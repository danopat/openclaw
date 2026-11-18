/* Slovní cikcak — řetěz slov, kde každé další slovo začíná posledními dvěma písmeny předchozího
   (KOČKA → KAŠTAN → ANDĚL). Chybějící písmena se doplňují výběrem z nabídky (slovní zásoba, práce s písmeny). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Běžná podstatná jména; řetězy se z nich skládají až ve hře. */
  const WORDS = [
   'JABLKO', 'HRUŠKA', 'ŠVESTKA', 'MERUŇKA', 'JAHODA', 'MALINA', 'BORŮVKA', 'BANÁN', 'OŘECH', 'CELER', 'CIBULE', 'ČESNEK', 'ZELÍ', 'KAPUSTA',
   'OKURKA', 'RAJČE', 'PAPRIKA', 'CUKETA', 'HRÁŠEK', 'FAZOLE', 'SALÁT', 'KOPR', 'STŮL', 'ŽIDLE', 'SKŘÍŇ', 'KŘESLO', 'POHOVKA', 'KOMODA', 'POLICE',
   'LAVICE', 'STOLIČKA', 'LAMPA', 'ZRCADLO', 'KOBEREC', 'KOČKA', 'KOZA', 'OVCE', 'PRASE', 'SLEPICE', 'HUSA', 'KACHNA', 'KRÁLÍK', 'KOHOUT', 'OSEL',
   'MORČE', 'LIŠKA', 'ZAJÍC', 'SRNA', 'VEVERKA', 'JEZEVEC', 'KANČ', 'KUNA', 'SOVA', 'DATEL', 'VRABEC', 'SÝKORA', 'VRÁNA', 'STRAKA', 'HOLUB', 'LABUŤ',
   'KUKAČKA', 'PĚNKAVA', 'SKŘIVAN', 'NARCIS', 'KOPRETINA', 'FIALKA', 'KARAFIÁT', 'CHRPA', 'ASTRA', 'JIŘINA', 'MACEŠKA', 'PIVOŇKA', 'LÍPA', 'BŘÍZA',
   'JAVOR', 'JASAN', 'JEDLE', 'BOROVICE', 'OLŠE', 'VRBA', 'TOPOL', 'KAŠTAN', 'HRNEC', 'TALÍŘ', 'MISKA', 'LŽÍCE', 'VIDLIČKA', 'HRNEK', 'SKLENICE',
   'KONVICE', 'CEDNÍK', 'VAŘEČKA', 'MÍSA', 'KABÁT', 'BUNDA', 'SVETR', 'KOŠILE', 'HALENKA', 'KALHOTY', 'VESTA', 'ČEPICE', 'ŠÁLA', 'RUKAVICE',
   'ZÁSTĚRA', 'MLHA', 'SLUNCE', 'DUHA', 'KROUPY', 'BLESK', 'HROM', 'VICHR', 'MOTYKA', 'KONEV', 'HADICE', 'BRANKA', 'ALTÁN', 'TRÁVA', 'KOLEČKO',
   'HOUSLE', 'KYTARA', 'FLÉTNA', 'TRUBKA', 'VIOLA', 'HARFA', 'NOTA', 'POLKA', 'ŘEZNÍK', 'KOVÁŘ', 'ZEDNÍK', 'MALÍŘ', 'KOLÁŘ', 'FOTBAL', 'HOKEJ',
   'AUTO', 'TRAMVAJ', 'KOLO', 'LETADLO', 'METRO', 'TAXI', 'MOTORKA', 'SANĚ', 'POLÉVKA', 'OMÁČKA', 'BÁBOVKA', 'KOLÁČ', 'BUCHTA', 'PALAČINKA',
   'TVAROH', 'VODA', 'MOŘE', 'ŘEKA', 'LOUKA', 'POLE', 'LESY', 'HORA', 'SKÁLA', 'MĚSTO', 'VESNICE', 'ULICE', 'KOSTEL', 'ŠKOLA', 'POŠTA', 'OBCHOD',
   'STROM', 'KVĚTINA', 'LIST', 'TRÁVNÍK', 'CESTA', 'MOST', 'BRÁNA', 'OKNO', 'DVEŘE', 'STŘECHA', 'KOMÍN', 'SKLEP', 'PŮDA', 'KOUPELNA', 'LOŽNICE',
   'ZAHRADA', 'MÁMA', 'TÁTA', 'BABIČKA', 'DĚDA', 'TETA', 'STRÝC', 'SESTRA', 'BRATR', 'DCERA', 'VNUČKA', 'KNIHA', 'NOVINY', 'FOTKA', 'HODINY',
   'TAŠKA', 'KOŠÍK', 'PENÍZE', 'MINCE', 'KORUNA', 'CHLEBA', 'ROHLÍK', 'MÁSLO', 'MLÉKO', 'VEJCE', 'CUKR', 'MOUKA', 'MASO', 'SALÁM', 'PIVO', 'VÍNO',
   'KÁVA', 'KAPR', 'ŠTIKA', 'PSTRUH', 'SUMEC', 'KAMEN', 'HLÍNA', 'KOPEC', 'ÚDOLÍ', 'POTOK', 'PRAMEN', 'STUDNA', 'ZIMA', 'JARO', 'LÉTO', 'RÁNO',
   'HODINA', 'MINUTA', 'HASIČ', 'ZAHRADNÍK', 'MYSLIVEC', 'KOČÁR', 'VESLO', 'KOTVA', 'PLACHTA', 'TELEVIZE', 'SVÍČKA', 'SIRKY', 'KAMNA', 'DŘEVO',
   'UHLÍ', 'NOHA', 'RUKA', 'HLAVA', 'UCHO', 'ÚSTA', 'PRST', 'KOLENO', 'LOKET', 'KOČIČKA', 'KOTĚ', 'TELE', 'KŮZLE', 'VÁNOCE', 'SVATBA', 'OSLAVA',
   'PANENKA', 'KOSTKA', 'HRAČKA', 'LOUTKA', 'KOLONÁDA', 'HRAD', 'ROZHLEDNA', 'KAPLE', 'ECHO', 'ARCHA', 'ARÉNA', 'ORLOJ', 'OSIKA', 'LOVEC', 'LOTOS',
   'NOTES', 'KAKAO', 'KAŠE', 'KAPSA', 'KARTA', 'KASA', 'KANÁL', 'TABULE', 'TALENT', 'TANEC', 'LEDNICE', 'LEKNÍN', 'LESÍK', 'LEVANDULE', 'NEBE',
   'NEDĚLE', 'NEMOC', 'ČESKO', 'ČERVEN', 'ČERVENEC', 'RADOST', 'RAKETA', 'RAMENO', 'RANEC', 'ROSA', 'ROSTLINA', 'ROKLE', 'ODPOLEDNE', 'OHEŇ',
   'ANDĚL', 'MAKOVEC', 'MALBA', 'MAPA', 'MARMELÁDA', 'TRUHLA', 'TRUMPETA', 'VARHANY', 'VAJÍČKO', 'CEMENT'
  ];
  const BY = {};
  WORDS.forEach((w) => { const p = w.slice(0, 2); (BY[p] = BY[p] || []).push(w); });
  const nexts = (w, used) => (BY[w.slice(-2)] || []).filter((x) => used.indexOf(x) === -1);
  const LETTERS = 'AAEEIIOOUKLMNPRSTVDBCHJZČŘŠŽÁÍÉ'.split('');

  /* words = slov v řetězu, blanks = chybějících písmen, opts = písmen v nabídce */
  const LEVELS = [
    { words: 3, blanks: 2, opts: 3 },
    { words: 4, blanks: 3, opts: 3 },
    { words: 4, blanks: 5, opts: 4 },
    { words: 5, blanks: 6, opts: 4 }
  ];

  /* Náhodný řetěz n slov (bez opakování). */
  function chain(n) {
    for (let t = 0; t < 400; t++) {
      const c = [U.pick(WORDS)];
      while (c.length < n) {
        const nx = nexts(c[c.length - 1], c);
        if (!nx.length) break;
        c.push(U.pick(nx));
      }
      if (c.length === n) return c;
    }
    return null;
  }
  /* Písmena řetězu za sebou (společná dvojice se počítá jednou) a kde které slovo začíná. */
  function layout(c) {
    const seq = [];
    const starts = [];
    c.forEach((w, i) => {
      starts.push(i === 0 ? 0 : seq.length - 2);
      w.split('').forEach((ch, j) => { if (i === 0 || j >= 2) seq.push(ch); });
    });
    return { seq: seq, starts: starts };
  }
  /* Chybějící písmena: v každém slově zůstanou aspoň dvě písmena vidět. */
  function holes(c, lay, k) {
    for (let t = 0; t < 300; t++) {
      const pick = U.sample(lay.seq.map((_, i) => i), k).sort((a, b) => a - b);
      const okk = c.every((w, i) => {
        let shown = 0;
        for (let j = 0; j < w.length; j++) if (pick.indexOf(lay.starts[i] + j) === -1) shown++;
        return shown >= 2;
      });
      if (okk) return pick;
    }
    return [lay.seq.length - 1];
  }

  SM.registerGame({
    id: 'cikcak',
    name: 'Slovní cikcak',
    domain: 'slova',
    trains: 'slovní zásobu a práci s písmeny',
    short: 'Doplňte písmena v řetězu slov.',
    duration: 'asi 2 minuty',
    pace: { per: 'na písmeno' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    /** Jeden řetěz dané úrovně (pro kontrolu). */
    gen(level) { const L = LEVELS[level - 1]; const c = chain(L.words); if (!c) return null; const lay = layout(c); return { words: c, seq: lay.seq, holes: holes(c, lay, L.blanks) }; },
    howTo() {
      return ['Slova tvoří řetěz: každé další začíná posledními dvěma písmeny předchozího, třeba KOČKA a KAŠTAN.',
        'Společná písmena jsou zvýrazněná. Některá písmena chybějí.',
        'Pro rámeček s otazníkem vyberte správné písmeno. Pomůže, když si celé slovo přečtete.'];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : 2;
      const words = ctx.short ? Math.min(3, L.words) : L.words;
      let ok = 0, total = 0;
      for (let i = 0; i < N; i++) {
        ctx.progress('Řetěz ' + (i + 1) + ' z ' + N);
        const r = await one(chain(words) || ['KOČKA', 'KAŠTAN', 'ANDĚL'], ctx.short ? Math.min(L.blanks, 3) : L.blanks);
        ok += r.ok;
        total += r.total;
      }
      const acc = total ? ok / total : 0;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.85, 0.55),
        big: ok + ' z ' + total, bigLabel: 'písmen doplněno napoprvé',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      async function one(c, k) {
        const lay = layout(c);
        const miss = holes(c, lay, k);
        const filled = {};
        ctx.clear();
        const rows = c.map((w, i) => h('div', { class: 'cc-row' }, w.split('').map((ch, j) => {
          const at = lay.starts[i] + j;
          const link = (i > 0 && j < 2) || (i < c.length - 1 && j >= w.length - 2);
          return h('span', { class: 'cc-tile' + (link ? ' is-link' : ''), 'data-at': at });
        })));
        const box = h('div', { class: 'stack cikcak', 'data-seq': lay.seq.join('') }, h('div', { class: 'cc-rows' }, rows));
        ctx.stage.appendChild(box);
        const paint = (now) => {
          box.querySelectorAll('.cc-tile').forEach((el) => {
            const at = +el.dataset.at;
            const hidden = miss.indexOf(at) !== -1 && !filled[at];
            el.textContent = hidden ? (at === now ? '?' : '') : lay.seq[at];
            el.classList.toggle('is-hole', hidden);
            el.classList.toggle('is-now', at === now);
            el.classList.toggle('is-fixed', filled[at] === 'fix');
          });
          box.dataset.now = now == null ? '' : now;
        };
        let good = 0;
        for (const at of miss) {
          paint(at);
          ctx.status('Které písmeno patří do rámečku s otazníkem?');
          const right = lay.seq[at];
          const others = U.shuffle(LETTERS.filter((x) => x !== right)).filter((x, i, a) => a.indexOf(x) === i).slice(0, L.opts - 1);
          const t0 = performance.now();
          const r = await K.choose(ctx, U.shuffle([right].concat(others)).map((x) => ({ value: x, label: x })), { answer: right, layout: 'row', cls: 'is-mono cc-opts', noMark: true });
          ctx.mark(r.correct, (performance.now() - t0) / SM.timeScale);
          if (r.correct) good++;
          filled[at] = r.correct ? 'ok' : 'fix';
          await ctx.sleep(r.correct ? 500 : 1300);
          ctx.foot.textContent = '';
        }
        paint(null);
        ctx.status('Řetěz: ' + c.join(' → ') + '.');
        await K.next(ctx, 'Pokračovat');
        return { ok: good, total: miss.length };
      }
    }
  });
})();
