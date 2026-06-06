'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getVerificationLabel, formatDate } from '@/lib/utils'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const [technicians, setTechnicians] = useState<any[]>([])
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [liveLocation, setLiveLocation] = useState<{ latitude: number; longitude: number; accuracy: number | null; updated_at: string } | null>(null)
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('admin_token') || ''
    try {
      const params = new URLSearchParams({ status: filter, search })
      const res = await fetch(`/api/admin/technicians?${params}`, { headers: { 'x-admin-token': token } })
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

  const fetchLiveLocation = useCallback(async (phone: string) => {
    const token = localStorage.getItem('admin_token') || ''
    try {
      const res = await fetch(`/api/admin/location?phone=${phone}`, { headers: { 'x-admin-token': token } })
      const data = await res.json()
      setLiveLocation(data.live ?? null)
    } catch {
      setLiveLocation(null)
    }
  }, [])

  useEffect(() => {
    if (liveIntervalRef.current) clearInterval(liveIntervalRef.current)
    setLiveLocation(null)
    if (!selected?.phone_number) return
    fetchLiveLocation(selected.phone_number)
    liveIntervalRef.current = setInterval(() => fetchLiveLocation(selected.phone_number), 30000)
    return () => { if (liveIntervalRef.current) clearInterval(liveIntervalRef.current) }
  }, [selected?.phone_number, fetchLiveLocation])

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
      if (data.success) { setSelected(data.technician); fetchData() }
    } catch (err) { console.error(err) }
    finally { setActionLoading(false) }
  }

  async function deleteTechnician() {
    if (!selected) return
    setActionLoading(true)
    const token = localStorage.getItem('admin_token') || ''
    try {
      const res = await fetch('/api/admin/technicians', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ id: selected.id })
      })
      if (res.ok) { setSelected(null); setDeleteConfirm(false); fetchData() }
    } catch (err) { console.error(err) }
    finally { setActionLoading(false) }
  }

  function logout() { localStorage.removeItem('admin_token'); router.push('/admin') }

  const statusBadge = (status: string) => (
    <span className={`status-badge status-${status}`}>
      {status === 'pending' ? '⏳ Pending' : status === 'approved' ? '✅ Approved' : status === 'rejected' ? '❌ Rejected' : '🔒 Suspended'}
    </span>
  )

  const StatCard = ({ label, count, icon, color, statusKey }: any) => (
    <button onClick={() => setFilter(statusKey)} className="bg-white rounded-xl p-3 border-2 text-left transition-all hover:shadow-md"
      style={{ borderColor: filter === statusKey ? color : 'transparent' }}>
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span className="text-lg font-bold" style={{ color }}>{count}</span>
      </div>
      <p style={{ fontSize: '11px' }} className="text-gray-500 font-medium">{label}</p>
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Delete Confirm Modal */}
      {deleteConfirm && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#dc2626"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Delete Technician?</h3>
              <p className="text-sm text-gray-500 mt-1">This will permanently delete <strong>{selected.full_name}</strong> ({selected.reference_id}). This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={deleteTechnician} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors">
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>U</div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">UrbanHars Admin</h1>
              <p className="text-xs text-gray-400">Partner Management Portal</p>
            </div>
          </div>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100">Sign Out</button>
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
            <input className="input-field flex-1" style={{ fontSize: '13px', padding: '9px 14px' }}
              placeholder="Search by name, phone, or reference ID..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="input-field sm:w-44" style={{ fontSize: '13px', padding: '9px 14px' }}
              value={filter} onChange={e => setFilter(e.target.value as StatusFilter)}>
              <option value="all">All Technicians ({counts.total})</option>
              <option value="pending">Pending ({counts.pending})</option>
              <option value="approved">Approved ({counts.approved})</option>
              <option value="rejected">Rejected ({counts.rejected})</option>
              <option value="suspended">Suspended ({counts.suspended})</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Technician List */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : technicians.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500">No technicians found</p>
              </div>
            ) : technicians.map(tech => (
              <button key={tech.id}
                onClick={() => { setSelected(tech); setNotes(tech.approval_notes || ''); setDeleteConfirm(false) }}
                className="w-full bg-white rounded-xl p-3 shadow-sm border-2 text-left transition-all hover:shadow-md"
                style={{ borderColor: selected?.id === tech.id ? '#E01E1E' : 'transparent' }}>
                <div className="flex items-center gap-2.5">
                  {tech.profile_photo_url
                    ? <img src={tech.profile_photo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0" />
                    : <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0" style={{ fontSize: '14px' }}>👤</div>}
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">

                {/* Header */}
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    {selected.profile_photo_url
                      ? <img src={selected.profile_photo_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />
                      : <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl">👤</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{selected.full_name}</p>
                      <p className="text-xs font-mono text-blue-600">{selected.reference_id}</p>
                      <div className="mt-1">{statusBadge(selected.verification_status)}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-500 font-semibold">Trust Score</span>
                      <span className="text-sm font-bold" style={{ color: selected.verification_score >= 80 ? '#16a34a' : selected.verification_score >= 50 ? '#d97706' : '#dc2626' }}>
                        {selected.verification_score}/100
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${selected.verification_score}%`, background: selected.verification_score >= 80 ? '#16a34a' : selected.verification_score >= 50 ? '#d97706' : '#dc2626' }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: getVerificationLabel(selected.verification_score).color }}>{getVerificationLabel(selected.verification_score).label}</p>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
                  <div className="space-y-2 text-xs">
                    <Row label="Phone" value={`+91 ${selected.phone_number}`} />
                    <Row label="Date of Birth" value={selected.dob ? new Date(selected.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
                    <Row label="Gender" value={selected.gender || '—'} />
                    <Row label="Email" value={selected.email || '—'} />
                    <Row label="Registered" value={formatDate(selected.created_at)} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Full Address</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {[selected.address_line1, selected.address_line2, selected.city, selected.state, selected.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Service Details</p>
                  <div className="space-y-2 text-xs mb-3">
                    <Row label="Experience" value={selected.experience || '—'} />
                    <Row label="Occupation" value={selected.current_occupation || '—'} />
                    <Row label="Previous Company" value={selected.previous_company || '—'} />
                    <Row label="Vehicle" value={selected.vehicle_available ? `Yes${selected.vehicle_number ? ` — ${selected.vehicle_number}` : ''}` : 'No'} />
                  </div>
                  {selected.service_categories?.length > 0 && (
                    <div className="mb-2.5">
                      <p className="text-xs text-gray-400 font-semibold mb-1.5">Service Categories</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.service_categories.map((c: string) => (
                          <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.service_areas?.length > 0 && (
                    <div className="mb-2.5">
                      <p className="text-xs text-gray-400 font-semibold mb-1.5">Service Areas</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.service_areas.map((a: string) => (
                          <span key={a} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.languages_known?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-1.5">Languages Known</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.languages_known.map((l: string) => (
                          <span key={l} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Emergency Contact</p>
                  <div className="space-y-2 text-xs">
                    <Row label="Name" value={selected.emergency_contact_name || '—'} />
                    <Row label="Relationship" value={selected.emergency_contact_relationship || '—'} />
                    <Row label="Phone" value={selected.emergency_contact_phone ? `+91 ${selected.emergency_contact_phone}` : '—'} />
                    <Row label="Alt. Phone" value={selected.emergency_contact_alternate_phone ? `+91 ${selected.emergency_contact_alternate_phone}` : '—'} />
                  </div>
                </div>

                {/* Consents */}
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Consents & Declarations</p>
                  <div className="space-y-1.5 text-xs">
                    {[
                      { label: 'Terms Accepted', value: selected.terms_accepted },
                      { label: 'Privacy Consent', value: selected.privacy_consent },
                      { label: 'GPS Consent', value: selected.gps_consent },
                      { label: 'Document Consent', value: selected.document_consent },
                      { label: 'No Criminal Record', value: selected.criminal_declaration },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-gray-400">{item.label}</span>
                        <span className={`font-semibold ${item.value ? 'text-green-600' : 'text-red-400'}`}>{item.value ? '✓ Yes' : '✗ No'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Verification Documents</p>
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
                      <a href={`https://maps.google.com/?q=${selected.latitude},${selected.longitude}`} target="_blank" rel="noopener noreferrer"
                        className="h-20 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center justify-center gap-1 hover:bg-blue-100 transition-colors">
                        <span className="text-2xl">📍</span>
                        <span className="text-xs text-blue-600 font-medium">Reg. Location</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Live Location */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Location</p>
                    {liveLocation && (
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                      </span>
                    )}
                  </div>
                  {liveLocation ? (
                    <div className="space-y-2">
                      <div className="bg-green-50 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Update</span>
                          <span className="font-semibold text-green-700">{new Date(liveLocation.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                        {liveLocation.accuracy != null && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Accuracy</span>
                            <span className="font-medium">±{Math.round(liveLocation.accuracy)}m</span>
                          </div>
                        )}
                      </div>
                      <a href={`https://maps.google.com/?q=${liveLocation.latitude},${liveLocation.longitude}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Open in Google Maps
                      </a>
                      <p className="text-center text-xs text-gray-400">Refreshes every 30 seconds</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs">No live location yet.</p>
                      <p className="text-gray-400 text-xs mt-0.5">Technician must open their dashboard to start sharing.</p>
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Actions</p>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field text-sm" rows={2}
                    placeholder="Add notes for rejection or approval..." style={{ resize: 'none' }} />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button onClick={() => performAction(selected.id, 'approve')} disabled={actionLoading || selected.verification_status === 'approved'}
                      className="py-2 px-4 bg-green-500 text-white font-semibold rounded-xl text-sm hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      ✅ Approve
                    </button>
                    <button onClick={() => performAction(selected.id, 'reject')} disabled={actionLoading || selected.verification_status === 'rejected'}
                      className="py-2 px-4 bg-red-500 text-white font-semibold rounded-xl text-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      ❌ Reject
                    </button>
                    <button onClick={() => performAction(selected.id, 'suspend')} disabled={actionLoading}
                      className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-xl text-sm hover:bg-gray-600 disabled:opacity-40 transition-colors">
                      🔒 Suspend
                    </button>
                    <button onClick={() => performAction(selected.id, 'restore')} disabled={actionLoading}
                      className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-xl text-sm hover:bg-blue-600 disabled:opacity-40 transition-colors">
                      🔄 Restore
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => setDeleteConfirm(true)} disabled={actionLoading}
                      className="w-full py-2 px-4 rounded-xl text-sm font-semibold text-red-600 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 disabled:opacity-40 transition-colors">
                      🗑️ Delete Technician
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
