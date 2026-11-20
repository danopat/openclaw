# Generátor plánu miniher: z jednoho zdroje vytvoří Markdown (čtení) a CSV (tabulka).
import csv, io, sys, os

OUT = sys.argv[1]
DOMAINS = ['Paměť', 'Postřeh', 'Rozhodování', 'Slova', 'Počty a logika']

G = []  # minihry a rozšíření
def game(**kw):
    G.append(kw)

# ---------------------------------------------------------------- Paměť
game(id='PA-01', name='Kde co leží', domain='Paměť', type='Nová minihra', prio='P1', effort='M',
     rel='Nová', insp=['57/6 Umístění předmětu'],
     trains='Paměť na umístění věcí (epizodická a prostorová). Přímo souvisí s častou starostí „kde mám zase brýle?“.',
     how=['Půdorys bytu nebo domu s popsanými místnostmi (kuchyně, obývák, ložnice, předsíň, koupelna…). V místnostech leží běžné věci: brýle, klíče, peněženka, léky, deštník.',
          'Hráč si plánek prohlíží, dokud neklepne na „Mám zapamatováno“ (na vyšších úrovních s odpočtem).',
          'Plánek se vyprázdní a přijdou 3 až 5 otázek: „Kde ležely klíče?“ (klepnout na místnost), „Co bylo v kuchyni?“ (vybrat obrázky, může jich být víc), „Kolik věcí bylo v ložnici?“.'],
     content='3–4 šablony půdorysů jako jednoduché SVG (garsonka, byt 2+1, byt 3+1, dům s verandou). Sada asi 30 věcí jako ikony. Generátor rozmístění a otázek. Data: {plánek, místnosti[], věci[{id, místnost}]}.',
     levels='1) 4 věci, 3 místnosti, jen otázky „kde“. 2) 6 věcí, 4 místnosti. 3) 8 věcí, přibude „co bylo v…“. 4) 10 věcí, 5–6 místností. 5) 12 věcí, otázky na počet a polohu („nejblíž ke dveřím“). 6) Odložené vybavení: otázky až na konci lekce.',
     score='Podíl správných odpovědí. Nahoru při ≥ 85 %, dolů pod 50 %.',
     short='1 plánek, 3 otázky.',
     caution='Místnosti vždy popsané slovem, ne jen barvou. Velké plochy pro klepnutí. Na nízkých úrovních žádné otázky „vlevo/vpravo“.')

game(id='PA-02', name='Co k čemu patří', domain='Paměť', type='Nová minihra', prio='P1', effort='M',
     rel='Nová', insp=['56/3 Mimo náš svět', '58/9 Problémy s hesly', '58/10 Množství ingrediencí v receptu'],
     trains='Spojování dvou údajů (asociativní paměť): věc a cena, jméno a datum, ingredience a množství.',
     how=['Seznam dvojic, například „rohlík – 4 Kč“, „autobus 133 – 8:15“.',
          'Po zakrytí otázky: ke každé položce vybrat správnou hodnotu ze 3–4 možností.',
          'Na vyšších úrovních doplnit chybějící řádky tabulky (jako u receptu) nebo hledat v opačném směru (k ceně vybrat zboží).'],
     content='Tematické balíčky s vlastními texty, hodnoty se generují: Ceník na trhu, Jízdní řád, Narozeniny v rodině, Kódy (schránka, branka, kolo — vždy smyšlené čtyřčíslí), Babiččin recept (bábovka, palačinky, knedlíky, vánočka). Asi 10 balíčků po 10–15 dvojicích. Data: {balíček, dvojice[{položka, hodnota, jednotka}]}.',
     levels='1) 3 dvojice, výběr ze 3. 2) 4 dvojice. 3) 5 dvojic, výběr ze 4. 4) 6 dvojic. 5) 8 dvojic, doplnit tabulku. 6) 8 dvojic a opačný směr.',
     score='Podíl správně spojených dvojic.',
     short='1 seznam, 3–4 otázky.',
     caution='Čísla psát velkým písmem a s mezerami (1 250 Kč). U kódů upozornit, že jde jen o cvičení a skutečné PINy si nikde nezapisujte.')

game(id='PA-03', name='Smajlíci', domain='Paměť', type='Nová minihra', prio='P2', effort='S',
     rel='Nová', insp=['56/1 Kruhy smajlíků'],
     trains='Zrakovou paměť a spojení „co“ a „kde“.',
     how=['V kroužcích jsou obličeje s různým výrazem (úsměv, smutek, překvapení, mrknutí, vyplazený jazyk…).',
          'Po zakrytí hráč klepne na prázdný kroužek a vybere k němu výraz z nabídky. Místo kreslení z knihy je tu výběr.'],
     content='10–12 výrazů jako jednoduché kreslené obličeje v SVG. Neuvažovat emoji: kreslené výrazy se liší jen pusou a očima a dají se odstupňovat podle obtížnosti.',
     levels='3 → 4 → 5 → 6 → 8 kroužků. Na vyšších úrovních si jsou výrazy podobnější.',
     score='Podíl správně obsazených kroužků.',
     short='2 kola.',
     caution='Velké a kontrastní obličeje, aby se výrazy daly rozlišit i se slabším zrakem.')

game(id='PA-04', name='Oslí můstek', domain='Paměť', type='Nová minihra', prio='P2', effort='M',
     rel='Nová (učí paměťovou techniku, procvičení k TR-02 a TR-03)', insp=['58/8 Akronymy zeleniny a ovoce', '86/R Akronyma', '87/R Akrostika'],
     trains='Použití paměťové techniky: první písmena slov tvoří pomocné slovo. Cílem je naučit trik i pro běžný život.',
     how=['Naučení: seznam pěti slov a pomocné slovo z jejich prvních písmen. Například LAMPA = Lilek, Ananas, Meloun, Petržel, Avokádo.',
          'Krátká pauza (jiná minihra nebo jednoduchý příklad).',
          'Ukáže se jen pomocné slovo a hráč ke každému písmenu vybere správné slovo z nabídky.',
          'Varianta pomocná věta (akrostich): slova věty začínají stejnými písmeny jako to, co si máme zapamatovat. Hodí se tam, kde záleží na pořadí.'],
     content='30–40 vlastních sad (ovoce, zelenina, zvířata, nástroje, města), každá s běžnými slovy a pomocným slovem, a 10–15 vlastních pomocných vět. Data: {pomocné slovo nebo věta, slova[], kategorie}.',
     levels='1 seznam (5 slov) s nápovědou kategorie → 2 seznamy → 3 seznamy → bez nápovědy → pomocná věta a otázky na pořadí.',
     score='Podíl vybavených slov.',
     short='1 seznam.',
     caution='Na začátku jednou větou vysvětlit, proč technika funguje.')

game(id='PA-05', name='Vynesené karty', domain='Paměť', type='Nová minihra', prio='P2', effort='M',
     rel='Nová', insp=['59/14 Karetní hry'],
     trains='Pracovní paměť a sledování, co už padlo. Hodí se pro mariáš, prší nebo kanastu.',
     how=['Karty se jedna po druhé „vynášejí“ na stůl.',
          'Potom otázky „Bylo už vyneseno srdcové eso?“ (ano / ne), nebo se ukáže celý balíček a hráč klepne na všechny vynesené karty.'],
     content='Mariášové karty (srdce, kule, listy, žaludy; sedma až eso) ve vlastním zjednodušeném provedení: barva, symbol a hodnota napsaná slovem. Volitelně francouzské karty.',
     levels='4 → 6 → 8 → 10 → 12 karet. Na vyšších úrovních je každá karta vidět kratší dobu.',
     score='Správně označené karty minus omylem označené.',
     short='1 rozdání.',
     caution='Barvu karty rozlišit i symbolem a slovem (červená srdce, zelené listy), kvůli barvosleposti.')

game(id='PA-06', name='Mapa Česka', domain='Paměť', type='Nová minihra', prio='P3', effort='L',
     rel='Nová', insp=['59/12 Jižní Amerika'],
     trains='Paměť na místa, orientaci a všeobecný přehled.',
     how=['Učení: mapa s popisky.', 'Po zakrytí kvíz: zvýrazněné území → vybrat název, nebo název → klepnout na mapě.'],
     content='Kraje a krajská města ČR, pohoří a řeky, sousední státy, později Evropa. Mapy zjednodušit do SVG. Ověřit licenci podkladů (Natural Earth je volné dílo, hranice krajů z otevřených dat ČÚZK).',
     levels='4 → 6 → 9 → 14 území. Ze „vyber název“ na „najdi na mapě“.',
     score='Podíl správných odpovědí.',
     short='5 otázek.',
     caution='Malá území (Praha) zvětšit nebo jim dát větší plochu pro klepnutí.')

game(id='PA-07', name='Podnos', domain='Paměť', type='Nová minihra', prio='P2', effort='S',
     rel='Nová (příbuzná Nákupnímu seznamu a hře Co se změnilo)', insp=['84/V1 Kimova hra'],
     trains='Zrakovou paměť a pozornost. Na vyšších úrovních i spojení několika údajů o jedné věci: co to je, kolik toho je a jakou to má barvu.',
     how=['Na podnosu leží běžné věci (konvice, jablko, deštník, klíče…). Hráč si je prohlíží, dokud neklepne na „Mám zapamatováno“ (nejvýš 60 sekund).',
          'Podnos se zakryje. Z nabídky asi dvojnásobného počtu obrázků hráč vybere všechny věci, které na podnosu ležely.',
          'Na vyšších úrovních se věci opakují a mají různé barvy. Přibudou otázky „Kolik jablek bylo na podnosu?“ a „Jakou barvu měl deštník?“.'],
     content='Asi 40 ikon věcí (sdílet s Co se změnilo a Nákupním seznamem), každá ve 4 dobře rozlišitelných barvách. Data: {věci[{ikona, barva, počet}]}.',
     levels='1) 6 věcí. 2) 9 věcí. 3) 12 věcí. 4) 15 věcí. 5) Některé věci dvakrát až třikrát, otázka na počet. 6) Navíc různé barvy, otázka na barvu.',
     score='Správně vybrané věci minus omylem vybrané. Na vyšších úrovních podíl správných odpovědí na počet a barvu.',
     short='1 podnos se 6–9 věcmi.',
     caution='Barvu vždy doplnit i slovem (zelené jablko, červené jablko) a volit barvy, které se rozliší i při barvosleposti.')

game(id='PA-08', name='Součty z paměti', domain='Paměť', type='Nová minihra', prio='P2', effort='S',
     rel='Nová', insp=['85/V3 Paměť na součet'],
     trains='Pracovní paměť: udržet několik čísel v hlavě a zároveň s nimi počítat.',
     how=['Ukážou se 3–4 čísla (například 6, 9, 14). Hráč si je zapamatuje a klepne na „Mám zapamatováno“.',
          'Čísla zmizí a objeví se nová (například 15, 18, 21). Hráč klepne na všechna, která jdou složit sečtením dvou nebo více zapamatovaných čísel. Vždy je správně aspoň jedno.'],
     content='Jen generátor: zapamatovaná čísla, jejich součty dvojic a trojic a k tomu podobná čísla, která složit nejdou.',
     levels='1) 3 čísla do 10, jen součty dvojic. 2) 3 čísla do 20. 3) Čísla do 50. 4) 4 čísla, i součty trojic. 5) 4 čísla do 100.',
     score='Správně označená čísla minus omylem označená. Nápověda (zapamatovaná čísla na 2 sekundy znovu vidět) snižuje body.',
     short='2 sady.',
     caution='Bez časového limitu. Zapamatovaná čísla a nabídka se liší tvarem rámečku, ne jen barvou.')

