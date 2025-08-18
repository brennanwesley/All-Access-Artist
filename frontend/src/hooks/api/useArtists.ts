import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

// Types for artist data
interface Artist {
  id: string
  artist_name: string
  email: string
  bio?: string
  genre?: string
  location?: string
  profile_image_url?: string
  is_public?: boolean
  social_media_links?: Record<string, string>
  created_at: string
  updated_at: string
}

interface CreateArtistData {
  artist_name: string
  email: string
  bio?: string
  genre?: string
  location?: string
  profile_image_url?: string
  is_public?: boolean
  social_media_links?: Record<string, string>
}

// Query hook for fetching artists
export const useArtists = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['artists', user?.id],
    queryFn: async () => {
      const response = await apiClient.getArtists()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch artists')
      }
      return response.data as Artist[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Mutation hook for creating artists
export const useCreateArtist = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (artistData: CreateArtistData) => {
      const response = await apiClient.createArtist(artistData)
      if (response.status !== 201) {
        throw new Error(response.error || 'Failed to create artist')
      }
      return response.data as Artist
    },
    onSuccess: () => {
      // Invalidate user-specific artists cache
      queryClient.invalidateQueries({ queryKey: ['artists', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['artist-profile', user?.id] })
    },
  })
}
