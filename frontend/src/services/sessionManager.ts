import { deviceService } from './deviceService'

export interface SavedAccount {
  id: string
  email: string
  role: 'candidate' | 'employer'
  avatar?: string
  lastUsed: number
}

const SAVED_ACCOUNTS_KEY = 'neonconnect_saved_accounts'
const CURRENT_SESSION_KEY = 'neonconnect_current_session'

export const sessionManager = {
  /**
   * Save an account to known accounts on this device
   */
  saveAccount(userId: string, email: string, role: 'candidate' | 'employer'): void {
    try {
      const accounts = this.getSavedAccounts()
      
      // Check if account already exists
      const existingIndex = accounts.findIndex(acc => acc.id === userId)
      
      const account: SavedAccount = {
        id: userId,
        email,
        role,
        lastUsed: Date.now(),
      }

      if (existingIndex > -1) {
        // Update existing account
        accounts[existingIndex] = account
      } else {
        // Add new account
        accounts.push(account)
      }

      // Keep only last 5 accounts
      if (accounts.length > 5) {
        accounts.sort((a, b) => b.lastUsed - a.lastUsed)
        accounts.splice(5)
      }

      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts))
    } catch (error) {
      console.error('Error saving account:', error)
    }
  },

  /**
   * Get all saved accounts for this device
   */
  getSavedAccounts(): SavedAccount[] {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Error getting saved accounts:', error)
      return []
    }
  },

  /**
   * Get current session (last logged in account)
   */
  getCurrentSession(): SavedAccount | null {
    try {
      const session = localStorage.getItem(CURRENT_SESSION_KEY)
      return session ? JSON.parse(session) : null
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  },

  /**
   * Set current session
   */
  setCurrentSession(account: SavedAccount): void {
    try {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(account))
    } catch (error) {
      console.error('Error setting current session:', error)
    }
  },

  /**
   * Remove account from saved accounts
   */
  removeAccount(userId: string): void {
    try {
      const accounts = this.getSavedAccounts()
      const filtered = accounts.filter(acc => acc.id !== userId)
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered))

      // Clear current session if it was the removed account
      const currentSession = this.getCurrentSession()
      if (currentSession?.id === userId) {
        localStorage.removeItem(CURRENT_SESSION_KEY)
      }
    } catch (error) {
      console.error('Error removing account:', error)
    }
  },

  /**
   * Clear all sessions (for logout)
   */
  clearAllSessions(): void {
    try {
      localStorage.removeItem(CURRENT_SESSION_KEY)
    } catch (error) {
      console.error('Error clearing sessions:', error)
    }
  },

  /**
   * Check if device is known (has any saved accounts)
   */
  isKnownDevice(): boolean {
    return this.getSavedAccounts().length > 0
  },

  /**
   * Get device info for debugging
   */
  getSessionInfo() {
    return {
      deviceId: deviceService.getDeviceId(),
      savedAccounts: this.getSavedAccounts(),
      currentSession: this.getCurrentSession(),
    }
  },
}
