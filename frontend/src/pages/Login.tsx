import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { authService } from '../services/authService'
import Background from '../components/common/Background'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    console.log('🚀 [LOGIN] Login attempt started')

    try {
      console.log('📧 [LOGIN] Email:', email)
      console.log('🔐 [LOGIN] Calling authService.login()...')
      
      const result = await authService.login(email, password)
      
      console.log('✅ [LOGIN] Login successful, result:', result)
      console.log('⏳ [LOGIN] Waiting for session to persist...')
      
      // Wait additional time to ensure session is properly saved
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('📍 [LOGIN] Navigating to /dashboard...')
      
      navigate('/dashboard')
    } catch (err: any) {
      console.error('❌ [LOGIN] Login failed:', err)
      setError(err.message || 'Greška pri prijavi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 sm:px-6 py-8 relative overflow-hidden">
      <Background />

      <div className="w-full max-w-md">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300 hidden sm:block" />
          <div className="relative bg-slate-900/90 md:bg-slate-900/80 md:backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="space-y-2 mb-8">
              <h2 className="text-4xl font-black text-white">Prijava</h2>
              <p className="text-slate-400">Uloguj se na svoj nalog</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
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
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-300">
                  Zaboravio/a si lozinku?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 flex items-center justify-center gap-2 group transform hover:scale-105"
              >
                {loading ? 'Prijava u toku...' : (
                  <>
                    Prijava
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Nemaš nalog?{' '}
                <Link to="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-300">
                  Registruj se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