game(id='PA-09', name='Paměťové kolíky', domain='Paměť', type='Nová minihra', prio='P2', effort='M',
     rel='Nová (učí paměťovou techniku, procvičení k TR-04)', insp=['87/1–3 Paměťové kolíky'],
     trains='Zapamatování věcí v daném pořadí pomocí pevných obrazů pro čísla 1–10 (tzv. kolíků).',
     how=['Nejdřív se hráč seznámí s kolíky: ke každému číslu jeden snadno představitelný obraz (vlastní sada aplikace, například podle tvaru číslice: 1 svíčka, 2 labuť, 8 sněhulák).',
          'Potom se ukazují věci k zapamatování (třeba nákup) a ke každé obrázek, jak „visí“ na svém kolíku (svíčka zapíchnutá v bochníku chleba).',
          'Otázky: „Co bylo třetí?“, „Kolikátý byl deštník?“, nebo seřadit věci podle pořadí.'],
     content='Vlastní sada 10 kolíků s ilustracemi (rýmy nebo tvary číslic, ne seznam z knihy), volitelně vlastní kolíky hráče. Seznamy věcí sdílet s Nákupním seznamem. Spojovací obrázek vznikne složením dvou ikon.',
     levels='1) Naučit se kolíky 1–5 (spojit číslo a obraz). 2) Kolíky 1–10. 3) 5 věcí na kolících. 4) 7 věcí. 5) 10 věcí. 6) Otázky na pořadí i pozpátku.',
     score='Podíl správných odpovědí.',
     short='5 věcí na kolících 1–5.',
     caution='Kolíky musí dávat smysl v češtině a být snadno představitelné. Možnost vyměnit kolík za vlastní výběrem z nabídky obrázků.')

# ---------------------------------------------------------------- Postřeh
game(id='PO-01', name='Kde je kulička?', domain='Postřeh', type='Nová minihra', prio='P1', effort='M',
     rel='Nová', insp=['71/5 Diamantové rozhodnutí (tři šálky)'],
     trains='Sledování pohybu a vytrvalou pozornost.',
     how=['Pod jedním hrnkem je kulička. Hrnky se několikrát prohodí.', 'Hráč klepne na hrnek, pod kterým kulička je.'],
     content='Animované hrnky v CSS, žádná data. Název záměrně ne „Skořápky“ (spojení s pouličními podvodníky).',
     levels='3 hrnky a 3 pomalá prohození → 6 rychlejších → 4 hrnky → 5 hrnků a 8 prohození → dvě kuličky. Rychlost se ladí průběžně jako v Bleskovém pohledu.',
     score='Úspěšnost a dosažená rychlost míchání.',
     short='5 kol.',
     caution='Pohyb plynulý a ne příliš rychlý. Při nastavení „omezit pohyb“ místo animace prohazovat po krocích s krátkou pauzou.')

game(id='PO-02', name='Hledání čísel', domain='Postřeh', type='Nová minihra', prio='P2', effort='S',
     rel='Nová (stejný základ jako Osmisměrka SL-01)', insp=['72/1 Hledání čísel'],
     trains='Soustředění a pečlivé prohledávání očima. Čísla na rozdíl od slov nejde „uhodnout“ podle začátku.',
     how=['Mřížka číslic a vedle seznam čísel k nalezení (například 3–6 čtyřmístných).',
          'Číslo se označí klepnutím na první a poslední číslici. Může vést vodorovně, svisle i šikmo, zepředu i pozpátku.'],
     content='Generátor ze stejného kódu jako Osmisměrka. Hledaná čísla se v mřížce nesmí objevit dvakrát. Tematická varianta: letopočty (1918, 1989).',
     levels='6×6, 3 čísla, jen → a ↓ → 8×8, 5 čísel, i ← a ↑ → 10×10 s úhlopříčkami → 12×12 jen na iPadu.',
     score='Nalezená čísla a čas.',
     short='Mřížka 6×6, 3 čísla.',
     caution='Číslice velké a s mezerami, na telefonu nejvýš 10×10. Nalezené číslo zvýraznit v mřížce a přeškrtnout v seznamu.')

game(id='PO-03', name='Chybějící dílek', domain='Postřeh', type='Nová minihra', prio='P2', effort='M',
     rel='Nová (příbuzná Otočeným tvarům)', insp=['72/2 Obvodová deska'],
     trains='Pozorné porovnávání tvarů a představu otáčení.',
     how=['Obrázek (dlažba, deska stolu, kus látky) s vykrojeným otvorem a pod ním 3–4 dílky.',
          'Hráč klepne na dílek, který do otvoru přesně zapadne. Dílky mohou být pootočené, ale ne převrácené.',
          'Po výběru se dílek do otvoru vsune, takže je vidět, proč pasuje nebo nepasuje.'],
     content='Generátor ve čtverečkové síti: otvor je náhodný tvar ze 4–7 políček, špatné dílky vzniknou malou změnou tvaru nebo zrcadlením. Na vyšších úrovních vzor (čáry, tečky), který musí přes dílek navazovat.',
     levels='1) Dílky ve stejné poloze jako otvor. 2) Pootočené o 90°. 3) Libovolně pootočené. 4) Mezi špatnými je i zrcadlový. 5) Musí navazovat i vzor.',
     score='Správnost a čas.',
     short='4 úlohy.',
     caution='Dílky velké, s výrazným obrysem. Na nižších úrovních tlačítko „Otočit“, aby si hráč mohl otočení vyzkoušet.')

# ---------------------------------------------------------------- Rozhodování
game(id='RO-01', name='Vyšší, nebo nižší?', domain='Rozhodování', type='Nová minihra', prio='P1', effort='S',
     rel='Nová', insp=['68/14 Hledání v kalendáři'],
     trains='Plánování a strategii (půlení intervalu), práci s čísly a kalendářem.',
     how=['Aplikace si „myslí“ číslo nebo den, například narozeniny v květnu.',
          'Hráč tipuje klepnutím na číselnou mřížku nebo kalendář a dostane odpověď „víc“ nebo „míň“, dokud neuhodne.'],
     content='Jen generátor. Varianty: číslo 1–100, den v měsíci, cena zboží.',
     levels='1–20 → 1–50 → 1–100 → den v roce → omezený počet pokusů.',
     score='Počet pokusů proti nejlepší strategii (log₂). Po hře tip, jak půlit.',
     short='2 kola.',
     caution='Zadávání klepnutím, ne psaním. Zbývající rozsah na ose viditelně zúžit.')

game(id='RO-02', name='Přelévání', domain='Rozhodování', type='Nová minihra', prio='P2', effort='M',
     rel='Nová', insp=['66/2 Rozdělení tekutiny'],
     trains='Plánování několika kroků dopředu a řešení problémů.',
     how=['2–3 nádoby se známým objemem, jedna je plná.',
          'Klepnout na nádobu, ze které se lije, a na tu, do které. Voda teče, dokud se cílová nenaplní nebo zdrojová nevyprázdní.',
          'Cíl: odměřit zadané množství, například 4 litry.'],
     content='Generátor úloh s řešičem (prohledávání do šířky), takže je známý nejmenší počet kroků. Vlastní objemy, ne z knihy.',
     levels='Řešení na 2 kroky → 3 → 4–5 → 6 a víc. Tlačítka Zpět a Nápověda (ukáže další krok).',
     score='Vyřešeno a počet kroků proti minimu.',
     short='1 úloha.',
     caution='Stav nádob ukazovat i číslem (3 l z 5 l).')

game(id='RO-03', name='Popletené štítky', domain='Rozhodování', type='Nová minihra', prio='P2', effort='S',
     rel='Nová', insp=['71/4 Sklenice se štítky'],
     trains='Logické vyvozování z jediné informace.',
     how=['Tři sklenice mají všechny štítky špatně.', 'Hráč smí ochutnat jen jednu, uvidí její obsah a pak přiřadí správné štítky.'],
     content='Několik variant (sůl, cukr, směs; čaj, káva, směs; knoflíky, korálky, směs) s vlastními ilustracemi.',
     levels='S nápovědou → bez nápovědy → 4 sklenice.',
     score='Správné přiřazení na první pokus.',
     short='1 úloha.',
     caution='Po hře vysvětlit, proč stačí jedna ochutnávka.')

game(id='RO-04', name='Tři hrnky: měnit, nebo ne?', domain='Rozhodování', type='Nová minihra', prio='P3', effort='S',
     rel='Nová (pokus, ne adaptivní hra)', insp=['71/5 Diamantové rozhodnutí'],
     trains='Úvahy o pravděpodobnosti.',
     how=['Deset kol: hráč vybere hrnek, jeden prázdný se otevře a hráč se rozhodne, jestli volbu změní.', 'Na konci statistika výher „změnil / nezměnil“ a srozumitelné vysvětlení.'],
     content='Žádná data.', levels='Bez úrovní.', score='Bez bodování výkonu, body za dokončení. Úspěšnost v přehledu pokroku = jak často hráč zvolil výhodnější výměnu.', short='5 kol.',
     caution='Vysvětlení obrázkem, ne vzorcem.')

game(id='RO-05', name='Přesýpací hodiny', domain='Rozhodování', type='Nová minihra', prio='P3', effort='M',
     rel='Nová', insp=['69/19 Dilema s přesýpacími hodinami'],
     trains='Plánování a práci s časem.',
     how=['Dvoje přesýpací hodiny, tlačítka „otočit“ a zrychlený čas.', 'Cíl: odměřit zadanou dobu.'],
     content='Generátor úloh s řešičem (nejméně otočení, plán i pro nápovědu). Otáčet se smí, když některé hodiny doběhnou.', levels='1) 1 otočení. 2) 2 otočení. 3) 3 otočení. 4) 3 až 5 otočení.', score='Vyřešeno; nový začátek a nápověda snižují hodnocení.', short='1 úloha.',
     caution='Zobrazovat zbývající minuty i číslem.')

# ---------------------------------------------------------------- Slova
game(id='SL-01', name='Osmisměrka s tajenkou', domain='Slova', type='Nová minihra', prio='P1', effort='M',
     rel='Nová', insp=['61/4 Stopař', '95/V2 Stopař'],
     trains='Zrakové vyhledávání, slovní zásobu a soustředění. Osmisměrky senioři znají z časopisů.',
     how=['Mřížka písmen a vedle seznam slov k nalezení na jedno téma (nábytek, ovoce, česká města…).',
          'Slovo se označí klepnutím na první a poslední písmeno.',
          'Zbylá písmena čtená po řádcích dají tajenku, třeba krátké přísloví.'],
     content='Generátor mřížky (8 směrů; na nízkých úrovních jen vodorovně a svisle), 40+ tematických seznamů, sbírka vlastních tajenek (lze využít přísloví z content.js). Nejvyšší úroveň: „Had z písmen“ jako v knize (cesta přes všechna políčka). Data: {téma, slova[], tajenka}.',
     levels='6×6, 4 slova, jen → a ↓ → 8×8, 6 slov, i ← ↑ → 10×10 s úhlopříčkami → 10×10 s tajenkou → Had z písmen.',
     score='Nalezená slova a čas. Nápověda (zvýraznění prvního písmene) snižuje body.',
     short='Mřížka 6×6 nebo 8×8.',
     caution='Písmena aspoň 44 px. Na telefonu nejvýš 10×10. „Ch“ se píše jako dvě písmena, vysvětlit v pokynech.')

