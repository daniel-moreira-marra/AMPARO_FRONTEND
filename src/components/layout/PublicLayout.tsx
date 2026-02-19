import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 flex flex-col px-4 md:px-6">
                <Outlet />
            </main>
        </div>
    );
};
