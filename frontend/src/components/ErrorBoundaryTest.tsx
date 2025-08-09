/**
 * ErrorBoundaryTest - Temporary component to test Error Boundary functionality
 * This component intentionally throws a render error to verify the ErrorBoundary works
 * TEMPORARY: Remove after verification is complete
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

const CrashingComponent = () => {
  // This component intentionally throws an error during render
  throw new Error('This is a test render error for Error Boundary verification')
}

export const ErrorBoundaryTest = () => {
  const [shouldCrash, setShouldCrash] = useState(false)

  if (shouldCrash) {
    return <CrashingComponent />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Error Boundary Test</h1>
          <p className="text-muted-foreground">
            Test Phase 2.1 Core Error Infrastructure - React Error Boundary
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Render Error Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This test will intentionally trigger a React rendering error to verify 
              that the global Error Boundary catches it and displays the fallback UI 
              instead of showing a blank white screen.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Warning</p>
                  <p className="text-sm text-yellow-700">
                    Clicking this button will crash this component and trigger the Error Boundary. 
                    You should see a user-friendly error page with reload options.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setShouldCrash(true)}
              variant="destructive"
              className="w-full"
            >
              Trigger Render Error (Test Error Boundary)
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Expected Behavior:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Component crashes with render error</li>
                <li>Error Boundary catches the error</li>
                <li>ErrorFallback component displays instead of white screen</li>
                <li>User sees "Something went wrong" message</li>
                <li>"Try Again" and "Reload Page" buttons are functional</li>
                <li>In development mode: technical error details are shown</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
