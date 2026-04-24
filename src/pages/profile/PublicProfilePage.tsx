import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Link2, Heart, Shield, Briefcase,
  Building2, CheckCircle2, Clock, XCircle, Ban,
  User as UserIcon, Loader2,
} from "lucide-react";

import { usePublicLinks } from "@/hooks/useLinks";
import { usePublicUser } from "@/hooks/useProfile";
import { ROLE_LABELS } from "@/constants/roles";
import { formatRelativeTime } from "@/utils/formatDate";
import type { Link as LinkType } from "@/hooks/useLinks";

// ─── Config maps ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LinkType["status"], { label: string; className: string; icon: React.ElementType }> = {
  PENDING:   { label: "Pendente",  className: "bg-amber-50 text-amber-700 border border-amber-200",  icon: Clock },
  ACTIVE:    { label: "Ativo",     className: "bg-green-50 text-green-700 border border-green-200",  icon: CheckCircle2 },
  ENDED:     { label: "Encerrado", className: "bg-gray-100 text-gray-500 border border-gray-200",    icon: XCircle },
  CANCELLED: { label: "Cancelado", className: "bg-red-50 text-red-500 border border-red-100",        icon: Ban },
};

const LINK_TYPE_CONFIG: Record<LinkType["link_type"], { label: string; Icon: React.ElementType; avatarClass: string }> = {
  caregiver:    { label: "Cuidador",     Icon: Heart,     avatarClass: "bg-primary-light text-primary" },
  guardian:     { label: "Responsável",  Icon: Shield,    avatarClass: "bg-blue-50 text-blue-600" },
  professional: { label: "Profissional", Icon: Briefcase, avatarClass: "bg-purple-50 text-purple-600" },
  institution:  { label: "Instituição",  Icon: Building2, avatarClass: "bg-orange-50 text-orange-600" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate   = useNavigate();
  const id         = userId ? Number(userId) : null;

  const { data: userInfo, isLoading: userLoading, isError: userError } = usePublicUser(id);
  const { data: links = [], isLoading: linksLoading }                  = usePublicLinks(id);

  const isLoading  = userLoading || linksLoading;
  const isError    = userError && !userLoading;

  const name       = userInfo?.full_name ?? "Usuário";
  const roleLabel  = ROLE_LABELS[userInfo?.role ?? ""] ?? userInfo?.role ?? "—";
  const location   = [userInfo?.city, userInfo?.state].filter(Boolean).join(", ");
  const initials   = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  const activeLinks = links.filter((l) => l.status === "ACTIVE");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">

      {/* ── Back ──────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-text/60 hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-primary/60 to-blue-400/50" />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-3 w-16 h-16 rounded-2xl bg-white p-1 shadow-lg border border-border/40 flex-shrink-0">
            {userInfo?.avatar ? (
              <img src={userInfo.avatar} alt={name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <div className="w-full h-full rounded-xl bg-primary-light flex items-center justify-center font-bold text-xl text-primary">
                {isLoading ? <Loader2 size={20} className="animate-spin text-primary/50" /> : initials || <UserIcon size={20} />}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 w-44 bg-gray-200 rounded-lg" />
              <div className="h-4 w-24 bg-gray-100 rounded-full" />
            </div>
          ) : isError ? (
            <div className="py-4">
              <p className="text-sm font-semibold text-red-500">Não foi possível carregar este perfil.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-text">{name}</h1>
                <p className="text-sm text-text/50 font-medium mt-0.5">{roleLabel}</p>
                {location && (
                  <p className="flex items-center gap-1 text-xs text-text/40 font-medium mt-1">
                    <MapPin size={11} />
                    {location}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-text/50">
                <Link2 size={13} />
                <span>{activeLinks.length} vínculo{activeLinks.length !== 1 ? "s" : ""} ativo{activeLinks.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Links ─────────────────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <section className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-2 text-text/60 mb-5">
            <Link2 size={15} />
            <h2 className="text-sm font-bold uppercase tracking-wider">Vínculos</h2>
          </div>

          {links.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Link2 size={20} className="text-gray-400" />
              </div>
              <p className="text-sm text-text/50 font-medium">Nenhum vínculo público disponível.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {links.map((link) => (
                <PublicLinkCard key={link.id} link={link} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// ─── PublicLinkCard ───────────────────────────────────────────────────────────

const PublicLinkCard = ({ link }: { link: LinkType }) => {
  const typeConfig   = LINK_TYPE_CONFIG[link.link_type];
  const statusConfig = STATUS_CONFIG[link.status];
  const StatusIcon   = statusConfig.icon;
  const TypeIcon     = typeConfig.Icon;

  const initials = link.other_party_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-primary/20 hover:bg-gray-50/50 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${typeConfig.avatarClass}`}>
        {initials || <TypeIcon size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text truncate">{link.other_party_name}</p>
        <p className="text-xs text-text/45 font-medium">{link.other_party_role}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${statusConfig.className}`}>
          <StatusIcon size={9} />
          {statusConfig.label}
        </span>
        <span className="text-[10px] text-text/35 font-medium">{formatRelativeTime(link.created_at)}</span>
      </div>
    </div>
  );
};
