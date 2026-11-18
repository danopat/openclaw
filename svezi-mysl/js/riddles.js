/* Svěží mysl — Hádanka dne: vlastní znění klasických hádanek a chytáků.
   q = zadání, opts = možnosti, a = správná odpověď, why = vysvětlení, tag = druh, diff = obtížnost,
   pic / whyPic = jednoduchý obrázek k zadání nebo k řešení (SVG, barvy z proměnných vzhledu). */
(function () {
  'use strict';
  const SM = window.SM;

  /* Obrázky (viewBox v jednotkách SVG, barvy přes style, aby fungovaly i v tmavém vzhledu). */
  const dot = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="7" style="fill:var(--ink)"/>';
  const DOTS = [0, 1, 2].map((y) => [0, 1, 2].map((x) => dot(40 + 40 * x, 40 + 40 * y)).join('')).join('');
  const PIC = {
    dots: '<svg viewBox="0 -10 200 160">' + DOTS + '</svg>',
    dotsSolved: '<svg viewBox="0 -10 200 160"><path d="M40 120 40 0 160 120 40 120 120 40" style="fill:none;stroke:var(--dec);stroke-width:5;stroke-linejoin:round;stroke-linecap:round"/>' + DOTS + '</svg>',
    cake: '<svg viewBox="0 0 240 110"><circle cx="55" cy="55" r="44" style="fill:var(--sun-soft);stroke:var(--ink);stroke-width:3"/>' +
      '<path d="M11 55h88M55 11v88" style="stroke:var(--bad);stroke-width:4;stroke-dasharray:8 5"/>' +
      '<rect x="130" y="25" width="100" height="60" rx="8" style="fill:var(--sun-soft);stroke:var(--ink);stroke-width:3"/>' +
      '<path d="M122 55h116" style="stroke:var(--bad);stroke-width:4;stroke-dasharray:8 5"/></svg>',
    coins: '<svg viewBox="0 0 150 150">' + [[75, 75]].concat([0, 60, 120, 180, 240, 300].map((a) => [75 + 40 * Math.cos(a * Math.PI / 180), 75 + 40 * Math.sin(a * Math.PI / 180)]))
      .map((p, i) => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="19" style="fill:' + (i ? 'var(--coin-silver)' : 'var(--coin-gold)') + ';stroke:var(--ink);stroke-width:2.5"/>').join('') + '</svg>'
  };

  const RIDDLES = [
    { id: 'kocky', tag: 'chyták', diff: 'snadná', q: 'V pokoji jsou čtyři rohy. V každém rohu sedí jedna kočka a naproti každé kočce sedí tři kočky. Kolik koček je v pokoji?',
      opts: ['12', '4', '16'], a: '4', why: 'Jsou tam jen čtyři kočky. Každá z nich vidí naproti sobě ty tři ostatní.' },
    { id: 'vejce', tag: 'chyták', diff: 'snadná', q: 'Kolik vajec můžete sníst nalačno?',
      opts: ['Dvě', 'Jedno', 'Kolik chcete'], a: 'Jedno', why: 'Jen jedno. Po něm už nalačno nejste.' },
    { id: 'loket', tag: 'chyták', diff: 'snadná', q: 'Co můžete vzít do pravé ruky, ale nikdy ne do levé?',
      opts: ['Hrnek', 'Levý loket', 'Klíče'], a: 'Levý loket', why: 'Levý loket do levé ruky nevezmete, do pravé ano.' },
    { id: 'kava', tag: 'chyták', diff: 'střední', q: 'Paní Jana upustila prsten do plné plechovky kávy, a přesto prsten nezmokl. Jak je to možné?',
      opts: ['Prsten byl voděodolný', 'Káva byla mletá, ne uvařená', 'Káva byla studená'], a: 'Káva byla mletá, ne uvařená',
      why: 'V plechovce byla mletá káva, tedy prášek. Ten prsten nenamočí.' },
    { id: 'trojcata', tag: 'chyták', diff: 'střední', q: 'Dvě sestry se narodily stejný den, stejný rok a stejné mamince. Přesto nejsou dvojčata. Jak to?',
      opts: ['Jedna je adoptovaná', 'Narodily se v různých městech', 'Jsou dvě z trojčat'], a: 'Jsou dvě z trojčat',
      why: 'Narodila se trojčata a tyhle dvě sestry jsou dvě z nich.' },
    { id: 'silvestr', tag: 'logika', diff: 'střední', q: 'Pan Karel 1. ledna řekl: „Předevčírem mi bylo 69 let a příští rok mi bude 72.“ Kdy má pan Karel narozeniny?',
      opts: ['31. prosince', '1. ledna', '30. prosince'], a: '31. prosince',
      why: 'Předevčírem, 30. prosince, mu bylo 69. Druhý den, 31. prosince, oslavil 70. Letos na konci roku mu bude 71 a příští rok 72.' },
    { id: 'dort', tag: 'prostor', diff: 'střední', q: 'Na kolik nejvíc kousků můžete rozkrojit dort třemi rovnými řezy?',
      opts: ['6', '7', '8'], a: '8', whyPic: PIC.cake,
      why: 'Dvěma řezy shora do kříže vzniknou 4 kousky. Třetím řezem dort rozpůlíte vodorovně napříč všemi kousky, a máte jich 8.' },
    { id: 'mince', tag: 'prostor', diff: 'střední', q: 'Kolik stejných mincí můžete na stole položit kolem jedné mince tak, aby se jí všechny dotýkaly a nepřekrývaly se?',
      opts: ['4', '5', '6', '8'], a: '6', whyPic: PIC.coins, why: 'Kolem jedné mince se vejde přesně šest stejných mincí, jako okvětní lístky kytičky.' },
    { id: 'tecky', tag: 'prostor', diff: 'náročná', q: 'Devět teček tvoří čtverec 3 × 3. Máte je spojit čtyřmi rovnými čarami bez zvednutí tužky. Jde to?', pic: PIC.dots,
      opts: ['Ano, když čáry vedou i mimo čtverec', 'Ne, potřebujete aspoň pět čar', 'Ano, ale jen šikmými čarami'], a: 'Ano, když čáry vedou i mimo čtverec', whyPic: PIC.dotsSolved,
      why: 'Jde to, když se nebojíte vyjít za okraj pomyslného čtverce. Odtud se říká „myslet mimo krabici“.' },
    { id: 'provazky', tag: 'logika', diff: 'náročná', q: 'Máte dva provázky. Každý hoří přesně hodinu, ale nerovnoměrně, někde rychleji a jinde pomaleji. Jak odměříte 45 minut?',
      opts: ['Zapálím první provázek z obou konců a druhý z jednoho. Když první dohoří, zapálím i druhý konec druhého.', 'Oba provázky přestřihnu napůl a jednu polovinu zapálím.', 'Zapálím oba provázky z jednoho konce a počkám, až jeden dohoří.'],
      a: 'Zapálím první provázek z obou konců a druhý z jednoho. Když první dohoří, zapálím i druhý konec druhého.',
      why: 'Provázek zapálený z obou konců shoří za půl hodiny, i když hoří nerovnoměrně. Druhému provázku v tu chvíli zbývá hořet půl hodiny. Když ho zapálíte i z druhého konce, dohoří za čtvrt hodiny. Dohromady 45 minut.' },
    { id: 'lhari', tag: 'logika', diff: 'náročná', q: 'Ve vsi žijí Poctiví, kteří vždy mluví pravdu, a Lháři, kteří vždy lžou. Potkáte Adama a Bena. Adam řekne: „Oba jsme Lháři.“ Kdo je kdo?',
      opts: ['Oba jsou Lháři', 'Adam je Lhář, Ben je Poctivý', 'Adam je Poctivý, Ben je Lhář'], a: 'Adam je Lhář, Ben je Poctivý',
      why: 'Poctivý by o sobě nemohl říct, že je Lhář. Adam tedy lže a jeho věta neplatí: nejsou oba Lháři. Ben je proto Poctivý.' },
    { id: 'prumer', tag: 'čísla', diff: 'náročná', q: 'Může mít většina lidí víc nohou, než je průměrný počet nohou na jednoho člověka?',
      opts: ['Ano', 'Ne, to nejde'], a: 'Ano',
      why: 'Většina lidí má dvě nohy. Někteří ale nohu nemají, a tak je průměr maličko pod dvěma. Většina lidí má tedy víc nohou, než je průměr.' },
    { id: 'kyblik', tag: 'logika', diff: 'střední', q: 'Když rychle točíte kyblíkem s vodou v kruhu nad hlavou, voda nevyteče, ani když je kyblík dnem vzhůru. Proč?',
      opts: ['Voda se v pohybu zahustí', 'Pohyb tlačí vodu ke dnu kyblíku', 'Vzduch zespodu vodu podrží'], a: 'Pohyb tlačí vodu ke dnu kyblíku',
      why: 'Při rychlém otáčení tlačí vodu ke dnu kyblíku setrvačnost. Nahoře je silnější než tíha vody, a proto voda nevyteče.' },
    { id: 'kostky', tag: 'čísla', diff: 'střední', q: 'Hodíte dvěma kostkami a sečtete tečky. Co padne častěji: součet 7, nebo součet 12?',
      opts: ['Součet 12', 'Obojí stejně často', 'Součet 7'], a: 'Součet 7',
      why: 'Sedmička může padnout šesti způsoby (1 + 6, 2 + 5, 3 + 4, 4 + 3, 5 + 2, 6 + 1), dvanáctka jen jedním (6 + 6).' },
    { id: 'sachy', tag: 'logika', diff: 'střední', q: 'Vyhrajete, když vyhrajete dvě partie šachů za sebou. Hrajete třikrát a střídáte soupeře: dědu, který hraje výborně, a vnuka, který hraje slaběji. S kým začnete?',
      opts: ['S dědou (děda, vnuk, děda)', 'S vnukem (vnuk, děda, vnuk)', 'Na tom nezáleží'], a: 'S vnukem (vnuk, děda, vnuk)',
      why: 'Dvě výhry za sebou vždy zahrnují prostřední partii. Proti dědovi tedy musíte vyhrát tak jako tak, ale se slabším vnukem si zahrajete dvakrát.' },
    { id: 'hrnky', tag: 'čísla', diff: 'náročná', q: 'Pod jedním ze tří hrnků je bonbon. Vyberete hrnek. Moderátor, který ví, kde bonbon je, zvedne jeden z ostatních hrnků a ten je prázdný. Vyplatí se teď svůj výběr změnit?',
      opts: ['Ano, změnit', 'Ne, zůstat', 'Je to jedno'], a: 'Ano, změnit',
      why: 'První výběr je správný jen v jednom případě ze tří. Ve dvou případech ze tří je bonbon jinde a moderátor vám prázdným hrnkem prozradí kde. Změnou vyhrajete dvakrát ze tří.' },
    { id: 'kriva-mince', tag: 'logika', diff: 'náročná', q: 'Mince je pokřivená a líc padá častěji než rub. Jak s ní přesto spravedlivě losovat mezi Annou a Petrem?',
      opts: ['Hodím dvakrát. Líc a pak rub vyhrává Anna, rub a pak líc Petr. Dva stejné hody se nepočítají.', 'Hodím třikrát a rozhodne většina.', 'Hodím jednou a kdo prohraje, vybírá příště.'],
      a: 'Hodím dvakrát. Líc a pak rub vyhrává Anna, rub a pak líc Petr. Dva stejné hody se nepočítají.',
      why: 'Dvojice líc a rub i rub a líc jsou stejně pravděpodobné, i když je mince pokřivená. Stačí házet znovu, když padne dvakrát totéž.' },
    { id: 'hromadky', tag: 'logika', diff: 'náročná', q: 'Na stole leží 20 mincí, 7 z nich lícem nahoru. Máte zavázané oči. Jak mince rozdělíte na dvě hromádky, ve kterých bude stejně mincí lícem nahoru?',
      opts: ['Rozdělím je na dvě hromádky po deseti.', 'Odpočítám libovolných 7 mincí a všechny je otočím.', 'Otočím všech 20 mincí.'], a: 'Odpočítám libovolných 7 mincí a všechny je otočím.',
      why: 'Když mezi odpočítanými sedmi bylo několik mincí lícem nahoru, třeba 3, ve zbytku jich zůstalo 7 − 3 = 4. Po otočení odpočítaných sedmi je lícem nahoru i v nich 7 − 3 = 4.' },
    { id: 'sud', tag: 'prostor', diff: 'střední', q: 'Máte otevřený válcový sud s vodou. Jak bez odměrky poznáte, jestli je naplněný přesně do poloviny?',
      opts: ['Poklepu na sud a poslouchám.', 'Nakloním ho, až voda dosáhne k okraji. Když je právě vidět hrana dna, je ho polovina.', 'Ponořím prst až po kloub.'],
      a: 'Nakloním ho, až voda dosáhne k okraji. Když je právě vidět hrana dna, je ho polovina.',
      why: 'Hladina, která v nakloněném sudu vede od horního okraje přesně k protější hraně dna, dělí sud šikmo na dvě stejné poloviny.' },
    { id: 'bedny', tag: 'čísla', diff: 'náročná', q: 'Máte 10 beden jablek. Jablka váží po 100 gramech, jen v jedné bedně po 90 gramech. Jak jedním vážením zjistíte, ve které?',
      opts: ['Z 1. bedny vezmu 1 jablko, z 2. bedny 2 jablka, z 3. tři… a všechna zvážím najednou.', 'Zvážím po jednom jablku z každé bedny.', 'Zvážím celé bedny po dvou.'],
      a: 'Z 1. bedny vezmu 1 jablko, z 2. bedny 2 jablka, z 3. tři… a všechna zvážím najednou.',
      why: 'Kdyby všech 55 jablek vážilo po 100 g, bylo by to 5 500 g. Každé lehčí jablko ubere 10 g. Chybí-li třeba 30 g, lehčí jablka jsou ze 3. bedny.' },
    { id: 'karty', tag: 'čísla', diff: 'střední', q: 'Domeček z karet má v každém patře opřené dvojice karet a mezi patry vodorovné karty jako strop. Jednopatrový potřebuje 2 karty, dvoupatrový 7. Kolik karet potřebuje třípatrový?',
      opts: ['12', '15', '18'], a: '15',
      why: 'Spodní patro má 3 dvojice (6 karet) a nad nimi 2 karty stropu, prostřední 2 dvojice (4 karty) a 1 kartu stropu, horní 1 dvojici (2 karty). Celkem 6 + 2 + 4 + 1 + 2 = 15.' },
    { id: 'snek', tag: 'čísla', diff: 'střední', q: 'Šnek leze po zdi vysoké 10 metrů. Ve dne vyleze 3 metry, v noci sklouzne o 2 metry. Kolikátý den bude nahoře?',
      opts: ['10. den', '8. den', '7. den'], a: '8. den',
      why: 'Za den a noc postoupí o 1 metr. Po sedmi dnech a nocích je ve výšce 7 metrů a osmý den vyleze 3 metry až nahoru.' },
    { id: 'lekniny', tag: 'čísla', diff: 'střední', q: 'Lekníny na rybníku každý den zdvojnásobí svou plochu. Za 30 dní pokryjí celý rybník. Kolikátý den pokrývaly polovinu?',
      opts: ['15. den', '20. den', '29. den'], a: '29. den', why: 'Plocha se každý den zdvojnásobí, takže den předtím, než zakryly celý rybník, pokrývaly polovinu.' },
    { id: 'hrnek', tag: 'čísla', diff: 'náročná', q: 'Hrnek a talířek stojí dohromady 110 Kč. Hrnek je o 100 Kč dražší než talířek. Kolik stojí talířek?',
      opts: ['10 Kč', '5 Kč', '1 Kč'], a: '5 Kč',
      why: 'Talířek stojí 5 Kč a hrnek 105 Kč, dohromady 110 Kč. Odpověď 10 Kč napadne skoro každého, ale pak by hrnek stál 110 Kč a obojí 120 Kč.' },
    { id: 'pekari', tag: 'čísla', diff: 'střední', q: 'Pět pekařů upeče pět bochníků za pět hodin. Jak dlouho bude sto pekařům trvat, než upečou sto bochníků?',
      opts: ['100 hodin', '5 hodin', '1 hodinu'], a: '5 hodin', why: 'Každý pekař upeče jeden bochník za pět hodin. Sto pekařů tedy upeče sto bochníků také za pět hodin.' },
    { id: 'mesice', tag: 'chyták', diff: 'snadná', q: 'Kolik měsíců v roce má 28 dní?',
      opts: ['Jeden', 'Všech dvanáct', 'Žádný'], a: 'Všech dvanáct', why: '28 dní má každý měsíc. Únor jich má právě tolik (nebo 29), ostatní měsíce ještě víc.' },
    { id: 'dcery', tag: 'logika', diff: 'snadná', q: 'Pan Novák má tři dcery a každá z nich má jednoho bratra. Kolik dětí má pan Novák?',
      opts: ['6', '4', '3'], a: '4', why: 'Všechny tři dcery mají téhož bratra. Pan Novák má tedy tři dcery a jednoho syna.' },
    { id: 'peri', tag: 'chyták', diff: 'snadná', q: 'Co je těžší: kilogram peří, nebo kilogram železa?',
      opts: ['Železo', 'Peří', 'Váží stejně'], a: 'Váží stejně', why: 'Obojí váží jeden kilogram. Peří jen zabere víc místa.' },
    { id: 'zvony', tag: 'čísla', diff: 'střední', q: 'Kostelní hodiny odbíjejí šestou hodinu šesti údery a trvá jim to 5 sekund. Jak dlouho budou odbíjet dvanáctou?',
      opts: ['10 sekund', '12 sekund', '11 sekund'], a: '11 sekund', why: 'Mezi šesti údery je 5 mezer po sekundě. Mezi dvanácti údery je mezer 11, tedy 11 sekund.' },
    { id: 'poradi', tag: 'čísla', diff: 'snadná', q: 'Kolik je 2 + 2 × 2?',
      opts: ['8', '6', '4'], a: '6', why: 'Násobí se dřív, než se sčítá: 2 × 2 = 4 a 2 + 4 = 6.' },
    { id: 'tata', tag: 'čísla', diff: 'snadná', q: 'Táta a syn mají dohromady 36 let. Táta je o 30 let starší. Kolik let je synovi?',
      opts: ['6', '5', '3'], a: '3', why: 'Synovi jsou 3 roky a tátovi 33. Dohromady je to 36 a rozdíl je 30.' },
    { id: 'svicky', tag: 'chyták', diff: 'snadná', q: 'Na stole hořelo 7 svíček. Průvan 2 z nich sfoukl a ostatní hořely dál. Kolik svíček na stole zůstalo ráno?',
      opts: ['5', '2', '7'], a: '2', why: 'Zůstaly jen ty 2 sfouknuté. Těch 5, které hořely dál, do rána dohořelo.' }
  ];

  SM.riddles = { LIST: RIDDLES };
})();
