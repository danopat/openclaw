/* Popletené štítky — tři sklenice mají všechny štítky špatně; z jediné vytažené věci se vyvodí obsah všech (logické vyvozování). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Dva druhy věcí (obrázek, název v množném čísle) a jejich směs. */
  const SETS = [
    [['🍎', 'jablka'], ['🍐', 'hrušky']],
    [['🍋', 'citrony'], ['🍊', 'pomeranče']],
    [['🌰', 'kaštany'], ['🥜', 'oříšky']],
    [['🍬', 'bonbony'], ['🍭', 'lízátka']],
    [['📎', 'sponky'], ['🧷', 'špendlíky']],
    [['🧅', 'cibule'], ['🧄', 'česnek']]
  ];
  const MIX = 'směs';

  /* hint = tip, ze které sklenice tahat; why = po úloze otázka, proč to tak je. */
  const LEVELS = [{ hint: true }, { hint: false }, { hint: false, why: true }];

  SM.registerGame({
    id: 'stitky',
    name: 'Popletené štítky',
    domain: 'rozhodovani',
    trains: 'logické vyvozování z jediné informace',
    short: 'Všechny štítky jsou špatně. Zjistěte, co je kde.',
    duration: 'asi 2 minuty',
    pace: { per: 'na úlohu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Ve třech sklenicích jsou dva druhy věcí, ve třetí jejich směs. Všechny tři štítky jsou ale nalepené špatně.',
        'Smíte vytáhnout jen jednu věc z jedné sklenice. Vyberte dobře, ze které.',
        'Pak určete, co je ve sklenicích doopravdy.'
      ];
      if (L.hint) steps.push('Tip: sklenice se štítkem „směs“ směs určitě neobsahuje.');
      if (L.why) steps.push('Nakonec se zeptáme, proč stačila jedna věc.');
      return steps;
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const N = ctx.short ? 1 : 3;
      const scores = [];
      for (let i = 0; i < N; i++) {
        ctx.progress(N > 1 ? 'Úloha ' + (i + 1) + ' z ' + N : '');
        scores.push(await task());
      }
      const acc = U.mean(scores);
      const ok = scores.filter((s) => s >= 1).length;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.8, 0.5),
        big: ok + ' z ' + N, bigLabel: N > 1 ? 'úloh vyřešených napoprvé' : 'úloha vyřešená napoprvé',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      function jarNode(label, k) {
        return h('button', { class: 'jar', type: 'button', 'data-k': k, 'data-label': label, 'aria-label': 'Sklenice se štítkem ' + label },
          h('span', { class: 'jar-lid', 'aria-hidden': 'true' }),
          h('span', { class: 'jar-body', 'aria-hidden': 'true' }, h('span', { class: 'jar-in' }), h('span', { class: 'jar-tag' }, label)),
          h('span', { class: 'jar-drawn', 'aria-live': 'polite' }));
      }

      /* Jedna úloha. Vrací 1 (vyřešeno napoprvé), jinak podíl správných odpovědí. */
      async function task() {
        const set = U.pick(SETS);
        const names = [set[0][1], set[1][1], MIX];
        const emoji = { [set[0][1]]: set[0][0], [set[1][1]]: set[1][0], [MIX]: set[0][0] + set[1][0] };
        // Obsah: každá sklenice má štítek jiný, než jaký je její obsah (dvě možná uspořádání, vybere se náhodně).
        const labels = U.shuffle(names);
        const contents = Math.random() < 0.5 ? [labels[1], labels[2], labels[0]] : [labels[2], labels[0], labels[1]];
        const t0 = performance.now();
        ctx.clear();
        ctx.status('Všechny štítky jsou špatně. Ze které sklenice vytáhnete jednu věc?');
        const row = h('div', { class: 'jars' }, labels.map((l, k) => jarNode(l, k)));
        const tip = L.hint ? h('p', { class: 'jar-tip' }, 'Tip: sklenice se štítkem „směs“ směs určitě neobsahuje.') : null;
        ctx.stage.appendChild(h('div', { class: 'stack stitky', 'data-ask': 'draw', 'data-contents': contents.join('|') }, row, tip));
        const jars = Array.from(row.children);
        const k = await new Promise((resolve) => {
          let done = false;
          jars.forEach((j, idx) => U.tap(j, () => { if (!done && ctx.alive) { done = true; resolve(idx); } }));
        });
        row.classList.add('is-locked');
        const c = contents[k];
        const drawn = c === MIX ? U.pick([set[0], set[1]]) : set.find((x) => x[1] === c);
        jars[k].classList.add('is-drawn');
        jars[k].querySelector('.jar-drawn').textContent = drawn[0];
        jars[k].querySelector('.jar-drawn').setAttribute('aria-label', 'Vytáhli jste: ' + drawn[1]);
        ctx.sound.tap();
        const fromMix = labels[k] === MIX;
        ctx.status('Vytáhli jste: ' + drawn[1] + (fromMix ? '.' : '. Pozor, mohla to být i směs.'));
        await ctx.sleep(1200);

        // Dvě otázky; třetí sklenice z nich vyplývá.
        let good = 0;
        const order = [labels.indexOf(MIX)].concat([0, 1, 2].filter((x) => labels[x] !== MIX));
        for (let q = 0; q < 2; q++) {
          const j = order[q];
          ctx.status('Co je ve sklenici se štítkem „' + labels[j] + '“?');
          ctx.stage.querySelector('.stitky').dataset.ask = 'assign';
          ctx.stage.querySelector('.stitky').dataset.jar = j;
          jars.forEach((el, x) => el.classList.toggle('is-asked', x === j));
          const opts = names.filter((n) => n !== labels[j]).map((n) => ({ value: n, label: n, node: h('span', { class: 'jar-opt' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, emoji[n]), n) }));
          const r = await K.choose(ctx, opts, { answer: contents[j], layout: 'row', cls: 'is-jars' });
          if (r.correct) good++;
          await ctx.sleep(r.correct ? 700 : 1400);
          ctx.foot.textContent = '';
        }
        const ms = (performance.now() - t0) / SM.timeScale;
        // Odhalení všech sklenic a vysvětlení.
        jars.forEach((el, x) => {
          el.classList.remove('is-asked');
          el.classList.add('is-open');
          el.querySelector('.jar-in').textContent = emoji[contents[x]];
          el.querySelector('.jar-tag').textContent = contents[x];
        });
        const all = good === 2;
        ctx.feedback(all);
        const why = 'Sklenice se štítkem „směs“ má štítek špatně, takže je v ní jen jeden druh. Jedna věc z ní prozradí který. Zbylé dvě sklenice pak už jde dopočítat.';
        ctx.status(all ? 'Výborně, všechno sedí!' : 'Takhle to bylo doopravdy.');
        ctx.stage.querySelector('.stitky').dataset.ask = 'reveal';
        ctx.stage.querySelector('.stitky').appendChild(h('p', { class: 'jar-why' }, (fromMix ? 'Dobrá volba. ' : '') + why));
        let score = good / 2;
        if (L.why) {
          ctx.stage.querySelector('.stitky').dataset.ask = 'why';
          ctx.status('Proč stačilo vytáhnout jednu věc ze sklenice se štítkem „směs“?');
          const right = 'Štítek lže, takže je v ní jen jeden druh.';
          const r = await K.choose(ctx, U.shuffle([right, 'Ve směsi se snáz trefím.', 'Je jedno, ze které sklenice tahám.']).map((v) => ({ value: v, label: v })), { answer: right, layout: 'col' });
          score = (good + (r.correct ? 1 : 0)) / 3;
          await ctx.sleep(r.correct ? 800 : 1600);
        }
        ctx.mark(score >= 1, ms);
        await K.next(ctx, 'Pokračovat');
        return score;
      }
    }
  });
})();
