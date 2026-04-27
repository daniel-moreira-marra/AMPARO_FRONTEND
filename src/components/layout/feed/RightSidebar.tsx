import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus, MapPin, ArrowRight, Heart, Check, Loader2, Users,
} from "lucide-react";

import { useSearch } from "@/hooks/useSearch";
import { useLinks, useCreateLink } from "@/hooks/useLinks";
import { useAuthStore } from "@/store/useAuthStore";
import { getRoleStyle, ROLE_LABELS } from "@/constants/roles";
import type { SearchUser, UserRole } from "@/types";

// ─── Config por papel do usuário logado ──────────────────────────────────────

const SEARCH_CONFIG: Partial<Record<UserRole, {
  searchRole: UserRole;
  title: string;
  emptyMsg: string;
  availableOnly: boolean;
}>> = {
  ELDER: {
    searchRole: "CAREGIVER",
    title: "Cuidadores disponíveis",
    emptyMsg: "Nenhum cuidador disponível.",
    availableOnly: true,
  },
  CAREGIVER: {
    searchRole: "PROFESSIONAL",
    title: "Profissionais de saúde",
    emptyMsg: "Nenhum profissional encontrado.",
    availableOnly: true,
  },
  GUARDIAN: {
    searchRole: "CAREGIVER",
    title: "Cuidadores disponíveis",
    emptyMsg: "Nenhum cuidador disponível.",
    availableOnly: true,
  },
  PROFESSIONAL: {
    searchRole: "CAREGIVER",
    title: "Outros cuidadores",
    emptyMsg: "Nenhum cuidador encontrado.",
    availableOnly: true,
  },
  INSTITUTION: {
    searchRole: "CAREGIVER",
    title: "Cuidadores disponíveis",
    emptyMsg: "Nenhum cuidador disponível.",
    availableOnly: true,
  },
};

const ROLE_TO_LINK_TYPE: Partial<Record<UserRole, string>> = {
  CAREGIVER:    "caregiver",
  PROFESSIONAL: "professional",
  GUARDIAN:     "guardian",
  INSTITUTION:  "institution",
};

// ─── RightSidebar ─────────────────────────────────────────────────────────────

export const RightSidebar = () => {
  const currentUser = useAuthStore((s) => s.user);
  const config = currentUser?.role ? SEARCH_CONFIG[currentUser.role] : null;

  const { data: searchData, isLoading } = useSearch(
    config
      ? {
          role: config.searchRole,
          ...(config.availableOnly ? { is_available: true } : {}),
        }
      : {},
    !!config,
  );

  const { data: links = [] } = useLinks();

  const suggestions = (searchData?.results ?? [])
    .filter((s) => s.user_id !== currentUser?.id)
    .slice(0, 3);

  // Map user_id → link status for quick lookup
  const linkedMap = new Map(links.map((l) => [l.other_party_id, l.status]));

  return (
    <div className="space-y-4">
      {/* ── Suggestions ── */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-text text-sm">
            {config?.title ?? "Sugestões para você"}
          </h4>
          <span className="text-[10px] font-semibold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">
            Ao vivo
          </span>
        </div>

        {isLoading ? (
          <SuggestionSkeleton />
        ) : suggestions.length === 0 ? (
          <EmptyState message={config?.emptyMsg ?? "Nenhuma sugestão disponível."} />
        ) : (
          <div className="space-y-1">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.user_id}
                suggestion={suggestion}
                linkStatus={linkedMap.get(suggestion.user_id) ?? null}
                currentUserRole={currentUser?.role ?? null}
                linkType={currentUser?.role ? ROLE_TO_LINK_TYPE[currentUser.role] ?? null : null}
              />
            ))}
          </div>
        )}

        <Link
          to="/search"
          className="flex items-center justify-center gap-1.5 w-full mt-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors"
        >
          Ver todos
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* ── Community card ── */}
      <CommunityCard />
    </div>
  );
};

// ─── SuggestionCard ───────────────────────────────────────────────────────────

interface SuggestionCardProps {
  suggestion: SearchUser;
  linkStatus: "PENDING" | "ACTIVE" | "ENDED" | "CANCELLED" | null;
  currentUserRole: UserRole | null;
  linkType: string | null;
}

