import { useState } from 'react'
import { ArrowRight, Calendar, Building2, MapPin, Briefcase } from 'lucide-react'

interface Application {
  id: string
  job_title: string
  company_name: string
  location: string
  status: 'sent' | 'viewed' | 'interview' | 'rejected' | 'accepted'
  applied_at: string
  salary_range?: string
}

interface ApplicationsListProps {
  applications: Application[]
  loading?: boolean
}

const statusConfig = {
  sent: { label: 'Poslano', color: 'bg-blue-500/30 text-blue-300 border-blue-500/60 shadow-lg shadow-blue-500/20', icon: '📤' },
  viewed: { label: 'Pregledano', color: 'bg-purple-500/30 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-500/20', icon: '👁️' },
  interview: { label: 'Intervju', color: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/60 shadow-lg shadow-yellow-500/20', icon: '🎤' },
  rejected: { label: 'Odbijeno', color: 'bg-red-500/30 text-red-300 border-red-500/60 shadow-lg shadow-red-500/20', icon: '❌' },
  accepted: { label: 'Prihvaćeno', color: 'bg-emerald-500/30 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-500/20', icon: '✅' },
}

export default function ApplicationsList({ applications, loading }: ApplicationsListProps) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-800/50 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-12 text-center space-y-4">
          <Briefcase className="w-16 h-16 text-purple-400/50 mx-auto animate-bounce" />
          <p className="text-purple-300 text-lg font-bold">Nemaš aplikacija na poslove</p>
          <p className="text-slate-400 text-sm">Kreni sa pretraživanjem zanimljivih poslova</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Filter buttons */}
      <div className="flex gap-2 overflow-x-auto pb-4">
        {['all', 'sent', 'viewed', 'interview', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2.5 rounded-lg font-bold whitespace-nowrap transition-all duration-300 ${
              filter === status
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/40 transform scale-105'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 hover:border-blue-500/30'
            }`}
          >
            {status === 'all' ? '📋 Sve' : statusConfig[status as keyof typeof statusConfig]?.label}
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        {filtered.map((app) => {
          const status = statusConfig[app.status]
          return (
            <div key={app.id} className="group relative">
              {/* Neon glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              {/* Card */}
              <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/60 backdrop-blur-xl border border-blue-500/30 group-hover:border-blue-400/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30">
                <div className="flex items-start justify-between gap-4">
                  {/* Left content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors truncate">
                        {app.job_title}
                      </h3>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${status.color} uppercase tracking-wider`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-5 text-sm text-slate-300">
                      <div className="flex items-center gap-2 font-semibold">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        {app.company_name}
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        {app.location}
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        {new Date(app.applied_at).toLocaleDateString('sr-RS')}
                      </div>
                    </div>
                  </div>

                  {/* Right content */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {app.salary_range && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-cyan-300/70 uppercase tracking-wider">Plata</p>
                        <p className="font-black text-green-400 text-lg">{app.salary_range}</p>
                      </div>
                    )}
                    <ArrowRight className="w-6 h-6 text-blue-400 group-hover:text-cyan-300 group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats footer */}
      <div className="pt-4 border-t border-blue-500/20 flex items-center justify-between text-sm font-bold text-blue-300/70">
        <span>📊 Prikazujem {filtered.length} od {applications.length} aplikacija</span>
      </div>
    </div>
  )
}
