const CACHE_VERSION = "park-shine-v1";
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const APP_SHELL_URLS = [
  "/crew",
  "/crew/home",
  "/crew/login",
  "/icons/icon.svg",
  "/icons/maskable-icon.svg",
];

self.addEventListener("push", (event) => {
  console.log("[SW] push received, data:", event.data?.text());
  if (!event.data) {
    console.log("[SW] no data, skipping");
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Park & Shine", body: event.data.text() };
  }

  console.log("[SW] showing notification:", payload);
  const title = payload.title ?? "Park & Shine";
  const options = {
    body: payload.body ?? "",
    icon: "/icons/icon.svg",
    badge: "/icons/icon.svg",
    tag: payload.tag ?? "park-shine",
    data: { url: payload.url ?? "/" },
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log("[SW] notification shown"))
      .catch((err) => console.error("[SW] showNotification error:", err))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(url) && "focus" in c);
        if (existing) return existing.focus();
        return self.clients.openWindow(url);
      })
  );
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // Only intercept crew pages — customer pages bypass the service worker
  if (!url.pathname.startsWith("/crew")) {
    return;
  }

  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/v1")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok && response.status < 300) {
      try { cache.put(request, response.clone()); } catch { /* streaming responses not cacheable */ }
    }
    return response;
  } catch {
    const cachedResponse = await cache.match(request);
    const fallback = cachedResponse ?? await caches.match("/");
    return fallback ?? Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request).then((response) => {
    if (response.ok) {
      try { cache.put(request, response.clone()); } catch { /* ignore */ }
    }
    return response;
  }).catch(() => null);

  return cachedResponse ?? await networkPromise ?? Response.error();
}
