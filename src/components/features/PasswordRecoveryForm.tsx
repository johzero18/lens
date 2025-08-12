'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { isValidEmail, isValidPassword } from '@/lib/utils'
import { ERROR_MESSAGES, VALIDATION_LIMITS } from '@/lib/constants'

interface ResetRequestFormData {
  email: string
}

interface NewPasswordFormData {
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface PasswordRecoveryFormProps {
  mode: 'request' | 'reset'
  onSubmitRequest?: (data: ResetRequestFormData) => Promise<void>
  onSubmitNewPassword?: (data: NewPasswordFormData) => Promise<void>
  loading?: boolean
  token?: string | null
}

export default function PasswordRecoveryForm({
  mode,
  onSubmitRequest,
  onSubmitNewPassword,
  loading = false
}: PasswordRecoveryFormProps) {
  const [requestData, setRequestData] = useState<ResetRequestFormData>({
    email: '',
  })

  const [passwordData, setPasswordData] = useState<NewPasswordFormData>({
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Real-time validation for request form
  const validateRequestField = (field: keyof ResetRequestFormData, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'email':
        if (!value) {
          newErrors.email = 'El email es requerido'
        } else if (!isValidEmail(value)) {
          newErrors.email = ERROR_MESSAGES.INVALID_EMAIL
        } else {
          delete newErrors.email
        }
        break
    }

    setErrors(newErrors)
  }

  // Real-time validation for password reset form
  const validatePasswordField = (field: keyof NewPasswordFormData, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'password':
        if (!value) {
          newErrors.password = 'La contraseña es requerida'
        } else if (value.length < VALIDATION_LIMITS.PASSWORD_MIN_LENGTH) {
          newErrors.password = `La contraseña debe tener al menos ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} caracteres`
        } else if (!isValidPassword(value)) {
          newErrors.password = 'La contraseña debe contener letras y números'
        } else {
          delete newErrors.password
        }
        break

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Confirma tu nueva contraseña'
        } else if (value !== passwordData.password) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden'
        } else {
          delete newErrors.confirmPassword
        }
        break
    }

    setErrors(newErrors)
  }

  const handleRequestInputChange = (field: keyof ResetRequestFormData, value: string) => {
    setRequestData(prev => ({ ...prev, [field]: value }))
    validateRequestField(field, value)
  }

  const handlePasswordInputChange = (field: keyof NewPasswordFormData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    validatePasswordField(field, value)
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear general error
    setErrors(prev => ({ ...prev, general: undefined }))

    // Validate all fields
    validateRequestField('email', requestData.email)

    // Check if form is valid
    const hasErrors = Object.keys(errors).length > 0
    const hasEmptyFields = !requestData.email

    if (hasErrors || hasEmptyFields) {
      return
    }

    try {
      if (onSubmitRequest) {
        await onSubmitRequest(requestData)
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'Error al enviar solicitud'
      }))
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear general error
    setErrors(prev => ({ ...prev, general: undefined }))

    // Validate all fields
    validatePasswordField('password', passwordData.password)
    validatePasswordField('confirmPassword', passwordData.confirmPassword)

    // Check if form is valid
    const hasErrors = Object.keys(errors).length > 0
    const hasEmptyFields = !passwordData.password || !passwordData.confirmPassword

    if (hasErrors || hasEmptyFields) {
      return
    }

    try {
      if (onSubmitNewPassword) {
        await onSubmitNewPassword(passwordData)
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'Error al cambiar contraseña'
      }))
    }
  }

  if (mode === 'request') {
    return (
      <form onSubmit={handleRequestSubmit} className="space-y-6">
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

        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
            <svg
              className="h-6 w-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="text-sm text-secondary-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <Input
          label="Email"
          type="email"
          value={requestData.email}
          onChange={(e) => handleRequestInputChange('email', e.target.value)}
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading || Object.keys(errors).length > 0}
          className="w-full"
        >
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-secondary-600">
            ¿Recordaste tu contraseña?{' '}
            <button
              type="button"
              onClick={() => window.location.href = '/login'}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Volver al inicio de sesión
            </button>
          </p>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handlePasswordSubmit} className="space-y-6">
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

      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100 mb-4">
          <svg
            className="h-6 w-6 text-success-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-secondary-600">
          Crea una nueva contraseña segura para tu cuenta.
        </p>
      </div>

      <Input
        label="Nueva contraseña"
        type={showPassword ? 'text' : 'password'}
        value={passwordData.password}
        onChange={(e) => handlePasswordInputChange('password', e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        helperText="Mínimo 8 caracteres con letras y números"
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
            onClick={() => setShowPassword(!showPassword)}
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

      <Input
        label="Confirmar nueva contraseña"
        type={showConfirmPassword ? 'text' : 'password'}
        value={passwordData.confirmPassword}
        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
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
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-secondary-400 hover:text-secondary-600 focus:outline-none"
          >
            {showConfirmPassword ? (
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={loading || Object.keys(errors).length > 0}
        className="w-full"
      >
        {loading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
      </Button>
    </form>
  )
}