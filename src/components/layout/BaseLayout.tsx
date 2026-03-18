import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const BaseLayout = () => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans">
      <Navbar />
      {/* O pt-16 garante que o conteúdo não fique sob a Navbar fixa */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};