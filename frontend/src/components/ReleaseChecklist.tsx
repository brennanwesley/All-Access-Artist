import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CheckCircle2, Circle, Loader2, RotateCcw } from "lucide-react"
import { useUpdateTask, ReleaseTask } from "@/hooks/api/useReleaseDetails"
import { ProjectTimeline } from "./ProjectTimeline"

interface ReleaseChecklistProps {
  tasks: ReleaseTask[]
  releaseDate?: string
}

export const ReleaseChecklist = ({ tasks, releaseDate }: ReleaseChecklistProps) => {
  const updateTaskMutation = useUpdateTask()

  const handleMarkComplete = async (taskId: string, currentStatus: boolean) => {
    updateTaskMutation.mutate({
      taskId,
      completed: !currentStatus
    })
  }

  const handleUncheckTask = (taskId: string) => {
    updateTaskMutation.mutate({
      taskId,
      completed: false
    })
  }

  // Check if this specific task is being updated
  const isTaskUpdating = (taskId: string) => {
    return updateTaskMutation.isPending && updateTaskMutation.variables?.taskId === taskId
  }

  const formatCompletedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: '2-digit' 
    })
  }

  // Filter and sort checklist tasks only
  const checklistTasks = tasks
    .filter(task => task.task_category === 'checklist')
    .sort((a, b) => {
      if (a.task_order !== b.task_order) {
        return a.task_order - b.task_order
      }
      // If same order, put incomplete tasks first
      const aCompleted = !!a.completed_at
      const bCompleted = !!b.completed_at
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1
      }
      return 0
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Project Timeline - 40% (2/5 columns) */}
      <div className="lg:col-span-2">
        <ProjectTimeline releaseDate={releaseDate} tasks={tasks} />
      </div>

      {/* Project Checklist - 60% (3/5 columns) */}
      <div className="lg:col-span-3">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Project Checklist</CardTitle>
            <CardDescription>
              Complete all tasks to prepare your release
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklistTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tasks available</p>
            ) : (
              checklistTasks.map((task) => {
                const isCompleted = !!task.completed_at
                return (
                  <div 
                    key={task.id} 
                    className="flex flex-col gap-3 rounded-lg border border-border/50 bg-secondary/20 p-4 sm:flex-row sm:items-start"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex-shrink-0 pt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`break-words font-medium leading-snug ${
                          isCompleted ? 'text-muted-foreground line-through' : ''
                        }`}>
                          {task.task_description}
                        </h4>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto sm:flex-shrink-0">
                      {isCompleted ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <div className="flex items-start gap-2 text-xs text-green-600 sm:text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="break-words leading-snug">
                              Completed {task.completed_at ? formatCompletedDate(task.completed_at) : 'Unknown'}
                            </span>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-10 w-10 self-start p-0 text-muted-foreground hover:text-foreground sm:self-auto md:h-8 md:w-8"
                                aria-label="Mark task as incomplete"
                                disabled={isTaskUpdating(task.id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Mark task as incomplete?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the completion date and move this task back to your active tasks list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUncheckTask(task.id)}>
                                  Mark Incomplete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleMarkComplete(task.id, isCompleted)}
                          disabled={isTaskUpdating(task.id)}
                          className="w-full sm:min-w-[120px] sm:w-auto"
                        >
                          {isTaskUpdating(task.id) ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Mark Complete'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
