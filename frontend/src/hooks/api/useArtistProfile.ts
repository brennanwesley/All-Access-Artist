import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from '@/components/ui/sonner'
import { logger } from '@/lib/logger'
import type { Artist, BackendResponse } from '../../types/api'

interface CreateArtistProfileData {
  artist_name: string
  email: string
  bio?: string
  genre?: string
  location?: string
  profile_image_url?: string
  is_public?: boolean
  social_media_links?: Record<string, string>
}

// Hook to get current user's artist profile
export const useArtistProfile = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['artist-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const response = await apiClient.getArtists()
      const backendResponse = response.data as BackendResponse<Artist[]> | undefined
      const errorMessage =
        backendResponse && !backendResponse.success
          ? backendResponse.error.message
          : response.error

      if (response.status !== 200 || !backendResponse || !backendResponse.success) {
        logger.error('Failed to fetch artist profiles', {
          userId: user.id,
          status: response.status,
          error: errorMessage,
        })
        throw new Error(errorMessage || 'Failed to fetch artist profile')
      }
      
      // Find the artist profile for the current user
      const artists = backendResponse.data
      const userProfile = artists?.find(artist => artist.user_id === user.id)
      
      return userProfile || null
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Hook to create artist profile for current user
export const useCreateArtistProfile = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (profileData?: Partial<CreateArtistProfileData>) => {
      if (!user?.id || !user?.email) {
        throw new Error('User must be authenticated to create artist profile')
      }
      
      // Default artist profile data
      const defaultData: CreateArtistProfileData = {
        artist_name: user.email?.split('@')[0] || 'Artist', // Use email prefix as default name
        email: user.email || '',
        bio: '',
        genre: '',
        location: '',
        is_public: true,
        social_media_links: {},
        ...profileData // Override with provided data
      }
      
      const response = await apiClient.createArtist(defaultData)
      const backendResponse = response.data as BackendResponse<Artist> | undefined
      const errorMessage =
        backendResponse && !backendResponse.success
          ? backendResponse.error.message
          : response.error

      if (response.status !== 201 || !backendResponse || !backendResponse.success) {
        throw new Error(errorMessage || 'Failed to create artist profile')
      }

      return backendResponse.data
    },
    onSuccess: () => {
      // Invalidate artist profile cache
      queryClient.invalidateQueries({ queryKey: ['artist-profile', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['artists'] })
      
      toast.success('Artist profile created successfully!')
    },
    onError: (error) => {
      logger.error('Failed to create artist profile', {
        userId: user?.id,
        error,
      })
      toast.error('Unable to create your artist profile right now. Please try again.')
    }
  })
}

// Hook that ensures user has an artist profile, creating one if needed
export const useEnsureArtistProfile = () => {
  const { data: profile, isLoading, error } = useArtistProfile()
  const createProfile = useCreateArtistProfile()
  const { user } = useAuth()
  
  const ensureProfile = async () => {
    if (!user) {
      const errorMsg = 'User must be authenticated to ensure artist profile'
      logger.error(errorMsg)
      throw new Error(errorMsg)
    }
    
    if (profile) {
      return profile
    }

    try {
      const newProfile = await createProfile.mutateAsync({
        artist_name: user.email?.split('@')[0] || 'Artist',
        email: user.email || '',
        is_public: true
      })

      return newProfile
    } catch (err) {
      logger.error('Error ensuring artist profile', {
        userId: user.id,
        error: err,
      })
      throw err
    }
  }
  
  return {
    profile,
    isLoading: isLoading || createProfile.isPending,
    error: error || createProfile.error,
    hasProfile: !!profile,
    ensureProfile,
    isCreating: createProfile.isPending
  }
}
