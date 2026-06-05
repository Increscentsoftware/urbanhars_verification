'use client'
import { useState, useRef } from 'react'
import { useRegistration } from '@/lib/registration-context'
import Link from 'next/link'

interface Step8Props {
  onSubmit: () => void
  onBack: () => void
}

const CHECKBOXES = [
  { key: 'terms_accepted', label: 'I have read and agree to the UrbanHars Partner Terms & Conditions.', required: true },
  { key: 'document_consent', label: 'I consent to UrbanHars storing my identity documents and verification records.', required: true },
  { key: 'gps_consent', label: 'I consent to GPS location collection for service assignment.', required: true },
  { key: 'info_accurate', label: 'I confirm that all information provided is accurate and truthful.', required: true },
  { key: 'false_info_aware', label: 'I understand that providing false information may result in suspension or permanent removal from the UrbanHars platform.', required: true },
  { key: 'criminal_declaration', label: 'I declare that I have NOT been convicted of any criminal offence involving theft, fraud, violence, harassment, or offences against persons or property.', required: true },
]

export default function Step8Terms({ onSubmit, onBack }: Step8Props) {
  const { data, updateData } = useRegistration()
  const [checked, setChecked] = useState<Record<string, boolean>>({
    terms_accepted: data.terms_accepted || false,
    document_consent: data.document_consent || false,
    gps_consent: data.gps_consent || false,
    info_accurate: false,
    false_info_aware: false,
    criminal_declaration: data.criminal_declaration || false,
  })
  const [scrolled, setScrolled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const allChecked = Object.values(checked).every(Boolean)

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      setScrolled(true)
    }
  }

  async function handleSubmit() {
    if (!allChecked) { setError('Please accept all terms to continue'); return }
    if (!scrolled) { setError('Please scroll through and read the terms before submitting'); return }

    setSubmitting(true)
    setError('')

    updateData({
      terms_accepted: checked.terms_accepted,
      privacy_consent: true,
      gps_consent: checked.gps_consent,
      document_consent: checked.document_consent,
      criminal_declaration: checked.criminal_declaration,
    })

    try {
      const res = await fetch('/api/technician', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          terms_accepted: checked.terms_accepted,
          privacy_consent: true,
          gps_consent: checked.gps_consent,
          document_consent: checked.document_consent,
          criminal_declaration: checked.criminal_declaration,
        })
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Submission failed. Please try again.')
        return
      }

      updateData({ reference_id: result.reference_id } as any)
      onSubmit()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fade-in space-y-5">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
          📋
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
        <p className="text-gray-500 text-sm mt-1">Please read and accept all terms to complete registration</p>
      </div>

      {/* Terms Scroll Box */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-48 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 bg-gray-50"
        style={{ lineHeight: '1.6' }}
      >
        <p className="font-bold text-gray-900">UrbanHars Partner Terms & Conditions</p>
        <p className="text-xs text-gray-500">Effective Date: January 2024 | Jurisdiction: Bangalore, Karnataka, India</p>

        <p><strong>1. Independent Contractor Relationship</strong><br />
        You are registering as an independent service contractor with UrbanHars. You are not an employee, agent, or partner. You retain full control over your working hours and methods.</p>

        <p><strong>2. Identity Verification</strong><br />
        You agree to provide accurate identity documents including Aadhaar card. UrbanHars reserves the right to verify your identity through third-party services and reject applications with invalid documents.</p>

        <p><strong>3. Customer Safety Requirements</strong><br />
        You must maintain professional conduct at all times during service visits. Any harassment, theft, or misconduct will result in immediate suspension and legal action.</p>

        <p><strong>4. Background Verification Authorization</strong><br />
        You authorize UrbanHars to conduct background verification checks including criminal record checks and identity verification.</p>

        <p><strong>5. Service Quality Standards</strong><br />
        You agree to maintain service quality standards set by UrbanHars, complete assigned jobs professionally, and provide honest service estimates to customers.</p>

        <p><strong>6. Fraud Prevention</strong><br />
        Any fraudulent activity including false billing, fake service reports, or misrepresentation of qualifications will result in permanent removal and legal action.</p>

        <p><strong>7. Criminal Activity Prohibition</strong><br />
        Technicians with criminal records involving theft, fraud, violence, or harassment are strictly prohibited from registering on the platform.</p>

        <p><strong>8. Customer Data Privacy</strong><br />
        Customer personal data accessed during service visits must not be misused, shared, or retained beyond the service period.</p>

        <p><strong>9. Liability Disclaimer</strong><br />
        UrbanHars is not liable for damages arising from technician negligence during service delivery.</p>

        <p><strong>10. Document Storage Consent</strong><br />
        Your identity documents are stored securely and accessed only by authorized UrbanHars personnel for verification purposes.</p>

        <p><strong>11. GPS Tracking Consent</strong><br />
        During active job assignments, your location may be tracked and shared with customers for safety and service quality purposes.</p>

        <p><strong>12. Account Suspension & Termination</strong><br />
        UrbanHars reserves the right to suspend or terminate accounts for violations of these terms, poor service ratings, or inactivity.</p>

        <p><strong>13. Dispute Resolution</strong><br />
        All disputes shall be resolved through arbitration under the Arbitration and Conciliation Act, 1996, with proceedings in Bangalore, Karnataka.</p>

        <p><strong>14. Indemnification</strong><br />
        You agree to indemnify UrbanHars against claims arising from your service activities, misrepresentation, or violations of these terms.</p>

        <p><strong>15. Policy Updates</strong><br />
        UrbanHars may update these terms. Continued use of the platform constitutes acceptance of updated terms.</p>

        <p><strong>16. Declaration</strong><br />
        By submitting this registration, you declare that all provided information is accurate, and you agree to abide by all UrbanHars policies and applicable Indian laws.</p>

        <p className="text-xs text-gray-500 text-center mt-4">
          Scroll to the bottom to confirm you have read the terms
        </p>
      </div>

      {!scrolled && (
        <p className="text-xs text-amber-600 text-center flex items-center justify-center gap-1">
          ↕️ Scroll through the terms above to continue
        </p>
      )}

      {scrolled && (
        <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
          ✅ Terms read. Please accept all checkboxes below.
        </p>
      )}

      <Link href="/terms-and-conditions" target="_blank" className="block text-center text-sm text-blue-600 font-medium">
        📄 View Full Terms & Conditions →
      </Link>

      {/* Checkboxes */}
      <div className="space-y-3">
        {CHECKBOXES.map(cb => (
          <label key={cb.key} className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div
              className="w-6 h-6 min-w-[24px] rounded-lg border-2 flex items-center justify-center transition-all mt-0.5"
              style={{
                borderColor: checked[cb.key] ? '#2563EB' : '#d1d5db',
                background: checked[cb.key] ? '#2563EB' : 'white'
              }}
              onClick={() => setChecked(prev => ({ ...prev, [cb.key]: !prev[cb.key] }))}
            >
              {checked[cb.key] && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <span className="text-sm text-gray-700 leading-relaxed">{cb.label}</span>
          </label>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-red-700 text-sm">⚠️ {error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary" style={{ width: '40%' }}>← Back</button>
        <button
          onClick={handleSubmit}
          disabled={!allChecked || !scrolled || submitting}
          className="btn-primary"
          style={{ width: '60%' }}
        >
          {submitting ? '⏳ Submitting...' : '🚀 Submit Application'}
        </button>
      </div>
    </div>
  )
}