game(id='SL-02', name='Písmenková polévka', domain='Slova', type='Nová minihra', prio='P2', effort='S',
     rel='Nová (příbuzná Přesmyčkám)', insp=['61/5 Písmenková polévka', '94/V1 Písmenková polévka'],
     trains='Práci se slovy a plánování.',
     how=['Na talíři jsou rozházená písmena a zadání, např. „5 barev“.',
          'Klepáním se skládají slova. Správné slovo se zapíše a jeho písmena zmizí. Použijí se všechna písmena.'],
     content='Vlastní sady (barvy, zvířata, květiny, sporty, města). Lze využít seznam z Přesmyček.',
     levels='2 slova → 3 → 5 → 6 slov. Nápověda: první písmena.',
     score='Složená slova a použité nápovědy.',
     short='2–3 slova.',
     caution='Tlačítko „Vrátit písmeno“ jako v Přesmyčkách.')

game(id='SL-03', name='Slovní žebřík', domain='Slova', type='Nová minihra', prio='P2', effort='M',
     rel='Nová', insp=['60/2 Řetězovky'],
     trains='Slovní pohotovost a pružnost myšlení.',
     how=['Ze slova (např. PES) se po krocích dostat k cílovému (LUK). V každém kroku se mění jedno písmeno.',
          'Verze pro seniory: v každém kroku vybrat ze tří nabízených slov to, které pravidlo splňuje.'],
     content='Ručně prověřený seznam běžných tří- a čtyřpísmenných slov, generátor cest, předpočítaná řešení.',
     levels='2 kroky s nabídkou → 3 → 4 → bez nabídky (výběr písmene).',
     score='Dokončené žebříky a chyby.',
     short='1 žebřík.',
     caution='Jen běžná slova v základním tvaru.')

game(id='SL-04', name='Příbuzenstvo', domain='Slova', type='Nová minihra', prio='P1', effort='S',
     rel='Nová', insp=['64/9 Rodinné vztahy'],
     trains='Jazyk a logické uvažování o vztazích.',
     how=['Otázka typu „Syn mé sestry je můj…“ a výběr ze tří odpovědí (synovec, bratranec, vnuk).',
          'Vyšší úrovně: dvoukrokové vztahy („Matka mého zetě je…“) a malý rodokmen s otázkou „Kolik vnoučat má babička Marie?“.'],
     content='Pravidla vztahů (rodiče, děti, sourozenci, prarodiče, vnoučata, strýc, teta, synovec, neteř, bratranec, sestřenice, tchán, tchyně, zeť, snacha, švagr, švagrová, pravnoučata) a generátor otázek z grafu rodiny. Všechny výrazy ručně zkontrolovat.',
     levels='1 krok, běžné vztahy → tchán, zeť, švagr → 2 kroky → rodokmen.',
     score='Podíl správných odpovědí.',
     short='5 otázek.',
     caution='Vždy jednoznačná odpověď. Neutrální k různým podobám rodin.')

game(id='SL-05', name='Slovní kruh', domain='Slova', type='Nová minihra', prio='P3', effort='L',
     rel='Nová', insp=['61/6 Slovní kruh'],
     trains='Slovní zásobu a pohotovost.',
     how=['Písmena v kruhu. Klepáním skládat slova, cílem je najít daný počet.'],
     content='Pro každé zadání předpočítaný seznam platných slov. Velký slovník jen s ověřenou licencí.',
     levels='Podle počtu písmen a cílového počtu slov.', score='Nalezená slova.', short='Cíl 5 slov.',
     caution='Frustrace, když hráč najde správné slovo, které v seznamu chybí. Předem říct, že platí jen základní tvary.')

game(id='SL-06', name='Slovní cikcak', domain='Slova', type='Nová minihra', prio='P3', effort='M',
     rel='Nová', insp=['60/1 Cikcak'],
     trains='Slovní zásobu a práci s písmeny.',
     how=['Řetěz slov, kde poslední dvě písmena jednoho slova začínají slovo další.', 'Chybějící písmena se doplňují výběrem z nabídky.'],
     content='Seznam asi 300 běžných podstatných jmen; řetězy se z nich skládají až ve hře (ze seznamu jde sestavit tisíce řetězů). Každé slovo v řetězu má aspoň dvě písmena vidět.', levels='1) 3 slova, 2 písmena chybí. 2) 4 slova, 3 písmena. 3) 4 slova, 5 písmen. 4) 5 slov, 6 písmen.',
     score='Doplněná písmena.', short='Řetěz ze 3 slov.', caution='Jen běžná slova.')

game(id='SL-07', name='Tajná šifra', domain='Slova', type='Nová minihra', prio='P3', effort='S',
     rel='Nová', insp=['60/3 Posunutá písmena'],
     trains='Pracovní paměť a práci s abecedou.',
     how=['Slovo je zašifrované posunem v abecedě. Pod ním je abecední pás a kolečko pro posun.', 'Hráč najde posun a přečte slovo.'],
     content='Témata (ptáci, květiny, města). Na nízkých úrovních abeceda bez diakritiky.',
     levels='1) Posun známý, pod šifrou tabulka, co které písmeno znamená. 2) Posun známý, jen abecední pás (odpočítat zpátky). 3) Posun se hledá kolečkem s náhledem. 4) Totéž s českou abecedou s háčky a čárkami.', score='Rozluštěná slova.', short='2 slova.',
     caution='Abecední pás velkým písmem.')

game(id='SL-08', name='Posuvné sloupce', domain='Slova', type='Nová minihra', prio='P3', effort='L',
     rel='Nová', insp=['61/7 Pět z pěti'],
     trains='Slovní zásobu a kombinování.',
     how=['Pět sloupců s písmeny. Tlačítky se posouvají nahoru a dolů, v rámečku vznikají slova.'],
     content='Předpočítané sady se seznamem platných slov.', levels='Podle počtu hledaných slov.', score='Nalezená slova.',
     short='Cíl 3 slova.', caution='Posun tlačítky, ne tažením.')

game(id='SL-09', name='Křížovka s tajenkou', domain='Slova', type='Nová minihra', prio='P3', effort='L',
     rel='Nová', insp=['95/R Křížovka'],
     trains='Vybavování slov podle významu, slovní zásobu a pohotovost. Křížovky patří k nejoblíbenějším hádankám starší generace.',
     how=['Malá křížovka s tajenkou. Klepnutím na otázku (legendu) se zvýrazní políčka slova.',
          'Slovo se skládá klepáním na velká písmena z nabídky jako v Přesmyčkách. Na nižších úrovních se vybírá celé slovo ze 3 možností.',
          'Vyluštěná tajenka (přísloví nebo zajímavost) se na konci ukáže velkým písmem.'],
     content='Ručně psané otázky k běžným slovům a generátor rozložení mřížky, nebo hotové křížovky od autora na zakázku. Tajenky sdílet s Osmisměrkou.',
     levels='1) 5 slov s nabídkou. 2) 8 slov s nabídkou. 3) Skládání z písmen s nápovědou délky. 4) Celá malá křížovka.',
     score='Vyluštěná slova a použité nápovědy.',
     short='1 mini křížovka (5 slov).',
     caution='Na telefonu jen malé křížovky, větší na iPadu. Česká písmena s diakritikou přímo v nabídce, ne přes dlouhý stisk.')

# ---------------------------------------------------------------- Počty a logika
game(id='PL-01', name='Řetězové počty', domain='Počty a logika', type='Nová minihra', prio='P1', effort='S',
     rel='Nová', insp=['62/4 Mozkové řetězce', '65/15 Mozkové řetězce'],
     trains='Počítání zpaměti a pracovní paměť.',
     how=['Výchozí číslo a pak operace jedna po druhé (+ 14, polovina, × 3…).',
          'Hráč počítá v hlavě a na konci vybere výsledek ze 4 možností, nebo ho napíše na klávesnici.'],
     content='Generátor, který hlídá celá čísla a rozumnou velikost mezivýsledků.',
     levels='3 operace +/− na očích → 4 operace s × → operace mizí (vidět je jen aktuální) → dělení a „polovina“ → procenta a zlomky (½, ¼, 50 %).',
     score='Správnost a čas.',
     short='3 řetězy.',
     caution='U mizejících operací volitelné tempo (tlačítko „Další“).')

game(id='PL-02', name='Sudoku', domain='Počty a logika', type='Nová minihra', prio='P1', effort='M',
     rel='Nová', insp=['63/7 Obkličovací sudoku', '98/V1 Sudoku', '99/V2 Outside sudoku', '99/R Sudoku bez čísel'],
     trains='Logické vyvozování a soustředění. Sudoku senioři znají a mají rádi.',
     how=['Před první hrou vyplněná ukázková mřížka, na které se postupně zvýrazní řádek, sloupec a čtverec s pravidlem „každé číslo jen jednou“.',
          'Klepnout na políčko a vybrat číslo z velké klávesnice.', 'Volitelně zvýraznit stejná čísla a chyby.'],
     content='Generátor s jedinečným řešením a odhadem obtížnosti (počet zadaných čísel, potřebné postupy). Pro varianty stačí v generátoru upravit kontrolu pravidel a jednoznačnosti.',
     levels='4×4 s obrázky (ovoce místo čísel) → 4×4 čísla → 6×6 → 9×9 snadné → 9×9 střední → bonusové varianty: s tečkami, s čísly kolem mřížky (outside sudoku), 9×9 s obrázky (těžší, devět obrázků se pamatuje hůř než devět čísel).',
     score='Vyřešeno, čas, chyby a nápovědy.',
     short='4×4 nebo 6×6. Do lekce se 9×9 nehodí.',
     caution='Velká políčka. 9×9 na telefonu jen na šířku, lépe na iPadu.')

game(id='PL-03', name='Výhodný nákup', domain='Počty a logika', type='Nová minihra', prio='P1', effort='S',
     rel='Nová', insp=['64/11 Bleskurychlá otázka'],
     trains='Úsudek s čísly v běžném životě: cena za kilo, rychlost, doba.',
     how=['Dvě nebo tři nabídky, např. „sýr 250 g za 39 Kč“ a „sýr 1 kg za 149 Kč“. Hráč vybere výhodnější.',
          'Varianty: kdo jede rychleji, co trvá déle.'],
     content='Generátor s „pěknými“ čísly a vlastní katalog zboží.',
     levels='Stejné balení, jiná cena → různá gramáž → tři nabídky → akce „3 za 2“ a slevy v %.',
     score='Správnost a čas.',
     short='5 otázek.',
     caution='Ceny i gramáže velkým písmem, s jednotkami.')

