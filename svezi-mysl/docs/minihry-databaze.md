# Databáze miniher: plán

Stav: návrh ze 17. 11. 2026, zatím nic z toho není naprogramované. Zdrojem nápadů jsou fotky knihy, kapitola *Myšlenkové schopnosti* (str. 56–71, celkem 63 cvičení). Stejná data jsou i v tabulce [`minihry-databaze.csv`](minihry-databaze.csv) pro Excel, Numbers nebo Google Tabulky.

## Shrnutí

- **30 nových miniher**: 9 v první vlně (P1), 11 ve druhé (P2), 10 na později (P3).
- **6 rozšíření** her, které už v aplikaci jsou (nové režimy).
- **22 námětů na Hádanku dne**: logické hádanky a chytáky z kapitol Řešení problémů a Rozhodování. Na rychlou adaptivní minihru se nehodí, ale jako jedna klidná hádanka denně ano.
- **3 cvičení** už pokrývají hry, které máme (Jména a tváře, Nákupní seznam, Mozaika).

**Doporučená první vlna (P1):** Kde co leží (PA-01), Co k čemu patří (PA-02), Kde je kulička? (PO-01), Vyšší, nebo nižší? (RO-01), Osmisměrka s tajenkou (SL-01), Příbuzenstvo (SL-04), Řetězové počty (PL-01), Sudoku (PL-02), Výhodný nákup (PL-03). Pokrývá všech pět oblastí, má hodně vazeb na běžný život a obsah se dá z velké části generovat.

## Jak číst databázi

- **ID:** PA Paměť, PO Postřeh, RO Rozhodování, SL Slova, PL Počty a logika, EX rozšíření stávající hry, HD Hádanka dne.
- **Priorita:** P1 stavět jako první, P2 potom, P3 až po zkušenostech se seniory nebo pokud zbude čas.
- **Pracnost:** S malá (jednoduchá logika, obsah se generuje), M střední (vlastní grafika nebo generátor s kontrolou řešení), L velká (rozsáhlý obsah: slovník, mapy).
- **Inspirace:** strana a číslo cvičení v knize.

## Co musí obsahovat každá minihra

1. Krátké pokyny ve 2–4 větách (vykání), které jde přečíst nahlas. U nové hry ukázka.
2. Úrovně obtížnosti (3–8) a posun podle výkonu: nahoru, beze změny, dolů. Na první úrovni žádný časový tlak.
3. Dvě délky: krátká do lekce (asi 1–2 minuty) a delší pro volné hraní (2–4 minuty).
4. Výsledek: hlavní číslo s popiskem, výkon 0–1 (z něj body) a údaj do historie.
5. Ovládání jen klepnutím na velké prvky. Žádné tažení, kreslení ani psaní textu. Čísla přes vlastní klávesnici aplikace.
6. Informace nikdy jen barvou: vždy i tvar, ikona nebo slovo.
7. Vlastní obsah. Z knihy přebíráme jen typ úlohy, ne texty, čísla, seznamy ani obrázky.
8. Automatický hráč do testu (tests/e2e.cjs), aby se hra dala dohrát v testu.

## Přehled miniher

| ID | Minihra | Oblast | Typ | Priorita | Pracnost | Vztah k aplikaci | Inspirace (str./č.) |
|---|---|---|---|---|---|---|---|
| PA-01 | Kde co leží | Paměť | Nová minihra | P1 | M | Nová | 57/6 |
| PA-02 | Co k čemu patří | Paměť | Nová minihra | P1 | M | Nová | 56/3, 58/9, 58/10 |
| PO-01 | Kde je kulička? | Postřeh | Nová minihra | P1 | M | Nová | 71/5 |
| RO-01 | Vyšší, nebo nižší? | Rozhodování | Nová minihra | P1 | S | Nová | 68/14 |
| SL-01 | Osmisměrka s tajenkou | Slova | Nová minihra | P1 | M | Nová | 61/4 |
| SL-04 | Příbuzenstvo | Slova | Nová minihra | P1 | S | Nová | 64/9 |
| PL-01 | Řetězové počty | Počty a logika | Nová minihra | P1 | S | Nová | 62/4, 65/15 |
| PL-02 | Sudoku | Počty a logika | Nová minihra | P1 | M | Nová | 63/7 |
| PL-03 | Výhodný nákup | Počty a logika | Nová minihra | P1 | S | Nová | 64/11 |
| PA-03 | Smajlíci | Paměť | Nová minihra | P2 | S | Nová | 56/1 |
| PA-04 | Oslí můstek | Paměť | Nová minihra | P2 | M | Nová (učí paměťovou techniku) | 58/8 |
| PA-05 | Vynesené karty | Paměť | Nová minihra | P2 | M | Nová | 59/14 |
| RO-02 | Přelévání | Rozhodování | Nová minihra | P2 | M | Nová | 66/2 |
| RO-03 | Popletené štítky | Rozhodování | Nová minihra | P2 | S | Nová | 71/4 |
| SL-02 | Písmenková polévka | Slova | Nová minihra | P2 | S | Nová (příbuzná Přesmyčkám) | 61/5 |
| SL-03 | Slovní žebřík | Slova | Nová minihra | P2 | M | Nová | 60/2 |
| PL-04 | Terč | Počty a logika | Nová minihra | P2 | S | Nová | 62/1 |
| PL-05 | Balonky | Počty a logika | Nová minihra | P2 | S | Nová | 63/8 |
| PL-06 | Slovní úlohy | Počty a logika | Nová minihra | P2 | M | Nová | 62/3, 63/5, 64/12, 64/13, 65/14 |
| PL-07 | Stavba z kostek | Počty a logika | Nová minihra | P2 | M | Nová | 63/6 |
| PA-06 | Mapa Česka | Paměť | Nová minihra | P3 | L | Nová | 59/12 |
| RO-04 | Tři hrnky: měnit, nebo ne? | Rozhodování | Nová minihra | P3 | S | Nová (pokus, ne adaptivní hra) | 71/5 |
| RO-05 | Přesýpací hodiny | Rozhodování | Nová minihra | P3 | M | Nová | 69/19 |
| SL-05 | Slovní kruh | Slova | Nová minihra | P3 | L | Nová | 61/6 |
| SL-06 | Slovní cikcak | Slova | Nová minihra | P3 | M | Nová | 60/1 |
| SL-07 | Tajná šifra | Slova | Nová minihra | P3 | S | Nová | 60/3 |
| SL-08 | Posuvné sloupce | Slova | Nová minihra | P3 | L | Nová | 61/7 |
| PL-08 | Číselná síť | Počty a logika | Nová minihra | P3 | M | Nová | 62/2 |
| PL-09 | Křížové počty | Počty a logika | Nová minihra | P3 | L | Nová | 64/10 |
| PL-10 | Dělení tvaru | Počty a logika | Nová minihra | P3 | L | Nová | 69/16 |
| EX-01 | Co se změnilo: víc změn | Paměť | Rozšíření | P2 | S | Rozšíření hry Co se změnilo | 56/4 |
| EX-02 | Co se změnilo: co přibylo | Paměť | Rozšíření | P2 | S | Rozšíření hry Co se změnilo | 58/11 |
| EX-03 | Jména a tváře: portréty a vybavení později | Paměť | Rozšíření | P2 | M | Rozšíření hry Jména a tváře | 57/5 |
| EX-04 | Telefonní číslo: dlouhá čísla | Paměť | Rozšíření | P3 | S | Rozšíření hry Telefonní číslo | 56/2 |
| EX-05 | Nákupní seznam: vybavení s kategoriemi | Paměť | Rozšíření | P3 | S | Rozšíření hry Nákupní seznam | 57/7 |
| EX-06 | Mozaika: čtyři vzory za sebou | Paměť | Rozšíření | P3 | S | Rozšíření hry Mozaika | 59/13 |

