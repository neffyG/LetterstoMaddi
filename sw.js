/* ============================================================
   sw.js — the service worker.
   Its only job is to sit quietly and wake up when a ping arrives.
   Must live at the ROOT of the repo (next to index.html) so it
   can control the whole site.
   ============================================================ */

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}

  const title = data.title || "A whisper from the grove 🌿";
  const body  = data.body  || "He's thinking about you.";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: "notification-icon.png",
      badge: "notification-icon.png",
      tag: "grove-ping",
      renotify: true,
      vibrate: [40, 60, 40],
      data: { url: data.url || "/" }
    })
  );
});

/* tapping it opens the site rather than a blank tab */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
