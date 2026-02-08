/**
 * Generation Jobs Routes - HTTP handlers for async AI generation job management
 * All Access Artist - Backend API v2.0.0
 * 
 * Purpose: Manages async AI generation jobs for n8n workflow integration
 * Features: Job creation, status tracking, webhook handling, retry logic
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { GenerationJobService } from '../services/generationJobService.js'
import { 
  CreateGenerationJobSchema, 
  UpdateGenerationJobSchema 
} from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'

const jobs = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/jobs - Get all generation jobs with optional filtering
jobs.get('/', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    // Query parameters for filtering and pagination
    const jobStatus = c.req.query('status')
    const jobType = c.req.query('type')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.getAllJobs(userId, jobStatus, jobType, limit, offset)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch generation jobs' 
    }, 500)
  }
})

// GET /api/jobs/:id - Get generation job by ID
jobs.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.getJobById(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch generation job' 
    }, 500)
  }
})

// POST /api/jobs - Create new generation job
jobs.post('/', zValidator('json', CreateGenerationJobSchema), async (c) => {
  try {
    const jobData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.createJob(userId, jobData)
    
    return c.json({ success: true, data }, 201)
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create generation job' 
    }, 500)
  }
})

// PATCH /api/jobs/:id - Update generation job (typically called by webhooks)
jobs.patch('/:id', zValidator('json', UpdateGenerationJobSchema), async (c) => {
  try {
    const id = c.req.param('id')
    const jobData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.updateJob(id, userId, jobData)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update generation job' 
    }, 500)
  }
})

// POST /api/jobs/:id/cancel - Cancel generation job
jobs.post('/:id/cancel', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.cancelJob(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cancel generation job' 
    }, 500)
  }
})

// POST /api/jobs/:id/retry - Retry failed generation job
jobs.post('/:id/retry', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.retryJob(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to retry generation job' 
    }, 500)
  }
})

// GET /api/jobs/stats - Get job statistics
jobs.get('/stats', async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.getJobStats(userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch job statistics' 
    }, 500)
  }
})

export default jobs
