/**
 * Webhook Routes - All Access Artist
 * Handle Stripe webhook events for subscription management
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { StripeService } from '../services/stripeService.js'
import { Variables } from '../types/bindings.js'
import Stripe from 'stripe'
import { errorResponse } from '../utils/apiResponse.js'
import { validateRequest } from '../middleware/validation.js'

const webhooks = new Hono<{ Variables: Variables }>()

const StripeWebhookHeaderSchema = z.object({
  'stripe-signature': z.string().min(1, 'Missing signature'),
})

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
webhooks.post('/stripe', validateRequest('header', StripeWebhookHeaderSchema), async (c) => {
  try {
    const { ['stripe-signature']: signature } = c.req.valid('header')
    const body = await c.req.text()

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return errorResponse(c, 500, 'Webhook secret not configured', 'WEBHOOK_SECRET_NOT_CONFIGURED')
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return errorResponse(c, 500, 'Stripe secret key not configured', 'WEBHOOK_STRIPE_KEY_NOT_CONFIGURED')
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return errorResponse(c, 500, 'Database configuration error', 'WEBHOOK_DATABASE_CONFIG_ERROR')
    }

    // Initialize Stripe for webhook verification
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil'
    })

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (_err) {
      return errorResponse(c, 400, 'Invalid signature', 'WEBHOOK_SIGNATURE_INVALID')
    }

    // Process the webhook event
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    const stripeService = new StripeService(supabaseAdmin)
    await stripeService.processWebhook(event)

    return c.json({ success: true, received: true })

  } catch (_error) {
    return errorResponse(c, 500, 'Webhook processing failed', 'WEBHOOK_PROCESSING_FAILED')
  }
})

/**
 * GET /api/webhooks/stripe
 * Health check for webhook endpoint
 */
webhooks.get('/stripe', async (c) => {
  return c.json({
    success: true,
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
})

export default webhooks
