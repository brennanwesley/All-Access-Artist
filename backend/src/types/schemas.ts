/**
 * Zod validation schemas for API endpoints
 * All Access Artist - Backend API v2.0.0
 */
import { z } from 'zod'

export const CreateReleaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist_id: z.string().uuid('Invalid artist ID'),
  release_date: z.string().datetime('Invalid release date'),
  type: z.enum(['single', 'album', 'ep'], {
    errorMap: () => ({ message: 'Type must be single, album, or ep' })
  }),
  status: z.enum(['draft', 'scheduled', 'released']).optional().default('draft'),
  description: z.string().optional(),
  genre: z.string().optional(),
  cover_art_url: z.string().url().optional(),
  streaming_links: z.record(z.string().url()).optional()
})

export const CreateArtistSchema = z.object({
  artist_name: z.string().min(1, 'Artist name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  genre: z.string().optional(),
  location: z.string().optional(),
  profile_image_url: z.string().url().optional(),
  is_public: z.boolean().optional().default(true),
  social_media_links: z.record(z.string().url()).optional()
})

export const CreateCalendarSchema = z.object({
  artist_id: z.string().uuid('Invalid artist ID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  event_date: z.string().datetime('Invalid event date'),
  event_type: z.string().min(1, 'Event type is required'),
  status: z.enum(['draft', 'scheduled', 'published']).optional().default('draft'),
  platform: z.string().optional(),
  content_url: z.string().url().optional()
})

export const CreateAnalyticsSchema = z.object({
  artist_id: z.string().uuid('Invalid artist ID'),
  metric_name: z.string().min(1, 'Metric name is required'),
  metric_value: z.number(),
  date_recorded: z.string().datetime('Invalid date'),
  platform: z.string().optional(),
  additional_data: z.record(z.any()).optional()
})

// Type inference from schemas
export type CreateReleaseData = z.infer<typeof CreateReleaseSchema>
export type CreateArtistData = z.infer<typeof CreateArtistSchema>
export type CreateCalendarData = z.infer<typeof CreateCalendarSchema>
export type CreateAnalyticsData = z.infer<typeof CreateAnalyticsSchema>
