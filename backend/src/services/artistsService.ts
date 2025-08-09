/**
 * Artists Service - Business logic for artist management
 * All Access Artist - Backend API v2.0.0
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateArtistData } from '../types/schemas.js'

export class ArtistsService {
  constructor(private supabase: SupabaseClient) {}

  async getAllArtists() {
    const { data, error } = await this.supabase
      .from('artist_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch artists: ${error.message}`)
    }

    return data
  }

  async getArtistById(id: string) {
    const { data, error } = await this.supabase
      .from('artist_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch artist: ${error.message}`)
    }

    return data
  }

  async createArtist(artistData: CreateArtistData) {
    const { data, error } = await this.supabase
      .from('artist_profiles')
      .insert([artistData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create artist: ${error.message}`)
    }

    return data
  }

  async updateArtist(id: string, artistData: Partial<CreateArtistData>) {
    const { data, error } = await this.supabase
      .from('artist_profiles')
      .update(artistData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update artist: ${error.message}`)
    }

    return data
  }

  async deleteArtist(id: string) {
    const { error } = await this.supabase
      .from('artist_profiles')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete artist: ${error.message}`)
    }

    return { success: true }
  }
}
