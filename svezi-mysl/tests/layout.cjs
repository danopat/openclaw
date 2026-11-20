/* Kontrola rozvržení s velkým písmem („Větší“ a „Největší“) na malých iPhonech.
   Projde všechny hry na všech úrovních (hráči z tests/e2e.cjs) a při každém tahu hledá tlačítka,
   na která nejde klepnout bez posouvání: mimo obrazovku, useknutá, zakrytá jiným prvkem, nebo jen v posuvné ploše,
   a popisky, které přetékají z tlačítka nebo jsou useknuté.
   Každá hra běží dvakrát: ve volném hraní (delší verze) a v lekci (kratší verze a nahoře lištička lekce).
   Spuštění:   node tests/layout.cjs                 (Největší; obě velikosti: --scale 2,3)
   Volitelně:  --only byt,retez   --devices 8,se,13   --scale 2,3   --jobs 3   --mode free|lesson
               --shots ./snimky (snímek prvního problému)   --gallery ./snimky (snímek při každém tahu)
   Pravidla:   iPhone 8 a větší: všechna tlačítka celá na obrazovce, bez posouvání.
               iPhone SE (320 px): posouvat se smí jen plocha hry; tlačítka dole (.play-foot) musí být vidět vždy. */
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const E = require('./e2e.cjs');

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : def; };
const ONLY = arg('only') ? arg('only').split(',') : null;
const DEVS = arg('devices', '8,se').split(',');
const SCALES = arg('scale', '3').split(',').map(Number); // 2 = Větší, 3 = Největší
const JOBS = +arg('jobs', 3);
const SHOTS = arg('shots') ? path.resolve(arg('shots')) : null;
const MODES = arg('mode') ? [arg('mode')] : ['free', 'lesson'];
const GALLERY = arg('gallery') ? path.resolve(arg('gallery')) : null; // snímek při každém tahu (nejvýš 10 na hru a úroveň)
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
if (GALLERY) fs.mkdirSync(GALLERY, { recursive: true });
const DEVICES = { se: 'iPhone SE', 8: 'iPhone 8', 13: 'iPhone 13', ipad: 'iPad (gen 7)' };
const LENIENT = { se: true }; // na nejmenším displeji se smí posouvat plocha hry

