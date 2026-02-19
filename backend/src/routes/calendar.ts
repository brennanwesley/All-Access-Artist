/**
 * Calendar Routes - HTTP handlers for content calendar management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { CalendarService } from '../services/calendarService.js'
import { CreateCalendarSchema, IdParamSchema, UpdateContentCalendarSchema } from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { validateRequest } from '../middleware/validation.js'
import { errorResponse } from '../utils/apiResponse.js'

const calendar = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/calendar - Get all calendar events
calendar.get('/', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.getAllCalendarEvents(userId)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch calendar events',
      'CALENDAR_LIST_FAILED'
    )
  }
})

// GET /api/calendar/:id - Get calendar event by ID
calendar.get('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.getCalendarEventById(userId, id)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch calendar event',
      'CALENDAR_FETCH_FAILED'
    )
  }
})

// POST /api/calendar - Create new calendar event
calendar.post('/', validateRequest('json', CreateCalendarSchema), async (c) => {
  try {
    const eventData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.createCalendarEvent(userId, eventData)
    return c.json({ success: true, data }, 201)
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to create calendar event',
      'CALENDAR_CREATE_FAILED'
    )
  }
})

// PUT /api/calendar/:id - Update calendar event
calendar.put(
  '/:id',
  validateRequest('param', IdParamSchema),
  validateRequest('json', CreateCalendarSchema.partial()),
  async (c) => {
  try {
    const { id } = c.req.valid('param')
    const eventData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.updateCalendarEvent(userId, id, eventData)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to update calendar event',
      'CALENDAR_UPDATE_FAILED'
    )
  }
})

// PATCH /api/calendar/:id/content - Associate generated content with calendar event
calendar.patch(
  '/:id/content',
  validateRequest('param', IdParamSchema),
  validateRequest('json', UpdateContentCalendarSchema),
  async (c) => {
  try {
    const { id } = c.req.valid('param')
    const contentData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.updateCalendarEvent(userId, id, contentData)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to associate content with calendar event',
      'CALENDAR_CONTENT_ASSOCIATION_FAILED'
    )
  }
})

// GET /api/calendar/:id/content - Get calendar event with associated generated content
calendar.get('/:id/content', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.getCalendarEventWithContent(userId, id)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch calendar event with content',
      'CALENDAR_CONTENT_FETCH_FAILED'
    )
  }
})

// DELETE /api/calendar/:id - Delete calendar event
calendar.delete('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.deleteCalendarEvent(userId, id)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to delete calendar event',
      'CALENDAR_DELETE_FAILED'
    )
  }
})

export default calendar
