import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Alias for compatibility
export const createClient = () => supabase

// Server-side client for admin operations
export const createSupabaseServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!serviceRoleKey) {
    throw new Error('Missing Supabase service role key')
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      get() {
        return undefined
      },
      set() {},
      remove() {},
    },
  })
}