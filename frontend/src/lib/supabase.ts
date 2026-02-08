import { createClient } from '@supabase/supabase-js'

// Environment variables (fail fast in production)
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] ?? ''
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.PROD) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in production.')
  }

  console.warn(
    'Supabase environment variables not configured. Using placeholder values. Authentication will not work until proper credentials are set.'
  )
}

const resolvedSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co'
const resolvedSupabaseAnonKey = supabaseAnonKey || 'placeholder-anon-key'

// Create Supabase client
export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export types for TypeScript
export type { User, Session } from '@supabase/supabase-js'
