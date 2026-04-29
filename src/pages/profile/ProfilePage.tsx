import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin, Link2, Briefcase, Building2, CheckCircle2,
  Clock, XCircle, Loader2, MessageSquare,
  Stethoscope, Star, Home, X, Send, Pencil, Check, Camera,
  Mail, Phone, Shield, Heart, ShieldCheck, ShieldAlert, Eye,
} from "lucide-react";

import { useProfile, usePublicUser } from "@/hooks/useProfile";
import { useRoleProfile } from "@/hooks/useRoleProfile";
import { usePublicLinks, useCreateLink, useLinks } from "@/hooks/useLinks";
import { useUserPosts } from "@/hooks/useUserPosts";
import { useElderMedicalRecord, type ElderMedicalRecord } from "@/hooks/useElderMedicalRecord";
import { FeedItem } from "@/components/feed/FeedItem";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLE_LABELS, getRoleStyle, type RoleStyle } from "@/constants/roles";
import { RoleProfileSection, type RoleProfileRef } from "@/components/profile/RoleProfileSection";
import { resolveApiError } from "@/utils/apiError";
import { maskPhone, maskCEP } from "@/utils/masks";
import { fetchAddressByCep } from "@/utils/viaCep";
import type { Link as LinkType } from "@/hooks/useLinks";
import type { User, UserRole } from "@/types";

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
  ENDED:     { label: "Ativo",    className: "bg-green-50 text-green-700 border border-green-200", icon: CheckCircle2 },
  CANCELLED: { label: "Pendente", className: "bg-amber-50 text-amber-700 border border-amber-200", icon: Clock },
};
const LINK_TYPE_CONFIG: Record<LinkType["link_type"], { label: string; Icon: React.ElementType; avatarClass: string }> = {
  caregiver:    { label: "Cuidador",     Icon: Heart,     avatarClass: "bg-primary-light text-primary" },
  guardian:     { label: "Responsável",  Icon: Shield,    avatarClass: "bg-blue-50 text-blue-600" },
  professional: { label: "Profissional", Icon: Briefcase, avatarClass: "bg-purple-50 text-purple-600" },
  institution:  { label: "Instituição",  Icon: Building2, avatarClass: "bg-orange-50 text-orange-600" },
};

// ─── Edit form schema ────────────────────────────────────────────────────────

const editSchema = z.object({
  full_name:    z.string().min(2, "Mínimo 2 caracteres"),
  phone:        z.string().optional(),
  zip_code:     z.string().optional(),
  address_line: z.string().optional(),
  number:       z.string().optional(),
  complement:   z.string().optional(),
  city:         z.string().optional(),
  state:        z.string().max(2, "Use a sigla UF (ex: SP)").optional(),
});
type EditForm = z.infer<typeof editSchema>;

function parseAddressLine(raw: string) {
  if (!raw) return { street: "", number: "", complement: "" };
  const [mainPart, complement = ""] = raw.split(" - ");
  const lastComma = mainPart.lastIndexOf(", ");
  if (lastComma === -1) return { street: mainPart, number: "", complement };
  return { street: mainPart.slice(0, lastComma), number: mainPart.slice(lastComma + 2), complement };
}

const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_MAX_MB = 5;

