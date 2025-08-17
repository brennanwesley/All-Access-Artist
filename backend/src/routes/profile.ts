/**
 * Profile Routes - HTTP handlers for user profile management
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ZodError } from 'zod'
import { ProfileService } from '../services/profileService.js'
import { 
  UpdateUserProfileSchema, 
  ReferralValidationSchema 
} from '../types/schemas.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { handleValidationError, handleServiceError } from '../utils/errorHandler.js'

const profile = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET /api/profile - Get current user's profile
profile.get('/', async (c) => {
  console.log('=== PROFILE GET REQUEST START ===')
  try {
    console.log('1. Checking JWT payload...')
    const jwtPayload = c.get('jwtPayload')
    console.log('JWT payload:', jwtPayload)
    
    if (!jwtPayload?.sub) {
      console.log('ERROR: No JWT payload or sub found')
      return c.json({ 
        success: false, 
        error: 'Authentication required' 
      }, 401)
    }

    console.log('2. Getting Supabase client...')
    const supabase = c.get('supabase')
    console.log('Supabase client exists:', !!supabase)
    
    console.log('3. Creating ProfileService and calling getUserProfile...')
    const supabaseAdmin = c.get('supabaseAdmin')
    const profileService = new ProfileService(supabase)
    const profile = await profileService.getUserProfile(jwtPayload.sub, supabaseAdmin)
    console.log('5. Profile data retrieved:', profile)
    
    return c.json({ 
      success: true, 
      data: profile,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    })
  } catch (error) {
    console.log('=== PROFILE GET ERROR ===')
    console.error('Error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('=== END PROFILE GET ERROR ===')
    return handleServiceError(error as Error, c, 'fetch user profile')
  }
})

// PUT /api/profile - Update current user's profile
profile.put('/', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload?.sub) {
      return c.json({ 
        success: false, 
        error: 'Authentication required' 
      }, 401)
    }

    // Manual validation with standardized error handling
    const body = await c.req.json()
    const validatedData = UpdateUserProfileSchema.parse(body)
    
    const supabase = c.get('supabase')
    const profileService = new ProfileService(supabase)
    
    const data = await profileService.updateUserProfile(jwtPayload.sub, validatedData)
    return c.json({ 
      success: true, 
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, c)
    }
    return handleServiceError(error as Error, c, 'update user profile')
  }
})

// POST /api/profile/referral - Validate and apply referral code
profile.post('/referral', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload?.sub) {
      return c.json({ 
        success: false, 
        error: 'Authentication required' 
      }, 401)
    }

    // Manual validation with standardized error handling
    const body = await c.req.json()
    const validatedData = ReferralValidationSchema.parse(body)
    
    const supabase = c.get('supabase')
    const profileService = new ProfileService(supabase)
    
    const data = await profileService.applyReferralCode(
      validatedData.referral_code, 
      jwtPayload.sub
    )
    
    return c.json({ 
      success: true, 
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    }, 201)
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, c)
    }
    return handleServiceError(error as Error, c, 'apply referral code')
  }
})

// GET /api/profile/referral-stats - Get referral statistics
profile.get('/referral-stats', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload?.sub) {
      return c.json({ 
        success: false, 
        error: 'Authentication required' 
      }, 401)
    }

    const supabase = c.get('supabase')
    const profileService = new ProfileService(supabase)
    
    const data = await profileService.getReferralStats(jwtPayload.sub)
    return c.json({ 
      success: true, 
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    })
  } catch (error) {
    return handleServiceError(error as Error, c, 'fetch referral stats')
  }
})

// POST /api/profile/validate-referral - Validate referral code without applying
profile.post('/validate-referral', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload?.sub) {
      return c.json({ 
        success: false, 
        error: 'Authentication required' 
      }, 401)
    }

    // Manual validation with standardized error handling
    const body = await c.req.json()
    const validatedData = ReferralValidationSchema.parse(body)
    
    const supabase = c.get('supabase')
    const profileService = new ProfileService(supabase)
    
    const data = await profileService.validateReferralCode(
      validatedData.referral_code, 
      jwtPayload.sub
    )
    
    return c.json({ 
      success: true, 
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, c)
    }
    return handleServiceError(error as Error, c, 'validate referral code')
  }
})

export default profile
