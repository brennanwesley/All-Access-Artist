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
  try {
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (c.req.method === 'OPTIONS') {
      await next()
      return
    }

    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401)
    }

    const token = authHeader.substring(7)
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

    // Create service-role Supabase client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Get user from JWT payload (already validated by jwt middleware)
    const payload = c.get('jwtPayload')
    const user = {
      sub: payload.sub,
      email: payload.email,
      ...payload
    }

    // Attach user-scoped client and user to context
    c.set('supabase', supabase)
    c.set('user', user)
    c.set('jwtPayload', user)
    
    await next()
  } catch (error) {
    console.error('Supabase client initialization error:', error)
    return c.json({ error: 'Authentication failed' }, 401)
  }
})
