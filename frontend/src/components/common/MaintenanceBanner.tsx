import React, { useState, useEffect } from 'react'
import { X, Shield, Wrench, CheckCircle2, AlertTriangle, BadgeCheck } from 'lucide-react'

const STORAGE_KEY = 'neon_maintenance_popup_seen'
const HIDE_FOR_MS = 24 * 60 * 60 * 1000 // 24h

function getShouldShow(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return true
    const seen = Number(raw)
    if (Number.isNaN(seen)) return true
    return Date.now() - seen > HIDE_FOR_MS
  } catch {
    return true
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {}
}

export default function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isEntered, setIsEntered] = useState(false)

  useEffect(() => {
    if (!getShouldShow()) return
    setIsVisible(true)
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsEntered(true))
    })
    return () => cancelAnimationFrame(t)
  }, [])

  const handleClose = (dontShowAgainToday = false) => {
    setIsEntered(false)
    setTimeout(() => {
      setIsVisible(false)
      if (dontShowAgainToday) setDismissed()
    }, 280)
  }

  if (!isVisible) return null

  return (
    <React.Fragment>
      <style>{`
        @keyframes maintenance-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes maintenance-modal-in {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes maintenance-shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .maintenance-backdrop {
          animation: maintenance-backdrop-in 0.35s ease-out forwards;
        }
        .maintenance-modal-enter {
          animation: maintenance-modal-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .maintenance-shine-border {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(59, 130, 246, 0.3),
            rgba(168, 85, 247, 0.4),
            rgba(59, 130, 246, 0.3),
            transparent
          );
          background-size: 200% 100%;
          animation: maintenance-shine 3s ease-in-out infinite;
        }
      `}</style>

      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-title"
      >
        {/* Backdrop — no blur on mobile for perf */}
        <div
          className={`maintenance-backdrop absolute inset-0 bg-black/75 md:bg-black/70 md:backdrop-blur-sm transition-opacity duration-300 ${isEntered ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => handleClose(false)}
          aria-hidden="true"
        />

        {/* Modal — content in flow so modal has height; shine as background layer */}
        <div
          className={`maintenance-modal-enter relative z-10 w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
            isEntered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Shine border (decorative, behind content) */}
          <div className="maintenance-shine-border absolute inset-0 rounded-2xl p-[1px] z-0" aria-hidden="true">
            <div className="absolute inset-[1px] rounded-[14px] bg-slate-900/95" />
          </div>
          {/* Content in flow so modal gets height and is visible */}
          <div className="relative z-10 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/98 border border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
                    <Wrench className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h1 id="maintenance-title" className="text-xl font-bold text-white">
                      Maintenance in Progress
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Poboljšavamo NeonConnect
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleClose(false)}
                  className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Zatvori"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Message from developer */}
            <div className="px-6 pb-4 space-y-4">
              <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-200">Na čemu trenutno radimo:</strong>
                  <br />
                  Sigurnosna ažuriranja, optimizacija performansi i nove funkcije (AI chat, preporuke poslova). Neke stranice mogu biti sporije ili kratko nedostupne.
                </p>
                <p className="text-slate-400 text-sm mt-3">
                  <strong className="text-slate-300">Očekivano:</strong> Radovi bi trebalo da se završe u narednih nekoliko dana. Poremećaji će biti kratki.
                </p>
              </div>

              {/* Do's and Don'ts — simple for users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    Možete slobodno
                  </div>
                  <ul className="text-slate-400 text-xs space-y-1">
                    <li>• Pregled poslova i prijave</li>
                    <li>• Izmena profila</li>
                    <li>• Pretraga i filteri</li>
                    <li>• Prijava i registracija</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    Bolje izbegavajte
                  </div>
                  <ul className="text-slate-400 text-xs space-y-1">
                    <li>• Duge sesije bez čuvanja</li>
                    <li>• Masovne prijave u vršno vreme</li>
                    <li>• Samo AI chat ako je spor</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Developer signature + verification */}
            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-300 font-medium">Nenad</span>
                <span className="text-slate-500">·</span>
                <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm">
                  <span>Neon Connect</span>
                  <BadgeCheck className="h-4 w-4 text-blue-400" aria-hidden />
                  <span className="text-xs text-blue-400/90">Verifikovan</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300 border border-indigo-500/30">
                  <Shield className="h-3.5 w-3.5" />
                  Developer
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={() => handleClose(true)}
                className="order-2 sm:order-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors text-sm font-medium"
              >
                Ne prikazuj danas ponovo
              </button>
              <button
                onClick={() => handleClose(false)}
                className="order-1 sm:order-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 transition-all text-sm font-medium shadow-lg shadow-purple-500/20"
              >
                U redu
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
