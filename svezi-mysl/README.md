# Svěží mysl

Krátké denní hry pro seniory na trénink **paměti, postřehu a rozhodování**. Je to webová aplikace (PWA). Na iPhonu a iPadu se přidá na plochu a pak se chová jako běžná aplikace: má ikonu, běží přes celou obrazovku a funguje bez internetu. Výsledky zůstávají jen v zařízení.

Navrženo pro starší uživatele:

- velké písmo **Atkinson Hyperlegible**, které Braille Institute navrhl pro lidi se slabším zrakem, a nastavitelná velikost písma ve třech stupních,
- velká tlačítka, žádná gesta, žádné drobné ovládací prvky,
- vykání, krátké věty a pokyny, které si lze nechat přečíst nahlas česky,
- obtížnost se přizpůsobuje sama: když se daří, hra přitvrdí, když ne, uleví,
- jemné zvuky, světlý i tmavý vzhled a respektování nastavení „omezit pohyb“.

## Hry

| Hra | Oblast | Co trénuje | Výzkumný vzor | Jak se přizpůsobuje |
|---|---|---|---|---|
| **Pexeso** | Paměť | zrakovou a prostorovou paměť | klasická hra Concentration | 3 až 15 dvojic |
| **Nákupní seznam** | Paměť | paměť na slova | učení seznamu slov a jejich rozpoznání | 3 až 10 položek, od úrovně 3 s příkladem na rozptýlení |
| **Svítící okna** | Paměť | pracovní paměť, pořadí | Corsiho kostky | délka řady roste a klesá v každém kole, mřížka 3×3 až 4×4 |
| **Bleskový pohled** | Postřeh | rychlost vnímání, periferní pozornost | Useful Field of View (UFOV) | doba zobrazení se řídí schodovou metodou 2 dolů / 1 nahoru; 4 a 8 pozic, rušivé obrázky |
| **Jeden je jiný** | Postřeh | zrakové vyhledávání | vizuální vyhledávání | 3×3 až 6×7, stále jemnější rozdíly |
| **Šipky** | Rozhodování | potlačení rušivé informace | Eriksenova úloha (flanker) | podíl matoucích šipek, časový limit, posun na obrazovce |
| **Barvy a slova** | Rozhodování | sebeovládání, přepínání pravidel | Stroopova úloha | počet barev, časový limit, střídání pravidel „barva / slovo“ |
| **Popořadě** | Rozhodování | rychlost, střídání dvou řad | Trail Making Test (A/B) | 8 až 24 políček, čísla a pak střídání čísel a písmen |

**Bleskový pohled** je nejdůležitější: vychází z tréninku rychlosti zpracování ze studie ACTIVE, který má mezi „mozkovými hrami“ nejsilnější důkazy (viz níže).

Další části aplikace:

- **Dnešní trénink**: 4 hry denně (asi 10 minut), každý den jiná kombinace ze všech tří oblastí.
- **Můj pokrok**: dny v řadě, posledních 7 dní, úroveň a vývoj bodů u každé hry, tabulka posledních výsledků.
- **Nastavení**: velikost písma, vzhled, zvuky, automatické předčítání, smazání výsledků.
- **O tréninku**: co trénovat a jak, co mysli pomáhá ještě víc (pohyb, lidé, sluch a zrak, cévy, spánek) a upozornění, že nejde o zdravotnický prostředek.

Body: každá úroveň přidává 10 bodů a dalších 0 až 10 bodů hráč získá za výkon v ní. Díky tomu body rostou s pokrokem a dají se porovnávat v čase.

## Spuštění

Aplikace nepotřebuje žádné sestavování ani knihovny.

```bash
cd svezi-mysl
python3 -m http.server 8080
# otevřete http://localhost:8080
```

Funguje i po otevření `index.html` přímo ze souboru, jen bez offline režimu.

### Test

Automatický test projde všech 8 her a celý denní trénink v emulovaném iPhonu a iPadu a hlídá chyby v konzoli:

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
js/util.js            pomocné funkce, české datum a množná čísla
js/store.js           ukládání výsledků a nastavení (localStorage)
js/sound.js           zvuky (Web Audio) a předčítání (Web Speech, cs-CZ)
js/icons.js           ikony
js/app.js             obrazovky, navigace, běh her, denní trénink, pokrok
js/games/*.js         jednotlivé hry
tests/e2e.cjs         automatický test v Playwrightu
```

Cílem je Safari 15 a novější (např. iPhone 7 nebo starší iPady). Proto kód nepoužívá CSS nesting, `:has()` ani `color-mix()`.

### Jak přidat hru

Vytvořte `js/games/nova.js`, přidejte ji do `index.html`, do `sw.js` a do skupiny `GROUPS` v `js/app.js`:

```js
SM.registerGame({
  id: 'nova', name: 'Nová hra', domain: 'pamet',     // pamet | postreh | rozhodovani
  trains: 'co hra trénuje', short: 'Jedna věta do přehledu.', duration: 'asi 2 minuty',
  maxLevel: 8,
  howTo: ['Krok 1', 'Krok 2'],                         // nebo funkce (level) => [...]
  async run(ctx) {
    // ctx.level, ctx.stage, ctx.foot, ctx.status(text), ctx.progress(text),
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

1. **Vyzkoušet s 5 až 8 seniory** různého věku. Sledovat, jestli rozumí pokynům, jak zvládají dotyk a co je frustruje. Doladit úroveň 1 všech her.
2. **Denní připomínka**: v Capacitoru jako lokální notifikace, na webu jako Web Push (iOS 16.4+, jen pro aplikaci na ploše).
3. **Další hry**: počítání peněz v korunách, slovní hry (doplňte slovo, protiklady), jména a tváře, orientace v kalendáři a na mapě.
4. **Pohyb a společnost** podle FINGER: tip na procházku nebo cvičení dne, společné hraní s vnoučaty.
5. **Přístupnost**: projít s VoiceOverem, alternativa Barev a slov pro barvoslepé.
6. **Rodinný přehled** (se souhlasem): sdílení pokroku s blízkými. Vyžaduje server a řešení GDPR.
