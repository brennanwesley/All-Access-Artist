import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectTimelineProps {
  releaseDate?: string | undefined
}

export const ProjectTimeline = ({ releaseDate }: ProjectTimelineProps) => {
  const milestones = [
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
        {milestones.map((milestone, index) => {
          const targetDate = calculateTargetDate(milestone.daysBeforeRelease)
          const status = getStatus(targetDate)
          const statusColor = getStatusColor(status)
          
          return (
            <div 
              key={index}
              className="flex items-start justify-between p-4 rounded-lg bg-secondary/20 border border-border/50"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">
                  {milestone.name}
                </h4>
                <div className="mt-1 text-sm text-muted-foreground">
                  {targetDate ? formatDate(targetDate) : 'Release date needed'}
                </div>
              </div>

              <div className="flex-shrink-0 ml-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${statusColor}`}>
                  {status}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
