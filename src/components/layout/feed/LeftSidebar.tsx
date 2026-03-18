import { useAuthStore } from "@/store/useAuthStore";
import { ShieldCheck, Bookmark, Settings, Calendar } from "lucide-react";

export const LeftSidebar = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-4">
      {/* Card de Identidade */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="h-16 bg-gradient-to-br from-primary/80 to-blue/80" />
        <div className="px-4 pb-5 -mt-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md">
            <div className="w-full h-full rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-xl border border-primary/10">
              {user?.full_name?.charAt(0) || "U"}
            </div>
          </div>
          <div className="mt-3 text-center">
            <h3 className="font-bold text-text leading-tight">{user?.full_name}</h3>
            <p className="text-xs text-text/50 mt-1 flex items-center justify-center gap-1 font-medium">
              <ShieldCheck size={12} className="text-primary" />
              {user?.role === 'CAREGIVER' ? 'Cuidador' : 'Familiar'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu de Utilidades */}
      <nav className="bg-white rounded-2xl border border-border p-2 shadow-sm">
        <p className="px-4 py-2 text-[10px] font-bold text-text/30 uppercase tracking-widest">Ferramentas</p>
        <SidebarLink icon={<Calendar size={18} />} label="Minha Agenda" />
        <SidebarLink icon={<Bookmark size={18} />} label="Itens Salvos" />
        <SidebarLink icon={<Settings size={18} />} label="Configurações" />
      </nav>
    </div>
  );
};

const SidebarLink = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text/60 hover:bg-gray-50 hover:text-primary transition-all">
    {icon}
    {label}
  </button>
);