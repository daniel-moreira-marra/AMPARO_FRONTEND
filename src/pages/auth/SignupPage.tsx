import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthHero from "@/components/auth/AuthHero";
import AuthForm from "@/components/auth/AuthForm";
import { api } from "@/api/axios";
import { maskPhone, maskCEP, CEP_REGEX } from "@/utils/masks";
import { resolveApiError } from "@/utils/apiError";
import { ROLE_OPTIONS } from "@/constants/roles";

const inputClass =
  "w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary";

const signupSchema = z
  .object({
    full_name: z.string().min(2, "Informe seu nome completo"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .superRefine((value, ctx) => {
        if (!/[A-Z]/.test(value))
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Deve conter pelo menos 1 letra maiúscula" });
        if (!/[a-z]/.test(value))
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Deve conter pelo menos 1 letra minúscula" });
        if (!/[0-9]/.test(value))
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Deve conter pelo menos 1 número" });
        if (!/[^A-Za-z0-9]/.test(value))
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Deve conter pelo menos 1 caractere especial" });
      }),
    confirm_password: z.string(),
    role: z.string().min(1, "Selecione o seu perfil"),
    phone: z.string().min(14, "Telefone inválido"),
    address_line: z.string().min(3, "Informe o endereço"),
    city: z.string().min(2, "Informe a cidade"),
    state: z.string().min(2, "Informe o estado"),
    zip_code: z.string().regex(CEP_REGEX, "CEP inválido (formato: 00000-000)"),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "As senhas não coincidem",
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    criteriaMode: "all",
    defaultValues: { role: "", phone: "", zip_code: "" },
  });

  async function handleNextStep() {
    const valid = await trigger(["full_name", "email", "password", "confirm_password", "role"]);
    if (valid) setStep(2);
  }

  const onSubmit = async (data: SignupForm) => {
    setServerError(null);
    try {
      await api.post("/auth/signup/", {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
        role: data.role,
        address_line: data.address_line,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
      });
      navigate("/signup-success", { replace: true, state: { message: "Conta criada com sucesso" } });
    } catch (err) {
      setServerError(resolveApiError(err, "Não foi possível criar a conta. Tente novamente."));
    }
  };

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
        {step === 1 && (
          <>
            <FieldWrapper label="Nome completo" error={errors.full_name?.message}>
              <input {...register("full_name")} placeholder="Seu nome completo" className={inputClass} />
            </FieldWrapper>

            <FieldWrapper label="Email" error={errors.email?.message}>
              <input type="email" {...register("email")} placeholder="seu@email.com" className={inputClass} />
            </FieldWrapper>

            <PasswordInput
              label="Senha"
              error={errors.password?.message}
              register={register("password")}
            />

            <PasswordInput
              label="Confirmar senha"
              error={errors.confirm_password?.message}
              register={register("confirm_password")}
            />

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

            <FieldWrapper label="Endereço" error={errors.address_line?.message}>
              <input {...register("address_line")} placeholder="Rua, número e complemento" className={inputClass} />
            </FieldWrapper>

            <FieldWrapper label="Cidade" error={errors.city?.message}>
              <input {...register("city")} placeholder="Sua cidade" className={inputClass} />
            </FieldWrapper>

            <FieldWrapper label="Estado" error={errors.state?.message}>
              <input {...register("state")} placeholder="UF" className={inputClass} maxLength={2} />
            </FieldWrapper>

            <FieldWrapper label="CEP" error={errors.zip_code?.message}>
              <Controller
                name="zip_code"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    maxLength={9}
                    onChange={(e) => field.onChange(maskCEP(e.target.value))}
                    placeholder="00000-000"
                    className={inputClass}
                  />
                )}
              />
            </FieldWrapper>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-text/70 hover:underline pt-2"
            >
              Voltar
            </button>
          </>
        )}
      </AuthForm>
    </AuthLayout>
  );
}

interface PasswordInputProps {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
}

function PasswordInput({ label, error, register }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const errorMessages = error ? [error] : [];

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-text">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          {...register}
          className={`${inputClass} pr-12`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text/60 hover:text-text"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {errorMessages.length > 0 && (
        <ul className="text-sm text-red-500 space-y-1">
          {errorMessages.map((msg, i) => (
            <li key={i}>• {msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FieldWrapperProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-text">{label}</label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
