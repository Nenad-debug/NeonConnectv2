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

    // Create file path - simpler path without folder structure for RLS
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    try {
      console.log(`📸 [PROFILE SERVICE] Uploading image: ${fileName}`)

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

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
      console.log(`📝 [PROFILE SERVICE] Profile data:`, profile)

      // Upload image if provided
      let profileImageUrl = null
      if (profile.profileImage) {
        profileImageUrl = await this.uploadProfileImage(userId, profile.profileImage)
      }

      const profileDataToSave = {
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

      // Use UPSERT to avoid conflicts (insert or update)
      console.log(`📝 [PROFILE SERVICE] Upserting profile`)
      const { data, error } = await supabase
        .from('candidate_profiles')
        .upsert([profileDataToSave], {
          onConflict: 'user_id',
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ [PROFILE SERVICE] Upsert error:`, error)
        throw error
      }

      console.log(`✅ [PROFILE SERVICE] Profile saved successfully`)
      return data
    } catch (err: any) {
      console.error(`❌ [PROFILE SERVICE] Error saving profile:`, err)
      throw err
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
