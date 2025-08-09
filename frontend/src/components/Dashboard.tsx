/**
 * Dashboard - Container component following SRP
 * Responsibility: Orchestrate dashboard data and delegate to presentational components
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiStatus } from "@/components/ApiStatus"
import { TaskList } from "@/components/ui/TaskList"
import { DashboardHeader } from "@/components/ui/DashboardHeader"
import { DashboardSkeleton } from "@/components/skeletons"
import { useTasks } from "@/hooks/useTasks"
import { getCurrentDateTime } from "@/utils/dateTime"
import { getQuoteOfTheDay } from "@/utils/quotes"
import { useQuery } from "@tanstack/react-query"
import { 
  Calendar, 
  Users, 
  Play, 
  Music,
  Video,
  Target,
  AlertTriangle,
  RefreshCw
} from "lucide-react"

export const Dashboard = () => {
  // Use extracted hooks for business logic (SRP: separate data concerns)
  const { tasks, toggleTask, getTaskStats } = useTasks()
  const dateTime = getCurrentDateTime()
  const quote = getQuoteOfTheDay()
  const taskStats = getTaskStats()

  // Mock dashboard data query to demonstrate loading and error states
  const mockDashboardData = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate random error for demonstration (20% chance)
    if (Math.random() < 0.2) {
      throw new Error('Failed to load dashboard data')
    }
    
    return {
      totalStreams: 12543,
      followers: 2350,
      recentActivity: [
        { type: 'upload', title: 'New track uploaded', time: '2 hours ago' },
        { type: 'video', title: 'Music video published', time: '1 day ago' },
        { type: 'goal', title: 'Campaign goal reached', time: '3 days ago' }
      ]
    }
  }

  // Dashboard data query with loading and error states
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: mockDashboardData,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Test functions for global error handler
  const mockApi401 = async (): Promise<never> => {
    const error = new Error('Unauthorized') as Error & { status: number }
    error.status = 401
    throw error
  }

  const mockApi500 = async (): Promise<never> => {
    const error = new Error('Internal Server Error') as Error & { status: number }
    error.status = 500
    throw error
  }

  const { refetch: trigger401 } = useQuery({
    queryKey: ['test-401'],
    queryFn: mockApi401,
    enabled: false,
    retry: false,
  })

  const { refetch: trigger500 } = useQuery({
    queryKey: ['test-500'], 
    queryFn: mockApi500,
    enabled: false,
    retry: false,
  })

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Show error state with retry option
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Failed to load dashboard data: {error?.message || 'Unknown error'}
              </span>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

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
                  <div className="text-2xl font-bold">{dashboardData?.totalStreams.toLocaleString() || '12,543'}</div>
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
                  <div className="text-2xl font-bold">{dashboardData?.followers.toLocaleString() || '2,350'}</div>
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

            {/* TEMPORARY: Error Handler Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🧪 Error Handler Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button 
                    onClick={() => trigger500()}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    Test 500 Error (Toast)
                  </Button>
                  <Button 
                    onClick={() => trigger401()}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Test 401 Error (Redirect)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  500: Shows toast | 401: Redirects to /auth
                </p>
              </CardContent>
            </Card>

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
