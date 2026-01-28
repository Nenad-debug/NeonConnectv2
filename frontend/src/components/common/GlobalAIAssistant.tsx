import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { supabase } from '../../services/supabaseClient'
import AIChat from '../candidate/AIChat'

export default function GlobalAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  if (!userId) return null

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center border border-blue-400/30 hover:border-blue-400/60"
        title="Otvori AI asistenta"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-100"></div>
              
              <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 space-y-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    AI Asistent
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 min-h-0">
                  <AIChat 
                    userId={userId}
                    context="general"
                    compact={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
