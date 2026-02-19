import { describe, expect, it } from 'vitest'
import app from '../worker.js'

interface ErrorDetails {
  issues?: unknown[]
}

interface ErrorResponseBody {
  success: boolean
  error: {
    message: string
    code?: string
    details?: ErrorDetails
  }
}

describe('P4-05 API boundary security enforcement', () => {
  it('rejects protected route requests without bearer auth', async () => {
    const response = await app.request('http://localhost/api/releases')
    const body = (await response.json()) as ErrorResponseBody

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error.message).toBe('Missing or invalid authorization header')
    expect(body.error.code).toBe('AUTH_HEADER_INVALID')
  })

  it('keeps social metrics routes protected by auth middleware', async () => {
    const response = await app.request('http://localhost/api/social/metrics/instagram/test-user')
    const body = (await response.json()) as ErrorResponseBody

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('AUTH_HEADER_INVALID')
  })

  it('returns structured validation errors for malformed social connect payloads', async () => {
    const response = await app.request('http://localhost/api/social/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: 'instagram',
      }),
    })

    const body = (await response.json()) as ErrorResponseBody

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(Array.isArray(body.error.details?.issues)).toBe(true)
  })

  it('returns structured validation errors for malformed body payloads', async () => {
    const response = await app.request('http://localhost/api/subscription/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: '',
        successUrl: 'invalid-url',
      }),
    })

    const body = (await response.json()) as ErrorResponseBody

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error.message).toBe('Request validation failed')
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(Array.isArray(body.error.details?.issues)).toBe(true)
  })

  it('rejects webhook requests missing required signature header', async () => {
    const response = await app.request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ id: 'evt_test' }),
    })
    const body = (await response.json()) as ErrorResponseBody

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(Array.isArray(body.error.details?.issues)).toBe(true)
  })

  it('returns standardized error shape for unknown routes', async () => {
    const response = await app.request('http://localhost/api/not-a-real-endpoint')
    const body = (await response.json()) as ErrorResponseBody

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error.message).toBe('Endpoint not found')
    expect(body.error.code).toBe('ENDPOINT_NOT_FOUND')
  })
})
