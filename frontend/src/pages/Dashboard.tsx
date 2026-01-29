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
import AIGuidedTour from '../components/common/AIGuidedTour'
import { TrendingUp, Briefcase, Heart, Sparkles, LogOut } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved'>('overview')
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showAITour, setShowAITour] = useState(false)
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
    console.log('🎉 [DASHBOARD] Success animation completed, starting tour...')
    // Show tour first (z-110 above success z-100), then hide success so no white flash
    setShowAITour(true)
    setTimeout(() => setShowSuccessAnimation(false), 100)
  }

  const handleAITourComplete = () => {
    console.log('✅ [DASHBOARD] AI tour completed')
    setShowAITour(false)
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
    <div className="min-h-screen gradient-bg text-white relative overflow-hidden py-8">
      <Background />

      {/* Success Animation - Prikazati na kraju Profile Setup */}
      <SuccessAnimation
        isVisible={showSuccessAnimation}
        onComplete={handleSuccessAnimationComplete}
        userName={user?.user_metadata?.full_name?.split(' ')[0]}
      />

      {/* AI Guided Tour */}
      {showAITour && (
        <div className="relative z-50">
          <AIGuidedTour
            isActive={showAITour}
            userName={user?.user_metadata?.full_name?.split(' ')[0]}
            onComplete={handleAITourComplete}
          />
        </div>
      )}

      {/* Profile Setup Modal */}
      <ProfileSetup
        isOpen={showProfileSetup}
        user={user}
        onComplete={handleProfileSetupComplete}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* ===== HEADER SECTION ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black">Dashboard</h1>
            <p className="text-base sm:text-xl text-slate-300 truncate">
              Dobrodošao/la, <span className="text-blue-400 font-semibold">{user?.user_metadata?.full_name || user?.email}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto group px-4 py-3 min-h-[44px] rounded-lg border border-slate-700/50 text-slate-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200 flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Odjava
          </button>
        </div>

        {/* ===== QUICK STATS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Moje aplikacije', value: mockApplications.length, icon: Briefcase, color: 'from-blue-600' },
            { label: 'Sačuvani poslovi', value: mockSavedJobs.length, icon: Heart, color: 'from-rose-600' },
            { label: 'Preporuke', value: mockRecommendedJobs.length, icon: Sparkles, color: 'from-emerald-600' }
          ].map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="group relative animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block`} />
                <div className="relative bg-slate-900/90 md:bg-slate-900/80 md:backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 sm:p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} to-purple-700 bg-opacity-20 flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ===== TABS (tour: filtriranje / pregled sekcija) ===== */}
        <div className="flex gap-2 sm:gap-4 border-b border-slate-700/50 overflow-x-auto pb-px -mx-1 scrollbar-hide" data-tour-filter>
          {[
            { id: 'overview', label: '📊 Pregled' },
            { id: 'applications', label: '📤 Moje aplikacije' },
            { id: 'saved', label: '❤️ Sačuvani poslovi' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 px-3 sm:px-4 py-3 min-h-[44px] font-semibold border-b-2 transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== CONTENT SECTIONS ===== */}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recommended Jobs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                      Preporučeni poslovi
                    </h2>
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-semibold">
                      Prikaži sve →
                    </button>
                  </div>
                  <div data-tour-jobs>
                    <RecommendedJobs jobs={mockRecommendedJobs.slice(0, 2)} />
                  </div>
                </div>

                {/* Recent Applications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                      Poslednje aplikacije
                    </h2>
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-semibold">
                      Prikaži sve →
                    </button>
                  </div>
                  <ApplicationsList applications={mockApplications.slice(0, 2)} />
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Profile Quick View */}
                <div data-tour-profile>
                  <ProfileQuickView user={user} completeness={65} />
                </div>

                {/* Notifications */}
                <div className="space-y-4" data-tour-notifications>
                  <h3 className="text-lg font-bold">Notifikacije</h3>
                  <Notifications notifications={mockNotifications} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <ApplicationsList applications={mockApplications} />
          </div>
        )}

        {/* Saved Jobs Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <SavedJobs jobs={mockSavedJobs} />
          </div>
        )}

        {/* CTA Section */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">Pronađi svoj idealni posao</h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Pretraži sve dostupne poslove i primeni se za one koji te interesuju
            </p>
            <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
              Pretraži poslove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

