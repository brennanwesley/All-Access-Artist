/**
 * Songs Routes - HTTP handlers for song management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CreateSongSchema, UpdateSongSchema } from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'

const songs = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// PATCH /api/songs/:songId - Update song
songs.patch('/:songId', zValidator('json', UpdateSongSchema), async (c) => {
  try {
    const songId = c.req.param('songId')
    const songData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const { data, error } = await supabase
      .from('songs')
      .update(songData)
      .eq('id', songId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update song' 
    }, 500)
  }
})

// DELETE /api/songs/:songId - Delete song
songs.delete('/:songId', async (c) => {
  try {
    const songId = c.req.param('songId')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
      .eq('user_id', user.id)
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({ success: true, message: 'Song deleted successfully' })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete song' 
    }, 500)
  }
})

export default songs
