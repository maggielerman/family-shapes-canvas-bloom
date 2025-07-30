import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { donorAuthService } from "@/services/donorAuthService";

interface DonorProtectedRouteProps {
  children: React.ReactNode;
}

const DonorProtectedRoute = ({ children }: DonorProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkDonorAccess = async () => {
      if (!loading && !user) {
        // Not authenticated, redirect to donor auth
        navigate("/donor/auth");
      } else if (!loading && user) {
        // Check if user is a donor
        const isDonor = await donorAuthService.isDonor(user.id);
        if (!isDonor) {
          // User is authenticated but not a donor, redirect to donor auth
          navigate("/donor/auth");
        }
      }
    };

    checkDonorAccess();
  }, [user, loading, navigate]);

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default DonorProtectedRoute;