import { Link } from 'react-router-dom'
import { Briefcase, Users, TrendingUp } from 'lucide-react'
import Background from '../components/common/Background'

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg text-white relative overflow-hidden">
      <Background />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight animate-fade-in">
              Pronađi posao koji pomera tvoju karijeru
            </h1>
            <p className="text-lg text-slate-200 max-w-xl animate-slide-in-left">
              NeonConnect povezuje vrhunske talente sa proverenim kompanijama. Brzo, bezbedno i profesionalno.
            </p>

            <div className="flex gap-4 mt-6 animate-slide-in-left">
              <Link to="/jobs" className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-smooth shadow-md">
                Pretraži poslove
              </Link>
              <Link to="/post-job" className="px-6 py-3 border border-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition-smooth">
                Objavi posao
              </Link>
            </div>
          </div>

          <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/50 p-6 rounded-2xl shadow-xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Istaknuti oglasi</h3>
                <span className="text-sm text-slate-400">Ažurirano danas</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-800/40 rounded-lg transition-smooth hover:translate-x-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Frontend Developer</h4>
                      <p className="text-sm text-slate-400">Remote · Senior</p>
                    </div>
                    <div className="text-sm text-slate-300">€60k-80k</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-lg transition-smooth hover:-translate-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Backend Developer</h4>
                      <p className="text-sm text-slate-400">Belgrade · Mid</p>
                    </div>
                    <div className="text-sm text-slate-300">€50k-70k</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 animate-slide-in-left">
            <Briefcase className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold">Velika baza poslova</h3>
            <p className="text-slate-300 text-sm mt-2">Stotine aktivnih oglasa iz različitih industrija.</p>
          </div>

          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 animate-fade-in">
            <Users className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold">Provereni poslodavci</h3>
            <p className="text-slate-300 text-sm mt-2">Kvalitetni oglasi i transparentni profili kompanija.</p>
          </div>

          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 animate-slide-in-right">
            <TrendingUp className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold">Razvoj karijere</h3>
            <p className="text-slate-300 text-sm mt-2">Alati za praćenje napretka i preporuke poslova.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
