/**
 * Calendar Service - Business logic for content calendar management
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateCalendarData } from '../types/schemas.js'

export class CalendarService {
  constructor(private supabase: SupabaseClient) {}

  async getAllEvents(artistId?: string) {
    let query = this.supabase
      .from('content_calendar')
      .select('*')
      .order('event_date', { ascending: true })

    if (artistId) {
      query = query.eq('artist_id', artistId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch calendar events: ${error.message}`)
    }

    return data
  }

  async getEventById(id: string) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch calendar event: ${error.message}`)
    }

    return data
  }

  async createEvent(eventData: CreateCalendarData) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .insert([eventData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create calendar event: ${error.message}`)
    }

    return data
  }

  async updateEvent(id: string, eventData: Partial<CreateCalendarData>) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .update(eventData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update calendar event: ${error.message}`)
    }

    return data
  }

  async deleteEvent(id: string) {
    const { error } = await this.supabase
      .from('content_calendar')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete calendar event: ${error.message}`)
    }

    return { success: true }
  }
}
