/* Automatický test: projde úvodní nastavení, celou první zastávku cesty (lekce, truhla, pohlednice)
   a všechny hry ve volném hraní v emulovaném iPhonu a iPadu (nové hry i na všech úrovních). Hlídá chyby v konzoli.
   Spuštění:  npm i -D playwright && npx playwright install chromium && node tests/e2e.cjs
   Volitelně:  node tests/e2e.cjs --shots ./screenshots   (uloží snímky obrazovky) */
const { chromium, devices } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const shotsArg = process.argv.indexOf('--shots');
const SHOTS = shotsArg > -1 ? path.resolve(process.argv[shotsArg + 1]) : null;
// Rychlá kontrola vybraných her:  node tests/e2e.cjs --only kulicka,byt  (jen iPhone, bez cesty a přehledů)
const onlyArg = process.argv.indexOf('--only');
const ONLY = onlyArg > -1 ? process.argv[onlyArg + 1].split(',') : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8'
};
function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

const T = 30000;
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
/** Počká, až fn(arg) v prohlížeči vrátí pravdivou hodnotu, nebo až hra skončí. Vrací hodnotu, nebo null po konci hry. */
async function next(page, fn, arg) {
  const h = await page.waitForFunction(new Function('arg', 'if (!document.querySelector(".play")) return "__gone"; return (' + fn + ')(arg);'), arg, { timeout: T });
  const v = await h.jsonValue();
  return v === '__gone' ? null : v;
}
const progress = () => (document.querySelector('.play-progress') || {}).textContent || '';
const freshChoices = () => !!document.querySelector('.choices:not(.is-locked)');
const esc = (t) => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* Hráči: každá hra se dohraje podle toho, co je vidět na obrazovce, dokud nezmizí herní obrazovka. */
const players = {
  async pexeso(page) {
    const fronts = await page.$$eval('.pex-front', (els) => els.map((e) => e.textContent));
    const groups = {};
    fronts.forEach((s, i) => { (groups[s] = groups[s] || []).push(i); });
    const cards = page.locator('.pex-card');
    const keys = Object.keys(groups);
    await cards.nth(groups[keys[0]][0]).click();
    await cards.nth(groups[keys[1]][0]).click();
    await page.waitForTimeout(300);
    for (const s of keys) { await cards.nth(groups[s][0]).click(); await cards.nth(groups[s][1]).click(); }
  },
  async nakup(page) {
    for (let r = 0; r < 4; r++) {
      if (!(await next(page, () => !!document.querySelector('.note-item')))) return;
      const items = await page.$$eval('.note-item span:not(.emo)', (els) => els.map((e) => e.textContent));
      await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
      await next(page, () => !!document.querySelector('.quiz, .pick-grid'));
      if (await page.$('.quiz')) {
        const nums = (await page.textContent('.quiz-q')).match(/\d+/g).map(Number);
        await page.locator('.quiz-opts .btn', { hasText: new RegExp('^' + (nums[0] + nums[1]) + '$') }).click();
        await next(page, () => !!document.querySelector('.pick-grid'));
      }
      const picks = page.locator('.pick');
      const n = await picks.count();
      for (let i = 0; i < n; i++) {
        const lbl = await picks.nth(i).locator('.lbl').textContent();
        if (items.includes(lbl) !== (r === 1 && i === 0)) await picks.nth(i).click();
      }
      await page.getByRole('button', { name: 'Hotovo' }).click();
      await page.getByRole('button', { name: /Další lístek|Zobrazit výsledek/ }).click();
    }
  },
  async okna(page) {
    for (let r = 0; r < 12; r++) {
      if (!(await next(page, () => (document.querySelector('.play-status') || {}).textContent.indexOf('Teď vy') === 0))) return;
      const seq = await page.evaluate(() => { const s = window.__seq; window.__seq = []; return s; });
      const wins = page.locator('.win');
      if (r === 2) await wins.nth(seq[0] === 0 ? 1 : 0).click();
      else for (const i of seq) await wins.nth(i).click();
      await next(page, () => (document.querySelector('.play-status') || {}).textContent.indexOf('Teď vy') !== 0);
    }
  },
  async blesk(page) {
    for (let t = 0; t < 20; t++) {
      if (!(await next(page, () => !!document.querySelector('.choice-btn')))) return;
      await page.locator('.choice-btn').nth(t % 2).click();
      if (!(await next(page, () => !!document.querySelector('.slot.is-choice')))) return;
      await page.locator('.slot.is-choice').nth(t % 4).click();
    }
  },
  async jiny(page) {
    let last = '';
    for (let t = 0; t < 14; t++) {
      const p = await next(page, (l) => { const p = (document.querySelector('.play-progress') || {}).textContent; return p !== l && document.querySelector('.odd-cell') && !document.querySelector('.odd-cell.is-found') ? p : false; }, last);
      if (!p) return;
      last = p;
      const idx = await page.$$eval('.odd-cell', (els) => {
        const txt = els.map((e) => e.textContent);
        const c = {};
        txt.forEach((x) => { c[x] = (c[x] || 0) + 1; });
        return txt.findIndex((x) => c[x] === 1);
      });
      if (t === 1) await page.locator('.odd-cell').nth(idx === 0 ? 1 : 0).click();
      await page.locator('.odd-cell').nth(idx).click();
    }
  },
  async sipky(page) {
    let last = '';
    for (let t = 0; t < 30; t++) {
      const p = await next(page, (l) => { const p = (document.querySelector('.play-progress') || {}).textContent; return p !== l && document.querySelector('.arrows') ? p : false; }, last);
      if (!p) return;
      last = p;
      const left = /doleva/.test(await page.getAttribute('.arrows', 'aria-label'));
      await page.getByRole('button', { name: left !== (t === 3) ? 'Doleva' : 'Doprava' }).click();
    }
  },
  async barvy(page) {
    let last = '';
    for (let t = 0; t < 30; t++) {
      const p = await next(page, (l) => { const p = (document.querySelector('.play-progress') || {}).textContent; const w = document.querySelector('.board-word'); return p !== l && w && w.textContent ? p : false; }, last);
      if (!p) return;
      last = p;
      const info = await page.evaluate(() => ({ label: document.querySelector('.board-word').getAttribute('aria-label'), word: document.querySelector('.rule-pill').classList.contains('is-word') }));
      const m = /Slovo (\S+), napsané barvou (\S+)/.exec(info.label);
      await page.locator('.color-btn', { hasText: info.word ? m[1] : m[2] }).click();
    }
  },
  async poradi(page) {
    for (let b = 0; b < 3; b++) {
      if (!(await next(page, () => document.querySelectorAll('.dot').length > 0 && !document.querySelector('.dot.is-done')))) return;
      const dots = page.locator('.dot');
      const n = await dots.count();
      if (b === 0) await dots.nth(n - 1).click();
      for (let i = 0; i < n; i++) await dots.nth(i).click();
      await next(page, () => !document.querySelector('.dot') || document.querySelectorAll('.dot.is-done').length === document.querySelectorAll('.dot').length);
      await page.waitForTimeout(50);
    }
  },
  async prislovi(page) {
    await mcq(page, () => {
      const card = document.querySelector('.quote-card');
      const pre = card.firstChild.textContent;
      return SM.content.PROVERBS.find((p) => p.t.split('___')[0] === pre).a;
    });
  },
  async protiklady(page) {
    await mcq(page, () => {
      const w = document.querySelector('.word-card').textContent;
      return SM.content.OPPOSITES.find((o) => o.w.toUpperCase() === w).a;
    });
  },
  async nepatri(page) {
    await mcq(page, () => {
      const opts = Array.from(document.querySelectorAll('.choice')).map((b) => b.textContent);
      return SM.content.ODD.find((o) => opts.indexOf(o.x) !== -1 && o.w.every((w) => opts.indexOf(w) !== -1)).x;
    });
  },
  async hodiny(page) {
    await mcq(page, () => {
      const ang = (sel) => parseFloat(/rotate\(([-\d.]+)/.exec(document.querySelector(sel).getAttribute('transform'))[1]);
      const m = Math.round(ang('.clock-min') / 6) % 60;
      const hr = Math.floor((ang('.clock-hour') + 0.01) / 30) % 12;
      const add = /za (\d+) minut/.exec(document.querySelector('.play-status').textContent);
      const t = (hr * 60 + m + (add ? +add[1] : 0)) % 720;
      const H = Math.floor(t / 60) % 12 || 12, M = t % 60;
      return H + ':' + (M < 10 ? '0' : '') + M;
    });
  },
  async rada(page) { await mcq(page, () => document.querySelector('.choice').textContent); },
  async tvary(page) { await mcq(page, () => document.querySelector('.choice').textContent); },
  async kolik(page) { await mcq(page, () => String(window.__dots)); },
  async placeni(page) {
    for (let r = 0; r < 8; r++) {
      const kind = await next(page, () => (document.querySelector('.tray') && !document.querySelector('.money-btn[aria-label^="Vrátit"]') && !document.querySelector('.choice.is-correct') ? 'pay' : document.querySelector('.choices:not(.is-locked)') ? 'mcq' : false));
      if (!kind) return;
      if (kind === 'mcq') { await page.locator('.choice').first().click(); await page.waitForTimeout(50); continue; }
      const price = +/(\d+) Kč/.exec(await page.textContent('.play-status'))[1];
      const vals = (await page.$$eval('.tray .money-btn', (els) => els.map((e) => +/(\d+)/.exec(e.getAttribute('aria-label'))[1]))).sort((a, b) => b - a);
      let left = price;
      for (const v of vals) {
        while (left >= v) { await page.locator('.tray .money-btn[aria-label="Položit ' + v + ' Kč"]').click(); left -= v; }
      }
      await page.getByRole('button', { name: 'Zaplatit' }).click();
      await next(page, () => !document.querySelector('.tray') || document.querySelector('.play-status').textContent.indexOf('Zaplaťte') !== 0);
    }
  },
  async presmycky(page) {
    for (let r = 0; r < 8; r++) {
      const ok = await next(page, () => document.querySelector('.ana-tile') && !document.querySelector('.ana-tile[disabled]') && !document.querySelector('.ana-slot.is-shown'));
      if (!ok) return;
      const word = await page.evaluate(() => {
        const tiles = Array.from(document.querySelectorAll('.ana-tile')).map((t) => t.textContent);
        const key = tiles.slice().sort().join('');
        const cat = document.querySelector('.ana-hint strong').textContent;
        return SM.content.ANAGRAMS.find((a) => [...a.w].sort().join('') === key && a.c === cat).w;
      });
      for (const ch of [...word]) await page.locator('.ana-tile:not([disabled])', { hasText: new RegExp('^' + ch + '$') }).first().click();
      await next(page, () => !document.querySelector('.ana-tile:not([disabled])'));
      await page.waitForTimeout(60);
    }
  },
  async telefon(page) {
    for (let r = 0; r < 8; r++) {
      const num = await next(page, () => { const n = document.querySelector('.phone-card:not(.is-check) .phone-num'); return n ? n.textContent.replace(/\s/g, '') : false; });
      if (!num) return;
      if (!(await next(page, () => !!document.querySelector('.kp')))) return;
      for (const d of num) await page.locator('.kp-key', { hasText: new RegExp('^' + d + '$') }).click();
      await page.locator('.kp-ok').click();
      await next(page, () => !document.querySelector('.kp'));
    }
  },
  async jmena(page) {
    const seen = {};
    for (let r = 0; r < 30; r++) {
      const state = await next(page, () => {
        const btn = Array.from(document.querySelectorAll('.play-foot .btn')).find((b) => /Další soused|Můžeme začít/.test(b.textContent));
        if (btn && document.querySelector('.person-name')) return 'meet';
        if (document.querySelector('.choices:not(.is-locked)')) return 'quiz';
        return false;
      });
      if (!state) return;
      if (state === 'meet') {
        const face = await page.textContent('.person-face');
        seen[face] = (await page.textContent('.person-name')).split(' ').pop();
        await page.locator('.play-foot .btn').first().click();
        await next(page, (f) => { const el = document.querySelector('.person-face'); return !el || el.textContent !== f || !document.querySelector('.person-name'); }, face);
      } else {
        const face = await page.textContent('.person-face');
        await page.locator('.choice', { hasText: new RegExp('^' + seen[face] + '$') }).click();
        await page.waitForTimeout(30);
      }
    }
  },
  async zmena(page) {
    for (let r = 0; r < 10; r++) {
      const ok = await next(page, () => /Která věc je nová/.test(document.querySelector('.play-status').textContent) && !document.querySelector('.shelf-slot.is-correct'));
      if (!ok) return;
      const idx = await page.evaluate(() => {
        const now = Array.from(document.querySelectorAll('.shelf-slot')).map((s) => s.textContent);
        return now.findIndex((t, i) => t !== window.__shelf[i]);
      });
      await page.locator('.shelf-slot').nth(idx).click();
    }
  },
  async mozaika(page) {
    for (let r = 0; r < 8; r++) {
      const ok = await next(page, () => /Vybarvěte/.test(document.querySelector('.play-status').textContent) && !document.querySelector('.mosaic-cell.is-hit, .mosaic-cell.is-miss'));
      if (!ok) return;
      const cells = await page.evaluate(() => window.__mosaic);
      for (const i of cells) await page.locator('.mosaic-cell').nth(i).click();
      await page.getByRole('button', { name: 'Hotovo' }).click();
      await next(page, () => !!document.querySelector('.mosaic-cell.is-hit, .mosaic-cell.is-miss, .mosaic-cell.is-extra'));
    }
  },
  async sber(page) { await next(page, () => false); },
  async retez(page) {
    const apply = (v, op, n) => ({ start: n, add: v + n, sub: v - n, mul: v * n, div: v / n, half: v / 2, double: v * 2, quarter: v / 4, pct: v / 10 })[op];
    let v = 0;
    let last = '';
    let answered = 0;
    for (let k = 0; k < 120; k++) {
      const st = await next(page, (l) => {
        const btn = document.querySelector('.play-foot .btn:not([disabled])');
        const card = document.querySelector('.chain-card');
        if (card && btn) {
          const big = card.querySelector('.chain-big');
          const key = card.querySelector('.chain-label').textContent + '|' + big.textContent;
          return key !== l ? { kind: 'step', key: key, op: big.dataset.op, n: +big.dataset.n } : false;
        }
        if (document.querySelector('.choices:not(.is-locked)')) return { kind: 'choose' };
        if (document.querySelector('.kp')) return { kind: 'pad' };
        if (document.querySelector('.chain-sol') && btn) return { kind: 'sol' };
        return false;
      }, last);
      if (!st) return;
      if (st.kind === 'step') {
        v = apply(v, st.op, st.n);
        last = st.key;
        await page.locator('.play-foot .btn:not([disabled])').click();
      } else if (st.kind === 'sol') {
        await page.locator('.play-foot .btn:not([disabled])').click();
        await next(page, () => !document.querySelector('.chain-sol'));
      } else {
        const row = await page.$$eval('.chain [data-op]', (els) => els.map((e) => [e.dataset.op, +e.dataset.n]));
        if (row.length) { v = 0; for (const [op, n] of row) v = apply(v, op, n); }
        const wrong = answered === 1;
        answered++;
        if (st.kind === 'choose') {
          const opts = page.locator('.choices:not(.is-locked) .choice');
          if (wrong) await opts.filter({ hasNotText: new RegExp('^' + v + '$') }).first().click();
          else await opts.filter({ hasText: new RegExp('^' + v + '$') }).click();
        } else {
          for (const d of String(wrong ? v + 1 : v)) await page.locator('.kp-key', { hasText: new RegExp('^' + d + '$') }).click();
          await page.locator('.kp-ok').click();
        }
        await next(page, () => !!document.querySelector('.chain-sol'));
        v = 0;
        last = '';
      }
    }
  },
  async vyhodne(page) {
    for (let r = 0; r < 14; r++) {
      const st = await next(page, () => (document.querySelector('.choices:not(.is-locked) .offer') ? 'pick' : document.querySelector('.play-foot .btn:not([disabled])') ? 'next' : false));
      if (!st) return;
      if (st === 'next') { await page.locator('.play-foot .btn:not([disabled])').click(); await page.waitForTimeout(40); continue; }
      const vals = await page.$$eval('.choices:not(.is-locked) .offer', (els) => els.map((e) => +e.dataset.v));
      let idx = vals.indexOf(Math.min(...vals));
      if (r === 1) idx = (idx + 1) % vals.length;
      await page.locator('.choices:not(.is-locked) .choice').nth(idx).click();
      await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
    }
  },
  async hadani(page) {
    let last = '';
    for (let k = 0; k < 80; k++) {
      const st = await next(page, (l) => {
        const g = document.querySelector('.guess[data-state="play"]');
        if (!g) return false;
        const key = g.dataset.round + ':' + g.dataset.turn;
        return key !== l ? { key: key, lo: +g.dataset.lo, hi: +g.dataset.hi, kind: g.dataset.kind } : false;
      }, last);
      if (!st) return;
      last = st.key;
      const mid = Math.floor((st.lo + st.hi) / 2);
      if (st.kind === 'pad') {
        for (const d of String(mid)) await page.locator('.kp-key', { hasText: new RegExp('^' + d + '$') }).click();
        await page.locator('.kp-ok').click();
      } else await page.locator('.guess-num[data-v="' + mid + '"]').click();
    }
  },
  async rodina(page) {
    await mcq(page, () => {
      const card = document.querySelector('.kin-card');
      if (card) return SM.content.KIN.find((k) => k.q === card.dataset.q).a;
      const q = document.querySelector('.play-status').textContent;
      const mids = Array.from(document.querySelectorAll('.ftree-branch')).map((b) => ({
        n: b.dataset.name, g: b.dataset.g,
        kids: Array.from(b.querySelectorAll('[data-kid]')).map((k) => ({ n: k.dataset.kid, g: k.dataset.g }))
      }));
      const all = [];
      mids.forEach((m) => m.kids.forEach((k) => all.push({ k: k, m: m })));
      if (/^Kolik vnoučat/.test(q)) return String(all.length);
      let m = /^Kolik sourozenců má (\S+)\?/.exec(q);
      if (m) return String(all.find((e) => e.k.n === m[1]).m.kids.length - 1);
      m = /^Jak se jmenuje (\S+) (\S+)\?/.exec(q);
      const kids = SM.content.FAMILY.kids;
      const row = kids.f.concat(kids.m).find((r) => r[1] === m[1] || r[2] === m[1]);
      const x = all.find((e) => e.k.n === row[0]);
      if (m[2] === 'maminka' || m[2] === 'tatínek') return x.m.n;
      if (m[2] === 'strýc') return mids.find((y) => y !== x.m && y.g === 'm').n;
      if (m[2] === 'teta') return mids.find((y) => y !== x.m && y.g === 'f').n;
      const cousins = all.filter((e) => e.m !== x.m).map((e) => e.k);
      return cousins.find((c) => c.g === (m[2] === 'bratranec' ? 'm' : 'f')).n;
    });
  },
  async kulicka(page) {
    for (let r = 0; r < 12; r++) {
      if (!(await next(page, () => { const c = document.querySelector('.cups'); return !!c && c.dataset.state === 'pick'; }))) return;
      const info = await page.$$eval('.cup', (els) => ({ n: els.length, balls: els.map((e, i) => (e.querySelector('.cup-ball') ? i : -1)).filter((i) => i >= 0) }));
      let pick = info.balls;
      if (r === 1) {
        const wrong = Array.from({ length: info.n }, (_, i) => i).find((i) => info.balls.indexOf(i) === -1);
        pick = [wrong].concat(info.balls.slice(1));
      }
      for (const i of pick) await page.locator('.cup').nth(i).click();
      await next(page, () => { const c = document.querySelector('.cups'); return !c || c.dataset.state !== 'pick'; });
    }
  },
  async dvojice(page) {
    const map = {};
    let asked = 0;
    for (let k = 0; k < 40; k++) {
      const st = await next(page, () => (document.querySelector('.pairs-card') && document.querySelector('.play-foot .btn:not([disabled])') ? 'study'
        : document.querySelector('.choices:not(.is-locked)') ? 'ask' : false));
      if (!st) return;
      if (st === 'study') {
        const rows = await page.$$eval('.pair-row', (els) => els.map((e) => [e.querySelector('.pair-item').textContent, e.querySelector('.pair-value').textContent]));
        rows.forEach((r) => { map[r[0]] = r[1]; map[r[1]] = r[0]; });
        await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
        await next(page, () => !document.querySelector('.pairs-card'));
      } else {
        const ans = map[await page.textContent('.pair-q-text')];
        const opts = page.locator('.choices:not(.is-locked) .choice');
        const re = new RegExp('^' + esc(ans) + '$');
        if (asked === 1) await opts.filter({ hasNotText: re }).first().click();
        else await opts.filter({ hasText: re }).first().click();
        asked++;
        await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
      }
    }
  },
  async byt(page) {
    let where = {};
    let asked = 0;
    for (let k = 0; k < 40; k++) {
      const st = await next(page, () => {
        const b = document.querySelector('.byt');
        if (!b) return false;
        const a = b.dataset.ask;
        if (a === 'study') return document.querySelector('.play-foot .btn:not([disabled])') ? 'study' : false;
        if (a === 'where') return document.querySelector('.room.is-correct') ? false : 'where';
        if (a === 'what') return document.querySelector('.pick-grid.is-locked') ? false : 'what';
        return document.querySelector('.choices:not(.is-locked)') ? 'count' : false;
      });
      if (!st) return;
      if (st === 'study') {
        where = await page.$$eval('.room', (els) => { const m = {}; els.forEach((r) => r.querySelectorAll('.ri').forEach((i) => { m[i.dataset.item] = r.dataset.room; })); return m; });
        await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
        await next(page, () => !document.querySelector('.byt[data-ask="study"]'));
      } else if (st === 'where') {
        const item = await page.getAttribute('.byt', 'data-item');
        let room = where[item];
        if (asked === 1) room = await page.$$eval('.room', (els, r) => els.map((e) => e.dataset.room).find((x) => x !== r), room);
        asked++;
        await page.locator('.room[data-room="' + room + '"]').click();
        await next(page, () => !!document.querySelector('.room.is-correct'));
      } else if (st === 'what') {
        const room = await page.getAttribute('.byt', 'data-room');
        for (const it of Object.keys(where).filter((i) => where[i] === room)) await page.locator('.pick[data-item="' + it + '"]').click();
        await page.getByRole('button', { name: 'Hotovo' }).click();
        await next(page, () => !!document.querySelector('.pick-grid.is-locked'));
      } else {
        const room = await page.getAttribute('.byt', 'data-room');
        const n = Object.keys(where).filter((i) => where[i] === room).length;
        await page.locator('.choices:not(.is-locked) .choice', { hasText: new RegExp('^' + n + '$') }).click();
        await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
      }
    }
  },
  async osmismerka(page) {
    for (let k = 0; k < 40; k++) {
      const st = await next(page, () => (document.querySelector('.choices:not(.is-locked)') ? 'taj'
        : document.querySelector('.ws-word:not(.is-found)') && !document.querySelector('.ws-grid.is-done') ? 'find' : false));
      if (!st) return;
      if (st === 'taj') {
        const ans = await page.evaluate(() => {
          const L = (t) => t.toUpperCase().replace(/[^A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, '');
          const left = Array.from(document.querySelectorAll('.ws-cell.is-taj')).map((c) => c.textContent).join('');
          return Array.from(document.querySelectorAll('.choices .choice')).map((b) => b.textContent).find((t) => L(t) === left);
        });
        await page.locator('.choices:not(.is-locked) .choice').filter({ hasText: new RegExp('^' + esc(ans) + '$') }).click();
        await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
        continue;
      }
      const f = await page.evaluate(() => {
        const cells = Array.from(document.querySelectorAll('.ws-cell'));
        const n = Math.round(Math.sqrt(cells.length));
        const g = cells.map((c) => c.textContent);
        const w = document.querySelector('.ws-word:not(.is-found)').dataset.w;
        const D = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]];
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) for (const d of D) {
          const path = [];
          for (let i = 0; i < w.length; i++) {
            const rr = r + d[0] * i, cc = c + d[1] * i;
            if (rr < 0 || cc < 0 || rr >= n || cc >= n || g[rr * n + cc] !== w[i]) break;
            path.push(rr * n + cc);
          }
          if (path.length === w.length) return { w: w, path: path };
        }
        return null;
      });
      const before = await page.$$eval('.ws-word.is-found', (els) => els.length);
      if (k === 1) {
        // Nápověda dvakrát: první písmeno, pak celé slovo (nápověda si slovo vybere sama).
        await page.getByRole('button', { name: 'Nápověda' }).click();
        await page.getByRole('button', { name: 'Nápověda' }).click();
      } else {
        if (k === 0) {
          // Schválně špatně: o písmeno kratší výběr.
          await page.locator('.ws-cell[data-i="' + f.path[0] + '"]').click();
          await page.locator('.ws-cell[data-i="' + f.path[f.path.length - 2] + '"]').click();
        }
        await page.locator('.ws-cell[data-i="' + f.path[0] + '"]').click();
        await page.locator('.ws-cell[data-i="' + f.path[f.path.length - 1] + '"]').click();
      }
      await next(page, (n) => document.querySelectorAll('.ws-word.is-found').length > n, before);
      await page.waitForTimeout(30);
    }
  },
  async sudoku(page) {
    for (let k = 0; k < 10; k++) {
      const st = await next(page, () => (document.querySelector('.sud.is-example') ? 'ex'
        : document.querySelector('.sud:not(.is-done) .sud-cell:not(.is-given)') ? 'play' : false));
      if (!st) return;
      if (st === 'ex') { await page.locator('.play-foot .btn:not([disabled])').first().click(); await page.waitForTimeout(40); continue; }
      const info = await page.evaluate(() => {
        const cells = Array.from(document.querySelectorAll('.sud .sud-cell'));
        const n = Math.round(Math.sqrt(cells.length));
        const br = n === 6 ? 2 : Math.round(Math.sqrt(n)), bc = n === 6 ? 3 : br;
        const g = cells.map((c) => +(c.dataset.given || 0));
        const ok = (r, c, d) => {
          for (let i = 0; i < n; i++) if (g[r * n + i] === d || g[i * n + c] === d) return false;
          const r0 = r - (r % br), c0 = c - (c % bc);
          for (let i = 0; i < br; i++) for (let j = 0; j < bc; j++) if (g[(r0 + i) * n + c0 + j] === d) return false;
          return true;
        };
        const empty = g.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
        const solve = (k) => {
          if (k === empty.length) return true;
          const i = empty[k], r = Math.floor(i / n), c = i % n;
          for (let d = 1; d <= n; d++) if (ok(r, c, d)) { g[i] = d; if (solve(k + 1)) return true; g[i] = 0; }
          return false;
        };
        solve(0);
        return { n: n, sol: g, empty: empty };
      });
      for (let j = 0; j < info.empty.length; j++) {
        const i = info.empty[j];
        await page.locator('.sud-cell[data-i="' + i + '"]').click();
        if (j === 0) await page.locator('.sud-key[data-v="' + (info.sol[i] % info.n + 1) + '"]').click();
        if (j === 1) { await page.getByRole('button', { name: 'Nápověda' }).click(); continue; }
        await page.locator('.sud-key[data-v="' + info.sol[i] + '"]').click();
      }
      await next(page, () => !!document.querySelector('.sud.is-done'));
      await page.waitForTimeout(40);
    }
  },
  async podnos(page) {
    let tray = null;
    let round = 0;
    const COLOR = { cervena: 'červenou', modra: 'modrou', zluta: 'žlutou', bila: 'bílou' };
    for (let k = 0; k < 40; k++) {
      const st = await next(page, () => {
        const p = document.querySelector('.podnos');
        if (!p) return false;
        const a = p.dataset.ask;
        const foot = document.querySelector('.play-foot .btn:not([disabled])');
        if (a === 'study') return foot && !document.querySelector('.tray-cloth') ? 'study' : false;
        if (a === 'pick') return document.querySelector('.pick-grid.is-locked') ? (foot ? 'next' : false) : 'pick';
        return document.querySelector('.choices:not(.is-locked)') ? a : false;
      });
      if (!st) return;
      if (st === 'study') {
        tray = await page.$$eval('.tray-item', (els) => {
          const m = { n: {}, c: {} };
          els.forEach((e) => { m.n[e.dataset.name] = (m.n[e.dataset.name] || 0) + 1; if (e.dataset.color) m.c[e.dataset.name] = e.dataset.color; });
          return m;
        });
        await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
        await next(page, () => !document.querySelector('.podnos[data-ask="study"]'));
      } else if (st === 'pick') {
        const names = Object.keys(tray.n);
        // V prvním kole schválně jednu věc vynechat a jednu přidat navíc.
        for (let j = round === 0 ? 1 : 0; j < names.length; j++) await page.locator('.pick[data-name="' + names[j] + '"]').click();
        if (round === 0) {
          const extra = await page.$$eval('.pick', (els, ns) => { const b = els.find((e) => ns.indexOf(e.dataset.name) === -1); return b ? b.dataset.name : null; }, names);
          if (extra) await page.locator('.pick[data-name="' + extra + '"]').click();
        }
        round++;
        await page.getByRole('button', { name: 'Hotovo' }).click();
        await next(page, () => !!document.querySelector('.pick-grid.is-locked'));
      } else if (st === 'next') {
        await page.locator('.play-foot .btn:not([disabled])').first().click();
        await next(page, () => !document.querySelector('.pick-grid.is-locked'));
      } else {
        const nm = await page.getAttribute('.podnos', 'data-name');
        const ans = st === 'count' ? String(tray.n[nm]) : COLOR[tray.c[nm]];
        await page.locator('.choices:not(.is-locked) .choice', { hasText: new RegExp('^' + esc(ans) + '$') }).click();
        await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
      }
    }
  },
  async sumy(page) {
    let nums = [];
    let round = 0;
    const canMake = (v, size) => {
      for (let mask = 1; mask < (1 << nums.length); mask++) {
        const parts = nums.filter((_, i) => mask & (1 << i));
        if (parts.length >= 2 && parts.length <= size && parts.reduce((a, b) => a + b, 0) === v) return true;
      }
      return false;
    };
    for (let k = 0; k < 40; k++) {
      const st = await next(page, () => {
        const s = document.querySelector('.sumy');
        if (!s) return false;
        const foot = document.querySelector('.play-foot .btn-primary:not([disabled])');
        if (s.dataset.ask === 'study') return foot ? 'study' : false;
        if (document.querySelector('.sumy-cands.is-locked')) return foot ? 'next' : false;
        return 'pick';
      });
      if (!st) return;
      if (st === 'study') {
        nums = await page.$$eval('.sumy[data-ask="study"] .sumy-card', (els) => els.map((e) => +e.textContent));
        await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
        await next(page, () => !document.querySelector('.sumy[data-ask="study"]'));
      } else if (st === 'pick') {
        const size = +(await page.getAttribute('.sumy', 'data-size'));
        const cands = await page.$$eval('.sumy-cand', (els) => els.map((e) => +e.dataset.v));
        const valid = cands.filter((v) => canMake(v, size));
        if (!valid.length) throw new Error('žádný platný součet v nabídce');
        if (round === 1) {
          await page.getByRole('button', { name: 'Ukázat čísla' }).click();
          await page.waitForSelector('.sumy-peek .sumy-card');
        }
        for (const v of valid) await page.locator('.sumy-cand[data-v="' + v + '"]').click();
        if (round === 0) {
          const bad = cands.find((v) => valid.indexOf(v) === -1);
          if (bad != null) await page.locator('.sumy-cand[data-v="' + bad + '"]').click();
        }
        round++;
        await page.getByRole('button', { name: 'Hotovo' }).click();
        await next(page, () => !!document.querySelector('.sumy-cands.is-locked'));
      } else {
        await page.locator('.play-foot .btn-primary:not([disabled])').first().click();
        await next(page, () => !document.querySelector('.sumy-cands.is-locked'));
      }
    }
  },
  async pyramida(page) {
    for (let k = 0; k < 20; k++) {
      const st = await next(page, () => (document.querySelector('.pyr.is-example') ? 'ex'
        : document.querySelector('.pyr:not(.is-done) .pyr-brick.is-blank:not(.is-filled)') ? 'play' : false));
      if (!st) return;
      if (st === 'ex') { await page.locator('.play-foot .btn:not([disabled])').first().click(); await page.waitForTimeout(40); continue; }
      const info = await page.evaluate(() => {
        const bricks = Array.from(document.querySelectorAll('.pyr .pyr-brick'));
        const N = bricks.length;
        const R = Math.round((Math.sqrt(8 * N + 1) - 1) / 2);
        const idx = (r, c) => (r * (r + 1)) / 2 + c;
        const v = bricks.map((b) => (b.dataset.given ? +b.dataset.given : null));
        let changed = true;
        while (changed) {
          changed = false;
          for (let r = 0; r < R; r++) for (let c = 0; c <= r; c++) {
            const i = idx(r, c);
            if (v[i] != null) continue;
            if (r < R - 1 && v[idx(r + 1, c)] != null && v[idx(r + 1, c + 1)] != null) v[i] = v[idx(r + 1, c)] + v[idx(r + 1, c + 1)];
            else if (r > 0 && c > 0 && v[idx(r - 1, c - 1)] != null && v[idx(r, c - 1)] != null) v[i] = v[idx(r - 1, c - 1)] - v[idx(r, c - 1)];
            else if (r > 0 && c < r && v[idx(r - 1, c)] != null && v[idx(r, c + 1)] != null) v[i] = v[idx(r - 1, c)] - v[idx(r, c + 1)];
            if (v[i] != null) changed = true;
          }
        }
        return { v: v, blanks: bricks.map((b, i) => (b.dataset.given ? -1 : i)).filter((i) => i >= 0) };
      });
      if (info.v.some((x) => x == null)) throw new Error('pyramida nejde dopočítat');
      const type = async (n) => {
        for (const d of String(n)) await page.locator('.pyr-pad .kp-key[data-k="' + d + '"]').click();
        await page.locator('.pyr-pad .kp-key[data-k="ok"]').click();
      };
      for (let j = 0; j < info.blanks.length; j++) {
        const i = info.blanks[j];
        await page.locator('.pyr-brick[data-i="' + i + '"]').click();
        if (j === 0) await type(info.v[i] + 1);
        if (j === 1) await page.getByRole('button', { name: 'Nápověda' }).click();
        await page.locator('.pyr-brick[data-i="' + i + '"]').click();
        await type(info.v[i]);
      }
      await next(page, () => !!document.querySelector('.pyr.is-done'));
      await page.waitForTimeout(40);
    }
  },
  async trasa(page) {
    const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    const turn = (d, s) => (s === 'R' ? (d + 1) % 4 : s === 'L' ? (d + 3) % 4 : d);
    const end = (n, start, d0, steps) => {
      let r = Math.floor(start / n), c = start % n, d = d0;
      for (const s of steps) { if (s === 'F') { r += DIRS[d][0]; c += DIRS[d][1]; } else d = turn(d, s); }
      return r * n + c;
    };
    let memo = null;
    let k = 0;
    for (let guard = 0; guard < 60; guard++) {
      const st = await next(page, () => {
        const s = document.querySelector('.trasa');
        if (!s) return false;
        const foot = document.querySelector('.play-foot .btn-primary:not([disabled])');
        if (s.dataset.ask === 'memo') return foot ? 'memo' : false;
        if (document.querySelector('.town.is-locked')) return foot && !document.querySelector('.route-step.is-now') ? 'next' : false;
        if (s.dataset.ask === 'pick') return document.querySelector('.choices:not(.is-locked)') ? 'pick' : false;
        return s.dataset.ask;
      });
      if (!st) return;
      const town = await page.evaluate(() => { const t = document.querySelector('.town'); return { n: +t.dataset.n, start: +t.dataset.start, d0: +t.dataset.d0, target: +t.dataset.target }; });
      if (st === 'memo') {
        memo = await page.$$eval('.route .route-step', (els) => els.flatMap((e) => Array(+e.dataset.n).fill(e.dataset.s)));
        await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
        await next(page, () => document.querySelector('.trasa').dataset.ask === 'tap');
      } else if (st === 'tap') {
        const steps = memo || await page.$$eval('.route .route-step', (els) => els.flatMap((e) => Array(+e.dataset.n).fill(e.dataset.s)));
        memo = null;
        let i = end(town.n, town.start, town.d0, steps);
        if (i !== town.target) throw new Error('pokyny nevedou do cíle');
        if (k === 1) i = await page.$$eval('.town-cell.is-place', (els, tg) => +els.map((e) => e.dataset.i).find((x) => +x !== tg), town.target);
        k++;
        await page.locator('.town-cell[data-i="' + i + '"]').click();
        await next(page, () => !!document.querySelector('.town.is-locked'));
      } else if (st === 'pick') {
        const seqs = await page.$$eval('.choices .choice', (els) => els.map((b) => Array.from(b.querySelectorAll('.route-step')).flatMap((e) => Array(+e.dataset.n).fill(e.dataset.s))));
        const good = seqs.findIndex((sq) => end(town.n, town.start, town.d0, sq) === town.target);
        if (good < 0) throw new Error('žádná řada pokynů nevede do cíle');
        const pickIdx = k === 1 ? seqs.findIndex((_, j) => j !== good) : good;
        k++;
        await page.locator('.choices:not(.is-locked) .choice').nth(pickIdx).click();
        await next(page, () => !!document.querySelector('.town.is-locked'));
      } else if (st === 'build') {
        const plan = await page.evaluate(() => {
          const t = document.querySelector('.town');
          const n = +t.dataset.n, start = +t.dataset.start, d0 = +t.dataset.d0, target = +t.dataset.target;
          const cells = Array.from(t.querySelectorAll('.town-cell'));
          const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
          const prev = {};
          const key = (i, d) => i * 4 + d;
          prev[key(start, d0)] = null;
          const q = [[start, d0]];
          let goal = null;
          while (q.length && goal == null) {
            const [i, d] = q.shift();
            const moves = [['L', i, (d + 3) % 4], ['R', i, (d + 1) % 4]];
            const r = Math.floor(i / n) + DIRS[d][0], c = (i % n) + DIRS[d][1];
            if (r >= 0 && c >= 0 && r < n && c < n) {
              const j = r * n + c;
              if (j === target) { prev['goal'] = [key(i, d), 'F']; goal = 'goal'; break; }
              if (!cells[j].classList.contains('is-place') && !cells[j].classList.contains('is-block')) moves.push(['F', j, d]);
            }
            for (const m of moves) if (!(key(m[1], m[2]) in prev)) { prev[key(m[1], m[2])] = [key(i, d), m[0]]; q.push([m[1], m[2]]); }
          }
          const steps = [];
          let cur = 'goal';
          while (prev[cur]) { steps.unshift(prev[cur][1]); cur = prev[cur][0]; }
          return steps;
        });
        const best = +(await page.getAttribute('.trasa', 'data-best'));
        if (plan.length !== best) throw new Error('nejkratší cesta nesedí: ' + plan.length + ' / ' + best);
        if (k === 0) {
          // Schválně jedna otočka navíc a zpět, aby se vyzkoušelo tlačítko Zpět.
          await page.locator('.trasa-key[data-s="L"]').click();
          await page.getByRole('button', { name: 'Zpět o krok' }).click();
        }
        k++;
        for (const s of plan) await page.locator('.trasa-key[data-s="' + s + '"]').click();
        await next(page, () => !!document.querySelector('.town.is-locked'));
      } else if (st === 'next') {
        await page.locator('.play-foot .btn-primary:not([disabled])').first().click();
        await next(page, () => !document.querySelector('.town.is-locked'));
      }
    }
  }
};
players.cisla = players.osmismerka; // stejné ovládání jako Osmisměrka, jen s číslicemi
players.mustek = async function (page) {
  const lists = {};
  let asked = 0;
  for (let g = 0; g < 80; g++) {
    const st = await next(page, () => {
      const m = document.querySelector('.mustek');
      if (!m) return false;
      if (m.dataset.ask === 'study') return document.querySelector('.play-foot .btn:not([disabled])') ? 'study' : false;
      return document.querySelector('.choices:not(.is-locked)') ? m.dataset.ask : false;
    });
    if (!st) return;
    if (st === 'study') {
      const info = await page.evaluate(() => ({ word: document.querySelector('.mustek').dataset.word || '', items: Array.from(document.querySelectorAll('.acro-list li')).map((li) => li.textContent) }));
      if (info.word) lists[info.word] = info.items;
      await page.locator('.play-foot .btn:not([disabled])').first().click();
      await page.waitForFunction((w) => !document.querySelector('.play') || !document.querySelector('.mustek[data-ask="study"]' + (w ? '[data-word="' + w + '"]' : '')), info.word);
      continue;
    }
    let ans;
    if (st === 'pause') ans = await page.evaluate(() => { const m = document.querySelector('.quiz-q').textContent.match(/(\d+) \+ (\d+)/); return String(+m[1] + +m[2]); });
    else if (st === 'letter') {
      const at = await page.evaluate(() => { const m = document.querySelector('.mustek'); return [m.dataset.word, +m.dataset.k]; });
      ans = lists[at[0]][at[1]];
      if (asked++ === 1) {
        await page.locator('.choices:not(.is-locked) .choice').filter({ hasNotText: new RegExp('^' + esc(ans) + '$') }).first().click();
        await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
        continue;
      }
    } else ans = await page.getAttribute('.mustek', 'data-a');
    await page.locator('.choices:not(.is-locked) .choice', { hasText: new RegExp('^' + esc(ans) + '$') }).click();
    await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
  }
};
players.stitky = async function (page) {
  let round = 0;
  for (let g = 0; g < 40; g++) {
    const st = await next(page, () => {
      const m = document.querySelector('.stitky');
      if (!m) return false;
      if (m.dataset.ask === 'draw') return document.querySelector('.jars:not(.is-locked)') ? 'draw' : false;
      if (document.querySelector('.choices:not(.is-locked)')) return m.dataset.ask;
      return document.querySelector('.play-foot .btn-primary:not([disabled])') && m.dataset.ask !== 'assign' ? 'next' : false;
    });
    if (!st) return;
    if (st === 'draw') {
      // Napoprvé schválně ze špatné sklenice, jinak ze sklenice se štítkem „směs“.
      const sel = round === 0 ? '.jar:not([data-label="směs"])' : '.jar[data-label="směs"]';
      round++;
      await page.locator(sel).first().click();
      await next(page, () => document.querySelector('.stitky').dataset.ask !== 'draw');
    } else if (st === 'assign') {
      const ans = await page.evaluate(() => { const m = document.querySelector('.stitky'); return m.dataset.contents.split('|')[+m.dataset.jar]; });
      await page.locator('.choices:not(.is-locked) .choice', { hasText: new RegExp(esc(ans) + '$') }).click();
      await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
    } else if (st === 'why') {
      await page.locator('.choices:not(.is-locked) .choice', { hasText: /^Štítek lže/ }).click();
      await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
    } else {
      await page.locator('.play-foot .btn-primary:not([disabled])').first().click();
      await page.waitForTimeout(60);
    }
  }
};
players.polevka = async function (page) {
  const word = async (w) => {
    for (const ch of w) {
      const i = await page.$$eval('.soup-l', (els, c) => els.findIndex((e) => !e.disabled && !e.classList.contains('is-gone') && e.dataset.ch === c), ch);
      await page.locator('.soup-l').nth(i).click();
    }
  };
  const words = await page.$$eval('.soup-word', (els) => els.map((e) => e.dataset.w));
  for (let k = 0; k < words.length; k++) {
    const before = await page.$$eval('.soup-word.is-found', (els) => els.length);
    if (k === 0) {
      // Jedno písmeno vybrat a vrátit.
      await word(words[k].charAt(0));
      await page.getByRole('button', { name: 'Vrátit písmeno' }).click();
    }
    if (k === 1) {
      await page.getByRole('button', { name: 'Nápověda' }).click();
      await page.getByRole('button', { name: 'Nápověda' }).click();
      await next(page, (n) => document.querySelectorAll('.soup-word.is-found').length > n, before);
      continue;
    }
    const left = await page.$$eval('.soup-word:not(.is-found)', (els) => els.map((e) => e.dataset.w));
    await word(left[0]);
    await next(page, (n) => document.querySelectorAll('.soup-word.is-found').length > n, before);
  }
};
players.terc = async function (page) {
  let round = 0;
  for (let g = 0; g < 30; g++) {
    const st = await next(page, () => (document.querySelector('.terc .terc-board:not(.is-done)') ? 'play' : false));
    if (!st) return;
    const info = await page.evaluate(() => { const m = document.querySelector('.terc'); return { t: +m.dataset.target, rings: JSON.parse(m.dataset.rings), minus: m.dataset.minus === '' ? -1 : +m.dataset.minus }; });
    let combo = null;
    const walk = (k, acc, pick) => {
      if (combo) return;
      if (k === info.rings.length) { if (acc === info.t) combo = pick.slice(); return; }
      info.rings[k].forEach((v) => walk(k + 1, acc + (k === info.minus ? -v : v), pick.concat(v)));
    };
    walk(0, 0, []);
    if (!combo) throw new Error('terč nemá řešení');
    if (round++ === 0) {
      // Napoprvé schválně špatně: v posledním kruhu jiné číslo.
      const last = info.rings.length - 1;
      const other = info.rings[last].find((v) => v !== combo[last]);
      for (let k = 0; k < last; k++) await page.locator('.terc-n[data-ring="' + k + '"][data-v="' + combo[k] + '"]').click();
      await page.locator('.terc-n[data-ring="' + last + '"][data-v="' + other + '"]').click();
      await page.locator('.terc-n[data-ring="' + last + '"][data-v="' + combo[last] + '"]').click();
    } else {
      for (let k = 0; k < combo.length; k++) await page.locator('.terc-n[data-ring="' + k + '"][data-v="' + combo[k] + '"]').click();
    }
    await next(page, () => !!document.querySelector('.terc-board.is-done'));
    await page.waitForTimeout(40);
  }
};
players.balonky = async function (page) {
  let round = 0;
  for (let g = 0; g < 30; g++) {
    const st = await next(page, () => (document.querySelector('.balonky') && !document.querySelector('.bal.is-flying') ? 'play' : false));
    if (!st) return;
    const info = await page.evaluate(() => {
      const m = document.querySelector('.balonky');
      return { goal: +m.dataset.goal, k: +m.dataset.k, bal: Array.from(document.querySelectorAll('.bal:not([disabled])')).map((b) => [+b.dataset.i, +b.dataset.v]) };
    });
    let pick = null;
    const rec = (from, left, sum, acc) => {
      if (pick) return;
      if (left === 0) { if (sum === info.goal) pick = acc; return; }
      for (let j = from; j < info.bal.length; j++) rec(j + 1, left - 1, sum + info.bal[j][1], acc.concat(info.bal[j][0]));
    };
    rec(0, info.k, 0, []);
    if (!pick) throw new Error('cíl nejde složit');
    if (round++ === 0) {
      const wrong = info.bal.map((b) => b[0]).find((i) => pick.indexOf(i) === -1);
      for (let j = 0; j < pick.length - 1; j++) await page.locator('.bal[data-i="' + pick[j] + '"]').click();
      await page.locator('.bal[data-i="' + wrong + '"]').click();
      await page.locator('.bal[data-i="' + wrong + '"]').click();
      await page.locator('.bal[data-i="' + pick[pick.length - 1] + '"]').click();
    } else {
      for (const i of pick) await page.locator('.bal[data-i="' + i + '"]').click();
    }
    await next(page, () => !!document.querySelector('.bal.is-flying'));
    await next(page, () => !document.querySelector('.bal.is-flying'));
  }
};
players.smajlici = async function (page) {
  let faces = [];
  let asked = 0;
  for (let g = 0; g < 60; g++) {
    const st = await next(page, () => {
      const m = document.querySelector('.smajlici');
      if (!m) return false;
      if (m.dataset.ask === 'study') return document.querySelector('.play-foot .btn:not([disabled])') ? 'study' : false;
      return document.querySelector('.choices:not(.is-locked)') ? 'recall' : false;
    });
    if (!st) return;
    if (st === 'study') {
      faces = (await page.getAttribute('.smajlici', 'data-faces')).split('|');
      await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
      await next(page, () => document.querySelector('.smajlici').dataset.ask !== 'study');
      continue;
    }
    const name = faces[+(await page.getAttribute('.smajlici', 'data-slot'))];
    if (asked++ === 1) await page.locator('.choices:not(.is-locked) .choice').filter({ hasNot: page.locator('[data-face="' + name + '"]') }).first().click();
    else await page.locator('.choices:not(.is-locked) .choice').filter({ has: page.locator('[data-face="' + name + '"]') }).click();
    await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
  }
};
players.prelevani = async function (page) {
  let round = 0;
  for (let g = 0; g < 20; g++) {
    const st = await next(page, () => (document.querySelector('.prelevani') && !document.querySelector('.vessel.is-goal') ? 'play' : false));
    if (!st) return;
    const solve = async () => page.evaluate(() => {
      const m = document.querySelector('.prelevani');
      const cap = m.dataset.cap.split(',').map(Number), goal = +m.dataset.goal, start = m.dataset.state.split(',').map(Number);
      const key = (s) => s.join(',');
      const prev = {}; prev[key(start)] = null; const q = [start];
      while (q.length) {
        const s = q.shift();
        if (s.indexOf(goal) !== -1) { const path = []; let k = key(s); while (prev[k]) { path.unshift(prev[k].mv); k = prev[k].from; } return path; }
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
          if (i === j || !s[i] || s[j] === cap[j]) continue;
          const t = s.slice(); const a = Math.min(t[i], cap[j] - t[j]); t[i] -= a; t[j] += a;
          if (!(key(t) in prev)) { prev[key(t)] = { from: key(s), mv: [i, j] }; q.push(t); }
        }
      }
      return null;
    });
    if (round++ === 0) {
      // Nápověda, jeden tah, Zpět.
      await page.getByRole('button', { name: 'Nápověda' }).click();
      const p0 = await solve();
      await page.locator('.vessel[data-i="' + p0[0][0] + '"]').click();
      await page.locator('.vessel[data-i="' + p0[0][1] + '"]').click();
      if (!(await page.$('.vessel.is-goal'))) await page.getByRole('button', { name: 'Zpět' }).click();
    }
    const path = await solve();
    if (!path) throw new Error('úloha nejde vyřešit');
    for (const mv of path) {
      await page.locator('.vessel[data-i="' + mv[0] + '"]').click();
      await page.locator('.vessel[data-i="' + mv[1] + '"]').click();
    }
    await next(page, () => !!document.querySelector('.vessel.is-goal'));
    await next(page, () => !document.querySelector('.vessel.is-goal'));
  }
};
players.karty = async function (page) {
  let played = [];
  let asked = 0;
  for (let g = 0; g < 40; g++) {
    const st = await next(page, () => {
      const m = document.querySelector('.karty');
      if (!m) return false;
      if (m.dataset.ask === 'deal') return 'deal';
      if (m.dataset.ask === 'table') return document.querySelector('.mtab-cell.is-hit, .mtab-cell.is-miss, .mtab-cell.is-false') ? (document.querySelector('.play-foot .btn-primary:not([disabled])') ? 'next' : false) : 'table';
      return document.querySelector('.choices:not(.is-locked)') ? 'yesno' : false;
    });
    if (!st) return;
    if (st === 'deal') {
      played = (await page.getAttribute('.karty', 'data-played')).split('|');
      await next(page, () => document.querySelector('.karty').dataset.ask !== 'deal');
    } else if (st === 'yesno') {
      const id = await page.getAttribute('.karty', 'data-card');
      let yes = played.indexOf(id) !== -1;
      if (asked++ === 1) yes = !yes;
      await page.locator('.choices:not(.is-locked) .choice', { hasText: yes ? /^Ano$/ : /^Ne$/ }).click();
      await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
    } else if (st === 'table') {
      for (const id of played.slice(1)) await page.locator('.mtab-cell[data-card="' + id + '"]').click();
      await page.getByRole('button', { name: 'Hotovo' }).click();
      await next(page, () => !!document.querySelector('.mtab-cell.is-hit, .mtab-cell.is-miss'));
    } else {
      await page.locator('.play-foot .btn-primary:not([disabled])').first().click();
      await page.waitForTimeout(60);
    }
  }
};
players.dilek = async function (page) {
  let k = 0;
  for (let g = 0; g < 20; g++) {
    const st = await next(page, () => (document.querySelector('.dilek') && document.querySelector('.choices:not(.is-locked)') ? 'pick' : false));
    if (!st) return;
    const right = +(await page.getAttribute('.dilek', 'data-right'));
    if (k === 0 && (await page.$('.dilek-rot'))) await page.locator('.dilek-rot').click();
    const idx = k++ === 1 ? (right + 1) % (await page.locator('.choices:not(.is-locked) .choice').count()) : right;
    await page.locator('.choices:not(.is-locked) .choice').nth(idx).click();
    await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
  }
};
players.pravidlo = async function (page) {
  let k = 0;
  for (let g = 0; g < 20; g++) {
    const st = await next(page, () => (document.querySelector('.pravidlo') ? (document.querySelector('.choices:not(.is-locked)') ? 'pick' : document.querySelector('.play-foot .btn-primary:not([disabled])') ? 'next' : false) : false));
    if (!st) return;
    if (st === 'next') { await page.locator('.play-foot .btn-primary:not([disabled])').first().click(); await page.waitForTimeout(60); continue; }
    const right = +(await page.getAttribute('.pravidlo', 'data-right'));
    const idx = k++ === 1 ? (right + 1) % (await page.locator('.choices:not(.is-locked) .choice').count()) : right;
    await page.locator('.choices:not(.is-locked) .choice').nth(idx).click();
    await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
  }
};
players.ulohy = async function (page) {
  let k = 0;
  for (let g = 0; g < 20; g++) {
    const st = await next(page, () => (document.querySelector('.ulohy') ? (document.querySelector('.choices:not(.is-locked)') ? 'pick' : document.querySelector('.play-foot .btn-primary:not([disabled])') ? 'next' : false) : false));
    if (!st) return;
    if (st === 'next') { await page.locator('.play-foot .btn-primary:not([disabled])').first().click(); await page.waitForTimeout(60); continue; }
    const a = await page.getAttribute('.ulohy', 'data-a');
    if (k === 0) await page.getByRole('button', { name: 'Nápověda' }).click();
    const re = new RegExp('^' + a + '(\\u00a0Kč)?$');
    if (k++ === 1) await page.locator('.choices:not(.is-locked) .choice').filter({ hasNotText: re }).first().click();
    else await page.locator('.choices:not(.is-locked) .choice', { hasText: re }).click();
    await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
  }
};
players.kostky = async function (page) {
  let k = 0;
  for (let g = 0; g < 20; g++) {
    const st = await next(page, () => (document.querySelector('.kostky') && document.querySelector('.choices:not(.is-locked)') ? 'pick' : false));
    if (!st) return;
    const a = await page.getAttribute('.kostky', 'data-a');
    const map = { L: 'V\u00a0levé', R: 'V\u00a0pravé', '=': 'Stejně' };
    const label = map[a] || a;
    if (k++ === 1) await page.locator('.choices:not(.is-locked) .choice').filter({ hasNotText: new RegExp('^' + esc(label) + '$') }).first().click();
    else await page.locator('.choices:not(.is-locked) .choice', { hasText: new RegExp('^' + esc(label) + '$') }).click();
    await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
  }
};
players.zebrik = async function (page) {
  let k = 0;
  for (let g = 0; g < 40; g++) {
    const st = await next(page, () => (document.querySelector('.zebrik') ? (document.querySelector('.choices:not(.is-locked)') ? 'pick' : document.querySelector('.play-foot .btn-primary:not([disabled])') ? 'next' : false) : false));
    if (!st) return;
    if (st === 'next') { await page.locator('.play-foot .btn-primary:not([disabled])').first().click(); await page.waitForTimeout(60); continue; }
    const ans = await page.evaluate(() => {
      const p = document.querySelector('.zebrik').dataset.path.split('|');
      const i = Array.from(document.querySelectorAll('.rung')).findIndex((r) => r.classList.contains('is-empty'));
      return p[i];
    });
    if (k++ === 1) await page.locator('.choices:not(.is-locked) .choice').filter({ hasNotText: new RegExp('^' + esc(ans) + '$') }).first().click();
    else await page.locator('.choices:not(.is-locked) .choice', { hasText: new RegExp('^' + esc(ans) + '$') }).click();
    await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
  }
};
players.koliky = async function (page) {
  const PEG = ['svíčka', 'labuť', 'trojlístek', 'plachetnice', 'ruka', 'šnek', 'vlajka', 'sněhulák', 'balonek', 'kuželky'];
  let things = [];
  let asked = 0;
  for (let g = 0; g < 40; g++) {
    const st = await next(page, () => {
      const m = document.querySelector('.koliky');
      if (!m) return false;
      if (m.dataset.ask === 'study') return document.querySelector('.play-foot .btn:not([disabled])') ? 'study' : false;
      return document.querySelector('.choices:not(.is-locked)') ? m.dataset.ask : false;
    });
    if (!st) return;
    if (st === 'study') {
      things = await page.$$eval('.peg .peg-text b', (els) => els.map((e) => e.textContent));
      await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
      await next(page, () => !document.querySelector('.koliky[data-ask="study"]'));
      continue;
    }
    const n = +(await page.getAttribute('.koliky', 'data-n'));
    const ans = st === 'peg' ? PEG[n - 1] : st === 'num' || st === 'where' ? String(n) : things[n - 1];
    const re = st === 'num' || st === 'where' ? new RegExp('^' + n + '$') : new RegExp(esc(ans) + '$');
    if (asked++ === 1) await page.locator('.choices:not(.is-locked) .choice').filter({ hasNotText: re }).first().click();
    else await page.locator('.choices:not(.is-locked) .choice', { hasText: re }).click();
    await next(page, () => !document.querySelector('.choices:not(.is-locked)'));
  }
};
const NEW_GAMES = ['retez', 'vyhodne', 'hadani', 'rodina', 'kulicka', 'dvojice', 'byt', 'osmismerka', 'sudoku', 'podnos', 'sumy', 'pyramida', 'trasa', 'cisla', 'mustek', 'koliky', 'stitky', 'polevka', 'terc', 'balonky', 'smajlici', 'prelevani', 'karty', 'dilek', 'pravidlo', 'ulohy', 'kostky', 'zebrik', 'tvary'];

