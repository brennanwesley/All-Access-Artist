/**
 * Analytics Routes - HTTP handlers for fan analytics management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { AnalyticsService } from '../services/analyticsService'
import { CreateAnalyticsSchema } from '../types/schemas'
import type { Bindings, Variables } from '../types/bindings'

const analytics = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/analytics - Get all analytics
analytics.get('/', async (c) => {
  try {
    const artistId = c.req.query('artist_id')
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.getAllAnalytics(artistId)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch analytics' 
    }, 500)
  }
})

// GET /api/analytics/:id - Get analytics by ID
analytics.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.getAnalyticsById(id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch analytics' 
    }, 500)
  }
})

// POST /api/analytics - Create new analytics record
analytics.post('/', zValidator('json', CreateAnalyticsSchema), async (c) => {
  try {
    const analyticsData = c.req.valid('json')
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.createAnalytics(analyticsData)
    return c.json({ success: true, data }, 201)
  } catch (error) {
    console.error('Error creating analytics:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create analytics' 
    }, 500)
  }
})

// PUT /api/analytics/:id - Update analytics record
analytics.put('/:id', zValidator('json', CreateAnalyticsSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id')
    const analyticsData = c.req.valid('json')
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.updateAnalytics(id, analyticsData)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error updating analytics:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update analytics' 
    }, 500)
  }
})

// DELETE /api/analytics/:id - Delete analytics record
analytics.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const supabase = c.get('supabase')
    const analyticsService = new AnalyticsService(supabase)
    
    const data = await analyticsService.deleteAnalytics(id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error deleting analytics:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete analytics' 
    }, 500)
  }
})

export { analytics }