/* V prohlížeči: najde tlačítka hry, na která nejde rovnou klepnout. */
function probe() {
  if (window.__lay) return;
  const TOL = 2;
  const name = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter((c) => c && !/^is-/.test(c)).slice(0, 2) : [];
    const t = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
    return el.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : '') + (t ? ' „' + (t.length > 22 ? t.slice(0, 21) + '…' : t) + '“' : '');
  };
  const clips = (s) => s.overflowX !== 'visible' || s.overflowY !== 'visible';
  const scrollable = (el, s) => (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1) || (/(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth + 1);
  /* Viditelná oblast prvku: průnik obrazovky a všech předků, kteří obsah ořezávají. */
  const region = (el, vw, vh, self) => {
    let L = 0, T = 0, R = vw, B = vh;
    for (let a = self ? el : el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      if (!clips(getComputedStyle(a))) continue;
      const r = a.getBoundingClientRect();
      L = Math.max(L, r.left); T = Math.max(T, r.top); R = Math.min(R, r.right); B = Math.min(B, r.bottom);
    }
    return { L: L, T: T, R: R, B: B };
  };
  const inside = (r, g) => r.left >= g.L - TOL && r.top >= g.T - TOL && r.right <= g.R + TOL && r.bottom <= g.B + TOL;
  const pageBoxes = () => [document.scrollingElement || document.documentElement, document.body, document.getElementById('app'), document.querySelector('.play')];
  window.__lay = function () {
    const play = document.querySelector('.play');
    if (!play || document.querySelector('.modal-back')) return [];
    const moved = pageBoxes().filter((el) => el && (el.scrollTop > 1 || el.scrollLeft > 1));
    if (moved.length) return moved.map((el) => ({ kind: 'page', what: (el.id || el.className || el.tagName) + ' posunutá o ' + Math.round(el.scrollTop) + ' px' }));
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const out = [];
    play.querySelectorAll('button, .town-cell, .jar').forEach((b) => {
      if (b.disabled || b.closest('.is-locked, .is-done, [aria-hidden="true"]')) return; // .is-done = dohraná mřížka
      const cs = getComputedStyle(b);
      if (cs.visibility === 'hidden' || cs.pointerEvents === 'none') return;
      const r = b.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const foot = !!b.closest('.play-foot');
      const base = { what: name(b), foot: foot, y: Math.round(r.top), h: Math.round(r.height) };
      const g = region(b, vw, vh);
      if (inside(r, g)) {
        const hit = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
        if (hit && !b.contains(hit)) out.push(Object.assign(base, { kind: 'covered', by: name(hit) }));
        return;
      }
      // Odkryje ho posunutí plochy hry? (nejbližší posuvný předek, který je sám celý vidět)
      let sc = null;
      for (let a = b.parentElement; a && a !== play; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (clips(s) && scrollable(a, s)) { sc = a; break; }
      }
      if (sc && !foot && inside(sc.getBoundingClientRect(), region(sc, vw, vh))) {
        out.push(Object.assign(base, { kind: 'scroll', in: name(sc).split(' ')[0], box: Math.round(sc.getBoundingClientRect().height) }));
        return;
      }
      const vis = Math.max(0, Math.min(r.right, g.R) - Math.max(r.left, g.L)) * Math.max(0, Math.min(r.bottom, g.B) - Math.max(r.top, g.T));
      const pct = Math.round((100 * vis) / (r.width * r.height));
      out.push(Object.assign(base, { kind: pct >= 50 ? 'cut' : 'off', vis: pct }));
    });
    // Text, který je useknutý (mimo obrazovku nebo ořezaný) a nedá se k němu doposouvat.
    const walk = document.createTreeWalker(play, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement;
      if (!n.textContent.trim() || !el || seen.has(el) || el.closest('[aria-hidden="true"], .play-title, .sr-only, .fb')) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const r = rg.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      // Do šířky nesmí text přečnívat vůbec, na výšku jen málo (obrázky emoji bývají vyšší než řádek).
      const cut = (g) => Math.max(0, g.L - r.left) + Math.max(0, r.right - g.R) > TOL || Math.max(0, g.T - r.top) + Math.max(0, r.bottom - g.B) > Math.max(3, 0.2 * r.height);
      // Popisek, který přetéká ze svého tlačítka (štítek umístěný přes okraj, např. „chybělo“, je záměr).
      const btn = el.closest('button');
      if (btn && cs.position !== 'absolute' && cut((() => { const b = btn.getBoundingClientRect(); return { L: b.left, T: b.top, R: b.right, B: b.bottom }; })())) {
        out.push({ kind: 'text', what: name(btn) + ' (přetéká)', foot: false, y: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) });
        continue;
      }
      const g = region(el, vw, vh, true);
      if (!cut(g)) continue;
      let sc = false;
      for (let a = el; a && a !== play; a = a.parentElement) { const s2 = getComputedStyle(a); if (clips(s2) && scrollable(a, s2)) { sc = true; break; } }
      if (sc) continue;
      const vis = Math.max(0, Math.min(r.right, g.R) - Math.max(r.left, g.L)) * Math.max(0, Math.min(r.bottom, g.B) - Math.max(r.top, g.T));
      out.push({ kind: 'text', what: name(el), foot: false, y: Math.round(r.top), h: Math.round(r.height), vis: Math.round((100 * vis) / (r.width * r.height)), w: Math.round(r.width) });
    }
    return out;
  };
  window.__unscroll = () => pageBoxes().forEach((el) => { if (el) { el.scrollTop = 0; el.scrollLeft = 0; } });
  // Průběžné vzorkování pro obrazovky, které se mění samy: zapíše problém, který vydrží dva vzorky po sobě.
  window.__layLog = [];
  let prev = new Set();
  setInterval(() => {
    let now = [];
    try { now = window.__lay(); } catch (e) { /* obrazovka se právě mění */ }
    const keys = new Set();
    now.forEach((p) => {
      const k = p.kind + '|' + p.what;
      keys.add(k);
      if (prev.has(k)) window.__layLog.push(p);
    });
    prev = keys;
  }, 150);
}

