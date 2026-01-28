import { supabase } from './supabaseClient'
import { sessionManager } from './sessionManager'
import { rateLimitService } from './rateLimitService'

export const authService = {
  async signup(email: string, password: string, role: 'candidate' | 'employer') {
    // SECURITY: Check rate limiting
    if (!rateLimitService.checkLimit('signup', email)) {
      const resetTime = rateLimitService.getResetTime('signup', email)
      throw new Error(`Previše pokušaja. Pokušajte ponovo za ${resetTime} sekundi.`)
    }

    // Try to include role in user_metadata so we can create the profile later when user signs in
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    // If a session was returned, the user is signed in and we can create the profile now
    if (data.user && data.session) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email, role }])

      if (profileError) throw profileError

      // Save to session manager (ENCRYPTED)
      await sessionManager.saveAccount(data.user.id, email, role)
      await sessionManager.setCurrentSession({
        id: data.user.id,
        email,
        role,
        lastUsed: Date.now(),
      })
    } else {
      // No session (email confirmation flow). Save role locally so we can create profile after user confirms and signs in.
      try {
        localStorage.setItem(`pending_role_${email}`, role)
      } catch (e) {
        // ignore localStorage errors
      }
    }

    return data
  },

  async login(email: string, password: string) {
    // SECURITY: Check rate limiting on login attempts
    if (!rateLimitService.checkLimit('login', email)) {
      const resetTime = rateLimitService.getResetTime('login', email)
      throw new Error(`Previše pokušaja prijave. Pokušajte ponovo za ${resetTime} sekundi.`)
    }

    try {
      console.log('🔵 [AUTH] Login started for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔵 [AUTH] Supabase response received')

      if (error) {
        console.error('❌ [AUTH] Login error:', error)
        throw error
      }

      // After successful sign-in, ensure profile exists (RLS requires auth.uid() = id)
      if (data.user) {
        console.log('✅ [AUTH] User authenticated:', data.user.id)
        
        await this.createProfileIfMissing(data.user)
        console.log('✅ [AUTH] Profile created/verified')

        // Get user role from users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        console.log('✅ [AUTH] User profile fetched:', userProfile?.role)

        // Save to session manager (ENCRYPTED) - with timeout protection
        console.log('🔵 [AUTH] Saving session (with timeout)...')
        
        const saveSessionPromise = Promise.all([
          sessionManager.saveAccount(data.user.id, email, (userProfile?.role as 'candidate' | 'employer') || 'candidate'),
          sessionManager.setCurrentSession({
            id: data.user.id,
            email,
            role: (userProfile?.role as 'candidate' | 'employer') || 'candidate',
            lastUsed: Date.now(),
          })
        ])
        
        // Set timeout for session saving (3 seconds max)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session save timeout')), 3000)
        )
        
        try {
          await Promise.race([saveSessionPromise, timeoutPromise])
          console.log('✅ [AUTH] Session saved successfully')
        } catch (timeoutError) {
          console.warn('⚠️ [AUTH] Session save timeout, continuing anyway...', timeoutError)
          // Continue anyway - session will be saved eventually
        }

        // Clear rate limit on successful login
        rateLimitService.clearRateLimit('login', email)
        console.log('✅ [AUTH] Login complete!')
      }

      return data
    } catch (error) {
      console.error('💥 [AUTH] Login failed:', error)
      throw error
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    sessionManager.clearAllSessions()
    if (error) throw error
  },

  async getCurrentUser() {
    // First, try regular getUser
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      // If there's an error, don't throw here - return null and allow fallback
    }
    if (user) return user

    // If no user, attempt to restore session from URL (some Supabase flows return tokens in the hash)
    await this.restoreSessionFromUrl().catch(() => {})

    const { data: { user: userAfter } } = await supabase.auth.getUser()
    return userAfter || null
  },

  // Try to extract tokens from URL hash/search and set session in the client
  async restoreSessionFromUrl() {
    try {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const search = typeof window !== 'undefined' ? window.location.search : ''
      const params = new URLSearchParams((hash && hash.startsWith('#') ? hash.slice(1) : '') || search)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      
      // SECURITY FIX: Validate token format before using (prevents XSS via malformed tokens)
      const isValidJWTFormat = (token: string): boolean => {
        if (!token || typeof token !== 'string') return false
        // JWT format: three base64url parts separated by dots
        const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
        if (!jwtRegex.test(token)) return false
        // Additional check: token should not contain suspicious characters
        if (/<|>|"|'|;|%|script|iframe|onerror|onclick/.test(token)) return false
        return true
      }
      
      if (access_token && isValidJWTFormat(access_token)) {
        // Build a typed payload so we don't pass null to setSession (avoids TypeScript errors)
        // access_token is checked above; ensure refresh_token is always a string to satisfy setSession's type
        const payload: { access_token: string; refresh_token: string } = { 
          access_token: access_token!, 
          refresh_token: (refresh_token && isValidJWTFormat(refresh_token)) ? refresh_token : '' 
        }
        // setSession will populate the client with the authenticated session so getUser works
        await supabase.auth.setSession(payload)
        return true
      } else if (access_token) {
        // Token format validation failed - potential attack
        console.warn('Invalid token format detected in URL parameters')
        return false
      }
    } catch (e) {
      // ignore
    }
    return false
  },


  async createProfileIfMissing(user: any) {
    // Use maybeSingle() to avoid throwing if no row exists, and then upsert to avoid conflicts
    const { data: existing, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      // Log and continue - we don't want profile creation errors to block signin
      // eslint-disable-next-line no-console
      console.warn('Error checking existing profile', error)
    }

    if (!existing) {
      // Determine role: prefer auth user metadata, fallback to localStorage
      const roleFromMeta = (user.user_metadata && user.user_metadata.role) || null
      let role = roleFromMeta
      if (!role) {
        try {
          role = localStorage.getItem(`pending_role_${user.email}`) || 'candidate'
          localStorage.removeItem(`pending_role_${user.email}`)
        } catch (e) {
          role = 'candidate'
        }
      }

      // Use upsert with onConflict to make this idempotent and avoid 409 errors when concurrent
      await supabase.from('users').upsert([{ id: user.id, email: user.email, role }], { onConflict: 'id' }).select()

      // If candidate, also create candidate_profiles record
      if (role === 'candidate') {
        // Try to create candidate profile, but don't fail if it already exists
        try {
          await supabase.from('candidate_profiles').insert([{
            user_id: user.id,
            first_name: '',
            last_name: '',
            profile_complete: false,
          }]).select()
        } catch (e) {
          // Ignore if already exists
        }
      }
    }
  },

  // Record confirmation timestamp if not already set. Returns true when it was set now, false if it existed already.
  async markEmailConfirmedIfMissing(user: any) {
    // Ensure the profile exists first
    await this.createProfileIfMissing(user).catch(() => {})

    const { data, error } = await supabase
      .from('users')
      .select('confirmed_at')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // Ignore transient errors and return false so we don't block UX
    }

    const already = data && data.confirmed_at
    if (!already) {
      await supabase.from('users').update({ confirmed_at: new Date().toISOString() }).eq('id', user.id)
      return true
    }
    return false
  },

  // Send password reset email
  async resetPassword(email: string) {
    // SECURITY: Check rate limiting
    if (!rateLimitService.checkLimit('resetPassword', email)) {
      const resetTime = rateLimitService.getResetTime('resetPassword', email)
      throw new Error(`Previše zahteva za resetovanje lozinke. Pokušajte ponovo za ${resetTime} sekundi.`)
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_SITE_URL}/reset-password`,
    })
    if (error) throw error
  },

  // Update user password
  async updatePassword(newPassword: string) {
    const user = await this.getCurrentUser()
    if (!user?.email) throw new Error('No user logged in')

    // SECURITY: Check rate limiting
    if (!rateLimitService.checkLimit('updatePassword', user.email)) {
      const resetTime = rateLimitService.getResetTime('updatePassword', user.email)
      throw new Error(`Previše pokušaja promene lozinke. Pokušajte ponovo za ${resetTime} sekundi.`)
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      // Supabase vraća specifičnu grešku ako je ista lozinka
      if (error.message && error.message.includes('different')) {
        throw new Error('Nova lozinka mora biti drugačita od stare lozinke')
      }
      throw error
    }

    // Clear rate limit on successful password update
    rateLimitService.clearRateLimit('updatePassword', user.email)

    // Mark this password reset as used so the same link cannot be used again
    if (user) {
      try {
        await supabase.from('users').update({ password_reset_used: true, password_reset_at: new Date().toISOString() }).eq('id', user.id)
      } catch (e) {
        // ignore update errors
      }
    }
  },

  // Check if password reset token has already been used
  async checkPasswordResetUsed(user: any) {
    const { data, error } = await supabase
      .from('users')
      .select('password_reset_used')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !data) {
      return false
    }

    return data.password_reset_used === true
  },
}

