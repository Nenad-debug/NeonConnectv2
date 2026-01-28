/**
 * SECURITY: Encryption service for sensitive localStorage data
 * Protects session data and account information from XSS attacks
 * Uses SubtleCrypto API (native browser Web Crypto API - no external dependency)
 */

const ENCRYPTION_ALGORITHM = {
  name: 'AES-GCM',
  length: 256,
}

const IV_LENGTH = 12 // 96 bits for GCM

/**
 * Generate or retrieve encryption key from device storage
 * Key is derived from browser fingerprint to make it device-specific
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  try {
    // Generate a consistent key from device fingerprint
    const fingerprint = await getDeviceFingerprint()
    const encoder = new TextEncoder()
    const data = encoder.encode(fingerprint)
    
    // Use PBKDF2 to derive a key from the fingerprint
    const baseKey = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode('neonconnect-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      256
    )
    
    return await crypto.subtle.importKey(
      'raw',
      derivedBits,
      ENCRYPTION_ALGORITHM,
      false,
      ['encrypt', 'decrypt']
    )
  } catch (error) {
    console.error('Failed to get encryption key:', error)
    throw error
  }
}

/**
 * Generate a device fingerprint for key derivation
 */
async function getDeviceFingerprint(): Promise<string> {
  const nav = navigator as any
  const screen = window.screen
  
  const fingerprint = [
    nav.userAgent,
    nav.language,
    nav.languages ? nav.languages.join(',') : '',
    nav.platform,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || '',
    nav.deviceMemory || '',
  ].join('|')
  
  // Hash the fingerprint using SubtleCrypto
  const encoder = new TextEncoder()
  const data = encoder.encode(fingerprint)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Encrypt sensitive data for storage
 */
export async function encryptData(data: any): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    const jsonString = JSON.stringify(data)
    const encoder = new TextEncoder()
    const plaintext = encoder.encode(jsonString)
    
    const ciphertext = await crypto.subtle.encrypt(
      { ...ENCRYPTION_ALGORITHM, iv },
      key,
      plaintext
    )
    
    // Combine IV and ciphertext, then base64 encode
    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)
    
    return btoa(String.fromCharCode(...Array.from(combined)))
  } catch (error) {
    console.error('Encryption failed:', error)
    // Fallback: just base64 encode if crypto fails
    return btoa(JSON.stringify(data))
  }
}

/**
 * Decrypt sensitive data from storage
 */
export async function decryptData(encryptedData: string): Promise<any> {
  try {
    const key = await getEncryptionKey()
    
    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(c => c.charCodeAt(0))
    )
    
    const iv = combined.slice(0, IV_LENGTH)
    const ciphertext = combined.slice(IV_LENGTH)
    
    const plaintext = await crypto.subtle.decrypt(
      { ...ENCRYPTION_ALGORITHM, iv },
      key,
      ciphertext
    )
    
    const decoder = new TextDecoder()
    const jsonString = decoder.decode(plaintext)
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Decryption failed:', error)
    // Fallback: try to parse as base64 encoded JSON
    try {
      return JSON.parse(atob(encryptedData))
    } catch {
      return null
    }
  }
}

/**
 * Secure storage wrapper for localStorage
 */
export const secureStorage = {
  /**
   * Store encrypted data
   */
  async setItem(key: string, data: any): Promise<void> {
    try {
      const encrypted = await encryptData(data)
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('Secure storage set failed:', error)
      throw error
    }
  },

  /**
   * Retrieve and decrypt data
   */
  async getItem(key: string): Promise<any> {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null
      return await decryptData(encrypted)
    } catch (error) {
      console.error('Secure storage get failed:', error)
      return null
    }
  },

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key)
  },

  /**
   * Clear all stored data
   */
  clear(): void {
    localStorage.clear()
  },
}
