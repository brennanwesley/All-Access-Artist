/**
 * Dashboard - Container component following SRP
 * Responsibility: Orchestrate dashboard data and delegate to presentational components
 */
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardHeader } from "@/components/ui/DashboardHeader"
import { DashboardSkeleton } from "@/components/skeletons"
import { getCurrentDateTime } from "@/utils/dateTime"
import { getQuoteOfTheDay } from "@/utils/quotes"
import { useQuery } from "@tanstack/react-query"
import { 
  Music,
  AlertTriangle,
  RefreshCw
} from "lucide-react"

export const Dashboard = () => {
  const dateTime = getCurrentDateTime()
  const quote = getQuoteOfTheDay()

  // Mock dashboard data query - optimized for fast loading
  const mockDashboardData = async () => {
    // Removed artificial delay for better UX
    // await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Reduced error simulation to 5% for better UX
    if (Math.random() < 0.05) {
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

  // Dashboard data query with optimized caching
  const {
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: mockDashboardData,
    retry: 1, // Reduced retries
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  })


  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Show error state with retry option
  if (isError) {
    return (
      <div className="space-y-8">
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
    )
  }

  return (
    <div className="space-y-8">
        {/* Header Section - Delegated to presentational component */}
        <DashboardHeader 
          dateTime={dateTime}
          quote={quote}
          userName="Artist"
        />

        {/* Simplified Dashboard Content */}
        <div className="flex justify-center items-center min-h-[400px]">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-12 text-center">
              <div className="space-y-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Music className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Artist Dashboard
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Welcome to your creative workspace. More features and insights coming soon to help you manage your music career.
                  </p>
                </div>
                <div className="pt-4">
                  <Badge variant="secondary" className="px-4 py-2">
                    Dashboard features in development
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
