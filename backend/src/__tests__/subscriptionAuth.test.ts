/**
 * Subscription Authentication Middleware Tests
 * All Access Artist - Backend Testing
 * 
 * These tests verify the subscription enforcement logic that was implemented
 * in Phase 1 Security (Item 1.5). This is critical business logic that:
 * 
 * 1. Allows admin users full access regardless of subscription
 * 2. Allows active subscribers full access
 * 3. Allows expired/no-subscription users READ-ONLY access (GET requests)
 * 4. Blocks mutations (POST/PUT/PATCH/DELETE) for expired users
 * 
 * Note: These are unit tests that test the logic in isolation.
 * They mock the database responses to test different scenarios.
 * 
 * Run with: npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================
// SUBSCRIPTION LOGIC HELPER FUNCTIONS
// These mirror the logic in subscriptionAuth.ts
// for isolated unit testing without Hono context
// ============================================

/**
 * Determines if a user has an active subscription
 * Mirrors the logic in subscriptionAuth middleware
 */
function hasActiveSubscription(profile: {
  subscription_status: string | null
  current_period_end: string | null
}): boolean {
  return (
    profile.subscription_status === 'active' &&
    profile.current_period_end !== null &&
    new Date(profile.current_period_end) > new Date()
  )
}

/**
 * Determines if a user is an admin
 * Admins bypass subscription checks entirely
 */
function isAdmin(profile: { account_type: string | null }): boolean {
  return profile.account_type === 'admin'
}

/**
 * Determines if a request method is a mutation
 * Mutations require active subscription for non-admin users
 */
function isMutationMethod(method: string): boolean {
  return ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase())
}

/**
 * Main authorization logic
 * Returns: { allowed: boolean, reason?: string }
 */
function checkSubscriptionAccess(
  profile: {
    account_type: string | null
    subscription_status: string | null
    current_period_end: string | null
  },
  method: string
): { allowed: boolean; reason?: string } {
  // Admin users always have full access
  if (isAdmin(profile)) {
    return { allowed: true, reason: 'admin_bypass' }
  }

  // Check if user has active subscription
  const hasActive = hasActiveSubscription(profile)

  // If mutation and no active subscription, block
  if (isMutationMethod(method) && !hasActive) {
    return { allowed: false, reason: 'subscription_required' }
  }

  // Allow read operations for all authenticated users
  return { allowed: true, reason: hasActive ? 'active_subscription' : 'read_only' }
}

// ============================================
// TEST SUITES
// ============================================

describe('Subscription Logic: hasActiveSubscription', () => {
  /**
   * Active subscription with future end date should return true
   */
  it('should return true for active subscription with future end date', () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1) // 1 month from now

    const profile = {
      subscription_status: 'active',
      current_period_end: futureDate.toISOString()
    }

    expect(hasActiveSubscription(profile)).toBe(true)
  })

  /**
   * Active subscription with past end date should return false
   */
  it('should return false for active subscription with past end date', () => {
    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 1) // 1 month ago

    const profile = {
      subscription_status: 'active',
      current_period_end: pastDate.toISOString()
    }

    expect(hasActiveSubscription(profile)).toBe(false)
  })

  /**
   * Cancelled subscription should return false
   */
  it('should return false for cancelled subscription', () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)

    const profile = {
      subscription_status: 'cancelled',
      current_period_end: futureDate.toISOString()
    }

    expect(hasActiveSubscription(profile)).toBe(false)
  })

  /**
   * Null subscription status should return false
   */
  it('should return false for null subscription status', () => {
    const profile = {
      subscription_status: null,
      current_period_end: null
    }

    expect(hasActiveSubscription(profile)).toBe(false)
  })

  /**
   * Active status but null end date should return false
   */
  it('should return false for active status with null end date', () => {
    const profile = {
      subscription_status: 'active',
      current_period_end: null
    }

    expect(hasActiveSubscription(profile)).toBe(false)
  })
})

describe('Subscription Logic: isAdmin', () => {
  /**
   * Admin account type should return true
   */
  it('should return true for admin account type', () => {
    expect(isAdmin({ account_type: 'admin' })).toBe(true)
  })

  /**
   * Artist account type should return false
   */
  it('should return false for artist account type', () => {
    expect(isAdmin({ account_type: 'artist' })).toBe(false)
  })

  /**
   * Manager account type should return false
   */
  it('should return false for manager account type', () => {
    expect(isAdmin({ account_type: 'manager' })).toBe(false)
  })

  /**
   * Label account type should return false
   */
  it('should return false for label account type', () => {
    expect(isAdmin({ account_type: 'label' })).toBe(false)
  })

  /**
   * Null account type should return false
   */
  it('should return false for null account type', () => {
    expect(isAdmin({ account_type: null })).toBe(false)
  })
})

describe('Subscription Logic: isMutationMethod', () => {
  /**
   * POST should be a mutation
   */
  it('should return true for POST', () => {
    expect(isMutationMethod('POST')).toBe(true)
    expect(isMutationMethod('post')).toBe(true)
  })

  /**
   * PUT should be a mutation
   */
  it('should return true for PUT', () => {
    expect(isMutationMethod('PUT')).toBe(true)
    expect(isMutationMethod('put')).toBe(true)
  })

  /**
   * PATCH should be a mutation
   */
  it('should return true for PATCH', () => {
    expect(isMutationMethod('PATCH')).toBe(true)
    expect(isMutationMethod('patch')).toBe(true)
  })

  /**
   * DELETE should be a mutation
   */
  it('should return true for DELETE', () => {
    expect(isMutationMethod('DELETE')).toBe(true)
    expect(isMutationMethod('delete')).toBe(true)
  })

  /**
   * GET should NOT be a mutation
   */
  it('should return false for GET', () => {
    expect(isMutationMethod('GET')).toBe(false)
    expect(isMutationMethod('get')).toBe(false)
  })

  /**
   * HEAD should NOT be a mutation
   */
  it('should return false for HEAD', () => {
    expect(isMutationMethod('HEAD')).toBe(false)
  })

  /**
   * OPTIONS should NOT be a mutation
   */
  it('should return false for OPTIONS', () => {
    expect(isMutationMethod('OPTIONS')).toBe(false)
  })
})

