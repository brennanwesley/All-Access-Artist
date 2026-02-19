/**
 * Generation Jobs Routes - HTTP handlers for async AI generation job management
 * All Access Artist - Backend API v2.0.0
 * 
 * Purpose: Manages async AI generation jobs for n8n workflow integration
 * Features: Job creation, status tracking, webhook handling, retry logic
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { GenerationJobService } from '../services/generationJobService.js'
import { 
  IdParamSchema,
  CreateGenerationJobSchema, 
  UpdateGenerationJobSchema 
} from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { validateRequest } from '../middleware/validation.js'
import { errorResponse } from '../utils/apiResponse.js'

const jobs = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const JobListQuerySchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

// GET /api/jobs - Get all generation jobs with optional filtering
jobs.get('/', validateRequest('query', JobListQuerySchema), async (c) => {
  try {
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    // Query parameters for filtering and pagination
    const {
      status: jobStatus,
      type: jobType,
      limit = 50,
      offset = 0,
    } = c.req.valid('query')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.getAllJobs(userId, jobStatus, jobType, limit, offset)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch generation jobs',
      'GENERATION_JOB_LIST_FAILED'
    )
  }
})

// GET /api/jobs/:id - Get generation job by ID
jobs.get('/:id', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.getJobById(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch generation job',
      'GENERATION_JOB_FETCH_FAILED'
    )
  }
})

// POST /api/jobs - Create new generation job
jobs.post('/', validateRequest('json', CreateGenerationJobSchema), async (c) => {
  try {
    const jobData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.createJob(userId, jobData)
    
    return c.json({ success: true, data }, 201)
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to create generation job',
      'GENERATION_JOB_CREATE_FAILED'
    )
  }
})

// PATCH /api/jobs/:id - Update generation job (typically called by webhooks)
jobs.patch(
  '/:id',
  validateRequest('param', IdParamSchema),
  validateRequest('json', UpdateGenerationJobSchema),
  async (c) => {
  try {
    const { id } = c.req.valid('param')
    const jobData = c.req.valid('json')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.updateJob(id, userId, jobData)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to update generation job',
      'GENERATION_JOB_UPDATE_FAILED'
    )
  }
})

// POST /api/jobs/:id/cancel - Cancel generation job
jobs.post('/:id/cancel', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.cancelJob(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to cancel generation job',
      'GENERATION_JOB_CANCEL_FAILED'
    )
  }
})

// POST /api/jobs/:id/retry - Retry failed generation job
jobs.post('/:id/retry', validateRequest('param', IdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const userId = c.get('jwtPayload').sub
    const supabase = c.get('supabase')
    
    const jobService = new GenerationJobService(supabase)
    const data = await jobService.retryJob(id, userId)
    
    return c.json({ success: true, data })
  } catch (error) {
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to retry generation job',
      'GENERATION_JOB_RETRY_FAILED'
    )
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
    return errorResponse(
      c,
      500,
      error instanceof Error ? error.message : 'Failed to fetch job statistics',
      'GENERATION_JOB_STATS_FAILED'
    )
  }
})

export default jobs
