/**
 * Releases Routes - HTTP handlers for music release management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ReleasesService } from '../services/releasesService.js'
import { CreateReleaseSchema } from '../types/schemas.js'
import { CreateSongSchema } from './songs.js'
import type { Bindings, Variables } from '../types/bindings.js'

const releases = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/releases - Get all releases
releases.get('/', async (c) => {
  try {
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const data = await releasesService.getAllReleases(user.id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching releases:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch releases' 
    }, 500)
  }
})

// GET /api/releases/:id - Get release by ID with tasks and songs
releases.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    console.log('Releases: Fetching release details for ID:', id)
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    // Get release details (user-scoped)
    const release = await releasesService.getReleaseById(id, user.id)
    
    if (!release) {
      console.log('Releases: No release found with ID:', id)
      return c.json({ 
        success: false, 
        error: 'Release not found' 
      }, 404)
    }
    
    // Get release tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('release_tasks')
      .select('*')
      .eq('release_id', id)
      .order('task_order', { ascending: true })
    
    if (tasksError) {
      console.error('Releases: Database error fetching tasks:', tasksError)
      // Don't fail the request if tasks can't be fetched
    }
    
    // If no tasks exist, try to generate them automatically
    if (!tasks || tasks.length === 0) {
      try {
        console.log('Releases: No tasks found, generating tasks for release:', id)
        await releasesService.generateTasksForExistingRelease(id, user.id)
        
        // Refetch tasks after generation
        const { data: newTasks } = await supabase
          .from('release_tasks')
          .select('*')
          .eq('release_id', id)
          .order('task_order', { ascending: true })
        
        console.log('Releases: Tasks generated successfully, count:', newTasks?.length || 0)
        
        const releaseWithDetails = {
          ...release,
          release_tasks: newTasks || [],
          songs: []
        }
        
        return c.json({ success: true, data: releaseWithDetails })
      } catch (taskError) {
        console.warn('Releases: Failed to generate tasks:', taskError)
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
      console.error('Releases: Database error fetching songs:', songsError)
      // Don't fail the request if songs can't be fetched
    }
    
    const releaseWithDetails = {
      ...release,
      release_tasks: tasks || [],
      songs: songs || []
    }
    
    console.log('Releases: Release details fetched successfully')
    return c.json({ success: true, data: releaseWithDetails })
  } catch (error) {
    console.error('Releases: Error fetching release:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch release' 
    }, 500)
  }
})

// POST /api/releases - Create new release
releases.post('/', zValidator('json', CreateReleaseSchema), async (c) => {
  try {
    const releaseData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    // Ensure the release is created for the authenticated user
    const validatedReleaseData = {
      ...releaseData,
      user_id: user.id
    }
    
    // Phase 1 Diagnostic Logging
    console.log('=== RELEASE CREATION DEBUG START ===')
    console.log('1. Request Data:', JSON.stringify(validatedReleaseData, null, 2))
    console.log('2. User Context:', user ? { id: user.id, email: user.email } : 'NO USER CONTEXT')
    console.log('3. Supabase Client Type:', supabase ? 'AVAILABLE' : 'MISSING')
    
    const data = await releasesService.createRelease(validatedReleaseData)
    
    console.log('4. Release Created Successfully:', { id: data.id, title: data.title })
    console.log('=== RELEASE CREATION DEBUG END ===')
    
    return c.json({ success: true, data }, 201)
  } catch (error) {
    console.error('=== RELEASE CREATION ERROR ===')
    console.error('Error Type:', error?.constructor?.name)
    console.error('Error Message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('=== END ERROR LOG ===')
    
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create release' 
    }, 500)
  }
})

// PUT /api/releases/:id - Update release
releases.put('/:id', zValidator('json', CreateReleaseSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id')
    const releaseData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const data = await releasesService.updateRelease(id, releaseData, user.id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error updating release:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update release' 
    }, 500)
  }
})

// PATCH /api/releases/:id - Partial update release
releases.patch('/:id', zValidator('json', CreateReleaseSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id')
    const releaseData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const data = await releasesService.updateRelease(id, releaseData, user.id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error updating release:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update release' 
    }, 500)
  }
})

// DELETE /api/releases/:id - Delete release
releases.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const data = await releasesService.deleteRelease(id, user.id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error deleting release:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete release' 
    }, 500)
  }
})

// POST /api/releases/:releaseId/generate-tasks - Generate tasks for existing release
releases.post('/:releaseId/generate-tasks', async (c) => {
  try {
    const releaseId = c.req.param('releaseId')
    const supabase = c.get('supabase')
    const user = c.get('user')
    const releasesService = new ReleasesService(supabase)
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    const result = await releasesService.generateTasksForExistingRelease(releaseId, user.id)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Error generating tasks for release:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate tasks' 
    }, 500)
  }
})

// POST /api/releases/:releaseId/songs - Add song to release
releases.post('/:releaseId/songs', zValidator('json', CreateSongSchema), async (c) => {
  try {
    const releaseId = c.req.param('releaseId')
    const songData = c.req.valid('json')
    const supabase = c.get('supabase')
    const user = c.get('user')
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401)
    }
    
    console.log('Releases: Adding song to release', releaseId, 'data:', songData)
    
    // Verify the release belongs to the authenticated user
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select('user_id')
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .single()
    
    if (releaseError || !release) {
      console.error('Releases: Release not found or access denied:', releaseError)
      throw new Error(`Release not found or access denied`)
    }
    
    const { data, error } = await supabase
      .from('songs')
      .insert({
        ...songData,
        release_id: releaseId,
        user_id: user.id // Use user_id for direct user association
      })
      .select()
      .single()
    
    if (error) {
      console.error('Releases: Database error creating song:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('Releases: Song created successfully')
    return c.json({ success: true, data }, 201)
  } catch (error) {
    console.error('Releases: Error creating song:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create song' 
    }, 500)
  }
})

export default releases
