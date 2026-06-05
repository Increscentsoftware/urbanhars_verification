'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface RegistrationData {
  // Step 1 - Phone
  phone_number: string
  phone_verified: boolean
  otp_verified_at?: string
  // Step 2 - Personal
  full_name: string
  dob: string
  gender: string
  email: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  pincode: string
  profile_photo_url: string
  profile_photo_file?: File
  // Step 3 - Service
  service_categories: string[]
  experience: string
  current_occupation: string
  previous_company: string
  languages_known: string[]
  service_areas: string[]
  // Step 4 - Emergency
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
  emergency_contact_alternate_phone: string
  // Step 5 - Documents
  aadhaar_front_url: string
  aadhaar_back_url: string
  aadhaar_front_file?: File
  aadhaar_back_file?: File
  // Step 6 - Selfie
  selfie_url: string
  selfie_file?: File
  // Step 6b - Vehicle
  vehicle_available: boolean
  vehicle_number: string
  // Step 7 - GPS
  latitude?: number
  longitude?: number
  location_timestamp?: string
  // Step 8 - Terms
  terms_accepted: boolean
  privacy_consent: boolean
  gps_consent: boolean
  document_consent: boolean
  criminal_declaration: boolean
  terms_accepted_at?: string
}

const defaultData: RegistrationData = {
  phone_number: '',
  phone_verified: false,
  full_name: '',
  dob: '',
  gender: '',
  email: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: 'Karnataka',
  pincode: '',
  profile_photo_url: '',
  service_categories: [],
  experience: '',
  current_occupation: '',
  previous_company: '',
  languages_known: [],
  service_areas: [],
  emergency_contact_name: '',
  emergency_contact_relationship: '',
  emergency_contact_phone: '',
  emergency_contact_alternate_phone: '',
  aadhaar_front_url: '',
  aadhaar_back_url: '',
  selfie_url: '',
  vehicle_available: false,
  vehicle_number: '',
  terms_accepted: false,
  privacy_consent: false,
  gps_consent: false,
  document_consent: false,
  criminal_declaration: false,
}

interface RegistrationContextType {
  data: RegistrationData
  updateData: (updates: Partial<RegistrationData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  resetData: () => void
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined)

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegistrationData>(defaultData)
  const [currentStep, setCurrentStep] = useState(1)

  const updateData = (updates: Partial<RegistrationData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const resetData = () => {
    setData(defaultData)
    setCurrentStep(1)
  }

  return (
    <RegistrationContext.Provider value={{ data, updateData, currentStep, setCurrentStep, resetData }}>
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const context = useContext(RegistrationContext)
  if (!context) throw new Error('useRegistration must be used within RegistrationProvider')
  return context
}
