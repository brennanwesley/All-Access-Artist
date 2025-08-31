import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

// Types for admin data
export interface AdminUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  account_type: 'admin' | 'artist' | 'manager' | 'label'
  created_at: string
  phone_verified: boolean | null
}

export interface AdminStats {
  total_users: number
  admin_users: number
  artist_users: number
  manager_users: number
  label_users: number
  total_releases: number
  total_tasks: number
  last_updated: string
}

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
      const backendResponse = response.data as any
      return backendResponse?.data as AdminUser[]
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
      const backendResponse = response.data as any
      return backendResponse?.data as AdminStats
    },
    enabled: !!user, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}
