import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  requireSuperAdmin?: boolean;
}

export function AdminProtectedRoute({ requireSuperAdmin = false }: AdminProtectedRouteProps) {
  // TEMPORARY: Using regular auth instead of admin auth for debugging
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // TEMPORARY: Just check if user is logged in, skip admin role check
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}