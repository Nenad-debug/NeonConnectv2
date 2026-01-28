import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Plus, Check } from 'lucide-react'
import { sessionManager, type SavedAccount } from '../../services/sessionManager'
import { supabase } from '../../services/supabaseClient'
import Background from './Background'

interface AccountSwitcherProps {
  onAccountSelected?: (account: SavedAccount) => void
  onDismiss?: () => void
}

export default function AccountSwitcher({ onAccountSelected, onDismiss }: AccountSwitcherProps) {
  const navigate = useNavigate()
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load saved accounts asynchronously
    sessionManager.getSavedAccounts().then((accounts) => {
      setSavedAccounts(accounts)
      if (accounts.length > 0) {
        setSelectedId(accounts[0].id)
      }
    })
  }, [])

  const handleContinue = async () => {
    const selected = savedAccounts.find(acc => acc.id === selectedId)
    if (!selected) return

    setIsLoading(true)
    try {
      // Try to get stored session from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session && session.user.id === selectedId) {
        // Already logged in as this user
        await sessionManager.setCurrentSession(selected)
        onAccountSelected?.(selected)
        navigate(selected.role === 'employer' ? '/dashboard' : '/jobs')
      } else {
        // Need to redirect to login
        navigate(`/login?email=${encodeURIComponent(selected.email)}`)
      }
    } catch (error) {
      console.error('Error switching account:', error)
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewAccount = () => {
    navigate('/signup')
  }

  const handleRemoveAccount = async (accountId: string) => {
    await sessionManager.removeAccount(accountId)
    const updatedAccounts = await sessionManager.getSavedAccounts()
    setSavedAccounts(updatedAccounts)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Background />
      
      <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Odaberi nalog</h2>
          <p className="text-sm text-slate-400">Izaberi jedan od sačuvanih naloga ili kreiraj novi</p>
        </div>

        {/* Saved Accounts */}
        <div className="space-y-3">
          {savedAccounts.map((account) => (
            <div
              key={account.id}
              className="group relative"
              onClick={() => setSelectedId(account.id)}
            >
              <div
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedId === account.id
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{account.email}</p>
                  <p className="text-xs text-slate-400 capitalize">{account.role === 'employer' ? 'Poslodavac' : 'Kandidat'}</p>
                </div>

                {selectedId === account.id && (
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                )}
              </div>

              {/* Remove button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveAccount(account.id)
                }}
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500/90 hover:bg-red-600 rounded-full text-white"
                title="Obriši nalog"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Učitavanje...' : 'Nastavi'}
          </button>

          {/* New Account Button */}
          <button
            onClick={handleNewAccount}
            className="w-full px-6 py-3 border-2 border-slate-600 hover:border-blue-500/50 rounded-lg font-semibold text-white hover:bg-slate-800/50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novi nalog
          </button>

          {/* Dismiss Button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="w-full px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg font-medium transition-all duration-300"
            >
              Odustani
            </button>
          )}
        </div>

        {/* Debug Info (dev only) */}
        {import.meta.env.DEV && (
          <div className="text-xs text-slate-600 border-t border-slate-700/50 pt-3 mt-3">
            <details>
              <summary className="cursor-pointer hover:text-slate-500">Debug Info</summary>
              <pre className="mt-2 text-xs bg-slate-950 p-2 rounded overflow-auto max-h-32">
                Loading...
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
