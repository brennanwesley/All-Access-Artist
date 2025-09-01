import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import PlanSelection from './pages/PlanSelection'
import OnboardingComplete from './pages/OnboardingComplete'
import Index from './pages/Index'
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
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/plans" element={<PlanSelection />} />
                <Route path="/onboarding/:sessionId" element={<OnboardingComplete />} />
                <Route path="/dashboard" element={<Index />} />
              </Routes>
              <Toaster position="top-right" />
            </div>
          </NavigationProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App;
