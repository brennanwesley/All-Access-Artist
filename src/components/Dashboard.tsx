import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Play, 
  Clock,
  Music,
  Video,
  Target,
  Plus,
  CheckCircle2,
  Circle
} from "lucide-react";

export const Dashboard = () => {
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, task: "Post TikTok video from content calendar", completed: false, priority: "high" },
    { id: 2, task: "Check streaming numbers on Spotify for Artists", completed: false, priority: "medium" },
    { id: 3, task: "Respond to fan comments on Instagram", completed: true, priority: "medium" },
    { id: 4, task: "Upload behind-the-scenes content", completed: false, priority: "low" },
    { id: 5, task: "Review and approve press release draft", completed: false, priority: "high" }
  ]);

  const getCurrentDateTime = () => {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    
    return {
      date: now.toLocaleDateString('en-US', dateOptions),
      time: now.toLocaleTimeString('en-US', timeOptions)
    };
  };

  const toggleTask = (taskId: number) => {
    setDailyTasks(tasks => 
      tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const { date, time } = getCurrentDateTime();
  const upcomingReleases = [
    { title: "Summer Vibes EP", date: "Aug 15", status: "In Progress", progress: 75 },
    { title: "Midnight Dreams", date: "Sep 2", status: "Planning", progress: 25 },
  ];

  const recentContent = [
    { platform: "TikTok", title: "Behind the scenes", scheduled: "Today 3:00 PM", status: "Scheduled" },
    { platform: "Instagram", title: "New single teaser", scheduled: "Tomorrow 10:00 AM", status: "Draft" },
    { platform: "YouTube", title: "Studio session", scheduled: "Aug 10 2:00 PM", status: "Posted" },
  ];

  const stats = [
    { label: "Monthly Streams", value: "45.2K", change: "+12%", icon: Play },
    { label: "Social Followers", value: "8.9K", change: "+5%", icon: Users },
    { label: "Playlist Adds", value: "127", change: "+23%", icon: Music },
    { label: "Revenue", value: "$1,234", change: "+8%", icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      {/* Date/Time Banner */}
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{date}</h2>
              <p className="text-lg opacity-90">{time}</p>
            </div>
            <Clock className="h-12 w-12 opacity-75" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Today's Tasks
          </CardTitle>
          <CardDescription>
            Stay on track with your daily music career goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dailyTasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                task.completed ? 'bg-secondary/50 opacity-75' : 'hover:bg-secondary/30'
              }`}
            >
              <button onClick={() => toggleTask(task.id)}>
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                )}
              </button>
              <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.task}
              </span>
              <Badge 
                variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'}
                className="text-xs"
              >
                {task.priority}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
        <p className="text-xl opacity-90 mb-6">Ready to take your music career to the next level?</p>
        <div className="flex gap-4">
          <Button size="lg" variant="secondary">
            <Music className="mr-2 h-5 w-5" />
            New Release
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
            <Video className="mr-2 h-5 w-5" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Releases */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Releases
            </CardTitle>
            <CardDescription>
              Track your release timeline and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingReleases.map((release, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{release.title}</h4>
                    <p className="text-sm text-muted-foreground">Release: {release.date}</p>
                  </div>
                  <Badge variant={release.status === "In Progress" ? "default" : "secondary"}>
                    {release.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{release.progress}%</span>
                  </div>
                  <Progress value={release.progress} className="h-2" />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add New Release
            </Button>
          </CardContent>
        </Card>

        {/* Content Calendar */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Content Pipeline
            </CardTitle>
            <CardDescription>
              Your scheduled and draft content across platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <h4 className="font-medium text-sm">{content.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {content.platform} • {content.scheduled}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={content.status === "Posted" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {content.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Target className="mr-2 h-4 w-4" />
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump into your most used tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Clock className="h-6 w-6" />
              <span className="text-xs">Schedule Post</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Music className="h-6 w-6" />
              <span className="text-xs">Upload Track</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Target className="h-6 w-6" />
              <span className="text-xs">Pitch to DSP</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-xs">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};