game(id='PL-04', name='Terč', domain='Počty a logika', type='Nová minihra', prio='P2', effort='S',
     rel='Nová', insp=['62/1 Číselné šipky'],
     trains='Sčítání zpaměti a hledání kombinací.',
     how=['Terč se třemi kruhy čísel.', 'Vybrat po jednom čísle z každého kruhu tak, aby součet dal zadaný cíl.'],
     content='Generátor se zaručeným řešením.', levels='Malá čísla, 2 kruhy → 3 kruhy → víc cílů → s odčítáním.',
     score='Splněné cíle a čas.', short='2 cíle.', caution='Průběžný součet vždy vidět.')

game(id='PL-05', name='Balonky', domain='Počty a logika', type='Nová minihra', prio='P2', effort='S',
     rel='Nová', insp=['63/8 Vznášející se čísla'],
     trains='Sčítání a plánování.',
     how=['Balonky s čísly. Hráč vybere ty, které dohromady dají cílový součet. Každý balonek jen jednou.'],
     content='Generátor podmnožin se zaručeným řešením.', levels='2 balonky k cíli → 3 → víc cílů najednou.',
     score='Splněné cíle.', short='2 cíle.', caution='Průběžný součet vždy vidět.')

game(id='PL-06', name='Slovní úlohy', domain='Počty a logika', type='Nová minihra', prio='P2', effort='M',
     rel='Nová', insp=['62/3 Věk a věk', '63/5 Nohatá otázka', '64/12 Velká očekávání', '64/13 Pekařské rozhodnutí', '65/14 Problém malování'],
     trains='Porozumění textu a převod na výpočet.',
     how=['Krátká úloha z běžného života (věk vnoučat, slepice a králíci na dvoře, nákup koláčů, dva řemeslníci).',
          'Výběr ze 4 odpovědí. Tlačítko „Nápověda“ ukáže první krok.'],
     content='10–15 šablon s vlastním textem a generovanými čísly. Ke každé vysvětlení řešení.',
     levels='1 krok → 2 kroky → zlomky a procenta → dvě neznámé.',
     score='Správnost a použité nápovědy.',
     short='2 úlohy.',
     caution='Krátké věty, žádný časový limit.')

game(id='PL-07', name='Stavba z kostek', domain='Počty a logika', type='Nová minihra', prio='P2', effort='M',
     rel='Nová', insp=['63/6 Počítání krychlí'],
     trains='Prostorovou představivost.',
     how=['Stavba z kostek nakreslená ve 3D.', 'Kolik je v ní kostek? Žádná kostka nevisí ve vzduchu, schované kostky se počítají.'],
     content='Generátor výškové mapy a kreslení v SVG. Stejné kreslení kostek použijí PL-11 Pohled z boku a PL-12 Otočené stavby, proto ho napsat jednou a znovu použít.',
     levels='2×2 bez schovaných kostek → 3×3 → 4×4 se schovanými → porovnat dvě stavby.',
     score='Správnost.', short='3 stavby.', caution='Výrazné stínování stěn, aby byl tvar čitelný.')

game(id='PL-08', name='Číselná síť', domain='Počty a logika', type='Nová minihra', prio='P3', effort='M',
     rel='Nová', insp=['62/2 Čísla v kroužcích'],
     trains='Logiku a sčítání.',
     how=['Rozmístit čísla 1–9 do kroužků tak, aby součty na čarách odpovídaly zadání.'],
     content='Generátor z náhodného rozmístění; řešič ověří jediné řešení a ubírá předem doplněná čísla.', levels='1) Trojúhelník se 6 kroužky (2 čísla doplněná). 2) Trojúhelník s 9 kroužky. 3) Mřížka 3×3 se součty řádků a sloupců. 4) Mřížka 3×3 i s úhlopříčkami.', score='Vyřešeno; chybné pokusy a nápovědy snižují hodnocení.', short='1 síť.',
     caution='Náročné, spíš do volného hraní.')

game(id='PL-09', name='Křížové počty', domain='Počty a logika', type='Nová minihra', prio='P3', effort='L',
     rel='Nová', insp=['64/10 Aritmetická políčka'],
     trains='Logiku a počítání.',
     how=['Doplnit čísla 1–9 do mřížky tak, aby platily výpočty v řádcích i sloupcích.'],
     content='Generátor s jedinečným řešením (řešič ubírá předem doplněná čísla). Počítá se zleva doprava a shora dolů.', levels='1) 2×2 se sčítáním a odčítáním. 2) 3×3, 3 čísla doplněná. 3) 3×3, 2 čísla. 4) 3×3 i s násobením.', score='Vyřešeno; chybné pokusy a nápovědy snižují hodnocení.', short='1 mřížka.',
     caution='Náročné, spíš do volného hraní.')

game(id='PL-10', name='Dělení tvaru', domain='Počty a logika', type='Nová minihra', prio='P3', effort='L',
     rel='Nová', insp=['69/16 Problém s pizzou', '100/V1 Řez skládačkou'],
     trains='Prostorovou představivost a ochotu zkoušet různá řešení.',
     how=['Tvar ve čtverečkové síti rozdělit na zadaný počet stejných dílů. Díly smí být pootočené, ale ne zrcadlené.',
          'Hráč klepáním obarvuje políčka barvou a číslem dílu. Tlačítka Zpět a Začít znovu, protože se počítá se zkoušením.'],
     content='Generátor: tvar se složí z pootočených kopií náhodného dílku (bez děr uvnitř). Kontrola uzná každé správné rozdělení, takže jediné řešení není potřeba.',
     levels='1) 2 díly po 3–4 políčkách. 2) 3 díly. 3) 4 díly. 4) 3 větší díly po 5–6 políčkách.', score='Vyřešeno; nepovedené pokusy a nápověda snižují hodnocení.', short='1 tvar.',
     caution='Barvy dílů doplnit číslem dílu. Bez časového limitu.')

game(id='PL-11', name='Pohled z boku', domain='Počty a logika', type='Nová minihra', prio='P3', effort='M',
     rel='Nová (sdílí kreslení kostek s PL-07)', insp=['77/5 Pohled na krychle'],
     trains='Prostorovou představivost: představit si těleso z jiné strany.',
     how=['Stavba z kostek ve 3D a oko s velkou šipkou, odkud se na ni díváme.',
          'Hráč vybere ze 3–4 obrysů ten, který oko uvidí. Místo kreslení do mřížky jako v knize je tu výběr.',
          'Po odpovědi tlačítko „Co oko vidí?“ ukáže pohled z místa oka (bližší kostky jsou světlejší), takže si odpověď jde ověřit.'],
     content='Generátor výškové mapy (stejný jako PL-07). Obrys se spočítá z mapy, špatné možnosti vzniknou zrcadlením nebo pohledem z jiné strany.',
     levels='1) 2×2, pohled zepředu. 2) 3×3. 3) Pohled zepředu nebo zprava. 4) 4×4. 5) Tři očka (zepředu, zprava, shora) a otázka, které z nich vidí ukázaný pohled.',
     score='Správnost.',
     short='3 stavby.',
     caution='Výrazné stínování stěn, velké oko se šipkou a vrchní kostka každého sloupce vždy dobře vidět. Po odpovědi jde ukázat, co oko opravdu vidí.')

game(id='PL-12', name='Otočené stavby', domain='Počty a logika', type='Nová minihra', prio='P3', effort='L',
     rel='Nová (Otočené tvary ve 3D)', insp=['77/6 Rotující krychle'],
     trains='Otáčení těles v představě (prostorová rotace).',
     how=['Čtyři stavby z kostek, každá viděná z jiného úhlu. Tři jsou stejné, jedna je jiná (zrcadlová, nebo má kostku jinde).',
          'Hráč klepne na tu jinou. Po odpovědi se stavby krok za krokem otočí do stejné polohy; zrcadlová skončí jako zrcadlový obraz ostatních.'],
     content='Kreslení libovolně otočené stavby (sdílet s PL-07 a PL-11). Generátor tvarů z 5–9 kostek s kontrolou, že se jiná stavba nedá otočením převést na ostatní.',
     levels='1) Otáčení jen kolem svislé osy, jiná stavba má o kostku víc nebo míň. 2) Jiná má jednu kostku jinde. 3) Jiná je zrcadlová. 4) Lomený tvar z kostek otáčený kolem dvou os, jiný je zrcadlový.',
     score='Správnost a čas.',
     short='3 úlohy.',
     caution='Pro mnoho lidí těžké v každém věku. Začínat snadno a po každé úloze ukázat animaci otočení.')

game(id='PL-13', name='Cesta podle šipek', domain='Počty a logika', type='Nová minihra', prio='P2', effort='M',
     rel='Nová', insp=['77/7 Mistr trasy'],
     trains='Prostorovou orientaci (vlevo a vpravo z pohledu chodce) a sledování řady pokynů.',
     how=['Plánek městečka ve čtvercové síti: chodec se šipkou, kam se dívá, několik cílů (pošta, lékárna, nádraží) a překážky (rybník, staveniště).',
          'Pod plánkem řada pokynů: ↑ o políčko dopředu, ↱ otočit se doprava, ↰ otočit se doleva.',
          'Hráč klepne na místo, kam pokyny vedou. Na vyšších úrovních vybírá ze 2–3 řad pokynů tu, která vede do zadaného cíle, nebo pokyny sám skládá tlačítky.'],
     content='Generátor plánků a cest, sada ikon budov. Vlastní plánky, ne z knihy.',
     levels='1) 4–6 pokynů, chodec se dívá nahoru. 2) 8 pokynů. 3) Chodec začíná otočený jinam. 4) Výběr ze 3 řad pokynů. 5) Pokyny poskládat (nejkratší cesta). 6) Pokyny jsou vidět jen chvíli (paměť).',
     score='Správnost. U skládání počet pokynů proti nejkratší cestě.',
     short='3 úlohy.',
     caution='Otočení vždy i slovem („doprava“). Po odpovědi přehrát cestu krok za krokem.')

game(id='PL-14', name='Sčítací pyramida', domain='Počty a logika', type='Nová minihra', prio='P2', effort='S',
     rel='Nová', insp=['92/V1 Číselné pyramidy'],
     trains='Sčítání a odčítání zpaměti a logické doplňování.',
     how=['Pyramida z cihel. Číslo v každé cihle je součtem dvou cihel pod ní. Některá čísla chybí.',
          'Hráč klepne na prázdnou cihlu a zadá číslo na klávesnici aplikace. Doplňuje se zdola sčítáním i shora odčítáním.'],
     content='Jen generátor: náhodný spodní řádek, dopočítání pyramidy a odebrání čísel tak, aby řešení bylo jednoznačné a dalo se dopočítat krok za krokem.',
     levels='1) 3 patra, čísla do 20. 2) 4 patra. 3) Chybí i spodní cihly (odčítání). 4) 5 pater, čísla do 100. 5) 6 pater, větší čísla.',
     score='Vyřešeno, chyby a čas.',
     short='1 pyramida o 3–4 patrech.',
     caution='Špatné číslo jen označit a nechat opravit. Nápověda zvýrazní cihlu, kterou jde dopočítat teď.')

