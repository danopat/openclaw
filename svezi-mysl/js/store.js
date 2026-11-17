/* Svěží mysl — ukládání nastavení a výsledků.
   Vše zůstává jen v tomto zařízení (localStorage). Když úložiště není k dispozici
   (anonymní okno, zablokovaná data), aplikace funguje dál a data drží jen v paměti. */
(function () {
  'use strict';
  var SM = window.SM;
  var U = SM.util;
  var KEY = 'svezi-mysl.v1';
  var MAX_HISTORY = 600;
  var data = null;

  function defaults() {
    return {
      settings: { scale: 1, theme: 'auto', sound: true, autoSpeak: false },
      games: {},
      history: [],
      days: {},
      daily: { date: null, plan: [], done: [] },
      flags: {}
    };
  }

  function load() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; }
    var d = defaults();
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          d.settings = Object.assign(d.settings, parsed.settings || {});
          d.games = parsed.games || {};
          d.history = Array.isArray(parsed.history) ? parsed.history : [];
          d.days = parsed.days || {};
          d.daily = Object.assign(d.daily, parsed.daily || {});
          d.flags = parsed.flags || {};
        }
      } catch (e) { /* poškozená data: začneme znovu */ }
    }
    data = d;
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* bez úložiště */ }
  }

  var S = (SM.store = {});
  S.load = load;

  S.settings = function () { return data.settings; };
  S.setSetting = function (k, v) { data.settings[k] = v; save(); };

  S.flag = function (k) { return !!data.flags[k]; };
  S.setFlag = function (k, v) { data.flags[k] = v; save(); };

  /** Stav jedné hry: { level, best, plays, last } */
  S.game = function (id) {
    var g = data.games[id];
    if (!g) g = data.games[id] = { level: 1, best: 0, plays: 0, last: null };
    return g;
  };

  /**
   * Uloží výsledek hry. Vrací { isBest, prevBest }.
   * entry: { id, level, newLevel, points, ms, metric }
   */
  S.recordResult = function (entry) {
    var g = S.game(entry.id);
    var prevBest = g.best || 0;
    var isBest = g.plays > 0 && entry.points > prevBest;
    g.best = Math.max(prevBest, entry.points);
    g.plays = (g.plays || 0) + 1;
    g.level = entry.newLevel;
    g.last = Date.now();
    data.history.push({
      g: entry.id,
      t: Date.now(),
      lv: entry.level,
      p: entry.points,
      ms: Math.round(entry.ms || 0),
      m: entry.metric || null
    });
    if (data.history.length > MAX_HISTORY) data.history.splice(0, data.history.length - MAX_HISTORY);
    var key = U.dayKey();
    var day = data.days[key] || (data.days[key] = { n: 0, ms: 0 });
    day.n += 1;
    day.ms += Math.round(entry.ms || 0);
    save();
    return { isBest: isBest, prevBest: prevBest };
  };

  S.history = function (id) {
    return id ? data.history.filter(function (h) { return h.g === id; }) : data.history.slice();
  };

  S.day = function (key) { return data.days[key] || null; };

  /** Počet dní v řadě s alespoň jednou hrou (dnešek se počítá, jakmile hrajete). */
  S.streak = function () {
    var d = new Date();
    var n = 0;
    if (!data.days[U.dayKey(d)]) d = U.addDays(d, -1);
    while (data.days[U.dayKey(d)]) { n++; d = U.addDays(d, -1); }
    return n;
  };

  /** Posledních 7 dní (od nejstaršího), každý { date, key, n, ms }. */
  S.lastDays = function (count) {
    count = count || 7;
    var out = [];
    var today = new Date();
    for (var i = count - 1; i >= 0; i--) {
      var d = U.addDays(today, -i);
      var key = U.dayKey(d);
      var rec = data.days[key];
      out.push({ date: d, key: key, n: rec ? rec.n : 0, ms: rec ? rec.ms : 0 });
    }
    return out;
  };

  S.totalGames = function () { return data.history.length; };

  /* ----- Denní trénink ----- */
  S.daily = function () { return data.daily; };
  S.setDaily = function (plan) {
    data.daily = { date: U.dayKey(), plan: plan, done: [] };
    save();
    return data.daily;
  };
  S.markDailyDone = function (id) {
    if (data.daily.date !== U.dayKey()) return;
    if (data.daily.done.indexOf(id) === -1) data.daily.done.push(id);
    save();
  };

  S.reset = function () {
    var keep = data.settings;
    data = defaults();
    data.settings = keep;
    save();
  };

  load();
})();
