import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4 text-blue-300">Za kandidate</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/jobs" className="hover:text-blue-300 transition-colors">Pronađi posao</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-300 transition-colors">Moj profil</Link></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors">Moje aplikacije</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-blue-300">Za poslodavce</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/post-job" className="hover:text-blue-300 transition-colors">Objavi posao</Link></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors">Pregledaj aplikacije</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors">Upravljaj poslovima</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-blue-300">Pravni</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => window.location.href = '#contact'} className="hover:text-blue-300 transition-colors">
                  Kontakt
                </button>
              </li>
              <li><Link to="/terms" className="hover:text-blue-300 transition-colors">Uslovi korišćenja</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-300 transition-colors">Politika privatnosti</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700/50 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; 2026 NeonConnect. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  )
}
