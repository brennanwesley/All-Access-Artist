/**
 * Split Sheet Routes - HTTP handlers for Split Sheet management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import {
  SongIdParamSchema,
  UpdateSplitSheetSchema,
  type UpdateSplitSheetData,
} from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { validateRequest } from '../middleware/validation.js'
import { authErrorResponse, errorResponse } from '../utils/apiResponse.js'

const splitsheets = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/splitsheets/song/:songId - Get split sheet for a song
splitsheets.get('/song/:songId', validateRequest('param', SongIdParamSchema), async (c) => {
  try {
    const supabase = c.get('supabase')
    const user = c.get('user')
    const { songId } = c.req.valid('param')
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // First, get the song title from the songs table using the songId
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .select('song_title')
      .eq('id', songId)
      .single()
    
    if (songError) {
      return errorResponse(c, 404, 'Song not found', 'SONG_NOT_FOUND')
    }
    
    // Now query split_sheets using the actual song title
    // Use order by updated_at desc and limit 1 to get the most recent record
    // This handles cases where duplicate records exist
    const { data, error } = await supabase
      .from('split_sheets')
      .select('*')
      .eq('user_id', user.id)
      .eq('song_title', songData.song_title)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Database error: ${error.message}`)
    }
    
    if (!data) {
      return c.json({ success: true, data: null })
    }
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to get split sheet',
      'SPLIT_SHEET_FETCH_FAILED'
    )
  }
})

// PUT /api/splitsheets/song/:songId - Create or update split sheet for a song
splitsheets.put(
  '/song/:songId',
  validateRequest('param', SongIdParamSchema),
  validateRequest('json', UpdateSplitSheetSchema),
  async (c) => {
  try {
    c.req.valid('param')
    const splitSheetData: UpdateSplitSheetData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // Validate percentage totals (application-level validation)
    if (splitSheetData.contributors) {
      const writerTotal = splitSheetData.contributors.reduce((sum: number, contributor) => {
        return sum + (contributor.writer_share_percent || 0)
      }, 0)
      
      const publisherTotal = splitSheetData.contributors.reduce((sum: number, contributor) => {
        return sum + (contributor.publisher_share_percent || 0)
      }, 0)
      
      if (Math.abs(writerTotal - 100) > 0.01) {
        return errorResponse(
          c,
          400,
          `Writer shares must total 100%. Current total: ${writerTotal}%`,
          'SPLIT_SHEET_INVALID_WRITER_TOTAL'
        )
      }
      
      if (Math.abs(publisherTotal - 100) > 0.01) {
        return errorResponse(
          c,
          400,
          `Publisher shares must total 100%. Current total: ${publisherTotal}%`,
          'SPLIT_SHEET_INVALID_PUBLISHER_TOTAL'
        )
      }
    }
    
    // Check if split sheet already exists using the actual song title
    const { data: existingData } = await supabase
      .from('split_sheets')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_title', splitSheetData.song_title)
      .single()
    
    let result
    if (existingData) {
      // Update existing split sheet
      const { data, error } = await supabase
        .from('split_sheets')
        .update({
          ...splitSheetData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .eq('user_id', user.id)
        .select()
        .single()
      
      result = { data, error }
    } else {
      // Create new split sheet
      const { data, error } = await supabase
        .from('split_sheets')
        .insert({
          user_id: user.id,
          song_title: splitSheetData.song_title,
          ...splitSheetData
        })
        .select()
        .single()
      
      result = { data, error }
    }
    
    if (result.error) {
      throw new Error(`Database error: ${result.error.message}`)
    }
    
    return c.json({ success: true, data: result.data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to save split sheet',
      'SPLIT_SHEET_SAVE_FAILED'
    )
  }
})

// DELETE /api/splitsheets/song/:songId - Delete split sheet for a song
splitsheets.delete('/song/:songId', validateRequest('param', SongIdParamSchema), async (c) => {
  try {
    const { songId } = c.req.valid('param')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // First get the song title from the songs table
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .select('song_title')
      .eq('id', songId)
      .single()
    
    if (songError) {
      return errorResponse(c, 404, 'Song not found', 'SONG_NOT_FOUND')
    }

    const { error } = await supabase
      .from('split_sheets')
      .delete()
      .eq('user_id', user.id)
      .eq('song_title', songData.song_title)
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({ success: true, data: { message: 'Split sheet deleted successfully' } })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to delete split sheet',
      'SPLIT_SHEET_DELETE_FAILED'
    )
  }
})

export default splitsheets
