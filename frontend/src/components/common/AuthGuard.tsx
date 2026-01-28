import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { sessionManager } from '../services/sessionManager'
import AccountSwitcher from './common/AccountSwitcher'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Don't show switcher on auth pages
    const authPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback']
    const isAuthPage = authPages.some(page => location.pathname.startsWith(page))

    if (!isAuthPage && !hasChecked) {
      // Check if there are known accounts and no current session
      const savedAccounts = sessionManager.getSavedAccounts()
      
      if (savedAccounts.length > 0) {
        // Show account switcher
        setShowAccountSwitcher(true)
      }

      setHasChecked(true)
    }
  }, [location.pathname, hasChecked])

  if (showAccountSwitcher) {
    return (
      <AccountSwitcher
        onDismiss={() => setShowAccountSwitcher(false)}
        onAccountSelected={() => setShowAccountSwitcher(false)}
      />
    )
  }

  return <>{children}</>
}
