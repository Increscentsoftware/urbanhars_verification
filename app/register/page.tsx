'use client'
import { useState } from 'react'
import { RegistrationProvider, useRegistration } from '@/lib/registration-context'
import ProgressBar from '@/components/registration/ProgressBar'
import Step1Phone from '@/components/registration/Step1Phone'
import Step2Personal from '@/components/registration/Step2Personal'
import Step3Service from '@/components/registration/Step3Service'
import Step4Emergency from '@/components/registration/Step4Emergency'
import Step5Documents from '@/components/registration/Step5Documents'
import Step6Selfie from '@/components/registration/Step6Selfie'
import Step7GPS from '@/components/registration/Step7GPS'
import Step8Terms from '@/components/registration/Step8Terms'
import Link from 'next/link'
import Image from 'next/image'

const STEP_LABELS = [
  'Phone Verify',
  'Personal Info',
  'Services',
  'Emergency',
  'Documents',
  'Selfie',
  'Location',
  'Terms',
]

function SuccessScreen({ referenceId }: { referenceId: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <span className="text-5xl">🎉</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registration Submitted!</h1>
          <p className="text-gray-600 mt-2">Thank you for registering with UrbanHars</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 space-y-3">
          <div>
            <p className="text-sm text-gray-500 font-medium">Your Reference ID</p>
            <p className="text-2xl font-bold mt-1 font-mono tracking-wider" style={{ color: '#E01E1E' }}>{referenceId}</p>
          </div>

          <div className="h-px bg-gray-100"></div>

          <div className="flex items-center justify-center gap-2">
            <span className="status-badge status-pending">⏳ Pending Verification</span>
          </div>

          <p className="text-sm text-gray-500">
            Our team will verify your documents within <strong>24-48 hours</strong>. You will receive an SMS update on your registered mobile number.
          </p>
        </div>

        <div className="bg-red-50 rounded-xl p-4 text-sm text-left space-y-2" style={{ color: '#991b1b' }}>
          <p className="font-semibold">What happens next?</p>
          <p>✅ Document verification by our team</p>
          <p>✅ Background check completion</p>
          <p>✅ Approval notification via SMS</p>
          <p>✅ Access to job assignments</p>
        </div>

        <Link
          href="/dashboard"
          className="btn-primary block"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
        >
          📊 Check Application Status
        </Link>

        <Link href="/" className="block text-sm text-gray-500 hover:text-gray-700">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

function RegistrationFlow() {
  const { currentStep, setCurrentStep, data } = useRegistration()
  const [submitted, setSubmitted] = useState(false)
  const [referenceId, setReferenceId] = useState('')

  const TOTAL_STEPS = 8

  function handleSubmit() {
    const refId = (data as any).reference_id || `UH-TECH-${Math.floor(10000 + Math.random() * 90000)}`
    setReferenceId(refId)
    setSubmitted(true)
  }

  if (submitted) return <SuccessScreen referenceId={referenceId} />

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Image src="/uh-logo.svg" alt="UH" width={28} height={28} />
              <span className="font-bold text-gray-900 text-sm">Urban Hars</span>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full">
            Step {currentStep}/{TOTAL_STEPS}
          </span>
        </div>
        <div className="max-w-lg mx-auto px-4 pb-3">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} stepLabels={STEP_LABELS} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {currentStep === 1 && <Step1Phone onNext={() => setCurrentStep(2)} />}
          {currentStep === 2 && <Step2Personal onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
          {currentStep === 3 && <Step3Service onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />}
          {currentStep === 4 && <Step4Emergency onNext={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)} />}
          {currentStep === 5 && <Step5Documents onNext={() => setCurrentStep(6)} onBack={() => setCurrentStep(4)} />}
          {currentStep === 6 && <Step6Selfie onNext={() => setCurrentStep(7)} onBack={() => setCurrentStep(5)} />}
          {currentStep === 7 && <Step7GPS onNext={() => setCurrentStep(8)} onBack={() => setCurrentStep(6)} />}
          {currentStep === 8 && <Step8Terms onSubmit={handleSubmit} onBack={() => setCurrentStep(7)} />}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <RegistrationProvider>
      <RegistrationFlow />
    </RegistrationProvider>
  )
}
