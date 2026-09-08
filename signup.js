// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vtymsabwxhxalsupfday.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eW1zYWJ3eGh4YWxzdXBmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDUwNzYsImV4cCI6MjEwNDA4MTA3Nn0.caTz-3TIyeeyJXwNmWsCGP0LuFtGsI5mdo9L02sW674';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const openTermsLink = document.getElementById('open-terms-link')
const termsCheckbox = document.getElementById('terms-checkbox')
const signupSubmitBtn = document.getElementById('signup-submit-btn')
const podcastGroup = document.getElementById('podcast-question-group')
const podcastAnswer = document.getElementById('podcast-answer')
const signupForm = document.getElementById('signup-form')

if (openTermsLink) {
  openTermsLink.addEventListener('click', () => {
    localStorage.setItem('terms_opened_at', Date.now().toString())
    termsCheckbox.disabled = false
  })
}

if (localStorage.getItem('terms_opened_at') && termsCheckbox) {
  termsCheckbox.disabled = false
}

let hasWaitedFiveMinutes = false

if (termsCheckbox) {
  termsCheckbox.addEventListener('change', () => {
    if (!termsCheckbox.checked) {
      signupSubmitBtn.disabled = true
      signupSubmitBtn.textContent = "Sign Up"
      if (podcastGroup) podcastGroup.classList.add('hidden')
      return
    }

    const termsOpenedAt = parseInt(localStorage.getItem('terms_opened_at') || Date.now().toString(), 10)
    const timeElapsedMs = Date.now() - termsOpenedAt
    const fiveMinutesInMs = 3 * 60 * 1000

    if (timeElapsedMs < fiveMinutesInMs) {
      hasWaitedFiveMinutes = false
      signupSubmitBtn.disabled = true
      signupSubmitBtn.textContent = "I know you didn’t read that 😐"
      if (podcastGroup) podcastGroup.classList.add('hidden')
    } else {
      hasWaitedFiveMinutes = true
      signupSubmitBtn.disabled = false
      signupSubmitBtn.textContent = "Sign Up"
      if (podcastGroup) podcastGroup.classList.remove('hidden')
    }
  })
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nameInput = document.getElementById('signup-name')
    const emailInput = document.getElementById('signup-email')
    const passwordInput = document.getElementById('signup-password')
    const confirmPasswordInput = document.getElementById('signup-confirm-password')

    // Read values safely
    const name = nameInput ? nameInput.value : ''
    const email = emailInput ? emailInput.value.trim() : ''
    const password = passwordInput ? passwordInput.value : ''

    if (hasWaitedFiveMinutes && podcastAnswer) {
      const answer = podcastAnswer.value.trim().toLowerCase()
      if (answer !== 'rotten mango') {
        alert("Incorrect podcast answer! Go back and read the Terms and Conditions carefully.")
        return
      }
    }

    // Submit to Supabase...

    signupSubmitBtn.disabled = true
    signupSubmitBtn.textContent = "Creating Account..."

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { full_name: name }
      }
    })

    if (error) {
      alert("Sign up error: " + error.message)
      signupSubmitBtn.disabled = false
      signupSubmitBtn.textContent = "Sign Up"
    } else {
      alert("Account created successfully!")
      localStorage.removeItem('terms_opened_at')
      window.location.href = "dash.html"
    }
  })
}