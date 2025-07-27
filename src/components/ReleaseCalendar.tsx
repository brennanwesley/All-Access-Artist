import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Plus, Clock, Music, CheckCircle, AlertCircle } from "lucide-react";

export const ReleaseCalendar = () => {
  const releases = [
    {
      id: 1,
      title: "Summer Vibes EP",
      releaseDate: "2024-08-15",
      status: "In Progress",
      progress: 75,
      tracks: 4,
      distributors: ["Spotify", "Apple Music", "YouTube Music"],
      tasks: [
        { task: "Master Tracks", completed: true },
        { task: "Album Artwork", completed: true },
        { task: "Metadata Entry", completed: false },
        { task: "Submit to DSPs", completed: false },
      ]
    },
    {
      id: 2,
      title: "Midnight Dreams",
      releaseDate: "2024-09-02",
      status: "Planning",
      progress: 25,
      tracks: 1,
      distributors: ["TBD"],
      tasks: [
        { task: "Recording", completed: false },
        { task: "Mixing", completed: false },
        { task: "Mastering", completed: false },
        { task: "Artwork Design", completed: false },
      ]
    },
    {
      id: 3,
      title: "Acoustic Sessions Vol. 1",
      releaseDate: "2024-09-20",
      status: "Idea",
      progress: 10,
      tracks: 6,
      distributors: ["TBD"],
      tasks: [
        { task: "Song Selection", completed: false },
        { task: "Studio Booking", completed: false },
        { task: "Recording", completed: false },
        { task: "Post-Production", completed: false },
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "default";
      case "Planning": return "secondary";
      case "Idea": return "outline";
      default: return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Release Calendar</h2>
          <p className="text-muted-foreground mt-2">
            Plan, track, and manage your music releases
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          New Release
        </Button>
      </div>

      {/* Timeline View */}
      <div className="grid gap-6">
        {releases.map((release) => (
          <Card key={release.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <Music className="h-5 w-5 text-primary" />
                    {release.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" />
                    Release Date: {formatDate(release.releaseDate)}
                    <span className="text-muted-foreground">•</span>
                    {release.tracks} {release.tracks === 1 ? 'track' : 'tracks'}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(release.status)}>
                  {release.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Progress Section */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Overall Progress</span>
                      <span>{release.progress}%</span>
                    </div>
                    <Progress value={release.progress} className="h-3" />
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Distributors</h4>
                    <div className="flex flex-wrap gap-1">
                      {release.distributors.map((distributor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {distributor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tasks Section */}
                <div className="md:col-span-2">
                  <h4 className="font-medium mb-3 text-sm">Tasks & Milestones</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {release.tasks.map((task, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-secondary/20">
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.ceil((new Date(release.releaseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit Details
                  </Button>
                  <Button variant="default" size="sm">
                    Manage Tasks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-sm text-muted-foreground">Active Releases</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">11</div>
            <p className="text-sm text-muted-foreground">Total Tracks</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">37%</div>
            <p className="text-sm text-muted-foreground">Avg. Completion</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};