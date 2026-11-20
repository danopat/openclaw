// Zátěžová kontrola generátorů úloh: kolikrát generátor selže a jak dlouho trvá.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const root = process.argv[2], ids = process.argv[3].split(','), reps = +(process.argv[4] || 200);
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.join(root, 'index.html') + '#hry');
  await p.waitForTimeout(600);
  const res = await p.evaluate((a) => {
    const out = [];
    a.ids.forEach((id) => {
      const g = SM.games[id];
      for (let lv = 1; lv <= g.maxLevel; lv++) {
        let fail = 0, worst = 0;
        const t0 = performance.now();
        for (let i = 0; i < a.reps; i++) { const s = performance.now(); if (!g.gen(lv)) fail++; worst = Math.max(worst, performance.now() - s); }
        out.push(id + ' úroveň ' + lv + ': selhání ' + fail + '/' + a.reps + ', průměr ' + ((performance.now() - t0) / a.reps).toFixed(1) + ' ms, nejhorší ' + worst.toFixed(0) + ' ms');
      }
    });
    return out;
  }, { ids, reps });
  console.log(res.join('\n'));
  if (errs.length) console.log('chyby:', errs.join(' | '));
  await b.close();
})();
