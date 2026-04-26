import { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, User as UserIcon, Home, Link as LinkIcon, LogOut, Search,
  CheckCheck, Link2, Check,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/utils/formatDate";
import type { Notification } from "@/types";

export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const profilePath = user?.id ? `/profile/${user.id}` : "/feed";
  const isActive = (path: string) => location.pathname === path;

  const { data: notifData } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const unreadCount = notifData?.unread_count ?? 0;
  const notifications = notifData?.notifications ?? [];
  const hasNotifications = unreadCount > 0;

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const handleNotifOpen = () => {
    setNotifOpen((v) => !v);
    setDropdownOpen(false);
  };

  const handleNotifClick = (n: Notification) => {
    if (!n.is_read) markRead(n.id);
    if (n.link_id) navigate("/links");
    setNotifOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <NavLink to="/feed"    icon={<Home size={18} />}     label="Feed"     active={isActive("/feed")} />
            <NavLink to="/links"   icon={<LinkIcon size={18} />} label="Vínculos" active={isActive("/links")} />
            <NavLink to="/search"  icon={<Search size={18} />}   label="Buscar"   active={isActive("/search")} />
            <NavLink to={profilePath} icon={<UserIcon size={18} />} label="Perfil" active={location.pathname.startsWith("/profile")} />
          </nav>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated ? (
            <>
              {/* ── Notification bell ── */}
              <div className="relative" ref={notifRef}>
                <button
                  aria-label="Notificações"
                  onClick={handleNotifOpen}
                  className="p-2 text-text/60 hover:bg-primary-light hover:text-primary rounded-full transition-colors relative"
                >
                  <Bell size={22} />
                  {hasNotifications && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <p className="text-sm font-bold text-text">Notificações</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllRead()}
                          className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                        >
                          <CheckCheck size={13} />
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                          <Bell size={24} className="text-text/20" />
                          <p className="text-sm text-text/40 font-medium">Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <NotificationItem key={n.id} notification={n} onClick={handleNotifClick} />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-[1px] bg-border hidden sm:block" />

              {/* ── Profile dropdown ── */}
              <div className="relative" ref={dropdownRef}>
                <button
                  aria-label={`Perfil de ${user?.full_name ?? 'usuário'}`}
                  aria-expanded={dropdownOpen}
                  onClick={() => { setDropdownOpen((v) => !v); setNotifOpen(false); }}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary border border-primary/20 overflow-hidden text-xs font-bold transition-transform group-hover:scale-105">
                    {user?.avatar
                      ? <img src={user.avatar} alt={user.full_name ?? ""} className="w-full h-full object-cover" />
                      : (user?.full_name?.charAt(0) ?? <UserIcon size={16} />)
                    }
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-text truncate max-w-[100px]">
                    {user?.full_name?.split(" ").slice(0, 2).join(" ")}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-border overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-text truncate">{user?.full_name}</p>
                      <p className="text-xs text-text/50 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to={profilePath}
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text/70 hover:bg-gray-50 transition-colors"
                    >
                      <UserIcon size={16} />
                      Meu perfil
                    </Link>
                    <div className="border-t border-border/50" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sair da conta
                    </button>
                  </div>
                )}
              </div>
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

// ─── NotificationItem ─────────────────────────────────────────────────────────

const NOTIF_ICONS: Record<string, React.ElementType> = {
  LINK_REQUEST: Link2,
  LINK_ACCEPTED: Check,
};

const NotificationItem = ({
  notification: n,
  onClick,
}: {
  notification: Notification;
  onClick: (n: Notification) => void;
}) => {
  const Icon = NOTIF_ICONS[n.type] ?? Bell;

  return (
    <button
      onClick={() => onClick(n)}
      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-border/30 last:border-0 ${
        !n.is_read ? "bg-primary-light/30" : ""
      }`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        n.type === "LINK_REQUEST" ? "bg-amber-50 text-amber-500" : "bg-green-50 text-green-500"
      }`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs leading-relaxed ${n.is_read ? "text-text/60 font-medium" : "text-text font-semibold"}`}>
          {n.message}
        </p>
        <p className="text-[11px] text-text/35 font-medium mt-0.5">
          {formatRelativeTime(n.created_at)}
        </p>
      </div>
      {!n.is_read && (
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
      )}
    </button>
  );
};

// ─── NavLink ─────────────────────────────────────────────────────────────────

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
