import type { Context } from 'hono'
import type { ZodIssue } from 'zod'

interface ApiErrorBody {
  success: false
  error: {
    message: string
    code?: string
    details?: unknown
  }
}

type ErrorStatusCode = 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502

export function errorResponse(
  c: Context,
  status: ErrorStatusCode,
  message: string,
  code?: string,
  details?: unknown
) {
  const error: ApiErrorBody['error'] = { message }

  if (code) {
    error.code = code
  }

  if (details !== undefined) {
    error.details = details
  }

  return c.json({ success: false, error }, status)
}

export function validationErrorResponse(c: Context, issues: ZodIssue[]) {
  const details = {
    issues: issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  }

  return errorResponse(c, 400, 'Request validation failed', 'VALIDATION_ERROR', details)
}

export function authErrorResponse(c: Context, message = 'Authentication required') {
  return errorResponse(c, 401, message, 'AUTH_REQUIRED')
}
