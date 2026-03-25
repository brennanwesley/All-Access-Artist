/**
 * Database Types - Supabase Generated Types
 * All Access Artist - Backend API v2.0.0
 * 
 * Auto-generated from Supabase schema on 2026-01-07
 * To regenerate: Use Supabase MCP generate_typescript_types tool
 * 
 * Tables included: 25 tables
 * - accounts, artist_assets, artist_profiles, audit_log
 * - content_calendar, fan_analytics, generated_content, generation_jobs
 * - instagram_metrics, label_copy, lyric_sheets, music_releases
 * - n8n_error_logger, rate_limits, referrals, release_tasks, royalty_data
 * - songs, split_sheet_contributors, split_sheets, subscriptions
 * - tiktok_metrics, twitter_metrics, user_profiles, wrong_social_handle
 * - youtube_metrics
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          "account-id": number
          display_name: string | null
          followers_count: string | null
          last_updated: string | null
          platform: string
          profile_url: string | null
          username: string | null
        }
        Insert: {
          "account-id"?: number
          display_name?: string | null
          followers_count?: string | null
          last_updated?: string | null
          platform: string
          profile_url?: string | null
          username?: string | null
        }
        Update: {
          "account-id"?: number
          display_name?: string | null
          followers_count?: string | null
          last_updated?: string | null
          platform?: string
          profile_url?: string | null
          username?: string | null
        }
        Relationships: []
      }
      artist_assets: {
        Row: {
          ai_description: string | null
          asset_name: string
          asset_type: string
          created_at: string | null
          description: string | null
          dimensions_height: number | null
          dimensions_width: number | null
          dominant_colors: string[] | null
          file_format: string
          file_size_bytes: number
          file_url: string
          folder: string | null
          id: string
          is_primary: boolean | null
          tags: string[] | null
          updated_at: string | null
          usage_notes: string | null
          user_id: string
        }
        Insert: {
          ai_description?: string | null
          asset_name: string
          asset_type: string
          created_at?: string | null
          description?: string | null
          dimensions_height?: number | null
          dimensions_width?: number | null
          dominant_colors?: string[] | null
          file_format: string
          file_size_bytes: number
          file_url: string
          folder?: string | null
          id?: string
          is_primary?: boolean | null
          tags?: string[] | null
          updated_at?: string | null
          usage_notes?: string | null
          user_id: string
        }
        Update: {
          ai_description?: string | null
          asset_name?: string
          asset_type?: string
          created_at?: string | null
          description?: string | null
          dimensions_height?: number | null
          dimensions_width?: number | null
          dominant_colors?: string[] | null
          file_format?: string
          file_size_bytes?: number
          file_url?: string
          folder?: string | null
          id?: string
          is_primary?: boolean | null
          tags?: string[] | null
          updated_at?: string | null
          usage_notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      artist_profiles: {
        Row: {
          apple_music_url: string | null
          artist_name: string
          banner_image_url: string | null
          bio: string | null
          created_at: string | null
          email_notifications: boolean | null
          genre: string | null
          id: string
          instagram_url: string | null
          is_public: boolean | null
          location: string | null
          profile_image_url: string | null
          real_name: string | null
          spotify_url: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          apple_music_url?: string | null
          artist_name: string
          banner_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          genre?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean | null
          location?: string | null
          profile_image_url?: string | null
          real_name?: string | null
          spotify_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          apple_music_url?: string | null
          artist_name?: string
          banner_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          genre?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean | null
          location?: string | null
          profile_image_url?: string | null
          real_name?: string | null
          spotify_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          ip_address: unknown
          old_data: Json | null
          operation: string
          record_id: string | null
          table_name: string
          timestamp: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown
          old_data?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown
          old_data?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      content_calendar: {
        Row: {
          artist_id: string | null
          brand_pillar: string | null
          comments: number | null
          content_type: string
          content_url: string | null
          created_at: string | null
          description: string | null
          engagement_rate: number | null
          generated_content_id: string | null
          hashtags: string[] | null
          id: string
          likes: number | null
          platform: string
          published_date: string | null
          scheduled_date: string
          shares: number | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          artist_id?: string | null
          brand_pillar?: string | null
          comments?: number | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          engagement_rate?: number | null
          generated_content_id?: string | null
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          platform: string
          published_date?: string | null
          scheduled_date: string
          shares?: number | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          artist_id?: string | null
          brand_pillar?: string | null
          comments?: number | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          engagement_rate?: number | null
          generated_content_id?: string | null
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          platform?: string
          published_date?: string | null
          scheduled_date?: string
          shares?: number | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      fan_analytics: {
        Row: {
          age_demographics: Json | null
          artist_id: string | null
          avg_engagement_rate: number | null
          created_at: string | null
          follower_growth_rate: number | null
          gender_demographics: Json | null
          id: string
          monthly_listener_growth: number | null
          period_end: string
          period_start: string
          platform: string
          playlist_reach: number | null
          save_rate: number | null
          skip_rate: number | null
          top_cities: Json | null
          top_countries: Json | null
          total_followers: number | null
          total_streams: number | null
          updated_at: string | null
        }
        Insert: {
          age_demographics?: Json | null
          artist_id?: string | null
          avg_engagement_rate?: number | null
          created_at?: string | null
          follower_growth_rate?: number | null
          gender_demographics?: Json | null
          id?: string
          monthly_listener_growth?: number | null
          period_end: string
          period_start: string
          platform: string
          playlist_reach?: number | null
          save_rate?: number | null
          skip_rate?: number | null
          top_cities?: Json | null
          top_countries?: Json | null
          total_followers?: number | null
          total_streams?: number | null
          updated_at?: string | null
        }
        Update: {
          age_demographics?: Json | null
          artist_id?: string | null
          avg_engagement_rate?: number | null
          created_at?: string | null
          follower_growth_rate?: number | null
          gender_demographics?: Json | null
          id?: string
          monthly_listener_growth?: number | null
          period_end?: string
          period_start?: string
          platform?: string
          playlist_reach?: number | null
          save_rate?: number | null
          skip_rate?: number | null
          top_cities?: Json | null
          top_countries?: Json | null
          total_followers?: number | null
          total_streams?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      generated_content: {
        Row: {
          content_type: string
          created_at: string | null
          description: string | null
          file_format: string | null
          file_size_bytes: number | null
          file_url: string | null
          generation_model: string | null
          generation_settings: Json | null
          id: string
          is_approved: boolean | null
          last_used_at: string | null
          moderation_flags: Json | null
          prompt_text: string
          quality_score: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          description?: string | null
          file_format?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          generation_model?: string | null
          generation_settings?: Json | null
          id?: string
          is_approved?: boolean | null
          last_used_at?: string | null
          moderation_flags?: Json | null
          prompt_text: string
          quality_score?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          description?: string | null
          file_format?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          generation_model?: string | null
          generation_settings?: Json | null
          id?: string
          is_approved?: boolean | null
          last_used_at?: string | null
          moderation_flags?: Json | null
          prompt_text?: string
          quality_score?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      generation_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          estimated_completion_at: string | null
          external_job_id: string | null
          generation_model: string
          generation_settings: Json | null
          id: string
          input_prompt: string
          job_status: string | null
          job_type: string
          max_retries: number | null
          progress_percentage: number | null
          result_content_id: string | null
          retry_count: number | null
          source_asset_id: string | null
          started_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_completion_at?: string | null
          external_job_id?: string | null
          generation_model: string
          generation_settings?: Json | null
          id?: string
          input_prompt: string
          job_status?: string | null
          job_type: string
          max_retries?: number | null
          progress_percentage?: number | null
          result_content_id?: string | null
          retry_count?: number | null
          source_asset_id?: string | null
          started_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_completion_at?: string | null
          external_job_id?: string | null
          generation_model?: string
          generation_settings?: Json | null
          id?: string
          input_prompt?: string
          job_status?: string | null
          job_type?: string
          max_retries?: number | null
          progress_percentage?: number | null
          result_content_id?: string | null
          retry_count?: number | null
          source_asset_id?: string | null
          started_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      instagram_metrics: {
        Row: {
          comments_30d: number | null
          comments_365d: number | null
          date_ingested: string
          followers: number | null
          id: number
          likes_30d: number | null
          likes_365d: number | null
          posts_30d: number | null
          posts_365d: number | null
          profile_url: string | null
          username: string | null
        }
        Insert: {
          comments_30d?: number | null
          comments_365d?: number | null
          date_ingested?: string
          followers?: number | null
          id?: number
          likes_30d?: number | null
          likes_365d?: number | null
          posts_30d?: number | null
          posts_365d?: number | null
          profile_url?: string | null
          username?: string | null
        }
        Update: {
          comments_30d?: number | null
          comments_365d?: number | null
          date_ingested?: string
          followers?: number | null
          id?: number
          likes_30d?: number | null
          likes_365d?: number | null
          posts_30d?: number | null
          posts_365d?: number | null
          profile_url?: string | null
          username?: string | null
        }
        Relationships: []
      }
      label_copy: {
        Row: {
          composition_copyright: string | null
          copyright_year: number | null
          created_at: string | null
          explicit_content: boolean | null
          id: string
          language_lyrics: string | null
          phonogram_copyright: string | null
          release_id: string
          sub_genre: string | null
          territories: string[] | null
          tracks_metadata: Json | null
          updated_at: string | null
          version_subtitle: string | null
          upc_code: string | null
          user_id: string
        }
        Insert: {
          composition_copyright?: string | null
          copyright_year?: number | null
          created_at?: string | null
          explicit_content?: boolean | null
          id?: string
          language_lyrics?: string | null
          phonogram_copyright?: string | null
          release_id: string
          sub_genre?: string | null
          territories?: string[] | null
          tracks_metadata?: Json | null
          updated_at?: string | null
          version_subtitle?: string | null
          upc_code?: string | null
          user_id: string
        }
        Update: {
          composition_copyright?: string | null
          copyright_year?: number | null
          created_at?: string | null
          explicit_content?: boolean | null
          id?: string
          language_lyrics?: string | null
          phonogram_copyright?: string | null
          release_id?: string
          sub_genre?: string | null
          territories?: string[] | null
          tracks_metadata?: Json | null
          updated_at?: string | null
          version_subtitle?: string | null
          upc_code?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lyric_sheets: {
        Row: {
          artist_id: string | null
          created_at: string | null
          id: string
          additional_notes: string | null
          song_id: string
          total_sections: number | null
          updated_at: string | null
          user_id: string
          written_by: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          additional_notes?: string | null
          song_id: string
          total_sections?: number | null
          updated_at?: string | null
          user_id: string
          written_by?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          additional_notes?: string | null
          song_id?: string
          total_sections?: number | null
          updated_at?: string | null
          user_id?: string
          written_by?: string | null
        }
        Relationships: []
      }
      music_releases: {
        Row: {
          apple_music_url: string | null
          artist_id: string | null
          bandcamp_url: string | null
          catalog_number: string | null
          composition_copyright: string | null
          copyright_info: string | null
          copyright_year: number | null
          cover_art_url: string | null
          created_at: string | null
          created_date: string | null
          description: string | null
          explicit_content: boolean | null
          genre: string | null
          id: string
          is_featured: boolean | null
          isrc: string | null
          label: string | null
          language_lyrics: string | null
          phonogram_copyright: string | null
          preview_url: string | null
          producers: string | null
          project_budget: number | null
          release_date: string
          release_type: string
          songwriters: string | null
          soundcloud_url: string | null
          spotify_url: string | null
          status: string | null
          sub_genre: string | null
          territories: string[] | null
          title: string
          track_description: string | null
          upc: string | null
          updated_at: string | null
          user_id: string
          version_subtitle: string | null
          youtube_url: string | null
        }
        Insert: {
          apple_music_url?: string | null
          artist_id?: string | null
          bandcamp_url?: string | null
          catalog_number?: string | null
          composition_copyright?: string | null
          copyright_info?: string | null
          copyright_year?: number | null
          cover_art_url?: string | null
          created_at?: string | null
          created_date?: string | null
          description?: string | null
          explicit_content?: boolean | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          isrc?: string | null
          label?: string | null
          language_lyrics?: string | null
          phonogram_copyright?: string | null
          preview_url?: string | null
          producers?: string | null
          project_budget?: number | null
          release_date: string
          release_type: string
          songwriters?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          sub_genre?: string | null
          territories?: string[] | null
          title: string
          track_description?: string | null
          upc?: string | null
          updated_at?: string | null
          user_id: string
          version_subtitle?: string | null
          youtube_url?: string | null
        }
        Update: {
          apple_music_url?: string | null
          artist_id?: string | null
          bandcamp_url?: string | null
          catalog_number?: string | null
          composition_copyright?: string | null
          copyright_info?: string | null
          copyright_year?: number | null
          cover_art_url?: string | null
          created_at?: string | null
          created_date?: string | null
          description?: string | null
          explicit_content?: boolean | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          isrc?: string | null
          label?: string | null
          language_lyrics?: string | null
          phonogram_copyright?: string | null
          preview_url?: string | null
          producers?: string | null
          project_budget?: number | null
          release_date?: string
          release_type?: string
          songwriters?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          sub_genre?: string | null
          territories?: string[] | null
          title?: string
          track_description?: string | null
          upc?: string | null
          updated_at?: string | null
          user_id?: string
          version_subtitle?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      n8n_error_logger: {
        Row: {
          error_message: string | null
          id: number
          node: string | null
          timestamp: string
          url: string | null
          workflow: string | null
        }
        Insert: {
          error_message?: string | null
          id?: number
          node?: string | null
          timestamp?: string
          url?: string | null
          workflow?: string | null
        }
        Update: {
          error_message?: string | null
          id?: number
          node?: string | null
          timestamp?: string
          url?: string | null
          workflow?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          id: string
          key: string
          count: number
          reset_time: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          count?: number
          reset_time: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          count?: number
          reset_time?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          credits_awarded: number | null
          id: string
          referred_user_id: string | null
          referrer_user_id: string
          status: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          credits_awarded?: number | null
          id?: string
          referred_user_id?: string | null
          referrer_user_id: string
          status?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          credits_awarded?: number | null
          id?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          status?: string | null
        }
        Relationships: []
      }
      release_tasks: {
        Row: {
          artist_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          release_id: string | null
          task_category: string
          task_description: string
          task_order: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artist_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          release_id: string
          task_category?: string
          task_description: string
          task_order?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artist_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          release_id?: string
          task_category?: string
          task_description?: string
          task_order?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      task_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          release_type: string
          tasks: Json
          template_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          release_type: string
          tasks: Json
          template_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          release_type?: string
          tasks?: Json
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      royalty_data: {
        Row: {
          artist_id: string | null
          country_code: string | null
          currency: string | null
          id: string
          period_end: string
          period_start: string
          platform: string
          playlist_adds: number | null
          release_id: string | null
          report_date: string | null
          revenue_usd: number | null
          royalty_rate: number | null
          saves: number | null
          shares: number | null
          streams: number | null
          unique_listeners: number | null
        }
        Insert: {
          artist_id?: string | null
          country_code?: string | null
          currency?: string | null
          id?: string
          period_end: string
          period_start: string
          platform: string
          playlist_adds?: number | null
          release_id?: string | null
          report_date?: string | null
          revenue_usd?: number | null
          royalty_rate?: number | null
          saves?: number | null
          shares?: number | null
          streams?: number | null
          unique_listeners?: number | null
        }
        Update: {
          artist_id?: string | null
          country_code?: string | null
          currency?: string | null
          id?: string
          period_end?: string
          period_start?: string
          platform?: string
          playlist_adds?: number | null
          release_id?: string | null
          report_date?: string | null
          revenue_usd?: number | null
          royalty_rate?: number | null
          saves?: number | null
          shares?: number | null
          streams?: number | null
          unique_listeners?: number | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          artist_id: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          isrc: string | null
          release_id: string | null
          song_title: string
          track_number: number | null
          updated_at: string | null
          user_id: string
          version_subtitle: string | null
          featured_artists: string | null
          explicit_content: boolean | null
          preview_start_time: number | null
          mix_engineer: string | null
          mastering_engineer: string | null
          remixer: string | null
          language_lyrics: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          isrc?: string | null
          release_id?: string | null
          song_title: string
          track_number?: number | null
          updated_at?: string | null
          user_id: string
          version_subtitle?: string | null
          featured_artists?: string | null
          explicit_content?: boolean | null
          preview_start_time?: number | null
          mix_engineer?: string | null
          mastering_engineer?: string | null
          remixer?: string | null
          language_lyrics?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          isrc?: string | null
          release_id?: string | null
          song_title?: string
          track_number?: number | null
          updated_at?: string | null
          user_id?: string
          version_subtitle?: string | null
          featured_artists?: string | null
          explicit_content?: boolean | null
          preview_start_time?: number | null
          mix_engineer?: string | null
          mastering_engineer?: string | null
          remixer?: string | null
          language_lyrics?: string | null
        }
        Relationships: []
      }
      split_sheet_contributors: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          percentage: number
          pro_affiliation: string | null
          publisher: string | null
          role: string
          signature_date: string | null
          signature_status: string | null
          split_sheet_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          percentage: number
          pro_affiliation?: string | null
          publisher?: string | null
          role: string
          signature_date?: string | null
          signature_status?: string | null
          split_sheet_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          percentage?: number
          pro_affiliation?: string | null
          publisher?: string | null
          role?: string
          signature_date?: string | null
          signature_status?: string | null
          split_sheet_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      split_sheets: {
        Row: {
          created_at: string | null
          id: string
          additional_notes: string | null
          album_project: string | null
          artist_name: string
          contributors: Json
          date_created: string | null
          release_id: string | null
          song_aka: string | null
          song_length: string | null
          song_title: string
          studio_location: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          additional_notes?: string | null
          album_project?: string | null
          artist_name: string
          contributors?: Json
          date_created?: string | null
          release_id?: string | null
          song_aka?: string | null
          song_length?: string | null
          song_title: string
          studio_location?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          additional_notes?: string | null
          album_project?: string | null
          artist_name?: string
          contributors?: Json
          date_created?: string | null
          release_id?: string | null
          song_aka?: string | null
          song_length?: string | null
          song_title?: string
          studio_location?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          plan_name: string | null
          price_cents: number | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          plan_name?: string | null
          price_cents?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          plan_name?: string | null
          price_cents?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tiktok_metrics: {
        Row: {
          collect_30d: number | null
          collect_365d: number | null
          comment_30d: number | null
          comment_365d: number | null
          date_ingested: string
          digg_30d: number | null
          digg_365d: number | null
          id: number
          name: string | null
          play_30d: number | null
          play_365d: number | null
          profile_url: string | null
          share_30d: number | null
          share_365d: number | null
          videos_published_30d: number | null
          videos_published_365d: number | null
        }
        Insert: {
          collect_30d?: number | null
          collect_365d?: number | null
          comment_30d?: number | null
          comment_365d?: number | null
          date_ingested: string
          digg_30d?: number | null
          digg_365d?: number | null
          id?: number
          name?: string | null
          play_30d?: number | null
          play_365d?: number | null
          profile_url?: string | null
          share_30d?: number | null
          share_365d?: number | null
          videos_published_30d?: number | null
          videos_published_365d?: number | null
        }
        Update: {
          collect_30d?: number | null
          collect_365d?: number | null
          comment_30d?: number | null
          comment_365d?: number | null
          date_ingested?: string
          digg_30d?: number | null
          digg_365d?: number | null
          id?: number
          name?: string | null
          play_30d?: number | null
          play_365d?: number | null
          profile_url?: string | null
          share_30d?: number | null
          share_365d?: number | null
          videos_published_30d?: number | null
          videos_published_365d?: number | null
        }
        Relationships: []
      }
      twitter_metrics: {
        Row: {
          date_ingested: string
          followers: number | null
          id: number
          like_30d: number | null
          like_365d: number | null
          profile_url: string | null
          quote_30d: number | null
          quote_365d: number | null
          reply_30d: number | null
          reply_365d: number | null
          retweet_30d: number | null
          retweet_365d: number | null
          username: string | null
        }
        Insert: {
          date_ingested: string
          followers?: number | null
          id?: number
          like_30d?: number | null
          like_365d?: number | null
          profile_url?: string | null
          quote_30d?: number | null
          quote_365d?: number | null
          reply_30d?: number | null
          reply_365d?: number | null
          retweet_30d?: number | null
          retweet_365d?: number | null
          username?: string | null
        }
        Update: {
          date_ingested?: string
          followers?: number | null
          id?: number
          like_30d?: number | null
          like_365d?: number | null
          profile_url?: string | null
          quote_30d?: number | null
          quote_365d?: number | null
          reply_30d?: number | null
          reply_365d?: number | null
          retweet_30d?: number | null
          retweet_365d?: number | null
          username?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          account_type: string | null
          api_calls_this_month: number | null
          apple_music_url: string | null
          artist_name: string | null
          banner_image_url: string | null
          billing_address: Json | null
          billing_email: string | null
          bio: string | null
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          display_name: string | null
          email_notifications: boolean | null
          first_name: string | null
          genre: string | null
          id: string
          instagram_url: string | null
          invoice_settings: Json | null
          is_public: boolean | null
          last_name: string | null
          last_payment_amount_cents: number | null
          last_payment_date: string | null
          last_payment_status: string | null
          location: string | null
          monthly_upload_limit: number | null
          next_payment_date: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_token: string | null
          onboarding_token_expires: string | null
          payment_method_last4: string | null
          phone_verified: boolean | null
          profile_image_url: string | null
          referral_code: string
          referral_credits: number | null
          referred_by: string | null
          spotify_url: string | null
          storage_used_mb: number | null
          stripe_created_at: string | null
          stripe_customer_id: string | null
          stripe_metadata: Json | null
          stripe_payment_method_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          stripe_updated_at: string | null
          subscription_currency: string | null
          subscription_interval: string | null
          subscription_plan_id: string | null
          subscription_plan_name: string | null
          subscription_price_cents: number | null
          subscription_status: string | null
          tax_id: string | null
          tiktok_url: string | null
          trial_end: string | null
          twitter_url: string | null
          updated_at: string | null
          usage_credits: number | null
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          account_type?: string | null
          api_calls_this_month?: number | null
          apple_music_url?: string | null
          artist_name?: string | null
          banner_image_url?: string | null
          billing_address?: Json | null
          billing_email?: string | null
          bio?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          genre?: string | null
          id: string
          instagram_url?: string | null
          invoice_settings?: Json | null
          is_public?: boolean | null
          last_name?: string | null
          last_payment_amount_cents?: number | null
          last_payment_date?: string | null
          last_payment_status?: string | null
          location?: string | null
          monthly_upload_limit?: number | null
          next_payment_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_token?: string | null
          onboarding_token_expires?: string | null
          payment_method_last4?: string | null
          phone_verified?: boolean | null
          profile_image_url?: string | null
          referral_code?: string
          referral_credits?: number | null
          referred_by?: string | null
          spotify_url?: string | null
          storage_used_mb?: number | null
          stripe_created_at?: string | null
          stripe_customer_id?: string | null
          stripe_metadata?: Json | null
          stripe_payment_method_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          stripe_updated_at?: string | null
          subscription_currency?: string | null
          subscription_interval?: string | null
          subscription_plan_id?: string | null
          subscription_plan_name?: string | null
          subscription_price_cents?: number | null
          subscription_status?: string | null
          tax_id?: string | null
          tiktok_url?: string | null
          trial_end?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          usage_credits?: number | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          account_type?: string | null
          api_calls_this_month?: number | null
          apple_music_url?: string | null
          artist_name?: string | null
          banner_image_url?: string | null
          billing_address?: Json | null
          billing_email?: string | null
          bio?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          genre?: string | null
          id?: string
          instagram_url?: string | null
          invoice_settings?: Json | null
          is_public?: boolean | null
          last_name?: string | null
          last_payment_amount_cents?: number | null
          last_payment_date?: string | null
          last_payment_status?: string | null
          location?: string | null
          monthly_upload_limit?: number | null
          next_payment_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_token?: string | null
          onboarding_token_expires?: string | null
          payment_method_last4?: string | null
          phone_verified?: boolean | null
          profile_image_url?: string | null
          referral_code?: string
          referral_credits?: number | null
          referred_by?: string | null
          spotify_url?: string | null
          storage_used_mb?: number | null
          stripe_created_at?: string | null
          stripe_customer_id?: string | null
          stripe_metadata?: Json | null
          stripe_payment_method_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          stripe_updated_at?: string | null
          subscription_currency?: string | null
          subscription_interval?: string | null
          subscription_plan_id?: string | null
          subscription_plan_name?: string | null
          subscription_price_cents?: number | null
          subscription_status?: string | null
          tax_id?: string | null
          tiktok_url?: string | null
          trial_end?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          usage_credits?: number | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      wrong_social_handle: {
        Row: {
          created_at: string
          id: number
          link: string | null
          platform: string | null
        }
        Insert: {
          created_at: string
          id?: number
          link?: string | null
          platform?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          link?: string | null
          platform?: string | null
        }
        Relationships: []
      }
      youtube_metrics: {
        Row: {
          date_ingested: string
          id: number
          likes_30d: number | null
          likes_365d: number | null
          profile_url: string | null
          username: string | null
          videos_30d: number | null
          videos_365d: number | null
          views_30d: number | null
          views_365d: number | null
        }
        Insert: {
          date_ingested: string
          id?: number
          likes_30d?: number | null
          likes_365d?: number | null
          profile_url?: string | null
          username?: string | null
          videos_30d?: number | null
          videos_365d?: number | null
          views_30d?: number | null
          views_365d?: number | null
        }
        Update: {
          date_ingested?: string
          id?: number
          likes_30d?: number | null
          likes_365d?: number | null
          profile_url?: string | null
          username?: string | null
          videos_30d?: number | null
          videos_365d?: number | null
          views_30d?: number | null
          views_365d?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: Record<string, never>; Returns: string }
      get_primary_assets: {
        Args: { asset_type_filter?: string }
        Returns: {
          asset_name: string
          asset_type: string
          dominant_colors: string[]
          file_url: string
          id: string
        }[]
      }
      is_admin_user: { Args: Record<string, never>; Returns: boolean }
      update_content_usage: { Args: { content_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Update"]

// Convenience type aliases for common tables
export type MusicRelease = Tables<"music_releases">
export type MusicReleaseInsert = TablesInsert<"music_releases">
export type MusicReleaseUpdate = TablesUpdate<"music_releases">

export type ReleaseTask = Tables<"release_tasks">
export type ReleaseTaskInsert = TablesInsert<"release_tasks">
export type ReleaseTaskUpdate = TablesUpdate<"release_tasks">

export type TaskTemplate = Tables<"task_templates">
export type TaskTemplateInsert = TablesInsert<"task_templates">
export type TaskTemplateUpdate = TablesUpdate<"task_templates">

export type ArtistProfile = Tables<"artist_profiles">
export type ArtistProfileInsert = TablesInsert<"artist_profiles">
export type ArtistProfileUpdate = TablesUpdate<"artist_profiles">

export type UserProfile = Tables<"user_profiles">
export type UserProfileInsert = TablesInsert<"user_profiles">
export type UserProfileUpdate = TablesUpdate<"user_profiles">

export type Song = Tables<"songs">
export type SongInsert = TablesInsert<"songs">
export type SongUpdate = TablesUpdate<"songs">

export type LyricSheet = Tables<"lyric_sheets">
export type LyricSheetInsert = TablesInsert<"lyric_sheets">
export type LyricSheetUpdate = TablesUpdate<"lyric_sheets">

export type Subscription = Tables<"subscriptions">
export type SubscriptionInsert = TablesInsert<"subscriptions">
export type SubscriptionUpdate = TablesUpdate<"subscriptions">

export type SplitSheet = Tables<"split_sheets">
export type SplitSheetInsert = TablesInsert<"split_sheets">
export type SplitSheetUpdate = TablesUpdate<"split_sheets">

export type SplitSheetContributor = Tables<"split_sheet_contributors">
export type SplitSheetContributorInsert = TablesInsert<"split_sheet_contributors">
export type SplitSheetContributorUpdate = TablesUpdate<"split_sheet_contributors">
