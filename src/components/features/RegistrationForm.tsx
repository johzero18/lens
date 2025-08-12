'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Input } from '@/components/ui'
import { UserRole } from '@/types'
import { isValidEmail, isValidPassword, isValidUsername } from '@/lib/utils'
import { VALIDATION_LIMITS, ERROR_MESSAGES } from '@/lib/constants'

interface RegistrationFormData {
  email: string
  password: string
  confirmPassword: string
  username: string
  full_name: string
  role: UserRole | ''
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  username?: string
  full_name?: string
  role?: string
  general?: string
}

interface RegistrationFormProps {
  onSubmit: (data: {
    email: string
    password: string
    username: string
    full_name: string
    role: UserRole
  }) => Promise<void>
  onCheckUsername?: (username: string) => Promise<{ available: boolean; error: string | null }>
  loading?: boolean
}

const ROLE_OPTIONS = [
  { value: 'photographer', label: 'Fotógrafo/a' },
  { value: 'model', label: 'Modelo' },
  { value: 'makeup_artist', label: 'Maquillador/a' },
  { value: 'stylist', label: 'Estilista' },
  { value: 'producer', label: 'Productor/a' },
] as const

export default function RegistrationForm({ onSubmit, onCheckUsername, loading = false }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: '',
    role: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  // Real-time validation
  const validateField = (field: keyof RegistrationFormData, value: string) => {
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
          newErrors.confirmPassword = 'Confirma tu contraseña'
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden'
        } else {
          delete newErrors.confirmPassword
        }
        break

      case 'username':
        if (!value) {
          newErrors.username = 'El nombre de usuario es requerido'
        } else if (value.length < VALIDATION_LIMITS.USERNAME_MIN_LENGTH) {
          newErrors.username = `Mínimo ${VALIDATION_LIMITS.USERNAME_MIN_LENGTH} caracteres`
        } else if (value.length > VALIDATION_LIMITS.USERNAME_MAX_LENGTH) {
          newErrors.username = `Máximo ${VALIDATION_LIMITS.USERNAME_MAX_LENGTH} caracteres`
        } else if (!isValidUsername(value)) {
          newErrors.username = 'Solo letras, números y guiones bajos'
        } else {
          delete newErrors.username
        }
        break

      case 'full_name':
        if (!value) {
          newErrors.full_name = 'El nombre completo es requerido'
        } else if (value.length < 2) {
          newErrors.full_name = 'El nombre debe tener al menos 2 caracteres'
        } else {
          delete newErrors.full_name
        }
        break

      case 'role':
        if (!value) {
          newErrors.role = 'Selecciona tu rol profesional'
        } else {
          delete newErrors.role
        }
        break
    }

    setErrors(newErrors)
  }

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || !isValidUsername(username)) {
      setUsernameAvailable(null)
      return
    }

    setIsCheckingUsername(true)
    
    try {
      if (onCheckUsername) {
        const { available, error } = await onCheckUsername(username)
        
        if (error) {
          console.error('Username check error:', error)
          setUsernameAvailable(null)
          return
        }
        
        setUsernameAvailable(available)

        if (!available) {
          setErrors(prev => ({ ...prev, username: ERROR_MESSAGES.USERNAME_TAKEN }))
        }
      } else {
        // Fallback mock implementation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const unavailableUsernames = ['admin', 'test', 'user', 'photographer', 'model']
        const isAvailable = !unavailableUsernames.includes(username.toLowerCase())
        
        setUsernameAvailable(isAvailable)

        if (!isAvailable) {
          setErrors(prev => ({ ...prev, username: ERROR_MESSAGES.USERNAME_TAKEN }))
        }
      }
    } catch (error) {
      console.error('Username check error:', error)
      setUsernameAvailable(null)
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)

    // Check username availability with debounce
    if (field === 'username') {
      setUsernameAvailable(null)
      setTimeout(() => {
        checkUsernameAvailability(value)
      }, 500)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    Object.keys(formData).forEach(key => {
      validateField(key as keyof RegistrationFormData, formData[key as keyof RegistrationFormData])
    })

    // Check if form is valid
    const hasErrors = Object.keys(errors).length > 0
    const hasEmptyFields = Object.values(formData).some(value => !value)

    if (hasErrors || hasEmptyFields || usernameAvailable === false) {
      return
    }

    try {
      await onSubmit({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: formData.full_name,
        role: formData.role as UserRole,
      })
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'Error al crear la cuenta'
      }))
    }
  }

  const getUsernameIcon = () => {
    if (isCheckingUsername) {
      return (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )
    }

    if (usernameAvailable === true) {
      return (
        <svg className="h-4 w-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    }

    if (usernameAvailable === false) {
      return (
        <svg className="h-4 w-4 text-error-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    }

    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="rounded-lg bg-error-50 border border-error-200 p-4">
          <p className="text-sm text-error-600">{errors.general}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nombre completo"
          type="text"
          value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          error={errors.full_name}
          placeholder="Tu nombre completo"
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          placeholder="tu@email.com"
          required
        />
      </div>

      <Input
        label="Nombre de usuario"
        type="text"
        value={formData.username}
        onChange={(e) => handleInputChange('username', e.target.value)}
        error={errors.username}
        placeholder="nombreusuario"
        helperText="3-20 caracteres, solo letras, números y guiones bajos"
        rightIcon={getUsernameIcon()}
        required
      />

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Rol profesional *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`
                relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${formData.role === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
                }
              `}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={formData.role === option.value}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="sr-only"
              />
              <span className="text-sm font-medium">{option.label}</span>
              {formData.role === option.value && (
                <svg
                  className="absolute top-2 right-2 h-4 w-4 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </label>
          ))}
        </div>
        {errors.role && (
          <p className="mt-2 text-sm text-error-600">{errors.role}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Contraseña"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
          placeholder="••••••••"
          helperText="Mínimo 8 caracteres con letras y números"
          required
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="terms"
          required
          className="mt-1 h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="terms" className="text-sm text-secondary-600">
          Acepto los{' '}
          <Link href="/terminos" className="text-primary-600 hover:text-primary-500 underline">
            términos de servicio
          </Link>{' '}
          y la{' '}
          <Link href="/privacidad" className="text-primary-600 hover:text-primary-500 underline">
            política de privacidad
          </Link>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={loading || Object.keys(errors).length > 0 || usernameAvailable === false}
        className="w-full"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-secondary-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </form>
  )
}