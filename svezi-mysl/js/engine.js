/* Svěží mysl — herní motivace: cesta, body, denní cíl, série dní, záchranné dny a odznaky. */
(function () {
  'use strict';
  const SM = window.SM;
  const U = SM.util;
  const store = SM.store;
  const UNITS = SM.places.UNITS;

  // Každá zastávka: 2 lekce, truhla, 2 lekce, závěrečná lekce s pohlednicí.
  const NODE_TYPES = ['lesson', 'lesson', 'chest', 'lesson', 'lesson', 'postcard'];
  const GOALS = [
    { xp: 20, name: 'Pohodový', time: 'asi 5 minut denně' },
    { xp: 40, name: 'Pravidelný', time: 'asi 10 minut denně' },
    { xp: 60, name: 'Náročný', time: 'asi 15 minut denně' }
  ];
  const MAX_FREEZES = 2;
  const CHEST_XP = 15;

  const E = (SM.engine = {});
  E.UNITS = UNITS;
  E.GOALS = GOALS;
  E.CHEST_XP = CHEST_XP;
  E.MAX_FREEZES = MAX_FREEZES;
  const P = () => store.profile();

  /* ---------- Cesta ---------- */
  function lessonIndex(n) {
    if (NODE_TYPES[n] !== 'lesson') return -1;
    let k = -1;
    for (let i = 0; i <= n; i++) if (NODE_TYPES[i] === 'lesson') k++;
    return k;
  }
  E.nodes = (u) => NODE_TYPES.map((type, n) => ({ u: u, n: n, type: type, k: lessonIndex(n) }));
  E.nodeKey = (u, n) => u + '-' + n;
  E.isDone = (u, n) => !!P().done[E.nodeKey(u, n)];
  /** První nedokončený uzel. Po dokončení celé cesty je u === UNITS.length. */
  E.position = () => {
    for (let u = 0; u < UNITS.length; u++) {
      for (let n = 0; n < NODE_TYPES.length; n++) if (!E.isDone(u, n)) return { u: u, n: n };
    }
    return { u: UNITS.length, n: 0 };
  };
  E.finished = () => E.position().u >= UNITS.length;
  E.reachedUnit = () => Math.min(E.position().u, UNITS.length - 1);
  E.nodeState = (u, n) => {
    if (E.isDone(u, n)) return 'done';
    const pos = E.position();
    return pos.u === u && pos.n === n ? 'current' : 'locked';
  };
  E.unitDone = (u) => NODE_TYPES.filter((_, n) => E.isDone(u, n)).length;

  /* ---------- Odemykání her ---------- */
  const INTRO = {};
  UNITS.forEach((unit, i) => unit.intro.forEach((id) => { INTRO[id] = i; }));
  E.introUnit = (id) => (INTRO[id] != null ? INTRO[id] : 0);
  E.isUnlocked = (id) => E.introUnit(id) <= E.reachedUnit() || E.finished() || !!P().early_unlock[id];
  E.unlockEarly = (id) => { P().early_unlock[id] = true; store.save(); };
  E.unlockedGames = () => Object.keys(SM.games).filter(E.isUnlocked);

  /* ---------- Oblíbenost her (palec nahoru / dolů po hře) ----------
     like: −3 … +3, každý palec ji posune o jedna. Oblíbené hry se v lekcích a procvičování nabízejí častěji,
     neoblíbené méně a při −3 vůbec (ve volném hraní zůstávají a v kartě Hry jdou vrátit). */
  E.LIKE_HIDE = -3;
  E.like = (id) => store.game(id).like || 0;
  E.isHidden = (id) => E.like(id) <= E.LIKE_HIDE;
  E.setLike = (id, v) => {
    const st = store.game(id);
    st.like = U.clamp(Math.round(v), -3, 3);
    store.save();
    return st.like;
  };

  /* ---------- Sestavení lekcí ---------- */
  const weight = (id) => {
    const st = store.game(id);
    // Méně hraná a dávno hraná hra má přednost; oblíbenost posune hru dopředu nebo dozadu.
    return (st.plays || 0) * 2 + (st.last ? Math.min(6, (Date.now() - st.last) / -86400000 + 6) : 0) - (st.like || 0) * 2.5;
  };
  function fill(picks, pool, size, rnd) {
    const used = {};
    picks.forEach((id) => { used[SM.games[id].domain] = true; });
    const free = pool.filter((id) => picks.indexOf(id) === -1);
    // Hry, které hráč třemi palci dolů odmítl, se nenabízejí (jen kdyby jinak nezbyla žádná hra).
    let open = free.filter((id) => !E.isHidden(id));
    if (!open.length && !picks.length) open = free;
    const cand = U.shuffle(open, rnd).sort((a, b) => weight(a) - weight(b));
    while (picks.length < size && cand.length) {
      let i = cand.findIndex((id) => !used[SM.games[id].domain]);
      if (i < 0) i = 0;
      const id = cand.splice(i, 1)[0];
      picks.push(id);
      used[SM.games[id].domain] = true;
    }
    return picks;
  }
  /** Hry pro lekci na uzlu n zastávky u. Nové hry zastávky mají přednost. */
  E.lessonPlan = (u, n, attempt) => {
    const unit = UNITS[u];
    const type = NODE_TYPES[n];
    const rnd = U.rng(1 + u * 1009 + n * 101 + (attempt || 0) * 7919);
    const size = type === 'postcard' ? 4 : 3;
    const fresh = unit.intro.filter((id) => SM.games[id] && !E.isHidden(id));
    const pool = Object.keys(SM.games).filter((id) => E.introUnit(id) <= u || P().early_unlock[id]);
    const k = lessonIndex(n);
    let picks = [];
    let keepOrder = false;
    if (fresh.length) {
      if (type === 'postcard' || k === 0) { picks = fresh.slice(0, size); keepOrder = true; }
      else picks = [fresh[(2 + k) % fresh.length]];
    }
    fill(picks, pool, size, rnd);
    return keepOrder ? picks : U.shuffle(picks, rnd);
  };
  /** Procvičování: tři odemčené hry, které jste hráli nejméně nebo nejdávněji. */
  E.practicePlan = () => fill([], E.unlockedGames(), 3, U.rng(Date.now() % 100000));

  /* ---------- Body a denní cíl ---------- */
  E.gameXp = (perf) => 5 + Math.round(U.clamp(perf || 0, 0, 1) * 5);
  E.goal = () => P().goal || 40;
  E.setGoal = (xp) => { P().goal = xp; store.save(); };
  E.xpToday = () => { const d = store.day(U.dayKey()); return d ? d.xp || 0 : 0; };
  E.goalDays = () => Object.keys(store.days()).filter((k) => store.days()[k].goal).length;

  /* ---------- Série dní ---------- */
  const activeDay = (key) => { const d = store.day(key); return !!(d && d.n > 0); };
  E.isActive = activeDay;
  E.isFrozen = (key) => !!P().frozen[key];
  /** Počet dní v řadě s hraním. Dny zachráněné záchranným dnem řadu nepřeruší. */
  E.streakAt = (date) => {
    let d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let n = 0;
    for (let i = 0; i < 4000; i++) {
      const key = U.dayKey(d);
      if (activeDay(key)) n++;
      else if (!P().frozen[key]) break;
      d = U.addDays(d, -1);
    }
    return n;
  };
  E.streak = () => {
    const today = new Date();
    return activeDay(U.dayKey(today)) ? E.streakAt(today) : E.streakAt(U.addDays(today, -1));
  };
  /** Jednou denně: pokud jste včera (či déle) nehráli, použije záchranné dny. */
  E.checkStreak = () => {
    const p = P();
    const today = U.dayKey();
    if (p.streakChecked === today) return null;
    p.streakChecked = today;
    const missing = [];
    let d = U.addDays(new Date(), -1);
    let found = false;
    for (let i = 0; i < 400; i++) {
      const key = U.dayKey(d);
      if (activeDay(key) || p.frozen[key]) { found = true; break; }
      missing.push(key);
      d = U.addDays(d, -1);
    }
    let notice = null;
    if (found && missing.length) {
      const before = E.streakAt(d);
      if (before > 0) {
        if (missing.length <= p.freezes) {
          missing.forEach((k) => { p.frozen[k] = true; });
          p.freezes -= missing.length;
          notice = { type: 'freeze', used: missing.length, streak: before };
        } else {
          notice = { type: 'broken', streak: before };
        }
      }
    }
    p.notice = notice;
    store.save();
    return notice;
  };

  /* ---------- Odznaky ---------- */
  const pl = U.plural;
  E.BADGES = [
    { id: 'serie', name: 'Vytrvalost', icon: 'flame', tiers: [3, 7, 14, 30, 60, 100], value: () => P().bestStreak || 0,
      text: (n) => 'Trénujte ' + n + ' ' + pl(n, 'den', 'dny', 'dní') + ' v řadě.' },
    { id: 'cil', name: 'Splněný cíl', icon: 'target', tiers: [1, 7, 30, 100], value: () => E.goalDays(),
      text: (n) => n === 1 ? 'Splňte denní cíl.' : 'Splňte denní cíl ' + n + '×.' },
    { id: 'body', name: 'Píle', icon: 'star', tiers: [100, 500, 1000, 2500, 5000, 10000], value: () => P().xp || 0,
      text: (n) => 'Získejte celkem ' + n.toLocaleString('cs-CZ') + ' bodů.' },
    { id: 'cesta', name: 'Cestovatel', icon: 'postcard', tiers: [1, 3, 6, 9, 12], value: () => Object.keys(P().postcards).length,
      text: (n) => 'Získejte ' + n + ' ' + pl(n, 'pohlednici', 'pohlednice', 'pohlednic') + '.' },
    { id: 'presnost', name: 'Bez chyby', icon: 'check', tiers: [1, 5, 20, 50], value: () => P().perfect || 0,
      text: (n) => 'Dokončete ' + n + ' ' + pl(n, 'lekci', 'lekce', 'lekcí') + ' bez chyby.' },
    { id: 'pestrost', name: 'Všestrannost', icon: 'grid', tiers: [5, 10, 15, 22, 31],
      value: () => Object.keys(SM.games).filter((id) => store.game(id).plays > 0).length,
      text: (n) => 'Vyzkoušejte ' + n + ' různých her.' },
    { id: 'rano', name: 'Ranní ptáče', icon: 'sunrise', tiers: [1, 10, 30], value: () => P().early || 0,
      text: (n) => 'Dokončete ' + n + ' ' + pl(n, 'lekci', 'lekce', 'lekcí') + ' před devátou ráno.' },
    { id: 'rekord', name: 'Rekordy', icon: 'trophy', tiers: [3, 10, 30], value: () => P().records || 0,
      text: (n) => 'Překonejte ' + n + '× svůj osobní rekord ve hře.' },
    { id: 'lustitel', name: 'Luštitel', icon: 'bulb', tiers: [1, 10, 30, 100], value: () => Object.keys(P().riddles || {}).length,
      text: (n) => (n === 1 ? 'Vyluštěte hádanku dne.' : 'Vyluštěte ' + n + ' hádanek dne.') },
    { id: 'mistr', name: 'Mistr paměti', icon: 'cap', tiers: [3, 6], value: () => Object.keys(P().tricks || {}).length,
      text: (n) => (n === 6 ? 'Projděte všech 6 triků ve Škole paměti.' : 'Projděte ' + n + ' triky ve Škole paměti.') }
  ];
  E.badgeTier = (b) => b.tiers.filter((t) => b.value() >= t).length;
  E.checkBadges = () => {
    const p = P();
    const out = [];
    E.BADGES.forEach((b) => {
      const tier = E.badgeTier(b);
      if (tier > (p.badges[b.id] || 0)) { p.badges[b.id] = tier; out.push({ id: b.id, tier: tier }); }
    });
    return out;
  };

  /* ---------- Hádanka dne ---------- */
  /** Dnešní hádanka (pro všechny stejná, střídají se po dnech) a případná dnešní odpověď. */
  E.riddleToday = () => {
    const list = SM.riddles.LIST;
    const key = U.dayKey();
    return { key: key, r: list[U.dayNumber() % list.length], done: (P().riddles || {})[key] || null };
  };
  /** Uloží odpověď na dnešní hádanku a připíše body (správně 10, jinak 5). */
  /* ---------- Škola paměti ---------- */
  E.tricksDone = () => Object.keys(P().tricks || {}).length;
  /** Stav triku: done = probraný, open = na řadě, locked = čeká na předchozí. */
  E.trickState = (id) => {
    const list = SM.school ? SM.school.LIST : [];
    const i = list.findIndex((t) => t.id === id);
    const done = P().tricks || {};
    if (done[id]) return 'done';
    return i >= 0 && list.slice(0, i).every((t) => done[t.id]) ? 'open' : 'locked';
  };
  E.finishTrick = (snap, id) => {
    const p = P();
    p.tricks = p.tricks || {};
    const first = !p.tricks[id];
    if (first) p.tricks[id] = U.dayKey();
    return E.finish(snap, { kind: 'trick', first: first });
  };

  E.answerRiddle = (snap, r, ok, value) => {
    const p = P();
    p.riddles = p.riddles || {};
    p.riddles[U.dayKey()] = { id: r.id, ok: !!ok, v: value };
    return E.finish(snap, { kind: 'riddle', ok: !!ok });
  };

  /* ---------- Průběh hraní ---------- */
  E.begin = () => ({ todayActive: activeDay(U.dayKey()), streak: E.streak(), xpToday: E.xpToday() });

  /** Uloží výsledek jedné hry a připíše body. */
  E.recordGame = (id, level, res, ms) => {
    const g = SM.games[id];
    const perf = U.clamp(res.perf || 0, 0, 1);
    const newLevel = U.clamp(res.newLevel != null ? res.newLevel : level + (res.levelDelta || 0), 1, g.maxLevel);
    const score = Math.round((level - 1) * 10 + perf * 10);
    const xp = E.gameXp(perf);
    // Úspěšnost (0–1) a rychlost (ms na odpověď) pro sledování pokroku; hra je může dodat sama.
    const acc = U.clamp(res.acc != null ? res.acc : perf, 0, 1);
    const rt = res.rt != null && isFinite(res.rt) && res.rt > 0 ? res.rt : null;
    const prev = store.history(id).slice(-1)[0] || null;
    const rec = store.recordResult({ id: id, level: level, newLevel: newLevel, score: score, xp: xp, ms: ms, metric: res.metric, acc: acc, rt: rt });
    store.addXp(xp);
    if (rec.isBest) { P().records = (P().records || 0) + 1; store.save(); }
    return { id: id, level: level, newLevel: newLevel, score: score, isBest: rec.isBest, xp: xp, perf: perf, acc: acc, rt: rt, prev: prev, res: res, ms: ms };
  };

  /**
   * Dokončení lekce, procvičování, volné hry nebo truhly.
   * info: { kind: 'lesson'|'practice'|'free'|'chest', u, n, results: [výsledky z recordGame] }
   * Vrací { xp, parts, events, streak, xpToday, goal }.
   */
  E.finish = (snap, info) => {
    const p = P();
    const events = [];
    const parts = [];
    const results = info.results || [];
    const gameXp = results.reduce((s, r) => s + r.xp, 0);
    if (gameXp) parts.push({ label: results.length > 1 ? 'Hry' : 'Hra', xp: gameXp });
    let bonus = 0;
    if (info.kind === 'lesson' || info.kind === 'practice') {
      bonus += 5;
      parts.push({ label: 'Dokončená lekce', xp: 5 });
      if (results.length && results.every((r) => r.perf >= 0.8)) {
        bonus += 5;
        parts.push({ label: 'Bez chyby', xp: 5 });
        p.perfect = (p.perfect || 0) + 1;
      }
      p.lessons = (p.lessons || 0) + 1;
      if (new Date().getHours() < 9) p.early = (p.early || 0) + 1;
    }
    if (info.kind === 'chest') { bonus += CHEST_XP; parts.push({ label: 'Truhla', xp: CHEST_XP }); }
    if (info.kind === 'riddle') { const x = info.ok ? 10 : 5; bonus += x; parts.push({ label: 'Hádanka dne', xp: x }); }
    if (info.kind === 'trick') { const x = info.first ? 10 : 3; bonus += x; parts.push({ label: 'Škola paměti', xp: x }); }
    if (bonus) store.addXp(bonus);

    if ((info.kind === 'lesson' || info.kind === 'chest') && info.u != null) {
      const before = E.position();
      const key = E.nodeKey(info.u, info.n);
      const first = !p.done[key];
      p.done[key] = (p.done[key] || 0) + 1;
      if (first && NODE_TYPES[info.n] === 'postcard') {
        const place = UNITS[info.u];
        if (!p.postcards[place.id]) { p.postcards[place.id] = U.dayKey(); events.push({ type: 'postcard', u: info.u }); }
      }
      const after = E.position();
      if (after.u > before.u && after.u < UNITS.length) {
        const games = UNITS[after.u].intro.filter((id) => !p.early_unlock[id]);
        if (games.length) events.push({ type: 'unlock', u: after.u, games: games });
      }
      if (after.u >= UNITS.length && before.u < UNITS.length) events.push({ type: 'finale' });
    }

    const todayKey = U.dayKey();
    const streak = E.streak();
    if (!snap.todayActive && activeDay(todayKey)) {
      events.unshift({ type: 'streak', from: snap.streak, to: streak });
      if (streak > 0 && streak % 7 === 0 && p.freezes < MAX_FREEZES) {
        p.freezes++;
        events.push({ type: 'freeze', streak: streak });
      }
    }
    p.bestStreak = Math.max(p.bestStreak || 0, streak);

    const day = store.today();
    if (snap.xpToday < E.goal() && day.xp >= E.goal()) {
      day.goal = true;
      events.push({ type: 'goal', goal: E.goal() });
    }
    E.checkBadges().forEach((b) => events.push({ type: 'badge', id: b.id, tier: b.tier }));
    store.save();
    return { xp: gameXp + bonus, parts: parts, events: events, streak: streak, xpToday: day.xp, goal: E.goal() };
  };
})();
