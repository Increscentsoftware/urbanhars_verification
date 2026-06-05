import { NextRequest, NextResponse } from 'next/server'

if (!(global as any).__OTP_STORE__) {
  (global as any).__OTP_STORE__ = new Map()
}

function getStore(): Map<string, { otp: string; expires: number; attempts: number; lastSent: number }> {
  return (global as any).__OTP_STORE__
}

export async function POST(req: NextRequest) {
  try {
    const { phone_number, otp } = await req.json()

    if (!phone_number || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 })
    }

    const store = getStore()
    const record = store.get(phone_number)

    if (!record) {
      return NextResponse.json({ error: 'No OTP found for this number. Please request a new OTP.' }, { status: 400 })
    }

    if (Date.now() > record.expires) {
      store.delete(phone_number)
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    if (record.otp !== otp.toString()) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })
    }

    // Valid - clear OTP
    store.delete(phone_number)

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
