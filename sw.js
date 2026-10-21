//sw.js - Service worker for Taskie push notifications

// sw.js - Service Worker for Taskie Push Notifications

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Task Reminder ♥';
  const options = {
    body: data.body || 'You have a task due tomorrow!',
    icon: '/images/Taskie.png',
    badge: '/images/Taskie.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});