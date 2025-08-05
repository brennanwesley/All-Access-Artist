/**
 * Releases Service - Business logic for music release management
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateReleaseData } from '../types/schemas'

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
    const { data, error } = await this.supabase
      .from('music_releases')
      .insert([releaseData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create release: ${error.message}`)
    }

    return data
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
