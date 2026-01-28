import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import Background from '../components/common/Background'
import { AlertCircle, Zap } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          navigate('/login')
        } else {
          setUser(currentUser)
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
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-black">Dashboard</h1>
          <p className="text-xl text-slate-300">Dobrodošao/la, <span className="text-blue-400 font-semibold">{user?.email}</span></p>
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
                <h2 className="text-3xl font-bold">Dashboard je u razvojnoj fazi</h2>
                <p className="text-lg text-slate-300">
                  Radimo intenzivno na razvoju kompletnog dashboard-a sa svim funkcionalnostima. Uskoro će biti dostupan sa mogućnošću upravljanja tvojim profilom, primljenim ponudama, i svim ostalim naprednim mogućnostima.
                </p>
                <p className="text-slate-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Zahvaljujemo ti na strpljenju!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features coming soon */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'Upravljanje profilom', desc: 'Ažuriraj svoje lične podatke i veštine' },
            { title: 'Moje aplikacije', desc: 'Prati sve poslove na koje si se prijavio' },
            { title: 'Sačuvani poslovi', desc: 'Čuva poslove koji te interesuju' },
            { title: 'Preporuke', desc: 'Personalizovane preporuke poslova' },
          ].map((feature, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <h3 className="font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-sm text-slate-400">{feature.desc}</p>
                <p className="text-xs text-yellow-400/70">Dolazi uskoro...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

