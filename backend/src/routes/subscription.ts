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

// Apply auth middleware to protected subscription routes only
// Products endpoint should be public for plan selection page
subscription.use('/status', supabaseAuth)
subscription.use('/checkout', supabaseAuth)
subscription.use('/cancel', supabaseAuth)
subscription.use('/setup', supabaseAuth)

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
    const { priceId, successUrl, cancelUrl } = c.req.valid('json')
    
    // Create a minimal Supabase client for StripeService (public endpoint)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
    
    const stripeService = new StripeService(supabase)

    // Create checkout session without customer (anonymous checkout)
    const checkoutUrl = await stripeService.createCheckoutSession(
      null, // No customer ID for public checkout
      priceId,
      successUrl,
      cancelUrl
    )

    return c.json({
      success: true,
      data: {
        checkoutUrl
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
 * Get available subscription plans and pricing from Stripe
 */
subscription.get('/products', async (c) => {
  try {
    // Create a minimal Supabase client for StripeService (not used for this endpoint)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
    
    const stripeService = new StripeService(supabase)
    const stripe = stripeService.getStripeInstance()

    // Fetch products from Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    })

    // Filter for Artist Plan and get its prices
    const artistProduct = products.data.find(product => 
      product.name?.toLowerCase().includes('artist')
    )

    if (!artistProduct) {
      return c.json({ 
        success: false, 
        error: { message: 'Artist Plan product not found in Stripe' } 
      }, 404)
    }

    // Get all prices for the Artist Plan product
    const prices = await stripe.prices.list({
      product: artistProduct.id,
      active: true
    })

    // Find the recurring monthly price
    const recurringPrice = prices.data.find(price => 
      price.recurring?.interval === 'month'
    )

    if (!recurringPrice) {
      return c.json({ 
        success: false, 
        error: { message: 'No recurring monthly price found for Artist Plan' } 
      }, 404)
    }

    const productData = [{
      id: artistProduct.id,
      name: artistProduct.name,
      description: artistProduct.description,
      prices: [{
        id: recurringPrice.id,
        amount: recurringPrice.unit_amount,
        currency: recurringPrice.currency,
        interval: recurringPrice.recurring?.interval,
        type: recurringPrice.type
      }],
      features: [
        'Unlimited releases',
        'Song and lyric management', 
        'Analytics and insights',
        'Label copy generation',
        'Split sheet management'
      ]
    }]

    return c.json({
      success: true,
      data: productData
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
