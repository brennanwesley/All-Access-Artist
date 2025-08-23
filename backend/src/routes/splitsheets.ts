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
    const songId = c.req.param('songId')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    console.log('SplitSheet: Getting split sheet for song', songId, 'user', user.id)
    
    const { data, error } = await supabase
      .from('split_sheets')
      .select('*')
      .eq('user_id', user.id)
      .eq('song_title', songId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('SplitSheet: Database error getting split sheet:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    if (!data) {
      console.log('SplitSheet: No split sheet found for song')
      return c.json({ success: true, data: null })
    }
    
    console.log('SplitSheet: Split sheet retrieved successfully')
    return c.json({ success: true, data })
  } catch (error) {
    console.error('SplitSheet: Error getting split sheet:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get split sheet' 
    }, 500)
  }
})

// PUT /api/splitsheets/song/:songId - Create or update split sheet for a song
splitsheets.put('/song/:songId', zValidator('json', UpdateSplitSheetSchema), async (c) => {
  try {
    const songId = c.req.param('songId')
    const splitSheetData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    console.log('SplitSheet: Upserting split sheet for song', songId, 'user', user.id, 'data:', splitSheetData)
    
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
    
    // Check if split sheet already exists
    const { data: existingData } = await supabase
      .from('split_sheets')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_title', songId)
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
          song_title: songId,
          ...splitSheetData
        })
        .select()
        .single()
      
      result = { data, error }
    }
    
    if (result.error) {
      console.error('SplitSheet: Database error upserting split sheet:', result.error)
      throw new Error(`Database error: ${result.error.message}`)
    }
    
    console.log('SplitSheet: Split sheet upserted successfully')
    return c.json({ success: true, data: result.data })
  } catch (error) {
    console.error('SplitSheet: Error upserting split sheet:', error)
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
    
    console.log('SplitSheet: Deleting split sheet for song', songId, 'user', user.id)
    
    const { error } = await supabase
      .from('split_sheets')
      .delete()
      .eq('user_id', user.id)
      .eq('song_title', songId)
    
    if (error) {
      console.error('SplitSheet: Database error deleting split sheet:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('SplitSheet: Split sheet deleted successfully')
    return c.json({ success: true, message: 'Split sheet deleted successfully' })
  } catch (error) {
    console.error('SplitSheet: Error deleting split sheet:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete split sheet' 
    }, 500)
  }
})

export default splitsheets
