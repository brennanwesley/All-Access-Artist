/**
 * UserCountTable - Presentational component for displaying admin user data
 * Responsibility: Display user list with account types in a clean table format
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Users, Shield, Music, Building, UserCog } from "lucide-react"
import { AdminUser } from "@/hooks/api/useAdmin"

interface UserCountTableProps {
  users: AdminUser[]
  isLoading: boolean
  error: Error | null
  onRefresh: () => void
}

const getAccountTypeIcon = (accountType: string) => {
  switch (accountType) {
    case 'admin':
      return <Shield className="h-4 w-4" />
    case 'artist':
      return <Music className="h-4 w-4" />
    case 'manager':
      return <UserCog className="h-4 w-4" />
    case 'label':
      return <Building className="h-4 w-4" />
    default:
      return <Users className="h-4 w-4" />
  }
}

const getAccountTypeBadgeVariant = (accountType: string) => {
  switch (accountType) {
    case 'admin':
      return 'destructive'
    case 'artist':
      return 'default'
    case 'manager':
      return 'secondary'
    case 'label':
      return 'outline'
    default:
      return 'outline'
  }
}

export const UserCountTable = ({ users, isLoading, error, onRefresh }: UserCountTableProps) => {
  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-2">Failed to load user data</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
          <Badge variant="outline" className="ml-2">
            {users.length} total
          </Badge>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                    {getAccountTypeIcon(user.account_type)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : 'Name not set'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getAccountTypeBadgeVariant(user.account_type)}
                    className="capitalize"
                  >
                    {user.account_type}
                  </Badge>
                  {user.phone_verified && (
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
