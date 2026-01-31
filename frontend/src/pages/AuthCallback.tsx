import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { authService } from '../services/authService'
import { supabase } from '../services/supabaseClient'

export default function AuthCallback() {
  const [message, setMessage] = useState('Verifikujem...')
  const navigate = useNavigate()

  // Helper to get user's role
  const getUserRole = async (userId: string): Promise<'candidate' | 'employer'> => {
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      return (data?.role as 'candidate' | 'employer') || 'candidate'
    } catch {
      return 'candidate'
    }
  }

  useEffect(() => {
    let mounted = true

    async function handle() {
      try {
        // Detect confirmation flow from both search and hash (Supabase may place tokens in hash)
        const searchParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
        const isConfirmationFlow = searchParams.get('type') === 'signup' || searchParams.has('access_token') || hashParams.has('access_token')

        // eslint-disable-next-line no-console
        console.log('AuthCallback - URL:', window.location.href)
        // eslint-disable-next-line no-console
        console.log('AuthCallback - isConfirmationFlow:', isConfirmationFlow, 'searchParams:', Array.from(searchParams.entries()), 'hashParams:', Array.from(hashParams.entries()))

        // Try to restore session from URL tokens if present; this allows getUser to return the confirmed user
        const restored = await authService.restoreSessionFromUrl().catch((e) => {
          // eslint-disable-next-line no-console
          console.warn('Failed to restore session from URL:', e)
          return false
        })
        // eslint-disable-next-line no-console
        console.log('AuthCallback - session restored:', restored)

        const user = await authService.getCurrentUser().catch((e) => {
          // eslint-disable-next-line no-console
          console.warn('Failed to get current user:', e)
          return null
        })
        // eslint-disable-next-line no-console
        console.log('AuthCallback - current user:', user?.email || 'none')

        if (!mounted) return

        if (user) {
          // Get user's role to determine redirect
          const role = await getUserRole(user.id)
          const redirectPath = role === 'employer' ? '/employer-dashboard' : '/dashboard'

          // Try to mark the email as confirmed; returns true if we just set it
          const newlyConfirmed = await authService.markEmailConfirmedIfMissing(user).catch(() => false)

          if (isConfirmationFlow) {
            if (newlyConfirmed) {
              setMessage('Uspešna potvrda! Ulogovan si, preusmeravam...')
              setTimeout(() => navigate(redirectPath), 1400)
            } else {
              // Email already confirmed previously
              setMessage('Nalog je već verifikovan! 🎉 Nema potrebe da se ponovo potvrdi. Preusmeravam...')
              setTimeout(() => navigate(redirectPath), 2000)
            }
          } else {
            // Normal login flow
            await authService.createProfileIfMissing(user)
            setMessage('Uspešna prijava, preusmeravam...')
            setTimeout(() => navigate(redirectPath), 1400)
          }
        } else if (isConfirmationFlow) {
          // No session and no user but looks like a confirmation link — likely expired/used
          setMessage('Link je već iskorišćen ili je sesija istekla. Ako nisi ulogovan, prijavi se.')
        } else {
          setMessage('Uspešna potvrda mejla. Molimo prijavi se.')
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('AuthCallback error:', err)
        setMessage('Došlo je do greške pri verifikacijom. Molimo pokušaj ponovo.')
      }
    }

    handle()

    return () => { mounted = false }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center space-y-4">
          {/* Icon based on message */}
          {message.includes('greške') ? (
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          ) : message.includes('Verifikujem') ? (
            <Loader className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
          ) : (
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          )}
          
          <h2 className="text-2xl font-bold text-white">Potvrda mejla</h2>
          <p className="text-gray-300 leading-relaxed">{message}</p>
          
          {/* Status indicator */}
          {message.includes('već verifikovan') && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-300 text-sm">
              ✓ Nalog je potpuno aktivan i spreman za upotrebu
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
