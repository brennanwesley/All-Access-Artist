/**
 * Task Management Hook - Handles daily task state and operations
 * Extracted from Dashboard component for SRP compliance
 */
import { useState, useCallback } from 'react'

export interface Task {
  id: number
  task: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

const initialTasks: Task[] = [
  { id: 1, task: "Post TikTok video from content calendar", completed: false, priority: "high" },
  { id: 2, task: "Check streaming numbers on Spotify for Artists", completed: false, priority: "medium" },
  { id: 3, task: "Respond to fan comments on Instagram", completed: true, priority: "medium" },
  { id: 4, task: "Upload behind-the-scenes content", completed: false, priority: "low" },
  { id: 5, task: "Review and approve press release draft", completed: false, priority: "high" }
]

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const toggleTask = useCallback((taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }, [])

  const addTask = useCallback((taskText: string, priority: Task['priority'] = 'medium') => {
    const newTask: Task = {
      id: Date.now(),
      task: taskText,
      completed: false,
      priority
    }
    setTasks(prevTasks => [...prevTasks, newTask])
  }, [])

  const removeTask = useCallback((taskId: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
  }, [])

  const getTaskStats = useCallback(() => {
    const completed = tasks.filter(task => task.completed).length
    const total = tasks.length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return {
      completed,
      total,
      completionRate,
      remaining: total - completed
    }
  }, [tasks])

  return {
    tasks,
    toggleTask,
    addTask,
    removeTask,
    getTaskStats
  }
}
