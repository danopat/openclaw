/* Svěží mysl — první spuštění, nastavení a stránka O tréninku. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const E = SM.engine;
  const store = SM.store;
  const ui = SM.ui;

  function segmented(name, label, options, value, onChange) {
    return h('div', { class: 'seg', role: 'radiogroup', 'aria-label': label }, options.map((o) => {
      const input = h('input', { type: 'radio', name: name, id: name + '-' + o.value, value: String(o.value) });
      input.checked = String(value) === String(o.value);
      input.addEventListener('change', () => { if (input.checked) onChange(o.value); });
      return h('label', { for: name + '-' + o.value }, input, h('span', null, o.label));
    }));
  }
  function goalPicker(name, onChange) {
    const cur = E.goal();
    return h('div', { class: 'goal-pick', role: 'radiogroup', 'aria-label': 'Denní cíl' }, E.GOALS.map((g) => {
      const input = h('input', { type: 'radio', name: name, id: name + '-' + g.xp, value: String(g.xp) });
      input.checked = cur === g.xp;
      input.addEventListener('change', () => { if (input.checked) onChange(g.xp); });
      return h('label', { for: name + '-' + g.xp }, input, h('span', null,
        h('strong', null, g.name), h('span', null, g.xp + ' bodů · ' + g.time)));
    }));
  }
  const switchRow = ui.switchRow;
  const SCALES = [{ value: 1, label: 'Běžné' }, { value: 2, label: 'Větší' }, { value: 3, label: 'Největší' }];

  /* ---------- První spuštění ---------- */
  SM.screens.onboarding = function (step) {
    step = step || 1;
    const page = h('main', { class: 'page onboarding' });
    if (step === 1) {
      page.appendChild(h('div', { class: 'ob-hero' }, U.svg(SM.icons.logo, 'ob-logo'),
        h('h1', null, 'Vítejte ve Svěží mysli'),
        h('p', null, 'Krátké hry na paměť, postřeh, slova a počty. Každý den pár minut, v klidu a bez stresu.')));
      page.appendChild(h('section', { class: 'setting' },
        h('h2', null, 'Čte se vám písmo dobře?'),
        h('p', null, 'Vyberte velikost, která je vám příjemná. Změnit ji můžete i později v nastavení.'),
        segmented('ob-scale', 'Velikost písma', SCALES, store.settings().scale || 1, (v) => { store.setSetting('scale', v); ui.applySettings(); })));
      page.appendChild(h('div', { class: 'intro-actions' },
        h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => SM.screens.onboarding(2) }, 'Pokračovat')));
    } else {
      page.appendChild(h('div', { class: 'ob-hero' },
        h('h1', null, 'Kolik času denně?'),
        h('p', null, 'Za každou hru dostanete body. Vyberte si denní cíl. Zvládnete-li ho, splníte svůj dnešní trénink.')));
      page.appendChild(goalPicker('ob-goal', (v) => E.setGoal(v)));
      page.appendChild(h('div', { class: 'ob-how' },
        h('h2', null, 'Jak to funguje'),
        h('ul', null,
          h('li', null, ui.icon('map'), h('span', null, 'Vydáte se na cestu po Česku. Každá zastávka má několik krátkých lekcí.')),
          h('li', null, ui.icon('postcard'), h('span', null, 'Za dokončenou zastávku získáte pohlednici a nové hry.')),
          h('li', null, ui.icon('flame'), h('span', null, 'Hrajte každý den a vaše série dní poroste.')))));
      page.appendChild(h('div', { class: 'intro-actions' },
        h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => {
          store.profile().onboarded = true;
          store.save();
          ui.go('');
        } }, ui.icon('play'), 'Vydat se na cestu')));
    }
    ui.setScreen(page);
  };

  /* ---------- Nastavení ---------- */
  function viewSettings() {
    const s = store.settings();
    const page = h('main', { class: 'page' });
    page.appendChild(ui.topbar('Zpět', () => ui.go(ui.lastTab || '')));
    page.appendChild(h('h1', { class: 'page-title' }, 'Nastavení'));
    const box = h('div', { class: 'settings' });
    box.appendChild(h('section', { class: 'setting' },
      h('h2', null, 'Denní cíl'),
      goalPicker('set-goal', (v) => { E.setGoal(v); ui.announce('Denní cíl: ' + v + ' bodů'); })));
    box.appendChild(h('section', { class: 'setting' },
      h('h2', null, 'Velikost písma'),
      segmented('scale', 'Velikost písma', SCALES, s.scale || 1, (v) => { store.setSetting('scale', v); ui.applySettings(); }),
      h('p', { class: 'sample-text' }, 'Ukázka: Dobré ráno! Dnes vás čeká krátká lekce.')));
    box.appendChild(h('section', { class: 'setting' },
      h('h2', null, 'Vzhled'),
      segmented('theme', 'Vzhled', [
        { value: 'auto', label: 'Podle zařízení' }, { value: 'light', label: 'Světlý' }, { value: 'dark', label: 'Tmavý' }
      ], s.theme || 'auto', (v) => { store.setSetting('theme', v); ui.applySettings(); })));
    box.appendChild(h('section', { class: 'setting' },
      switchRow('set-sound', 'Zvuky', 'Jemné tóny při správné a chybné odpovědi.', s.sound !== false, (v) => {
        store.setSetting('sound', v);
        if (v) SM.sound.correct();
      })));
    if (SM.sound.canSpeak) {
      box.appendChild(h('section', { class: 'setting' },
        switchRow('set-speak', 'Předčítat pokyny', 'U nové hry se pokyny přečtou nahlas.', !!s.autoSpeak, (v) => {
          store.setSetting('autoSpeak', v);
          if (v) SM.sound.speak('Pokyny budu předčítat nahlas.');
        })));
    }
    const resetBtn = h('button', { class: 'btn btn-secondary btn-block', type: 'button' }, 'Smazat všechny výsledky');
    resetBtn.addEventListener('click', () => {
      ui.dialog('Smazat všechny výsledky?', 'Smaže se cesta, body, série, pohlednice, odznaky i historie her. Nastavení zůstane. Tento krok nejde vrátit.', [
        { label: 'Ponechat výsledky', value: false, kind: 'primary' },
        { label: 'Smazat', value: true, kind: 'danger' }
      ]).then((yes) => {
        if (!yes) return;
        store.reset();
        ui.announce('Výsledky byly smazány.');
        resetBtn.textContent = 'Výsledky jsou smazané';
        resetBtn.disabled = true;
      });
    });
    box.appendChild(h('section', { class: 'setting' },
      h('h2', null, 'Moje data'),
      h('p', null, 'Výsledky se ukládají jen v tomto zařízení. Nikam se neodesílají a nikdo jiný je nevidí.'),
      resetBtn));
    page.appendChild(box);
    ui.setScreen(page);
  }
  ui.views.nastaveni = viewSettings;

  /* ---------- O tréninku ---------- */
  function viewAbout() {
    const page = h('main', { class: 'page' });
    page.appendChild(ui.topbar('Zpět', () => ui.go(ui.lastTab || '')));
    const p = (t) => h('p', null, t);
    const li = (b, t) => h('li', null, h('strong', null, b), ' ' + t);
    page.appendChild(h('article', { class: 'prose' },
      h('h1', null, 'O tréninku'),
      p('Svěží mysl nabízí ' + Object.keys(SM.games).length + ' krátkých her v pěti oblastech. Obtížnost každé hry se sama přizpůsobuje: když se daří, hra přitvrdí, když ne, uleví. Trénink má být trochu náročný, ale nemá stresovat.'),
      h('h2', null, 'Pět oblastí'),
      h('ul', { class: 'domain-legend' }, ui.DOMAINS.map((d) => h('li', { class: 'dom-' + d.id }, h('span', { class: 'dom-dot' }),
        h('span', null, h('strong', null, d.name + ': '), d.desc.toLowerCase() + '.')))),
      h('h2', null, 'Jak funguje cesta'),
      h('ul', null,
        li('Lekce:', 'tři krátké hry za sebou, asi 5 minut. Každá zastávka vás seznámí s novými hrami.'),
        li('Body:', '5 až 10 za každou hru podle výkonu, 5 za dokončenou lekci a 5 navíc za lekci bez chyby.'),
        li('Denní cíl:', 'kolik bodů chcete denně získat. Nastavíte ho v Nastavení.'),
        li('Série:', 'počet dní za sebou, kdy si zahrajete. Záchranný den ji podrží, když jeden den vynecháte.'),
        li('Sbírka:', 'za každou zastávku pohlednice, za vytrvalost a pokroky odznaky.')),
      h('h2', null, 'Jak trénovat'),
      h('ul', null,
        li('Pravidelně:', 'ideálně 10 až 15 minut denně, alespoň pětkrát týdně.'),
        li('V klidu:', 'hrajte, když jste odpočatí, v tichu a s brýlemi na čtení, pokud je nosíte.'),
        li('Bez stresu:', 'chyby k tréninku patří. Důležité je vracet se k němu.')),
      h('h2', null, 'Co mysli pomáhá ještě víc'),
      p('Na duševní svěžest ve stáří má velký vliv celý životní styl. Trénink v aplikaci je jen jedna jeho část:'),
      h('ul', null,
        li('Pohyb:', 'každodenní chůze, cvičení nebo práce na zahradě.'),
        li('Lidé kolem vás:', 'rozhovory, návštěvy, spolky, hry s vnoučaty.'),
        li('Sluch a zrak:', 'nechte si je zkontrolovat a používejte naslouchátko nebo brýle, pokud je potřebujete.'),
        li('Zdraví srdce a cév:', 'krevní tlak, cukr a cholesterol pod kontrolou, nekouřit a s alkoholem střídmě.'),
        li('Spánek a nové věci:', 'dostatek spánku a chuť učit se něco nového, třeba jazyk nebo hudební nástroj.')),
      h('div', { class: 'note-box' },
        h('p', null, h('strong', null, 'Upozornění. '), 'Svěží mysl je tréninková aplikace, ne zdravotnický prostředek. Nic nediagnostikuje ani neléčí a nenahrazuje vyšetření. Pokud si vy nebo vaši blízcí všimnete, že se paměť nebo orientace zhoršuje, poraďte se s praktickým lékařem.'),
        h('p', null, 'Všechny výsledky zůstávají jen v tomto zařízení.')),
      h('div', { class: 'intro-actions' },
        h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => ui.go('') }, ui.icon('map'), 'Na cestu'))));
    ui.setScreen(page);
  }
  ui.views['o-treninku'] = viewAbout;
})();
