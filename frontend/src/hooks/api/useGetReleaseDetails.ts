import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

// Types for release details with tasks
interface ReleaseTask {
  id: string
  release_id: string
  artist_id: string
  task_name: string
  task_description: string
  is_completed: boolean
  completed_at: string | null
  due_date: string | null
  task_order: number
  is_required: boolean
  created_at: string
  updated_at: string
}

interface ReleaseDetails {
  id: string
  title: string
  artist_id: string
  release_type: 'single' | 'ep' | 'album' | 'mixtape'
  release_date: string
  genre?: string
  description?: string
  artwork_url?: string
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
  created_at: string
  updated_at: string
  release_tasks: ReleaseTask[]
}

// Query hook for fetching release details with tasks
export const useGetReleaseDetails = (releaseId: string) => {
  return useQuery({
    queryKey: ['release-details', releaseId],
    queryFn: async () => {
      const response = await apiClient.getReleaseDetails(releaseId)
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch release details')
      }
      
      const releaseData = response.data as ReleaseDetails
      
      // If no tasks exist, try to generate them
      if (!releaseData.release_tasks || releaseData.release_tasks.length === 0) {
        try {
          await apiClient.generateTasksForRelease(releaseId)
          // Refetch the data to get the newly generated tasks
          const updatedResponse = await apiClient.getReleaseDetails(releaseId)
          if (updatedResponse.status === 200) {
            return updatedResponse.data as ReleaseDetails
          }
        } catch (error) {
          console.warn('Failed to generate tasks for release:', error)
          // Continue with original data even if task generation fails
        }
      }
      
      return releaseData
    },
    enabled: !!releaseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export type { ReleaseDetails, ReleaseTask }
