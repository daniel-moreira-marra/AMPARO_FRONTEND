import { useEffect, forwardRef, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";

import { useRoleProfile, useUpdateRoleProfile } from "@/hooks/useRoleProfile";
import { maskCNPJ } from "@/utils/masks";
import type { UserRole } from "@/types";

// ─── Label maps ──────────────────────────────────────────────────────────────

const GENDER_OPTIONS    = [{ v: "MALE", l: "Masculino" }, { v: "FEMALE", l: "Feminino" }, { v: "OTHER", l: "Outro" }, { v: "NOT_INFORMED", l: "Não informado" }];
const MOBILITY_OPTIONS  = [{ v: "INDEPENDENT", l: "Independente" }, { v: "NEEDS_ASSISTANCE", l: "Necessita assistência" }, { v: "WHEELCHAIR", l: "Cadeirante" }, { v: "BEDRIDDEN", l: "Acamado" }];
const COGNITIVE_OPTIONS = [{ v: "LUCID", l: "Lúcido" }, { v: "MILD_IMPAIRMENT", l: "Comprometimento leve" }, { v: "DEMENTIA", l: "Demência" }, { v: "NOT_INFORMED", l: "Não informado" }];
const CARE_TYPE_OPTIONS = [
  { v: "HOME", l: "Domiciliar" }, { v: "HOSPITAL", l: "Hospitalar" },
  { v: "NIGHT_SHIFT", l: "Plantão noturno" }, { v: "DAY_SHIFT", l: "Plantão diurno" },
  { v: "COMPANION", l: "Companhia" },
];
const RELATION_OPTIONS  = [{ v: "CHILD", l: "Filho(a)" }, { v: "SPOUSE", l: "Cônjuge" }, { v: "SIBLING", l: "Irmão/Irmã" }, { v: "RELATIVE", l: "Parente" }, { v: "LEGAL_GUARDIAN", l: "Responsável legal" }, { v: "OTHER", l: "Outro" }];
const PROFESSION_OPTIONS = [
  { v: "PHYSIOTHERAPIST", l: "Fisioterapeuta" }, { v: "SPEECH_THERAPIST", l: "Fonoaudiólogo" },
  { v: "OCCUPATIONAL_THERAPIST", l: "Terapeuta Ocupacional" }, { v: "PSYCHOLOGIST", l: "Psicólogo" },
  { v: "NUTRITIONIST", l: "Nutricionista" }, { v: "OTHER", l: "Outro" },
];
const SERVICE_MODE_OPTIONS = [{ v: "HOME", l: "Domiciliar" }, { v: "CLINIC", l: "Clínica" }, { v: "ONLINE", l: "Online" }, { v: "OTHER", l: "Outro" }];
const INSTITUTION_TYPE_OPTIONS = [{ v: "ILPI", l: "ILPI" }, { v: "SHELTER", l: "Abrigo" }, { v: "CLINIC", l: "Clínica" }, { v: "HOSPITAL", l: "Hospital" }, { v: "OTHER", l: "Outro" }];

// ─── Form value helpers ───────────────────────────────────────────────────────

function toFormValues(profile: any) {
  if (!profile) return {};
  return {
    ...profile,
    care_types_input: profile.care_types ?? [],
    cnpj: maskCNPJ(profile.cnpj ?? ""),
  };
}

function fromFormValues(data: any) {
  // care_types is read-only from the server; backend expects care_types_input for writes
  const { care_types, ...rest } = data;
  // Strip CNPJ formatting — backend stores only digits (max_length=14)
  if (typeof rest.cnpj === "string") rest.cnpj = rest.cnpj.replace(/\D/g, "");
  return rest;
}

// ─── Shared field components ─────────────────────────────────────────────────

const inputClass = "w-full h-10 px-3 rounded-xl border border-border bg-white text-sm text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";
const textareaClass = "w-full px-3 py-2 rounded-xl border border-border bg-white text-sm text-text font-medium placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none";

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-text/50 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const FormGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-bold text-text/30 uppercase tracking-widest pb-1.5 border-b border-border/30">
      {label}
    </p>
    {children}
  </div>
);

const SelectField = ({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { v: string; l: string }[]; placeholder?: string;
}) => (
  <div className="relative">
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} appearance-none pr-8 cursor-pointer`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none" />
  </div>
);

const Toggle = ({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all disabled:cursor-default ${
      checked
        ? "bg-primary-light border-primary/30 text-primary"
        : "bg-white border-border text-text/50 hover:border-primary/30"
    } ${disabled ? "opacity-70" : ""}`}
  >
    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-primary" : "bg-gray-200"}`}>
      {checked && <span className="text-white text-[9px] font-black">✓</span>}
    </span>
    {label}
  </button>
);

// ─── Role-specific form bodies ────────────────────────────────────────────────

