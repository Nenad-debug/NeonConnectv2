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

const CARD_WIDTH_DESKTOP = 448
const CARD_MIN_HEIGHT_DESKTOP = 280
const GAP_DESKTOP = 24
const MOBILE_GAP = 16
const MOBILE_CARD_MIN_HEIGHT = 200

type CardPosition = {
  left: string
  right?: string
  width?: string
  transform: string
  bottom?: string
  top?: string
  transition: string
}

function getCardPosition(highlight: { top: number; left: number; width: number; height: number } | null): CardPosition {
  if (typeof window === 'undefined') {
    return { left: '16px', right: '16px', width: 'auto', transform: 'none', bottom: `${MOBILE_GAP}px`, top: 'auto', transition: 'left 0.35s ease-out, top 0.35s ease-out, bottom 0.35s ease-out' }
  }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const isMobile = vw < 768
  const cardWidth = isMobile ? vw - MOBILE_GAP * 2 : CARD_WIDTH_DESKTOP
  const gap = isMobile ? MOBILE_GAP : GAP_DESKTOP
  const minHeight = isMobile ? MOBILE_CARD_MIN_HEIGHT : CARD_MIN_HEIGHT_DESKTOP
  const transition = 'left 0.35s ease-out, top 0.35s ease-out, bottom 0.35s ease-out'

  /* Mobile: card always at bottom, full width with side margins */
  if (isMobile) {
    return {
      left: `${gap}px`,
      right: `${gap}px`,
      width: 'auto',
      transform: 'none',
      bottom: `${gap}px`,
      top: 'auto',
      transition,
    }
  }

  /* Desktop: position around highlight */
  if (!highlight) {
    const left = Math.max(gap, (vw - cardWidth) / 2)
    return { left: `${left}px`, transform: 'none', bottom: `${gap}px`, top: 'auto', transition }
  }

  const spaceBelow = vh - (highlight.top + highlight.height + gap)
  const spaceRight = vw - (highlight.left + highlight.width + gap)
  const spaceLeft = highlight.left - gap

  if (spaceBelow >= minHeight) {
    const left = Math.max(gap, Math.min(highlight.left + highlight.width / 2 - cardWidth / 2, vw - cardWidth - gap))
    return { left: `${left}px`, transform: 'none', top: `${highlight.top + highlight.height + gap}px`, bottom: 'auto', transition }
  }
  if (spaceRight >= cardWidth) {
    const top = Math.max(gap, Math.min(highlight.top + highlight.height / 2 - minHeight / 2, vh - minHeight - gap))
    return { left: `${highlight.left + highlight.width + gap}px`, transform: 'none', top: `${top}px`, bottom: 'auto', transition }
  }
  if (spaceLeft >= cardWidth) {
    const top = Math.max(gap, Math.min(highlight.top + highlight.height / 2 - minHeight / 2, vh - minHeight - gap))
    return { left: `${Math.max(gap, highlight.left - cardWidth - gap)}px`, transform: 'none', top: `${top}px`, bottom: 'auto', transition }
  }
  const left = Math.max(gap, (vw - cardWidth) / 2)
  return { left: `${left}px`, transform: 'none', bottom: `${gap}px`, top: 'auto', transition }
}

// Clamp value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// Point on card rect closest to target (arrow starts here, on card edge)
function getArrowStartOnCard(
  card: { top: number; left: number; width: number; height: number },
  targetX: number,
  targetY: number
): { x: number; y: number } {
  const nearestX = clamp(targetX, card.left, card.left + card.width)
  const nearestY = clamp(targetY, card.top, card.top + card.height)
  return { x: nearestX, y: nearestY }
}

