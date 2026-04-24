import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { FeedPage } from "@/pages/feed/FeedPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { PublicProfilePage } from "@/pages/profile/PublicProfilePage";
import { LinksPage } from "@/pages/links/LinksPage";
import { SearchPage } from "@/pages/search/SearchPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { VerifiedRoute } from "@/routes/VerifiedRoute";
import { UnverifiedOnlyRoute } from "@/routes/UnverifiedOnlyRoute";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute";
import { BaseLayout } from "@/components/layout/BaseLayout";
import { LandingLayout } from "@/components/layout/LandingLayout";
import { FeedLayout } from "@/components/layout/feed/FeedLayout";
import { useAuthStore } from "@/store/useAuthStore";

import LandingPage from "@/pages/LandingPage";
import SignupPage from "@/pages/auth/SignupPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupSuccessPage from "@/pages/auth/SignupSuccess";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('amparo:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('amparo:unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<UnverifiedOnlyRoute />}>
          <Route path="/signup-success" element={<SignupSuccessPage />} />
        </Route>

        <Route element={<VerifiedRoute />}>
          <Route element={<BaseLayout />}>
            <Route
              path="/feed"
              element={
                <FeedLayout>
                  <FeedPage />
                </FeedLayout>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<PublicProfilePage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