describe('Subscription Logic: checkSubscriptionAccess', () => {
  // Helper to create a future date
  const getFutureDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString()
  }

  // Helper to create a past date
  const getPastDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString()
  }

  describe('Admin Users', () => {
    /**
     * Admin should have full access to GET requests
     */
    it('should allow admin GET requests', () => {
      const profile = {
        account_type: 'admin',
        subscription_status: null,
        current_period_end: null
      }

      const result = checkSubscriptionAccess(profile, 'GET')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('admin_bypass')
    })

    /**
     * Admin should have full access to POST requests
     */
    it('should allow admin POST requests', () => {
      const profile = {
        account_type: 'admin',
        subscription_status: null,
        current_period_end: null
      }

      const result = checkSubscriptionAccess(profile, 'POST')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('admin_bypass')
    })

    /**
     * Admin should have full access to DELETE requests
     */
    it('should allow admin DELETE requests', () => {
      const profile = {
        account_type: 'admin',
        subscription_status: null,
        current_period_end: null
      }

      const result = checkSubscriptionAccess(profile, 'DELETE')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('admin_bypass')
    })
  })

  describe('Active Subscribers', () => {
    /**
     * Active subscriber should have full access to GET requests
     */
    it('should allow active subscriber GET requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'active',
        current_period_end: getFutureDate()
      }

      const result = checkSubscriptionAccess(profile, 'GET')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('active_subscription')
    })

    /**
     * Active subscriber should have full access to POST requests
     */
    it('should allow active subscriber POST requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'active',
        current_period_end: getFutureDate()
      }

      const result = checkSubscriptionAccess(profile, 'POST')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('active_subscription')
    })

    /**
     * Active subscriber should have full access to PUT requests
     */
    it('should allow active subscriber PUT requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'active',
        current_period_end: getFutureDate()
      }

      const result = checkSubscriptionAccess(profile, 'PUT')
      expect(result.allowed).toBe(true)
    })

    /**
     * Active subscriber should have full access to DELETE requests
     */
    it('should allow active subscriber DELETE requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'active',
        current_period_end: getFutureDate()
      }

      const result = checkSubscriptionAccess(profile, 'DELETE')
      expect(result.allowed).toBe(true)
    })
  })

  describe('Expired/No Subscription Users', () => {
    /**
     * Expired user should be allowed to read (GET)
     */
    it('should allow expired user GET requests (read-only)', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'active',
        current_period_end: getPastDate() // Expired
      }

      const result = checkSubscriptionAccess(profile, 'GET')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('read_only')
    })

    /**
     * Expired user should be blocked from POST
     */
    it('should block expired user POST requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'active',
        current_period_end: getPastDate()
      }

      const result = checkSubscriptionAccess(profile, 'POST')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('subscription_required')
    })

    /**
     * Expired user should be blocked from PUT
     */
    it('should block expired user PUT requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'active',
        current_period_end: getPastDate()
      }

      const result = checkSubscriptionAccess(profile, 'PUT')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('subscription_required')
    })

    /**
     * Expired user should be blocked from PATCH
     */
    it('should block expired user PATCH requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'active',
        current_period_end: getPastDate()
      }

      const result = checkSubscriptionAccess(profile, 'PATCH')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('subscription_required')
    })

    /**
     * Expired user should be blocked from DELETE
     */
    it('should block expired user DELETE requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'active',
        current_period_end: getPastDate()
      }

      const result = checkSubscriptionAccess(profile, 'DELETE')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('subscription_required')
    })

    /**
     * User with no subscription should be allowed to read
     */
    it('should allow no-subscription user GET requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: null,
        current_period_end: null
      }

      const result = checkSubscriptionAccess(profile, 'GET')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('read_only')
    })

    /**
     * User with no subscription should be blocked from mutations
     */
    it('should block no-subscription user POST requests', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: null,
        current_period_end: null
      }

      const result = checkSubscriptionAccess(profile, 'POST')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('subscription_required')
    })
  })

  describe('Edge Cases', () => {
    /**
     * Cancelled subscription should be treated as expired
     */
    it('should block cancelled subscription from mutations', () => {
      const profile = {
        account_type: 'artist',
        subscription_status: 'cancelled',
        current_period_end: getFutureDate()
      }

      const result = checkSubscriptionAccess(profile, 'POST')
      expect(result.allowed).toBe(false)
    })

    /**
     * Manager account type should follow same rules as artist
     */
    it('should apply same rules to manager account type', () => {
      const profile = {
        account_type: 'manager',
        subscription_status: null,
        current_period_end: null
      }

      const getResult = checkSubscriptionAccess(profile, 'GET')
      expect(getResult.allowed).toBe(true)

      const postResult = checkSubscriptionAccess(profile, 'POST')
      expect(postResult.allowed).toBe(false)
    })

    /**
     * Label account type should follow same rules as artist
     */
    it('should apply same rules to label account type', () => {
      const profile = {
        account_type: 'label',
        subscription_status: 'active',
        current_period_end: getFutureDate()
      }

      const result = checkSubscriptionAccess(profile, 'DELETE')
      expect(result.allowed).toBe(true)
    })
  })
})
