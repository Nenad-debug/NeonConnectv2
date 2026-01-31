import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import AIChat from '../candidate/AIChat'

export default function GlobalAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [context, setContext] = useState('general')
  const [showGreeting, setShowGreeting] = useState(true)
  const [pulse, setPulse] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // Get user's name from profile
        try {
          const { data: profile, error } = await supabase
            .from('candidate_profiles')
            .select('first_name')
            .eq('user_id', user.id)
            .single()
          
          // Check for error and data existence
          if (!error && profile?.first_name) {
            setUserName(profile.first_name) // First name only
          }
        } catch (err) {
          console.warn('Failed to fetch user profile:', err)
        }
      }
    }
    getUser()
  }, [])

  // Detect context based on current page/route
  useEffect(() => {
    const pathname = location.pathname
    
    if (pathname.includes('/profile') || pathname.includes('/setup')) {
      setContext('profile_setup')
    } else if (pathname.includes('/jobs') || pathname.includes('/job')) {
      setContext('job_search')
    } else if (pathname.includes('/post') || pathname.includes('/employer')) {
      setContext('employer')
    } else if (pathname.includes('/dashboard')) {
      setContext('employer')
    } else {
      setContext('general')
    }
  }, [location.pathname])

  // Stop pulse animation after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // Close greeting when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowGreeting(true)
    }
  }, [isOpen])

  if (!userId) return null

  return (
    <>
      {/* Floating Button with Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(147, 51, 234, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(147, 51, 234, 0.5); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .ai-button-float {
          animation: float 3s ease-in-out infinite;
        }
        .ai-button-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
      `}</style>

      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center border-2 border-blue-300/50 hover:border-blue-300/100 ai-button-float ${pulse ? 'ai-button-glow' : ''}`}
        title="Otvori AI asistenta"
      >
        {pulse && <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 pulse-ring"></div>}
        <Sparkles className="w-7 h-7 relative z-10 animate-bounce" />
      </button>

      {/* Modal with Premium Design */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <style>{`
            @keyframes slide-up {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .modal-content {
              animation: slide-up 0.3s ease-out;
            }
          `}</style>

          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col modal-content">
            {/* Animated Background Border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/95 backdrop-blur-2xl rounded-3xl p-8 space-y-6 flex flex-col h-full border border-blue-500/30 shadow-2xl">
              {/* Header with Premium Design */}
              <div className="flex items-center justify-between pb-4 border-b border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      NeonAI Asistent
                    </h2>
                    <p className="text-xs text-slate-400">Tvoj personalni karnen savjetnik</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 min-h-0 bg-slate-900/40 rounded-2xl border border-slate-700/50 overflow-hidden">
                <AIChat 
                  userId={userId}
                  context={context}
                  userName={userName}
                  showGreeting={showGreeting}
                  onGreetingShown={() => setShowGreeting(false)}
                  compact={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
