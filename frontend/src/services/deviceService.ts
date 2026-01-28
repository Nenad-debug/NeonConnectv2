/**
 * Device Detection Service
 * Generates and manages a unique device ID for the user's device
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
    timestamp: new Date().getTime(),
  }

  return JSON.stringify(fingerprint)
}

/**
 * Simple hash function for fingerprint
 */
function hashFingerprint(fingerprint: string): string {
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

export const deviceService = {
  /**
   * Get or create a unique device ID
   */
  getDeviceId(): string {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)

    if (!deviceId) {
      const fingerprint = generateDeviceFingerprint()
      deviceId = hashFingerprint(fingerprint)
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
    }

    return deviceId
  },

  /**
   * Get device info for debugging
   */
  getDeviceInfo() {
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
