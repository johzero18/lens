import { supabase } from './supabase'
import { UserRole } from '@/types'

export interface AuthUser {
  id: string
  email: string
  username?: string
  full_name?: string
  role?: UserRole
  avatar_url?: string
  email_confirmed_at?: string
}

export interface SignUpData {
  email: string
  password: string
  username: string
  full_name: string
  role: UserRole
}

export interface SignInData {
  email: string
  password: string
  remember?: boolean
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.full_name,
            role: data.role,
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        return { user: null, error: this.getErrorMessage(authError.message) }
      }

      if (!authData.user) {
        return { user: null, error: 'Error al crear la cuenta' }
      }

      // Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: data.username,
          full_name: data.full_name,
          role: data.role,
          bio: '',
          location: '',
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // If profile creation fails, we should clean up the auth user
        // but for now, we'll just return the error
        return { user: null, error: 'Error al crear el perfil de usuario' }
      }

      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        username: data.username,
        full_name: data.full_name,
        role: data.role,
        email_confirmed_at: authData.user.email_confirmed_at,
      }

      return { user, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { user: null, error: 'Error inesperado al crear la cuenta' }
    }
  }

  /**
   * Sign in a user with email and password
   */
  static async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        console.error('Auth signin error:', authError)
        return { user: null, error: this.getErrorMessage(authError.message) }
      }

      if (!authData.user) {
        return { user: null, error: 'Error al iniciar sesión' }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, role, avatar_url')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        // Continue without profile data
      }

      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        username: profile?.username,
        full_name: profile?.full_name,
        role: profile?.role,
        avatar_url: profile?.avatar_url,
        email_confirmed_at: authData.user.email_confirmed_at,
      }

      return { user, error: null }
    } catch (error) {
      console.error('Signin error:', error)
      return { user: null, error: 'Error inesperado al iniciar sesión' }
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Signout error:', error)
        return { error: 'Error al cerrar sesión' }
      }

      return { error: null }
    } catch (error) {
      console.error('Signout error:', error)
      return { error: 'Error inesperado al cerrar sesión' }
    }
  }

  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('Get user error:', authError)
        return { user: null, error: 'Error al obtener usuario' }
      }

      if (!authUser) {
        return { user: null, error: null }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, role, avatar_url')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        // Continue without profile data
      }

      const user: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        username: profile?.username,
        full_name: profile?.full_name,
        role: profile?.role,
        avatar_url: profile?.avatar_url,
        email_confirmed_at: authUser.email_confirmed_at,
      }

      return { user, error: null }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error: 'Error inesperado al obtener usuario' }
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(data: ResetPasswordData): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/recuperar-password`,
      })

      if (error) {
        console.error('Reset password error:', error)
        return { error: this.getErrorMessage(error.message) }
      }

      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: 'Error inesperado al enviar email de recuperación' }
    }
  }

  /**
   * Update user password (when user has reset token)
   */
  static async updatePassword(data: UpdatePasswordData): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        console.error('Update password error:', error)
        return { error: this.getErrorMessage(error.message) }
      }

      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: 'Error inesperado al actualizar contraseña' }
    }
  }

  /**
   * Check if username is available
   */
  static async checkUsernameAvailability(username: string): Promise<{ available: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which means available
        console.error('Username check error:', error)
        return { available: false, error: 'Error al verificar disponibilidad' }
      }

      // If we found a user with this username, it's not available
      const available = !data

      return { available, error: null }
    } catch (error) {
      console.error('Username availability error:', error)
      return { available: false, error: 'Error inesperado al verificar username' }
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, role, avatar_url')
          .eq('id', session.user.id)
          .single()

        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          username: profile?.username,
          full_name: profile?.full_name,
          role: profile?.role,
          avatar_url: profile?.avatar_url,
          email_confirmed_at: session.user.email_confirmed_at,
        }

        callback(user)
      } else {
        callback(null)
      }
    })
  }

  /**
   * Convert Supabase error messages to user-friendly Spanish messages
   */
  private static getErrorMessage(error: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email o contraseña incorrectos',
      'Email not confirmed': 'Debes confirmar tu email antes de iniciar sesión',
      'User already registered': 'Ya existe una cuenta con este email',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Invalid email': 'Email inválido',
      'Signup is disabled': 'El registro está temporalmente deshabilitado',
      'Email rate limit exceeded': 'Has enviado demasiados emails. Espera unos minutos.',
      'Invalid reset token': 'El enlace de recuperación ha expirado o es inválido',
    }

    return errorMap[error] || 'Error inesperado. Inténtalo de nuevo.'
  }
}