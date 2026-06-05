import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReferenceId(): string {
  const num = Math.floor(10000 + Math.random() * 90000)
  return `UH-TECH-${num}`
}

export function calculateVerificationScore(data: Partial<{
  phone_verified: boolean
  profile_photo_url: string
  aadhaar_front_url: string
  selfie_url: string
  latitude: number
  emergency_contact_name: string
  vehicle_available: boolean
}>): number {
  let score = 0
  if (data.phone_verified) score += 20
  if (data.profile_photo_url) score += 10
  if (data.aadhaar_front_url) score += 20
  if (data.selfie_url) score += 20
  if (data.latitude) score += 10
  if (data.emergency_contact_name) score += 10
  if (data.vehicle_available !== undefined) score += 10
  return score
}

export function getVerificationLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Verified', color: 'text-green-600' }
  if (score >= 50) return { label: 'Partial Verification', color: 'text-yellow-600' }
  return { label: 'Incomplete', color: 'text-red-500' }
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export const SERVICE_CATEGORIES = [
  'Refrigerator Repair',
  'Washing Machine Repair',
  'AC Repair',
  'Microwave Repair',
  'RO Repair',
  'Electrician',
  'Plumber',
  'Other',
]

export const SERVICE_AREAS = [
  'Bangalore North',
  'Bangalore South',
  'Bangalore East',
  'Bangalore West',
  'Whitefield',
  'Electronic City',
  'Sarjapur',
  'Marathahalli',
  'Other',
]

export const EXPERIENCE_OPTIONS = [
  'Less than 1 Year',
  '1-3 Years',
  '3-5 Years',
  '5-10 Years',
  '10+ Years',
]

export const RELATIONSHIP_OPTIONS = [
  'Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Relative', 'Friend', 'Other',
]

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi', 'Lakshadweep',
  'Puducherry', 'Ladakh', 'Jammu and Kashmir',
]
