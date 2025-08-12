import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colors = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
  }

  return (
    <svg
      className={cn(
        'animate-spin',
        sizes[size],
        colors[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Loading state component for full page or sections
export interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
  className?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando...',
  size = 'lg',
  fullScreen = false,
  className,
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center py-12'

  return (
    <div className={cn(containerClasses, className)}>
      <LoadingSpinner size={size} />
      {message && (
        <p className="mt-4 text-sm text-secondary-600 font-medium">
          {message}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner