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
        const payload: { access_token: string; refresh_token?: string } = { access_token }
        if (refresh_token) payload.refresh_token = refresh_token
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
    // Check if profile already exists
    const { data: existing, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "No rows found" from PostgREST - ignore
      // For other errors, rethrow
      // Note: Supabase client error codes may differ; adjust as needed
      // We'll continue silently to avoid blocking login on a transient error
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

      await supabase.from('users').insert([{ id: user.id, email: user.email, role }])
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
}

