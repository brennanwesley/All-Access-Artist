/**
 * Standardized error types and response schemas
 * All Access Artist - Backend API v2.0.0
 */
import { z } from 'zod'

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  INTERNAL = 'internal'
}

// Standardized error response schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    category: z.nativeEnum(ErrorCategory),
    severity: z.nativeEnum(ErrorSeverity),
    timestamp: z.string().datetime(),
    requestId: z.string().optional(),
    details: z.record(z.any()).optional()
  }),
  meta: z.object({
    endpoint: z.string(),
    method: z.string(),
    version: z.string()
  }).optional()
})

// Success response schema
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  meta: z.object({
    timestamp: z.string().datetime(),
    version: z.string(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      hasMore: z.boolean()
    }).optional()
  }).optional()
})

// Type inference
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>

// Custom error class for structured error handling
export class APIError extends Error {
  public readonly code: string
  public readonly category: ErrorCategory
  public readonly severity: ErrorSeverity
  public readonly statusCode: number
  public readonly details?: Record<string, any>
  public readonly timestamp: string

  constructor(
    message: string,
    code: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.category = category
    this.severity = severity
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
  }

  toJSON(): ErrorResponse['error'] {
    return {
      code: this.code,
      message: this.message,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp,
      details: this.details
    }
  }
}

// Predefined error types for common scenarios
export const CommonErrors = {
  // Authentication errors
  INVALID_TOKEN: new APIError(
    'Invalid or expired authentication token',
    'AUTH_INVALID_TOKEN',
    ErrorCategory.AUTHENTICATION,
    ErrorSeverity.HIGH,
    401
  ),
  
  MISSING_TOKEN: new APIError(
    'Authentication token is required',
    'AUTH_MISSING_TOKEN',
    ErrorCategory.AUTHENTICATION,
    ErrorSeverity.HIGH,
    401
  ),

  // Authorization errors
  INSUFFICIENT_PERMISSIONS: new APIError(
    'Insufficient permissions to access this resource',
    'AUTH_INSUFFICIENT_PERMISSIONS',
    ErrorCategory.AUTHORIZATION,
    ErrorSeverity.HIGH,
    403
  ),

  // Validation errors
  VALIDATION_FAILED: new APIError(
    'Request validation failed',
    'VALIDATION_FAILED',
    ErrorCategory.VALIDATION,
    ErrorSeverity.MEDIUM,
    400
  ),

  // Not found errors
  RESOURCE_NOT_FOUND: new APIError(
    'The requested resource was not found',
    'RESOURCE_NOT_FOUND',
    ErrorCategory.NOT_FOUND,
    ErrorSeverity.LOW,
    404
  ),

  // Database errors
  DATABASE_ERROR: new APIError(
    'Database operation failed',
    'DATABASE_ERROR',
    ErrorCategory.DATABASE,
    ErrorSeverity.HIGH,
    500
  ),

  // Internal errors
  INTERNAL_SERVER_ERROR: new APIError(
    'An unexpected error occurred',
    'INTERNAL_SERVER_ERROR',
    ErrorCategory.INTERNAL,
    ErrorSeverity.CRITICAL,
    500
  )
}