async function mcq(page, answerFn) {
  for (let r = 0; r < 16; r++) {
    if (!(await next(page, freshChoices))) return;
    const ans = await page.evaluate(answerFn);
    await page.locator('.choices:not(.is-locked) .choice', { hasText: new RegExp('^' + String(ans).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).first().click();
    await page.waitForTimeout(30);
  }
}

/* Příprava před spuštěním hry: sledování věcí, které se ukazují jen na okamžik. */
async function prepare(page) {
  await page.evaluate(() => {
    if (window.__prepared) return;
    window.__prepared = true;
    window.__seq = [];
    const FRUIT = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝'];
    new MutationObserver((muts) => {
      muts.forEach((m) => {
        const el = m.target;
        if (el.classList && el.classList.contains('win') && el.classList.contains('is-lit') && !(m.oldValue || '').includes('is-lit')) {
          const scene = el.closest('.okna-scene');
          if (scene && scene.classList.contains('is-watching')) window.__seq.push(Array.prototype.indexOf.call(scene.querySelectorAll('.win'), el));
        }
        if (el.classList && el.classList.contains('catch-item') && el.classList.contains('is-in') && !(m.oldValue || '').includes('is-in')) {
          if (FRUIT.indexOf(el.textContent) !== -1) document.querySelector('.catch-btn').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
        }
      });
      const dots = document.querySelectorAll('.count-dot').length;
      if (dots) window.__dots = dots;
      const slots = Array.from(document.querySelectorAll('.shelf-slot'));
      if (slots.length && slots.every((s) => s.disabled && !s.classList.contains('is-covered') && s.textContent)) window.__shelf = slots.map((s) => s.textContent);
      const cells = Array.from(document.querySelectorAll('.mosaic-cell'));
      if (cells.length && cells.every((c) => c.disabled) && cells.some((c) => c.classList.contains('is-on'))) {
        window.__mosaic = cells.map((c, i) => (c.classList.contains('is-on') ? i : -1)).filter((i) => i >= 0);
      }
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  });
}

async function playFree(page, base, id, label) {
  await page.goto(base + '?ts=0.1#hra-' + id);
  await page.waitForSelector('.intro-hero');
  await prepare(page);
  await page.getByRole('button', { name: 'Začít hru' }).click();
  await page.waitForSelector('.play-stage > *');
  await page.waitForTimeout(120);
  await shot(page, label + '-' + id);
  await players[id](page);
  await page.waitForSelector('.result', { timeout: T });
  return (await page.textContent('.result-big')) + ' ' + (await page.textContent('.result-big-label'));
}

async function continueAll(page) {
  for (let i = 0; i < 12; i++) {
    if (await page.$('.nodes')) return;
    await page.getByRole('button', { name: 'Pokračovat' }).click();
    await page.waitForTimeout(80);
  }
}

(async () => {
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await chromium.launch();
  let failures = 0;

  const DEVICES = [['iphone', devices['iPhone 13']], ['ipad', devices['iPad (gen 7)']]].slice(0, ONLY ? 1 : 2);
  for (const [label, device] of DEVICES) {
    const context = await browser.newContext(Object.assign({}, device, { deviceScaleFactor: 1, locale: 'cs-CZ' }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    // 1) první spuštění
    await page.goto(base + '?ts=0.1');
    await page.waitForSelector('.onboarding');
    await shot(page, label + '-onboarding');
    await page.getByRole('button', { name: 'Pokračovat' }).click();
    await page.getByRole('button', { name: 'Vydat se na cestu' }).click();
    await page.waitForSelector('.nodes');
    await shot(page, label + '-path');

    // 2) celá první zastávka cesty
    if (label === 'iphone' && !ONLY) {
      try {
        for (let n = 0; n < 6; n++) {
          await page.click('.node.is-current');
          await page.waitForSelector('.modal');
          await page.waitForTimeout(300);
          if (n === 0) await shot(page, label + '-sheet');
          const chest = await page.$('.big-stat.is-chest');
          if (chest) {
            await page.getByRole('button', { name: 'Otevřít truhlu' }).click();
            await page.waitForSelector('.summary');
            await shot(page, label + '-chest');
            await continueAll(page);
            continue;
          }
          await page.getByRole('button', { name: /Začít lekci/ }).click();
          for (let g = 0; g < 5; g++) {
            await page.waitForSelector('.gate, .summary', { timeout: T });
            if (await page.$('.summary')) break;
            const name = await page.textContent('.gate-game h1');
            const id = await page.evaluate((nm) => Object.keys(SM.games).find((k) => SM.games[k].name === nm), name);
            if (n === 0 && g === 1) await shot(page, label + '-gate');
            await prepare(page);
            await page.getByRole('button', { name: 'Začít hru' }).click();
            await page.waitForSelector('.play-stage > *');
            await players[id](page);
          }
          await page.waitForSelector('.summary');
          if (n === 0 || n === 5) await shot(page, label + '-summary-' + n);
          for (let c = 0; c < 12 && !(await page.$('.nodes')); c++) {
            if (n === 5 && (await page.$('.celebrate.is-postcard'))) await shot(page, label + '-postcard');
            if (await page.$('.celebrate.is-unlock')) await shot(page, label + '-unlock');
            if (await page.$('.celebrate.is-streak')) await shot(page, label + '-streak');
            await page.getByRole('button', { name: 'Pokračovat' }).click();
            await page.waitForTimeout(60);
          }
        }
        const st = await page.evaluate(() => ({ post: Object.keys(SM.store.profile().postcards), xp: SM.store.profile().xp, unit: SM.engine.position().u, hodiny: SM.engine.isUnlocked('hodiny') }));
        if (st.post[0] !== 'praha' || st.unit !== 1 || !st.hodiny) { failures++; console.log('[' + label + '] cesta FAILED', st); }
        else console.log('[' + label + '] první zastávka OK → pohlednice ' + st.post.join(', ') + ', ' + st.xp + ' bodů, odemčeny další hry');
        await shot(page, label + '-path-after');
      } catch (e) {
        failures++;
        console.log('[' + label + '] cesta FAILED: ' + e.message.split('\n')[0]);
        await shot(page, label + '-path-FAIL');
      }
    }

    // 3) všechny hry ve volném hraní
    await page.evaluate(() => Object.keys(SM.games).forEach((id) => SM.engine.unlockEarly(id)));
    const ids = ONLY || await page.evaluate(() => Object.keys(SM.games));
    for (const id of ids) {
      try {
        const res = await playFree(page, base, id, label);
        console.log('[' + label + '] ' + id.padEnd(10) + ' OK  → ' + res.replace(/\s+/g, ' '));
      } catch (e) {
        failures++;
        console.log('[' + label + '] ' + id + ' FAILED: ' + e.message.split('\n')[0] + ' | ' + (await page.evaluate(() => (document.querySelector('.play-status') || {}).textContent || '')));
        await shot(page, label + '-' + id + '-FAIL');
      }
    }

    // 3b) nové hry na všech úrovních obtížnosti
    if (label === 'iphone') {
      for (const id of NEW_GAMES.filter((g) => !ONLY || ONLY.indexOf(g) !== -1)) {
        const max = await page.evaluate((g) => SM.games[g].maxLevel, id);
        for (let lv = 1; lv <= max; lv++) {
          // Jiná kotva než #hra-…, jinak by se stejná adresa znovu nenačetla.
          await page.goto(base + '?ts=0.1#hry');
          await page.waitForSelector('.game-row');
          await page.evaluate((a) => { SM.store.game(a[0]).level = a[1]; SM.store.save(); }, [id, lv]);
          try {
            const res = await playFree(page, base, id, label + '-lv' + lv);
            console.log('[' + label + '] ' + (id + ' úroveň ' + lv).padEnd(18) + ' OK  → ' + res.replace(/\s+/g, ' '));
          } catch (e) {
            failures++;
            console.log('[' + label + '] ' + id + ' úroveň ' + lv + ' FAILED: ' + e.message.split('\n')[0] + ' | ' + (await page.evaluate(() => (document.querySelector('.play-status') || {}).textContent || '')));
            await shot(page, label + '-' + id + '-lv' + lv + '-FAIL');
          }
        }
      }
    }

    if (ONLY) {
      if (errors.length) { failures += errors.length; console.log('[' + label + '] chyby v konzoli:\n  ' + errors.join('\n  ')); }
      await context.close();
      continue;
    }

    // 3c) úspěšnost a rychlost se ukládají a stránka „Vývoj v čase“ se vykreslí
    const saved = await page.evaluate(() => {
      const last = SM.store.history().slice(-25);
      return { acc: last.every((e) => e.a != null && e.a >= 0 && e.a <= 100), rt: last.filter((e) => e.r != null).length };
    });
    if (!saved.acc || !saved.rt) { failures++; console.log('[' + label + '] úspěšnost/rychlost se neukládá', saved); }
    for (const gid of ['retez', 'blesk', 'pexeso']) {
      try {
        await page.goto(base + '?ts=0.1#pokrok-' + gid);
        await page.waitForSelector('.game-progress .tchart');
        if (await page.$('label[for="metrika-rt"]')) {
          await page.locator('label[for="metrika-rt"]').click();
          await page.waitForSelector('.tchart .tc-dot');
        }
        await page.locator('label[for="obdobi-vse"]').click();
        await page.locator('label[for="metrika-lv"]').click();
        await page.waitForSelector('.tchart .tc-dot');
        await shot(page, label + '-vyvoj-' + gid);
        console.log('[' + label + '] vývoj ' + gid.padEnd(8) + ' OK  → ' + (await page.textContent('.tc-read')));
      } catch (e) {
        failures++;
        console.log('[' + label + '] vývoj ' + gid + ' FAILED: ' + e.message.split('\n')[0]);
        await shot(page, label + '-vyvoj-' + gid + '-FAIL');
      }
    }

    // 3d) Hádanka dne: data, odpověď, body, karta na cestě
    try {
      const bad = await page.evaluate(() => {
        const L = SM.riddles.LIST;
        const ids = new Set(L.map((r) => r.id));
        return L.filter((r) => r.opts.indexOf(r.a) === -1).map((r) => r.id).concat(ids.size !== L.length ? ['duplicitní id'] : []);
      });
      if (bad.length) throw new Error('chybné hádanky: ' + bad.join(', '));
      await page.goto(base + '?ts=0.1');
      await page.waitForSelector('.riddle-card');
      await page.locator('.riddle-card:not(.school-card) .btn').click();
      await page.waitForSelector('.riddle-opts .choice');
      const xp0 = await page.evaluate(() => SM.store.profile().xp);
      await page.locator('.riddle-opts .choice').first().click();
      await page.waitForSelector('.riddle-why');
      const xp1 = await page.evaluate(() => SM.store.profile().xp);
      await shot(page, label + '-hadanka');
      if (xp1 - xp0 < 5) throw new Error('nepřipsaly se body');
      await page.getByRole('button', { name: 'Zpět na cestu' }).click();
      await continueAll(page);
      await page.waitForSelector('.riddle-card.is-done');
      console.log('[' + label + '] hádanka dne OK  → +' + (xp1 - xp0) + ' bodů, ' + (await page.evaluate(() => SM.riddles.LIST.length)) + ' hádanek');
    } catch (e) {
      failures++;
      console.log('[' + label + '] hádanka dne FAILED: ' + e.message.split('\n')[0]);
      await shot(page, label + '-hadanka-FAIL');
    }

    // 3e) Škola paměti: karta na cestě, první trik celý, odemčení dalšího
    try {
      const badSets = await page.evaluate(() => {
        const up = (w) => w.charAt(0).toUpperCase();
        const d = SM.games.mustek.data;
        return d.sets.filter((x) => x.word.split('').some((ch, i) => up(x.items[i] || '') !== ch) || x.items.length !== x.word.length).map((x) => x.word)
          .concat(d.sentences.filter((x) => x.text.replace(/[.,]/g, '').split(' ').some((w, i) => up(w) !== up(x.items[i] || ''))).map((x) => x.text));
      });
      if (badSets.length) throw new Error('nesedí pomocná slova nebo věty: ' + badSets.join(', '));
      const bad = await page.evaluate(() => SM.school.LIST.filter((t) => !t.questions.length || t.questions.some((q) => new Set(q.opts).size !== q.opts.length) || !SM.games[t.game]).map((t) => t.id));
      if (bad.length) throw new Error('chybné triky: ' + bad.join(', '));
      await page.goto(base + '?ts=0.1');
      await page.waitForSelector('.school-card');
      await page.locator('.school-card .btn').click();
      await page.waitForSelector('.trick-page');
      const id = await page.getAttribute('.trick-page', 'data-id');
      const xp0 = await page.evaluate(() => SM.store.profile().xp);
      await shot(page, label + '-trik');
      await page.getByRole('button', { name: 'Ukázka' }).click();
      await page.getByRole('button', { name: 'Vyzkoušet' }).click();
      await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
      const qs = await page.evaluate((tid) => SM.school.byId(tid).questions.map((q) => q.opts[0]), id);
      for (let k = 0; k < qs.length; k++) {
        await page.locator('.trick-opts .choice[data-v="' + qs[k] + '"]').click();
        await page.getByRole('button', { name: k + 1 < qs.length ? 'Další otázka' : 'Pokračovat' }).click();
      }
      await page.getByRole('button', { name: 'Hotovo' }).click();
      for (let c = 0; c < 6 && !(await page.$('.trick-list')); c++) {
        await page.waitForSelector('.trick-list, .celebrate');
        if (await page.$('.celebrate')) await page.getByRole('button', { name: 'Pokračovat' }).click();
        await page.waitForTimeout(80);
      }
      await page.waitForSelector('.trick-list');
      const st = await page.evaluate((tid) => ({ done: !!SM.store.profile().tricks[tid], next: SM.engine.trickState(SM.school.LIST[1].id), xp: SM.store.profile().xp }), id);
      if (!st.done || st.next !== 'open') throw new Error('trik se neuložil nebo se neodemkl další');
      await shot(page, label + '-skola');
      console.log('[' + label + '] škola paměti OK  → trik ' + id + ', +' + (st.xp - xp0) + ' bodů, další odemčen');
    } catch (e) {
      failures++;
      console.log('[' + label + '] škola paměti FAILED: ' + e.message.split('\n')[0]);
      await shot(page, label + '-skola-FAIL');
    }

    // 4) přehledy a nastavení
    for (const r of ['hry', 'sbirka', 'pokrok', 'o-treninku']) {
      await page.goto(base + '?ts=0.1#' + r);
      await page.waitForTimeout(150);
      await shot(page, label + '-tab-' + r);
    }
    await page.goto(base + '?ts=0.1#nastaveni');
    await page.waitForSelector('.settings');
    await page.locator('label[for="scale-3"]').click();
    await page.locator('label[for="theme-dark"]').click();
    const attrs = await page.evaluate(() => [document.documentElement.getAttribute('data-scale'), document.documentElement.getAttribute('data-theme')]);
    if (attrs[0] !== '3' || attrs[1] !== 'dark') { failures++; console.log('[' + label + '] nastavení FAILED', attrs); }
    await page.goto(base + '?ts=0.1');
    await page.waitForSelector('.nodes');
    await page.waitForTimeout(200);
    await shot(page, label + '-path-dark-large');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) { failures++; console.log('[' + label + '] stránka přetéká do šířky'); }

    if (errors.length) { failures += errors.length; console.log('[' + label + '] chyby v konzoli:\n  ' + errors.join('\n  ')); }
    else console.log('[' + label + '] bez chyb v konzoli');
    await context.close();
  }

  await browser.close();
  srv.close();
  console.log(failures ? '\n' + failures + ' problém(ů)' : '\nVše v pořádku.');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
