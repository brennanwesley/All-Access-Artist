import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import { logger } from '@/lib/logger'
import type { BackendResponse } from '../../types/api'

interface UpdateTaskData {
  is_completed: boolean
  completed_at?: string | null
}

interface UpdateTaskResponse {
  id: string
  release_id: string
  user_id: string
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

interface ReleaseDetailsCacheShape {
  release_tasks: UpdateTaskResponse[]
  [key: string]: unknown
}

// Mutation hook for updating task completion status
export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: UpdateTaskData }) => {
      const response = await apiClient.updateTask(taskId, data)
      const backendResponse = response.data as BackendResponse<UpdateTaskResponse> | undefined
      const errorMessage =
        backendResponse && !backendResponse.success
          ? backendResponse.error.message
          : response.error

      if (response.status !== 200 || !backendResponse || !backendResponse.success) {
        throw new Error(errorMessage || 'Failed to update task')
      }

      return backendResponse.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch the release details query to trigger automatic refresh
      queryClient.invalidateQueries({ 
        queryKey: ['release-details', data.release_id] 
      })
      
      // Optionally update the cache directly for immediate UI feedback
      queryClient.setQueryData(['release-details', data.release_id], (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') {
          return oldData
        }

        const cachedData = oldData as ReleaseDetailsCacheShape
        if (!Array.isArray(cachedData.release_tasks)) {
          return oldData
        }

        return {
          ...cachedData,
          release_tasks: cachedData.release_tasks.map((task) =>
            task.id === data.id ? data : task
          ),
        }
      })
    },
    onError: (error) => {
      logger.error('Failed to update task', { error })
    }
  })
}

export type { UpdateTaskData, UpdateTaskResponse }
