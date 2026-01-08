/**
 * Rate Limiting Middleware - Supabase Persistent Implementation
 * All Access Artist - Backend API v2.0.0
 * 
 * Uses Supabase for persistent rate limiting that:
 * - Survives deployments
 * - Works across multiple instances
 * - Falls back to in-memory if DB unavailable
 */
import { createMiddleware } from 'hono/factory'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Bindings, Variables } from '../types/bindings.js'
import { logger } from '../utils/logger.js'

const rateLimitLogger = logger.child('rateLimit')

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
}

// In-memory fallback store (used when DB is unavailable)
const fallbackStore = new Map<string, RateLimitEntry>()

// Configuration
const RATE_LIMIT_CONFIG = {
  // Per-user limits
  userWindow: 60 * 1000, // 1 minute in milliseconds
  userMaxRequests: 100,   // 100 requests per minute per user
  
  // Global limits
  globalWindow: 60 * 1000, // 1 minute in milliseconds
  globalMaxRequests: 1000, // 1000 requests per minute total
  
  // Fallback cleanup interval
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
}

// Cleanup fallback store periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of fallbackStore.entries()) {
    if (now > entry.resetTime) {
      fallbackStore.delete(key)
    }
  }
}, RATE_LIMIT_CONFIG.cleanupInterval)

// Create admin Supabase client for rate limiting (bypasses RLS)
function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  
  if (!url || !serviceKey) {
    return null
  }
  
  return createClient(url, serviceKey)
}

// Check rate limit using Supabase RPC
async function checkRateLimitDB(
  supabase: SupabaseClient,
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  try {
    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_ms: windowMs
    })
    
    if (error) {
      rateLimitLogger.error('Rate limit RPC error', { key, error: error.message })
      return null
    }
    
    if (data && data.length > 0) {
      const result = data[0]
      return {
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: new Date(result.reset_time)
      }
    }
    
    return null
  } catch (err) {
    rateLimitLogger.error('Rate limit check failed', { key, error: err instanceof Error ? err.message : 'Unknown' })
    return null
  }
}

// Fallback in-memory rate limit check
function checkRateLimitFallback(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const entry = fallbackStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    }
    fallbackStore.set(key, newEntry)
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: new Date(newEntry.resetTime)
    }
  }
  
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(entry.resetTime)
    }
  }
  
  entry.count++
  fallbackStore.set(key, entry)
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: new Date(entry.resetTime)
  }
}

// Combined rate limit check with DB primary, fallback secondary
async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const supabase = getSupabaseAdmin()
  
  if (supabase) {
    const dbResult = await checkRateLimitDB(supabase, key, maxRequests, windowMs)
    if (dbResult) {
      return dbResult
    }
  }
  
  // Fallback to in-memory
  rateLimitLogger.debug('Using in-memory rate limit fallback', { key })
  return checkRateLimitFallback(key, maxRequests, windowMs)
}

// Rate limiting middleware
export const rateLimitMiddleware = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  if (c.req.method === 'OPTIONS') {
    await next()
    return
  }
  
  const now = Date.now()
  const clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
  
  // Check global rate limit first
  const globalKey = 'global'
  const globalCheck = await checkRateLimit(
    globalKey,
    RATE_LIMIT_CONFIG.globalMaxRequests,
    RATE_LIMIT_CONFIG.globalWindow
  )
  
  if (!globalCheck.allowed) {
    const resetTimeMs = globalCheck.resetTime.getTime()
    const retryAfter = Math.ceil((resetTimeMs - now) / 1000)
    
    c.header('X-RateLimit-Limit', RATE_LIMIT_CONFIG.globalMaxRequests.toString())
    c.header('X-RateLimit-Remaining', '0')
    c.header('X-RateLimit-Reset', resetTimeMs.toString())
    c.header('Retry-After', retryAfter.toString())
    
    return c.json({
      error: 'Global rate limit exceeded. Please try again later.',
      retryAfter
    }, 429)
  }
  
  // Check per-user rate limit (if user is authenticated)
  const user = c.get('user')
  let userKey: string
  
  if (user?.id) {
    // Use user ID for authenticated requests
    userKey = `user:${user.id}`
  } else {
    // Use IP address for unauthenticated requests
    userKey = `ip:${clientIP}`
  }
  
  const userCheck = await checkRateLimit(
    userKey,
    RATE_LIMIT_CONFIG.userMaxRequests,
    RATE_LIMIT_CONFIG.userWindow
  )
  
  if (!userCheck.allowed) {
    const resetTimeMs = userCheck.resetTime.getTime()
    const retryAfter = Math.ceil((resetTimeMs - now) / 1000)
    
    c.header('X-RateLimit-Limit', RATE_LIMIT_CONFIG.userMaxRequests.toString())
    c.header('X-RateLimit-Remaining', '0')
    c.header('X-RateLimit-Reset', resetTimeMs.toString())
    c.header('Retry-After', retryAfter.toString())
    
    return c.json({
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter
    }, 429)
  }
  
  // Add rate limit headers to successful responses
  c.header('X-RateLimit-Limit', RATE_LIMIT_CONFIG.userMaxRequests.toString())
  c.header('X-RateLimit-Remaining', userCheck.remaining.toString())
  c.header('X-RateLimit-Reset', userCheck.resetTime.getTime().toString())
  
  await next()
})

// Export configuration for testing/monitoring
export const getRateLimitStats = () => ({
  fallbackEntries: fallbackStore.size,
  config: RATE_LIMIT_CONFIG
})
