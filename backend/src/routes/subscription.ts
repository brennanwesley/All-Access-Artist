/**
 * Subscription Routes - All Access Artist
 * API endpoints for Stripe subscription management
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { Variables } from '../types/bindings.js'
import { StripeService } from '../services/stripeService.js'
import { supabaseAuth } from '../middleware/auth.js'
import { getSubscriptionStatus } from '../middleware/subscriptionAuth.js'
import { validateRequest } from '../middleware/validation.js'
import { authErrorResponse, errorResponse } from '../utils/apiResponse.js'

const subscription = new Hono<{ Variables: Variables }>()

// Apply auth middleware to protected subscription routes only
// Products and checkout endpoints should be public for plan selection page
subscription.use('/status', supabaseAuth)
subscription.use('/cancel', supabaseAuth)
subscription.use('/setup', supabaseAuth)

// Validation schemas
const CheckoutSessionCamelCaseSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: z.string().url('Valid success URL required'),
  cancelUrl: z.string().url('Valid cancel URL required')
})

const CheckoutSessionSnakeCaseSchema = z.object({
  price_id: z.string().min(1, 'Price ID is required'),
  success_url: z.string().url('Valid success URL required'),
  cancel_url: z.string().url('Valid cancel URL required')
})

const CheckoutSessionSchema = z.union([
  CheckoutSessionCamelCaseSchema,
  CheckoutSessionSnakeCaseSchema,
])

type CheckoutSessionPayload = z.infer<typeof CheckoutSessionSchema>

function normalizeCheckoutSessionPayload(payload: CheckoutSessionPayload) {
  if ('priceId' in payload) {
    return payload
  }

  return {
    priceId: payload.price_id,
    successUrl: payload.success_url,
    cancelUrl: payload.cancel_url,
  }
}

/**
 * GET /api/subscription/status
 * Get user's current subscription status
 */
subscription.get('/status', async (c) => {
  try {
    const user = c.get('user')
    const jwtPayload = c.get('jwtPayload')
    
    if (!user || !jwtPayload) {
      return authErrorResponse(c)
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
      return errorResponse(c, 500, 'Failed to fetch subscription details', 'SUBSCRIPTION_DETAILS_FETCH_FAILED')
    }

    // Get account_type for admin check
    const { data: userProfile } = await c.get('supabase')
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    return c.json({
      success: true,
      data: {
        ...status,
        profile: profile || {},
        user: {
          id: user.id,
          email: jwtPayload.email,
          isAdmin: userProfile?.account_type === 'admin'
        }
      }
    })

  } catch (_error) {
    return errorResponse(c, 500, 'Failed to get subscription status', 'SUBSCRIPTION_STATUS_FETCH_FAILED')
  }
})

/**
 * POST /api/subscription/checkout
 * Create Stripe Checkout session for subscription
 */
subscription.post('/checkout', validateRequest('json', CheckoutSessionSchema), async (c) => {
  try {
    const { priceId, successUrl, cancelUrl } = normalizeCheckoutSessionPayload(c.req.valid('json'))
    
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
        checkoutUrl,
        url: checkoutUrl,
      }
    })

  } catch (_error) {
    return errorResponse(c, 500, 'Failed to create checkout session', 'SUBSCRIPTION_CHECKOUT_CREATE_FAILED')
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
      return authErrorResponse(c)
    }

    // Get user's subscription ID
    const { data: profile, error } = await c.get('supabase')
      .from('user_profiles')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (error || !profile?.stripe_subscription_id) {
      return errorResponse(c, 404, 'No active subscription found', 'SUBSCRIPTION_NOT_FOUND')
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

  } catch (_error) {
    return errorResponse(c, 500, 'Failed to cancel subscription', 'SUBSCRIPTION_CANCEL_FAILED')
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
      return errorResponse(c, 404, 'Artist Plan product not found in Stripe', 'SUBSCRIPTION_PRODUCT_NOT_FOUND')
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
      return errorResponse(c, 404, 'No recurring monthly price found for Artist Plan', 'SUBSCRIPTION_PRICE_NOT_FOUND')
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

  } catch (_error) {
    return errorResponse(c, 500, 'Failed to get subscription products', 'SUBSCRIPTION_PRODUCTS_FETCH_FAILED')
  }
})

/**
 * POST /api/subscription/setup
 * One-time setup to create Stripe products (admin only)
 */
subscription.post('/setup', async (c) => {
  try {
    const user = c.get('user')
    
    // Check admin status from database
    const { data: profile } = await c.get('supabase')
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()
    
    // Only admin can run setup
    if (profile?.account_type !== 'admin') {
      return errorResponse(c, 403, 'Admin access required', 'SUBSCRIPTION_SETUP_ADMIN_REQUIRED')
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

  } catch (_error) {
    return errorResponse(c, 500, 'Failed to setup Stripe products', 'SUBSCRIPTION_SETUP_FAILED')
  }
})

export default subscription
