/**
 * Authentication middleware for JWT validation and Supabase client setup
 * All Access Artist - Backend API v2.0.0
 */
import { createMiddleware } from 'hono/factory'
import { jwt } from 'hono/jwt'
import { createClient } from '@supabase/supabase-js'
import type { Bindings, Variables } from '../types/bindings.js'
import { logger, extractErrorInfo } from '../utils/logger.js'
import { errorResponse } from '../utils/apiResponse.js'

const authLogger = logger.child('auth')

// JWT authentication middleware factory
export const createJwtAuth = (getSecret: (c: unknown) => string) => {
  return async (c: unknown, next: () => Promise<void>) => {
    const ctx = c as { req: { method: string }; json: (data: unknown, status: number) => Response }
    // Skip JWT validation for OPTIONS requests (CORS preflight)
    if (ctx.req.method === 'OPTIONS') {
      await next()
      return
    }
    
    try {
      const secret = getSecret(c)
      authLogger.debug('JWT validation starting', { secretExists: !!secret, secretLength: secret?.length || 0 })
      
      const jwtMiddleware = jwt({ secret })
      return jwtMiddleware(c as Parameters<typeof jwtMiddleware>[0], next)
    } catch (error) {
      authLogger.error('JWT middleware error', extractErrorInfo(error))
      return errorResponse(c as Parameters<typeof errorResponse>[0], 401, 'JWT validation failed', 'AUTH_JWT_FAILED')
    }
  }
}

// User-scoped Supabase client middleware with direct JWT validation
export const supabaseAuth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
  const requestPath = c.req.path
  authLogger.debug('Auth middleware started', { path: requestPath, method: c.req.method })
  
  try {
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (c.req.method === 'OPTIONS') {
      authLogger.debug('OPTIONS request, skipping auth')
      await next()
      return
    }

    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      authLogger.warn('Missing or invalid authorization header', { path: requestPath })
      return errorResponse(c, 401, 'Missing or invalid authorization header', 'AUTH_HEADER_INVALID')
    }

    const token = authHeader.substring(7)
    authLogger.debug('Token extracted', { tokenLength: token.length })
    
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      authLogger.error('Missing Supabase environment variables', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        hasAnonKey: !!supabaseAnonKey
      })
      return errorResponse(c, 500, 'Server configuration error', 'AUTH_SERVER_CONFIG_ERROR')
    }

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

    // Validate the JWT token by getting the user
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !supabaseUser) {
      authLogger.warn('JWT token validation failed', { error: authError?.message, path: requestPath })
      return errorResponse(c, 401, 'Invalid or expired token', 'AUTH_TOKEN_INVALID')
    }
    
    authLogger.debug('User authenticated', { userId: supabaseUser.id, email: supabaseUser.email })
    
    const user = {
      id: supabaseUser.id,
      sub: supabaseUser.id,
      email: supabaseUser.email,
      phone: supabaseUser.phone,
      user_metadata: supabaseUser.user_metadata,
      app_metadata: supabaseUser.app_metadata
    }

    // Attach user and both supabase clients to context
    c.set('user', user)
    c.set('supabase', supabase)
    c.set('supabaseAdmin', supabaseAdmin)
    c.set('jwtPayload', user)
    
    await next()
  } catch (error) {
    authLogger.error('Auth middleware error', {
      ...extractErrorInfo(error),
      path: requestPath
    })
    return errorResponse(c, 401, 'Authentication failed', 'AUTH_FAILED')
  }
})
