/**
 * Schema Validation Tests
 * All Access Artist - Backend Testing
 * 
 * These tests verify that Zod schemas correctly validate input data.
 * This is critical for API security - invalid data should be rejected
 * before it reaches the database or business logic.
 * 
 * Test Categories:
 * 1. Release schemas - Create/Update release validation
 * 2. Artist schemas - Artist profile validation
 * 3. Task schemas - Release task validation
 * 4. Referral schemas - Referral code format validation
 * 
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest'
import {
  CreateReleaseSchema,
  UpdateReleaseSchema,
  CreateArtistSchema,
  CreateTaskSchema,
  ReferralValidationSchema,
  CreateSongSchema,
  CreateLabelCopySchema
} from '../types/schemas.js'

// ============================================
// RELEASE SCHEMA TESTS
// ============================================
describe('CreateReleaseSchema', () => {
  /**
   * Valid release data should pass validation
   */
  it('should accept valid release data', () => {
    const validRelease = {
      title: 'My New Album',
      release_date: '2026-03-15',
      release_type: 'album',
      status: 'draft',
      description: 'A great album',
      genre: 'Hip Hop'
    }

    const result = CreateReleaseSchema.safeParse(validRelease)
    expect(result.success).toBe(true)
  })

  /**
   * Release date must be in YYYY-MM-DD format
   */
  it('should reject invalid release date format', () => {
    const invalidRelease = {
      title: 'My Album',
      release_date: '03/15/2026', // Wrong format
      release_type: 'album'
    }

    const result = CreateReleaseSchema.safeParse(invalidRelease)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('YYYY-MM-DD')
    }
  })

  /**
   * Release type must be one of: single, album, ep, mixtape
   */
  it('should reject invalid release type', () => {
    const invalidRelease = {
      title: 'My Album',
      release_date: '2026-03-15',
      release_type: 'podcast' // Invalid type
    }

    const result = CreateReleaseSchema.safeParse(invalidRelease)
    expect(result.success).toBe(false)
  })

  /**
   * All valid release types should be accepted
   */
  it('should accept all valid release types', () => {
    const releaseTypes = ['single', 'album', 'ep', 'mixtape']

    releaseTypes.forEach((type) => {
      const release = {
        title: 'Test Release',
        release_date: '2026-03-15',
        release_type: type
      }

      const result = CreateReleaseSchema.safeParse(release)
      expect(result.success).toBe(true)
    })
  })

  /**
   * Title should not exceed 200 characters
   */
  it('should reject title exceeding max length', () => {
    const invalidRelease = {
      title: 'A'.repeat(201), // 201 characters
      release_date: '2026-03-15',
      release_type: 'album'
    }

    const result = CreateReleaseSchema.safeParse(invalidRelease)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('too long')
    }
  })

  /**
   * Status should default to 'draft' if not provided
   */
  it('should default status to draft', () => {
    const release = {
      title: 'My Album',
      release_date: '2026-03-15',
      release_type: 'album'
    }

    const result = CreateReleaseSchema.safeParse(release)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('draft')
    }
  })

  /**
   * UUID validation for user_id
   */
  it('should reject invalid UUID for user_id', () => {
    const invalidRelease = {
      title: 'My Album',
      user_id: 'not-a-valid-uuid'
    }

    const result = CreateReleaseSchema.safeParse(invalidRelease)
    expect(result.success).toBe(false)
  })

  /**
   * Valid UUID should be accepted for user_id
   */
  it('should accept valid UUID for user_id', () => {
    const validRelease = {
      title: 'My Album',
      user_id: 'e85e1294-632b-42c1-85ba-8c6648fc0467'
    }

    const result = CreateReleaseSchema.safeParse(validRelease)
    expect(result.success).toBe(true)
  })
})

