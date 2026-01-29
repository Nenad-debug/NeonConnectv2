import { useState } from 'react'
import { Sparkles, MapPin, DollarSign, ArrowRight, Heart } from 'lucide-react'

interface RecommendedJob {
  id: string
  job_title: string
  company_name: string
  location: string
  salary_range?: string
  description: string
  match_percentage: number
  skills?: string[]
  saved?: boolean
}

interface RecommendedJobsProps {
  jobs: RecommendedJob[]
  onApply?: (jobId: string) => Promise<void>
  onSave?: (jobId: string) => Promise<void>
  loading?: boolean
}

export default function RecommendedJobs({ 
  jobs, 
  onApply, 
  onSave, 
  loading 
}: RecommendedJobsProps) {
  const [savingId, setSavingId] = useState<string | null>(null)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const handleSave = async (jobId: string) => {
    if (!onSave) return
    setSavingId(jobId)
    try {
      await onSave(jobId)
    } finally {
      setSavingId(null)
    }
  }

  const handleApply = async (jobId: string) => {
    if (!onApply) return
    setApplyingId(jobId)
    try {
      await onApply(jobId)
    } finally {
      setApplyingId(null)
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-800/50 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-12 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-slate-300 text-lg">Nema preporuka za sada</p>
          <p className="text-slate-500 text-sm">Unapedi svoj profil da bi dobio personalizovane preporuke</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {jobs.map((job, idx) => (
        <div 
          key={job.id} 
          className="group relative animate-fade-in"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          {/* Gradient border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-600/30 via-cyan-600/30 to-emerald-600/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 group-hover:border-emerald-500/50 rounded-lg p-6 h-full flex flex-col transition-all duration-300">
            {/* Header with match badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border border-emerald-500/50 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span className="text-sm font-bold text-emerald-300">{job.match_percentage}% Match</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSave(job.id)}
                disabled={savingId === job.id}
                className={`p-2 rounded-lg transition-all ${
                  job.saved
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'text-slate-400 hover:bg-rose-500/20 hover:text-rose-400'
                } disabled:opacity-50`}
                data-tour-save
              >
                <Heart className={`w-5 h-5 ${job.saved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">
                  {job.job_title}
                </h3>
                <p className="text-sm font-semibold text-slate-400">
                  {job.company_name}
                </p>
              </div>

              <p className="text-sm text-slate-400 line-clamp-2">
                {job.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {job.location}
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-300 font-semibold">{job.salary_range}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-slate-500 mb-2">Tražene veštine:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 rounded text-xs font-semibold bg-slate-800/50 text-slate-300 border border-slate-700/50"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-1 rounded text-xs font-semibold text-slate-500">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleApply(job.id)}
                disabled={applyingId === job.id}
                className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                data-tour-apply
              >
                {applyingId === job.id ? 'Slanje...' : 'Prijavi se'}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
