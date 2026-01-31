import { Link } from 'react-router-dom'
import { Search, MapPin, Briefcase, ArrowRight, Heart } from 'lucide-react'
import Background from '../components/common/Background'
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

interface Job {
  id: string
  title: string
  description: string
  location: string
  job_type: string
  salary_min?: number
  salary_max?: number
  employer_id: string
  created_at: string
  required_skills: string[]
}

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load jobs from database
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: supabaseError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (supabaseError) {
          console.error('Error loading jobs:', supabaseError)
          setError('Greška pri učitavanju poslova')
          setJobs([])
        } else {
          setJobs(data || [])
        }
      } catch (err) {
        console.error('Error loading jobs:', err)
        setError('Greška pri učitavanju poslova')
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  const filteredJobs = jobs.filter(job => 
    (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     job.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedLocation === '' || (typeof job.location === 'string' && job.location.includes(selectedLocation)))
  )

  return (
    <div className="min-h-screen gradient-bg text-white relative overflow-hidden py-8 sm:py-20">
      <Background />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        <div className="text-center space-y-2 sm:space-y-4 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-black">Dostupni poslovi</h1>
          <p className="text-base sm:text-xl text-slate-300">Pronađi posao koji te zanima</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 sm:mb-12">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 hidden md:block" />
            <div className="relative bg-slate-900/90 md:bg-slate-900/80 md:backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <input 
                type="text"
                placeholder="Pretraži po poslu ili kompaniji..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 hidden md:block" />
            <div className="relative bg-slate-900/90 md:bg-slate-900/80 md:backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900">Sve lokacije</option>
                <option value="Beograd" className="bg-slate-900">Beograd</option>
                <option value="Novi Sad" className="bg-slate-900">Novi Sad</option>
                <option value="Niš" className="bg-slate-900">Niš</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="relative group">
            <div className="relative bg-slate-900/90 rounded-2xl p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                <p className="text-lg text-slate-300">Učitavam poslove...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="relative group">
            <div className="relative bg-slate-900/90 rounded-2xl p-8 sm:p-12 text-center border border-red-500/30">
              <p className="text-lg text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Jobs List */}
        {!loading && !error && filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {filteredJobs.map(job => (
              <div key={job.id} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
                <div className="relative bg-slate-900/90 md:bg-slate-900/80 md:backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6">
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{job.title}</h3>
                        <p className="text-lg text-blue-400 font-semibold">Employer</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          {job.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          {job.job_type}
                        </div>
                      </div>

                      <p className="text-slate-400 line-clamp-2">{job.description}</p>

                      {(job.salary_min || job.salary_max) && (
                        <div className="text-xl font-bold text-blue-300">
                          €{job.salary_min}-{job.salary_max}
                        </div>
                      )}

                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {job.required_skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-4 md:w-48">
                      <Link 
                        to="/signup"
                        className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 whitespace-nowrap"
                      >
                        Apliciraj
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] border-2 border-slate-600 rounded-lg font-bold text-white hover:border-blue-400 hover:text-blue-300 transition-all duration-300">
                        <Heart className="w-4 h-4" />
                        Sačuvaj
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && filteredJobs.length === 0 && !error ? (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
            <div className="relative bg-slate-900/90 md:bg-slate-900/80 md:backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 sm:p-12 text-center">
              <p className="text-xl text-slate-300">Nema dostupnih poslova koji odgovaraju vašoj pretrazi.</p>
            </div>
          </div>
        ) : null}

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
          <div className="relative bg-slate-900/90 md:bg-slate-900/80 md:backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 sm:p-12 text-center space-y-4">
            <h3 className="text-2xl font-bold">Nije našao/la ono što tražiš?</h3>
            <p className="text-slate-300 mb-6">Kreiraj profil i budi obavešten/a o novim poslovima koji te zanimaju!</p>
            <Link 
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Kreiraj besplatan profil
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
