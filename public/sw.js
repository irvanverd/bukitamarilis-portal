/* Minimal PWA service worker. Network-only: does not cache live or personal portal data. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Keep requests network-only so dashboard and finance data are never served stale.
  if (event.request.method === "GET") {
    event.respondWith(fetch(event.request));
  }
});
