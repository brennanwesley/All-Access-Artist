/**
 * All Access Artist - Backend API v2.0.0 (Node.js)
 * Hono Framework with JWT Authentication, Service Layer Architecture
 * Proprietary - Music Industry Management Platform
 */

import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors.js'
import { rateLimitMiddleware } from './middleware/rateLimit.js'
import { supabaseAuth } from './middleware/auth.js'
import { subscriptionAuth } from './middleware/subscriptionAuth.js'
import artists from './routes/artists.js'
import releases from './routes/releases.js'
import calendar from './routes/calendar.js'
import analytics from './routes/analytics.js'
import lyrics from './routes/lyrics.js'
import tasks from './routes/tasks.js'
import songs from './routes/songs.js'
import labelcopy from './routes/labelcopy.js'
import profile from './routes/profile.js'
import splitsheets from './routes/splitsheets.js'
import assets from './routes/assets.js'
import content from './routes/content.js'
import jobs from './routes/jobs.js'
import admin from './routes/admin.js'
import subscription from './routes/subscription.js'
import webhooks from './routes/webhooks.js'
import onboarding from './routes/onboarding.js'
import type { Bindings, Variables } from './types/bindings.js'
import { generateRequestId } from './utils/errorHandler.js'
import { logger, extractErrorInfo } from './utils/logger.js'

// NEW: social webhook route
import social from './routes/social.js'

// Initialize Hono app with proper typing
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Apply CORS middleware globally
app.use('*', corsMiddleware)

// Apply rate limiting middleware to all API routes
app.use('/api/*', rateLimitMiddleware)

// Health check endpoint (no authentication required)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    deployment_trigger: 'rate-limiting-implementation'
  })
})

// --- AUTH / CORS SETUP ---

// NEW: Allow CORS preflight for social webhook BEFORE auth
app.options('/api/social/*', (c) => {
  const origin = c.req.header('Origin') ?? '*'
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Vary', 'Origin')
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Credentials', 'true')
  return c.body(null, 204)
})

// CHANGED: Bypass auth ONLY for /api/social/connect (and its trailing slash).
// All other /api/social/* routes remain protected.
app.use('/api/social/*', async (c, next) => {
  const url = new URL(c.req.url)
  const path = url.pathname
  const isConnect =
    path === '/api/social/connect' || path === '/api/social/connect/'

  if (c.req.method === 'OPTIONS') {
    // preflight already handled above, but let it through just in case
    return next()
  }

  if (isConnect) {
    // Public endpoint: no auth required
    return next()
  }

  // Everything else under /api/social/* still requires auth
  return supabaseAuth(c, next)
})

// Supabase authentication middleware for protected API routes
// Auth-only routes (no subscription required)
app.use('/api/profile/*', supabaseAuth)
app.use('/api/admin/*', supabaseAuth)

// Subscription routes handle their own auth internally
subscription.use('/status', supabaseAuth)
subscription.use('/cancel', supabaseAuth)
subscription.use('/setup', supabaseAuth)

// Core product routes: Auth + Subscription enforcement
// subscriptionAuth allows reads for expired users, blocks mutations
app.use('/api/artists/*', supabaseAuth, subscriptionAuth)
app.use('/api/releases/*', supabaseAuth, subscriptionAuth)
app.use('/api/calendar/*', supabaseAuth, subscriptionAuth)
app.use('/api/analytics/*', supabaseAuth, subscriptionAuth)
app.use('/api/lyrics/*', supabaseAuth, subscriptionAuth)
app.use('/api/tasks/*', supabaseAuth, subscriptionAuth)
app.use('/api/songs/*', supabaseAuth, subscriptionAuth)
app.use('/api/labelcopy/*', supabaseAuth, subscriptionAuth)
app.use('/api/splitsheets/*', supabaseAuth, subscriptionAuth)
app.use('/api/assets/*', supabaseAuth, subscriptionAuth)
app.use('/api/content/*', supabaseAuth, subscriptionAuth)
app.use('/api/jobs/*', supabaseAuth, subscriptionAuth)

// Mount route modules
app.route('/api/artists', artists)
app.route('/api/releases', releases)
app.route('/api/calendar', calendar)
app.route('/api/analytics', analytics)
app.route('/api/lyrics', lyrics)
app.route('/api/tasks', tasks)
app.route('/api/songs', songs)
app.route('/api/labelcopy', labelcopy)
app.route('/api/profile', profile)
app.route('/api/splitsheets', splitsheets)
app.route('/api/assets', assets)
app.route('/api/content', content)
app.route('/api/jobs', jobs)
app.route('/api/admin', admin)
app.route('/api/subscription', subscription)
app.route('/api/webhooks', webhooks)
app.route('/api/onboarding', onboarding)

// NEW: mount the social routes (exposes /api/social/connect with GET/POST/OPTIONS/HEAD)
app.route('/api/social', social)

// 404 handler
app.notFound((c) => {
  return c.json({ 
    success: false, 
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /health',
      'GET|POST /api/artists',
      'GET|POST /api/releases', 
      'GET|POST /api/calendar',
      'GET|POST /api/analytics',
      'GET|PUT /api/profile',
      'POST /api/profile/referral',
      'GET /api/profile/referral-stats',
      'GET|PUT|DELETE /api/splitsheets/song/:songId',
      'GET /api/admin/users',
      'GET /api/admin/stats',
      'GET /api/subscription/status',
      'GET /api/subscription/products',
      'POST /api/subscription/checkout',
      'POST /api/subscription/cancel',
      'POST /api/webhooks/stripe',
      'GET|POST /api/social/connect',
      'GET /api/social/metrics/instagram/:username',
      'GET /api/social/metrics/tiktok/:username',
      'GET /api/social/metrics/youtube/:username',
      'GET /api/social/metrics/twitter/:username'
    ]
  }, 404)
})

// Global error handler with standardized responses
app.onError((err, c) => {
  const requestId = generateRequestId()
  
  logger.error('Unhandled error', {
    ...extractErrorInfo(err),
    requestId,
    path: c.req.path,
    method: c.req.method
  })
  
  return c.json({
    success: false,
    error: 'Internal server error',
    requestId
  }, 500)
})

export default app
