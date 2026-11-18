/* Jména a tváře — seznámit se s novými sousedy a vybavit si jejich jména (asociativní paměť).
   Kreslené portréty. Od 3. úrovně se na konci delší hry ještě ptáme na sousedy z prvního kola (odložené vybavení).
   Volba „S trikem ze Školy paměti“: příjmení něco připomínají (Lišková, Kovář), ke jménu se vybírá obrázek
   a při vybavování ho ukáže nápověda. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = SM.kit;

  /* ---------- Kreslené portréty (SVG 100 × 100): účes, barva vlasů, pleť, brýle, vousy a tričko ---------- */
  const SKIN = ['#f3cfae', '#e0aa82', '#b97f5c'];
  const HAIR = [['#c4c4c4', 'šedé'], ['#f4f4ee', 'bílé'], ['#6b4a2b', 'hnědé'], ['#2b2b2b', 'černé'], ['#d9b25f', 'světlé']];
  const SHIRT = ['#2c69d6', '#c0392b', '#3a9a4a', '#8a4fd0', '#e07b00', '#5d6d7e'];
  const STYLES = { f: ['drdol', 'dlouhé', 'mikádo', 'kudrny'], m: ['krátké', 'pleš', 'pěšinka', 'kudrny'] };
  /* Slovní popis účesu pro čtečku obrazovky (c = barva vlasů). */
  const STYLE_TEXT = {
    drdol: (c) => c + ' vlasy v drdolu', dlouhé: (c) => 'dlouhé ' + c + ' vlasy', mikádo: (c) => c + ' mikádo',
    kudrny: (c) => c + ' kudrnaté vlasy', krátké: (c) => 'krátké ' + c + ' vlasy', pleš: (c) => 'pleš, po stranách ' + c + ' vlasy',
    pěšinka: (c) => c + ' vlasy s pěšinkou'
  };
  const INK = '#2b2417';
  const ln = (w) => ' stroke="' + INK + '" stroke-width="' + (w || 2) + '" stroke-linejoin="round" stroke-linecap="round"';
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function hairBack(st, c) {
    if (st === 'dlouhé') return '<path d="M24 46c0-20 12-30 26-30s26 10 26 30v34H24z" fill="' + c + '"' + ln() + '/>';
    if (st === 'mikádo') return '<path d="M25 52c0-22 11-33 25-33s25 11 25 33c0 8-3 12-6 14H31c-3-2-6-6-6-14z" fill="' + c + '"' + ln() + '/>';
    return '';
  }
  function hairFront(st, c) {
    const s = ' fill="' + c + '"' + ln();
    switch (st) {
      case 'drdol': return '<circle cx="50" cy="16" r="8"' + s + '/><path d="M27 43c0-16 10-25 23-25s23 9 23 25c-6-8-14-11-23-11s-17 3-23 11z"' + s + '/>';
      case 'dlouhé': return '<path d="M27 45c0-17 10-26 23-26s23 9 23 26c-4-9-13-14-23-14s-19 5-23 14z"' + s + '/>';
      case 'mikádo': return '<path d="M27 45c0-17 10-26 23-26s23 9 23 26c-8-5-15-7-23-7s-15 2-23 7z"' + s + '/>';
      case 'kudrny': return '<path d="M26 45c-4-6 0-12 4-13-1-7 6-12 11-10 3-5 12-5 15 0 6-2 12 3 11 10 5 2 8 7 4 13-7-6-15-9-23-9s-15 3-22 9z"' + s + '/>';
      case 'krátké': return '<path d="M28 41c0-14 10-21 22-21s22 7 22 21c-6-6-13-8-22-8s-16 2-22 8z"' + s + '/>';
      case 'pleš': return '<path d="M28 49c-2-6 0-12 4-14l2 13zM72 49c2-6 0-12-4-14l-2 13z"' + s + '/>';
      case 'pěšinka': return '<path d="M28 42c0-14 10-22 22-22s22 8 22 22c-5-7-11-10-16-10l-4-4-3 4c-9 0-15 3-21 10z"' + s + '/>';
      default: return '';
    }
  }
  function portraitSvg(L) {
    const skin = SKIN[L.skin], hair = HAIR[L.hair][0];
    let out = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<circle cx="50" cy="50" r="49" fill="#e6edf2"/>' + hairBack(L.style, hair) +
      '<path d="M16 100c2-16 15-24 34-24s32 8 34 24z" fill="' + SHIRT[L.shirt] + '"' + ln() + '/>' +
      '<path d="M43 64v13h14V64" fill="' + skin + '"' + ln() + '/>' +
      '<ellipse cx="28.5" cy="50" rx="4" ry="6" fill="' + skin + '"' + ln() + '/><ellipse cx="71.5" cy="50" rx="4" ry="6" fill="' + skin + '"' + ln() + '/>' +
      '<ellipse cx="50" cy="48" rx="21" ry="25" fill="' + skin + '"' + ln() + '/>';
    if (L.beard === 'vousy') out += '<path d="M30 51c0 15 8 22 20 22s20-7 20-22c-4 6-9 8-20 8s-16-2-20-8z" fill="' + hair + '"' + ln(1.8) + '/>';
    out += '<circle cx="42" cy="46" r="2.6" fill="' + INK + '"/><circle cx="58" cy="46" r="2.6" fill="' + INK + '"/>' +
      '<path d="M50 49v7h-3" fill="none"' + ln(1.6) + '/>' +
      '<path d="M43 63q7 5 14 0" fill="none"' + ln() + '/>';
    if (L.beard === 'knír') out += '<path d="M41 60q9-5 18 0q-9 2-18 0z" fill="' + hair + '"' + ln(1.6) + '/>';
    out += hairFront(L.style, hair);
    if (L.glasses) out += '<g fill="none"' + ln() + '><circle cx="42" cy="46" r="7"/><circle cx="58" cy="46" r="7"/><path d="M49 46h2M35 45l-6-2M65 45l6-2"/></g>';
    return out + '</svg>';
  }
  const describe = (p) => (p.g === 'f' ? 'Žena' : 'Muž') + ', ' + STYLE_TEXT[p.look.style](HAIR[p.look.hair][1]) + (p.look.glasses ? ', brýle' : '') +
    (p.look.beard === 'knír' ? ', knír' : p.look.beard === 'vousy' ? ', vousy' : '');

  /* Příjmení, která něco připomínají (trik Jména a obrazy). scene = co si představit, platí pro pána i paní. */
  const SURNAMES = [
    ['Kovář', 'Kovářová', '🔨', 'kladivo', 'buší kladivem do podkovy'],
    ['Zahradník', 'Zahradníková', '🌻', 'květina', 'zalévá obrovskou slunečnici'],
    ['Liška', 'Lišková', '🦊', 'liška', 'nese v náručí zrzavou lišku'],
    ['Kohout', 'Kohoutová', '🐓', 'kohout', 'má na rameni kohouta, který kokrhá'],
    ['Pekař', 'Pekařová', '🍞', 'chleba', 'drží pod paží veliký bochník chleba'],
    ['Rybář', 'Rybářová', '🎣', 'udice', 'chytá na udici rybu přímo z kašny'],
    ['Zajíc', 'Zajícová', '🐇', 'zajíc', 'hladí ušatého zajíce'],
    ['Beran', 'Beranová', '🐏', 'beran', 'vede na provázku berana'],
    ['Holub', 'Holubová', '🕊️', 'holub', 'krmí holuby na náměstí'],
    ['Medvěd', 'Medvědová', '🐻', 'medvěd', 'objímá velkého hnědého medvěda'],
    ['Vlk', 'Vlková', '🐺', 'vlk', 'venčí místo psa vlka'],
    ['Krejčí', 'Krejčí', '🧵', 'nit', 'šije jehlou s dlouhou nití'],
    ['Mráz', 'Mrázová', '❄️', 'vločka', 'má čepici celou od sněhových vloček']
  ].map((s) => ({ m: s[0], f: s[1], e: s[2], what: s[3], scene: s[4] }));

  let seq = 0;
  /* k sousedů, střídavě ženy a muži; jména se berou z pools, aby se v jedné hře neopakovala. */
  function people(k, trick, pools) {
    const out = [];
    const used = {};
    for (let i = 0; i < k; i++) {
      const g = i % 2 === 0 ? (Math.random() < 0.5 ? 'f' : 'm') : out[i - 1].g === 'f' ? 'm' : 'f';
      let look;
      for (let t = 0; t < 100; t++) {
        look = {
          style: U.pick(STYLES[g]), hair: U.randInt(0, HAIR.length - 1), skin: U.randInt(0, SKIN.length - 1), shirt: U.randInt(0, SHIRT.length - 1),
          glasses: Math.random() < 0.4, beard: g === 'm' ? U.pick(['', '', 'knír', 'vousy']) : ''
        };
        if (!used[look.style + look.hair]) break; // dva sousedé v jednom kole nemají stejný účes se stejnou barvou vlasů
      }
      used[look.style + look.hair] = true;
      const sur = trick ? pools.sur.pop() : null;
      const job = pools.jobs.pop();
      out.push({ id: 'n' + (++seq), g: g, look: look, name: sur ? sur[g] : pools[g].pop(), sur: sur, job: job[g], je: job.e });
    }
    return out;
  }
  const title = (p) => (p.g === 'f' ? 'paní ' : 'pan ') + p.name;
  function face(p) {
    const s = h('span', { class: 'person-face is-drawn', 'data-face': p.id, role: 'img', 'aria-label': describe(p) });
    s.innerHTML = portraitSvg(p.look);
    return s;
  }
  const pic = (s) => h('span', { class: 'person-pic' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, s.e), ' ' + s.what);

  SM.registerGame({
    id: 'jmena',
    name: 'Jména a tváře',
    domain: 'pamet',
    trains: 'paměť na jména a tváře',
    short: 'Zapamatujte si jména nových sousedů.',
    duration: 'asi 2 minuty',
    maxLevel: 5,
    options: [{ id: 'trik', title: 'S trikem ze Školy paměti', desc: 'Příjmení sousedů něco připomínají. Ke jménu vyberete obrázek a ten pak poslouží jako nápověda.' }],
    howTo(level, o) {
      const trick = o && o.opts && o.opts.trik;
      const steps = ['Do domu se nastěhovali noví sousedé (' + (level + 1) + '). Postupně se vám představí.'];
      if (trick) {
        steps.push('Jejich příjmení něco připomínají, třeba Lišková lišku. Ke jménu vyberte obrázek, který k němu patří, a představte si souseda spolu s ním.');
        steps.push('Potom uvidíte tvář a vyberete správné jméno. Když si nevzpomenete, „Nápověda“ ukáže obrázek. Odpověď s nápovědou se počítá napůl.');
      } else {
        steps.push('Zapamatujte si, jak se kdo jmenuje. Pomůže spojit si jméno s tváří nebo povoláním.');
        steps.push('Potom uvidíte tvář a vyberete správné jméno.');
      }
      if (level >= 3 && !(o && o.short)) steps.push('Na konci se ještě jednou zeptáme na dva sousedy z prvního kola. Tyto otázky se počítají zvlášť.');
      return steps;
    },
    async run(ctx) {
      const k = ctx.level + 1;
      const rounds = ctx.short ? 1 : 2;
      const trick = !!(ctx.opts && ctx.opts.trik);
      const C = SM.content;
      const pools = { f: U.shuffle(C.NAMES.f), m: U.shuffle(C.NAMES.m), sur: U.shuffle(SURNAMES), jobs: U.shuffle(C.JOBS.concat(C.JOBS)) };
      let score = 0, right = 0, total = 0, hints = 0;
      let first = null;
      for (let r = 0; r < rounds; r++) {
        const ps = people(k, trick, pools);
        if (!first) first = ps;
        for (let i = 0; i < ps.length; i++) await meet(ps, i);
        const order = U.shuffle(ps);
        for (let i = 0; i < order.length; i++) {
          ctx.progress('Otázka ' + (i + 1) + ' z ' + order.length);
          const a = await ask(order[i], ps, 'Jak se jmenuje tento soused?', trick);
          total++;
          score += a.score;
          if (a.ok) right++;
          if (a.hint) hints++;
        }
      }
      // Odložené vybavení: od 3. úrovně v delší hře ještě dva sousedé z prvního kola (bez nápovědy, počítá se zvlášť).
      let late = 0, lateN = 0;
      if (ctx.level >= 3 && rounds > 1) {
        const again = U.sample(first, 2);
        for (let i = 0; i < again.length; i++) {
          ctx.progress('Vzpomínka ' + (i + 1) + ' z ' + again.length);
          lateN++;
          if ((await ask(again[i], first, 'Vzpomenete si ještě? Tento soused byl v prvním kole.', false)).ok) late++;
        }
      }
      const acc = total ? score / total : 0;
      const details = [];
      if (hints) details.push('S nápovědou: ' + hints + '× (počítá se napůl)');
      if (lateN) details.push('Na konci jste si vybavili ' + late + ' z ' + lateN + ' jmen z prvního kola.');
      ctx.finish({
        perf: acc, acc: acc, levelDelta: K.levelByAcc(acc, 0.9, 0.6),
        big: right + ' z ' + total, bigLabel: 'jmen jste si správně vybavili',
        details: details,
        metric: { acc: Math.round(acc * 100), hints: hints, late: lateN ? late : null, lateN: lateN || null, trik: trick || null }
      });

      async function meet(ps, i) {
        const p = ps[i];
        ctx.progress('Seznámení ' + (i + 1) + ' z ' + ps.length);
        ctx.status('Seznamte se:');
        const card = h('div', { class: 'person-card', 'data-pic': p.sur ? p.sur.e : null },
          face(p),
          h('span', { class: 'person-name' }, title(p)),
          p.sur ? null : h('span', { class: 'person-job' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, p.je), ' ' + p.job));
        K.show(ctx, card);
        if (p.sur) {
          // Trik: ke jménu vybrat obrázek, který ho připomíná, a představit si souseda spolu s ním.
          ctx.status('Co vám připomíná jméno ' + p.name + '?');
          const others = U.sample(SURNAMES.filter((s) => s !== p.sur), 2);
          const opts = U.shuffle([p.sur].concat(others)).map((s) => ({ value: s.e, aria: s.what,
            node: h('span', { class: 'trick-opt' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, s.e), h('span', null, s.what)) }));
          const pr = K.choose(ctx, opts, { answer: p.sur.e, layout: 'row', cls: 'is-trick', noMark: true, silent: true });
          fit(card);
          const r = await pr;
          await ctx.sleep(400);
          card.appendChild(h('span', { class: 'person-scene' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, p.sur.e), ' ' + cap(p.sur.scene) + '.'));
          ctx.status((r.correct ? 'Ano! ' : 'Patří sem: ' + p.sur.what + '. ') + 'Představte si to:');
        }
        const nx = K.next(ctx, i < ps.length - 1 ? 'Další soused' : 'Můžeme začít');
        fit(card);
        await nx;
      }

      /* Malý telefon s velkým písmem: dlouhá jména se v tlačítkách zmenší (nebo přejdou pod sebe)
         a portrét se zmenší, aby se karta vešla nad tlačítka. */
      function fit(card) {
        const box = ctx.foot.querySelector('.choices');
        if (box) {
          const over = () => Array.from(box.children).some((b) => b.scrollWidth > b.clientWidth + 1);
          if (over()) box.classList.add('is-tight');
          if (over() && box.classList.contains('is-grid')) box.classList.replace('is-grid', 'is-col');
        }
        const f = card.querySelector('.person-face');
        const room = () => card.offsetHeight - (ctx.stage.clientHeight - 12);
        f.style.width = '';
        card.classList.remove('is-compact');
        if (room() > 0) f.style.width = Math.max(56, f.offsetWidth - room()) + 'px';
        if (room() > 0) card.classList.add('is-compact');
        // Kdyby se karta nevešla ani tak, dá se v ní posunout (nic se neschová pod nadpis).
        card.parentNode.style.maxHeight = ctx.stage.clientHeight + 'px';
      }

      /* Otázka na jméno → { ok, hint, score }; se zobrazenou nápovědou se správná odpověď počítá napůl. */
      async function ask(p, ps, q, withHint) {
        ctx.status(q);
        const card = h('div', { class: 'person-card' },
          face(p),
          !p.sur && ctx.level <= 2 ? h('span', { class: 'person-job' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, p.je), ' ' + p.job) : null);
        K.show(ctx, card);
        let hinted = false;
        let hb = null;
        if (withHint && p.sur) {
          hb = h('button', { class: 'btn btn-secondary btn-small person-hint', type: 'button' }, 'Nápověda');
          U.tap(hb, () => {
            if (hinted || hb.disabled || !ctx.alive) return;
            hinted = true;
            ctx.sound.tap();
            hb.replaceWith(pic(p.sur));
          });
          card.appendChild(hb);
        }
        let names = ps.map((x) => x.name);
        if (names.length > 4) names = [p.name].concat(U.sample(names.filter((n) => n !== p.name), 3));
        const pr = K.choose(ctx, U.shuffle(names).map((n) => ({ label: n, value: n })), { answer: p.name, layout: 'grid' });
        fit(card);
        const res = await pr;
        if (hb && !hinted) hb.replaceWith(pic(p.sur)); // po odpovědi obrázek ukázat vždy, ať se spojení upevní
        ctx.status(res.correct ? 'Správně, to je ' + title(p) + '.' : 'To je ' + title(p) + '.');
        await ctx.sleep(res.correct ? 1000 : 2000);
        return { ok: res.correct, hint: res.correct && hinted, score: res.correct ? (hinted ? 0.5 : 1) : 0 };
      }
    }
  });
})();
