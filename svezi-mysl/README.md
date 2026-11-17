# Svěží mysl

Krátké denní hry pro seniory na trénink **paměti, postřehu, rozhodování, slov a počtů**, propojené cestou po Česku ve stylu Duolinga. Je to webová aplikace (PWA). Na iPhonu a iPadu se přidá na plochu a pak se chová jako běžná aplikace: má ikonu, běží přes celou obrazovku a funguje bez internetu. Výsledky zůstávají jen v zařízení.

Navrženo pro starší uživatele:

- velké písmo **Atkinson Hyperlegible**, které Braille Institute navrhl pro lidi se slabším zrakem, a nastavitelná velikost písma ve třech stupních,
- velká tlačítka, žádná gesta, žádné drobné ovládací prvky,
- vykání, krátké věty a pokyny, které si lze nechat přečíst nahlas česky,
- obtížnost se přizpůsobuje sama: když se daří, hra přitvrdí, když ne, uleví,
- jemné zvuky, světlý i tmavý vzhled a respektování nastavení „omezit pohyb“.

## Jak aplikace motivuje (ve stylu Duolinga)

- **Cesta po Česku**: hlavní obrazovka je cesta přes 12 zastávek (Praha, Karlovy Vary, Český Krumlov, Kutná Hora, Olomouc, Krkonoše, Lednice, Telč, Třeboň, Brno, Litomyšl, České Švýcarsko). Každá zastávka má 4 lekce, truhlu s odměnou a závěrečnou lekci.
- **Lekce**: tři krátké minihry za sebou (asi 5 minut), závěrečná lekce zastávky má čtyři. Mezi hrami je mezivýsledek a pravidla další hry, na konci souhrn s body.
- **Postupné odemykání**: prvních 7 zastávek přináší vždy 3 až 4 nové hry. Seniora tak hned na začátku nezahltí 22 her. Zamčenou hru jde v kartě Hry odemknout i hned.
- **Body a denní cíl**: 5 až 10 bodů za hru podle výkonu, 5 za dokončenou lekci, 5 za lekci bez chyby, 15 za truhlu. Denní cíl si hráč vybere: 20, 40 nebo 60 bodů (asi 5, 10 nebo 15 minut).
- **Série dní** s **ohníčkem** a **záchranným dnem**: za každých 7 dní v řadě přibude záchranný den (nejvýš 2), který podrží sérii, když jeden den vynecháte. Žádné „životy“ ani tresty za chyby.
- **Sbírka**: za každou zastávku sběratelská **pohlednice** („Pozdrav z Prahy“) s ilustrací a zajímavostí o místě, za vytrvalost a pokroky **odznaky** v několika stupních (Vytrvalost, Splněný cíl, Píle, Cestovatel, Bez chyby, Všestrannost, Ranní ptáče, Rekordy).
- **Oslavy**: konfety a samostatné obrazovky pro prodlouženou sérii, splněný cíl, novou pohlednici, nové hry a nový odznak. Při zapnutém „omezit pohyb“ se animace vypnou.
- **Procvičování**: v kartě Hry jedno tlačítko sestaví lekci ze tří her, které hráč hrál nejméně.

Žebříčky s cizími lidmi záměrně chybí: bez serveru by byly falešné a pro seniory spíš stresují.

## Hry (22)

