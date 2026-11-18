/* Svěží mysl — Sbírka: pohlednice ze zastávek a odznaky. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const E = SM.engine;
  const store = SM.store;
  const ui = SM.ui;

  /** Pohlednice (líc): ilustrace + „Pozdrav z …“. */
  SM.screens.postcard = function (u, big) {
    const unit = E.UNITS[u];
    return h('figure', { class: 'postcard' + (big ? ' is-big' : ''), style: { '--unit': unit.color } },
      h('div', { class: 'postcard-img', html: SM.places.scene(unit.id) }),
      h('figcaption', null, h('span', { class: 'postcard-greet' }, /^[sszšžSZŠŽ]/.test(unit.gen) ? 'Pozdrav ze' : 'Pozdrav z'), h('strong', null, unit.gen)));
  };

  SM.screens.postcardModal = function (u) {
    const unit = E.UNITS[u];
    const got = store.profile().postcards[unit.id];
    const content = [
      SM.screens.postcard(u, true),
      h('h2', { id: 'modal-title' }, unit.name),
      h('p', null, unit.fact),
      got ? h('p', { class: 'postcard-date' }, 'Získáno ' + U.shortDate(U.parseDayKey(got)) + ' ' + U.parseDayKey(got).getFullYear() + ' · zastávka ' + (u + 1)) : null
    ];
    const actions = [{ label: 'Zavřít', value: 'x', kind: 'primary' }];
    if (SM.sound.canSpeak) actions.push({ label: 'Přečíst nahlas', value: 'speak', icon: 'speaker' });
    ui.modal(content, actions).then((v) => { if (v === 'speak') { SM.sound.speak(unit.name + '. ' + unit.fact); SM.screens.postcardModal(u); } });
  };

  /** Medaile odznaku; tečky pod ní ukazují dosažený stupeň. */
  SM.screens.medal = function (b, tier, big) {
    return h('div', { class: 'medal' + (tier ? ' is-on' : '') + (big ? ' is-big' : '') },
      h('span', { class: 'medal-disc' }, ui.icon(b.icon)),
      h('span', { class: 'medal-dots', 'aria-label': 'Stupeň ' + tier + ' z ' + b.tiers.length },
        b.tiers.map((_, i) => h('i', { class: i < tier ? 'is-on' : '' }))));
  };

  function viewCollection() {
    const p = store.profile();
    const page = h('main', { class: 'page' });
    const owned = Object.keys(p.postcards).length;
    page.appendChild(h('div', { class: 'path-intro' },
      h('h1', null, 'Sbírka'),
      h('p', null, 'Pohlednice získáte za dokončené zastávky na cestě, odznaky za vytrvalost a pokroky.')));

    page.appendChild(h('h2', { class: 'section-title' }, 'Pohlednice', h('small', null, owned + ' z ' + E.UNITS.length)));
    const grid = h('ul', { class: 'cards-grid' });
    E.UNITS.forEach((unit, u) => {
      if (p.postcards[unit.id]) {
        grid.appendChild(h('li', null, h('button', { class: 'card-btn', type: 'button', 'aria-label': 'Pohlednice ' + unit.name, onclick: () => SM.screens.postcardModal(u) },
          SM.screens.postcard(u))));
      } else {
        grid.appendChild(h('li', null, h('div', { class: 'postcard is-missing' },
          h('div', { class: 'postcard-img' }, ui.icon('lock')),
          h('p', { class: 'missing-txt' }, h('strong', null, unit.name), h('span', null, 'Zastávka ' + (u + 1))))));
      }
    });
    page.appendChild(grid);

    const earned = E.BADGES.reduce((s, b) => s + (p.badges[b.id] || 0), 0);
    const all = E.BADGES.reduce((s, b) => s + b.tiers.length, 0);
    page.appendChild(h('h2', { class: 'section-title' }, 'Odznaky', h('small', null, earned + ' z ' + all + ' stupňů')));
    const list = h('ul', { class: 'badge-list' });
    E.BADGES.forEach((b) => {
      const tier = p.badges[b.id] || 0;
      const v = b.value();
      const next = b.tiers[tier];
      list.appendChild(h('li', { class: 'badge-row' },
        SM.screens.medal(b, tier),
        h('div', { class: 'badge-txt' },
          h('strong', null, b.name + (tier ? ' · ' + tier + '. stupeň' : '')),
          h('span', null, next != null ? 'Další: ' + b.text(next) : 'Všechny stupně splněny. Gratulujeme!'),
          next != null ? h('div', { class: 'gp-meter' },
            h('div', { class: 'meter', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': String(next), 'aria-valuenow': String(Math.min(v, next)), 'aria-label': b.name },
              h('i', { style: { width: (Math.min(1, v / next) * 100).toFixed(1) + '%' } })),
            h('span', { class: 'meter-label' }, Math.min(v, next) + ' / ' + next)) : null)));
    });
    page.appendChild(list);
    ui.setScreen(page, { tab: 'sbirka' });
  }
  ui.views.sbirka = viewCollection;
})();
