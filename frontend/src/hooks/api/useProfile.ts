import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

// Types for profile data
export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  phone_verified: boolean
  account_type?: 'admin' | 'artist' | 'manager' | 'label'
  billing_address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
  payment_method_last4?: string
  referral_code: string
  referral_credits: number
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  first_name: string
  last_name: string
  billing_address?: {
    street?: string | undefined
    city?: string | undefined
    state?: string | undefined
    zip?: string | undefined
  }
}

export interface ReferralStats {
  total_referrals: number
  total_credits: number
  pending_credits: number
}

export interface ReferralValidation {
  valid: boolean
  referrer?: {
    id: string
    first_name: string
    last_name: string
  }
  message: string
}

export interface ReferralApplication {
  success: boolean
  referrer: {
    id: string
    first_name: string
    last_name: string
  }
  credits_awarded: number
}

// Query hook for fetching user profile
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.getProfile()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch profile')
      }
      // Extract data from backend response format: { success: true, data: {...} }
      const backendResponse = response.data as any
      return backendResponse?.data as UserProfile
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  })
}

// Mutation hook for updating profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileData: UpdateProfileData) => {
      const response = await apiClient.updateProfile(profileData)
      if (response.status !== 200) {
        // Parse error message properly
        let errorMessage = 'Failed to update profile'
        
        if (response.error) {
          if (typeof response.error === 'string') {
            errorMessage = response.error
          } else if (typeof response.error === 'object') {
            // Handle validation errors from backend
            const errorObj = response.error as any
            if (errorObj.message) {
              errorMessage = errorObj.message
            } else if (errorObj.issues && Array.isArray(errorObj.issues)) {
              // Handle Zod validation errors
              errorMessage = errorObj.issues.map((issue: any) => issue.message).join(', ')
            } else {
              errorMessage = JSON.stringify(response.error)
            }
          }
        }
        
        // Add context based on status code
        if (response.status === 400) {
          errorMessage = `Invalid profile data: ${errorMessage}`
        } else if (response.status === 401) {
          errorMessage = 'You must be logged in to update your profile'
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to update this profile'
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
        
        throw new Error(errorMessage)
      }
      const backendResponse = response.data as any
      return backendResponse?.data as UserProfile
    },
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

// Query hook for fetching referral stats
export const useReferralStats = () => {
  return useQuery({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const response = await apiClient.getReferralStats()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch referral stats')
      }
      const backendResponse = response.data as any
      return backendResponse?.data as ReferralStats
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Mutation hook for validating referral codes
export const useValidateReferralCode = () => {
  return useMutation({
    mutationFn: async (referralCode: string) => {
      const response = await apiClient.validateReferralCode(referralCode)
      if (response.status !== 200) {
        let errorMessage = 'Failed to validate referral code'
        
        if (response.error) {
          if (typeof response.error === 'string') {
            errorMessage = response.error
          } else if (typeof response.error === 'object') {
            const errorObj = response.error as any
            if (errorObj.message) {
              errorMessage = errorObj.message
            }
          }
        }
        
        throw new Error(errorMessage)
      }
      const backendResponse = response.data as any
      return backendResponse?.data as ReferralValidation
    },
  })
}

// Mutation hook for applying referral codes
export const useApplyReferralCode = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (referralCode: string) => {
      const response = await apiClient.applyReferralCode(referralCode)
      if (response.status !== 200) {
        let errorMessage = 'Failed to apply referral code'
        
        if (response.error) {
          if (typeof response.error === 'string') {
            errorMessage = response.error
          } else if (typeof response.error === 'object') {
            const errorObj = response.error as any
            if (errorObj.message) {
              errorMessage = errorObj.message
            }
          }
        }
        
        // Add context based on status code
        if (response.status === 400) {
          errorMessage = `Invalid referral code: ${errorMessage}`
        } else if (response.status === 409) {
          errorMessage = 'You have already used a referral code'
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
        
        throw new Error(errorMessage)
      }
      const backendResponse = response.data as any
      return backendResponse?.data as ReferralApplication
    },
    onSuccess: () => {
      // Invalidate and refetch profile and referral stats
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] })
    },
  })
}
