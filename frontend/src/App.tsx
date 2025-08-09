// All Access Artist v2.0.0 - Frontend with Authentication Integration
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { handleApiError } from "./lib/errorHandler";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ToastTest } from "./components/ToastTest";
import { ErrorHandlerTest } from "./components/ErrorHandlerTest";
import { ErrorBoundaryTest } from "./components/ErrorBoundaryTest";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/auth/ErrorFallback";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401 errors (will be handled by global error handler)
        if (error instanceof Response && error.status === 401) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Set up global error handler using QueryCache for TanStack Query v5
queryClient.getQueryCache().config = {
  onError: handleApiError,
};

queryClient.getMutationCache().config = {
  onError: handleApiError,
};

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            {/* TEMPORARY: Toast Test Route - Remove after verification */}
            <Route path="/toast-test" element={
              <ProtectedRoute>
                <ToastTest />
              </ProtectedRoute>
            } />
            {/* TEMPORARY: Error Handler Test Route - Remove after verification */}
            <Route path="/error-test" element={
              <ProtectedRoute>
                <ErrorHandlerTest />
              </ProtectedRoute>
            } />
            {/* TEMPORARY: Error Boundary Test Route - Remove after verification */}
            <Route path="/boundary-test" element={
              <ProtectedRoute>
                <ErrorBoundaryTest />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
