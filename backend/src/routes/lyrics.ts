/**
 * Lyric Sheet Routes - API endpoints for lyric sheet and section management routes
// Updated for unified navigation system deployment trigger
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { z } from 'zod'
import type { Bindings, Variables } from '../types/bindings.js'
import { LyricSheetService } from '../services/LyricSheetService.js'
import { SectionIdParamSchema, SongIdParamSchema } from '../types/schemas.js'
import { validateRequest } from '../middleware/validation.js'
import { authErrorResponse, errorResponse } from '../utils/apiResponse.js'

const lyrics = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Schemas for lyric sheet operations
const CreateLyricSheetSchema = z.object({
  written_by: z.string().optional(),
  additional_notes: z.string().optional()
})

const CreateLyricSectionSchema = z.object({
  section_type: z.enum(['verse', 'chorus', 'pre-chorus', 'bridge', 'refrain', 'outro', 'intro', 'hook', 'ad-lib']),
  content: z.string().min(1, 'Content is required')
})

const UpdateLyricSectionSchema = z.object({
  section_type: z.enum(['verse', 'chorus', 'pre-chorus', 'bridge', 'refrain', 'outro', 'intro', 'hook', 'ad-lib']).optional(),
  section_order: z.number().int().min(0).optional(),
  content: z.string().min(1, 'Content is required').optional()
})

interface LyricSheetSectionRecord {
  id: string
  section_type: string
  section_lyrics: string
  section_order: number
  created_at: string
  updated_at: string
}

// GET /api/lyrics/:songId - Get lyric sheet for a song
lyrics.get('/:songId', validateRequest('param', SongIdParamSchema), async (c) => {
  try {
    const { songId } = c.req.valid('param')
    const supabase = c.get('supabase')
    const user = c.get('jwtPayload')
    
    if (!user?.sub) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // Get lyric sheet with sections (filtered by user_id)
    const { data: lyricSheet, error: sheetError } = await supabase
      .from('lyric_sheets')
      .select('*')
      .eq('song_id', songId)
      .eq('user_id', user.sub)
      .single()
    
    if (sheetError) {
      if (sheetError.code === 'PGRST116') { // No rows returned
        return errorResponse(c, 404, 'No lyric sheet found for this song', 'LYRIC_SHEET_NOT_FOUND')
      }
      throw new Error(`Database error: ${sheetError.message}`)
    }
    
    // Get sections for this lyric sheet (filtered by user_id)
    const { data: sections, error: sectionsError } = await supabase
      .from('lyric_sheet_sections')
      .select('*')
      .eq('lyric_sheet_id', lyricSheet.id)
      .eq('user_id', user.sub)
      .order('section_order', { ascending: true })
    
    if (sectionsError) {
      // Don't fail the request if sections can't be fetched
    }
    
    // Map sections to frontend format
    const mappedSections = (sections as LyricSheetSectionRecord[] | null)?.map((section) => ({
      id: section.id,
      section_type: section.section_type,
      content: section.section_lyrics,
      section_order: section.section_order,
      created_at: section.created_at,
      updated_at: section.updated_at
    }))

    const lyricSheetWithSections = {
      ...lyricSheet,
      sections: mappedSections || []
    }
    
    return c.json({
      success: true,
      data: lyricSheetWithSections
    })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch lyric sheet',
      'LYRIC_SHEET_FETCH_FAILED'
    )
  }
})

// POST /api/lyrics/:songId - Create new lyric sheet for a song
lyrics.post(
  '/:songId',
  validateRequest('param', SongIdParamSchema),
  validateRequest('json', CreateLyricSheetSchema),
  async (c) => {
  try {
    const { songId } = c.req.valid('param')
    const lyricSheetData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('jwtPayload')

    if (!user?.sub) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // Get song details to verify user ownership
    const { data: song, error: songError } = await supabase
      .from('songs')
      .select('user_id')
      .eq('id', songId)
      .eq('user_id', user.sub)
      .single()
    
    if (songError) {
      throw new Error(`Song not found: ${songError.message}`)
    }
    
    const { data, error } = await supabase
      .from('lyric_sheets')
      .insert({
        ...lyricSheetData,
        song_id: songId,
        user_id: user.sub // Include user_id for security
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({
      success: true,
      data: { ...data, sections: [] } // Include empty sections array
    }, 201)
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to create lyric sheet',
      'LYRIC_SHEET_CREATE_FAILED'
    )
  }
})

// POST /api/lyrics/:songId/sections - Add section to lyric sheet
lyrics.post(
  '/:songId/sections',
  validateRequest('param', SongIdParamSchema),
  validateRequest('json', CreateLyricSectionSchema),
  async (c) => {
  try {
    const { songId } = c.req.valid('param')
    const sectionData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('jwtPayload')
    
    if (!user?.sub) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // Get lyric sheet ID for this song (filtered by user_id)
    const { data: lyricSheet, error: sheetError } = await supabase
      .from('lyric_sheets')
      .select('id')
      .eq('song_id', songId)
      .eq('user_id', user.sub)
      .single()
    
    if (sheetError) {
      throw new Error(`Lyric sheet not found: ${sheetError.message}`)
    }
    
    // Let LyricSheetService handle section_order calculation
    const lyricSheetService = new LyricSheetService(supabase)
    const result = await lyricSheetService.addSectionToSheet(lyricSheet.id, user.sub, sectionData)
    
    // Map database response back to frontend format
    const mappedData = {
      id: result.id,
      section_type: result.section_type,
      content: result.section_lyrics,
      section_order: result.section_order,
      created_at: result.created_at,
      updated_at: result.updated_at
    }

    return c.json({
      success: true,
      data: mappedData
    }, 201)
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to create section',
      'LYRIC_SECTION_CREATE_FAILED'
    )
  }
})

// PATCH /api/lyrics/sections/:sectionId - Update section
lyrics.patch(
  '/sections/:sectionId',
  validateRequest('param', SectionIdParamSchema),
  validateRequest('json', UpdateLyricSectionSchema),
  async (c) => {
  try {
    const { sectionId } = c.req.valid('param')
    const updateData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('jwtPayload')
    
    if (!user?.sub) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // Map frontend fields to database fields
    const dbUpdateData: Record<string, string | number> = {}
    if (updateData.section_type) dbUpdateData.section_type = updateData.section_type
    if (updateData.content) dbUpdateData.section_lyrics = updateData.content
    if (updateData.section_order !== undefined) dbUpdateData.section_order = updateData.section_order

    const { data, error } = await supabase
      .from('lyric_sheet_sections')
      .update(dbUpdateData)
      .eq('id', sectionId)
      .eq('user_id', user.sub)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    // Map database response back to frontend format
    const mappedData = {
      id: data.id,
      section_type: data.section_type,
      content: data.section_lyrics,
      section_order: data.section_order,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return c.json({
      success: true,
      data: mappedData
    })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to update section',
      'LYRIC_SECTION_UPDATE_FAILED'
    )
  }
})

// DELETE /api/lyrics/sections/:sectionId - Delete section
lyrics.delete('/sections/:sectionId', validateRequest('param', SectionIdParamSchema), async (c) => {
  try {
    const { sectionId } = c.req.valid('param')
    const supabase = c.get('supabase')
    const user = c.get('jwtPayload')
    
    if (!user?.sub) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    const { error } = await supabase
      .from('lyric_sheet_sections')
      .delete()
      .eq('id', sectionId)
      .eq('user_id', user.sub)
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({
      success: true,
      data: { message: 'Section deleted successfully' }
    })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to delete section',
      'LYRIC_SECTION_DELETE_FAILED'
    )
  }
})

export default lyrics
