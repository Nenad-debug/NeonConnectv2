import { deviceService } from './deviceService'
import { secureStorage } from './encryptionService'

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
   * Save an account to known accounts on this device (ENCRYPTED)
   */
  async saveAccount(userId: string, email: string, role: 'candidate' | 'employer'): Promise<void> {
    try {
      console.log('💾 [SESSION_MGR] saveAccount:', { userId, email, role })
      
      const accounts = await this.getSavedAccounts()
      
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

      // SECURITY FIX: Use encrypted storage
      await secureStorage.setItem(SAVED_ACCOUNTS_KEY, accounts)
      console.log('✅ [SESSION_MGR] Account saved successfully')
    } catch (error) {
      console.error('❌ [SESSION_MGR] Error saving account:', error)
    }
  },

  /**
   * Get all saved accounts for this device (DECRYPTED)
   */
  async getSavedAccounts(): Promise<SavedAccount[]> {
    try {
      // SECURITY FIX: Use encrypted storage
      const saved = await secureStorage.getItem(SAVED_ACCOUNTS_KEY)
      return saved ? saved : []
    } catch (error) {
      console.error('Error getting saved accounts:', error)
      return []
    }
  },

  /**
   * Get current session (last logged in account) (DECRYPTED)
   */
  async getCurrentSession(): Promise<SavedAccount | null> {
    try {
      console.log('🔍 [SESSION_MGR] Getting current session...')
      
      // SECURITY FIX: Use encrypted storage
      const session = await secureStorage.getItem(CURRENT_SESSION_KEY)
      
      if (session) {
        console.log('✅ [SESSION_MGR] Current session found:', session.id)
      } else {
        console.log('⚠️ [SESSION_MGR] No current session found')
      }
      
      return session ? session : null
    } catch (error) {
      console.error('❌ [SESSION_MGR] Error getting current session:', error)
      return null
    }
  },

  /**
   * Set current session (ENCRYPTED)
   */
  async setCurrentSession(account: SavedAccount): Promise<void> {
    try {
      console.log('💾 [SESSION_MGR] setCurrentSession:', account.id)
      
      // SECURITY FIX: Use encrypted storage
      await secureStorage.setItem(CURRENT_SESSION_KEY, account)
      
      console.log('✅ [SESSION_MGR] Current session set successfully')
    } catch (error) {
      console.error('❌ [SESSION_MGR] Error setting current session:', error)
    }
  },

  /**
   * Remove account from saved accounts
   */
  async removeAccount(userId: string): Promise<void> {
    try {
      const accounts = await this.getSavedAccounts()
      const filtered = accounts.filter(acc => acc.id !== userId)
      await secureStorage.setItem(SAVED_ACCOUNTS_KEY, filtered)

      // Clear current session if it was the removed account
      const currentSession = await this.getCurrentSession()
      if (currentSession?.id === userId) {
        secureStorage.removeItem(CURRENT_SESSION_KEY)
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
      secureStorage.removeItem(CURRENT_SESSION_KEY)
      secureStorage.removeItem(SAVED_ACCOUNTS_KEY)
    } catch (error) {
      console.error('Error clearing sessions:', error)
    }
  },

  /**
   * Check if device is known (has any saved accounts)
   */
  async isKnownDevice(): Promise<boolean> {
    const accounts = await this.getSavedAccounts()
    return accounts.length > 0
  },

  /**
   * Get device info for debugging
   */
  async getSessionInfo() {
    const savedAccounts = await this.getSavedAccounts()
    const currentSession = await this.getCurrentSession()
    const deviceId = await deviceService.getDeviceId()
    return {
      deviceId,
      savedAccounts,
      currentSession,
    }
  },
}
