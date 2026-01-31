import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white mt-12 overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Brand row */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 ring-1 ring-blue-500/30">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
            NeonConnect
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 mb-10">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-6 hover:border-blue-500/40 transition-colors duration-300">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-400/90 mb-4">
              Za kandidate
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/jobs" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Pronađi posao
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Moj profil
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Moje aplikacije
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-6 hover:border-blue-500/40 transition-colors duration-300">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-400/90 mb-4">
              Za poslodavce
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/post-job" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Objavi posao
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Pregledaj aplikacije
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Upravljaj poslovima
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-6 hover:border-blue-500/40 transition-colors duration-300">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-400/90 mb-4">
              Pravni
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => window.location.href = '#contact'}
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-left"
                >
                  Kontakt
                </button>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Uslovi korišćenja
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Politika privatnosti
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-700/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm font-medium">
              &copy; 2026 NeonConnect. Sva prava zadržana.
            </p>
            <div className="flex items-center gap-1 text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500/60" aria-hidden />
              <span className="text-xs font-medium">Platforma za karijeru</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
