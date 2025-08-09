import { createClient } from '@supabase/supabase-js'

// Environment variables (with fallbacks to prevent crashes)
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] || 'placeholder-anon-key'

if (!import.meta.env['VITE_SUPABASE_URL'] || !import.meta.env['VITE_SUPABASE_ANON_KEY']) {
  console.warn('Supabase environment variables not configured. Using placeholder values. Authentication will not work until proper credentials are set.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export types for TypeScript
export type { User, Session } from '@supabase/supabase-js'
