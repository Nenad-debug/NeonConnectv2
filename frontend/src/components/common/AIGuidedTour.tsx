import { useState, useEffect, useRef } from 'react'
import { ChevronRight, X } from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  target?: string // Selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right'
  actionText?: string
}

interface AIGuidedTourProps {
  isActive: boolean
  userName?: string
  onComplete: () => void
}

const getTourSteps = (userName?: string): TourStep[] => [
  {
    id: 'welcome',
    title: '🎯 Dobrodošao na NeonConnect!',
    description: `Zdravo${userName ? `, ${userName}` : ''}! 👋

Tvoj profil je gotov! 🎉

Sada ću te voditi kroz glavne funkcionalnosti i pokazati ti kako da nađeš savršen posao.

Klikni "Nastavi" da počneš tour.`,
    position: 'bottom',
  },
  {
    id: 'dashboard-jobs',
    title: '💼 Preporučeni Poslovi',
    description: `Evo liste poslova koji su idealni za tebe!

Naš AI sistem je analizirao tvoj profil i pronašao najbolje opcije na osnovu:
✓ Tvojih vština
✓ Iskustva
✓ Željene lokacije

Klikni na bilo koji posao da vidis detalje.`,
    target: '[data-tour-jobs]',
    position: 'bottom',
  },
  {
    id: 'save-jobs',
    title: '❤️ Sačuvaj Poslove',
    description: `Vidiš li srce ikonicu na svakom oglasu?

Klikni je da sačuvaš posao za kasnije. Svi sačuvani poslovi se nalaze u "Sačuvano" sekciji - jednostavno!`,
    target: '[data-tour-save]',
    position: 'left',
  },
  {
    id: 'apply',
    title: '🚀 Primeni za Posao',
    description: `Pronašao si posao koji te zanima?

Klikni "Primeni" dugme i tvoj profil će biti automatski poslat kompaniji.

**Saveti za bolju aplikaciju:**
- Preiči oglasa pre nego što prijaviš
- Prilagodi cover letter ako je potreban
- Budi iskren u svom profilu`,
    target: '[data-tour-apply]',
    position: 'left',
  },
  {
    id: 'filter-search',
    title: '🔍 Filtriranje i Pretraga',
    description: `Trebaju ti specifični poslovi?

Koristi filter opcije na stranici "Poslovi":
- 📍 Po lokaciji
- 💰 Po plati
- 🏢 Po tipu (full-time, freelance, itd.)
- 🏷️ Po kategoriji

Tabovi ovde (Pregled / Aplikacije / Sačuvano) i dugme "Pretraži poslove" vode ka pretrazi.`,
    target: '[data-tour-filter]',
    position: 'bottom',
  },
  {
    id: 'profile-settings',
    title: '👤 Tvoj Profil',
    description: `Klikni na ikonu profila gore desno da:

✏️ Urediš sve podatke
👁️ Vidiš kako drugi vide tvoj profil
⚙️ Promeniš postavke
📋 Vidiš svu elektronsku korespondenciju`,
    target: '[data-tour-profile]',
    position: 'left',
  },
  {
    id: 'notifications',
    title: '🔔 Obaveštenja',
    description: `Ne propusti važne obaveštenja!

Ovde ćeš videti:
📬 Poruke od kompanija
✅ Ažuriranja o tvojim aplikacijama
💌 Pozivanja na intervjue
⚡ Nove preporučene poslove`,
    target: '[data-tour-notifications]',
    position: 'left',
  },
  {
    id: 'ai-chat',
    title: '🤖 AI Asistent',
    description: `Dugme dolje desno (sa ✨ ikonom) je AI asistent – otvara chat gde možeš da pitaš bilo šta o platformi, poslovima, profilu ili prijavi.

Šta može:
❓ Odgovori na pitanja o NeonConnect-u
💡 Saveti za pretragu i prijavu
📝 Pomoć oko biografije i cover letter-a
🎯 Vodim te kroz korake

Klikni na njega kad god ti zatreba pomoć.`,
    target: '[data-tour-ai]',
    position: 'left',
  },
  {
    id: 'success',
    title: '✨ Spreman/a!',
    description: `Sada znaš sve što ti treba da počneš! 🎯

**Sledeći koraci:**
1. Pretraži poslove koji te zanimaju
2. Sačuvaj one koji ti se dopadaju
3. Primeni za najbolje opcije
4. Čekaj odgovore od kompanija
5. Postavi pitanja AI asistjentu kad god trebaš

Srećan/a u potrazi za poslom! 🚀`,
    position: 'top',
  },
]

