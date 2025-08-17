import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

// Types for release details with tasks
interface ReleaseTask {
  id: string
  release_id: string
  artist_id: string
  task_description: string
  task_order: number
  completed_at: string | null
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
      console.log('useGetReleaseDetails: Fetching release details for ID:', releaseId)
      
      const response = await apiClient.getReleaseDetails(releaseId)
      
      console.log('useGetReleaseDetails: Raw API response:', response)
      
      if (response.error) {
        console.error('useGetReleaseDetails: API Error:', response.error)
        throw new Error(response.error)
      }
      
      // The response structure is: response.data = { success: true, data: releaseWithDetails }
      // We need to extract the inner data property
      let releaseData;
      
      console.log('useGetReleaseDetails: Response structure check:', {
        hasData: !!response.data,
        hasSuccess: !!response.data?.success,
        hasNestedData: !!response.data?.data,
        responseDataType: typeof response.data
      });
      
      // Extract the actual release data from the nested structure
      if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
        releaseData = response.data.data;
        console.log('useGetReleaseDetails: Using nested data extraction');
      } else if (response.data && typeof response.data === 'object' && 'title' in response.data) {
        releaseData = response.data;
        console.log('useGetReleaseDetails: Using direct data');
      } else {
        console.error('useGetReleaseDetails: Unexpected response structure:', response.data);
        releaseData = null;
      }
      
      console.log('useGetReleaseDetails: Final extracted release data:', releaseData)
      console.log('useGetReleaseDetails: Release title from extracted data:', releaseData?.title)
      
      if (!releaseData) {
        throw new Error('No release data found in response')
      }
      
      return releaseData as ReleaseDetails
    },
    enabled: !!releaseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export type { ReleaseDetails, ReleaseTask }