## Podrobné karty

## Paměť

### PA-01 Kde co leží

*Paměť · Nová minihra · priorita P1 · pracnost M*

- **Inspirace:** str. 57, č. 6 Umístění předmětu
- **Trénuje:** Paměť na umístění věcí (epizodická a prostorová). Přímo souvisí s častou starostí „kde mám zase brýle?“.
- **Jak se hraje:**
  1. Půdorys bytu nebo domu s popsanými místnostmi (kuchyně, obývák, ložnice, předsíň, koupelna…). V místnostech leží běžné věci: brýle, klíče, peněženka, léky, deštník.
  2. Hráč si plánek prohlíží, dokud neklepne na „Mám zapamatováno“ (na vyšších úrovních s odpočtem).
  3. Plánek se vyprázdní a přijdou 3 až 5 otázek: „Kde ležely klíče?“ (klepnout na místnost), „Co bylo v kuchyni?“ (vybrat obrázky, může jich být víc), „Kolik věcí bylo v ložnici?“.
- **Obsah a data:** 3–4 šablony půdorysů jako jednoduché SVG (garsonka, byt 2+1, byt 3+1, dům s verandou). Sada asi 30 věcí jako ikony. Generátor rozmístění a otázek. Data: {plánek, místnosti[], věci[{id, místnost}]}.
- **Úrovně:** 1) 4 věci, 3 místnosti, jen otázky „kde“. 2) 6 věcí, 4 místnosti. 3) 8 věcí, přibude „co bylo v…“. 4) 10 věcí, 5–6 místností. 5) 12 věcí, otázky na počet a polohu („nejblíž ke dveřím“). 6) Odložené vybavení: otázky až na konci lekce.
- **Hodnocení:** Podíl správných odpovědí. Nahoru při ≥ 85 %, dolů pod 50 %.
- **Krátká verze do lekce:** 1 plánek, 3 otázky.
- **Pozor u seniorů:** Místnosti vždy popsané slovem, ne jen barvou. Velké plochy pro klepnutí. Na nízkých úrovních žádné otázky „vlevo/vpravo“.

### PA-02 Co k čemu patří

*Paměť · Nová minihra · priorita P1 · pracnost M*

- **Inspirace:** str. 56, č. 3 Mimo náš svět; str. 58, č. 9 Problémy s hesly; str. 58, č. 10 Množství ingrediencí v receptu
- **Trénuje:** Spojování dvou údajů (asociativní paměť): věc a cena, jméno a datum, ingredience a množství.
- **Jak se hraje:**
  1. Seznam dvojic, například „rohlík – 4 Kč“, „autobus 133 – 8:15“.
  2. Po zakrytí otázky: ke každé položce vybrat správnou hodnotu ze 3–4 možností.
  3. Na vyšších úrovních doplnit chybějící řádky tabulky (jako u receptu) nebo hledat v opačném směru (k ceně vybrat zboží).
- **Obsah a data:** Tematické balíčky s vlastními texty, hodnoty se generují: Ceník na trhu, Jízdní řád, Narozeniny v rodině, Kódy (schránka, branka, kolo — vždy smyšlené čtyřčíslí), Babiččin recept (bábovka, palačinky, knedlíky, vánočka). Asi 10 balíčků po 10–15 dvojicích. Data: {balíček, dvojice[{položka, hodnota, jednotka}]}.
- **Úrovně:** 1) 3 dvojice, výběr ze 3. 2) 4 dvojice. 3) 5 dvojic, výběr ze 4. 4) 6 dvojic. 5) 8 dvojic, doplnit tabulku. 6) 8 dvojic a opačný směr.
- **Hodnocení:** Podíl správně spojených dvojic.
- **Krátká verze do lekce:** 1 seznam, 3–4 otázky.
- **Pozor u seniorů:** Čísla psát velkým písmem a s mezerami (1 250 Kč). U kódů upozornit, že jde jen o cvičení a skutečné PINy si nikde nezapisujte.

### PA-03 Smajlíci

*Paměť · Nová minihra · priorita P2 · pracnost S*

- **Inspirace:** str. 56, č. 1 Kruhy smajlíků
- **Trénuje:** Zrakovou paměť a spojení „co“ a „kde“.
- **Jak se hraje:**
  1. V kroužcích jsou obličeje s různým výrazem (úsměv, smutek, překvapení, mrknutí, vyplazený jazyk…).
  2. Po zakrytí hráč klepne na prázdný kroužek a vybere k němu výraz z nabídky. Místo kreslení z knihy je tu výběr.
- **Obsah a data:** 10–12 výrazů jako jednoduché kreslené obličeje v SVG. Neuvažovat emoji: kreslené výrazy se liší jen pusou a očima a dají se odstupňovat podle obtížnosti.
- **Úrovně:** 3 → 4 → 5 → 6 → 8 kroužků. Na vyšších úrovních si jsou výrazy podobnější.
- **Hodnocení:** Podíl správně obsazených kroužků.
- **Krátká verze do lekce:** 2 kola.
- **Pozor u seniorů:** Velké a kontrastní obličeje, aby se výrazy daly rozlišit i se slabším zrakem.

### PA-04 Oslí můstek

*Paměť · Nová minihra · priorita P2 · pracnost M · Nová (učí paměťovou techniku)*

- **Inspirace:** str. 58, č. 8 Akronymy zeleniny a ovoce
- **Trénuje:** Použití paměťové techniky: první písmena slov tvoří pomocné slovo. Cílem je naučit trik i pro běžný život.
- **Jak se hraje:**
  1. Naučení: seznam pěti slov a pomocné slovo z jejich prvních písmen. Například LAMPA = Lilek, Ananas, Meloun, Petržel, Avokádo.
  2. Krátká pauza (jiná minihra nebo jednoduchý příklad).
  3. Ukáže se jen pomocné slovo a hráč ke každému písmenu vybere správné slovo z nabídky.
