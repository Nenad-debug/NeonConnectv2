import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { authService } from '../services/authService'

export default function AuthCallback() {
  const [message, setMessage] = useState('Verifikujem...')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    async function handle() {
      try {
        // Try to have supabase process any session info in the URL
        // This may or may not create a session depending on confirmation flow
        // Some Supabase builds auto-store session from URL token
        try { await supabase.auth.getSessionFromUrl({ storeSession: true }) } catch (e) { /* ignore */ }

        const user = await authService.getCurrentUser().catch(() => null)

        if (!mounted) return

        if (user) {
          setMessage('Uspešna potvrda! Ulogovan si, preusmeravam...')
          // ensure profile exists
          await authService.createProfileIfMissing(user)
          setTimeout(() => navigate('/dashboard'), 1400)
        } else {
          setMessage('Uspešna potvrda mejla. Molimo prijavi se.')
        }
      } catch (err) {
        setMessage('Došlo je do greške pri verifikaciji. Molimo pokušaj ponovo.')
      }
    }

    handle()

    return () => { mounted = false }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Potvrda mejla</h2>
          <p className="text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  )
}
