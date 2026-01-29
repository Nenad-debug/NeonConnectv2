import { Link } from 'react-router-dom'
import { Search, MapPin, Briefcase, ArrowRight } from 'lucide-react'
import Background from '../components/common/Background'
import { useState } from 'react'

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  // Mock data za početak
  const jobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechCorp',
      location: 'Beograd, Srbija',
      salary: '1500€ - 2000€',
      type: 'Full-time',
      description: 'Tražimo iskusnog React developera sa 5+ godina iskustva...'
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      company: 'DesignStudio',
      location: 'Novi Sad, Srbija',
      salary: '1000€ - 1500€',
      type: 'Full-time',
      description: 'Kreiranje modernih dizajna za web i mobilne aplikacije...'
    },
    {
      id: 3,
      title: 'Backend Developer (Node.js)',
      company: 'CloudTech',
      location: 'Beograd, Srbija',
      salary: '1800€ - 2200€',
      type: 'Full-time',
      description: 'Razvoj backend servisa na Node.js sa TypeScript...'
    },
    {
      id: 4,
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'Beograd, Srbija',
      salary: '1200€ - 1800€',
      type: 'Full-time',
      description: 'Upravljanje proizvodom i definisanje strategije...'
    },
  ]

  const filteredJobs = jobs.filter(job => 
    (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedLocation === '' || job.location.includes(selectedLocation))
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

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {filteredJobs.map(job => (
              <div key={job.id} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
                <div className="relative bg-slate-900/90 md:bg-slate-900/80 md:backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6">
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{job.title}</h3>
                        <p className="text-lg text-blue-400 font-semibold">{job.company}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          {job.type}
                        </div>
                      </div>

                      <p className="text-slate-400">{job.description}</p>

                      <div className="text-xl font-bold text-blue-300">
                        {job.salary}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 md:w-48">
                      <Link 
                        to="/signup"
                        className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 whitespace-nowrap"
                      >
                        Apliciraj
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
            <div className="relative bg-slate-900/90 md:bg-slate-900/80 md:backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 sm:p-12 text-center">
              <p className="text-xl text-slate-300">Nema dostupnih poslova koji odgovaraju vašoj pretrazi.</p>
            </div>
          </div>
        )}

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
