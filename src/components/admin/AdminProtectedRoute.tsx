import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  requireSuperAdmin?: boolean;
}

export function AdminProtectedRoute({ requireSuperAdmin = false }: AdminProtectedRouteProps) {
  const { isAdmin, isSuperAdmin, loading, requireAdmin, requireSuperAdmin: requireSuper } = useAdminAuth();

  useEffect(() => {
    if (!loading) {
      if (requireSuperAdmin) {
        requireSuper();
      } else {
        requireAdmin();
      }
    }
  }, [loading, requireSuperAdmin, requireAdmin, requireSuper]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/signin" replace />;
  }

  return <Outlet />;
}