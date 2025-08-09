/**
 * ErrorFallback - Global Error Boundary Fallback Component
 * Implements Rule #8: Comprehensive Resilience and Error Handling
 * 
 * This component provides a user-friendly fallback UI when React rendering errors occur,
 * preventing the "white screen of death" and maintaining application usability.
 */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorFallbackProps {
  error?: Error
  resetErrorBoundary?: () => void
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  const handleReload = () => {
    // Reload the entire page to reset application state
    window.location.reload()
  }

  const handleReset = () => {
    // Try to reset the error boundary first, fallback to page reload
    if (resetErrorBoundary) {
      resetErrorBoundary()
    } else {
      handleReload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-800">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-red-700">
              We're sorry, but something unexpected happened. Please try reloading the page.
            </p>
            
            {/* Development mode: Show error details */}
            {process.env['NODE_ENV'] === 'development' && error && (
              <details className="text-left">
                <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                  Show technical details (development only)
                </summary>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded border overflow-auto max-h-32">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              <Button 
                onClick={handleReset}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={handleReload}
                className="w-full"
                variant="outline"
              >
                Reload Page
              </Button>
            </div>

            <p className="text-xs text-red-600">
              If this problem persists, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
