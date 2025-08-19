/**
 * Database Types - Supabase Generated Types
 * All Access Artist - Backend API v2.0.0
 */

export interface Database {
  public: {
    Tables: {
      releases: {
        Row: {
          id: string
          title: string
          user_id: string
          release_date: string
          type: 'single' | 'album' | 'ep'
          status: 'draft' | 'scheduled' | 'released'
          description?: string
          genre?: string
          cover_art_url?: string
          streaming_links?: Record<string, string>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          user_id: string
          release_date: string
          type: 'single' | 'album' | 'ep'
          status?: 'draft' | 'scheduled' | 'released'
          description?: string
          genre?: string
          cover_art_url?: string
          streaming_links?: Record<string, string>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          user_id?: string
          release_date?: string
          type?: 'single' | 'album' | 'ep'
          status?: 'draft' | 'scheduled' | 'released'
          description?: string
          genre?: string
          cover_art_url?: string
          streaming_links?: Record<string, string>
          created_at?: string
          updated_at?: string
        }
      }
      release_tasks: {
        Row: {
          id: string
          release_id: string
          title: string
          description?: string
          category: 'creative' | 'marketing' | 'distribution' | 'legal' | 'other'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          release_id: string
          title: string
          description?: string
          category: 'creative' | 'marketing' | 'distribution' | 'legal' | 'other'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          release_id?: string
          title?: string
          description?: string
          category?: 'creative' | 'marketing' | 'distribution' | 'legal' | 'other'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      lyric_sheets: {
        Row: {
          id: string
          release_id: string
          title: string
          lyrics: string
          structure?: any
          notes?: string
          version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          release_id: string
          title: string
          lyrics: string
          structure?: any
          notes?: string
          version?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          release_id?: string
          title?: string
          lyrics?: string
          structure?: any
          notes?: string
          version?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
