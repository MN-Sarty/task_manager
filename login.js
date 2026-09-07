// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vtymsabwxhxalsupfday.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eW1zYWJ3eGh4YWxzdXBmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDUwNzYsImV4cCI6MjEwNDA4MTA3Nn0.caTz-3TIyeeyJXwNmWsCGP0LuFtGsI5mdo9L02sW674';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginForm = document.getElementById('login-form')
const usernameInput = document.getElementById('login-username')
const passwordInput = document.getElementById('login-password')
const submitBtn = document.getElementById('login-submit-btn')

// Handle Login Submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = usernameInput.value.trim()
  const password = passwordInput.value.trim()

  submitBtn.disabled = true
  submitBtn.textContent = "Logging in..."

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (error) {
    alert("Login failed: " + error.message)
    submitBtn.disabled = false
    submitBtn.textContent = "Log In"
  } else {
    alert("Logged in successfully!")
    console.log("Logged in user:", data.user)
    
    // Redirect to main task manager dashboard
    window.location.href = "dashboard.html"
  }
})