// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vtymsabwxhxalsupfday.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eW1zYWJ3eGh4YWxzdXBmZGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDUwNzYsImV4cCI6MjEwNDA4MTA3Nn0.caTz-3TIyeeyJXwNmWsCGP0LuFtGsI5mdo9L02sW674';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const termsCheckbox = document.getElementById('terms-checkbox')
const signupSubmitBtn = document.getElementById('signup-submit-btn')
const podcastGroup = document.getElementById('podcast-question-group')
const podcastAnswer = document.getElementById('podcast-answer')
const signupForm = document.getElementById('signup-form')

// 1. Checkbox Event Listener (No Timer Required)
if (termsCheckbox) {
  termsCheckbox.disabled = false

  termsCheckbox.addEventListener('change', () => {
    if (!termsCheckbox.checked) {
      signupSubmitBtn.disabled = true
      signupSubmitBtn.textContent = "Sign Up"
      if (podcastGroup) podcastGroup.classList.add('hidden')
    } else {
      // Reveal podcast question and enable button immediately
      signupSubmitBtn.disabled = false
      signupSubmitBtn.textContent = "I know you didn’t read that 😐"
      if (podcastGroup) podcastGroup.classList.remove('hidden')
    }
  })
}

// 2. Form Submission with Podcast Verification
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nameInput = document.getElementById('signup-name')
    const emailInput = document.getElementById('signup-email')
    const passwordInput = document.getElementById('signup-password')

    const name = nameInput ? nameInput.value.trim() : ''
    const email = emailInput ? emailInput.value.trim() : ''
    const password = passwordInput ? passwordInput.value : ''

    // Validate Podcast Answer
    if (podcastAnswer) {
      const answer = podcastAnswer.value.trim().toLowerCase()
      if (answer !== 'rotten mango') {
        alert("Incorrect podcast answer! Go back and read the Terms and Conditions carefully.")
        return
      }
    }

    // Submit to Supabase
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
      signupSubmitBtn.textContent = "I know you didn’t read that 😐"
    } else {
      alert("Account created successfully!")
      window.location.href = "dash.html"
    }
  })
}