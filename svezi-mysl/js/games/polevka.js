/* Písmenková polévka — z rozházených písmen poskládat slova na dané téma; použijí se všechna písmena (práce se slovy, plánování). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Témata: zadání (2. pád množného čísla) a slova. Žádné slovo není začátkem jiného ve stejném tématu. */
  const THEMES = [
    ['barev', ['BÍLÁ', 'ČERNÁ', 'MODRÁ', 'ŽLUTÁ', 'ZELENÁ', 'HNĚDÁ', 'ŠEDÁ', 'RŮŽOVÁ']],
    ['zvířat', ['PES', 'KOČKA', 'KRÁVA', 'KOZA', 'OVCE', 'KŮŇ', 'LIŠKA', 'VLK', 'SOVA', 'ZAJÍC', 'MYŠ', 'HUSA']],
    ['květin', ['RŮŽE', 'MÁK', 'LILIE', 'FIALKA', 'TULIPÁN', 'NARCIS', 'ASTRA', 'CHRPA']],
    ['druhů ovoce', ['JABLKO', 'HRUŠKA', 'ŠVESTKA', 'MERUŇKA', 'TŘEŠEŇ', 'BANÁN', 'KIWI', 'MALINA']],
    ['měst', ['PRAHA', 'BRNO', 'PLZEŇ', 'ZLÍN', 'MOST', 'CHEB', 'TELČ', 'KOLÍN', 'TÁBOR', 'OPAVA']],
    ['sportů', ['TENIS', 'HOKEJ', 'FOTBAL', 'GOLF', 'BOX', 'JÓGA', 'ŠACHY', 'BĚH']],
    ['stromů', ['DUB', 'BUK', 'LÍPA', 'BŘÍZA', 'JAVOR', 'SMRK', 'JEDLE', 'VRBA', 'TOPOL']],
    ['věcí v kuchyni', ['HRNEC', 'PÁNEV', 'TALÍŘ', 'MISKA', 'LŽÍCE', 'NŮŽ', 'HRNEK', 'MÍSA']]
  ].map((t) => ({ what: t[0], words: t[1] }));

  /* words = kolik slov, maxLen = nejdelší slovo (kratší slova jsou snazší). */
  /* letters = nejvýš písmen v talíři, aby se vešel i na menší telefon. */
  const LEVELS = [
    { words: 2, maxLen: 5, letters: 10 },
    { words: 3, maxLen: 5, letters: 14 },
    { words: 4, maxLen: 6, letters: 19 },
    { words: 5, maxLen: 6, letters: 23 },
    { words: 6, maxLen: 7, letters: 27 }
  ];
  const plural = (n) => (n === 1 ? 'slovo' : n < 5 ? 'slova' : 'slov');

  /* Vybere slova tak, aby žádné nebylo začátkem jiného. */
  function pickWords(L, count) {
    for (let t = 0; t < 200; t++) {
      const th = U.pick(THEMES);
      const pool = th.words.filter((w) => w.length <= L.maxLen);
      if (pool.length < count) continue;
      const words = U.sample(pool, count);
      if (words.join('').length > L.letters) continue;
      if (words.some((a) => words.some((b) => a !== b && b.indexOf(a) === 0))) continue;
      return { what: th.what, words: words };
    }
    return { what: THEMES[0].what, words: THEMES[0].words.slice(0, count) };
  }

  SM.registerGame({
    id: 'polevka',
    name: 'Písmenková polévka',
    domain: 'slova',
    trains: 'práci se slovy a plánování',
    short: 'Poskládejte z písmen slova na dané téma.',
    duration: 'asi 2 až 3 minuty',
    pace: { per: 'na slovo' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      return [
        'V talíři plavou rozházená písmena. Dohromady z nich jde poskládat ' + L.words + ' ' + plural(L.words) + ' na jedno téma, třeba barvy.',
        'Klepáním na písmena skládejte slovo. Když je celé, samo se zapíše a jeho písmena z talíře zmizí.',
        'Spletené písmeno vrátíte tlačítkem „Vrátit písmeno“. Nápověda ukáže první písmeno dalšího slova.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const count = ctx.short ? Math.min(L.words, 3) : L.words;
      const pz = pickWords(L, count);
      const t0 = performance.now();
      const res = await play(pz);
      const ms = (performance.now() - t0) / SM.timeScale;
      const acc = res.clean / pz.words.length;
      ctx.finish({
        perf: acc, acc: acc, rt: ms / pz.words.length,
        levelDelta: acc >= 0.85 && res.hints <= 1 ? 1 : acc < 0.5 ? -1 : 0,
        big: res.clean + ' z ' + pz.words.length, bigLabel: 'slov složených bez nápovědy',
        details: ['Čas: ' + U.fmtTime(ms)].concat(res.hints ? ['Nápověda: ' + res.hints + '×'] : []),
        metric: { words: pz.words.length, clean: res.clean, hints: res.hints }
      });

      function play(pz) {
        return new Promise((resolve) => {
          const letters = U.shuffle(pz.words.join('').split('')).map((ch, i) => ({ ch: ch, i: i, used: false }));
          const found = {};
          const hinted = {};
          const picked = [];
          let hints = 0;
          let finished = false;
          ctx.clear();
          ctx.status('Najděte ' + pz.words.length + ' ' + pz.what + '.');
          const slots = {};
          const list = h('div', { class: 'soup-words', 'aria-label': 'Slova k poskládání' }, pz.words.map((w) => {
            const el = h('span', { class: 'soup-word', 'data-len': w.length, 'data-w': w, 'aria-label': w.length + ' písmen' }, '_'.repeat(w.length));
            slots[w] = el;
            return el;
          }));
          const spoon = h('div', { class: 'soup-spoon', 'aria-live': 'polite' });
          const back = h('button', { class: 'btn btn-secondary btn-small soup-back', type: 'button', disabled: true, 'aria-label': 'Vrátit písmeno' }, SM.ui.icon('back'), 'Vrátit');
          const plate = h('div', { class: 'soup-plate' });
          const tiles = letters.map((l) => {
            const b = h('button', { class: 'soup-l', type: 'button', 'data-ch': l.ch, style: { transform: 'rotate(' + U.randInt(-12, 12) + 'deg)' } }, l.ch);
            U.tap(b, () => pick(l, b));
            plate.appendChild(b);
            return b;
          });
          ctx.stage.appendChild(h('div', { class: 'stack polevka' }, list, h('div', { class: 'soup-row' }, spoon, back), plate));
          const hintBtn = h('button', { class: 'btn btn-secondary soup-hint', type: 'button' }, 'Nápověda');
          U.tap(back, undo);
          U.tap(hintBtn, hint);
          ctx.foot.appendChild(hintBtn);
          const update = () => ctx.progress('Složeno ' + Object.keys(found).length + ' z ' + pz.words.length);
          update();
          drawSpoon();
          fitTiles();

          /* Velikost písmen v talíři podle zbylého místa (malý displej, velké písmo). */
          function fitTiles() {
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
            const cs = getComputedStyle(plate); // okraje a mezery talíře (na telefonu s největším písmem menší)
            const padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
            const padH = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
            const sg = parseFloat(getComputedStyle(plate.parentNode).rowGap) || 0.9 * rem;
            const avail = ctx.stage.clientHeight - list.offsetHeight - spoon.parentNode.offsetHeight - 2 * sg - 16;
            const W = Math.min(ctx.stage.clientWidth, 26 * rem) - padH;
            const g = parseFloat(cs.rowGap) || 0.45 * rem;
            let size = Math.max(30, 1.6 * rem);
            for (let sz = 2.7 * rem; sz >= Math.max(30, 1.6 * rem); sz -= 1) {
              const cols = Math.max(1, Math.floor((W + g) / (sz + g)));
              const rows = Math.ceil(letters.length / cols);
              if (rows * (sz + g) - g + padV <= avail) { size = sz; break; }
            }
            plate.style.setProperty('--ls', Math.floor(size) + 'px');
          }

          const remaining = () => pz.words.filter((w) => !found[w]);
          function drawSpoon() {
            spoon.textContent = '';
            if (!picked.length) spoon.appendChild(h('span', { class: 'sr-only' }, 'Zatím žádná písmena'));
            picked.forEach((p) => spoon.appendChild(h('span', { class: 'soup-pick' }, p.l.ch)));
            back.disabled = !picked.length || finished;
          }
          function pick(l, b) {
            if (finished || l.used || !ctx.alive) return;
            l.used = true;
            b.classList.add('is-used');
            b.disabled = true;
            picked.push({ l: l, b: b });
            ctx.sound.tap();
            drawSpoon();
            const word = picked.map((p) => p.l.ch).join('');
            const hit = remaining().find((w) => w === word);
            if (hit) { accept(hit); return; }
            const longest = Math.max.apply(null, remaining().map((w) => w.length));
            if (word.length >= longest) {
              ctx.sound.wrong();
              spoon.classList.remove('is-shake');
              void spoon.offsetWidth;
              spoon.classList.add('is-shake');
              ctx.status('Takové slovo tu není. Písmena vracím do talíře.');
              ctx.after(700, () => { while (picked.length) undo(true); drawSpoon(); });
            }
          }
          function undo(quiet) {
            if (finished || !picked.length) return;
            const p = picked.pop();
            p.l.used = false;
            p.b.classList.remove('is-used');
            p.b.disabled = false;
            if (quiet !== true) { ctx.sound.tap(); drawSpoon(); }
          }
          function accept(w) {
            found[w] = hinted[w] ? 'hint' : 'ok';
            picked.forEach((p) => { p.b.classList.add('is-gone'); p.b.setAttribute('aria-hidden', 'true'); });
            picked.length = 0;
            slots[w].textContent = w;
            slots[w].classList.add('is-found');
            ctx.sound.correct();
            ctx.status('Ano, ' + w + '!');
            update();
            drawSpoon();
            fitTiles(); // složené slovo je větším písmem a seznam se může protáhnout
            if (!remaining().length) {
              finished = true;
              back.disabled = true;
              hintBtn.disabled = true;
              ctx.feedback(true, { silent: true });
              ctx.status('Talíř je prázdný. Výborně!');
              ctx.sleep(1200).then(() => resolve({ clean: pz.words.filter((x) => found[x] === 'ok').length, hints: hints }));
            }
          }
          function hint() {
            if (finished || !ctx.alive) return;
            // Nejdřív dokončit slovo, ke kterému už první nápověda byla, jinak napovědět další.
            const w = remaining().find((x) => hinted[x]) || remaining()[0];
            if (!w) return;
            hints++;
            if (hinted[w]) {
              // Druhá nápověda ke stejnému slovu: ukáže ho celé a poskládá.
              while (picked.length) undo(true);
              w.split('').forEach((ch) => {
                const l = letters.find((x) => !x.used && x.ch === ch);
                l.used = true;
                tiles[l.i].classList.add('is-used');
                picked.push({ l: l, b: tiles[l.i] });
              });
              accept(w);
              ctx.status('Tady je: ' + w + '.');
              return;
            }
            hinted[w] = true;
            slots[w].textContent = w.charAt(0) + '_'.repeat(w.length - 1);
            slots[w].classList.add('is-hinted');
            ctx.sound.tap();
            ctx.status('Jedno slovo začíná na ' + w.charAt(0) + '. Další nápověda ho poskládá celé.');
            fitTiles();
          }
        });
      }
    }
  });
})();
