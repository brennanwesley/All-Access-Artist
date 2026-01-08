/**
 * All Access Artist - Backend API Server
 * Node.js Server Entry Point for Render Deployment
 * Hono framework with Node.js server adapter
 */

import { serve } from '@hono/node-server'
import app from './worker.js'
import { logger } from './utils/logger.js'

const port = parseInt(process.env.PORT || '3000')
const env = process.env.NODE_ENV || 'development'

logger.info('Server starting', {
  port,
  environment: env,
  healthCheck: `http://localhost:${port}/health`,
  version: '2.0.0'
})

serve({
  fetch: app.fetch,
  port
})

logger.info('Server running', { port, environment: env })