export default function AIGuidedTour({ isActive, userName, onComplete }: AIGuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightPosition, setHighlightPosition] = useState<any>(null)
  const [cardPosition, setCardPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
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

  // Track tour card position so arrow can start from it
  useEffect(() => {
    if (!isActive || !highlightPosition) {
      setCardPosition(null)
      return
    }
    const updateCardPosition = () => {
      const el = tourRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setCardPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
    }
    updateCardPosition()
    const rafId = requestAnimationFrame(updateCardPosition)
    const t = setTimeout(updateCardPosition, 100)
    window.addEventListener('resize', updateCardPosition)
    window.addEventListener('scroll', updateCardPosition, true)
    return () => {
      clearTimeout(t)
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateCardPosition)
      window.removeEventListener('scroll', updateCardPosition, true)
    }
  }, [isActive, currentStep, highlightPosition])

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
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 md:bg-black/70 md:backdrop-blur-sm">
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
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 md:bg-black/50 md:backdrop-blur">
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
    <div className="fixed inset-0 z-[110] bg-black/70 md:bg-black/60">
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

        @keyframes tour-arrow-draw {
          from { stroke-dashoffset: var(--arrow-length, 400); }
          to { stroke-dashoffset: 0; }
        }
        @keyframes tour-arrow-pulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.5)); }
          50% { opacity: 0.85; filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6)); }
        }
        .tour-arrow-line {
          stroke-dasharray: var(--arrow-length, 400);
          animation: tour-arrow-draw 0.6s ease-out forwards, tour-arrow-pulse 2s ease-in-out 0.6s infinite;
        }
        .tour-arrow-head {
          animation: tour-arrow-pulse 2s ease-in-out 0.6s infinite;
        }
      `}</style>

      {/* Overlay: full screen when no highlight; 4 strips (frame) when highlight so that area stays UNBLURRED */}
      {highlightPosition ? (
        <>
          <div className="fixed left-0 top-0 right-0 z-[100] bg-black/75 md:bg-black/70 md:backdrop-blur-sm" style={{ height: Math.max(0, highlightPosition.top) }} aria-hidden="true" />
          <div className="fixed left-0 right-0 z-[100] bg-black/75 md:bg-black/70 md:backdrop-blur-sm" style={{ top: highlightPosition.top, left: 0, width: highlightPosition.left, height: highlightPosition.height }} aria-hidden="true" />
          <div className="fixed right-0 z-[100] bg-black/75 md:bg-black/70 md:backdrop-blur-sm" style={{ top: highlightPosition.top, left: highlightPosition.left + highlightPosition.width, right: 0, height: highlightPosition.height }} aria-hidden="true" />
          <div className="fixed left-0 right-0 bottom-0 z-[100] bg-black/75 md:bg-black/70 md:backdrop-blur-sm" style={{ top: highlightPosition.top + highlightPosition.height }} aria-hidden="true" />
        </>
      ) : (
        <div className="fixed inset-0 z-[100] bg-black/75 md:bg-black/70 md:backdrop-blur-sm" aria-hidden="true" />
      )}

      {/* Highlight border around unblurred area */}
      {highlightPosition && (
        <>
          <div
            className="tour-highlight"
            style={{
              top: highlightPosition.top,
              left: highlightPosition.left,
              width: highlightPosition.width,
              height: highlightPosition.height,
            }}
          />
        </>
      )}

      {/* Arrow from tour card to highlight — hidden on mobile for clarity */}
      {highlightPosition && cardPosition && (
      <div className="hidden md:block fixed inset-0 z-[106] pointer-events-none" aria-hidden="true">
      {(() => {
        const targetX = highlightPosition.left + highlightPosition.width / 2
        const targetY = highlightPosition.top + highlightPosition.height / 2
        const start = getArrowStartOnCard(cardPosition, targetX, targetY)
        const dx = targetX - start.x
        const dy = targetY - start.y
        const angle = Math.atan2(dy, dx)
        const headSize = 14
        const headAngle = Math.PI / 6
        const tipX = targetX - headSize * Math.cos(angle)
        const tipY = targetY - headSize * Math.sin(angle)
        const h1x = tipX + headSize * Math.cos(angle - headAngle)
        const h1y = tipY + headSize * Math.sin(angle - headAngle)
        const h2x = tipX + headSize * Math.cos(angle + headAngle)
        const h2y = tipY + headSize * Math.sin(angle + headAngle)
        const lineEndX = tipX
        const lineEndY = tipY
        const lineLength = Math.sqrt((lineEndX - start.x) ** 2 + (lineEndY - start.y) ** 2)
        return (
          <svg
              width="100%"
              height="100%"
              style={{ position: 'absolute', left: 0, top: 0 }}
            >
              <defs>
                <linearGradient id="tourArrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <line
                x1={start.x}
                y1={start.y}
                x2={lineEndX}
                y2={lineEndY}
                stroke="url(#tourArrowGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                className="tour-arrow-line"
                style={{ '--arrow-length': lineLength } as React.CSSProperties}
              />
              <polygon
                points={`${targetX},${targetY} ${h1x},${h1y} ${h2x},${h2y}`}
                fill="url(#tourArrowGrad)"
                className="tour-arrow-head"
              />
            </svg>
        )
      })()}
      </div>
      )}

      {/* Tour card — responsive: full width at bottom on mobile, positioned on desktop */}
      <div
        ref={tourRef}
        className="tour-card fixed z-[110] w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-blue-500/30 shadow-2xl p-4 sm:p-6 md:p-8 overflow-y-auto"
        style={{
          ...cardStyle,
          maxHeight: 'min(65vh, 400px)',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
              {currentStep + 1}
            </div>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide min-w-0">
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-shrink-0 rounded-full transition-all ${
                    idx <= currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-2 sm:w-3'
                      : 'bg-slate-700 w-1.5 sm:w-2'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="flex-shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
            title="Preskoči tour"
            aria-label="Preskoči tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            {step.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {step.description}
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-700/50">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="flex-1 min-h-[44px] px-3 sm:px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-sm font-medium"
            >
              Nazad
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 min-h-[44px] px-3 sm:px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isLastStep ? 'Završi Tour' : 'Nastavi'}
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          </button>
        </div>

        {currentStep < tourSteps.length - 1 && (
          <button
            onClick={handleSkip}
            className="w-full mt-2 min-h-[44px] px-4 py-2.5 text-slate-400 hover:text-slate-300 text-sm transition-colors rounded-lg"
          >
            Preskoči sve
          </button>
        )}
      </div>

      {/* Floating AI indicator */}
      {currentStep === 0 && (
        <div className="fixed top-4 left-4 sm:top-8 sm:left-8 z-[110] flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-3 sm:p-4 md:backdrop-blur-sm">
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
