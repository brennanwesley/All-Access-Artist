/**
 * Songs Routes - HTTP handlers for song management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Bindings, Variables } from '../types/bindings.js'

const songs = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Schema for creating a new song
const CreateSongSchema = z.object({
  song_title: z.string().min(1, 'Song title is required'),
  track_number: z.number().int().positive(),
  duration_seconds: z.number().int().positive().optional()
})

// Schema for updating a song
const UpdateSongSchema = z.object({
  song_title: z.string().min(1, 'Song title is required').optional(),
  track_number: z.number().int().positive().optional(),
  duration_seconds: z.number().int().positive().optional()
})

// PATCH /api/songs/:songId - Update song
songs.patch('/:songId', zValidator('json', UpdateSongSchema), async (c) => {
  try {
    const songId = c.req.param('songId')
    const songData = c.req.valid('json')
    const supabase = c.get('supabase')
    
    console.log('Songs: Updating song', songId, 'data:', songData)
    
    const { data, error } = await supabase
      .from('songs')
      .update(songData)
      .eq('id', songId)
      .select()
      .single()
    
    if (error) {
      console.error('Songs: Database error updating song:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('Songs: Song updated successfully')
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Songs: Error updating song:', error)
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
    
    console.log('Songs: Deleting song', songId)
    
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
    
    if (error) {
      console.error('Songs: Database error deleting song:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('Songs: Song deleted successfully')
    return c.json({ success: true, message: 'Song deleted successfully' })
  } catch (error) {
    console.error('Songs: Error deleting song:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete song' 
    }, 500)
  }
})

export { CreateSongSchema }
export default songs
