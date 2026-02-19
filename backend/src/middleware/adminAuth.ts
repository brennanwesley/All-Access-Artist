/**
 * Admin Authentication Middleware - Account Type Validation
 * All Access Artist - Backend API v2.0.0
 */
import { createMiddleware } from 'hono/factory'
import type { Bindings, Variables } from '../types/bindings.js'
import { logger, extractErrorInfo } from '../utils/logger.js'
import { errorResponse } from '../utils/apiResponse.js'

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
      return errorResponse(c, 401, 'Authentication required', 'ADMIN_AUTH_REQUIRED')
    }

    const supabase = c.get('supabase')
    if (!supabase) {
      adminLogger.error('No supabase client found')
      return errorResponse(c, 500, 'Database connection error', 'ADMIN_DATABASE_CONNECTION_ERROR')
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', jwtPayload.sub)
      .single()

    if (profileError) {
      adminLogger.error('Failed to fetch user profile', { userId: jwtPayload.sub, error: profileError.message })
      return errorResponse(c, 500, 'Failed to verify account permissions', 'ADMIN_PROFILE_FETCH_FAILED')
    }

    if (!userProfile || userProfile.account_type !== 'admin') {
      adminLogger.warn('Admin access denied', { userId: jwtPayload.sub, accountType: userProfile?.account_type })
      return errorResponse(c, 403, 'Admin access required', 'ADMIN_ACCESS_REQUIRED')
    }

    adminLogger.debug('Admin access verified', { userId: jwtPayload.sub })
    await next()
  } catch (error) {
    adminLogger.error('Admin auth error', extractErrorInfo(error))
    return errorResponse(c, 500, 'Admin authentication failed', 'ADMIN_AUTH_FAILED')
  }
})
