/**
 * Analytics Service - Business logic for fan analytics management
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateAnalyticsData } from '../types/schemas'

export class AnalyticsService {
  constructor(private supabase: SupabaseClient) {}

  async getAllAnalytics(artistId?: string) {
    let query = this.supabase
      .from('fan_analytics')
      .select('*')
      .order('date_recorded', { ascending: false })

    if (artistId) {
      query = query.eq('artist_id', artistId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`)
    }

    return data
  }

  async getAnalyticsById(id: string) {
    const { data, error } = await this.supabase
      .from('fan_analytics')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch analytics record: ${error.message}`)
    }

    return data
  }

  async createAnalytics(analyticsData: CreateAnalyticsData) {
    const { data, error } = await this.supabase
      .from('fan_analytics')
      .insert([analyticsData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create analytics record: ${error.message}`)
    }

    return data
  }

  async updateAnalytics(id: string, analyticsData: Partial<CreateAnalyticsData>) {
    const { data, error } = await this.supabase
      .from('fan_analytics')
      .update(analyticsData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update analytics record: ${error.message}`)
    }

    return data
  }

  async deleteAnalytics(id: string) {
    const { error } = await this.supabase
      .from('fan_analytics')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete analytics record: ${error.message}`)
    }

    return { success: true }
  }
}
