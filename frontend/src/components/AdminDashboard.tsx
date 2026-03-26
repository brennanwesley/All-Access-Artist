/**
 * AdminDashboard - Container component for admin-only system monitoring
 * Responsibility: Orchestrate admin data and delegate to presentational components
 */
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiStatus } from "@/components/ApiStatus"
import { UserCountTable } from "@/components/ui/UserCountTable"
import { DashboardSkeleton } from "@/components/skeletons"
import { useAdminUsers, useAdminStats } from "@/hooks/api/useAdmin"
import { useSupportOverview, useUpdateSupportTicketStatus } from "@/hooks/api/useSupportTickets"
import { toast } from "@/components/ui/sonner"
import { getCurrentDateTime } from "@/utils/dateTime"
import { 
  Shield, 
  Users, 
  Music, 
  AlertTriangle,
  RefreshCw,
  Database,
  Activity,
  LifeBuoy,
  Clock3,
  CheckCircle2,
  Hourglass,
  CircleAlert
} from "lucide-react"
import type { SupportTicketStatus, SupportTicketAdminItem } from "@/types/api"

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

  const {
    data: supportOverview,
    isLoading: supportLoading,
    error: supportError,
    refetch: refetchSupportOverview,
  } = useSupportOverview()

  const updateSupportTicketStatus = useUpdateSupportTicketStatus()

  const dateTime = getCurrentDateTime()

  const supportSummary = useMemo(() => {
    return supportOverview?.summary ?? {
      total_tickets: 0,
      open_tickets: 0,
      in_progress_tickets: 0,
      resolved_tickets: 0,
    }
  }, [supportOverview])

  const handleSupportTicketStatusUpdate = async (ticketId: string, status: SupportTicketStatus) => {
    try {
      await updateSupportTicketStatus.mutateAsync({
        ticketId,
        ticketData: { status },
      })
      toast.success('Support ticket updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update support ticket right now.')
    }
  }

  const getSupportStatusLabel = (status: SupportTicketStatus): string => {
    switch (status) {
      case 'open':
        return 'Open'
      case 'in_progress':
        return 'In progress'
      case 'waiting_on_user':
        return 'Waiting on user'
      case 'resolved':
        return 'Resolved'
      case 'closed':
        return 'Closed'
      default:
        return status
    }
  }

  const getSupportSubmitterName = (ticket: SupportTicketAdminItem): string => {
    const profile = Array.isArray(ticket.user_profiles) ? ticket.user_profiles[0] : ticket.user_profiles
    if (!profile) {
      return ticket.user_id
    }

    const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    return displayName || profile.artist_name || ticket.user_id
  }

  const formatSupportDate = (dateValue: string | null): string => {
    if (!dateValue) {
      return 'Just now'
    }

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateValue))
  }

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
              refetchSupportOverview()
            }}
            disabled={usersLoading || statsLoading || supportLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(usersLoading || statsLoading || supportLoading) ? 'animate-spin' : ''}`} />
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

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" />
            Support Ticket Tracking
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor new requests, update status, and keep the support queue moving.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {supportLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Total</div>
                <div className="mt-2 text-2xl font-bold">{supportSummary.total_tickets}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Open</div>
                <div className="mt-2 text-2xl font-bold">{supportSummary.open_tickets}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">In progress</div>
                <div className="mt-2 text-2xl font-bold">{supportSummary.in_progress_tickets}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Resolved</div>
                <div className="mt-2 text-2xl font-bold">{supportSummary.resolved_tickets}</div>
              </div>
            </div>
          )}

          {supportError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load support tickets: {supportError.message}
              </AlertDescription>
            </Alert>
          )}

          {supportOverview && supportOverview.recent_tickets.length > 0 ? (
            <div className="space-y-4">
              {supportOverview.recent_tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border p-4 space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold">{ticket.subject}</h4>
                        <Badge variant="outline">{ticket.category.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted by {getSupportSubmitterName(ticket)} • {formatSupportDate(ticket.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{getSupportStatusLabel(ticket.status)}</Badge>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">{ticket.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSupportTicketStatusUpdate(ticket.id, 'in_progress')}
                      disabled={ticket.status === 'in_progress' || updateSupportTicketStatus.isPending}
                    >
                      <Hourglass className="h-4 w-4" />
                      In progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSupportTicketStatusUpdate(ticket.id, 'resolved')}
                      disabled={ticket.status === 'resolved' || updateSupportTicketStatus.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSupportTicketStatusUpdate(ticket.id, 'closed')}
                      disabled={ticket.status === 'closed' || updateSupportTicketStatus.isPending}
                    >
                      <CircleAlert className="h-4 w-4" />
                      Close
                    </Button>
                    <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      Last response {formatSupportDate(ticket.last_response_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !supportLoading ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              <LifeBuoy className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              No support tickets are waiting right now.
            </div>
          ) : null}
        </CardContent>
      </Card>

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
