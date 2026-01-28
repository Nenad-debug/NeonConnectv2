import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, AlertCircle } from 'lucide-react'
import { authService } from '../services/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.resetPassword(email)
      // Prikaži stranicu koja kaže da proverite mejl (ista kao za signup potvrdu)
      navigate(`/check-email?email=${encodeURIComponent(email)}&type=reset`)
    } catch (err: any) {
      setError(err.message || 'Greška pri resetovanju lozinke')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-2">Resetuj lozinku</h2>
          <p className="text-gray-400 mb-8">Unesite e-mail da biste resetovali lozinku</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tvoj@email.com"
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
              {loading ? 'Slanje u toku...' : 'Pošalji link za resetovanje'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Sećaš se lozinke?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Prijavi se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
