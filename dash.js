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

// 1. Check Authentication & Load User Data
async function initDashboard() {
  const { data: { user }, error } = await supabase.auth.getUser();

  // If not logged in or error, redirect to login page
  if (error || !user) {
    window.location.href = 'login.html';
    return;
  }

  // Populate dropdown menu with user info and load groups
  populateDropdown(user);
  fetchGroups(user.id);
}

// 2. Toggle Dropdown Menu Visibility
if (menuToggle && dropdown) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from immediately closing it
    dropdown.classList.toggle('hidden');
  });

  // Close dropdown if user clicks anywhere else on the page
  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
  });
}

// 3. Populate Dropdown & Header with Logged-in User Data
function populateDropdown(user) {
  const nameEl = document.getElementById('dropdown-user-name');
  const emailEl = document.getElementById('dropdown-user-email');

  if (user) {
    // Define fullName first from user metadata or fallback to email
    const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
    const firstName = fullName.split(' ')[0] || 'User';

    // Update greeting heading
    if (welcomeTitle) {
      welcomeTitle.textContent = `Welcome ${firstName}... ♥`;
    }

    if (nameEl) nameEl.textContent = firstName;
    if (emailEl) emailEl.textContent = user.email;
  }
}

// 4. Fetch and Display Groups
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

  renderGroups(groups);
}

// 5. Render Cards in DOM
function renderGroups(groups) {
  groupsContainer.innerHTML = '';

  if (!groups || groups.length === 0) {
    groupsContainer.innerHTML = '<p class="empty-state">No task groups yet. Create one above!</p>';
    return;
  }

  groups.forEach((group) => {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.innerHTML = `
      <div class="group-card-header">
        <h3 class="group-title">${group.name}</h3>
        <button class="delete-group-btn" data-id="${group.id}">&times;</button>
      </div>
    `;
    groupsContainer.appendChild(card);
  });

  // Attach delete handlers
  document.querySelectorAll('.delete-group-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const groupId = e.target.getAttribute('data-id');
      await deleteGroup(groupId);
    });
  });
}

// 6. Create New Group Form Event
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
        fetchGroups(user.id); // Refresh list
      }
    }
  });
}

// 7. Delete Group Handler
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

// 8. Supabase Log Out Handler
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

// Run auth check on page load at the end
initDashboard();