/**
 * Releases Service - Business logic for music release management
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateReleaseData } from '../types/schemas.js'

export class ReleasesService {
  constructor(private supabase: SupabaseClient) {}

  async getAllReleases() {
    const { data, error } = await this.supabase
      .from('music_releases')
      .select('*')
      .order('release_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch releases: ${error.message}`)
    }

    return data
  }

  async getReleaseById(id: string) {
    const { data, error } = await this.supabase
      .from('music_releases')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch release: ${error.message}`)
    }

    return data
  }

  async getReleasesByArtist(artistId: string) {
    const { data, error } = await this.supabase
      .from('music_releases')
      .select('*')
      .eq('artist_id', artistId)
      .order('release_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch releases for artist: ${error.message}`)
    }

    return data
  }

  async createRelease(releaseData: CreateReleaseData) {
    // Start by creating the release record
    const { data: newRelease, error: releaseError } = await this.supabase
      .from('music_releases')
      .insert([releaseData])
      .select()
      .single()

    if (releaseError) {
      throw new Error(`Failed to create release: ${releaseError.message}`)
    }

    try {
      // Try to generate to-do list tasks for the new release
      await this.generateReleaseTasks(newRelease.id, newRelease.artist_id, releaseData.release_type)
    } catch (taskError) {
      // Log the error but don't fail the release creation
      console.warn(`Task generation failed for release ${newRelease.id}:`, taskError)
      // Continue without tasks - the release is still created successfully
    }
    
    return newRelease
  }

  /**
   * Generates release-specific tasks from templates
   * @param releaseId - ID of the newly created release
   * @param artistId - ID of the artist creating the release
   * @param releaseType - Type of release (single, ep, album)
   */
  private async generateReleaseTasks(releaseId: string, artistId: string, releaseType: string) {
    // First, ensure task templates exist by creating them if missing
    await this.ensureTaskTemplatesExist()

    // Fetch the appropriate task template
    const { data: template, error: templateError } = await this.supabase
      .from('task_templates')
      .select('tasks')
      .eq('release_type', releaseType)
      .eq('is_active', true)
      .single()

    if (templateError) {
      throw new Error(`Failed to fetch task template for ${releaseType}: ${templateError.message}`)
    }

    if (!template || !template.tasks) {
      throw new Error(`No active task template found for release type: ${releaseType}`)
    }

    // Extract tasks array from JSONB
    const tasks = template.tasks as string[]
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error(`Invalid or empty task template for release type: ${releaseType}`)
    }

    // Prepare task records for bulk insert
    const taskRecords = tasks.map((taskDescription: string, index: number) => ({
      release_id: releaseId,
      artist_id: artistId,
      task_description: taskDescription,
      task_order: index,
      completed_at: null
    }))

    // Bulk insert all tasks
    const { error: tasksError } = await this.supabase
      .from('release_tasks')
      .insert(taskRecords)

    if (tasksError) {
      throw new Error(`Failed to insert release tasks: ${tasksError.message}`)
    }
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
        console.warn(`Failed to upsert task template for ${template.release_type}:`, error)
      }
    }
  }

  /**
   * Generates tasks for an existing release if they don't exist
   * @param releaseId - ID of the release
   */
  async generateTasksForExistingRelease(releaseId: string) {
    // Get release details
    const { data: release, error: releaseError } = await this.supabase
      .from('music_releases')
      .select('artist_id, release_type')
      .eq('id', releaseId)
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
      await this.generateReleaseTasks(releaseId, release.artist_id, release.release_type)
      return { message: 'Tasks generated successfully' }
    } catch (error) {
      throw new Error(`Failed to generate tasks: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateRelease(id: string, releaseData: Partial<CreateReleaseData>) {
    const { data, error } = await this.supabase
      .from('music_releases')
      .update(releaseData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update release: ${error.message}`)
    }

    return data
  }

  async deleteRelease(id: string) {
    const { error } = await this.supabase
      .from('music_releases')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete release: ${error.message}`)
    }

    return { success: true }
  }
}
