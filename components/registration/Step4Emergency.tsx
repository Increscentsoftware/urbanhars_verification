'use client'
import { useState } from 'react'
import { useRegistration } from '@/lib/registration-context'
import { RELATIONSHIP_OPTIONS } from '@/lib/utils'

interface Step4Props {
  onNext: () => void
  onBack: () => void
}

export default function Step4Emergency({ onNext, onBack }: Step4Props) {
  const { data, updateData } = useRegistration()
  const [form, setForm] = useState({
    emergency_contact_name: data.emergency_contact_name || '',
    emergency_contact_relationship: data.emergency_contact_relationship || '',
    emergency_contact_phone: data.emergency_contact_phone || '',
    emergency_contact_alternate_phone: data.emergency_contact_alternate_phone || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.emergency_contact_name.trim()) e.name = 'Emergency contact name is required'
    if (!form.emergency_contact_relationship) e.relationship = 'Please select the relationship'
    if (!form.emergency_contact_phone || !/^[6-9]\d{9}$/.test(form.emergency_contact_phone)) {
      e.phone = 'Please enter a valid 10-digit mobile number'
    } else if (form.emergency_contact_phone === data.phone_number) {
      e.phone = 'Emergency contact number cannot be the same as your number'
    }
    if (form.emergency_contact_alternate_phone) {
      if (!/^[6-9]\d{9}$/.test(form.emergency_contact_alternate_phone)) {
        e.alt_phone = 'Invalid alternate phone number'
      } else if (form.emergency_contact_alternate_phone === data.phone_number) {
        e.alt_phone = 'Alternate number cannot be the same as your number'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (!validate()) return
    updateData(form)
    onNext()
  }

  return (
    <div className="fade-in space-y-5">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
          style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
          🆘
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Emergency Contact</h2>
        <p className="text-gray-500 text-sm mt-1">Who should we contact in case of emergency?</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-700 text-sm">
          ⚠️ This person will be contacted only in case of emergency during a job assignment.
        </p>
      </div>

      <div>
        <label className="label label-required">Full Name</label>
        <input
          className="input-field"
          value={form.emergency_contact_name}
          onChange={e => setForm(p => ({ ...p, emergency_contact_name: e.target.value }))}
          placeholder="Emergency contact's full name"
        />
        {errors.name && <p className="error-text">⚠️ {errors.name}</p>}
      </div>

      <div>
        <label className="label label-required">Relationship</label>
        <select
          className="input-field"
          value={form.emergency_contact_relationship}
          onChange={e => setForm(p => ({ ...p, emergency_contact_relationship: e.target.value }))}
        >
          <option value="">Select Relationship</option>
          {RELATIONSHIP_OPTIONS.map(r => <option key={r}>{r}</option>)}
        </select>
        {errors.relationship && <p className="error-text">⚠️ {errors.relationship}</p>}
      </div>

      <div>
        <label className="label label-required">Mobile Number</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm border-r border-gray-200 pr-3">
            +91
          </div>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className="input-field"
            style={{ paddingLeft: '60px' }}
            value={form.emergency_contact_phone}
            onChange={e => setForm(p => ({ ...p, emergency_contact_phone: e.target.value.replace(/\D/g, '') }))}
            placeholder="9876543210"
          />
        </div>
        {errors.phone && <p className="error-text">⚠️ {errors.phone}</p>}
      </div>

      <div>
        <label className="label">Alternate Number (Optional)</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm border-r border-gray-200 pr-3">
            +91
          </div>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className="input-field"
            style={{ paddingLeft: '60px' }}
            value={form.emergency_contact_alternate_phone}
            onChange={e => setForm(p => ({ ...p, emergency_contact_alternate_phone: e.target.value.replace(/\D/g, '') }))}
            placeholder="Optional"
          />
        </div>
        {errors.alt_phone && <p className="error-text">⚠️ {errors.alt_phone}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary" style={{ width: '40%' }}>← Back</button>
        <button onClick={handleNext} className="btn-primary" style={{ width: '60%' }}>Next →</button>
      </div>
    </div>
  )
}