// ============================================
// ARTIST SCHEMA TESTS
// ============================================
describe('CreateArtistSchema', () => {
  /**
   * Artist name is required
   */
  it('should require artist_name', () => {
    const invalidArtist = {
      bio: 'A great artist'
      // Missing artist_name
    }

    const result = CreateArtistSchema.safeParse(invalidArtist)
    expect(result.success).toBe(false)
  })

  /**
   * Valid artist data should pass
   */
  it('should accept valid artist data', () => {
    const validArtist = {
      artist_name: 'DJ Test',
      real_name: 'John Doe',
      bio: 'A talented musician',
      genre: 'Electronic'
    }

    const result = CreateArtistSchema.safeParse(validArtist)
    expect(result.success).toBe(true)
  })

  /**
   * URL fields must be valid URLs
   */
  it('should reject invalid URLs', () => {
    const invalidArtist = {
      artist_name: 'DJ Test',
      spotify_url: 'not-a-url'
    }

    const result = CreateArtistSchema.safeParse(invalidArtist)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid')
    }
  })

  /**
   * Valid URLs should be accepted
   */
  it('should accept valid URLs', () => {
    const validArtist = {
      artist_name: 'DJ Test',
      spotify_url: 'https://open.spotify.com/artist/123',
      instagram_url: 'https://instagram.com/djtest',
      website_url: 'https://djtest.com'
    }

    const result = CreateArtistSchema.safeParse(validArtist)
    expect(result.success).toBe(true)
  })

  /**
   * Bio should not exceed 2000 characters
   */
  it('should reject bio exceeding max length', () => {
    const invalidArtist = {
      artist_name: 'DJ Test',
      bio: 'A'.repeat(2001)
    }

    const result = CreateArtistSchema.safeParse(invalidArtist)
    expect(result.success).toBe(false)
  })
})

// ============================================
// TASK SCHEMA TESTS
// ============================================
describe('CreateTaskSchema', () => {
  /**
   * Valid task data should pass
   */
  it('should accept valid task data', () => {
    const validTask = {
      release_id: 'e85e1294-632b-42c1-85ba-8c6648fc0467',
      title: 'Submit to Spotify',
      category: 'distribution',
      priority: 'high'
    }

    const result = CreateTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  /**
   * release_id is required and must be valid UUID
   */
  it('should require valid release_id', () => {
    const invalidTask = {
      title: 'Submit to Spotify',
      category: 'distribution'
      // Missing release_id
    }

    const result = CreateTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
  })

  /**
   * Category must be one of the allowed values
   */
  it('should reject invalid category', () => {
    const invalidTask = {
      release_id: 'e85e1294-632b-42c1-85ba-8c6648fc0467',
      title: 'Submit to Spotify',
      category: 'invalid-category'
    }

    const result = CreateTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
  })

  /**
   * All valid categories should be accepted
   */
  it('should accept all valid categories', () => {
    const categories = ['creative', 'marketing', 'distribution', 'legal', 'other']

    categories.forEach((category) => {
      const task = {
        release_id: 'e85e1294-632b-42c1-85ba-8c6648fc0467',
        title: 'Test Task',
        category
      }

      const result = CreateTaskSchema.safeParse(task)
      expect(result.success).toBe(true)
    })
  })

  /**
   * Priority should default to 'medium'
   */
  it('should default priority to medium', () => {
    const task = {
      release_id: 'e85e1294-632b-42c1-85ba-8c6648fc0467',
      title: 'Test Task',
      category: 'marketing'
    }

    const result = CreateTaskSchema.safeParse(task)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.priority).toBe('medium')
    }
  })
})

