import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react'
import { authService } from '../services/authService'
import Background from '../components/common/Background'

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
      navigate(`/check-email?email=${encodeURIComponent(email)}&type=reset`)
    } catch (err: any) {
      setError(err.message || 'Greška pri resetovanju lozinke')
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
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="space-y-2 mb-8 text-center">
              <h2 className="text-4xl font-black text-white">Resetuj lozinku</h2>
              <p className="text-slate-400">Unesi email da bi dobio link za resetovanje</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleReset} className="space-y-5">
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

              {/* Info Box */}
              <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-400">
                  Pošaljemo ti link za resetovanje na ovaj email. Link je važeći 1 sat.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 flex items-center justify-center gap-2 group transform hover:scale-105"
              >
                {loading ? 'Slanje u toku...' : (
                  <>
                    Pošalji link
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Sećaš se lozinke?{' '}
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
