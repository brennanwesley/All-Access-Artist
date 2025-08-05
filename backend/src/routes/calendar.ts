/**
 * Calendar Routes - HTTP handlers for content calendar management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CalendarService } from '../services/calendarService'
import { CreateCalendarSchema } from '../types/schemas'
import type { Bindings, Variables } from '../types/bindings'

const calendar = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/calendar - Get all calendar events
calendar.get('/', async (c) => {
  try {
    const artistId = c.req.query('artist_id')
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.getAllEvents(artistId)
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
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.getEventById(id)
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
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.createEvent(eventData)
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
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.updateEvent(id, eventData)
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
    const supabase = c.get('supabase')
    const calendarService = new CalendarService(supabase)
    
    const data = await calendarService.deleteEvent(id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete calendar event' 
    }, 500)
  }
})

export { calendar }
