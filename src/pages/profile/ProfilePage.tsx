import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Pencil,
  X,
  Check,
  Loader2,
  Camera,
} from "lucide-react";

import { useProfile } from "@/hooks/useProfile";
import { ROLE_LABELS } from "@/constants/roles";
import { RoleProfileSection, type RoleProfileRef } from "@/components/profile/RoleProfileSection";

// Parses "Rua das Flores, 42 - Apto 10" → { street, number, complement }
function parseAddressLine(raw: string) {
  if (!raw) return { street: "", number: "", complement: "" };
  const [mainPart, complement = ""] = raw.split(" - ");
  const lastComma = mainPart.lastIndexOf(", ");
  if (lastComma === -1) return { street: mainPart, number: "", complement };
  return {
    street:     mainPart.slice(0, lastComma),
    number:     mainPart.slice(lastComma + 2),
    complement,
  };
}
import { resolveApiError } from "@/utils/apiError";
import { maskPhone, maskCEP } from "@/utils/masks";
import { fetchAddressByCep } from "@/utils/viaCep";
import type { User } from "@/types";

// ─── Schema ──────────────────────────────────────────────────────────────────

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

// ─── Page ────────────────────────────────────────────────────────────────────

const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_MAX_MB = 5;

export const ProfilePage = () => {
  const { profile, isLoading, updateProfileAsync, updateError } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving]     = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const roleProfileRef = useRef<RoleProfileRef>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  useEffect(() => {
    if (profile) syncForm(profile);
  }, [profile]);

  const syncForm = (p: User) => {
    const { street, number, complement } = parseAddressLine(p.address_line ?? "");
    reset({
      full_name:    p.full_name ?? "",
      phone:        p.phone ? maskPhone(p.phone) : "",
      zip_code:     p.zip_code ? maskCEP(p.zip_code) : "",
      address_line: street,
      number,
      complement,
      city:         p.city ?? "",
      state:        p.state ?? "",
    });
  };

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
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      setAvatarError("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }
    if (file.size > AVATAR_MAX_MB * 1024 * 1024) {
      setAvatarError(`Arquivo muito grande. Máximo ${AVATAR_MAX_MB}MB.`);
      return;
    }
    setAvatarError(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Once profile refetches and returns a real avatar URL, discard the local preview
  const lastProfileAvatarRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const serverAvatar = profile?.avatar;
    if (
      avatarPreview &&
      serverAvatar &&
      serverAvatar !== lastProfileAvatarRef.current
    ) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    lastProfileAvatarRef.current = serverAvatar;
  }, [profile?.avatar]);

  useEffect(() => {
    return () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCepBlur = async (maskedCep: string) => {
    setCepLoading(true);
    try {
      const result = await fetchAddressByCep(maskedCep);
      if (result) {
        setValue("address_line", result.logradouro, { shouldValidate: true });
        setValue("city",         result.localidade, { shouldValidate: true });
        setValue("state",        result.uf,         { shouldValidate: true });
      }
    } catch {
      // Non-fatal — user can fill manually
    } finally {
      setCepLoading(false);
    }
  };

  const onSubmit = useCallback(async (data: EditForm) => {
    setSaveError(null);
    setIsSaving(true);

    const street = data.address_line?.trim();
    const num    = data.number?.trim();
    const comp   = data.complement?.trim();

    let addressLine: string | undefined;
    if (street && num) {
      addressLine = comp ? `${street}, ${num} - ${comp}` : `${street}, ${num}`;
    } else if (street) {
      addressLine = street;
    }

    try {
      await Promise.all([
        updateProfileAsync({
          full_name:    data.full_name,
          phone:        data.phone?.replace(/\D/g, "") || undefined,
          zip_code:     data.zip_code?.replace(/\D/g, "") || undefined,
          address_line: addressLine,
          city:         data.city || undefined,
          state:        data.state || undefined,
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
  }, [updateProfileAsync, avatarFile]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <ProfileSkeleton />;
  if (!profile)  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <ShieldAlert size={28} className="text-red-400" />
      </div>
      <div>
        <p className="font-bold text-text text-base">Não foi possível carregar o perfil</p>
        <p className="text-sm text-text/50 font-medium mt-1 max-w-xs">
          Verifique sua conexão ou tente recarregar a página.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
      >
        Recarregar
      </button>
    </div>
  );

  const initial   = profile.full_name?.charAt(0).toUpperCase() ?? "U";
  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role;
  const errorMsg  = saveError;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-primary/80 to-blue/80" />

          {/* Content area — entirely in white */}
          <div className="px-6 pb-6">
            {/* Avatar — pulled up to straddle the gradient */}
            <div className="-mt-10 mb-3 relative w-20 h-20 flex-shrink-0">
              <div className="w-full h-full rounded-2xl bg-white p-1 shadow-lg">
                {(avatarPreview ?? profile.avatar) ? (
                  <img
                    src={avatarPreview ?? profile.avatar}
                    alt={profile.full_name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-2xl border border-primary/10">
                    {initial}
                  </div>
                )}
              </div>

              {isEditing && (
                <>
                  {/* Hover overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Alterar foto de perfil"
                    className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera size={18} className="text-white" />
                  </button>

                  {/* Always-visible badge */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Alterar foto de perfil"
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

            {isEditing && !avatarError && (
              <p className="text-[11px] text-text/40 font-medium mt-0.5 mb-0.5">Clique na foto para alterar</p>
            )}
            {avatarError && (
              <p className="text-xs text-red-500 font-medium mt-0.5 mb-0.5">{avatarError}</p>
            )}

            {/* Name + badges + action buttons — all in the white section */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-text leading-tight">
                  {profile.full_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-light text-primary text-xs font-bold border border-primary/10">
                    <ShieldCheck size={11} />
                    {roleLabel}
                  </span>
                  {profile.is_verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-bold border border-green-100">
                      <Check size={11} />
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold border border-yellow-100">
                      <ShieldAlert size={11} />
                      Não verificado
                    </span>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-text/70 hover:bg-gray-50 hover:text-text transition-colors"
                >
                  <Pencil size={15} />
                  Editar perfil
                </button>
              ) : (
                <div className="self-start flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-text/60 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <X size={15} />
                    Cancelar
                  </button>
                  <button
                    form="profile-form"
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSaving
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Check size={15} />
                    }
                    Salvar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Error banner ──────────────────────────────────────────────── */}
        {errorMsg && (
          <div className="rounded-xl px-4 py-3 text-sm font-medium bg-red-50 text-red-600 border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">

            {/* Dados pessoais */}
            <section className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
              <SectionTitle icon={<UserIcon size={16} />} label="Dados pessoais" />

              <FieldRow
                label="Nome completo"
                value={profile.full_name}
                isEditing={isEditing}
                error={errors.full_name?.message}
                input={
                  <input
                    {...register("full_name")}
                    className={inputCls}
                    placeholder="Nome completo"
                  />
                }
              />

              <FieldRow
                label="E-mail"
                icon={<Mail size={14} className="text-text/40" />}
                value={profile.email}
                isEditing={isEditing}
                readOnly
              />

              <FieldRow
                label="Telefone"
                icon={<Phone size={14} className="text-text/40" />}
                value={profile.phone ? maskPhone(profile.phone) : "—"}
                isEditing={isEditing}
                error={errors.phone?.message}
                input={
                  <input
                    {...register("phone")}
                    className={inputCls}
                    placeholder="(00) 00000-0000"
                    onChange={(e) =>
                      setValue("phone", maskPhone(e.target.value), { shouldValidate: true })
                    }
                  />
                }
              />
            </section>

            {/* Endereço */}
            <section className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
              <SectionTitle icon={<MapPin size={16} />} label="Endereço" />

              {/* CEP */}
              <FieldRow
                label="CEP"
                value={profile.zip_code ? maskCEP(profile.zip_code) : "—"}
                isEditing={isEditing}
                error={errors.zip_code?.message}
                input={
                  <div className="relative">
                    <input
                      {...register("zip_code")}
                      className={inputCls}
                      placeholder="00000-000"
                      onChange={(e) =>
                        setValue("zip_code", maskCEP(e.target.value), { shouldValidate: true })
                      }
                      onBlur={(e) => handleCepBlur(e.target.value)}
                    />
                    {cepLoading && (
                      <Loader2
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary"
                      />
                    )}
                  </div>
                }
              />

              {/* Logradouro + Número */}
              {isEditing ? (
                <div className="grid grid-cols-[1fr_88px] gap-3">
                  <FieldRow
                    label="Logradouro"
                    value=""
                    isEditing
                    error={errors.address_line?.message}
                    input={
                      <input
                        {...register("address_line")}
                        className={inputCls}
                        placeholder="Rua, avenida..."
                        value={watch("address_line") ?? ""}
                        onChange={(e) => setValue("address_line", e.target.value)}
                      />
                    }
                  />
                  <FieldRow
                    label="Número"
                    value=""
                    isEditing
                    error={errors.number?.message}
                    input={
                      <input
                        {...register("number")}
                        className={inputCls}
                        placeholder="42"
                      />
                    }
                  />
                </div>
              ) : (
                <FieldRow
                  label="Logradouro"
                  value={profile.address_line ?? "—"}
                  isEditing={false}
                />
              )}

              {/* Complemento — só aparece no modo edição */}
              {isEditing && (
                <FieldRow
                  label="Complemento (opcional)"
                  value=""
                  isEditing
                  input={
                    <input
                      {...register("complement")}
                      className={inputCls}
                      placeholder="Apto 12, bloco B, casa..."
                    />
                  }
                />
              )}

              {/* Cidade + UF */}
              <div className="grid grid-cols-[1fr_72px] gap-3">
                <FieldRow
                  label="Cidade"
                  value={profile.city ?? "—"}
                  isEditing={isEditing}
                  error={errors.city?.message}
                  input={
                    <input
                      {...register("city")}
                      className={inputCls}
                      placeholder="Cidade"
                      value={watch("city") ?? ""}
                      onChange={(e) => setValue("city", e.target.value)}
                    />
                  }
                />
                <FieldRow
                  label="UF"
                  value={profile.state ?? "—"}
                  isEditing={isEditing}
                  error={errors.state?.message}
                  input={
                    <input
                      {...register("state")}
                      className={`${inputCls} w-16`}
                      placeholder="SP"
                      maxLength={2}
                      value={watch("state") ?? ""}
                      onChange={(e) => setValue("state", e.target.value.toUpperCase())}
                    />
                  }
                />
              </div>
            </section>
          </div>
        </form>

        {/* ── Perfil específico do tipo de usuário ──────────────────────── */}
        <section className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
          <SectionTitle icon={<ShieldCheck size={16} />} label={`Perfil de ${roleLabel}`} />
          <RoleProfileSection ref={roleProfileRef} role={profile.role} isEditing={isEditing} />
        </section>

        {/* ── Informações da conta ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <SectionTitle icon={<ShieldCheck size={16} />} label="Informações da conta" />
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <AccountInfo label="ID do usuário" value={String(profile.id)} />
            <AccountInfo label="Perfil" value={roleLabel} />
            <AccountInfo
              label="Status"
              value={profile.is_verified ? "Verificado" : "Pendente"}
              valueClass={profile.is_verified ? "text-green-600" : "text-yellow-600"}
              icon={
                profile.is_verified
                  ? <Check size={14} className="text-green-500" />
                  : <ShieldAlert size={14} className="text-yellow-500" />
              }
            />
          </div>
        </section>

      </div>
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-border text-sm text-text bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionTitle = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 text-text/60">
    {icon}
    <h2 className="text-sm font-bold uppercase tracking-wider">{label}</h2>
  </div>
);

interface FieldRowProps {
  label:     string;
  value:     string;
  isEditing: boolean;
  icon?:     React.ReactNode;
  input?:    React.ReactNode;
  error?:    string;
  readOnly?: boolean;
}

const FieldRow = ({ label, value, isEditing, icon, input, error, readOnly }: FieldRowProps) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-text/40 uppercase tracking-wide">{label}</p>
    {isEditing && !readOnly && input ? (
      <>
        {input}
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </>
    ) : (
      <div className="flex items-center gap-1.5 text-sm font-medium text-text min-h-[28px]">
        {icon}
        <span>{value || "—"}</span>
      </div>
    )}
  </div>
);

interface AccountInfoProps {
  label:       string;
  value:       string;
  icon?:       React.ReactNode;
  valueClass?: string;
}

const AccountInfo = ({ label, value, icon, valueClass }: AccountInfoProps) => (
  <div className="space-y-1.5">
    <p className="text-xs font-semibold text-text/40 uppercase tracking-wide">{label}</p>
    <div className={`flex items-center gap-1.5 text-sm font-bold ${valueClass ?? "text-text"}`}>
      {icon}
      {value}
    </div>
  </div>
);

// ─── Skeleton ────────────────────────────────────────────────────────────────

const ProfileSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-28 bg-gray-100" />
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-3 w-20 h-20 rounded-2xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-44 bg-gray-200 rounded-lg" />
            <div className="h-4 w-28 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
            {[0, 1, 2].map((j) => (
              <div key={j} className="space-y-1.5">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-5 w-full bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="h-4 w-40 bg-gray-100 rounded mb-5" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-5 w-20 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
