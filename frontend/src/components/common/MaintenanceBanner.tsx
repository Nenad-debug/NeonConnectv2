import { X, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 animate-pulse flex-shrink-0" />
          <div>
            <p className="font-bold text-lg">⚠️ RADOVI U TOKU</p>
            <p className="text-sm opacity-90">Izvršavaju se sigurnosne ispravke i optimizacije. Funkcionalnost može biti privremeno ograničena.</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Zatvori"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
