'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout'
import PasswordRecoveryForm from '@/components/features/PasswordRecoveryForm'
import { useAuth } from '@/contexts/AuthContext'

interface ResetRequestData {
  email: string
}

interface NewPasswordData {
  password: string
  confirmPassword: string
}

function RecuperarPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')
  const [mode, setMode] = useState<'request' | 'reset'>('request')
  const [token, setToken] = useState<string | null>(null)
  const { resetPassword, updatePassword } = useAuth()

  useEffect(() => {
    // Check if there's a reset token in the URL
    const resetToken = searchParams.get('token')
    const type = searchParams.get('type')
    
    if (resetToken && type === 'recovery') {
      setMode('reset')
      setToken(resetToken)
    }
  }, [searchParams])

  const handleResetRequest = async (data: ResetRequestData) => {
    setLoading(true)
    
    try {
      const { error } = await resetPassword(data.email)
      
      if (error) {
        throw new Error(error)
      }
      
      // Successful request
      setSuccessEmail(data.email)
      setSuccess(true)
      
    } catch (error) {
      console.error('Reset request error:', error)
      throw error // Re-throw to be handled by the form
    } finally {
      setLoading(false)
    }
  }

  const handleNewPassword = async (data: NewPasswordData) => {
    setLoading(true)
    
    try {
      const { error } = await updatePassword(data.password)
      
      if (error) {
        throw new Error(error)
      }
      
      // Successful password change - redirect to login with success message
      router.push('/login?message=password-changed')
      
    } catch (error) {
      console.error('Password reset error:', error)
      throw error // Re-throw to be handled by the form
    } finally {
      setLoading(false)
    }
  }

  if (success && mode === 'request') {
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                ¡Revisa tu email!
              </h2>
              <p className="text-secondary-600 mb-6">
                Hemos enviado un enlace de recuperación a{' '}
                <span className="font-medium text-secondary-900">{successEmail}</span>
              </p>
              <p className="text-sm text-secondary-500 mb-8">
                Si no ves el email en tu bandeja de entrada, revisa tu carpeta de spam.
                El enlace expirará en 24 horas.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Volver al inicio de sesión
                </button>
                <button
                  onClick={() => {
                    setSuccess(false)
                    setSuccessEmail('')
                  }}
                  className="w-full flex justify-center py-3 px-4 border border-secondary-300 rounded-lg shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Enviar otro enlace
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
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900">
              {mode === 'request' ? 'Recuperar contraseña' : 'Nueva contraseña'}
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              {mode === 'request' 
                ? 'Te ayudamos a recuperar el acceso a tu cuenta'
                : 'Establece una nueva contraseña para tu cuenta'
              }
            </p>
          </div>
          
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-secondary-200">
            <PasswordRecoveryForm
              mode={mode}
              onSubmitRequest={handleResetRequest}
              onSubmitNewPassword={handleNewPassword}
              loading={loading}
              token={token}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function RecuperarPasswordPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-sm text-secondary-600">Cargando...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    }>
      <RecuperarPasswordContent />
    </Suspense>
  )
}