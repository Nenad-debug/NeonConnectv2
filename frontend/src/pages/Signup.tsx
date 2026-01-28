import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, User, Briefcase, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react'
import { authService } from '../services/authService'
import Background from '../components/common/Background'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Set role from URL parameter if provided
  useEffect(() => {
    const roleParam = searchParams.get('role') as 'candidate' | 'employer' | null
    if (roleParam && (roleParam === 'candidate' || roleParam === 'employer')) {
      setRole(roleParam)
    }
  }, [searchParams])

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

    try {
      const lastKey = `last_signup_${email}`
      const last = Number(localStorage.getItem(lastKey) || '0')
      const now = Date.now()
      const THROTTLE_MS = 60 * 1000
      if (last && now - last < THROTTLE_MS) {
        const wait = Math.ceil((THROTTLE_MS - (now - last)) / 1000)
        setError(`Previše pokušaja. Probaj ponovo za ${wait} sek.`)
        return
      }

      setLoading(true)
      await authService.signup(email, password, role)
      try { localStorage.setItem(lastKey, String(Date.now())) } catch (e) {}

      navigate(`/check-email?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      const msg = err?.message || ''
      if (/email rate limit/i.test(msg)) {
        setError('Previše zahteva za potvrdu mejla. Probaj ponovo kasnije.')
      } else if (/already exists|duplicate|conflict/i.test(msg)) {
        setError('Nalog sa ovim e‑mailom već postoji. Prijavi se ili resetuj lozinku.')
      } else {
        setError(msg || 'Greška pri registraciji')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 relative overflow-hidden">
      <Background />

      <div className="w-full max-w-md">
        {/* Card with glassmorphism */}
        <div className="relative group">
          {/* Gradient border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          
          {/* Main card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="space-y-2 mb-8">
              <h2 className="text-4xl font-black text-white">Registracija</h2>
              <p className="text-slate-400">Kreiraj svoj nalog u minutama</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300">Registruj se kao:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('candidate')}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                      role === 'candidate'
                        ? 'border-blue-500 bg-blue-600/15'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                    }`}
                  >
                    <User className={`w-6 h-6 mx-auto mb-2 transition-colors ${role === 'candidate' ? 'text-blue-400' : 'text-slate-400'}`} />
                    <div className="text-sm font-semibold">Kandidat</div>
                    {role === 'candidate' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                      role === 'employer'
                        ? 'border-blue-500 bg-blue-600/15'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                    }`}
                  >
                    <Briefcase className={`w-6 h-6 mx-auto mb-2 transition-colors ${role === 'employer' ? 'text-blue-400' : 'text-slate-400'}`} />
                    <div className="text-sm font-semibold">Poslodavac</div>
                    {role === 'employer' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-400" />}
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Email</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tvoj@email.com"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/80 transition-all duration-300 placeholder-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Lozinka</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/80 transition-all duration-300 placeholder-slate-600"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500">Najmanje 6 karaktera</p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Potvrdi lozinku</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/80 transition-all duration-300 placeholder-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 flex items-center justify-center gap-2 group transform hover:scale-105"
              >
                {loading ? 'Registracija u toku...' : (
                  <>
                    Registruj se
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Već imaš nalog?{' '}
                <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-300">
                  Prijavi se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