| Oblast | Hra | Co trénuje | Výzkumný vzor |
|---|---|---|---|
| Paměť | Pexeso | zrakovou a prostorovou paměť | hra Concentration |
| Paměť | Nákupní seznam | paměť na slova | učení a rozpoznání seznamu slov |
| Paměť | Svítící okna | pracovní paměť, pořadí | Corsiho kostky |
| Paměť | Jména a tváře | spojení jména s obličejem | asociativní paměť |
| Paměť | Telefonní číslo | krátkodobou paměť na čísla | rozsah paměti na číslice (digit span) |
| Paměť | Co se změnilo | zrakovou paměť, detaily | detekce změny (change detection) |
| Paměť | Mozaika | prostorovou paměť | zapamatování vzoru v mřížce |
| Postřeh | Bleskový pohled | rychlost vnímání, periferní pozornost | Useful Field of View (UFOV) |
| Postřeh | Jeden je jiný | zrakové vyhledávání | vizuální vyhledávání |
| Postřeh | Kolik jich je | rychlé vnímání množství | odhad počtu (subitizing) |
| Rozhodování | Šipky | potlačení rušivé informace | Eriksenova úloha (flanker) |
| Rozhodování | Barvy a slova | sebeovládání, přepínání pravidel | Stroopova úloha |
| Rozhodování | Popořadě | rychlost, střídání dvou řad | Trail Making Test (A/B) |
| Rozhodování | Sběr ovoce | rychlé rozhodnutí a zdrženlivost | go/no-go |
| Slova | Přísloví | slovní zásobu, dlouhodobou paměť | doplňování známých rčení |
| Slova | Protiklady | slovní zásobu | antonyma |
| Slova | Přesmyčky | práci se slovy | anagramy |
| Slova | Co sem nepatří | třídění pojmů | sémantická kategorizace |
| Počty a logika | Hodiny | orientaci v čase | čtení ručičkových hodin |
| Počty a logika | Placení | počítání s penězi v korunách | běžné denní činnosti (IADL) |
| Počty a logika | Co bude dál | logické uvažování | doplňování řad |
| Počty a logika | Otočené tvary | prostorovou představivost | mentální rotace |

Každá hra má několik úrovní obtížnosti, které se mění podle výsledků. V lekcích se hraje kratší verze, ve volném hraní delší. **Bleskový pohled** vychází z tréninku rychlosti zpracování ze studie ACTIVE, který má mezi „mozkovými hrami“ nejsilnější důkazy (viz níže).

Další části aplikace:

- **Spodní lišta**: Cesta, Hry (volné hraní a procvičování), Sbírka (pohlednice a odznaky), Pokrok (série, body za týden, výsledky každé hry).
- **Nastavení**: denní cíl, velikost písma, vzhled, zvuky, automatické předčítání, smazání výsledků.
- **O tréninku**: jak funguje cesta, jak trénovat, co mysli pomáhá ještě víc (pohyb, lidé, sluch a zrak, cévy, spánek) a upozornění, že nejde o zdravotnický prostředek.

## Spuštění

Aplikace nepotřebuje žádné sestavování ani knihovny.

```bash
cd svezi-mysl
python3 -m http.server 8080
# otevřete http://localhost:8080
```

Funguje i po otevření `index.html` přímo ze souboru, jen bez offline režimu.

### Test

Automatický test projde úvodní nastavení, celou první zastávku cesty (lekce, truhlu, pohlednici, odemčení nových her) a všech 22 her v emulovaném iPhonu a iPadu. Hlídá chyby v konzoli a přetékání stránky do šířky:

```bash
npm i -D playwright && npx playwright install chromium
node tests/e2e.cjs                  # volitelně: --shots ./screenshots
```

Pro rychlé ruční zkoušení lze všechna čekání zrychlit parametrem `?ts=0.1` (například `http://localhost:8080/?ts=0.1`).

## Zveřejnění a instalace na iPhone a iPad

1. Nahrajte obsah složky na libovolný hosting s HTTPS (GitHub Pages, Netlify, Cloudflare Pages…).
2. Na iPhonu nebo iPadu otevřete adresu v **Safari**, klepněte na **Sdílet** a pak na **Přidat na plochu**. Aplikace na to sama upozorní.
3. Při každé změně souborů zvyšte `VERSION` v `sw.js`, aby si zařízení stáhla novou verzi.

Proč instalovat na plochu: Safari maže data webů, které 7 dní nepoužijete. Aplikace přidaná na plochu má vlastní počítadlo dnů používání, takže výsledky nezmizí.

## Cesta do App Store

Doporučený postup je nejdřív ověřit hry se seniory na webové verzi, kde jsou změny rychlé a levné, a teprve potom řešit App Store.

