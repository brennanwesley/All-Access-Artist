/**
 * All Access Artist - Backend API v2.0.0 (Node.js)
 * Hono Framework with JWT Authentication, Service Layer Architecture
 * Proprietary - Music Industry Management Platform
 */

import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors.js'
import { rateLimitMiddleware } from './middleware/rateLimit.js'
import { supabaseAuth } from './middleware/auth.js'
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
import type { Bindings, Variables } from './types/bindings.js'
import { generateRequestId } from './utils/errorHandler.js'

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

// Supabase authentication middleware for all API routes (includes JWT validation)
app.use('/api/*', supabaseAuth)

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
      'GET /api/admin/stats'
    ]
  }, 404)
})

// Global error handler with standardized responses
app.onError((err, c) => {
  const requestId = generateRequestId()
  console.error('Global error:', err)
  
  return c.json({
    success: false,
    error: 'Internal server error',
    requestId
  }, 500)
})

export default app
