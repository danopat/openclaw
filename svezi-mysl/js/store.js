/* Svěží mysl — ukládání nastavení, výsledků a postupu.
   Vše zůstává jen v tomto zařízení (localStorage). Když úložiště není k dispozici
   (anonymní okno, zablokovaná data), aplikace funguje dál a data drží jen v paměti. */
(function () {
  'use strict';
  var SM = window.SM;
  var U = SM.util;
  var KEY = 'svezi-mysl.v1';
  var MAX_HISTORY = 1500;
  var data = null;

  function defaultProfile() {
    return {
      onboarded: false,
      goal: 40,          // denní cíl v bodech
      xp: 0,             // body celkem
      freezes: 0,        // záchranné dny v zásobě (max. 2)
      frozen: {},        // dny zachráněné záchranným dnem
      bestStreak: 0,
      done: {},          // dokončené uzly cesty: 'u-n' → počet
      postcards: {},     // id místa → den získání
      badges: {},        // id odznaku → dosažený stupeň
      lessons: 0,
      perfect: 0,
      early: 0,
      records: 0,
      early_unlock: {},  // hry odemčené předčasně
      seen: {},          // hry, u kterých už hráč viděl úvod
      streakChecked: null,
      notice: null       // zpráva na úvodní obrazovku (např. využitý záchranný den)
    };
  }
  function defaults() {
    return {
      settings: { scale: 1, theme: 'auto', sound: true, autoSpeak: false },
      profile: defaultProfile(),
      games: {},
      history: [],
      days: {},
      flags: {}
    };
  }

  function load() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; }
    var d = defaults();
    if (raw) {
      try {
        var p = JSON.parse(raw);
        if (p && typeof p === 'object') {
          d.settings = Object.assign(d.settings, p.settings || {});
          d.profile = Object.assign(defaultProfile(), p.profile || {});
          d.games = p.games || {};
          d.history = Array.isArray(p.history) ? p.history : [];
          d.days = p.days || {};
          d.flags = p.flags || {};
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
  S.save = save;

  S.settings = function () { return data.settings; };
  S.setSetting = function (k, v) { data.settings[k] = v; save(); };
  S.profile = function () { return data.profile; };

  S.flag = function (k) { return !!data.flags[k]; };
  S.setFlag = function (k, v) { data.flags[k] = v; save(); };

  /** Stav jedné hry: { level, best, plays, last } */
  S.game = function (id) {
    var g = data.games[id];
    if (!g) g = data.games[id] = { level: 1, best: 0, plays: 0, last: null };
    return g;
  };

  /** Uloží výsledek jedné hry. Vrací { isBest, prevBest }. */
  S.recordResult = function (entry) {
    var g = S.game(entry.id);
    var prevBest = g.best || 0;
    var isBest = g.plays > 0 && entry.score > prevBest;
    g.best = Math.max(prevBest, entry.score);
    g.plays = (g.plays || 0) + 1;
    g.level = entry.newLevel;
    g.last = Date.now();
    data.history.push({
      g: entry.id, t: Date.now(), lv: entry.level, p: entry.score,
      xp: entry.xp || 0, ms: Math.round(entry.ms || 0), m: entry.metric || null,
      a: entry.acc != null ? Math.round(entry.acc * 100) : null, // úspěšnost v %
      r: entry.rt != null ? Math.round(entry.rt) : null          // rychlost: ms na odpověď (méně = lépe)
    });
    if (data.history.length > MAX_HISTORY) data.history.splice(0, data.history.length - MAX_HISTORY);
    var day = S.today();
    day.n += 1;
    day.ms += Math.round(entry.ms || 0);
    save();
    return { isBest: isBest, prevBest: prevBest };
  };

  S.history = function (id) {
    return id ? data.history.filter(function (h) { return h.g === id; }) : data.history.slice();
  };

  /* ----- Dny ----- */
  S.day = function (key) { return data.days[key] || null; };
  S.today = function () {
    var key = U.dayKey();
    var d = data.days[key];
    if (!d) d = data.days[key] = { n: 0, ms: 0, xp: 0 };
    if (d.xp == null) d.xp = 0;
    return d;
  };
  S.days = function () { return data.days; };
  S.addXp = function (n) {
    var d = S.today();
    d.xp += n;
    data.profile.xp += n;
    save();
  };
  /** Posledních N dní (od nejstaršího), každý { date, key, n, ms, xp, frozen }. */
  S.lastDays = function (count) {
    count = count || 7;
    var out = [];
    var today = new Date();
    for (var i = count - 1; i >= 0; i--) {
      var d = U.addDays(today, -i);
      var key = U.dayKey(d);
      var rec = data.days[key];
      out.push({ date: d, key: key, n: rec ? rec.n : 0, ms: rec ? rec.ms : 0, xp: rec ? rec.xp || 0 : 0, frozen: !!data.profile.frozen[key] });
    }
    return out;
  };
  S.totalGames = function () { return data.history.length; };

  S.reset = function () {
    var keep = data.settings;
    var onboarded = data.profile.onboarded;
    var goal = data.profile.goal;
    data = defaults();
    data.settings = keep;
    data.profile.onboarded = onboarded;
    data.profile.goal = goal;
    save();
  };

  load();
})();
