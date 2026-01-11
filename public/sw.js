// Service Worker for Push Notifications and PWA
const CACHE_NAME = 'makefriends-v1';
const OFFLINE_URL = '/offline.html';

// Install event - cache offline page
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        '/pwa-192x192.png',
        '/pwa-64x64.png',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let data = {
    title: 'MakeFriends',
    body: 'You have a new notification',
    icon: '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    data: { url: '/portal/dashboard' },
    tag: 'default',
    actions: []
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
      console.log('Parsed push data:', data);
    } catch (e) {
      console.error('Error parsing push data:', e);
      // Try as text
      try {
        data.body = event.data.text();
      } catch (e2) {
        console.error('Error getting push text:', e2);
      }
    }
  }
  
  // Determine notification actions based on tag/type
  let actions = data.actions || [];
  
  if (data.tag === 'new-match' || data.tag === 'mutual-match') {
    actions = [
      { action: 'view', title: 'View Match', icon: '/pwa-64x64.png' },
      { action: 'dismiss', title: 'Dismiss' }
    ];
    if (!data.data?.url) {
      data.data = { ...data.data, url: '/portal/slow-dating' };
    }
  } else if (data.tag === 'event-reminder') {
    actions = [
      { action: 'view', title: 'View Event', icon: '/pwa-64x64.png' },
      { action: 'directions', title: 'Get Directions' }
    ];
  } else if (data.tag === 'meeting-reminder') {
    actions = [
      { action: 'view', title: 'View Details', icon: '/pwa-64x64.png' },
      { action: 'confirm', title: 'Confirm' }
    ];
  } else if (data.tag === 'connection-request') {
    actions = [
      { action: 'accept', title: 'Accept', icon: '/pwa-64x64.png' },
      { action: 'view', title: 'View Profile' }
    ];
    if (!data.data?.url) {
      data.data = { ...data.data, url: '/portal/connections' };
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-64x64.png',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/portal/dashboard' },
    actions: actions,
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.tag === 'mutual-match' || data.tag === 'meeting-reminder',
    timestamp: data.timestamp || Date.now(),
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action, event.notification.tag);
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  let urlToOpen = notificationData.url || '/portal/dashboard';
  
  // Handle different actions
  if (event.action === 'view') {
    urlToOpen = notificationData.url || '/portal/dashboard';
  } else if (event.action === 'dismiss') {
    return; // Just close the notification
  } else if (event.action === 'directions') {
    // Open Google Maps with the venue address if available
    if (notificationData.venueAddress) {
      urlToOpen = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(notificationData.venueAddress)}`;
      event.waitUntil(clients.openWindow(urlToOpen));
      return;
    }
    urlToOpen = notificationData.url || '/portal/events';
  } else if (event.action === 'confirm') {
    urlToOpen = notificationData.confirmUrl || notificationData.url || '/portal/slow-dating';
  } else if (event.action === 'accept') {
    urlToOpen = notificationData.acceptUrl || notificationData.url || '/portal/connections';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to find an existing window to navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open a new window if no existing window found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event (for analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  // Could send analytics here
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'sync-rsvp') {
    event.waitUntil(syncRSVPs());
  } else if (event.tag === 'sync-match-response') {
    event.waitUntil(syncMatchResponses());
  }
});

// Sync pending RSVPs
async function syncRSVPs() {
  // Implementation for syncing offline RSVPs
  console.log('Syncing pending RSVPs...');
}

// Sync pending match responses
async function syncMatchResponses() {
  // Implementation for syncing offline match responses
  console.log('Syncing pending match responses...');
}

// Message event - for communication with the main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