1. **Capacitor** (stejný kód, nejrychlejší cesta): `npm i @capacitor/core @capacitor/cli @capacitor/ios`, `npx cap init`, `npx cap add ios`, otevřít v Xcode. Potřebujete Mac s Xcode a účet Apple Developer Program (99 USD ročně). Přidejte něco nativního, hlavně **denní připomínky** (lokální notifikace) a haptiku. Čistě zabalený web může Apple odmítnout podle pravidla 4.2 (Minimum Functionality).
2. **Nativní SwiftUI**: přepis, až bude herní návrh ověřený. Přináší systémovou velikost písma (Dynamic Type), plnou podporu VoiceOver, widgety a notifikace. Herní logika je napsaná jednoduše, takže se dá převést hra po hře.

## Struktura

```
index.html            vstupní stránka (PWA)
manifest.webmanifest  název, ikony a barvy pro instalaci
sw.js                 offline režim (mezipaměť souborů)
css/app.css           vzhled (barvy jako proměnné, světlý i tmavý režim)
css/fonts.css         písmo uložené přímo v aplikaci (fonts/, licence SIL OFL)
js/util.js            pomocné funkce, české datum a množná čísla, opakovatelná náhoda
js/store.js           ukládání výsledků, postupu a nastavení (localStorage)
js/sound.js           zvuky (Web Audio) a předčítání (Web Speech, cs-CZ)
js/icons.js           ikony
js/places.js          zastávky cesty, nové hry v nich a ilustrace pohlednic
js/content.js         obsah slovních her (přísloví, protiklady, přesmyčky, kategorie, jména)
js/kit.js             společné prvky miniher (výběr odpovědi, číselná klávesnice)
js/fx.js              konfety a napočítávání čísel
js/engine.js          motivace: body, denní cíl, série, záchranné dny, odznaky, sestavení lekcí
js/app.js             kostra: navigace, spodní lišta, dialogy, běh hry
js/screens/*.js       cesta, lekce a oslavy, karta Hry, sbírka, pokrok, nastavení a první spuštění
js/games/*.js         jednotlivé minihry (22)
tests/e2e.cjs         automatický test v Playwrightu
```

Cílem je Safari 15 a novější (např. iPhone 7 nebo starší iPady). Proto kód nepoužívá CSS nesting, `:has()` ani `color-mix()`.

### Jak přidat hru

Vytvořte `js/games/nova.js`, přidejte ji do `index.html` a do `sw.js` a v `js/places.js` ji zařaďte do seznamu `intro` některé zastávky (tam se hra poprvé objeví a odemkne). V lekcích dostane krátkou verzi přes `ctx.short`.

```js
SM.registerGame({
  id: 'nova', name: 'Nová hra', domain: 'pamet',     // pamet | postreh | rozhodovani | slova | logika
  trains: 'co hra trénuje', short: 'Jedna věta do přehledu.', duration: 'asi 2 minuty',
  maxLevel: 8,
  howTo: ['Krok 1', 'Krok 2'],                         // nebo funkce (level) => [...]
  async run(ctx) {
    // ctx.level, ctx.short (kratší verze v lekci), ctx.stage, ctx.foot, ctx.status(text), ctx.progress(text),
    // await ctx.sleep(ms), ctx.after(ms, fn), ctx.frame(fn), ctx.on(el, typ, fn),
    // ctx.size(), ctx.feedback(správně), ctx.sound
    ctx.finish({
      perf: 0.8,                 // výkon 0–1 v rámci úrovně
      levelDelta: 1,             // +1 / 0 / −1 (nebo newLevel)
      big: '12 z 15', bigLabel: 'správných odpovědí',
      details: ['Čas: 1 min 20 s'], metric: { /* uloží se do historie */ }
    });
  }
});
```

## Odborné pozadí a opatrnost v tvrzeních

**Co říká výzkum:**

