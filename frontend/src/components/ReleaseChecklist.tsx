import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CheckCircle2, Circle, Loader2, RotateCcw } from "lucide-react"
import { useUpdateTask, ReleaseTask } from "@/hooks/api/useReleaseDetail"
import { ProjectTimeline } from "./ProjectTimeline"

interface ReleaseChecklistProps {
  tasks: ReleaseTask[]
}

export const ReleaseChecklist = ({ tasks }: ReleaseChecklistProps) => {
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

  const formatCompletedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: '2-digit' 
    })
  }

  // Sort tasks by order, then by completion status (incomplete first)
  const sortedTasks = [...tasks].sort((a, b) => {
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
        <ProjectTimeline />
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
            {sortedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tasks found for this release.</p>
              </div>
            ) : (
              sortedTasks.map((task) => {
                const isCompleted = !!task.completed_at
                return (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/20 border border-border/50"
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${
                        isCompleted ? 'text-muted-foreground line-through' : ''
                      }`}>
                        {task.task_description}
                      </h4>
                    </div>

                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                              Completed {task.completed_at ? formatCompletedDate(task.completed_at) : 'Unknown'}
                            </span>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                disabled={updateTaskMutation.isPending}
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
                          disabled={updateTaskMutation.isPending}
                          className="min-w-[120px]"
                        >
                          {updateTaskMutation.isPending ? (
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
