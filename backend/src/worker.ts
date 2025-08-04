/**
 * All Access Artist - Backend API v2.0.0
 * Cloudflare Worker with Hono, JWT Authentication, and Zod Validation
 * Proprietary - Music Industry Management Platform
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Environment variable types for TypeScript
type Bindings = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  SUPABASE_ANON_KEY: string
  SUPABASE_JWT_SECRET: string
}

// Zod schemas for input validation
const CreateReleaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist_id: z.string().uuid('Invalid artist ID'),
  release_date: z.string().datetime('Invalid release date'),
  type: z.enum(['single', 'album', 'ep'], {
    errorMap: () => ({ message: 'Type must be single, album, or ep' })
  }),
  status: z.enum(['draft', 'scheduled', 'released']).optional().default('draft'),
  description: z.string().optional(),
  genre: z.string().optional(),
  cover_art_url: z.string().url().optional(),
  streaming_links: z.record(z.string().url()).optional()
})

const CreateArtistSchema = z.object({
  artist_name: z.string().min(1, 'Artist name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  genre: z.string().optional(),
  location: z.string().optional(),
  profile_image_url: z.string().url().optional(),
  is_public: z.boolean().optional().default(true),
  social_media_links: z.record(z.string().url()).optional()
})

const CreateCalendarSchema = z.object({
  artist_id: z.string().uuid('Invalid artist ID'),
  title: z.string().min(1, 'Title is required'),
  content_type: z.enum(['post', 'story', 'video', 'live', 'announcement']),
  platform: z.enum(['instagram', 'twitter', 'tiktok', 'youtube', 'facebook']),
  scheduled_date: z.string().datetime('Invalid scheduled date'),
  content: z.string().optional(),
  media_url: z.string().url().optional(),
  status: z.enum(['draft', 'scheduled', 'published']).optional().default('draft')
})

// Initialize Hono app
const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check endpoint (unauthenticated)
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'All Access Artist API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    framework: 'Hono',
    authentication: 'JWT',
    validation: 'Zod',
    database: 'Supabase'
  })
})

// JWT Authentication middleware for all /api/* routes
app.use('/api/*', jwt({
  secret: (c) => c.env.SUPABASE_JWT_SECRET,
}))

// User-scoped Supabase client middleware
app.use('/api/*', async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Authorization header missing' }, 401)
    }

    // Create user-scoped Supabase client
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Get user from JWT payload (already validated by jwt middleware)
    const payload = c.get('jwtPayload')
    
    // Attach scoped client and user to context
    c.set('supabase', supabase)
    c.set('user', payload)
    
    await next()
  } catch (error) {
    console.error('Supabase client initialization error:', error)
    return c.json({ error: 'Authentication failed' }, 401)
  }
})

// API Routes

// Artists endpoints
app.get('/api/artists', async (c) => {
  const supabase = c.get('supabase')
  const user = c.get('user')
  
  try {
    const { data, error } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('user_id', user.sub) // RLS enforced through user-scoped client
      .order('created_at', { ascending: false })

    if (error) throw error
    return c.json(data)
  } catch (error) {
    console.error('Artists fetch error:', error)
    return c.json({ error: 'Failed to fetch artists' }, 500)
  }
})

app.get('/api/artists/:id', async (c) => {
  const supabase = c.get('supabase')
  const id = c.req.param('id')
  
  try {
    const { data, error } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return c.json(data)
  } catch (error) {
    console.error('Artist fetch error:', error)
    return c.json({ error: 'Artist not found' }, 404)
  }
})

app.post('/api/artists', zValidator('json', CreateArtistSchema), async (c) => {
  const supabase = c.get('supabase')
  const user = c.get('user')
  const artistData = c.req.valid('json')
  
  try {
    const { data, error } = await supabase
      .from('artist_profiles')
      .insert({
        ...artistData,
        user_id: user.sub // Associate with authenticated user
      })
      .select()
      .single()

    if (error) throw error
    return c.json(data, 201)
  } catch (error) {
    console.error('Artist creation error:', error)
    return c.json({ error: 'Failed to create artist' }, 500)
  }
})

// Music releases endpoints
app.get('/api/releases', async (c) => {
  const supabase = c.get('supabase')
  
  try {
    const { data, error } = await supabase
      .from('music_releases')
      .select(`
        *,
        artist_profiles (
          artist_name,
          profile_image_url
        )
      `)
      .eq('status', 'released')
      .order('release_date', { ascending: false })

    if (error) throw error
    return c.json(data)
  } catch (error) {
    console.error('Releases fetch error:', error)
    return c.json({ error: 'Failed to fetch releases' }, 500)
  }
})

app.get('/api/releases/:id', async (c) => {
  const supabase = c.get('supabase')
  const id = c.req.param('id')
  
  try {
    const { data, error } = await supabase
      .from('music_releases')
      .select(`
        *,
        artist_profiles (
          artist_name,
          profile_image_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return c.json(data)
  } catch (error) {
    console.error('Release fetch error:', error)
    return c.json({ error: 'Release not found' }, 404)
  }
})

app.post('/api/releases', zValidator('json', CreateReleaseSchema), async (c) => {
  const supabase = c.get('supabase')
  const releaseData = c.req.valid('json')
  
  try {
    const { data, error } = await supabase
      .from('music_releases')
      .insert(releaseData)
      .select()
      .single()

    if (error) throw error
    return c.json(data, 201)
  } catch (error) {
    console.error('Release creation error:', error)
    return c.json({ error: 'Failed to create release' }, 500)
  }
})

// Analytics endpoints
app.get('/api/analytics', async (c) => {
  const supabase = c.get('supabase')
  const artistId = c.req.query('artist_id')
  const platform = c.req.query('platform')
  
  if (!artistId) {
    return c.json({ error: 'artist_id query parameter is required' }, 400)
  }
  
  try {
    let query = supabase
      .from('fan_analytics')
      .select('*')
      .eq('artist_id', artistId)
      .order('period_start', { ascending: false })

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query

    if (error) throw error
    return c.json(data)
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return c.json({ error: 'Failed to fetch analytics' }, 500)
  }
})

// Content calendar endpoints
app.get('/api/calendar', async (c) => {
  const supabase = c.get('supabase')
  const artistId = c.req.query('artist_id')
  
  if (!artistId) {
    return c.json({ error: 'artist_id query parameter is required' }, 400)
  }
  
  try {
    const { data, error } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('artist_id', artistId)
      .order('scheduled_date', { ascending: true })

    if (error) throw error
    return c.json(data)
  } catch (error) {
    console.error('Calendar fetch error:', error)
    return c.json({ error: 'Failed to fetch calendar' }, 500)
  }
})

app.post('/api/calendar', zValidator('json', CreateCalendarSchema), async (c) => {
  const supabase = c.get('supabase')
  const calendarData = c.req.valid('json')
  
  try {
    const { data, error } = await supabase
      .from('content_calendar')
      .insert(calendarData)
      .select()
      .single()

    if (error) throw error
    return c.json(data, 201)
  } catch (error) {
    console.error('Calendar creation error:', error)
    return c.json({ error: 'Failed to create calendar entry' }, 500)
  }
})

// Default route
app.get('/', (c) => {
  return c.json({
    message: 'All Access Artist API v2.0.0',
    framework: 'Hono',
    authentication: 'JWT',
    validation: 'Zod',
    database: 'Supabase with RLS',
    endpoints: [
      'GET /health - Health check (unauthenticated)',
      'GET /api/artists - Get user\'s artist profiles',
      'POST /api/artists - Create artist profile',
      'GET /api/artists/:id - Get specific artist',
      'GET /api/releases - Get music releases',
      'POST /api/releases - Create music release',
      'GET /api/releases/:id - Get specific release',
      'GET /api/analytics?artist_id=uuid - Get analytics data',
      'GET /api/calendar?artist_id=uuid - Get content calendar',
      'POST /api/calendar - Create calendar entry'
    ]
  })
})

// Global error handler
app.onError((err, c) => {
  console.error('API Error:', err)
  return c.json({ 
    error: 'Internal Server Error',
    message: err.message 
  }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404)
})

export default app
