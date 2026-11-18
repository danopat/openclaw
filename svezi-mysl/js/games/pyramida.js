/* Sčítací pyramida — doplnit čísla do cihel; každé je součtem dvou cihel pod ním (sčítání a odčítání zpaměti, logika). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* R = pater, lo–hi = čísla ve spodní řadě, min–max = rozsah vrcholu,
     givens = kolik cihel je předem vyplněných (bez udání = celá spodní řada), count = pyramid ve hře. */
  const LEVELS = [
    { R: 3, lo: 1, hi: 8, min: 10, max: 20, count: 3 },
    { R: 4, lo: 1, hi: 9, min: 20, max: 50, count: 2 },
    { R: 4, lo: 1, hi: 9, min: 20, max: 50, givens: 5, count: 2 },
    { R: 5, lo: 1, hi: 12, min: 50, max: 100, givens: 6, count: 1 },
    { R: 6, lo: 2, hi: 16, min: 120, max: 300, givens: 7, count: 1 }
  ];
  /* Cihla v patře r (0 = vrchol) a pořadí c zleva. */
  const idx = (r, c) => (r * (r + 1)) / 2 + c;
  const rowOf = (i) => Math.floor((Math.sqrt(8 * i + 1) - 1) / 2);

  /* Čísla pyramidy: rows[r][c] = rows[r + 1][c] + rows[r + 1][c + 1]. */
  function build(L) {
    let rows = null;
    for (let t = 0; t < 2000; t++) {
      rows = [Array.from({ length: L.R }, () => U.randInt(L.lo, L.hi))];
      while (rows[0].length > 1) {
        const b = rows[0];
        rows.unshift(b.slice(1).map((v, i) => b[i] + v));
      }
      if (rows[0][0] >= L.min && rows[0][0] <= L.max) break;
    }
    return rows;
  }

  /* Jak jde cihlu (r, c) spočítat ze známých: { add: [a, b] } sečtením dvou pod ní,
     { sub: [nad, vedle] } odečtením; null = zatím nejde. */
  function way(R, k, r, c) {
    if (r < R - 1 && k[idx(r + 1, c)] && k[idx(r + 1, c + 1)]) return { add: [idx(r + 1, c), idx(r + 1, c + 1)] };
    if (r > 0 && c > 0 && k[idx(r - 1, c - 1)] && k[idx(r, c - 1)]) return { sub: [idx(r - 1, c - 1), idx(r, c - 1)] };
    if (r > 0 && c < r && k[idx(r - 1, c)] && k[idx(r, c + 1)]) return { sub: [idx(r - 1, c), idx(r, c + 1)] };
    return null;
  }
  /* Dá se z daných cihel dopočítat celá pyramida krok za krokem? (Pak je řešení i jednoznačné.) */
  function solvable(R, known) {
    const k = known.slice();
    let left = k.filter((x) => !x).length;
    let changed = true;
    while (left && changed) {
      changed = false;
      for (let r = 0; r < R; r++) {
        for (let c = 0; c <= r; c++) {
          if (!k[idx(r, c)] && way(R, k, r, c)) { k[idx(r, c)] = true; left--; changed = true; }
        }
      }
    }
    return left === 0;
  }
  /* Které cihly budou vyplněné. Od 3. úrovně chybí i některé spodní, takže se musí i odčítat. */
  function pickGivens(L) {
    const N = idx(L.R, 0);
    const bottom = (k) => k.map((v, i) => (v ? i : -1)).filter((i) => i >= idx(L.R - 1, 0));
    if (L.givens) {
      for (let t = 0; t < 300; t++) {
        const k = Array(N).fill(true);
        let cnt = N;
        for (const i of U.shuffle(Array.from({ length: N }, (_, j) => j))) {
          if (cnt <= L.givens) break;
          k[i] = false;
          if (solvable(L.R, k)) cnt--;
          else k[i] = true;
        }
        if (cnt === L.givens && bottom(k).length < L.R) return k;
      }
    }
    return Array.from({ length: N }, (_, i) => i >= idx(L.R - 1, 0));
  }

  SM.registerGame({
    id: 'pyramida',
    name: 'Sčítací pyramida',
    domain: 'logika',
    trains: 'sčítání a odčítání zpaměti a logické doplňování',
    short: 'Doplňte čísla do pyramidy z cihel.',
    duration: 'asi 2 až 3 minuty',
    pace: { per: 'na cihlu' }, // rychlost pro přehled pokroku
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      const steps = [
        'Číslo v každé cihle je součtem dvou cihel pod ní.',
        'Klepněte na prázdnou cihlu, napište číslo na klávesnici dole a klepněte na „Vložit“. Špatné číslo jen označíme a můžete ho opravit.'
      ];
      if (L.givens) steps.push('Chybí i některé spodní cihly. Ty spočítáte odečtením: od cihly nad ní odečtete cihlu vedle ní.');
      steps.push('Když nevíte, kudy dál, tlačítko „Nápověda“ ukáže cihlu, kterou jde spočítat hned.');
      return steps;
    },
    async run(ctx) {
      let L = LEVELS[ctx.level - 1];
      if (ctx.short && L.R > 4) L = LEVELS[2]; // do lekce nanejvýš 4 patra
      const count = ctx.short ? 1 : L.count;
      if (!SM.store.flag('pyramida-ukazka')) {
        await example();
        SM.store.setFlag('pyramida-ukazka', true);
      }
      let mistakes = 0, hints = 0, blanks = 0, firstOk = 0;
      const t0 = performance.now();
      for (let p = 0; p < count; p++) {
        ctx.progress(count > 1 ? 'Pyramida ' + (p + 1) + ' z ' + count : '');
        const r = await play(build(L), pickGivens(L));
        mistakes += r.mistakes; hints += r.hints; blanks += r.blanks; firstOk += r.firstOk;
      }
      const ms = (performance.now() - t0) / SM.timeScale;
      const acc = blanks ? firstOk / blanks : 0;
      const perf = U.clamp(1 - 0.08 * mistakes - 0.1 * hints, 0, 1);
      const details = ['Chyby: ' + mistakes];
      if (hints) details.push('Nápověda: ' + hints + '×');
      ctx.finish({
        perf: perf, acc: acc, rt: ms / Math.max(1, blanks),
        levelDelta: perf >= 0.8 ? 1 : perf < 0.4 ? -1 : 0,
        big: U.fmtTime(ms), bigLabel: count > 1 ? 'čas na všechny pyramidy' : 'čas na pyramidu',
        details: details,
        metric: { mistakes: mistakes, hints: hints, cells: blanks }
      });

      function sizes(R, W, H) {
        const gap = (H - 8) / R < 40 ? 4 : 6; // na nízké ploše (velké písmo) menší mezery
        const bw = Math.floor(U.clamp((Math.min(W, 600) - 4 - gap * (R - 1)) / R, 40, 96));
        const bh = Math.floor(U.clamp(Math.min(bw * 0.66, (H - 8 - gap * (R - 1)) / R), 30, 64));
        return { '--bw': bw + 'px', '--bh': bh + 'px', '--gap': gap + 'px' };
      }

      /* Ukázka pravidla na vyřešené pyramidě (jen poprvé). */
      async function example() {
        const vals = [15, 8, 7, 3, 5, 2];
        const pyr = h('div', { class: 'pyr is-example', style: { '--bw': '5rem', '--bh': '3.2rem', '--gap': '6px' } });
        const els = [];
        for (let r = 0; r < 3; r++) {
          const row = h('div', { class: 'pyr-row' });
          for (let c = 0; c <= r; c++) {
            const b = h('span', { class: 'pyr-brick is-given' }, String(vals[idx(r, c)]));
            els.push(b);
            row.appendChild(b);
          }
          pyr.appendChild(row);
        }
        K.show(ctx, pyr);
        const steps = [
          ['Ukázka: číslo v každé cihle je součtem dvou cihel pod ní. 3 + 5 = 8.', 1, [3, 4]],
          ['Na vrcholu je 8 + 7 = 15.', 0, [1, 2]],
          ['Když znáte cihlu nad ní a cihlu vedle ní, odečtěte: 15 − 8 = 7.', 2, [0, 1]]
        ];
        for (let s = 0; s < steps.length; s++) {
          els.forEach((e, i) => {
            e.classList.toggle('is-hint', i === steps[s][1]);
            e.classList.toggle('is-src', steps[s][2].indexOf(i) !== -1);
          });
          ctx.status(steps[s][0]);
          await K.next(ctx, s === steps.length - 1 ? 'Začít hrát' : 'Další');
        }
      }

      /* Jedna pyramida. Vrací { mistakes, hints, blanks, firstOk }. */
      function play(rows, given) {
        return new Promise((resolve) => {
          const R = rows.length;
          const sol = [];
          rows.forEach((row, r) => row.forEach((v, c) => { sol[idx(r, c)] = v; }));
          const known = given.slice();
          const wrong = {};
          const missed = {};
          const maxLen = String(Math.max.apply(null, sol)).length;
          // Pořadí, ve kterém se nabízejí prázdné cihly: odspodu, zleva.
          const order = [];
          for (let r = R - 1; r >= 0; r--) for (let c = 0; c <= r; c++) if (!given[idx(r, c)]) order.push(idx(r, c));
          let sel = -1, typed = '', mistakesHere = 0, hintsHere = 0, finished = false;

          ctx.clear();
          ctx.status('Doplňte čísla do prázdných cihel.');
          // Klávesnice dole (nejdřív, aby šla změřit zbylá plocha pro pyramidu).
          const pad = h('div', { class: 'pyr-pad' });
          ['1', '2', '3', '4', '5', 'del', '6', '7', '8', '9', '0', 'ok'].forEach((key) => {
            const b = key === 'ok' ? h('button', { class: 'btn kp-key kp-ok', type: 'button', 'data-k': 'ok' }, 'Vložit')
              : key === 'del' ? h('button', { class: 'btn kp-key kp-del', type: 'button', 'data-k': 'del' }, 'Smazat')
              : h('button', { class: 'btn kp-key', type: 'button', 'data-k': key }, key);
            U.tap(b, () => press(key));
            pad.appendChild(b);
          });
          const hintBtn = h('button', { class: 'btn btn-secondary btn-small pyr-hint', type: 'button' }, 'Nápověda');
          U.tap(hintBtn, hint);
          ctx.foot.appendChild(pad);
          ctx.foot.appendChild(hintBtn);
          ctx.on(window, 'keydown', (e) => {
            if (/^[0-9]$/.test(e.key)) press(e.key);
            else if (e.key === 'Backspace') press('del');
            else if (e.key === 'Enter') press('ok');
          });

          const sz = ctx.size();
          const pyr = h('div', { class: 'pyr', style: sizes(R, sz.w, sz.h), role: 'group', 'aria-label': 'Pyramida o ' + R + ' patrech' });
          const els = [];
          for (let r = 0; r < R; r++) {
            const row = h('div', { class: 'pyr-row' });
            for (let c = 0; c <= r; c++) {
              const i = idx(r, c);
              const b = given[i]
                ? h('span', { class: 'pyr-brick is-given', 'data-i': i, 'data-given': sol[i] }, String(sol[i]))
                : h('button', { class: 'pyr-brick is-blank', type: 'button', 'data-i': i, 'aria-label': 'Prázdná cihla' });
              if (!given[i]) U.tap(b, () => select(i));
              els[i] = b;
              row.appendChild(b);
            }
            pyr.appendChild(row);
          }
          ctx.stage.appendChild(h('div', { class: 'stack' }, pyr));
          const blanksHere = order.length;
          select(nextBlank(-1), true);

          function wayOf(i) {
            const r = rowOf(i);
            return way(R, known, r, i - idx(r, 0));
          }
          /* Další prázdná cihla: přednostně taková, kterou jde spočítat hned. */
          function nextBlank(from) {
            const start = Math.max(0, order.indexOf(from) + 1);
            const seq = order.slice(start).concat(order.slice(0, start)).filter((i) => !known[i]);
            const now = seq.find((i) => wayOf(i));
            return now != null ? now : seq.length ? seq[0] : -1;
          }
          function paint() {
            els.forEach((el, i) => {
              if (given[i]) return;
              el.classList.toggle('is-sel', i === sel);
              el.classList.toggle('is-filled', !!known[i]);
              el.classList.toggle('is-wrong', !known[i] && wrong[i] != null);
              el.textContent = known[i] ? String(sol[i]) : wrong[i] != null ? String(wrong[i]) : i === sel ? typed : '';
            });
          }
          function clearHint() { els.forEach((el) => el.classList.remove('is-hint', 'is-src')); }
          function select(i, quiet) {
            if (i < 0 || known[i] || finished) return;
            if (i !== sel) typed = '';
            sel = i;
            if (!quiet) ctx.sound.tap();
            paint();
          }
          function press(key) {
            if (!ctx.alive || finished) return;
            if (sel < 0) { ctx.status('Nejdřív klepněte na prázdnou cihlu.'); return; }
            if (key === 'ok') { submit(); return; }
            if (key === 'del') typed = typed.slice(0, -1);
            else if (typed.length < maxLen && !(typed === '' && key === '0')) typed += key;
            delete wrong[sel];
            ctx.sound.tap();
            paint();
          }
          function submit() {
            if (!typed) return;
            const i = sel;
            const v = Number(typed);
            typed = '';
            if (v === sol[i]) {
              known[i] = true;
              els[i].setAttribute('aria-label', 'Cihla: ' + v);
              clearHint();
              ctx.sound.tap();
              if (known.every(Boolean)) { done(); return; }
              ctx.status('Doplňte čísla do prázdných cihel.');
              select(nextBlank(i), true);
              return;
            }
            mistakesHere++;
            missed[i] = true;
            wrong[i] = v;
            ctx.sound.wrong();
            const el = els[i];
            el.classList.remove('is-shake');
            void el.offsetWidth;
            el.classList.add('is-shake');
            ctx.status(wayOf(i) ? 'To nesedí. Zkuste to znovu.' : 'To nesedí. Tuhle cihlu zatím spočítat nejde, zkuste nejdřív jinou.');
            paint();
          }
          function hint() {
            if (!ctx.alive || finished) return;
            let target = sel >= 0 && !known[sel] && wayOf(sel) ? sel : -1;
            if (target < 0) target = order.find((i) => !known[i] && wayOf(i));
            if (target == null || target < 0) return;
            const w = wayOf(target);
            hintsHere++;
            missed[target] = true;
            delete wrong[target];
            clearHint();
            els[target].classList.add('is-hint');
            (w.add || w.sub).forEach((j) => els[j].classList.add('is-src'));
            select(target);
            ctx.status(w.add ? 'Tuto cihlu spočítáte: sečtěte dvě zvýrazněné cihly pod ní.' : 'Tuto cihlu spočítáte: od zvýrazněné cihly nad ní odečtěte cihlu vedle ní.');
          }
          function done() {
            finished = true;
            sel = -1;
            paint();
            pyr.classList.add('is-done');
            pad.classList.add('is-locked');
            hintBtn.disabled = true;
            ctx.feedback(true);
            ctx.status('Pyramida je hotová!');
            const firstOkHere = order.filter((i) => !missed[i]).length;
            ctx.sleep(1500).then(() => resolve({ mistakes: mistakesHere, hints: hintsHere, blanks: blanksHere, firstOk: firstOkHere }));
          }
        });
      }
    }
  });
})();
