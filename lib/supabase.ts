import { createClient } from '@supabase/supabase-js'

function clean(val: string | undefined): string {
  return (val || '').replace(/^﻿/, '').trim()
}

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createServiceClient() {
  return createClient(
    supabaseUrl,
    clean(process.env.SUPABASE_SERVICE_ROLE_KEY) || supabaseAnonKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export type TechnicianStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface Technician {
  id: string
  reference_id: string
  full_name: string
  dob: string
  gender: string
  phone_number: string
  phone_verified: boolean
  otp_verified_at: string
  email?: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  profile_photo_url?: string
  service_categories: string[]
  experience: string
  current_occupation?: string
  previous_company?: string
  languages_known?: string[]
  service_areas: string[]
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
  emergency_contact_alternate_phone?: string
  aadhaar_front_url?: string
  aadhaar_back_url?: string
  selfie_url?: string
  vehicle_available: boolean
  vehicle_number?: string
  latitude?: number
  longitude?: number
  location_timestamp?: string
  terms_accepted: boolean
  terms_accepted_at?: string
  privacy_consent: boolean
  gps_consent: boolean
  document_consent: boolean
  criminal_declaration: boolean
  criminal_declaration_at?: string
  verification_score: number
  verification_status: TechnicianStatus
  approval_notes?: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}
