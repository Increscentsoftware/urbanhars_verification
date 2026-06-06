import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { phone_number, otp } = await req.json()

    if (!phone_number || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: record } = await supabase
      .from('otp_sessions')
      .select('*')
      .eq('phone_number', phone_number)
      .single()

    if (!record) {
      return NextResponse.json({ error: 'No OTP found for this number. Please request a new OTP.' }, { status: 400 })
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      await supabase.from('otp_sessions').delete().eq('phone_number', phone_number)
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    if (record.otp !== otp.toString()) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })
    }

    // Valid — clear OTP
    await supabase.from('otp_sessions').delete().eq('phone_number', phone_number)

    return NextResponse.json({
      success: true,
      verified: true,
      verified_at: new Date().toISOString()
    })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}
