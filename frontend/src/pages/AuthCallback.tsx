import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function AuthCallback() {
  const [message, setMessage] = useState('Verifikujem...')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    async function handle() {
      try {
        // Detect confirmation flow from both search and hash (Supabase may place tokens in hash)
        const searchParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
        const isConfirmationFlow = searchParams.get('type') === 'signup' || searchParams.has('access_token') || hashParams.has('access_token')

        // Try to restore session from URL tokens if present; this allows getUser to return the confirmed user
        await authService.restoreSessionFromUrl().catch(() => {})

        const user = await authService.getCurrentUser().catch(() => null)

        if (!mounted) return

        if (user) {
          // Try to mark the email as confirmed; returns true if we just set it
          const newlyConfirmed = await authService.markEmailConfirmedIfMissing(user).catch(() => false)

          if (isConfirmationFlow) {
            if (newlyConfirmed) {
              setMessage('Uspešna potvrda! Ulogovan si, preusmeravam...')
              setTimeout(() => navigate('/dashboard'), 1400)
            } else {
              setMessage('Link je već iskorišćen ili je sesija istekla. Ako nisi ulogovan, prijavi se.')
            }
          } else {
            // Normal login flow
            await authService.createProfileIfMissing(user)
            setMessage('Uspešna prijava, preusmeravam...')
            setTimeout(() => navigate('/dashboard'), 1400)
          }
        } else if (isConfirmationFlow) {
          // No session and no user but looks like a confirmation link — likely expired/used
          setMessage('Link je već iskorišćen ili je sesija istekla. Ako nisi ulogovan, prijavi se.')
        } else {
          setMessage('Uspešna potvrda mejla. Molimo prijavi se.')
        }
      } catch (err) {
        setMessage('Došlo je do greške pri verifikacijom. Molimo pokušaj ponovo.')
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
