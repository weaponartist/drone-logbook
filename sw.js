// Network-first with cache fallback so the logbook opens offline in the field.
const CACHE = 'dlb-v3';
const SHELL = ['./', 'index.html', 'app.js', 'rules.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-512.png', 'vendor/dji_log_parser_js.mjs'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.url.includes('tile.openstreetmap')) return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return r;
  }).catch(() => caches.match(e.request)));
});
