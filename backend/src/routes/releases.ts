/**
 * Releases Routes - HTTP handlers for music release management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { ReleasesService } from '../services/releasesService.js'
import {
  CreateReleaseSchema,
  CreateSongSchema,
  IdParamSchema,
  ReleaseIdParamSchema,
} from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { validateRequest } from '../middleware/validation.js'
import { authErrorResponse, errorResponse } from '../utils/apiResponse.js'

const releases = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/releases - Get all releases
releases.get('/', async (c) => {
  try {
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    const data = await releasesService.getAllReleases(user.id)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch releases',
      'RELEASE_LIST_FAILED'
    )
  }
})

// GET /api/releases/:id - Get release by ID with tasks and songs
releases.get('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // Get release details (user-scoped)
    const release = await releasesService.getReleaseById(id, user.id)
    
    if (!release) {
      return errorResponse(c, 404, 'Release not found', 'RELEASE_NOT_FOUND')
    }
    
    // Get release tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('release_tasks')
      .select('*')
      .eq('release_id', id)
      .order('task_order', { ascending: true })
    
    if (tasksError) {
      // Don't fail the request if tasks can't be fetched
    }
    
    // If no tasks exist, try to generate them automatically
    if (!tasks || tasks.length === 0) {
      try {
        await releasesService.generateTasksForExistingRelease(id, user.id)
        
        // Refetch tasks after generation
        const { data: newTasks } = await supabase
          .from('release_tasks')
          .select('*')
          .eq('release_id', id)
          .order('task_order', { ascending: true })
        
        const releaseWithDetails = {
          ...release,
          release_tasks: newTasks || [],
          songs: []
        }
        
        return c.json({ success: true, data: releaseWithDetails })
      } catch (_taskError) {
        // Continue with empty tasks if generation fails
      }
    }
    
    // Get songs
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('*')
      .eq('release_id', id)
      .order('track_number', { ascending: true })
    
    if (songsError) {
      // Don't fail the request if songs can't be fetched
    }
    
    const releaseWithDetails = {
      ...release,
      release_tasks: tasks || [],
      songs: songs || []
    }
    
    return c.json({ success: true, data: releaseWithDetails })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch release',
      'RELEASE_FETCH_FAILED'
    )
  }
})

// POST /api/releases - Create new release
releases.post('/', validateRequest('json', CreateReleaseSchema), async (c) => {
  try {
    const releaseData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // Ensure the release is created for the authenticated user
    const validatedReleaseData = {
      ...releaseData,
      user_id: user.id
    }
    
    const data = await releasesService.createRelease(validatedReleaseData)
    return c.json({ success: true, data }, 201)
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to create release',
      'RELEASE_CREATE_FAILED'
    )
  }
})

// PUT /api/releases/:id - Update release
releases.put(
  '/:id',
  validateRequest('param', IdParamSchema),
  validateRequest('json', CreateReleaseSchema.partial()),
  async (c) => {
  try {
    const { id } = c.req.valid('param')
    const releaseData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    const data = await releasesService.updateRelease(id, releaseData, user.id)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to update release',
      'RELEASE_UPDATE_FAILED'
    )
  }
})

// PATCH /api/releases/:id - Partial update release
releases.patch(
  '/:id',
  validateRequest('param', IdParamSchema),
  validateRequest('json', CreateReleaseSchema.partial()),
  async (c) => {
  try {
    const { id } = c.req.valid('param')
    const releaseData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    const data = await releasesService.updateRelease(id, releaseData, user.id)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to update release',
      'RELEASE_PATCH_FAILED'
    )
  }
})

// DELETE /api/releases/:id - Delete release
releases.delete('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    const data = await releasesService.deleteRelease(id, user.id)
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to delete release',
      'RELEASE_DELETE_FAILED'
    )
  }
})

// POST /api/releases/:releaseId/generate-tasks - Generate tasks for existing release
releases.post(
  '/:releaseId/generate-tasks',
  validateRequest('param', ReleaseIdParamSchema),
  async (c) => {
  try {
    const { releaseId } = c.req.valid('param')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    const result = await releasesService.generateTasksForExistingRelease(releaseId, user.id)
    return c.json({ success: true, data: result })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to generate tasks',
      'TASK_GENERATION_FAILED'
    )
  }
})

// POST /api/releases/:releaseId/songs - Add song to release
releases.post(
  '/:releaseId/songs',
  validateRequest('param', ReleaseIdParamSchema),
  validateRequest('json', CreateSongSchema),
  async (c) => {
  try {
    const { releaseId } = c.req.valid('param')
    const songData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return authErrorResponse(c, 'User not authenticated')
    }
    
    // Verify the release belongs to the authenticated user
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select('user_id')
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .single()
    
    if (releaseError || !release) {
      return errorResponse(c, 404, 'Release not found or access denied', 'RELEASE_NOT_FOUND')
    }
    
    // Prepare song data with release_id from URL parameter
    const songPayload = {
      ...songData,
      release_id: releaseId,
      user_id: user.id
    }
    
    const { data, error } = await supabase
      .from('songs')
      .insert(songPayload)
      .select()
      .single()
    
    if (error) {
      return errorResponse(c, 400, `Database error: ${error.message}`, 'SONG_CREATE_FAILED')
    }
    
    return c.json({ success: true, data }, 201)
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to create song',
      'SONG_CREATE_FAILED'
    )
  }
})

export default releases
