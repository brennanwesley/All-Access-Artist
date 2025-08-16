/**
 * Error handling utilities for consistent error responses
 * All Access Artist - Backend API v2.0.0
 */
import type { Context } from 'hono'
import { ZodError } from 'zod'
import { APIError, CommonErrors, ErrorCategory, ErrorSeverity, type ErrorResponse } from '../types/errors.js'
import type { Bindings, Variables } from '../types/bindings.js'

type HonoContext = Context<{ Bindings: Bindings; Variables: Variables }>

/**
 * Generate a unique request ID for error tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: APIError,
  context: HonoContext,
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      ...error.toJSON(),
      requestId: requestId || generateRequestId()
    },
    meta: {
      endpoint: context.req.path,
      method: context.req.method,
      version: '2.0.0'
    }
  }
}

/**
 * Handle Zod validation errors
 */
export function handleValidationError(zodError: ZodError, context: HonoContext) {
  const issues = zodError.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }))

  return context.json({
    success: false,
    error: 'Request validation failed',
    details: issues
  }, 400)
}

/**
 * Handle Supabase database errors
 */
export function handleDatabaseError(supabaseError: any, context: HonoContext, operation: string) {
  console.error(`Database error during ${operation}:`, {
    message: supabaseError.message,
    code: supabaseError.code,
    details: supabaseError.details,
    hint: supabaseError.hint,
    timestamp: new Date().toISOString()
  })

  return context.json({
    success: false,
    error: `Failed to ${operation}`
  }, 500)
}

/**
 * Handle authentication errors
 */
export function handleAuthError(message: string, context: HonoContext, code?: string) {
  return context.json({
    success: false,
    error: message
  }, 401)
}

/**
 * Handle generic service errors
 */
export function handleServiceError(error: Error, context: HonoContext, operation: string) {
  console.error(`Service error during ${operation}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })

  return context.json({
    success: false,
    error: error instanceof Error ? error.message : `Failed to ${operation}`
  }, 500)
}

/**
 * Handle not found errors
 */
export function handleNotFoundError(resource: string, context: HonoContext, id?: string) {
  return context.json({
    success: false,
    error: `${resource} not found`
  }, 404)
}

/**
 * Async error wrapper for route handlers
 */
export function asyncErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      // Re-throw to be caught by global error handler
      throw error
    }
  }
}

/**
 * Safe error logging (removes sensitive information)
 */
export function logError(error: Error, context: HonoContext, additionalInfo?: Record<string, any>) {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      // Only include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    request: {
      method: context.req.method,
      path: context.req.path,
      userAgent: context.req.header('User-Agent'),
      // Don't log authorization headers or sensitive data
    },
    ...additionalInfo
  }

  console.error('API Error:', JSON.stringify(logData, null, 2))
}
