/**
 * All Access Artist - Backend API
 * Cloudflare Workers Entry Point
 * 
 * @version 2.0.0
 * @license PROPRIETARY
 * @author Brennan Wesley Tharaldson
 */

import { Router } from 'itty-router'
import { createClient } from '@supabase/supabase-js'

// Initialize router
const router = Router()

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Health check endpoint
router.get('/api/health', () => {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    version: '2.0.0',
    timestamp: new Date().toISOString()
  }), {
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
})

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    headers: corsHeaders
  })
})

// Main worker export
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      // Initialize Supabase client with environment variables
      const supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_KEY
      )

      // Handle the request
      return await router.handle(request, env)
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
  },

  // Handle scheduled events (cron jobs)
  async scheduled(event: any, env: any): Promise<void> {
    console.log('Scheduled event triggered:', event.cron)
    
    switch (event.cron) {
      case '0 0 * * *':
        // Daily royalty calculations
        console.log('Running daily royalty calculations...')
        break
      case '0 */6 * * *':
        // Analytics processing
        console.log('Running analytics processing...')
        break
    }
  }
}
