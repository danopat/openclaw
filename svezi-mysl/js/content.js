/* Svěží mysl — obsah slovních a paměťových her. */
(function () {
  'use strict';
  const SM = window.SM;

  /* Přísloví: t = text s mezerou ___, a = správné slovo, d = chybné možnosti. */
  const PROVERBS = [
    { t: 'Kdo jinému jámu kopá, ___ do ní padá.', a: 'sám', d: ['rád', 'často', 'zase'] },
    { t: 'Bez práce nejsou ___.', a: 'koláče', d: ['buchty', 'peníze', 'rohlíky'] },
    { t: 'Ranní ptáče dál ___.', a: 'doskáče', d: ['doletí', 'uvidí', 'dojde'] },
    { t: 'Lepší vrabec v hrsti než ___ na střeše.', a: 'holub', d: ['kos', 'čáp', 'havran'] },
    { t: 'Darovanému koni na ___ nehleď.', a: 'zuby', d: ['kopyta', 'uši', 'hřívu'] },
    { t: 'Komu se nelení, tomu se ___.', a: 'zelení', d: ['daří', 'vede', 'líbí'] },
    { t: 'Mluviti stříbro, mlčeti ___.', a: 'zlato', d: ['měď', 'perla', 'poklad'] },
    { t: 'Jablko nepadá daleko od ___.', a: 'stromu', d: ['plotu', 'domu', 'kmene'] },
    { t: 'Sejde z očí, sejde z ___.', a: 'mysli', d: ['srdce', 'cesty', 'hlavy'] },
    { t: 'Kdo dřív přijde, ten dřív ___.', a: 'mele', d: ['jí', 'odejde', 'dostane'] },
    { t: 'Dvakrát měř, jednou ___.', a: 'řež', d: ['šij', 'plať', 'stříhej'] },
    { t: 'Tichá voda ___ mele.', a: 'břehy', d: ['kameny', 'mlýny', 'písek'] },
    { t: 'Ráno moudřejší ___.', a: 'večera', d: ['noci', 'oběda', 'dne'] },
    { t: 'Na každém šprochu pravdy ___.', a: 'trochu', d: ['kousek', 'dost', 'víc'] },
    { t: 'Kdo nic nedělá, nic ___.', a: 'nezkazí', d: ['nemá', 'neví', 'nezíská'] },
    { t: 'Trpělivost ___ přináší.', a: 'růže', d: ['ovoce', 'štěstí', 'peníze'] },
    { t: 'Hlad je nejlepší ___.', a: 'kuchař', d: ['koření', 'lék', 'učitel'] },
    { t: 'Když se kácí les, létají ___.', a: 'třísky', d: ['ptáci', 'listy', 'piliny'] },
    { t: 'Kde se dva perou, třetí se ___.', a: 'směje', d: ['raduje', 'dívá', 'baví'] },
    { t: 'Vrána k vráně ___.', a: 'sedá', d: ['letí', 'patří', 'kráká'] },
    { t: 'Nechval dne před ___.', a: 'večerem', d: ['obědem', 'ránem', 'setměním'] },
    { t: 'Lež má krátké ___.', a: 'nohy', d: ['ruce', 'vlasy', 'uši'] },
    { t: 'Zvyk je železná ___.', a: 'košile', d: ['koule', 'brána', 'vesta'] },
    { t: 'Lepší pozdě než ___.', a: 'nikdy', d: ['brzy', 'zítra', 'ráno'] },
    { t: 'Ruka ruku ___.', a: 'myje', d: ['drží', 'hřeje', 'vede'] },
    { t: 'Pes, který štěká, ___.', a: 'nekouše', d: ['neběží', 'nespí', 'nevrčí'] },
    { t: 'Opakování matka ___.', a: 'moudrosti', d: ['učení', 'pokroku', 'rozumu'] },
    { t: 'Čistota půl ___.', a: 'zdraví', d: ['krásy', 'štěstí', 'života'] },
    { t: 'Mráz kopřivu ___.', a: 'nespálí', d: ['nezničí', 'neschová', 'nezastaví'] },
    { t: 'Kdo hledá, ___.', a: 'najde', d: ['ztratí', 'čeká', 'ví'] },
    { t: 'Pýcha předchází ___.', a: 'pád', d: ['hněv', 'smutek', 'chudobu'] },
    { t: 'Všeho moc ___.', a: 'škodí', d: ['stojí', 'zlobí', 'unaví'] },
    { t: 'Kdo seje vítr, sklízí ___.', a: 'bouři', d: ['déšť', 'mráz', 'krupobití'] },
    { t: 'Dobrá rada nad ___.', a: 'zlato', d: ['stříbro', 'peníze', 'poklad'] },
    { t: 'Co můžeš udělat dnes, neodkládej na ___.', a: 'zítřek', d: ['večer', 'potom', 'neděli'] },
    { t: 'Kdo chce psa bít, ___ si najde.', a: 'hůl', d: ['kámen', 'míč', 'bič'] },
    { t: 'Jak se do lesa volá, tak se z lesa ___.', a: 'ozývá', d: ['vrací', 'šumí', 'slyší'] },
    { t: 'Kočka leze dírou, pes ___.', a: 'oknem', d: ['dveřmi', 'střechou', 'plotem'] },
    { t: 'Kdo se bojí, nesmí do ___.', a: 'lesa', d: ['vody', 'sklepa', 'tmy'] },
    { t: 'Kdo pozdě chodí, sám sobě ___.', a: 'škodí', d: ['vadí', 'zbývá', 'pomáhá'] },
    { t: 'Starého psa novým kouskům ___.', a: 'nenaučíš', d: ['neukážeš', 'nepřinutíš', 'nezabavíš'] },
    { t: 'Kdo šetří, má za ___.', a: 'tři', d: ['dva', 'pět', 'deset'] }
  ];

  /* Protiklady: w = slovo, a = opak, d = chybné možnosti, lv = obtížnost 1–2. */
  const OPPOSITES = [
    { w: 'vysoký', a: 'nízký', d: ['široký', 'těžký', 'starý'], lv: 1 },
    { w: 'teplý', a: 'studený', d: ['mokrý', 'tvrdý', 'sladký'], lv: 1 },
    { w: 'rychlý', a: 'pomalý', d: ['veselý', 'krátký', 'tichý'], lv: 1 },
    { w: 'den', a: 'noc', d: ['rok', 'oběd', 'slunce'], lv: 1 },
    { w: 'otevřený', a: 'zavřený', d: ['velký', 'čistý', 'prázdný'], lv: 1 },
    { w: 'plný', a: 'prázdný', d: ['velký', 'těžký', 'otevřený'], lv: 1 },
    { w: 'těžký', a: 'lehký', d: ['měkký', 'malý', 'krátký'], lv: 1 },
    { w: 'mokrý', a: 'suchý', d: ['studený', 'čistý', 'tvrdý'], lv: 1 },
    { w: 'dlouhý', a: 'krátký', d: ['úzký', 'nízký', 'pomalý'], lv: 1 },
    { w: 'léto', a: 'zima', d: ['podzim', 'jaro', 'mráz'], lv: 1 },
    { w: 'smutný', a: 'veselý', d: ['hodný', 'klidný', 'zlý'], lv: 1 },
    { w: 'nahoře', a: 'dole', d: ['vedle', 'venku', 'uvnitř'], lv: 1 },
    { w: 'vlevo', a: 'vpravo', d: ['nahoře', 'rovně', 'vzadu'], lv: 1 },
    { w: 'sever', a: 'jih', d: ['západ', 'východ', 'sníh'], lv: 1 },
    { w: 'světlo', a: 'tma', d: ['lampa', 'oheň', 'barva'], lv: 2 },
    { w: 'začátek', a: 'konec', d: ['střed', 'příběh', 'okraj'], lv: 2 },
    { w: 'tvrdý', a: 'měkký', d: ['hladký', 'lehký', 'mladý'], lv: 2 },
    { w: 'hlasitý', a: 'tichý', d: ['pomalý', 'nízký', 'tmavý'], lv: 2 },
    { w: 'bohatý', a: 'chudý', d: ['malý', 'smutný', 'starý'], lv: 2 },
    { w: 'silný', a: 'slabý', d: ['pomalý', 'krátký', 'tichý'], lv: 2 },
    { w: 'široký', a: 'úzký', d: ['krátký', 'nízký', 'lehký'], lv: 2 },
    { w: 'čistý', a: 'špinavý', d: ['mokrý', 'starý', 'tmavý'], lv: 2 },
    { w: 'blízko', a: 'daleko', d: ['rychle', 'vysoko', 'brzy'], lv: 2 },
    { w: 'pravda', a: 'lež', d: ['chyba', 'otázka', 'slovo'], lv: 2 },
    { w: 'dát', a: 'vzít', d: ['nést', 'poslat', 'ukázat'], lv: 2 },
    { w: 'přijít', a: 'odejít', d: ['přinést', 'uvidět', 'zavolat'], lv: 2 },
    { w: 'ráno', a: 'večer', d: ['poledne', 'odpoledne', 'oběd'], lv: 2 },
    { w: 'zapnout', a: 'vypnout', d: ['zavřít', 'otočit', 'spustit'], lv: 2 },
    { w: 'vítěz', a: 'poražený', d: ['hráč', 'divák', 'trenér'], lv: 2 },
    { w: 'chytrý', a: 'hloupý', d: ['líný', 'malý', 'starý'], lv: 2 },
    { w: 'pracovitý', a: 'líný', d: ['chytrý', 'unavený', 'pomalý'], lv: 2 },
    { w: 'mladý', a: 'starý', d: ['malý', 'tichý', 'hodný'], lv: 2 }
  ];

  /* Přesmyčky: slovo + obrázek jako nápověda + kategorie. Bez písmene „ch“ a bez slov s jiným řešením. */
  const ANAGRAMS = [
    { w: 'RYBA', e: '🐟', c: 'zvíře' }, { w: 'KOLO', e: '🚲', c: 'dopravní prostředek' }, { w: 'VODA', e: '💧', c: 'pití' },
    { w: 'DORT', e: '🎂', c: 'sladkost' }, { w: 'KOZA', e: '🐐', c: 'zvíře' }, { w: 'VLAK', e: '🚂', c: 'dopravní prostředek' },
    { w: 'MRAK', e: '☁️', c: 'na obloze' }, { w: 'ŽÁBA', e: '🐸', c: 'zvíře' }, { w: 'PTÁK', e: '🐦', c: 'zvíře' },
    { w: 'SLON', e: '🐘', c: 'zvíře' }, { w: 'AUTO', e: '🚗', c: 'dopravní prostředek' }, { w: 'KÁVA', e: '☕', c: 'pití' },
    { w: 'KOČKA', e: '🐱', c: 'zvíře' }, { w: 'MRKEV', e: '🥕', c: 'zelenina' }, { w: 'KNIHA', e: '📚', c: 'ke čtení' },
    { w: 'VČELA', e: '🐝', c: 'hmyz' }, { w: 'HOUBA', e: '🍄', c: 'v lese' }, { w: 'STROM', e: '🌳', c: 'v přírodě' },
    { w: 'MLÉKO', e: '🥛', c: 'pití' }, { w: 'MOTÝL', e: '🦋', c: 'hmyz' }, { w: 'BANÁN', e: '🍌', c: 'ovoce' },
    { w: 'ŽELVA', e: '🐢', c: 'zvíře' }, { w: 'MĚSÍC', e: '🌙', c: 'na obloze' }, { w: 'HRNEK', e: '☕', c: 'v kuchyni' },
    { w: 'CITRON', e: '🍋', c: 'ovoce' }, { w: 'MELOUN', e: '🍉', c: 'ovoce' }, { w: 'HODINY', e: '⏰', c: 'ukazují čas' },
    { w: 'SLUNCE', e: '☀️', c: 'na obloze' }, { w: 'HVĚZDA', e: '⭐', c: 'na obloze' }, { w: 'HRUŠKA', e: '🍐', c: 'ovoce' },
    { w: 'JABLKO', e: '🍎', c: 'ovoce' }, { w: 'DEŠTNÍK', e: '☂️', c: 'do deště' }, { w: 'KLOBOUK', e: '🎩', c: 'oblečení' },
    { w: 'ZAHRADA', e: '🏡', c: 'u domu' }, { w: 'KVĚTINA', e: '🌷', c: 'v přírodě' }, { w: 'BERUŠKA', e: '🐞', c: 'hmyz' },
    { w: 'TELEFON', e: '📞', c: 'doma' }, { w: 'POLÉVKA', e: '🍲', c: 'jídlo' }, { w: 'TRUMPETA', e: '🎺', c: 'hudební nástroj' },
    { w: 'VIDLIČKA', e: '🍴', c: 'v kuchyni' }, { w: 'ČOKOLÁDA', e: '🍫', c: 'sladkost' }
  ];

  /* Co sem nepatří: w = tři slova, která k sobě patří, x = vetřelec, why = vysvětlení, lv = obtížnost 1–3. */
  const ODD = [
    { w: ['pes', 'kočka', 'kráva'], x: 'autobus', why: 'Ostatní jsou zvířata.', lv: 1 },
    { w: ['modrá', 'zelená', 'červená'], x: 'stolička', why: 'Ostatní jsou barvy.', lv: 1 },
    { w: ['housle', 'klavír', 'kytara'], x: 'štětec', why: 'Ostatní jsou hudební nástroje.', lv: 1 },
    { w: ['sešit', 'tužka', 'pravítko'], x: 'polštář', why: 'Ostatní jsou školní potřeby.', lv: 1 },
    { w: ['vrabec', 'kos', 'holub'], x: 'kapr', why: 'Ostatní jsou ptáci.', lv: 1 },
    { w: ['kladivo', 'šroubovák', 'kleště'], x: 'pánev', why: 'Ostatní jsou nářadí.', lv: 1 },
    { w: ['mléko', 'sýr', 'tvaroh'], x: 'chléb', why: 'Ostatní jsou mléčné výrobky.', lv: 1 },
    { w: ['pondělí', 'středa', 'pátek'], x: 'leden', why: 'Ostatní jsou dny v týdnu.', lv: 1 },
    { w: ['jablko', 'hruška', 'švestka'], x: 'mrkev', why: 'Ostatní jsou ovoce, mrkev je zelenina.', lv: 2 },
    { w: ['rajče', 'okurka', 'paprika'], x: 'banán', why: 'Ostatní jsou zelenina.', lv: 2 },
    { w: ['kapr', 'štika', 'pstruh'], x: 'kachna', why: 'Ostatní jsou ryby.', lv: 2 },
    { w: ['leden', 'březen', 'srpen'], x: 'úterý', why: 'Ostatní jsou měsíce.', lv: 2 },
    { w: ['Vltava', 'Labe', 'Morava'], x: 'Sněžka', why: 'Ostatní jsou řeky, Sněžka je hora.', lv: 2 },
    { w: ['Praha', 'Brno', 'Ostrava'], x: 'Dunaj', why: 'Ostatní jsou města, Dunaj je řeka.', lv: 2 },
    { w: ['čáp', 'vlaštovka', 'sýkora'], x: 'netopýr', why: 'Ostatní jsou ptáci, netopýr je savec.', lv: 2 },
    { w: ['tulipán', 'růže', 'karafiát'], x: 'bříza', why: 'Ostatní jsou květiny, bříza je strom.', lv: 2 },
    { w: ['jaro', 'léto', 'podzim'], x: 'prosinec', why: 'Ostatní jsou roční období.', lv: 2 },
    { w: ['tramvaj', 'autobus', 'trolejbus'], x: 'kolo', why: 'Ostatní jsou městská hromadná doprava.', lv: 2 },
    { w: ['čepice', 'šála', 'rukavice'], x: 'plavky', why: 'Ostatní se nosí v zimě.', lv: 2 },
    { w: ['lžíce', 'vidlička', 'nůž'], x: 'hrnec', why: 'Ostatní jsou příbor.', lv: 2 },
    { w: ['ponožky', 'boty', 'papuče'], x: 'klobouk', why: 'Ostatní se nosí na nohou.', lv: 2 },
    { w: ['jedle', 'smrk', 'borovice'], x: 'dub', why: 'Ostatní jsou jehličnaté stromy.', lv: 3 },
    { w: ['housle', 'kytara', 'violoncello'], x: 'trubka', why: 'Ostatní jsou strunné nástroje, trubka je dechová.', lv: 3 },
    { w: ['Smetana', 'Dvořák', 'Janáček'], x: 'Čapek', why: 'Ostatní jsou hudební skladatelé, Karel Čapek byl spisovatel.', lv: 3 },
    { w: ['Čapek', 'Němcová', 'Neruda'], x: 'Mucha', why: 'Ostatní jsou spisovatelé, Alfons Mucha byl malíř.', lv: 3 },
    { w: ['Sněžka', 'Lysá hora', 'Praděd'], x: 'Lipno', why: 'Ostatní jsou hory, Lipno je přehrada.', lv: 3 },
    { w: ['kilogram', 'gram', 'tuna'], x: 'metr', why: 'Ostatní jsou jednotky hmotnosti.', lv: 3 },
    { w: ['sekunda', 'minuta', 'hodina'], x: 'litr', why: 'Ostatní jsou jednotky času.', lv: 3 },
    { w: ['trojúhelník', 'čtverec', 'kruh'], x: 'krychle', why: 'Ostatní jsou rovinné útvary, krychle je těleso.', lv: 3 },
    { w: ['Labe', 'Vltava', 'Dunaj'], x: 'Balaton', why: 'Ostatní jsou řeky, Balaton je jezero.', lv: 3 },
    { w: ['Karlštejn', 'Křivoklát', 'Kokořín'], x: 'Lednice', why: 'Ostatní jsou hrady, Lednice je zámek.', lv: 3 },
    { w: ['jedna', 'tři', 'pět'], x: 'osm', why: 'Ostatní jsou lichá čísla.', lv: 3 },
    { w: ['lékař', 'zdravotní sestra', 'lékárník'], x: 'zedník', why: 'Ostatní pracují ve zdravotnictví.', lv: 3 }
  ];

  /* Jména a tváře: obličeje (emoji) se jmény a povoláním. */
  const FACES = {
    f: ['👩‍🦳', '👵', '👩‍🦰', '👱‍♀️', '👩‍🦱', '👩'],
    m: ['👨‍🦳', '👴', '👨‍🦰', '🧔', '👨‍🦲', '👱‍♂️', '👨‍🦱']
  };
  const NAMES = {
    f: ['Jana', 'Marie', 'Eva', 'Hana', 'Věra', 'Alena', 'Zdeňka', 'Jiřina', 'Libuše', 'Dana', 'Helena', 'Ludmila', 'Milena', 'Jarmila'],
    m: ['Petr', 'Josef', 'Jiří', 'Pavel', 'Jan', 'Karel', 'Miroslav', 'František', 'Václav', 'Zdeněk', 'Jaroslav', 'Milan', 'Vladimír', 'Stanislav']
  };
  const JOBS = [
    { f: 'pekařka', m: 'pekař', e: '🥖' }, { f: 'zahradnice', m: 'zahradník', e: '🌻' }, { f: 'učitelka', m: 'učitel', e: '📚' },
    { f: 'kuchařka', m: 'kuchař', e: '🍲' }, { f: 'rybářka', m: 'rybář', e: '🎣' }, { f: 'muzikantka', m: 'muzikant', e: '🎻' },
    { f: 'švadlena', m: 'krejčí', e: '🧵' }, { f: 'pošťačka', m: 'pošťák', e: '✉️' }, { f: 'včelařka', m: 'včelař', e: '🐝' },
    { f: 'malířka', m: 'malíř', e: '🎨' }, { f: 'hasička', m: 'hasič', e: '🚒' }, { f: 'lékařka', m: 'lékař', e: '🩺' }
  ];

  /* Příbuzenstvo: q = věta před vynechaným slovem, a = správně, d = chybné možnosti (stejného rodu),
     l = skupina: 1 základní vztahy, 2 příbuzní z manželství a pra-, 3 dva kroky. Každá věta má jedinou správnou odpověď. */
  const KIN = [
    { l: 1, q: 'Syn mé sestry je můj', a: 'synovec', d: ['bratranec', 'vnuk', 'strýc'] },
    { l: 1, q: 'Syn mého bratra je můj', a: 'synovec', d: ['bratranec', 'švagr', 'vnuk'] },
    { l: 1, q: 'Dcera mého bratra je moje', a: 'neteř', d: ['sestřenice', 'vnučka', 'teta'] },
    { l: 1, q: 'Dcera mé sestry je moje', a: 'neteř', d: ['sestřenice', 'snacha', 'vnučka'] },
    { l: 1, q: 'Bratr mé matky je můj', a: 'strýc', d: ['bratranec', 'dědeček', 'synovec'] },
    { l: 1, q: 'Bratr mého otce je můj', a: 'strýc', d: ['bratranec', 'švagr', 'tchán'] },
    { l: 1, q: 'Sestra mého otce je moje', a: 'teta', d: ['sestřenice', 'babička', 'neteř'] },
    { l: 1, q: 'Sestra mé matky je moje', a: 'teta', d: ['sestřenice', 'švagrová', 'neteř'] },
    { l: 1, q: 'Matka mé matky je moje', a: 'babička', d: ['teta', 'prababička', 'tchyně'] },
    { l: 1, q: 'Otec mého otce je můj', a: 'dědeček', d: ['strýc', 'pradědeček', 'tchán'] },
    { l: 1, q: 'Otec mé matky je můj', a: 'dědeček', d: ['strýc', 'tchán', 'pradědeček'] },
    { l: 1, q: 'Syn mého syna je můj', a: 'vnuk', d: ['synovec', 'pravnuk', 'bratranec'] },
    { l: 1, q: 'Dcera mé dcery je moje', a: 'vnučka', d: ['neteř', 'pravnučka', 'sestřenice'] },
    { l: 1, q: 'Dcera mého syna je moje', a: 'vnučka', d: ['neteř', 'snacha', 'sestřenice'] },
    { l: 1, q: 'Syn mého strýce je můj', a: 'bratranec', d: ['synovec', 'strýc', 'švagr'] },
    { l: 1, q: 'Dcera mé tety je moje', a: 'sestřenice', d: ['neteř', 'teta', 'švagrová'] },
    { l: 2, q: 'Otec mé manželky je můj', a: 'tchán', d: ['švagr', 'zeť', 'dědeček'] },
    { l: 2, q: 'Otec mého manžela je můj', a: 'tchán', d: ['švagr', 'strýc', 'zeť'] },
    { l: 2, q: 'Matka mého manžela je moje', a: 'tchyně', d: ['švagrová', 'snacha', 'teta'] },
    { l: 2, q: 'Matka mé manželky je moje', a: 'tchyně', d: ['snacha', 'švagrová', 'babička'] },
    { l: 2, q: 'Manžel mé dcery je můj', a: 'zeť', d: ['švagr', 'tchán', 'synovec'] },
    { l: 2, q: 'Manželka mého syna je moje', a: 'snacha', d: ['švagrová', 'neteř', 'tchyně'] },
    { l: 2, q: 'Bratr mé manželky je můj', a: 'švagr', d: ['zeť', 'bratranec', 'tchán'] },
    { l: 2, q: 'Bratr mého manžela je můj', a: 'švagr', d: ['zeť', 'strýc', 'synovec'] },
    { l: 2, q: 'Sestra mého manžela je moje', a: 'švagrová', d: ['snacha', 'sestřenice', 'tchyně'] },
    { l: 2, q: 'Sestra mé manželky je moje', a: 'švagrová', d: ['snacha', 'neteř', 'teta'] },
    { l: 2, q: 'Manžel mé sestry je můj', a: 'švagr', d: ['zeť', 'strýc', 'tchán'] },
    { l: 2, q: 'Manželka mého bratra je moje', a: 'švagrová', d: ['snacha', 'teta', 'sestřenice'] },
    { l: 2, q: 'Manžel mé tety je můj', a: 'strýc', d: ['švagr', 'bratranec', 'tchán'] },
    { l: 2, q: 'Manželka mého strýce je moje', a: 'teta', d: ['švagrová', 'sestřenice', 'tchyně'] },
    { l: 2, q: 'Otec mého dědečka je můj', a: 'pradědeček', d: ['dědeček', 'strýc', 'tchán'] },
    { l: 2, q: 'Matka mé babičky je moje', a: 'prababička', d: ['babička', 'teta', 'tchyně'] },
    { l: 2, q: 'Syn mého vnuka je můj', a: 'pravnuk', d: ['vnuk', 'synovec', 'bratranec'] },
    { l: 2, q: 'Dcera mé vnučky je moje', a: 'pravnučka', d: ['vnučka', 'neteř', 'sestřenice'] },
    { l: 3, q: 'Syn bratra mého otce je můj', a: 'bratranec', d: ['synovec', 'strýc', 'vnuk', 'švagr'] },
    { l: 3, q: 'Syn sestry mého otce je můj', a: 'bratranec', d: ['synovec', 'strýc', 'švagr', 'vnuk'] },
    { l: 3, q: 'Dcera sestry mé matky je moje', a: 'sestřenice', d: ['neteř', 'teta', 'vnučka', 'švagrová'] },
    { l: 3, q: 'Dcera bratra mé matky je moje', a: 'sestřenice', d: ['neteř', 'teta', 'švagrová', 'vnučka'] },
    { l: 3, q: 'Manžel sestry mé matky je můj', a: 'strýc', d: ['švagr', 'dědeček', 'bratranec', 'tchán'] },
    { l: 3, q: 'Otec otce mé matky je můj', a: 'pradědeček', d: ['dědeček', 'strýc', 'tchán', 'bratranec'] },
    { l: 3, q: 'Syn syna mého syna je můj', a: 'pravnuk', d: ['vnuk', 'synovec', 'bratranec', 'zeť'] },
    { l: 3, q: 'Dcera dcery mé dcery je moje', a: 'pravnučka', d: ['vnučka', 'neteř', 'sestřenice', 'snacha'] },
    { l: 3, q: 'Dcera mého bratra je pro mou dceru', a: 'sestřenice', d: ['neteř', 'teta', 'vnučka', 'švagrová'] },
    { l: 3, q: 'Syn mé sestry je pro mého otce', a: 'vnuk', d: ['synovec', 'bratranec', 'pravnuk', 'zeť'] },
    { l: 3, q: 'Matka mé manželky je pro naši dceru', a: 'babička', d: ['tchyně', 'teta', 'prababička', 'švagrová'] },
    { l: 3, q: 'Bratr mé manželky je pro našeho syna', a: 'strýc', d: ['bratranec', 'švagr', 'dědeček', 'synovec'] },
    { l: 3, q: 'Otec mého manžela je pro naše děti', a: 'dědeček', d: ['strýc', 'tchán', 'pradědeček', 'švagr'] },
    { l: 3, q: 'Manželka mého syna je pro mou manželku', a: 'snacha', d: ['švagrová', 'tchyně', 'neteř', 'sestřenice'] }
  ];

  /* Jména do rodokmenu. Vnoučata mají i přivlastňovací tvary (Tomášův strýc, Tomášova teta). */
  const FAMILY = {
    grand: { f: ['Marie', 'Věra', 'Jiřina', 'Ludmila'], m: ['Josef', 'Jaroslav', 'František', 'Václav'] },
    parents: { f: ['Jana', 'Petra', 'Lenka', 'Martina', 'Ivana', 'Hana'], m: ['Petr', 'Pavel', 'Martin', 'Michal', 'Jan', 'Zdeněk'] },
    kids: {
      f: [['Tereza', 'Terezin', 'Terezina'], ['Anna', 'Annin', 'Annina'], ['Klára', 'Klářin', 'Klářina'], ['Eliška', 'Eliščin', 'Eliščina'],
        ['Lucie', 'Luciin', 'Luciina'], ['Adéla', 'Adélin', 'Adélina'], ['Kristýna', 'Kristýnin', 'Kristýnina'], ['Barbora', 'Barbořin', 'Barbořina']],
      m: [['Tomáš', 'Tomášův', 'Tomášova'], ['Jakub', 'Jakubův', 'Jakubova'], ['Matěj', 'Matějův', 'Matějova'], ['Lukáš', 'Lukášův', 'Lukášova'],
        ['Ondřej', 'Ondřejův', 'Ondřejova'], ['Filip', 'Filipův', 'Filipova'], ['Adam', 'Adamův', 'Adamova'], ['Vojtěch', 'Vojtěchův', 'Vojtěchova']]
    }
  };

  SM.content = { PROVERBS, OPPOSITES, ANAGRAMS, ODD, FACES, NAMES, JOBS, KIN, FAMILY };
})();
