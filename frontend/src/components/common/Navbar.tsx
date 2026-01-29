import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Menu, X } from 'lucide-react'

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
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          transition: left 0.3s ease;
        }
        
        .nav-link:hover::after {
          left: 100%;
        }
      `}</style>

      <nav className="sticky top-0 z-50 md:backdrop-blur-xl bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 md:from-slate-900/80 md:via-slate-800/70 md:to-slate-900/80 text-white shadow-lg border-b border-slate-700/50">
        {/* Gradient line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-300"
          >
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <Briefcase className="w-6 h-6 text-white relative z-10" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-cyan-400 transition-all duration-300">
              NeonConnect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/jobs" 
              className="nav-link px-4 py-2 text-slate-300 hover:text-blue-300 transition-colors duration-300 rounded-lg hover:bg-slate-800/50"
            >
              Poslovi
            </Link>
            <Link 
              to="/post-job" 
              className="nav-link px-4 py-2 text-slate-300 hover:text-blue-300 transition-colors duration-300 rounded-lg hover:bg-slate-800/50"
            >
              Objavi posao
            </Link>
            <Link 
              to="/login" 
              className="nav-link px-4 py-2 text-slate-300 hover:text-blue-300 transition-colors duration-300 rounded-lg hover:bg-slate-800/50"
            >
              Prijava
            </Link>
            
            {/* Signup Button - Premium Style */}
            <Link 
              to="/signup" 
              className="ml-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-blue-500/50 transform hover:scale-105"
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
                className="block px-4 py-3 min-h-[44px] flex items-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-blue-300 active:bg-slate-800 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Objavi posao
              </Link>
              <Link 
                to="/login"
                className="block px-4 py-3 min-h-[44px] flex items-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-blue-300 active:bg-slate-800 transition-colors duration-200"
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
