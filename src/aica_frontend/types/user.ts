export interface UserProfile {
  id: string
  email: string
  created_at: string | null
  resume_uploaded?: boolean
  first_name?: string
  last_name?: string
  phone?: string
  location?: string
  bio?: string
  skills?: string[]
  experience?: string
  company?: string
}