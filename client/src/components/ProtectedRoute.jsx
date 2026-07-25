import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FullPageSpinner = () => (
  <div className="flex h-screen items-center justify-center bg-paper-100 dark:bg-ink-950">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-safelight-500 border-t-transparent" />
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const GuestOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
};
