/**
 * Centralized API Error Handler for TanStack Query
 * Implements Rule #8: Comprehensive Resilience and Error Handling
 * 
 * This handler processes all API errors from TanStack Query globally,
 * ensuring consistent error handling across the application.
 */

import { toast } from 'react-hot-toast'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for auth operations (with fallback)
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] || 'placeholder-anon-key'

// Create Supabase client only if environment variables are available
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase environment variables not found. Auth operations will be disabled.')
}

/**
 * Global API error handler for TanStack Query
 * 
 * @param error - The error object from a failed query/mutation
 */
export const handleApiError = async (error: unknown): Promise<void> => {
  console.error('API Error caught by global handler:', error)

  // Type guard to check if error has response structure
  const isHttpError = (err: unknown): err is { response?: { status?: number } } => {
    return typeof err === 'object' && err !== null && 'response' in err
  }

  // Type guard for fetch Response errors
  const isFetchError = (err: unknown): err is Response => {
    return err instanceof Response
  }

  // Type guard for Error objects with status
  const isErrorWithStatus = (err: unknown): err is Error & { status?: number } => {
    return err instanceof Error && 'status' in err
  }

  let statusCode: number | undefined

  // Extract status code from different error types
  if (isHttpError(error) && error.response?.status) {
    statusCode = error.response.status
  } else if (isFetchError(error)) {
    statusCode = error.status
  } else if (isErrorWithStatus(error) && error.status) {
    statusCode = error.status
  }

  // Handle specific error cases
  switch (statusCode) {
    case 401: {
      // Unauthorized - Sign out user and redirect to auth
      console.log('401 Unauthorized - Signing out user')
      
      try {
        // Sign out from Supabase if available
        if (supabase) {
          await supabase.auth.signOut()
        }
        
        // Redirect to auth page
        window.location.href = '/auth'
      } catch (signOutError) {
        console.error('Error during sign out:', signOutError)
        // Still redirect even if sign out fails
        window.location.href = '/auth'
      }
      break
    }
    
    default: {
      // All other errors - Show user-friendly toast with better error message
      console.log(`API Error ${statusCode || 'Unknown'} - Showing error toast`)
      
      // Extract meaningful error message
      let errorMessage = 'An unexpected error occurred. Please try again.'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        const errorObj = error as any
        if (errorObj.message) {
          errorMessage = errorObj.message
        } else if (errorObj.error) {
          errorMessage = errorObj.error
        }
      }
      
      // Don't show [object Object] to users
      if (errorMessage === '[object Object]' || errorMessage.includes('[object Object]')) {
        errorMessage = 'An unexpected error occurred. Please try again.'
      }
      
      // TODO: Add Sentry/LogRocket error reporting here
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
      })
      break
    }
  }
}
