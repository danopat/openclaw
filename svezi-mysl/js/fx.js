/* Svěží mysl — oslavné efekty: konfety a načítání čísel. Respektuje „omezit pohyb“. */
(function () {
  'use strict';
  const SM = window.SM;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FX = (SM.fx = {});

  FX.confetti = function () {
    if (reduced()) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const c = canvas.getContext('2d');
    if (!c) { canvas.remove(); return; }
    c.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const colors = ['--mem', '--per', '--dec', '--word', '--logic', '--sun'].map((v) => css.getPropertyValue(v).trim() || '#f2b705');
    const parts = [];
    for (let i = 0; i < 110; i++) {
      parts.push({
        x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.32,
        vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 11 - 4,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        w: 7 + Math.random() * 6, h: 4 + Math.random() * 4,
        color: colors[i % colors.length]
      });
    }
    const t0 = performance.now();
    const tick = (now) => {
      const t = now - t0;
      c.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        c.save();
        c.globalAlpha = Math.max(0, 1 - t / 2200);
        c.translate(p.x, p.y);
        c.rotate(p.r);
        c.fillStyle = p.color;
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c.restore();
      });
      if (t < 2200) requestAnimationFrame(tick); else canvas.remove();
    };
    requestAnimationFrame(tick);
  };

  /** Plynule napočítá číslo v prvku od from do to (s předponou, např. „+“). */
  FX.countUp = function (el, to, prefix, from) {
    prefix = prefix || '';
    from = from || 0;
    if (reduced() || to === from) { el.textContent = prefix + to; return; }
    const t0 = performance.now();
    const dur = 700;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      el.textContent = prefix + v;
      if (k < 1) requestAnimationFrame(tick);
    };
    el.textContent = prefix + from;
    requestAnimationFrame(tick);
  };
})();
