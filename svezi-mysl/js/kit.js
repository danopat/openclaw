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
        b.classList.add(ok ? 'is-correct' : 'is-wrong');
        if (!ok) btns.forEach((x, i) => { if (options[i].value === conf.answer) x.classList.add('is-correct'); });
        box.classList.add('is-locked');
        if (!conf.silent) ctx.feedback(ok);
        resolve({ value: o.value, correct: ok, rt: (performance.now() - start) / SM.timeScale });
      });
      box.appendChild(b);
      return b;
    });
    (conf.container || ctx.foot).appendChild(box);
  });

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
    (conf.container || ctx.stage).appendChild(h('div', { class: 'kp' }, disp, grid));
    render();
  });

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

  /** Obvyklé pravidlo pro změnu úrovně podle úspěšnosti. */
  K.levelByAcc = (acc, up, down) => (acc >= (up || 0.9) ? 1 : acc < (down || 0.6) ? -1 : 0);
})();
