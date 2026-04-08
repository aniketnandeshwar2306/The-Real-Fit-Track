import { Routes, Route, Navigate } from 'react-router-dom'
import { FitTrackProvider, useFitTrack } from './context/FitTrackContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import Toast from './components/Toast'
import Spinner from './components/Spinner'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Nutrition from './pages/Nutrition'
import Progress from './pages/Progress'
import Community from './pages/Community'

function ProtectedRoute({ children }) {
  const { loading } = useFitTrack()
  const token = localStorage.getItem('fittrack_token')

  if (!token) return <Navigate to="/login" />

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <Spinner size="lg" color="default" message="Loading your fitness data..." />
      </div>
    )
  }

  return children
}

function AppContent() {
  return (
    <>
      <Toast />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <FitTrackProvider>
          <AppContent />
        </FitTrackProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
