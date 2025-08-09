/**
 * Releases Routes - HTTP handlers for music release management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ReleasesService } from '../services/releasesService.js'
import { CreateReleaseSchema } from '../types/schemas.js'
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

// GET /api/releases/:id - Get release by ID
releases.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const supabase = c.get('supabase')
    const releasesService = new ReleasesService(supabase)
    
    const data = await releasesService.getReleaseById(id)
    return c.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching release:', error)
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

export default releases
