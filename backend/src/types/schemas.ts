/**
 * Zod Schemas for Request/Response Validation
 * All Access Artist - Backend API v2.0.0
 */
import { z } from 'zod'

// Release Schemas
export const CreateReleaseSchema = z.object({
  title: z.string().max(200, 'Title too long').optional(),
  user_id: z.string().uuid('Invalid user ID').optional(),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Release date must be in YYYY-MM-DD format').optional(),
  release_type: z.enum(['single', 'album', 'ep', 'mixtape'], {
    errorMap: () => ({ message: 'Release type must be single, album, ep, or mixtape' })
  }).optional(),
  status: z.enum(['draft', 'scheduled', 'released']).default('draft'),
  description: z.string().max(1000, 'Description too long').optional(),
  genre: z.string().max(100, 'Genre too long').optional(),
  cover_art_url: z.string().url('Invalid cover art URL').optional(),
  streaming_links: z.record(z.string().url('Invalid streaming link')).optional(),
  // Label Copy fields
  version_subtitle: z.string().max(200, 'Version subtitle too long').optional(),
  phonogram_copyright: z.string().max(200, 'Phonogram copyright too long').optional(),
  composition_copyright: z.string().max(200, 'Composition copyright too long').optional(),
  sub_genre: z.string().max(100, 'Sub-genre too long').optional(),
  territories: z.array(z.string().max(50, 'Territory name too long')).optional(),
  explicit_content: z.boolean().default(false),
  language_lyrics: z.string().max(10, 'Language code too long').default('en'),
  songwriters: z.string().max(500, 'Songwriters list too long').optional(),
  producers: z.string().max(500, 'Producers list too long').optional(),
  copyright_year: z.number().int().min(1900).max(2100).optional(),
  track_description: z.string().max(1000, 'Track description too long').optional(),
  // Additional Label Copy fields
  upc: z.string().max(20, 'UPC code too long').optional(),
  label: z.string().max(200, 'Label name too long').optional()
})

export const UpdateReleaseSchema = CreateReleaseSchema.partial()

// Artist Schemas
export const CreateArtistSchema = z.object({
  artist_name: z.string().min(1, 'Artist name is required').max(100, 'Artist name too long'),
  real_name: z.string().max(100, 'Real name too long').optional(),
  bio: z.string().max(2000, 'Bio too long').optional(),
  genre: z.string().max(100, 'Genre too long').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  website_url: z.string().url('Invalid website URL').optional(),
  spotify_url: z.string().url('Invalid Spotify URL').optional(),
  apple_music_url: z.string().url('Invalid Apple Music URL').optional(),
  youtube_url: z.string().url('Invalid YouTube URL').optional(),
  instagram_url: z.string().url('Invalid Instagram URL').optional(),
  tiktok_url: z.string().url('Invalid TikTok URL').optional(),
  twitter_url: z.string().url('Invalid Twitter URL').optional(),
  profile_image_url: z.string().url('Invalid profile image URL').optional(),
  banner_image_url: z.string().url('Invalid banner image URL').optional(),
  is_public: z.boolean().default(true),
  email_notifications: z.boolean().default(true),
  user_id: z.string().uuid('Invalid user ID').optional() // Will be set by backend
})

export const UpdateArtistSchema = CreateArtistSchema.partial()

