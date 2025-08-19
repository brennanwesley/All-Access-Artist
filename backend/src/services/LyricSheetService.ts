/**
 * Lyric Sheet Service - Business logic for lyric sheet and section management
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { 
  CreateLyricSheetData, 
  UpdateLyricSheetData, 
  CreateLyricSectionData, 
  UpdateLyricSectionData 
} from '../types/schemas.js'

export class LyricSheetService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get lyric sheet with all sections for a specific song
   * @param songId - ID of the song
   * @param userId - ID of the user (for security)
   * @returns Lyric sheet with ordered sections
   */
  async getLyricSheetBySongId(songId: string, userId: string) {
    const { data: lyricSheet, error: sheetError } = await this.supabase
      .from('lyric_sheets')
      .select(`
        *,
        lyric_sheet_sections (
          id,
          section_type,
          section_lyrics,
          section_order,
          created_at,
          updated_at
        )
      `)
      .eq('song_id', songId)
      .eq('user_id', userId)
      .single()

    if (sheetError) {
      if (sheetError.code === 'PGRST116') {
        // No lyric sheet found for this song
        return null
      }
      throw new Error(`Failed to fetch lyric sheet: ${sheetError.message}`)
    }

    // Sort sections by section_order
    if (lyricSheet.lyric_sheet_sections) {
      lyricSheet.lyric_sheet_sections.sort((a: any, b: any) => a.section_order - b.section_order)
    }

    return lyricSheet
  }

  /**
   * Create a new lyric sheet for a song
   * @param lyricSheetData - Data for creating the lyric sheet
   * @returns Created lyric sheet
   */
  async createLyricSheet(lyricSheetData: CreateLyricSheetData) {
    // Check if lyric sheet already exists for this song (user-scoped)
    const { data: existingSheets } = await this.supabase
      .from('lyric_sheets')
      .select('id')
      .eq('song_id', lyricSheetData.song_id)
      .eq('user_id', lyricSheetData.user_id)
      .limit(1)
    
    if (existingSheets && existingSheets.length > 0) {
      throw new Error('Lyric sheet already exists for this song')
    }

    const { data, error } = await this.supabase
      .from('lyric_sheets')
      .insert([lyricSheetData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create lyric sheet: ${error.message}`)
    }

    return data
  }

  /**
   * Update an existing lyric sheet
   * @param sheetId - ID of the lyric sheet to update
   * @param userId - ID of the user (for security)
   * @param updateData - Data to update
   * @returns Updated lyric sheet
   */
  async updateLyricSheet(sheetId: string, userId: string, updateData: UpdateLyricSheetData) {
    const { data, error } = await this.supabase
      .from('lyric_sheets')
      .update(updateData)
      .eq('id', sheetId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update lyric sheet: ${error.message}`)
    }

    return data
  }

  /**
   * Add a new section to a lyric sheet
   * @param sheetId - ID of the lyric sheet
   * @param userId - ID of the user (for security)
   * @param sectionData - Data for the new section
   * @returns Created section
   */
  async addSectionToSheet(sheetId: string, userId: string, sectionData: CreateLyricSectionData) {
    // Get the next section order (user-scoped)
    const { data: maxOrderResult, error: orderError } = await this.supabase
      .from('lyric_sheet_sections')
      .select('section_order')
      .eq('lyric_sheet_id', sheetId)
      .eq('user_id', userId)
      .order('section_order', { ascending: false })
      .limit(1)

    if (orderError) {
      throw new Error(`Failed to determine section order: ${orderError.message}`)
    }

    const nextOrder = maxOrderResult && maxOrderResult.length > 0 
      ? maxOrderResult[0].section_order + 1 
      : 0

    // Create the new section
    const newSection = {
      lyric_sheet_id: sheetId,
      section_type: sectionData.section_type,
      section_lyrics: sectionData.content,
      section_order: nextOrder,
      user_id: userId
    }

    const { data, error } = await this.supabase
      .from('lyric_sheet_sections')
      .insert([newSection])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add section: ${error.message}`)
    }

    // Update the total_sections count in the parent lyric sheet
    await this.updateSectionCount(sheetId, userId)

    return data
  }

  /**
   * Update an existing section
   * @param sheetId - ID of the lyric sheet (for RLS validation)
   * @param sectionId - ID of the section to update
   * @param userId - ID of the user (for security)
   * @param updateData - Data to update
   * @returns Updated section
   */
  async updateSection(sheetId: string, sectionId: string, userId: string, updateData: UpdateLyricSectionData) {
    // Verify the section belongs to the specified sheet and user (for security)
    const { data: section, error: verifyError } = await this.supabase
      .from('lyric_sheet_sections')
      .select('id')
      .eq('id', sectionId)
      .eq('lyric_sheet_id', sheetId)
      .eq('user_id', userId)
      .single()

    if (verifyError || !section) {
      throw new Error('Section not found or does not belong to this lyric sheet')
    }

    const { data, error } = await this.supabase
      .from('lyric_sheet_sections')
      .update(updateData)
      .eq('id', sectionId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update section: ${error.message}`)
    }

    return data
  }

  /**
   * Delete a section from a lyric sheet
   * @param sheetId - ID of the lyric sheet (for RLS validation)
   * @param sectionId - ID of the section to delete
   * @param userId - ID of the user (for security)
   * @returns Success confirmation
   */
  async deleteSection(sheetId: string, sectionId: string, userId: string) {
    // Verify the section belongs to the specified sheet and user (for security)
    const { data: section, error: verifyError } = await this.supabase
      .from('lyric_sheet_sections')
      .select('id, section_order')
      .eq('id', sectionId)
      .eq('lyric_sheet_id', sheetId)
      .eq('user_id', userId)
      .single()

    if (verifyError || !section) {
      throw new Error('Section not found or does not belong to this lyric sheet')
    }

    const deletedOrder = section.section_order

    // Delete the section
    const { error: deleteError } = await this.supabase
      .from('lyric_sheet_sections')
      .delete()
      .eq('id', sectionId)

    if (deleteError) {
      throw new Error(`Failed to delete section: ${deleteError.message}`)
    }

    // Reorder remaining sections to fill the gap
    await this.reorderSectionsAfterDeletion(sheetId, userId, deletedOrder)

    // Update the total_sections count in the parent lyric sheet
    await this.updateSectionCount(sheetId, userId)

    return { success: true }
  }

  /**
   * Reorder sections after a deletion to maintain sequential ordering
   * @param sheetId - ID of the lyric sheet
   * @param userId - ID of the user (for security)
   * @param deletedOrder - Order of the deleted section
   */
  private async reorderSectionsAfterDeletion(sheetId: string, userId: string, deletedOrder: number) {
    // Get all sections with order greater than the deleted section (user-scoped)
    const { data: sectionsToReorder, error } = await this.supabase
      .from('lyric_sheet_sections')
      .select('id, section_order')
      .eq('lyric_sheet_id', sheetId)
      .eq('user_id', userId)
      .gt('section_order', deletedOrder)
      .order('section_order', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch sections for reordering: ${error.message}`)
    }

    if (!sectionsToReorder || sectionsToReorder.length === 0) {
      return // No sections to reorder
    }

    // Update each section's order to fill the gap
    const updatePromises = sectionsToReorder.map((section, index) => {
      const newOrder = deletedOrder + index
      return this.supabase
        .from('lyric_sheet_sections')
        .update({ section_order: newOrder })
        .eq('id', section.id)
    })

    await Promise.all(updatePromises)
  }

  /**
   * Update the total_sections count in a lyric sheet
   * @param sheetId - ID of the lyric sheet
   * @param userId - ID of the user (for security)
   */
  private async updateSectionCount(sheetId: string, userId: string) {
    const { count, error } = await this.supabase
      .from('lyric_sheet_sections')
      .select('*', { count: 'exact', head: true })
      .eq('lyric_sheet_id', sheetId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to count sections: ${error.message}`)
    }

    const { error: updateError } = await this.supabase
      .from('lyric_sheets')
      .update({ total_sections: count || 0 })
      .eq('id', sheetId)
      .eq('user_id', userId)

    if (updateError) {
      throw new Error(`Failed to update section count: ${updateError.message}`)
    }
  }

  /**
   * Get a specific lyric sheet by ID (for validation purposes)
   * @param sheetId - ID of the lyric sheet
   * @param userId - ID of the user (for security)
   * @returns Lyric sheet data
   */
  async getLyricSheetById(sheetId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('lyric_sheets')
      .select('*')
      .eq('id', sheetId)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch lyric sheet: ${error.message}`)
    }

    return data
  }
}
