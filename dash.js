// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vtymsabwxhxalsupfday.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eW1zYWJ3eGh4YWxzdXBmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDUwNzYsImV4cCI6MjEwNDA4MTA3Nn0.caTz-3TIyeeyJXwNmWsCGP0LuFtGsI5mdo9L02sW674';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Grab DOM Elements
const menuToggle = document.getElementById('user-menu-toggle');
const dropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');
const welcomeTitle = document.getElementById('welcome-title');

const createGroupForm = document.getElementById('create-group-form');
const groupNameInput = document.getElementById('group-name-input');
const groupsContainer = document.getElementById('groups-container');

// 1. Check Authentication & Initialize Dashboard
async function initDashboard() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = 'login.html';
    return;
  }

  populateDropdown(user);
  fetchGroups(user.id);
}

// 2. Dropdown Visibility Toggle
if (menuToggle && dropdown) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
  });
}

// 3. Populate Header & Profile Data
function populateDropdown(user) {
  const nameEl = document.getElementById('dropdown-user-name');
  const emailEl = document.getElementById('dropdown-user-email');

  if (user) {
    const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
    const firstName = fullName.split(' ')[0] || 'User';

    if (welcomeTitle) {
      welcomeTitle.textContent = `Welcome ${firstName}... ♥`;
    }

    if (nameEl) nameEl.textContent = firstName;
    if (emailEl) emailEl.textContent = user.email;
  }
}

// 4. Fetch and Render Task Groups
async function fetchGroups(userId) {
  if (!groupsContainer) return;

  const { data: groups, error } = await supabase
    .from('groups')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching groups:', error.message);
    return;
  }

  // Use for...of instead of forEach for proper async/await handling
  for (const group of groups) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.innerHTML = `
      <div class="group-card-header">
        <h3 class="group-title">${group.name}</h3>
        <button class="delete-group-btn" data-id="${group.id}">&times;</button>
      </div>
      <ul class="task-list" id="tasks-${group.id}"></ul>
      <form class="add-task-form" data-group-id="${group.id}">
        <input type="text" class="add-task-input" placeholder="Add task..." required />
        <button type="submit" class="add-task-btn">+</button>
      </form>
    `;

    groupsContainer.appendChild(card);

    // Load tasks for this specific card
    await loadTasksForGroup(group.id);
  }

  attachGroupEventHandlers();
  renderGroups(groups);
}

// 5. Render Group Cards & Attach Task Handlers
function renderGroups(groups) {
  groupsContainer.innerHTML = '';

  if (!groups || groups.length === 0) {
    groupsContainer.innerHTML = '<p class="empty-state">No task groups yet. Create one above!</p>';
    return;
  }

  groups.forEach(async (group) => {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.innerHTML = `
      <div class="group-card-header">
        <h3 class="group-title">${group.name}</h3>
        <button class="delete-group-btn" data-id="${group.id}">&times;</button>
      </div>
      <ul class="task-list" id="tasks-${group.id}"></ul>
      <form class="add-task-form" data-group-id="${group.id}">
        <input type="text" class="add-task-input" placeholder="Add task..." required />
        <input type="datetime-local" class="add-task-date" title="Select due date and time..." /> 
        <button type="submit" class="add-task-btn">+</button>
      </form>
    `;

    groupsContainer.appendChild(card);
    await loadTasksForGroup(group.id);
  });

  attachGroupEventHandlers();
// Inside attachGroupEventHandlers()...
document.querySelectorAll('.add-task-form').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const groupId = form.getAttribute('data-group-id');
    const input = form.querySelector('.add-task-input');
    const dateInput = form.querySelector('.add-task-date');
    
    const taskText = input.value.trim();
    const dueDate = dateInput.value ? new Date(dateInput.value).toISOString() : null;

    if (!taskText) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from('tasks').insert([{
        group_id: groupId,
        user_id: user.id,
        text: taskText,
        due_date: dueDate // Saves the calendar/clock value to your new database column
      }]);

      if (!error) {
        input.value = '';
        dateInput.value = ''; // Reset date picker
        loadTasksForGroup(groupId);
      } else {
        console.error('Error adding task:', error.message);
      }
    }
  });
});
}

