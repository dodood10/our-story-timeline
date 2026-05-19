// Memory Lane service worker — static assets only; never serve stale HTML.
const CACHE_VERSION = "ml-v2";
const STATIC_CACHE = `memory-lane-static-${CACHE_VERSION}`;
const PRECACHE = ["/manifest.webmanifest", "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) => c.addAll(PRECACHE))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

function isDocumentRequest(request) {
  return request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
}

function isHashedAsset(pathname) {
  return pathname.startsWith("/assets/") && /\.[a-f0-9]{8,}\./i.test(pathname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Always hit the network for HTML — avoids showing an outdated landing after deploy.
  if (isDocumentRequest(req)) {
    event.respondWith(fetch(req).catch(() => caches.match("/manifest.webmanifest")));
    return;
  }

  // Cache-first only for fingerprinted build assets (safe across deploys).
  if (isHashedAsset(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok && (res.type === "basic" || res.type === "cors")) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Everything else: network-first, no HTML shell fallback.
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
