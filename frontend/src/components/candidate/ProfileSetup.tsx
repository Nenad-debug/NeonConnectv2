import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../services/supabaseClient'
import { convertCyrillicToLatin } from '../../utils/cyrillic'

const WIZARD_QUESTIONS = [
  { title: 'Kako se zoveš?', fields: ['first_name'], placeholder: 'Unesi svoje puno ime', instruction: 'Iz odgovora izvuci samo ime i prezime.' },
  { title: 'Koja je tvoja trenutna pozicija/zanimanje?', fields: ['current_position'], placeholder: 'npr. Frontend Developer, UI/UX Designer', instruction: 'Iz odgovora izvuci samo poziciju.' },
  { title: 'Koliko godina iskustva imas?', fields: ['years_experience'], placeholder: 'npr. 5 godina', instruction: 'Iz odgovora izvuci samo broj godina.' },
  { title: 'Naprati kratku biografiju (ko si i sta volis da radis)', fields: ['bio'], placeholder: 'npr. Ja sam frontend developer sa 3 godine iskustva...', instruction: 'Iz odgovora izvuci biografiju (150-250 reci).' },
  { title: 'Koje su tvoje kljucne vestine?', fields: ['skills'], placeholder: 'npr. React, TypeScript, Node.js, PostgreSQL', instruction: 'Iz odgovora izvuci vestine kao niz (odvojene zarezima). Spremi kao JSON array: ["skill1", "skill2"]' },
  { title: 'Koje je tvoje najmanje obrazovanje?', fields: ['education'], placeholder: 'npr. Fakultet za informatiku', instruction: 'Iz odgovora izvuci samo naziv obrazovanja.' },
  { title: 'U kojoj lokaciji trazis posao?', fields: ['location'], placeholder: 'npr. Beograd, Srbija', instruction: 'Iz odgovora izvuci samo lokaciju.' },
  { title: 'Koja je tvoja ocekivana plata (mesecno)?', fields: ['expected_salary'], placeholder: 'npr. 1500 EUR', instruction: 'Iz odgovora izvuci samo broj i valutu.' },
]

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeWizard = () => {
    const greeting = `🚀 Pokrenut AI Profil Wizard!

Zdravo${user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}! 👋 

${WIZARD_QUESTIONS.length} pitanja i tvoj profil ce biti spreman! Odgovori iskreno i detaljno - koristicese za pronalazenje savrsenih poslova za tebe.

**Pocnimo! 🎯**

${WIZARD_QUESTIONS[0].title}`

    setMessages([{ role: 'assistant', content: greeting }])
    setWizardStep(0)
  }

  useEffect(() => {
    console.log('📱 [PROFILE SETUP] isOpen changed:', isOpen)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && user && messages.length === 0) {
      initializeWizard()
    }
  }, [isOpen, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!isOpen || !user) {
    return null
  }

  const wizardQuestions = WIZARD_QUESTIONS

  const handleSkipWizard = async () => {
    if (isCompleting) return
    setIsCompleting(true)
    try {
      await onComplete({
        first_name: user?.user_metadata?.full_name?.split(' ')[0] || 'Korisnik',
        last_name: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        bio: '',
        skills: [],
        current_position: '',
        years_experience: '',
        education: '',
        location: '',
        expected_salary: '',
      })
    } catch (err) {
      console.error('Skip wizard error:', err)
    } finally {
      setIsCompleting(false)
    }
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
        const extractionPrompt = `TASK: Validiraj odgovor korisnika na pitanje.

QUESTION: "${currentQuestion.title}"
USER ANSWER: "${userMessage}"

VALIDATION RULES:
1. Je li odgovor RELEVANTAN za ovo pitanje?
2. Ako NIJE relevantno: Odgovori sa "REJECT: [objasnjenje zasto nije relevantno, PONOVI pitanje]"
3. Ako JESTE relevantno: Primeni zadatak ispod

IF RELEVANT, APPLY THIS:
${currentQuestion.instruction}

OUTPUT FORMAT:
- Ako ODBIJAŠ: REJECT: [kratko objasnjenje + ponavljanje pitanja]
- Ako PRIHVATAŠ: ACCEPT: [samo ekstraktovana vrednost bez dodatnog teksta]

VAŽNO:
- Za REJECT: budi ljubazan i ponovi tačno ovo pitanje: "${currentQuestion.title}"
- Za ACCEPT: vrati SAMO ekstraktovanu vrednost, bez "Tvoj odgovor je..." i sličnog
- Koristi EKAVICU i LATINICU (bez ć, č, š, ž, đ)
- Za biografiju: ekstraktuj samo suštinu (100-150 reči)
- Za veštine: vrati kao JSON array ["skill1", "skill2"]`

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
        let aiResponse = data.response || userMessage
        
        // Ensure ekavica and latin characters using helper function
        aiResponse = convertCyrillicToLatin(aiResponse)

        // Check if AI rejected or accepted the answer based on structured response
        const trimmedResponse = aiResponse.trim()
        const isRejection = trimmedResponse.toUpperCase().startsWith('REJECT:')
        const isAcceptance = trimmedResponse.toUpperCase().startsWith('ACCEPT:')

        if (isRejection) {
          // AI rejected the answer, extract rejection message
          const rejectionMsg = trimmedResponse.substring(7).trim() // Remove "REJECT:" prefix
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: rejectionMsg,
            },
          ])
          // Don't advance to next question - user stays on same question
        } else if (isAcceptance) {
          // AI accepted the answer, extract the extracted data
          let extractedData = trimmedResponse.substring(7).trim() // Remove "ACCEPT:" prefix
          
          // Ensure ekavica and latin characters using helper function
          extractedData = convertCyrillicToLatin(extractedData)

          // Save extracted data
          const newProfileData = {
            ...profileData,
            [fields[0]]: extractedData,
          }
          setProfileData(newProfileData)

          // Show confirmation with animation
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `✅ Spreo/la! Tvoj odgovor je sacuvan.\n\n${
                wizardStep < wizardQuestions.length - 1
                  ? `Sledece pitanje:\n\n${wizardQuestions[wizardStep + 1].title}`
                  : `🎉 Svi podaci su prikupljeni! Cuva se tvoj profil...`
              }`,
            },
          ])

          if (wizardStep < wizardQuestions.length - 1) {
            setWizardStep(wizardStep + 1)
          } else {
            // Save profile to database
            saveProfile(newProfileData)
          }
        } else {
          // Fallback: if response doesn't start with REJECT: or ACCEPT:, treat as acceptance
          // This handles cases where AI doesn't follow format strictly
          const newProfileData = {
            ...profileData,
            [fields[0]]: trimmedResponse,
          }
          setProfileData(newProfileData)

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `✅ Spreo/la! Tvoj odgovor je sacuvan.\n\n${
                wizardStep < wizardQuestions.length - 1
                  ? `Sledece pitanje:\n\n${wizardQuestions[wizardStep + 1].title}`
                  : `🎉 Svi podaci su prikupljeni! Cuva se tvoj profil...`
              }`,
            },
          ])

          if (wizardStep < wizardQuestions.length - 1) {
            setWizardStep(wizardStep + 1)
          } else {
            saveProfile(newProfileData)
          }
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Greska: ${(err as any).message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (data: Record<string, any>) => {
    try {
      setIsCompleting(true)
      console.log('💾 [PROFILE SETUP] Starting to save profile...', data)

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
      console.log('📝 [PROFILE SETUP] Updating Supabase profile...')
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

      console.log('✅ [PROFILE SETUP] Profile saved to Supabase')

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `🎊 Bravo! Tvoj profil je uspesno sacuvan!

📝 **Sacuvani podaci:**
👤 Ime: ${firstName} ${lastName}
💼 Pozicija: ${data.current_position || 'Nije navedeno'}
⏱️ Iskustvo: ${data.years_experience || 'Nije navedeno'}
📄 Biografija: ${data.bio || 'Nije navedeno'}
🛠️ Vestine: ${Array.isArray(skills) ? skills.join(', ') : skills || 'Nije navedeno'}
🎓 Obrazovanje: ${data.education || 'Nije navedeno'}
📍 Lokacija: ${data.location || 'Nije navedeno'}
💰 Ocekivana plata: ${data.expected_salary || 'Nije navedeno'}

Sada mozes da trazis poslove! 🚀`,
        },
      ])

      // Pozovi onComplete nakon 2s da se pokrene success animation
      console.log('⏱️ [PROFILE SETUP] Scheduling onComplete callback in 2s...')
      setTimeout(async () => {
        console.log('🎯 [PROFILE SETUP] Calling onComplete callback...')
        try {
          await onComplete({
            first_name: firstName,
            last_name: lastName,
            bio: data.bio,
            skills: skills,
            current_position: data.current_position,
            years_experience: data.years_experience,
            education: data.education,
            location: data.location,
            expected_salary: data.expected_salary,
          })
          console.log('✅ [PROFILE SETUP] onComplete callback completed successfully')
        } catch (err: any) {
          console.error('❌ [PROFILE SETUP] onComplete callback failed:', err)
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `Greska pri finalizaciji profila: ${err.message}`,
            },
          ])
        }
      }, 2000)
    } catch (err: any) {
      console.error('❌ [PROFILE SETUP] Save error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Greska pri cuvanju: ${err.message}`,
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
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/95 rounded-3xl p-8 space-y-6 flex flex-col h-full border border-blue-500/30 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Profil Wizard
                </h2>
                <p className="text-xs text-slate-400">AI ce te voditi kroz postavljanje profila</p>
              </div>
              <button
                type="button"
                onClick={handleSkipWizard}
                disabled={isCompleting}
                className="ml-auto px-3 py-1.5 rounded-lg border border-amber-500/50 text-amber-400/90 text-xs font-medium hover:bg-amber-500/10 disabled:opacity-50 transition-colors"
                title="Preskoči wizard (privremeno za develop)"
              >
                Skip (dev)
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {wizardStep < wizardQuestions.length && !isCompleting && (
            <div className="space-y-2 flex-shrink-0">
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

          {/* Messages Container - Flexible */}
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
                  <span className="text-sm">AI razmislja...</span>
                </div>
              </div>
            )}

            {isCompleting && (
              <div className="flex justify-start wizard-message">
                <div className="bg-slate-800/80 border border-slate-700/50 text-slate-200 px-5 py-3 rounded-2xl rounded-bl-none flex items-center gap-3">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Cuva se tvoj profil...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form - Always Visible and Sticky */}
          <form onSubmit={handleSendMessage} className="space-y-3 border-t border-slate-700/50 pt-4 flex-shrink-0">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || isCompleting || wizardStep >= wizardQuestions.length}
                placeholder={wizardStep < wizardQuestions.length ? "Napisi svoj odgovor..." : "Wizard zavrsen..."}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || isCompleting || !input.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 flex-shrink-0"
              >
                {isCompleting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Cuva...
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
