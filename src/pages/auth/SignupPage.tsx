import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Check, Loader2, MapPin, X as XIcon } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthHero from "@/components/auth/AuthHero";
import AuthForm from "@/components/auth/AuthForm";
import { api } from "@/api/axios";
import { maskPhone, maskCEP, CEP_REGEX } from "@/utils/masks";
import { resolveApiError } from "@/utils/apiError";
import { fetchAddressByCep } from "@/utils/viaCep";
import { ROLE_OPTIONS } from "@/constants/roles";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthResponse, ApiResponse, User } from "@/types";

// ─── Styling ────────────────────────────────────────────────────────────────

const inputClass =
  "w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

// ─── Password Requirements ───────────────────────────────────────────────────

const PASSWORD_REQUIREMENTS = [
  { key: "length",  label: "6+ caracteres",      test: (v: string) => v.length >= 6 },
  { key: "upper",   label: "Maiúscula (A–Z)",     test: (v: string) => /[A-Z]/.test(v) },
  { key: "lower",   label: "Minúscula (a–z)",     test: (v: string) => /[a-z]/.test(v) },
  { key: "number",  label: "Número (0–9)",        test: (v: string) => /[0-9]/.test(v) },
  { key: "special", label: "Caractere especial",  test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const signupSchema = z
  .object({
    // Step 1
    full_name:        z.string().min(2, "Informe seu nome completo"),
    email:            z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "Mínimo 6 caracteres")
      .refine((v) => /[A-Z]/.test(v),       "Letra maiúscula necessária")
      .refine((v) => /[a-z]/.test(v),       "Letra minúscula necessária")
      .refine((v) => /[0-9]/.test(v),       "Número necessário")
      .refine((v) => /[^A-Za-z0-9]/.test(v), "Caractere especial necessário"),
    confirm_password: z.string().min(1, "Confirme sua senha"),
    role:             z.string().min(1, "Selecione o seu perfil"),

    // Step 2
    phone:        z.string().min(14, "Telefone inválido"),
    zip_code:     z.string().regex(CEP_REGEX, "CEP inválido (00000-000)"),
    address_line: z.string().min(3, "Informe o logradouro"),
    number:       z.string().min(1, "Informe o número"),
    complement:   z.string().optional(),
    city:         z.string().min(2, "Busque pelo CEP para preencher a cidade"),
    state:        z.string().length(2, "Busque pelo CEP para preencher o estado"),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ["confirm_password"],
    message: "As senhas não coincidem",
  });

type SignupForm = z.infer<typeof signupSchema>;

type CepStatus = "idle" | "loading" | "found" | "error";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [step, setStep]             = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cepStatus, setCepStatus]   = useState<CepStatus>("idle");
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "", phone: "", zip_code: "", complement: "" },
  });

  const passwordValue = watch("password") ?? "";
  const confirmValue  = watch("confirm_password") ?? "";

  // ── CEP lookup ─────────────────────────────────────────────────────────────

  const handleCepChange = async (maskedCep: string) => {
    const digits = maskedCep.replace(/\D/g, "");

    if (digits.length < 8) {
      if (cepStatus !== "idle") setCepStatus("idle");
      return;
    }

    setCepStatus("loading");
    try {
      const result = await fetchAddressByCep(maskedCep);
      if (!result) {
        setCepStatus("error");
        return;
      }
      setValue("address_line", result.logradouro || "", { shouldValidate: true });
      setValue("city",         result.localidade  || "", { shouldValidate: true });
      setValue("state",        result.uf          || "", { shouldValidate: true });
      setCepStatus("found");
    } catch {
      setCepStatus("error");
    }
  };

  // ── Step navigation ────────────────────────────────────────────────────────

  const handleNextStep = async () => {
    const valid = await trigger([
      "full_name", "email", "password", "confirm_password", "role",
    ]);
    if (valid) setStep(2);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: SignupForm) => {
    setServerError(null);
    try {
      const addressLine = data.complement
        ? `${data.address_line}, ${data.number} - ${data.complement}`
        : `${data.address_line}, ${data.number}`;

      const signupRes = await api.post<ApiResponse<User>>("/auth/signup/", {
        email:        data.email,
        password:     data.password,
        full_name:    data.full_name,
        phone:        data.phone.replace(/\D/g, ""),
        role:         data.role,
        address_line: addressLine,
        city:         data.city,
        state:        data.state,
        zip_code:     data.zip_code.replace(/\D/g, ""),
      });

      const tokenRes = await api.post<ApiResponse<AuthResponse>>("/auth/token/", {
        email:    data.email,
        password: data.password,
      });
      const { access, refresh } = tokenRes.data.data;

      // Build user from signup response — avoids calling /me/ on an unverified account
      const newUser: User = { ...signupRes.data.data, is_verified: false };
      setAuth(access, refresh, newUser);

      navigate("/signup-success", { replace: true });
    } catch (err) {
      setServerError(resolveApiError(err, "Não foi possível criar a conta. Tente novamente."));
    }
  };

  const addressLocked = cepStatus === "found";

  return (
    <AuthLayout
      hero={
        <AuthHero
          logo={<img src="/images/logo-amparo.svg" className="w-40" />}
          title="Cuidar de quem importa, juntos"
          subtitle="Conecte-se a uma rede de cuidado, apoio e confiança para viver e cuidar melhor todos os dias."
          imageSrc="/images/auth-hero2.jpeg"
        />
      }
    >
      <AuthForm
        headerIcon={<img src="/images/amparo-icon.svg" className="w-10" />}
        title="Criar conta"
        description={`Etapa ${step} de 2`}
        submitLabel={step === 1 ? "Continuar" : "Criar conta"}
        onSubmit={
          step === 1
            ? (e) => { e.preventDefault(); handleNextStep(); }
            : handleSubmit(onSubmit)
        }
        error={serverError}
        isLoading={isSubmitting}
        footer={
          <p>
            Já possui uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        }
      >
        {/* ════════════════════════════════ STEP 1 ══════════════════════════════ */}
        {step === 1 && (
          <>
            <FieldWrapper label="Nome completo" error={errors.full_name?.message}>
              <input
                {...register("full_name")}
                placeholder="Seu nome completo"
                className={inputClass}
              />
            </FieldWrapper>

            <FieldWrapper label="Email" error={errors.email?.message}>
              <input
                type="email"
                {...register("email")}
                placeholder="seu@email.com"
                className={inputClass}
              />
            </FieldWrapper>

            {/* Password with live requirements */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">Senha</label>
              <PasswordToggleInput register={register("password")} />
              {errors.password && !passwordValue && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}

              {/* Live requirements grid */}
              {passwordValue.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {PASSWORD_REQUIREMENTS.map((req) => {
                    const met = req.test(passwordValue);
                    return (
                      <div
                        key={req.key}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          met
                            ? "bg-primary-light/50 text-primary border-primary/20"
                            : "bg-gray-50 text-text/40 border-gray-100"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            met ? "bg-primary" : "bg-gray-200"
                          }`}
                        >
                          {met && <Check size={9} className="text-white" strokeWidth={3} />}
                        </span>
                        {req.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm password with match indicator */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">Confirmar senha</label>
              <PasswordToggleInput register={register("confirm_password")} />
              {/* Show Zod error only on form submit attempt */}
              {errors.confirm_password && (
                <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
              )}
              {/* Live match indicator */}
              {confirmValue.length > 0 && !errors.confirm_password && (
                <p
                  className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                    passwordValue === confirmValue ? "text-primary" : "text-text/40"
                  }`}
                >
                  {passwordValue === confirmValue ? (
                    <><Check size={12} /> Senhas coincidem</>
                  ) : (
                    "As senhas ainda não coincidem"
                  )}
                </p>
              )}
            </div>

            <FieldWrapper label="Perfil" error={errors.role?.message}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <select {...field} className={inputClass}>
                    <option value="">Selecione o seu perfil</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </FieldWrapper>
          </>
        )}

        {/* ════════════════════════════════ STEP 2 ══════════════════════════════ */}
        {step === 2 && (
          <>
            <FieldWrapper label="Telefone" error={errors.phone?.message}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    maxLength={15}
                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                  />
                )}
              />
            </FieldWrapper>

            {/* CEP with automatic lookup */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">CEP</label>
              <div className="relative">
                <Controller
                  name="zip_code"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      maxLength={9}
                      onChange={(e) => {
                        const masked = maskCEP(e.target.value);
                        field.onChange(masked);
                        handleCepChange(masked);
                      }}
                      placeholder="00000-000"
                      className={`${inputClass} pr-10`}
                    />
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {cepStatus === "loading" && <Loader2 size={16} className="animate-spin text-text/40" />}
                  {cepStatus === "found"   && <Check   size={16} className="text-primary" />}
                  {cepStatus === "error"   && <XIcon   size={16} className="text-red-400" />}
                  {cepStatus === "idle"    && <MapPin  size={16} className="text-text/20" />}
                </span>
              </div>
              {errors.zip_code && (
                <p className="text-sm text-red-500">{errors.zip_code.message}</p>
              )}
              {cepStatus === "error" && (
                <p className="text-xs text-amber-600 font-medium">
                  CEP não encontrado — preencha o endereço manualmente abaixo.
                </p>
              )}
            </div>

            {/* Logradouro + Número (side by side) */}
            <div className="space-y-1">
              <div className="flex gap-2">
                <span className="flex-1 text-sm font-medium text-text">Logradouro</span>
                <span className="w-[88px] text-sm font-medium text-text">Número</span>
              </div>
              <div className="flex gap-2">
                <input
                  {...register("address_line")}
                  placeholder="Rua, avenida..."
                  readOnly={addressLocked}
                  className={`flex-1 h-12 px-4 rounded-xl border border-border transition-all ${
                    addressLocked
                      ? "bg-gray-50 text-text/70 cursor-default"
                      : "focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  }`}
                />
                <input
                  {...register("number")}
                  placeholder="Ex: 42"
                  className="w-[88px] h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-2 text-sm text-red-500">
                <span className="flex-1">{errors.address_line?.message}</span>
                <span className="w-[88px]">{errors.number?.message}</span>
              </div>
            </div>

            {/* Complement (optional) */}
            <FieldWrapper label="Complemento (opcional)">
              <input
                {...register("complement")}
                placeholder="Apto 12, bloco B, casa..."
                className={inputClass}
              />
            </FieldWrapper>

            {/* Cidade + UF (auto-filled, locked when found) */}
            <div className="space-y-1">
              <div className="flex gap-2">
                <span className="flex-1 text-sm font-medium text-text">Cidade</span>
                <span className="w-[72px] text-sm font-medium text-text">UF</span>
              </div>
              <div className="flex gap-2">
                <input
                  {...register("city")}
                  placeholder="Preenchida pelo CEP"
                  readOnly={addressLocked}
                  className={`flex-1 h-12 px-4 rounded-xl border border-border transition-all ${
                    addressLocked
                      ? "bg-gray-50 text-text/70 cursor-default"
                      : "focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  }`}
                />
                <input
                  {...register("state")}
                  placeholder="UF"
                  maxLength={2}
                  readOnly={addressLocked}
                  className={`w-[72px] h-12 px-3 text-center uppercase rounded-xl border border-border transition-all ${
                    addressLocked
                      ? "bg-gray-50 text-text/70 cursor-default"
                      : "focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  }`}
                />
              </div>
              {(errors.city || errors.state) && (
                <p className="text-sm text-red-500">
                  {errors.city?.message ?? errors.state?.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-text/70 hover:underline pt-1"
            >
              ← Voltar
            </button>
          </>
        )}
      </AuthForm>
    </AuthLayout>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

interface FieldWrapperProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-text">{label}</label>}
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface PasswordToggleInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
}

function PasswordToggleInput({ register, placeholder = "••••••••" }: PasswordToggleInputProps) {
  const [visible, setVisible] = useState(false);
  const inputClass =
    "w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        {...register}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text/50 hover:text-text transition-colors"
      >
        {visible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
