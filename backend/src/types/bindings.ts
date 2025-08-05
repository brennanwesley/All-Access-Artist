/**
 * Environment variable types for Cloudflare Workers
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export type Bindings = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  SUPABASE_ANON_KEY: string
  SUPABASE_JWT_SECRET: string
}

/**
 * Hono context variables for middleware
 */
export type Variables = {
  supabase: SupabaseClient
  user: {
    sub: string
    email?: string
    [key: string]: any
  }
}
