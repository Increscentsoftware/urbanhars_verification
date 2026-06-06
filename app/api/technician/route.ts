import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateReferenceId, calculateVerificationScore } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()

    const data = await req.json()

    // Validate required fields
    const required = ['phone_number', 'full_name', 'dob', 'gender', 'address_line1', 'city', 'state', 'pincode']
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate emergency contact doesn't match technician phone
    if (data.emergency_contact_phone === data.phone_number) {
      return NextResponse.json({ error: 'Emergency contact cannot be the same as your phone number' }, { status: 400 })
    }

    // Check if phone already registered
    const { data: existing } = await supabase
      .from('technicians')
      .select('id, verification_status')
      .eq('phone_number', data.phone_number)
      .single()

    if (existing) {
      return NextResponse.json({
        error: 'This phone number is already registered.',
        existing_status: existing.verification_status
      }, { status: 409 })
    }

    const reference_id = generateReferenceId()

    const verification_score = calculateVerificationScore({
      phone_verified: true,
      profile_photo_url: data.profile_photo_url,
      aadhaar_front_url: data.aadhaar_front_url,
      selfie_url: data.selfie_url,
      latitude: data.latitude,
      emergency_contact_name: data.emergency_contact_name,
      vehicle_available: data.vehicle_available,
    })

    const technicianRecord = {
      reference_id,
      full_name: data.full_name,
      dob: data.dob,
      gender: data.gender,
      phone_number: data.phone_number,
      phone_verified: true,
      otp_verified_at: data.otp_verified_at || new Date().toISOString(),
      email: data.email || null,
      address_line1: data.address_line1,
      address_line2: data.address_line2 || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      profile_photo_url: data.profile_photo_url || null,
      service_categories: data.service_categories || [],
      experience: data.experience || null,
      current_occupation: data.current_occupation || null,
      previous_company: data.previous_company || null,
      languages_known: data.languages_known || [],
      service_areas: data.service_areas || [],
      emergency_contact_name: data.emergency_contact_name || null,
      emergency_contact_relationship: data.emergency_contact_relationship || null,
      emergency_contact_phone: data.emergency_contact_phone || null,
      emergency_contact_alternate_phone: data.emergency_contact_alternate_phone || null,
      aadhaar_front_url: data.aadhaar_front_url || null,
      aadhaar_back_url: data.aadhaar_back_url || null,
      selfie_url: data.selfie_url || null,
      vehicle_available: data.vehicle_available || false,
      vehicle_number: data.vehicle_number || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      location_timestamp: data.location_timestamp || null,
      terms_accepted: data.terms_accepted || false,
      terms_accepted_at: data.terms_accepted ? new Date().toISOString() : null,
      privacy_consent: data.privacy_consent || false,
      gps_consent: data.gps_consent || false,
      document_consent: data.document_consent || false,
      criminal_declaration: data.criminal_declaration || false,
      criminal_declaration_at: data.criminal_declaration ? new Date().toISOString() : null,
      verification_score,
      verification_status: 'pending',
    }

    const { data: inserted, error } = await supabase
      .from('technicians')
      .insert(technicianRecord)
      .select()
      .single()

    if (error) {
      console.error('DB insert error:', error)
      return NextResponse.json({ error: 'Registration failed: ' + error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reference_id,
      verification_score,
      message: 'Registration submitted successfully! We will verify your details within 24-48 hours.'
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { phone_number, latitude, longitude } = await req.json()
    if (!phone_number || latitude == null || longitude == null) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const supabase = createServiceClient()
    const { error } = await supabase.from('technicians').update({
      latitude,
      longitude,
      location_timestamp: new Date().toISOString(),
    }).eq('phone_number', phone_number)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('technicians')
      .select('id, reference_id, full_name, verification_status, verification_score, profile_photo_url, approval_notes, created_at, service_categories, experience, city, state, aadhaar_front_url, aadhaar_back_url, selfie_url, latitude, longitude, emergency_contact_name')
      .eq('phone_number', phone)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'No registration found for this phone number.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, technician: data })
  } catch (err) {
    console.error('Fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
