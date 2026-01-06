import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import type { AdminUser, AdminStats, BackendResponse } from '../../types/api'

// Re-export types for backward compatibility
export type { AdminUser, AdminStats }

// Query hook for fetching all users (admin only)
export const useAdminUsers = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['admin-users', user?.id],
    queryFn: async () => {
      const response = await apiClient.getAdminUsers()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch admin users')
      }
      // Extract data from backend response format: { success: true, data: [...] }
      const backendResponse = response.data as BackendResponse<AdminUser[]> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      return []
    },
    enabled: !!user, // Only run query if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  })
}

// Query hook for fetching system statistics (admin only)
export const useAdminStats = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['admin-stats', user?.id],
    queryFn: async () => {
      const response = await apiClient.getAdminStats()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch admin stats')
      }
      // Extract data from backend response format: { success: true, data: {...} }
      const backendResponse = response.data as BackendResponse<AdminStats> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      throw new Error('Invalid response from server')
    },
    enabled: !!user, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}
