'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getVerificationLabel, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [technician, setTechnician] = useState<any>(null)
  const [error, setError] = useState('')
  const [trackingActive, setTrackingActive] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    if (!technician || !phone) return

    function sendLocation(lat: number, lng: number) {
      const now = Date.now()
      if (now - lastUpdateRef.current < 30000) return
      lastUpdateRef.current = now
      fetch('/api/technician', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, latitude: lat, longitude: lng }),
      }).catch(() => {})
    }

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setTrackingActive(true)
          sendLocation(pos.coords.latitude, pos.coords.longitude)
        },
        () => setTrackingActive(false),
        { enableHighAccuracy: true, maximumAge: 15000 }
      )
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setTrackingActive(false)
    }
  }, [technician, phone])

  async function fetchStatus() {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/technician?phone=${phone}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No registration found for this number')
        setTechnician(null)
        return
      }
      setTechnician(data.technician)
    } catch {
      setError('Failed to fetch data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const statusConfig: Record<string, { icon: string; label: string; desc: string; color: string; bg: string; border: string }> = {
    pending: { icon: '⏳', label: 'Pending Verification', desc: 'Your application is under review. Expected: 24–48 hours.', color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
    approved: { icon: '✅', label: 'Approved & Active', desc: 'Congratulations! You are a verified Urban Hars partner.', color: '#065f46', bg: '#f0fdf4', border: '#86efac' },
    rejected: { icon: '❌', label: 'Application Rejected', desc: 'Your application was not approved. See the reason below.', color: '#991b1b', bg: '#fff1f2', border: '#fecaca' },
    suspended: { icon: '🔒', label: 'Account Suspended', desc: 'Your account is suspended. Please contact support.', color: '#374151', bg: '#f9fafb', border: '#e5e7eb' },
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #fff 40%, #f8fafc 100%)' }}>
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors shadow-sm">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <Image src="/uh-logo.svg" alt="UH" width={32} height={32} />
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Application Status</h1>
              <p className="text-gray-400 text-xs">Urban Hars Partner Portal</p>
            </div>
          </div>
        </div>

        {/* Phone Lookup */}
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
          <p className="font-bold text-gray-900 mb-1">Check Your Status</p>
          <p className="text-gray-400 text-sm mb-4">Enter the mobile number you registered with</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm border-r border-gray-200 pr-3 font-semibold">+91</div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError('') }}
                onKeyDown={e => e.key === 'Enter' && fetchStatus()}
                className="input-field"
                style={{ paddingLeft: '60px' }}
                placeholder="9876543210"
              />
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="px-5 py-3 text-white font-semibold rounded-xl disabled:opacity-50 transition-all hover:-translate-y-0.5 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #E01E1E, #c01717)', boxShadow: '0 2px 8px rgba(224,30,30,0.25)' }}
            >
              {loading
                ? <svg width="16" height="16" className="animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg>
                : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
              }
            </button>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ef4444" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {technician && (
          <div className="space-y-4 fade-in">
            {/* Status Card */}
            {(() => {
              const s = statusConfig[technician.verification_status] ?? statusConfig.pending
              return (
                <div className="rounded-2xl p-5 border-2" style={{ background: s.bg, borderColor: s.border }}>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl leading-none mt-0.5">{s.icon}</div>
                    <div>
                      <p className="font-bold text-base" style={{ color: s.color }}>{s.label}</p>
                      <p className="text-sm mt-1" style={{ color: s.color, opacity: 0.8 }}>{s.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Location Tracking Indicator */}
            {trackingActive && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <p className="text-green-700 text-xs font-semibold">Live location tracking active — updates every 30 seconds</p>
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <div className="flex items-center gap-4 mb-5">
                {technician.profile_photo_url ? (
                  <img src={technician.profile_photo_url} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-red-100" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fca5a5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900 text-lg leading-tight">{technician.full_name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-1 bg-gray-50 px-2 py-1 rounded-lg inline-block">{technician.reference_id}</p>
                </div>
              </div>

              {/* Trust Score */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Trust Score</span>
                  <span className="text-lg font-bold" style={{ color: technician.verification_score >= 80 ? '#16a34a' : technician.verification_score >= 50 ? '#d97706' : '#dc2626' }}>
                    {technician.verification_score}<span className="text-sm text-gray-400 font-medium">/100</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${technician.verification_score}%`,
                      background: technician.verification_score >= 80 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : technician.verification_score >= 50 ? 'linear-gradient(90deg, #d97706, #f59e0b)' : 'linear-gradient(90deg, #dc2626, #ef4444)'
                    }}
                  />
                </div>
                <p className="text-xs mt-1.5 font-medium" style={{ color: getVerificationLabel(technician.verification_score).color }}>
                  {getVerificationLabel(technician.verification_score).label}
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <p className="font-bold text-gray-900 mb-4">Verification Checklist</p>
              <div className="space-y-3">
                {[
                  { label: 'Phone Verified', done: true, points: 20 },
                  { label: 'Profile Photo', done: !!technician.profile_photo_url, points: 10 },
                  { label: 'Aadhaar Uploaded', done: !!technician.aadhaar_front_url, points: 20 },
                  { label: 'Selfie Uploaded', done: !!technician.selfie_url, points: 20 },
                  { label: 'GPS Location', done: !!technician.latitude, points: 10 },
                  { label: 'Emergency Contact', done: !!technician.emergency_contact_name, points: 10 },
                  { label: 'Vehicle Info', done: true, points: 10 },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {item.done
                          ? <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#16a34a"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          : <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#9ca3af"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        }
                      </div>
                      <span className={`text-sm font-medium ${item.done ? 'text-gray-800' : 'text-gray-400'}`}>{item.label}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${item.done ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>+{item.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection Reason */}
            {technician.verification_status === 'rejected' && technician.approval_notes && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="font-semibold text-red-800 mb-1">Rejection Reason</p>
                <p className="text-red-700 text-sm">{technician.approval_notes}</p>
                <Link href="/register" className="inline-flex items-center gap-1 mt-3 text-sm font-bold" style={{ color: '#E01E1E', textDecoration: 'none' }}>
                  Re-apply Now
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 pb-4">
              Registered on {formatDate(technician.created_at)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
