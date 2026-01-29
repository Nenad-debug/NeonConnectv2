import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../services/supabaseClient'

interface ProfileSetupProps {
  onComplete: (profileData: any) => Promise<void>
  isOpen: boolean
  user?: any
}

export default function ProfileSetup({ onComplete, isOpen, user }: ProfileSetupProps) {
  const [wizardStep, setWizardStep] = useState(0)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [profileData, setProfileData] = useState<Record<string, any>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !user) return null

  const wizardQuestions = [
    {
      title: 'Kako se zoveš?',
      fields: ['first_name'],
      placeholder: 'Unesi svoje puno ime',
      instruction: 'Iz odgovora izvuci samo ime i prezime.',
    },
    {
      title: 'Naprati kratku biografiju (ko si i šta voliš da radiš)',
      fields: ['bio'],
      placeholder: 'npr. Ja sam frontend developer sa 3 godine iskustva...',
      instruction: 'Iz odgovora izvuci biografiju (100-200 reči).',
    },
    {
      title: 'Navedи svoje ključne vještine (odvojene zarezima)',
      fields: ['skills'],
      placeholder: 'npr. React, TypeScript, Node.js, PostgreSQL',
      instruction: 'Iz odgovora izvuci vještine kao niz (odvojene zarezima). Spremi kao JSON array: ["skill1", "skill2"]',
    },
  ]

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeWizard()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeWizard = () => {
    const greeting = `🚀 Pokrenut AI Profil Wizard!

Zdravo${user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}! 👋 

Samo 3 pitanja i tvoj profil će biti spreman! Odgovori iskreno i detaljno - koristiće se za pronalaženje savršenih poslova za tebe.

**Počnimo! 🎯**

${wizardQuestions[0].title}`

    setMessages([{ role: 'assistant', content: greeting }])
    setWizardStep(0)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      setLoading(true)

      if (wizardStep < wizardQuestions.length) {
        const currentQuestion = wizardQuestions[wizardStep]
        const fields = currentQuestion.fields

        // Use AI to extract data from user's answer
        const extractionPrompt = `Korisnik je odgovorio: "${userMessage}"
        
${currentQuestion.instruction}

Vrati SAMO ekstrakovan odgovor bez dodatnog objašnjenja.`

        const response = await fetch('/.netlify/functions/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: extractionPrompt,
            context: 'profile_setup',
            previousMessages: messages,
          }),
        })

        const data = await response.json()
        const aiResponse = data.response || userMessage

        // Save extracted data
        const newProfileData = {
          ...profileData,
          [fields[0]]: aiResponse,
        }
        setProfileData(newProfileData)

        // Show confirmation with animation
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `✅ Spreo/la! Tvoj odgovor je: "${aiResponse}"\n\n${
              wizardStep < wizardQuestions.length - 1
                ? `Sledеće pitanje:\n\n${wizardQuestions[wizardStep + 1].title}`
                : `🎉 Svi podaci su prikupljeni! Čuvam tvoj profil...`
            }`,
          },
        ])

        if (wizardStep < wizardQuestions.length - 1) {
          setWizardStep(wizardStep + 1)
        } else {
          // Save profile to database
          saveProfile(newProfileData)
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Greška: ${(err as any).message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (data: Record<string, any>) => {
    try {
      setIsCompleting(true)

      // Parse skills if needed
      let skills = data.skills || []
      if (typeof skills === 'string') {
        // Try to extract array from string
        const arrayMatch = skills.match(/\[.*\]/)
        if (arrayMatch) {
          skills = JSON.parse(arrayMatch[0])
        } else {
          // Split by comma
          skills = skills.split(',').map((s: string) => s.trim())
        }
      }

      // Parse first and last name
      const nameParts = (data.first_name || '').split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Update profile
      const { error } = await supabase
        .from('candidate_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          bio: data.bio || '',
          skills: skills,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `🎊 Bravo! Tvoj profil je uspešno sačuvan!

📝 **Sačuvani podaci:**
👤 Ime: ${firstName} ${lastName}
📄 Biografija: ${data.bio}
🛠️ Vještine: ${Array.isArray(skills) ? skills.join(', ') : skills}

Sada možeš da tražiš poslove! 🚀`,
        },
      ])

      setTimeout(() => {
        onComplete({
          first_name: firstName,
          last_name: lastName,
          bio: data.bio,
          skills: skills,
        })
      }, 2000)
    } catch (err: any) {
      console.error('Save error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Greška pri čuvanju: ${err.message}`,
        },
      ])
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes slide-up-wizard {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes message-slide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .wizard-modal {
          animation: slide-up-wizard 0.4s ease-out;
        }
        .wizard-message {
          animation: message-slide 0.3s ease-out;
        }
        @keyframes pulse-dots {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pulse-loading {
          animation: pulse-dots 1.4s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col wizard-modal">
        {/* Gradient Border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-lg opacity-75"></div>

        {/* Modal Content */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/95 rounded-3xl p-8 space-y-6 flex flex-col h-full border border-blue-500/30 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Profil Wizard
                </h2>
                <p className="text-xs text-slate-400">AI će te vodit kroz postavljanje profila</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {wizardStep < wizardQuestions.length && !isCompleting && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-400 font-semibold">Pitanje {wizardStep + 1} od {wizardQuestions.length}</span>
                <span className="text-slate-400">{Math.round(((wizardStep + 1) / wizardQuestions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${((wizardStep + 1) / wizardQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} wizard-message`}>
                <div
                  className={`max-w-sm px-5 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
                      : 'bg-slate-800/80 text-slate-100 rounded-bl-none border border-slate-700/50'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start wizard-message">
                <div className="bg-slate-800/80 border border-slate-700/50 text-slate-200 px-5 py-3 rounded-2xl rounded-bl-none flex items-center gap-3">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 pulse-loading" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 pulse-loading" style={{ animationDelay: '0.3s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 pulse-loading" style={{ animationDelay: '0.6s' }}></span>
                  </span>
                  <span className="text-sm">AI razmišlja...</span>
                </div>
              </div>
            )}

            {isCompleting && (
              <div className="flex justify-start wizard-message">
                <div className="bg-slate-800/80 border border-slate-700/50 text-slate-200 px-5 py-3 rounded-2xl rounded-bl-none flex items-center gap-3">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Čuvam tvoj profil...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="space-y-3 border-t border-slate-700/50 pt-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || isCompleting || wizardStep >= wizardQuestions.length}
                placeholder={wizardStep < wizardQuestions.length ? "Napiši svoj odgovor..." : "Wizard završen..."}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || isCompleting || !input.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isCompleting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Čuvam...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Dalje
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
