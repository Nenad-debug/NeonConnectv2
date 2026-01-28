# 🔒 Security Services - Quick Reference Guide

---

## 1. Encryption Service
**File:** `frontend/src/services/encryptionService.ts`

### Purpose
Encrypts sensitive data before storing in localStorage to prevent XSS attacks from accessing plain-text session information.

### Usage

```typescript
import { secureStorage } from '../../services/encryptionService'

// Store encrypted data
await secureStorage.setItem('myKey', { sensitive: 'data' })

// Retrieve and decrypt
const data = await secureStorage.getItem('myKey')

// Remove item
secureStorage.removeItem('myKey')

// Clear all storage
secureStorage.clear()
```

### What It Encrypts
- Saved accounts (email, role, ID)
- Current session information
- Device fingerprint metadata

### How It Works
1. **Crypto Algorithm:** AES-256-GCM (authenticated encryption)
2. **Key Derivation:** PBKDF2 from device fingerprint (100,000 iterations)
3. **IV:** 12-byte random nonce per encryption
4. **Encoding:** base64 for localStorage compatibility

### Features
- Device-specific (can't be moved between devices)
- Automatic fallback to base64 if crypto fails
- All operations are async
- No external dependencies

---

## 2. Device Service (Updated)
**File:** `frontend/src/services/deviceService.ts`

### Purpose
Generate and persist a unique device identifier for account switching and security tracking.

### Changes in v2
- **Old:** Simple 32-bit hash (collision-prone)
- **New:** SHA-256 cryptographic hash (secure)
- **Canvas fingerprint:** Added for additional entropy

### Usage

```typescript
import { deviceService } from '../../services/deviceService'

// Get device ID (async)
const deviceId = await deviceService.getDeviceId()

// Get device info (debug)
const info = await deviceService.getDeviceInfo()

// Reset device ID (rare)
deviceService.resetDeviceId()
```

### What It Collects
- User Agent
- Language preferences
- Platform
- Screen resolution
- Color depth
- Hardware concurrency
- Device memory
- Canvas fingerprint
- Timezone

---

## 3. Session Manager (Updated)
**File:** `frontend/src/services/sessionManager.ts`

### Purpose
Manage known accounts on device with encrypted storage.

### Key Changes
- ✅ All methods are now **async**
- ✅ Data is **encrypted** automatically
- ✅ No need to call `await` on deviceService.getDeviceId() (it's handled internally)

### Usage

```typescript
import { sessionManager } from '../../services/sessionManager'

// Save account after login
await sessionManager.saveAccount(userId, email, role)

// Get all saved accounts
const accounts = await sessionManager.getSavedAccounts()

// Get current session
const session = await sessionManager.getCurrentSession()

// Set current session
await sessionManager.setCurrentSession(account)

// Remove specific account
await sessionManager.removeAccount(userId)

// Clear all sessions (logout)
sessionManager.clearAllSessions() // Note: this one is sync

// Check if device has known accounts
const isKnown = await sessionManager.isKnownDevice()

// Get session info (debugging)
const info = await sessionManager.getSessionInfo()
```

---

## 4. Rate Limiting Service (New)
**File:** `frontend/src/services/rateLimitService.ts`

### Purpose
Prevent brute force attacks by limiting authentication attempts per user/email.

### Default Limits
| Action | Max Attempts | Time Window |
|--------|---|---|
| login | 5 | 15 minutes |
| signup | 3 | 1 hour |
| resetPassword | 3 | 1 hour |
| updatePassword | 5 | 24 hours |
| postJob | 20 | 1 hour |

### Usage

```typescript
import { rateLimitService } from '../../services/rateLimitService'

// Check and record attempt - returns true if allowed
const isAllowed = rateLimitService.checkLimit('login', 'user@email.com')
if (!isAllowed) {
  const reset = rateLimitService.getResetTime('login', 'user@email.com')
  console.error(`Too many attempts. Try again in ${reset} seconds`)
}

// Check without recording
const limited = rateLimitService.isRateLimited('login', 'user@email.com')

// Get remaining attempts before limit
const remaining = rateLimitService.getRemainingAttempts('login', 'user@email.com')

// Get seconds until rate limit resets
const resetSeconds = rateLimitService.getResetTime('login', 'user@email.com')

// Clear limit on successful action
rateLimitService.clearRateLimit('login', 'user@email.com')

// Add custom rate limit (for testing)
rateLimitService.addAction('customAction', {
  maxAttempts: 10,
  windowMs: 60000, // 1 minute
  keyPrefix: '__rl_custom__'
})
```

### Integration in authService
✅ Already integrated:
- `signup()` - checks rate limit
- `login()` - checks rate limit + clears on success
- `resetPassword()` - checks rate limit
- `updatePassword()` - checks rate limit + clears on success

---

## 5. CSRF Service (New)
**File:** `frontend/src/services/csrfService.ts`

### Purpose
Generate and validate CSRF tokens for state-changing operations (POST, PUT, DELETE).

### Usage

```typescript
import { csrfService } from '../../services/csrfService'

// Get or create CSRF token
const token = await csrfService.getOrCreateCSRFToken()

// Get just headers object (easy for fetch)
const headers = await csrfService.getCSRFHeaders()

// Validate token (on backend)
const isValid = csrfService.validateCSRFToken(receivedToken, expectedToken)

// Clear token (on logout)
csrfService.clearCSRFToken()
```

### Integration Example

```typescript
// In your form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const csrfHeaders = await csrfService.getCSRFHeaders()
  
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders, // Add CSRF token to headers
    },
    body: JSON.stringify({ title: 'Job', description: 'Desc' })
  })
}
```

### Token Format
- **Length:** 64 hex characters (32 bytes)
- **Storage:** sessionStorage (cleared on window close)
- **Header:** `X-CSRF-Token`
- **Comparison:** Timing-safe (prevents timing attacks)

---

## 6. Authentication Service (Updated)
**File:** `frontend/src/services/authService.ts`

### New Features
- ✅ Rate limiting on all auth endpoints
- ✅ XSS protection for token URL parameters
- ✅ Encrypted session storage
- ✅ Better error messages

### Updated Methods

```typescript
import { authService } from '../../services/authService'

// Signup with rate limiting
try {
  const { user, session } = await authService.signup(email, password, 'candidate')
} catch (error) {
  if (error.message.includes('Previše pokušaja')) {
    // Show rate limit error to user
  }
}

// Login with rate limiting
try {
  const { user, session } = await authService.login(email, password)
  // Automatic encrypted session save
} catch (error) {
  if (error.message.includes('Previše pokušaja')) {
    // Show rate limit error to user
  }
}

// Password reset with rate limiting
try {
  await authService.resetPassword(email)
} catch (error) {
  // Handle error
}

// Update password with rate limiting
try {
  await authService.updatePassword(newPassword)
} catch (error) {
  // Handle error
}
```

---

## 📋 Async/Await Patterns

### ✅ DO - Correct Patterns

```typescript
// In React useEffect
useEffect(() => {
  sessionManager.getSavedAccounts().then(accounts => {
    setAccounts(accounts)
  })
}, [])

// In async function
async function handleLogin() {
  const token = await csrfService.getOrCreateCSRFToken()
  const isAllowed = rateLimitService.checkLimit('login', email)
}

// Multiple operations
async function setupSession() {
  await sessionManager.saveAccount(id, email, role)
  const accounts = await sessionManager.getSavedAccounts()
  return accounts
}
```

### ❌ DON'T - Common Mistakes

```typescript
// DON'T: Forget to await
const accounts = sessionManager.getSavedAccounts() // Returns Promise!

// DON'T: Mix .then() and await
const token = csrfService.getOrCreateCSRFToken().then(t => t) // Awkward

// DON'T: Try to use result outside async context
const accounts = sessionManager.getSavedAccounts()
console.log(accounts) // undefined - Promise not yet resolved
```

---

## 🧪 Testing Guide

### Test Rate Limiting
```javascript
// 1. Open DevTools Console
// 2. Get email for testing: let email = 'test@example.com'
// 3. Check limits
rateLimitService.getRemainingAttempts('login', email) // Should be 5
// 4. Attempt 5 times - should all succeed
// 5. Attempt 6th time - should be blocked
```

### Test Encryption
```javascript
// Check localStorage is encrypted
let data = localStorage.getItem('neonconnect_saved_accounts')
console.log(data) // Should be encrypted base64, not readable JSON

// Verify it decrypts properly
await secureStorage.getItem('neonconnect_saved_accounts') // Should work
```

### Test Device Fingerprinting
```javascript
// Open DevTools in two different browsers
// Browser 1
await deviceService.getDeviceId() // returns ID1

// Browser 2  
await deviceService.getDeviceId() // returns ID2 (different)

// Same browser: ID1 (persisted in localStorage)
```

---

## 🐛 Troubleshooting

### Issue: "Encryption failed" in console
**Solution:** Browser might be in private mode or localStorage disabled
- Check if localStorage is available
- Try in normal browsing mode
- Check browser privacy settings

### Issue: Rate limit not working
**Solution:** Check localStorage prefix
- Clear `localStorage.__rl_*` keys manually
- Verify email is being passed correctly
- Check console for errors

### Issue: CSRF token missing
**Solution:** Must call getOrCreateCSRFToken in useEffect
```typescript
useEffect(() => {
  csrfService.getOrCreateCSRFToken() // Initialize token
}, [])
```

### Issue: Device ID changes every page load
**Solution:** Might be clearing localStorage
- Check for code calling `localStorage.clear()`
- Verify not in private browsing mode
- Check browser allowed storage space

---

## 📚 Related Documentation

- [PENETRATION_TEST_REPORT.md](../PENETRATION_TEST_REPORT.md) - Full security audit
- [SECURITY_IMPLEMENTATION.md](../SECURITY_IMPLEMENTATION.md) - Implementation details
- [SECURITY_DEPLOYMENT_CHECKLIST.md](../SECURITY_DEPLOYMENT_CHECKLIST.md) - Deployment guide

---

**Last Updated:** January 28, 2026  
**Status:** Production Ready ✅
