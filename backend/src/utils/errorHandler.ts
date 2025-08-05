/**
 * Error handling utilities for consistent error responses
 * All Access Artist - Backend API v2.0.0
 */
import type { Context } from 'hono'
import { ZodError } from 'zod'
import { APIError, CommonErrors, ErrorCategory, ErrorSeverity, type ErrorResponse } from '../types/errors'
import type { Bindings, Variables } from '../types/bindings'

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
  const validationError = new APIError(
    'Request validation failed',
    'VALIDATION_FAILED',
    ErrorCategory.VALIDATION,
    ErrorSeverity.MEDIUM,
    400,
    {
      validationErrors: zodError.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    }
  )

  const response = createErrorResponse(validationError, context)
  return context.json(response, validationError.statusCode)
}

/**
 * Handle Supabase database errors
 */
export function handleDatabaseError(supabaseError: any, context: HonoContext, operation: string) {
  // Log the full error for debugging (server-side only)
  console.error(`Database error during ${operation}:`, {
    message: supabaseError.message,
    code: supabaseError.code,
    details: supabaseError.details,
    hint: supabaseError.hint,
    timestamp: new Date().toISOString()
  })

  // Create user-friendly error response (no sensitive details)
  const dbError = new APIError(
    `Failed to ${operation}`,
    'DATABASE_ERROR',
    ErrorCategory.DATABASE,
    ErrorSeverity.HIGH,
    500,
    {
      operation,
      // Only include safe error details
      errorCode: supabaseError.code || 'UNKNOWN'
    }
  )

  const response = createErrorResponse(dbError, context)
  return context.json(response, dbError.statusCode)
}

/**
 * Handle authentication errors
 */
export function handleAuthError(message: string, context: HonoContext, code?: string) {
  const authError = code === 'MISSING_TOKEN' 
    ? CommonErrors.MISSING_TOKEN 
    : CommonErrors.INVALID_TOKEN

  // Override message if provided
  if (message !== authError.message) {
    const customAuthError = new APIError(
      message,
      authError.code,
      authError.category,
      authError.severity,
      authError.statusCode
    )
    const response = createErrorResponse(customAuthError, context)
    return context.json(response, customAuthError.statusCode)
  }

  const response = createErrorResponse(authError, context)
  return context.json(response, authError.statusCode)
}

/**
 * Handle generic service errors
 */
export function handleServiceError(error: Error, context: HonoContext, operation: string) {
  // Log the full error for debugging
  console.error(`Service error during ${operation}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })

  // If it's already an APIError, use it directly
  if (error instanceof APIError) {
    const response = createErrorResponse(error, context)
    return context.json(response, error.statusCode)
  }

  // Otherwise, create a generic internal error
  const serviceError = new APIError(
    `Failed to ${operation}`,
    'SERVICE_ERROR',
    ErrorCategory.INTERNAL,
    ErrorSeverity.HIGH,
    500,
    {
      operation
    }
  )

  const response = createErrorResponse(serviceError, context)
  return context.json(response, serviceError.statusCode)
}

/**
 * Handle not found errors
 */
export function handleNotFoundError(resource: string, context: HonoContext, id?: string) {
  const notFoundError = new APIError(
    `${resource} not found`,
    'RESOURCE_NOT_FOUND',
    ErrorCategory.NOT_FOUND,
    ErrorSeverity.LOW,
    404,
    {
      resource,
      id
    }
  )

  const response = createErrorResponse(notFoundError, context)
  return context.json(response, notFoundError.statusCode)
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
