/**
 * All Access Artist - Backend API v2.0.0 (Node.js)
 * Hono Framework with JWT Authentication, Service Layer Architecture
 * Proprietary - Music Industry Management Platform
 */

import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors.js'
import { createJwtAuth, supabaseAuth } from './middleware/auth.js'
import artists from './routes/artists.js'
import releases from './routes/releases.js'
import calendar from './routes/calendar.js'
import analytics from './routes/analytics.js'
import lyrics from './routes/lyrics.js'
import tasks from './routes/tasks.js'
import songs from './routes/songs.js'
import profile from './routes/profile.js'
import type { Bindings, Variables } from './types/bindings.js'
import { generateRequestId } from './utils/errorHandler.js'

// Initialize Hono app with proper typing
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Apply CORS middleware globally
app.use('*', corsMiddleware)

// Health check endpoint (no authentication required)
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    service: 'All Access Artist Backend API',
    environment: process.env.NODE_ENV || 'development'
  })
})

// JWT authentication middleware for all API routes
app.use('/api/*', createJwtAuth(() => process.env.SUPABASE_JWT_SECRET!))

// Supabase user-scoped client middleware for all API routes
app.use('/api/*', supabaseAuth)

// Mount route modules
app.route('/api/artists', artists)
app.route('/api/releases', releases)
app.route('/api/calendar', calendar)
app.route('/api/analytics', analytics)
app.route('/api/lyrics', lyrics)
app.route('/api/tasks', tasks)
app.route('/api/songs', songs)
app.route('/api/profile', profile)

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
      'GET /api/profile/referral-stats'
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
