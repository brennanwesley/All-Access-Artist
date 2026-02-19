/**
 * Content Routes - HTTP handlers for AI-generated content management
 * All Access Artist - Backend API v2.0.0
 * 
 * Purpose: Manages AI-generated content (images, text, video, audio)
 * Features: CRUD operations, usage tracking, content search, statistics
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { ContentService } from '../services/contentService.js'
import { 
  IdParamSchema,
  CreateGeneratedContentSchema, 
  UpdateGeneratedContentSchema 
} from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { validateRequest } from '../middleware/validation.js'
import { errorResponse } from '../utils/apiResponse.js'

const content = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const ContentListQuerySchema = z.object({
  type: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

const ContentSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search term is required'),
  limit: z.coerce.number().int().min(1).max(200).optional(),
})

// GET /api/content - Get all generated content with optional filtering
content.get('/', validateRequest('query', ContentListQuerySchema), async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    // Query parameters for filtering and pagination
    const {
      type: contentType,
      limit = 50,
      offset = 0,
    } = c.req.valid('query')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.getAllContent(userId, contentType, limit, offset)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch generated content',
      'CONTENT_LIST_FAILED'
    )
  }
})

// GET /api/content/:id - Get generated content by ID
content.get('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.getContentById(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch generated content',
      'CONTENT_FETCH_FAILED'
    )
  }
})

// POST /api/content - Create new generated content
content.post('/', validateRequest('json', CreateGeneratedContentSchema), async (c) => {
  try {
    const contentData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.createContent(userId, contentData)
    
    return c.json({ success: true, data }, 201)
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to create generated content',
      'CONTENT_CREATE_FAILED'
    )
  }
})

// PUT /api/content/:id - Update generated content
content.put(
  '/:id',
  validateRequest('param', IdParamSchema),
  validateRequest('json', UpdateGeneratedContentSchema),
  async (c) => {
  try {
    const { id } = c.req.valid('param')
    const contentData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.updateContent(id, userId, contentData)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to update generated content',
      'CONTENT_UPDATE_FAILED'
    )
  }
})

// DELETE /api/content/:id - Delete generated content
content.delete('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.deleteContent(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to delete generated content',
      'CONTENT_DELETE_FAILED'
    )
  }
})

// POST /api/content/:id/track-usage - Track content usage
content.post('/:id/track-usage', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.trackContentUsage(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to track content usage',
      'CONTENT_TRACK_USAGE_FAILED'
    )
  }
})

// GET /api/content/search - Search generated content
content.get('/search', validateRequest('query', ContentSearchQuerySchema), async (c) => {
  try {
    const { q: searchTerm, limit = 20 } = c.req.valid('query')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const contentService = new ContentService(supabase)
    const data = await contentService.searchContent(userId, searchTerm, limit)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to search generated content',
      'CONTENT_SEARCH_FAILED'
    )
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
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch content statistics',
      'CONTENT_STATS_FAILED'
    )
  }
})

export default content
