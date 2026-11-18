/* Svěží mysl — společné stavební kameny miniher (výběr odpovědi, číselná klávesnice). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const h = U.h;
  const K = (SM.kit = {});

  /** Vymaže plochu hry a vloží do ní obsah (vycentrovaný sloupec). */
  K.show = (ctx, ...nodes) => {
    ctx.stage.textContent = '';
    ctx.foot.textContent = '';
    const box = h('div', { class: 'stack' }, nodes);
    ctx.stage.appendChild(box);
    return box;
  };

  /**
   * Výběr jedné z možností velkými tlačítky.
   * options: [{ label, value, node?, aria? }], conf: { answer, container?, layout: 'grid'|'col'|'row', silent? }
   * → Promise<{ value, correct, rt }>
   */
  K.choose = (ctx, options, conf) => new Promise((resolve) => {
    const box = h('div', { class: 'choices is-' + (conf.layout || 'grid') + (conf.cls ? ' ' + conf.cls : '') });
    const start = performance.now();
    let done = false;
    const btns = options.map((o) => {
      const b = h('button', { class: 'btn choice', type: 'button' }, o.node || o.label);
      if (o.aria) b.setAttribute('aria-label', o.aria);
      U.tap(b, () => {
        if (done || !ctx.alive) return;
        done = true;
        const ok = o.value === conf.answer;
        const rt = (performance.now() - start) / SM.timeScale;
        if (!conf.noMark && ctx.mark) ctx.mark(ok, rt);
        b.classList.add(ok ? 'is-correct' : 'is-wrong');
        if (!ok) btns.forEach((x, i) => { if (options[i].value === conf.answer) x.classList.add('is-correct'); });
        box.classList.add('is-locked');
        if (!conf.silent) ctx.feedback(ok);
        resolve({ value: o.value, correct: ok, rt: rt });
      });
      box.appendChild(b);
      return b;
    });
    (conf.container || ctx.foot).appendChild(box);
    K.fitLabels(box);
    if (!conf.container) K.fitFoot(ctx, box);
  });

  /**
   * Dlouhé slovo, které se na úzkém displeji s velkým písmem nevejde na tlačítko: všem odpovědím menší písmo
   * (nejméně 0,8 rem), a když ani to nestačí, odpovědi pod sebe.
   */
  K.fitLabels = (box) => {
    const btns = Array.from(box.children);
    const over = () => btns.some((b) => b.scrollWidth > b.clientWidth + 1);
    if (!btns.length || !over()) return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 18;
    for (let f = parseFloat(getComputedStyle(btns[0]).fontSize) - 1; f >= 0.8 * rem; f--) {
      btns.forEach((b) => { b.style.fontSize = f + 'px'; });
      if (!over()) return;
    }
    btns.forEach((b) => { b.style.fontSize = ''; });
    box.classList.remove('is-grid', 'is-row');
    box.classList.add('is-col');
  };

  /**
   * Pojistka pro malý displej s velkým písmem: když by odpovědi dole vytlačily otázku nebo samy sebe
   * mimo obrazovku, přesunou se pod otázku do posuvné plochy hry.
   */
  K.fitFoot = (ctx, box) => {
    const stack = ctx.stage.firstElementChild;
    if (!stack || !/(auto|scroll)/.test(getComputedStyle(stack).overflowY) || box.parentNode !== ctx.foot) return;
    const play = ctx.stage.parentNode.getBoundingClientRect();
    const foot = ctx.foot.getBoundingClientRect();
    const squeezed = ctx.stage.clientHeight < Math.min(stack.scrollHeight, 48);
    if (foot.bottom > play.bottom + 1 || squeezed) stack.appendChild(box);
  };

  /**
   * Číselná klávesnice jako na telefonu → Promise<string> s napsanými číslicemi.
   * conf.length = přesný počet číslic (jedno políčko na číslici),
   * nebo conf.max = číslo o 1 až max číslicích (jedno pole). conf.okLabel = text potvrzovacího tlačítka.
   */
  K.keypad = (ctx, conf) => new Promise((resolve) => {
    const fixed = !conf.max;
    const len = fixed ? conf.length : conf.max;
    let val = '';
    let finished = false;
    const disp = h('div', { class: 'kp-display', 'aria-live': 'polite' });
    const ok = h('button', { class: 'btn btn-primary kp-key kp-ok', type: 'button' }, conf.okLabel || 'Hotovo');
    const ready = () => (fixed ? val.length === len : val.length > 0);
    const render = () => {
      disp.textContent = '';
      if (fixed) for (let i = 0; i < len; i++) disp.appendChild(h('span', { class: 'kp-digit' + (i < val.length ? ' is-filled' : '') }, val[i] || ''));
      else disp.appendChild(h('span', { class: 'kp-value' + (val ? ' is-filled' : '') }, val));
      ok.disabled = !ready();
    };
    const finish = () => {
      if (finished || !ready()) return;
      finished = true;
      resolve(val);
    };
    const press = (k) => {
      if (finished || !ctx.alive) return;
      if (k === 'ok') { finish(); return; }
      if (k === 'del') val = val.slice(0, -1);
      else if (!fixed && !val && k === '0') return; // číslo nezačíná nulou
      else if (val.length < len) val += k;
      ctx.sound.tap();
      render();
    };
    const grid = h('div', { class: 'kp-grid' });
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].forEach((k) => {
      const b = k === 'ok' ? ok : h('button', { class: 'btn kp-key' + (k === 'del' ? ' kp-del' : ''), type: 'button' }, k === 'del' ? 'Smazat' : k);
      U.tap(b, () => press(k));
      grid.appendChild(b);
    });
    ctx.on(window, 'keydown', (e) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Enter') press('ok');
    });
    const kp = h('div', { class: 'kp' }, disp, grid);
    (conf.container || ctx.stage).appendChild(kp);
    render();
    K.fitPad(ctx, kp, grid);
  });

  /**
   * Zmenší klávesy, když se klávesnice na malý displej s velkým písmem nevejde do plochy hry
   * (nejvýš na 46 px vysoké klávesy, zbytek případně dorovná posouvání plochy).
   */
  K.fitPad = (ctx, kp, grid) => {
    const box = kp.closest('.stack, .guess');
    const over = box ? K.overflow(box) : kp.offsetHeight - ctx.stage.clientHeight;
    if (over <= 0 || !grid.firstElementChild) return;
    const rows = Math.ceil(grid.children.length / 3);
    const keyH = grid.firstElementChild.offsetHeight;
    kp.style.setProperty('--kp-h', Math.max(46, Math.floor(keyH - over / rows)) + 'px');
  };

  /** O kolik px je obsah posuvné plochy vyšší než plocha sama (počítá i obsah vystrčený nahoru). */
  K.overflow = (box) => {
    let top = Infinity;
    let bottom = -Infinity;
    Array.from(box.children).forEach((k) => {
      const r = k.getBoundingClientRect();
      if (r.height) { top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom); }
    });
    if (top === Infinity) return 0;
    const cs = getComputedStyle(box);
    return Math.max(0, Math.ceil(bottom - top + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) - box.clientHeight));
  };

  /** Velké tlačítko dole (např. „Další“), hráč si tempo určuje sám → Promise po klepnutí. */
  K.next = (ctx, label, conf) => new Promise((resolve) => {
    conf = conf || {};
    if (!conf.keep) ctx.foot.textContent = '';
    const b = h('button', { class: 'btn ' + (conf.quiet ? 'btn-secondary' : 'btn-primary') + ' btn-lg', type: 'button' }, label);
    let done = false;
    U.tap(b, () => {
      if (done || !ctx.alive) return;
      done = true;
      ctx.sound.tap();
      b.disabled = true;
      resolve();
    });
    ctx.foot.appendChild(b);
  });

  /**
   * Prohlížení před zakrytím: tlačítko „Mám zapamatováno“ dole, volitelně s časovým limitem
   * (conf.limit v ms; ubývající proužek se vloží do conf.container) → Promise po klepnutí nebo vypršení.
   */
  K.study = (ctx, conf) => new Promise((resolve) => {
    conf = conf || {};
    let done = false;
    const btn = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, conf.label || 'Mám zapamatováno');
    const end = () => {
      if (done || !ctx.alive) return;
      done = true;
      btn.disabled = true;
      resolve();
    };
    U.tap(btn, () => { ctx.sound.tap(); end(); });
    ctx.foot.textContent = '';
    ctx.foot.appendChild(btn);
    if (conf.limit && conf.container) {
      const bar = h('i');
      conf.container.appendChild(h('div', { class: 'timebar', 'aria-hidden': 'true' }, bar));
      const limit = conf.limit * SM.timeScale;
      const start = performance.now();
      const tick = () => {
        if (done) return;
        const left = Math.max(0, 1 - (performance.now() - start) / limit);
        bar.style.transform = 'scaleX(' + left.toFixed(3) + ')';
        if (left <= 0) end(); else ctx.after(100 / SM.timeScale, tick);
      };
      tick();
    }
  });

  /** Uživatel si v systému zapnul omezení pohybu. */
  K.reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /** Obvyklé pravidlo pro změnu úrovně podle úspěšnosti. */
  K.levelByAcc = (acc, up, down) => (acc >= (up || 0.9) ? 1 : acc < (down || 0.6) ? -1 : 0);
})();
