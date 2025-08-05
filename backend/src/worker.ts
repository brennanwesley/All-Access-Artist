/**
 * All Access Artist - Backend API v2.0.0 (Restructured)
 * Cloudflare Worker with Hono, JWT Authentication, and Service Layer Architecture
 * Proprietary - Music Industry Management Platform
 */

import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors'
import { createJwtAuth, supabaseAuth } from './middleware/auth'
import { artists } from './routes/artists'
import { releases } from './routes/releases'
import { calendar } from './routes/calendar'
import { analytics } from './routes/analytics'
import type { Bindings, Variables } from './types/bindings'
import { APIError, CommonErrors } from './types/errors'
import { createErrorResponse, logError, generateRequestId } from './utils/errorHandler'

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
    service: 'All Access Artist Backend API'
  })
})

// JWT authentication middleware for all API routes
app.use('/api/*', createJwtAuth((c) => c.env.SUPABASE_JWT_SECRET))

// Supabase user-scoped client middleware for all API routes
app.use('/api/*', supabaseAuth)

// Mount route modules
app.route('/api/artists', artists)
app.route('/api/releases', releases)
app.route('/api/calendar', calendar)
app.route('/api/analytics', analytics)

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
      'GET|POST /api/analytics'
    ]
  }, 404)
})

// Global error handler with standardized responses
app.onError((err, c) => {
  const requestId = generateRequestId()
  
  // Log error securely (no sensitive data)
  logError(err, c, { requestId })
  
  // Handle different error types
  if (err instanceof APIError) {
    const response = createErrorResponse(err, c, requestId)
    return c.json(response, err.statusCode)
  }
  
  // Handle unknown errors with generic internal error
  const internalError = CommonErrors.INTERNAL_SERVER_ERROR
  const response = createErrorResponse(internalError, c, requestId)
  return c.json(response, internalError.statusCode)
})

export default app
