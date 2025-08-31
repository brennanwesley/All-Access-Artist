/**
 * Subscription Routes - All Access Artist
 * API endpoints for Stripe subscription management
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Variables } from '../types/bindings.js'
import { StripeService } from '../services/stripeService.js'
import { supabaseAuth } from '../middleware/auth.js'
import { getSubscriptionStatus } from '../middleware/subscriptionAuth.js'

const subscription = new Hono<{ Variables: Variables }>()

// Apply auth middleware to all subscription routes
subscription.use('*', supabaseAuth)

// Validation schemas
const CheckoutSessionSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: z.string().url('Valid success URL required'),
  cancelUrl: z.string().url('Valid cancel URL required')
})

/**
 * GET /api/subscription/status
 * Get user's current subscription status
 */
subscription.get('/status', async (c) => {
  try {
    const user = c.get('user')
    const jwtPayload = c.get('jwtPayload')
    
    if (!user || !jwtPayload) {
      return c.json({ success: false, error: { message: 'Authentication required' } }, 401)
    }

    // Get subscription status
    const status = await getSubscriptionStatus(c)

    // Get detailed profile info including Stripe data
    const { data: profile, error } = await c.get('supabase')
      .from('user_profiles')
      .select(`
        subscription_status,
        subscription_plan_id,
        subscription_plan_name,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        last_payment_date,
        last_payment_amount_cents,
        stripe_customer_id
      `)
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching subscription details:', error)
      return c.json({ success: false, error: { message: 'Failed to fetch subscription details' } }, 500)
    }

    return c.json({
      success: true,
      data: {
        ...status,
        profile: profile || {},
        user: {
          id: user.id,
          email: jwtPayload.email,
          isAdmin: jwtPayload.email === 'brennan.tharaldson@gmail.com',
          isTestUser: jwtPayload.email === 'feedbacklooploop@gmail.com'
        }
      }
    })

  } catch (error) {
    console.error('Error getting subscription status:', error)
    return c.json({ success: false, error: { message: 'Failed to get subscription status' } }, 500)
  }
})

/**
 * POST /api/subscription/checkout
 * Create Stripe Checkout session for subscription
 */
subscription.post('/checkout', zValidator('json', CheckoutSessionSchema), async (c) => {
  try {
    const user = c.get('user')
    const jwtPayload = c.get('jwtPayload')
    const { priceId, successUrl, cancelUrl } = c.req.valid('json')
    
    if (!user || !jwtPayload) {
      return c.json({ success: false, error: { message: 'Authentication required' } }, 401)
    }

    const stripeService = new StripeService(c.get('supabase'))

    // Create or get Stripe customer
    const customerId = await stripeService.createCustomer(user.id, jwtPayload.email!)

    // Create checkout session
    const checkoutUrl = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl
    )

    return c.json({
      success: true,
      data: {
        checkoutUrl,
        customerId
      }
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return c.json({ success: false, error: { message: 'Failed to create checkout session' } }, 500)
  }
})

/**
 * POST /api/subscription/cancel
 * Cancel user's current subscription
 */
subscription.post('/cancel', async (c) => {
  try {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ success: false, error: { message: 'Authentication required' } }, 401)
    }

    // Get user's subscription ID
    const { data: profile, error } = await c.get('supabase')
      .from('user_profiles')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (error || !profile?.stripe_subscription_id) {
      return c.json({ success: false, error: { message: 'No active subscription found' } }, 404)
    }

    const stripeService = new StripeService(c.get('supabase'))
    await stripeService.cancelSubscription(profile.stripe_subscription_id)

    return c.json({
      success: true,
      data: {
        message: 'Subscription canceled successfully',
        subscriptionId: profile.stripe_subscription_id
      }
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return c.json({ success: false, error: { message: 'Failed to cancel subscription' } }, 500)
  }
})

/**
 * GET /api/subscription/products
 * Get available subscription plans and pricing
 */
subscription.get('/products', async (c) => {
  try {
    // Return hardcoded product info for now
    // In production, you might want to fetch this from Stripe or database
    const products = [
      {
        id: 'artist-plan',
        name: 'Artist Plan',
        description: 'Full access to All Access Artist platform for individual artists',
        price: {
          amount: 999, // $9.99 in cents
          currency: 'usd',
          interval: 'month'
        },
        features: [
          'Unlimited releases',
          'Song and lyric management',
          'Analytics and insights',
          'Label copy generation',
          'Split sheet management'
        ]
      }
    ]

    return c.json({
      success: true,
      data: {
        products
      }
    })

  } catch (error) {
    console.error('Error getting subscription products:', error)
    return c.json({ success: false, error: { message: 'Failed to get subscription products' } }, 500)
  }
})

/**
 * POST /api/subscription/setup
 * One-time setup to create Stripe products (admin only)
 */
subscription.post('/setup', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload')
    
    // Only admin can run setup
    if (jwtPayload?.email !== 'brennan.tharaldson@gmail.com') {
      return c.json({ success: false, error: { message: 'Admin access required' } }, 403)
    }

    const stripeService = new StripeService(c.get('supabase'))
    const result = await stripeService.createProducts()

    return c.json({
      success: true,
      data: {
        message: 'Stripe products created successfully',
        ...result
      }
    })

  } catch (error) {
    console.error('Error setting up Stripe products:', error)
    return c.json({ success: false, error: { message: 'Failed to setup Stripe products' } }, 500)
  }
})

export default subscription
