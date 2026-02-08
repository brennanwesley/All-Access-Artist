/**
 * Split Sheet Routes - HTTP handlers for Split Sheet management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CreateSplitSheetSchema, UpdateSplitSheetSchema } from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'

const splitsheets = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/splitsheets/song/:songId - Get split sheet for a song
splitsheets.get('/song/:songId', async (c) => {
  try {
    const supabase = c.get('supabase')
    const user = c.get('user')
    const { songId } = c.req.param()
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    // First, get the song title from the songs table using the songId
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .select('song_title')
      .eq('id', songId)
      .single()
    
    if (songError) {
      return c.json({ success: false, error: 'Song not found' }, 404)
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
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get split sheet' 
    }, 500)
  }
})

// PUT /api/splitsheets/song/:songId - Create or update split sheet for a song
splitsheets.put('/song/:songId', async (c) => {
  try {
    const songId = c.req.param('songId')
    const rawData = await c.req.json()
    
    // Manual validation with detailed error reporting
    const validationResult = UpdateSplitSheetSchema.safeParse(rawData)
    if (!validationResult.success) {
      return c.json({ 
        success: false, 
        error: 'Validation failed', 
        details: validationResult.error.issues 
      }, 400)
    }
    
    const splitSheetData = validationResult.data
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    // Validate percentage totals (application-level validation)
    if (splitSheetData.contributors) {
      const writerTotal = splitSheetData.contributors.reduce((sum, contributor) => {
        return sum + (contributor.writer_share_percent || 0)
      }, 0)
      
      const publisherTotal = splitSheetData.contributors.reduce((sum, contributor) => {
        return sum + (contributor.publisher_share_percent || 0)
      }, 0)
      
      if (Math.abs(writerTotal - 100) > 0.01) {
        return c.json({ 
          success: false, 
          error: `Writer shares must total 100%. Current total: ${writerTotal}%` 
        }, 400)
      }
      
      if (Math.abs(publisherTotal - 100) > 0.01) {
        return c.json({ 
          success: false, 
          error: `Publisher shares must total 100%. Current total: ${publisherTotal}%` 
        }, 400)
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
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save split sheet' 
    }, 500)
  }
})

// DELETE /api/splitsheets/song/:songId - Delete split sheet for a song
splitsheets.delete('/song/:songId', async (c) => {
  try {
    const songId = c.req.param('songId')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    // First get the song title from the songs table
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .select('song_title')
      .eq('id', songId)
      .single()
    
    if (songError) {
      return c.json({ success: false, error: 'Song not found' }, 404)
    }

    const { error } = await supabase
      .from('split_sheets')
      .delete()
      .eq('user_id', user.id)
      .eq('song_title', songData.song_title)
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({ success: true, message: 'Split sheet deleted successfully' })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete split sheet' 
    }, 500)
  }
})

export default splitsheets
