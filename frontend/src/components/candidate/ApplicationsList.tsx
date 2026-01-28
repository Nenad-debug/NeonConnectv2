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
  sent: { label: 'Poslano', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50', icon: '📤' },
  viewed: { label: 'Pregledano', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50', icon: '👁️' },
  interview: { label: 'Intervju', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', icon: '🎤' },
  rejected: { label: 'Odbijeno', color: 'bg-red-500/20 text-red-300 border-red-500/50', icon: '❌' },
  accepted: { label: 'Prihvaćeno', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', icon: '✅' },
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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-12 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-slate-300 text-lg">Nemaš aplikacija na poslove</p>
          <p className="text-slate-500 text-sm">Kreni sa pretraživanjem zanimljivih poslova</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2 overflow-x-auto pb-4">
        {['all', 'sent', 'viewed', 'interview', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            {status === 'all' ? 'Sve' : statusConfig[status as keyof typeof statusConfig]?.label}
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="space-y-3">
        {filtered.map((app) => {
          const status = statusConfig[app.status]
          return (
            <div key={app.id} className="group relative">
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Card */}
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 group-hover:border-blue-500/50 rounded-lg p-4 transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  {/* Left content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                        {app.job_title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        {app.company_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        {app.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {new Date(app.applied_at).toLocaleDateString('sr-RS')}
                      </div>
                    </div>
                  </div>

                  {/* Right content */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {app.salary_range && (
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Plata</p>
                        <p className="font-bold text-blue-300">{app.salary_range}</p>
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats footer */}
      <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm text-slate-400">
        <span>Prikazujem {filtered.length} od {applications.length} aplikacija</span>
      </div>
    </div>
  )
}
