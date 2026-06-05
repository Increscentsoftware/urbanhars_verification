'use client'
import { useState } from 'react'
import { useRegistration } from '@/lib/registration-context'
import { SERVICE_CATEGORIES, SERVICE_AREAS, EXPERIENCE_OPTIONS } from '@/lib/utils'

interface Step3Props {
  onNext: () => void
  onBack: () => void
}

export default function Step3Service({ onNext, onBack }: Step3Props) {
  const { data, updateData } = useRegistration()
  const [form, setForm] = useState({
    service_categories: data.service_categories || [],
    experience: data.experience || '',
    current_occupation: data.current_occupation || '',
    previous_company: data.previous_company || '',
    languages_known: data.languages_known || [] as string[],
    service_areas: data.service_areas || [],
    langInput: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  }

  function addLanguage() {
    const lang = form.langInput.trim()
    if (lang && !form.languages_known.includes(lang)) {
      setForm(p => ({ ...p, languages_known: [...p.languages_known, lang], langInput: '' }))
    }
  }

  function removeLanguage(lang: string) {
    setForm(p => ({ ...p, languages_known: p.languages_known.filter(l => l !== lang) }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (form.service_categories.length === 0) e.categories = 'Please select at least one service category'
    if (!form.experience) e.experience = 'Please select your experience'
    if (form.service_areas.length === 0) e.areas = 'Please select at least one service area'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (!validate()) return
    updateData({
      service_categories: form.service_categories,
      experience: form.experience,
      current_occupation: form.current_occupation,
      previous_company: form.previous_company,
      languages_known: form.languages_known,
      service_areas: form.service_areas,
    })
    onNext()
  }

  return (
    <div className="fade-in space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Service Details</h2>
        <p className="text-gray-500 text-sm mt-1">Tell us about your skills and work areas</p>
      </div>

      {/* Service Categories */}
      <div>
        <label className="label label-required">Service Categories</label>
        <p className="text-xs text-gray-500 mb-3">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm(p => ({ ...p, service_categories: toggleItem(p.service_categories, cat) }))}
              className={`tag-pill ${form.service_categories.includes(cat) ? 'selected' : ''}`}
            >
              {form.service_categories.includes(cat) ? '✓ ' : ''}{cat}
            </button>
          ))}
        </div>
        {errors.categories && <p className="error-text">⚠️ {errors.categories}</p>}
      </div>

      {/* Experience */}
      <div>
        <label className="label label-required">Years of Experience</label>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map(exp => (
            <button
              key={exp}
              type="button"
              onClick={() => setForm(p => ({ ...p, experience: exp }))}
              className={`tag-pill ${form.experience === exp ? 'selected' : ''}`}
            >
              {form.experience === exp ? '✓ ' : ''}{exp}
            </button>
          ))}
        </div>
        {errors.experience && <p className="error-text">⚠️ {errors.experience}</p>}
      </div>

      {/* Current Occupation */}
      <div>
        <label className="label">Current Occupation</label>
        <input
          className="input-field"
          value={form.current_occupation}
          onChange={e => setForm(p => ({ ...p, current_occupation: e.target.value }))}
          placeholder="e.g. Freelance Technician"
        />
      </div>

      {/* Previous Company */}
      <div>
        <label className="label">Previous Company (if any)</label>
        <input
          className="input-field"
          value={form.previous_company}
          onChange={e => setForm(p => ({ ...p, previous_company: e.target.value }))}
          placeholder="e.g. Samsung Service Centre"
        />
      </div>

      {/* Languages */}
      <div>
        <label className="label">Languages Known</label>
        <div className="flex gap-2">
          <input
            className="input-field"
            value={form.langInput}
            onChange={e => setForm(p => ({ ...p, langInput: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
            placeholder="Type a language and press Add"
          />
          <button
            type="button"
            onClick={addLanguage}
            className="px-4 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl border-2 border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap text-sm"
          >
            + Add
          </button>
        </div>
        {form.languages_known.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.languages_known.map(lang => (
              <span key={lang} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {lang}
                <button onClick={() => removeLanguage(lang)} className="text-blue-400 hover:text-blue-700 ml-1">×</button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">e.g. Kannada, Hindi, English, Tamil</p>
      </div>

      {/* Service Areas */}
      <div>
        <label className="label label-required">Service Areas (Bangalore)</label>
        <p className="text-xs text-gray-500 mb-3">Select the areas you can serve</p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_AREAS.map(area => (
            <button
              key={area}
              type="button"
              onClick={() => setForm(p => ({ ...p, service_areas: toggleItem(p.service_areas, area) }))}
              className={`tag-pill ${form.service_areas.includes(area) ? 'selected' : ''}`}
            >
              {form.service_areas.includes(area) ? '✓ ' : ''}{area}
            </button>
          ))}
        </div>
        {errors.areas && <p className="error-text">⚠️ {errors.areas}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary" style={{ width: '40%' }}>← Back</button>
        <button onClick={handleNext} className="btn-primary" style={{ width: '60%' }}>Next →</button>
      </div>
    </div>
  )
}
