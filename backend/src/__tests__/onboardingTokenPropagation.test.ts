import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { StripeService } from '../services/stripeService.js'

class MockUserProfilesTable {
  public insertedRows: Record<string, unknown>[] = []

  insert(values: Record<string, unknown>) {
    this.insertedRows.push(values)
    return Promise.resolve({ data: null, error: null })
  }
}

class MockSupabaseClient {
  public readonly userProfilesTable = new MockUserProfilesTable()
  public readonly createUserMock = vi.fn(async () => ({
    data: {
      user: {
        id: 'new-user-id',
      },
    },
    error: null,
  }))

  public readonly auth = {
    admin: {
      createUser: this.createUserMock,
    },
  }

  from(tableName: string) {
    if (tableName === 'user_profiles') {
      return this.userProfilesTable
    }

    throw new Error(`Unexpected table: ${tableName}`)
  }
}

describe('onboarding token propagation', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
  })

  it('persists checkout onboarding token from Stripe metadata into auth and profile records', async () => {
    const onboardingToken = 'secure-onboarding-token-123'
    const mockSupabase = new MockSupabaseClient()
    const stripeService = new StripeService(mockSupabase as unknown as SupabaseClient)

    await stripeService.handleCheckoutCompleted({
      id: 'cs_test_checkout',
      customer: 'cus_test_123',
      customer_details: {
        email: 'artist@example.com',
      },
      metadata: {
        onboarding_token: onboardingToken,
      },
    } as unknown as Stripe.Checkout.Session)

    expect(mockSupabase.createUserMock).toHaveBeenCalledTimes(1)
    expect(mockSupabase.createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_metadata: expect.objectContaining({
          onboarding_token: onboardingToken,
        }),
      })
    )

    expect(mockSupabase.userProfilesTable.insertedRows).toHaveLength(1)
    expect(mockSupabase.userProfilesTable.insertedRows[0]?.['onboarding_token']).toBe(onboardingToken)
  })
})
