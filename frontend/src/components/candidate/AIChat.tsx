import { useState, useEffect, useRef } from 'react'
import { Send, Loader, X, Sparkles, Image as ImageIcon } from 'lucide-react'
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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile wizard questions - defined once at component level
  const wizardQuestions = [
    { title: 'Kako se zoveš?', field: 'first_name', placeholder: 'Unesi svoje puno ime', type: 'text' as const },
    { title: 'Koja je tvoja trenutna pozicija/zanimanje?', field: 'current_position', placeholder: 'npr. Software Developer, Designer, itd.', type: 'text' as const },
    { title: 'Koliko godina iskustva imaš?', field: 'years_experience', placeholder: 'npr. 3 godine', type: 'text' as const },
    { title: 'Koje su tvoje glavne vještine?', field: 'skills', placeholder: 'npr. React, TypeScript, Python (odvojene zarezima)', type: 'text' as const },
    { title: 'Koje je tvoje najmanje obrazovanje?', field: 'education', placeholder: 'npr. Fakultet za Informatiku', type: 'text' as const },
    { title: 'U kojoj lokaciji tražiš posao?', field: 'location', placeholder: 'npr. Beograd, Novi Sad', type: 'text' as const },
    { title: 'Koja je tvoja očekivana plata (mesečno)?', field: 'expected_salary', placeholder: 'npr. 1500 EUR', type: 'text' as const },
  ]

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
    if (wizardStep >= wizardQuestions.length) {
      console.warn('⚠️ Wizard step out of bounds')
      return
    }
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
    if ((!input.trim() && !imagePreview) || loading) return

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

      // Add message with image if present
      const msgToAdd: any = { role: 'user', content: userMessage }
      if (imagePreview) {
        msgToAdd.image = imagePreview
      }
      setMessages((prev) => [...prev, msgToAdd])
      setImagePreview(null)

      // Save user message (non-blocking)
      aiService.saveChatMessage(userId, 'user', userMessage, context).catch((err) =>
        console.warn('Failed to save user message:', err)
      )

      // Get AI response with userId for rate limiting
      setLoading(true)
      const aiResponse = await aiService.sendMessage(userMessage, context, messages, userId)

      // Parse AI response - can be plain text or JSON with image
      let parsedResponse: any = { content: aiResponse, image: null }
      try {
        const parsed = JSON.parse(aiResponse)
        if (parsed.content || parsed.image) {
          parsedResponse = parsed
        }
      } catch (e) {
        // Response is plain text, not JSON
        parsedResponse = { content: aiResponse, image: null }
      }

      // Save AI response (non-blocking)
      aiService.saveChatMessage(userId, 'assistant', parsedResponse.content || aiResponse, context).catch((err) =>
        console.warn('Failed to save AI message:', err)
      )

      // Add to UI
      setMessages((prev) => [...prev, { role: 'assistant', content: parsedResponse.content, image: parsedResponse.image }])
    } catch (err: any) {
      console.error('Chat error:', err)
      setError(err.message || 'Greška pri slanju poruke')
      setInput(userMessage)
    } finally {
      setLoading(false)
    }
  }

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
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <p className="text-5xl">💼</p>
              <p className="text-gray-800 font-semibold text-lg">Aurora AI</p>
              <p className="text-sm text-gray-500">Kako mogu da vam pomognem?</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-item`}>
                <div
                  className={`max-w-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl rounded-tr-lg shadow-md'
                      : 'bg-gray-50 text-gray-900 rounded-3xl rounded-tl-lg border border-gray-200 shadow-sm'
                  } px-5 py-3`}
                >
                  {msg.image && (
                    <div className="mb-3">
                      <img 
                        src={msg.image} 
                        alt="User shared image" 
                        className="rounded-2xl w-full max-h-80 object-cover"
                      />
                    </div>
                  )}
                  {msg.content && (
                    <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start message-item">
                <div className="bg-gray-50 border border-gray-200 text-gray-800 px-5 py-3 rounded-3xl rounded-tl-lg flex items-center gap-3 wizard-progress shadow-sm">
                  <Loader className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-base font-medium">Razmišljam...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 py-3 bg-red-50 text-red-700 text-sm border-t border-red-200">❌ {error}</div>
      )}

      {/* Input Form */}
      <div className="border-t border-gray-200 bg-white">
        {isProfileWizard && wizardStep < wizardQuestions.length && (
          <div className="px-5 pt-4 pb-2">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs font-semibold text-blue-700">
                Korak {wizardStep + 1} od {wizardQuestions.length}
              </p>
              <div className="h-1.5 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-1.5 bg-blue-600 rounded-full transition-all"
                  style={{ width: `${((wizardStep + 1) / wizardQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="p-5">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="rounded-xl h-20 w-20 object-cover border-2 border-blue-600"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={
                isProfileWizard
                  ? wizardQuestions[wizardStep]?.placeholder || 'Odgovori...'
                  : 'Napišite vašu poruku...'
              }
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-0 disabled:opacity-50 transition-all text-base font-medium"
              autoFocus
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-3 py-2.5 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-all flex items-center justify-center"
              title="Dodaj sliku"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={loading || (!input.trim() && !imagePreview)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-base shadow-md"
            >
              <Send className="w-5 h-5" />
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
              className="w-full mt-3 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition-all"
            >
              ✅ Završi Upitnik
            </button>
          )}
        </form>

        {/* Quick Actions (when no messages) */}
        {messages.length <= 1 && !isProfileWizard && (
          <div className="px-5 pb-4 space-y-2">
            <button
              onClick={() => {
                startProfileWizard()
              }}
              className="w-full px-4 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-all"
            >
              📋 Popunite profil
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
