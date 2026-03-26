/**
 * Support Routes - HTTP handlers for user support tickets and admin tracking
 * All Access Artist - Backend API v2.0.0
 */
import { Hono } from 'hono'
import { adminAuth } from '../middleware/adminAuth.js'
import { validateRequest } from '../middleware/validation.js'
import { SupportService } from '../services/supportService.js'
import type { Bindings, Variables } from '../types/bindings.js'
import {
  CreateSupportTicketSchema,
  IdParamSchema,
  UpdateSupportTicketStatusSchema,
} from '../types/schemas.js'
import { authErrorResponse, errorResponse } from '../utils/apiResponse.js'
import { handleServiceError } from '../utils/errorHandler.js'

const support = new Hono<{ Bindings: Bindings; Variables: Variables }>()

support.use('/admin/*', adminAuth)

// POST /api/support/tickets - Create a new support ticket
support.post('/tickets', validateRequest('json', CreateSupportTicketSchema), async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload?.sub) {
      return authErrorResponse(c)
    }

    const supabase = c.get('supabase')
    if (!supabase) {
      return errorResponse(c, 500, 'Database connection error', 'SUPPORT_DATABASE_CONNECTION_ERROR')
    }

    const validatedData = c.req.valid('json')
    const supportService = new SupportService(supabase)
    const data = await supportService.createSupportTicket(jwtPayload.sub, validatedData)

    return c.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          version: '2.0.0',
        },
      },
      201
    )
  } catch (error) {
    return handleServiceError(error as Error, c, 'create support ticket')
  }
})

// GET /api/support/tickets - List the current user's support tickets
support.get('/tickets', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload')
    if (!jwtPayload?.sub) {
      return authErrorResponse(c)
    }

    const supabase = c.get('supabase')
    if (!supabase) {
      return errorResponse(c, 500, 'Database connection error', 'SUPPORT_DATABASE_CONNECTION_ERROR')
    }

    const supportService = new SupportService(supabase)
    const tickets = await supportService.getUserSupportTickets(jwtPayload.sub)

    return c.json({
      success: true,
      data: tickets,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        total_count: tickets.length,
      },
    })
  } catch (error) {
    return handleServiceError(error as Error, c, 'fetch support tickets')
  }
})

// GET /api/support/admin/overview - Admin support summary and recent tickets
support.get('/admin/overview', async (c) => {
  try {
    const supabaseAdmin = c.get('supabaseAdmin')
    if (!supabaseAdmin) {
      return errorResponse(c, 500, 'Database connection error', 'SUPPORT_DATABASE_CONNECTION_ERROR')
    }

    const supportService = new SupportService(supabaseAdmin)
    const overview = await supportService.getAdminSupportOverview()

    return c.json({
      success: true,
      data: overview,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
      },
    })
  } catch (error) {
    return handleServiceError(error as Error, c, 'fetch support ticket overview')
  }
})

// PATCH /api/support/admin/tickets/:id - Update ticket status for admins
support.patch(
  '/admin/tickets/:id',
  validateRequest('param', IdParamSchema),
  validateRequest('json', UpdateSupportTicketStatusSchema),
  async (c) => {
    try {
      const supabaseAdmin = c.get('supabaseAdmin')
      if (!supabaseAdmin) {
        return errorResponse(c, 500, 'Database connection error', 'SUPPORT_DATABASE_CONNECTION_ERROR')
      }

      const { id } = c.req.valid('param')
      const validatedData = c.req.valid('json')
      const supportService = new SupportService(supabaseAdmin)
      const data = await supportService.updateSupportTicketStatus(id, validatedData)

      return c.json({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          version: '2.0.0',
        },
      })
    } catch (error) {
      return handleServiceError(error as Error, c, 'update support ticket')
    }
  }
)

export default support
