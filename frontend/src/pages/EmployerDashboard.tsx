import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { supabase } from '../services/supabaseClient'
import Background from '../components/common/Background'
import { Briefcase, LogOut, Settings } from 'lucide-react'

export default function EmployerDashboard() {
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          navigate('/login')
          return
        }

        // Get role from users table
        const { data: userData } = await supabase
          .from('users')
          .select('role, company_name')
          .eq('id', currentUser.id)
          .single()

        // Check if user is employer
        if (userData?.role !== 'employer') {
          navigate('/dashboard')
          return
        }

        setCompanyName(userData?.company_name || '')
      } catch (err) {
        console.error('Error loading user:', err)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Background />
      <div className="min-h-screen pt-20 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Dobrodošli, <span className="text-blue-400">{companyName || 'Poslodavče'}</span>! 👔
            </h1>
            <p className="text-slate-400">Upravljaj tvojim oglasima i kandidatima</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <button
              onClick={() => navigate('/post-job')}
              className="group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg p-6 text-white transition-all hover:scale-105"
            >
              <Briefcase className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold mb-1">Novi Oglas</h3>
              <p className="text-sm text-blue-100">Postavi poziciju</p>
            </button>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
              <div className="text-3xl font-bold mb-2">0</div>
              <p className="text-sm text-purple-100">Aktivnih Oglasa</p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
              <div className="text-3xl font-bold mb-2">0</div>
              <p className="text-sm text-green-100">Prijava Primljeno</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-6 text-white">
              <div className="text-3xl font-bold mb-2">0</div>
              <p className="text-sm text-indigo-100">Kandidata</p>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Moji Oglasi</h2>
            <div className="text-center py-12 text-slate-400">
              <p>Nemaš aktivnih oglasa</p>
              <button
                onClick={() => navigate('/post-job')}
                className="mt-4 inline-block text-blue-400 hover:text-blue-300 font-semibold"
              >
                Pokreni prvi oglas →
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Postavke
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Odjava
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
