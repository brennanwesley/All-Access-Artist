import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

// Types for artist profile data
interface ArtistProfile {
  id: string
  user_id: string
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
      
      console.log('Fetching artist profile for user:', user.id)
      
      const response = await apiClient.getArtists()
      console.log('Artist profile API response:', { status: response.status, error: response.error })
      
      if (response.status !== 200) {
        console.error('Failed to fetch artists:', response.error)
        throw new Error(response.error || 'Failed to fetch artist profile')
      }
      
      // Find the artist profile for the current user
      const artists = response.data as ArtistProfile[]
      console.log('All artists:', artists?.length || 0)
      const userProfile = artists?.find(artist => artist.user_id === user.id)
      console.log('User artist profile found:', !!userProfile)
      
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
      if (response.status !== 201) {
        throw new Error(response.error || 'Failed to create artist profile')
      }
      return response.data as ArtistProfile
    },
    onSuccess: () => {
      // Invalidate artist profile cache
      queryClient.invalidateQueries({ queryKey: ['artist-profile', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['artists'] })
      
      toast.success('Artist profile created successfully!')
    },
    onError: (error) => {
      console.error('Failed to create artist profile:', error)
      toast.error(`Failed to create artist profile: ${error.message}`)
    }
  })
}

// Hook that ensures user has an artist profile, creating one if needed
export const useEnsureArtistProfile = () => {
  const { data: profile, isLoading, error } = useArtistProfile()
  const createProfile = useCreateArtistProfile()
  const { user } = useAuth()
  
  // Log initial state
  console.log('useEnsureArtistProfile - Initial state:', {
    hasUser: !!user,
    userId: user?.id,
    hasProfile: !!profile,
    profileId: profile?.id,
    isLoading,
    error: error?.message,
    isCreating: createProfile.isPending
  })
  
  // Log when profile data changes
  React.useEffect(() => {
    console.log('useEnsureArtistProfile - Profile data changed:', {
      hasProfile: !!profile,
      profileId: profile?.id,
      profileName: profile?.artist_name
    })
  }, [profile])
  
  // Log when create state changes
  React.useEffect(() => {
    if (createProfile.isPending) {
      console.log('useEnsureArtistProfile - Profile creation started')
    }
    
    if (createProfile.isSuccess) {
      console.log('useEnsureArtistProfile - Profile creation successful:', {
        profile: createProfile.data
      })
    }
    
    if (createProfile.isError) {
      console.error('useEnsureArtistProfile - Profile creation failed:', {
        error: createProfile.error
      })
    }
  }, [createProfile.isPending, createProfile.isSuccess, createProfile.isError, createProfile.data, createProfile.error])
  
  const ensureProfile = async () => {
    console.log('ensureProfile - Starting profile check/creation')
    
    if (!user) {
      const errorMsg = 'User must be authenticated to ensure artist profile'
      console.error(errorMsg)
      throw new Error(errorMsg)
    }
    
    if (profile) {
      console.log('ensureProfile - Profile already exists, returning existing profile:', {
        profileId: profile.id,
        name: profile.artist_name
      })
      return profile
    }
    
    console.log('ensureProfile - No existing profile found, creating new one...')
    try {
      const newProfile = await createProfile.mutateAsync({
        artist_name: user.email?.split('@')[0] || 'Artist',
        email: user.email || '',
        is_public: true
      })
      
      console.log('ensureProfile - Successfully created new profile:', {
        profileId: newProfile.id,
        name: newProfile.artist_name
      })
      
      return newProfile
    } catch (err) {
      console.error('ensureProfile - Error creating profile:', err)
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