// Task Schemas
export const CreateTaskSchema = z.object({
  release_id: z.string().uuid('Invalid release ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  category: z.enum(['creative', 'marketing', 'distribution', 'legal', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  due_date: z.string().datetime('Invalid due date').optional(),
  order_index: z.number().int().min(0).optional()
})

export const UpdateTaskSchema = CreateTaskSchema.partial().omit({ release_id: true })

// Song Schemas
export const CreateSongSchema = z.object({
  // Note: release_id is handled via URL parameter, not request body
  song_title: z.string().min(1, 'Song title is required').max(200, 'Song title too long'),
  track_number: z.number().int().min(1, 'Track number must be positive'),
  duration_seconds: z.number().int().min(1, 'Duration must be positive').optional(),
  // New Label Copy fields for songs
  version_subtitle: z.string().max(200, 'Version subtitle too long').optional(),
  featured_artists: z.string().max(300, 'Featured artists too long').optional(),
  explicit_content: z.boolean().default(false),
  preview_start_time: z.number().int().min(0, 'Preview start time must be non-negative').optional(),
  mix_engineer: z.string().max(200, 'Mix engineer name too long').optional(),
  mastering_engineer: z.string().max(200, 'Mastering engineer name too long').optional(),
  remixer: z.string().max(200, 'Remixer name too long').optional(),
  // Track-level ISRC and language fields
  isrc: z.string().max(12, 'ISRC code too long').optional(),
  language_lyrics: z.string().max(10, 'Language code too long').default('en'),
  // Song-level songwriter and producer fields
  songwriters: z.string().max(500, 'Songwriters list too long').optional(),
  producers: z.string().max(500, 'Producers list too long').optional()
})

export const UpdateSongSchema = CreateSongSchema.partial()

// Label Copy Schemas
export const CreateLabelCopySchema = z.object({
  release_id: z.string().uuid('Invalid release ID'),
  user_id: z.string().uuid('Invalid user ID').optional(), // Will be set by backend
  version_subtitle: z.string().max(200, 'Version subtitle too long').optional(),
  phonogram_copyright: z.string().max(200, 'Phonogram copyright too long').optional(),
  composition_copyright: z.string().max(200, 'Composition copyright too long').optional(),
  sub_genre: z.string().max(100, 'Sub-genre too long').optional(),
  territories: z.array(z.string().max(50, 'Territory name too long')).optional(),
  explicit_content: z.boolean().default(false),
  language_lyrics: z.string().max(10, 'Language code too long').default('en'),
  upc_code: z.string().max(20, 'UPC code too long').optional(),
  copyright_year: z.number().int().min(1900).max(2100).optional(),
  tracks_metadata: z.array(z.object({
    track_number: z.number().int().min(1, 'Track number must be positive'),
    duration_seconds: z.number().int().min(1, 'Duration must be positive').optional(),
    isrc: z.string().max(12, 'ISRC code too long').optional(),
    version_subtitle: z.string().max(200, 'Version subtitle too long').optional(),
    featured_artists: z.string().max(300, 'Featured artists too long').optional(),
    explicit_content: z.boolean().default(false),
    preview_start_time: z.number().int().min(0, 'Preview start time must be non-negative').optional(),
    mix_engineer: z.string().max(200, 'Mix engineer name too long').optional(),
    mastering_engineer: z.string().max(200, 'Mastering engineer name too long').optional(),
    remixer: z.string().max(200, 'Remixer name too long').optional(),
    songwriters: z.string().max(500, 'Songwriters list too long').optional(),
    producers: z.string().max(500, 'Producers list too long').optional(),
    sub_genre: z.string().max(100, 'Sub-genre too long').optional(),
    language_lyrics: z.string().max(10, 'Language code too long').default('en')
  })).default([])
})

export const UpdateLabelCopySchema = CreateLabelCopySchema.partial().omit({ release_id: true })

// Lyric Sheet Schemas
export const CreateLyricSheetSchema = z.object({
  song_id: z.string().uuid('Invalid song ID'),
  user_id: z.string().uuid('Invalid user ID'),
  written_by: z.string().max(200, 'Written by too long').optional(),
  additional_notes: z.string().max(2000, 'Notes too long').optional()
})

export const UpdateLyricSheetSchema = CreateLyricSheetSchema.partial()

// Lyric Section Schemas (matching database constraints)
export const CreateLyricSectionSchema = z.object({
  section_type: z.enum(['verse', 'chorus', 'pre-chorus', 'bridge', 'refrain', 'outro', 'intro', 'hook', 'ad-lib']),
  content: z.string().min(1, 'Content is required')
})

export const UpdateLyricSectionSchema = z.object({
  section_type: z.enum(['verse', 'chorus', 'pre-chorus', 'bridge', 'refrain', 'outro', 'intro', 'hook', 'ad-lib']).optional(),
  section_order: z.number().int().min(0).optional(),
  content: z.string().min(1, 'Content is required').optional()
})

// Placeholder schemas for missing imports
export const CreateAnalyticsSchema = z.object({
  metric: z.string(),
  value: z.number(),
  date: z.string().datetime()
})

export const CreateCalendarSchema = z.object({
  title: z.string(),
  date: z.string().datetime(),
  type: z.string()
})

// Split Sheet Schemas
export const CreateSplitSheetSchema = z.object({
  song_id: z.string().uuid('Invalid song ID'),
  user_id: z.string().uuid('Invalid user ID'),
  song_title: z.string().min(1, 'Song title is required').max(200, 'Song title too long'),
  release_title: z.string().min(1, 'Release title is required').max(200, 'Release title too long'),
  aka_titles: z.array(z.string().max(200, 'AKA title too long')).optional(),
  creation_location: z.string().max(200, 'Creation location too long').optional(),
  sample_use_clause: z.string().max(2000, 'Sample use clause too long').optional(),
  agreement_date: z.string().date('Invalid agreement date').optional(),
  is_signed: z.boolean().default(false),
  sheet_created_at: z.string().date('Invalid sheet creation date').optional()
})

export const UpdateSplitSheetSchema = CreateSplitSheetSchema.partial().omit({ song_id: true, user_id: true })

// Split Sheet Writer Schemas
export const CreateSplitSheetWriterSchema = z.object({
  split_sheet_id: z.string().uuid('Invalid split sheet ID'),
  user_id: z.string().uuid('Invalid user ID'),
  legal_name: z.string().min(1, 'Legal name is required').max(200, 'Legal name too long'),
  stage_name: z.string().max(200, 'Stage name too long').optional(),
  mailing_address: z.string().max(500, 'Mailing address too long').optional(),
  phone_number: z.string().max(20, 'Phone number too long').optional(),
  email_address: z.string().email('Invalid email address').optional(),
  pro_affiliation: z.enum(['ASCAP', 'BMI', 'SESAC', 'SOCAN', 'PRS', 'GEMA', 'Other']).optional(),
  ipi_cae_number: z.string().max(50, 'IPI/CAE number too long').optional(),
  role: z.string().max(100, 'Role too long').optional(),
  contribution_description: z.string().max(500, 'Contribution description too long').optional(),
  writers_share_percentage: z.number().min(0, 'Writers share must be non-negative').max(100, 'Writers share cannot exceed 100%').optional(),
  publishers_share_percentage: z.number().min(0, 'Publishers share must be non-negative').max(100, 'Publishers share cannot exceed 100%').optional(),
  split_percentage: z.number().min(0, 'Split percentage must be non-negative').max(100, 'Split percentage cannot exceed 100%').optional(),
  publishing_info: z.string().max(500, 'Publishing info too long').optional(),
  writer_order: z.number().int().min(1, 'Writer order must be positive').default(1),
  signature_date: z.string().datetime('Invalid signature date').optional(),
  signature_ip_address: z.string().ip('Invalid IP address').optional()
})

export const UpdateSplitSheetWriterSchema = CreateSplitSheetWriterSchema.partial().omit({ split_sheet_id: true, user_id: true })

// Split Sheet Publisher Schemas
export const CreateSplitSheetPublisherSchema = z.object({
  writer_id: z.string().uuid('Invalid writer ID'),
  user_id: z.string().uuid('Invalid user ID'),
  company_name: z.string().min(1, 'Company name is required').max(200, 'Company name too long'),
  pro_affiliation: z.enum(['ASCAP', 'BMI', 'SESAC', 'SOCAN', 'PRS', 'GEMA', 'Other']).optional(),
  ipi_cae_number: z.string().max(50, 'IPI/CAE number too long').optional(),
  contact_address: z.string().max(500, 'Contact address too long').optional(),
  contact_phone: z.string().max(20, 'Contact phone too long').optional(),
  contact_email: z.string().email('Invalid contact email').optional()
})

export const UpdateSplitSheetPublisherSchema = CreateSplitSheetPublisherSchema.partial().omit({ writer_id: true, user_id: true })

// Response Schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  requestId: z.string().optional()
})

