'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout'
import RegistrationForm from '@/components/features/RegistrationForm'
import { UserRole } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface RegistrationData {
  email: string
  password: string
  username: string
  full_name: string
  role: UserRole
}

export default function RegistroPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const { signUp, user, checkUsernameAvailability } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleRegistration = async (data: RegistrationData) => {
    setLoading(true)
    
    try {
      const { error } = await signUp(data)
      
      if (error) {
        throw new Error(error)
      }
      
      // Successful registration
      setRegisteredEmail(data.email)
      setSuccess(true)
      
    } catch (error) {
      console.error('Registration error:', error)
      throw error // Re-throw to be handled by the form
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 mb-6">
                <svg
                  className="h-8 w-8 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                ¡Cuenta creada exitosamente!
              </h2>
              <p className="text-secondary-600 mb-6">
                Hemos enviado un enlace de verificación a{' '}
                <span className="font-medium text-secondary-900">{registeredEmail}</span>
              </p>
              <p className="text-sm text-secondary-500 mb-8">
                Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Ir al inicio de sesión
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full flex justify-center py-3 px-4 border border-secondary-300 rounded-lg shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900">
              Únete a Project Lens
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Conecta con profesionales de la industria visual
            </p>
          </div>
          
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-secondary-200">
            <RegistrationForm 
              onSubmit={handleRegistration} 
              onCheckUsername={checkUsernameAvailability}
              loading={loading} 
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}