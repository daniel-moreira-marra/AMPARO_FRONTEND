import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export const OnboardedRoute = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_verified) return <Navigate to="/signup-success" replace />;
  if (!user.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
};
