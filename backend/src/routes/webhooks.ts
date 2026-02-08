/**
 * Webhook Routes - All Access Artist
 * Handle Stripe webhook events for subscription management
 */

import { Hono } from 'hono'
import { StripeService } from '../services/stripeService.js'
import { Variables } from '../types/bindings.js'
import Stripe from 'stripe'

const webhooks = new Hono<{ Variables: Variables }>()

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
webhooks.post('/stripe', async (c) => {
  try {
    const body = await c.req.text()
    const signature = c.req.header('stripe-signature')

    if (!signature) {
      return c.json({ success: false, error: { message: 'Missing signature' } }, 400)
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return c.json({ success: false, error: { message: 'Webhook secret not configured' } }, 500)
    }

    // Initialize Stripe for webhook verification
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
      return c.json({ success: false, error: { message: 'Invalid signature' } }, 400)
    }

    // Process the webhook event
    const stripeService = new StripeService(c.get('supabase'))
    await stripeService.processWebhook(event)

    return c.json({ success: true, received: true })

  } catch (error) {
    return c.json({ success: false, error: { message: 'Webhook processing failed' } }, 500)
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
