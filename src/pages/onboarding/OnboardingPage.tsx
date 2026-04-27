import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLE_LABELS, ROLE_STYLES } from "@/constants/roles";
import { useOnboarding } from "@/hooks/useOnboarding";
import { maskPhone, maskCNPJ } from "@/utils/masks";
import type { UserRole } from "@/types";

// ─── Brazilian states ─────────────────────────────────────────────────────────

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function maskDateBR(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function brToISO(br: string): string {
  const parts = br.split("/");
  if (parts.length !== 3 || parts[2].length < 4) return "";
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function isoToBR(iso: string): string {
  if (!iso || !iso.includes("-")) return "";
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd}/${mm}/${yyyy}`;
}

// ─── Per-step validation ──────────────────────────────────────────────────────

type FormData = Record<string, unknown>;

function canProceed(role: UserRole, step: number, data: FormData): boolean {
  const s = (k: string) => String(data[k] ?? "").trim();
  const a = (k: string) => (data[k] as string[]) ?? [];

  if (role === "ELDER") {
    if (step === 0) return s("birth_date") !== "" && s("gender") !== "";
    if (step === 1) return s("mobility_level") !== "" && s("cognitive_status") !== "";
    if (step === 2)
      return s("emergency_contact_name") !== "" &&
        s("emergency_contact_phone").replace(/\D/g, "").length >= 10;
  }
  if (role === "CAREGIVER") {
    if (step === 0) return s("city") !== "" && s("state") !== "";
    if (step === 1) return a("care_types").length > 0;
  }
  if (role === "GUARDIAN") {
    if (step === 0) return s("relationship") !== "";
  }
  if (role === "PROFESSIONAL") {
    if (step === 0) return s("profession") !== "";
    if (step === 1) return s("service_mode") !== "" && s("city") !== "";
  }
  if (role === "INSTITUTION") {
    if (step === 0) return s("legal_name") !== "" && s("institution_type") !== "";
  }
  return true;
}

// ─── Steps metadata ───────────────────────────────────────────────────────────

const STEPS_META: Record<UserRole, { title: string; subtitle: string }[]> = {
  ELDER: [
    { title: "Informações pessoais",  subtitle: "Nos ajude a personalizar sua experiência." },
    { title: "Saúde e mobilidade",    subtitle: "Isso ajuda sua rede de cuidado a preparar o melhor suporte." },
    { title: "Contato de emergência", subtitle: "Para situações que exigem atenção imediata." },
  ],
  CAREGIVER: [
    { title: "Seu perfil",       subtitle: "Apresente-se para idosos e famílias que buscam cuidado." },
    { title: "Tipos de cuidado", subtitle: "Selecione os serviços que você oferece." },
  ],
  GUARDIAN: [
    { title: "Sua relação", subtitle: "Como você está conectado ao idoso que acompanha?" },
  ],
  PROFESSIONAL: [
    { title: "Credenciais profissionais",  subtitle: "Suas informações constroem confiança com pacientes." },
    { title: "Modalidade de atendimento",  subtitle: "Como e onde você atende?" },
  ],
  INSTITUTION: [
    { title: "Dados da instituição",     subtitle: "Informações oficiais do seu estabelecimento." },
    { title: "Informações operacionais", subtitle: "Capacidade e detalhes do serviço prestado." },
  ],
};

// ─── Initial form data ────────────────────────────────────────────────────────

const INITIAL_DATA: Record<UserRole, FormData> = {
  ELDER: {
    preferred_name: "", birth_date: "", gender: "",
    mobility_level: "", cognitive_status: "",
    has_fall_risk: false, needs_medication_support: false, requires_24h_care: false,
    medical_conditions: "", allergies: "", medications: "",
    share_medical_info: false,
    emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relationship: "",
  },
  CAREGIVER: {
    bio: "", experience_years: "", is_available: true,
    city: "", state: "", care_types: [] as string[],
  },
  GUARDIAN: {
    relationship: "", is_legal_guardian: false, preferred_contact: "",
  },
  PROFESSIONAL: {
    profession: "", profession_other: "", council: "", license_number: "", bio: "",
    service_mode: "", hourly_rate: "", is_available: true,
    city: "", state: "",
  },
  INSTITUTION: {
    legal_name: "", trade_name: "", cnpj: "",
    institution_type: "", capacity: "", website: "", license_number: "",
  },
};

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-border bg-white text-text text-sm " +
  "placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition";

function Field({
  label, hint, required, children,
}: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[13px] font-semibold text-text/65">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </p>
      {children}
      {hint && <p className="text-[11px] text-text/40">{hint}</p>}
    </div>
  );
}

function DateInput({
  value, onChange,
}: {
  value: string; onChange: (iso: string) => void;
}) {
  const [display, setDisplay] = useState(() => isoToBR(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskDateBR(e.target.value);
    setDisplay(masked);
    onChange(brToISO(masked));
  };

  return (
    <input
      className={inputCls}
      value={display}
      onChange={handleChange}
      placeholder="dd/mm/aaaa"
      maxLength={10}
      inputMode="numeric"
    />
  );
}

function Toggle({
  label, description, checked, onChange,
}: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full p-4 rounded-xl border border-border/60 hover:border-border transition text-left"
    >
      <div>
        <p className="text-sm font-semibold text-text">{label}</p>
        {description && <p className="text-xs text-text/45 mt-0.5">{description}</p>}
      </div>
      <div
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
          checked ? "bg-primary" : "bg-border"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}

function RadioCards({
  options, value, onChange, cols = 1,
}: {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: 1 | 2;
}) {
  return (
    <div className={`grid gap-2 ${cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
            value === opt.value
              ? "border-primary bg-primary/5"
              : "border-border/50 bg-white hover:border-border"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              value === opt.value ? "border-primary" : "border-border/60"
            }`}
          >
            {value === opt.value && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-text leading-tight">{opt.label}</p>
            {opt.description && (
              <p className="text-xs text-text/45 mt-0.5">{opt.description}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function CheckboxCards({
  options, values, onChange,
}: {
  options: { value: string; label: string }[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  };
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              selected
                ? "border-primary bg-primary/5"
                : "border-border/50 bg-white hover:border-border"
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                selected ? "border-primary bg-primary" : "border-border/60"
              }`}
            >
              {selected && <Check size={10} className="text-white" />}
            </div>
            <span className="text-sm font-semibold text-text">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Step content components ──────────────────────────────────────────────────

function ElderStep0({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Nome preferido" hint="Como você gosta de ser chamado(a)?">
        <input
          className={inputCls}
          value={data.preferred_name as string}
          onChange={(e) => set("preferred_name", e.target.value)}
          placeholder="Ex: Dona Helena"
        />
      </Field>
      <Field label="Data de nascimento" required>
        <DateInput
          value={data.birth_date as string}
          onChange={(iso) => set("birth_date", iso)}
        />
      </Field>
      <Field label="Gênero" required>
        <RadioCards
          value={data.gender as string}
          onChange={(v) => set("gender", v)}
          options={[
            { value: "MALE",         label: "Masculino" },
            { value: "FEMALE",       label: "Feminino" },
            { value: "NOT_INFORMED", label: "Prefiro não informar" },
          ]}
          cols={2}
        />
      </Field>
    </div>
  );
}

function ElderStep1({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Nível de mobilidade" required>
        <RadioCards
          value={data.mobility_level as string}
          onChange={(v) => set("mobility_level", v)}
          options={[
            { value: "INDEPENDENT",      label: "Independente",           description: "Realizo minhas atividades sem ajuda" },
            { value: "NEEDS_ASSISTANCE", label: "Precisa de assistência", description: "Preciso de apoio em algumas atividades" },
            { value: "WHEELCHAIR",       label: "Cadeira de rodas",       description: "Utilizo cadeira de rodas" },
            { value: "BEDRIDDEN",        label: "Acamado(a)",             description: "Necessito de cuidados no leito" },
          ]}
        />
      </Field>
      <Field label="Estado cognitivo" required>
        <RadioCards
          value={data.cognitive_status as string}
          onChange={(v) => set("cognitive_status", v)}
          options={[
            { value: "LUCID",           label: "Lúcido(a)" },
            { value: "MILD_IMPAIRMENT", label: "Comprometimento leve" },
            { value: "DEMENTIA",        label: "Demência" },
            { value: "NOT_INFORMED",    label: "Prefiro não informar" },
          ]}
          cols={2}
        />
      </Field>
      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-text/65">Necessidades especiais</p>
        <Toggle label="Risco de queda"        checked={data.has_fall_risk as boolean}            onChange={(v) => set("has_fall_risk", v)} />
        <Toggle label="Auxílio com medicação" checked={data.needs_medication_support as boolean} onChange={(v) => set("needs_medication_support", v)} />
        <Toggle label="Cuidado 24 horas"      checked={data.requires_24h_care as boolean}        onChange={(v) => set("requires_24h_care", v)} />
      </div>
      <Field label="Condições médicas" hint="Opcional — diagnósticos relevantes">
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={data.medical_conditions as string}
          onChange={(e) => set("medical_conditions", e.target.value)}
          placeholder="Ex: Diabetes tipo 2, Hipertensão..."
        />
      </Field>
      <Field label="Alergias" hint="Opcional">
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={data.allergies as string}
          onChange={(e) => set("allergies", e.target.value)}
          placeholder="Ex: Dipirona, látex..."
        />
      </Field>
      <Field label="Medicamentos em uso" hint="Opcional">
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={data.medications as string}
          onChange={(e) => set("medications", e.target.value)}
          placeholder="Ex: Metformina 500mg 2x/dia..."
        />
      </Field>
      <Toggle
        label="Compartilhar ficha médica no perfil público"
        description="Condições, alergias e medicamentos ficarão visíveis para sua rede de cuidado"
        checked={data.share_medical_info as boolean}
        onChange={(v) => set("share_medical_info", v)}
      />
    </div>
  );
}

function ElderStep2({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Nome do contato" hint="Pessoa de confiança a ser acionada em emergências" required>
        <input
          className={inputCls}
          value={data.emergency_contact_name as string}
          onChange={(e) => set("emergency_contact_name", e.target.value)}
          placeholder="Nome completo"
        />
      </Field>
      <Field label="Telefone do contato" required>
        <input
          className={inputCls}
          value={data.emergency_contact_phone as string}
          onChange={(e) => set("emergency_contact_phone", maskPhone(e.target.value))}
          placeholder="(00) 00000-0000"
          inputMode="numeric"
          maxLength={15}
        />
      </Field>
      <Field label="Grau de parentesco" hint="Opcional">
        <input
          className={inputCls}
          value={data.emergency_contact_relationship as string}
          onChange={(e) => set("emergency_contact_relationship", e.target.value)}
          placeholder="Ex: Filha, Cônjuge, Vizinho(a)"
        />
      </Field>
    </div>
  );
}

function CaregiverStep0({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Apresentação" hint="Opcional — fale sobre sua experiência e abordagem">
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          value={data.bio as string}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Ex: Tenho 5 anos de experiência com idosos com Alzheimer..."
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Anos de experiência">
          <input
            className={inputCls}
            type="number"
            min="0"
            value={data.experience_years as string}
            onChange={(e) => set("experience_years", e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Estado (UF)" required>
          <select
            className={inputCls}
            value={data.state as string}
            onChange={(e) => set("state", e.target.value)}
          >
            <option value="">Selecione</option>
            {BR_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Cidade" required>
        <input
          className={inputCls}
          value={data.city as string}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Sua cidade"
        />
      </Field>
      <Toggle
        label="Disponível para novos contratos"
        description="Famílias poderão encontrá-lo(a) nas buscas"
        checked={data.is_available as boolean}
        onChange={(v) => set("is_available", v)}
      />
    </div>
  );
}

function CaregiverStep1({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text/55">
        Selecione um ou mais tipos de cuidado que você oferece.
        <span className="text-red-400 ml-0.5">*</span>
      </p>
      <CheckboxCards
        values={data.care_types as string[]}
        onChange={(v) => set("care_types", v)}
        options={[
          { value: "HOME",        label: "Domiciliar" },
          { value: "HOSPITAL",    label: "Hospitalar" },
          { value: "NIGHT_SHIFT", label: "Plantão noturno" },
          { value: "DAY_SHIFT",   label: "Plantão diurno" },
          { value: "COMPANION",   label: "Acompanhante" },
        ]}
      />
    </div>
  );
}

function GuardianStep0({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Grau de parentesco" required>
        <RadioCards
          value={data.relationship as string}
          onChange={(v) => set("relationship", v)}
          options={[
            { value: "CHILD",          label: "Filho(a)" },
            { value: "SPOUSE",         label: "Cônjuge" },
            { value: "SIBLING",        label: "Irmão(ã)" },
            { value: "RELATIVE",       label: "Parente" },
            { value: "LEGAL_GUARDIAN", label: "Responsável legal" },
            { value: "OTHER",          label: "Outro" },
          ]}
          cols={2}
        />
      </Field>
      <Toggle
        label="Sou responsável legal"
        description="Tenho tutela ou curatela formal reconhecida"
        checked={data.is_legal_guardian as boolean}
        onChange={(v) => set("is_legal_guardian", v)}
      />
      <Field label="Forma de contato preferida" hint="Opcional">
        <input
          className={inputCls}
          value={data.preferred_contact as string}
          onChange={(e) => set("preferred_contact", e.target.value)}
          placeholder="Ex: WhatsApp, Ligação..."
        />
      </Field>
    </div>
  );
}

function ProfessionalStep0({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Profissão" required>
        <RadioCards
          value={data.profession as string}
          onChange={(v) => set("profession", v)}
          options={[
            { value: "PHYSIOTHERAPIST",        label: "Fisioterapeuta" },
            { value: "SPEECH_THERAPIST",       label: "Fonoaudiólogo(a)" },
            { value: "OCCUPATIONAL_THERAPIST", label: "Terapeuta ocupacional" },
            { value: "PSYCHOLOGIST",           label: "Psicólogo(a)" },
            { value: "NUTRITIONIST",           label: "Nutricionista" },
            { value: "OTHER",                  label: "Outro" },
          ]}
          cols={2}
        />
        {data.profession === "OTHER" && (
          <input
            className={inputCls}
            value={data.profession_other as string}
            onChange={(e) => set("profession_other", e.target.value)}
            placeholder="Digite sua especialidade..."
            autoFocus
          />
        )}
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Conselho profissional" hint="Ex: CREFITO, CRP, CRM">
          <input
            className={inputCls}
            value={data.council as string}
            onChange={(e) => set("council", e.target.value)}
            placeholder="CREFITO"
          />
        </Field>
        <Field label="Número de registro">
          <input
            className={inputCls}
            value={data.license_number as string}
            onChange={(e) => set("license_number", e.target.value)}
            placeholder="000000-F"
          />
        </Field>
      </div>
      <Field label="Apresentação" hint="Opcional — descreva sua especialidade">
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          value={data.bio as string}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Descreva sua especialidade e abordagem terapêutica..."
        />
      </Field>
    </div>
  );
}

function ProfessionalStep1({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Modalidade de atendimento" required>
        <RadioCards
          value={data.service_mode as string}
          onChange={(v) => set("service_mode", v)}
          options={[
            { value: "HOME",   label: "Domiciliar", description: "Atendo na residência do paciente" },
            { value: "CLINIC", label: "Em clínica",  description: "Atendo em consultório ou clínica" },
            { value: "ONLINE", label: "Online",      description: "Atendo por videochamada" },
            { value: "OTHER",  label: "Outro" },
          ]}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Valor por hora (R$)" hint="Opcional">
          <input
            className={inputCls}
            type="number"
            min="0"
            step="0.01"
            value={data.hourly_rate as string}
            onChange={(e) => set("hourly_rate", e.target.value)}
            placeholder="0,00"
          />
        </Field>
        <Field label="Estado (UF)">
          <select
            className={inputCls}
            value={data.state as string}
            onChange={(e) => set("state", e.target.value)}
          >
            <option value="">Selecione</option>
            {BR_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Cidade" required>
        <input
          className={inputCls}
          value={data.city as string}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Sua cidade"
        />
      </Field>
      <Toggle
        label="Disponível para novos pacientes"
        description="Seu perfil aparecerá nas buscas por profissionais"
        checked={data.is_available as boolean}
        onChange={(v) => set("is_available", v)}
      />
    </div>
  );
}

function InstitutionStep0({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Razão social" required>
        <input
          className={inputCls}
          value={data.legal_name as string}
          onChange={(e) => set("legal_name", e.target.value)}
          placeholder="Nome jurídico da instituição"
        />
      </Field>
      <Field label="Nome fantasia" hint="Opcional — nome pelo qual é conhecida">
        <input
          className={inputCls}
          value={data.trade_name as string}
          onChange={(e) => set("trade_name", e.target.value)}
          placeholder="Nome fantasia"
        />
      </Field>
      <Field label="CNPJ" hint="Opcional">
        <input
          className={inputCls}
          value={data.cnpj as string}
          onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
          placeholder="00.000.000/0000-00"
          inputMode="numeric"
          maxLength={18}
        />
      </Field>
      <Field label="Tipo de instituição" required>
        <RadioCards
          value={data.institution_type as string}
          onChange={(v) => set("institution_type", v)}
          options={[
            { value: "ILPI",     label: "ILPI",     description: "Instituição de Longa Permanência para Idosos" },
            { value: "SHELTER",  label: "Abrigo" },
            { value: "CLINIC",   label: "Clínica" },
            { value: "HOSPITAL", label: "Hospital" },
            { value: "OTHER",    label: "Outro" },
          ]}
        />
      </Field>
    </div>
  );
}

function InstitutionStep1({ data, set }: { data: FormData; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Capacidade" hint="Número máximo de residentes ou pacientes atendidos">
        <input
          className={inputCls}
          type="number"
          min="1"
          value={data.capacity as string}
          onChange={(e) => set("capacity", e.target.value)}
          placeholder="Ex: 50"
        />
      </Field>
      <Field label="Website" hint="Opcional">
        <input
          className={inputCls}
          type="url"
          value={data.website as string}
          onChange={(e) => set("website", e.target.value)}
          placeholder="https://www.suainstituicao.com.br"
        />
      </Field>
      <Field label="Número do alvará / licença" hint="Opcional">
        <input
          className={inputCls}
          value={data.license_number as string}
          onChange={(e) => set("license_number", e.target.value)}
          placeholder="Número da licença sanitária"
        />
      </Field>
    </div>
  );
}

// ─── Step renderer ────────────────────────────────────────────────────────────

function renderStepContent(
  role: UserRole,
  step: number,
  data: FormData,
  set: (k: string, v: unknown) => void,
) {
  const map: Record<UserRole, React.ReactNode[]> = {
    ELDER:        [<ElderStep0 data={data} set={set} />, <ElderStep1 data={data} set={set} />, <ElderStep2 data={data} set={set} />],
    CAREGIVER:    [<CaregiverStep0 data={data} set={set} />, <CaregiverStep1 data={data} set={set} />],
    GUARDIAN:     [<GuardianStep0 data={data} set={set} />],
    PROFESSIONAL: [<ProfessionalStep0 data={data} set={set} />, <ProfessionalStep1 data={data} set={set} />],
    INSTITUTION:  [<InstitutionStep0 data={data} set={set} />, <InstitutionStep1 data={data} set={set} />],
  };
  return map[role]?.[step] ?? null;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { submit, isLoading, error } = useOnboarding();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(() =>
    INITIAL_DATA[(user?.role as UserRole) ?? "CAREGIVER"],
  );

  if (!user) return null;

  const role = user.role as UserRole;
  const steps = STEPS_META[role];
  const totalSteps = steps.length;
  const isLast = step === totalSteps - 1;
  const roleStyle = ROLE_STYLES[role];
  const firstName = user.full_name.split(" ")[0];
  const proceed = canProceed(role, step, data);

  const setField = useCallback((key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNext = async () => {
    if (!isLast) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    await submit(role, data);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-border/40 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <img src="/images/logo-amparo.svg" alt="Amparo" className="h-8" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm font-semibold text-text/45 hover:text-text transition"
        >
          <LogOut size={14} />
          Sair
        </button>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center px-4 py-10 pb-16">
        <div className="w-full max-w-lg">

          {/* Welcome block */}
          <div className="mb-8 text-center">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-4"
              style={{ background: roleStyle.lightBg, color: roleStyle.textColor }}
            >
              {ROLE_LABELS[role]}
            </span>
            <h1 className="text-[1.75rem] font-extrabold text-text leading-tight">
              Olá, {firstName}!
            </h1>
            <p className="text-text/50 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              Complete seu perfil para começar a usar o Amparo. Leva menos de dois minutos.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-7">
            {steps.map((_, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    i < step
                      ? "bg-primary text-white"
                      : i === step
                        ? "bg-primary text-white ring-4 ring-primary/15"
                        : "bg-border/30 text-text/30"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1.5 transition-colors ${
                      i < step ? "bg-primary" : "bg-border/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
            {/* Role-colored top accent */}
            <div className="h-1" style={{ background: roleStyle.color }} />

            <div className="p-6 sm:p-8">
              {/* Step header */}
              <div className="mb-7">
                <p className="text-[11px] font-bold text-text/30 uppercase tracking-widest mb-1">
                  Etapa {step + 1} de {totalSteps}
                </p>
                <h2 className="text-xl font-extrabold text-text">
                  {steps[step].title}
                </h2>
                <p className="text-sm text-text/50 mt-1 leading-relaxed">
                  {steps[step].subtitle}
                </p>
              </div>

              {/* Step content */}
              {renderStepContent(role, step, data, setField)}

              {/* Error */}
              {error && (
                <div className="mt-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Required fields note */}
              {!proceed && (
                <p className="mt-4 text-[11px] text-text/35">
                  Preencha os campos obrigatórios (<span className="text-red-400">*</span>) para continuar.
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5 px-1">
            <button
              type="button"
              onClick={() => { setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={step === 0}
              className="flex items-center gap-1.5 text-sm font-semibold text-text/45 hover:text-text transition disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
              Voltar
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading || !proceed}
              className="flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando...
                </>
              ) : isLast ? (
                <>Entrar no Amparo <Check size={15} /></>
              ) : (
                <>Próximo <ChevronRight size={15} /></>
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-text/30 mt-5">
            Você pode atualizar essas informações a qualquer momento no seu perfil.
          </p>
        </div>
      </div>
    </div>
  );
}
