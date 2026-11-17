/* Svěží mysl — statistiky her: úspěšnost, rychlost a jejich vývoj v čase.
   Úspěšnost = podíl správných odpovědí v % (u her bez jednoznačných odpovědí výkon ve hře).
   Rychlost = typická doba na jednu odpověď v ms (méně = lépe); jen u her, kde dává smysl (game.pace). */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const store = SM.store;
  const S = (SM.stats = {});
  const DAY = 86400000;

  /* Úspěšnost jednoho výsledku v % (0–100). Starší výsledky bez uložené úspěšnosti se dopočítají. */
  S.acc = (e) => {
    if (e.a != null) return e.a;
    const m = e.m || {};
    if (m.acc != null) return m.acc;
    if (m.perf != null) return m.perf;
    return U.clamp(Math.round((e.p - (e.lv - 1) * 10) * 10), 0, 100);
  };
  /* Rychlost jednoho výsledku v ms, nebo null. */
  S.rt = (e) => {
    if (e.r != null) return e.r;
    const m = e.m || {};
    if (e.g === 'blesk' && m.thr != null) return m.thr;
    if (e.g === 'poradi' && m.perItem != null) return m.perItem * 1000;
    if (m.rt != null && m.rt > 0) return m.rt;
    return null;
  };

  S.pace = (id) => (SM.games[id] && SM.games[id].pace) || null;
  S.speedTitle = (id) => (S.pace(id) && S.pace(id).title) || 'Rychlost';
  /* „2,1 s“, s withPer „2,1 s na odpověď“; u Bleskového pohledu „160 ms“. */
  S.fmtRt = (id, ms, withPer) => {
    const pace = S.pace(id) || {};
    const sec = ms / 1000;
    const whole = sec >= 10 || Math.abs(sec - Math.round(sec)) < 0.05;
    const v = pace.ms ? Math.round(ms) + ' ms' : U.num(whole ? Math.round(sec) : sec, whole ? 0 : 1) + ' s';
    return withPer && pace.per ? v + ' ' + pace.per : v;
  };
  S.fmtAcc = (a) => Math.round(a) + ' %';

  const meanAcc = (list) => (list.length ? U.mean(list.map(S.acc)) : null);
  const medRt = (list) => {
    const v = list.map(S.rt).filter((x) => x != null);
    return v.length ? U.median(v) : null;
  };

  /**
   * Přehled hry: teď (posledních až 5 her) a srovnání začátku s koncem (prvních a posledních k her, k = 2 až 5).
   */
  S.summary = (id) => {
    const hist = store.history(id);
    const n = hist.length;
    const k = Math.min(5, Math.floor(n / 2));
    const recent = hist.slice(-5);
    return {
      n: n,
      recent: recent.length,
      level: store.game(id).level || 1,
      levelStart: n ? hist[0].lv : 1,
      accNow: meanAcc(recent),
      rtNow: medRt(recent),
      compare: k >= 2 ? {
        k: k,
        accStart: meanAcc(hist.slice(0, k)), accEnd: meanAcc(hist.slice(-k)),
        rtStart: medRt(hist.slice(0, k)), rtEnd: medRt(hist.slice(-k))
      } : null
    };
  };

  /* Směr změny: 'up' = zlepšení, 'down' = zhoršení, 'same' = zhruba stejně. */
  S.accTrend = (a, b) => (a == null || b == null ? null : b - a >= 5 ? 'up' : a - b >= 5 ? 'down' : 'same');
  S.rtTrend = (a, b) => (a == null || b == null ? null : b <= a * 0.9 ? 'up' : b >= a * 1.1 ? 'down' : 'same');

  /**
   * Body grafu pro metriku 'acc' | 'rt' | 'lv' za posledních `days` dní (null = vše).
   * Když jsou výsledky aspoň ze 3 různých dnů, jeden bod = jeden den (průměr úspěšnosti, medián rychlosti,
   * nejvyšší hraná úroveň). Jinak jeden bod = jedna hra.
   */
  S.series = (id, metric, days) => {
    let hist = store.history(id);
    if (days) {
      const from = Date.now() - days * DAY;
      hist = hist.filter((e) => e.t >= from);
    }
    const val = metric === 'acc' ? S.acc : metric === 'rt' ? S.rt : (e) => e.lv;
    const byDay = {};
    const order = [];
    hist.forEach((e) => {
      const k = U.dayKey(new Date(e.t));
      if (!byDay[k]) { byDay[k] = []; order.push(k); }
      byDay[k].push(e);
    });
    if (order.length >= 3) {
      const points = [];
      order.forEach((k) => {
        const vals = byDay[k].map(val).filter((v) => v != null);
        if (!vals.length) return;
        const v = metric === 'rt' ? U.median(vals) : metric === 'lv' ? Math.max.apply(null, vals) : U.mean(vals);
        points.push({ date: U.parseDayKey(k), day: U.dayNumber(U.parseDayKey(k)), v: v, n: byDay[k].length });
      });
      return { mode: 'day', points: points };
    }
    const points = [];
    hist.forEach((e, i) => {
      const v = val(e);
      if (v != null) points.push({ date: new Date(e.t), v: v, n: 1, idx: i + 1, lv: e.lv });
    });
    return { mode: 'play', points: points };
  };
})();
