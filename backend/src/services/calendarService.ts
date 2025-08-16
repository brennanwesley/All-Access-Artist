/**
 * Calendar Service - Business logic for content calendar management
 * All Access Artist - Backend API v2.0.0
 */
import { createClient } from '@supabase/supabase-js'
import type { Bindings } from '../types/bindings.js'

export class CalendarService {
  private supabase

  constructor(bindings: Bindings) {
    this.supabase = createClient(
      bindings.SUPABASE_URL,
      bindings.SUPABASE_SERVICE_KEY
    )
  }

  async getAllCalendarEvents(userId: string) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .select('*')
      .eq('artist_id', userId)
      .order('scheduled_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch calendar events: ${error.message}`)
    }

    return data
  }

  async createCalendarEvent(userId: string, eventData: any) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .insert({
        artist_id: userId,
        ...eventData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create calendar event: ${error.message}`)
    }

    return data
  }

  async getCalendarEventById(userId: string, eventId: string) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .select('*')
      .eq('id', eventId)
      .eq('artist_id', userId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch calendar event: ${error.message}`)
    }

    return data
  }

  async updateCalendarEvent(userId: string, eventId: string, eventData: any) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .update(eventData)
      .eq('id', eventId)
      .eq('artist_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update calendar event: ${error.message}`)
    }

    return data
  }

  async deleteCalendarEvent(userId: string, eventId: string) {
    const { error } = await this.supabase
      .from('content_calendar')
      .delete()
      .eq('id', eventId)
      .eq('artist_id', userId)

    if (error) {
      throw new Error(`Failed to delete calendar event: ${error.message}`)
    }

    return { success: true }
  }
}
