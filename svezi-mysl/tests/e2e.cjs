/* Automatický test: projde všechny hry v emulovaném iPhonu i iPadu a hlídá chyby v konzoli.
   Spuštění:  npm i -D playwright && npx playwright install chromium && node tests/e2e.cjs
   Volitelně:  node tests/e2e.cjs --shots ./screenshots   (uloží snímky obrazovek) */
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

const status = (page) => page.evaluate(() => (document.querySelector('.play-status') || {}).textContent || '');
const waitFor = (page, fn, arg, timeout) => page.waitForFunction(fn, arg, { timeout: timeout || 20000 });

/* Hráči: každá hra se dohraje podle toho, co je vidět na obrazovce. */
const players = {
  async pexeso(page) {
    const fronts = await page.$$eval('.pex-front', (els) => els.map((e) => e.textContent));
    const groups = {};
    fronts.forEach((s, i) => { (groups[s] = groups[s] || []).push(i); });
    const cards = page.locator('.pex-card');
    const keys = Object.keys(groups);
    // jeden omyl na začátku, ať se otestuje i otočení zpět
    await cards.nth(groups[keys[0]][0]).click();
    await cards.nth(groups[keys[1]][0]).click();
    await page.waitForTimeout(400);
    for (const s of keys) {
      await cards.nth(groups[s][0]).click();
      await cards.nth(groups[s][1]).click();
      await page.waitForTimeout(20);
    }
  },
  async nakup(page) {
    for (let r = 0; r < 2; r++) {
      await page.waitForSelector('.note-item');
      const items = await page.$$eval('.note-item span:not(.emo)', (els) => els.map((e) => e.textContent));
      await page.getByRole('button', { name: 'Mám zapamatováno' }).click();
      await page.waitForSelector('.quiz, .pick-grid');
      if (await page.$('.quiz')) {
        const q = await page.textContent('.quiz-q');
        const nums = q.match(/\d+/g).map(Number);
        await page.locator('.quiz-opts .btn', { hasText: new RegExp('^' + (nums[0] + nums[1]) + '$') }).click();
        await page.waitForSelector('.pick-grid');
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
    for (let r = 0; r < 8; r++) {
      await waitFor(page, () => ((document.querySelector('.play-status') || {}).textContent || '').indexOf('Teď vy') === 0);
      const seq = await page.evaluate(() => { const s = window.__seq; window.__seq = []; return s; });
      const wins = page.locator('.win');
      if (r === 2) {
        await wins.nth(seq[0] === 0 ? 1 : 0).click(); // úmyslná chyba
      } else {
        for (const i of seq) await wins.nth(i).click();
      }
      await waitFor(page, () => !document.querySelector('.okna-scene') || ((document.querySelector('.play-status') || {}).textContent || '').indexOf('Teď vy') !== 0);
    }
  },
  async blesk(page) {
    for (let t = 0; t < 16; t++) {
      await page.locator('.choice-btn').first().waitFor({ timeout: 20000 });
      await page.locator('.choice-btn').nth(t % 2).click();
      await page.locator('.slot.is-choice').first().waitFor({ timeout: 20000 });
      await page.locator('.slot.is-choice').nth(t % 4).click();
    }
  },
  async jiny(page) {
    for (let t = 0; t < 10; t++) {
      await waitFor(page, (k) => (document.querySelector('.play-progress') || {}).textContent === 'Úkol ' + k + ' z 10' &&
        document.querySelectorAll('.odd-cell').length > 0 && !document.querySelector('.odd-cell.is-found'), t + 1);
      const idx = await page.$$eval('.odd-cell', (els) => {
        const txt = els.map((e) => e.textContent);
        const counts = {};
        txt.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
        return txt.findIndex((x) => counts[x] === 1);
      });
      if (t === 1) await page.locator('.odd-cell').nth(idx === 0 ? 1 : 0).click();
      await page.locator('.odd-cell').nth(idx).click();
    }
  },
  async sipky(page) {
    for (let t = 0; t < 24; t++) {
      await waitFor(page, (k) => (document.querySelector('.play-progress') || {}).textContent === k + ' / 24' && !!document.querySelector('.arrows'), t + 1);
      const label = await page.getAttribute('.arrows', 'aria-label');
      const left = /doleva/.test(label);
      const wrong = t === 3;
      await page.getByRole('button', { name: left !== wrong ? 'Doleva' : 'Doprava' }).click();
    }
  },
  async barvy(page) {
    for (let t = 0; t < 24; t++) {
      await waitFor(page, (k) => (document.querySelector('.play-progress') || {}).textContent === k + ' / 24' &&
        !!(document.querySelector('.board-word') || {}).textContent, t + 1);
      const info = await page.evaluate(() => ({
        label: document.querySelector('.board-word').getAttribute('aria-label'),
        word: document.querySelector('.rule-pill').classList.contains('is-word')
      }));
      const m = /Slovo (\S+), napsané barvou (\S+)/.exec(info.label);
      await page.locator('.color-btn', { hasText: info.word ? m[1] : m[2] }).click();
    }
  },
  async poradi(page) {
    for (let b = 0; b < 2; b++) {
      await waitFor(page, (k) => (document.querySelector('.play-progress') || {}).textContent === 'Kolo ' + k + ' z 2' &&
        document.querySelectorAll('.dot').length > 0 && !document.querySelector('.dot.is-done'), b + 1);
      const dots = page.locator('.dot');
      const n = await dots.count();
      if (b === 0) await dots.nth(n - 1).click();
      for (let i = 0; i < n; i++) await dots.nth(i).click();
    }
  }
};
const GAMES = Object.keys(players);

/* Příprava před spuštěním hry (sledování rozsvícených oken musí běžet od první vteřiny). */
const prepare = {
  async okna(page) {
    await page.evaluate(() => {
      window.__seq = [];
      const mo = new MutationObserver((muts) => {
        muts.forEach((m) => {
          const el = m.target;
          if (!el.classList || !el.classList.contains('win')) return;
          const scene = el.closest('.okna-scene');
          if (el.classList.contains('is-lit') && !(m.oldValue || '').includes('is-lit') && scene && scene.classList.contains('is-watching')) {
            window.__seq.push(Array.prototype.indexOf.call(scene.querySelectorAll('.win'), el));
          }
        });
      });
      mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    });
  }
};

async function shot(page, name) {
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') });
}

async function playOne(page, id, label) {
  if (prepare[id]) await prepare[id](page);
  await page.getByRole('button', { name: 'Začít hru' }).click();
  await page.waitForSelector('.play-stage > *');
  await page.waitForTimeout(150);
  await shot(page, label + '-' + id + '-play');
  await players[id](page);
  await page.waitForSelector('.result', { timeout: 30000 });
  const big = await page.textContent('.result-big');
  const lbl = await page.textContent('.result-big-label');
  await shot(page, label + '-' + id + '-result');
  return big + ' ' + lbl;
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

    await page.goto(base + '?ts=0.1');
    await page.waitForSelector('.today');
    await shot(page, label + '-home');

    // 1) každá hra zvlášť
    for (const id of GAMES) {
      await page.goto(base + '?ts=0.1#hra-' + id);
      await page.waitForSelector('.intro-hero');
      if (id === 'pexeso') await shot(page, label + '-intro');
      try {
        const res = await playOne(page, id, label);
        console.log('[' + label + '] ' + id.padEnd(7) + ' OK  → ' + res.replace(/\s+/g, ' '));
      } catch (e) {
        failures++;
        console.log('[' + label + '] ' + id + ' FAILED: ' + e.message.split('\n')[0] + ' | status: ' + (await status(page)));
        await shot(page, label + '-' + id + '-FAIL');
      }
    }

    // 2) denní trénink od začátku do konce
    if (label === 'iphone') {
      await page.goto(base + '?ts=0.1');
      await page.getByRole('button', { name: /Začít trénink|Pokračovat|Projít trénink znovu/ }).click();
      for (let step = 0; step < 4; step++) {
        const btn = page.getByRole('button', { name: /^(Začít|Pokračovat): / });
        if (step === 0) await btn.click();
        await page.waitForSelector('.intro-hero');
        const name = await page.textContent('.intro-hero h1');
        const id = GAMES.find((g) => name === { pexeso: 'Pexeso', nakup: 'Nákupní seznam', okna: 'Svítící okna', blesk: 'Bleskový pohled', jiny: 'Jeden je jiný', sipky: 'Šipky', barvy: 'Barvy a slova', poradi: 'Popořadě' }[g]);
        await playOne(page, id, label + '-daily' + step);
        const next = page.getByRole('button', { name: /Další hra|Dokončit trénink/ });
        await next.click();
      }
      await page.waitForSelector('text=Dnešní trénink je hotový!');
      console.log('[' + label + '] denní trénink OK');
      await shot(page, label + '-daily-done');
    }

    // 3) přehledové stránky
    await page.goto(base + '?ts=0.1#pokrok');
    await page.waitForSelector('.kpis');
    await shot(page, label + '-progress');
    await page.goto(base + '?ts=0.1#o-treninku');
    await page.waitForSelector('.prose');
    await shot(page, label + '-about');
    await page.goto(base + '?ts=0.1#nastaveni');
    await page.waitForSelector('.settings');
    await page.locator('label[for="scale-3"]').click();
    await page.locator('label[for="theme-dark"]').click();
    const attrs = await page.evaluate(() => [document.documentElement.getAttribute('data-scale'), document.documentElement.getAttribute('data-theme')]);
    if (attrs[0] !== '3' || attrs[1] !== 'dark') { failures++; console.log('[' + label + '] nastavení FAILED', attrs); }
    await shot(page, label + '-settings-dark');
    await page.goto(base + '?ts=0.1');
    await page.waitForSelector('.today');
    await shot(page, label + '-home-dark-large');
    await page.goto(base + '?ts=0.1#hra-sipky');
    await page.getByRole('button', { name: 'Začít hru' }).click();
    await page.waitForSelector('.arrows');
    await shot(page, label + '-sipky-dark-large');

    // horizontální posun stránky nesmí nastat
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
