import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import Background from '../components/common/Background'
import { AlertCircle, Zap, ArrowLeft } from 'lucide-react'

export default function PostJob() {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          navigate('/login')
        }
      } catch (err) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-slate-300 text-lg">Učitavanje...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg text-white relative overflow-hidden py-20">
      <Background />

      <div className="relative max-w-4xl mx-auto px-4 space-y-8">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Nazad
        </button>

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-black">Objavi novi posao</h1>
          <p className="text-xl text-slate-300">Pronađi idealne kandidate za tvoju kompaniju</p>
        </div>

        {/* Main message - Under Development */}
        <div className="relative group">
          {/* Gradient border background */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Content card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 space-y-6">
            <div className="flex items-start gap-4">
              <Zap className="w-12 h-12 text-yellow-400 flex-shrink-0" />
              <div className="space-y-3 flex-1">
                <h2 className="text-3xl font-bold">Funkcionalnost objavljivanja poslova je u razvojnoj fazi</h2>
                <p className="text-lg text-slate-300">
                  Trenutno radimo na razvoju kompletnog sistema za objavljivanje poslova. Uskoro ćeš moći da:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 mt-4">
                  <li>Kreiraj detaljne oglase za otvorene pozicije</li>
                  <li>Upravljaj kandidatima i primljenim prijava</li>
                  <li>Komuniciraj sa zainteresovanim kandidatima</li>
                  <li>Pratiti status svakog oglasa</li>
                  <li>Analizira performanse oglasa</li>
                </ul>
                <p className="text-slate-400 flex items-center gap-2 pt-4">
                  <AlertCircle className="w-5 h-5" />
                  Zahvaljujemo ti na strpljenju!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 space-y-4">
            <h3 className="text-2xl font-bold">Predviđeni redosled razvoja:</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Osnovna forma', status: 'U razvojnoj fazi' },
                { step: 2, title: 'Upravljanje oglasima', status: 'U razvojnoj fazi' },
                { step: 3, title: 'Upravljanje aplikacijama', status: 'Planira se' },
                { step: 4, title: 'Komunikacija sa kandidatima', status: 'Planira se' },
                { step: 5, title: 'Analitika i statistika', status: 'Planira se' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-700/50 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.title}</h4>
                  </div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    item.status === 'U razvojnoj fazi' 
                      ? 'bg-yellow-500/20 text-yellow-300' 
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact support */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center space-y-4">
            <h3 className="text-xl font-bold">Imaš pitanja ili prijedloge?</h3>
            <p className="text-slate-300">Slobodno nam javi! Tvoje povratne informacije su nam važne.</p>
            <button 
              onClick={() => {
                window.location.href = '/#contact'
              }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Kontaktiraj nas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
