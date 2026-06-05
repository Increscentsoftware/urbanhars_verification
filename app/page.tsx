import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #fff 40%, #f8fafc 100%)' }}>
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-5">
            <Image src="/uh-logo.svg" alt="Urban Hars Logo" width={56} height={56} priority />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Urban Hars</h1>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mt-1">
            Home Appliance Repair Services
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {[
            { icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, label: 'Fast Onboarding' },
            { icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, label: 'Verified Partners' },
            { icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: '24h Approval' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
              <span style={{ color: '#E01E1E', display: 'inline-flex' }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl p-8 space-y-3" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-900">Partner Portal</h2>
            <p className="text-gray-400 text-sm mt-1">Register or track your application</p>
          </div>

          <Link
            href="/register"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #E01E1E 0%, #c01717 100%)', color: 'white', fontWeight: '600', fontSize: '16px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(224,30,30,0.3)' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Register as Technician
          </Link>

          <Link
            href="/dashboard"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px 24px', borderRadius: '12px', border: '2px solid #E01E1E', color: '#E01E1E', fontWeight: '600', fontSize: '16px', textDecoration: 'none' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#E01E1E" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Check My Status
          </Link>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-gray-400 font-medium">Admin Access</span>
            </div>
          </div>

          <Link
            href="/admin"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#6b7280" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin Login
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { value: '500+', label: 'Partners' },
            { value: '10+', label: 'Services' },
            { value: '24h', label: 'Approval' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-3 text-center border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          By registering, you agree to our{' '}
          <Link href="/terms-and-conditions" className="font-semibold" style={{ color: '#E01E1E' }}>
            Terms & Conditions
          </Link>
        </p>
      </div>
    </div>
  )
}
