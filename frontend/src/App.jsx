import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AdminLogin from './pages/AdminLogin'
import EmployeeDashboard from './pages/EmployeeDashboard'
import Quiz from './pages/Quiz'
import QuizReview from './pages/QuizReview'
import Certificate from './pages/Certificate'
import AdminDashboard from './pages/AdminDashboard'
import LandingPage from './pages/LandingPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'

// Component to handle root route - redirects based on auth status
const RootRedirect = () => {
  const { isAuthenticated, isAdmin, loading, authError, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (authError && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          <p className="text-sm text-gray-500">
            Please access this portal through the DLP backend system.
          </p>
        </div>
      </div>
    );
  }

  // If role=admin in headers, redirect directly to admin dashboard (analytics page)
  if (isAdmin || userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:sessionId"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:sessionId/review"
            element={
              <ProtectedRoute>
                <QuizReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificate/:resultId"
            element={
              <ProtectedRoute>
                <Certificate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route path="/" element={<RootRedirect />} />
          <Route path="/landing" element={<LandingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

