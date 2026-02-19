import { zValidator } from '@hono/zod-validator'
import type { ZodType } from 'zod'
import { validationErrorResponse } from '../utils/apiResponse.js'

type ValidationTarget = 'json' | 'form' | 'query' | 'param' | 'header' | 'cookie'

export function validateRequest<TSchema extends ZodType>(target: ValidationTarget, schema: TSchema) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error.issues)
    }

    return undefined
  })
}
