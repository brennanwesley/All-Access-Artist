import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

interface UpdateTaskData {
  is_completed: boolean
  completed_at?: string | null
}

interface UpdateTaskResponse {
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

// Mutation hook for updating task completion status
export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: UpdateTaskData }) => {
      const response = await apiClient.updateTask(taskId, data)
      if (response.status !== 200) {
        throw new Error(response.error || 'Failed to update task')
      }
      return response.data as UpdateTaskResponse
    },
    onSuccess: (data) => {
      // Invalidate and refetch the release details query to trigger automatic refresh
      queryClient.invalidateQueries({ 
        queryKey: ['release-details', data.release_id] 
      })
      
      // Optionally update the cache directly for immediate UI feedback
      queryClient.setQueryData(['release-details', data.release_id], (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          release_tasks: oldData.release_tasks.map((task: any) => 
            task.id === data.id ? data : task
          )
        }
      })
    },
    onError: (error) => {
      console.error('Failed to update task:', error)
    }
  })
}

export type { UpdateTaskData, UpdateTaskResponse }
