import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function getAdminClient() {
  return createServiceClient()
}

// Simple admin auth check
function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_token')?.value
  return token === process.env.ADMIN_SECRET_TOKEN || token === 'urbanhars-admin-2024'
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = getAdminClient()
    let query = supabase
      .from('technicians')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('verification_status', status)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%,reference_id.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Count by status
    const { data: stats } = await supabase
      .from('technicians')
      .select('verification_status')

    const counts = {
      total: stats?.length || 0,
      pending: stats?.filter(t => t.verification_status === 'pending').length || 0,
      approved: stats?.filter(t => t.verification_status === 'approved').length || 0,
      rejected: stats?.filter(t => t.verification_status === 'rejected').length || 0,
      suspended: stats?.filter(t => t.verification_status === 'suspended').length || 0,
    }

    return NextResponse.json({ success: true, technicians: data, counts, total: count })
  } catch (err) {
    console.error('Admin GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, action, notes, approved_by } = await req.json()

    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action are required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    let updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      approval_notes: notes || null,
      approved_by: approved_by || 'Admin',
    }

    if (action === 'approve') {
      updateData.verification_status = 'approved'
      updateData.approved_at = new Date().toISOString()
    } else if (action === 'reject') {
      updateData.verification_status = 'rejected'
    } else if (action === 'suspend') {
      updateData.verification_status = 'suspended'
    } else if (action === 'restore') {
      updateData.verification_status = 'pending'
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('technicians')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, technician: data })
  } catch (err) {
    console.error('Admin PATCH error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const supabase = getAdminClient()
    const { error } = await supabase.from('technicians').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin DELETE error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
