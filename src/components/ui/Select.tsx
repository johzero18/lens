import React from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'success' | 'error'
  options: SelectOption[]
  placeholder?: string
  onChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = 'default',
      options,
      placeholder,
      onChange,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const hasError = error || variant === 'error'
    const hasSuccess = variant === 'success'

    const baseStyles =
      'flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

    const variants = {
      default:
        'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
      success:
        'border-success-300 focus:border-success-500 focus:ring-success-500',
      error: 'border-error-300 focus:border-error-500 focus:ring-error-500',
    }

    const currentVariant = hasError ? 'error' : hasSuccess ? 'success' : 'default'

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-secondary-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              baseStyles,
              variants[currentVariant],
              'appearance-none pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="h-4 w-4 text-secondary-400"
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
          {hasError && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-error-500">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
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

Select.displayName = 'Select'

export default Select