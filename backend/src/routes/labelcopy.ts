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
    
    // Transform legacy payload format to current schema format
    const transformedData = {
      version_subtitle: rawData.versionSubtitle || rawData.version_subtitle,
      phonogram_copyright: rawData.phonogramCopyright || rawData.phonogram_copyright,
      composition_copyright: rawData.compositionCopyright || rawData.composition_copyright,
      sub_genre: rawData.subGenre || rawData.sub_genre,
      territories: Array.isArray(rawData.territories) 
        ? rawData.territories 
        : (typeof rawData.territories === 'string' 
          ? rawData.territories.split(',').map(t => t.trim()) 
          : []),
      explicit_content: rawData.explicitContent ?? rawData.explicit_content ?? false,
      language_lyrics: rawData.languageLyrics || rawData.language_lyrics || 'en',
      upc_code: rawData.upc || rawData.upc_code,
      copyright_year: rawData.copyright ? parseInt(rawData.copyright) : rawData.copyright_year,
      tracks_metadata: rawData.tracks_metadata || []
    }
    
    // Validate the transformed data
    const validationResult = UpdateLabelCopySchema.safeParse(transformedData)
    if (!validationResult.success) {
      console.error('LabelCopy: Validation failed:', validationResult.error)
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
    
    console.log('LabelCopy: Upserting label copy for release', releaseId, 'user', user.id, 'data:', labelCopyData)
    
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
      console.error('LabelCopy: Database error upserting label copy:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('LabelCopy: Label copy upserted successfully')
    return c.json({ success: true, data })
  } catch (error) {
    console.error('LabelCopy: Error upserting label copy:', error)
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
    
    console.log('LabelCopy: Getting label copy for release', releaseId, 'user', user.id)
    
    const { data, error } = await supabase
      .from('label_copy')
      .select('*')
      .eq('release_id', releaseId)
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('LabelCopy: Database error getting label copy:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    if (!data) {
      console.log('LabelCopy: No label copy found for release')
      return c.json({ success: true, data: null })
    }
    
    console.log('LabelCopy: Label copy retrieved successfully')
    return c.json({ success: true, data })
  } catch (error) {
    console.error('LabelCopy: Error getting label copy:', error)
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
    
    console.log('LabelCopy: Deleting label copy for release', releaseId, 'user', user.id)
    
    const { error } = await supabase
      .from('label_copy')
      .delete()
      .eq('release_id', releaseId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('LabelCopy: Database error deleting label copy:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('LabelCopy: Label copy deleted successfully')
    return c.json({ success: true, message: 'Label copy deleted successfully' })
  } catch (error) {
    console.error('LabelCopy: Error deleting label copy:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete label copy' 
    }, 500)
  }
})

export default labelcopy