// User Profile Schemas
export const CreateUserProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name too long').optional(),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name too long').optional(),
  phone_verified: z.boolean().optional(),
  billing_address: z.object({
    street: z.string().max(200, 'Street too long').optional(),
    city: z.string().max(100, 'City too long').optional(),
    state: z.string().max(100, 'State too long').optional(),
    zip: z.string().max(20, 'ZIP too long').optional(),
    country: z.string().max(100, 'Country too long').optional()
  }).optional(),
  payment_method_last4: z.string().regex(/^\d{4}$/, 'Must be 4 digits').optional()
})

export const UpdateUserProfileSchema = CreateUserProfileSchema.partial()

export const ReferralValidationSchema = z.object({
  referral_code: z.string().regex(/^[A-Z0-9]{6}$/, 'Invalid referral code format')
})

// Export types
export type CreateReleaseData = z.infer<typeof CreateReleaseSchema>
export type UpdateReleaseData = z.infer<typeof UpdateReleaseSchema>
export type CreateArtistData = z.infer<typeof CreateArtistSchema>
export type UpdateArtistData = z.infer<typeof UpdateArtistSchema>
export type CreateTaskData = z.infer<typeof CreateTaskSchema>
export type UpdateTaskData = z.infer<typeof UpdateTaskSchema>
export type CreateLyricSheetData = z.infer<typeof CreateLyricSheetSchema>
export type UpdateLyricSheetData = z.infer<typeof UpdateLyricSheetSchema>
export type CreateLyricSectionData = z.infer<typeof CreateLyricSectionSchema>
export type UpdateLyricSectionData = z.infer<typeof UpdateLyricSectionSchema>
export type CreateAnalyticsData = z.infer<typeof CreateAnalyticsSchema>
export type CreateCalendarData = z.infer<typeof CreateCalendarSchema>
export type CreateSongData = z.infer<typeof CreateSongSchema>
export type UpdateSongData = z.infer<typeof UpdateSongSchema>
export type CreateSplitSheetData = z.infer<typeof CreateSplitSheetSchema>
export type UpdateSplitSheetData = z.infer<typeof UpdateSplitSheetSchema>
export type CreateSplitSheetWriterData = z.infer<typeof CreateSplitSheetWriterSchema>
export type UpdateSplitSheetWriterData = z.infer<typeof UpdateSplitSheetWriterSchema>
export type CreateSplitSheetPublisherData = z.infer<typeof CreateSplitSheetPublisherSchema>
export type UpdateSplitSheetPublisherData = z.infer<typeof UpdateSplitSheetPublisherSchema>
export type CreateUserProfileData = z.infer<typeof CreateUserProfileSchema>
export type UpdateUserProfileData = z.infer<typeof UpdateUserProfileSchema>
export type ReferralValidationData = z.infer<typeof ReferralValidationSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>
