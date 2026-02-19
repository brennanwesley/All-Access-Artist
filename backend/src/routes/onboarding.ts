/**
 * Onboarding Routes - All Access Artist
 * Handle post-payment account completion
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Variables } from '../types/bindings.js'
import type Stripe from 'stripe'
import { validateRequest } from '../middleware/validation.js'
import { errorResponse } from '../utils/apiResponse.js'

const onboarding = new Hono<{ Variables: Variables }>()

// Helper function to create Supabase admin client for onboarding operations
const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Validation schema for onboarding completion
const CompleteOnboardingSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  artist_name: z.string().optional().nullable(),
  referral_code: z.string().length(6, 'Referral code must be exactly 6 characters').regex(/^[A-Z0-9]+$/, 'Referral code must contain only uppercase letters and numbers').optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

const OnboardingStatusParamSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required')
})

const CreateFallbackSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required')
})

/**
 * POST /api/onboarding/complete
 * Complete user onboarding after successful payment
 */
onboarding.post('/complete', validateRequest('json', CompleteOnboardingSchema), async (c) => {
  try {
    const { session_id, full_name, email, phone, artist_name, referral_code, password } = c.req.valid('json')

    // Create Supabase admin client for database operations
    const supabase = createSupabaseAdmin()

    // Find user by session ID and onboarding token
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        onboarding_token,
        onboarding_token_expires,
        stripe_session_id
      `)
      .eq('stripe_session_id', session_id)
      .single()

    if (profileError || !profile) {
      // Check if this is an existing user by email
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === email)
      
      if (existingUser) {
        return errorResponse(c, 409, 'An account with this email already exists. Please sign in instead.', 'ONBOARDING_EMAIL_EXISTS')
      }
      
      return errorResponse(c, 404, 'Invalid session. Please contact support.', 'ONBOARDING_SESSION_INVALID')
    }

    // Check if onboarding token is still valid
    const now = new Date()
    const expiresAt = new Date(profile.onboarding_token_expires)
    
    if (now > expiresAt) {
      return errorResponse(c, 400, 'Onboarding session expired. Please contact support.', 'ONBOARDING_SESSION_EXPIRED')
    }

    // Update user account with new password and profile info
    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      email: email,
      password: password,
      user_metadata: {
        full_name: full_name,
        artist_name: artist_name,
        onboarding_completed: true,
        completed_at: new Date().toISOString()
      }
    })

    if (updateError) {
      return errorResponse(c, 500, 'Failed to update account. Please try again.', 'ONBOARDING_ACCOUNT_UPDATE_FAILED')
    }

    // Parse full name into first and last name
    const nameParts = full_name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null

    // Handle referral code if provided
    let referredByUserId = null
    if (referral_code) {
      const { data: referringUser, error: referralError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('referral_code', referral_code)
        .single()

      if (referralError || !referringUser) {
        return errorResponse(c, 400, 'Invalid referral code. Please check and try again.', 'ONBOARDING_REFERRAL_INVALID')
      }

      referredByUserId = referringUser.id
    }

    // Update user profile with complete information
    const { error: updateProfileError } = await supabase
      .from('user_profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        artist_name: artist_name,
        referred_by: referredByUserId,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_token: null, // Clear the token
        onboarding_token_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateProfileError) {
      return errorResponse(c, 500, 'Failed to complete profile setup. Please try again.', 'ONBOARDING_PROFILE_UPDATE_FAILED')
    }

    // Create artist_profiles record for artist accounts
    if (artist_name) {
      const { error: artistProfileError } = await supabase
        .from('artist_profiles')
        .insert({
          user_id: profile.id,
          artist_name: artist_name,
          real_name: `${firstName}${lastName ? ' ' + lastName : ''}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (artistProfileError) {
        // Don't fail onboarding if artist profile creation fails
      }
    }

    return c.json({
      success: true,
      data: {
        message: 'Onboarding completed successfully',
        user_id: profile.id,
        email: email
      }
    })

  } catch (_error) {
    return errorResponse(c, 500, 'Internal server error', 'ONBOARDING_COMPLETE_FAILED')
  }
})

/**
 * GET /api/onboarding/status/:session_id
 * Check onboarding status for a session
 */
onboarding.get('/status/:session_id', validateRequest('param', OnboardingStatusParamSchema), async (c) => {
  try {
    const { session_id: sessionId } = c.req.valid('param')
    const supabase = createSupabaseAdmin()

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        onboarding_completed,
        onboarding_token_expires,
        stripe_session_id
      `)
      .eq('stripe_session_id', sessionId)
      .single()

    if (error || !profile) {
      return errorResponse(c, 404, 'Session not found', 'ONBOARDING_STATUS_NOT_FOUND')
    }

    const now = new Date()
    const expiresAt = new Date(profile.onboarding_token_expires)
    const isExpired = now > expiresAt

    return c.json({
      success: true,
      data: {
        session_id: sessionId,
        user_id: profile.id,
        onboarding_completed: profile.onboarding_completed,
        token_expired: isExpired,
        expires_at: profile.onboarding_token_expires
      }
    })

  } catch (_error) {
    return errorResponse(c, 500, 'Internal server error', 'ONBOARDING_STATUS_FAILED')
  }
})

/**
 * POST /api/onboarding/create-fallback
 * Fallback account creation if webhook failed
 */
onboarding.post('/create-fallback', validateRequest('json', CreateFallbackSchema), async (c) => {
  try {
    const { session_id } = c.req.valid('json')
    
    // Create Supabase admin client for database operations
    const supabase = createSupabaseAdmin()
    
    // Check if account already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('stripe_session_id', session_id)
      .single()

    if (existingProfile) {
      return c.json({
        success: true,
        data: { message: 'Account already exists', user_id: existingProfile.id }
      })
    }

    // Import StripeService to handle fallback creation
    const { StripeService } = await import('../services/stripeService.js')
    const stripeService = new StripeService(supabase)
    
    // Retrieve session from Stripe to get customer details
    const stripe = stripeService.getStripeInstance()
    const session = await stripe.checkout.sessions.retrieve(session_id)
    
    if (!session.customer_details?.email) {
      return errorResponse(c, 400, 'Unable to retrieve customer details from Stripe', 'ONBOARDING_FALLBACK_CUSTOMER_DETAILS_MISSING')
    }

    // Create account using the same logic as webhook
    await stripeService.handleCheckoutCompleted(session as Stripe.Checkout.Session)
    
    return c.json({
      success: true,
      data: { message: 'Account created successfully via fallback' }
    })

  } catch (_error) {
    return errorResponse(c, 500, 'Failed to create account. Please contact support.', 'ONBOARDING_FALLBACK_FAILED')
  }
})

export default onboarding
