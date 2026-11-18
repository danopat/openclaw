/* Oslí můstek — zapamatovat si seznam pomocí slova z prvních písmen, na vyšších úrovních pomocí věty (paměťová technika). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Slova podle skupin; z nich se berou i nabídky při vybavování. */
  const POOL = {
    'Ovoce a zelenina': ['ananas', 'angrešt', 'avokádo', 'banán', 'borůvky', 'brokolice', 'celer', 'cibule', 'citron', 'česnek', 'dýně', 'fazole',
      'hrách', 'hruška', 'jablko', 'jahody', 'kapusta', 'kedluben', 'kiwi', 'květák', 'lilek', 'limetka', 'malina', 'meloun', 'meruňka', 'mrkev',
      'okurka', 'olivy', 'ořech', 'paprika', 'petržel', 'pomeranč', 'pórek', 'rajče', 'rybíz', 'ředkvička', 'salát', 'špenát', 'švestka',
      'třešně', 'tykev', 'višně', 'zelí'],
    'Zvířata': ['andulka', 'beran', 'čáp', 'drozd', 'husa', 'jelen', 'kachna', 'koza', 'kočka', 'kůň', 'labuť', 'liška', 'medvěd', 'myš',
      'netopýr', 'orel', 'osel', 'ovce', 'pes', 'prase', 'rys', 'slepice', 'sova', 'srna', 'sýkora', 'tchoř', 'veverka', 'vlk', 'vrabec', 'zajíc'],
    'Věci v kuchyni': ['alobal', 'budík', 'cedník', 'hrnec', 'hrnek', 'konvice', 'kastrol', 'lžíce', 'mixér', 'miska', 'nůž', 'ošatka', 'otvírák',
      'pánev', 'pekáč', 'sklenice', 'struhadlo', 'talíř', 'ubrus', 'utěrka', 'vařečka', 'váza', 'vidlička'],
    'Města': ['Aš', 'Beroun', 'Brno', 'Cheb', 'Děčín', 'Hodonín', 'Jihlava', 'Kladno', 'Kolín', 'Liberec', 'Most', 'Olomouc', 'Opava',
      'Ostrava', 'Písek', 'Plzeň', 'Praha', 'Tábor', 'Telč', 'Třeboň', 'Zlín']
  };
  /* Pomocná slova: každé písmeno je první písmeno jednoho slova ze seznamu. */
  const SETS = [
    ['KOČKA', 'Ovoce a zelenina', ['kedluben', 'okurka', 'česnek', 'kapusta', 'ananas']],
    ['SKALA', 'Ovoce a zelenina', ['salát', 'kiwi', 'angrešt', 'lilek', 'avokádo']],
    ['MOTOR', 'Ovoce a zelenina', ['meloun', 'okurka', 'třešně', 'ořech', 'rajče']],
    ['PASTA', 'Ovoce a zelenina', ['paprika', 'ananas', 'salát', 'třešně', 'avokádo']],
    ['MASKA', 'Ovoce a zelenina', ['meloun', 'angrešt', 'salát', 'kedluben', 'avokádo']],
    ['SOKOL', 'Zvířata', ['slepice', 'osel', 'koza', 'ovce', 'labuť']],
    ['SRNKA', 'Zvířata', ['sova', 'rys', 'netopýr', 'kočka', 'andulka']],
    ['SLOVO', 'Zvířata', ['sýkora', 'liška', 'osel', 'vrabec', 'ovce']],
    ['HOLUB', 'Věci v kuchyni', ['hrnek', 'ošatka', 'lžíce', 'ubrus', 'budík']],
    ['SLOUP', 'Věci v kuchyni', ['sklenice', 'lžíce', 'ošatka', 'utěrka', 'pánev']],
    ['KOLOS', 'Věci v kuchyni', ['konvice', 'ošatka', 'lžíce', 'otvírák', 'sklenice']],
    ['MOUKA', 'Věci v kuchyni', ['mixér', 'ošatka', 'utěrka', 'konvice', 'alobal']],
    ['TOPOL', 'Města', ['Tábor', 'Olomouc', 'Písek', 'Opava', 'Liberec']]
  ].filter((s) => new Set(s[2]).size === s[2].length).map((s) => ({ word: s[0], cat: s[1], items: s[2] }));
  /* Pomocné věty: první písmena slov věty dávají pořadí věcí. */
  const SENTENCES = [
    ['Kočka mňouká pod oknem.', 'Pochůzky', ['knihovna', 'masna', 'pošta', 'obchod']],
    ['Malý vrabec má strach.', 'Palačinky', ['mouka', 'vejce', 'mléko', 'sůl']],
    ['Bratr rád kreslí chaloupky.', 'Cesta na chatu', ['Beroun', 'Rakovník', 'Karlovy Vary', 'Cheb']],
    ['Pejsek okusuje kost nadšeně.', 'Úklid', ['prach', 'okna', 'koberec', 'nádobí']],
    ['Robert ochutnal sladké řízky.', 'Záhon', ['rajčata', 'okurky', 'salát', 'ředkvičky']],
    ['Naše hodiny rády mluví.', 'Výlet', ['nádraží', 'hrad', 'restaurace', 'muzeum']],
    ['Teta Olga peče buchty.', 'Nákup', ['těstoviny', 'olej', 'pečivo', 'brambory']],
    ['Dědeček sází mladé jabloně.', 'Pochůzky', ['drogerie', 'samoobsluha', 'masna', 'jízdenky']]
  ].map((s) => ({ text: s[0], cat: s[1], items: s[2] }));
  const ORD = ['první', 'druhé', 'třetí', 'čtvrté', 'páté'];

  /* lists = kolik seznamů naráz, hint = ukázat skupinu při vybavování, same = nabídka ze stejné skupiny (těžší), sentence = pomocná věta. */
  const LEVELS = [
    { lists: 1, hint: true },
    { lists: 2, hint: true },
    { lists: 3, hint: true },
    { lists: 2, hint: false, same: true },
    { sentence: true, lists: 2 }
  ];

  const first = (w) => w.charAt(0).toUpperCase();

  SM.registerGame({
    id: 'mustek',
    name: 'Oslí můstek',
    domain: 'pamet',
    trains: 'paměťovou techniku pomocného slova a věty',
    short: 'Zapamatujte si seznam pomocí jednoho slova.',
    duration: 'asi 2 až 3 minuty',
    maxLevel: LEVELS.length,
    data: { sets: SETS, sentences: SENTENCES }, // pro kontrolu obsahu v testu
    howTo(level) {
      const L = LEVELS[level - 1];
      if (L.sentence) {
        return [
          'Uvidíte věci, na jejichž pořadí záleží, a k nim pomocnou větu. Slova věty začínají stejně jako věci, a to ve stejném pořadí.',
          'Zapamatujte si větu a klepněte na „Mám zapamatováno“.',
          'Pak se zeptáme, co bylo kolikáté. Pomůže vám, když si větu zopakujete v duchu.'
        ];
      }
      return [
        'Jedno slovo se pamatuje snáz než celý seznam. Proto z prvních písmen věcí složíme pomocné slovo.',
        'Uvidíte ' + (L.lists > 1 ? L.lists + ' seznamy' : 'seznam') + ' a ke každému pomocné slovo. Zapamatujte si je.',
        'Po krátké pauze uvidíte jen pomocné slovo. Ke každému písmenu vyberte věc, která byla na seznamu.' + (L.hint ? ' Nápovědou bude skupina, do které věci patří.' : '')
      ];
    },
    async run(ctx) {
      const L = ctx.short ? Object.assign({}, LEVELS[ctx.level - 1], { lists: 1 }) : LEVELS[ctx.level - 1];
      let ok = 0, total = 0;
      if (L.sentence) {
        const sets = U.sample(SENTENCES, L.lists);
        for (let i = 0; i < sets.length; i++) {
          ctx.progress(sets.length > 1 ? 'Věta ' + (i + 1) + ' z ' + sets.length : '');
          await studySentence(sets[i]);
          await pause();
          for (const q of sentenceQuestions(sets[i])) {
            total++;
            if (await ask(q)) ok++;
          }
        }
      } else {
        const sets = U.sample(SETS, L.lists);
        for (let i = 0; i < sets.length; i++) {
          ctx.progress(sets.length > 1 ? 'Seznam ' + (i + 1) + ' z ' + sets.length : '');
          await studyWord(sets[i], i, sets.length);
        }
        await pause();
        for (let i = 0; i < sets.length; i++) {
          const s = sets[i];
          for (let k = 0; k < s.word.length; k++) {
            ctx.progress((sets.length > 1 ? 'Seznam ' + (i + 1) + ' · ' : '') + 'písmeno ' + (k + 1) + ' z ' + s.word.length);
            total++;
            if (await askLetter(s, k)) ok++;
          }
        }
      }
      const acc = total ? ok / total : 0;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.85, 0.6),
        big: ok + ' z ' + total, bigLabel: L.sentence ? 'otázek na pořadí správně' : 'věcí jste si vybavili',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      function wordNode(word, upto) {
        return h('div', { class: 'acro', 'aria-label': 'Pomocné slovo ' + word },
          word.split('').map((ch, i) => h('span', { class: 'acro-l' + (upto != null && i === upto ? ' is-now' : '') + (upto != null && i < upto ? ' is-done' : '') }, ch)));
      }
      function listNode(items) {
        return h('ol', { class: 'acro-list' }, items.map((w) => h('li', null, h('b', null, w.charAt(0)), w.slice(1))));
      }

      function studyWord(s, i, n) {
        ctx.clear();
        ctx.status('Zapamatujte si seznam a pomocné slovo.');
        const box = h('div', { class: 'stack mustek', 'data-ask': 'study', 'data-word': s.word },
          h('p', { class: 'acro-cat' }, s.cat), wordNode(s.word), listNode(s.items));
        ctx.stage.appendChild(box);
        return K.study(ctx, { label: i < n - 1 ? 'Další seznam' : 'Mám zapamatováno' });
      }

      function studySentence(s) {
        ctx.clear();
        ctx.status('Zapamatujte si pořadí pomocí věty.');
        const words = s.text.replace(/[.,]/g, '').split(' ');
        const box = h('div', { class: 'stack mustek', 'data-ask': 'study' },
          h('p', { class: 'acro-cat' }, s.cat),
          h('p', { class: 'acro-sentence' }, words.map((w, k) => h('span', null, h('b', null, w.charAt(0)), w.slice(1) + (k < words.length - 1 ? ' ' : '.')))),
          listNode(s.items));
        ctx.stage.appendChild(box);
        return K.study(ctx, {});
      }

      /* Krátká pauza, aby se seznam nedal jen „držet v hlavě“. */
      async function pause() {
        ctx.clear();
        ctx.status('Krátká pauza: spočítejte příklad.');
        const a = U.randInt(4, 9), b = U.randInt(3, 9);
        K.show(ctx, h('div', { class: 'mustek', 'data-ask': 'pause' }, h('p', { class: 'quiz-q' }, a + ' + ' + b + ' = ?')));
        const opts = U.shuffle([a + b, a + b + 1, a + b - 1]);
        await K.choose(ctx, opts.map((v) => ({ label: String(v), value: v })), { answer: a + b, layout: 'row', cls: 'is-mono', noMark: true });
        await ctx.sleep(700);
      }

      /* Nabídka k písmenu: správné slovo a dvě další na stejné písmeno (z jiných skupin, nebo ze stejné, když je těžší úroveň). */
      function letterOptions(s, k) {
        const right = s.items[k];
        const L1 = first(right);
        let pool = [];
        Object.keys(POOL).forEach((cat) => {
          if (L.same ? cat === s.cat : cat !== s.cat) pool = pool.concat(POOL[cat].filter((w) => first(w) === L1 && w !== right && s.items.indexOf(w) === -1));
        });
        if (pool.length < 2) {
          Object.keys(POOL).forEach((cat) => { pool = pool.concat(POOL[cat].filter((w) => first(w) === L1 && w !== right && pool.indexOf(w) === -1 && s.items.indexOf(w) === -1)); });
        }
        if (pool.length < 2) pool = pool.concat(U.sample(POOL[s.cat].filter((w) => w !== right && s.items.indexOf(w) === -1), 2 - pool.length));
        return U.shuffle([right].concat(U.sample(pool, 2)));
      }

      async function askLetter(s, k) {
        ctx.clear();
        ctx.status('Co začínalo na ' + first(s.items[k]) + '?' + (L.hint ? ' (' + s.cat.toLowerCase() + ')' : ''));
        K.show(ctx, h('div', { class: 'mustek', 'data-ask': 'letter', 'data-word': s.word, 'data-k': k }, wordNode(s.word, k)));
        const r = await K.choose(ctx, letterOptions(s, k).map((w) => ({ label: w, value: w })), { answer: s.items[k], layout: 'col' });
        ctx.status(r.correct ? 'Správně!' : 'Na seznamu bylo: ' + s.items[k] + '.');
        await ctx.sleep(r.correct ? 900 : 2000);
        return r.correct;
      }

      function sentenceQuestions(s) {
        const n = s.items.length;
        const qs = [];
        const idx = U.shuffle(Array.from({ length: n }, (_, i) => i));
        qs.push({ kind: 'what', k: idx[0] });
        qs.push({ kind: 'which', k: idx[1] });
        qs.push({ kind: 'what', k: idx[2] });
        return qs.map((q) => (q.kind === 'what'
          ? { q: 'Co bylo ' + ORD[q.k] + '?', opts: U.shuffle(s.items).slice(0, 3).concat(s.items[q.k]).filter((v, i, a) => a.indexOf(v) === i).slice(-3), a: s.items[q.k], s: s }
          : { q: 'Kolikáté v pořadí bylo: ' + s.items[q.k] + '?', opts: ORD.slice(0, n), a: ORD[q.k], s: s }));
      }

      async function ask(q) {
        ctx.clear();
        ctx.status(q.q);
        K.show(ctx, h('div', { class: 'mustek', 'data-ask': 'order', 'data-a': q.a }, h('p', { class: 'acro-cat' }, q.s.cat)));
        const opts = q.opts.indexOf(q.a) === -1 ? q.opts.slice(0, 2).concat(q.a) : q.opts;
        const r = await K.choose(ctx, U.shuffle(opts).map((v) => ({ label: v, value: v })), { answer: q.a, layout: 'col' });
        ctx.status(r.correct ? 'Správně!' : 'Správně je: ' + q.a + '. Věta byla: ' + q.s.text);
        await ctx.sleep(r.correct ? 900 : 2600);
        return r.correct;
      }
    }
  });
})();
