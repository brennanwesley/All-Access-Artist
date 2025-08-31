/**
 * Admin Routes - HTTP handlers for admin-only operations
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { AdminService } from '../services/adminService.js'
import { adminAuth } from '../middleware/adminAuth.js'
import type { Bindings, Variables } from '../types/bindings.js'
import { handleServiceError } from '../utils/errorHandler.js'

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Apply admin authentication middleware to all admin routes
admin.use('*', adminAuth)

// GET /api/admin/users - Get all users for admin dashboard
admin.get('/users', async (c) => {
  console.log('=== ADMIN GET USERS REQUEST START ===')
  try {
    console.log('1. Getting admin Supabase client...')
    const supabaseAdmin = c.get('supabaseAdmin')
    if (!supabaseAdmin) {
      console.log('ERROR: No admin Supabase client found')
      return c.json({ 
        success: false, 
        error: 'Database connection error' 
      }, 500)
    }

    console.log('2. Creating AdminService and calling getAllUsers...')
    const adminService = new AdminService(supabaseAdmin)
    const users = await adminService.getAllUsers()
    
    console.log('3. Successfully retrieved', users.length, 'users')
    
    return c.json({ 
      success: true, 
      data: users,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        total_count: users.length
      }
    })
  } catch (error) {
    console.log('=== ADMIN GET USERS ERROR ===')
    console.error('Error details:', error)
    console.log('=== END ADMIN GET USERS ERROR ===')
    return handleServiceError(error as Error, c, 'fetch admin user list')
  }
})

// GET /api/admin/stats - Get system statistics for admin dashboard
admin.get('/stats', async (c) => {
  console.log('=== ADMIN GET STATS REQUEST START ===')
  try {
    console.log('1. Getting admin Supabase client...')
    const supabaseAdmin = c.get('supabaseAdmin')
    if (!supabaseAdmin) {
      console.log('ERROR: No admin Supabase client found')
      return c.json({ 
        success: false, 
        error: 'Database connection error' 
      }, 500)
    }

    console.log('2. Creating AdminService and calling getSystemStats...')
    const adminService = new AdminService(supabaseAdmin)
    const stats = await adminService.getSystemStats()
    
    console.log('3. Successfully retrieved system stats')
    
    return c.json({ 
      success: true, 
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    })
  } catch (error) {
    console.log('=== ADMIN GET STATS ERROR ===')
    console.error('Error details:', error)
    console.log('=== END ADMIN GET STATS ERROR ===')
    return handleServiceError(error as Error, c, 'fetch admin system stats')
  }
})

export default admin
