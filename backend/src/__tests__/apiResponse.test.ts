/**
 * API Response Format Tests
 * All Access Artist - Backend Testing
 * 
 * These tests verify that API responses follow the standardized format
 * defined in the ruleset. All API responses should conform to:
 * 
 * Success: { success: true, data: {...} }
 * Error: { success: false, error: { message: string, code?: string } }
 * 
 * This ensures consistent frontend error handling and user feedback.
 * 
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest'

// ============================================
// API RESPONSE HELPERS
// These mirror the response patterns used in routes
// ============================================

/**
 * Creates a standardized success response
 */
function createSuccessResponse<T>(data: T): { success: true; data: T } {
  return {
    success: true,
    data
  }
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(
  message: string,
  code?: string
): { success: false; error: { message: string; code?: string } } {
  return {
    success: false,
    error: {
      message,
      ...(code && { code })
    }
  }
}

/**
 * Validates that a response follows the success format
 */
function isValidSuccessResponse(response: unknown): boolean {
  if (typeof response !== 'object' || response === null) return false
  const r = response as Record<string, unknown>
  return r.success === true && 'data' in r
}

/**
 * Validates that a response follows the error format
 */
function isValidErrorResponse(response: unknown): boolean {
  if (typeof response !== 'object' || response === null) return false
  const r = response as Record<string, unknown>
  if (r.success !== false) return false
  if (typeof r.error !== 'object' || r.error === null) return false
  const error = r.error as Record<string, unknown>
  return typeof error.message === 'string'
}

// ============================================
// TEST SUITES
// ============================================

describe('API Response Format: Success Responses', () => {
  /**
   * Success response should have success: true
   */
  it('should create response with success: true', () => {
    const response = createSuccessResponse({ id: '123' })
    expect(response.success).toBe(true)
  })

  /**
   * Success response should include data property
   */
  it('should include data property', () => {
    const data = { id: '123', name: 'Test Release' }
    const response = createSuccessResponse(data)
    expect(response.data).toEqual(data)
  })

  /**
   * Success response should handle array data
   */
  it('should handle array data', () => {
    const data = [
      { id: '1', title: 'Release 1' },
      { id: '2', title: 'Release 2' }
    ]
    const response = createSuccessResponse(data)
    expect(response.data).toHaveLength(2)
    expect(response.data[0].title).toBe('Release 1')
  })

  /**
   * Success response should handle null data
   */
  it('should handle null data', () => {
    const response = createSuccessResponse(null)
    expect(response.success).toBe(true)
    expect(response.data).toBeNull()
  })

  /**
   * Success response should handle empty object
   */
  it('should handle empty object data', () => {
    const response = createSuccessResponse({})
    expect(response.success).toBe(true)
    expect(response.data).toEqual({})
  })

  /**
   * Validator should correctly identify success responses
   */
  it('should validate correct success response format', () => {
    const validResponse = { success: true, data: { id: '123' } }
    expect(isValidSuccessResponse(validResponse)).toBe(true)
  })

  /**
   * Validator should reject invalid success responses
   */
  it('should reject invalid success response format', () => {
    const invalidResponses = [
      { success: false, data: {} }, // success is false
      { success: true }, // missing data
      { data: {} }, // missing success
      null,
      'string',
      123
    ]

    invalidResponses.forEach((response) => {
      expect(isValidSuccessResponse(response)).toBe(false)
    })
  })
})

describe('API Response Format: Error Responses', () => {
  /**
   * Error response should have success: false
   */
  it('should create response with success: false', () => {
    const response = createErrorResponse('Something went wrong')
    expect(response.success).toBe(false)
  })

  /**
   * Error response should include error.message
   */
  it('should include error message', () => {
    const response = createErrorResponse('Invalid input')
    expect(response.error.message).toBe('Invalid input')
  })

  /**
   * Error response should optionally include error code
   */
  it('should include optional error code', () => {
    const response = createErrorResponse('Subscription required', 'SUBSCRIPTION_REQUIRED')
    expect(response.error.code).toBe('SUBSCRIPTION_REQUIRED')
  })

  /**
   * Error response without code should not have code property
   */
  it('should not include code when not provided', () => {
    const response = createErrorResponse('Generic error')
    expect(response.error.code).toBeUndefined()
  })

  /**
   * Validator should correctly identify error responses
   */
  it('should validate correct error response format', () => {
    const validResponse = { success: false, error: { message: 'Error' } }
    expect(isValidErrorResponse(validResponse)).toBe(true)
  })

  /**
   * Validator should accept error response with code
   */
  it('should validate error response with code', () => {
    const validResponse = {
      success: false,
      error: { message: 'Error', code: 'ERR_CODE' }
    }
    expect(isValidErrorResponse(validResponse)).toBe(true)
  })

  /**
   * Validator should reject invalid error responses
   */
  it('should reject invalid error response format', () => {
    const invalidResponses = [
      { success: true, error: { message: 'Error' } }, // success is true
      { success: false }, // missing error
      { success: false, error: {} }, // missing message
      { success: false, error: 'string' }, // error is not object
      null,
      'string'
    ]

    invalidResponses.forEach((response) => {
      expect(isValidErrorResponse(response)).toBe(false)
    })
  })
})

describe('API Response Format: Common Error Scenarios', () => {
  /**
   * Authentication error format
   */
  it('should format authentication errors correctly', () => {
    const response = createErrorResponse('Authentication required', 'AUTH_REQUIRED')
    expect(response.success).toBe(false)
    expect(response.error.message).toBe('Authentication required')
    expect(response.error.code).toBe('AUTH_REQUIRED')
  })

  /**
   * Subscription error format (from Phase 1 implementation)
   */
  it('should format subscription errors correctly', () => {
    const response = createErrorResponse(
      'Active subscription required for this action',
      'SUBSCRIPTION_REQUIRED'
    )
    expect(response.success).toBe(false)
    expect(response.error.message).toContain('subscription')
    expect(response.error.code).toBe('SUBSCRIPTION_REQUIRED')
  })

  /**
   * Validation error format
   */
  it('should format validation errors correctly', () => {
    const response = createErrorResponse('Invalid release date format')
    expect(response.success).toBe(false)
    expect(response.error.message).toContain('Invalid')
  })

  /**
   * Not found error format
   */
  it('should format not found errors correctly', () => {
    const response = createErrorResponse('Release not found', 'NOT_FOUND')
    expect(response.success).toBe(false)
    expect(response.error.code).toBe('NOT_FOUND')
  })

  /**
   * Server error format
   */
  it('should format server errors correctly', () => {
    const response = createErrorResponse('Internal server error')
    expect(response.success).toBe(false)
    expect(response.error.message).toBe('Internal server error')
  })
})

describe('API Response Format: Data Types', () => {
  /**
   * Release data structure
   */
  it('should handle release data structure', () => {
    const releaseData = {
      id: 'e85e1294-632b-42c1-85ba-8c6648fc0467',
      title: 'My Album',
      release_type: 'album',
      release_date: '2026-03-15',
      status: 'draft',
      created_at: '2026-01-05T00:00:00Z'
    }

    const response = createSuccessResponse(releaseData)
    expect(response.success).toBe(true)
    expect(response.data.id).toBe('e85e1294-632b-42c1-85ba-8c6648fc0467')
    expect(response.data.release_type).toBe('album')
  })

  /**
   * User profile data structure
   */
  it('should handle user profile data structure', () => {
    const profileData = {
      id: 'e85e1294-632b-42c1-85ba-8c6648fc0467',
      display_name: 'Test User',
      account_type: 'artist',
      subscription_status: 'active'
    }

    const response = createSuccessResponse(profileData)
    expect(response.success).toBe(true)
    expect(response.data.account_type).toBe('artist')
  })

  /**
   * List response with pagination info
   */
  it('should handle paginated list response', () => {
    const listData = {
      items: [{ id: '1' }, { id: '2' }],
      total: 50,
      page: 1,
      limit: 10
    }

    const response = createSuccessResponse(listData)
    expect(response.success).toBe(true)
    expect(response.data.items).toHaveLength(2)
    expect(response.data.total).toBe(50)
  })
})