- **Obsah a data:** 30–40 vlastních sad (ovoce, zelenina, zvířata, nástroje, města), každá s běžnými slovy a pomocným slovem. Data: {pomocné slovo, slova[], kategorie}.
- **Úrovně:** 1 seznam (5 slov) s nápovědou kategorie → 2 seznamy → 3 seznamy → bez nápovědy.
- **Hodnocení:** Podíl vybavených slov.
- **Krátká verze do lekce:** 1 seznam.
- **Pozor u seniorů:** Na začátku jednou větou vysvětlit, proč technika funguje.

### PA-05 Vynesené karty

*Paměť · Nová minihra · priorita P2 · pracnost M*

- **Inspirace:** str. 59, č. 14 Karetní hry
- **Trénuje:** Pracovní paměť a sledování, co už padlo. Hodí se pro mariáš, prší nebo kanastu.
- **Jak se hraje:**
  1. Karty se jedna po druhé „vynášejí“ na stůl.
  2. Potom otázky „Bylo už vyneseno srdcové eso?“ (ano / ne), nebo se ukáže celý balíček a hráč klepne na všechny vynesené karty.
- **Obsah a data:** Mariášové karty (srdce, kule, listy, žaludy; sedma až eso) ve vlastním zjednodušeném provedení: barva, symbol a hodnota napsaná slovem. Volitelně francouzské karty.
- **Úrovně:** 4 → 6 → 8 → 10 → 12 karet. Na vyšších úrovních je každá karta vidět kratší dobu.
- **Hodnocení:** Správně označené karty minus omylem označené.
- **Krátká verze do lekce:** 1 rozdání.
- **Pozor u seniorů:** Barvu karty rozlišit i symbolem a slovem (červená srdce, zelené listy), kvůli barvosleposti.

### PA-06 Mapa Česka

*Paměť · Nová minihra · priorita P3 · pracnost L*

- **Inspirace:** str. 59, č. 12 Jižní Amerika
- **Trénuje:** Paměť na místa, orientaci a všeobecný přehled.
- **Jak se hraje:**
  1. Učení: mapa s popisky.
  2. Po zakrytí kvíz: zvýrazněné území → vybrat název, nebo název → klepnout na mapě.
- **Obsah a data:** Kraje a krajská města ČR, pohoří a řeky, sousední státy, později Evropa. Mapy zjednodušit do SVG. Ověřit licenci podkladů (Natural Earth je volné dílo, hranice krajů z otevřených dat ČÚZK).
- **Úrovně:** 4 → 6 → 9 → 14 území. Ze „vyber název“ na „najdi na mapě“.
- **Hodnocení:** Podíl správných odpovědí.
- **Krátká verze do lekce:** 5 otázek.
- **Pozor u seniorů:** Malá území (Praha) zvětšit nebo jim dát větší plochu pro klepnutí.

## Postřeh

### PO-01 Kde je kulička?

*Postřeh · Nová minihra · priorita P1 · pracnost M*

- **Inspirace:** str. 71, č. 5 Diamantové rozhodnutí (tři šálky)
- **Trénuje:** Sledování pohybu a vytrvalou pozornost.
- **Jak se hraje:**
  1. Pod jedním hrnkem je kulička. Hrnky se několikrát prohodí.
  2. Hráč klepne na hrnek, pod kterým kulička je.
- **Obsah a data:** Animované hrnky v CSS, žádná data. Název záměrně ne „Skořápky“ (spojení s pouličními podvodníky).
- **Úrovně:** 3 hrnky a 3 pomalá prohození → 6 rychlejších → 4 hrnky → 5 hrnků a 8 prohození → dvě kuličky. Rychlost se ladí průběžně jako v Bleskovém pohledu.
- **Hodnocení:** Úspěšnost a dosažená rychlost míchání.
- **Krátká verze do lekce:** 5 kol.
- **Pozor u seniorů:** Pohyb plynulý a ne příliš rychlý. Při nastavení „omezit pohyb“ místo animace prohazovat po krocích s krátkou pauzou.

## Rozhodování

### RO-01 Vyšší, nebo nižší?

*Rozhodování · Nová minihra · priorita P1 · pracnost S*

- **Inspirace:** str. 68, č. 14 Hledání v kalendáři
- **Trénuje:** Plánování a strategii (půlení intervalu), práci s čísly a kalendářem.
- **Jak se hraje:**
  1. Aplikace si „myslí“ číslo nebo den, například narozeniny v květnu.
  2. Hráč tipuje klepnutím na číselnou mřížku nebo kalendář a dostane odpověď „víc“ nebo „míň“, dokud neuhodne.
- **Obsah a data:** Jen generátor. Varianty: číslo 1–100, den v měsíci, cena zboží.
- **Úrovně:** 1–20 → 1–50 → 1–100 → den v roce → omezený počet pokusů.
- **Hodnocení:** Počet pokusů proti nejlepší strategii (log₂). Po hře tip, jak půlit.
- **Krátká verze do lekce:** 2 kola.
- **Pozor u seniorů:** Zadávání klepnutím, ne psaním. Zbývající rozsah na ose viditelně zúžit.

### RO-02 Přelévání

*Rozhodování · Nová minihra · priorita P2 · pracnost M*

- **Inspirace:** str. 66, č. 2 Rozdělení tekutiny
- **Trénuje:** Plánování několika kroků dopředu a řešení problémů.
- **Jak se hraje:**
  1. 2–3 nádoby se známým objemem, jedna je plná.
  2. Klepnout na nádobu, ze které se lije, a na tu, do které. Voda teče, dokud se cílová nenaplní nebo zdrojová nevyprázdní.
  3. Cíl: odměřit zadané množství, například 4 litry.
- **Obsah a data:** Generátor úloh s řešičem (prohledávání do šířky), takže je známý nejmenší počet kroků. Vlastní objemy, ne z knihy.
- **Úrovně:** Řešení na 2 kroky → 3 → 4–5 → 6 a víc. Tlačítka Zpět a Nápověda (ukáže další krok).
- **Hodnocení:** Vyřešeno a počet kroků proti minimu.
- **Krátká verze do lekce:** 1 úloha.
- **Pozor u seniorů:** Stav nádob ukazovat i číslem (3 l z 5 l).

### RO-03 Popletené štítky

*Rozhodování · Nová minihra · priorita P2 · pracnost S*

- **Inspirace:** str. 71, č. 4 Sklenice se štítky
- **Trénuje:** Logické vyvozování z jediné informace.
- **Jak se hraje:**
  1. Tři sklenice mají všechny štítky špatně.
  2. Hráč smí ochutnat jen jednu, uvidí její obsah a pak přiřadí správné štítky.
