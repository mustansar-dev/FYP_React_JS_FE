import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function LoadingPage() {
  return <main className="loading-page" aria-live="polite"><span className="loading-spinner" aria-hidden="true" />Restoring your session…</main>;
}

export default function ProtectedRoute({ role }) {
  const { user, ready, role: userRole } = useAuth();
  const location = useLocation();
  if (!ready) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && userRole !== role) return <Navigate to={`/${userRole || 'login'}`} replace />;
  return <Outlet />;
}