const CARD_WIDTH = 448
const CARD_MIN_HEIGHT = 280
const GAP = 24

function getCardPosition(highlight: { top: number; left: number; width: number; height: number } | null): { left: string; transform: string; bottom?: string; top?: string; transition: string } {
  if (typeof window === 'undefined') {
    return { left: '50%', transform: 'translateX(-50%)', bottom: GAP, top: 'auto', transition: 'left 0.35s ease-out, top 0.35s ease-out, bottom 0.35s ease-out' }
  }
  const vw = window.innerWidth
  const vh = window.innerHeight

  if (!highlight) {
    const left = Math.max(GAP, (vw - CARD_WIDTH) / 2)
    return { left: `${left}px`, transform: 'none', bottom: `${GAP}px`, top: 'auto', transition: 'left 0.35s ease-out, top 0.35s ease-out, bottom 0.35s ease-out' }
  }

  const spaceBelow = vh - (highlight.top + highlight.height + GAP)
  const spaceRight = vw - (highlight.left + highlight.width + GAP)
  const spaceLeft = highlight.left - GAP
  const spaceAbove = highlight.top - GAP

  if (spaceBelow >= CARD_MIN_HEIGHT) {
    const left = Math.max(GAP, Math.min(highlight.left + highlight.width / 2 - CARD_WIDTH / 2, vw - CARD_WIDTH - GAP))
    return { left: `${left}px`, transform: 'none', top: `${highlight.top + highlight.height + GAP}px`, bottom: 'auto', transition: 'left 0.35s ease-out, top 0.35s ease-out, bottom 0.35s ease-out' }
  }
  if (spaceRight >= CARD_WIDTH) {
    const top = Math.max(GAP, Math.min(highlight.top + highlight.height / 2 - CARD_MIN_HEIGHT / 2, vh - CARD_MIN_HEIGHT - GAP))
    return { left: `${highlight.left + highlight.width + GAP}px`, transform: 'none', top: `${top}px`, bottom: 'auto', transition: 'left 0.35s ease-out, top 0.35s ease-out, bottom 0.35s ease-out' }
  }
  if (spaceLeft >= CARD_WIDTH) {
    const top = Math.max(GAP, Math.min(highlight.top + highlight.height / 2 - CARD_MIN_HEIGHT / 2, vh - CARD_MIN_HEIGHT - GAP))
    return { left: `${Math.max(GAP, highlight.left - CARD_WIDTH - GAP)}px`, transform: 'none', top: `${top}px`, bottom: 'auto', transition: 'left 0.35s ease-out, top 0.35s ease-out, bottom 0.35s ease-out' }
  }
  const left = Math.max(GAP, (vw - CARD_WIDTH) / 2)
  return { left: `${left}px`, transform: 'none', bottom: `${GAP}px`, top: 'auto', transition: 'left 0.35s ease-out, top 0.35s ease-out, bottom 0.35s ease-out' }
}