- **ACTIVE** (Ball a kol., *JAMA* 2002; Rebok a kol., *J Am Geriatr Soc* 2014; Edwards a kol., *Alzheimer's & Dementia: TRCI* 2017). Ze tří typů tréninku (paměť, uvažování, rychlost zpracování) byl jen trénink rychlosti spojen s nižším výskytem demence po 10 letech, zhruba o 29 %. Jde o sekundární analýzu, ne o hlavní cíl studie. Na tom staví hra Bleskový pohled.
- **FINGER** (Ngandu a kol., *Lancet* 2015) a **US POINTER** (Baker a kol., *JAMA* 2025): u rizikových seniorů zlepšila kognici kombinace pohybu, stravy, kognitivního tréninku a hlídání cévních rizik. Samotné hry jsou jen jedna složka.
- **Lancet Commission 2024** (Livingston a kol.): 14 ovlivnitelných rizikových faktorů, kterými by šlo předejít nebo oddálit až asi 45 % případů demence. Patří mezi ně neléčená nedoslýchavost a zhoršený zrak, vysoký tlak, cukrovka, LDL cholesterol, nečinnost, samota, deprese a kouření. Proto je v aplikaci obrazovka „O tréninku“.
- **Kritický pohled**: Simons a kol., *Psychological Science in the Public Interest* 2016: hráči se zlepšují hlavně v tom, co trénují, a přenos do běžného života je omezený. V USA dostala firma Lumosity v roce 2016 od FTC pokutu 2 mil. USD za nepodložená tvrzení.

**Co z toho plyne pro komunikaci:** neslibovat, že aplikace „předchází demenci“ nebo „léčí“. Bezpečné formulace jsou „trénink paměti a pozornosti“ nebo „udržujte mysl v kondici“.

**Regulace (EU):** podle nařízení **MDR 2017/745** je software určený k prevenci, diagnostice, sledování nebo zmírnění nemoci **zdravotnickým prostředkem**. Pak je potřeba klasifikace podle pravidla 11, technická dokumentace, klinické hodnocení a označení CE. Totéž platí, kdyby aplikace hodnotila kognitivní stav („máte riziko demence“). Současná verze je proto postavená jako tréninková a obsahuje upozornění.

**Osobní údaje:** výsledky zůstávají v zařízení a nic se neodesílá, takže aplikace žádné osobní údaje nezpracovává na serveru. Pokud přibude synchronizace nebo sdílení s rodinou, výsledky kognitivních testů se mohou považovat za údaje o zdraví (zvláštní kategorie podle GDPR). Písmo je uložené přímo v aplikaci, ne načítané z Google Fonts (srov. rozsudek LG München z ledna 2022).

## Možné další kroky

Podrobný plán dalších miniher (30 nových her, 6 rozšíření a Hádanka dne) je v [`docs/minihry-databaze.md`](docs/minihry-databaze.md), tabulka v [`docs/minihry-databaze.csv`](docs/minihry-databaze.csv).

1. **Vyzkoušet s 5 až 8 seniory** různého věku. Sledovat, jestli rozumí pokynům, jak zvládají dotyk a co je frustruje. Doladit úroveň 1 všech her.
2. **Denní připomínka**: v Capacitoru jako lokální notifikace, na webu jako Web Push (iOS 16.4+, jen pro aplikaci na ploše).
3. **Další hry a obsah**: krátké příběhy s otázkami (vybavování), orientace v kalendáři a na mapě, hudební paměť, víc přísloví a slov. Další zastávky cesty (např. Morava, Šumava) s novými pohlednicemi.
4. **Rodinné výzvy místo žebříčků**: společný týdenní cíl s vnoučaty nebo partnerem (vyžaduje server).
5. **Pohyb a společnost** podle FINGER: tip na procházku nebo cvičení dne, společné hraní s vnoučaty.
6. **Přístupnost**: projít s VoiceOverem, alternativa Barev a slov pro barvoslepé.
7. **Rodinný přehled** (se souhlasem): sdílení pokroku s blízkými. Vyžaduje server a řešení GDPR.
