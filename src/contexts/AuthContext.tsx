'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string, remember?: boolean) => Promise<{ error: string | null }>
  signUp: (data: {
    email: string
    password: string
    username: string
    full_name: string
    role: import('@/types').UserRole
  }) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean; error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      try {
        const { user: currentUser } = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial user:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, remember?: boolean) => {
    setLoading(true)
    try {
      const { user: signedInUser, error } = await AuthService.signIn({ 
        email, 
        password, 
        remember 
      })
      
      if (error) {
        return { error }
      }

      setUser(signedInUser)
      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'Error inesperado al iniciar sesión' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: {
    email: string
    password: string
    username: string
    full_name: string
    role: import('@/types').UserRole
  }) => {
    setLoading(true)
    try {
      const { user: newUser, error } = await AuthService.signUp(data)
      
      if (error) {
        return { error }
      }

      // Don't set user immediately for signup since email needs to be confirmed
      // setUser(newUser)
      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'Error inesperado al crear la cuenta' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await AuthService.signOut()
      
      if (error) {
        return { error }
      }

      setUser(null)
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: 'Error inesperado al cerrar sesión' }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await AuthService.resetPassword({ email })
      return { error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: 'Error inesperado al enviar email de recuperación' }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await AuthService.updatePassword({ password })
      return { error }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: 'Error inesperado al actualizar contraseña' }
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    try {
      const { available, error } = await AuthService.checkUsernameAvailability(username)
      return { available, error }
    } catch (error) {
      console.error('Username availability error:', error)
      return { available: false, error: 'Error inesperado al verificar username' }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    checkUsernameAvailability,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}