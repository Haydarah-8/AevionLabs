const CACHE = "aevion-error-v1";
const OFFLINE = "/offline";
const TIMEOUT = "/timeout";
const WAIT_MS = 12000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([OFFLINE, TIMEOUT])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), WAIT_MS);
      try {
        const response = await fetch(event.request, { signal: controller.signal });
        clearTimeout(timer);
        return response;
      } catch {
        clearTimeout(timer);
        const path = controller.signal.aborted ? TIMEOUT : OFFLINE;
        const cached = await caches.match(path);
        if (cached) return cached;
        return fetch(path);
      }
    })(),
  );
});
