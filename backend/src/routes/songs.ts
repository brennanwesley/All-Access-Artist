/**
 * Songs Routes - HTTP handlers for song management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { SongIdParamSchema, UpdateSongSchema } from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { validateRequest } from '../middleware/validation.js'
import { authErrorResponse, errorResponse } from '../utils/apiResponse.js'

const songs = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// PATCH /api/songs/:songId - Update song
songs.patch(
  '/:songId',
  validateRequest('param', SongIdParamSchema),
  validateRequest('json', UpdateSongSchema),
  async (c) => {
  try {
    const { songId } = c.req.valid('param')
    const songData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
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
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to update song',
      'SONG_UPDATE_FAILED'
    )
  }
})

// DELETE /api/songs/:songId - Delete song
songs.delete('/:songId', validateRequest('param', SongIdParamSchema), async (c) => {
  try {
    const { songId } = c.req.valid('param')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
      .eq('user_id', user.id)
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({ success: true, data: { message: 'Song deleted successfully' } })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to delete song',
      'SONG_DELETE_FAILED'
    )
  }
})

export default songs
