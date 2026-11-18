/* Tajná šifra — slovo zašifrované posunem v abecedě (každé písmeno o pár míst dál). Hráč ho rozluští
   (pracovní paměť, práce s abecedou). Na nižších úrovních je posun známý, na vyšších se hledá kolečkem. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const ABC_CZ = ['A', 'Á', 'B', 'C', 'Č', 'D', 'Ď', 'E', 'É', 'Ě', 'F', 'G', 'H', 'I', 'Í', 'J', 'K', 'L', 'M', 'N', 'Ň', 'O', 'Ó', 'P', 'Q', 'R', 'Ř', 'S', 'Š', 'T', 'Ť', 'U', 'Ú', 'Ů', 'V', 'W', 'X', 'Y', 'Ý', 'Z', 'Ž'];
  /* Témata se slovy bez háčků a čárek (pro základní abecedu) a se všemi písmeny (poslední úroveň). */
  const THEMES = [
    ['Ptáci', ['SOVA', 'HUSA', 'SOKOL', 'VRABEC', 'DROZD', 'STRAKA', 'HOLUB', 'KOHOUT', 'KACHNA', 'DATEL', 'KOS'], ['SÝKORA', 'VRÁNA', 'LABUŤ', 'SLAVÍK', 'ČÁP', 'ČÍŽEK', 'PĚNKAVA', 'SKŘIVAN']],
    ['Květiny', ['LILIE', 'NARCIS', 'ASTRA', 'FIALKA', 'KOPRETINA', 'CHRPA', 'GERBERA', 'ORCHIDEJ'], ['RŮŽE', 'TULIPÁN', 'MÁK', 'JIŘINA', 'MACEŠKA', 'PIVOŇKA', 'SNĚŽENKA', 'KARAFIÁT']],
    ['Česká města', ['PRAHA', 'BRNO', 'OSTRAVA', 'OLOMOUC', 'LIBEREC', 'KLADNO', 'OPAVA', 'JIHLAVA', 'CHEB', 'MOST', 'PARDUBICE'], ['PLZEŇ', 'ZLÍN', 'TÁBOR', 'PÍSEK', 'TELČ', 'KOLÍN', 'TŘEBOŇ', 'PŘEROV']],
    ['Ovoce', ['JABLKO', 'JAHODA', 'MALINA', 'CITRON', 'MELOUN', 'KIWI', 'BROSKEV', 'ANANAS'], ['HRUŠKA', 'ŠVESTKA', 'MERUŇKA', 'TŘEŠEŇ', 'VIŠEŇ', 'BORŮVKA', 'RYBÍZ', 'BANÁN']],
    ['Zvířata', ['PES', 'KOZA', 'OVCE', 'PRASE', 'JELEN', 'SRNA', 'VLK', 'VEVERKA', 'JEZEVEC', 'KUNA', 'OSEL', 'KOHOUT'], ['KOČKA', 'KŮŇ', 'ZAJÍC', 'MEDVĚD', 'JEŽEK', 'KRÁLÍK', 'MORČE', 'KANČ']]
  ];
  /* hint: posun je známý (1 = i s tabulkou, kam se které písmeno posune), wheel: hledá se kolečkem, cz: plná česká abeceda */
  const LEVELS = [
    { shift: [1, 2], hint: 'map', opts: 3, len: [3, 5] },
    { shift: [1, 3], hint: 'abc', opts: 4, len: [4, 6] },
    { shift: [1, 5], wheel: true, len: [4, 7] },
    { shift: [1, 7], wheel: true, cz: true, len: [4, 8] }
  ];

  const enc = (w, s, A) => w.split('').map((ch) => A[(A.indexOf(ch) + s) % A.length]).join('');
  const dec = (w, s, A) => w.split('').map((ch) => A[(A.indexOf(ch) - s + A.length * 9) % A.length]).join('');
  /* Slovo do úlohy: ze základní abecedy bez háčků, nebo (cz) slovo s háčky a čárkami. */
  function pickWord(L) {
    const th = U.pick(THEMES);
    const pool = (L.cz ? th[2] : th[1]).filter((w) => w.length >= L.len[0] && w.length <= L.len[1]);
    return { theme: th, word: pool.length ? U.pick(pool) : U.pick(L.cz ? th[2] : th[1]) };
  }

  SM.registerGame({
    id: 'sifra',
    name: 'Tajná šifra',
    domain: 'slova',
    trains: 'pracovní paměť a práci s abecedou',
    short: 'Rozluštěte slovo, ve kterém je každé písmeno posunuté v abecedě.',
    duration: 'asi 2 minuty',
    pace: { per: 'na slovo' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = ['Slovo je zašifrované: každé písmeno je posunuté o pár míst dál v abecedě. Při posunu o 1 je z A písmeno B, z B písmeno C a tak dál. Po Z se začíná znovu od A.'];
      if (!L.wheel) {
        steps.push(L.hint === 'map' ? 'Posun znáte. Pod šifrou je tabulka: u každého písmene šifry vidíte, co znamená.' : 'Posun znáte. Pomůže abeceda pod šifrou: od každého písmene šifry odpočítejte zpátky.');
        steps.push('Vyberte slovo, které je zašifrované. Všechna slova jsou ze stejného tématu.');
      } else {
        steps.push('Posun neznáte. Otáčejte kolečkem (tlačítka ◀ a ▶), pod šifrou se hned ukazuje, co by znamenala. Až uvidíte smysluplné slovo, dejte „Přečteno“.');
        if (L.cz) steps.push('Abeceda má i písmena s háčky a čárkami: po A je Á, po C je Č a tak dál.');
      }
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const A = L.cz ? ABC_CZ : ABC;
      const N = ctx.short ? 2 : 4;
      let ok = 0;
      const used = {};
      for (let i = 0; i < N; i++) {
        ctx.progress('Šifra ' + (i + 1) + ' z ' + N);
        let t;
        for (let k = 0; k < 20; k++) { t = pickWord(L); if (!used[t.word]) break; }
        used[t.word] = true;
        if (await one(t)) ok++;
      }
      const acc = ok / N;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.75, 0.5),
        big: ok + ' z ' + N, bigLabel: 'šifer rozluštěno',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      function tiles(w, cls) { return h('div', { class: 'sf-word ' + (cls || '') }, w.split('').map((ch) => h('span', { class: 'sf-tile' }, ch))); }
      /* Abecední pás: písmena šifry, u tabulky i s tím, co znamenají. Písmena ze šifry jsou zvýrazněná. */
      function strip(cipher, s, withMap) {
        return h('div', { class: 'sf-strip' + (withMap ? ' is-map' : ''), 'aria-hidden': 'true' }, A.map((ch) => h('span', { class: 'sf-cell' + (cipher.indexOf(ch) !== -1 ? ' is-used' : '') },
          h('b', null, ch), withMap ? h('i', null, dec(ch, s, A)) : null)));
      }

      /* Na malém displeji s velkým písmem: bez řádku s tématem, a když to nestačí, dá se v ploše posunout. */
      function fit(box) {
        box.classList.remove('is-tight');
        box.style.maxHeight = '';
        if (box.scrollHeight > ctx.stage.clientHeight) box.classList.add('is-tight');
        if (box.scrollHeight > ctx.stage.clientHeight) box.style.maxHeight = ctx.stage.clientHeight + 'px';
      }

      async function one(t) {
        const s = U.randInt(L.shift[0], L.shift[1]);
        const cipher = enc(t.word, s, A);
        ctx.clear();
        const box = h('div', { class: 'stack sifra', 'data-word': t.word, 'data-s': s },
          h('p', { class: 'sf-theme' }, 'Téma: ' + t.theme[0]),
          tiles(cipher, 'is-cipher'));
        ctx.stage.appendChild(box);
        const t0 = performance.now();
        let right;
        if (!L.wheel) {
          box.appendChild(h('p', { class: 'sf-rule' }, 'Posun o ' + s + ' (' + A[0] + ' → ' + A[s] + ')'));
          box.appendChild(strip(cipher, s, L.hint === 'map'));
          ctx.status('Které slovo je zašifrované?');
          const pool = t.theme[1].filter((w) => w !== t.word && Math.abs(w.length - t.word.length) <= 1);
          const words = U.shuffle([t.word].concat(U.sample(pool.length >= L.opts - 1 ? pool : t.theme[1].filter((w) => w !== t.word), L.opts - 1)));
          const pr = K.choose(ctx, words.map((w) => ({ value: w, label: w })), { answer: t.word, layout: 'grid', cls: 'sf-opts', noMark: true });
          fit(box);
          const r = await pr;
          right = r.correct;
        } else {
          // Kolečko: posun se hledá, pod šifrou je hned vidět, co by znamenala.
          let cur = 0;
          const prev = tiles(cipher, 'is-plain');
          const num = h('span', { class: 'sf-num' });
          const draw = () => {
            const plain = dec(cipher, cur, A);
            Array.from(prev.children).forEach((el, i) => { el.textContent = plain[i]; });
            num.textContent = 'posun ' + cur;
            box.dataset.cur = cur;
          };
          const turn = (d) => { cur = (cur + d + A.length) % A.length; ctx.sound.tap(); draw(); };
          const less = h('button', { class: 'btn btn-secondary sf-turn', type: 'button', 'aria-label': 'Posun o jedna méně' }, '◀');
          const more = h('button', { class: 'btn btn-secondary sf-turn', type: 'button', 'aria-label': 'Posun o jedna víc' }, '▶');
          U.tap(less, () => { if (!less.disabled) turn(-1); });
          U.tap(more, () => { if (!more.disabled) turn(1); });
          box.appendChild(h('p', { class: 'sf-label' }, 'Znamená:'));
          box.appendChild(prev);
          box.appendChild(h('div', { class: 'sf-wheel' }, less, num, more));
          draw();
          ctx.status('Otáčejte kolečkem, až uvidíte slovo.');
          const nx = K.next(ctx, 'Přečteno');
          fit(box);
          await nx;
          right = dec(cipher, cur, A) === t.word;
          less.disabled = more.disabled = true;
          if (!right) { cur = s; draw(); }
          prev.classList.add(right ? 'is-ok' : 'is-fixed');
          ctx.feedback(right);
        }
        ctx.mark(right, (performance.now() - t0) / SM.timeScale);
        ctx.status((right ? 'Správně! ' : 'Bylo to slovo ') + t.word + ' (posun o ' + s + ').');
        await ctx.sleep(right ? 1300 : 2600);
        return right;
      }
    }
  });
})();
