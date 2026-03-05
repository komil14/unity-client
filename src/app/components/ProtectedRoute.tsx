import { Navigate, useLocation } from "react-router-dom";
import { useCheckAuthQuery } from "../services/authApi";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Which member types are allowed. If omitted, any authenticated user is allowed. */
  allowedTypes?: ("USER" | "ORG")[];
}

/**
 * Route guard that redirects unauthenticated users to /login
 * and optionally checks memberType for role-based access.
 */
export default function ProtectedRoute({
  children,
  allowedTypes,
}: ProtectedRouteProps) {
  const { data, isLoading } = useCheckAuthQuery();
  const location = useLocation();

  // Show nothing while auth is being checked (prevents flash)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const member = data?.member;

  // Not authenticated — redirect to login
  if (!member) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (
    allowedTypes &&
    !allowedTypes.includes(member.memberType as "USER" | "ORG")
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
