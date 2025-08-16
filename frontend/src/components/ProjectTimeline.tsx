import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectTimelineProps {
  // Future props for release date calculations will go here
}

export const ProjectTimeline = ({ }: ProjectTimelineProps) => {
  const milestones = [
    { name: "Recording Complete", targetDate: "" },
    { name: "Mixing & Mastering", targetDate: "" },
    { name: "Artwork & Design", targetDate: "" },
    { name: "Metadata Submission", targetDate: "" },
    { name: "DSP Distribution", targetDate: "" },
    { name: "Marketing Campaign Launch", targetDate: "" }
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.map((milestone, index) => (
          <div 
            key={index}
            className="flex items-start justify-between p-4 rounded-lg bg-secondary/20 border border-border/50"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium">
                {milestone.name}
              </h4>
              <div className="mt-1 text-sm text-muted-foreground">
                {/* Date will be calculated and displayed here */}
              </div>
            </div>

            <div className="flex-shrink-0 ml-4">
              <span className="px-2 py-1 text-xs font-medium text-muted-foreground bg-secondary/40 rounded-md">
                In Progress
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
