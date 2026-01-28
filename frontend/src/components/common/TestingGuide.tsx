import { HelpCircle, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export default function TestingGuide() {
  const [isOpen, setIsOpen] = useState(false)

  const handleDownload = () => {
    // Create a link to the testing guide
    const guideLink = 'https://raw.githubusercontent.com/Nenad-debug/NeonConnectv2/feat/netlify-config/docs/TESTING_GUIDE_DRAGA.md'
    window.open(guideLink, '_blank')
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 border border-blue-400/50"
        title="Vodič za testiranje"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-blue-400" />
                Vodič za Testiranje
              </h3>
              <p className="text-sm text-slate-400">
                Detaljan vodič za Dragu sa svim koracima za testiranje sajta
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-slate-300">
              <p className="font-semibold text-blue-300 mb-2">📋 Šta je uključeno:</p>
              <ul className="space-y-1 text-xs">
                <li>✅ 10 koraka za testiranje</li>
                <li>✅ Simplificirano objašnjenje</li>
                <li>✅ Test email adrese</li>
                <li>✅ Šta očekivati</li>
                <li>✅ Rešenja za probleme</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Otvori Vodič
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-3 border border-slate-600 hover:border-slate-500 rounded-lg font-semibold text-slate-300 hover:bg-slate-800/50 transition-all duration-300"
              >
                Zatvori
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Vodič je dostupan za Dragu i sve učesnike u testiranju
            </p>
          </div>
        </div>
      )}
    </>
  )
}
