/**
 * CSRF Protection Service
 * Generates and validates CSRF tokens for state-changing operations
 */

const CSRF_TOKEN_KEY = '__neonconnect_csrf_token__'
const CSRF_TOKEN_HEADER = 'X-CSRF-Token'

/**
 * Generate a cryptographically secure CSRF token
 */
export async function generateCSRFToken(): Promise<string> {
  // Generate 32 random bytes
  const buffer = new Uint8Array(32)
  crypto.getRandomValues(buffer)
  
  // Convert to hex string
  const token = Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return token
}

/**
 * Get or create CSRF token for current session
 */
export async function getOrCreateCSRFToken(): Promise<string> {
  try {
    let token = sessionStorage.getItem(CSRF_TOKEN_KEY)
    
    if (!token) {
      token = await generateCSRFToken()
      sessionStorage.setItem(CSRF_TOKEN_KEY, token)
    }
    
    return token
  } catch (error) {
    console.error('Error getting CSRF token:', error)
    throw error
  }
}

/**
 * Get current CSRF token without creating
 */
export function getCSRFToken(): string | null {
  return sessionStorage.getItem(CSRF_TOKEN_KEY)
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false
  }
  
  // Use timing-safe comparison to prevent timing attacks
  return timingSafeEqual(token, expectedToken)
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Clear CSRF token (on logout)
 */
export function clearCSRFToken(): void {
  sessionStorage.removeItem(CSRF_TOKEN_KEY)
}

/**
 * Prepare headers for state-changing requests
 */
export async function getCSRFHeaders(): Promise<Record<string, string>> {
  const token = await getOrCreateCSRFToken()
  return {
    [CSRF_TOKEN_HEADER]: token,
  }
}

/**
 * CSRF Service for easy integration
 */
export const csrfService = {
  getOrCreateCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  clearCSRFToken,
  getCSRFHeaders,
  getHeaderName: () => CSRF_TOKEN_HEADER,
}
