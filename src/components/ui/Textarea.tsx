import React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'success' | 'error'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = 'default',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = error || variant === 'error'
    const hasSuccess = variant === 'success'

    const baseStyles =
      'flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'

    const variants = {
      default:
        'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
      success:
        'border-success-300 focus:border-success-500 focus:ring-success-500',
      error: 'border-error-300 focus:border-error-500 focus:ring-error-500',
    }

    const currentVariant = hasError ? 'error' : hasSuccess ? 'success' : 'default'

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-secondary-700">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            baseStyles,
            variants[currentVariant],
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
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

Textarea.displayName = 'Textarea'

export default Textarea