// 6. Fetch Tasks & Clean Up 24-Hour Old Completed Items
async function loadTasksForGroup(groupId) {
  const taskListEl = document.getElementById(`tasks-${groupId}`);
  if (!taskListEl) return;

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error.message);
    return;
  }

  taskListEl.innerHTML = '';
  const now = new Date();

  tasks.forEach(async (task) => {
    // 24-hour auto-deletion logic
    if (task.is_completed && task.completed_at) {
      const completedTime = new Date(task.completed_at);
      const hoursPassed = (now - completedTime) / (1000 * 60 * 60);

      if (hoursPassed >= 24) {
        await supabase.from('tasks').delete().eq('id', task.id);
        return;
      }
    }

    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <input 
        type="checkbox" 
        class="task-checkbox" 
        data-task-id="${task.id}" 
        ${task.is_completed ? 'checked' : ''}
      />
      <span class="task-text ${task.is_completed ? 'completed' : ''}"
      contenteditable="true"
      data-task-id="${task.id}"
      title="Click to edit task"
      >${task.text}</span>
    `;

    // Toggle Checkbox / Completion State
    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', async (e) => {
      const isChecked = e.target.checked;
      const textSpan = li.querySelector('.task-text');

      textSpan.classList.toggle('completed', isChecked);

      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: isChecked,
          completed_at: isChecked ? new Date().toISOString() : null
        })
        .eq('id', task.id);

      if (error) {
        console.error('Task update failed:', error.message)
        //revert visual checkbox state if db update fails
        e.target.checked = !isChecked;
        textSpan.classList.toggle('completed', !isChecked);
      }
    });

    //text editing
    const textSpan = li.querySelector('.task-text');

    //prevent in line breaks inside task names
    textSpan.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        textSpan.getBoundingClientRect(); //triggers blur event to save
      }
    });

    // Save changes to Supabase when user clicks away
  textSpan.addEventListener('blur', async () => {
    const updatedText = textSpan.textContent.trim();

    // If text is empty, revert to original task text
    if (!updatedText) {
      textSpan.textContent = task.text;
      return;
    }

    // Only update DB if the text actually changed
    if (updatedText !== task.text) {
      const { error } = await supabase
        .from('tasks')
        .update({ text: updatedText })
        .eq('id', task.id);

      if (error) {
        console.error('Error updating task text:', error.message);
        textSpan.textContent = task.text; // Revert on failure
      } else {
        task.text = updatedText; // Update local state
      }
    }
  });

    taskListEl.appendChild(li);
  });
}

// 7. Event Handlers for Creating Tasks & Deleting Groups
function attachGroupEventHandlers() {
  // Add Task inside Group Card
  document.querySelectorAll('.add-task-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const groupId = form.getAttribute('data-group-id');
      const input = form.querySelector('.add-task-input');
      const taskText = input.value.trim();

      if (!taskText) return;

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from('tasks').insert([{
          group_id: groupId,
          user_id: user.id,
          text: taskText
        }]);

        if (!error) {
          input.value = '';
          loadTasksForGroup(groupId);
        } else {
          console.error('Error adding task:', error.message);
        }
      }
    });
  });

  // Delete Group Card
  document.querySelectorAll('.delete-group-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const groupId = e.target.getAttribute('data-id');
      await deleteGroup(groupId);
    });
  });
}

// 8. Create Group Handler
if (createGroupForm) {
  createGroupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const groupName = groupNameInput.value.trim();
    if (!groupName) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('groups')
        .insert([{ name: groupName, user_id: user.id }]);

      if (error) {
        console.error('Error creating group:', error.message);
      } else {
        groupNameInput.value = '';
        fetchGroups(user.id);
      }
    }
  });
}

// 9. Delete Group Handler
async function deleteGroup(groupId) {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (!error && user) {
    fetchGroups(user.id);
  }
}

// 10. Logout Handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = 'login.html';
    } else {
      console.error('Logout error:', error.message);
    }
  });
}

//Push notifications
const VAPID_PUBLIC_KEY = 'BJzuxQv3ClX1FXUTo1SSNG1hL6bCKgov3YiqE0x7r0gECJVYjNxLOXIVd3s0ncLoQd_5nJyvx233_inpm2hcxAY'; // Replace with your public key

async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported by this browser.');
    return;
  }

  try {
    // 1. Register the Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully.');

    // 2. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission denied.');
      return;
    }

    // 3. Subscribe the user to Push Notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // 4. Save the subscription object to Supabase (so your server knows where to send alerts)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        subscription_json: subscription
      });
      alert('Notifications enabled successfully! ♥');
    }
  } catch (error) {
    console.error('Error setting up push notifications:', error);
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// (Optional) Call registerPushNotifications() when a user clicks an "Enable Notifications" button in your UI

const notificationToggle = document.getElementById('notification-toggle');

// 1. Sync toggle state on page load
if (notificationToggle) {
  if (Notification.permission === 'granted') {
    notificationToggle.checked = true;
  }

  // 2. Listen for flips on the toggle
  notificationToggle.addEventListener('change', async (e) => {
    if (e.target.checked) {
      // User turned it ON
      await registerPushNotifications();
      if (Notification.permission !== 'granted') {
        // If they denied the browser prompt, flip the toggle back off
        e.target.checked = false;
      }
    } else {
      // User turned it OFF (Optional: remove subscription from Supabase)
      await disablePushNotifications();
    }
  });
}

// Optional helper to clean up subscription if toggled off
async function disablePushNotifications() {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
    }
    console.log('Notifications disabled.');
  } catch (error) {
    console.error('Error disabling notifications:', error);
  }
}
// Launch application on page load
initDashboard();

//Public npm key BJzuxQv3ClX1FXUTo1SSNG1hL6bCKgov3YiqE0x7r0gECJVYjNxLOXIVd3s0ncLoQd_5nJyvx233_inpm2hcxAY
//Private npm key WThiJX1Jxq4bmxVvvcUlVarFH6npjdWxQLByFihDsNc