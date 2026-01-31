import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import { supabase } from './services/supabaseClient'

// Note: Do NOT call createProfileIfMissing() here to avoid race conditions
// It is already called in authService.login() and authService.signup()
// Only listen for sign-in events to mark email as confirmed if needed
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    // Profile creation is already handled in authService.login/signup
    console.log('✅ [MAIN] User signed in:', session.user.id)
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>    <App />
  </React.StrictMode>,
)