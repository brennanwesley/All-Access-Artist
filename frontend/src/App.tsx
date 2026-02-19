import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/sonner'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RuntimeCrashRoute } from './components/dev/RuntimeCrashRoute'
import './App.css'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const PlanSelection = lazy(() => import('./pages/PlanSelection'))
const OnboardingComplete = lazy(() => import('./pages/OnboardingComplete'))
const Index = lazy(() => import('./pages/Index'))
const ReleaseDetail = lazy(() => import('./pages/ReleaseDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-8 text-sm text-muted-foreground">
      Loading...
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()

  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/plans" element={<PlanSelection />} />
          <Route path="/onboarding/:sessionId" element={<OnboardingComplete />} />
          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/dashboard/:section" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/releases/:id" element={<ProtectedRoute><ReleaseDetail /></ProtectedRoute>} />
          {import.meta.env.DEV && <Route path="/__qa/runtime-crash" element={<RuntimeCrashRoute />} />}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </ErrorBoundary>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <NavigationProvider>
            <div className="App">
              <AppRoutes />
            </div>
          </NavigationProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App;
