import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import Background from '../components/common/Background'
import ApplicationsList from '../components/candidate/ApplicationsList'
import SavedJobs from '../components/candidate/SavedJobs'
import RecommendedJobs from '../components/candidate/RecommendedJobs'
import ProfileQuickView from '../components/candidate/ProfileQuickView'
import Notifications from '../components/candidate/Notifications'
import ProfileSetup from '../components/candidate/ProfileSetup'
import SuccessAnimation from '../components/common/SuccessAnimation'
import { Briefcase, Heart, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved'>('overview')
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const navigate = useNavigate()

  // MOCK DATA - Replace with real data from Supabase when available
  const mockApplications = [
    {
      id: '1',
      job_title: 'Senior Frontend Developer',
      company_name: 'TechCorp Belgrade',
      location: 'Remote',
      status: 'interview' as const,
      applied_at: new Date().toISOString(),
      salary_range: '€80k-100k'
    },
    {
      id: '2',
      job_title: 'React Developer',
      company_name: 'StartupHub',
      location: 'Belgrade',
      status: 'viewed' as const,
      applied_at: new Date(Date.now() - 86400000).toISOString(),
      salary_range: '€50k-70k'
    }
  ]

  // MOCK DATA - Replace with real data from Supabase when available
  const mockSavedJobs = [
    {
      id: '3',
      job_title: 'Full Stack Developer',
      company_name: 'InnovateTech',
      location: 'Niš',
      salary_range: '€60k-80k',
      job_type: 'Full-time',
      saved_at: new Date().toISOString()
    },
    {
      id: '4',
      job_title: 'Frontend Engineer',
      company_name: 'CloudSolutions',
      location: 'Remote',
      salary_range: '€70k-90k',
      job_type: 'Full-time',
      saved_at: new Date().toISOString()
    }
  ]

  // MOCK DATA - Replace with real data from Supabase when available
  const mockRecommendedJobs = [
    {
      id: '5',
      job_title: 'Next.js Developer',
      company_name: 'DigitalAgency',
      location: 'Belgrade',
      salary_range: '€75k-95k',
      description: 'Tražimo iskusnog Next.js developera za naš tim',
      match_percentage: 95,
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js'],
      saved: false
    },
    {
      id: '6',
      job_title: 'TypeScript Developer',
      company_name: 'WebStudio',
      location: 'Remote',
      salary_range: '€65k-85k',
      description: 'Razvoj modernih web aplikacija sa TypeScript',
      match_percentage: 88,
      skills: ['TypeScript', 'React', 'Testing'],
      saved: false
    }
  ]

  // MOCK DATA - Replace with real data from Supabase when available
  const mockNotifications = [
    {
      id: '1',
      type: 'status_change' as const,
      title: 'Intervju pozvan!',
      description: 'TechCorp vas je pozvao na intervju za Senior Frontend Developer',
      created_at: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'job_match' as const,
      title: 'Novi posao za tebe',
      description: 'Pronašli smo posao koji se poklapa sa tvojim profilom',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      read: true
    }
  ]

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('📊 [DASHBOARD] Loading user...')
        
        const currentUser = await authService.getCurrentUser()
        
        if (!currentUser) {
          console.log('⚠️ [DASHBOARD] No user found, redirecting to login')
          navigate('/login')
        } else {
          console.log('✅ [DASHBOARD] User loaded:', currentUser.id)
          setUser(currentUser)

          // Check if profile is complete
          const isComplete = await profileService.isProfileComplete(currentUser.id)
          
          if (!isComplete) {
            console.log('⚠️ [DASHBOARD] Profile not complete, showing setup')
            setShowProfileSetup(true)
          }
        }
      } catch (err) {
        console.error('❌ [DASHBOARD] Error loading user:', err)
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

  const handleProfileSetupComplete = async (profileData: any) => {
    if (!user) return

    try {
      console.log('💾 [DASHBOARD] Saving profile setup...', profileData)
      
      // Convert snake_case from ProfileSetup to camelCase for profileService
      const convertedData = {
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        bio: profileData.bio || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        experienceYears: parseInt(profileData.years_experience) || 0,
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
        education: profileData.education || '',
        certifications: [],
        languages: [],
      }
      
      console.log('📝 [DASHBOARD] Converted data:', convertedData)
      
      // Try to save full profile, but don't fail if it errors (already saved in ProfileSetup)
      try {
        await profileService.saveCandidateProfile(user.id, convertedData)
        console.log('✅ [DASHBOARD] Profile service save succeeded')
      } catch (serviceErr) {
        console.error('⚠️ [DASHBOARD] Profile service save failed (already saved in ProfileSetup):', serviceErr)
        // Don't throw - profile was already saved in ProfileSetup
      }
      
      // Close modal and show animation
      console.log('🎬 [DASHBOARD] Setting showProfileSetup to false')
      setShowProfileSetup(false)
      console.log('🎬 [DASHBOARD] Setting showSuccessAnimation to true')
      setShowSuccessAnimation(true)
      
      console.log('✅ [DASHBOARD] Profile setup completed')
    } catch (err: any) {
      console.error('❌ [DASHBOARD] Profile setup error:', err)
      // Don't throw - let the user stay in modal to retry
    }
  }

  const handleSuccessAnimationComplete = () => {
    setShowSuccessAnimation(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-slate-300 text-lg">Učitavanje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-white py-8">
      {/* Neon Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Background />

      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showSuccessAnimation}
        onComplete={handleSuccessAnimationComplete}
        userName={user?.user_metadata?.full_name?.split(' ')[0]}
      />

      {/* Profile Setup Modal */}
      <ProfileSetup
        isOpen={showProfileSetup}
        user={user}
        onComplete={handleProfileSetupComplete}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* HEADER - BOLD & DRAMATIC */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                DASHBOARD
              </h1>
              <p className="text-cyan-300/80 font-semibold">Upravljajte vašim karijanom sa stilom</p>
            </div>
            <button
              onClick={handleLogout}
              className="group px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
            >
              Odjava
            </button>
          </div>
        </div>

        {/* STATS ROW - NEON CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Moje aplikacije', value: mockApplications.length, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
            { label: 'Sačuvani poslovi', value: mockSavedJobs.length, icon: Heart, color: 'from-purple-500 to-pink-500' },
            { label: 'Preporuke', value: mockRecommendedJobs.length, icon: Sparkles, color: 'from-cyan-500 to-blue-500' }
          ].map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div 
                key={idx} 
                className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-950/60 border border-cyan-500/30 hover:border-cyan-400/80 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 transform hover:-translate-y-1"
              >
                {/* Neon border glow */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>
                
                <div className="relative flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} p-1 flex items-center justify-center shadow-lg shadow-cyan-500/30`}>
                    <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-cyan-300/70 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-4xl font-black text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* TABS - NEON STYLE */}
        <div className="border-b border-cyan-500/30 mb-8">
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Pregled', icon: '📊' },
              { id: 'applications', label: 'Moje aplikacije', icon: '📋' },
              { id: 'saved', label: 'Sačuvani poslovi', icon: '❤️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-bold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Recommended Jobs */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Preporučeni poslovi ✨</h2>
                  <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all">Sve</button>
                </div>
                <RecommendedJobs jobs={mockRecommendedJobs.slice(0, 2)} />
              </div>

              {/* Recent Applications */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Poslednje aplikacije 🚀</h2>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all">Sve</button>
                </div>
                <ApplicationsList applications={mockApplications.slice(0, 2)} />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              <ProfileQuickView user={user} completeness={65} />
              
              <div className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-900/80 to-slate-950/60 border border-purple-500/30 hover:border-purple-400/80 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative">
                  <h3 className="font-black text-white mb-4 text-lg">🔔 Notifikacije</h3>
                  <Notifications notifications={mockNotifications} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && <ApplicationsList applications={mockApplications} />}
        {activeTab === 'saved' && <SavedJobs jobs={mockSavedJobs} />}
      </div>
    </div>
  )
}