const SuggestionCard = ({
  suggestion,
  linkStatus,
  currentUserRole,
  linkType,
}: SuggestionCardProps) => {
  const navigate = useNavigate();
  const { mutate: createLink, isPending } = useCreateLink();
  const [requested, setRequested] = useState(false);

  const style = getRoleStyle(suggestion.role);
  const roleLabel = ROLE_LABELS[suggestion.role] ?? suggestion.role;
  const initials = suggestion.full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const city =
    (suggestion as any).city || (suggestion as any).state
      ? [(suggestion as any).city, (suggestion as any).state]
          .filter(Boolean)
          .join(", ")
      : null;

  // extra snippet: bio for caregivers, profession for professionals
  const snippet =
    (suggestion as any).bio?.slice(0, 55) ||
    (suggestion as any).profession_display ||
    null;

  // Non-elders can initiate link requests toward elders
  // Elders receive requests but don't send them
  const canConnect = currentUserRole !== "ELDER" && linkType && !requested && !linkStatus;
  const isAlreadyPending = linkStatus === "PENDING" || requested;
  const isAlreadyActive = linkStatus === "ACTIVE";

  const handleConnect = () => {
    if (!linkType || !suggestion.id) return;
    createLink(
      { link_type: linkType, elder: suggestion.id },
      {
        onSuccess: () => setRequested(true),
      },
    );
  };

  return (
    <div className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50/80 transition-colors">
      {/* Avatar */}
      <button
        onClick={() => navigate(`/profile/${suggestion.user_id}`)}
        className="flex-shrink-0"
        aria-label={`Ver perfil de ${suggestion.full_name}`}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm border-2 transition-transform group-hover:scale-105"
          style={{
            backgroundColor: style.lightBg,
            color: style.textColor,
            borderColor: style.color + "40",
          }}
        >
          {initials}
        </div>
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => navigate(`/profile/${suggestion.user_id}`)}
          className="text-left w-full"
        >
          <p className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors leading-tight">
            {suggestion.full_name}
          </p>
          <span
            className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-0.5"
            style={{ backgroundColor: style.lightBg, color: style.textColor }}
          >
            {roleLabel}
          </span>
        </button>

        {snippet && (
          <p className="text-[10px] text-text/50 mt-1 leading-snug line-clamp-2">
            {snippet}
            {snippet.length >= 55 ? "…" : ""}
          </p>
        )}

        {city && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-text/40 font-medium">
            <MapPin size={9} />
            <span className="truncate">{city}</span>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="flex-shrink-0 mt-0.5">
        {isAlreadyActive ? (
          <span
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
            style={{ backgroundColor: style.lightBg, color: style.textColor }}
          >
            <Check size={10} />
            Vinculado
          </span>
        ) : isAlreadyPending ? (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
            <Loader2 size={10} className="animate-spin" />
            Pendente
          </span>
        ) : canConnect ? (
          <button
            onClick={handleConnect}
            disabled={isPending}
            aria-label={`Conectar com ${suggestion.full_name}`}
            className="p-1.5 rounded-xl transition-all text-primary hover:bg-primary/10 active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SuggestionSkeleton = () => (
  <div className="space-y-1 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-start gap-3 p-2.5">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-1.5 pt-0.5">
          <div className="h-3 bg-gray-100 rounded-md w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded-md w-1/3" />
          <div className="h-2 bg-gray-100 rounded-md w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center gap-2 py-6 text-center">
    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
      <Users size={18} className="text-text/20" />
    </div>
    <p className="text-xs text-text/40 font-medium leading-relaxed max-w-[140px]">{message}</p>
  </div>
);

// ─── Community card ───────────────────────────────────────────────────────────

const CommunityCard = () => (
  <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/15 relative overflow-hidden">
    <Heart
      className="absolute -right-3 -bottom-3 w-14 h-14 rotate-12"
      style={{ color: "#4CAF8820" }}
    />
    <div className="relative">
      <h5 className="font-bold text-primary text-sm leading-tight">
        Comunidade Amparo
      </h5>
      <p className="mt-1.5 text-xs text-text/60 leading-relaxed font-medium">
        Troque experiências e encontre apoio com outros cuidadores.
      </p>
      <button className="mt-3 text-[11px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
        Em breve <ArrowRight size={11} />
      </button>
    </div>
  </div>
);
