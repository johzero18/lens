import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectProps {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'success' | 'error'
  options: MultiSelectOption[]
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  maxSelections?: number
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = 'default',
      options,
      value = [],
      onChange,
      placeholder = 'Seleccionar opciones...',
      disabled = false,
      maxSelections,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const hasError = error || variant === 'error'
    const hasSuccess = variant === 'success'

    const baseStyles =
      'flex w-full min-h-[2.5rem] rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer'

    const variants = {
      default:
        'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
      success:
        'border-success-300 focus:border-success-500 focus:ring-success-500',
      error: 'border-error-300 focus:border-error-500 focus:ring-error-500',
    }

    const currentVariant = hasError ? 'error' : hasSuccess ? 'success' : 'default'

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleToggleOption = (optionValue: string) => {
      if (disabled) return

      const isSelected = value.includes(optionValue)
      let newValue: string[]

      if (isSelected) {
        newValue = value.filter(v => v !== optionValue)
      } else {
        if (maxSelections && value.length >= maxSelections) {
          return
        }
        newValue = [...value, optionValue]
      }

      onChange(newValue)
    }

    const getSelectedLabels = () => {
      return value
        .map(v => options.find(opt => opt.value === v)?.label)
        .filter(Boolean)
    }

    const selectedLabels = getSelectedLabels()

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="mb-2 block text-sm font-medium text-secondary-700">
            {label}
          </label>
        )}
        <div className="relative">
          <div
            className={cn(
              baseStyles,
              variants[currentVariant],
              isOpen && 'ring-2',
              disabled && 'cursor-not-allowed',
              className
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            ref={ref}
          >
            <div className="flex-1 flex flex-wrap gap-1">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {label}
                    <button
                      type="button"
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation()
                        const optionValue = options.find(opt => opt.label === label)?.value
                        if (optionValue) {
                          handleToggleOption(optionValue)
                        }
                      }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-secondary-500">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center">
              <svg
                className={cn(
                  'h-4 w-4 text-secondary-400 transition-transform',
                  isOpen && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-secondary-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option) => {
                const isSelected = value.includes(option.value)
                const isDisabled = Boolean(option.disabled || (maxSelections && !isSelected && value.length >= maxSelections))

                return (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center px-3 py-2 cursor-pointer hover:bg-secondary-50',
                      isSelected && 'bg-primary-50',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => !isDisabled && handleToggleOption(option.value)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                        disabled={isDisabled}
                      />
                      <span className="ml-2 text-sm text-secondary-900">
                        {option.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              'mt-2 text-sm',
              hasError ? 'text-error-600' : 'text-secondary-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

MultiSelect.displayName = 'MultiSelect'

export default MultiSelect