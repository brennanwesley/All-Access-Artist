/**
 * Onboarding Routes - All Access Artist
 * Handle post-payment account completion
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Variables } from '../types/bindings.js'

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

/**
 * POST /api/onboarding/complete
 * Complete user onboarding after successful payment
 */
onboarding.post('/complete', zValidator('json', CompleteOnboardingSchema), async (c) => {
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
      console.error('Profile not found for session:', session_id, profileError)
      return c.json({ 
        success: false, 
        error: { message: 'Invalid session. Please contact support.' } 
      }, 404)
    }

    // Check if onboarding token is still valid
    const now = new Date()
    const expiresAt = new Date(profile.onboarding_token_expires)
    
    if (now > expiresAt) {
      return c.json({ 
        success: false, 
        error: { message: 'Onboarding session expired. Please contact support.' } 
      }, 400)
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
      console.error('Failed to update auth user:', updateError)
      return c.json({ 
        success: false, 
        error: { message: 'Failed to update account. Please try again.' } 
      }, 500)
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
        return c.json({ 
          success: false, 
          error: { message: 'Invalid referral code. Please check and try again.' } 
        }, 400)
      }

      referredByUserId = referringUser.id
      console.log(`✅ Valid referral code ${referral_code} from user: ${referredByUserId}`)
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
      console.error('Failed to update user profile:', updateProfileError)
      return c.json({ 
        success: false, 
        error: { message: 'Failed to complete profile setup. Please try again.' } 
      }, 500)
    }

    console.log(`✅ Onboarding completed for user: ${profile.id}`)

    return c.json({
      success: true,
      data: {
        message: 'Onboarding completed successfully',
        user_id: profile.id,
        email: email
      }
    })

  } catch (error) {
    console.error('Error completing onboarding:', error)
    return c.json({ 
      success: false, 
      error: { message: 'Internal server error' } 
    }, 500)
  }
})

/**
 * GET /api/onboarding/status/:session_id
 * Check onboarding status for a session
 */
onboarding.get('/status/:session_id', async (c) => {
  try {
    const sessionId = c.req.param('session_id')

    const { data: profile, error } = await c.get('supabase')
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
      return c.json({ 
        success: false, 
        error: { message: 'Session not found' } 
      }, 404)
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

  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return c.json({ 
      success: false, 
      error: { message: 'Internal server error' } 
    }, 500)
  }
})

/**
 * POST /api/onboarding/create-fallback
 * Fallback account creation if webhook failed
 */
onboarding.post('/create-fallback', zValidator('json', z.object({
  session_id: z.string().min(1, 'Session ID is required')
})), async (c) => {
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
      return c.json({
        success: false,
        error: { message: 'Unable to retrieve customer details from Stripe' }
      }, 400)
    }

    // Create account using the same logic as webhook
    await stripeService.handleCheckoutCompleted(session as any)
    
    console.log(`✅ Fallback account creation completed for session: ${session_id}`)

    return c.json({
      success: true,
      data: { message: 'Account created successfully via fallback' }
    })

  } catch (error) {
    console.error('Error in fallback account creation:', error)
    return c.json({ 
      success: false, 
      error: { message: 'Failed to create account. Please contact support.' } 
    }, 500)
  }
})

export default onboarding
