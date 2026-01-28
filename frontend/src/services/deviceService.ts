/**
 * Device Detection Service
 * Generates and manages a unique device ID for the user's device
 * SECURITY FIX: Using cryptographic SHA-256 hashing instead of simple hash
 */

const DEVICE_ID_KEY = 'neonconnect_device_id'

/**
 * Generate a unique device fingerprint based on browser characteristics
 */
function generateDeviceFingerprint(): string {
  const navigator_ = window.navigator
  const screen_ = window.screen

  const fingerprint = {
    userAgent: navigator_.userAgent,
    language: navigator_.language,
    platform: navigator_.platform,
    screenResolution: `${screen_.width}x${screen_.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: screen_.colorDepth,
    hardwareConcurrency: (navigator_ as any).hardwareConcurrency || '',
    deviceMemory: (navigator_ as any).deviceMemory || '',
    canvas: canvasFingerprint(),
  }

  return JSON.stringify(fingerprint)
}

/**
 * Generate canvas fingerprint for additional entropy
 */
function canvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    ctx.textBaseline = 'top'
    ctx.font = '14px "Arial"'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Browser🔒', 2, 15)
    
    return canvas.toDataURL().substring(0, 50)
  } catch {
    return ''
  }
}

/**
 * Hash fingerprint using Web Crypto API (SHA-256)
 * SECURITY FIX: Cryptographically secure hashing
 */
async function hashFingerprint(fingerprint: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(fingerprint)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    console.error('Crypto API not available, falling back to simple hash:', error)
    // Fallback for old browsers
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }
}

export const deviceService = {
  /**
   * Get or create a unique device ID
   */
  async getDeviceId(): Promise<string> {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)

    if (!deviceId) {
      const fingerprint = generateDeviceFingerprint()
      deviceId = await hashFingerprint(fingerprint)
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
    }

    return deviceId
  },

  /**
   * Get device info for debugging
   */
  async getDeviceInfo() {
    return {
      deviceId: this.getDeviceId(),
      userAgent: window.navigator.userAgent,
      platform: window.navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
    }
  },

  /**
   * Clear device ID (for testing)
   */
  clearDeviceId(): void {
    localStorage.removeItem(DEVICE_ID_KEY)
  },
}