// ─── Page ─────────────────────────────────────────────────────────────────────

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const id          = userId ? Number(userId) : null;
  const isOwnProfile = !!currentUser && !!id && currentUser.id === id;

  // Own profile data (only fully loaded when needed for editing)
  const { profile, isLoading: ownLoading, updateProfileAsync } = useProfile();
  const { data: roleProfile } = useRoleProfile(isOwnProfile ? (profile?.role as UserRole) : undefined);

  // Public profile data (for other users, and for display in own profile)
  const { data: publicUser, isLoading: publicLoading } = usePublicUser(id);

  const { data: links = [],  isLoading: linksLoading } = usePublicLinks(id);
  const { data: myLinks = [] }                          = useLinks();
  const { data: posts = [],  isLoading: postsLoading }  = useUserPosts(id);

  const [isEditing, setIsEditing]         = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [saveError, setSaveError]         = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal]           = useState(false);
  const [showMedicalModal, setShowMedicalModal]     = useState(false);
  const [cepLoading, setCepLoading]                 = useState(false);

  // Privacy toggles (local state, synced from profile)
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showLinks, setShowLinks] = useState(true);
  const [shareMedicalInfo, setShareMedicalInfo] = useState(false);

  // Avatar
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError]     = useState<string | null>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const roleProfileRef = useRef<RoleProfileRef>(null);

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const syncForm = useCallback((p: User) => {
    const { street, number, complement } = parseAddressLine(p.address_line ?? "");
    reset({
      full_name:    p.full_name ?? "",
      phone:        p.phone ? maskPhone(p.phone) : "",
      zip_code:     p.zip_code ? maskCEP(p.zip_code) : "",
      address_line: street,
      number,
      complement,
      city:  p.city ?? "",
      state: p.state ?? "",
    });
    setShowEmail(p.show_email ?? false);
    setShowPhone(p.show_phone ?? false);
    setShowLinks(p.show_links ?? true);
  }, [reset]);

  useEffect(() => {
    if (roleProfile && profile?.role === "ELDER") {
      setShareMedicalInfo((roleProfile as any).share_medical_info ?? false);
    }
  }, [roleProfile, profile?.role]);

  useEffect(() => {
    if (profile && isOwnProfile) syncForm(profile);
  }, [profile, isOwnProfile, syncForm]);

  // Avatar cleanup
  const lastAvatarRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const serverAvatar = profile?.avatar;
    if (avatarPreview && serverAvatar && serverAvatar !== lastAvatarRef.current) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    lastAvatarRef.current = serverAvatar;
  }, [profile?.avatar, avatarPreview]);
  useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); }, []); // eslint-disable-line

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
    setAvatarError(null);
    setAvatarFile(null);
    if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); }
    if (profile) syncForm(profile);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) { setAvatarError("Formato inválido. Use JPG, PNG ou WebP."); return; }
    if (file.size > AVATAR_MAX_MB * 1024 * 1024) { setAvatarError(`Máximo ${AVATAR_MAX_MB}MB.`); return; }
    setAvatarError(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCepBlur = async (maskedCep: string) => {
    setCepLoading(true);
    try {
      const result = await fetchAddressByCep(maskedCep);
      if (result) {
        setValue("address_line", result.logradouro, { shouldValidate: true });
        setValue("city",         result.localidade, { shouldValidate: true });
        setValue("state",        result.uf,         { shouldValidate: true });
      }
    } catch { /* user fills manually */ } finally { setCepLoading(false); }
  };

  const onSubmit = useCallback(async (data: EditForm) => {
    setSaveError(null);
    setIsSaving(true);
    const street = data.address_line?.trim();
    const num    = data.number?.trim();
    const comp   = data.complement?.trim();
    let addressLine: string | undefined;
    if (street && num) addressLine = comp ? `${street}, ${num} - ${comp}` : `${street}, ${num}`;
    else if (street)   addressLine = street;

    try {
      if (profile?.role === "ELDER") {
        roleProfileRef.current?.patchValues({ share_medical_info: shareMedicalInfo });
      }
      await Promise.all([
        updateProfileAsync({
          full_name:    data.full_name,
          phone:        data.phone?.replace(/\D/g, "") || undefined,
          zip_code:     data.zip_code?.replace(/\D/g, "") || undefined,
          address_line: addressLine,
          city:         data.city || undefined,
          state:        data.state || undefined,
          show_email:   showEmail,
          show_phone:   showPhone,
          show_links:   showLinks,
          ...(avatarFile ? { avatar: avatarFile } : {}),
        }),
        roleProfileRef.current?.submit() ?? Promise.resolve(),
      ]);
      setIsEditing(false);
      setAvatarFile(null);
    } catch (err) {
      setSaveError(resolveApiError(err as Error, "Erro ao salvar perfil."));
    } finally {
      setIsSaving(false);
    }
  }, [updateProfileAsync, avatarFile, showEmail, showPhone, showLinks]); // eslint-disable-line

  // Hooks must be called before any conditional returns
  const isLinked = !isOwnProfile && links.some(l => l.other_party_id === currentUser?.id && l.status === "ACTIVE");
  const elderProfileIdForRecord = (!isOwnProfile && publicUser?.role === "ELDER" && isLinked)
    ? (publicUser?.elder_profile_id ?? null)
    : null;
  const { data: medicalRecord, isLoading: medicalLoading } = useElderMedicalRecord(
    elderProfileIdForRecord,
    showMedicalModal,
  );

  const isLoading = isOwnProfile ? ownLoading : publicLoading;
  if (isLoading) return <ProfileSkeleton />;

  // Normalized display data
  const name       = isOwnProfile ? (profile?.full_name ?? "") : (publicUser?.full_name ?? "Usuário");
  const role       = isOwnProfile ? (profile?.role ?? "") : (publicUser?.role ?? "");
  const avatarSrc  = isOwnProfile ? (avatarPreview ?? profile?.avatar) : publicUser?.avatar;
  const roleLabel  = ROLE_LABELS[role] ?? role;
  const roleStyle  = getRoleStyle(role);
  const initials   = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  const location   = isOwnProfile
    ? [profile?.city, profile?.state].filter(Boolean).join(", ")
    : [publicUser?.city, publicUser?.state].filter(Boolean).join(", ");
  const isVerified = isOwnProfile ? (profile?.is_verified ?? false) : false;
  const activeLinks = links.filter((l) => l.status === "ACTIVE");

  const currentLinkType  = currentUser?.role ? ROLE_TO_LINK_TYPE[currentUser.role] : undefined;
  const canRequestLink   = !!(role === "ELDER" && currentLinkType && !isOwnProfile && publicUser?.elder_profile_id);
  const existingLink     = publicUser?.elder_profile_id
    ? myLinks.find((l) => l.elder_id === publicUser.elder_profile_id)
    : undefined;
  const linkButtonStatus = existingLink?.status;
  const canViewMedical   = !isOwnProfile && role === "ELDER" && isLinked && !!publicUser?.elder_profile_id;

  // Profile about data (dict of role-specific info for display)
  const aboutProfile: Record<string, any> = isOwnProfile
    ? derivePublicProfile(role, roleProfile)
    : (publicUser?.profile ?? {});

  // Contact info visible in public view
  const publicEmail = publicUser?.email ?? null;
  const publicPhone = publicUser?.phone ?? null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-5">

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {/* Role-colored gradient banner */}
        <div
          className="h-28"
          style={{
            background: `linear-gradient(135deg, ${roleStyle.lightBg} 0%, ${roleStyle.color}55 60%, ${roleStyle.color}22 100%)`,
          }}
        />
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-3 relative w-20 h-20 flex-shrink-0">
            {/* Avatar frame */}
            <div
              className="w-full h-full rounded-2xl p-[3px] shadow-lg"
              style={{ background: `linear-gradient(135deg, ${roleStyle.color}, ${roleStyle.lightBg})` }}
            >
              <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-2xl"
                    style={{ background: roleStyle.lightBg, color: roleStyle.color }}
                  >
                    {initials || "?"}
                  </div>
                )}
              </div>
            </div>

            {/* Avatar edit overlay (own profile, editing) */}
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Alterar foto de perfil"
                  className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera size={18} className="text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  tabIndex={-1}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                >
                  <Camera size={13} className="text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          {avatarError && <p className="text-xs text-red-500 font-medium mb-2">{avatarError}</p>}

          {/* Name, badges, actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text leading-tight">{name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: roleStyle.lightBg }}
                >
                  <Briefcase size={12} style={{ color: roleStyle.color }} />
                  <span className="text-xs font-bold" style={{ color: roleStyle.textColor }}>{roleLabel}</span>
                </div>
                {isOwnProfile && (
                  isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-bold border border-green-100">
                      <Check size={11} />Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-600 text-xs font-bold border border-yellow-100">
                      <ShieldAlert size={11} />Não verificado
                    </span>
                  )
                )}
                {location && (
                  <span className="inline-flex items-center gap-1 text-xs text-text/40 font-medium">
                    <MapPin size={11} />{location}
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-text/35 font-medium">
                <Link2 size={11} />
                {activeLinks.length} vínculo{activeLinks.length !== 1 ? "s" : ""} ativo{activeLinks.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Action buttons */}
            <div className="self-start flex items-center gap-2">
              {isOwnProfile && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-text/70 hover:bg-gray-50 hover:border-primary/30 hover:text-primary transition-all"
                >
                  <Pencil size={14} />
                  Editar perfil
                </button>
              )}
              {isOwnProfile && isEditing && (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-text/60 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <X size={14} />Cancelar
                  </button>
                  <button
                    form="profile-edit-form"
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Salvar
                  </button>
                </>
              )}
              {canViewMedical && (
                <button
                  onClick={() => setShowMedicalModal(true)}
                  className="flex items-center gap-2 px-5 h-10 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 transition-colors"
                >
                  <Stethoscope size={15} />
                  Ver ficha médica
                </button>
              )}
              {canRequestLink && (
                <LinkRequestButton
                  status={linkButtonStatus}
                  onClick={() => setShowLinkModal(true)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit panel (own profile, editing mode) ────────────────────── */}
      {isOwnProfile && isEditing && (
        <form id="profile-edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {saveError && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium bg-red-50 text-red-600 border border-red-100">
              {saveError}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Personal data */}
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-4">
              <SectionHeader icon={<ShieldCheck size={15} />} label="Dados pessoais" />

              <EditField label="Nome completo" error={errors.full_name?.message}>
                <input {...register("full_name")} className={inputCls} placeholder="Nome completo" />
              </EditField>

              <ReadField label="E-mail" icon={<Mail size={13} className="text-text/40" />} value={profile?.email ?? ""} />

              <EditField label="Telefone" error={errors.phone?.message}>
                <input
                  {...register("phone")}
                  className={inputCls}
                  placeholder="(00) 00000-0000"
                  onChange={(e) => setValue("phone", maskPhone(e.target.value), { shouldValidate: true })}
                />
              </EditField>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-4">
              <SectionHeader icon={<MapPin size={15} />} label="Endereço" />

              <EditField label="CEP" error={errors.zip_code?.message}>
                <div className="relative">
                  <input
                    {...register("zip_code")}
                    className={inputCls}
                    placeholder="00000-000"
                    onChange={(e) => setValue("zip_code", maskCEP(e.target.value), { shouldValidate: true })}
                    onBlur={(e) => handleCepBlur(e.target.value)}
                  />
                  {cepLoading && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" />
                  )}
                </div>
              </EditField>

              <div className="grid grid-cols-[1fr_88px] gap-3">
                <EditField label="Logradouro" error={errors.address_line?.message}>
                  <input {...register("address_line")} className={inputCls} placeholder="Rua, avenida..."
                    value={watch("address_line") ?? ""} onChange={(e) => setValue("address_line", e.target.value)} />
                </EditField>
                <EditField label="Número" error={errors.number?.message}>
                  <input {...register("number")} className={inputCls} placeholder="42" />
                </EditField>
              </div>

              <EditField label="Complemento (opcional)">
                <input {...register("complement")} className={inputCls} placeholder="Apto 12, bloco B..." />
              </EditField>

              <div className="grid grid-cols-[1fr_72px] gap-3">
                <EditField label="Cidade" error={errors.city?.message}>
                  <input {...register("city")} className={inputCls} placeholder="Cidade"
                    value={watch("city") ?? ""} onChange={(e) => setValue("city", e.target.value)} />
                </EditField>
                <EditField label="UF" error={errors.state?.message}>
                  <input {...register("state")} className={`${inputCls} w-full`} placeholder="SP" maxLength={2}
                    value={watch("state") ?? ""} onChange={(e) => setValue("state", e.target.value.toUpperCase())} />
                </EditField>
              </div>
            </div>
          </div>

          {/* Privacy settings */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-4">
            <SectionHeader icon={<Eye size={15} />} label="Privacidade" />
            <p className="text-[12px] text-text/45 font-medium -mt-1">
              Escolha o que fica visível no seu perfil público. A quantidade de vínculos é sempre exibida.
            </p>

            <div className="space-y-3 divide-y divide-border/30">
              <PrivacyToggle
                icon={<Mail size={14} />}
                label="Compartilhar e-mail"
                value={profile?.email ?? "—"}
                checked={showEmail}
                onChange={setShowEmail}
              />
              <PrivacyToggle
                icon={<Phone size={14} />}
                label="Compartilhar telefone"
                value={profile?.phone ? maskPhone(profile.phone) : "Não cadastrado"}
                checked={showPhone}
                onChange={setShowPhone}
                disabled={!profile?.phone}
              />
              <PrivacyToggle
                icon={<Link2 size={14} />}
                label="Mostrar lista de vínculos"
                value={`${activeLinks.length} vínculo${activeLinks.length !== 1 ? "s" : ""} ativo${activeLinks.length !== 1 ? "s" : ""}`}
                checked={showLinks}
                onChange={setShowLinks}
              />
              {profile?.role === "ELDER" && (
                <PrivacyToggle
                  icon={<Stethoscope size={14} />}
                  label="Compartilhar ficha médica"
                  value="Condições, alergias e medicamentos"
                  checked={shareMedicalInfo}
                  onChange={setShareMedicalInfo}
                />
              )}
            </div>
          </div>

          {/* Role-specific profile */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-4">
            <SectionHeader icon={<Briefcase size={15} />} label={`Perfil de ${roleLabel}`} />
            {profile?.role && (
              <RoleProfileSection ref={roleProfileRef} role={profile.role} isEditing={true} />
            )}
          </div>
        </form>
      )}

      {/* ── Main content: sidebar + posts ─────────────────────────────── */}
      {!isEditing && <div className="grid md:grid-cols-[280px_1fr] gap-5 items-start">

        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* About / Sobre */}
          <AboutSection
            role={role}
            roleStyle={roleStyle}
            profile={aboutProfile}
            ownEmail={isOwnProfile ? profile?.email : undefined}
            ownPhone={isOwnProfile && profile?.phone ? maskPhone(profile.phone) : undefined}
            publicEmail={publicEmail ? publicEmail : undefined}
            publicPhone={publicPhone ? maskPhone(publicPhone) : undefined}
            isOwnProfile={isOwnProfile}
          />

          {/* Vínculos */}
          <section className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-text/40 mb-4 flex items-center gap-1.5">
              <Link2 size={11} />Vínculos
            </h2>
            {!isOwnProfile && publicUser?.show_links === false ? (
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <Shield size={20} className="text-text/20" />
                <p className="text-[12px] text-text/40 font-medium">Os vínculos deste perfil são privados.</p>
              </div>
            ) : linksLoading ? (
              <div className="animate-pulse space-y-2">
                {[0, 1].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
              </div>
            ) : links.filter((l) => l.status === "ACTIVE" || l.status === "PENDING").length === 0 ? (
              <p className="text-[12px] text-text/40 font-medium">Nenhum vínculo ainda.</p>
            ) : (
              <div className="space-y-2">
                {links
                  .filter((l) => l.status === "ACTIVE" || l.status === "PENDING")
                  .map((link) => <PublicLinkCard key={link.id} link={link} />)}
              </div>
            )}
          </section>
        </div>

        {/* ── Posts ─────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-text/40 flex items-center gap-1.5 px-1">
            <MessageSquare size={11} />Publicações
          </h2>

          {postsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[0, 1].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <MessageSquare size={20} className="text-gray-400" />
              </div>
              <p className="text-sm text-text/50 font-medium">Nenhuma publicação ainda.</p>
            </div>
          ) : (
            posts.map((post) => (
              <FeedItem key={post.id} post={post} />
            ))
          )}
        </div>
      </div>}

      {/* ── Medical record modal ─────────────────────────────────────── */}
      {showMedicalModal && (
        <ElderMedicalRecordModal
          elderName={publicUser?.full_name ?? ""}
          record={medicalRecord ?? null}
          isLoading={medicalLoading}
          onClose={() => setShowMedicalModal(false)}
        />
      )}

      {/* ── Request link modal ────────────────────────────────────────── */}
      {showLinkModal && publicUser && (
        <RequestLinkModal
          elderName={publicUser.full_name}
          elderProfileId={publicUser.elder_profile_id!}
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
      <div className="flex items-center gap-2 px-5 h-10 rounded-xl bg-green-50 text-green-700 text-sm font-bold border border-green-200 flex-shrink-0 cursor-default">
        <Check size={15} />
        Conectado
      </div>
    );
  }
  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-2 px-5 h-10 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold border border-amber-200 flex-shrink-0 cursor-default">
        <Clock size={15} />
        Vínculo solicitado
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
    >
      <Link2 size={15} />
      Solicitar vínculo
    </button>
  );
};

// ─── derivePublicProfile ──────────────────────────────────────────────────────

function derivePublicProfile(role: string, rp: any): Record<string, any> {
  if (!rp) return {};
  switch (role) {
    case "CAREGIVER":
      return {
        bio: rp.bio, experience_years: rp.experience_years,
        is_available: rp.is_available,
        care_types: rp.care_types ?? [],
        city: rp.city, state: rp.state,
      };
    case "PROFESSIONAL":
      return {
        profession: rp.profession,
        profession_other: rp.profession_other || null,
        council: rp.council || null,
        license_number: rp.license_number || null,
        bio: rp.bio,
        service_mode: rp.service_mode, hourly_rate: rp.hourly_rate,
        is_available: rp.is_available,
        city: rp.city, state: rp.state,
      };
    case "INSTITUTION":
      return {
        legal_name: rp.legal_name, trade_name: rp.trade_name,
        institution_type: rp.institution_type,
        capacity: rp.capacity, website: rp.website,
      };
    case "GUARDIAN":
      return { relationship: rp.relationship, is_legal_guardian: rp.is_legal_guardian };
    case "ELDER": {
      const elder: Record<string, any> = { preferred_name: rp.preferred_name };
      if (rp.share_medical_info) {
        elder.share_medical_info = true;
        elder.medical_conditions  = rp.medical_conditions  || null;
        elder.allergies           = rp.allergies           || null;
        elder.medications         = rp.medications         || null;
      }
      return elder;
    }
    default:
      return {};
  }
}

// ─── AboutSection ─────────────────────────────────────────────────────────────

interface AboutSectionProps {
  role: string;
  roleStyle: RoleStyle;
  profile: Record<string, any>;
  ownEmail?: string;
  ownPhone?: string;
  publicEmail?: string;
  publicPhone?: string;
  isOwnProfile: boolean;
}

const AboutSection = ({
  role, roleStyle, profile,
  ownEmail, ownPhone, publicEmail, publicPhone, isOwnProfile,
}: AboutSectionProps) => {
  const hasProfile = Object.values(profile).some(
    (v) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  );

  const showContact = isOwnProfile ? !!(ownEmail || ownPhone) : !!(publicEmail || publicPhone);
  if (!hasProfile && !showContact) return null;

  return (
    <section className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: roleStyle.color }} />
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-text/40">Sobre</h2>
      </div>

      {/* Role-specific profile details */}
      {hasProfile && <ProfileDetails role={role} profile={profile} roleStyle={roleStyle} />}

      {/* Contact info */}
      {showContact && (
        <>
          {hasProfile && <div className="h-px bg-border/30" />}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text/35">Contato</p>
            {(isOwnProfile ? ownEmail : publicEmail) && (
              <AboutInfoRow
                icon={<Mail size={13} />}
                label="E-mail"
                value={isOwnProfile ? ownEmail! : publicEmail!}
                roleStyle={roleStyle}
              />
            )}
            {(isOwnProfile ? ownPhone : publicPhone) && (
              <AboutInfoRow
                icon={<Phone size={13} />}
                label="Telefone"
                value={isOwnProfile ? ownPhone! : publicPhone!}
                roleStyle={roleStyle}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
};

// ─── ProfileDetails ───────────────────────────────────────────────────────────

const ProfileDetails = ({ role, profile, roleStyle }: { role: string; profile: Record<string, any>; roleStyle: RoleStyle }) => {
  if (role === "CAREGIVER") return (
    <div className="space-y-4">
      {profile.bio && (
        <p className="text-[13px] text-text/70 font-medium leading-relaxed">{profile.bio}</p>
      )}
      <div className="space-y-2.5">
        {profile.experience_years != null && (
          <AboutInfoRow icon={<Star size={13} />} label="Experiência" value={`${profile.experience_years} anos`} roleStyle={roleStyle} />
        )}
        {profile.is_available != null && (
          <AboutInfoRow
            icon={profile.is_available ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            label="Disponibilidade"
            value={profile.is_available ? "Disponível" : "Indisponível"}
            valueClass={profile.is_available ? "text-green-600 font-bold" : "text-text/45"}
            roleStyle={roleStyle}
            iconBg={profile.is_available ? "#f0fdf4" : undefined}
            iconColor={profile.is_available ? "#16a34a" : undefined}
          />
        )}
        {profile.care_types?.length > 0 && (
          <div className="pt-1">
            <p className="text-[10px] font-bold text-text/35 uppercase tracking-wider mb-2">Tipos de atendimento</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.care_types.map((t: string) => (
                <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                  style={{ background: roleStyle.lightBg, color: roleStyle.textColor }}>
                  {CARE_TYPE_LABELS[t] ?? t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (role === "PROFESSIONAL") {
    const professionLabel =
      profile.profession === "OTHER"
        ? (profile.profession_other || "Outro")
        : (PROFESSION_LABELS[profile.profession] ?? profile.profession);
    return (
      <div className="space-y-4">
        {profile.profession && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: roleStyle.lightBg }}>
              <Stethoscope size={14} style={{ color: roleStyle.color }} />
            </div>
            <p className="text-[14px] font-bold text-text/80">{professionLabel}</p>
          </div>
        )}
        {profile.bio && <p className="text-[13px] text-text/70 font-medium leading-relaxed">{profile.bio}</p>}
        <div className="space-y-2.5">
          {(profile.council || profile.license_number) && (
            <AboutInfoRow
              icon={<Stethoscope size={13} />}
              label="Registro"
              value={[profile.council, profile.license_number].filter(Boolean).join(": ")}
              roleStyle={roleStyle}
            />
          )}
          {profile.service_mode && (
            <AboutInfoRow icon={<Home size={13} />} label="Atendimento" value={SERVICE_MODE_LABELS[profile.service_mode] ?? profile.service_mode} roleStyle={roleStyle} />
          )}
          {profile.hourly_rate && (
            <AboutInfoRow icon={<span className="text-[11px] font-black">R$</span>} label="Valor/hora" value={`R$ ${profile.hourly_rate}`} roleStyle={roleStyle} />
          )}
          {profile.is_available != null && (
            <AboutInfoRow
              icon={profile.is_available ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              label="Disponibilidade"
              value={profile.is_available ? "Disponível" : "Indisponível"}
              valueClass={profile.is_available ? "text-green-600 font-bold" : "text-text/45"}
              roleStyle={roleStyle}
              iconBg={profile.is_available ? "#f0fdf4" : undefined}
              iconColor={profile.is_available ? "#16a34a" : undefined}
            />
          )}
        </div>
      </div>
    );
  }

  if (role === "INSTITUTION") return (
    <div className="space-y-3">
      {(profile.trade_name || profile.legal_name) && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: roleStyle.lightBg }}>
            <Building2 size={14} style={{ color: roleStyle.color }} />
          </div>
          <p className="text-[14px] font-bold text-text/80">{profile.trade_name || profile.legal_name}</p>
        </div>
      )}
      <div className="space-y-2.5">
        {profile.institution_type && (
          <AboutInfoRow icon={<Briefcase size={13} />} label="Tipo" value={INSTITUTION_TYPE_LABELS[profile.institution_type] ?? profile.institution_type} roleStyle={roleStyle} />
        )}
        {profile.capacity != null && (
          <AboutInfoRow icon={<ShieldCheck size={13} />} label="Capacidade" value={`${profile.capacity} vagas`} roleStyle={roleStyle} />
        )}
        {profile.website && (
          <a href={profile.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-[12px] font-bold text-primary hover:underline break-all">
            <Link2 size={12} />{profile.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>
    </div>
  );

  if (role === "GUARDIAN") return (
    <div className="space-y-2.5">
      {profile.relationship && (
        <AboutInfoRow icon={<Shield size={13} />} label="Parentesco" value={RELATION_LABELS[profile.relationship] ?? profile.relationship} roleStyle={roleStyle} />
      )}
      {profile.is_legal_guardian && (
        <AboutInfoRow icon={<CheckCircle2 size={13} />} label="Responsável legal" value="Sim" roleStyle={roleStyle} iconBg="#f0fdf4" iconColor="#16a34a" />
      )}
    </div>
  );

  if (role === "ELDER") {
    const hasMedical = profile.share_medical_info && (profile.medical_conditions || profile.allergies || profile.medications);
    if (!profile.preferred_name && !hasMedical) return null;
    return (
      <div className="space-y-4">
        {profile.preferred_name && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-text/35 uppercase tracking-widest">Identificação</p>
            <AboutInfoRow icon={<Heart size={13} />} label="Nome preferido" value={profile.preferred_name} roleStyle={roleStyle} />
          </div>
        )}
        {hasMedical && (
          <>
            {profile.preferred_name && <div className="h-px bg-border/30" />}
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-text/35 uppercase tracking-widest">Ficha médica</p>
              {profile.medical_conditions && (
                <AboutInfoRow icon={<Stethoscope size={13} />} label="Condições médicas" value={profile.medical_conditions} roleStyle={roleStyle} />
              )}
              {profile.allergies && (
                <AboutInfoRow icon={<ShieldAlert size={13} />} label="Alergias" value={profile.allergies} roleStyle={roleStyle} />
              )}
              {profile.medications && (
                <AboutInfoRow icon={<span className="text-[10px] font-black leading-none">Rx</span>} label="Medicamentos" value={profile.medications} roleStyle={roleStyle} />
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

// ─── AboutInfoRow ──────────────────────────────────────────────────────────────

interface AboutInfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  roleStyle: RoleStyle;
  iconBg?: string;
  iconColor?: string;
}

const AboutInfoRow = ({ icon, label, value, valueClass, roleStyle, iconBg, iconColor }: AboutInfoRowProps) => (
  <div className="flex items-center gap-3">
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: iconBg ?? roleStyle.lightBg, color: iconColor ?? roleStyle.color }}
    >
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-bold text-text/35 uppercase tracking-widest leading-none">{label}</p>
      <p className={`text-[12px] font-semibold mt-0.5 ${valueClass ?? "text-text/70"}`}>{value}</p>
    </div>
  </div>
);

// ─── PublicLinkCard ───────────────────────────────────────────────────────────

const PublicLinkCard = ({ link }: { link: LinkType }) => {
  const type   = LINK_TYPE_CONFIG[link.link_type];
  const status = STATUS_CONFIG[link.status];
  const Icon   = type.Icon;
  const StatusIcon = status.icon;
  const initials = link.other_party_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-gray-50/50 transition-all">
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

const RequestLinkModal = ({ elderName, elderProfileId, linkType, onClose }: {
  elderName: string; elderProfileId: number;
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

// ─── PrivacyToggle ────────────────────────────────────────────────────────────

const PrivacyToggle = ({ icon, label, value, checked, onChange, disabled }: {
  icon: React.ReactNode; label: string; value: string;
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 pt-3 first:pt-0">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-text/40">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-text/80">{label}</p>
        <p className="text-[11px] text-text/40 font-medium truncate">{value}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-[11px] font-bold text-text/35">
        {disabled ? "—" : checked ? "Público" : "Privado"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
          checked && !disabled ? "bg-primary" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked && !disabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  </div>
);

// ─── Edit form sub-components ─────────────────────────────────────────────────

const inputCls = "w-full h-10 px-3 rounded-xl border border-border/60 text-sm text-text bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all outline-none";

const SectionHeader = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 text-text/50 pb-1 border-b border-border/30">
    {icon}
    <h3 className="text-[11px] font-bold uppercase tracking-widest">{label}</h3>
  </div>
);

const EditField = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-text/40 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const ReadField = ({ label, icon, value }: { label: string; icon?: React.ReactNode; value: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-text/40 uppercase tracking-wide">{label}</p>
    <div className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-gray-50 border border-border/30 text-sm font-medium text-text/50">
      {icon}{value || "—"}
    </div>
  </div>
);

// ─── ElderMedicalRecordModal ──────────────────────────────────────────────────

function MedicalRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-text/40 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-bold text-text/35 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-[13px] font-semibold text-text/75 mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}

function MedicalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-text/30 uppercase tracking-widest pb-2 border-b border-border/30">{title}</p>
      {children}
    </div>
  );
}

function formatBirthDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const ElderMedicalRecordModal = ({
  elderName, record, isLoading, onClose,
}: {
  elderName: string;
  record: ElderMedicalRecord | null;
  isLoading: boolean;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-border/30 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Stethoscope size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-text">Ficha médica completa</h2>
          <p className="text-xs text-text/50 font-medium truncate">{elderName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-text/40 hover:text-text/70 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 p-5 space-y-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
          </div>
        ) : !record ? (
          <p className="text-sm text-text/50 text-center py-6">Não foi possível carregar a ficha médica.</p>
        ) : (
          <>
            {/* Informações pessoais */}
            <MedicalSection title="Informações pessoais">
              {record.preferred_name && <MedicalRow icon={<Heart size={13} />} label="Nome preferido" value={record.preferred_name} />}
              <MedicalRow icon={<span className="text-[10px] font-black">DN</span>} label="Data de nascimento" value={formatBirthDate(record.birth_date)} />
              <MedicalRow icon={<ShieldCheck size={13} />} label="Gênero" value={record.gender_display} />
            </MedicalSection>

            {/* Mobilidade e cognição */}
            <MedicalSection title="Saúde e mobilidade">
              <MedicalRow icon={<MapPin size={13} />} label="Mobilidade" value={record.mobility_display} />
              <MedicalRow icon={<Stethoscope size={13} />} label="Estado cognitivo" value={record.cognitive_display} />
              <div className="flex flex-wrap gap-2 mt-1">
                {record.has_fall_risk && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-100">
                    <ShieldAlert size={11} /> Risco de queda
                  </span>
                )}
                {record.needs_medication_support && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                    <span className="text-[10px] font-black">Rx</span> Auxílio com medicação
                  </span>
                )}
                {record.requires_24h_care && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[11px] font-bold border border-red-100">
                    <Clock size={11} /> Cuidado 24h
                  </span>
                )}
                {!record.has_fall_risk && !record.needs_medication_support && !record.requires_24h_care && (
                  <span className="text-[12px] text-text/40 font-medium">Nenhuma necessidade especial registrada.</span>
                )}
              </div>
            </MedicalSection>

            {/* Ficha médica */}
            {(record.medical_conditions || record.allergies || record.medications || record.medical_notes) && (
              <MedicalSection title="Ficha médica">
                {record.medical_conditions && <MedicalRow icon={<Stethoscope size={13} />} label="Condições médicas" value={record.medical_conditions} />}
                {record.allergies && <MedicalRow icon={<ShieldAlert size={13} />} label="Alergias" value={record.allergies} />}
                {record.medications && <MedicalRow icon={<span className="text-[10px] font-black">Rx</span>} label="Medicamentos em uso" value={record.medications} />}
                {record.medical_notes && <MedicalRow icon={<MessageSquare size={13} />} label="Observações médicas" value={record.medical_notes} />}
              </MedicalSection>
            )}

            {/* Contato de emergência */}
            {(record.emergency_contact_name || record.emergency_contact_phone) && (
              <MedicalSection title="Contato de emergência">
                {record.emergency_contact_name && <MedicalRow icon={<Phone size={13} />} label="Nome" value={record.emergency_contact_name} />}
                {record.emergency_contact_phone && <MedicalRow icon={<Phone size={13} />} label="Telefone" value={record.emergency_contact_phone} />}
                {record.emergency_contact_relationship && <MedicalRow icon={<Heart size={13} />} label="Parentesco" value={record.emergency_contact_relationship} />}
              </MedicalSection>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border/30 flex-shrink-0">
        <p className="text-[11px] text-text/35 text-center font-medium">
          Informações confidenciais — compartilhadas apenas com vínculos ativos
        </p>
      </div>
    </div>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ProfileSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-5 animate-pulse">
    <div className="h-5 w-20 bg-gray-200 rounded-lg" />
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="h-28 bg-gray-100" />
      <div className="px-6 pb-6">
        <div className="-mt-10 mb-3 w-20 h-20 rounded-2xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-6 w-44 bg-gray-200 rounded-lg" />
          <div className="h-4 w-28 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
    <div className="grid md:grid-cols-[280px_1fr] gap-5">
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-8 bg-gray-100 rounded-lg" />)}
        </div>
      </div>
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
