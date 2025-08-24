/**
 * Rate Limiting Middleware - In-Memory Implementation
 * All Access Artist - Backend API v2.0.0
 */
import { createMiddleware } from 'hono/factory'
import type { Bindings, Variables } from '../types/bindings.js'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()
const globalRateLimitStore = new Map<string, RateLimitEntry>()

// Configuration
const RATE_LIMIT_CONFIG = {
  // Per-user limits
  userWindow: 60 * 1000, // 1 minute in milliseconds
  userMaxRequests: 100,   // 100 requests per minute per user
  
  // Global limits
  globalWindow: 60 * 1000, // 1 minute in milliseconds
  globalMaxRequests: 1000, // 1000 requests per minute total
  
  // Cleanup interval
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now()
  
  // Clean user rate limit store
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
  
  // Clean global rate limit store
  for (const [key, entry] of globalRateLimitStore.entries()) {
    if (now > entry.resetTime) {
      globalRateLimitStore.delete(key)
    }
  }
}, RATE_LIMIT_CONFIG.cleanupInterval)

// Helper function to check and update rate limit
function checkRateLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = store.get(key)
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    }
    store.set(key, newEntry)
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime
    }
  }
  
  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }
  
  // Increment count
  entry.count++
  store.set(key, entry)
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  }
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
  const globalCheck = checkRateLimit(
    globalRateLimitStore,
    globalKey,
    RATE_LIMIT_CONFIG.globalMaxRequests,
    RATE_LIMIT_CONFIG.globalWindow
  )
  
  if (!globalCheck.allowed) {
    const retryAfter = Math.ceil((globalCheck.resetTime - now) / 1000)
    
    c.header('X-RateLimit-Limit', RATE_LIMIT_CONFIG.globalMaxRequests.toString())
    c.header('X-RateLimit-Remaining', '0')
    c.header('X-RateLimit-Reset', globalCheck.resetTime.toString())
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
  
  const userCheck = checkRateLimit(
    rateLimitStore,
    userKey,
    RATE_LIMIT_CONFIG.userMaxRequests,
    RATE_LIMIT_CONFIG.userWindow
  )
  
  if (!userCheck.allowed) {
    const retryAfter = Math.ceil((userCheck.resetTime - now) / 1000)
    
    c.header('X-RateLimit-Limit', RATE_LIMIT_CONFIG.userMaxRequests.toString())
    c.header('X-RateLimit-Remaining', '0')
    c.header('X-RateLimit-Reset', userCheck.resetTime.toString())
    c.header('Retry-After', retryAfter.toString())
    
    return c.json({
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter
    }, 429)
  }
  
  // Add rate limit headers to successful responses
  c.header('X-RateLimit-Limit', RATE_LIMIT_CONFIG.userMaxRequests.toString())
  c.header('X-RateLimit-Remaining', userCheck.remaining.toString())
  c.header('X-RateLimit-Reset', userCheck.resetTime.toString())
  
  await next()
})

// Export configuration for testing/monitoring
export const getRateLimitStats = () => ({
  userEntries: rateLimitStore.size,
  globalEntries: globalRateLimitStore.size,
  config: RATE_LIMIT_CONFIG
})
