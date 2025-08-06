// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Certificates from './pages/Certificates'
import RequestCertificate from './pages/RequestCertificate'
import AdminDashboard from './pages/AdminDashboard'
import CertificateReview from './pages/CertificateReview'

// 🔐 Componente para proteger rutas
const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas de usuario normal */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute role="USER">
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <PrivateRoute role="USER">
            <Certificates />
          </PrivateRoute>
        }
      />
      <Route
        path="/request"
        element={
          <PrivateRoute role="USER">
            <RequestCertificate />
          </PrivateRoute>
        }
      />

      {/* Rutas de administrador */}
      <Route
        path="/admin/certificates"
        element={
          <PrivateRoute role="ADMIN">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/certificates/:id"
        element={
          <PrivateRoute role="ADMIN">
            <CertificateReview />
          </PrivateRoute>
        }
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
