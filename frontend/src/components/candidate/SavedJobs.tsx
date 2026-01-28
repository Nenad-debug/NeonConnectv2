import { useState } from 'react'
import { Heart, Trash2, MapPin, DollarSign, ArrowRight } from 'lucide-react'

interface SavedJob {
  id: string
  job_title: string
  company_name: string
  location: string
  salary_range?: string
  job_type?: string
  saved_at: string
}

interface SavedJobsProps {
  jobs: SavedJob[]
  onRemove?: (jobId: string) => Promise<void>
  loading?: boolean
}

export default function SavedJobs({ jobs, onRemove, loading }: SavedJobsProps) {
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (jobId: string) => {
    if (!onRemove) return
    setRemovingId(jobId)
    try {
      await onRemove(jobId)
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-800/50 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-12 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-slate-300 text-lg">Nemaš sačuvanih poslova</p>
          <p className="text-slate-500 text-sm">Sačuvaj poslove koji te interesuju za kasnije</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <div key={job.id} className="group relative animate-fade-in">
          {/* Gradient border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-rose-600/30 via-pink-600/30 to-rose-600/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 group-hover:border-rose-500/50 rounded-lg p-6 h-full flex flex-col transition-all duration-300">
            {/* Header with icon */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <button
                onClick={() => handleRemove(job.id)}
                disabled={removingId === job.id}
                className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors mb-1">
                  {job.job_title}
                </h3>
                <p className="text-sm font-semibold text-slate-400">
                  {job.company_name}
                </p>
              </div>

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
                {job.job_type && (
                  <div className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {job.job_type}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <button className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-rose-500/50 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
              Pogledaj
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
