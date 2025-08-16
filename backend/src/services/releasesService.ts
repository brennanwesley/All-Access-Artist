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
      // Generate to-do list tasks for the new release
      await this.generateReleaseTasks(newRelease.id, newRelease.artist_id, releaseData.type)
      
      return newRelease
    } catch (taskError) {
      // If task generation fails, rollback the release creation
      await this.supabase
        .from('music_releases')
        .delete()
        .eq('id', newRelease.id)
      
      const errorMessage = taskError instanceof Error ? taskError.message : 'Unknown error occurred'
      throw new Error(`Failed to generate release tasks: ${errorMessage}. Release creation rolled back.`)
    }
  }

  /**
   * Generates release-specific tasks from templates
   * @param releaseId - ID of the newly created release
   * @param artistId - ID of the artist creating the release
   * @param releaseType - Type of release (single, ep, album)
   */
  private async generateReleaseTasks(releaseId: string, artistId: string, releaseType: string) {
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
