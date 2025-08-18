/**
 * Authentication middleware for JWT validation and Supabase client setup
 * All Access Artist - Backend API v2.0.0
 */
import { createMiddleware } from 'hono/factory'
import { jwt } from 'hono/jwt'
import { createClient } from '@supabase/supabase-js'
import type { Bindings, Variables } from '../types/bindings.js'

// JWT authentication middleware factory
export const createJwtAuth = (getSecret: (c: any) => string) => {
  return async (c: any, next: any) => {
    // Skip JWT validation for OPTIONS requests (CORS preflight)
    if (c.req.method === 'OPTIONS') {
      await next()
      return
    }
    
    try {
      const secret = getSecret(c)
      console.log('JWT Secret exists:', !!secret)
      console.log('JWT Secret length:', secret?.length || 0)
      
      const jwtMiddleware = jwt({ secret })
      return jwtMiddleware(c, next)
    } catch (error) {
      console.error('JWT middleware error:', error)
      return c.json({ error: 'JWT validation failed' }, 401)
    }
  }
}

// User-scoped Supabase client middleware with direct JWT validation
export const supabaseAuth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
  console.log('=== SUPABASE AUTH MIDDLEWARE START ===')
  try {
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (c.req.method === 'OPTIONS') {
      console.log('OPTIONS request, skipping auth')
      await next()
      return
    }

    console.log('1. Checking Authorization header...')
    const authHeader = c.req.header('Authorization')
    console.log('Auth header exists:', !!authHeader)
    console.log('Auth header starts with Bearer:', authHeader?.startsWith('Bearer '))
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('ERROR: Missing or invalid authorization header')
      return c.json({ error: 'Missing or invalid authorization header' }, 401)
    }

    const token = authHeader.substring(7)
    console.log('2. Extracted token length:', token.length)
    
    console.log('3. Getting environment variables...')
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
    console.log('SUPABASE_URL exists:', !!supabaseUrl)
    console.log('SUPABASE_SERVICE_KEY exists:', !!supabaseServiceKey)
    console.log('SUPABASE_ANON_KEY exists:', !!supabaseAnonKey)

    console.log('4. Creating Supabase clients...')
    // Create user-scoped Supabase client for RLS operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    
    // Create admin Supabase client for admin operations (no JWT token)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Supabase clients created successfully')

    console.log('5. Validating JWT token with Supabase...')
    // Validate the JWT token by getting the user
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !supabaseUser) {
      console.log('ERROR: JWT token validation failed:', authError?.message)
      return c.json({ error: 'Invalid or expired token' }, 401)
    }
    
    console.log('JWT token validated successfully for user:', supabaseUser.id)
    
    const user = {
      id: supabaseUser.id,
      sub: supabaseUser.id,
      email: supabaseUser.email,
      user_metadata: supabaseUser.user_metadata,
      app_metadata: supabaseUser.app_metadata
    }
    console.log('User object created:', { id: user.id, email: user.email })

    console.log('6. Setting context variables...')
    // Attach user and both supabase clients to context
    c.set('user', user)
    c.set('supabase', supabase)
    c.set('supabaseAdmin', supabaseAdmin)
    c.set('jwtPayload', user)
    
    console.log('=== SUPABASE AUTH MIDDLEWARE SUCCESS ===')
    await next()
  } catch (error) {
    console.log('=== SUPABASE AUTH MIDDLEWARE ERROR ===')
    console.error('Supabase client initialization error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('=== END SUPABASE AUTH MIDDLEWARE ERROR ===')
    return c.json({ error: 'Authentication failed' }, 401)
  }
})
