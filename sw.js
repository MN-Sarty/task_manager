// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vtymsabwxhxalsupfday.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eW1zYWJ3eGh4YWxzdXBmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDUwNzYsImV4cCI6MjEwNDA4MTA3Nn0.caTz-3TIyeeyJXwNmWsCGP0LuFtGsI5mdo9L02sW674';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Listen for push events from the server
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Task Reminder ♥';
  const options = {
    body: data.body || 'You have a task due tomorrow!',
    icon: '/images/Taskie.png', // Optional: add an icon path if you have one
    badge: '/favicon.ico'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click (brings user back to the app)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});