- **Obsah a data:** Několik variant (sůl, cukr, směs; čaj, káva, směs; knoflíky, korálky, směs) s vlastními ilustracemi.
- **Úrovně:** S nápovědou → bez nápovědy → 4 sklenice.
- **Hodnocení:** Správné přiřazení na první pokus.
- **Krátká verze do lekce:** 1 úloha.
- **Pozor u seniorů:** Po hře vysvětlit, proč stačí jedna ochutnávka.

### RO-04 Tři hrnky: měnit, nebo ne?

*Rozhodování · Nová minihra · priorita P3 · pracnost S · Nová (pokus, ne adaptivní hra)*

- **Inspirace:** str. 71, č. 5 Diamantové rozhodnutí
- **Trénuje:** Úvahy o pravděpodobnosti.
- **Jak se hraje:**
  1. Deset kol: hráč vybere hrnek, jeden prázdný se otevře a hráč se rozhodne, jestli volbu změní.
  2. Na konci statistika výher „změnil / nezměnil“ a srozumitelné vysvětlení.
- **Obsah a data:** Žádná data.
- **Úrovně:** Bez úrovní.
- **Hodnocení:** Bez bodování výkonu, body za dokončení.
- **Krátká verze do lekce:** —
- **Pozor u seniorů:** Vysvětlení obrázkem, ne vzorcem.

### RO-05 Přesýpací hodiny

*Rozhodování · Nová minihra · priorita P3 · pracnost M*

- **Inspirace:** str. 69, č. 19 Dilema s přesýpacími hodinami
- **Trénuje:** Plánování a práci s časem.
- **Jak se hraje:**
  1. Dvoje přesýpací hodiny, tlačítka „otočit“ a zrychlený čas.
  2. Cíl: odměřit zadanou dobu.
- **Obsah a data:** Generátor úloh s řešičem.
- **Úrovně:** Podle počtu potřebných otočení.
- **Hodnocení:** Vyřešeno a počet kroků.
- **Krátká verze do lekce:** 1 úloha.
- **Pozor u seniorů:** Zobrazovat zbývající minuty i číslem.

## Slova

### SL-01 Osmisměrka s tajenkou

*Slova · Nová minihra · priorita P1 · pracnost M*

- **Inspirace:** str. 61, č. 4 Stopař
- **Trénuje:** Zrakové vyhledávání, slovní zásobu a soustředění. Osmisměrky senioři znají z časopisů.
- **Jak se hraje:**
  1. Mřížka písmen a vedle seznam slov k nalezení na jedno téma (nábytek, ovoce, česká města…).
  2. Slovo se označí klepnutím na první a poslední písmeno.
  3. Zbylá písmena čtená po řádcích dají tajenku, třeba krátké přísloví.
- **Obsah a data:** Generátor mřížky (8 směrů; na nízkých úrovních jen vodorovně a svisle), 40+ tematických seznamů, sbírka vlastních tajenek (lze využít přísloví z content.js). Nejvyšší úroveň: „Had z písmen“ jako v knize (cesta přes všechna políčka). Data: {téma, slova[], tajenka}.
- **Úrovně:** 6×6, 4 slova, jen → a ↓ → 8×8, 6 slov, i ← ↑ → 10×10 s úhlopříčkami → 10×10 s tajenkou → Had z písmen.
- **Hodnocení:** Nalezená slova a čas. Nápověda (zvýraznění prvního písmene) snižuje body.
- **Krátká verze do lekce:** Mřížka 6×6 nebo 8×8.
- **Pozor u seniorů:** Písmena aspoň 44 px. Na telefonu nejvýš 10×10. „Ch“ se píše jako dvě písmena, vysvětlit v pokynech.

### SL-04 Příbuzenstvo

*Slova · Nová minihra · priorita P1 · pracnost S*

- **Inspirace:** str. 64, č. 9 Rodinné vztahy
- **Trénuje:** Jazyk a logické uvažování o vztazích.
- **Jak se hraje:**
  1. Otázka typu „Syn mé sestry je můj…“ a výběr ze tří odpovědí (synovec, bratranec, vnuk).
  2. Vyšší úrovně: dvoukrokové vztahy („Matka mého zetě je…“) a malý rodokmen s otázkou „Kolik vnoučat má babička Marie?“.
- **Obsah a data:** Pravidla vztahů (rodiče, děti, sourozenci, prarodiče, vnoučata, strýc, teta, synovec, neteř, bratranec, sestřenice, tchán, tchyně, zeť, snacha, švagr, švagrová, pravnoučata) a generátor otázek z grafu rodiny. Všechny výrazy ručně zkontrolovat.
- **Úrovně:** 1 krok, běžné vztahy → tchán, zeť, švagr → 2 kroky → rodokmen.
- **Hodnocení:** Podíl správných odpovědí.
- **Krátká verze do lekce:** 5 otázek.
- **Pozor u seniorů:** Vždy jednoznačná odpověď. Neutrální k různým podobám rodin.

### SL-02 Písmenková polévka

*Slova · Nová minihra · priorita P2 · pracnost S · Nová (příbuzná Přesmyčkám)*

- **Inspirace:** str. 61, č. 5 Písmenková polévka
- **Trénuje:** Práci se slovy a plánování.
- **Jak se hraje:**
  1. Na talíři jsou rozházená písmena a zadání, např. „5 barev“.
  2. Klepáním se skládají slova. Správné slovo se zapíše a jeho písmena zmizí. Použijí se všechna písmena.
- **Obsah a data:** Vlastní sady (barvy, zvířata, květiny, města). Lze využít seznam z Přesmyček.
- **Úrovně:** 2 slova → 3 → 5 slov. Nápověda: první písmena.
- **Hodnocení:** Složená slova a použité nápovědy.
- **Krátká verze do lekce:** 2–3 slova.
- **Pozor u seniorů:** Tlačítko „Vrátit písmeno“ jako v Přesmyčkách.

### SL-03 Slovní žebřík

*Slova · Nová minihra · priorita P2 · pracnost M*

- **Inspirace:** str. 60, č. 2 Řetězovky
- **Trénuje:** Slovní pohotovost a pružnost myšlení.
- **Jak se hraje:**
  1. Ze slova (např. PES) se po krocích dostat k cílovému (LUK). V každém kroku se mění jedno písmeno.
  2. Verze pro seniory: v každém kroku vybrat ze tří nabízených slov to, které pravidlo splňuje.
- **Obsah a data:** Ručně prověřený seznam běžných tří- a čtyřpísmenných slov, generátor cest, předpočítaná řešení.
- **Úrovně:** 2 kroky s nabídkou → 3 → 4 → bez nabídky (výběr písmene).
- **Hodnocení:** Dokončené žebříky a chyby.
- **Krátká verze do lekce:** 1 žebřík.
- **Pozor u seniorů:** Jen běžná slova v základním tvaru.

### SL-05 Slovní kruh

*Slova · Nová minihra · priorita P3 · pracnost L*

