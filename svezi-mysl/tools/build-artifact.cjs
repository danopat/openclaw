// Sestaví jednosouborovou verzi aplikace pro náhled jako Artifact (bez doctype/head/body).
const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2];
const OUT = process.argv[3];
const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...index.matchAll(/<script src="([^"]+)" defer><\/script>/g)].map((m) => m[1]).filter((s) => s !== 'js/main.js');
const css = fs.readFileSync(path.join(ROOT, 'css/app.css'), 'utf8');
const js = scripts.map((s) => '/* ' + s + ' */\n' + fs.readFileSync(path.join(ROOT, s), 'utf8')).join('\n');
const html = `<title>Svěží mysl</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@500..700&family=Atkinson+Hyperlegible+Next:wght@400..800&display=swap">
<style>
${css}
</style>
<div id="app" class="app"></div>
<div id="sr-live" class="sr-only" aria-live="polite"></div>
<script>
window.SM = { embedded: true };
${js.replace(/<\/script/gi, '<\\/script')}
(function () {
  var start = function () { window.SM.boot(); };
  var hot = window.claude && window.claude.hot;
  if (hot && typeof hot.ready === 'function') hot.ready(start); else start();
})();
</script>
`;
fs.writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + ' KB', 'scripts:', scripts.length);
