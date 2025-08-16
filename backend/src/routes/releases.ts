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
    const releasesService = new ReleasesService(supabase)
    
    const data = await releasesService.getAllReleases()
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
    
    console.log('Releases: Fetching release details for ID:', id)
    
    // Get release details
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select('*')
      .eq('id', id)
      .single()
    
    if (releaseError) {
      console.error('Releases: Database error fetching release:', releaseError)
      throw new Error(`Database error: ${releaseError.message}`)
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
    const releasesService = new ReleasesService(supabase)
    
    const data = await releasesService.createRelease(releaseData)
    return c.json({ success: true, data }, 201)
  } catch (error) {
    console.error('Error creating release:', error)
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
    const releasesService = new ReleasesService(supabase)
    
    const data = await releasesService.updateRelease(id, releaseData)
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
    const releasesService = new ReleasesService(supabase)
    
    const data = await releasesService.deleteRelease(id)
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
    const releasesService = new ReleasesService(supabase)
    
    const result = await releasesService.generateTasksForExistingRelease(releaseId)
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
    const user = c.get('jwtPayload')
    
    console.log('Releases: Adding song to release', releaseId, 'data:', songData)
    
    // Get artist_id from the release for RLS compliance
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select('artist_id')
      .eq('id', releaseId)
      .single()
    
    if (releaseError) {
      console.error('Releases: Database error fetching release:', releaseError)
      throw new Error(`Release not found: ${releaseError.message}`)
    }
    
    const { data, error } = await supabase
      .from('songs')
      .insert({
        ...songData,
        release_id: releaseId,
        artist_id: release.artist_id // Include artist_id for RLS
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
