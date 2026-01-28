import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import { supabase } from './services/supabaseClient'
import { authService } from './services/authService'

// Listen for sign-in events and ensure user profile exists (handles email-confirm flow)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    authService.createProfileIfMissing(session.user).catch(() => {})
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
