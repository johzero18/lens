'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { isValidEmail } from '@/lib/utils'
import { ERROR_MESSAGES } from '@/lib/constants'

interface LoginFormData {
  email: string
  password: string
  remember: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  loading?: boolean
}

export default function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)

  // Real-time validation
  const validateField = (field: keyof LoginFormData, value: string | boolean) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'email':
        if (!value) {
          newErrors.email = 'El email es requerido'
        } else if (!isValidEmail(value as string)) {
          newErrors.email = ERROR_MESSAGES.INVALID_EMAIL
        } else {
          delete newErrors.email
        }
        break

      case 'password':
        if (!value) {
          newErrors.password = 'La contraseña es requerida'
        } else {
          delete newErrors.password
        }
        break
    }

    setErrors(newErrors)
  }

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field !== 'remember') {
      validateField(field, value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear general error
    setErrors(prev => ({ ...prev, general: undefined }))

    // Validate all fields
    validateField('email', formData.email)
    validateField('password', formData.password)

    // Check if form is valid
    const hasErrors = Object.keys(errors).length > 0
    const hasEmptyFields = !formData.email || !formData.password

    if (hasErrors || hasEmptyFields) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'Error al iniciar sesión'
      }))
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="rounded-lg bg-error-50 border border-error-200 p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-error-400 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-error-600">{errors.general}</p>
          </div>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={errors.email}
        placeholder="tu@email.com"
        leftIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            />
          </svg>
        }
        required
      />

      <Input
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        leftIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        }
        rightIcon={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-secondary-400 hover:text-secondary-600 focus:outline-none"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        }
        required
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            checked={formData.remember}
            onChange={(e) => handleInputChange('remember', e.target.checked)}
            className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-secondary-700">
            Recordar sesión
          </label>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = '/recuperar-password'}
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={loading || Object.keys(errors).length > 0}
        className="w-full"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-secondary-600">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => window.location.href = '/registro'}
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Regístrate aquí
          </button>
        </p>
      </div>

      {/* Social login divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-secondary-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-secondary-500">O continúa con</span>
        </div>
      </div>

      {/* Social login buttons */}
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          className="w-full inline-flex justify-center py-2.5 px-4 border border-secondary-300 rounded-lg shadow-sm bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          disabled={loading}
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar con Google
        </button>
      </div>
    </form>
  )
}