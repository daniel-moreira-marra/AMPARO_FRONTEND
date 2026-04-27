import { Search, X, Hash } from "lucide-react";
import { ROLE_LABELS } from "@/constants/roles";
import type { UserRole } from "@/types";
import type { FeedFilters } from "@/hooks/useFeed";

const ROLE_TABS: { role: UserRole | "ALL"; label: string }[] = [
  { role: "ALL",          label: "Todos" },
  { role: "CAREGIVER",   label: "Cuidadores" },
  { role: "PROFESSIONAL",label: "Profissionais" },
  { role: "INSTITUTION", label: "Instituições" },
  { role: "GUARDIAN",    label: "Responsáveis" },
  { role: "ELDER",       label: "Idosos" },
];

interface FeedHeaderProps {
  filters: FeedFilters & { role?: UserRole | "ALL" };
  onFiltersChange: (filters: FeedFilters & { role?: UserRole | "ALL" }) => void;
}

export const FeedHeader = ({ filters, onFiltersChange }: FeedHeaderProps) => {
  const activeRole = (filters.role as UserRole | "ALL") ?? "ALL";

  const setQ = (q: string) => onFiltersChange({ ...filters, q: q || undefined });
  const setRole = (role: UserRole | "ALL") =>
    onFiltersChange({ ...filters, role: role === "ALL" ? undefined : role });
  const setTag = (tag: string) => onFiltersChange({ ...filters, tag: tag || undefined });

  const clearTag = () => onFiltersChange({ ...filters, tag: undefined });

  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-sm space-y-3">
      {/* Search input */}
      <div className="relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-primary transition-colors"
          size={16}
          aria-hidden="true"
        />
        <input
          type="text"
          value={filters.q ?? ""}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por autor ou conteúdo..."
          aria-label="Buscar no feed"
          className="w-full h-10 pl-9 pr-4 bg-[#F3F4F6] border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium text-text/80 placeholder:text-text/40 transition-all focus:bg-white"
        />
        {filters.q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/60 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Role tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {ROLE_TABS.map(({ role, label }) => (
          <button
            key={role}
            onClick={() => setRole(role)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
              activeRole === role
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-text/55 border-border hover:border-primary/40 hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30 pointer-events-none" />
          <input
            type="text"
            value={filters.tag ?? ""}
            onChange={(e) => setTag(e.target.value.replace(/[^a-z0-9_\-áéíóúãõâêîôûç]/gi, "").toLowerCase())}
            placeholder="filtrar por tag..."
            aria-label="Filtrar por tag"
            className="w-full h-8 pl-8 pr-4 bg-[#F3F4F6] border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-[12px] font-bold text-text/70 placeholder:text-text/35 transition-all focus:bg-white"
          />
          {filters.tag && (
            <button
              onClick={clearTag}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/60 transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
