/**
 * Label Copy Routes - HTTP handlers for Label Copy management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CreateLabelCopySchema, UpdateLabelCopySchema } from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'

const labelcopy = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// PUT /api/labelcopy/:releaseId - Create or update label copy
labelcopy.put('/:releaseId', async (c) => {
  try {
    const releaseId = c.req.param('releaseId')
    const rawData = await c.req.json()
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    // Transform payload format to current schema format (handles both legacy and new formats)
    const transformedData = {
      version_subtitle: rawData.version_subtitle || rawData.versionSubtitle,
      phonogram_copyright: rawData.phonogram_copyright || rawData.phonogramCopyright,
      composition_copyright: rawData.composition_copyright || rawData.compositionCopyright,
      sub_genre: rawData.sub_genre || rawData.subGenre,
      territories: rawData.territories || [],
      explicit_content: rawData.explicit_content ?? rawData.explicitContent ?? false,
      language_lyrics: rawData.language_lyrics || rawData.languageLyrics || 'en',
      upc_code: rawData.upc_code || rawData.upc,
      copyright_year: rawData.copyright_year || (rawData.copyright ? parseInt(rawData.copyright) : undefined),
      tracks_metadata: rawData.tracks_metadata || []
    }
    
    // Validate the transformed data
    const validationResult = UpdateLabelCopySchema.safeParse(transformedData)
    if (!validationResult.success) {
      return c.json({ 
        success: false, 
        error: 'Invalid data format',
        details: validationResult.error.issues 
      }, 400)
    }
    
    const labelCopyData = validationResult.data
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    // Upsert label copy data (create or update)
    const { data, error } = await supabase
      .from('label_copy')
      .upsert({
        release_id: releaseId,
        user_id: user.id,
        ...labelCopyData
      }, {
        onConflict: 'release_id'
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save label copy' 
    }, 500)
  }
})

// GET /api/labelcopy/:releaseId - Get label copy for a release
labelcopy.get('/:releaseId', async (c) => {
  try {
    const releaseId = c.req.param('releaseId')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const { data, error } = await supabase
      .from('label_copy')
      .select('*')
      .eq('release_id', releaseId)
      .eq('user_id', user.id)
      .single()
    
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
      error: error instanceof Error ? error.message : 'Failed to get label copy' 
    }, 500)
  }
})

// DELETE /api/labelcopy/:releaseId - Delete label copy
labelcopy.delete('/:releaseId', async (c) => {
  try {
    const releaseId = c.req.param('releaseId')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const { error } = await supabase
      .from('label_copy')
      .delete()
      .eq('release_id', releaseId)
      .eq('user_id', user.id)
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({ success: true, message: 'Label copy deleted successfully' })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete label copy' 
    }, 500)
  }
})

export default labelcopy
