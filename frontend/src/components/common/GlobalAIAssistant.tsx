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
    } else if (pathname.includes('/post') || pathname.includes('/employer-dashboard')) {
      setContext('employer')
    } else {
      setContext('general')
    }
  }, [location.pathname])

  // Close greeting when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowGreeting(true)
    }
  }, [isOpen])

  if (!userId) {
    // Still show button but with limited functionality for non-logged-in users
    return (
      <>
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
          disabled
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gray-400 text-white shadow-md cursor-not-allowed opacity-60 flex items-center justify-center"
          title="Prijavi se da koristiš AI asistenta"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      </>
    )
  }

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
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center border border-blue-500 ai-button-float"
        title="Otvori AI asistenta"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Modal with Professional Design */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
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
            <div className="relative bg-white rounded-lg shadow-xl flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      NeonConnect Assistant
                    </h2>
                    <p className="text-xs text-gray-500">Asistent za karijeru i poslove</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 min-h-0 overflow-hidden">
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
