import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useHealthCheck, useArtists } from '../hooks/api'

export const ApiStatus: React.FC = () => {
  const [manualRefresh, setManualRefresh] = useState(false)
  
  const { user } = useAuth()
  
  // Use TanStack Query hooks for server state management
  const healthQuery = useHealthCheck()
  const artistsQuery = useArtists()
  
  // Derive status from query states
  const healthStatus = healthQuery.isLoading ? 'loading' : 
                     healthQuery.isError ? 'error' : 'success'
  
  const authStatus = !user ? 'loading' :
                    artistsQuery.isLoading ? 'loading' :
                    artistsQuery.isError ? 'error' : 'success'
  
  const authError = artistsQuery.error?.message || null
  const healthData = healthQuery.data
  
  const runAllTests = async () => {
    setManualRefresh(true)
    await Promise.all([
      healthQuery.refetch(),
      user ? artistsQuery.refetch() : Promise.resolve()
    ])
    setManualRefresh(false)
  }

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Testing...</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Backend API Status</CardTitle>
            <CardDescription>
              Connection status to the Hono backend with JWT authentication
            </CardDescription>
          </div>
          <Button 
            onClick={runAllTests} 
            disabled={manualRefresh || healthQuery.isLoading || artistsQuery.isLoading}
            size="sm"
            variant="outline"
          >
            {(manualRefresh || healthQuery.isLoading || artistsQuery.isLoading) ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Check */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(healthStatus)}
            <div>
              <p className="font-medium">Health Check</p>
              <p className="text-sm text-muted-foreground">
                Backend server availability
              </p>
            </div>
          </div>
          {getStatusBadge(healthStatus)}
        </div>

        {healthData && (
          <Alert>
            <AlertDescription>
              <strong>Backend Response:</strong> {JSON.stringify(healthData, null, 2)}
            </AlertDescription>
          </Alert>
        )}

        {/* Authentication Test */}
        {user && (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(authStatus)}
              <div>
                <p className="font-medium">JWT Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Authenticated API endpoint access
                </p>
              </div>
            </div>
            {getStatusBadge(authStatus)}
          </div>
        )}

        {authError && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Authentication Error:</strong> {authError}
            </AlertDescription>
          </Alert>
        )}

        {!user && (
          <Alert>
            <AlertDescription>
              User authentication required to test protected endpoints.
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Backend URL:</strong> https://allaccessartist-dev.brennanwesley.workers.dev</p>
          <p><strong>User:</strong> {user?.email || 'Not authenticated'}</p>
          <p><strong>Framework:</strong> Hono with JWT + Zod validation</p>
        </div>
      </CardContent>
    </Card>
  )
}