const ElderForm = ({ data, register, control, setValue, watch, disabled }: any) => (
  <div className="space-y-6">
    <FormGroup label="Identificação">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Apelido / Nome preferido">
          <input {...register("preferred_name")} disabled={disabled} placeholder="Como gosta de ser chamado(a)" className={inputClass} />
        </Field>
        <Field label="Data de nascimento">
          <input type="date" {...register("birth_date")} disabled={disabled} className={inputClass} />
        </Field>
        <Field label="Gênero">
          <Controller name="gender" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={GENDER_OPTIONS} placeholder="Selecione" />
          )} />
        </Field>
      </div>
    </FormGroup>

    <FormGroup label="Saúde e Mobilidade">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nível de mobilidade">
          <Controller name="mobility_level" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={MOBILITY_OPTIONS} placeholder="Selecione" />
          )} />
        </Field>
        <Field label="Estado cognitivo">
          <Controller name="cognitive_status" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={COGNITIVE_OPTIONS} placeholder="Selecione" />
          )} />
        </Field>
      </div>
      <Field label="Cuidados especiais">
        <div className="flex flex-wrap gap-2 mt-1">
          <Toggle label="Risco de queda"       disabled={disabled} checked={watch("has_fall_risk") ?? false}           onChange={(v) => setValue("has_fall_risk", v)} />
          <Toggle label="Suporte de medicação"  disabled={disabled} checked={watch("needs_medication_support") ?? false} onChange={(v) => setValue("needs_medication_support", v)} />
          <Toggle label="Cuidado 24h"           disabled={disabled} checked={watch("requires_24h_care") ?? false}       onChange={(v) => setValue("requires_24h_care", v)} />
        </div>
      </Field>
      <Field label="Condições médicas">
        <textarea rows={2} {...register("medical_conditions")} disabled={disabled} placeholder="Ex: diabetes, hipertensão..." className={textareaClass} />
      </Field>
      <Field label="Alergias">
        <textarea rows={2} {...register("allergies")} disabled={disabled} placeholder="Alergias conhecidas..." className={textareaClass} />
      </Field>
      <Field label="Medicamentos em uso">
        <textarea rows={2} {...register("medications")} disabled={disabled} placeholder="Lista de medicamentos..." className={textareaClass} />
      </Field>
    </FormGroup>

    <FormGroup label="Contato de Emergência">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome">
          <input {...register("emergency_contact_name")} disabled={disabled} placeholder="Nome completo" className={inputClass} />
        </Field>
        <Field label="Telefone">
          <input {...register("emergency_contact_phone")} disabled={disabled} placeholder="(11) 99999-9999" className={inputClass} />
        </Field>
        <Field label="Parentesco">
          <input {...register("emergency_contact_relationship")} disabled={disabled} placeholder="Ex: Filha, Cônjuge, Vizinho(a)" className={inputClass} />
        </Field>
      </div>
    </FormGroup>

  </div>
);

const CaregiverForm = ({ register, control, watch, setValue, disabled }: any) => {
  const selected: string[] = watch("care_types_input") ?? [];
  const toggle = (v: string) => setValue(
    "care_types_input",
    selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v],
    { shouldValidate: true }
  );
  return (
    <div className="space-y-6">
      <FormGroup label="Apresentação">
        <Field label="Bio">
          <textarea rows={4} {...register("bio")} disabled={disabled} placeholder="Fale um pouco sobre você e sua experiência..." className={textareaClass} />
        </Field>
      </FormGroup>

      <FormGroup label="Experiência e Disponibilidade">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Field label="Anos de experiência">
            <input type="number" min={0} {...register("experience_years", { valueAsNumber: true })} disabled={disabled} placeholder="Ex: 5" className={inputClass} />
          </Field>
          <Toggle label="Disponível para novos vínculos" disabled={disabled} checked={watch("is_available") ?? false} onChange={(v) => setValue("is_available", v)} />
        </div>
      </FormGroup>

      <FormGroup label="Tipos de Atendimento">
        <div className="flex flex-wrap gap-2">
          {CARE_TYPE_OPTIONS.map((o) => (
            <Toggle key={o.v} label={o.l} disabled={disabled} checked={selected.includes(o.v)} onChange={() => toggle(o.v)} />
          ))}
        </div>
      </FormGroup>
    </div>
  );
};

const GuardianForm = ({ register, control, watch, setValue, disabled }: any) => (
  <div className="space-y-6">
    <FormGroup label="Relação com o Idoso">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <Field label="Parentesco">
          <Controller name="relationship" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={RELATION_OPTIONS} placeholder="Selecione" />
          )} />
        </Field>
        <Toggle label="Responsável legal" disabled={disabled} checked={watch("is_legal_guardian") ?? false} onChange={(v) => setValue("is_legal_guardian", v)} />
      </div>
    </FormGroup>
    <FormGroup label="Contato">
      <Field label="Contato preferido">
        <input {...register("preferred_contact")} disabled={disabled} placeholder="Email, WhatsApp..." className={inputClass} />
      </Field>
    </FormGroup>
  </div>
);

