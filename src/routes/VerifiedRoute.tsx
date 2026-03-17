import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export const VerifiedRoute = () => {
  const user = useAuthStore((state) => state.user);

  if (user && !user.is_verified) {
    return <Navigate to="/signup-success" replace />;
  }

  return <Outlet />;
};