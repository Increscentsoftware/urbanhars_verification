'use client'
import { useState, useRef, useEffect } from 'react'
import { useRegistration } from '@/lib/registration-context'

interface Step1PhoneProps {
  onNext: () => void
}

export default function Step1Phone({ onNext }: Step1PhoneProps) {
  const { data, updateData } = useRegistration()
  const [phone, setPhone] = useState(data.phone_number || '')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [stage, setStage] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(0)
  const [debugOtp, setDebugOtp] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  async function sendOTP() {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number starting with 6-9')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone })
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Failed to send OTP')
        return
      }
      if (result.debug_otp) setDebugOtp(result.debug_otp)
      setStage('otp')
      setTimer(30)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP() {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, otp: otpString })
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Invalid OTP')
        return
      }
      updateData({
        phone_number: phone,
        phone_verified: true,
        otp_verified_at: result.verified_at
      })
      onNext()
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  return (
    <div className="fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
          style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}>
          📱
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {stage === 'phone' ? 'Enter Your Mobile Number' : 'Verify OTP'}
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          {stage === 'phone'
            ? 'Enter the mobile number linked to your Aadhaar card'
            : `OTP sent to +91 ${phone}`}
        </p>
      </div>

      {stage === 'phone' ? (
        <div className="space-y-5">
          <div>
            <label className="label label-required">Mobile Number (Aadhaar Linked)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm border-r border-gray-200 pr-3">
                +91
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError('') }}
                onKeyDown={e => e.key === 'Enter' && sendOTP()}
                className="input-field"
                style={{ paddingLeft: '60px' }}
                placeholder="9876543210"
                autoFocus
              />
            </div>
            {error && <p className="error-text">⚠️ {error}</p>}
          </div>

          <button onClick={sendOTP} disabled={loading || phone.length !== 10} className="btn-primary">
            {loading ? '⏳ Sending OTP...' : 'Send OTP →'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Standard SMS charges may apply
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="label label-required text-center block mb-4">Enter 6-digit OTP</label>
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all"
                  style={{
                    borderColor: digit ? '#2563EB' : '#e2e8f0',
                    background: digit ? '#eff6ff' : 'white',
                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                  }}
                />
              ))}
            </div>
            {error && <p className="error-text text-center mt-2">⚠️ {error}</p>}
            {debugOtp && (
              <p className="text-center text-xs text-amber-600 mt-2 bg-amber-50 py-2 px-3 rounded-lg">
                🔧 Dev Mode OTP: <strong>{debugOtp}</strong>
              </p>
            )}
          </div>

          <button
            onClick={verifyOTP}
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary"
          >
            {loading ? '⏳ Verifying...' : '✓ Verify OTP'}
          </button>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">Resend OTP in <strong>{timer}s</strong></p>
            ) : (
              <button
                onClick={() => { sendOTP(); setOtp(['','','','','','']) }}
                className="text-sm text-blue-600 font-semibold"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            onClick={() => { setStage('phone'); setOtp(['','','','','','']); setError('') }}
            className="btn-secondary"
          >
            ← Change Number
          </button>
        </div>
      )}
    </div>
  )
}
