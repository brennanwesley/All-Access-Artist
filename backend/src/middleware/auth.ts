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
    
    const secret = getSecret(c)
    const jwtMiddleware = jwt({ secret })
    return jwtMiddleware(c, next)
  }
}

// User-scoped Supabase client middleware
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
    console.log('SUPABASE_URL exists:', !!supabaseUrl)
    console.log('SUPABASE_SERVICE_KEY exists:', !!supabaseServiceKey)
    console.log('SUPABASE_URL value:', supabaseUrl)

    console.log('4. Creating Supabase client...')
    // Create service-role Supabase client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    console.log('Supabase client created successfully')

    console.log('5. Getting JWT payload...')
    // Get user from JWT payload (already validated by jwt middleware)
    const payload = c.get('jwtPayload')
    console.log('JWT payload from context:', payload)
    
    const user = {
      sub: payload.sub,
      email: payload.email,
      ...payload
    }
    console.log('User object created:', user)

    console.log('6. Setting context variables...')
    // Attach user-scoped client and user to context
    c.set('supabase', supabase)
    c.set('user', user)
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
