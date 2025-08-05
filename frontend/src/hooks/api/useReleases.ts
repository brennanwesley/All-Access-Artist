import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

// Types for release data
interface Release {
  id: string
  title: string
  artist_id: string
  release_date: string
  type: 'single' | 'album' | 'ep'
  status: 'draft' | 'scheduled' | 'released'
  description?: string
  genre?: string
  cover_art_url?: string
  streaming_links?: Record<string, string>
  created_at: string
  updated_at: string
}

interface CreateReleaseData {
  title: string
  artist_id: string
  release_date: string
  type: 'single' | 'album' | 'ep'
  status?: 'draft' | 'scheduled' | 'released'
  description?: string
  genre?: string
  cover_art_url?: string
  streaming_links?: Record<string, string>
}

// Query hook for fetching releases
export const useReleases = () => {
  return useQuery({
    queryKey: ['releases'],
    queryFn: async () => {
      const response = await apiClient.getReleases()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch releases')
      }
      return response.data as Release[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Mutation hook for creating releases
export const useCreateRelease = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (releaseData: CreateReleaseData) => {
      const response = await apiClient.createRelease(releaseData)
      if (response.status !== 201) {
        throw new Error(response.error || 'Failed to create release')
      }
      return response.data as Release
    },
    onSuccess: (data) => {
      // Invalidate and refetch releases lists
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      queryClient.invalidateQueries({ queryKey: ['releases', data.artist_id] })
    },
  })
}
