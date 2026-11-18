/* Svěží mysl — offline režim. Při změně souborů zvyšte číslo verze. */
const VERSION = 'svezi-mysl-v8';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/fonts.css',
  'css/app.css',
  'fonts/atkinson-next-latin.woff2',
  'fonts/atkinson-next-latin-ext.woff2',
  'fonts/atkinson-mono-latin.woff2',
  'fonts/atkinson-mono-latin-ext.woff2',
  'js/util.js',
  'js/store.js',
  'js/stats.js',
  'js/sound.js',
  'js/icons.js',
  'js/places.js',
  'js/content.js',
  'js/riddles.js',
  'js/kit.js',
  'js/fx.js',
  'js/games/pexeso.js',
  'js/games/nakup.js',
  'js/games/okna.js',
  'js/games/blesk.js',
  'js/games/jiny.js',
  'js/games/sipky.js',
  'js/games/barvy.js',
  'js/games/poradi.js',
  'js/games/prislovi.js',
  'js/games/protiklady.js',
  'js/games/presmycky.js',
  'js/games/nepatri.js',
  'js/games/hodiny.js',
  'js/games/placeni.js',
  'js/games/rada.js',
  'js/games/tvary.js',
  'js/games/telefon.js',
  'js/games/jmena.js',
  'js/games/zmena.js',
  'js/games/mozaika.js',
  'js/games/sber.js',
  'js/games/kolik.js',
  'js/games/retez.js',
  'js/games/vyhodne.js',
  'js/games/hadani.js',
  'js/games/rodina.js',
  'js/games/kulicka.js',
  'js/games/dvojice.js',
  'js/games/byt.js',
  'js/games/osmismerka.js',
  'js/games/sudoku.js',
  'js/games/podnos.js',
  'js/games/sumy.js',
  'js/games/pyramida.js',
  'js/engine.js',
  'js/app.js',
  'js/screens/path.js',
  'js/screens/lesson.js',
  'js/screens/games.js',
  'js/screens/collection.js',
  'js/screens/progress.js',
  'js/screens/settings.js',
  'js/screens/riddle.js',
  'js/main.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Nejdřív z mezipaměti (rychlé a funguje offline), na pozadí se stáhne novější verze.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((cached) => {
        const fresh = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fresh;
      })
    )
  );
});
