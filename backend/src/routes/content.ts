/**
 * Content Routes - HTTP handlers for AI-generated content management
 * All Access Artist - Backend API v2.0.0
 * 
 * Purpose: Manages AI-generated content (images, text, video, audio)
 * Features: CRUD operations, usage tracking, content search, statistics
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ContentService } from '../services/contentService.js'
import { 
  CreateGeneratedContentSchema, 
  UpdateGeneratedContentSchema 
} from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'

const content = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/content - Get all generated content with optional filtering
content.get('/', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    // Query parameters for filtering and pagination
    const contentType = c.req.query('type')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.getAllContent(userId, contentType, limit, offset)
    
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching generated content:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch generated content' 
    }, 500)
  }
})

// GET /api/content/:id - Get generated content by ID
content.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.getContentById(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching generated content:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch generated content' 
    }, 500)
  }
})

// POST /api/content - Create new generated content
content.post('/', zValidator('json', CreateGeneratedContentSchema), async (c) => {
  try {
    const contentData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.createContent(userId, contentData)
    
    return c.json({ success: true, data }, 201)
  } catch (error) {
    console.error('Error creating generated content:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create generated content' 
    }, 500)
  }
})

// PUT /api/content/:id - Update generated content
content.put('/:id', zValidator('json', UpdateGeneratedContentSchema), async (c) => {
  try {
    const id = c.req.param('id')
    const contentData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.updateContent(id, userId, contentData)
    
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error updating generated content:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update generated content' 
    }, 500)
  }
})

// DELETE /api/content/:id - Delete generated content
content.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.deleteContent(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error deleting generated content:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete generated content' 
    }, 500)
  }
})

// POST /api/content/:id/track-usage - Track content usage
content.post('/:id/track-usage', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.trackContentUsage(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error tracking content usage:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to track content usage' 
    }, 500)
  }
})

// GET /api/content/search - Search generated content
content.get('/search', async (c) => {
  try {
    const searchTerm = c.req.query('q')
    const limit = parseInt(c.req.query('limit') || '20')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    if (!searchTerm) {
      return c.json({ 
        success: false, 
        error: 'Search term is required' 
      }, 400)
    }
    
    const contentService = new ContentService(supabase)
    const data = await contentService.searchContent(userId, searchTerm, limit)
    
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error searching generated content:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to search generated content' 
    }, 500)
  }
})

// GET /api/content/stats - Get content statistics
content.get('/stats', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.getContentStats(userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching content statistics:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch content statistics' 
    }, 500)
  }
})

export default content
