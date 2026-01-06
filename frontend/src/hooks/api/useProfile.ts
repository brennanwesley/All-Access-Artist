import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import type {
  UserProfile,
  UpdateProfileData,
  ReferralStats,
  ReferralValidation,
  ReferralApplication,
  BackendResponse
} from '../../types/api'

// Re-export types for backward compatibility
export type { UserProfile, UpdateProfileData, ReferralStats, ReferralValidation, ReferralApplication }

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
      const backendResponse = response.data as BackendResponse<UserProfile> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      throw new Error('Invalid response from server')
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
        let errorMessage = response.error || 'Failed to update profile'
        
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
      const backendResponse = response.data as BackendResponse<UserProfile> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      throw new Error('Invalid response from server')
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
      const backendResponse = response.data as BackendResponse<ReferralStats> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      throw new Error('Invalid response from server')
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
        throw new Error(response.error || 'Failed to validate referral code')
      }
      const backendResponse = response.data as BackendResponse<ReferralValidation> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      throw new Error('Invalid response from server')
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
        let errorMessage = response.error || 'Failed to apply referral code'
        
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
      const backendResponse = response.data as BackendResponse<ReferralApplication> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      throw new Error('Invalid response from server')
    },
    onSuccess: () => {
      // Invalidate and refetch profile and referral stats
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] })
    },
  })
}
