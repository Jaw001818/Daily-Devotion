/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

// Precache all assets compiled by Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// Listen for Push Notifications
self.addEventListener('push', (event) => {
  let title = 'Daily Bible Devotion — Araw-araw na Debosyon';
  let body = 'Bago ang araw, maglaan ng 5 minuto para sa Salita ng Diyos.';
  let url = '/';
  let tag = 'bible-devotion-reminder';

  try {
    if (event.data) {
      const parsed = event.data.json();
      if (parsed.title) title = parsed.title;
      if (parsed.body) body = parsed.body;
      if (parsed.url) url = parsed.url;
      if (parsed.tag) tag = parsed.tag;
    }
  } catch {
    if (event.data) {
      body = event.data.text();
    }
  }

  const options: NotificationOptions = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/icon.svg',
    tag,
    data: { url },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
