import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.healthCheck()
      if (response.status !== 200) {
        throw new Error(response.error || 'Health check failed')
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - longer cache
    // Removed refetchInterval to stop constant polling
    retry: 1, // Reduced retries
    retryDelay: 2000, // Fixed 2 second delay
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  })
}
