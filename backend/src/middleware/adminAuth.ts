/**
 * Admin Authentication Middleware - Account Type Validation
 * All Access Artist - Backend API v2.0.0
 */
import { createMiddleware } from 'hono/factory'
import type { Bindings, Variables } from '../types/bindings.js'

/**
 * Middleware to verify user has admin account type
 * Must be used after supabaseAuth middleware
 */
export const adminAuth = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
  console.log('=== ADMIN AUTH MIDDLEWARE START ===')
  
  try {
    // Get authenticated user from previous middleware
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload?.sub) {
      console.log('ERROR: No JWT payload found - supabaseAuth middleware must run first')
      return c.json({ 
        success: false, 
        error: 'Authentication required' 
      }, 401)
    }

    console.log('1. Checking user account type for user:', jwtPayload.sub)
    
    // Get user-scoped supabase client
    const supabase = c.get('supabase')
    if (!supabase) {
      console.log('ERROR: No supabase client found')
      return c.json({ 
        success: false, 
        error: 'Database connection error' 
      }, 500)
    }

    // Query user profile to check account_type
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', jwtPayload.sub)
      .single()

    console.log('2. User profile query result:', { userProfile, profileError })

    if (profileError) {
      console.log('ERROR: Failed to fetch user profile:', profileError.message)
      return c.json({ 
        success: false, 
        error: 'Failed to verify account permissions' 
      }, 500)
    }

    if (!userProfile || userProfile.account_type !== 'admin') {
      console.log('ERROR: User is not admin. Account type:', userProfile?.account_type)
      return c.json({ 
        success: false, 
        error: 'Admin access required' 
      }, 403)
    }

    console.log('✅ Admin access verified for user:', jwtPayload.sub)
    console.log('=== ADMIN AUTH MIDDLEWARE SUCCESS ===')
    
    await next()
  } catch (error) {
    console.log('=== ADMIN AUTH MIDDLEWARE ERROR ===')
    console.error('Admin auth error:', error)
    console.log('=== END ADMIN AUTH MIDDLEWARE ERROR ===')
    
    return c.json({ 
      success: false, 
      error: 'Admin authentication failed' 
    }, 500)
  }
})
