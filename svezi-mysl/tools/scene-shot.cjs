const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 640, height: 400 } });
  await page.setContent('<script>window.SM={};</script>');
  await page.addScriptTag({ content: fs.readFileSync('/home/user/openclaw/svezi-mysl/js/places.js', 'utf8') });
  const svg = await page.evaluate((id) => SM.places.scene(id), process.argv[2]);
  await page.setContent('<body style="margin:0">' + svg.replace('<svg ', '<svg width="640" height="400" ') + '</body>');
  await page.screenshot({ path: process.argv[3] });
  await b.close();
})();
