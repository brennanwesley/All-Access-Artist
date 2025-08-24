/**
 * Content Service - Business logic for AI-generated content management
 * All Access Artist - Backend API v2.0.0
 * 
 * Purpose: Manages CRUD operations for generated content (images, text, video, audio)
 * Features: Usage tracking, metadata management, content moderation
 * Database: generated_content table with user-scoped RLS policies
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { 
  CreateGeneratedContentData, 
  UpdateGeneratedContentData 
} from '../types/schemas.js'

export class ContentService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all generated content for a user with optional filtering
   * @param userId - User ID for RLS filtering
   * @param contentType - Optional filter by content type
   * @param limit - Optional limit for pagination
   * @param offset - Optional offset for pagination
   */
  async getAllContent(
    userId: string, 
    contentType?: string, 
    limit: number = 50, 
    offset: number = 0
  ) {
    console.log('=== GET ALL CONTENT DEBUG ===')
    console.log('1. Input userId:', userId)
    console.log('2. Content type filter:', contentType || 'none')
    console.log('3. Pagination - limit:', limit, 'offset:', offset)
    
    let query = this.supabase
      .from('generated_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply content type filter if provided
    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    const { data, error } = await query

    console.log('4. Content items found:', data?.length || 0)
    console.log('=== END GET ALL CONTENT DEBUG ===')

    if (error) {
      throw new Error(`Failed to fetch generated content: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get generated content by ID with user verification
   * @param contentId - Content ID to retrieve
   * @param userId - User ID for RLS verification
   */
  async getContentById(contentId: string, userId: string) {
    console.log('=== GET CONTENT BY ID DEBUG ===')
    console.log('Content ID:', contentId)
    console.log('User ID:', userId)
    
    const { data, error } = await this.supabase
      .from('generated_content')
      .select('*')
      .eq('id', contentId)
      .eq('user_id', userId)
      .maybeSingle()

    console.log('Content query result:', { data: !!data, error })
    console.log('=== END GET CONTENT BY ID DEBUG ===')

    if (error) {
      console.log('Content query error:', error.message)
      throw new Error(`Failed to fetch generated content: ${error.message}`)
    }

    if (!data) {
      throw new Error('Generated content not found or access denied')
    }

    return data
  }

  /**
   * Create new generated content record
   * @param userId - User ID for ownership
   * @param contentData - Content creation data
   */
  async createContent(userId: string, contentData: CreateGeneratedContentData) {
    console.log('=== CREATE CONTENT DEBUG ===')
    console.log('1. User ID:', userId)
    console.log('2. Content type:', contentData.content_type)
    console.log('3. Prompt length:', contentData.prompt_text?.length || 0)
    
    // Prepare data with user_id and defaults
    const insertData = {
      user_id: userId,
      ...contentData,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('generated_content')
      .insert(insertData)
      .select()
      .single()

    console.log('4. Content creation result:', { success: !!data, error })
    console.log('=== END CREATE CONTENT DEBUG ===')

    if (error) {
      console.log('Content creation error:', error.message)
      throw new Error(`Failed to create generated content: ${error.message}`)
    }

    return data
  }

  /**
   * Update existing generated content
   * @param contentId - Content ID to update
   * @param userId - User ID for RLS verification
   * @param updateData - Content update data
   */
  async updateContent(
    contentId: string, 
    userId: string, 
    updateData: UpdateGeneratedContentData
  ) {
    console.log('=== UPDATE CONTENT DEBUG ===')
    console.log('1. Content ID:', contentId)
    console.log('2. User ID:', userId)
    console.log('3. Update fields:', Object.keys(updateData))
    
    // Add updated timestamp
    const updatePayload = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('generated_content')
      .update(updatePayload)
      .eq('id', contentId)
      .eq('user_id', userId)
      .select()
      .single()

    console.log('4. Content update result:', { success: !!data, error })
    console.log('=== END UPDATE CONTENT DEBUG ===')

    if (error) {
      console.log('Content update error:', error.message)
      throw new Error(`Failed to update generated content: ${error.message}`)
    }

    if (!data) {
      throw new Error('Generated content not found or access denied')
    }

    return data
  }

  /**
   * Delete generated content by ID
   * @param contentId - Content ID to delete
   * @param userId - User ID for RLS verification
   */
  async deleteContent(contentId: string, userId: string) {
    console.log('=== DELETE CONTENT DEBUG ===')
    console.log('1. Content ID:', contentId)
    console.log('2. User ID:', userId)
    
    const { data, error } = await this.supabase
      .from('generated_content')
      .delete()
      .eq('id', contentId)
      .eq('user_id', userId)
      .select()
      .single()

    console.log('3. Content deletion result:', { success: !!data, error })
    console.log('=== END DELETE CONTENT DEBUG ===')

    if (error) {
      console.log('Content deletion error:', error.message)
      throw new Error(`Failed to delete generated content: ${error.message}`)
    }

    if (!data) {
      throw new Error('Generated content not found or access denied')
    }

    return { success: true, message: 'Generated content deleted successfully' }
  }

  /**
   * Increment usage count for content tracking
   * @param contentId - Content ID to track usage
   * @param userId - User ID for RLS verification
   */
  async trackContentUsage(contentId: string, userId: string) {
    console.log('=== TRACK CONTENT USAGE DEBUG ===')
    console.log('1. Content ID:', contentId)
    console.log('2. User ID:', userId)
    
    // First get current usage count
    const { data: currentData } = await this.supabase
      .from('generated_content')
      .select('usage_count')
      .eq('id', contentId)
      .eq('user_id', userId)
      .single()

    const newUsageCount = (currentData?.usage_count || 0) + 1

    const { data, error } = await this.supabase
      .from('generated_content')
      .update({ 
        usage_count: newUsageCount,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId)
      .eq('user_id', userId)
      .select('usage_count, last_used_at')
      .single()

    console.log('3. Usage tracking result:', { success: !!data, error })
    console.log('=== END TRACK CONTENT USAGE DEBUG ===')

    if (error) {
      console.log('Usage tracking error:', error.message)
      throw new Error(`Failed to track content usage: ${error.message}`)
    }

    if (!data) {
      throw new Error('Generated content not found or access denied')
    }

    return data
  }

  /**
   * Get content statistics for user dashboard
   * @param userId - User ID for statistics
   */
  async getContentStats(userId: string) {
    console.log('=== GET CONTENT STATS DEBUG ===')
    console.log('User ID:', userId)
    
    const { data, error } = await this.supabase
      .from('generated_content')
      .select('content_type, usage_count, created_at')
      .eq('user_id', userId)

    console.log('Stats query result:', { count: data?.length || 0, error })
    console.log('=== END GET CONTENT STATS DEBUG ===')

    if (error) {
      throw new Error(`Failed to fetch content statistics: ${error.message}`)
    }

    // Calculate statistics
    const stats = {
      total_content: data?.length || 0,
      by_type: {} as Record<string, number>,
      total_usage: 0,
      recent_content: 0 // Last 7 days
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    data?.forEach(item => {
      // Count by type
      stats.by_type[item.content_type] = (stats.by_type[item.content_type] || 0) + 1
      
      // Sum total usage
      stats.total_usage += item.usage_count || 0
      
      // Count recent content
      if (new Date(item.created_at) > sevenDaysAgo) {
        stats.recent_content++
      }
    })

    return stats
  }

  /**
   * Search content by tags or description
   * @param userId - User ID for RLS filtering
   * @param searchTerm - Search term for tags/description
   * @param limit - Optional limit for results
   */
  async searchContent(userId: string, searchTerm: string, limit: number = 20) {
    console.log('=== SEARCH CONTENT DEBUG ===')
    console.log('1. User ID:', userId)
    console.log('2. Search term:', searchTerm)
    console.log('3. Limit:', limit)
    
    const { data, error } = await this.supabase
      .from('generated_content')
      .select('*')
      .eq('user_id', userId)
      .or(`tags.cs.{${searchTerm}},description.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    console.log('4. Search results found:', data?.length || 0)
    console.log('=== END SEARCH CONTENT DEBUG ===')

    if (error) {
      throw new Error(`Failed to search generated content: ${error.message}`)
    }

    return data || []
  }
}
