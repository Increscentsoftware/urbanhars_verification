'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getVerificationLabel, formatDate } from '@/lib/utils'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended'

export default function AdminDashboard() {
  const [technicians, setTechnicians] = useState<any[]>([])
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const router = useRouter()

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('admin_token') || ''
    try {
      const params = new URLSearchParams({ status: filter, search })
      const res = await fetch(`/api/admin/technicians?${params}`, {
        headers: { 'x-admin-token': token }
      })
      if (res.status === 401) { router.push('/admin'); return }
      const data = await res.json()
      setTechnicians(data.technicians || [])
      setCounts(data.counts || counts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => { fetchData() }, [fetchData])

  async function performAction(id: string, action: string) {
    setActionLoading(true)
    const token = localStorage.getItem('admin_token') || ''
    try {
      const res = await fetch('/api/admin/technicians', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ id, action, notes, approved_by: 'Admin' })
      })
      const data = await res.json()
      if (data.success) {
        setSelected(data.technician)
        fetchData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  const statusBadge = (status: string) => (
    <span className={`status-badge status-${status}`}>
      {status === 'pending' ? '⏳ Pending' : status === 'approved' ? '✅ Approved' : status === 'rejected' ? '❌ Rejected' : '🔒 Suspended'}
    </span>
  )

  const StatCard = ({ label, count, icon, color, statusKey }: any) => (
    <button
      onClick={() => setFilter(statusKey)}
      className="bg-white rounded-xl p-3 border-2 text-left transition-all hover:shadow-md"
      style={{ borderColor: filter === statusKey ? color : 'transparent' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span className="text-lg font-bold" style={{ color }}>{count}</span>
      </div>
      <p style={{ fontSize: '11px' }} className="text-gray-500 font-medium">{label}</p>
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>U</div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">UrbanHars Admin</h1>
              <p className="text-xs text-gray-400">Partner Management Portal</p>
            </div>
          </div>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Pending Review" count={counts.pending} icon="⏳" color="#d97706" statusKey="pending" />
          <StatCard label="Approved" count={counts.approved} icon="✅" color="#16a34a" statusKey="approved" />
          <StatCard label="Rejected" count={counts.rejected} icon="❌" color="#dc2626" statusKey="rejected" />
          <StatCard label="Suspended" count={counts.suspended} icon="🔒" color="#6b7280" statusKey="suspended" />
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="input-field flex-1"
              style={{ fontSize: '13px', padding: '9px 14px' }}
              placeholder="Search by name, phone, or reference ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="input-field sm:w-44"
              style={{ fontSize: '13px', padding: '9px 14px' }}
              value={filter}
              onChange={e => setFilter(e.target.value as StatusFilter)}
            >
              <option value="all">All Technicians ({counts.total})</option>
              <option value="pending">Pending ({counts.pending})</option>
              <option value="approved">Approved ({counts.approved})</option>
              <option value="rejected">Rejected ({counts.rejected})</option>
              <option value="suspended">Suspended ({counts.suspended})</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : technicians.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500">No technicians found</p>
              </div>
            ) : technicians.map(tech => (
              <button
                key={tech.id}
                onClick={() => { setSelected(tech); setNotes(tech.approval_notes || '') }}
                className="w-full bg-white rounded-xl p-3 shadow-sm border-2 text-left transition-all hover:shadow-md"
                style={{ borderColor: selected?.id === tech.id ? '#E01E1E' : 'transparent' }}
              >
                <div className="flex items-center gap-2.5">
                  {tech.profile_photo_url ? (
                    <img src={tech.profile_photo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0" style={{ fontSize: '14px' }}>👤</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p style={{ fontSize: '13px' }} className="font-semibold text-gray-900">{tech.full_name}</p>
                      {statusBadge(tech.verification_status)}
                    </div>
                    <p style={{ fontSize: '11px' }} className="text-gray-400 font-mono">{tech.reference_id} · {tech.phone_number}</p>
                    <p style={{ fontSize: '11px' }} className="text-gray-400 mt-0.5">{tech.city}, {tech.state} · Score: {tech.verification_score}/100</p>
                  </div>
                  <span style={{ fontSize: '12px' }} className="text-gray-300">›</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="space-y-4">
            {selected ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    {selected.profile_photo_url ? (
                      <img src={selected.profile_photo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl">👤</div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selected.full_name}</p>
                      <p className="text-xs font-mono text-blue-600">{selected.reference_id}</p>
                      {statusBadge(selected.verification_status)}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">+91 {selected.phone_number}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{selected.city}, {selected.state}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium">{selected.experience}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Registered</span><span className="font-medium">{formatDate(selected.created_at)}</span></div>
                  </div>

                  {/* Score */}
                  <div className="mt-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500 font-semibold">Trust Score</span>
                      <span className="text-sm font-bold text-blue-600">{selected.verification_score}/100</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${selected.verification_score}%`, background: selected.verification_score >= 80 ? '#16a34a' : selected.verification_score >= 50 ? '#d97706' : '#dc2626' }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: getVerificationLabel(selected.verification_score).color }}>
                      {getVerificationLabel(selected.verification_score).label}
                    </p>
                  </div>
                </div>

                {/* Documents */}
                <div className="p-5 border-b border-gray-100">
                  <p className="font-semibold text-gray-700 mb-3 text-sm">Documents</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Aadhaar Front', url: selected.aadhaar_front_url },
                      { label: 'Aadhaar Back', url: selected.aadhaar_back_url },
                      { label: 'Selfie', url: selected.selfie_url },
                    ].map(doc => (
                      <div key={doc.label} className="rounded-xl overflow-hidden border border-gray-100">
                        {doc.url ? (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            {doc.url.endsWith('.pdf') ? (
                              <div className="h-20 bg-gray-50 flex flex-col items-center justify-center gap-1">
                                <span className="text-2xl">📄</span>
                                <span className="text-xs text-blue-600 font-medium">{doc.label}</span>
                              </div>
                            ) : (
                              <div className="relative">
                                <img src={doc.url} alt={doc.label} className="w-full h-20 object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">{doc.label}</div>
                              </div>
                            )}
                          </a>
                        ) : (
                          <div className="h-20 bg-gray-50 flex flex-col items-center justify-center gap-1">
                            <span className="text-gray-300 text-2xl">❌</span>
                            <span className="text-xs text-gray-400">{doc.label}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {selected.latitude && (
                      <a
                        href={`https://maps.google.com/?q=${selected.latitude},${selected.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-20 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center justify-center gap-1 hover:bg-green-100 transition-colors"
                      >
                        <span className="text-2xl">📍</span>
                        <span className="text-xs text-green-600 font-medium">View Location</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5">
                  <p className="font-semibold text-gray-700 mb-2 text-sm">Admin Notes</p>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="input-field text-sm"
                    rows={2}
                    placeholder="Add notes for rejection or approval..."
                    style={{ resize: 'none' }}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={() => performAction(selected.id, 'approve')}
                      disabled={actionLoading || selected.verification_status === 'approved'}
                      className="py-2 px-4 bg-green-500 text-white font-semibold rounded-xl text-sm hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => performAction(selected.id, 'reject')}
                      disabled={actionLoading || selected.verification_status === 'rejected'}
                      className="py-2 px-4 bg-red-500 text-white font-semibold rounded-xl text-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => performAction(selected.id, 'suspend')}
                      disabled={actionLoading}
                      className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-xl text-sm hover:bg-gray-600 disabled:opacity-40 transition-colors"
                    >
                      🔒 Suspend
                    </button>
                    <button
                      onClick={() => performAction(selected.id, 'restore')}
                      disabled={actionLoading}
                      className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-xl text-sm hover:bg-blue-600 disabled:opacity-40 transition-colors"
                    >
                      🔄 Restore
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="text-5xl mb-3">👈</div>
                <p className="text-gray-500 text-sm">Select a technician to view details and take action</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
