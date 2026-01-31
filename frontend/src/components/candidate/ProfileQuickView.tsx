import { Edit2 } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProfileQuickViewProps {
  user: any
  completeness?: number
}

export default function ProfileQuickView({ user, completeness = 0 }: ProfileQuickViewProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-950/60 border border-purple-500/30 hover:border-purple-400/80 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
      {/* Neon glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">👤 Profil</h3>
          <Link
            to="/edit-profile"
            className="p-2 text-purple-400/60 hover:text-purple-300 transition-all hover:bg-purple-500/20 rounded-lg hover:shadow-lg hover:shadow-purple-500/30"
          >
            <Edit2 className="w-5 h-5" />
          </Link>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold text-purple-300/60 uppercase tracking-widest">Ime i prezime</p>
            <p className="text-lg font-bold text-white mt-2">
              {user?.user_metadata?.full_name || 'Nezavršeno'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-purple-300/60 uppercase tracking-widest">Email</p>
            <p className="text-sm font-semibold text-purple-300 mt-2">{user?.email}</p>
          </div>
          
          <div className="pt-5 border-t border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-purple-300/60 uppercase tracking-widest">Kompletan profil</p>
              <span className="text-sm font-black text-purple-300">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-900/60 rounded-full h-3 border border-purple-500/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {completeness < 100 && (
            <Link
              to="/edit-profile"
              className="mt-6 block w-full py-3 px-4 text-center text-sm font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 transform"
            >
              Unapedi profil 🚀
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
