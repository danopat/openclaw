// Úvodní obrazovka hry na dané úrovni (první úloha): node quick-shots.cjs ROOT OUT "zařízení" měřítko id:úroveň:čekáNa,...
const { chromium, devices } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const ROOT = process.argv[2], OUT = process.argv[3], DEV = process.argv[4], SCALE = +process.argv[5], JOBS = process.argv[6].split(',');
const srv = http.createServer((req, res) => { let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch();
  const ctx = await b.newContext(Object.assign({}, devices[DEV], { deviceScaleFactor: 1, locale: 'cs-CZ' }));
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(base + '?ts=1');
  await page.waitForSelector('.onboarding');
  await page.getByRole('button', { name: 'Pokračovat' }).click();
  await page.getByRole('button', { name: 'Vydat se na cestu' }).click();
  await page.waitForSelector('.nodes');
  await page.evaluate((s) => { SM.store.settings().scale = s; SM.store.save(); SM.ui.applySettings(); Object.keys(SM.games).forEach((id) => SM.engine.unlockEarly(id)); }, SCALE);
  for (const job of JOBS) {
    const [id, lv, sel] = job.split(':');
    await page.goto(base + '?ts=1#hry'); await page.waitForSelector('.game-row');
    await page.evaluate((a) => { SM.store.game(a[0]).level = +a[1]; SM.store.save(); }, [id, lv]);
    await page.goto(base + '?ts=1#hra-' + id);
    await page.getByRole('button', { name: 'Začít hru' }).click();
    await page.waitForSelector(sel || '.play-stage > *'); await page.waitForTimeout(400);
    await page.screenshot({ path: OUT + '-' + id + lv + '.png' });
  }
  console.log(DEV, SCALE, errs.length ? errs.join(' | ') : 'bez chyb');
  await b.close(); srv.close();
})();
