import { NextRequest, NextResponse } from 'next/server'

// Global OTP store shared across routes
if (!(global as any).__OTP_STORE__) {
  (global as any).__OTP_STORE__ = new Map()
}

function getStore(): Map<string, { otp: string; expires: number; attempts: number; lastSent: number }> {
  return (global as any).__OTP_STORE__
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { phone_number } = await req.json()

    if (!phone_number || !/^[6-9]\d{9}$/.test(phone_number.toString())) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 })
    }

    const store = getStore()
    const existing = store.get(phone_number)
    
    // Rate limit: 3 attempts per 10 min
    if (existing && existing.attempts >= 5 && Date.now() < existing.expires) {
      return NextResponse.json({ error: 'Too many OTP requests. Please wait before trying again.' }, { status: 429 })
    }

    // Cooldown: 30 seconds between resends
    if (existing && existing.lastSent && (Date.now() - existing.lastSent) < 30000) {
      return NextResponse.json({ error: 'Please wait 30 seconds before requesting another OTP.' }, { status: 429 })
    }

    const otp = generateOTP()
    const expires = Date.now() + 10 * 60 * 1000

    store.set(phone_number, {
      otp,
      expires,
      attempts: (existing?.attempts || 0) + 1,
      lastSent: Date.now()
    })

    // Send via MSG91
    const authKey = process.env.MSG91_AUTH_KEY
    if (authKey) {
      try {
        const templateId = process.env.MSG91_TEMPLATE_ID || ''
        const url = `https://api.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${phone_number}&authkey=${authKey}&otp=${otp}&sender=URBHRS`
        const res = await fetch(url, { method: 'POST' })
        const result = await res.json()
        console.log('MSG91 response:', result)
      } catch (e) {
        console.error('MSG91 send error:', e)
      }
    }

    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json({
      success: true,
      message: `OTP sent to +91 ${phone_number}`,
      ...(isDev && { debug_otp: otp })
    })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }
}
