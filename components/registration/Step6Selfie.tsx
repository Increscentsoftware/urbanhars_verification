'use client'
import { useState, useRef } from 'react'
import { useRegistration } from '@/lib/registration-context'

interface Step6Props {
  onNext: () => void
  onBack: () => void
}

export default function Step6Selfie({ onNext, onBack }: Step6Props) {
  const { data, updateData } = useRegistration()
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState(data.selfie_url || '')
  const [cameraMode, setCameraMode] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [vehicleAvailable, setVehicleAvailable] = useState(data.vehicle_available || false)
  const [vehicleNumber, setVehicleNumber] = useState(data.vehicle_number || '')
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 }
      })
      setStream(mediaStream)
      setCameraMode(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play()
        }
      }, 100)
    } catch {
      setErrors({ selfie: 'Camera access denied. Please upload a selfie instead.' })
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      setStream(null)
    }
    setCameraMode(false)
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
      setSelfieFile(file)
      setSelfiePreview(URL.createObjectURL(file))
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErrors({ selfie: 'File must be less than 5MB' }); return }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { setErrors({ selfie: 'Only JPG and PNG allowed' }); return }
    setSelfieFile(file)
    setSelfiePreview(URL.createObjectURL(file))
    setErrors({})
  }

  async function handleNext() {
    if (!selfieFile && !selfiePreview) {
      setErrors({ selfie: 'Please take or upload a selfie to continue' })
      return
    }

    setUploading(true)
    try {
      let selfieUrl = data.selfie_url
      if (selfieFile) {
        const fd = new FormData()
        fd.append('file', selfieFile)
        fd.append('folder', 'selfie')
        fd.append('phone', data.phone_number)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const result = await res.json()
        if (result.url) selfieUrl = result.url
      }
      updateData({
        selfie_url: selfieUrl,
        vehicle_available: vehicleAvailable,
        vehicle_number: vehicleNumber,
      })
      onNext()
    } catch {
      setErrors({ selfie: 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fade-in space-y-5">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
          style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
          🤳
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Selfie Verification</h2>
        <p className="text-gray-500 text-sm mt-1">Take a live selfie for identity verification</p>
      </div>

      {/* Selfie Section */}
      {cameraMode ? (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '1' }}>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {/* Face guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-64 border-4 border-white border-opacity-70 rounded-full"></div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <button onClick={capturePhoto} className="btn-primary">
            📸 Capture Selfie
          </button>
          <button onClick={stopCamera} className="btn-secondary">
            ✕ Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {selfiePreview ? (
            <div className="text-center space-y-3">
              <div className="relative inline-block">
                <img src={selfiePreview} alt="Selfie" className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-green-400" />
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
              </div>
              <p className="text-green-700 font-semibold">Selfie captured successfully!</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startCamera}
              className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <span className="text-3xl">📷</span>
              <span className="text-sm font-semibold text-gray-700">Take Selfie</span>
              <span className="text-xs text-gray-400">Use Camera</span>
            </button>

            <label className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileUpload} />
              <span className="text-3xl">🖼️</span>
              <span className="text-sm font-semibold text-gray-700">Upload Photo</span>
              <span className="text-xs text-gray-400">From Gallery</span>
            </label>
          </div>
        </div>
      )}

      {errors.selfie && <p className="error-text">⚠️ {errors.selfie}</p>}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
        <p className="text-xs font-bold text-amber-900">📸 Live Photo Requirements</p>
        <ul className="text-xs text-amber-800 space-y-1 mt-1">
          <li>✓ Take the photo <strong>right now</strong> using your phone camera</li>
          <li>✓ Ensure <strong>good lighting</strong> — face in front of a light source</li>
          <li>✓ Face must be <strong>clearly visible</strong> — no cap, sunglasses, or mask</li>
          <li>✓ Plain or light background preferred</li>
          <li>✗ Do <strong>not</strong> upload old or gallery photos</li>
        </ul>
      </div>

      {/* Vehicle Info */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          🏍️ Vehicle Information
        </h3>

        <div>
          <label className="label label-required">Do you have a bike / vehicle?</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: true, label: '✅ Yes, I have a bike', color: vehicleAvailable ? '#2563EB' : '#e2e8f0' },
              { value: false, label: '❌ No vehicle', color: !vehicleAvailable ? '#2563EB' : '#e2e8f0' }
            ].map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setVehicleAvailable(opt.value)}
                className="p-3 rounded-xl border-2 text-sm font-semibold transition-all text-center"
                style={{
                  borderColor: opt.color,
                  background: (vehicleAvailable === opt.value) ? '#eff6ff' : 'white',
                  color: (vehicleAvailable === opt.value) ? '#2563EB' : '#374151'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {vehicleAvailable && (
          <div className="mt-4">
            <label className="label">Vehicle Number (Optional)</label>
            <input
              className="input-field"
              value={vehicleNumber}
              onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="e.g. KA 01 AB 1234"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary" style={{ width: '40%' }}>← Back</button>
        <button onClick={handleNext} disabled={uploading} className="btn-primary" style={{ width: '60%' }}>
          {uploading ? '⏳ Uploading...' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
