/**
 * Calendar Service - Business logic for content calendar management
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateCalendarData, UpdateContentCalendarData } from '../types/schemas.js'

type CalendarUpdateData = Partial<CreateCalendarData> | UpdateContentCalendarData

export class CalendarService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async getAllCalendarEvents(userId: string) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch calendar events: ${error.message}`)
    }

    return data
  }

  async createCalendarEvent(userId: string, eventData: CreateCalendarData) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .insert({
        user_id: userId,
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
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch calendar event: ${error.message}`)
    }

    return data
  }

  async updateCalendarEvent(userId: string, eventId: string, eventData: CalendarUpdateData) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .update(eventData)
      .eq('id', eventId)
      .eq('user_id', userId)
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
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete calendar event: ${error.message}`)
    }

    return { success: true }
  }

  async getCalendarEventWithContent(userId: string, eventId: string) {
    const { data, error } = await this.supabase
      .from('content_calendar')
      .select(`
        *,
        generated_content:generated_content_id (
          id,
          content_type,
          file_url,
          title,
          description,
          tags,
          created_at
        )
      `)
      .eq('id', eventId)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch calendar event with content: ${error.message}`)
    }

    return data
  }
}
