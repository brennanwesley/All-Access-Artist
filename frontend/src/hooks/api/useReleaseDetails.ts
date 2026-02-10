import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import type {
  ReleaseTask,
  Song,
  LyricSection,
  LyricSectionType,
  LyricSheet,
  ReleaseDetails
} from '@/types/api'

// Re-export types for consumer compatibility
export type { ReleaseTask, Song, LyricSection, LyricSectionType, LyricSheet, ReleaseDetails }

// Query hook for fetching release details with proper data extraction
export const useGetReleaseDetails = (releaseId: string) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['release-details', releaseId, user?.id],
    queryFn: async () => {
      const response = await apiClient.getReleaseDetails(releaseId)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Extract nested data from backend response wrapper
      let releaseData;
      if (response.data?.success === true && response.data?.data) {
        releaseData = response.data.data
      } else if (response.data && typeof response.data === 'object' && 'title' in response.data) {
        releaseData = response.data
      } else {
        releaseData = null
      }
      
      // Emergency fallback: if extraction failed but we have nested data, force extract it
      const finalData = releaseData?.title ? releaseData : response.data?.data
      
      if (!finalData) {
        throw new Error('No release data found in response')
      }
      
      return finalData as ReleaseDetails
    },
    enabled: !!releaseId && !!user,
  })
}

// Hook to update a task's completion status
export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const response = await apiClient.updateTask(taskId, {
        completed_at: completed ? new Date().toISOString() : null
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate user-specific release details cache
      queryClient.invalidateQueries({ queryKey: ['release-details'], predicate: (query) => 
        query.queryKey.includes(user?.id) 
      })
      
      const action = variables.completed ? 'completed' : 'reopened'
      toast.success(`Task ${action} successfully!`)
    },
    onError: (error) => {
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
      const response = await apiClient.updateRelease(releaseId, updateData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch release details to update the UI
      queryClient.invalidateQueries({ queryKey: ['release-details', variables.releaseId] })
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      
      toast.success('Release updated successfully!')
    },
    onError: (error) => {
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
      const response = await apiClient.addSong(releaseId, songData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch release details to update the song list
      queryClient.invalidateQueries({ queryKey: ['release-details', variables.releaseId] })
      
      toast.success('Song added successfully!')
    },
    onError: (error) => {
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
      const response = await apiClient.updateSong(songId, songData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch release details to update the song list
      queryClient.invalidateQueries({ queryKey: ['release-details'] })
      
      toast.success('Song updated successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to update song: ${error.message}`)
    }
  })
}

// Hook to delete a song
export const useDeleteSong = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (songId: string) => {
      const response = await apiClient.deleteSong(songId)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch release details to update the song list
      queryClient.invalidateQueries({ queryKey: ['release-details'] })
      
      toast.success('Song deleted successfully!')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete song')
    }
  })
}

// Hook to get lyric sheet for a song
export const useGetLyricSheet = (songId: string | null) => {
  return useQuery({
    queryKey: ['lyricSheet', songId],
    queryFn: async () => {
      if (!songId) return null
      
      const response = await apiClient.getLyricSheet(songId)
      
      // Handle 404 gracefully - no lyric sheet exists yet
      if (response.error && response.error.includes('No lyric sheet found')) {
        return null
      }
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Extract the actual lyric sheet data from the API response wrapper
      return response.data.data as LyricSheet
    },
    enabled: !!songId,
    retry: false // Don't retry 404s
  })
}

// Hook to create a lyric sheet
export const useCreateLyricSheet = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ songId, writtenBy, notes }: {
      songId: string
      writtenBy?: string
      notes?: string
    }) => {
      const response = await apiClient.createLyricSheet(songId, { 
        written_by: writtenBy || '',
        additional_notes: notes || ''
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch the lyric sheet sections
      queryClient.invalidateQueries({ queryKey: ['lyricSheet', variables.songId] })
      toast.success('Lyric section updated successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create lyric sheet')
    }
  })
}

// Hook to add a lyric section
export const useAddLyricSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ songId, sectionData }: { 
      songId: string; 
      sectionData: { section_type: LyricSection['section_type']; content: string } 
    }) => {
      const response = await apiClient.addLyricSection(songId, sectionData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lyricSheet', variables.songId] })
      toast.success('Lyric section added successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add lyric section')
    }
  })
}

// Hook to update a lyric section
export const useUpdateLyricSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ sectionId, sectionData }: { 
      sectionId: string; 
      sectionData: { section_type?: LyricSection['section_type']; content?: string; section_order?: number };
      songId: string;
    }) => {
      const response = await apiClient.updateLyricSection(sectionId, sectionData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lyricSheet', variables.songId] })
      toast.success('Lyric section updated successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update lyric section')
    }
  })
}

// Hook to delete a lyric section
export const useDeleteLyricSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ sectionId }: { sectionId: string; songId: string }) => {
      const response = await apiClient.deleteLyricSection(sectionId)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lyricSheet', variables.songId] })
      toast.success('Lyric section deleted successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete lyric section')
    }
  })
}

// Legacy exports for backward compatibility
export type ReleaseDetail = ReleaseDetails
