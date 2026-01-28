// User types
export interface User {
  id: string
  email: string
  role: 'candidate' | 'employer'
  created_at: string
}

export interface CandidateProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  bio: string
  skills: string[]
  resume_url?: string
  created_at: string
}

export interface EmployerProfile {
  id: string
  user_id: string
  company_name: string
  company_website?: string
  logo_url?: string
  description: string
  created_at: string
}

// Job types
export interface Job {
  id: string
  employer_id: string
  title: string
  description: string
  category: string
  salary_min?: number
  salary_max?: number
  location: string | { city?: string; country?: string; lat?: number; lng?: number }
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance'
  required_skills?: string[]
  skills?: string[]
  status: 'active' | 'closed' | 'draft'
  created_at: string
  updated_at: string
}

// Application types
export interface Application {
  id: string
  job_id: string
  candidate_id: string
  cover_letter?: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  created_at: string
}
