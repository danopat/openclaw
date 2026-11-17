/* Nákupní seznam — zapamatovat si položky a poznat je mezi jinými (slovní paměť). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;

  const ITEMS = [
    ['🍞', 'chléb'], ['🥛', 'mléko'], ['🧀', 'sýr'], ['🥚', 'vejce'], ['🧈', 'máslo'], ['🍎', 'jablka'], ['🍌', 'banány'],
    ['🍐', 'hrušky'], ['🍇', 'hrozny'], ['🍓', 'jahody'], ['🍒', 'třešně'], ['🍋', 'citrony'], ['🍊', 'pomeranče'],
    ['🍑', 'broskve'], ['🍍', 'ananas'], ['🍉', 'meloun'], ['🥝', 'kiwi'], ['🥕', 'mrkev'], ['🥔', 'brambory'],
    ['🍅', 'rajčata'], ['🥒', 'okurka'], ['🧅', 'cibule'], ['🧄', 'česnek'], ['🥦', 'brokolice'], ['🥬', 'salát'],
    ['🌽', 'kukuřice'], ['🍄', 'houby'], ['🫑', 'paprika'], ['🍚', 'rýže'], ['🍝', 'těstoviny'], ['🐟', 'ryba'],
    ['🍗', 'kuře'], ['🌭', 'párky'], ['🥓', 'slanina'], ['🍯', 'med'], ['☕', 'káva'], ['🍵', 'čaj'], ['🍫', 'čokoláda'],
    ['🍪', 'sušenky'], ['🥐', 'loupáky'], ['🥖', 'veka'], ['🧂', 'sůl'], ['🍺', 'pivo'], ['🍷', 'víno'], ['🧃', 'džus'],
    ['🥜', 'arašídy'], ['🍦', 'zmrzlina'], ['🎂', 'dort'], ['🧼', 'mýdlo'], ['💐', 'květiny']
  ];
  const ROUNDS = 2;

  SM.registerGame({
    id: 'nakup',
    name: 'Nákupní seznam',
    domain: 'pamet',
    trains: 'paměť na slova a seznamy',
    short: 'Zapamatujte si, co máte koupit.',
    duration: 'asi 2 až 3 minuty',
    maxLevel: 8,
    howTo(level) {
      const n = level + 2;
      const steps = [
        'Uvidíte nákupní lístek s ' + n + ' položkami. V klidu si je zapamatujte.',
        'Až budete připraveni, klepněte na „Mám zapamatováno“. Lístek zmizí.'
      ];
      if (level >= 3) steps.push('Než půjdete „nakupovat“, spočítáte jeden jednoduchý příklad.');
      steps.push('Pak vyberte z nabídky všechno, co bylo na lístku, a klepněte na „Hotovo“.');
      return steps;
    },

    async run(ctx) {
      const n = ctx.level + 2;
      let hits = 0, fa = 0;
      const accs = [];

      for (let r = 0; r < ROUNDS; r++) {
        ctx.progress('Lístek ' + (r + 1) + ' z ' + ROUNDS);
        const targets = U.sample(ITEMS, n);
        await memorize(targets);
        if (ctx.level >= 3) await interlude();
        const res = await recall(targets, r === ROUNDS - 1);
        hits += res.hits;
        fa += res.fa;
        accs.push(Math.max(0, res.hits - res.fa) / n);
      }

      const acc = U.mean(accs);
      const total = n * ROUNDS;
      ctx.finish({
        perf: acc,
        levelDelta: acc >= 0.9 ? 1 : acc < 0.6 ? -1 : 0,
        big: hits + ' z ' + total,
        bigLabel: U.plural(total, 'položky', 'položek', 'položek') + ' jste si správně zapamatovali',
        details: [ROUNDS + ' lístky po ' + n + ' položkách', fa ? 'Vybráno navíc: ' + fa : 'Nic navíc'],
        metric: { hits: hits, fa: fa, n: n }
      });

      function memorize(targets) {
        return new Promise((resolve) => {
          ctx.clear();
          ctx.status('Zapamatujte si nákupní lístek.');
          const sz = ctx.size();
          const cols = targets.length >= 7 && sz.w >= 560 ? 2 : 1;
          const rows = Math.ceil(targets.length / cols);
          const row = U.clamp(Math.floor((sz.h - 60) / rows), 34, 56);
          const list = h('ul', { class: 'note-list' + (cols === 2 ? ' is-two' : '') },
            targets.map((t) => h('li', { class: 'note-item' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, t[0]), h('span', null, t[1]))));
          const note = h('div', { class: 'note', style: { '--row': row + 'px', maxWidth: cols === 2 ? '40rem' : '30rem' } }, list);
          const bar = h('i');
          const timebar = h('div', { class: 'timebar', 'aria-hidden': 'true' }, bar);
          ctx.stage.appendChild(h('div', { class: 'stack' }, note, timebar));
          const btn = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, 'Mám zapamatováno');
          ctx.foot.appendChild(btn);

          const limit = (targets.length * 3000 + 3000) * SM.timeScale;
          const start = performance.now();
          let done = false;
          const end = () => { if (!done) { done = true; resolve(); } };
          btn.addEventListener('click', end);
          const tick = () => {
            if (done) return;
            const left = Math.max(0, 1 - (performance.now() - start) / limit);
            bar.style.transform = 'scaleX(' + left.toFixed(3) + ')';
            if (left <= 0) end(); else ctx.after(100 / SM.timeScale, tick);
          };
          tick();
        });
      }

      function interlude() {
        return new Promise((resolve) => {
          ctx.clear();
          ctx.status('Ještě než půjdete nakupovat, malý příklad:');
          const a = U.randInt(3, 9), b = U.randInt(2, 9), ans = a + b;
          const opts = U.shuffle([ans, ans + U.pick([1, 2]), ans - U.pick([1, 2])]);
          let answered = false;
          const wrap = h('div', { class: 'quiz' }, h('p', { class: 'quiz-q' }, a + ' + ' + b + ' = ?'));
          const row = h('div', { class: 'quiz-opts' });
          opts.forEach((o) => {
            const btn = h('button', { class: 'btn btn-secondary', type: 'button' }, String(o));
            U.tap(btn, async () => {
              if (answered) return;
              answered = true;
              ctx.feedback(o === ans);
              ctx.status(o === ans ? 'Správně!' : 'Správně je ' + ans + '.');
              await ctx.sleep(1100);
              resolve();
            });
            row.appendChild(btn);
          });
          wrap.appendChild(row);
          ctx.stage.appendChild(wrap);
        });
      }

      function recall(targets, last) {
        return new Promise((resolve) => {
          ctx.clear();
          const others = ITEMS.filter((it) => targets.indexOf(it) === -1);
          const distract = U.sample(others, Math.min(targets.length, 16 - targets.length));
          const all = U.shuffle(targets.concat(distract));
          ctx.status('Co bylo na lístku? Vyberte ' + n + ' ' + U.plural(n, 'položku', 'položky', 'položek') + '.');

          const sz = ctx.size();
          const cols = sz.w >= 900 ? 4 : sz.w >= 560 ? 3 : 2;
          const rows = Math.ceil(all.length / cols);
          const ph = U.clamp(Math.floor((sz.h - 8 - 8 * (rows - 1)) / rows), 46, 76);
          const grid = h('div', { class: 'pick-grid', style: { '--cols': cols, '--ph': ph + 'px' } });
          const chosen = [];
          let locked = false;
          const doneBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: true }, 'Hotovo');
          const count = () => {
            ctx.progress('Vybráno ' + chosen.length + ' z ' + n);
            doneBtn.disabled = chosen.length === 0;
          };

          const tiles = all.map((item) => {
            const mark = h('span', { class: 'mark' }, U.svg(SM.icons.check));
            const b = h('button', { class: 'pick', type: 'button', 'aria-pressed': 'false' },
              h('span', { class: 'emo', 'aria-hidden': 'true' }, item[0]), h('span', { class: 'lbl' }, item[1]), mark);
            b.addEventListener('click', () => {
              if (locked) return;
              const i = chosen.indexOf(item);
              if (i === -1) chosen.push(item); else chosen.splice(i, 1);
              b.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
              ctx.sound.tap();
              count();
            });
            grid.appendChild(b);
            return { item: item, b: b, mark: mark };
          });
          ctx.stage.appendChild(grid);
          ctx.foot.appendChild(doneBtn);
          count();

          doneBtn.addEventListener('click', () => {
            if (locked) return;
            locked = true;
            grid.classList.add('is-locked');
            let hit = 0, wrong = 0;
            tiles.forEach((t) => {
              const isTarget = targets.indexOf(t.item) !== -1;
              const picked = chosen.indexOf(t.item) !== -1;
              t.b.setAttribute('aria-pressed', 'false');
              if (picked && isTarget) { hit++; t.b.classList.add('is-hit'); t.b.setAttribute('aria-label', t.item[1] + ': správně'); }
              else if (picked) {
                wrong++;
                t.b.classList.add('is-false');
                t.mark.replaceChild(U.svg(SM.icons.cross), t.mark.firstChild);
                t.b.setAttribute('aria-label', t.item[1] + ': nebylo na lístku');
              } else if (isTarget) {
                t.b.classList.add('is-miss');
                t.b.appendChild(h('span', { class: 'tag' }, 'chybělo'));
                t.b.setAttribute('aria-label', t.item[1] + ': chybělo');
              }
            });
            ctx.feedback(hit === n && wrong === 0, { silent: false });
            ctx.status('Správně: ' + hit + ' z ' + n + (wrong ? ' · navíc: ' + wrong : '') + '.');
            ctx.foot.removeChild(doneBtn);
            const next = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, last ? 'Zobrazit výsledek' : 'Další lístek');
            next.addEventListener('click', () => resolve({ hits: hit, fa: wrong }));
            ctx.foot.appendChild(next);
          });
        });
      }
    }
  });
})();
