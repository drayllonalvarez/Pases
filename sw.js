/* Service worker de "Pases de salida"
   Estrategia: cache-first para los archivos de la app.
   Sube el número de CACHE cada vez que edites index.html para forzar la actualización. */

const CACHE = "pases-v1";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) {
        // refresca en segundo plano
        fetch(e.request)
          .then((res) => {
            if (res && res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          })
          .catch(() => {});
        return hit;
      }
      return fetch(e.request)
        .then((res) => {
          if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copia));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
