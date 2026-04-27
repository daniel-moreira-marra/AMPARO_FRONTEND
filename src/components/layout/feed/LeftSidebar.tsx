import { Link } from "react-router-dom";
import {
  MapPin, CheckCircle2, XCircle, Briefcase,
  Star, Home, Stethoscope, Building2, Shield, Link2,
  Mail, Phone,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfile } from "@/hooks/useProfile";
import { useRoleProfile } from "@/hooks/useRoleProfile";
import { getRoleStyle, ROLE_LABELS, type RoleStyle } from "@/constants/roles";
import { maskPhone } from "@/utils/masks";
import type { UserRole } from "@/types";

// ─── Label maps ───────────────────────────────────────────────────────────────

const CARE_TYPE_LABELS: Record<string, string> = {
  HOME: "Domiciliar", HOSPITAL: "Hospitalar",
  NIGHT_SHIFT: "Noturno", DAY_SHIFT: "Diurno", COMPANION: "Companhia",
};
const PROFESSION_LABELS: Record<string, string> = {
  PHYSIOTHERAPIST: "Fisioterapeuta", SPEECH_THERAPIST: "Fonoaudiólogo",
  OCCUPATIONAL_THERAPIST: "Ter. Ocupacional", PSYCHOLOGIST: "Psicólogo",
  NUTRITIONIST: "Nutricionista", OTHER: "Outro",
};
const SERVICE_MODE_LABELS: Record<string, string> = {
  HOME: "Domiciliar", CLINIC: "Clínica", ONLINE: "Online", OTHER: "Outro",
};
const RELATION_LABELS: Record<string, string> = {
  CHILD: "Filho(a)", SPOUSE: "Cônjuge", SIBLING: "Irmão/Irmã",
  RELATIVE: "Parente", LEGAL_GUARDIAN: "Resp. legal", OTHER: "Outro",
};
const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  ILPI: "ILPI", SHELTER: "Abrigo", CLINIC: "Clínica", HOSPITAL: "Hospital", OTHER: "Outro",
};

// ─── InfoRow ──────────────────────────────────────────────────────────────────

const InfoRow = ({
  icon, label, value, valueClass, style, iconBg, iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  style: RoleStyle;
  iconBg?: string;
  iconColor?: string;
}) => (
  <div className="flex items-center gap-3">
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: iconBg ?? style.lightBg, color: iconColor ?? style.color }}
    >
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-bold text-text/35 uppercase tracking-widest leading-none">{label}</p>
      <p className={`text-[12px] font-semibold mt-0.5 ${valueClass ?? "text-text/70"}`}>{value}</p>
    </div>
  </div>
);

// ─── Role-specific summaries ──────────────────────────────────────────────────

