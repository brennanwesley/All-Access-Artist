/**
 * Subscription Authentication Middleware
 * Controls access based on subscription status with read-only mode for expired users
 */

import { Context, Next } from 'hono'
import { Variables } from '../types/bindings.js'
import { logger, extractErrorInfo } from '../utils/logger.js'
import { authErrorResponse, errorResponse } from '../utils/apiResponse.js'

const subLogger = logger.child('subscriptionAuth')

/**
 * Check if user has active subscription, trial period, or admin privileges
 * Allows read operations for expired users, blocks mutations
 */
export async function subscriptionAuth(c: Context<{ Variables: Variables }>, next: Next) {
  const user = c.get('user')
  const jwtPayload = c.get('jwtPayload')
  
  if (!user || !jwtPayload) {
    return authErrorResponse(c)
  }

  try {
    // Get user's profile including account_type, subscription status, and trial info
    const { data: profile, error } = await c.get('supabase')
      .from('user_profiles')
      .select('account_type, subscription_status, current_period_end, trial_end')
      .eq('id', user.id)
      .single()

    if (error) {
      subLogger.error('Error fetching subscription status', { userId: user.id, error: error.message })
      return errorResponse(c, 500, 'Failed to verify subscription', 'SUBSCRIPTION_VERIFY_FAILED')
    }

    // Admin users always have full access (database-driven, not hardcoded)
    if (profile?.account_type === 'admin') {
      return next()
    }

    const now = new Date()
    
    // Check for active subscription
    const hasActiveSubscription = profile?.subscription_status === 'active' && 
      profile?.current_period_end && 
      new Date(profile.current_period_end) > now
    
    // Check for active trial period
    const hasActiveTrial = profile?.trial_end && 
      new Date(profile.trial_end) > now
    
    // User has access if they have either active subscription OR active trial
    const hasAccess = hasActiveSubscription || hasActiveTrial

    const method = c.req.method.toLowerCase()
    const isMutation = ['post', 'put', 'patch', 'delete'].includes(method)

    // If no access and trying to mutate data
    if (!hasAccess && isMutation) {
      subLogger.warn('Mutation blocked - no active subscription or trial', {
        userId: user.id,
        accountType: profile?.account_type,
        subscriptionStatus: profile?.subscription_status,
        trialEnd: profile?.trial_end
      })
      return errorResponse(
        c,
        403,
        'Active subscription or trial required for this action',
        'SUBSCRIPTION_REQUIRED',
        { upgrade_url: '/profile?tab=pay' }
      )
    }

    // Allow read operations for all authenticated users
    return next()

  } catch (error) {
    subLogger.error('Subscription auth middleware error', extractErrorInfo(error))
    return errorResponse(c, 500, 'Subscription verification failed', 'SUBSCRIPTION_VERIFY_FAILED')
  }
}

/**
 * Strict subscription check - requires active subscription or trial for any access
 * Use for premium features that shouldn't be accessible in read-only mode
 */
export async function requireActiveSubscription(c: Context<{ Variables: Variables }>, next: Next) {
  const user = c.get('user')
  const jwtPayload = c.get('jwtPayload')
  
  if (!user || !jwtPayload) {
    return authErrorResponse(c)
  }

  try {
    // Get user's profile including account_type, subscription status, and trial info
    const { data: profile, error } = await c.get('supabase')
      .from('user_profiles')
      .select('account_type, subscription_status, current_period_end, trial_end')
      .eq('id', user.id)
      .single()

    if (error) {
      subLogger.error('Error fetching subscription status', { userId: user.id, error: error.message })
      return errorResponse(c, 500, 'Failed to verify subscription', 'SUBSCRIPTION_VERIFY_FAILED')
    }

    // Admin users always have full access (database-driven, not hardcoded)
    if (profile?.account_type === 'admin') {
      return next()
    }

    const now = new Date()
    
    // Check for active subscription
    const hasActiveSubscription = profile?.subscription_status === 'active' && 
      profile?.current_period_end && 
      new Date(profile.current_period_end) > now
    
    // Check for active trial period
    const hasActiveTrial = profile?.trial_end && 
      new Date(profile.trial_end) > now
    
    // User has access if they have either active subscription OR active trial
    const hasAccess = hasActiveSubscription || hasActiveTrial

    if (!hasAccess) {
      return errorResponse(
        c,
        403,
        'Active subscription or trial required',
        'SUBSCRIPTION_REQUIRED',
        { upgrade_url: '/profile?tab=pay' }
      )
    }

    return next()

  } catch (error) {
    subLogger.error('Subscription auth middleware error', extractErrorInfo(error))
    return errorResponse(c, 500, 'Subscription verification failed', 'SUBSCRIPTION_VERIFY_FAILED')
  }
}

/**
 * Get user's subscription status for API responses
 */
export async function getSubscriptionStatus(c: Context<{ Variables: Variables }>): Promise<{
  hasActiveSubscription: boolean
  hasActiveTrial: boolean
  subscriptionStatus: string | null
  trialEnd: string | null
  isReadOnly: boolean
}> {
  const user = c.get('user')
  const jwtPayload = c.get('jwtPayload')
  
  if (!user || !jwtPayload) {
    return {
      hasActiveSubscription: false,
      hasActiveTrial: false,
      subscriptionStatus: null,
      trialEnd: null,
      isReadOnly: true
    }
  }

  try {
    // Get user's profile including account_type, subscription status, and trial info
    const { data: profile } = await c.get('supabase')
      .from('user_profiles')
      .select('account_type, subscription_status, current_period_end, trial_end')
      .eq('id', user.id)
      .single()

    // Admin users always have full access (database-driven, not hardcoded)
    if (profile?.account_type === 'admin') {
      return {
        hasActiveSubscription: true,
        hasActiveTrial: false,
        subscriptionStatus: 'admin',
        trialEnd: null,
        isReadOnly: false
      }
    }

    const now = new Date()
    
    const hasActiveSubscription = profile?.subscription_status === 'active' && 
      profile?.current_period_end && 
      new Date(profile.current_period_end) > now
    
    const hasActiveTrial = profile?.trial_end && 
      new Date(profile.trial_end) > now
    
    const hasAccess = hasActiveSubscription || hasActiveTrial

    return {
      hasActiveSubscription,
      hasActiveTrial: !!hasActiveTrial,
      subscriptionStatus: profile?.subscription_status || null,
      trialEnd: profile?.trial_end || null,
      isReadOnly: !hasAccess
    }

  } catch (error) {
    subLogger.error('Error getting subscription status', extractErrorInfo(error))
    return {
      hasActiveSubscription: false,
      hasActiveTrial: false,
      subscriptionStatus: null,
      trialEnd: null,
      isReadOnly: true
    }
  }
}
