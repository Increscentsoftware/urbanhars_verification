import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { phone_number } = await req.json()

    if (!phone_number || !/^[6-9]\d{9}$/.test(phone_number.toString())) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check existing OTP for rate limiting
    const { data: existing } = await supabase
      .from('otp_sessions')
      .select('*')
      .eq('phone_number', phone_number)
      .single()

    if (existing) {
      const lastSent = new Date(existing.last_sent_at).getTime()
      if (Date.now() - lastSent < 30000) {
        return NextResponse.json({ error: 'Please wait 30 seconds before requesting another OTP.' }, { status: 429 })
      }
      if (existing.attempts >= 5 && new Date(existing.expires_at).getTime() > Date.now()) {
        return NextResponse.json({ error: 'Too many OTP requests. Please wait before trying again.' }, { status: 429 })
      }
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: upsertError } = await supabase.from('otp_sessions').upsert({
      phone_number,
      otp,
      expires_at: expiresAt,
      attempts: (existing?.attempts || 0) + 1,
      last_sent_at: new Date().toISOString(),
    })

    if (upsertError) {
      console.error('OTP store error:', JSON.stringify(upsertError))
      return NextResponse.json({ error: 'Failed to generate OTP. Please try again.' }, { status: 500 })
    }

    console.log('OTP stored successfully for', phone_number)

    // Send via MSG91 WhatsApp — authkey in query param to avoid ByteString header error
    const authKey = (process.env.MSG91_AUTH_KEY || '').replace(/^﻿/, '').trim()
    const waNumber = (process.env.MSG91_WA_NUMBER || '919611318546').replace(/^﻿/, '').trim()
    const waTemplate = (process.env.MSG91_WA_TEMPLATE || 'urbanhars').replace(/^﻿/, '').trim()

    if (authKey) {
      try {
        const res = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authkey': authKey,
          },
          body: JSON.stringify({
            integrated_number: waNumber,
            content_type: 'template',
            payload: {
              messaging_product: 'whatsapp',
              type: 'template',
              template: {
                name: waTemplate,
                language: { code: 'en', policy: 'deterministic' },
                namespace: '5f151231_bda0_454d_bc6c_39533e2a673a',
                to_and_components: [
                  {
                    to: [`91${phone_number}`],
                    components: {
                      body_1: { type: 'text', value: otp },
                      button_1: { subtype: 'url', type: 'text', value: otp },
                    },
                  },
                ],
              },
            },
          }),
        })
        const text = await res.text()
        console.log('MSG91 WhatsApp response:', text)
      } catch (e) {
        console.error('MSG91 WhatsApp send error:', String(e))
      }
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to +91 ${phone_number}`,
    })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }
}
