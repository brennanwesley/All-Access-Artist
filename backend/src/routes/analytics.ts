/**
 * Analytics Routes - HTTP handlers for fan analytics management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { AnalyticsService } from '../services/analyticsService.js'
import { CreateAnalyticsSchema, IdParamSchema } from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { validateRequest } from '../middleware/validation.js'
import { errorResponse } from '../utils/apiResponse.js'

const analytics = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/analytics - Get all analytics
analytics.get('/', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.getAllAnalytics(userId)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch analytics',
      'ANALYTICS_LIST_FAILED'
    )
  }
})

// GET /api/analytics/:id - Get analytics by ID
analytics.get('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.getAnalyticsById(userId, id)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch analytics',
      'ANALYTICS_FETCH_FAILED'
    )
  }
})

// POST /api/analytics - Create new analytics record
analytics.post('/', validateRequest('json', CreateAnalyticsSchema), async (c) => {
  try {
    const analyticsData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.createAnalytics(userId, analyticsData)
    return c.json({ success: true, data }, 201)
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to create analytics',
      'ANALYTICS_CREATE_FAILED'
    )
  }
})

// PUT /api/analytics/:id - Update analytics record
analytics.put(
  '/:id',
  validateRequest('param', IdParamSchema),
  validateRequest('json', CreateAnalyticsSchema.partial()),
  async (c) => {
  try {
    const { id } = c.req.valid('param')
    const analyticsData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.updateAnalytics(userId, id, analyticsData)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to update analytics',
      'ANALYTICS_UPDATE_FAILED'
    )
  }
})

// DELETE /api/analytics/:id - Delete analytics record
analytics.delete('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.deleteAnalytics(userId, id)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to delete analytics',
      'ANALYTICS_DELETE_FAILED'
    )
  }
})

export default analytics
