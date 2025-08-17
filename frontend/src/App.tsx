import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import ReleaseDetail from "@/pages/ReleaseDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <AuthProvider>
      <Router>
        <NavigationProvider>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/releases/:id" element={
              <ProtectedRoute>
                <ReleaseDetail />
              </ProtectedRoute>
            } />
          </Routes>
        </NavigationProvider>
      </Router>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
