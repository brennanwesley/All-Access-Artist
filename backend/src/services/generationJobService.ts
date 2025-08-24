/**
 * Generation Job Service - Business logic for async AI generation job management
 * All Access Artist - Backend API v2.0.0
 * 
 * Purpose: Manages async AI generation jobs for n8n workflow integration
 * Features: Job creation, status tracking, webhook handling, retry logic
 * Database: generation_jobs table with user-scoped RLS policies
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { 
  CreateGenerationJobData, 
  UpdateGenerationJobData 
} from '../types/schemas.js'

export class GenerationJobService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all generation jobs for a user with optional filtering
   * @param userId - User ID for RLS filtering
   * @param jobStatus - Optional filter by job status
   * @param jobType - Optional filter by job type
   * @param limit - Optional limit for pagination
   * @param offset - Optional offset for pagination
   */
  async getAllJobs(
    userId: string,
    jobStatus?: string,
    jobType?: string,
    limit: number = 50,
    offset: number = 0
  ) {
    console.log('=== GET ALL JOBS DEBUG ===')
    console.log('1. Input userId:', userId)
    console.log('2. Status filter:', jobStatus || 'none')
    console.log('3. Type filter:', jobType || 'none')
    console.log('4. Pagination - limit:', limit, 'offset:', offset)
    
    let query = this.supabase
      .from('generation_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters if provided
    if (jobStatus) {
      query = query.eq('job_status', jobStatus)
    }
    if (jobType) {
      query = query.eq('job_type', jobType)
    }

    const { data, error } = await query

    console.log('5. Jobs found:', data?.length || 0)
    console.log('=== END GET ALL JOBS DEBUG ===')

    if (error) {
      throw new Error(`Failed to fetch generation jobs: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get generation job by ID with user verification
   * @param jobId - Job ID to retrieve
   * @param userId - User ID for RLS verification
   */
  async getJobById(jobId: string, userId: string) {
    console.log('=== GET JOB BY ID DEBUG ===')
    console.log('Job ID:', jobId)
    console.log('User ID:', userId)
    
    const { data, error } = await this.supabase
      .from('generation_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .maybeSingle()

    console.log('Job query result:', { data: !!data, error })
    console.log('=== END GET JOB BY ID DEBUG ===')

    if (error) {
      console.log('Job query error:', error.message)
      throw new Error(`Failed to fetch generation job: ${error.message}`)
    }

    if (!data) {
      throw new Error('Generation job not found or access denied')
    }

    return data
  }

  /**
   * Create new generation job for n8n workflow
   * @param userId - User ID for ownership
   * @param jobData - Job creation data
   */
  async createJob(userId: string, jobData: CreateGenerationJobData) {
    console.log('=== CREATE JOB DEBUG ===')
    console.log('1. User ID:', userId)
    console.log('2. Job type:', jobData.job_type)
    console.log('3. Prompt length:', jobData.input_prompt?.length || 0)
    console.log('4. Generation model:', jobData.generation_model)
    
    // Prepare data with user_id and defaults
    const insertData = {
      user_id: userId,
      ...jobData,
      job_status: 'pending' as const,
      progress_percentage: 0,
      retry_count: 0,
      created_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('generation_jobs')
      .insert(insertData)
      .select()
      .single()

    console.log('5. Job creation result:', { success: !!data, error })
    console.log('=== END CREATE JOB DEBUG ===')

    if (error) {
      console.log('Job creation error:', error.message)
      throw new Error(`Failed to create generation job: ${error.message}`)
    }

    return data
  }

  /**
   * Update generation job status (typically called by webhooks)
   * @param jobId - Job ID to update
   * @param userId - User ID for RLS verification
   * @param updateData - Job update data
   */
  async updateJob(
    jobId: string,
    userId: string,
    updateData: UpdateGenerationJobData
  ) {
    console.log('=== UPDATE JOB DEBUG ===')
    console.log('1. Job ID:', jobId)
    console.log('2. User ID:', userId)
    console.log('3. Update fields:', Object.keys(updateData))
    console.log('4. New status:', updateData.job_status)
    
    const { data, error } = await this.supabase
      .from('generation_jobs')
      .update(updateData)
      .eq('id', jobId)
      .eq('user_id', userId)
      .select()
      .single()

    console.log('5. Job update result:', { success: !!data, error })
    console.log('=== END UPDATE JOB DEBUG ===')

    if (error) {
      console.log('Job update error:', error.message)
      throw new Error(`Failed to update generation job: ${error.message}`)
    }

    if (!data) {
      throw new Error('Generation job not found or access denied')
    }

    return data
  }

  /**
   * Cancel generation job
   * @param jobId - Job ID to cancel
   * @param userId - User ID for RLS verification
   */
  async cancelJob(jobId: string, userId: string) {
    console.log('=== CANCEL JOB DEBUG ===')
    console.log('1. Job ID:', jobId)
    console.log('2. User ID:', userId)
    
    const { data, error } = await this.supabase
      .from('generation_jobs')
      .update({ 
        job_status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('user_id', userId)
      .eq('job_status', 'pending') // Only cancel pending jobs
      .select()
      .single()

    console.log('3. Job cancellation result:', { success: !!data, error })
    console.log('=== END CANCEL JOB DEBUG ===')

    if (error) {
      console.log('Job cancellation error:', error.message)
      throw new Error(`Failed to cancel generation job: ${error.message}`)
    }

    if (!data) {
      throw new Error('Generation job not found, access denied, or already in progress')
    }

    return data
  }

  /**
   * Retry failed generation job
   * @param jobId - Job ID to retry
   * @param userId - User ID for RLS verification
   */
  async retryJob(jobId: string, userId: string) {
    console.log('=== RETRY JOB DEBUG ===')
    console.log('1. Job ID:', jobId)
    console.log('2. User ID:', userId)
    
    // First get the current job to check retry count
    const job = await this.getJobById(jobId, userId)
    
    if (job.job_status !== 'failed') {
      throw new Error('Only failed jobs can be retried')
    }
    
    if (job.retry_count >= job.max_retries) {
      throw new Error('Maximum retry attempts exceeded')
    }

    const { data, error } = await this.supabase
      .from('generation_jobs')
      .update({ 
        job_status: 'pending',
        retry_count: job.retry_count + 1,
        error_message: null,
        progress_percentage: 0,
        started_at: null,
        completed_at: null
      })
      .eq('id', jobId)
      .eq('user_id', userId)
      .select()
      .single()

    console.log('3. Job retry result:', { success: !!data, error })
    console.log('=== END RETRY JOB DEBUG ===')

    if (error) {
      console.log('Job retry error:', error.message)
      throw new Error(`Failed to retry generation job: ${error.message}`)
    }

    return data
  }

  /**
   * Get job statistics for user dashboard
   * @param userId - User ID for statistics
   */
  async getJobStats(userId: string) {
    console.log('=== GET JOB STATS DEBUG ===')
    console.log('User ID:', userId)
    
    const { data, error } = await this.supabase
      .from('generation_jobs')
      .select('job_type, job_status, created_at, completed_at')
      .eq('user_id', userId)

    console.log('Stats query result:', { count: data?.length || 0, error })
    console.log('=== END GET JOB STATS DEBUG ===')

    if (error) {
      throw new Error(`Failed to fetch job statistics: ${error.message}`)
    }

    // Calculate statistics
    const stats = {
      total_jobs: data?.length || 0,
      by_status: {} as Record<string, number>,
      by_type: {} as Record<string, number>,
      active_jobs: 0,
      recent_jobs: 0, // Last 24 hours
      average_completion_time: 0
    }

    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    let totalCompletionTime = 0
    let completedJobsCount = 0

    data?.forEach(item => {
      // Count by status
      stats.by_status[item.job_status] = (stats.by_status[item.job_status] || 0) + 1
      
      // Count by type
      stats.by_type[item.job_type] = (stats.by_type[item.job_type] || 0) + 1
      
      // Count active jobs
      if (['pending', 'processing'].includes(item.job_status)) {
        stats.active_jobs++
      }
      
      // Count recent jobs
      if (new Date(item.created_at) > oneDayAgo) {
        stats.recent_jobs++
      }
      
      // Calculate completion time for completed jobs
      if (item.job_status === 'completed' && item.completed_at) {
        const completionTime = new Date(item.completed_at).getTime() - new Date(item.created_at).getTime()
        totalCompletionTime += completionTime
        completedJobsCount++
      }
    })

    // Calculate average completion time in seconds
    if (completedJobsCount > 0) {
      stats.average_completion_time = Math.round(totalCompletionTime / completedJobsCount / 1000)
    }

    return stats
  }

  /**
   * Get pending jobs for n8n workflow processing
   * @param limit - Optional limit for batch processing
   */
  async getPendingJobs(limit: number = 10) {
    console.log('=== GET PENDING JOBS DEBUG ===')
    console.log('Limit:', limit)
    
    const { data, error } = await this.supabase
      .from('generation_jobs')
      .select('*')
      .eq('job_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit)

    console.log('Pending jobs found:', data?.length || 0)
    console.log('=== END GET PENDING JOBS DEBUG ===')

    if (error) {
      throw new Error(`Failed to fetch pending jobs: ${error.message}`)
    }

    return data || []
  }
}
