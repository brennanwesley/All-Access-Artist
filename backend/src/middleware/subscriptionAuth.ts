/**
 * Subscription Authentication Middleware
 * Controls access based on subscription status with read-only mode for expired users
 */

import { Context, Next } from 'hono'
import { Variables } from '../types/bindings.js'

/**
 * Check if user has active subscription or admin privileges
 * Allows read operations for expired users, blocks mutations
 */
export async function subscriptionAuth(c: Context<{ Variables: Variables }>, next: Next) {
  const user = c.get('user')
  const jwtPayload = c.get('jwtPayload')
  
  if (!user || !jwtPayload) {
    return c.json({ success: false, error: { message: 'Authentication required' } }, 401)
  }

  // Admin user always has full access
  if (jwtPayload.email === 'brennan.tharaldson@gmail.com') {
    return next()
  }

  // Test user hardcoded with active subscription (temporary)
  if (jwtPayload.email === 'feedbacklooploop@gmail.com') {
    return next()
  }

  try {
    // Get user's subscription status from database
    const { data: profile, error } = await c.get('supabase')
      .from('user_profiles')
      .select('subscription_status, current_period_end')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching subscription status:', error)
      return c.json({ success: false, error: { message: 'Failed to verify subscription' } }, 500)
    }

    const hasActiveSubscription = profile?.subscription_status === 'active' && 
      profile?.current_period_end && 
      new Date(profile.current_period_end) > new Date()

    const method = c.req.method.toLowerCase()
    const isMutation = ['post', 'put', 'patch', 'delete'].includes(method)

    // If no active subscription and trying to mutate data
    if (!hasActiveSubscription && isMutation) {
      return c.json({ 
        success: false, 
        error: { 
          message: 'Active subscription required for this action',
          code: 'SUBSCRIPTION_REQUIRED',
          upgrade_url: '/profile?tab=pay'
        } 
      }, 403)
    }

    // Allow read operations for all authenticated users
    return next()

  } catch (error) {
    console.error('Subscription auth middleware error:', error)
    return c.json({ success: false, error: { message: 'Subscription verification failed' } }, 500)
  }
}

/**
 * Strict subscription check - requires active subscription for any access
 * Use for premium features that shouldn't be accessible in read-only mode
 */
export async function requireActiveSubscription(c: Context<{ Variables: Variables }>, next: Next) {
  const user = c.get('user')
  const jwtPayload = c.get('jwtPayload')
  
  if (!user || !jwtPayload) {
    return c.json({ success: false, error: { message: 'Authentication required' } }, 401)
  }

  // Admin user always has full access
  if (jwtPayload.email === 'brennan.tharaldson@gmail.com') {
    return next()
  }

  // Test user hardcoded with active subscription (temporary)
  if (jwtPayload.email === 'feedbacklooploop@gmail.com') {
    return next()
  }

  try {
    // Get user's subscription status from database
    const { data: profile, error } = await c.get('supabase')
      .from('user_profiles')
      .select('subscription_status, current_period_end')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching subscription status:', error)
      return c.json({ success: false, error: { message: 'Failed to verify subscription' } }, 500)
    }

    const hasActiveSubscription = profile?.subscription_status === 'active' && 
      profile?.current_period_end && 
      new Date(profile.current_period_end) > new Date()

    if (!hasActiveSubscription) {
      return c.json({ 
        success: false, 
        error: { 
          message: 'Active subscription required',
          code: 'SUBSCRIPTION_REQUIRED',
          upgrade_url: '/profile?tab=pay'
        } 
      }, 403)
    }

    return next()

  } catch (error) {
    console.error('Subscription auth middleware error:', error)
    return c.json({ success: false, error: { message: 'Subscription verification failed' } }, 500)
  }
}

/**
 * Get user's subscription status for API responses
 */
export async function getSubscriptionStatus(c: Context<{ Variables: Variables }>): Promise<{
  hasActiveSubscription: boolean
  subscriptionStatus: string | null
  isReadOnly: boolean
}> {
  const user = c.get('user')
  const jwtPayload = c.get('jwtPayload')
  
  if (!user || !jwtPayload) {
    return {
      hasActiveSubscription: false,
      subscriptionStatus: null,
      isReadOnly: true
    }
  }

  // Admin user always has full access
  if (jwtPayload.email === 'brennan.tharaldson@gmail.com') {
    return {
      hasActiveSubscription: true,
      subscriptionStatus: 'admin',
      isReadOnly: false
    }
  }

  // Test user hardcoded with active subscription (temporary)
  if (jwtPayload.email === 'feedbacklooploop@gmail.com') {
    return {
      hasActiveSubscription: true,
      subscriptionStatus: 'active',
      isReadOnly: false
    }
  }

  try {
    const { data: profile } = await c.get('supabase')
      .from('user_profiles')
      .select('subscription_status, current_period_end')
      .eq('id', user.id)
      .single()

    const hasActiveSubscription = profile?.subscription_status === 'active' && 
      profile?.current_period_end && 
      new Date(profile.current_period_end) > new Date()

    return {
      hasActiveSubscription,
      subscriptionStatus: profile?.subscription_status || null,
      isReadOnly: !hasActiveSubscription
    }

  } catch (error) {
    console.error('Error getting subscription status:', error)
    return {
      hasActiveSubscription: false,
      subscriptionStatus: null,
      isReadOnly: true
    }
  }
}
