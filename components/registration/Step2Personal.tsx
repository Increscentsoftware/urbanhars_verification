'use client'
import { useState } from 'react'
import { useRegistration } from '@/lib/registration-context'
import { INDIAN_STATES } from '@/lib/utils'

interface Step2Props {
  onNext: () => void
  onBack: () => void
}

// Defined outside to prevent React from unmounting inputs on every keystroke
function Field({ name, label, required, error, children }: {
  name: string; label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className={`label ${required ? 'label-required' : ''}`}>{label}</label>
      {children}
      {error && <p className="error-text">⚠️ {error}</p>}
    </div>
  )
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 48 }, (_, i) => currentYear - 18 - i) // 18 to 65 years old

export default function Step2Personal({ onNext, onBack }: Step2Props) {
  const { data, updateData } = useRegistration()

  // Parse existing DOB into parts
  const existingDob = data.dob ? data.dob.split('-') : ['', '', '']
  const [dobDay, setDobDay] = useState(existingDob[2] || '')
  const [dobMonth, setDobMonth] = useState(existingDob[1] || '')
  const [dobYear, setDobYear] = useState(existingDob[0] || '')

  const [form, setForm] = useState({
    full_name: data.full_name || '',
    gender: data.gender || '',
    email: data.email || '',
    address_line1: data.address_line1 || '',
    address_line2: data.address_line2 || '',
    city: data.city || '',
    state: data.state || 'Karnataka',
    pincode: data.pincode || '',
  })
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState(data.profile_photo_url || '')
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function getDaysInMonth(month: string, year: string): number {
    if (!month || !year) return 31
    return new Date(parseInt(year), parseInt(month), 0).getDate()
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!dobDay || !dobMonth || !dobYear) {
      e.dob = 'Date of birth is required'
    } else {
      const age = currentYear - parseInt(dobYear)
      if (age < 18) e.dob = 'You must be at least 18 years old'
      if (age > 65) e.dob = 'Age must be below 65 years'
    }
    if (!form.gender) e.gender = 'Please select your gender'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    if (!form.address_line1.trim()) e.address_line1 = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state) e.state = 'State is required'
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: 'Photo must be less than 5MB' })); return }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { setErrors(prev => ({ ...prev, photo: 'Only JPG and PNG allowed' })); return }
    setProfileFile(file)
    setProfilePreview(URL.createObjectURL(file))
    setErrors(prev => ({ ...prev, photo: '' }))
  }

  async function handleNext() {
    if (!validate()) return
    setUploading(true)
    let photoUrl = data.profile_photo_url

    const dob = dobYear && dobMonth && dobDay
      ? `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`
      : ''

    if (profileFile) {
      try {
        const fd = new FormData()
        fd.append('file', profileFile)
        fd.append('folder', 'profile-photo')
        fd.append('phone', data.phone_number)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const result = await res.json()
        if (result.url) photoUrl = result.url
      } catch {
        console.error('Photo upload failed')
      }
    }

    updateData({ ...form, dob, profile_photo_url: photoUrl, profile_photo_file: profileFile || undefined })
    setUploading(false)
    onNext()
  }

  const maxDay = getDaysInMonth(dobMonth, dobYear)

  return (
    <div className="fade-in space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-gray-500 text-sm mt-1">Tell us about yourself</p>
      </div>

      {/* Profile Photo */}
      <div>
        <label className="label block mb-1">Profile Photo</label>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3 flex items-start gap-2">
          <span style={{ fontSize: '16px', lineHeight: 1.4 }}>💡</span>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Take a <strong>live photo using your phone camera</strong> in good lighting. Face must be clearly visible. No old photos or gallery uploads.
          </p>
        </div>
        <div className="text-center">
          <label className="cursor-pointer inline-block">
            <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} capture="user" />
            <div className="w-28 h-28 rounded-full mx-auto overflow-hidden flex items-center justify-center bg-gray-50 hover:bg-red-50 transition-all"
              style={{ border: profilePreview ? '3px solid #16a34a' : '3px dashed #d1d5db' }}>
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-2">
                  <div style={{ fontSize: '28px' }}>📷</div>
                  <div className="text-xs text-gray-400 mt-1 font-medium">Tap to open camera</div>
                </div>
              )}
            </div>
          </label>
          {profilePreview && (
            <p className="text-xs text-green-600 font-semibold mt-2">✓ Photo added</p>
          )}
          {errors.photo && <p className="error-text mt-1 text-center">{errors.photo}</p>}
          <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 5MB</p>
        </div>
      </div>

      <Field name="full_name" label="Full Name" required error={errors.full_name}>
        <input
          className="input-field"
          value={form.full_name}
          onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
          placeholder="As per Aadhaar card"
        />
      </Field>

      {/* Date of Birth — separate dropdowns for easy year selection */}
      <div>
        <label className="label label-required">Date of Birth</label>
        <div className="grid grid-cols-3 gap-2">
          <select
            className="input-field"
            value={dobDay}
            onChange={e => setDobDay(e.target.value)}
          >
            <option value="">Day</option>
            {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
              <option key={d} value={String(d)}>{d}</option>
            ))}
          </select>

          <select
            className="input-field"
            value={dobMonth}
            onChange={e => setDobMonth(e.target.value)}
          >
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={String(i + 1)}>{m}</option>
            ))}
          </select>

          <select
            className="input-field"
            value={dobYear}
            onChange={e => setDobYear(e.target.value)}
          >
            <option value="">Year</option>
            {YEARS.map(y => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
        {errors.dob && <p className="error-text">⚠️ {errors.dob}</p>}
      </div>

      <Field name="gender" label="Gender" required error={errors.gender}>
        <select className="input-field" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
          <option value="">Select gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </Field>

      <Field name="email" label="Email Address (Optional)" error={errors.email}>
        <input
          type="email"
          className="input-field"
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          placeholder="your@email.com"
        />
      </Field>

      <Field name="address_line1" label="Address Line 1" required error={errors.address_line1}>
        <input
          className="input-field"
          value={form.address_line1}
          onChange={e => setForm(p => ({ ...p, address_line1: e.target.value }))}
          placeholder="House/Flat No., Street Name"
        />
      </Field>

      <Field name="address_line2" label="Address Line 2" error={errors.address_line2}>
        <input
          className="input-field"
          value={form.address_line2}
          onChange={e => setForm(p => ({ ...p, address_line2: e.target.value }))}
          placeholder="Area, Landmark (Optional)"
        />
      </Field>

      <Field name="city" label="City" required error={errors.city}>
        <input
          className="input-field"
          value={form.city}
          onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
          placeholder="e.g. Bangalore"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field name="state" label="State" required error={errors.state}>
          <select className="input-field" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}>
            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field name="pincode" label="Pincode" required error={errors.pincode}>
          <input
            className="input-field"
            inputMode="numeric"
            maxLength={6}
            value={form.pincode}
            onChange={e => setForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))}
            placeholder="560001"
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary" style={{ width: '40%' }}>← Back</button>
        <button onClick={handleNext} disabled={uploading} className="btn-primary" style={{ width: '60%' }}>
          {uploading ? '⏳ Saving...' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