game(id='PL-15', name='Součtové čtverce', domain='Počty a logika', type='Nová minihra', prio='P3', effort='L',
     rel='Nová (příbuzná Sudoku a Křížovým počtům)', insp=['93/V2 Diagonální číslice', '93/R Kakuro'],
     trains='Logické vyvozování a sčítání.',
     how=['Mřížka 4×4 až 6×6. V každém řádku a sloupci je každé číslo 1 až N právě jednou, jako v sudoku.',
          'Nad mřížkou jsou součty obou úhlopříček (políčka úhlopříček mají barevný nádech). Hráč doplňuje čísla z velké klávesnice, stejné číslo dvakrát v řádku nebo sloupci se hned zbarví.'],
     content='Generátor latinských čtverců se součty úhlopříček a kontrolou jednoznačného řešení. Kakuro a 6×6 zatím ne (na telefonu by byla políčka malá).',
     levels='1) 4×4 se 7 čísly. 2) 4×4 s 5 čísly. 3) 5×5 s 10 čísly. 4) 5×5 s 8 čísly.',
     score='Vyřešeno, čas, chyby a nápovědy.',
     short='1 čtverec 4×4.',
     caution='Náročné. Velká políčka, poznámky (malá čísla v rohu políčka) až na vyšších úrovních.')

game(id='PL-16', name='Skládání krychle', domain='Počty a logika', type='Nová minihra', prio='P3', effort='M',
     rel='Nová', insp=['96/V1 Správná krychle'],
     trains='Prostorovou představivost: v duchu složit krychli z rozložené sítě.',
     how=['Rozložená krychle (síť) se značkami na stěnách.',
          'Hráč vybere ze 3–4 krychlí tu, která jde ze sítě složit. Po odpovědi se síť na obrazovce složí (CSS 3D) a otočí do polohy správné krychle.'],
     content='Sítě krychle (je jich 11) a sada značek odlišných tvarem (tečky jako na hrací kostce, šipka, kruh, kříž). Generátor možností: správná krychle a špatné s prohozenými nebo pootočenými stěnami.',
     levels='1) Síť ve tvaru kříže, značky bez směru (kruh, čtverec, kříž). 2) Všech 11 sítí. 3) Značky se směrem (šipka, trojúhelník, vlajka), záleží na otočení. 4) Tečky jako na hrací kostce (dvojka, trojka a šestka mají směr).',
     score='Správnost.',
     short='3 úlohy.',
     caution='Značky velké a odlišné tvarem, ne jen barvou. Animace složení po každé odpovědi.')

game(id='PL-17', name='Najdi pravidlo', domain='Počty a logika', type='Nová minihra', prio='P2', effort='M',
     rel='Nová (příbuzná hře Co bude dál)', insp=['97/V2 Vizuální transformace'],
     trains='Abstraktní uvažování: z několika příkladů odvodit pravidlo a použít ho.',
     how=['Tři příklady proměny: obrázek vlevo → obrázek vpravo (tvar se otočí, barvy se prohodí, tečka přibude…).',
          'U čtvrtého obrázku je místo výsledku prázdné políčko. Hráč vybere ze 3–5 možností výsledek podle stejného pravidla.',
          'Po odpovědi se pravidlo vypíše slovy („otočí se doprava a ztmavne“).'],
     content='Generátor z jednoduchých obrázků (mřížka 2×2 nebo 3×3 s tvary) a knihovna pravidel: otočit, zrcadlit, prohodit barvy, přidat nebo ubrat prvek, posunout. Na vyšších úrovních kombinace dvou pravidel.',
     levels='1) 1 pravidlo, 3 možnosti. 2) 1 pravidlo, 4 možnosti. 3) 2 pravidla. 4) 2 pravidla, 5 možností s podobnými chybami.',
     score='Správnost a čas.',
     short='3 úlohy.',
     caution='Pravidla rozlišitelná tvarem a polohou, ne jemnými odstíny barev. Slovní vysvětlení po každé úloze.')

game(id='PL-18', name='Hadí cesta', domain='Počty a logika', type='Nová minihra', prio='P3', effort='M',
     rel='Nová', insp=['101/V2 Had'],
     trains='Logické vyvozování a plánování cesty.',
     how=['Mřížka se zadaným začátkem a koncem hada. Čísla u řádků a sloupců říkají, kolik políček hada v nich leží.',
          'Had je jedna nepřerušená cesta sousedními políčky, nevětví se a sám sebe se nedotýká, ani šikmo.',
          'Klepnutí na políčko přepíná: prázdné → had → křížek („tady had není“).'],
     content='Generátor náhodné cesty podle pravidel a řešič, který ověří, že čísla vedou k jedinému řešení.',
     levels='1) 4×4 s vyřešenou ukázkou. 2) 5×5. 3) 6×6. 4) 7×7 (větší mřížky by na telefonu měly moc malá políčka).',
     score='Vyřešeno, čas a nápovědy.',
     short='1 mřížka 5×5.',
     caution='Na začátku vyřešená ukázka. Chyby zvýraznit až po klepnutí na Zkontrolovat. Velká políčka.')

# ---------------------------------------------------------------- Rozšíření stávajících her
game(id='EX-01', name='Co se změnilo: víc změn', domain='Paměť', type='Rozšíření', prio='P2', effort='S',
     rel='Rozšíření hry Co se změnilo', insp=['56/4 Změna tvaru'],
     trains='Zrakovou paměť na detaily.',
     how=['Tabulka barevných tvarů. Po zakrytí se změní 2–4 políčka (tvar nebo barva) a hráč označí všechna změněná.'],
     content='Sada tvarů (kruh, čtverec, hvězda, šestiúhelník…) v několika barvách, změna vždy i tvarem.',
     levels='Nový režim od úrovně 4 hry Co se změnilo.', score='Nalezené změny minus omyly.', short='2 kola.',
     caution='Změna barvy jen v kombinaci se změnou tvaru (barvoslepost).')

game(id='EX-02', name='Co se změnilo: co přibylo', domain='Paměť', type='Rozšíření', prio='P2', effort='S',
     rel='Rozšíření hry Co se změnilo', insp=['58/11 Předměty navíc'],
     trains='Zrakovou paměť.',
     how=['Věci na stole. Po zakrytí jich 2–5 přibude a hráč označí ty nové.'],
     content='Využít ikony z Co se změnilo, přidat kancelářské a kuchyňské věci.',
     levels='Nový režim střídaný s výměnou jedné věci.', score='Nalezené nové věci minus omyly.', short='2 kola.', caution='—')

game(id='EX-03', name='Jména a tváře: portréty a vybavení později', domain='Paměť', type='Rozšíření', prio='P2', effort='M',
     rel='Rozšíření hry Jména a tváře', insp=['57/5 Rozpomenutí se na obličej', '86/1–2 Zapamatování jmen'],
     trains='Paměť na jména, odložené vybavení a použití triku se spojováním jména a obrazu.',
     how=['Kreslené portréty místo emoji (lépe rozlišitelné).', 'Otázka na jméno se zopakuje ještě na konci hry (odložené vybavení): po druhém kole se hra zeptá na dva sousedy z prvního kola.',
          'Režim s trikem (navazuje na Školu paměti TR-01): sousedé mají příjmení, která něco připomínají. U nové tváře nabídka „Co vám připomíná jméno…?“ se 3 obrázky (zvíře, povolání, věc) a scéna k zapamatování. Při vybavování ukáže obrázek tlačítko Nápověda.'],
     content='15–20 kreslených portrétů v SVG (různé účesy, brýle, vousy). Pro režim s trikem jména, která něco připomínají (Kovář, Zahradníková, Liška), a ikony k nim.',
     levels='Odložené vybavení od úrovně 3. Režim s trikem jako volba v nastavení hry (přepínač na úvodní obrazovce hry).', score='Jako dosud, odložená otázka se počítá zvlášť. Odpověď s nápovědou se počítá napůl.', short='Beze změny (jedno kolo, bez odložené otázky).', caution='—')

game(id='EX-04', name='Telefonní číslo: dlouhá čísla', domain='Paměť', type='Rozšíření', prio='P3', effort='S',
     rel='Rozšíření hry Telefonní číslo', insp=['56/2 Číslicová výzva'],
     trains='Krátkodobou paměť a techniku seskupování.',
     how=['10–12 číslic s pevným časem na zapamatování (30 s) a tipem „pamatujte si je po trojicích“.'],
     content='Žádná nová data.', levels='Nové úrovně 8 a 9 (začátek na 10 a 11 číslicích, nejvýš 12). Na zapamatování 30 sekund, dá se skončit dřív.', score='Jako dosud.', short='Beze změny.', caution='—')

game(id='EX-05', name='Nákupní seznam: vybavení s kategoriemi', domain='Paměť', type='Rozšíření', prio='P3', effort='S',
     rel='Rozšíření hry Nákupní seznam', insp=['57/7 Nákupní seznam'],
     trains='Vybavování bez nápovědy a třídění do skupin.',
     how=['Po zakrytí nejdřív otázka „Kolik položek si vybavíte?“ a výběr po kategoriích (pečivo, zelenina, drogerie), teprve potom nabídka.'],
     content='Devět skupin zboží přímo u položek hry (pečivo, mléčné, ovoce, zelenina, maso, trvanlivé, sladkosti, nápoje, drogerie).', levels='Od úrovně 5: odhad počtu položek a výběr skupin zboží, teprve potom nabídka.', score='Zvlášť skupiny zboží (a odhad) a rozpoznání položek; výkon hry podle rozpoznání.', short='Beze změny (bez odhadu a skupin).', caution='—')

game(id='EX-06', name='Mozaika: víc vzorů za sebou', domain='Paměť', type='Rozšíření', prio='P3', effort='S',
     rel='Rozšíření hry Mozaika', insp=['59/13 Paměť na tabulky', '85/V2 Paměť na tabulky'],
     trains='Prostorovou paměť, na nejvyšší úrovni i pod časovým limitem.',
     how=['Dva až čtyři vzory (4×4 až 6×6) za sebou a teprve potom jejich opakování. Na nižších úrovních si hráč čas na zapamatování určí sám, na nejvyšší má každý vzor 5 sekund.'],
     content='Žádná nová data.', levels='7) dva vzory 4×4, 8) tři vzory 4×4, čas si hráč určí sám; 9) tři vzory 5×5, každý 5 sekund.', score='Jako dosud.', short='Beze změny (jedno kolo).', caution='—')

game(id='EX-07', name='Otočené tvary: najdi vetřelce', domain='Počty a logika', type='Rozšíření', prio='P2', effort='S',
     rel='Rozšíření hry Otočené tvary', insp=['72/3 Nehodící se škrtněte'],
     trains='Prostorovou představivost (otáčení v představě).',
     how=['Čtyři tvary: tři jsou jen pootočené kopie, jeden je zrcadlový. Hráč klepne na ten, který mezi ostatní nepatří.'],
     content='Využít tvary z Otočených tvarů.', levels='Nový režim střídaný s dosavadní otázkou „otočený, nebo obrácený?“, od úrovně 3.',
     score='Jako dosud.', short='Beze změny.', caution='—')

