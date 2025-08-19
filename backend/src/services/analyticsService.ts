/**
 * Analytics Service - Business logic for fan analytics management
 * All Access Artist - Backend API v2.0.0
 */
import { createClient } from '@supabase/supabase-js'
import type { Bindings } from '../types/bindings.js'

export class AnalyticsService {
  private supabase

  constructor(bindings: Bindings) {
    this.supabase = createClient(
      bindings.SUPABASE_URL,
      bindings.SUPABASE_SERVICE_KEY
    )
  }

  async getAllAnalytics(userId: string) {
    const { data, error } = await this.supabase
      .from('fan_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`)
    }

    return data
  }

  async createAnalytics(userId: string, analyticsData: any) {
    const { data, error } = await this.supabase
      .from('fan_analytics')
      .insert({
        user_id: userId,
        ...analyticsData,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create analytics: ${error.message}`)
    }

    return data
  }

  async getAnalyticsById(analyticsId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('fan_analytics')
      .select('*')
      .eq('id', analyticsId)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`)
    }

    return data
  }

  async updateAnalytics(analyticsId: string, userId: string, analyticsData: any) {
    const { data, error } = await this.supabase
      .from('fan_analytics')
      .update(analyticsData)
      .eq('id', analyticsId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update analytics: ${error.message}`)
    }

    return data
  }

  async deleteAnalytics(analyticsId: string, userId: string) {
    const { error } = await this.supabase
      .from('fan_analytics')
      .delete()
      .eq('id', analyticsId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete analytics: ${error.message}`)
    }

    return { success: true }
  }
}
