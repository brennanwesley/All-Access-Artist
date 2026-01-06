import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import type { 
  Release, 
  CreateReleaseData, 
  BackendResponse
} from '../../types/api'

// Re-export types for backward compatibility
export type { Release, CreateReleaseData }

// Query hook for fetching releases
export const useReleases = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['releases', user?.id],
    queryFn: async () => {
      const response = await apiClient.getReleases()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch releases')
      }
      // Extract the data array from the backend response format: { success: true, data: [...] }
      const backendResponse = response.data as BackendResponse<Release[]> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      return []
    },
    enabled: !!user, // Only run query when user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Mutation hook for creating releases
export const useCreateRelease = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (releaseData: CreateReleaseData) => {
      const response = await apiClient.createRelease(releaseData)
      if (response.status !== 201) {
        // Parse error message properly
        let errorMessage = response.error || 'Failed to create release'
        
        // Add context based on status code
        if (response.status === 400) {
          errorMessage = `Invalid release data: ${errorMessage}`
        } else if (response.status === 401) {
          errorMessage = 'You must be logged in to create a release'
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to create releases'
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
        
        throw new Error(errorMessage)
      }
      // Extract release from backend response
      const backendResponse = response.data as BackendResponse<Release> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      throw new Error('Invalid response from server')
    },
    onSuccess: () => {
      // Invalidate user-specific releases cache
      queryClient.invalidateQueries({ queryKey: ['releases', user?.id] })
    },
  })
}
