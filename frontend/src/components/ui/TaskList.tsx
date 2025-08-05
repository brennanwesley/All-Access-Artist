/**
 * TaskList - Presentational component for displaying tasks
 * Follows SRP: Only responsible for rendering task UI
 */
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Progress } from './progress'
import { CheckCircle2, Circle, Plus } from 'lucide-react'
import type { Task } from '../../hooks/useTasks'

interface TaskListProps {
  tasks: Task[]
  completionRate: number
  onToggleTask: (taskId: number) => void
  onAddTask?: () => void
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  completionRate,
  onToggleTask,
  onAddTask
}) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Daily Tasks</CardTitle>
        {onAddTask && (
          <Button variant="outline" size="sm" onClick={onAddTask}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completionRate}% complete</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <button
                onClick={() => onToggleTask(task.id)}
                className="flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${
                  task.completed 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-900'
                }`}>
                  {task.task}
                </p>
              </div>
              
              <Badge 
                variant="outline" 
                className={`text-xs ${getPriorityColor(task.priority)} text-white border-none`}
              >
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
