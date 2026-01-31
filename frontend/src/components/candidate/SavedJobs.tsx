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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/60 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-12 text-center space-y-4">
          <Heart className="w-16 h-16 text-pink-400/50 mx-auto animate-bounce" />
          <p className="text-pink-300 text-lg font-bold">Nemaš sačuvanih poslova</p>
          <p className="text-slate-400 text-sm">Sačuvaj poslove koji te interesuju za kasnije</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <div key={job.id} className="group relative animate-fade-in">
          {/* Neon glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          
          {/* Card */}
          <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/60 backdrop-blur-xl border border-pink-500/40 group-hover:border-pink-400/80 rounded-2xl p-7 h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/30">
            {/* Header with icon */}
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 p-1 flex items-center justify-center shadow-lg shadow-pink-500/40">
                <div className="w-full h-full bg-slate-950 rounded flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-300 fill-current" />
                </div>
              </div>
              <button
                onClick={() => handleRemove(job.id)}
                disabled={removingId === job.id}
                className="p-2.5 rounded-lg hover:bg-red-500/30 text-pink-400/60 hover:text-red-400 transition-all disabled:opacity-50 hover:border border-red-500/60"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-white group-hover:text-pink-300 transition-colors mb-2">
                  {job.job_title}
                </h3>
                <p className="text-sm font-bold text-pink-300/70">
                  {job.company_name}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                  <MapPin className="w-4 h-4 text-pink-400" />
                  {job.location}
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-300">{job.salary_range}</span>
                  </div>
                )}
                {job.job_type && (
                  <div className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/30 text-blue-300 border border-blue-500/60 hover:border-blue-400/80 hover:bg-blue-500/40 transition-all">
                    💼 {job.job_type}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <button className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black hover:shadow-lg hover:shadow-pink-500/60 transition-all duration-300 flex items-center justify-center gap-2 group/btn hover:scale-105 transform uppercase tracking-wider">
              🔍 Pogledaj
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
