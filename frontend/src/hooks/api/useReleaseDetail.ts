import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

// Types for Release Detail data
export interface ReleaseTask {
  id: string
  release_id: string
  task_description: string
  task_order: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Song {
  id: string
  release_id: string
  title: string
  duration?: number
  track_number: number
  created_at: string
  updated_at: string
}

export interface ReleaseDetail {
  id: string
  artist_id: string
  title: string
  release_type: string
  genre?: string
  description?: string
  release_date: string
  status: string
  cover_art_url?: string
  created_at: string
  updated_at: string
  release_tasks: ReleaseTask[]
  songs: Song[]
}

// Hook to fetch release details with tasks and songs
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
      
      console.log('useGetReleaseDetails: Success, received data:', response.data)
      return response.data as ReleaseDetail
    },
    enabled: !!releaseId,
  })
}

// Hook to update a task's completion status
export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      console.log('useUpdateTask: Updating task', taskId, 'completed:', completed)
      
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
      console.error('useUpdateTask: Mutation error:', error)
      toast.error(`Failed to update task: ${error.message}`)
    },
  })
}

// Hook to add a new song to a release
export const useAddSong = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ releaseId, songData }: { releaseId: string; songData: { title: string; track_number: number; duration?: number } }) => {
      console.log('useAddSong: Adding song to release', releaseId, 'data:', songData)
      
      const response = await apiClient.addSong(releaseId, songData)
      
      if (response.error) {
        console.error('useAddSong: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useAddSong: Success')
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch release details to update the songs list
      queryClient.invalidateQueries({ queryKey: ['release-details', variables.releaseId] })
      
      toast.success('Song added successfully!')
    },
    onError: (error) => {
      console.error('useAddSong: Mutation error:', error)
      toast.error(`Failed to add song: ${error.message}`)
    },
  })
}

// Hook to update a song
export const useUpdateSong = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ songId, songData }: { songId: string; songData: Partial<Song> }) => {
      console.log('useUpdateSong: Updating song', songId, 'data:', songData)
      
      const response = await apiClient.updateSong(songId, songData)
      
      if (response.error) {
        console.error('useUpdateSong: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useUpdateSong: Success')
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch release details to update the songs list
      queryClient.invalidateQueries({ queryKey: ['release-details'] })
      
      toast.success('Song updated successfully!')
    },
    onError: (error) => {
      console.error('useUpdateSong: Mutation error:', error)
      toast.error(`Failed to update song: ${error.message}`)
    },
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
      // Invalidate and refetch release details to update the songs list
      queryClient.invalidateQueries({ queryKey: ['release-details'] })
      
      toast.success('Song deleted successfully!')
    },
    onError: (error) => {
      console.error('useDeleteSong: Mutation error:', error)
      toast.error(`Failed to delete song: ${error.message}`)
    },
  })
}
