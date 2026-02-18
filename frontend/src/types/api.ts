/**
 * API Types - Centralized Type Definitions
 * All Access Artist - Frontend v2.0.0
 * 
 * This file contains all TypeScript interfaces for API requests and responses.
 * Using centralized types ensures consistency across the application and
 * eliminates the need for 'any' types in API calls.
 * 
 * Organization:
 * 1. Base API response types
 * 2. Entity types (Release, Artist, Task, etc.)
 * 3. Request/Response types for each API endpoint
 */

// ============================================
// BASE API RESPONSE TYPES
// ============================================

/**
 * Standard API response wrapper from backend
 * All backend responses follow this format
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
  }
}

export type BackendResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Frontend API client response wrapper
 * Used by makeRequest methods in api.ts
 */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}

// ============================================
// RELEASE TYPES
// ============================================

export type ReleaseType = 'single' | 'ep' | 'album' | 'mixtape'
export type ReleaseStatus = 'draft' | 'scheduled' | 'released'

export interface Release {
  id: string
  user_id: string
  title: string
  release_date: string
  release_type: ReleaseType
  status: ReleaseStatus
  description?: string
  genre?: string
  cover_art_url?: string
  streaming_links?: Record<string, string>
  created_at: string
  updated_at: string
}

export interface CreateReleaseData {
  title: string
  user_id?: string
  release_date: string
  release_type: ReleaseType
  status?: ReleaseStatus
  description?: string
  genre?: string
  upc?: string
  label?: string
  language_lyrics?: string
  phonogram_copyright?: string
  composition_copyright?: string
  sub_genre?: string
  territories?: string[]
  explicit_content?: boolean
  songwriters?: string
  producers?: string
  copyright_year?: number
  track_description?: string
  version_subtitle?: string
}

export interface UpdateReleaseData {
  title?: string
  release_date?: string
  release_type?: ReleaseType
  status?: ReleaseStatus
  description?: string
  genre?: string
  cover_art_url?: string
  upc?: string
  label?: string
  language_lyrics?: string
  phonogram_copyright?: string
  composition_copyright?: string
  sub_genre?: string
  territories?: string[]
  explicit_content?: boolean
  songwriters?: string
  producers?: string
  copyright_year?: number
  track_description?: string
  version_subtitle?: string
}

// ============================================
// RELEASE DETAILS (Extended Release with related data)
// ============================================

export interface ReleaseTask {
  id: string
  release_id: string
  user_id: string
  task_description: string
  task_category: string
  task_order: number
  completed_at?: string | null
  created_at: string
  updated_at: string
}

export interface Song {
  id: string
  release_id: string
  user_id: string
  song_title: string
  duration_seconds?: number
  track_number: number
  created_at: string
  updated_at: string
}

export type LyricSectionType = 'verse' | 'chorus' | 'pre-chorus' | 'bridge' | 'refrain' | 'outro' | 'intro' | 'hook' | 'ad-lib'

export interface LyricSection {
  id: string
  section_type: LyricSectionType
  content: string
  section_order: number
  created_at: string
  updated_at: string
}

export interface LyricSheet {
  id: string
  release_id: string
  user_id: string
  title: string
  lyrics: string
  structure?: Record<string, unknown>
  notes?: string
  version: string
  created_at: string
  updated_at: string
  sections: LyricSection[]
}

export interface ReleaseDetails extends Release {
  tasks?: ReleaseTask[]
  songs?: Song[]
  lyric_sheets?: LyricSheet[]
  release_tasks: ReleaseTask[]
  soundcloud_url?: string
  is_explicit?: boolean
  total_tracks?: number
  label?: string
  catalog_number?: string
  upc_code?: string
  isrc_code?: string
  copyright_info?: string
  producer_credits?: string
  songwriter_credits?: string
  recording_location?: string
  mastering_engineer?: string
  mixing_engineer?: string
  project_budget?: number
  additional_data?: Record<string, unknown>
}

// ============================================
// ARTIST TYPES
// ============================================

export interface Artist {
  id: string
  user_id: string
  artist_name: string
  real_name?: string
  bio?: string
  genre?: string
  location?: string
  website_url?: string
  spotify_url?: string
  apple_music_url?: string
  youtube_url?: string
  instagram_url?: string
  tiktok_url?: string
  twitter_url?: string
  profile_image_url?: string
  banner_image_url?: string
  is_public: boolean
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export interface CreateArtistData {
  artist_name: string
  real_name?: string
  bio?: string
  genre?: string
  location?: string
  website_url?: string
  spotify_url?: string
  apple_music_url?: string
  youtube_url?: string
  instagram_url?: string
  tiktok_url?: string
  twitter_url?: string
}

export interface UpdateSocialMediaData {
  spotify_url?: string
  apple_music_url?: string
  youtube_url?: string
  instagram_url?: string
  tiktok_url?: string
  twitter_url?: string
  website_url?: string
}

// ============================================
// TASK TYPES
// ============================================

export type TaskCategory = 'creative' | 'marketing' | 'distribution' | 'legal' | 'other'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Task {
  id: string
  release_id: string
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  due_date?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  status?: TaskStatus
  due_date?: string | null
  completed_at?: string | null
}

// ============================================
// PROFILE TYPES
// ============================================

export type AccountType = 'admin' | 'artist' | 'manager' | 'label'

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  phone_verified: boolean
  account_type?: AccountType
  billing_address?: BillingAddress
  payment_method_last4?: string
  referral_code: string
  referral_credits: number
  subscription_status?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

export interface BillingAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  billing_address?: BillingAddress
}

