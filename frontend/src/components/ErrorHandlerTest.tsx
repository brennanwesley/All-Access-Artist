/**
 * ErrorHandlerTest - Component to test global error handler functionality
 * Used to verify Phase 2.1 Core Error Infrastructure requirements
 */

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

// Mock API functions that simulate different error scenarios
const mockApi401 = async (): Promise<never> => {
  // Simulate a 401 Unauthorized response
  const error = new Error('Unauthorized') as Error & { status: number }
  error.status = 401
  throw error
}

const mockApi500 = async (): Promise<never> => {
  // Simulate a 500 Internal Server Error response
  const error = new Error('Internal Server Error') as Error & { status: number }
  error.status = 500
  throw error
}

const mockApiSuccess = async (): Promise<{ message: string }> => {
  return { message: 'API call successful!' }
}

export const ErrorHandlerTest = () => {
  const [testResults, setTestResults] = useState<{
    test401: 'pending' | 'triggered' | 'completed'
    test500: 'pending' | 'triggered' | 'completed'
  }>({
    test401: 'pending',
    test500: 'pending'
  })

  // Query for 401 test
  const {
    refetch: trigger401,
    isError: is401Error,
    error: error401,
    isLoading: is401Loading
  } = useQuery({
    queryKey: ['test-401'],
    queryFn: mockApi401,
    enabled: false, // Don't run automatically
    retry: false, // Disable retry for testing
  })

  // Query for 500 test
  const {
    refetch: trigger500,
    isError: is500Error,
    error: error500,
    isLoading: is500Loading
  } = useQuery({
    queryKey: ['test-500'],
    queryFn: mockApi500,
    enabled: false, // Don't run automatically
    retry: false, // Disable retry for testing
  })

  // Mutation for success test
  const successMutation = useMutation({
    mutationFn: mockApiSuccess,
  })

  const handle401Test = async () => {
    setTestResults(prev => ({ ...prev, test401: 'triggered' }))
    await trigger401()
    // Note: If working correctly, user should be redirected before this executes
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, test401: 'completed' }))
    }, 1000)
  }

  const handle500Test = async () => {
    setTestResults(prev => ({ ...prev, test500: 'triggered' }))
    await trigger500()
    // Should show toast and stay on page
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, test500: 'completed' }))
    }, 1000)
  }

  const handleSuccessTest = () => {
    successMutation.mutate()
  }

  const getStatusBadge = (status: 'pending' | 'triggered' | 'completed', isError: boolean) => {
    if (status === 'pending') {
      return <Badge variant="outline">Ready</Badge>
    }
    if (status === 'triggered') {
      return <Badge variant="secondary">Testing...</Badge>
    }
    if (status === 'completed' && isError) {
      return <Badge variant="destructive">Error Handled</Badge>
    }
    return <Badge variant="default">Completed</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Global Error Handler Test</h1>
          <p className="text-muted-foreground">
            Test Phase 2.1 Core Error Infrastructure - Centralized API Error Handling
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 401 Unauthorized Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                401 Unauthorized Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This test should trigger the global error handler, sign out the user, 
                and redirect to the /auth page.
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(testResults.test401, is401Error)}
              </div>

              <Button 
                onClick={handle401Test}
                disabled={is401Loading || testResults.test401 === 'triggered'}
                variant="destructive"
                className="w-full"
              >
                {is401Loading ? 'Testing...' : 'Trigger 401 Error'}
              </Button>

              {is401Error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  Error caught: {error401?.message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 500 Internal Server Error Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-orange-500" />
                500 Server Error Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This test should trigger the global error handler and show a 
                user-friendly toast notification.
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(testResults.test500, is500Error)}
              </div>

              <Button 
                onClick={handle500Test}
                disabled={is500Loading || testResults.test500 === 'triggered'}
                variant="secondary"
                className="w-full"
              >
                {is500Loading ? 'Testing...' : 'Trigger 500 Error'}
              </Button>

              {is500Error && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  Error caught: {error500?.message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Success Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Success Test (Control)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This test verifies that successful API calls work normally without 
              triggering the error handler.
            </p>
            
            <Button 
              onClick={handleSuccessTest}
              disabled={successMutation.isPending}
              variant="default"
              className="w-full"
            >
              {successMutation.isPending ? 'Testing...' : 'Test Successful API Call'}
            </Button>

            {successMutation.isSuccess && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                Success: {successMutation.data?.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="space-y-1">
              <p><strong>401 Test Expected Behavior:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Global error handler should be triggered</li>
                <li>User should be automatically signed out from Supabase</li>
                <li>Browser should redirect to /auth page</li>
                <li>No toast notification should appear (redirect happens first)</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p><strong>500 Test Expected Behavior:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Global error handler should be triggered</li>
                <li>User-friendly toast notification should appear</li>
                <li>User should remain on current page</li>
                <li>No sign out or redirect should occur</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
