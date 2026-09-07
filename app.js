// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vtymsabwxhxalsupfday.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eW1zYWJ3eGh4YWxzdXBmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDUwNzYsImV4cCI6MjEwNDA4MTA3Nn0.caTz-3TIyeeyJXwNmWsCGP0LuFtGsI5mdo9L02sW674';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const openTermsLink = document.getElementById('open-terms-link')
const termsCheckbox = document.getElementById('terms-checkbox')
const signupSubmitBtn = document.getElementById('signup-submit-btn')
const podcastGroup = document.getElementById('podcast-question-group')
const podcastAnswer = document.getElementById('podcast-answer')
const signupForm = document.getElementById('signup-form')

// 1. UNLOCK CHECKBOX WHEN TERMS LINK IS CLICKED
openTermsLink.addEventListener('click', () => {
  localStorage.setItem('terms_opened_at', Date.now().toString())
  termsCheckbox.disabled = false
})

// 2. ALSO UNLOCK ON PAGE LOAD IF PREVIOUSLY OPENED
if (localStorage.getItem('terms_opened_at')) {
  termsCheckbox.disabled = false
}

// 3. ALLOW CLICKING THE LABEL/BOX EVEN IF DISABLED TO PROMPT USER
termsCheckbox.parentElement.addEventListener('click', (e) => {
  if (termsCheckbox.disabled) {
    alert("Please click and read the Terms and Conditions first!")
  }
})

let hasWaitedFiveMinutes = false

// 4. TIMER AND TRAP LOGIC ON CHECKBOX CHANGE
termsCheckbox.addEventListener('change', () => {
  if (!termsCheckbox.checked) {
    signupSubmitBtn.disabled = true
    signupSubmitBtn.textContent = "Sign Up"
    podcastGroup.classList.add('hidden')
    return
  }

  const termsOpenedAt = parseInt(localStorage.getItem('terms_opened_at') || Date.now().toString(), 10)
  const timeElapsedMs = Date.now() - termsOpenedAt
  const fiveMinutesInMs = 5 * 60 * 1000 // 5 minutes

  if (timeElapsedMs < fiveMinutesInMs) {
    // CLICKED TOO FAST
    hasWaitedFiveMinutes = false
    signupSubmitBtn.disabled = true
    signupSubmitBtn.textContent = "I know you didn’t read that 😐"
    podcastGroup.classList.add('hidden')
  } else {
    // WAITED 5 MINUTES
    hasWaitedFiveMinutes = true
    signupSubmitBtn.disabled = false
    signupSubmitBtn.textContent = "Sign Up"
    podcastGroup.classList.remove('hidden')
  }
})

// 5. SUBMIT FORM
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const name = document.getElementById('signup-name').value
  const username = document.getElementById('signup-username').value
  const password = document.getElementById('signup-password').value
  const confirmPassword = document.getElementById('signup-confirm-password').value

  if (password !== confirmPassword) {
    alert("Passwords do not match!")
    return
  }

  if (hasWaitedFiveMinutes) {
    const answer = podcastAnswer.value.trim().toLowerCase()
    if (answer !== 'rotten mango') {
      alert("Incorrect podcast answer! Go back and read the Terms and Conditions carefully.")
      return
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email: username,
    password: password,
    options: {
      data: { full_name: name }
    }
  })

  if (error) {
    alert("Sign up error: " + error.message)
  } else {
    alert("Account created successfully!")
    localStorage.removeItem('terms_opened_at')
    window.location.href = "login.html"
  }
})