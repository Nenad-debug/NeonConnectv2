import { useState, useEffect, useRef } from 'react'
import { Send, Loader, X, Sparkles } from 'lucide-react'
import { aiService } from '../../services/aiService'
import { supabase } from '../../services/supabaseClient'

interface AIChatProps {
  userId: string
  context?: string
  onClose?: () => void
  compact?: boolean
  initialMessages?: any[]
  userName?: string | null
  showGreeting?: boolean
  onGreetingShown?: () => void
}

export default function AIChat({
  userId,
  context = 'general',
  onClose,
  compact = false,
  initialMessages,
  userName = null,
  showGreeting = true,
  onGreetingShown,
}: AIChatProps) {
  const [messages, setMessages] = useState<any[]>(initialMessages || [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProfileWizard, setIsProfileWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(0)
  const [profileData, setProfileData] = useState<Record<string, any>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history on mount
  useEffect(() => {
    loadHistory()
  }, [userId, context])

  // Add greeting message when chat opens
  useEffect(() => {
    if (showGreeting && messages.length === 0) {
      const greetingMessage = `Zdravo${userName ? `, ${userName}` : ''}! 👋 Ja sam tvoj NeonAI asistent. 

Mogu ti pomoći sa:
• 🎯 Popunjavanjem tvog profila
• 📋 Pretraživanjem savršenog posla
• 💼 Pripremeom za intervju
• 📊 Razumevanjem tržišta rada

Šta bi voleo da uradiš?`

      setMessages([{ role: 'assistant', content: greetingMessage }])
      onGreetingShown?.()
    }
  }, [showGreeting, userId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadHistory = async () => {
    try {
      const history = await aiService.getChatHistory(userId, context, 20)
      // Don't overwrite if we have greeting
      if (!showGreeting) {
        setMessages(history)
      }
    } catch (err: any) {
      console.warn('Failed to load chat history:', err.message)
      setMessages([])
    }
  }

  // Profile wizard questions
  const wizardQuestions = [
    {
      title: 'Kako se zoveš?',
      field: 'first_name',
      placeholder: 'Unesi svoje puno ime',
      type: 'text',
    },
    {
      title: 'Koja je tvoja trenutna pozicija/zanimanje?',
      field: 'current_position',
      placeholder: 'npr. Software Developer, Designer, itd.',
      type: 'text',
    },
    {
      title: 'Koliko godina iskustva imaš?',
      field: 'years_experience',
      placeholder: 'npr. 3 godine',
      type: 'text',
    },
    {
      title: 'Koje su tvoje glavne vještine?',
      field: 'skills',
      placeholder: 'npr. React, TypeScript, Python (odvojene zarezima)',
      type: 'text',
    },
    {
      title: 'Koje je tvoje najmanje obrazovanje?',
      field: 'education',
      placeholder: 'npr. Fakultet za Informatiku',
      type: 'text',
    },
    {
      title: 'U kojoj lokaciji tražiš posao?',
      field: 'location',
      placeholder: 'npr. Beograd, Novi Sad',
      type: 'text',
    },
    {
      title: 'Koja je tvoja očekivana plata (mesečno)?',
      field: 'expected_salary',
      placeholder: 'npr. 1500 EUR',
      type: 'text',
    },
  ]

  const startProfileWizard = () => {
    setIsProfileWizard(true)
    setWizardStep(0)
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: 'Pomozi mi da popunim profil',
      },
      {
        role: 'assistant',
        content: `Odličan izbor! 🚀 Zajedno ćemo popuniti tvoj profil u ${wizardQuestions.length} koraka.\n\n${wizardQuestions[0].title}`,
      },
    ])
  }

  const handleWizardInput = async (answer: string) => {
    if (!answer.trim()) return

    const currentQuestion = wizardQuestions[wizardStep]
    const newProfileData = {
      ...profileData,
      [currentQuestion.field]: answer,
    }
    setProfileData(newProfileData)

    // Add user response
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: answer },
    ])

    // Check if wizard is complete
    if (wizardStep < wizardQuestions.length - 1) {
      const nextQuestion = wizardQuestions[wizardStep + 1]
      setWizardStep(wizardStep + 1)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: nextQuestion.title,
        },
      ])
      setInput('')
    } else {
      // Wizard complete - save to database
      setWizardStep(wizardQuestions.length)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⏳ Čuvam tvoj profil... Malo čekaj...',
        },
      ])

      try {
        // Save to candidate_profiles
        const { error } = await supabase
          .from('candidate_profiles')
          .update({
            first_name: newProfileData.first_name,
            current_position: newProfileData.current_position,
            years_experience: newProfileData.years_experience,
            skills: newProfileData.skills,
            education: newProfileData.education,
            location: newProfileData.location,
            expected_salary: newProfileData.expected_salary,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (error) throw error

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1].content = `✅ Odličan posao! Tvoj profil je sačuvan. 

Evo šta sam spreo/sprela:
📝 Ime: ${newProfileData.first_name}
💼 Pozicija: ${newProfileData.current_position}
⏱️ Iskustvo: ${newProfileData.years_experience}
🛠️ Vještine: ${newProfileData.skills}
🎓 Obrazovanje: ${newProfileData.education}
📍 Lokacija: ${newProfileData.location}
💰 Očekivana plata: ${newProfileData.expected_salary}

Sada mogu da ti preporučim poslove koji se poklapaju sa tvojim profilom! 🎯`
          return updated
        })

        setIsProfileWizard(false)
      } catch (err: any) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1].content = `Greška pri čuvanju profila: ${err.message}`
          return updated
        })
      }

      setInput('')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    // If in wizard mode, handle wizard input
    if (isProfileWizard) {
      handleWizardInput(input)
      return
    }

    setError(null)
    const userMessage = input.trim()
    setInput('')

    try {
      // Check if user is asking to fill profile
      if (
        userMessage.toLowerCase().includes('popuni') ||
        userMessage.toLowerCase().includes('profil') ||
        userMessage.toLowerCase().includes('wizard')
      ) {
        startProfileWizard()
        return
      }

      // Save user message
      await aiService.saveChatMessage(userId, 'user', userMessage, context)

      // Add to UI immediately
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

      // Get AI response
      setLoading(true)
      const aiResponse = await aiService.sendMessage(userMessage, context, messages)

      // Save AI response
      await aiService.saveChatMessage(userId, 'assistant', aiResponse, context)

      // Add to UI
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (err: any) {
      console.error('Chat error:', err)
      setError(err.message || 'Greška pri slanju poruke')
      setInput(userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (confirm('Želiš li da obriše istoriju razgovora?')) {
      try {
        await aiService.clearChatHistory(userId, context)
        setMessages([])
      } catch (err) {
        setError('Greška pri brisanju istorije')
      }
    }
  }
  
  // Unused for now but kept for future use
  void handleClearHistory

  if (compact) {
    return (
      <div className="h-full flex flex-col bg-slate-900/80 rounded-lg border border-slate-700/50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" /> AI Asistent
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded transition-all"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">Počni razgovor sa AI asistentom</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Razmišljam...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-500/20 text-red-300 text-sm border-t border-red-500/50">{error}</div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={isProfileWizard ? wizardQuestions[wizardStep]?.placeholder : 'Pitaj me nešto...'}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Full chat interface
  return (
    <div className="w-full h-full flex flex-col">
      <style>{`
        @keyframes slide-in-message {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-item {
          animation: slide-in-message 0.3s ease-out;
        }
        @keyframes pulse-wizard {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .wizard-progress {
          animation: pulse-wizard 2s ease-in-out infinite;
        }
      `}</style>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/40">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <p className="text-5xl">🤖</p>
              <p className="text-slate-200 font-semibold">Pokreni razgovor sa AI asistentom</p>
              <p className="text-sm text-slate-400">Mogu ti pomoći sa sve što te zanima</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-item`}>
                <div
                  className={`max-w-lg px-5 py-3 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none shadow-lg'
                      : 'bg-slate-800/80 text-slate-100 rounded-bl-none border border-slate-700/50'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start message-item">
                <div className="bg-slate-800/80 border border-slate-700/50 text-slate-200 px-5 py-3 rounded-xl rounded-bl-none flex items-center gap-3 wizard-progress">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI razmišlja...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-3 bg-red-500/20 text-red-300 text-sm border-t border-red-500/50">❌ {error}</div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-700/50 bg-slate-900/40">
        {isProfileWizard && wizardStep < wizardQuestions.length && (
          <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-300">
              Pitanje {wizardStep + 1} od {wizardQuestions.length}
            </p>
            <div className="h-1 bg-slate-700 rounded-full mt-2">
              <div
                className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${((wizardStep + 1) / wizardQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={
              isProfileWizard
                ? wizardQuestions[wizardStep]?.placeholder || 'Odgovori...'
                : 'Napiši svojom poruku...'
            }
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition-all"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isProfileWizard ? 'Dalje' : 'Pošalji'}
          </button>
        </div>

        {/* Wizard Complete Button */}
        {isProfileWizard && wizardStep >= wizardQuestions.length && (
          <button
            type="button"
            onClick={() => {
              setIsProfileWizard(false)
              setWizardStep(0)
              setProfileData({})
            }}
            className="w-full mt-3 px-4 py-2 rounded-lg bg-slate-700/50 text-white text-sm hover:bg-slate-600/50 transition-all"
          >
            ✅ Završi Wizard
          </button>
        )}
      </form>

      {/* Quick Actions (when no messages) */}
      {messages.length <= 1 && !isProfileWizard && (
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={() => {
              startProfileWizard()
            }}
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Popuni profil Wizardom
          </button>
        </div>
      )}
    </div>
  )
}