const found = new Map(); // klíč → { dev, id, lv, kind, what, n, ... }
const crashes = [];
const isBad = (dev, p) => !(LENIENT[dev] && p.kind === 'scroll');
function record(info, p, st) {
  const key = [info.dev, info.scale, info.id, info.lv, info.mode, p.kind, p.what.replace(/ „.*$/, '')].join('|');
  const e = found.get(key);
  if (e) { e.n++; return; }
  found.set(key, Object.assign({ dev: info.dev, scale: info.scale, id: info.id, lv: info.lv, mode: info.mode, n: 1, status: st[0], progress: st[1] }, p));
}

async function check(page) {
  const info = page.__info;
  if (!info) return;
  if (GALLERY && (info.k = (info.k || 0) + 1) <= 10) {
    await page.screenshot({ path: path.join(GALLERY, [info.dev, 's' + info.scale, info.id, 'lv' + info.lv, info.mode, String(info.k).padStart(2, '0')].join('-') + '.png') });
  }
  const lay = () => page.evaluate(() => (window.__lay ? window.__lay() : []));
  const state = () => page.evaluate(() => [(document.querySelector('.play-status') || {}).textContent || '', (document.querySelector('.play-progress') || {}).textContent || '']);
  let a = await lay();
  if (a.length && a[0].kind === 'page') {
    const st = await state();
    a.forEach((p) => record(info, p, st));
    await page.evaluate(() => window.__unscroll());
    a = await lay();
  }
  if (!a.length) return;
  // Jen to, co vydrží: animace a přechody mezi koly nehlásit.
  await page.waitForTimeout(300);
  const keys = new Set((await lay()).map((p) => p.kind + '|' + p.what));
  a = a.filter((p) => keys.has(p.kind + '|' + p.what));
  if (!a.length) return;
  const st = await state();
  a.forEach((p) => record(info, p, st));
  const bad = a.filter((p) => isBad(info.dev, p));
  if (SHOTS && bad.length && !info.shot) {
    info.shot = true;
    await page.screenshot({ path: path.join(SHOTS, [info.dev, 's' + info.scale, info.id, 'lv' + info.lv, info.mode, bad[0].kind].join('-') + '.png') });
  }
}
E.hooks.step = check;

async function worker(browser, base, dev, scale, queue, errors) {
  const context = await browser.newContext(Object.assign({}, devices[DEVICES[dev]], { deviceScaleFactor: 1, locale: 'cs-CZ' }));
  const page = await context.newPage();
  const tag = '[' + dev + (SCALES.length > 1 ? '@' + scale : '') + '] ';
  const where = () => tag + (page.__info ? page.__info.id + ' ' + page.__info.lv + ': ' : '');
  page.on('pageerror', (e) => errors.push(where() + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(where() + m.text()); });
  await page.goto(base + '?ts=0.1');
  await page.waitForSelector('.onboarding');
  await page.getByRole('button', { name: 'Pokračovat' }).click();
  await page.getByRole('button', { name: 'Vydat se na cestu' }).click();
  await page.waitForSelector('.nodes');
  // Velikost písma se musí opravdu použít (applySettings), samotné uložení nestačí.
  const fsz = await page.evaluate((sc) => {
    SM.store.settings().scale = sc;
    SM.store.save();
    SM.ui.applySettings();
    Object.keys(SM.games).forEach((id) => SM.engine.unlockEarly(id));
    return [document.documentElement.dataset.scale, getComputedStyle(document.documentElement).fontSize];
  }, scale);
  if (fsz[0] !== String(scale)) throw new Error('velikost písma se nepoužila: ' + fsz.join(' '));
  await E.prepare(page);
  await page.evaluate(probe);
  while (queue.length) {
    const [id, lv, mode] = queue.shift();
    page.__info = { dev: dev, scale: scale, id: id, lv: lv, mode: mode };
    try {
      await page.evaluate((a) => { SM.store.game(a[0]).level = a[1]; SM.store.save(); }, [id, lv]);
      // Stejně jako z karty Hry (volné hraní), nebo jako druhá hra lekce (kratší verze, lištička lekce).
      await page.evaluate((a) => SM.ui.runGame(a[0], Object.assign({ onDone: () => SM.ui.go('hry'), onExit: () => SM.ui.go('hry') },
        a[1] === 'lesson' ? { short: true, lesson: { i: 1, total: 3 } } : {})), [id, mode]);
      await page.waitForSelector('.play-stage > *');
      await page.waitForTimeout(150);
      await check(page);
      await E.players[id](page);
      await page.waitForFunction(() => !document.querySelector('.play'), null, { timeout: 30000 });
    } catch (e) {
      crashes.push(tag + id + ' úroveň ' + lv + ' (' + (mode === 'lesson' ? 'lekce' : 'volné hraní') + '): ' + e.message.split('\n')[0]);
      await page.evaluate(() => SM.ui.go('hry')).catch(() => {});
    }
    const log = await page.evaluate(() => { const l = window.__layLog; window.__layLog = []; return l; }).catch(() => []);
    log.forEach((p) => record(page.__info, p, ['(mezi tahy)', '']));
    process.stdout.write('.');
  }
  await context.close();
}

