import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

// Types for Lyric Sheet data
export interface LyricSection {
  id: string
  lyric_sheet_id: string
  section_type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'outro' | 'intro' | 'other'
  section_order: number
  content: string
  created_at: string
  updated_at: string
}

export interface LyricSheet {
  id: string
  song_id: string
  title: string
  language: string
  notes?: string
  created_at: string
  updated_at: string
  sections: LyricSection[]
}

// Hook to fetch lyric sheet for a specific song
export const useGetLyricSheet = (songId: string) => {
  return useQuery({
    queryKey: ['lyric-sheet', songId],
    queryFn: async () => {
      console.log('useGetLyricSheet: Fetching lyric sheet for song ID:', songId)
      
      const response = await apiClient.getLyricSheet(songId)
      
      if (response.error) {
        // If no lyric sheet exists, return null instead of throwing
        if (response.status === 404) {
          console.log('useGetLyricSheet: No lyric sheet found for song', songId)
          return null
        }
        
        console.error('useGetLyricSheet: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useGetLyricSheet: Success, received data:', response.data)
      return response.data as LyricSheet
    },
    enabled: !!songId,
  })
}

// Hook to create a new lyric sheet
export const useCreateLyricSheet = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ songId, lyricData }: { songId: string; lyricData: { title: string; language: string; notes?: string } }) => {
      console.log('useCreateLyricSheet: Creating lyric sheet for song', songId, 'data:', lyricData)
      
      const response = await apiClient.createLyricSheet(songId, lyricData)
      
      if (response.error) {
        console.error('useCreateLyricSheet: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useCreateLyricSheet: Success')
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch lyric sheet to update the UI
      queryClient.invalidateQueries({ queryKey: ['lyric-sheet', variables.songId] })
      
      toast.success('Lyric sheet created successfully!')
    },
    onError: (error) => {
      console.error('useCreateLyricSheet: Mutation error:', error)
      toast.error(`Failed to create lyric sheet: ${error.message}`)
    },
  })
}

// Hook to update an existing lyric sheet
export const useUpdateLyricSheet = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ songId, lyricData }: { songId: string; lyricData: Partial<LyricSheet> }) => {
      console.log('useUpdateLyricSheet: Updating lyric sheet for song', songId, 'data:', lyricData)
      
      const response = await apiClient.updateLyricSheet(songId, lyricData)
      
      if (response.error) {
        console.error('useUpdateLyricSheet: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useUpdateLyricSheet: Success')
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch lyric sheet to update the UI
      queryClient.invalidateQueries({ queryKey: ['lyric-sheet', variables.songId] })
      
      toast.success('Lyric sheet updated successfully!')
    },
    onError: (error) => {
      console.error('useUpdateLyricSheet: Mutation error:', error)
      toast.error(`Failed to update lyric sheet: ${error.message}`)
    },
  })
}

// Hook to add a new lyric section
export const useAddLyricSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ songId, sectionData }: { 
      songId: string; 
      sectionData: { 
        section_type: LyricSection['section_type']; 
        section_order: number; 
        content: string 
      } 
    }) => {
      console.log('useAddLyricSection: Adding section to song', songId, 'data:', sectionData)
      
      const response = await apiClient.addLyricSection(songId, sectionData)
      
      if (response.error) {
        console.error('useAddLyricSection: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useAddLyricSection: Success')
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch lyric sheet to update the sections
      queryClient.invalidateQueries({ queryKey: ['lyric-sheet', variables.songId] })
      
      toast.success('Lyric section added successfully!')
    },
    onError: (error) => {
      console.error('useAddLyricSection: Mutation error:', error)
      toast.error(`Failed to add lyric section: ${error.message}`)
    },
  })
}

// Hook to update a lyric section
export const useUpdateLyricSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ sectionId, sectionData, songId }: { 
      sectionId: string; 
      sectionData: Partial<LyricSection>;
      songId: string; // Needed for cache invalidation
    }) => {
      console.log('useUpdateLyricSection: Updating section', sectionId, 'data:', sectionData)
      
      const response = await apiClient.updateLyricSection(sectionId, sectionData)
      
      if (response.error) {
        console.error('useUpdateLyricSection: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useUpdateLyricSection: Success')
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch lyric sheet to update the sections
      queryClient.invalidateQueries({ queryKey: ['lyric-sheet', variables.songId] })
      
      toast.success('Lyric section updated successfully!')
    },
    onError: (error) => {
      console.error('useUpdateLyricSection: Mutation error:', error)
      toast.error(`Failed to update lyric section: ${error.message}`)
    },
  })
}

// Hook to delete a lyric section
export const useDeleteLyricSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ sectionId, songId }: { sectionId: string; songId: string }) => {
      console.log('useDeleteLyricSection: Deleting section', sectionId)
      
      const response = await apiClient.deleteLyricSection(sectionId)
      
      if (response.error) {
        console.error('useDeleteLyricSection: API Error:', response.error)
        throw new Error(response.error)
      }
      
      console.log('useDeleteLyricSection: Success')
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch lyric sheet to update the sections
      queryClient.invalidateQueries({ queryKey: ['lyric-sheet', variables.songId] })
      
      toast.success('Lyric section deleted successfully!')
    },
    onError: (error) => {
      console.error('useDeleteLyricSection: Mutation error:', error)
      toast.error(`Failed to delete lyric section: ${error.message}`)
    },
  })
}