- **Inspirace:** str. 61, č. 6 Slovní kruh
- **Trénuje:** Slovní zásobu a pohotovost.
- **Jak se hraje:** Písmena v kruhu. Klepáním skládat slova, cílem je najít daný počet.
- **Obsah a data:** Pro každé zadání předpočítaný seznam platných slov. Velký slovník jen s ověřenou licencí.
- **Úrovně:** Podle počtu písmen a cílového počtu slov.
- **Hodnocení:** Nalezená slova.
- **Krátká verze do lekce:** Cíl 5 slov.
- **Pozor u seniorů:** Frustrace, když hráč najde správné slovo, které v seznamu chybí. Předem říct, že platí jen základní tvary.

### SL-06 Slovní cikcak

*Slova · Nová minihra · priorita P3 · pracnost M*

- **Inspirace:** str. 60, č. 1 Cikcak
- **Trénuje:** Slovní zásobu a práci s písmeny.
- **Jak se hraje:**
  1. Řetěz slov, kde poslední dvě písmena jednoho slova začínají slovo další.
  2. Chybějící písmena se doplňují výběrem z nabídky.
- **Obsah a data:** Ručně sestavené řetězy (pracné na tvorbu).
- **Úrovně:** Podle délky řetězu a počtu chybějících písmen.
- **Hodnocení:** Doplněná písmena.
- **Krátká verze do lekce:** Řetěz ze 3 slov.
- **Pozor u seniorů:** Jen běžná slova.

### SL-07 Tajná šifra

*Slova · Nová minihra · priorita P3 · pracnost S*

- **Inspirace:** str. 60, č. 3 Posunutá písmena
- **Trénuje:** Pracovní paměť a práci s abecedou.
- **Jak se hraje:**
  1. Slovo je zašifrované posunem v abecedě. Pod ním je abecední pás a kolečko pro posun.
  2. Hráč najde posun a přečte slovo.
- **Obsah a data:** Témata (ptáci, květiny, města). Na nízkých úrovních abeceda bez diakritiky.
- **Úrovně:** Posun známý → posun hledat → s diakritikou.
- **Hodnocení:** Rozluštěná slova.
- **Krátká verze do lekce:** 2 slova.
- **Pozor u seniorů:** Abecední pás velkým písmem.

### SL-08 Posuvné sloupce

*Slova · Nová minihra · priorita P3 · pracnost L*

- **Inspirace:** str. 61, č. 7 Pět z pěti
- **Trénuje:** Slovní zásobu a kombinování.
- **Jak se hraje:** Pět sloupců s písmeny. Tlačítky se posouvají nahoru a dolů, v rámečku vznikají slova.
- **Obsah a data:** Předpočítané sady se seznamem platných slov.
- **Úrovně:** Podle počtu hledaných slov.
- **Hodnocení:** Nalezená slova.
- **Krátká verze do lekce:** Cíl 3 slova.
- **Pozor u seniorů:** Posun tlačítky, ne tažením.

## Počty a logika

### PL-01 Řetězové počty

*Počty a logika · Nová minihra · priorita P1 · pracnost S*

- **Inspirace:** str. 62, č. 4 Mozkové řetězce; str. 65, č. 15 Mozkové řetězce
- **Trénuje:** Počítání zpaměti a pracovní paměť.
- **Jak se hraje:**
  1. Výchozí číslo a pak operace jedna po druhé (+ 14, polovina, × 3…).
  2. Hráč počítá v hlavě a na konci vybere výsledek ze 4 možností, nebo ho napíše na klávesnici.
- **Obsah a data:** Generátor, který hlídá celá čísla a rozumnou velikost mezivýsledků.
- **Úrovně:** 3 operace +/− na očích → 4 operace s × → operace mizí (vidět je jen aktuální) → dělení a „polovina“ → procenta a zlomky (½, ¼, 50 %).
- **Hodnocení:** Správnost a čas.
- **Krátká verze do lekce:** 3 řetězy.
- **Pozor u seniorů:** U mizejících operací volitelné tempo (tlačítko „Další“).

### PL-02 Sudoku

*Počty a logika · Nová minihra · priorita P1 · pracnost M*

- **Inspirace:** str. 63, č. 7 Obkličovací sudoku
- **Trénuje:** Logické vyvozování a soustředění. Sudoku senioři znají a mají rádi.
- **Jak se hraje:**
  1. Klepnout na políčko a vybrat číslo z velké klávesnice.
  2. Volitelně zvýraznit stejná čísla a chyby.
- **Obsah a data:** Generátor s jedinečným řešením a odhadem obtížnosti (počet zadaných čísel, potřebné postupy).
- **Úrovně:** 4×4 s obrázky (ovoce místo čísel) → 4×4 čísla → 6×6 → 9×9 snadné → 9×9 střední → varianta s tečkami jako v knize (bonus).
- **Hodnocení:** Vyřešeno, čas, chyby a nápovědy.
- **Krátká verze do lekce:** 4×4 nebo 6×6. Do lekce se 9×9 nehodí.
- **Pozor u seniorů:** Velká políčka. 9×9 na telefonu jen na šířku, lépe na iPadu.

### PL-03 Výhodný nákup

*Počty a logika · Nová minihra · priorita P1 · pracnost S*

- **Inspirace:** str. 64, č. 11 Bleskurychlá otázka
- **Trénuje:** Úsudek s čísly v běžném životě: cena za kilo, rychlost, doba.
- **Jak se hraje:**
  1. Dvě nebo tři nabídky, např. „sýr 250 g za 39 Kč“ a „sýr 1 kg za 149 Kč“. Hráč vybere výhodnější.
  2. Varianty: kdo jede rychleji, co trvá déle.
- **Obsah a data:** Generátor s „pěknými“ čísly a vlastní katalog zboží.
- **Úrovně:** Stejné balení, jiná cena → různá gramáž → tři nabídky → akce „3 za 2“ a slevy v %.
- **Hodnocení:** Správnost a čas.
- **Krátká verze do lekce:** 5 otázek.
- **Pozor u seniorů:** Ceny i gramáže velkým písmem, s jednotkami.

### PL-04 Terč

*Počty a logika · Nová minihra · priorita P2 · pracnost S*

- **Inspirace:** str. 62, č. 1 Číselné šipky
- **Trénuje:** Sčítání zpaměti a hledání kombinací.
- **Jak se hraje:**
  1. Terč se třemi kruhy čísel.
  2. Vybrat po jednom čísle z každého kruhu tak, aby součet dal zadaný cíl.
- **Obsah a data:** Generátor se zaručeným řešením.
- **Úrovně:** Malá čísla, 2 kruhy → 3 kruhy → víc cílů → s odčítáním.
- **Hodnocení:** Splněné cíle a čas.
- **Krátká verze do lekce:** 2 cíle.
- **Pozor u seniorů:** Průběžný součet vždy vidět.

