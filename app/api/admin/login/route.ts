import { NextRequest, NextResponse } from 'next/server'

const ADMIN_CREDENTIALS = [
  { email: 'admin@urbanhars.com', password: 'UrbanHars@2024!' },
  { email: process.env.ADMIN_EMAIL || 'admin@urbanhars.com', password: process.env.ADMIN_PASSWORD || 'UrbanHars@2024!' },
]

const ADMIN_TOKEN = 'urbanhars-admin-2024'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const isValid = ADMIN_CREDENTIALS.some(
      c => c.email === email && c.password === password
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      token: ADMIN_TOKEN,
      admin: { email, name: 'UrbanHars Admin' }
    })

    response.cookies.set('admin_token', ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8 // 8 hours
    })

    return response
  } catch (err) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}
