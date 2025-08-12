'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout'
import LoginForm from '@/components/features/LoginForm'
import { useAuth } from '@/contexts/AuthContext'

interface LoginData {
  email: string
  password: string
  remember: boolean
}

function LoginContent() {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { signIn, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for success messages from URL params
    const message = searchParams.get('message')
    if (message === 'password-changed') {
      setSuccessMessage('Contraseña cambiada exitosamente. Puedes iniciar sesión con tu nueva contraseña.')
    }
  }, [searchParams])

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleLogin = async (data: LoginData) => {
    setLoading(true)
    
    try {
      const { error } = await signIn(data.email, data.password, data.remember)
      
      if (error) {
        throw new Error(error)
      }
      
      // Successful login - redirect to home or intended page
      const redirectTo = searchParams.get('redirect') || '/'
      router.push(redirectTo)
      
    } catch (error) {
      console.error('Login error:', error)
      throw error // Re-throw to be handled by the form
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900">
              Bienvenido de vuelta
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Inicia sesión en tu cuenta de Project Lens
            </p>
          </div>

          {successMessage && (
            <div className="rounded-lg bg-success-50 border border-success-200 p-4">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-success-400 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-success-600">{successMessage}</p>
              </div>
            </div>
          )}
          
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-secondary-200">
            <LoginForm onSubmit={handleLogin} loading={loading} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  )
}