# ---------------------------------------------------------------- Škola paměti (triky)
TR = [
    ('TR-01', 'Jména a obrazy', ['86/1–2 Zapamatování jmen'],
     'Spojit nové jméno s obrazem: se zvířetem, povoláním nebo známou osobností, kterou jméno nebo tvář připomíná (paní Zahradníková a konev).',
     'EX-03 Jména a tváře v režimu s trikem'),
    ('TR-02', 'Pomocné slovo', ['86/R Akronyma', '58/8 Akronymy zeleniny a ovoce'],
     'Z prvních písmen slov složit nové, snadno zapamatovatelné slovo.',
     'PA-04 Oslí můstek'),
    ('TR-03', 'Pomocná věta', ['87/R Akrostika'],
     'Vymyslet větu, jejíž slova začínají stejnými písmeny jako to, co si chceme zapamatovat. Hodí se na pořadí.',
     'PA-04 Oslí můstek, varianta pomocná věta'),
    ('TR-04', 'Paměťové kolíky', ['87/1–3 Paměťové kolíky'],
     'Deset pevných obrazů pro čísla 1–10 a „zavěšování“ věcí na ně. Pomáhá s pořadím.',
     'PA-09 Paměťové kolíky'),
    ('TR-05', 'Skupiny a mapa', ['85/R Běžte dál (paměťová mapa)'],
     'Roztřídit věci do skupin a nakreslit si mapu souvislostí (například co zařídit na oslavu narozenin).',
     'EX-05 Nákupní seznam s kategoriemi, PA-02 Co k čemu patří'),
    ('TR-06', 'Čísla po skupinách', ['56/2 Číslicová výzva'],
     'Dlouhé číslo rozdělit na dvojice a trojice, jak se píše telefonní číslo.',
     'Telefonní číslo, EX-04'),
]

# ---------------------------------------------------------------- Hádanky dne
H = [
    ('HD-01', 'Narozeniny přes Silvestra', '66/1 Narozeninový hlavolam', 'výběr odpovědi', 'snadná'),
    ('HD-02', 'Kolik z nás lže?', '67/4 Otázka pravdy', 'výběr osoby', 'střední'),
    ('HD-03', 'Krájení dortu třemi řezy', '67/5 Krájení dortu', 'obrázkové možnosti', 'střední'),
    ('HD-04', 'Karty rubem nahoru poslepu', '67/6 Zmatení kartami', 'ukázat řešení', 'náročná'),
    ('HD-05', 'Přesně půl lahve', '67/7 Dilema s lahví', 'ukázat řešení', 'střední'),
    ('HD-06', 'Mince, které se všechny dotýkají', '67/8 Výzva s mincemi', 'obrázkové možnosti', 'náročná'),
    ('HD-07', 'Jablka v přepravkách', '68/9 Přepravkové vyhlídky', 'ukázat řešení', 'střední'),
    ('HD-08', 'Ruce v kapsách', '68/10 Obrácené kalhoty', 'ukázat řešení (chyták)', 'snadná'),
    ('HD-09', 'Hořící provázky', '68/11 Hořící lana', 'ukázat řešení', 'náročná'),
    ('HD-10', 'Fazole v lahvi', '68/12 Láhev a fazole', 'výběr odpovědi (chyták)', 'snadná'),
    ('HD-11', 'Kolik je koček?', '68/13 Počítání koček', 'výběr čísla', 'snadná'),
    ('HD-12', 'Šroub ve sklenici', '69/15 Ocel a voda', 'ukázat řešení (chyták)', 'střední'),
    ('HD-13', 'Kbelík dnem vzhůru', '69/17 Kbelík, jenž se nesmí vylít', 'výběr + vysvětlení', 'střední'),
    ('HD-14', 'Průměr a většina', '69/18 Nepravděpodobný průměr', 'výběr + vysvětlení', 'náročná'),
    ('HD-15', 'Kdo nikdy nelže?', '70/1 Pravda a lež', 'výběr osoby', 'náročná'),
    ('HD-16', 'Spravedlivý los nespravedlivou mincí', '70/2 Nerovnoměrně vyvážená mince', 'ukázat řešení', 'náročná'),
    ('HD-17', 'Dvojčata a kino', '70/3 Dvojčata', 'výběr odpovědi', 'střední'),
    ('HD-18', 'Je sázka s kostkou férová?', '71/6 Výběr kostky', 'ano / ne + vysvětlení', 'střední'),
    ('HD-19', 'S kým hrát dvakrát?', '71/7 Squash', 'výběr odpovědi', 'střední'),
    ('HD-20', 'Domeček z karet', '65/16 Domeček z karet', 'výběr čísla', 'střední'),
    ('HD-21', 'Devět teček čtyřmi čarami', '66/3 Problém s cestičkou', 'ukázat řešení (kreslení se nehodí)', 'střední'),
    ('HD-22', 'Měnit, nebo neměnit hrnek?', '71/5 Diamantové rozhodnutí', 'výběr + odkaz na pokus RO-04', 'náročná'),
]

# ---------------------------------------------------------------- Mapování všech cvičení z knihy
BOOK = [
    (56, 1, 'Kruhy smajlíků', 'PA-03'), (56, 2, 'Číslicová výzva', 'EX-04 (hra Telefonní číslo); TR-06'), (56, 3, 'Mimo náš svět', 'PA-02'),
    (56, 4, 'Změna tvaru', 'EX-01'), (57, 5, 'Rozpomenutí se na obličej', 'hotovo: Jména a tváře; EX-03'), (57, 6, 'Umístění předmětu', 'PA-01'),
    (57, 7, 'Nákupní seznam', 'hotovo: Nákupní seznam; EX-05'), (58, 8, 'Akronymy zeleniny a ovoce', 'PA-04'), (58, 9, 'Problémy s hesly', 'PA-02 (balíček Kódy)'),
    (58, 10, 'Množství ingrediencí v receptu', 'PA-02 (balíček Recept)'), (58, 11, 'Předměty navíc', 'EX-02'), (59, 12, 'Jižní Amerika', 'PA-06'),
    (59, 13, 'Paměť na tabulky', 'hotovo: Mozaika; EX-06'), (59, 14, 'Karetní hry', 'PA-05'),
    (60, 1, 'Cikcak', 'SL-06'), (60, 2, 'Řetězovky', 'SL-03'), (60, 3, 'Posunutá písmena', 'SL-07'), (61, 4, 'Stopař', 'SL-01'),
    (61, 5, 'Písmenková polévka', 'SL-02'), (61, 6, 'Slovní kruh', 'SL-05'), (61, 7, 'Pět z pěti', 'SL-08'),
    (62, 1, 'Číselné šipky', 'PL-04'), (62, 2, 'Čísla v kroužcích', 'PL-08'), (62, 3, 'Věk a věk', 'PL-06'), (62, 4, 'Mozkové řetězce', 'PL-01'),
    (63, 5, 'Nohatá otázka', 'PL-06'), (63, 6, 'Počítání krychlí', 'PL-07'), (63, 7, 'Obkličovací sudoku', 'PL-02'), (63, 8, 'Vznášející se čísla', 'PL-05'),
    (64, 9, 'Rodinné vztahy', 'SL-04'), (64, 10, 'Aritmetická políčka', 'PL-09'), (64, 11, 'Bleskurychlá otázka', 'PL-03'),
    (64, 12, 'Velká očekávání', 'PL-06'), (64, 13, 'Pekařské rozhodnutí', 'PL-06'), (65, 14, 'Problém malování', 'PL-06'),
    (65, 15, 'Mozkové řetězce', 'PL-01'), (65, 16, 'Domeček z karet', 'HD-20'),
    (66, 1, 'Narozeninový hlavolam', 'HD-01'), (66, 2, 'Rozdělení tekutiny', 'RO-02'), (66, 3, 'Problém s cestičkou', 'HD-21'),
    (67, 4, 'Otázka pravdy', 'HD-02'), (67, 5, 'Krájení dortu', 'HD-03'), (67, 6, 'Zmatení kartami', 'HD-04'), (67, 7, 'Dilema s lahví', 'HD-05'),
    (67, 8, 'Výzva s mincemi', 'HD-06'), (68, 9, 'Přepravkové vyhlídky', 'HD-07'), (68, 10, 'Obrácené kalhoty', 'HD-08'), (68, 11, 'Hořící lana', 'HD-09'),
    (68, 12, 'Láhev a fazole', 'HD-10'), (68, 13, 'Počítání koček', 'HD-11'), (68, 14, 'Hledání v kalendáři', 'RO-01'),
    (69, 15, 'Ocel a voda', 'HD-12'), (69, 16, 'Problém s pizzou', 'PL-10'), (69, 17, 'Kbelík, jenž se nesmí vylít', 'HD-13'),
    (69, 18, 'Nepravděpodobný průměr', 'HD-14'), (69, 19, 'Dilema s přesýpacími hodinami', 'RO-05'),
    (70, 1, 'Pravda a lež', 'HD-15'), (70, 2, 'Nerovnoměrně vyvážená mince', 'HD-16'), (70, 3, 'Dvojčata', 'HD-17'),
    (71, 4, 'Sklenice se štítky', 'RO-03'), (71, 5, 'Diamantové rozhodnutí', 'PO-01, RO-04, HD-22'), (71, 6, 'Výběr kostky', 'HD-18'), (71, 7, 'Squash', 'HD-19'),
    (72, 1, 'Hledání čísel', 'PO-02'), (72, 2, 'Obvodová deska', 'PO-03'), (72, 3, 'Nehodící se škrtněte', 'EX-07 (hra Otočené tvary)'),
    (77, 5, 'Pohled na krychle', 'PL-11'), (77, 6, 'Rotující krychle', 'PL-12'), (77, 7, 'Mistr trasy', 'PL-13'),
    (84, 'V1', 'Kimova hra', 'PA-07'), (85, 'V2', 'Paměť na tabulky', 'hotovo: Mozaika; EX-06'), (85, 'V3', 'Paměť na součet', 'PA-08'),
    (85, 'R', 'Běžte dál: paměťová mapa', 'TR-05'),
    (86, '1–2', 'Zapamatování jmen: zvířata', 'TR-01; EX-03'), (86, '1–2', 'Zapamatování jmen: celebrity', 'TR-01; EX-03'),
    (86, 'R', 'Akronyma', 'TR-02; PA-04'), (87, '1–3', 'Paměťové kolíky', 'TR-04; PA-09'), (87, 'R', 'Akrostika', 'TR-03; PA-04'),
    (92, 'V1', 'Číselné pyramidy', 'PL-14'), (93, 'V2', 'Diagonální číslice', 'PL-15'), (93, 'R', 'Pokračujte dál: kakuro', 'PL-15 (varianta)'),
    (94, 'V1', 'Písmenková polévka', 'SL-02'), (95, 'V2', 'Stopař', 'SL-01 (úroveň Had z písmen)'), (95, 'R', 'Pokračujte dál: křížovka', 'SL-09'),
    (96, 'V1', 'Správná krychle', 'PL-16'), (97, 'V2', 'Vizuální transformace', 'PL-17'),
    (98, 'V1', 'Sudoku', 'PL-02'), (99, 'V2', 'Outside sudoku', 'PL-02 (varianta s čísly kolem mřížky)'),
    (99, 'R', 'Pokračujte dál: sudoku bez čísel', 'PL-02 (úrovně s obrázky)'),
    (99, 'R', 'Pokračujte dál: 3D sudoku ve tvaru hvězdy', 'nezařazeno: na telefonu nepřehledné'),
    (100, 'V1', 'Řez skládačkou', 'PL-10'), (101, 'V2', 'Had', 'PL-18'),
]
CHAPTER = {56: 'Paměť a vybavování', 57: 'Paměť a vybavování', 58: 'Paměť a vybavování', 59: 'Paměť a vybavování',
           60: 'Řečové dovednosti', 61: 'Řečové dovednosti', 62: 'Numerické schopnosti', 63: 'Numerické schopnosti',
           64: 'Numerické schopnosti', 65: 'Numerické schopnosti', 66: 'Řešení problémů', 67: 'Řešení problémů',
           68: 'Řešení problémů', 69: 'Řešení problémů', 70: 'Rozhodování', 71: 'Rozhodování',
           72: 'Koncentrace', 77: '3D vizualizace', 84: 'Paměťové výzvy', 85: 'Paměťové výzvy',
           86: 'Tipy pro lepší paměť', 87: 'Tipy pro lepší paměť', 92: 'Číselné rébusy', 93: 'Číselné rébusy',
           94: 'Slovní rébusy', 95: 'Slovní rébusy', 96: 'Neverbální uvažování', 97: 'Neverbální uvažování',
           98: 'Logické rébusy', 99: 'Logické rébusy', 100: 'Hlavolamy na kreativní uvažování', 101: 'Hlavolamy na kreativní uvažování'}

