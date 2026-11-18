/* Svěží mysl — Škola paměti: šest krátkých lekcí o paměťových tricích (vlastní příklady, techniky jsou obecně známé). */
(function () {
  'use strict';
  const SM = window.SM;

  /* Každý trik: vysvětlení, obrázek (pic = krátký text nebo emoji), ukázka, procvičení (study = co si zapamatovat,
     questions = otázky s možnostmi, první možnost je správná), úkol do života a navazující hra. */
  const LIST = [
    {
      id: 'jmena', title: 'Jména a obrazy', short: 'Ke jménu si představte obrázek.',
      explain: ['Jména zapomínáme snadno, protože si pod nimi nic nepředstavíme.',
        'Pomůže jméno „oživit“: najít v něm věc, zvíře nebo povolání a spojit to s tváří člověka. Čím je obrázek živější a vtipnější, tím líp drží.'],
      pic: '👵 🌷 💦',
      example: 'Paní Zahradníková: představte si, jak konví zalévá záhon tulipánů přímo uprostřed chodníku.',
      study: { title: 'Zapamatujte si jména. U každého je obrázek, který jméno připomíná.', items: [
        ['👨‍🦳', 'pan Kovář', 'buší kladivem do podkovy'],
        ['👩', 'paní Vránová', 'na rameni jí sedí vrána'],
        ['🧔', 'pan Novotný', 'v ruce klíčky od úplně nového auta'],
        ['👩‍🦰', 'paní Malá', 'v dlani drží malinkou myšku']] },
      questions: [
        { pic: '👩‍🦰', q: 'Jak se jmenuje tato paní?', opts: ['paní Malá', 'paní Vránová', 'paní Nová'] },
        { pic: '👨‍🦳', q: 'Jak se jmenuje tento pán?', opts: ['pan Kovář', 'pan Novotný', 'pan Kolář'] },
        { pic: '🧔', q: 'A tento pán?', opts: ['pan Novotný', 'pan Novák', 'pan Kovář'] }],
      task: 'Až dnes uslyšíte nové jméno, zkuste si k němu hned vymyslet obrázek.',
      game: 'jmena'
    },
    {
      id: 'slovo', title: 'Pomocné slovo', short: 'Z prvních písmen složte slovo.',
      explain: ['Když si potřebujete zapamatovat několik věcí, vezměte jejich první písmena a složte z nich slovo.',
        'Jedno slovo se pamatuje snáz než celý seznam. Pak z něj věci zase „rozbalíte“.'],
      pic: 'M · O · R · E',
      example: 'Nákup: Mléko, Okurky, Rohlíky, Eidam. První písmena dají slovo MORE.',
      study: { title: 'Zapamatujte si nákup pomocí slova KOSA.', items: [
        ['☕', 'Káva', ''], ['🥒', 'Okurky', ''], ['🥓', 'Salám', ''], ['🥜', 'Arašídy', '']], word: 'KOSA' },
      questions: [
        { q: 'Jaké bylo pomocné slovo?', opts: ['KOSA', 'KOZA', 'KASA'] },
        { q: 'Co z nákupu začínalo na S?', opts: ['salám', 'sýr', 'sůl'] },
        { q: 'A co začínalo na O?', opts: ['okurky', 'ocet', 'olej'] }],
      task: 'Až budete psát nákupní lístek, složte z prvních písmen slovo a zkuste nakoupit bez lístku.',
      game: 'mustek'
    },
    {
      id: 'veta', title: 'Pomocná věta', short: 'Pořadí si uložte do věty.',
      explain: ['Když záleží na pořadí, vymyslete větu, jejíž slova začínají stejně jako věci, které si chcete zapamatovat.',
        'Věta s malým příběhem se pamatuje snadno a pořadí v ní zůstane.'],
      pic: 'P · L · B · K',
      example: 'Pochůzky: Pošta, Lékárna, Banka, Kostel. Věta: „Pavel Leží Bez Košile.“',
      study: { title: 'Zapamatujte si pochůzky pomocí věty „Babička Peče Koláče Ráda.“', items: [
        ['🏦', 'Banka', ''], ['🏤', 'Pošta', ''], ['📚', 'Knihovna', ''], ['🏛️', 'Radnice', '']] },
      questions: [
        { q: 'Kam jste měli jít jako druhé?', opts: ['na poštu', 'do banky', 'do knihovny'] },
        { q: 'A kam nakonec?', opts: ['na radnici', 'do knihovny', 'na poštu'] },
        { q: 'Kam hned na začátku?', opts: ['do banky', 'na poštu', 'na radnici'] }],
      task: 'Až budete mít víc pochůzek, vymyslete k nim větu a projděte je v tom pořadí.',
      game: 'mustek'
    },
    {
      id: 'koliky', title: 'Paměťové kolíky', short: 'Věci „pověste“ na obrázky čísel.',
      explain: ['Kolíky jsou pevné obrázky pro čísla. Jednou se je naučíte a pak na ně „věšíte“ věci, které si chcete zapamatovat v pořadí.',
        'Naše kolíky podle tvaru nebo počtu: 1 svíčka, 2 labuť, 3 trojlístek, 4 plachetnice, 5 ruka (pět prstů).'],
      pic: '🕯️ 🦢 ☘️ ⛵ ✋',
      example: 'První je chléb: svíčka zapíchnutá do bochníku. Druhé je mléko: labuť plave v hrnku mléka.',
      study: { title: 'Zapamatujte si pět věcí v pořadí. Každá visí na svém kolíku.', items: [
        ['🕯️', '1. jablka', 'svíčka zapíchnutá do jablka'],
        ['🦢', '2. sýr', 'labuť nese v zobáku sýr'],
        ['☘️', '3. med', 'trojlístek namočený v medu'],
        ['⛵', '4. vejce', 'plachetnice z vaječné skořápky'],
        ['✋', '5. máslo', 'ruka umazaná od másla']] },
      questions: [
        { q: 'Co bylo třetí?', opts: ['med', 'sýr', 'máslo'] },
        { q: 'Kolikáté bylo vejce?', opts: ['čtvrté', 'druhé', 'páté'] },
        { q: 'Co bylo páté?', opts: ['máslo', 'jablka', 'med'] }],
      task: 'Zopakujte si dnes kolíky 1 až 5 a pověste na ně pět věcí, které chcete zítra udělat.',
      game: 'koliky'
    },
    {
      id: 'skupiny', title: 'Skupiny', short: 'Dlouhý seznam roztřiďte.',
      explain: ['Dlouhý seznam si snáz zapamatujete, když ho roztřídíte do několika skupin.',
        'Pak si pamatujete jen pár skupin a v každé jen pár věcí. Pomůže představit si, kde v obchodě která skupina leží.'],
      pic: '🥖 🍎 🧼',
      example: 'Rohlíky, jablka, mýdlo, chléb, mrkev, zubní pasta: pečivo (rohlíky, chléb), ovoce a zelenina (jablka, mrkev), drogerie (mýdlo, pasta).',
      study: { title: 'Zapamatujte si nákup roztříděný do tří skupin.', items: [
        ['🥖', 'Pečivo', 'rohlíky, chléb, koláč'],
        ['🥕', 'Ovoce a zelenina', 'jablka, mrkev, cibule'],
        ['🧼', 'Drogerie', 'mýdlo, šampon, zubní pasta']] },
      questions: [
        { q: 'Co bylo v pečivu kromě rohlíků a chleba?', opts: ['koláč', 'veka', 'sušenky'] },
        { q: 'Která zelenina byla na seznamu?', opts: ['mrkev a cibule', 'mrkev a okurka', 'cibule a paprika'] },
        { q: 'Co v drogerii nebylo?', opts: ['krém', 'šampon', 'mýdlo'] }],
      task: 'Až budete psát nákup, rozdělte ho do skupin podle oddělení v obchodě.',
      game: 'nakup'
    },
    {
      id: 'trojice', title: 'Čísla po skupinách', short: 'Dlouhé číslo rozdělte na trojice.',
      explain: ['Dlouhé číslo se pamatuje špatně. Když ho rozdělíte na dvojice nebo trojice, jako se píšou telefonní čísla, jde to hned líp.',
        'Trojici si můžete i „přečíst“ jako číslo: 418 je čtyři sta osmnáct.'],
      pic: '602 418 375',
      example: '602418375 je těžké. 602 418 375 (šest set dva, čtyři sta osmnáct, tři sta sedmdesát pět) jde mnohem snáz.',
      study: { title: 'Zapamatujte si telefonní číslo po trojicích.', items: [['📞', '734 205 916', '']] },
      questions: [
        { q: 'Které číslo jste viděli?', opts: ['734 205 916', '734 250 916', '743 205 916'] },
        { q: 'Jaká byla prostřední trojice?', opts: ['205', '250', '520'] }],
      task: 'Zkuste si dnes takhle zapamatovat telefonní číslo někoho blízkého.',
      game: 'telefon'
    }
  ];

  SM.school = {
    LIST: LIST,
    byId(id) { return LIST.find((t) => t.id === id) || null; }
  };
})();
