/**
 * AdminDashboard - Container component for admin-only system monitoring
 * Responsibility: Orchestrate admin data and delegate to presentational components
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiStatus } from "@/components/ApiStatus"
import { UserCountTable } from "@/components/ui/UserCountTable"
import { DashboardSkeleton } from "@/components/skeletons"
import { useAdminUsers, useAdminStats } from "@/hooks/api/useAdmin"
import { getCurrentDateTime } from "@/utils/dateTime"
import { 
  Shield, 
  Users, 
  Music, 
  AlertTriangle,
  RefreshCw,
  Database,
  Activity
} from "lucide-react"

export const AdminDashboard = () => {
  // Admin-specific data hooks
  const { 
    data: users = [], 
    isLoading: usersLoading, 
    error: usersError, 
    refetch: refetchUsers 
  } = useAdminUsers()
  
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = useAdminStats()

  const dateTime = getCurrentDateTime()

  // Error handler test functions (reused from existing Dashboard)
  const testErrorHandler = () => {
    throw new Error('Test error triggered by admin')
  }

  const testAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    throw new Error('Test async error triggered by admin')
  }

  if (usersLoading && statsLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-destructive" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            System monitoring and user management • {dateTime.date} at {dateTime.time}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              refetchUsers()
              refetchStats()
            }}
            disabled={usersLoading || statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(usersLoading || statsLoading) ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* System Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              ) : (
                stats?.total_users || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Active user accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artists</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              ) : (
                stats?.artist_users || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Artist accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Releases</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              ) : (
                stats?.total_releases || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total releases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              ) : (
                stats?.total_tasks || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Active tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display for Stats */}
      {statsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load system statistics: {statsError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* User Management Table */}
      <UserCountTable 
        users={users}
        isLoading={usersLoading}
        error={usersError}
        onRefresh={refetchUsers}
      />

      {/* API Status and Error Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApiStatus />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Handler Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Test error boundaries and error handling for debugging purposes.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={testErrorHandler}
              >
                Test Sync Error
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={testAsyncError}
              >
                Test Async Error
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Type Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Account Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <div className="text-2xl font-bold">{stats.admin_users}</div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Music className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.artist_users}</div>
                <div className="text-sm text-muted-foreground">Artists</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-secondary-foreground" />
                <div className="text-2xl font-bold">{stats.manager_users}</div>
                <div className="text-sm text-muted-foreground">Managers</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{stats.label_users}</div>
                <div className="text-sm text-muted-foreground">Labels</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
