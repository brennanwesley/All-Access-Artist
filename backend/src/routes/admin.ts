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
  try {
    const supabaseAdmin = c.get('supabaseAdmin')
    if (!supabaseAdmin) {
      return c.json({ 
        success: false, 
        error: 'Database connection error' 
      }, 500)
    }

    const adminService = new AdminService(supabaseAdmin)
    const users = await adminService.getAllUsers()
    
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
    return handleServiceError(error as Error, c, 'fetch admin user list')
  }
})

// GET /api/admin/stats - Get system statistics for admin dashboard
admin.get('/stats', async (c) => {
  try {
    const supabaseAdmin = c.get('supabaseAdmin')
    if (!supabaseAdmin) {
      return c.json({ 
        success: false, 
        error: 'Database connection error' 
      }, 500)
    }

    const adminService = new AdminService(supabaseAdmin)
    const stats = await adminService.getSystemStats()
    
    return c.json({ 
      success: true, 
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    })
  } catch (error) {
    return handleServiceError(error as Error, c, 'fetch admin system stats')
  }
})

export default admin
