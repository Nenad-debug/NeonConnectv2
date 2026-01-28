import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Briefcase, AlertCircle } from 'lucide-react'
import { authService } from '../services/authService'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
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

    setLoading(true)

    try {
      await authService.signup(email, password, role)
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Greška pri registraciji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-2">Registracija</h2>
          <p className="text-gray-400 mb-8">Kreiraj svoj nalog</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Registruj se kao:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-3 rounded-lg border-2 transition ${
                    role === 'candidate'
                      ? 'border-blue-600 bg-blue-600/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Kandidat</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`p-3 rounded-lg border-2 transition ${
                    role === 'employer'
                      ? 'border-blue-600 bg-blue-600/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Poslodavac</div>
                </button>
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lozinka
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
              {loading ? 'Registracija u toku...' : 'Registruj se'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Već imaš nalog?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Prijavi se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
