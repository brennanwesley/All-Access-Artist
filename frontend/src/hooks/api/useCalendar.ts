import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

// Types for calendar data
interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string
  event_date: string
  event_type: string
  status: 'draft' | 'scheduled' | 'published'
  platform?: string
  content_url?: string
  engagement_metrics?: Record<string, number>
  created_at: string
  updated_at: string
}

interface CreateCalendarEventData {
  user_id: string
  title: string
  description?: string
  event_date: string
  event_type: string
  status?: 'draft' | 'scheduled' | 'published'
  platform?: string
  content_url?: string
}

// Query hook for fetching calendar events
export const useCalendar = (userId?: string) => {
  return useQuery({
    queryKey: userId ? ['calendar', userId] : ['calendar'],
    queryFn: async () => {
      const response = await apiClient.getCalendar(userId)
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch calendar events')
      }
      return response.data as CalendarEvent[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!userId, // Only run query if userId is provided
  })
}

// Mutation hook for creating calendar events
export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventData: CreateCalendarEventData) => {
      const response = await apiClient.createCalendarEvent(eventData)
      if (response.status !== 201) {
        throw new Error(response.error || 'Failed to create calendar event')
      }
      return response.data as CalendarEvent
    },
    onSuccess: (data) => {
      // Invalidate and refetch calendar lists
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['calendar', data.user_id] })
    },
  })
}
