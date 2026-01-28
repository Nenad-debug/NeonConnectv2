import { supabase } from './supabaseClient'
import { Job } from '../types'

export const jobService = {
  async getAllJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Job[]
  },

  async getJobById(id: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Job
  },

  async searchJobs(query: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('status', 'active')
    
    if (error) throw error
    return data as Job[]
  },

  async createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'> & {
    salary_currency?: string
    salary_type?: 'yearly' | 'monthly' | 'hourly' | 'negotiable'
    remote?: boolean
    experience_level?: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'intern'
    skills?: string[]
    tags?: string[]
    location?: { city?: string; country?: string; lat?: number; lng?: number }
    slug?: string
    published_at?: string
    expires_at?: string
  }) {
    const payload = {
      ...job,
      salary_type: job.salary_type ?? 'negotiable',
      remote: job.remote ?? false,
      experience_level: job.experience_level ?? 'mid',
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([payload])
      .select()

    if (error) throw error
    return data[0] as Job
  },


  async updateJob(id: string, updates: Partial<Job>) {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0] as Job
  },

  async deleteJob(id: string) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },
}
