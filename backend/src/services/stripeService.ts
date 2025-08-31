/**
 * Stripe Service - All Access Artist
 * Handles Stripe integration for subscription billing
 */

import Stripe from 'stripe'
import { SupabaseClient } from '@supabase/supabase-js'

export class StripeService {
  private stripe: Stripe
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil'
    })
    this.supabase = supabase
  }

  /**
   * Create Stripe products and prices for subscription plans
   */
  async createProducts(): Promise<{ artistPlanPriceId: string }> {
    try {
      // Create Artist Plan Product
      const artistProduct = await this.stripe.products.create({
        name: 'Artist Plan',
        description: 'Full access to All Access Artist platform for individual artists',
        metadata: {
          plan_type: 'artist',
          features: 'releases,songs,lyrics,analytics'
        }
      })

      // Create Artist Plan Price ($9.99/month)
      const artistPrice = await this.stripe.prices.create({
        product: artistProduct.id,
        unit_amount: 999, // $9.99 in cents
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          plan_name: 'Artist Plan'
        }
      })

      console.log('✅ Stripe products created successfully')
      console.log(`Artist Plan Product ID: ${artistProduct.id}`)
      console.log(`Artist Plan Price ID: ${artistPrice.id}`)

      return {
        artistPlanPriceId: artistPrice.id
      }
    } catch (error) {
      console.error('❌ Error creating Stripe products:', error)
      throw error
    }
  }

  /**
   * Create or retrieve Stripe customer for user
   */
  async createCustomer(userId: string, email: string): Promise<string> {
    try {
      // Check if customer already exists in our database
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      if (profile?.stripe_customer_id) {
        return profile.stripe_customer_id
      }

      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email,
        metadata: {
          user_id: userId
        }
      })

      // Update user profile with Stripe customer ID
      await this.supabase
        .from('user_profiles')
        .update({
          stripe_customer_id: customer.id,
          stripe_created_at: new Date().toISOString()
        })
        .eq('id', userId)

      console.log(`✅ Created Stripe customer: ${customer.id} for user: ${userId}`)
      return customer.id
    } catch (error) {
      console.error('❌ Error creating Stripe customer:', error)
      throw error
    }
  }

  /**
   * Create Stripe Checkout session for subscription
   */
  async createCheckoutSession(
    customerId: string, 
    priceId: string, 
    successUrl: string, 
    cancelUrl: string
  ): Promise<string> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          customer_id: customerId
        }
      })

      console.log(`✅ Created checkout session: ${session.id}`)
      return session.url!
    } catch (error) {
      console.error('❌ Error creating checkout session:', error)
      throw error
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(subscriptionId)
      console.log(`✅ Canceled subscription: ${subscriptionId}`)
    } catch (error) {
      console.error('❌ Error canceling subscription:', error)
      throw error
    }
  }

  /**
   * Get subscription details from Stripe
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId)
    } catch (error) {
      console.error('❌ Error retrieving subscription:', error)
      throw error
    }
  }

  /**
   * Process Stripe webhook events
   */
  async processWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
          break

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
          break

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
          break

        default:
          console.log(`Unhandled webhook event type: ${event.type}`)
      }
    } catch (error) {
      console.error('❌ Error processing webhook:', error)
      throw error
    }
  }

  /**
   * Handle subscription created/updated webhook
   */
  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    
    // Find user by Stripe customer ID
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      console.error(`❌ User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update user profile with subscription data
    await this.supabase
      .from('user_profiles')
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_plan_id: subscription.items.data[0]?.price.id,
        current_period_start: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000).toISOString() : null,
        current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        stripe_updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    console.log(`✅ Updated subscription for user: ${profile.id}`)
  }

  /**
   * Handle subscription canceled webhook
   */
  private async handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      console.error(`❌ User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update user profile to reflect canceled subscription
    await this.supabase
      .from('user_profiles')
      .update({
        subscription_status: 'canceled',
        cancel_at_period_end: true,
        stripe_updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    console.log(`✅ Marked subscription as canceled for user: ${profile.id}`)
  }

  /**
   * Handle successful payment webhook
   */
  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string
    
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      console.error(`❌ User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update last payment info
    await this.supabase
      .from('user_profiles')
      .update({
        last_payment_date: new Date().toISOString(),
        last_payment_amount_cents: invoice.amount_paid,
        last_payment_status: 'succeeded',
        stripe_updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    console.log(`✅ Recorded successful payment for user: ${profile.id}`)
  }

  /**
   * Handle failed payment webhook
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string
    
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      console.error(`❌ User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update last payment info
    await this.supabase
      .from('user_profiles')
      .update({
        last_payment_status: 'failed',
        stripe_updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    console.log(`❌ Recorded failed payment for user: ${profile.id}`)
  }
}