def no_label(no):
    no = str(no)
    if no.startswith('V'):
        return 'výzva ' + no[1:]
    if no == 'R':
        return 'rámeček'
    return no

def insp_text(lst):
    out = []
    for s in lst:
        page_no, title = s.split(' ', 1)
        page, no = page_no.split('/')
        lab = no_label(no)
        out.append('str. %s, %s %s' % (page, lab if not lab[0].isdigit() else 'č. ' + lab, title))
    return '; '.join(out)

def insp_short(lst):
    return ', '.join(s.split(' ', 1)[0] for s in lst)

# Hry z plánu, které už jsou v aplikaci (ID v plánu → id hry v kódu).
BUILT = {'PL-01': 'retez', 'PL-03': 'vyhodne', 'RO-01': 'hadani', 'SL-04': 'rodina', 'PO-01': 'kulicka', 'PA-02': 'dvojice', 'PA-01': 'byt', 'SL-01': 'osmismerka', 'PL-02': 'sudoku',
         'PA-07': 'podnos', 'PA-08': 'sumy', 'PL-14': 'pyramida', 'PL-13': 'trasa', 'PO-02': 'cisla', 'PA-04': 'mustek', 'PA-09': 'koliky', 'RO-03': 'stitky', 'SL-02': 'polevka', 'PL-04': 'terc', 'PL-05': 'balonky', 'PA-03': 'smajlici', 'RO-02': 'prelevani', 'PA-05': 'karty', 'PO-03': 'dilek', 'PL-17': 'pravidlo', 'PL-06': 'ulohy', 'PL-07': 'kostky', 'SL-03': 'zebrik', 'EX-07': 'tvary', 'EX-01': 'zmena', 'EX-02': 'zmena', 'EX-03': 'jmena', 'PL-11': 'pohled', 'PL-12': 'stavby', 'PL-16': 'krychle', 'RO-04': 'hrnky', 'SL-07': 'sifra', 'SL-06': 'cikcak', 'PL-08': 'sit', 'PL-18': 'had', 'RO-05': 'presyp', 'PL-10': 'deleni', 'EX-04': 'telefon', 'EX-05': 'nakup', 'EX-06': 'mozaika', 'PL-09': 'pocty', 'PL-15': 'soucty'}
new = [g for g in G if g['type'] != 'Rozšíření']
ext = [g for g in G if g['type'] == 'Rozšíření']
covered = [b for b in BOOK if b[3].startswith('hotovo')]
by_prio = lambda p: [g for g in new if g['prio'] == p]

md = []
w = md.append
w('# Databáze miniher: plán')
w('')
pages = sorted(set(b[0] for b in BOOK))
def built_phrase(n):
    if n == 1:
        return 'hotová je 1 hra'
    if 2 <= n <= 4:
        return 'hotové jsou %d hry' % n
    return 'hotových je %d her' % n
built_txt = built_phrase(len(BUILT))
_b1 = [g['name'] for g in G if g['id'] in BUILT and g['prio'] == 'P1']
_b2 = [g['name'] for g in G if g['id'] in BUILT and g['prio'] == 'P2' and g['type'] != 'Rozšíření']
_b2x = [g['name'] for g in G if g['id'] in BUILT and g['prio'] == 'P2' and g['type'] == 'Rozšíření']
_all2 = len([g for g in G if g['prio'] == 'P2' and g['type'] != 'Rozšíření'])
def _po(n):
    return 'je hotová 1 hra' if n == 1 else ('jsou hotové %d hry' % n if 2 <= n <= 4 else 'je hotových %d her' % n)
_stav = 'Stav k 19. 11. 2026: z první vlny %s (%s)' % ('je hotových všech %d her' % len(_b1) if len(_b1) == len([g for g in G if g['prio'] == 'P1']) else _po(len(_b1)), ', '.join(_b1))
if _b2:
    _stav += ', z druhé vlny %s (%s)' % ('je hotových všech %d her' % len(_b2) if len(_b2) == _all2 else _po(len(_b2)), ', '.join(_b2))
if _b2x:
    _stav += ' a %d %s (%s)' % (len(_b2x), 'rozšíření', ', '.join(_b2x))
_b3 = [g['name'] for g in G if g['id'] in BUILT and g['prio'] == 'P3' and g['type'] != 'Rozšíření']
_b3x = [g['name'] for g in G if g['id'] in BUILT and g['prio'] == 'P3' and g['type'] == 'Rozšíření']
if _b3:
    _stav += ', z třetí vlny %s (%s)' % (_po(len(_b3)), ', '.join(_b3))
if _b3x:
    _stav += ' a %d %s (%s)' % (len(_b3x), 'rozšíření', ', '.join(_b3x))
w(_stav + ', ostatní je zatím plán. Zdrojem' + ' nápadů jsou jen vybrané nafocené strany knihy: str. 56–72 a 77 z kapitoly *Myšlenkové schopnosti* a str. 84–87 a 92–101 z kapitoly *Zkoušejte nové věci*, celkem %d cvičení a tipů z %d stran. Stejná data jsou i v tabulce [`minihry-databaze.csv`](minihry-databaze.csv) pro Excel, Numbers nebo Google Tabulky.' % (len(BOOK), len(pages)))
w('')
w('## Shrnutí')
w('')
w('- **%d nových miniher**: %d v první vlně (P1), %d ve druhé (P2), %d na později (P3).' % (len(new), len(by_prio('P1')), len(by_prio('P2')), len(by_prio('P3'))))
w('- **%d rozšíření** her, které už v aplikaci jsou (nové režimy).' % len(ext))
w('- **%d námětů na Hádanku dne**: logické hádanky a chytáky z kapitol Řešení problémů a Rozhodování. Na rychlou adaptivní minihru se nehodí, ale jako jedna klidná hádanka denně ano.' % len(H))
w('- **Škola paměti** (nová funkce): %d krátkých lekcí o paměťových tricích, každá s navazující minihrou.' % len(TR))
w('- **%d cvičení** už pokrývají hry, které máme (Jména a tváře, Nákupní seznam, Mozaika). Některá cvičení se v knize opakují (Stopař, Písmenková polévka, Paměť na tabulky); v databázi patří ke stejné položce.' % len(covered))
w('')
w('**Doporučená první vlna (P1):** ' + ', '.join('%s (%s)' % (g['name'], g['id']) for g in by_prio('P1')) + '. Pokrývá všech pět oblastí, má hodně vazeb na běžný život a obsah se dá z velké části generovat.')
w('')
w('**Ze stran 72–101 nejvíc slibují:** Podnos (PA-07), Součty z paměti (PA-08), Sčítací pyramida (PL-14) a Cesta podle šipek (PL-13), k tomu Škola paměti. První tři mají malou pracnost a obsah se generuje. Hodí se na začátek druhé vlny. Strany 98–101 přidávají hlavně varianty Sudoku a Dělení tvaru a jednu novou logickou hru, Hadí cestu (PL-18).')
w('')
w('## Jak číst databázi')
w('')
w('- **ID:** PA Paměť, PO Postřeh, RO Rozhodování, SL Slova, PL Počty a logika, EX rozšíření stávající hry, HD Hádanka dne, TR Škola paměti.')
w('- **Priorita:** P1 stavět jako první, P2 potom, P3 až po zkušenostech se seniory nebo pokud zbude čas.')
w('- **Pracnost:** S malá (jednoduchá logika, obsah se generuje), M střední (vlastní grafika nebo generátor s kontrolou řešení), L velká (rozsáhlý obsah: slovník, mapy).')
w('- **Inspirace:** strana a číslo cvičení v knize. 57/6 je strana 57, cvičení 6. V znamená výzvu (84/V1 = strana 84, výzva 1), R rámeček s tipem.')
w('')
w('## Co musí obsahovat každá minihra')
w('')
for i, t in enumerate([
    'Krátké pokyny ve 2–4 větách (vykání), které jde přečíst nahlas. U nové hry ukázka.',
    'Úrovně obtížnosti (3–8) a posun podle výkonu: nahoru, beze změny, dolů. Na první úrovni žádný časový tlak.',
    'Dvě délky: krátká do lekce (asi 1–2 minuty) a delší pro volné hraní (2–4 minuty).',
    'Výsledek: hlavní číslo s popiskem, výkon 0–1 (z něj body) a údaj do historie.',
    'Ovládání jen klepnutím na velké prvky. Žádné tažení, kreslení ani psaní textu. Čísla přes vlastní klávesnici aplikace.',
    'Informace nikdy jen barvou: vždy i tvar, ikona nebo slovo.',
    'Vlastní obsah. Z knihy přebíráme jen typ úlohy, ne texty, čísla, seznamy ani obrázky.',
    'Automatický hráč do testu (tests/e2e.cjs), aby se hra dala dohrát v testu.'], 1):
    w('%d. %s' % (i, t))
w('')
w('## Přehled miniher')
w('')
w('| ID | Minihra | Oblast | Typ | Priorita | Pracnost | Vztah k aplikaci | Inspirace (str./č.) |')
w('|---|---|---|---|---|---|---|---|')
order = {d: i for i, d in enumerate(DOMAINS)}
for g in sorted(new, key=lambda g: (g['prio'], order[g['domain']], g['id'])) + ext:
    w('| %s | %s | %s | %s | %s | %s | %s | %s |' % (g['id'], g['name'] + (' (hotovo)' if g['id'] in BUILT else ''), g['domain'], g['type'], g['prio'], g['effort'], g['rel'], insp_short(g['insp'])))
w('')
w('## Podrobné karty')
def card(g):
    w('')
    w('### %s %s' % (g['id'], g['name']))
    w('')
    w('*%s · %s · priorita %s · pracnost %s%s*%s' % (g['domain'], g['type'], g['prio'], g['effort'], '' if g['rel'] == 'Nová' else ' · ' + g['rel'], ' · **hotovo v aplikaci**' if g['id'] in BUILT else ''))
    w('')
    w('- **Inspirace:** %s' % insp_text(g['insp']))
    w('- **Trénuje:** %s' % g['trains'])
    if len(g['how']) == 1:
        w('- **Jak se hraje:** %s' % g['how'][0])
    else:
        w('- **Jak se hraje:**')
        for i, s in enumerate(g['how'], 1):
            w('  %d. %s' % (i, s))
    w('- **Obsah a data:** %s' % g['content'])
    w('- **Úrovně:** %s' % g['levels'])
    w('- **Hodnocení:** %s' % g['score'])
    w('- **Krátká verze do lekce:** %s' % g['short'])
    w('- **Pozor u seniorů:** %s' % g['caution'])
