/**
 * Releases Service - Business logic for music release management
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateReleaseData } from '../types/schemas.js'
import { logger, extractErrorInfo } from '../utils/logger.js'

const releaseLogger = logger.child('releasesService')

export class ReleasesService {
  constructor(private supabase: SupabaseClient) {}

  async getAllReleases(userId: string) {
    releaseLogger.debug('getAllReleases called', { userId })
    
    const { data, error } = await this.supabase
      .from('music_releases')
      .select('*')
      .eq('user_id', userId)
      .order('release_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch releases: ${error.message}`)
    }

    releaseLogger.debug('Releases retrieved', { userId, count: data?.length || 0 })
    return data || []
  }

  async getReleaseById(id: string, userId: string) {
    releaseLogger.debug('getReleaseById called', { releaseId: id, userId })
    
    const { data, error } = await this.supabase
      .from('music_releases')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      releaseLogger.error('Release query error', { releaseId: id, userId, error: error.message })
      throw new Error(`Failed to fetch release: ${error.message}`)
    }

    if (!data) {
      releaseLogger.warn('Release not found or access denied', { releaseId: id, userId })
      return null
    }

    return data
  }

  async getReleasesByArtist(artistId: string) {
    const { data, error } = await this.supabase
      .from('music_releases')
      .select('*')
      .eq('user_id', artistId)
      .order('release_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch releases for artist: ${error.message}`)
    }

    return data
  }

  async createRelease(releaseData: CreateReleaseData) {
    releaseLogger.debug('createRelease called', { title: releaseData.title, userId: releaseData.user_id })
    
    const { data: newRelease, error: releaseError } = await this.supabase
      .from('music_releases')
      .insert([releaseData])
      .select()
      .single()

    if (releaseError) {
      releaseLogger.error('Database insert error', {
        error: releaseError.message,
        code: releaseError.code,
        details: releaseError.details
      })
      throw new Error(`Failed to create release: ${releaseError.message}`)
    }

    releaseLogger.info('Release created', { releaseId: newRelease.id, title: newRelease.title })

    try {
      await this.generateReleaseTasks(newRelease.id, newRelease.user_id, releaseData.release_type || 'single')
      releaseLogger.debug('Task generation completed', { releaseId: newRelease.id })
    } catch (taskError) {
      releaseLogger.warn('Task generation failed (non-critical)', {
        releaseId: newRelease.id,
        ...extractErrorInfo(taskError)
      })
    }
    
    return newRelease
  }

  /**
   * Generates release-specific tasks from templates (both checklist and timeline)
   * @param releaseId - ID of the newly created release
   * @param userId - ID of the user creating the release
   * @param releaseType - Type of release (single, ep, album)
   */
  private async generateReleaseTasks(releaseId: string, userId: string, releaseType: string) {
    // First, ensure task templates exist by creating them if missing
    await this.ensureTaskTemplatesExist()

    // Fetch BOTH checklist and timeline templates for this release type
    const { data: templates, error: templateError } = await this.supabase
      .from('task_templates')
      .select('template_name, tasks')
      .eq('release_type', releaseType)
      .eq('is_active', true)

    if (templateError) {
      throw new Error(`Failed to fetch task templates for ${releaseType}: ${templateError.message}`)
    }

    if (!templates || templates.length === 0) {
      throw new Error(`No active task templates found for release type: ${releaseType}`)
    }

    // Separate checklist and timeline templates
    const checklistTemplate = templates.find(t => t.template_name.includes('Checklist'))
    const timelineTemplate = templates.find(t => t.template_name === 'Project Timeline Tasks')

    let allTaskRecords: any[] = []
    let taskOrderOffset = 0

    // Generate checklist tasks first (if template exists)
    if (checklistTemplate && checklistTemplate.tasks) {
      const checklistTasks = checklistTemplate.tasks as string[]
      
      if (Array.isArray(checklistTasks) && checklistTasks.length > 0) {
        const checklistRecords = checklistTasks.map((taskDescription: string, index: number) => ({
          release_id: releaseId,
          user_id: userId,
          task_description: taskDescription,
          task_order: index,
          task_category: 'checklist', // Add category to distinguish task types
          completed_at: null
        }))
        
        allTaskRecords = [...allTaskRecords, ...checklistRecords]
        taskOrderOffset = checklistTasks.length
      }
    }

    // Generate timeline tasks second (if template exists)
    if (timelineTemplate && timelineTemplate.tasks) {
      const timelineTasks = timelineTemplate.tasks as string[]
      
      if (Array.isArray(timelineTasks) && timelineTasks.length > 0) {
        const timelineRecords = timelineTasks.map((taskDescription: string, index: number) => ({
          release_id: releaseId,
          user_id: userId,
          task_description: taskDescription,
          task_order: taskOrderOffset + index,
          task_category: 'timeline', // Add category to distinguish task types
          completed_at: null
        }))
        
        allTaskRecords = [...allTaskRecords, ...timelineRecords]
      }
    }

    // Ensure we have at least some tasks to insert
    if (allTaskRecords.length === 0) {
      throw new Error(`No valid tasks found in templates for release type: ${releaseType}`)
    }

    // Bulk insert all tasks (checklist + timeline)
    const { error: tasksError } = await this.supabase
      .from('release_tasks')
      .insert(allTaskRecords)

    if (tasksError) {
      throw new Error(`Failed to insert release tasks: ${tasksError.message}`)
    }

    releaseLogger.info('Tasks generated', { releaseId, releaseType, taskCount: allTaskRecords.length })
  }

  /**
   * Ensures task templates exist in the database
   */
  private async ensureTaskTemplatesExist() {
    const templates = [
      {
        release_type: 'single',
        template_name: 'Standard Single Release Checklist',
        tasks: [
          "Complete song recording",
          "Finalize mixing and mastering",
          "Create album artwork",
          "Register song with PRO (ASCAP/BMI)",
          "Obtain ISRC code",
          "Submit to digital distributors",
          "Set up pre-save campaigns",
          "Plan social media promotion",
          "Schedule release date",
          "Prepare press kit and bio"
        ]
      },
      {
        release_type: 'ep',
        template_name: 'Standard EP Release Checklist',
        tasks: [
          "Complete all track recordings",
          "Finalize mixing and mastering for all tracks",
          "Create album artwork and track art",
          "Register all songs with PRO (ASCAP/BMI)",
          "Obtain ISRC codes for all tracks",
          "Create track listing and metadata",
          "Submit to digital distributors",
          "Set up pre-save campaigns",
          "Plan social media promotion strategy",
          "Schedule release date and rollout",
          "Prepare press kit and bio",
          "Consider physical release options",
          "Plan music video for lead single"
        ]
      },
      {
        release_type: 'album',
        template_name: 'Standard Album Release Checklist',
        tasks: [
          "Complete all track recordings",
          "Finalize mixing and mastering for all tracks",
          "Create album artwork and track art",
          "Register all songs with PRO (ASCAP/BMI)",
          "Obtain ISRC codes for all tracks",
          "Create comprehensive track listing and metadata",
          "Submit to digital distributors",
          "Set up pre-save campaigns",
          "Develop comprehensive marketing strategy",
          "Schedule release date and rollout timeline",
          "Prepare press kit, bio, and one-sheet",
          "Plan physical release (vinyl, CD)",
          "Plan music videos for key tracks",
          "Book promotional interviews and performances",
          "Submit to playlist curators",
          "Plan album release show/tour",
          "Create merchandise strategy",
          "Develop sync licensing opportunities"
        ]
      },
      {
        release_type: 'mixtape',
        template_name: 'Standard Mixtape Release Checklist',
        tasks: [
          "Complete all track recordings",
          "Finalize mixing for all tracks",
          "Create mixtape artwork and cover",
          "Clear any samples or interpolations",
          "Create track listing and credits",
          "Submit to digital distributors",
          "Set up streaming platform uploads",
          "Plan social media promotion",
          "Create promotional content and visuals",
          "Schedule release date",
          "Prepare artist bio and press materials",
          "Plan mixtape release party or event"
        ]
      }
    ]

    for (const template of templates) {
      const { error } = await this.supabase
        .from('task_templates')
        .upsert({
          release_type: template.release_type,
          template_name: template.template_name,
          tasks: template.tasks,
          is_active: true
        }, {
          onConflict: 'release_type,template_name'
        })

      if (error) {
        releaseLogger.warn('Failed to upsert task template', { releaseType: template.release_type, error: error.message })
      }
    }
  }

  /**
   * Generates tasks for an existing release if they don't exist
   * @param releaseId - ID of the release
   */
  async generateTasksForExistingRelease(releaseId: string, userId: string) {
    // Get release details (user-scoped)
    const { data: release, error: releaseError } = await this.supabase
      .from('music_releases')
      .select('user_id, release_type')
      .eq('id', releaseId)
      .eq('user_id', userId)
      .single()

    if (releaseError || !release) {
      throw new Error(`Release not found: ${releaseError?.message || 'Unknown error'}`)
    }

    // Check if tasks already exist
    const { data: existingTasks, error: tasksError } = await this.supabase
      .from('release_tasks')
      .select('id')
      .eq('release_id', releaseId)
      .limit(1)

    if (tasksError) {
      throw new Error(`Failed to check existing tasks: ${tasksError.message}`)
    }

    // If tasks already exist, don't generate new ones
    if (existingTasks && existingTasks.length > 0) {
      return { message: 'Tasks already exist for this release' }
    }

    // Generate tasks
    try {
      await this.generateReleaseTasks(releaseId, userId, release.release_type)
      return { message: 'Tasks generated successfully' }
    } catch (error) {
      throw new Error(`Failed to generate tasks: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateRelease(id: string, releaseData: Partial<CreateReleaseData>, userId: string) {
    // Get the current release (user-scoped) to check if release_type is changing
    const { data: currentRelease, error: fetchError } = await this.supabase
      .from('music_releases')
      .select('release_type, user_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch current release: ${fetchError.message}`)
    }

    // Update the release
    const { data, error } = await this.supabase
      .from('music_releases')
      .update(releaseData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update release: ${error.message}`)
    }

    // Check if release_type changed and handle task regeneration
    if (releaseData.release_type && releaseData.release_type !== currentRelease.release_type) {
      releaseLogger.info('Release type changed', {
        releaseId: id,
        from: currentRelease.release_type,
        to: releaseData.release_type
      })
      
      try {
        const { error: deleteError } = await this.supabase
          .from('release_tasks')
          .delete()
          .eq('release_id', id)

        if (deleteError) {
          releaseLogger.warn('Failed to clear existing tasks', { releaseId: id, error: deleteError.message })
        }

        await this.generateReleaseTasks(id, userId, releaseData.release_type)
        releaseLogger.debug('New tasks generated after type change', { releaseId: id, releaseType: releaseData.release_type })
        
      } catch (taskError) {
        releaseLogger.error('Failed to regenerate tasks after release type change', {
          releaseId: id,
          ...extractErrorInfo(taskError)
        })
      }
    }

    return data
  }

  async deleteRelease(id: string, userId: string) {
    // Capture complete release snapshot before deletion
    const snapshot = await this.captureReleaseSnapshot(id, userId)
    
    // Delete release only if it belongs to this user
    const { error } = await this.supabase
      .from('music_releases')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete release: ${error.message}`)
    }

    // Log deletion asynchronously (no user wait)
    this.logDeletionAsync(snapshot, userId)

    return { success: true }
  }

  private async captureReleaseSnapshot(releaseId: string, userId: string) {
    try {
      // Single optimized query with all related data
      const { data: releaseData } = await this.supabase
        .from('music_releases')
        .select(`
          *,
          songs(*),
          release_tasks(*),
          lyric_sheets(*),
          split_sheets(
            *,
            split_sheet_writers(*)
          )
        `)
        .eq('id', releaseId)
        .eq('user_id', userId)
        .single()

      return {
        release: releaseData,
        deleted_at: new Date().toISOString(),
        deletion_reason: 'user_initiated',
        user_id: userId
      }
    } catch (error) {
      releaseLogger.error('Failed to capture release snapshot', { releaseId, ...extractErrorInfo(error) })
      return {
        release: { id: releaseId, title: 'Unknown Release' },
        deleted_at: new Date().toISOString(),
        deletion_reason: 'user_initiated',
        user_id: userId,
        snapshot_error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private logDeletionAsync(snapshot: any, userId: string) {
    // Fire-and-forget async logging (doesn't block user response)
    setTimeout(async () => {
      try {
        await this.supabase
          .from('audit_log')
          .insert({
            table_name: 'music_releases',
            operation: 'DELETE',
            record_id: snapshot.release?.id || null,
            old_data: snapshot,
            user_id: userId,
            timestamp: new Date().toISOString()
          })
        
        releaseLogger.info('Audit log created for deleted release', { title: snapshot.release?.title })
      } catch (error) {
        releaseLogger.error('Failed to create audit log', extractErrorInfo(error))
      }
    }, 0)
  }
}
