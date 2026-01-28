import { useLocation, Link } from 'react-router-dom'
import { Mail, ArrowRight, AlertCircle } from 'lucide-react'
import Background from '../components/common/Background'

export default function CheckEmail() {
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const email = params.get('email') || ''
  const type = params.get('type') || 'signup'

  const isReset = type === 'reset'

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
            {/* Success Icon Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
                <Mail className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="space-y-4 text-center mb-8">
              <h2 className="text-4xl font-black text-white">
                {isReset ? 'Proveri svoj email' : 'Potvrdi svoj email'}
              </h2>
              <p className="text-slate-300 text-lg">
                {isReset 
                  ? 'Link za resetovanje je poslat.' 
                  : 'Verifikacijski link je poslat.'}
              </p>
            </div>

            {/* Email Display */}
            {email && (
              <div className="mb-8 p-4 bg-slate-800/60 border border-slate-700/50 rounded-lg text-center">
                <p className="text-slate-400 text-sm mb-2">Poslato na:</p>
                <p className="text-white font-semibold text-lg break-all">{email}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="mb-8 p-5 bg-blue-500/10 border border-blue-500/50 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  {isReset 
                    ? 'Klikni na link u mejlu da resetuješ lozinku. Link je važeći samo jednom.' 
                    : 'Klikni na link u mejlu da potvrdiš svoj email i završiš registraciju.'}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  Ako ne vidiš mejl, proveri <strong>spam folder</strong>.
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link 
                to={isReset ? '/forgot-password' : '/login'}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 group transform hover:scale-105"
              >
                {isReset ? 'Nazad na resetovanje' : 'Prijavi se'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-slate-400 text-sm">
              Još nije stignuo?{' '}
              <button className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300">
                Pošalji ponovo
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
