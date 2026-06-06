import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_token')?.value
  return token === process.env.ADMIN_SECRET_TOKEN || token === 'urbanhars-admin-2024'
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('technician_locations')
    .select('latitude, longitude, accuracy, updated_at')
    .eq('phone_number', phone)
    .single()

  if (error || !data) return NextResponse.json({ live: null })
  return NextResponse.json({ live: data })
}
