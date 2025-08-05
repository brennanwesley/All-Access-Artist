/**
 * Dashboard - Container component following SRP
 * Responsibility: Orchestrate dashboard data and delegate to presentational components
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApiStatus } from "@/components/ApiStatus"
import { TaskList } from "@/components/ui/TaskList"
import { DashboardHeader } from "@/components/ui/DashboardHeader"
import { useTasks } from "@/hooks/useTasks"
import { getCurrentDateTime } from "@/utils/dateTime"
import { getQuoteOfTheDay } from "@/utils/quotes"
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Play, 
  Music,
  Video,
  Target
} from "lucide-react"

export const Dashboard = () => {
  // Use extracted hooks for business logic (SRP: separate data concerns)
  const { tasks, toggleTask, getTaskStats } = useTasks()
  const dateTime = getCurrentDateTime()
  const quote = getQuoteOfTheDay()
  const taskStats = getTaskStats()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section - Delegated to presentational component */}
        <DashboardHeader 
          dateTime={dateTime}
          quote={quote}
          userName="Artist"
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-1">
            <TaskList
              tasks={tasks}
              completionRate={taskStats.completionRate}
              onToggleTask={toggleTask}
            />
          </div>

          {/* Middle Column - Stats Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,543</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Followers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,350</div>
                  <p className="text-xs text-muted-foreground">
                    +180 this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Music className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New track uploaded</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Video className="h-5 w-5 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Music video published</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Campaign goal reached</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - API Status & Upcoming */}
          <div className="lg:col-span-1 space-y-6">
            {/* API Status */}
            <ApiStatus />

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Studio Session</p>
                    <p className="text-xs text-gray-600">Tomorrow, 2:00 PM</p>
                  </div>
                  <Badge variant="outline">Recording</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Live Performance</p>
                    <p className="text-xs text-gray-600">Friday, 8:00 PM</p>
                  </div>
                  <Badge variant="outline">Live</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Album Release</p>
                    <p className="text-xs text-gray-600">Next Monday</p>
                  </div>
                  <Badge variant="outline">Release</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

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

const getQuoteOfTheDay = () => {
  const quotes = [
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "It is better to fail in originality than to succeed in imitation. - Herman Melville",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Creativity takes courage. - Henri Matisse",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "You can't use up creativity. The more you use, the more you have. - Maya Angelou",
    "The secret to creativity is knowing how to hide your sources. - Einstein",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "Success is going from failure to failure without losing your enthusiasm. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs"
  ];
  
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return quotes[dayOfYear % quotes.length];
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
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{date}</h2>
            <p className="text-lg opacity-90 mb-3">{time}</p>
            <p className="text-sm italic opacity-80 border-l-2 border-white/30 pl-3">
              {getQuoteOfTheDay()}
            </p>
          </div>
          <Clock className="h-12 w-12 opacity-75" />
        </div>
      </CardContent>
    </Card>

    {/* Daily Leaderboard */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Daily Leaderboard
        </CardTitle>
        <CardDescription>
          Top 5 artists today by social engagement and streams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { rank: 1, name: "Maya Chen", streams: "15.2K", engagement: "8.9K", change: "+23%" },
          { rank: 2, name: "Alex Rivera", streams: "12.8K", engagement: "7.2K", change: "+18%" },
          { rank: 3, name: "Jordan Kim", streams: "11.4K", engagement: "6.8K", change: "+15%" },
          { rank: 4, name: "Sam Taylor", streams: "9.7K", engagement: "5.9K", change: "+12%" },
          { rank: 5, name: "Casey Morgan", streams: "8.3K", engagement: "5.1K", change: "+8%" }
        ].map((artist) => (
          <div key={artist.rank} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border/50">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
              artist.rank === 1 ? 'bg-yellow-500 text-black' :
              artist.rank === 2 ? 'bg-gray-400 text-white' :
              artist.rank === 3 ? 'bg-amber-600 text-white' :
              'bg-primary text-primary-foreground'
            }`}>
              #{artist.rank}
            </div>
            <div className="flex-1">
              <div className="font-medium">{artist.name}</div>
              <div className="text-sm text-muted-foreground">
                {artist.streams} streams • {artist.engagement} engagement
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {artist.change}
            </Badge>
          </div>
        ))}
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

      {/* API Status */}
      <ApiStatus />

    </div>
  );
};