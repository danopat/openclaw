/* Vyšší, nebo nižší? — uhodnout myšlené číslo nebo den co nejméně pokusy (plánování a strategie půlení). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* grid = čísla jako tlačítka, cal = den v kalendáři, pad = číslo na klávesnici. limit = nejvýš tolik pokusů. */
  const LEVELS = [
    { kind: 'grid', max: 20 },
    { kind: 'cal' },
    { kind: 'pad', max: 50 },
    { kind: 'pad', max: 100 },
    { kind: 'pad', max: 100, limit: 7 }
  ];
  const MONTH = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
  const MONTH_IN = ['v lednu', 'v únoru', 'v březnu', 'v dubnu', 'v květnu', 'v červnu', 'v červenci', 'v srpnu', 'v září', 'v říjnu', 'v listopadu', 'v prosinci'];
  const MONTH_GEN = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
  const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const pl = U.plural;
  const best = (n) => Math.ceil(Math.log2(n + 1));

  SM.registerGame({
    id: 'hadani',
    name: 'Vyšší, nebo nižší?',
    domain: 'rozhodovani',
    trains: 'plánování a chytrou strategii s co nejméně pokusy',
    short: 'Uhodněte myšlené číslo.',
    duration: 'asi 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const what = L.kind === 'cal' ? 'jeden den v měsíci' : 'číslo od 1 do ' + L.max;
      const steps = [
        'Myslím si ' + what + '. Zkuste ho uhodnout.',
        L.kind === 'pad' ? 'Tip napište na klávesnici a klepněte na „Tipnout“.' : 'Tipněte klepnutím na ' + (L.kind === 'cal' ? 'den v kalendáři.' : 'číslo.'),
        L.kind === 'cal' ? 'Po každém tipu se dozvíte, jestli je to dříve, nebo později.' : 'Po každém tipu se dozvíte, jestli je hledané číslo větší, nebo menší.',
        'Snažte se o co nejméně pokusů. Pomůže tipovat doprostřed toho, co zbývá.'
      ];
      if (L.limit) steps.push('Máte nejvýš ' + L.limit + ' pokusů.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 2 : 3;
      const scores = [];
      const tries = [];
      for (let i = 0; i < N; i++) {
        ctx.progress((i + 1) + ' / ' + N);
        const r = await round(ctx, L, i);
        scores.push(r.found ? Math.min(1, r.best / r.tries) : 0);
        tries.push(r.tries);
      }
      const perf = U.mean(scores);
      const avg = U.mean(tries);
      ctx.finish({
        perf: perf, levelDelta: perf >= 0.85 ? 1 : perf < 0.55 ? -1 : 0,
        big: U.num(avg, 1), bigLabel: 'pokusu v průměru na jedno ' + (L.kind === 'cal' ? 'datum' : 'číslo'),
        details: ['Tip: tipujte vždy doprostřed toho, co zbývá. U čísel od 1 do 100 pak stačí nejvýš 7 pokusů.'],
        metric: { tries: Math.round(avg * 10) / 10 }
      });
    }
  });

  /* Jedno hádání. Vrací { found, tries, best }. */
  async function round(ctx, L, idx) {
    const now = new Date();
    const month = L.kind === 'cal' ? U.randInt(0, 11) : 0;
    const year = now.getFullYear();
    const max = L.kind === 'cal' ? new Date(year, month + 1, 0).getDate() : L.max;
    const secret = U.randInt(1, max);
    const optimum = best(max);
    let lo = 1;
    let hi = max;
    let tries = 0;
    let turn = 0;

    ctx.clear();
    const hint = h('p', { class: 'guess-hint', 'aria-live': 'polite' });
    const root = h('div', { class: 'guess is-' + L.kind, 'data-kind': L.kind, 'data-round': idx, 'data-state': 'wait' }, hint);
    const setRange = () => { root.setAttribute('data-lo', lo); root.setAttribute('data-hi', hi); root.setAttribute('data-turn', turn); };
    const dayText = (d) => d + '. ' + MONTH_GEN[month];
    const ask = L.kind === 'cal' ? 'Myslím si jeden den ' + MONTH_IN[month] + '. Který?' : 'Myslím si číslo od 1 do ' + max + '. Které?';
    ctx.status(ask);
    hint.textContent = L.limit ? 'Máte ' + L.limit + ' pokusů.' : 'Tipněte si.';

    /* Tlačítka čísel nebo dnů. */
    const buttons = {};
    let pick = null;
    function numButton(v, label) {
      const b = h('button', { class: 'btn guess-num', type: 'button', 'data-v': v, 'aria-label': label }, String(v));
      U.tap(b, () => { if (pick && !b.disabled) { const f = pick; pick = null; f(v); } });
      buttons[v] = b;
      return b;
    }
    let board = null;
    let line = null;
    if (L.kind === 'grid') {
      board = h('div', { class: 'guess-grid' });
      for (let v = 1; v <= max; v++) board.appendChild(numButton(v, 'číslo ' + v));
    } else if (L.kind === 'cal') {
      board = h('div', { class: 'cal' },
        h('p', { class: 'cal-title' }, MONTH[month] + ' ' + year),
        h('div', { class: 'cal-grid' },
          DAYS.map((d) => h('span', { class: 'cal-dow', 'aria-hidden': 'true' }, d)),
          Array.from({ length: (new Date(year, month, 1).getDay() + 6) % 7 }, () => h('span', { class: 'cal-pad' })),
          Array.from({ length: max }, (_, k) => numButton(k + 1, dayText(k + 1)))));
    } else {
      line = h('div', { class: 'nline', 'aria-hidden': 'true' }, h('span', { class: 'nline-range' }));
      board = h('div', { class: 'guess-pad' }, line,
        h('div', { class: 'nline-ends', 'aria-hidden': 'true' }, h('span', null, '1'), h('span', null, String(max))),
        h('p', { class: 'nline-text' }));
    }
    root.appendChild(board);
    ctx.stage.appendChild(root);

    function render() {
      Object.keys(buttons).forEach((k) => {
        const v = +k;
        const out = v < lo || v > hi;
        buttons[k].disabled = out;
        buttons[k].classList.toggle('is-out', out);
      });
      if (line) {
        const range = line.firstChild;
        range.style.left = ((lo - 1) / max * 100) + '%';
        range.style.width = ((hi - lo + 1) / max * 100) + '%';
        board.querySelector('.nline-text').textContent = lo === hi ? 'Zbývá jen ' + lo + '.' : 'Zbývá: od ' + lo + ' do ' + hi;
      }
      setRange();
    }

    function getGuess() {
      return new Promise((resolve) => {
        root.setAttribute('data-state', 'play');
        if (L.kind === 'pad') {
          const old = board.querySelector('.kp');
          if (old) old.remove();
          K.keypad(ctx, { max: String(max).length, okLabel: 'Tipnout', container: board }).then((val) => {
            root.setAttribute('data-state', 'wait');
            resolve(parseInt(val, 10));
          });
        } else {
          pick = (v) => { root.setAttribute('data-state', 'wait'); resolve(v); };
        }
      });
    }

    render();
    let found = false;
    while (ctx.alive) {
      const g = await getGuess();
      if (!(g >= 1 && g <= max)) {
        hint.textContent = 'Zadejte číslo od 1 do ' + max + '.';
        continue;
      }
      tries++;
      turn++;
      if (g === secret) {
        found = true;
        if (buttons[g]) buttons[g].classList.add('is-hit');
        ctx.feedback(true);
        break;
      }
      ctx.sound.tap();
      const known = g < lo || g > hi;
      if (g < secret) lo = Math.max(lo, g + 1); else hi = Math.min(hi, g - 1);
      if (buttons[g]) buttons[g].classList.add('is-tried');
      hint.textContent = '';
      if (known) hint.appendChild(document.createTextNode('To už víme. '));
      if (L.kind === 'cal') hint.append(h('strong', null, g < secret ? 'Později' : 'Dříve'), ' než ' + dayText(g) + '.');
      else hint.append(h('strong', null, g < secret ? 'Víc' : 'Méně'), ' než ' + g + '.');
      render();
      if (L.limit && tries >= L.limit) break;
      if (L.limit) ctx.status(ask + ' Zbývá ' + (L.limit - tries) + ' ' + pl(L.limit - tries, 'pokus', 'pokusy', 'pokusů') + '.');
    }
    root.setAttribute('data-state', 'done');
    if (!ctx.alive) return { found: false, tries: tries, best: optimum };
    const what = L.kind === 'cal' ? dayText(secret) : String(secret);
    if (found) {
      ctx.status('Uhodnuto na ' + tries + '. pokus! Bylo to ' + what + '.');
      hint.textContent = tries <= optimum ? 'Skvělá strategie.' : 'S tipováním doprostřed by stačilo nejvýš ' + optimum + ' ' + pl(optimum, 'pokus', 'pokusy', 'pokusů') + '.';
    } else {
      ctx.feedback(false);
      ctx.status('Pokusy došly. Hledané číslo bylo ' + what + '.');
      hint.textContent = 'S tipováním doprostřed stačí nejvýš ' + optimum + ' pokusů.';
    }
    if (L.kind === 'pad') { const kp = board.querySelector('.kp'); if (kp) kp.remove(); }
    await ctx.sleep(found && tries <= optimum ? 1600 : 2800);
    return { found: found, tries: tries, best: optimum };
  }
})();
