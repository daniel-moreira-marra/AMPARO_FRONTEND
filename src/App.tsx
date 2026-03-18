import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { FeedPage } from "@/pages/feed/FeedPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { LinksPage } from "@/pages/links/LinksPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { BaseLayout } from "@/components/layout/BaseLayout";
import { LandingLayout } from "./components/layout/LandingLayout";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupSuccessPage from "./pages/auth/SignupSuccess";
import { VerifiedRoute } from "./routes/VerifiedRoute";
import { UnverifiedOnlyRoute } from "./routes/UnverifiedOnlyRoute";
import { FeedLayout } from "./components/layout/feed/FeedLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} /> 

          {/* Portão 1: Apenas Logados */}
          <Route element={<ProtectedRoute/>}>

            {/* SUB-PORTÃO: APENAS QUEM NÃO VERIFICOU (Bloqueia quem já é verificado) */}
            <Route element={<UnverifiedOnlyRoute/>}>
              <Route path="/signup-success" element={<SignupSuccessPage />} />      

            </Route>            
          

          
            {/* Portão 2: Apenas Logados e verificados */}
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
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/links" element={<LinksPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
