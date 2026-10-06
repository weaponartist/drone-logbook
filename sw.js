// Network-first with cache fallback so the logbook opens offline in the field.
const CACHE = 'dlb-v7';
const SHELL = ['./', 'index.html', 'app.js', 'rules.js', 'auths.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-512.png', 'vendor/dji_log_parser_js.mjs', 'geo/airports.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.url.includes('tile.openstreetmap') || e.request.url.includes('arcgis.com')) return;
  // no-cache: always revalidate with the server so updates show up on the next open.
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return r;
  }).catch(() => caches.match(e.request)));
});
