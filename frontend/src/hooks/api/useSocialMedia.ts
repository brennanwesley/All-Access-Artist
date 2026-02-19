import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from '@/components/ui/sonner'
import { logger } from '@/lib/logger'
import type { Artist, BackendResponse, UpdateSocialMediaData } from '../../types/api'

// Types for Instagram metrics
export interface InstagramMetrics {
  username: string
  date_ingested: string
  posts_30d: number | null
  likes_30d: number | null
  comments_30d: number | null
  profile_url: string | null
}

// Types for TikTok metrics
export interface TikTokMetrics {
  username: string
  date_ingested: string
  videos_30d: number | null
  plays_30d: number | null
  likes_30d: number | null
  comments_30d: number | null
  profile_url: string | null
}

// Types for YouTube metrics
export interface YouTubeMetrics {
  username: string
  date_ingested: string
  videos_30d: number | null
  views_30d: number | null
  likes_30d: number | null
  profile_url: string | null
}

// Types for Twitter/X metrics
export interface TwitterMetrics {
  username: string
  date_ingested: string
  likes_30d: number | null
  retweets_30d: number | null
  replies_30d: number | null
  profile_url: string | null
}

// Types for social media data
export interface SocialMediaUrls {
  instagram_url?: string
  tiktok_url?: string
  twitter_url?: string
  youtube_url?: string
  spotify_url?: string
  apple_music_url?: string
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
        logger.warn('Unexpected social media response structure', {
          responseData: response.data,
        })
        return null
      }
      
      // Find the artist profile for the current user
      const userProfile = artists?.find(artist => artist.user_id === user.id)
      
      if (!userProfile) {
        return null
      }
      
      // Extract social media URLs
      const socialMediaUrls: SocialMediaUrls = {
        ...(userProfile.instagram_url ? { instagram_url: userProfile.instagram_url } : {}),
        ...(userProfile.tiktok_url ? { tiktok_url: userProfile.tiktok_url } : {}),
        ...(userProfile.twitter_url ? { twitter_url: userProfile.twitter_url } : {}),
        ...(userProfile.youtube_url ? { youtube_url: userProfile.youtube_url } : {}),
        ...(userProfile.spotify_url ? { spotify_url: userProfile.spotify_url } : {}),
        ...(userProfile.apple_music_url ? { apple_music_url: userProfile.apple_music_url } : {})
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
    mutationFn: async (socialMediaData: UpdateSocialMediaData) => {
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
      logger.error('Failed to update social media URLs', {
        userId: user?.id,
        error,
      })
      toast.error('Unable to update social media links right now. Please try again.')
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
      logger.error('Failed to update single social media URL', {
        userId: user?.id,
        error,
      })
      toast.error('Unable to connect this social media profile right now. Please try again.')
    }
  })
}

// Helper function to extract username from URL or handle
function extractCleanUsername(input: string): string {
  try {
    const url = new URL(input)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const lastPart = pathParts[pathParts.length - 1]
    if (lastPart) {
      return lastPart.replace(/^@/, '')
    }
    return input.replace(/^@/, '')
  } catch {
    return input.replace(/^@/, '')
  }
}

// Hook to fetch Instagram metrics for a username
export const useInstagramMetrics = (username: string | null | undefined) => {
  return useQuery({
    queryKey: ['instagram-metrics', username],
    queryFn: async (): Promise<InstagramMetrics | null> => {
      if (!username) return null
      
      const cleanUsername = extractCleanUsername(username)
      const response = await apiClient.getInstagramMetrics(cleanUsername)
      
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch Instagram metrics')
      }
      
      const backendResponse = response.data as BackendResponse<InstagramMetrics> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      
      return null
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Hook to fetch TikTok metrics for a username
export const useTikTokMetrics = (username: string | null | undefined) => {
  return useQuery({
    queryKey: ['tiktok-metrics', username],
    queryFn: async (): Promise<TikTokMetrics | null> => {
      if (!username) return null
      
      const cleanUsername = extractCleanUsername(username)
      const response = await apiClient.getTikTokMetrics(cleanUsername)
      
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch TikTok metrics')
      }
      
      const backendResponse = response.data as BackendResponse<TikTokMetrics> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      
      return null
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Hook to fetch YouTube metrics for a username
export const useYouTubeMetrics = (username: string | null | undefined) => {
  return useQuery({
    queryKey: ['youtube-metrics', username],
    queryFn: async (): Promise<YouTubeMetrics | null> => {
      if (!username) return null
      
      const cleanUsername = extractCleanUsername(username)
      const response = await apiClient.getYouTubeMetrics(cleanUsername)
      
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch YouTube metrics')
      }
      
      const backendResponse = response.data as BackendResponse<YouTubeMetrics> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      
      return null
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Hook to fetch Twitter/X metrics for a username
export const useTwitterMetrics = (username: string | null | undefined) => {
  return useQuery({
    queryKey: ['twitter-metrics', username],
    queryFn: async (): Promise<TwitterMetrics | null> => {
      if (!username) return null
      
      const cleanUsername = extractCleanUsername(username)
      const response = await apiClient.getTwitterMetrics(cleanUsername)
      
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch Twitter metrics')
      }
      
      const backendResponse = response.data as BackendResponse<TwitterMetrics> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }
      
      return null
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