export default function AIGuidedTour({ isActive, userName, onComplete }: AIGuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightPosition, setHighlightPosition] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const tourRef = useRef<HTMLDivElement>(null)
  const tourSteps = getTourSteps(userName)

  const cardStyle = getCardPosition(highlightPosition)

  const updateHighlightPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    setHighlightPosition({
      top: rect.top - 8,
      left: rect.left - 8,
      width: rect.width + 16,
      height: rect.height + 16,
    })
  }

  useEffect(() => {
    if (!isActive) return
    try {
      const step = tourSteps[currentStep]
      if (!step?.target) {
        setHighlightPosition(null)
        return
      }
      const element = document.querySelector(step.target) as HTMLElement
      if (!element) {
        setHighlightPosition(null)
        return
      }
      const handler = () => updateHighlightPosition(element)
      updateHighlightPosition(element)
      window.addEventListener('resize', handler)
      window.addEventListener('scroll', handler, true)
      const rafId = requestAnimationFrame(() => updateHighlightPosition(element))
      return () => {
        window.removeEventListener('resize', handler)
        window.removeEventListener('scroll', handler, true)
        cancelAnimationFrame(rafId)
      }
    } catch (err: any) {
      console.error('❌ [AI TOUR] Error:', err)
      setError(err?.message || 'Tour error')
    }
  }, [isActive, currentStep])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      console.log('⬜️ [AI TOUR] Moving to next step:', currentStep + 1)
      setCurrentStep(currentStep + 1)
    } else {
      console.log('✅ [AI TOUR] Tour completed, calling onComplete')
      onComplete()
    }
  }

  const handleSkip = () => {
    console.log('⏭️ [AI TOUR] Tour skipped')
    onComplete()
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      console.log('⬅️ [AI TOUR] Moving to previous step:', currentStep - 1)
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isActive) return null

  const step = tourSteps[currentStep]
  const isLastStep = currentStep === tourSteps.length - 1

  // Guard: avoid white screen if step is missing
  if (!step) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md text-center">
          <p className="text-slate-200 mb-4">Tour je spreman.</p>
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Nastavi
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur">
        <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 max-w-md">
          <p className="text-red-400 mb-4">Došlo je do greške pri učitavanju tour-a</p>
          <button
            onClick={onComplete}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Zatvori
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/60">
      <style>{`
        @keyframes pulse-highlight {
          0%, 100% { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4), 0 0 0 8px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.6), 0 0 0 12px rgba(147, 51, 234, 0.3); }
        }

        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        .tour-highlight {
          position: fixed;
          border: 2px solid transparent;
          border-radius: 12px;
          pointer-events: none;
          animation: pulse-highlight 2s ease-in-out infinite;
          z-index: 105;
        }

        .tour-backdrop {
          animation: fadeInOut 3s ease-in-out infinite;
        }

        .tour-card {
          /* position/transition set inline for smooth move when step changes */
        }

        .tour-pointer {
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #3b82f6, #a855f7);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Overlay: full screen when no highlight; 4 strips (frame) when highlight so that area stays UNBLURRED */}
      {highlightPosition ? (
        <>
          <div className="fixed left-0 top-0 right-0 z-[100] bg-black/70 backdrop-blur-sm" style={{ height: Math.max(0, highlightPosition.top) }} aria-hidden="true" />
          <div className="fixed left-0 right-0 z-[100] bg-black/70 backdrop-blur-sm" style={{ top: highlightPosition.top, left: 0, width: highlightPosition.left, height: highlightPosition.height }} aria-hidden="true" />
          <div className="fixed right-0 z-[100] bg-black/70 backdrop-blur-sm" style={{ top: highlightPosition.top, left: highlightPosition.left + highlightPosition.width, right: 0, height: highlightPosition.height }} aria-hidden="true" />
          <div className="fixed left-0 right-0 bottom-0 z-[100] bg-black/70 backdrop-blur-sm" style={{ top: highlightPosition.top + highlightPosition.height }} aria-hidden="true" />
        </>
      ) : (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      )}

      {/* Highlight border around unblurred area */}
      {highlightPosition && (
        <div
          className="tour-highlight"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
          }}
        />
      )}

      {/* Tour card - positioned so it doesn't cover highlight; smooth transition when step changes */}
      <div
        ref={tourRef}
        className="tour-card fixed z-[110] w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-blue-500/30 shadow-2xl p-8"
        style={{
          ...cardStyle,
          maxHeight: '50vh',
          overflowY: 'auto',
        }}
      >
        {/* Header with step indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {currentStep + 1}
            </div>
            <div className="flex gap-1">
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx <= currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-3'
                      : 'bg-slate-700 w-2'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Preskoči tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {step.title}
          </h2>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
            {step.description}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-700/50">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-sm font-medium"
            >
              Nazad
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium flex items-center justify-center gap-2"
          >
            {isLastStep ? 'Završi Tour' : 'Nastavi'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Skip button */}
        {currentStep < tourSteps.length - 1 && (
          <button
            onClick={handleSkip}
            className="w-full mt-2 px-4 py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            Preskoči sve
          </button>
        )}
      </div>

      {/* Floating AI indicator */}
      {currentStep === 0 && (
        <div className="fixed top-8 left-8 z-[110] flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="tour-pointer"></div>
          <div>
            <p className="text-sm font-semibold text-blue-300">Tour vođen od AI asistenta</p>
            <p className="text-xs text-slate-400">Nauči kako da koristiš platformu</p>
          </div>
        </div>
      )}
    </div>
  )
}
