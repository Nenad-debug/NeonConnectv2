/**
 * Rate Limiting Service
 * Implements client-side rate limiting for authentication endpoints
 * Server-side rate limiting should be enforced in Supabase/Backend
 */

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number // milliseconds
  keyPrefix: string
}

interface AttempRecord {
  count: number
  resetTime: number
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'login': {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: '__rl_login__',
  },
  'signup': {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: '__rl_signup__',
  },
  'resetPassword': {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: '__rl_reset_password__',
  },
  'updatePassword': {
    maxAttempts: 5,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    keyPrefix: '__rl_update_password__',
  },
  'postJob': {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: '__rl_post_job__',
  },
}

/**
 * Record an attempt for a given action and identifier
 */
function recordAttempt(action: string, identifier: string): AttempRecord {
  const config = DEFAULT_CONFIGS[action]
  if (!config) {
    throw new Error(`Unknown rate limit action: ${action}`)
  }

  const key = `${config.keyPrefix}${identifier}`
  const now = Date.now()
  
  let record: AttempRecord = { count: 1, resetTime: now + config.windowMs }
  
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      record = JSON.parse(stored)
      
      // Reset if window has expired
      if (now >= record.resetTime) {
        record = { count: 1, resetTime: now + config.windowMs }
      } else {
        // Within window, increment
        record.count++
      }
    }
    
    localStorage.setItem(key, JSON.stringify(record))
  } catch (error) {
    console.error('Rate limit storage error:', error)
  }
  
  return record
}

/**
 * Check if action is rate limited
 */
function isRateLimited(action: string, identifier: string): boolean {
  const config = DEFAULT_CONFIGS[action]
  if (!config) {
    throw new Error(`Unknown rate limit action: ${action}`)
  }

  const key = `${config.keyPrefix}${identifier}`
  const now = Date.now()
  
  try {
    const stored = localStorage.getItem(key)
    if (!stored) {
      return false
    }
    
    const record: AttempRecord = JSON.parse(stored)
    
    // Window has expired
    if (now >= record.resetTime) {
      return false
    }
    
    // Still within window and exceeded max attempts
    return record.count >= config.maxAttempts
  } catch (error) {
    console.error('Rate limit check error:', error)
    return false
  }
}

/**
 * Get remaining attempts
 */
function getRemainingAttempts(action: string, identifier: string): number {
  const config = DEFAULT_CONFIGS[action]
  if (!config) {
    throw new Error(`Unknown rate limit action: ${action}`)
  }

  const key = `${config.keyPrefix}${identifier}`
  const now = Date.now()
  
  try {
    const stored = localStorage.getItem(key)
    if (!stored) {
      return config.maxAttempts
    }
    
    const record: AttempRecord = JSON.parse(stored)
    
    // Window has expired
    if (now >= record.resetTime) {
      return config.maxAttempts
    }
    
    const remaining = Math.max(0, config.maxAttempts - record.count)
    return remaining
  } catch (error) {
    console.error('Rate limit check error:', error)
    return config.maxAttempts
  }
}

/**
 * Get time remaining until rate limit resets
 */
function getResetTime(action: string, identifier: string): number {
  const config = DEFAULT_CONFIGS[action]
  if (!config) {
    throw new Error(`Unknown rate limit action: ${action}`)
  }

  const key = `${config.keyPrefix}${identifier}`
  const now = Date.now()
  
  try {
    const stored = localStorage.getItem(key)
    if (!stored) {
      return 0
    }
    
    const record: AttempRecord = JSON.parse(stored)
    
    // Window has expired
    if (now >= record.resetTime) {
      return 0
    }
    
    return Math.ceil((record.resetTime - now) / 1000) // return seconds
  } catch (error) {
    console.error('Rate limit check error:', error)
    return 0
  }
}

/**
 * Clear rate limit for action/identifier
 */
function clearRateLimit(action: string, identifier: string): void {
  const config = DEFAULT_CONFIGS[action]
  if (!config) {
    throw new Error(`Unknown rate limit action: ${action}`)
  }

  const key = `${config.keyPrefix}${identifier}`
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Rate limit clear error:', error)
  }
}

export const rateLimitService = {
  /**
   * Check and record attempt
   * Returns true if action is allowed, false if rate limited
   */
  checkLimit(action: string, identifier: string): boolean {
    if (isRateLimited(action, identifier)) {
      return false
    }
    recordAttempt(action, identifier)
    return true
  },

  isRateLimited,
  recordAttempt,
  getRemainingAttempts,
  getResetTime,
  clearRateLimit,
  
  /**
   * Get all rate limit configs
   */
  getConfigs: () => DEFAULT_CONFIGS,
  
  /**
   * Custom rate limit action (for testing)
   */
  addAction: (action: string, config: RateLimitConfig) => {
    DEFAULT_CONFIGS[action] = config
  },
}