### PL-05 Balonky

*Počty a logika · Nová minihra · priorita P2 · pracnost S*

- **Inspirace:** str. 63, č. 8 Vznášející se čísla
- **Trénuje:** Sčítání a plánování.
- **Jak se hraje:** Balonky s čísly. Hráč vybere ty, které dohromady dají cílový součet. Každý balonek jen jednou.
- **Obsah a data:** Generátor podmnožin se zaručeným řešením.
- **Úrovně:** 2 balonky k cíli → 3 → víc cílů najednou.
- **Hodnocení:** Splněné cíle.
- **Krátká verze do lekce:** 2 cíle.
- **Pozor u seniorů:** Průběžný součet vždy vidět.

### PL-06 Slovní úlohy

*Počty a logika · Nová minihra · priorita P2 · pracnost M*

- **Inspirace:** str. 62, č. 3 Věk a věk; str. 63, č. 5 Nohatá otázka; str. 64, č. 12 Velká očekávání; str. 64, č. 13 Pekařské rozhodnutí; str. 65, č. 14 Problém malování
- **Trénuje:** Porozumění textu a převod na výpočet.
- **Jak se hraje:**
  1. Krátká úloha z běžného života (věk vnoučat, slepice a králíci na dvoře, nákup koláčů, dva řemeslníci).
  2. Výběr ze 4 odpovědí. Tlačítko „Nápověda“ ukáže první krok.
- **Obsah a data:** 10–15 šablon s vlastním textem a generovanými čísly. Ke každé vysvětlení řešení.
- **Úrovně:** 1 krok → 2 kroky → zlomky a procenta → dvě neznámé.
- **Hodnocení:** Správnost a použité nápovědy.
- **Krátká verze do lekce:** 2 úlohy.
- **Pozor u seniorů:** Krátké věty, žádný časový limit.

### PL-07 Stavba z kostek

*Počty a logika · Nová minihra · priorita P2 · pracnost M*

- **Inspirace:** str. 63, č. 6 Počítání krychlí
- **Trénuje:** Prostorovou představivost.
- **Jak se hraje:**
  1. Stavba z kostek nakreslená ve 3D.
  2. Kolik je v ní kostek? Žádná kostka nevisí ve vzduchu, schované kostky se počítají.
- **Obsah a data:** Generátor výškové mapy a kreslení v SVG.
- **Úrovně:** 2×2 bez schovaných kostek → 3×3 → 4×4 se schovanými → porovnat dvě stavby.
- **Hodnocení:** Správnost.
- **Krátká verze do lekce:** 3 stavby.
- **Pozor u seniorů:** Výrazné stínování stěn, aby byl tvar čitelný.

### PL-08 Číselná síť

*Počty a logika · Nová minihra · priorita P3 · pracnost M*

- **Inspirace:** str. 62, č. 2 Čísla v kroužcích
- **Trénuje:** Logiku a sčítání.
- **Jak se hraje:** Rozmístit čísla 1–9 do kroužků tak, aby součty na čarách odpovídaly zadání.
- **Obsah a data:** Generátor z náhodného rozmístění.
- **Úrovně:** Menší síť → 3×3.
- **Hodnocení:** Vyřešeno a čas.
- **Krátká verze do lekce:** —
- **Pozor u seniorů:** Náročné, spíš do volného hraní.

### PL-09 Křížové počty

*Počty a logika · Nová minihra · priorita P3 · pracnost L*

- **Inspirace:** str. 64, č. 10 Aritmetická políčka
- **Trénuje:** Logiku a počítání.
- **Jak se hraje:** Doplnit čísla 1–9 do mřížky tak, aby platily výpočty v řádcích i sloupcích.
- **Obsah a data:** Generátor s jedinečným řešením.
- **Úrovně:** Menší mřížky → 3×3.
- **Hodnocení:** Vyřešeno a čas.
- **Krátká verze do lekce:** —
- **Pozor u seniorů:** Náročné, spíš do volného hraní.

### PL-10 Dělení tvaru

*Počty a logika · Nová minihra · priorita P3 · pracnost L*

- **Inspirace:** str. 69, č. 16 Problém s pizzou
- **Trénuje:** Prostorovou představivost.
- **Jak se hraje:** Tvar ve čtverečkové síti rozdělit obarvením na zadaný počet stejných dílů.
- **Obsah a data:** Sada úloh s ověřeným řešením.
- **Úrovně:** 2 díly → 3 → 4.
- **Hodnocení:** Vyřešeno.
- **Krátká verze do lekce:** —
- **Pozor u seniorů:** Barvy dílů doplnit číslem dílu.

## Rozšíření stávajících her

### EX-01 Co se změnilo: víc změn

*Paměť · Rozšíření · priorita P2 · pracnost S · Rozšíření hry Co se změnilo*

- **Inspirace:** str. 56, č. 4 Změna tvaru
- **Trénuje:** Zrakovou paměť na detaily.
- **Jak se hraje:** Tabulka barevných tvarů. Po zakrytí se změní 2–4 políčka (tvar nebo barva) a hráč označí všechna změněná.
- **Obsah a data:** Sada tvarů (kruh, čtverec, hvězda, šestiúhelník…) v několika barvách, změna vždy i tvarem.
- **Úrovně:** Nový režim od úrovně 4 hry Co se změnilo.
- **Hodnocení:** Nalezené změny minus omyly.
- **Krátká verze do lekce:** 2 kola.
- **Pozor u seniorů:** Změna barvy jen v kombinaci se změnou tvaru (barvoslepost).

### EX-02 Co se změnilo: co přibylo

*Paměť · Rozšíření · priorita P2 · pracnost S · Rozšíření hry Co se změnilo*

- **Inspirace:** str. 58, č. 11 Předměty navíc
- **Trénuje:** Zrakovou paměť.
- **Jak se hraje:** Věci na stole. Po zakrytí jich 2–5 přibude a hráč označí ty nové.
- **Obsah a data:** Využít ikony z Co se změnilo, přidat kancelářské a kuchyňské věci.
- **Úrovně:** Nový režim střídaný s výměnou jedné věci.
- **Hodnocení:** Nalezené nové věci minus omyly.
- **Krátká verze do lekce:** 2 kola.
- **Pozor u seniorů:** —

### EX-03 Jména a tváře: portréty a vybavení později

*Paměť · Rozšíření · priorita P2 · pracnost M · Rozšíření hry Jména a tváře*

- **Inspirace:** str. 57, č. 5 Rozpomenutí se na obličej
- **Trénuje:** Paměť na jména, odložené vybavení.
- **Jak se hraje:**
  1. Kreslené portréty místo emoji (lépe rozlišitelné).
  2. Otázka na jméno se zopakuje ještě na konci lekce (odložené vybavení).
