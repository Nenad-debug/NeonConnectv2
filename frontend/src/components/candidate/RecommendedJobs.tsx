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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/60 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-12 text-center space-y-4">
          <Sparkles className="w-16 h-16 text-blue-400/50 mx-auto animate-bounce" />
          <p className="text-cyan-300 text-lg font-bold">Nema preporuka za sada</p>
          <p className="text-slate-400 text-sm">Unapedi svoj profil da bi dobio personalizovane preporuke</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {jobs.map((job, idx) => (
        <div 
          key={job.id} 
          className="group relative animate-fade-in"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          {/* Neon glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          
          {/* Card */}
          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/70 backdrop-blur-xl border border-cyan-500/40 group-hover:border-cyan-400/80 rounded-2xl p-7 h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/30">
            {/* Header with match badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-400/60 flex items-center gap-2 font-bold">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-sm font-black text-white">{job.match_percentage}% ⚡</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSave(job.id)}
                disabled={savingId === job.id}
                className={`p-2.5 rounded-lg transition-all font-bold ${
                  job.saved
                    ? 'bg-pink-500/30 text-pink-400 border border-pink-400/60 shadow-lg shadow-pink-500/40'
                    : 'text-slate-400 hover:bg-pink-500/30 hover:text-pink-400 hover:border-pink-400/60'
                } border disabled:opacity-50`}
              >
                <Heart className={`w-5 h-5 ${job.saved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {job.job_title}
                </h3>
                <p className="text-sm font-bold text-cyan-300/70">
                  {job.company_name}
                </p>
              </div>

              <p className="text-sm text-slate-300 line-clamp-2">
                {job.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  {job.location}
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-300">{job.salary_range}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="pt-3">
                  <p className="text-xs font-black text-cyan-300/60 mb-2 uppercase tracking-wider">Tražene veštine:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400/80 hover:bg-slate-700/60 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 pt-6 border-t border-cyan-500/20">
              <button
                onClick={() => handleApply(job.id)}
                disabled={applyingId === job.id}
                className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black hover:shadow-lg hover:shadow-cyan-500/60 transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-50 hover:scale-105 transform uppercase tracking-wider"
              >
                {applyingId === job.id ? '⏳ Slanje...' : '🚀 Prijavi se'}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