// ============================================
// REFERRAL CODE SCHEMA TESTS
// ============================================
describe('ReferralValidationSchema', () => {
  /**
   * Valid referral code format: 6 uppercase alphanumeric characters
   */
  it('should accept valid referral code', () => {
    const validCodes = ['ABC123', 'XYZ789', 'A1B2C3', '123456', 'ABCDEF']

    validCodes.forEach((code) => {
      const result = ReferralValidationSchema.safeParse({ referral_code: code })
      expect(result.success).toBe(true)
    })
  })

  /**
   * Lowercase letters should be rejected
   */
  it('should reject lowercase referral codes', () => {
    const result = ReferralValidationSchema.safeParse({ referral_code: 'abc123' })
    expect(result.success).toBe(false)
  })

  /**
   * Wrong length should be rejected
   */
  it('should reject wrong length referral codes', () => {
    const invalidCodes = ['ABC12', 'ABC1234', 'AB', '']

    invalidCodes.forEach((code) => {
      const result = ReferralValidationSchema.safeParse({ referral_code: code })
      expect(result.success).toBe(false)
    })
  })

  /**
   * Special characters should be rejected
   */
  it('should reject special characters in referral codes', () => {
    const result = ReferralValidationSchema.safeParse({ referral_code: 'ABC-12' })
    expect(result.success).toBe(false)
  })
})

// ============================================
// SONG SCHEMA TESTS
// ============================================
describe('CreateSongSchema', () => {
  /**
   * Valid song data should pass
   */
  it('should accept valid song data', () => {
    const validSong = {
      song_title: 'My Song',
      track_number: 1,
      duration_seconds: 180
    }

    const result = CreateSongSchema.safeParse(validSong)
    expect(result.success).toBe(true)
  })

  /**
   * Song title is required
   */
  it('should require song_title', () => {
    const invalidSong = {
      track_number: 1
    }

    const result = CreateSongSchema.safeParse(invalidSong)
    expect(result.success).toBe(false)
  })

  /**
   * Track number must be positive
   */
  it('should reject non-positive track numbers', () => {
    const invalidSong = {
      song_title: 'My Song',
      track_number: 0
    }

    const result = CreateSongSchema.safeParse(invalidSong)
    expect(result.success).toBe(false)
  })

  /**
   * ISRC code should not exceed 15 characters
   */
  it('should reject ISRC exceeding max length', () => {
    const invalidSong = {
      song_title: 'My Song',
      track_number: 1,
      isrc: 'A'.repeat(16)
    }

    const result = CreateSongSchema.safeParse(invalidSong)
    expect(result.success).toBe(false)
  })
})

// ============================================
// LABEL COPY SCHEMA TESTS
// ============================================
describe('CreateLabelCopySchema', () => {
  /**
   * Valid label copy data should pass
   */
  it('should accept valid label copy data', () => {
    const validLabelCopy = {
      release_id: 'e85e1294-632b-42c1-85ba-8c6648fc0467',
      version_subtitle: 'Deluxe Edition',
      phonogram_copyright: '2026 My Label',
      composition_copyright: '2026 My Publishing',
      explicit_content: false
    }

    const result = CreateLabelCopySchema.safeParse(validLabelCopy)
    expect(result.success).toBe(true)
  })

  /**
   * release_id is required
   */
  it('should require release_id', () => {
    const invalidLabelCopy = {
      version_subtitle: 'Deluxe Edition'
    }

    const result = CreateLabelCopySchema.safeParse(invalidLabelCopy)
    expect(result.success).toBe(false)
  })

  /**
   * Copyright year must be within valid range
   */
  it('should reject copyright year outside valid range', () => {
    const invalidLabelCopy = {
      release_id: 'e85e1294-632b-42c1-85ba-8c6648fc0467',
      copyright_year: 1800 // Too old
    }

    const result = CreateLabelCopySchema.safeParse(invalidLabelCopy)
    expect(result.success).toBe(false)
  })

  /**
   * Territories should be an array of strings
   */
  it('should accept valid territories array', () => {
    const validLabelCopy = {
      release_id: 'e85e1294-632b-42c1-85ba-8c6648fc0467',
      territories: ['United States', 'Canada', 'United Kingdom']
    }

    const result = CreateLabelCopySchema.safeParse(validLabelCopy)
    expect(result.success).toBe(true)
  })
})
