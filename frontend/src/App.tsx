import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import PlanSelection from './pages/PlanSelection'
import OnboardingComplete from './pages/OnboardingComplete'
import Index from './pages/Index'
import ReleaseDetail from './pages/ReleaseDetail'
import NotFound from './pages/NotFound'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <NavigationProvider>
            <div className="App">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/plans" element={<PlanSelection />} />
                  <Route path="/onboarding/:sessionId" element={<OnboardingComplete />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/dashboard/:section" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/releases/:id" element={<ProtectedRoute><ReleaseDetail /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
              <Toaster position="top-right" />
            </div>
          </NavigationProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App;
