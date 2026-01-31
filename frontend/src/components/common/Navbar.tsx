import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        .nav-link {
          position: relative;
          overflow: hidden;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent);
          transition: left 0.3s ease;
        }
        .nav-link:hover::after {
          left: 100%;
        }
        .nav-cta {
          box-shadow: 0 0 20px -4px rgb(59 130 246 / 0.4), 0 0 40px -8px rgb(99 102 241 / 0.2);
        }
        .nav-cta:hover {
          box-shadow: 0 0 24px -4px rgb(59 130 246 / 0.5), 0 0 48px -8px rgb(99 102 241 / 0.3);
        }
      `}</style>

      <nav className="sticky top-0 z-50 md:backdrop-blur-xl bg-slate-900/90 md:bg-slate-900/85 text-white border-b border-slate-700/60 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.5),0_0_0_1px_rgba(59,130,246,0.08)]">
        {/* Glow line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/80 to-transparent" />
        <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-blue-500/30 blur-sm" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center relative">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="relative w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden ring-2 ring-blue-500/30 group-hover:ring-blue-400/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]">
              <svg
                viewBox="0 0 40 40"
                className="w-7 h-7 relative z-10"
                fill="none"
                aria-hidden
              >
                <defs>
                  <linearGradient id="nav-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                {/* Bold N — left bar */}
                <path fill="url(#nav-logo-gradient)" d="M7 7h5v26H7V7z" />
                {/* Bold N — diagonal */}
                <path fill="url(#nav-logo-gradient)" d="M12 7L33 33L28 33L7 12Z" />
                {/* Bold N — right bar */}
                <path fill="url(#nav-logo-gradient)" d="M28 7h5v26h-5V7z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent group-hover:from-white group-hover:via-cyan-100 group-hover:to-blue-200 transition-all duration-300">
              NeonConnect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              to="/jobs" 
              className="nav-link px-4 py-2.5 text-slate-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-slate-800/60"
            >
              Poslovi
            </Link>
            <Link 
              to="/post-job" 
              className="px-4 py-2.5 text-slate-300 hover:text-white font-medium transition-colors duration-200 rounded-lg hover:bg-slate-700"
            >
              Objavi posao
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2.5 text-slate-300 hover:text-white font-medium transition-colors duration-200 rounded-lg hover:bg-slate-700"
            >
              Prijava
            </Link>
            <Link 
              to="/signup" 
              className="nav-cta ml-3 px-6 py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-400 hover:via-blue-500 hover:to-indigo-500 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Registracija
            </Link>
          </div>

          {/* Mobile Menu Button — min 44px touch target */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700/50 active:bg-slate-700 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-900/98 md:bg-slate-900/95 md:backdrop-blur-xl animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
              <Link 
                to="/jobs"
                className="block px-4 py-3 min-h-[44px] flex items-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-blue-300 active:bg-slate-800 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Poslovi
              </Link>
              <Link 
                to="/post-job"
                className="block px-4 py-3 min-h-[44px] flex items-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium active:bg-slate-700 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Objavi posao
              </Link>
              <Link 
                to="/login"
                className="block px-4 py-3 min-h-[44px] flex items-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium active:bg-slate-700 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prijava
              </Link>
              <Link 
                to="/signup"
                className="block px-4 py-3 min-h-[44px] flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-semibold text-white hover:from-blue-500 hover:to-blue-600 active:from-blue-600 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Registracija
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
