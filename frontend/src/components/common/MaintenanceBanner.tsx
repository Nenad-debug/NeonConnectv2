import React, { useState, useEffect } from 'react'
import { X, BadgeCheck, Shield } from 'lucide-react'

const STORAGE_KEY = 'neon_maintenance_popup_seen'
const HIDE_FOR_MS = 24 * 60 * 60 * 1000 // 24h
// Slika: frontend/public/ — imena: developer-avatar.jpg, developer-avatar.png ili developer-avatar.jpg.png
const AVATAR_CANDIDATES = ['/developer-avatar.jpg', '/developer-avatar.png', '/developer-avatar.jpg.png']

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
  const [avatarIndex, setAvatarIndex] = useState(0)
  const avatarSrc = AVATAR_CANDIDATES[avatarIndex] ?? AVATAR_CANDIDATES[0]
  const avatarFailed = avatarIndex >= AVATAR_CANDIDATES.length
  const handleAvatarError = () => {
    setAvatarIndex((i) => (i + 1 < AVATAR_CANDIDATES.length ? i + 1 : AVATAR_CANDIDATES.length))
  }

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
        @keyframes maintenance-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .maintenance-backdrop { animation: maintenance-fade 0.25s ease-out forwards; }
        .maintenance-modal-enter { animation: maintenance-fade 0.3s ease-out forwards; }
      `}</style>

      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-title"
      >
        <div
          className={`maintenance-backdrop absolute inset-0 bg-slate-900/80 transition-opacity duration-200 ${isEntered ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => handleClose(false)}
          aria-hidden="true"
        />

        <div
          className={`maintenance-modal-enter relative z-10 w-full max-w-xl overflow-hidden rounded-xl bg-slate-900 border border-slate-700/50 shadow-xl transition-opacity duration-200 ${
            isEntered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Header — minimal */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-500/30">
                Maintenance
              </span>
              <span className="text-sm text-slate-400">u toku</span>
            </div>
            <button
              onClick={() => handleClose(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Zatvori"
              aria-label="Zatvori"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Poruka od developera — kao stvarna poruka */}
          <div className="px-6 py-5">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                Zdravo,
              </p>
              <p className="text-slate-200 text-sm leading-relaxed mt-2">
                Trenutno radimo na sigurnosnim ažuriranjima i optimizaciji platforme. U narednih nekoliko dana moguće su kraće prekide u radu ili sporiji odziv pojedinih stranica. Radove ćemo držati što kraće.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed mt-3">
                Možete normalno koristiti sajt — pregled poslova, prijave i izmenu profila. Ako nešto ne radi kako treba, osvežite stranicu ili nas kontaktirajte.
              </p>
              <p className="text-slate-300 text-sm mt-4">
                Hvala na strpljenju,
              </p>
            </div>

            {/* Developer — slika + ime + verifikacije */}
            <div className="mt-4 flex items-center gap-4">
              <div className="relative flex-shrink-0 h-14 w-14">
                {!avatarFailed ? (
                  <img
                    key={avatarSrc}
                    src={avatarSrc}
                    alt="Nenad — Developer"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-600"
                    onError={handleAvatarError}
                  />
                ) : null}
                <div
                  className={`h-14 w-14 rounded-full bg-slate-700 flex items-center justify-center text-white text-xl font-semibold ring-2 ring-slate-600 ${!avatarFailed ? 'hidden' : ''}`}
                  aria-hidden={!avatarFailed}
                >
                  N
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">Nenad</span>
                  <span className="inline-flex items-center text-slate-400" title="Verifikovan">
                    <BadgeCheck className="h-4 w-4 text-blue-400" aria-hidden />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-slate-700 px-1.5 py-0.5 text-xs font-medium text-slate-300">
                    <Shield className="h-3.5 w-3.5" />
                    Developer
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">
                  Member since{' '}
                  {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('sr-Latn-RS', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30 flex flex-col-reverse sm:flex-row gap-2 justify-end">
            <button
              onClick={() => handleClose(true)}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              Ne prikazuj danas
            </button>
            <button
              onClick={() => handleClose(false)}
              className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-colors shadow-lg shadow-purple-500/20"
            >
              Razumem
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
