import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export const UnverifiedOnlyRoute = () => {
  const { user, isAuthenticated } = useAuthStore();

  // 1. Se nem logado está, manda pro login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 2. Se já está verificado, não tem o que fazer aqui. Manda pro Feed!
  const isVerified = user?.is_verified;
  
  if (isVerified) {
    return <Navigate to="/feed" replace />;
  }

  // 3. Só chega aqui quem está LOGADO e NÃO VERIFICADO
  return <Outlet />;
};