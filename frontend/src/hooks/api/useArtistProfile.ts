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
      
      const response = await apiClient.getArtists()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch artist profile')
      }
      
      // Find the artist profile for the current user
      const artists = response.data as ArtistProfile[]
      const userProfile = artists.find(artist => artist.user_id === user.id)
      
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
  
  const ensureProfile = async () => {
    if (!user) {
      throw new Error('User must be authenticated')
    }
    
    if (profile) {
      return profile // Profile already exists
    }
    
    // Create profile if it doesn't exist
    return await createProfile.mutateAsync({})
  }
  
  return {
    profile,
    isLoading,
    error,
    hasProfile: !!profile,
    ensureProfile,
    isCreating: createProfile.isPending
  }
}
