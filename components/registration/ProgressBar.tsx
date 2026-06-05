'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
}

export default function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-blue-600">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm text-gray-500">{stepLabels?.[currentStep - 1] || ''}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #2563EB, #7C3AED)'
          }}
        />
      </div>
      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i + 1 < currentStep ? 'bg-blue-600' :
              i + 1 === currentStep ? 'bg-blue-600 ring-2 ring-blue-200' :
              'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
