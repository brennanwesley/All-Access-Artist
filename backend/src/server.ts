/**
 * All Access Artist - Backend API Server
 * Node.js Server Entry Point for Render Deployment
 * Converts Cloudflare Workers app to standard Node.js HTTP server
 */

import { serve } from '@hono/node-server'
import app from './worker.js'

const port = parseInt(process.env.PORT || '3000')

console.log(`🚀 All Access Artist Backend API starting on port ${port}`)
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`🔗 Health check: http://localhost:${port}/health`)

serve({
  fetch: app.fetch,
  port
})

console.log(`✅ Server running on http://localhost:${port}`)
