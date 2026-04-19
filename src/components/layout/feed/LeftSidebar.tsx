import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldCheck, Bookmark, Settings, Calendar } from "lucide-react";
import { ROLE_LABELS } from "@/constants/roles";

export const LeftSidebar = () => {
  const user = useAuthStore((state) => state.user);
  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : 'Membro';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="h-16 bg-gradient-to-br from-primary/80 to-blue/80" />
        <div className="px-4 pb-5 -mt-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md">
            <div className="w-full h-full rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-xl border border-primary/10">
              {user?.full_name?.charAt(0) ?? "U"}
            </div>
          </div>
          <div className="mt-3 text-center">
            <h3 className="font-bold text-text leading-tight">{user?.full_name}</h3>
            <p className="text-xs text-text/50 mt-1 flex items-center justify-center gap-1 font-medium">
              <ShieldCheck size={12} className="text-primary" aria-hidden="true" />
              {roleLabel}
            </p>
          </div>
        </div>
      </div>

      <nav className="bg-white rounded-2xl border border-border p-2 shadow-sm" aria-label="Ferramentas">
        <p className="px-4 py-2 text-[10px] font-bold text-text/30 uppercase tracking-widest">Ferramentas</p>
        <SidebarLink to="/agenda" icon={<Calendar size={18} />} label="Minha Agenda" />
        <SidebarLink to="/saved" icon={<Bookmark size={18} />} label="Itens Salvos" />
        <SidebarLink to="/settings" icon={<Settings size={18} />} label="Configurações" />
      </nav>
    </div>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink = ({ to, icon, label }: SidebarLinkProps) => (
  <Link
    to={to}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text/60 hover:bg-gray-50 hover:text-primary transition-all"
  >
    {icon}
    {label}
  </Link>
);
