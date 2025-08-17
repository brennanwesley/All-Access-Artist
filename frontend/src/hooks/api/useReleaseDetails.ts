import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

// Unified types for release details with comprehensive metadata
export interface ReleaseTask {
  id: string
  release_id: string
  artist_id: string
  task_description: string
  task_order: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Song {
  id: string
  release_id: string
  artist_id: string
  song_title: string
  duration_seconds?: number
  track_number: number
  created_at: string
  updated_at: string
}

export interface ReleaseDetails {
  id: string
  title: string
  artist_id: string
  release_type: 'single' | 'ep' | 'album' | 'mixtape'
  release_date: string
  genre?: string
  description?: string
  artwork_url?: string
  cover_art_url?: string // Legacy field support
  spotify_url?: string
  apple_music_url?: string
  youtube_url?: string
  bandcamp_url?: string
  soundcloud_url?: string
  is_explicit: boolean
  total_tracks?: number
  label?: string
  catalog_number?: string
  upc_code?: string
  isrc_code?: string
  copyright_info?: string
  producer_credits?: string
  songwriter_credits?: string
  recording_location?: string
  mastering_engineer?: string
  mixing_engineer?: string
  project_budget?: number
  additional_data?: Record<string, any>
  status: string
  created_at: string
  updated_at: string
  release_tasks: ReleaseTask[]
  songs?: Song[] // Optional for backward compatibility
}

// Query hook for fetching release details with proper data extraction
export const useGetReleaseDetails = (releaseId: string) => {
  return useQuery({
    queryKey: ['release-details', releaseId],
    queryFn: async () => {
      console.log('useGetReleaseDetails: Fetching release details for ID:', releaseId)
      
      const response = await apiClient.getReleaseDetails(releaseId)
      
      if (response.error) {
        console.error('useGetReleaseDetails: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useGetReleaseDetails: Raw API response:', response)
      
      // Extract nested data from backend response wrapper
      let releaseData;
      if (response.data?.success === true && response.data?.data) {
        console.log('useGetReleaseDetails: Extracting from success wrapper')
        releaseData = response.data.data
      } else if (response.data && typeof response.data === 'object' && 'title' in response.data) {
        console.log('useGetReleaseDetails: Using response.data directly')
        releaseData = response.data
      } else {
        console.log('useGetReleaseDetails: No valid data found')
        releaseData = null
      }
      
      console.log('useGetReleaseDetails: Extracted release data:', releaseData)
      
      // Emergency fallback: if extraction failed but we have nested data, force extract it
      const finalData = releaseData?.title ? releaseData : response.data?.data
      
      if (!finalData) {
        throw new Error('No release data found in response')
      }
      
      console.log('useGetReleaseDetails: Final data to return:', finalData)
      return finalData as ReleaseDetails
    },
    enabled: !!releaseId,
  })
}

// Hook to update a task's completion status
export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      console.log('useUpdateTask: Updating task', taskId, 'completion status:', completed)
      
      const response = await apiClient.updateTask(taskId, {
        completed_at: completed ? new Date().toISOString() : null
      })
      
      if (response.error) {
        console.error('useUpdateTask: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useUpdateTask: Success')
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch release details to update the task list
      queryClient.invalidateQueries({ queryKey: ['release-details'] })
      
      const action = variables.completed ? 'completed' : 'reopened'
      toast.success(`Task ${action} successfully!`)
    },
    onError: (error) => {
      console.error('useUpdateTask: Mutation failed:', error)
      toast.error(`Failed to update task: ${error.message}`)
    }
  })
}

// Hook to update release details
export const useUpdateRelease = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ releaseId, updateData }: { 
      releaseId: string; 
      updateData: Partial<ReleaseDetails> 
    }) => {
      console.log('useUpdateRelease: Updating release', releaseId, 'with data:', updateData)
      
      const response = await apiClient.updateRelease(releaseId, updateData)
      
      if (response.error) {
        console.error('useUpdateRelease: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useUpdateRelease: Success')
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch release details to update the UI
      queryClient.invalidateQueries({ queryKey: ['release-details', variables.releaseId] })
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      
      toast.success('Release updated successfully!')
    },
    onError: (error) => {
      console.error('useUpdateRelease: Mutation failed:', error)
      toast.error(`Failed to update release: ${error.message}`)
    }
  })
}

// Hook to add a song to a release
export const useAddSong = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ releaseId, songData }: { 
      releaseId: string; 
      songData: { song_title: string; duration_seconds?: number; track_number: number } 
    }) => {
      console.log('useAddSong: Adding song to release', releaseId, songData)
      
      const response = await apiClient.addSong(releaseId, songData)
      
      if (response.error) {
        console.error('useAddSong: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useAddSong: Success')
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch release details to update the song list
      queryClient.invalidateQueries({ queryKey: ['release-details', variables.releaseId] })
      
      toast.success('Song added successfully!')
    },
    onError: (error) => {
      console.error('useAddSong: Mutation failed:', error)
      toast.error(`Failed to add song: ${error.message}`)
    }
  })
}

// Hook to update a song
export const useUpdateSong = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ songId, songData }: { 
      songId: string; 
      songData: { song_title?: string; duration_seconds?: number; track_number?: number } 
    }) => {
      console.log('useUpdateSong: Updating song', songId, songData)
      
      const response = await apiClient.updateSong(songId, songData)
      
      if (response.error) {
        console.error('useUpdateSong: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useUpdateSong: Success')
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch release details to update the song list
      queryClient.invalidateQueries({ queryKey: ['release-details'] })
      
      toast.success('Song updated successfully!')
    },
    onError: (error) => {
      console.error('useUpdateSong: Mutation failed:', error)
      toast.error(`Failed to update song: ${error.message}`)
    }
  })
}

// Hook to delete a song
export const useDeleteSong = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (songId: string) => {
      console.log('useDeleteSong: Deleting song', songId)
      
      const response = await apiClient.deleteSong(songId)
      
      if (response.error) {
        console.error('useDeleteSong: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useDeleteSong: Success')
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch release details to update the song list
      queryClient.invalidateQueries({ queryKey: ['release-details'] })
      
      toast.success('Song deleted successfully!')
    },
    onError: (error) => {
      console.error('useDeleteSong: Mutation failed:', error)
      toast.error(`Failed to delete song: ${error.message}`)
    }
  })
}

// Legacy exports for backward compatibility
export type ReleaseDetail = ReleaseDetails
