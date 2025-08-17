/**
 * Zod Schemas for Request/Response Validation
 * All Access Artist - Backend API v2.0.0
 */
import { z } from 'zod'

// Release Schemas
export const CreateReleaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  artist_id: z.string().uuid('Invalid artist ID'),
  release_date: z.string().datetime('Invalid release date'),
  release_type: z.enum(['single', 'album', 'ep', 'mixtape'], {
    errorMap: () => ({ message: 'Release type must be single, album, ep, or mixtape' })
  }),
  status: z.enum(['draft', 'scheduled', 'released']).default('draft'),
  description: z.string().max(1000, 'Description too long').optional(),
  genre: z.string().max(100, 'Genre too long').optional(),
  cover_art_url: z.string().url('Invalid cover art URL').optional(),
  streaming_links: z.record(z.string().url('Invalid streaming link')).optional()
})

export const UpdateReleaseSchema = CreateReleaseSchema.partial()

// Artist Schemas
export const CreateArtistSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  bio: z.string().max(2000, 'Bio too long').optional(),
  website: z.string().url('Invalid website URL').optional(),
  social_links: z.record(z.string().url('Invalid social link')).optional()
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

// Lyric Sheet Schemas
export const CreateLyricSheetSchema = z.object({
  song_id: z.string().uuid('Invalid song ID'),
  artist_id: z.string().uuid('Invalid artist ID'),
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
export type CreateUserProfileData = z.infer<typeof CreateUserProfileSchema>
export type UpdateUserProfileData = z.infer<typeof UpdateUserProfileSchema>
export type ReferralValidationData = z.infer<typeof ReferralValidationSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>
