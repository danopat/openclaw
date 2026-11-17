/* Svěží mysl — offline režim. Při změně souborů zvyšte číslo verze. */
const VERSION = 'svezi-mysl-v1';
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
  'js/sound.js',
  'js/icons.js',
  'js/games/pexeso.js',
  'js/games/nakup.js',
  'js/games/okna.js',
  'js/games/blesk.js',
  'js/games/jiny.js',
  'js/games/sipky.js',
  'js/games/barvy.js',
  'js/games/poradi.js',
  'js/app.js',
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
