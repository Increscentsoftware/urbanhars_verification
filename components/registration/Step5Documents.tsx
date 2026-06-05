'use client'
import { useState } from 'react'
import { useRegistration } from '@/lib/registration-context'

interface Step5Props {
  onNext: () => void
  onBack: () => void
}

type DocKey = 'aadhaar_front' | 'aadhaar_back'

// Defined outside to prevent re-mounting on every render
function UploadBox({ docKey, label, preview, file, error, onChange }: {
  docKey: DocKey
  label: string
  preview: string
  file: File | null
  error?: string
  onChange: (key: DocKey, e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <label className="label label-required">{label}</label>
      <label className="block cursor-pointer">
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={e => onChange(docKey, e)}
        />
        <div className={`upload-zone ${preview ? 'uploaded' : ''}`}>
          {preview ? (
            preview === 'pdf' ? (
              <div className="space-y-2">
                <div className="text-4xl">📄</div>
                <p className="text-green-700 font-semibold text-sm">PDF Uploaded ✓</p>
                <p className="text-xs text-gray-500">{file?.name}</p>
                <p className="text-xs text-blue-500">Tap to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <img src={preview} alt={label} className="h-32 mx-auto rounded-lg object-contain" />
                <p className="text-green-700 font-semibold text-sm">✓ Uploaded successfully</p>
                <p className="text-xs text-blue-500">Tap to change</p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📷</div>
              <p className="text-gray-700 font-semibold">{label}</p>
              <p className="text-sm text-gray-400">JPG, PNG or PDF • Max 5MB</p>
              <div className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold inline-block"
                style={{ background: '#eff6ff', color: '#2563EB' }}>
                Choose File
              </div>
            </div>
          )}
        </div>
      </label>
      {error && <p className="error-text">⚠️ {error}</p>}
    </div>
  )
}

export default function Step5Documents({ onNext, onBack }: Step5Props) {
  const { data, updateData } = useRegistration()
  const [files, setFiles] = useState<Record<DocKey, File | null>>({
    aadhaar_front: null,
    aadhaar_back: null,
  })
  const [previews, setPreviews] = useState<Record<DocKey, string>>({
    aadhaar_front: data.aadhaar_front_url || '',
    aadhaar_back: data.aadhaar_back_url || '',
  })
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleFileChange(key: DocKey, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [key]: 'File must be less than 5MB' }))
      return
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [key]: 'Only JPG, PNG, PDF allowed' }))
      return
    }
    setFiles(prev => ({ ...prev, [key]: file }))
    if (file.type.startsWith('image/')) {
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }))
    } else {
      setPreviews(prev => ({ ...prev, [key]: 'pdf' }))
    }
    setErrors(prev => ({ ...prev, [key]: '', upload: '' }))
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    fd.append('phone', data.phone_number)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const result = await res.json()
    if (!res.ok || !result.url) {
      throw new Error(result.error || `Upload failed (HTTP ${res.status})`)
    }
    return result.url
  }

  async function handleNext() {
    const e: Record<string, string> = {}
    if (!files.aadhaar_front && !previews.aadhaar_front) e.aadhaar_front = 'Aadhaar front is required'
    if (!files.aadhaar_back && !previews.aadhaar_back) e.aadhaar_back = 'Aadhaar back is required'
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setUploading(true)
    setErrors({})
    try {
      let frontUrl = data.aadhaar_front_url
      let backUrl = data.aadhaar_back_url

      if (files.aadhaar_front) frontUrl = await uploadFile(files.aadhaar_front, 'aadhaar-front')
      if (files.aadhaar_back) backUrl = await uploadFile(files.aadhaar_back, 'aadhaar-back')

      updateData({ aadhaar_front_url: frontUrl, aadhaar_back_url: backUrl })
      onNext()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      console.error('Document upload error:', err)
      setErrors({ upload: msg })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fade-in space-y-5">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
          style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
          🪪
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
        <p className="text-gray-500 text-sm mt-1">Upload your Aadhaar card for verification</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm font-medium mb-1">🔒 Your documents are secure</p>
        <p className="text-blue-600 text-xs">Aadhaar details are encrypted and stored securely. Only UrbanHars verification team can access them.</p>
      </div>

      <UploadBox
        docKey="aadhaar_front"
        label="Aadhaar Card - Front"
        preview={previews.aadhaar_front}
        file={files.aadhaar_front}
        error={errors.aadhaar_front}
        onChange={handleFileChange}
      />
      <UploadBox
        docKey="aadhaar_back"
        label="Aadhaar Card - Back"
        preview={previews.aadhaar_back}
        file={files.aadhaar_back}
        error={errors.aadhaar_back}
        onChange={handleFileChange}
      />

      {errors.upload && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm font-semibold mb-1">⚠️ Upload Error</p>
          <p className="text-red-600 text-sm">{errors.upload}</p>
          <p className="text-red-500 text-xs mt-2">
            If this keeps happening, please check your internet connection or contact support.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary" style={{ width: '40%' }}>← Back</button>
        <button onClick={handleNext} disabled={uploading} className="btn-primary" style={{ width: '60%' }}>
          {uploading ? '⏳ Uploading...' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
