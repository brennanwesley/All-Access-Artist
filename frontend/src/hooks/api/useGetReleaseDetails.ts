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
      
      // The console shows the hook is receiving the wrapper object but not extracting properly
      // Let's check what's actually happening with the extraction
      console.log('useGetReleaseDetails: Checking response.data structure:', response.data);
      console.log('useGetReleaseDetails: response.data.success:', response.data?.success);
      console.log('useGetReleaseDetails: response.data.data:', response.data?.data);
      
      // Force extraction of nested data - the console clearly shows it exists
      if (response.data?.success === true && response.data?.data) {
        releaseData = response.data.data;
        console.log('useGetReleaseDetails: FORCED extraction - releaseData:', releaseData);
        console.log('useGetReleaseDetails: FORCED extraction - title:', releaseData.title);
      } else {
        console.error('useGetReleaseDetails: Failed to extract data from response');
        releaseData = null;
      }
      
      console.log('useGetReleaseDetails: Final extracted release data:', releaseData)
      console.log('useGetReleaseDetails: Release title from extracted data:', releaseData?.title)
      
      if (!releaseData) {
        throw new Error('No release data found in response')
      }
      
      // CRITICAL FIX: The hook was returning the wrapper object instead of extracted data
      // This is why release.title was undefined even though the data existed
      console.log('useGetReleaseDetails: About to return:', releaseData)
      
      return releaseData as ReleaseDetails
    },
    enabled: !!releaseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export type { ReleaseDetails, ReleaseTask }
