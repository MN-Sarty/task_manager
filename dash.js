// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vtymsabwxhxalsupfday.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eW1zYWJ3eGh4YWxzdXBmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDUwNzYsImV4cCI6MjEwNDA4MTA3Nn0.caTz-3TIyeeyJXwNmWsCGP0LuFtGsI5mdo9L02sW674';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Grab DOM Elements
const menuToggle = document.getElementById('user-menu-toggle')
const dropdown = document.getElementById('user-dropdown')
const logoutBtn = document.getElementById('logout-btn')

// 1. Toggle Dropdown Menu Visibility
if (menuToggle && dropdown) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation() // Prevent click from immediately closing it
    dropdown.classList.toggle('hidden')
  })

  // Close dropdown if user clicks anywhere else on the page
  document.addEventListener('click', () => {
    dropdown.classList.add('hidden')
  })
}

// 2. Populate Dropdown with Logged-in User Data
async function populateDropdown(user) {
  const nameEl = document.getElementById('dropdown-user-name')
  const emailEl = document.getElementById('dropdown-user-email')

  if (user) {
    if (nameEl) {
        //Grab first name
        const firstName = fullName.split('')[0] || 'User'
        nameEl.textContent = firstName
    }
    if (emailEl) emailEl.textContent = user.email
  }
}

// 3. Supabase Log Out Handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      window.location.href = 'login.html'
    } else {
      console.error('Logout error:', error.message)
    }
  })
}