import { Link, useLocation } from "react-router-dom";
import { Bell, User as UserIcon, Home, Link as LinkIcon } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Placeholder: replace with real notification count from API
  const hasNotifications = false;

  return (
    <nav className="fixed top-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-4">

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to={isAuthenticated ? "/feed" : "/"} className="flex items-center gap-2">
            <img src="/images/logo-amparo.svg" alt="Amparo" className="h-8 w-auto" />
          </Link>
        </div>

        {isAuthenticated && (
          <nav className="hidden md:flex flex-1 justify-center items-center gap-2" aria-label="Navegação principal">
            <NavLink to="/feed" icon={<Home size={18} />} label="Feed" active={isActive("/feed")} />
            <NavLink to="/links" icon={<LinkIcon size={18} />} label="Vínculos" active={isActive("/links")} />
            <NavLink to="/profile" icon={<UserIcon size={18} />} label="Perfil" active={isActive("/profile")} />
          </nav>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated ? (
            <>
              <button
                aria-label="Notificações"
                className="p-2 text-text/60 hover:bg-primary-light hover:text-primary rounded-full transition-colors relative"
              >
                <Bell size={22} />
                {hasNotifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              <div className="h-8 w-[1px] bg-border hidden sm:block" />

              <button
                aria-label={`Perfil de ${user?.full_name ?? 'usuário'}`}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary border border-primary/20 overflow-hidden text-xs font-bold transition-transform group-hover:scale-105">
                  {user?.full_name?.charAt(0) ?? <UserIcon size={16} />}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-text truncate max-w-[100px]">
                  {user?.full_name?.split(" ")[0]}
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-text/70 hover:text-text transition-colors">
                Entrar
              </Link>
              <Link
                to="/signup"
                className="text-sm font-bold text-white bg-primary px-5 py-2.5 rounded-full hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavLink = ({ to, icon, label, active }: NavLinkProps) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
      active
        ? "bg-primary-light text-primary shadow-sm shadow-primary/5"
        : "text-text/60 hover:bg-gray-50 hover:text-text"
    }`}
  >
    {icon}
    {label}
  </Link>
);
