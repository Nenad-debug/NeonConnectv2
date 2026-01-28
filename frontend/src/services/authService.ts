import { supabase } from './supabaseClient'

export const authService = {
  async signup(email: string, password: string, role: 'candidate' | 'employer') {
    // Try to include role in user_metadata so we can create the profile later when user signs in
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        redirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`,
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
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
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
}

