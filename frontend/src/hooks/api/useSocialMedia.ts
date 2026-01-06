import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import type { Artist, BackendResponse } from '../../types/api'

// Types for social media data
export interface SocialMediaUrls {
  instagram_url?: string | undefined
  tiktok_url?: string | undefined
  twitter_url?: string | undefined
  youtube_url?: string | undefined
  spotify_url?: string | undefined
  apple_music_url?: string | undefined
}

// Hook to get current user's social media URLs from artist profile
export const useSocialMediaUrls = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['social-media-urls', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      
      const response = await apiClient.getArtists()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch social media URLs')
      }
      
      
      // Handle different response structures
      let artists: Artist[]
      const backendResponse = response.data as BackendResponse<Artist[]> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        artists = backendResponse.data
      } else if (Array.isArray(response.data)) {
        artists = response.data as Artist[]
      } else {
        console.error('Unexpected response structure:', response.data)
        return null
      }
      
      // Find the artist profile for the current user
      const userProfile = artists?.find(artist => artist.user_id === user.id)
      
      if (!userProfile) {
        return null
      }
      
      // Extract social media URLs
      const socialMediaUrls: SocialMediaUrls = {
        instagram_url: userProfile.instagram_url || undefined,
        tiktok_url: userProfile.tiktok_url || undefined,
        twitter_url: userProfile.twitter_url || undefined,
        youtube_url: userProfile.youtube_url || undefined,
        spotify_url: userProfile.spotify_url || undefined,
        apple_music_url: userProfile.apple_music_url || undefined
      }
      
      return socialMediaUrls
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Hook to update social media URLs
export const useUpdateSocialMedia = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (socialMediaData: Partial<SocialMediaUrls>) => {
      const response = await apiClient.updateSocialMediaUrls(socialMediaData)
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to update social media URLs')
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: ['social-media-urls', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['artist-profile', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['artists'] })
      
      toast.success('Social media profile updated successfully!')
    },
    onError: (error) => {
      console.error('Failed to update social media URLs:', error)
      toast.error(`Failed to update social media profile: ${error.message}`)
    }
  })
}

// Hook to update a single platform URL
export const useUpdateSinglePlatform = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ platform, url }: { platform: keyof SocialMediaUrls, url: string | null }) => {
      const updateData = { [platform]: url }
      const response = await apiClient.updateSocialMediaUrls(updateData)
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to update social media URL')
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: ['social-media-urls', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['artist-profile', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['artists'] })
      
      toast.success('Social media profile connected successfully!')
    },
    onError: (error) => {
      console.error('Failed to update social media URL:', error)
      toast.error(`Failed to update social media profile: ${error.message}`)
    }
  })
}