- **Obsah a data:** 15–20 kreslených portrétů v SVG (různé účesy, brýle, vousy).
- **Úrovně:** Odložené vybavení od úrovně 3.
- **Hodnocení:** Jako dosud, odložená otázka se počítá zvlášť.
- **Krátká verze do lekce:** Beze změny.
- **Pozor u seniorů:** —

### EX-04 Telefonní číslo: dlouhá čísla

*Paměť · Rozšíření · priorita P3 · pracnost S · Rozšíření hry Telefonní číslo*

- **Inspirace:** str. 56, č. 2 Číslicová výzva
- **Trénuje:** Krátkodobou paměť a techniku seskupování.
- **Jak se hraje:** 10–12 číslic s pevným časem na zapamatování (30 s) a tipem „pamatujte si je po trojicích“.
- **Obsah a data:** Žádná nová data.
- **Úrovně:** Nejvyšší úrovně hry.
- **Hodnocení:** Jako dosud.
- **Krátká verze do lekce:** Beze změny.
- **Pozor u seniorů:** —

### EX-05 Nákupní seznam: vybavení s kategoriemi

*Paměť · Rozšíření · priorita P3 · pracnost S · Rozšíření hry Nákupní seznam*

- **Inspirace:** str. 57, č. 7 Nákupní seznam
- **Trénuje:** Vybavování bez nápovědy a třídění do skupin.
- **Jak se hraje:** Po zakrytí nejdřív otázka „Kolik položek si vybavíte?“ a výběr po kategoriích (pečivo, zelenina, drogerie), teprve potom nabídka.
- **Obsah a data:** Doplnit kategorie k položkám v content.js.
- **Úrovně:** Od úrovně 5.
- **Hodnocení:** Zvlášť volné vybavení a rozpoznání.
- **Krátká verze do lekce:** Beze změny.
- **Pozor u seniorů:** —

### EX-06 Mozaika: čtyři vzory za sebou

*Paměť · Rozšíření · priorita P3 · pracnost S · Rozšíření hry Mozaika*

- **Inspirace:** str. 59, č. 13 Paměť na tabulky
- **Trénuje:** Prostorovou paměť pod časovým limitem.
- **Jak se hraje:** Čtyři vzory 5×5 za sebou, každý 5 sekund.
- **Obsah a data:** Žádná nová data.
- **Úrovně:** Nejvyšší úroveň.
- **Hodnocení:** Jako dosud.
- **Krátká verze do lekce:** Beze změny.
- **Pozor u seniorů:** —

## Hádanka dne (nová funkce)

- Na obrazovce Cesta karta „Hádanka dne“: jedna hádanka denně, bez časového limitu.
- Odpověď výběrem ze 3–4 možností. U hádanek, kde se vymýšlí postup, tlačítko „Ukázat řešení“.
- Po odpovědi vysvětlení s jednoduchým obrázkem, +10 bodů, odznak Luštitel (1, 10, 30, 100 hádanek).
- Potřeba 60–100 vlastních hádanek, aby vydržely 2–3 měsíce. Štítky: logika, čísla, prostor, chyták; obtížnost snadná / střední / náročná.
- Z knihy převzít jen typ hádanky. Znění, čísla i obrázky napsat vlastní (jiné objemy nádob, jiný věk, jiná zvířata).

| ID | Hádanka (pracovní název) | Inspirace (str./č.) | Formát odpovědi | Obtížnost |
|---|---|---|---|---|
| HD-01 | Narozeniny přes Silvestra | 66/1 Narozeninový hlavolam | výběr odpovědi | snadná |
| HD-02 | Kolik z nás lže? | 67/4 Otázka pravdy | výběr osoby | střední |
| HD-03 | Krájení dortu třemi řezy | 67/5 Krájení dortu | obrázkové možnosti | střední |
| HD-04 | Karty rubem nahoru poslepu | 67/6 Zmatení kartami | ukázat řešení | náročná |
| HD-05 | Přesně půl lahve | 67/7 Dilema s lahví | ukázat řešení | střední |
| HD-06 | Mince, které se všechny dotýkají | 67/8 Výzva s mincemi | obrázkové možnosti | náročná |
| HD-07 | Jablka v přepravkách | 68/9 Přepravkové vyhlídky | ukázat řešení | střední |
| HD-08 | Ruce v kapsách | 68/10 Obrácené kalhoty | ukázat řešení (chyták) | snadná |
| HD-09 | Hořící provázky | 68/11 Hořící lana | ukázat řešení | náročná |
| HD-10 | Fazole v lahvi | 68/12 Láhev a fazole | výběr odpovědi (chyták) | snadná |
| HD-11 | Kolik je koček? | 68/13 Počítání koček | výběr čísla | snadná |
| HD-12 | Šroub ve sklenici | 69/15 Ocel a voda | ukázat řešení (chyták) | střední |
| HD-13 | Kbelík dnem vzhůru | 69/17 Kbelík, jenž se nesmí vylít | výběr + vysvětlení | střední |
| HD-14 | Průměr a většina | 69/18 Nepravděpodobný průměr | výběr + vysvětlení | náročná |
| HD-15 | Kdo nikdy nelže? | 70/1 Pravda a lež | výběr osoby | náročná |
| HD-16 | Spravedlivý los nespravedlivou mincí | 70/2 Nerovnoměrně vyvážená mince | ukázat řešení | náročná |
| HD-17 | Dvojčata a kino | 70/3 Dvojčata | výběr odpovědi | střední |
| HD-18 | Je sázka s kostkou férová? | 71/6 Výběr kostky | ano / ne + vysvětlení | střední |
| HD-19 | S kým hrát dvakrát? | 71/7 Squash | výběr odpovědi | střední |
| HD-20 | Domeček z karet | 65/16 Domeček z karet | výběr čísla | střední |
| HD-21 | Devět teček čtyřmi čarami | 66/3 Problém s cestičkou | ukázat řešení (kreslení se nehodí) | střední |
| HD-22 | Měnit, nebo neměnit hrnek? | 71/5 Diamantové rozhodnutí | výběr + odkaz na pokus RO-04 | náročná |

## Návrh postupu

1. **První vlna:** 9 her P1 a Hádanka dne se 30 hádankami. Zastávky 8–12 (Telč, Třeboň, Brno, Litomyšl, České Švýcarsko) dnes žádné nové hry nepřinášejí, takže každá dostane 2 hry z první vlny.
2. **Druhá vlna:** 11 her P2 a rozšíření EX-01 až EX-03. Cesta pokračuje novými zastávkami (např. Šumava, Pálava, Kroměříž, Ještěd, Ostrava) s novými pohlednicemi.
3. **Třetí vlna:** P3 podle toho, co se osvědčí při zkoušení se seniory.

## Obsah, který bude potřeba vytvořit

