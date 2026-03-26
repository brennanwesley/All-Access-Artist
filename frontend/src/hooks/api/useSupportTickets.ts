import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import type {
  BackendResponse,
  CreateSupportTicketData,
  SupportTicket,
  SupportTicketOverview,
  UpdateSupportTicketStatusData,
  SupportTicketAdminItem,
} from '../../types/api'

// Re-export types for convenience
export type {
  CreateSupportTicketData,
  SupportTicket,
  SupportTicketOverview,
  UpdateSupportTicketStatusData,
  SupportTicketAdminItem,
}

export const useSupportTickets = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async () => {
      const response = await apiClient.getSupportTickets()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch support tickets')
      }

      const backendResponse = response.data as BackendResponse<SupportTicket[]> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }

      throw new Error('Invalid response from server')
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    retry: 2,
  })
}

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticketData: CreateSupportTicketData) => {
      const response = await apiClient.createSupportTicket(ticketData)
      if (response.status !== 201) {
        throw new Error(response.error || 'Failed to create support ticket')
      }

      const backendResponse = response.data as BackendResponse<SupportTicket> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }

      throw new Error('Invalid response from server')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      await queryClient.invalidateQueries({ queryKey: ['support-overview'] })
    },
  })
}

export const useSupportOverview = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['support-overview', user?.id],
    queryFn: async () => {
      const response = await apiClient.getSupportOverview()
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to fetch support overview')
      }

      const backendResponse = response.data as BackendResponse<SupportTicketOverview> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }

      throw new Error('Invalid response from server')
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    retry: 2,
  })
}

export const useUpdateSupportTicketStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, ticketData }: { ticketId: string; ticketData: UpdateSupportTicketStatusData }) => {
      const response = await apiClient.updateSupportTicketStatus(ticketId, ticketData)
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to update support ticket')
      }

      const backendResponse = response.data as BackendResponse<SupportTicketAdminItem> | undefined
      if (backendResponse && 'success' in backendResponse && backendResponse.success) {
        return backendResponse.data
      }

      throw new Error('Invalid response from server')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['support-overview'] })
      await queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}
