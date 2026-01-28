import { supabase } from './supabaseClient'

interface CandidateProfile {
  firstName: string
  lastName: string
  bio: string
  phone: string
  location: string
  experienceYears: number
  skills: string[]
  education: string[]
  certifications: string[]
  languages: string[]
  website?: string
  githubUrl?: string
  linkedinUrl?: string
  profileImage?: File
}

export const profileService = {
  /**
   * Upload profile image to Supabase Storage
   */
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    if (!file) throw new Error('No file provided')

    // Create file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-profile-${Date.now()}.${fileExt}`
    const filePath = `profiles/${userId}/${fileName}`

    try {
      console.log(`📸 [PROFILE SERVICE] Uploading image to ${filePath}`)

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log(`✅ [PROFILE SERVICE] Image uploaded successfully: ${publicUrl}`)
      return publicUrl
    } catch (err: any) {
      console.error('❌ [PROFILE SERVICE] Image upload failed:', err)
      throw new Error(`Failed to upload image: ${err.message}`)
    }
  },

  /**
   * Create or update candidate profile
   */
  async saveCandidateProfile(
    userId: string,
    profile: CandidateProfile
  ): Promise<any> {
    try {
      console.log(`📝 [PROFILE SERVICE] Saving candidate profile for user ${userId}`)

      // Upload image if provided
      let profileImageUrl = null
      if (profile.profileImage) {
        profileImageUrl = await this.uploadProfileImage(userId, profile.profileImage)
      }

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      const profileData = {
        user_id: userId,
        first_name: profile.firstName,
        last_name: profile.lastName,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        experience_years: profile.experienceYears,
        skills: profile.skills,
        education: profile.education,
        certifications: profile.certifications,
        languages: profile.languages,
        website: profile.website || null,
        github_url: profile.githubUrl || null,
        linkedin_url: profile.linkedinUrl || null,
        profile_image_url: profileImageUrl,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      }

      let result

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('candidate_profiles')
          .update(profileData)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        result = data
        console.log(`✅ [PROFILE SERVICE] Profile updated successfully`)
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('candidate_profiles')
          .insert([profileData])
          .select()
          .single()

        if (error) throw error
        result = data
        console.log(`✅ [PROFILE SERVICE] Profile created successfully`)
      }

      return result
    } catch (err: any) {
      console.error('❌ [PROFILE SERVICE] Failed to save profile:', err)
      throw new Error(`Failed to save profile: ${err.message}`)
    }
  },

  /**
   * Get candidate profile
   */
  async getCandidateProfile(userId: string): Promise<any> {
    try {
      console.log(`🔍 [PROFILE SERVICE] Fetching candidate profile for user ${userId}`)

      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`ℹ️ [PROFILE SERVICE] No profile found for user ${userId}`)
          return null
        }
        throw error
      }

      console.log(`✅ [PROFILE SERVICE] Profile fetched successfully`)
      return data
    } catch (err: any) {
      console.error('❌ [PROFILE SERVICE] Failed to fetch profile:', err)
      throw new Error(`Failed to fetch profile: ${err.message}`)
    }
  },

  /**
   * Update profile completion status
   */
  async updateProfileCompleteStatus(
    userId: string,
    isComplete: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('candidate_profiles')
        .update({ profile_complete: isComplete })
        .eq('user_id', userId)

      if (error) throw error

      console.log(
        `✅ [PROFILE SERVICE] Profile complete status updated to ${isComplete}`
      )
    } catch (err: any) {
      console.error('❌ [PROFILE SERVICE] Failed to update profile status:', err)
      throw new Error(`Failed to update profile status: ${err.message}`)
    }
  },

  /**
   * Check if profile is complete
   */
  async isProfileComplete(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('profile_complete')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return false
        throw error
      }

      return data?.profile_complete || false
    } catch (err: any) {
      console.error('❌ [PROFILE SERVICE] Failed to check profile status:', err)
      return false
    }
  },
}
