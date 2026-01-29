import { useEffect, useState } from 'react'
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'

interface SuccessAnimationProps {
  isVisible: boolean
  onComplete: () => void
  userName?: string
}

export default function SuccessAnimation({ isVisible, onComplete, userName }: SuccessAnimationProps) {
  const [stage, setStage] = useState<'initial' | 'confetti' | 'complete'>('initial')

  useEffect(() => {
    if (!isVisible) {
      setStage('initial')
      return
    }

    console.log('🎨 [SUCCESS ANIMATION] Starting animation...')

    // Stage 1: Show initial success with scale-in
    const timer1 = setTimeout(() => {
      console.log('✨ [SUCCESS ANIMATION] Stage 1 - Confetti')
      setStage('confetti')
    }, 800)

    // Stage 2: Show complete state after confetti has fallen
    const timer2 = setTimeout(() => {
      console.log('🎉 [SUCCESS ANIMATION] Stage 2 - Complete')
      setStage('complete')
    }, 3800)

    // Stage 3: Call onComplete after all animations finish
    const timer3 = setTimeout(() => {
      console.log('🚀 [SUCCESS ANIMATION] Triggering onComplete callback')
      onComplete()
    }, 4500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Background blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Animated background circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative">
        <style>{`
          @keyframes scaleIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes checkmark {
            0% { transform: scale(0) rotate(-45deg); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1) rotate(0deg); }
          }

          @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }

          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
          }

          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(147, 51, 234, 0.4); }
            50% { box-shadow: 0 0 60px rgba(59, 130, 246, 0.8), 0 0 120px rgba(147, 51, 234, 0.6); }
          }

          @keyframes float-up {
            0% { transform: translateY(0px); opacity: 1; }
            100% { transform: translateY(-30px); opacity: 0; }
          }

          .confetti {
            animation: confetti-fall 3s ease-in forwards;
          }

          .pulse-ring {
            animation: pulse-ring 0.6s ease-out;
          }

          .success-icon {
            animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .checkmark {
            animation: checkmark 0.6s ease-out 0.3s both;
          }

          .glow-effect {
            animation: glow-pulse 2s ease-in-out infinite;
          }

          .float-text {
            animation: float-up 2s ease-out forwards;
          }
        `}</style>

        {/* Confetti pieces */}
        {stage !== 'initial' && (
          <>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="confetti fixed w-2 h-2 pointer-events-none"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 100}%`,
                  top: `${50}%`,
                  background: ['#3b82f6', '#a855f7', '#ec4899', '#f59e0b'][i % 4],
                  animationDelay: `${Math.random() * 0.3}s`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                }}
              ></div>
            ))}
          </>
        )}

        {/* Main success card */}
        <div
          className="relative w-96 success-icon"
          style={{
            animation: stage !== 'initial' ? '' : 'scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-60 animate-pulse"></div>

          {/* Pulse rings */}
          {stage === 'confetti' && (
            <>
              <div className="absolute -inset-6 border-2 border-blue-500/30 rounded-full pulse-ring"></div>
              <div className="absolute -inset-4 border-2 border-purple-500/20 rounded-full pulse-ring" style={{ animationDelay: '0.2s' }}></div>
            </>
          )}

          {/* Main card */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 border border-blue-500/40 backdrop-blur-xl text-center space-y-6">
            {/* Icon container */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Background circle */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75"></div>

                {/* Icon */}
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center glow-effect">
                  {stage === 'initial' ? (
                    <Sparkles className="w-12 h-12 text-white animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-12 h-12 text-white checkmark" />
                  )}
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-2">
              {stage === 'initial' ? (
                <>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Profil Gotov! 🎉
                  </h2>
                  <p className="text-slate-300 text-lg">
                    {userName ? `Bravo, ${userName}!` : 'Bravo!'} Tvoj profil je uspešno kreiiran.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    Gotovo! ✨
                  </h2>
                  <p className="text-slate-300 text-lg">
                    Spremam te za pregled specijalnih poslova...
                  </p>
                  <p className="text-slate-400 text-sm">
                    Prosleđujem te na AI Guided Tour
                  </p>
                </>
              )}
            </div>

            {/* Floating elements */}
            {stage === 'confetti' && (
              <>
                <div className="float-text absolute top-12 left-12 text-3xl">✨</div>
                <div className="float-text absolute top-16 right-16 text-3xl" style={{ animationDelay: '0.3s' }}>🚀</div>
                <div className="float-text absolute bottom-16 left-20 text-3xl" style={{ animationDelay: '0.6s' }}>💼</div>
              </>
            )}

            {/* Progress indicator */}
            {stage === 'complete' && (
              <div className="flex items-center justify-center gap-2 text-purple-400 pt-4">
                <span className="text-sm font-medium">Učitavam tour...</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            {/* Optional: Call to action */}
            {stage === 'complete' && (
              <div className="flex items-center justify-center gap-2 text-blue-400 text-sm animate-pulse pt-2">
                <span>Klikni bilo gde da nastaviš</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click to continue overlay */}
      {stage === 'complete' && (
        <div className="fixed inset-0 z-40 cursor-pointer" onClick={onComplete}></div>
      )}
    </div>
  )
}
