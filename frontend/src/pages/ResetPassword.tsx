import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertCircle } from 'lucide-react'
import { authService } from '../services/authService'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('Učitavanje...')
  const [loading, setLoading] = useState(false)
  const [canReset, setCanReset] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Vrati sesiju iz URL tokena (kao što je učinjeno za signup potvrdu)
    const restoreAndCheck = async () => {
      try {
        const restored = await authService.restoreSessionFromUrl()
        if (!restored) {
          setMessage('Link je istekao ili je nevažeći. Molimo pokušaj ponovo.')
          setCanReset(false)
          return
        }

        const user = await authService.getCurrentUser()
        if (user) {
          // Proverite da li je token već korišćen
          const alreadyUsed = await authService.checkPasswordResetUsed(user)
          if (alreadyUsed) {
            setMessage('Ovaj link za resetovanje lozinke je već korišćen. Link je važeći samo jednom.')
            setCanReset(false)
          } else {
            setMessage('')
            setCanReset(true)
          }
        } else {
          setMessage('Link je istekao ili je nevažeći. Molimo pokušaj ponovo.')
          setCanReset(false)
        }
      } catch (e) {
        setMessage('Greška pri verifikaciji linka. Molimo pokušaj ponovo.')
        setCanReset(false)
      }
    }
    restoreAndCheck()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Lozinke se ne poklapaju')
      return
    }

    if (password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera')
      return
    }

    // Dodatna provera: lozinka ne sme biti samo brojevi ili samo znakovi
    const hasLetters = /[a-zA-Z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    if (!hasLetters || !hasNumbers) {
      setError('Lozinka mora sadržati i slova i brojeve')
      return
    }

    setLoading(true)

    try {
      await authService.updatePassword(password)
      setMessage('Lozinka je uspešno promenjena! Preusmeravam na prijavu...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      const errorMsg = err.message || 'Greška pri promeni lozinke'
      // Prikaži korisnu poruku ako je ista lozinka
      if (errorMsg.includes('different')) {
        setError('Nova lozinka mora biti drugačita od stare lozinke')
      } else {
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (message) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Resetovanje lozinke</h2>
            <p className="text-gray-400">{message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!canReset) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-2">Nova lozinka</h2>
          <p className="text-gray-400 mb-8">Unesite novu lozinku za tvoj nalog</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nova lozinka
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Potvrdi lozinku
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Promena u toku...' : 'Promeni lozinku'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
