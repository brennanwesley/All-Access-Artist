/**
 * Environment variable types for Node.js
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export type AuthenticatedUser = {
  id: string
  sub: string
  email?: string | null
  phone?: string | null
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
}

export type Bindings = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  SUPABASE_ANON_KEY: string
  SUPABASE_JWT_SECRET: string
  NODE_ENV: string
  PORT: string
  ENVIRONMENT: string
}

/**
 * Hono context variables for middleware
 */
export type Variables = {
  supabase: SupabaseClient
  supabaseAdmin: SupabaseClient
  user: AuthenticatedUser
}
