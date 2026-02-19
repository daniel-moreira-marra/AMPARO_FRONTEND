import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, Home, Link as LinkIcon, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-2">
                    <Link to={isAuthenticated ? "/feed" : "/"} className="flex items-center gap-2 font-semibold text-primary text-lg">
                        <HeartHandshake className="h-6 w-6 text-indigo-600" />
                        <span>Amparo</span>
                    </Link>
                </div>

                {isAuthenticated ? (
                    <>
                        <nav className="flex items-center gap-4 md:gap-6">
                            <Link to="/feed" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
                                <Home className="h-4 w-4" />
                                <span className="hidden md:inline">Feed</span>
                            </Link>
                            <Link to="/links" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
                                <LinkIcon className="h-4 w-4" />
                                <span className="hidden md:inline">Vínculos</span>
                            </Link>
                            <Link to="/profile" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span className="hidden md:inline">Perfil</span>
                            </Link>
                        </nav>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                                <LogOut className="h-4 w-4" />
                                <span className="sr-only">Sair</span>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost">Entrar</Button>
                        </Link>
                        <Link to="/signup">
                            <Button>Criar Conta</Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};
