/**
 * Label Copy Routes - HTTP handlers for Label Copy management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { ReleaseIdParamSchema, UpdateLabelCopySchema } from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { validateRequest } from '../middleware/validation.js'
import { authErrorResponse, errorResponse } from '../utils/apiResponse.js'

const labelcopy = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// PUT /api/labelcopy/:releaseId - Create or update label copy
labelcopy.put(
  '/:releaseId',
  validateRequest('param', ReleaseIdParamSchema),
  validateRequest('json', UpdateLabelCopySchema),
  async (c) => {
  try {
    const { releaseId } = c.req.valid('param')
    const labelCopyData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
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
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to save label copy',
      'LABEL_COPY_SAVE_FAILED'
    )
  }
})

// GET /api/labelcopy/:releaseId - Get label copy for a release
labelcopy.get('/:releaseId', validateRequest('param', ReleaseIdParamSchema), async (c) => {
  try {
    const { releaseId } = c.req.valid('param')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
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
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to get label copy',
      'LABEL_COPY_FETCH_FAILED'
    )
  }
})

// DELETE /api/labelcopy/:releaseId - Delete label copy
labelcopy.delete('/:releaseId', validateRequest('param', ReleaseIdParamSchema), async (c) => {
  try {
    const { releaseId } = c.req.valid('param')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    const { error } = await supabase
      .from('label_copy')
      .delete()
      .eq('release_id', releaseId)
      .eq('user_id', user.id)
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    return c.json({ success: true, data: { message: 'Label copy deleted successfully' } })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to delete label copy',
      'LABEL_COPY_DELETE_FAILED'
    )
  }
})

export default labelcopy
