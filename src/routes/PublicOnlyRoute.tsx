import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export const PublicOnlyRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Outlet />;
  if (!user?.is_verified) return <Navigate to="/signup-success" replace />;
  return <Navigate to="/feed" replace />;
};
