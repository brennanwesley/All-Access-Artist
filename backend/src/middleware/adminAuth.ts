/**
 * Admin Authentication Middleware - Account Type Validation
 * All Access Artist - Backend API v2.0.0
 */
import { createMiddleware } from 'hono/factory'
import type { Bindings, Variables } from '../types/bindings.js'
import { logger, extractErrorInfo } from '../utils/logger.js'

const adminLogger = logger.child('adminAuth')

/**
 * Middleware to verify user has admin account type
 * Must be used after supabaseAuth middleware
 */
export const adminAuth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
  adminLogger.debug('Admin auth middleware started')
  
  try {
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload?.sub) {
      adminLogger.warn('No JWT payload found')
      return c.json({ 
        success: false, 
        error: 'Authentication required' 
      }, 401)
    }

    const supabase = c.get('supabase')
    if (!supabase) {
      adminLogger.error('No supabase client found')
      return c.json({ 
        success: false, 
        error: 'Database connection error' 
      }, 500)
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', jwtPayload.sub)
      .single()

    if (profileError) {
      adminLogger.error('Failed to fetch user profile', { userId: jwtPayload.sub, error: profileError.message })
      return c.json({ 
        success: false, 
        error: 'Failed to verify account permissions' 
      }, 500)
    }

    if (!userProfile || userProfile.account_type !== 'admin') {
      adminLogger.warn('Admin access denied', { userId: jwtPayload.sub, accountType: userProfile?.account_type })
      return c.json({ 
        success: false, 
        error: 'Admin access required' 
      }, 403)
    }

    adminLogger.debug('Admin access verified', { userId: jwtPayload.sub })
    await next()
  } catch (error) {
    adminLogger.error('Admin auth error', extractErrorInfo(error))
    return c.json({ 
      success: false, 
      error: 'Admin authentication failed' 
    }, 500)
  }
})
