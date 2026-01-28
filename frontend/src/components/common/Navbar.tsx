import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="backdrop-blur-md bg-slate-900/60 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 text-2xl font-semibold transition-smooth">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center glow-effect animate-float">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg">NeonConnect</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/jobs" className="text-slate-300 hover:text-white transition-smooth">Poslovi</Link>
          <Link to="/post-job" className="text-slate-300 hover:text-white transition-smooth">Objavi posao</Link>
          <Link to="/login" className="px-4 py-2 text-sm hover:text-white transition-smooth">Prijava</Link>
          <Link to="/signup" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-smooth">Registracija</Link>
        </div>

        <div className="md:hidden">
          <button aria-label="open menu" className="p-2 rounded-md bg-slate-800/50">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
