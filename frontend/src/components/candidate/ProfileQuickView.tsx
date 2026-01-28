import { Edit2, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProfileQuickViewProps {
  user: any
  completeness?: number
}

export default function ProfileQuickView({ user, completeness = 0 }: ProfileQuickViewProps) {
  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return 'text-emerald-400'
    if (completion >= 50) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="relative group">
      {/* Gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Card */}
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 group-hover:border-blue-500/50 rounded-lg p-6 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Profil</h3>
          <Link
            to="/edit-profile"
            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
          >
            <Edit2 className="w-5 h-5" />
          </Link>
        </div>

        {/* User info */}
        <div className="space-y-4 mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <p className="text-sm text-slate-400 mb-1">Ime i prezime</p>
            <p className="text-lg font-semibold text-white">
              {user?.user_metadata?.full_name || 'Nezavršeno'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Email</p>
            <p className="text-lg font-semibold text-blue-300">{user?.email}</p>
          </div>
        </div>

        {/* Completeness bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {completeness >= 80 ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-400" />
              )}
              <span className="text-sm text-slate-300 font-semibold">Kompletan profil</span>
            </div>
            <span className={`text-lg font-bold ${getCompletionColor(completeness)}`}>
              {completeness}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                completeness >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                  : completeness >= 50
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-orange-500 to-red-500'
              }`}
              style={{ width: `${completeness}%` }}
            ></div>
          </div>

          {completeness < 100 && (
            <p className="text-xs text-slate-400 pt-2">
              Završi profil da bi dobio bolje preporuke
            </p>
          )}
        </div>

        {/* CTA Button */}
        {completeness < 100 && (
          <Link
            to="/edit-profile"
            className="mt-4 w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all text-center block"
          >
            Unapedi profil
          </Link>
        )}
      </div>
    </div>
  )
}
