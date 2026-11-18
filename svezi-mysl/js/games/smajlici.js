/* Smajlíci — zapamatovat si, který obličej byl ve kterém kroužku (zraková paměť, spojení „co“ a „kde“). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* Kreslené výrazy: oči a pusa (SVG 100 × 100). Liší se jen očima a pusou, takže jdou odstupňovat podle podobnosti. */
  const INK = '#2b2417';
  const EYES = {
    dots: '<circle cx="36" cy="40" r="5.5"/><circle cx="64" cy="40" r="5.5"/>',
    happy: '<path d="M29 42q7-9 14 0M57 42q7-9 14 0" fill="none" stroke-width="4.5" stroke-linecap="round"/>',
    wide: '<circle cx="36" cy="38" r="9" fill="#fff" stroke-width="3.5"/><circle cx="64" cy="38" r="9" fill="#fff" stroke-width="3.5"/><circle cx="36" cy="39" r="4"/><circle cx="64" cy="39" r="4"/>',
    wink: '<circle cx="36" cy="40" r="5.5"/><path d="M57 41h14" stroke-width="4.5" stroke-linecap="round"/>',
    sad: '<circle cx="36" cy="42" r="5"/><circle cx="64" cy="42" r="5"/><path d="M27 31l15-5M73 31l-15-5" stroke-width="4" stroke-linecap="round"/>',
    angry: '<circle cx="36" cy="42" r="5"/><circle cx="64" cy="42" r="5"/><path d="M27 27l15 7M73 27l-15 7" stroke-width="4.5" stroke-linecap="round"/>',
    sleepy: '<path d="M29 41h14M57 41h14" stroke-width="4.5" stroke-linecap="round"/>'
  };
  const MOUTH = {
    smile: '<path d="M32 62q18 16 36 0" fill="none" stroke-width="5" stroke-linecap="round"/>',
    laugh: '<path d="M30 58h40q-2 22-20 22t-20-22z" fill="#8a2a1e" stroke-width="4" stroke-linejoin="round"/>',
    frown: '<path d="M33 73q17-14 34 0" fill="none" stroke-width="5" stroke-linecap="round"/>',
    o: '<ellipse cx="50" cy="69" rx="8" ry="10" fill="#8a2a1e" stroke-width="4"/>',
    flat: '<path d="M35 68h30" stroke-width="5" stroke-linecap="round"/>',
    tongue: '<path d="M32 62q18 14 36 0" fill="none" stroke-width="5" stroke-linecap="round"/><path d="M44 68q0 12 7 12t7-12" fill="#e3646b" stroke-width="3.5"/>',
    wavy: '<path d="M32 69q6-6 9 0t9 0 9 0 9 0" fill="none" stroke-width="4.5" stroke-linecap="round"/>',
    teeth: '<rect x="31" y="60" width="38" height="15" rx="5" fill="#fff" stroke-width="4"/><path d="M40 60v15M50 60v15M60 60v15" stroke-width="2.5"/>',
    small: '<path d="M43 69h14" stroke-width="5" stroke-linecap="round"/>'
  };
  /* Výrazy: název, oči, pusa. */
  const FACES = [
    ['úsměv', 'dots', 'smile'], ['smích', 'happy', 'laugh'], ['smutek', 'sad', 'frown'], ['překvapení', 'wide', 'o'],
    ['mrknutí', 'wink', 'smile'], ['jazyk', 'dots', 'tongue'], ['bez nálady', 'dots', 'flat'], ['zlost', 'angry', 'frown'],
    ['spánek', 'sleepy', 'small'], ['zmatek', 'dots', 'wavy'], ['úšklebek', 'dots', 'teeth'], ['starost', 'sad', 'small']
  ].map((f, i) => ({ id: i, name: f[0], eyes: f[1], mouth: f[2] }));

  function faceSvg(f) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="45" fill="#ffd45e" stroke="' + INK + '" stroke-width="4"/>' +
      '<g fill="' + INK + '" stroke="' + INK + '">' + EYES[f.eyes] + MOUTH[f.mouth] + '</g></svg>';
  }
  function faceNode(f, cls) {
    const s = h('span', { class: 'face' + (cls ? ' ' + cls : '') });
    s.innerHTML = faceSvg(f);
    return s;
  }

  /* n = kroužků, similar = výrazy podobné (stejné oči, jiná pusa). */
  const LEVELS = [{ n: 3 }, { n: 4 }, { n: 5 }, { n: 6, similar: true }, { n: 8, similar: true }];

  function pickFaces(L) {
    if (!L.similar) {
      // Snadné: každý výraz má jiné oči i pusu.
      for (let t = 0; t < 200; t++) {
        const s = U.sample(FACES, L.n);
        const eyes = new Set(s.map((f) => f.eyes)), mouths = new Set(s.map((f) => f.mouth));
        if (eyes.size === s.length && mouths.size === s.length) return s;
        if (t > 150 && mouths.size === s.length) return s;
      }
      return U.sample(FACES, L.n);
    }
    // Těžší: aspoň polovina výrazů má stejné oči (liší se jen pusou).
    const same = U.shuffle(FACES.filter((f) => f.eyes === 'dots'));
    const rest = U.shuffle(FACES.filter((f) => f.eyes !== 'dots'));
    const k = Math.min(same.length, Math.ceil(L.n / 2) + 1);
    return U.shuffle(same.slice(0, k).concat(rest.slice(0, L.n - k)));
  }

  SM.registerGame({
    id: 'smajlici',
    name: 'Smajlíci',
    domain: 'pamet',
    trains: 'zrakovou paměť a spojení „co“ a „kde“',
    short: 'Zapamatujte si, kde byl který obličej.',
    duration: 'asi 2 minuty',
    maxLevel: LEVELS.length,
    howTo(level) {
      const L = LEVELS[level - 1];
      return [
        'V ' + L.n + ' kroužcích jsou obličeje s různými výrazy. Zapamatujte si, který je kde.',
        'Pak obličeje zmizí. Postupně se rozsvítí jednotlivé kroužky a vy vyberete, který obličej v nich byl.',
        L.similar ? 'Na této úrovni se některé obličeje liší jen pusou.' : 'Každý obličej se liší očima i pusou.'
      ];
    },
    async run(ctx) {
      const L = LEVELS[ctx.level - 1];
      const rounds = ctx.short ? 2 : 3;
      let ok = 0, total = 0;
      for (let r = 0; r < rounds; r++) {
        ctx.progress('Kolo ' + (r + 1) + ' z ' + rounds);
        const faces = pickFaces(L);
        const ring = ringNode(faces);
        ctx.clear();
        ctx.status('Zapamatujte si, kde je který obličej.');
        const box = h('div', { class: 'stack smajlici', 'data-ask': 'study', 'data-faces': faces.map((f) => f.name).join('|') }, ring.box);
        ctx.stage.appendChild(box);
        await K.study(ctx, { limit: L.n * 3000 + 4000, container: box });
        const bar = box.querySelector('.timebar');
        if (bar) bar.remove();
        ctx.foot.textContent = '';
        ring.slots.forEach((s) => { s.textContent = ''; s.classList.add('is-empty'); });
        box.dataset.ask = 'recall';
        const order = U.shuffle(faces.map((_, i) => i));
        for (let q = 0; q < order.length; q++) {
          const i = order[q];
          total++;
          box.dataset.slot = i;
          ring.slots.forEach((s, j) => s.classList.toggle('is-asked', j === i));
          ctx.status('Jaký obličej byl v označeném kroužku?');
          const others = U.shuffle(faces.filter((f) => f !== faces[i])).slice(0, 2)
            .concat(U.sample(FACES.filter((f) => faces.indexOf(f) === -1), 1));
          // Na úzkém displeji s velkým písmem jen obličeje (název čte čtečka obrazovky).
          const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
          const bare = ctx.size().w < 19 * rem;
          const opts = U.shuffle([faces[i]].concat(others)).map((f) => ({ value: f.id, label: f.name, aria: f.name,
            node: h('span', { class: 'face-opt' + (bare ? ' is-bare' : ''), 'data-face': f.name }, faceNode(f), bare ? null : h('span', null, f.name)) }));
          const wait = K.choose(ctx, opts, { answer: faces[i].id, layout: 'grid', cls: 'is-faces' });
          fitRing(ring.box);
          const res = await wait;
          if (res.correct) ok++;
          ring.slots[i].classList.remove('is-empty', 'is-asked');
          ring.slots[i].classList.add(res.correct ? 'is-ok' : 'is-bad');
          ring.slots[i].appendChild(faceNode(faces[i]));
          ctx.status(res.correct ? 'Správně!' : 'Byl tu obličej: ' + faces[i].name + '.');
          await ctx.sleep(res.correct ? 800 : 1800);
          ctx.foot.textContent = '';
        }
      }
      const acc = total ? ok / total : 0;
      ctx.finish({
        perf: acc, acc: acc,
        levelDelta: K.levelByAcc(acc, 0.85, 0.5),
        big: ok + ' z ' + total, bigLabel: 'obličejů na správném místě',
        details: [], metric: { acc: Math.round(acc * 100) }
      });

      /* Když dole přibudou možnosti a místa ubude, kruh se zmenší, ať je celý vidět. */
      function fitRing(el) {
        const avail = ctx.stage.clientHeight - 16;
        const D = parseFloat(el.style.width);
        const k = Math.min(1, avail / D);
        el.style.transformOrigin = 'top center';
        el.style.transform = k < 1 ? 'scale(' + k.toFixed(3) + ')' : '';
        el.style.marginBottom = k < 1 ? (-(1 - k) * D) + 'px' : '';
      }

      /* Kroužky v kruhu. */
      function ringNode(faces) {
        const n = faces.length;
        const sz = ctx.size();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
        const W = Math.min(sz.w - 8, 440);
        const Hh = Math.max(200, sz.h - 5 * rem);
        const D = Math.min(W, Hh);
        const d = Math.floor(U.clamp(n <= 4 ? D * 0.36 : n <= 6 ? D * 0.3 : D * 0.25, 64, 130));
        const R = n <= 1 ? 0 : (D - d) / 2;
        const box = h('div', { class: 'face-ring', style: { width: D + 'px', height: D + 'px', '--d': d + 'px' } });
        const slots = faces.map((f, i) => {
          const a = (-90 + (360 / n) * i) * Math.PI / 180;
          const s = h('span', { class: 'face-slot', 'data-i': i, style: { left: (D / 2 + R * Math.cos(a) - d / 2) + 'px', top: (D / 2 + R * Math.sin(a) - d / 2) + 'px' } }, faceNode(f));
          box.appendChild(s);
          return s;
        });
        return { box: box, slots: slots };
      }
    }
  });
})();