const CaregiverSummary = ({ p, style }: { p: any; style: RoleStyle }) => (
  <div className="space-y-3">
    {p.bio && (
      <p className="text-[12px] text-text/65 font-medium leading-relaxed">{p.bio}</p>
    )}
    {(p.bio && (p.experience_years != null || p.is_available != null)) && (
      <div className="h-px bg-border/30" />
    )}
    <div className="space-y-2.5">
      {p.experience_years != null && (
        <InfoRow icon={<Star size={12} />} label="Experiência" value={`${p.experience_years} anos`} style={style} />
      )}
      {p.is_available != null && (
        <InfoRow
          icon={p.is_available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          label="Disponibilidade"
          value={p.is_available ? "Disponível" : "Indisponível"}
          valueClass={p.is_available ? "text-green-600 font-bold" : "text-text/45"}
          style={style}
          iconBg={p.is_available ? "#f0fdf4" : "#f3f4f6"}
          iconColor={p.is_available ? "#16a34a" : "#9ca3af"}
        />
      )}
    </div>
    {p.care_types?.length > 0 && (
      <>
        <div className="h-px bg-border/30" />
        <div>
          <p className="text-[9px] font-bold text-text/35 uppercase tracking-widest mb-2">Tipos de atendimento</p>
          <div className="flex flex-wrap gap-1.5">
            {p.care_types.map((t: string) => (
              <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: style.lightBg, color: style.textColor }}>
                {CARE_TYPE_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        </div>
      </>
    )}
  </div>
);

const ProfessionalSummary = ({ p, style }: { p: any; style: RoleStyle }) => {
  const professionLabel =
    p.profession === "OTHER"
      ? (p.profession_other || "Outro")
      : (PROFESSION_LABELS[p.profession] ?? p.profession);

  return (
  <div className="space-y-3">
    {p.profession && (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: style.lightBg }}>
          <Stethoscope size={14} style={{ color: style.color }} />
        </div>
        <p className="text-[14px] font-bold text-text/80">{professionLabel}</p>
      </div>
    )}
    {p.bio && (
      <p className="text-[12px] text-text/65 font-medium leading-relaxed">{p.bio}</p>
    )}
    {(p.council || p.service_mode || p.hourly_rate || p.is_available != null) && (
      <div className="h-px bg-border/30" />
    )}
    <div className="space-y-2.5">
      {(p.council || p.license_number) && (
        <InfoRow
          icon={<Stethoscope size={12} />}
          label="Registro"
          value={[p.council, p.license_number].filter(Boolean).join(": ")}
          style={style}
        />
      )}
      {p.service_mode && (
        <InfoRow icon={<Home size={12} />} label="Atendimento" value={SERVICE_MODE_LABELS[p.service_mode] ?? p.service_mode} style={style} />
      )}
      {p.hourly_rate && (
        <InfoRow icon={<span className="text-[10px] font-black">R$</span>} label="Valor/hora" value={`R$ ${p.hourly_rate}`} style={style} />
      )}
      {p.is_available != null && (
        <InfoRow
          icon={p.is_available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          label="Disponibilidade"
          value={p.is_available ? "Disponível" : "Indisponível"}
          valueClass={p.is_available ? "text-green-600 font-bold" : "text-text/45"}
          style={style}
          iconBg={p.is_available ? "#f0fdf4" : "#f3f4f6"}
          iconColor={p.is_available ? "#16a34a" : "#9ca3af"}
        />
      )}
    </div>
  </div>
  );
};

const GuardianSummary = ({ p, style }: { p: any; style: RoleStyle }) => (
  <div className="space-y-2.5">
    {p.relationship && (
      <InfoRow icon={<Shield size={12} />} label="Parentesco" value={RELATION_LABELS[p.relationship] ?? p.relationship} style={style} />
    )}
    {p.is_legal_guardian && (
      <InfoRow icon={<CheckCircle2 size={12} />} label="Responsável legal" value="Sim" style={style} iconBg="#f0fdf4" iconColor="#16a34a" />
    )}
  </div>
);

const InstitutionSummary = ({ p, style }: { p: any; style: RoleStyle }) => (
  <div className="space-y-3">
    {(p.trade_name || p.legal_name) && (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: style.lightBg }}>
          <Building2 size={14} style={{ color: style.color }} />
        </div>
        <p className="text-[13px] font-bold text-text/80">{p.trade_name || p.legal_name}</p>
      </div>
    )}
    <div className="space-y-2.5">
      {p.institution_type && (
        <InfoRow icon={<Briefcase size={12} />} label="Tipo" value={INSTITUTION_TYPE_LABELS[p.institution_type] ?? p.institution_type} style={style} />
      )}
      {p.capacity != null && (
        <InfoRow icon={<Shield size={12} />} label="Capacidade" value={`${p.capacity} vagas`} style={style} />
      )}
      {p.website && (
        <a href={p.website} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] font-bold text-primary hover:underline truncate">
          <Link2 size={11} />{p.website.replace(/^https?:\/\//, "")}
        </a>
      )}
    </div>
  </div>
);

const ElderSummary = ({ p, style }: { p: any; style: RoleStyle }) => (
  <div className="space-y-2.5">
    {p.preferred_name && (
      <InfoRow icon={<Star size={12} />} label="Chamado por" value={`"${p.preferred_name}"`} style={style} />
    )}
  </div>
);

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export const LeftSidebar = () => {
  const user      = useAuthStore((state) => state.user);
  const { profile } = useProfile();

  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? "Membro") : "Membro";
  const roleStyle = getRoleStyle(user?.role);

  const { data: roleProfile } = useRoleProfile(user?.role as UserRole | undefined);

  const hasProfileData =
    !!roleProfile &&
    Object.values(roleProfile).some(
      (v) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
    );

  const profilePath = user?.id ? `/profile/${user.id}` : "/feed";

  return (
    <div className="space-y-3">

      {/* ── Profile card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
        {/* Role gradient banner */}
        <div
          className="h-20"
          style={{
            background: `linear-gradient(135deg, ${roleStyle.lightBg} 0%, ${roleStyle.color}55 100%)`,
          }}
        />

        <div className="px-4 -mt-9 flex flex-col items-center">
          {/* Avatar with role-colored gradient border */}
          <div
            className="w-[72px] h-[72px] rounded-2xl p-[3px] shadow-md flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${roleStyle.color}, ${roleStyle.lightBg})` }}
          >
            <div className="w-full h-full rounded-xl overflow-hidden bg-white">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.full_name ?? ""} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-bold text-xl"
                  style={{ background: roleStyle.lightBg, color: roleStyle.color }}
                >
                  {user?.full_name?.slice(0, 2).toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          </div>

          {/* Name + role + location */}
          <div className="mt-3 mb-4 text-center w-full space-y-1.5">
            <h3 className="font-bold text-[15px] text-text leading-tight">{user?.full_name}</h3>

            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: roleStyle.lightBg }}>
                <Briefcase size={11} style={{ color: roleStyle.color }} aria-hidden="true" />
                <span className="text-[11px] font-bold" style={{ color: roleStyle.textColor }}>{roleLabel}</span>
              </div>
            </div>

            {(user?.city || user?.state) && (
              <div className="flex items-center justify-center gap-1 text-text/40">
                <MapPin size={11} aria-hidden="true" />
                <span className="text-[11px] font-medium">
                  {[user.city, user.state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Profile link */}
        <div className="px-4 pb-4">
          <Link
            to={profilePath}
            className="block w-full text-center py-2 rounded-xl text-[12px] font-bold border border-border/60 text-text/60 hover:border-primary/30 hover:text-primary hover:bg-primary-light/30 transition-all"
          >
            Ver meu perfil completo
          </Link>
        </div>
      </div>

      {/* ── "Sobre mim" card ─────────────────────────────────────────── */}
      {(hasProfileData || profile?.phone || profile?.email) && (
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 space-y-4">
          {/* Section header with role-colored accent */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: roleStyle.color }} />
            <p className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Sobre mim</p>
          </div>

          {/* Role-specific content */}
          {hasProfileData && roleProfile && user?.role && (
            <>
              {user.role === "CAREGIVER"    && <CaregiverSummary    p={roleProfile} style={roleStyle} />}
              {user.role === "PROFESSIONAL" && <ProfessionalSummary p={roleProfile} style={roleStyle} />}
              {user.role === "GUARDIAN"     && <GuardianSummary     p={roleProfile} style={roleStyle} />}
              {user.role === "INSTITUTION"  && <InstitutionSummary  p={roleProfile} style={roleStyle} />}
              {user.role === "ELDER"        && <ElderSummary        p={roleProfile} style={roleStyle} />}
            </>
          )}

          {/* Contact info (always visible to self) */}
          {(profile?.email || profile?.phone) && (
            <>
              {hasProfileData && <div className="h-px bg-border/30" />}
              <div className="space-y-2.5">
                <p className="text-[9px] font-bold text-text/35 uppercase tracking-widest">Contato</p>
                {profile?.email && (
                  <InfoRow icon={<Mail size={12} />} label="E-mail" value={profile.email} style={roleStyle} />
                )}
                {profile?.phone && (
                  <InfoRow icon={<Phone size={12} />} label="Telefone" value={maskPhone(profile.phone)} style={roleStyle} />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
