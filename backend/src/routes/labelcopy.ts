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
labelcopy.put('/:releaseId', zValidator('json', UpdateLabelCopySchema), async (c) => {
  try {
    const releaseId = c.req.param('releaseId')
    const labelCopyData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
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
