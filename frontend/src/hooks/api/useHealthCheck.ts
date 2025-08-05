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
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
