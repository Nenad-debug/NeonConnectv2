import { supabase } from './supabaseClient'

export const authService = {
  async signup(email: string, password: string, role: 'candidate' | 'employer') {
    // Try to include role in user_metadata so we can create the profile later when user signs in
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`,
      },
    })

    if (error) throw error

    // If a session was returned, the user is signed in and we can create the profile now
    if (data.user && data.session) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email, role }])

      if (profileError) throw profileError
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // After successful sign-in, ensure profile exists (RLS requires auth.uid() = id)
    if (data.user) {
      await this.createProfileIfMissing(data.user)
    }

    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
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
      if (access_token) {
        // Build a typed payload so we don't pass null to setSession (avoids TypeScript errors)
        // access_token is checked above; ensure refresh_token is always a string to satisfy setSession's type
        const payload: { access_token: string; refresh_token: string } = { access_token: access_token!, refresh_token: refresh_token ?? '' }
        // setSession will populate the client with the authenticated session so getUser works
        await supabase.auth.setSession(payload)
        return true
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_SITE_URL}/reset-password`,
    })
    if (error) throw error
  },

  // Update user password via serverless function (safer, includes validation)
  async updatePassword(newPassword: string) {
    // Get current auth token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.access_token) {
      throw new Error('Nije moguće pristupiti sesiji')
    }

    // Call serverless function to change password (safer backend validation)
    const response = await fetch('/.netlify/functions/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ newPassword }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Greška pri promeni lozinke')
    }

    return result
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