for d in DOMAINS:
    gs = [g for g in new if g['domain'] == d]
    if not gs:
        continue
    w('')
    w('## %s' % d)
    for g in sorted(gs, key=lambda g: (g['prio'], g['id'])):
        card(g)
w('')
w('## Rozšíření stávajících her')
for g in ext:
    card(g)
w('')
w('## Hádanka dne (nová funkce)')
w('')
w('- **Stav: hotovo v aplikaci.** 32 vlastních hádanek, karta na Cestě a žárovka v horní liště, za správnou odpověď 10 bodů, za pokus 5, odznak Luštitel. Další hádanky lze průběžně přidávat do js/riddles.js.')
w('- Na obrazovce Cesta karta „Hádanka dne“: jedna hádanka denně, bez časového limitu.')
w('- Odpověď výběrem ze 3–4 možností. U hádanek, kde se vymýšlí postup, tlačítko „Ukázat řešení“.')
w('- Po odpovědi vysvětlení s jednoduchým obrázkem, +10 bodů, odznak Luštitel (1, 10, 30, 100 hádanek).')
w('- Potřeba 60–100 vlastních hádanek, aby vydržely 2–3 měsíce. Štítky: logika, čísla, prostor, chyták; obtížnost snadná / střední / náročná.')
w('- Z knihy převzít jen typ hádanky. Znění, čísla i obrázky napsat vlastní (jiné objemy nádob, jiný věk, jiná zvířata).')
w('')
w('| ID | Hádanka (pracovní název) | Inspirace (str./č.) | Formát odpovědi | Obtížnost |')
w('|---|---|---|---|---|')
for hid, name, insp, fmt, diff in H:
    p, rest = insp.split(' ', 1)
    w('| %s | %s | %s %s | %s | %s |' % (hid, name, p, rest, fmt, diff))
w('')
w('## Škola paměti (nová funkce)')
w('')
w('- Krátké lekce o paměťových tricích, asi 2 minuty. Každá má čtyři kroky: vysvětlení ve dvou třech větách s obrázkem, ukázka na vlastním příkladu, hned procvičení v navazující minihře a úkol do běžného života („Dnes si takhle zkuste zapamatovat nákup“).')
w('- **Stav: hotovo v aplikaci** (vlastní příklady). Na Cestě je karta Škola paměti, triky se odemykají jeden po druhém, každý má procvičení přímo v lekci a odkaz na navazující hru. Za všech %d triků odznak Mistr paměti. Navazující hry Oslí můstek (PA-04) a Paměťové kolíky (PA-09) jsou hotové (zastávka Pálava).' % len(TR))
w('- Proč: paměťové strategie se dají naučit v každém věku. Ve velké americké studii ACTIVE (přes 2 800 lidí nad 65 let) zlepšila výuka strategií výsledky v paměťových úlohách a účinek byl měřitelný ještě po 5 letech. Prevenci demence to ale neprokazuje, takže ji aplikace slibovat nesmí.')
w('- Příklady (jména, slova, věty, kolíky) budou vlastní. Z knihy přebíráme jen samotné techniky, které jsou obecně známé.')
w('')
w('| ID | Trik (pracovní název) | Inspirace (str./č.) | Co se hráč naučí | Procvičení |')
w('|---|---|---|---|---|')
for tid, name, insp, learn, practice in TR:
    w('| %s | %s | %s | %s | %s |' % (tid, name, insp_short(insp), learn, practice))
w('')
w('## Návrh postupu')
w('')
w('1. **První vlna:** %d her P1 a Hádanka dne se 30 hádankami. Zastávky 8–12 (Telč, Třeboň, Brno, Litomyšl, České Švýcarsko) dnes žádné nové hry nepřinášejí, takže každá dostane 2 hry z první vlny.' % len(by_prio('P1')))
w('2. **Druhá vlna:** %d her P2, rozšíření EX-01 až EX-03 a EX-07 a Škola paměti. Hotové jsou: Podnos, Součty z paměti a Sčítací pyramida (Šumava a České Švýcarsko), Cesta podle šipek s Hledáním čísel (Kroměříž), Oslí můstek s Paměťovými kolíky (Pálava), Popletené štítky s Písmenkovou polévkou (Ještěd), Terč s Balonky (Ostrava), Smajlíci s Přeléváním (Karlštejn), Vynesené karty s Chybějícím dílkem (Hluboká), Najdi pravidlo se Slovními úlohami (Třebíč) a Stavba z kostek se Slovním žebříkem (Plzeň), tedy všech 19 nových her druhé vlny. Hotová jsou i rozšíření EX-01 a EX-02 (Co se změnilo: víc změn v tabulce tvarů a co přibylo), EX-03 (Jména a tváře: kreslené portréty, otázka na konci hry a volba s trikem) a EX-07 (najdi vetřelce v Otočených tvarech) a Škola paměti. Druhá vlna je tím celá hotová.' % len(by_prio('P2')))
w('3. **Třetí vlna:** P3 podle toho, co se osvědčí při zkoušení se seniory. Hotové jsou Pohled z boku a Otočené stavby (PL-11, PL-12, zastávka Žďár nad Sázavou), postavené na kreslení kostek ze Stavby z kostek (PL-07), Skládání krychle s Třemi hrnky (PL-16, RO-04, zastávka Moravský kras) Tajná šifra se Slovním cikcakem (SL-07, SL-06, zastávka Kokořín) Číselná síť s Hadí cestou (PL-08, PL-18, zastávka Rožnov pod Radhoštěm) Přesýpací hodiny s Dělením tvaru (RO-05, PL-10, zastávka Kuks) a Křížové počty se Součtovými čtverci (PL-09, PL-15, zastávka Hradec Králové). Hotová jsou i rozšíření EX-04 až EX-06. Zbývají Slovní kruh, Posuvné sloupce, Křížovka s tajenkou a Mapa Česka, které potřebují větší slovník nebo mapu.')
w('')
w('## Obsah, který bude potřeba vytvořit')
w('')
for t in [
    '**Seznamy slov:** tematické seznamy pro Osmisměrku (40+), krátká slova pro Slovní žebřík, předpočítané seznamy pro Slovní kruh. U hotových slovníků vždy ověřit licenci.',
    '**Tajenky a hádanky:** krátká přísloví (část už je v content.js), 60–100 vlastních hádanek s vysvětlením.',
    '**Tematické balíčky pro Co k čemu patří:** recepty (bábovka, palačinky, knedlíky, vánočka), ceníky, jízdní řády, narozeniny.',
    '**Grafika:** 3–4 půdorysy bytů, 32 mariášových karet ve zjednodušeném stylu, kreslené výrazy obličejů, kreslené portréty, jednoduché ilustrace k hádankám, asi 40 ikon věcí pro Podnos (sdílet s Co se změnilo a Nákupním seznamem), ikony budov pro Cestu podle šipek, 10 obrázků paměťových kolíků.',
    '**Generátory s kontrolou řešení:** kreslení staveb z kostek (PL-07, PL-11, PL-12), pyramidy a součtové čtverce s jednoznačným řešením (PL-14, PL-15), sítě krychle (PL-16), pravidla proměn obrázků (PL-17), dělení tvaru a hadí cesta (PL-10, PL-18).',
    '**Škola paměti:** 6 krátkých lekcí s vlastními příklady a obrázky.',
    '**Křížovky:** otázky se musí psát ručně. Zvážit spolupráci s autorem křížovek.',
    '**Mapy:** zjednodušené SVG krajů ČR a okolních států, s ověřenou licencí.']:
    w('- ' + t)
w('')
w('## Autorská práva')
w('')
w('Typy úloh (osmisměrka, sudoku, přelévání vody, hádanky o lhářích, kakuro, Kimova hra) jsou volné a lze je použít. Konkrétní texty, zadání, čísla, seznamy a ilustrace z knihy chrání autorské právo, proto do aplikace píšeme vlastní obsah. Totéž platí pro klasické hádanky: myšlenka je volná, znění a obrázky budou naše. U paměťových technik je volná samotná technika (pomocné slovo, kolíky, mapa), ale seznam kolíků, ukázkové věty a jména z knihy nahradíme vlastními.')
w('')
w('## Příloha: kam patří každé cvičení z knihy')
w('')
w('Č. je číslo cvičení, „výzva“ a „rámeček“ odpovídají označení v knize.')
w('')
w('| Strana | Kapitola | Č. | Cvičení | V plánu |')
w('|---|---|---|---|---|')
for page, no, title, where in BOOK:
    w('| %s | %s | %s | %s | %s |' % (page, CHAPTER[page], no_label(no), title, where))
w('')
open(os.path.join(OUT, 'minihry-databaze.md'), 'w', encoding='utf-8').write('\n'.join(md))

# CSV: všechny minihry, rozšíření i hádanky
buf = io.StringIO()
cw = csv.writer(buf)
cw.writerow(['ID', 'Název', 'Oblast', 'Typ', 'Priorita', 'Pracnost', 'Vztah k aplikaci', 'Inspirace', 'Trénuje', 'Jak se hraje', 'Obsah a data', 'Úrovně', 'Hodnocení', 'Krátká verze do lekce', 'Pozor u seniorů', 'Stav'])
for g in sorted(new, key=lambda g: (g['prio'], order[g['domain']], g['id'])) + ext:
    cw.writerow([g['id'], g['name'], g['domain'], g['type'], g['prio'], g['effort'], g['rel'], insp_text(g['insp']), g['trains'],
                 ' '.join('%d) %s' % (i, s) for i, s in enumerate(g['how'], 1)) if len(g['how']) > 1 else g['how'][0],
                 g['content'], g['levels'], g['score'], g['short'], g['caution'], 'hotovo' if g['id'] in BUILT else 'plán'])
for hid, name, insp, fmt, diff in H:
    cw.writerow([hid, name, 'Hádanka dne', 'Hádanka dne', '', 'S', 'Nová funkce Hádanka dne', insp_text([insp]),
                 '', fmt, 'Vlastní znění a čísla, jednoduchá ilustrace, vysvětlení řešení.', 'Obtížnost: ' + diff, 'Správná odpověď +10 bodů', '—', '', 'plán'])
for tid, name, insp, learn, practice in TR:
    cw.writerow([tid, name, 'Škola paměti', 'Škola paměti', 'P2', 'S', 'Nová funkce Škola paměti', insp_text(insp),
                 learn, 'Vysvětlení s obrázkem, ukázka, procvičení (%s), úkol do běžného života.' % practice,
                 'Vlastní texty, příklady a obrázky.', '—', 'Dokončení lekce +10 bodů, za všechny triky odznak Mistr paměti', '—',
                 'Krátké věty, vykání, žádný časový tlak.', 'plán'])
open(os.path.join(OUT, 'minihry-databaze.csv'), 'w', encoding='utf-8-sig', newline='').write(buf.getvalue())

print('new', len(new), 'P1', len(by_prio('P1')), 'P2', len(by_prio('P2')), 'P3', len(by_prio('P3')), 'ext', len(ext), 'riddles', len(H), 'tricks', len(TR), 'book', len(BOOK), 'covered', len(covered))
