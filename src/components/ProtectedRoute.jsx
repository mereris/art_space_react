// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  // ✅ Используем user вместо isAuthenticated
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-indicator"><div className="spinner"></div></div>;
  }

  // ✅ Проверяем наличие user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;