const ProfessionalForm = ({ register, control, watch, setValue, disabled }: any) => {
  const profession = watch("profession");
  return (
  <div className="space-y-6">
    <FormGroup label="Apresentação">
      <Field label="Bio / Apresentação">
        <textarea rows={4} {...register("bio")} disabled={disabled} placeholder="Descreva sua especialidade e experiência..." className={textareaClass} />
      </Field>
    </FormGroup>

    <FormGroup label="Credenciais">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Profissão">
          <Controller name="profession" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={PROFESSION_OPTIONS} placeholder="Selecione" />
          )} />
        </Field>
        {profession === "OTHER" && (
          <Field label="Especialidade">
            <input {...register("profession_other")} disabled={disabled} placeholder="Digite sua especialidade..." className={inputClass} />
          </Field>
        )}
        <Field label="Conselho (ex: CREFITO, CRP)">
          <input {...register("council")} disabled={disabled} placeholder="Ex: CREFITO" className={inputClass} />
        </Field>
        <Field label="Nº do registro">
          <input {...register("license_number")} disabled={disabled} placeholder="Ex: 12345-SP" className={inputClass} />
        </Field>
      </div>
    </FormGroup>

    <FormGroup label="Atendimento e Disponibilidade">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <Field label="Modo de atendimento">
          <Controller name="service_mode" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={SERVICE_MODE_OPTIONS} placeholder="Selecione" />
          )} />
        </Field>
        <Field label="Valor/hora (R$)">
          <input type="number" min={0} step="0.01" {...register("hourly_rate")} disabled={disabled} placeholder="Ex: 80.00" className={inputClass} />
        </Field>
      </div>
      <Toggle label="Disponível para atendimentos" disabled={disabled} checked={watch("is_available") ?? false} onChange={(v) => setValue("is_available", v)} />
    </FormGroup>
  </div>
  );
};

const InstitutionForm = ({ register, control, watch, setValue, disabled }: any) => (
  <div className="space-y-6">
    <FormGroup label="Identificação">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Razão social">
          <input {...register("legal_name")} disabled={disabled} placeholder="Nome jurídico" className={inputClass} />
        </Field>
        <Field label="Nome fantasia">
          <input {...register("trade_name")} disabled={disabled} placeholder="Nome comercial" className={inputClass} />
        </Field>
        <Field label="CNPJ">
          <input
            value={watch("cnpj") ?? ""}
            onChange={(e) => setValue("cnpj", maskCNPJ(e.target.value), { shouldValidate: true })}
            disabled={disabled}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            maxLength={18}
            className={inputClass}
          />
        </Field>
        <Field label="Tipo de instituição">
          <Controller name="institution_type" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={INSTITUTION_TYPE_OPTIONS} placeholder="Selecione" />
          )} />
        </Field>
      </div>
    </FormGroup>

    <FormGroup label="Estrutura e Contato">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Capacidade (vagas)">
          <input type="number" min={0} {...register("capacity", { valueAsNumber: true })} disabled={disabled} placeholder="Ex: 50" className={inputClass} />
        </Field>
        <Field label="Site (opcional)">
          <input {...register("website")} disabled={disabled} placeholder="https://..." className={inputClass} />
        </Field>
        <Field label="Nº do alvará / licença">
          <input {...register("license_number")} disabled={disabled} className={inputClass} />
        </Field>
      </div>
    </FormGroup>
  </div>
);

// ─── Ref handle ───────────────────────────────────────────────────────────────

export interface RoleProfileRef {
  submit: () => Promise<void>;
  patchValues: (values: Record<string, unknown>) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RoleProfileSectionProps {
  role: UserRole;
  isEditing: boolean;
}

export const RoleProfileSection = forwardRef<RoleProfileRef, RoleProfileSectionProps>(
  ({ role, isEditing }, ref) => {
    const { data: profile, isLoading } = useRoleProfile(role);
    const { mutateAsync: update } = useUpdateRoleProfile(role);

    const { register, control, handleSubmit, watch, setValue, reset } = useForm({
      defaultValues: toFormValues(profile),
    });

    // Sync form whenever profile data arrives from the server
    useEffect(() => {
      if (profile) reset(toFormValues(profile));
    }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

    // Expose submit to parent so the single top-level "Salvar" triggers both saves
    useImperativeHandle(ref, () => ({
      submit: handleSubmit(async (data) => {
        await update(fromFormValues(data));
      }),
      patchValues: (values) => {
        Object.entries(values).forEach(([key, val]) => setValue(key as any, val));
      },
    }));

    if (isLoading) {
      return (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
        </div>
      );
    }

    const formProps = { register, control, watch, setValue, disabled: !isEditing };

    return (
      <form className="space-y-6">
        {role === "ELDER"         && <ElderForm       {...formProps} data={profile} />}
        {role === "CAREGIVER"    && <CaregiverForm    {...formProps} />}
        {role === "GUARDIAN"     && <GuardianForm     {...formProps} />}
        {role === "PROFESSIONAL" && <ProfessionalForm {...formProps} />}
        {role === "INSTITUTION"  && <InstitutionForm  {...formProps} watch={watch} setValue={setValue} />}
      </form>
    );
  }
);

RoleProfileSection.displayName = "RoleProfileSection";
