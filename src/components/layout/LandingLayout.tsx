import { Outlet } from "react-router-dom";
import Header from "@/components/landing/Header"; // Importa o novo header específico
import Footer from "@/components/landing/Footer"; // Importa o novo footer específico

export const LandingLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-primary/20">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};