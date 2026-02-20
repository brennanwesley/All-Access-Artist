import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Hono } from 'hono'
import type { Bindings, Variables } from '../types/bindings.js'
import { authenticatedUserRateLimitMiddleware } from '../middleware/rateLimit.js'

const ORIGINAL_SUPABASE_URL = process.env.SUPABASE_URL
const ORIGINAL_SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

function buildTestApp() {
  const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

  app.use('*', async (c, next) => {
    const userId = c.req.header('x-user-id')
    if (userId) {
      c.set('user', {
        sub: userId,
        id: userId,
      })
    }

    await next()
  })

  app.use('*', authenticatedUserRateLimitMiddleware)

  app.get('/limited', (c) => {
    return c.json({ success: true })
  })

  return app
}

describe('rate limit user-awareness', () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_KEY
  })

  afterEach(() => {
    if (ORIGINAL_SUPABASE_URL) {
      process.env.SUPABASE_URL = ORIGINAL_SUPABASE_URL
    } else {
      delete process.env.SUPABASE_URL
    }

    if (ORIGINAL_SUPABASE_SERVICE_KEY) {
      process.env.SUPABASE_SERVICE_KEY = ORIGINAL_SUPABASE_SERVICE_KEY
    } else {
      delete process.env.SUPABASE_SERVICE_KEY
    }
  })

  it('enforces limits per authenticated user instead of collapsing all users into one bucket', async () => {
    const app = buildTestApp()
    const userOneHeaders = { 'x-user-id': 'rate-limit-user-one' }
    const userTwoHeaders = { 'x-user-id': 'rate-limit-user-two' }

    for (let index = 0; index < 100; index += 1) {
      const response = await app.request('http://localhost/limited', {
        headers: userOneHeaders,
      })
      expect(response.status).toBe(200)
    }

    const limitedResponse = await app.request('http://localhost/limited', {
      headers: userOneHeaders,
    })
    expect(limitedResponse.status).toBe(429)

    const unaffectedSecondUserResponse = await app.request('http://localhost/limited', {
      headers: userTwoHeaders,
    })
    expect(unaffectedSecondUserResponse.status).toBe(200)
  })
})