export interface ReferralStats {
  total_referrals: number
  total_credits: number
  pending_credits: number
}

export interface ReferralValidation {
  valid: boolean
  referrer?: {
    id: string
    first_name: string
    last_name: string
  }
  message: string
}

export interface ReferralApplication {
  success: boolean
  referrer: {
    id: string
    first_name: string
    last_name: string
  }
  credits_awarded: number
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsData {
  id: string
  user_id: string
  metric: string
  value: number
  date: string
  created_at: string
}

export interface CreateAnalyticsData {
  metric: string
  value: number
  date: string
}

// ============================================
// CALENDAR TYPES
// ============================================

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  date: string
  type: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CreateCalendarEventData {
  title: string
  date: string
  type: string
  description?: string
}

// ============================================
// SONG TYPES
// ============================================

export interface CreateSongData {
  song_title: string
  track_number: number
  duration_seconds?: number
}

export interface UpdateSongData {
  song_title?: string
  track_number?: number
  duration_seconds?: number
}

// ============================================
// LYRIC TYPES
// ============================================

export interface CreateLyricSheetData {
  written_by?: string
  additional_notes?: string
}

export interface UpdateLyricSheetData {
  written_by?: string
  additional_notes?: string
}

export interface CreateLyricSectionData {
  section_type: LyricSectionType
  content: string
}

export interface UpdateLyricSectionData {
  section_type?: LyricSectionType
  content?: string
  section_order?: number
}

// ============================================
// SPLIT SHEET TYPES
// ============================================

export interface SplitSheetContributor {
  legal_name: string
  stage_name?: string
  role: 'writer' | 'co-writer' | 'lyricist' | 'composer' | 'producer' | 'arranger' | 'beat-maker'
  contribution?: string
  writer_share_percent: number
  publisher_share_percent: number
  contact?: {
    email?: string
    phone?: string
    address?: string
  }
  pro_affiliation?: string
  ipi_number?: string
  publisher?: {
    company_name?: string
    pro_affiliation?: string
    ipi_number?: string
    contact?: {
      email?: string
      phone?: string
      address?: string
    }
  }
}

export interface SplitSheet {
  id: string
  user_id: string
  song_title: string
  song_aka?: string
  artist_name: string
  album_project?: string
  date_created?: string
  song_length?: string
  studio_location?: string
  additional_notes?: string
  contributors: SplitSheetContributor[]
  release_id?: string
  created_at: string
  updated_at: string
}

export interface CreateSplitSheetData {
  song_title: string
  song_aka?: string
  artist_name: string
  album_project?: string
  date_created?: string
  song_length?: string
  studio_location?: string
  additional_notes?: string
  contributors: SplitSheetContributor[]
  release_id?: string
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export interface SubscriptionStatus {
  has_subscription: boolean
  subscription_status: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export interface SubscriptionProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  price_id: string
}

export interface CheckoutSessionData {
  price_id: string
  success_url: string
  cancel_url: string
}

export interface CheckoutSessionResponse {
  url: string
  session_id: string
}

// ============================================
// ADMIN TYPES
// ============================================

export interface AdminUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  account_type: AccountType
  created_at: string
  phone_verified: boolean | null
}

export interface AdminStats {
  total_users: number
  active_subscriptions: number
  total_releases: number
  total_revenue: number
}

// ============================================
// ONBOARDING TYPES
// ============================================

export interface OnboardingData {
  session_id: string
  full_name: string
  email: string
  phone?: string | null
  artist_name?: string | null
  referral_code?: string | null
  password: string
}

export interface FallbackAccountResponse {
  user_id: string
  email: string
}

// ============================================
// HEALTH CHECK
// ============================================

export interface HealthCheckResponse {
  status: string
  timestamp: string
  version?: string
}

// ============================================
// ZOD VALIDATION ERROR TYPE
// ============================================

export interface ZodValidationIssue {
  message: string
  path: (string | number)[]
  code: string
}

export interface ZodValidationError {
  message?: string
  issues?: ZodValidationIssue[]
}

/**
 * Type guard to check if error is a Zod validation error
 */
export function isZodValidationError(error: unknown): error is ZodValidationError {
  if (typeof error !== 'object' || error === null) return false
  const e = error as Record<string, unknown>
  return Array.isArray(e['issues']) || typeof e['message'] === 'string'
}

/**
 * Extract error message from various error formats
 */
export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (isZodValidationError(error)) {
    if (error.message) {
      return error.message
    }
    if (error.issues && error.issues.length > 0) {
      return error.issues.map(issue => issue.message).join(', ')
    }
  }
  
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>
    if (typeof e['message'] === 'string') {
      return e['message']
    }
  }
  
  return defaultMessage
}
