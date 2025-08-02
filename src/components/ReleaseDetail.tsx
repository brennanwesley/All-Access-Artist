import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, DollarSign, Eye, CheckCircle2, Circle, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { MetadataPrep } from "./MetadataPrep";

interface ReleaseDetailProps {
  releaseId: number;
  onBack: () => void;
}

export const ReleaseDetail = ({ releaseId, onBack }: ReleaseDetailProps) => {
  const [showMetadata, setShowMetadata] = useState(false);
  // This would typically come from props or a data store
  const release = {
    id: 1,
    title: "Summer Vibes EP",
    releaseDate: "2024-08-15",
    status: "In Progress",
    progress: 75,
    tracks: 4,
    presaves: 245,
    presaveGoal: 500,
    totalContentViews: 45200,
    budget: {
      allocated: 2500,
      spent: 1875,
      remaining: 625
    },
    timeline: [
      { milestone: "Recording Complete", date: "2024-06-15", completed: true },
      { milestone: "Mixing & Mastering", date: "2024-07-01", completed: true },
      { milestone: "Artwork & Design", date: "2024-07-15", completed: true },
      { milestone: "Metadata Submission", date: "2024-07-25", completed: false },
      { milestone: "DSP Distribution", date: "2024-08-01", completed: false },
      { milestone: "Marketing Campaign Launch", date: "2024-08-05", completed: false },
      { milestone: "Release Day", date: "2024-08-15", completed: false }
    ],
    checklist: [
      { task: "Master all tracks", completed: true, category: "Production" },
      { task: "Create album artwork (3000x3000)", completed: true, category: "Design" },
      { task: "Write track descriptions", completed: true, category: "Marketing" },
      { task: "Submit to DistroKid", completed: false, category: "Distribution" },
      { task: "Set up presave campaign", completed: true, category: "Marketing" },
      { task: "Create social media assets", completed: false, category: "Marketing" },
      { task: "Pitch to Spotify playlists", completed: false, category: "Promotion" },
      { task: "Schedule press release", completed: false, category: "PR" }
    ],
    socialMedia: [
      { platform: "TikTok", views: 23400, posts: 8 },
      { platform: "Instagram", views: 15200, posts: 12 },
      { platform: "YouTube", views: 6600, posts: 3 }
    ]
  };

  const getTimelineStatus = (date: string, completed: boolean) => {
    const milestoneDate = new Date(date);
    const today = new Date();
    
    if (completed) return "completed";
    if (milestoneDate < today) return "overdue";
    return "upcoming";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "overdue": return "destructive";
      case "upcoming": return "secondary";
      default: return "outline";
    }
  };

  if (showMetadata) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowMetadata(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Release Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Metadata Management</h1>
            <p className="text-muted-foreground">{release.title}</p>
          </div>
        </div>
        <MetadataPrep />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calendar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{release.title}</h1>
          <p className="text-muted-foreground">Release Management Dashboard</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-primary" />
              <Badge variant="secondary">{release.progress}%</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">{release.presaves}</div>
              <p className="text-sm text-muted-foreground">Presaves ({release.presaveGoal} goal)</p>
              <Progress value={(release.presaves / release.presaveGoal) * 100} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Eye className="h-5 w-5 text-primary" />
              <Badge variant="secondary">+12%</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">{release.totalContentViews.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Content Views</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <DollarSign className="h-5 w-5 text-primary" />
              <Badge variant="secondary">${release.budget.remaining}</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">${release.budget.spent}</div>
              <p className="text-sm text-muted-foreground">Spent of ${release.budget.allocated}</p>
              <Progress value={(release.budget.spent / release.budget.allocated) * 100} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Calendar className="h-5 w-5 text-primary" />
              <Badge variant="secondary">{release.tracks} tracks</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">
                {Math.ceil((new Date(release.releaseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <p className="text-sm text-muted-foreground">Days to Release</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Timeline */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>Key milestones and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {release.timeline.map((milestone, index) => {
              const status = getTimelineStatus(milestone.date, milestone.completed);
              return (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20">
                  {milestone.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${milestone.completed ? 'text-muted-foreground line-through' : ''}`}>
                      {milestone.milestone}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(milestone.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(status)} className="text-xs">
                    {status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Project Checklist</CardTitle>
            <CardDescription>Tasks organized by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(
              release.checklist.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {} as Record<string, typeof release.checklist>)
            ).map(([category, tasks]) => (
              <div key={category}>
                <h4 className="font-medium text-sm mb-2">{category}</h4>
                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-secondary/20">
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* DSP Pitch Tool and Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>DSP Pitch Tool</CardTitle>
            <CardDescription>Submit your track to DSP playlists and curators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              Start Playlist Pitch
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Pitch to Spotify, Apple Music, and other DSP playlists
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Manage track metadata and generate label copy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowMetadata(true)}
            >
              Edit Metadata
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
            >
              Split Sheet
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Update track information, lyrics, and manage writer splits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Performance */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Campaign Social Media Performance</CardTitle>
          <CardDescription>Content views across platforms for this release</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {release.socialMedia.map((platform, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-secondary/20">
                <div className="text-2xl font-bold text-primary">{platform.views.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">{platform.platform} Views</p>
                <p className="text-xs text-muted-foreground mt-1">{platform.posts} posts published</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};