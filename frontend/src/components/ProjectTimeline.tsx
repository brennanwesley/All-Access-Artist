import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react"
import { useUpdateTask, ReleaseTask } from "@/hooks/api/useReleaseDetails"

interface ProjectTimelineProps {
  releaseDate?: string | undefined
  tasks: ReleaseTask[]
}

export const ProjectTimeline = ({ releaseDate, tasks }: ProjectTimelineProps) => {
  const updateTaskMutation = useUpdateTask()

  // Mapping of task descriptions to days before release for date calculation
  const taskDaysMapping: Record<string, number> = {
    "Recording Complete": 42,
    "Artwork & Design": 35,
    "Launch Presave Campaign": 35,
    "Music Video Production": 35,
    "Mixing & Mastering": 32,
    "Upload to Distribution": 28,
    "Music Video Complete": 21,
    "Metadata Submission": 21,
    "DSP Distribution": 21
  }

  // Filter timeline tasks and sort by task_order
  const timelineTasks = tasks
    .filter(task => task.task_category === 'timeline')
    .sort((a, b) => a.task_order - b.task_order)

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

  // Fallback milestones for releases without timeline tasks (backward compatibility)
  const fallbackMilestones = [
    { name: "Recording Complete", daysBeforeRelease: 42 },
    { name: "Artwork & Design", daysBeforeRelease: 35 },
    { name: "Launch Presave Campaign", daysBeforeRelease: 35 },
    { name: "Music Video Production", daysBeforeRelease: 35 },
    { name: "Mixing & Mastering", daysBeforeRelease: 32 },
    { name: "Upload to Distribution", daysBeforeRelease: 28 },
    { name: "Music Video Complete", daysBeforeRelease: 21 },
    { name: "Metadata Submission", daysBeforeRelease: 21 },
    { name: "DSP Distribution", daysBeforeRelease: 21 }
  ]

  const calculateTargetDate = (daysBeforeRelease: number) => {
    if (!releaseDate) return null
    const release = new Date(releaseDate)
    const target = new Date(release)
    target.setDate(release.getDate() - daysBeforeRelease)
    return target
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: '2-digit' 
    })
  }

  const getStatus = (targetDate: Date | null) => {
    if (!targetDate) return "In Progress"
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return "Overdue"
    if (diffDays <= 7) return "Upcoming"
    return "In Progress"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete": return "text-green-600 bg-green-100"
      case "Upcoming": return "text-blue-600 bg-blue-100"
      case "Overdue": return "text-red-600 bg-red-100"
      default: return "text-muted-foreground bg-secondary/40"
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {timelineTasks.length > 0 ? (
          // Render database timeline tasks with interactive buttons
          timelineTasks.map((task) => {
            const isCompleted = !!task.completed_at
            return (
              <div 
                key={task.id}
                className="flex flex-col gap-3 rounded-lg border border-border/50 bg-secondary/20 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${
                    isCompleted ? 'text-muted-foreground line-through' : ''
                  }`}>
                    {task.task_description}
                  </h4>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {(() => {
                      const daysBeforeRelease = taskDaysMapping[task.task_description]
                      if (releaseDate && daysBeforeRelease) {
                        const targetDate = calculateTargetDate(daysBeforeRelease)
                        return targetDate ? formatDate(targetDate) : 'Release date needed'
                      }
                      return 'Release date needed'
                    })()}
                  </div>
                </div>

                <div className="w-full sm:ml-4 sm:w-auto sm:flex-shrink-0">
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
                            aria-label="Mark timeline task as incomplete"
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
        ) : (
          // Fallback to static milestones for backward compatibility
          fallbackMilestones.map((milestone, index) => {
            const targetDate = calculateTargetDate(milestone.daysBeforeRelease)
            const status = getStatus(targetDate)
            const statusColor = getStatusColor(status)
            
            return (
              <div 
                key={index}
                className="flex flex-col gap-3 rounded-lg border border-border/50 bg-secondary/20 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">
                    {milestone.name}
                  </h4>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {targetDate ? formatDate(targetDate) : 'Release date needed'}
                  </div>
                </div>

                <div className="w-full sm:ml-4 sm:w-auto sm:flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-md ${statusColor}`}>
                    {status}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
