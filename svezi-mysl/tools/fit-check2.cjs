// Kontrola rozložení: nové hry na všech úrovních, malý iPhone s největším písmem i iPhone 13.
// Hlídá, aby ovládací tlačítka nezůstala mimo obrazovku. Hraje „naslepo“ (vždy první možnost).
const { chromium, devices } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
const GAMES = (process.argv[3] || 'retez,vyhodne,hadani,rodina').split(',');
const SHOTS = process.argv[4] || null;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await chromium.launch();
  let problems = 0;
  for (const [label, dev, scale] of (process.env.DEVS || 'se-velke,i8-velke,i13').split(',').map((k) => ({ 'se-velke': ['se-velke', devices['iPhone SE'], 3], 'i8-velke': ['i8-velke', devices['iPhone 8'], 3], 'i8-vetsi': ['i8-vetsi', devices['iPhone 8'], 2], 'i13': ['i13', devices['iPhone 13'], 1], 'i13-velke': ['i13-velke', devices['iPhone 13'], 3] })[k])) {
    const ctx = await browser.newContext(Object.assign({}, dev, { deviceScaleFactor: 1, locale: 'cs-CZ' }));
    const page = await ctx.newPage();
    if (process.env.THEME) await page.addInitScript((t) => { window.__theme = t; }, process.env.THEME);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(base + '?ts=0.1');
    await page.waitForSelector('.onboarding');
    await page.getByRole('button', { name: 'Pokračovat' }).click();
    await page.getByRole('button', { name: 'Vydat se na cestu' }).click();
    await page.waitForSelector('.nodes');
    await page.evaluate((sc) => { if (window.__theme) SM.store.settings().theme = window.__theme; SM.store.settings().scale = sc; SM.store.save(); SM.ui.applySettings(); window.__big = sc > 1; Object.keys(SM.games).forEach((id) => SM.engine.unlockEarly(id)); }, scale);
    for (const id of GAMES) {
      const max = await page.evaluate((g) => SM.games[g].maxLevel, id);
      for (let lv = 1; lv <= max; lv++) {
        await page.goto(base + '?ts=0.1#hry');
        await page.waitForSelector('.game-row');
        await page.evaluate((a) => { SM.store.game(a[0]).level = a[1]; SM.store.save(); }, [id, lv]);
        await page.goto(base + '?ts=0.1#hra-' + id);
        await page.getByRole('button', { name: 'Začít hru' }).click();
        let off = 0;
        const seen = {};
        let shotDone = false;
        try {
        for (let k = 0; k < 300; k++) {
          if (await page.$('.result')) break;
          const st = await page.evaluate(() => {
            const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.top >= -1 && r.bottom <= innerHeight + 1; };
            const inScroller = (el) => !!el.closest('.offers-wrap, .guess, .ftree' + (window.__big ? ', .podnos .pick-grid, .karty .mtab' : ''));
            const controls = Array.from(document.querySelectorAll('.play button')).filter((b) => !b.disabled && b.offsetParent);
            const hidden = controls.filter((b) => !vis(b) && !inScroller(b)).map((b) => b.textContent.trim().slice(0, 20));
            const choice = document.querySelector('.choices:not(.is-locked) .choice');
            const kp = document.querySelector('.kp');
            const num = document.querySelector('.guess[data-state="play"] .guess-num:not([disabled])');
            const nxt = Array.from(document.querySelectorAll('.play-foot .btn:not([disabled]):not(.choice):not(.kp-key)'))[0];
            const pyr = document.querySelector('.pyr:not(.is-done):not(.is-example) .pyr-brick.is-sel');
            const pick = document.querySelector('.pick-grid:not(.is-locked)') && !document.querySelector('.pick[aria-pressed="true"]') ? 'pick' : null;
            const sumy = document.querySelector('.sumy-cands:not(.is-locked)') && !document.querySelector('.sumy-cand[aria-pressed="true"]') ? 'sumy' : null;
            const prim = document.querySelector('.play-foot .btn-primary:not([disabled]):not(.choice):not(.kp-key)');
            const ask = document.querySelector('[data-ask]');
            const key = (ask ? ask.dataset.ask : '') + (document.querySelector('.pyr.is-example') ? 'pyr-ex' : document.querySelector('.pyr') ? 'pyr' : '') +
              (document.querySelector('.is-locked') ? '-locked' : '');
            const jar = document.querySelector('.stitky[data-ask="draw"] .jars:not(.is-locked) .jar') ? 'jar' : null;
            const terc = document.querySelector('.terc .terc-board:not(.is-done)') && !document.querySelector('.terc-n.is-on') ? 'terc' : null;
            const bal = document.querySelector('.balonky') && !document.querySelector('.bal.is-on') && !document.querySelector('.bal.is-flying') ? 'bal' : null;
            if (terc || bal) return { key: terc || bal, hidden: hidden, kind: terc || bal, overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
            const zm = document.querySelector('.zm[data-new]:not(.is-done)') && !document.querySelector('.zm-slot[aria-pressed="true"]') ? 'zm' : null;
            if (zm) return { key: 'zm-' + document.querySelector('.zm').dataset.mode, hidden: hidden, kind: 'zm', overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
            const shelf = document.querySelector('.shelf-slot:not([disabled]):not(.is-correct)') && !document.querySelector('.shelf-slot.is-correct') ? 'shelf' : null;
            if (shelf) return { key: 'shelf', hidden: hidden, kind: 'shelf', overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
            const mtab = document.querySelector('.karty[data-ask="table"]') && !document.querySelector('.mtab-cell[aria-pressed="true"]') && !document.querySelector('.mtab-cell.is-hit, .mtab-cell.is-miss') ? 'mtab' : null;
            if (mtab) return { key: 'mtab', hidden: hidden.filter((x) => x), kind: 'mtab', overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
            const vessel = document.querySelector('.prelevani') && !document.querySelector('.vessel.is-goal') && !document.querySelector('.vessel.is-sel') ? 'vessel' : null;
            if (vessel) return { key: 'vessel', hidden: hidden, kind: 'vessel', overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
            const soup = document.querySelector('.soup-l:not([disabled]):not(.is-gone)') && !document.querySelector('.soup-pick') ? 'soup' : null;
            if (jar || soup) return { key: (ask ? ask.dataset.ask : '') + (soup ? 'soup' : ''), hidden: hidden, kind: jar || soup, overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
            const town = document.querySelector('.trasa[data-ask="tap"] .town:not(.is-locked) .town-cell.is-place') ? 'town' : document.querySelector('.trasa[data-ask="build"] .town:not(.is-locked)') ? 'build' : null;
            return { key: key, hidden: hidden, kind: town ? town : choice ? 'choice' : kp && !document.querySelector('.pyr') ? 'kp' : num ? 'num' : pyr ? 'pyr' : pick || sumy || (prim ? 'next' : nxt && !document.querySelector('.pyr') ? 'next' : 'wait'), overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
          });
          if (SHOTS && process.env.ALLSHOTS && !seen[st.key]) {
            seen[st.key] = true;
            await page.waitForTimeout(250);
            await page.screenshot({ path: path.join(SHOTS, label + '-' + id + '-lv' + lv + '-' + (st.key || 'x') + '.png') });
          }
          if (st.hidden.length || st.overflowX) {
            off++;
            if (off === 1) console.log('[' + label + '] ' + id + ' úroveň ' + lv + ': mimo obrazovku ' + JSON.stringify(st.hidden) + (st.overflowX ? ' + přetéká do šířky' : ''));
            if (SHOTS && !shotDone) { shotDone = true; await page.screenshot({ path: path.join(SHOTS, 'fit-' + label + '-' + id + '-lv' + lv + '.png') }); }
          }
          if (st.kind === 'choice') await page.locator('.choices:not(.is-locked) .choice').first().click();
          else if (st.kind === 'kp') {
            const g = await page.evaluate(() => { const r = document.querySelector('.guess[data-state="play"]'); return r ? Math.floor((+r.dataset.lo + +r.dataset.hi) / 2) : 5; });
            for (const d of String(g)) await page.locator('.kp-key', { hasText: new RegExp('^' + d + '$') }).click();
            await page.locator('.kp-ok').click();
            await page.waitForTimeout(40);
          } else if (st.kind === 'num') {
            await page.locator('.guess[data-state="play"] .guess-num:not([disabled])').first().scrollIntoViewIfNeeded();
            await page.locator('.guess[data-state="play"] .guess-num:not([disabled])').first().click();
          } else if (st.kind === 'jar') await page.locator('.jar[data-label="směs"]').click();
          else if (st.kind === 'mtab') await page.locator('.mtab-cell').first().click();
          else if (st.kind === 'zm') await page.locator('.zm-slot').first().click();
          else if (st.kind === 'shelf') await page.locator('.shelf-slot').first().click();
          else if (st.kind === 'vessel') {
            const plan = await page.evaluate(() => {
              const m = document.querySelector('.prelevani');
              const cap = m.dataset.cap.split(',').map(Number), goal = +m.dataset.goal, start = m.dataset.state.split(',').map(Number);
              const key = (x) => x.join(','); const prev = {}; prev[key(start)] = null; const q = [start];
              while (q.length) { const x = q.shift(); if (x.indexOf(goal) !== -1) { const p = []; let k = key(x); while (prev[k]) { p.unshift(prev[k].mv); k = prev[k].from; } return p; }
                for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (i === j || !x[i] || x[j] === cap[j]) continue; const t = x.slice(); const a = Math.min(t[i], cap[j] - t[j]); t[i] -= a; t[j] += a; if (!(key(t) in prev)) { prev[key(t)] = { from: key(x), mv: [i, j] }; q.push(t); } } }
              return [];
            });
            for (const mv of plan) { await page.locator('.vessel[data-i="' + mv[0] + '"]').click(); await page.locator('.vessel[data-i="' + mv[1] + '"]').click(); }
            await page.waitForTimeout(200);
          } else if (st.kind === 'terc') {
            const plan = await page.evaluate(() => {
              const m = document.querySelector('.terc'); const rings = JSON.parse(m.dataset.rings); const minus = m.dataset.minus === '' ? -1 : +m.dataset.minus; const t = +m.dataset.target;
              let combo = null; const walk = (k, acc, p) => { if (combo) return; if (k === rings.length) { if (acc === t) combo = p; return; } rings[k].forEach((v) => walk(k + 1, acc + (k === minus ? -v : v), p.concat(v))); };
              walk(0, 0, []); return combo;
            });
            for (let k = 0; k < plan.length; k++) await page.locator('.terc-n[data-ring="' + k + '"][data-v="' + plan[k] + '"]').click();
            await page.waitForTimeout(150);
          } else if (st.kind === 'bal') {
            const plan = await page.evaluate(() => {
              const m = document.querySelector('.balonky'); const goal = +m.dataset.goal; const k = +m.dataset.k;
              const bal = Array.from(document.querySelectorAll('.bal:not([disabled])')).map((b) => [+b.dataset.i, +b.dataset.v]);
              let pick = null; const rec = (f, l, s, a) => { if (pick) return; if (!l) { if (s === goal) pick = a; return; } for (let j = f; j < bal.length; j++) rec(j + 1, l - 1, s + bal[j][1], a.concat(bal[j][0])); };
              rec(0, k, 0, []); return pick;
            });
            for (const i of plan) await page.locator('.bal[data-i="' + i + '"]').click();
            await page.waitForTimeout(150);
          }
          else if (st.kind === 'soup') {
            const w = await page.$$eval('.soup-word:not(.is-found)', (els) => els[0].dataset.w);
            for (const ch of w) {
              const i = await page.$$eval('.soup-l', (els, c) => els.findIndex((e) => !e.disabled && !e.classList.contains('is-gone') && e.dataset.ch === c), ch);
              await page.locator('.soup-l').nth(i).click();
            }
            await page.waitForTimeout(150);
          } else if (st.kind === 'town') await page.locator('.town:not(.is-locked) .town-cell.is-place').first().click();
          else if (st.kind === 'build') {
            const plan = await page.evaluate(() => {
              const t = document.querySelector('.town');
              const n = +t.dataset.n, start = +t.dataset.start, d0 = +t.dataset.d0, target = +t.dataset.target;
              const cells = Array.from(t.querySelectorAll('.town-cell'));
              const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
              const prev = {}; const key = (i, d) => i * 4 + d;
              prev[key(start, d0)] = null;
              const q = [[start, d0]];
              while (q.length) {
                const [i, d] = q.shift();
                const moves = [['L', i, (d + 3) % 4], ['R', i, (d + 1) % 4]];
                const r = Math.floor(i / n) + DIRS[d][0], c = (i % n) + DIRS[d][1];
                if (r >= 0 && c >= 0 && r < n && c < n) {
                  const j = r * n + c;
                  if (j === target) { prev.goal = [key(i, d), 'F']; break; }
                  if (!cells[j].classList.contains('is-place') && !cells[j].classList.contains('is-block')) moves.push(['F', j, d]);
                }
                for (const m of moves) if (!(key(m[1], m[2]) in prev)) { prev[key(m[1], m[2])] = [key(i, d), m[0]]; q.push([m[1], m[2]]); }
              }
              const steps = []; let cur = 'goal';
              while (prev[cur]) { steps.unshift(prev[cur][1]); cur = prev[cur][0]; }
              return steps;
            });
            for (const x of plan) await page.locator('.trasa-key[data-s="' + x + '"]').click();
            await page.waitForTimeout(100);
          } else if (st.kind === 'pick') await page.locator('.pick-grid:not(.is-locked) .pick').first().click();
          else if (st.kind === 'sumy') await page.locator('.sumy-cands:not(.is-locked) .sumy-cand').first().click();
          else if (st.kind === 'pyr') {
            const v = await page.evaluate(() => {
              const bricks = Array.from(document.querySelectorAll('.pyr .pyr-brick'));
              const R = Math.round((Math.sqrt(8 * bricks.length + 1) - 1) / 2);
              const idx = (r, c) => (r * (r + 1)) / 2 + c;
              const v = bricks.map((b) => (b.dataset.given ? +b.dataset.given : b.classList.contains('is-filled') ? +b.textContent : null));
              for (let it = 0; it < 30; it++) for (let r = 0; r < R; r++) for (let c = 0; c <= r; c++) {
                const i = idx(r, c);
                if (v[i] != null) continue;
                if (r < R - 1 && v[idx(r + 1, c)] != null && v[idx(r + 1, c + 1)] != null) v[i] = v[idx(r + 1, c)] + v[idx(r + 1, c + 1)];
                else if (r > 0 && c > 0 && v[idx(r - 1, c - 1)] != null && v[idx(r, c - 1)] != null) v[i] = v[idx(r - 1, c - 1)] - v[idx(r, c - 1)];
                else if (r > 0 && c < r && v[idx(r - 1, c)] != null && v[idx(r, c + 1)] != null) v[i] = v[idx(r - 1, c)] - v[idx(r, c + 1)];
              }
              return v[bricks.indexOf(document.querySelector('.pyr-brick.is-sel'))];
            });
            for (const d of String(v)) await page.locator('.pyr-pad .kp-key[data-k="' + d + '"]').click();
            await page.locator('.pyr-pad .kp-key[data-k="ok"]').click();
          } else if (st.kind === 'next') {
            const prim = page.locator('.play-foot .btn-primary:not([disabled]):not(.choice):not(.kp-key)');
            if (await prim.count()) await prim.first().click();
            else await page.locator('.play-foot .btn:not([disabled]):not(.choice):not(.kp-key)').first().click();
          }
          else await page.waitForTimeout(60);
        }
        } catch (e) {
          problems++;
          console.log('[' + label + '] ' + id + ' úroveň ' + lv + ': ' + e.message.split('\n')[0]);
          if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'fit-' + label + '-' + id + '-lv' + lv + '-ERR.png') });
        }
        if (off) problems++;
        if (!(await page.$('.result'))) { problems++; console.log('[' + label + '] ' + id + ' úroveň ' + lv + ': hra nedoběhla'); await page.goto(base + '?ts=0.1#hry'); }
      }
    }
    if (errors.length) { problems += errors.length; console.log('[' + label + '] chyby: ' + errors.join(' | ')); }
    await ctx.close();
  }
  await browser.close();
  srv.close();
  console.log(problems ? problems + ' problém(ů)' : 'Rozložení v pořádku.');
})().catch((e) => { console.error(e); process.exit(1); });
