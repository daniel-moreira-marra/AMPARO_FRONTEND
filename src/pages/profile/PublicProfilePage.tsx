import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Link2, Heart, Shield, Briefcase,
  Building2, CheckCircle2, Clock, XCircle, Ban,
  User as UserIcon, Loader2, MessageSquare, ThumbsUp,
  Stethoscope, Star, Home, X, Send, Check,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { usePublicLinks, useCreateLink, useLinks } from "@/hooks/useLinks";
import { usePublicUser } from "@/hooks/useProfile";
import { useUserPosts } from "@/hooks/useUserPosts";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLE_LABELS, getRoleStyle, type RoleStyle } from "@/constants/roles";
import { formatRelativeTime } from "@/utils/formatDate";
import { resolveApiError } from "@/utils/apiError";
import type { Link as LinkType } from "@/hooks/useLinks";
import type { Post } from "@/types";

// ─── Label maps ───────────────────────────────────────────────────────────────

const CARE_TYPE_LABELS: Record<string, string> = {
  HOME: "Domiciliar", HOSPITAL: "Hospitalar",
  NIGHT_SHIFT: "Plantão noturno", DAY_SHIFT: "Plantão diurno", COMPANION: "Companhia",
};
const PROFESSION_LABELS: Record<string, string> = {
  PHYSIOTHERAPIST: "Fisioterapeuta", SPEECH_THERAPIST: "Fonoaudiólogo",
  OCCUPATIONAL_THERAPIST: "Terapeuta Ocupacional", PSYCHOLOGIST: "Psicólogo",
  NUTRITIONIST: "Nutricionista", OTHER: "Outro",
};
const SERVICE_MODE_LABELS: Record<string, string> = {
  HOME: "Domiciliar", CLINIC: "Clínica", ONLINE: "Online", OTHER: "Outro",
};
const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  ILPI: "ILPI", SHELTER: "Abrigo", CLINIC: "Clínica", HOSPITAL: "Hospital", OTHER: "Outro",
};
const RELATION_LABELS: Record<string, string> = {
  CHILD: "Filho(a)", SPOUSE: "Cônjuge", SIBLING: "Irmão/Irmã",
  RELATIVE: "Parente", LEGAL_GUARDIAN: "Responsável legal", OTHER: "Outro",
};
const ROLE_TO_LINK_TYPE: Record<string, "caregiver" | "guardian" | "professional" | "institution"> = {
  CAREGIVER: "caregiver", GUARDIAN: "guardian",
  PROFESSIONAL: "professional", INSTITUTION: "institution",
};
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
  const navigate    = useNavigate();
  const id          = userId ? Number(userId) : null;
  const currentUser = useAuthStore((s) => s.user);

  const { data: userInfo, isLoading, isError: userError } = usePublicUser(id);
  const { data: links = [],  isLoading: linksLoading }    = usePublicLinks(id);
  const { data: posts = [],  isLoading: postsLoading }    = useUserPosts(id);
  const { data: myLinks = [] }                            = useLinks();

  const [showLinkModal, setShowLinkModal] = useState(false);

  const isError        = userError && !isLoading;
  const name           = userInfo?.full_name ?? "Usuário";
  const roleLabel      = ROLE_LABELS[userInfo?.role ?? ""] ?? userInfo?.role ?? "—";
  const roleStyle      = getRoleStyle(userInfo?.role);
  const location       = [userInfo?.city, userInfo?.state].filter(Boolean).join(", ");
  const initials       = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  const activeLinks    = links.filter((l) => l.status === "ACTIVE");
  const currentLinkType = currentUser?.role ? ROLE_TO_LINK_TYPE[currentUser.role] : undefined;
  const canRequestLink  = !!(userInfo?.role === "ELDER" && currentLinkType && userInfo.elder_profile_id);

  const existingLink = userInfo?.elder_profile_id
    ? myLinks.find((l) => l.elder_id === userInfo.elder_profile_id)
    : undefined;
  const linkButtonStatus = existingLink?.status;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">

      {/* ── Back ──────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-text/60 hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div
          className="h-24"
          style={{
            background: `linear-gradient(135deg, ${roleStyle.color}99 0%, ${roleStyle.color}33 60%, transparent 100%)`,
          }}
        />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-3 w-16 h-16 rounded-2xl bg-white p-1 shadow-lg border border-border/40 flex-shrink-0">
            {userInfo?.avatar ? (
              <img src={userInfo.avatar} alt={name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <div
                className="w-full h-full rounded-xl flex items-center justify-center font-bold text-xl"
                style={{ background: roleStyle.lightBg, color: roleStyle.color }}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin opacity-50" /> : initials || <UserIcon size={20} />}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 w-44 bg-gray-200 rounded-lg" />
              <div className="h-4 w-24 bg-gray-100 rounded-full" />
            </div>
          ) : isError ? (
            <p className="text-sm font-semibold text-red-500 py-4">Não foi possível carregar este perfil.</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-text">{name}</h1>
                <div className="flex flex-wrap items-center gap-1.5 text-sm text-text/50 font-medium">
                  <span>{roleLabel}</span>
                  {location && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{location}</span>
                    </>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-xs text-text/35 font-medium pt-0.5">
                  <Link2 size={11} />
                  {activeLinks.length} vínculo{activeLinks.length !== 1 ? "s" : ""} ativo{activeLinks.length !== 1 ? "s" : ""}
                </p>
              </div>

              {canRequestLink && (
                <LinkRequestButton
                  status={linkButtonStatus}
                  onClick={() => setShowLinkModal(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <div className="grid md:grid-cols-[280px_1fr] gap-6 items-start">

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* About */}
            {userInfo && Object.keys(userInfo.profile).some((k) => userInfo.profile[k] != null) && (
              <section className="bg-white rounded-2xl border border-border shadow-sm p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text/40 mb-4">Sobre</h2>
                <ProfileDetails role={userInfo.role} profile={userInfo.profile} />
              </section>
            )}

            {/* Vínculos */}
            <section className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text/40 mb-4 flex items-center gap-1.5">
                <Link2 size={12} />Vínculos
              </h2>
              {linksLoading ? (
                <div className="animate-pulse space-y-2">
                  {[0, 1].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
                </div>
              ) : links.length === 0 ? (
                <p className="text-sm text-text/40 font-medium">Nenhum vínculo público.</p>
              ) : (
                <div className="space-y-2">
                  {links.map((link) => <PublicLinkCard key={link.id} link={link} />)}
                </div>
              )}
            </section>
          </div>

          {/* ── Posts feed ──────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text/40 flex items-center gap-1.5 px-1">
              <MessageSquare size={12} />Publicações
            </h2>

            {postsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[0, 1].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-10 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <MessageSquare size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-text/50 font-medium">Nenhuma publicação ainda.</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} authorName={name} authorInitials={initials} roleStyle={roleStyle} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Request link modal ────────────────────────────────────────── */}
      {showLinkModal && userInfo && (
        <RequestLinkModal
          elderName={userInfo.full_name}
          elderProfileId={userInfo.elder_profile_id!}
          linkType={currentLinkType!}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </div>
  );
};

// ─── LinkRequestButton ────────────────────────────────────────────────────────

const LinkRequestButton = ({
  status,
  onClick,
}: {
  status: "PENDING" | "ACTIVE" | "ENDED" | "CANCELLED" | undefined;
  onClick: () => void;
}) => {
  if (status === "ACTIVE") {
    return (
      <div className="self-start flex items-center gap-2 px-5 h-10 rounded-xl bg-green-50 text-green-700 text-sm font-bold border border-green-200 flex-shrink-0 cursor-default">
        <Check size={15} />
        Conectado
      </div>
    );
  }
  if (status === "PENDING") {
    return (
      <div className="self-start flex items-center gap-2 px-5 h-10 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold border border-amber-200 flex-shrink-0 cursor-default">
        <Clock size={15} />
        Vínculo solicitado
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className="self-start flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm shadow-primary/20 flex-shrink-0"
    >
      <Link2 size={15} />
      Solicitar vínculo
    </button>
  );
};

// ─── ProfileDetails ───────────────────────────────────────────────────────────

const ProfileDetails = ({ role, profile }: { role: string; profile: Record<string, any> }) => {
  if (role === "CAREGIVER") return (
    <div className="space-y-3">
      {profile.bio && <p className="text-sm text-text/80 font-medium leading-relaxed">{profile.bio}</p>}
      {profile.experience_years != null && (
        <InfoRow icon={<Star size={13} className="text-amber-500" />} text={`${profile.experience_years} anos de experiência`} />
      )}
      {profile.is_available != null && (
        <InfoRow
          icon={<Clock size={13} className={profile.is_available ? "text-green-500" : "text-gray-400"} />}
          text={profile.is_available ? "Disponível" : "Indisponível"}
          textClass={profile.is_available ? "text-green-600 font-bold" : "text-text/50"}
        />
      )}
      {(profile.city || profile.state) && (
        <InfoRow icon={<MapPin size={13} className="text-text/40" />} text={[profile.city, profile.state].filter(Boolean).join(", ")} />
      )}
      {profile.care_types?.length > 0 && (
        <div className="pt-1 space-y-2">
          <p className="text-[11px] font-bold text-text/35 uppercase tracking-wide">Tipos de atendimento</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.care_types.map((t: string) => (
              <span key={t} className="px-2 py-0.5 rounded-lg bg-primary-light text-primary text-[11px] font-bold">
                {CARE_TYPE_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (role === "PROFESSIONAL") {
    const professionLabel =
      profile.profession === "OTHER"
        ? (profile.profession_other || "Outro")
        : (PROFESSION_LABELS[profile.profession] ?? profile.profession);
    return (
      <div className="space-y-3">
        {profile.profession && (
          <InfoRow icon={<Stethoscope size={13} className="text-purple-500" />} text={professionLabel} bold />
        )}
        {(profile.council || profile.license_number) && (
          <InfoRow
            icon={<Stethoscope size={13} className="text-text/40" />}
            text={[profile.council, profile.license_number].filter(Boolean).join(": ")}
          />
        )}
        {profile.bio && <p className="text-sm text-text/80 font-medium leading-relaxed">{profile.bio}</p>}
        {profile.service_mode && (
          <InfoRow icon={<Home size={13} className="text-text/40" />} text={SERVICE_MODE_LABELS[profile.service_mode] ?? profile.service_mode} />
        )}
        {profile.hourly_rate && (
          <InfoRow icon={<span className="text-[11px] font-black text-text/40 w-3.5">R$</span>} text={`${profile.hourly_rate}/hora`} />
        )}
        {profile.is_available != null && (
          <InfoRow
            icon={<Clock size={13} className={profile.is_available ? "text-green-500" : "text-gray-400"} />}
            text={profile.is_available ? "Disponível" : "Indisponível"}
            textClass={profile.is_available ? "text-green-600 font-bold" : "text-text/50"}
          />
        )}
        {(profile.city || profile.state) && (
          <InfoRow icon={<MapPin size={13} className="text-text/40" />} text={[profile.city, profile.state].filter(Boolean).join(", ")} />
        )}
      </div>
    );
  }

  if (role === "INSTITUTION") return (
    <div className="space-y-3">
      {(profile.trade_name || profile.legal_name) && (
        <InfoRow icon={<Building2 size={13} className="text-orange-500" />} text={profile.trade_name || profile.legal_name} bold />
      )}
      {profile.institution_type && (
        <InfoRow icon={<span className="w-3.5" />} text={INSTITUTION_TYPE_LABELS[profile.institution_type] ?? profile.institution_type} />
      )}
      {profile.capacity != null && (
        <InfoRow icon={<span className="w-3.5" />} text={`${profile.capacity} vagas`} />
      )}
      {profile.website && (
        <a href={profile.website} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary text-sm font-medium hover:underline break-all">
          <Link2 size={13} />{profile.website}
        </a>
      )}
    </div>
  );

  if (role === "GUARDIAN") return (
    <div className="space-y-3">
      {profile.relationship && (
        <InfoRow icon={<Shield size={13} className="text-blue-500" />} text={RELATION_LABELS[profile.relationship] ?? profile.relationship} />
      )}
      {profile.is_legal_guardian && (
        <InfoRow icon={<CheckCircle2 size={13} className="text-green-500" />} text="Responsável legal" />
      )}
    </div>
  );

  return null;
};

const InfoRow = ({ icon, text, bold, textClass }: { icon: React.ReactNode; text: string; bold?: boolean; textClass?: string }) => (
  <div className="flex items-center gap-2">
    <span className="flex-shrink-0">{icon}</span>
    <span className={`text-sm font-medium ${textClass ?? "text-text/70"} ${bold ? "!font-bold !text-text" : ""}`}>{text}</span>
  </div>
);

// ─── PostCard ─────────────────────────────────────────────────────────────────

const PostCard = ({
  post, authorName, authorInitials, roleStyle,
}: {
  post: Post;
  authorName: string;
  authorInitials: string;
  roleStyle: RoleStyle;
}) => (
  <article className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-3">
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ background: roleStyle.lightBg, color: roleStyle.color }}
      >
        {authorInitials}
      </div>
      <div>
        <p className="text-sm font-bold text-text">{authorName}</p>
        <p className="text-xs text-text/40 font-medium">{formatRelativeTime(post.created_at)}</p>
      </div>
    </div>

    <p className="text-sm text-text/80 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>

    {post.image && (
      <img src={post.image} alt={post.image_alt_text || ""} className="w-full rounded-xl object-cover max-h-72" />
    )}

    <div className="flex items-center gap-4 pt-1 border-t border-border/40">
      <span className="flex items-center gap-1.5 text-xs text-text/40 font-medium">
        <ThumbsUp size={12} />{post.likes_count}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-text/40 font-medium">
        <MessageSquare size={12} />{post.comments_count}
      </span>
    </div>
  </article>
);

// ─── PublicLinkCard ───────────────────────────────────────────────────────────

const PublicLinkCard = ({ link }: { link: LinkType }) => {
  const type   = LINK_TYPE_CONFIG[link.link_type];
  const status = STATUS_CONFIG[link.status];
  const Icon   = type.Icon;
  const StatusIcon = status.icon;
  const initials = link.other_party_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/20 hover:bg-gray-50/50 transition-all">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${type.avatarClass}`}>
        {initials || <Icon size={14} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text truncate">{link.other_party_name}</p>
        <p className="text-xs text-text/45 font-medium">{link.other_party_role}</p>
      </div>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${status.className}`}>
        <StatusIcon size={9} />{status.label}
      </span>
    </div>
  );
};

// ─── RequestLinkModal ─────────────────────────────────────────────────────────

const RequestLinkModal = ({
  elderName, elderProfileId, linkType, onClose,
}: {
  elderName: string;
  elderProfileId: number;
  linkType: "caregiver" | "guardian" | "professional" | "institution";
  onClose: () => void;
}) => {
  const { mutate: createLink, isPending } = useCreateLink();
  const { register, handleSubmit } = useForm<{ notes: string }>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = ({ notes }: { notes: string }) => {
    setError(null);
    createLink(
      { link_type: linkType, elder: elderProfileId, notes: notes || undefined },
      {
        onSuccess: onClose,
        onError: (err) => setError(resolveApiError(err, "Erro ao solicitar vínculo.")),
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-text/40 hover:text-text/70 hover:bg-gray-100 transition-colors">
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <Link2 size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text">Solicitar vínculo</h2>
            <p className="text-xs text-text/50 font-medium">com {elderName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text/50 uppercase tracking-wide">
              Observações <span className="normal-case font-normal text-text/40">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Alguma informação adicional..."
              {...register("notes")}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm text-text font-medium placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-xl border border-red-100">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-text/60 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isPending ? "Enviando..." : "Solicitar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
