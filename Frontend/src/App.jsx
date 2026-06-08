import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { LiveLocationProvider } from './context/LiveLocationContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import FamilyPage from './pages/FamilyPage'
import MapPage from './pages/MapPage'
import Layout from './components/Layout'

function Protected({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? <LiveLocationProvider>{children}</LiveLocationProvider> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/" element={<Protected><Layout /></Protected>}>
              <Route index element={<DashboardPage />} />
              <Route path="family/:id" element={<FamilyPage />} />
              <Route path="map/:id" element={<MapPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
