import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Users, Heart, Shield, Briefcase, Building2,
  MapPin, Star, Clock, Loader2, UserX, ChevronDown,
} from "lucide-react";

import { useSearch } from "@/hooks/useSearch";
import { ROLE_LABELS, getRoleStyle } from "@/constants/roles";
import type { SearchUser, UserRole, SearchFilters } from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_TABS: { role: UserRole | "ALL"; label: string; icon: React.ElementType }[] = [
  { role: "ALL",          label: "Todos",         icon: Users },
  { role: "CAREGIVER",   label: "Cuidadores",    icon: Heart },
  { role: "PROFESSIONAL",label: "Profissionais", icon: Briefcase },
  { role: "INSTITUTION", label: "Instituições",  icon: Building2 },
  { role: "GUARDIAN",    label: "Responsáveis",  icon: Shield },
];

const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  ILPI: "ILPI", SHELTER: "Abrigo", CLINIC: "Clínica", HOSPITAL: "Hospital",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery]           = useState("");
  const [roleTab, setRoleTab]       = useState<UserRole | "ALL">("ALL");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [hasSearched, setHasSearched] = useState(true);

  // Simple debounce via controlled state
  const handleQueryChange = (v: string) => {
    setQuery(v);
    setHasSearched(true);
    clearTimeout((handleQueryChange as any)._t);
    (handleQueryChange as any)._t = setTimeout(() => setDebouncedQ(v), 350);
  };

  const handleRoleTabClick = (role: UserRole | "ALL") => {
    setRoleTab(role);
    setHasSearched(true);
  };

  const filters: SearchFilters = {
    q:    debouncedQ || undefined,
    role: roleTab === "ALL" ? undefined : roleTab,
  };

  const { data, isFetching, isError } = useSearch(filters, hasSearched);
  const results = data?.results ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-primary/25 to-primary/5" />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-4 w-16 h-16 rounded-2xl bg-white shadow-md border border-border/40 flex items-center justify-center flex-shrink-0">
            <Search size={28} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text">Buscar na rede</h1>
          <p className="text-sm text-text/50 font-medium mt-0.5">Encontre cuidadores, profissionais e instituições</p>
        </div>
      </div>

      {/* ── Search input ──────────────────────────────────────────────── */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/35 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Buscar por nome, especialidade, cidade..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl border border-border bg-white text-sm text-text/80 placeholder:text-text/35 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        {isFetching && (
          <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary/50" />
        )}
      </div>

      {/* ── Role tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {ROLE_TABS.map(({ role, label, icon: Icon }) => (
          <button
            key={role}
            onClick={() => handleRoleTabClick(role)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              roleTab === role
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-border text-text/60 hover:border-primary/40 hover:text-primary"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Results ───────────────────────────────────────────────────── */}
      {!hasSearched ? (
        <SearchPrompt />
      ) : isFetching && results.length === 0 ? (
        <SearchSkeleton />
      ) : isError ? (
        <SearchError />
      ) : results.length === 0 ? (
        <EmptyResults query={debouncedQ} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((user) => (
            <UserCard
              key={`${user.role}-${user.id}`}
              user={user}
              onClick={() => navigate(`/profile/${user.user_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── UserCard ─────────────────────────────────────────────────────────────────

const UserCard = ({ user, onClick }: { user: SearchUser; onClick: () => void }) => {
  const roleStyle = getRoleStyle(user.role);
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const initials  = user.full_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const subtitle = (() => {
    if (user.role === "PROFESSIONAL") return user.profession_display ?? user.profession ?? roleLabel;
    if (user.role === "CAREGIVER")    return user.bio ? user.bio.slice(0, 60) + (user.bio.length > 60 ? "…" : "") : roleLabel;
    if (user.role === "INSTITUTION") {
      const t = user.institution_type;
      return (t && t !== "OTHER") ? (INSTITUTION_TYPE_LABELS[t] ?? t) : roleLabel;
    }
    return roleLabel;
  })();

  const location = [user.city, user.state].filter(Boolean).join(", ");

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 flex flex-col gap-3 text-left hover:shadow-md hover:border-primary/20 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: roleStyle.lightBg, color: roleStyle.color }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[15px] text-text leading-tight truncate group-hover:text-primary transition-colors">
            {user.full_name}
          </p>
          <p className="text-xs text-text/50 font-medium mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: roleStyle.lightBg, color: roleStyle.textColor }}
        >
          {roleLabel}
        </span>

        {location && (
          <span className="inline-flex items-center gap-1 text-[11px] text-text/45 font-medium">
            <MapPin size={10} />
            {location}
          </span>
        )}

        {(user.role === "CAREGIVER" || user.role === "PROFESSIONAL") && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ml-auto ${
            user.is_available
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-gray-100 text-gray-400"
          }`}>
            <Clock size={10} />
            {user.is_available ? "Disponível" : "Indisponível"}
          </span>
        )}

        {user.role === "PROFESSIONAL" && user.hourly_rate && (
          <span className="inline-flex items-center gap-1 text-[11px] text-text/50 font-bold ml-auto">
            R$ {user.hourly_rate}/h
          </span>
        )}

        {user.role === "CAREGIVER" && user.experience_years != null && (
          <span className="inline-flex items-center gap-1 text-[11px] text-text/45 font-medium ml-auto">
            <Star size={10} />
            {user.experience_years} {user.experience_years === 1 ? "ano" : "anos"}
          </span>
        )}
      </div>
    </button>
  );
};

// ─── Empty states ─────────────────────────────────────────────────────────────

const SearchError = () => (
  <div className="flex flex-col items-center gap-4 py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
      <UserX size={28} className="text-red-400" />
    </div>
    <div>
      <p className="font-bold text-text text-base">Erro ao buscar</p>
      <p className="text-sm text-text/50 font-medium mt-1 max-w-xs">
        Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.
      </p>
    </div>
  </div>
);

const SearchPrompt = () => (
  <div className="flex flex-col items-center gap-4 py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-primary-light/50 flex items-center justify-center">
      <Search size={28} className="text-primary/50" />
    </div>
    <div>
      <p className="font-bold text-text text-base">Encontre quem você precisa</p>
      <p className="text-sm text-text/50 font-medium mt-1 max-w-xs">
        Digite um nome ou selecione um tipo de perfil para começar.
      </p>
    </div>
  </div>
);

const EmptyResults = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center gap-4 py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
      <UserX size={28} className="text-gray-400" />
    </div>
    <div>
      <p className="font-bold text-text text-base">Nenhum resultado</p>
      <p className="text-sm text-text/50 font-medium mt-1 max-w-xs">
        {query ? `Nenhum usuário encontrado para "${query}".` : "Tente outros filtros."}
      </p>
    </div>
  </div>
);

const SearchSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-gray-100 rounded-lg" />
          <div className="h-5 w-16 bg-gray-100 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);