(async () => {
  const srv = await E.serve();
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await chromium.launch();
  const errors = [];
  const t0 = Date.now();
  for (const scale of SCALES) for (const dev of DEVS) {
    if (!DEVICES[dev]) throw new Error('neznámé zařízení ' + dev + ' (' + Object.keys(DEVICES).join(', ') + ')');
    const page = await browser.newPage();
    await page.goto(base + '?ts=0.1');
    const games = await page.evaluate(() => Object.keys(SM.games).map((id) => [id, SM.games[id].maxLevel]));
    await page.close();
    const queue = [];
    games.filter((g) => !ONLY || ONLY.indexOf(g[0]) !== -1).forEach((g) => {
      for (let lv = 1; lv <= g[1]; lv++) MODES.forEach((m) => queue.push([g[0], lv, m]));
    });
    process.stdout.write(DEVICES[dev] + ', písmo ' + scale + ' (' + queue.length + ' her) ');
    await Promise.all(Array.from({ length: Math.min(JOBS, queue.length) }, () => worker(browser, base, dev, scale, queue, errors)));
    process.stdout.write('\n');
  }
  await browser.close();
  srv.close();

  const all = Array.from(found.values());
  const bad = all.filter((p) => isBad(p.dev, p));
  const info = all.filter((p) => !isBad(p.dev, p));
  const line = (p) => '  [' + p.dev + (SCALES.length > 1 ? '@' + p.scale : '') + '] ' + (p.id + ' ' + p.lv + (p.mode === 'lesson' ? ' L' : '')).padEnd(15) + p.kind.padEnd(8) + p.what +
    (p.by ? ' pod ' + p.by : '') + (p.in ? ' v ' + p.in + ' (' + p.box + ' px)' : '') + (p.vis != null ? ' vidět ' + p.vis + ' %' : '') +
    (p.y != null ? ' y=' + p.y + ' h=' + p.h : '') + (p.w ? ' w=' + p.w : '') + (p.n > 1 ? ' ×' + p.n : '') + ' | ' + p.status.slice(0, 50);
  if (info.length) console.log('\nPosouvá se jen plocha hry (na tomto displeji v pořádku):\n' + info.map(line).join('\n'));
  if (bad.length) console.log('\nTlačítka a popisky, které nejsou celé vidět:\n' + bad.map(line).join('\n'));
  if (crashes.length) console.log('\nHráč nedohrál:\n  ' + crashes.join('\n  '));
  if (errors.length) console.log('\nChyby v konzoli:\n  ' + errors.join('\n  '));
  const problems = bad.length + crashes.length + errors.length;
  console.log('\n' + (problems ? problems + ' problém(ů)' : 'Vše v pořádku.') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)');
  process.exit(problems ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
