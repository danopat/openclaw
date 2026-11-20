const { chromium, devices } = require('playwright');
const fs = require('fs');
const body = fs.readFileSync(process.argv[2], 'utf8');
const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + body + '</body></html>';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.route('https://artifact.test/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: html }));
  await page.goto('https://artifact.test/page');
  await page.waitForSelector('.onboarding');
  await page.getByRole('button', { name: 'Pokračovat' }).click();
  await page.getByRole('button', { name: 'Vydat se na cestu' }).click();
  await page.waitForSelector('.nodes');
  await page.click('.node.is-current');
  await page.getByRole('button', { name: /Začít lekci/ }).click();
  await page.getByRole('button', { name: 'Začít hru' }).click();
  await page.waitForSelector('.play-stage > *');
  for (const r of ['hry', 'sbirka', 'pokrok', 'nastaveni']) { await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(200); }
  const sw = await page.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.getRegistrations ? navigator.serviceWorker.getRegistrations().then(r => r.length) : -1);
  console.log('errors:', errs.length ? errs : 'none', '| sw registrations:', sw, '| games:', await page.evaluate(() => Object.keys(SM.games).length));
  await b.close();
})();
