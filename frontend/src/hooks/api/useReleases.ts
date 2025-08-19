import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

// Types for release data
interface Release {
  id: string
  user_id: string
  title: string
  release_date: string
  release_type: 'single' | 'ep' | 'album' | 'mixtape'
  status: 'draft' | 'scheduled' | 'released'
  description?: string
  genre?: string
  created_at: string
  updated_at: string
}

interface CreateReleaseData {
  title: string
  user_id: string
  release_date: string
  release_type: 'single' | 'ep' | 'album' | 'mixtape'
  status: 'draft' | 'scheduled' | 'released'
  description?: string
  genre?: string
}

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
      const backendResponse = response.data as any
      return backendResponse?.data || []
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
        let errorMessage = 'Failed to create release'
        
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
      return response.data as Release
    },
    onSuccess: () => {
      // Invalidate user-specific releases cache
      queryClient.invalidateQueries({ queryKey: ['releases', user?.id] })
    },
  })
}
