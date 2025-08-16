/**
 * Calendar Routes - HTTP handlers for content calendar management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CalendarService } from '../services/calendarService.js'
import { CreateCalendarSchema } from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'

const calendar = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/calendar - Get all calendar events
calendar.get('/', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const bindings = c.env
    const calendarService = new CalendarService(bindings)
    
    const data = await calendarService.getAllCalendarEvents(userId)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch calendar events' 
    }, 500)
  }
})

// GET /api/calendar/:id - Get calendar event by ID
calendar.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const bindings = c.env
    const calendarService = new CalendarService(bindings)
    
    const data = await calendarService.getCalendarEventById(userId, id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching calendar event:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch calendar event' 
    }, 500)
  }
})

// POST /api/calendar - Create new calendar event
calendar.post('/', zValidator('json', CreateCalendarSchema), async (c) => {
  try {
    const eventData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const bindings = c.env
    const calendarService = new CalendarService(bindings)
    
    const data = await calendarService.createCalendarEvent(userId, eventData)
    return c.json({ success: true, data }, 201)
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create calendar event' 
    }, 500)
  }
})

// PUT /api/calendar/:id - Update calendar event
calendar.put('/:id', zValidator('json', CreateCalendarSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id')
    const eventData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const bindings = c.env
    const calendarService = new CalendarService(bindings)
    
    const data = await calendarService.updateCalendarEvent(userId, id, eventData)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update calendar event' 
    }, 500)
  }
})

// DELETE /api/calendar/:id - Delete calendar event
calendar.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const bindings = c.env
    const calendarService = new CalendarService(bindings)
    
    const data = await calendarService.deleteCalendarEvent(userId, id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete calendar event' 
    }, 500)
  }
})

export default calendar
