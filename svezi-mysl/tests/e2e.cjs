/* Automatický test: projde úvodní nastavení, celou první zastávku cesty (lekce, truhla, pohlednice)
   a všech 22 her ve volném hraní v emulovaném iPhonu a iPadu. Hlídá chyby v konzoli.
   Spuštění:  npm i -D playwright && npx playwright install chromium && node tests/e2e.cjs
   Volitelně:  node tests/e2e.cjs --shots ./screenshots   (uloží snímky obrazovky) */
const { chromium, devices } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const shotsArg = process.argv.indexOf('--shots');
const SHOTS = shotsArg > -1 ? path.resolve(process.argv[shotsArg + 1]) : null;
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
  async sber(page) { await next(page, () => false); }
};

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

  for (const [label, device] of [['iphone', devices['iPhone 13']], ['ipad', devices['iPad (gen 7)']]]) {
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
    if (label === 'iphone') {
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
    const ids = await page.evaluate(() => Object.keys(SM.games));
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
