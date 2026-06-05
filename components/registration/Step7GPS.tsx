'use client'
import { useState } from 'react'
import { useRegistration } from '@/lib/registration-context'

interface Step7Props {
  onNext: () => void
  onBack: () => void
}

export default function Step7GPS({ onNext, onBack }: Step7Props) {
  const { data, updateData } = useRegistration()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    data.latitude ? 'success' : 'idle'
  )
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    data.latitude ? { lat: data.latitude, lng: data.longitude! } : null
  )
  const [errorMsg, setErrorMsg] = useState('')

  function captureGPS() {
    if (!navigator.geolocation) {
      setErrorMsg('GPS is not supported on your device. You can skip this step.')
      setStatus('error')
      return
    }

    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setCoords({ lat, lng })
        setStatus('success')
        updateData({
          latitude: lat,
          longitude: lng,
          location_timestamp: new Date().toISOString()
        })
      },
      (error) => {
        setStatus('error')
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg('Location permission denied. Please allow location access in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            setErrorMsg('Location unavailable. Please try again outdoors.')
            break
          case error.TIMEOUT:
            setErrorMsg('Location request timed out. Please try again.')
            break
          default:
            setErrorMsg('Could not get your location. Please try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  return (
    <div className="fade-in space-y-5">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
          style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
          📍
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Location Verification</h2>
        <p className="text-gray-500 text-sm mt-1">We need your current location for service matching</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm font-medium">📌 Why we need your location</p>
        <p className="text-blue-600 text-xs mt-1">
          Your location helps us match you with nearby service requests. This is captured only once during registration.
        </p>
      </div>

      {/* GPS Status Card */}
      <div className={`rounded-2xl p-6 text-center border-2 transition-all ${
        status === 'success' ? 'bg-green-50 border-green-300' :
        status === 'error' ? 'bg-red-50 border-red-200' :
        status === 'loading' ? 'bg-blue-50 border-blue-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        {status === 'idle' && (
          <div className="space-y-3">
            <div className="text-6xl">🌍</div>
            <p className="text-gray-700 font-semibold">Location not captured yet</p>
            <p className="text-gray-500 text-sm">Tap the button below to capture your GPS location</p>
          </div>
        )}

        {status === 'loading' && (
          <div className="space-y-3">
            <div className="text-6xl animate-pulse">📡</div>
            <p className="text-blue-700 font-semibold">Getting your location...</p>
            <p className="text-blue-500 text-sm">Please wait. Allow location access if prompted.</p>
          </div>
        )}

        {status === 'success' && coords && (
          <div className="space-y-3">
            <div className="text-5xl">✅</div>
            <p className="text-green-700 font-bold text-lg">Location Captured!</p>
            <div className="bg-white rounded-xl p-3 text-left space-y-1">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Coordinates</p>
              <p className="text-sm font-mono text-gray-800">Lat: {coords.lat.toFixed(6)}</p>
              <p className="text-sm font-mono text-gray-800">Lng: {coords.lng.toFixed(6)}</p>
            </div>
            <a
              href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 font-semibold"
            >
              🗺️ View on Google Maps →
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="text-5xl">⚠️</div>
            <p className="text-red-700 font-semibold">Location Error</p>
            <p className="text-red-600 text-sm">{errorMsg}</p>
          </div>
        )}
      </div>

      {status !== 'success' && (
        <button
          onClick={captureGPS}
          disabled={status === 'loading'}
          className="btn-primary"
        >
          {status === 'loading' ? '📡 Detecting Location...' : '📍 Capture My Location'}
        </button>
      )}

      {status === 'success' && (
        <button onClick={captureGPS} className="btn-secondary text-sm py-2">
          🔄 Recapture Location
        </button>
      )}

      {(status === 'error' || status === 'success') && (
        <div className="flex gap-3 pt-2">
          <button onClick={onBack} className="btn-secondary" style={{ width: '40%' }}>← Back</button>
          <button onClick={onNext} className="btn-primary" style={{ width: '60%' }}>
            {status === 'success' ? 'Next →' : 'Skip & Continue →'}
          </button>
        </div>
      )}

      {status === 'idle' && (
        <div className="flex gap-3 pt-2">
          <button onClick={onBack} className="btn-secondary" style={{ width: '40%' }}>← Back</button>
          <button onClick={onNext} className="btn-secondary" style={{ width: '60%', border: '2px solid #d1d5db', color: '#6b7280' }}>
            Skip for now
          </button>
        </div>
      )}
    </div>
  )
}