- **Seznamy slov:** tematické seznamy pro Osmisměrku (40+), krátká slova pro Slovní žebřík, předpočítané seznamy pro Slovní kruh. U hotových slovníků vždy ověřit licenci.
- **Tajenky a hádanky:** krátká přísloví (část už je v content.js), 60–100 vlastních hádanek s vysvětlením.
- **Tematické balíčky pro Co k čemu patří:** recepty (bábovka, palačinky, knedlíky, vánočka), ceníky, jízdní řády, narozeniny.
- **Grafika:** 3–4 půdorysy bytů, 32 mariášových karet ve zjednodušeném stylu, kreslené výrazy obličejů, kreslené portréty, jednoduché ilustrace k hádankám.
- **Mapy:** zjednodušené SVG krajů ČR a okolních států, s ověřenou licencí.

## Autorská práva

Typy úloh (osmisměrka, sudoku, přelévání vody, hádanky o lhářích) jsou volné a lze je použít. Konkrétní texty, zadání, čísla, seznamy a ilustrace z knihy chrání autorské právo, proto do aplikace píšeme vlastní obsah. Totéž platí pro klasické hádanky: myšlenka je volná, znění a obrázky budou naše.

## Příloha: kam patří každé cvičení z knihy

| Strana | Kapitola | Č. | Cvičení | V plánu |
|---|---|---|---|---|
| 56 | Paměť a vybavování | 1 | Kruhy smajlíků | PA-03 |
| 56 | Paměť a vybavování | 2 | Číslicová výzva | EX-04 (hra Telefonní číslo) |
| 56 | Paměť a vybavování | 3 | Mimo náš svět | PA-02 |
| 56 | Paměť a vybavování | 4 | Změna tvaru | EX-01 |
| 57 | Paměť a vybavování | 5 | Rozpomenutí se na obličej | hotovo: Jména a tváře; EX-03 |
| 57 | Paměť a vybavování | 6 | Umístění předmětu | PA-01 |
| 57 | Paměť a vybavování | 7 | Nákupní seznam | hotovo: Nákupní seznam; EX-05 |
| 58 | Paměť a vybavování | 8 | Akronymy zeleniny a ovoce | PA-04 |
| 58 | Paměť a vybavování | 9 | Problémy s hesly | PA-02 (balíček Kódy) |
| 58 | Paměť a vybavování | 10 | Množství ingrediencí v receptu | PA-02 (balíček Recept) |
| 58 | Paměť a vybavování | 11 | Předměty navíc | EX-02 |
| 59 | Paměť a vybavování | 12 | Jižní Amerika | PA-06 |
| 59 | Paměť a vybavování | 13 | Paměť na tabulky | hotovo: Mozaika; EX-06 |
| 59 | Paměť a vybavování | 14 | Karetní hry | PA-05 |
| 60 | Řečové dovednosti | 1 | Cikcak | SL-06 |
| 60 | Řečové dovednosti | 2 | Řetězovky | SL-03 |
| 60 | Řečové dovednosti | 3 | Posunutá písmena | SL-07 |
| 61 | Řečové dovednosti | 4 | Stopař | SL-01 |
| 61 | Řečové dovednosti | 5 | Písmenková polévka | SL-02 |
| 61 | Řečové dovednosti | 6 | Slovní kruh | SL-05 |
| 61 | Řečové dovednosti | 7 | Pět z pěti | SL-08 |
| 62 | Numerické schopnosti | 1 | Číselné šipky | PL-04 |
| 62 | Numerické schopnosti | 2 | Čísla v kroužcích | PL-08 |
| 62 | Numerické schopnosti | 3 | Věk a věk | PL-06 |
| 62 | Numerické schopnosti | 4 | Mozkové řetězce | PL-01 |
| 63 | Numerické schopnosti | 5 | Nohatá otázka | PL-06 |
| 63 | Numerické schopnosti | 6 | Počítání krychlí | PL-07 |
| 63 | Numerické schopnosti | 7 | Obkličovací sudoku | PL-02 |
| 63 | Numerické schopnosti | 8 | Vznášející se čísla | PL-05 |
| 64 | Numerické schopnosti | 9 | Rodinné vztahy | SL-04 |
| 64 | Numerické schopnosti | 10 | Aritmetická políčka | PL-09 |
| 64 | Numerické schopnosti | 11 | Bleskurychlá otázka | PL-03 |
| 64 | Numerické schopnosti | 12 | Velká očekávání | PL-06 |
| 64 | Numerické schopnosti | 13 | Pekařské rozhodnutí | PL-06 |
| 65 | Numerické schopnosti | 14 | Problém malování | PL-06 |
| 65 | Numerické schopnosti | 15 | Mozkové řetězce | PL-01 |
| 65 | Numerické schopnosti | 16 | Domeček z karet | HD-20 |
| 66 | Řešení problémů | 1 | Narozeninový hlavolam | HD-01 |
| 66 | Řešení problémů | 2 | Rozdělení tekutiny | RO-02 |
| 66 | Řešení problémů | 3 | Problém s cestičkou | HD-21 |
| 67 | Řešení problémů | 4 | Otázka pravdy | HD-02 |
| 67 | Řešení problémů | 5 | Krájení dortu | HD-03 |
| 67 | Řešení problémů | 6 | Zmatení kartami | HD-04 |
| 67 | Řešení problémů | 7 | Dilema s lahví | HD-05 |
| 67 | Řešení problémů | 8 | Výzva s mincemi | HD-06 |
| 68 | Řešení problémů | 9 | Přepravkové vyhlídky | HD-07 |
| 68 | Řešení problémů | 10 | Obrácené kalhoty | HD-08 |
| 68 | Řešení problémů | 11 | Hořící lana | HD-09 |
| 68 | Řešení problémů | 12 | Láhev a fazole | HD-10 |
| 68 | Řešení problémů | 13 | Počítání koček | HD-11 |
| 68 | Řešení problémů | 14 | Hledání v kalendáři | RO-01 |
| 69 | Řešení problémů | 15 | Ocel a voda | HD-12 |
| 69 | Řešení problémů | 16 | Problém s pizzou | PL-10 |
| 69 | Řešení problémů | 17 | Kbelík, jenž se nesmí vylít | HD-13 |
| 69 | Řešení problémů | 18 | Nepravděpodobný průměr | HD-14 |
| 69 | Řešení problémů | 19 | Dilema s přesýpacími hodinami | RO-05 |
| 70 | Rozhodování | 1 | Pravda a lež | HD-15 |
| 70 | Rozhodování | 2 | Nerovnoměrně vyvážená mince | HD-16 |
| 70 | Rozhodování | 3 | Dvojčata | HD-17 |
| 71 | Rozhodování | 4 | Sklenice se štítky | RO-03 |
| 71 | Rozhodování | 5 | Diamantové rozhodnutí | PO-01, RO-04, HD-22 |
| 71 | Rozhodování | 6 | Výběr kostky | HD-18 |
| 71 | Rozhodování | 7 | Squash | HD-19 |
