import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Check, XCircle } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthHero from "@/components/auth/AuthHero";
import AuthForm from "@/components/auth/AuthForm";
import { api } from "@/api/axios";
import { resolveApiError } from "@/utils/apiError";

// ─── Validações Visuais de Senha ───
const PASSWORD_REQUIREMENTS = [
  { key: "length",  label: "6+ caracteres",      test: (v: string) => v.length >= 6 },
  { key: "upper",   label: "Maiúscula (A–Z)",     test: (v: string) => /[A-Z]/.test(v) },
  { key: "lower",   label: "Minúscula (a–z)",     test: (v: string) => /[a-z]/.test(v) },
  { key: "number",  label: "Número (0–9)",        test: (v: string) => /[0-9]/.test(v) },
  { key: "special", label: "Caractere especial",  test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, "Mínimo 6 caracteres")
    .refine((v) => /[A-Z]/.test(v), "Letra maiúscula necessária")
    .refine((v) => /[a-z]/.test(v), "Letra minúscula necessária")
    .refine((v) => /[0-9]/.test(v), "Número necessário")
    .refine((v) => /[^A-Za-z0-9]/.test(v), "Caractere especial necessário"),
  confirm_password: z.string().min(1, "Confirme sua senha"),
}).refine((d) => d.password === d.confirm_password, {
  path: ["confirm_password"],
  message: "As senhas não coincidem",
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLinkValid, setIsLinkValid] = useState(true);

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!uid || !token) setIsLinkValid(false);
  }, [uid, token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch("password") ?? "";
  const confirmValue = watch("confirm_password") ?? "";

  const onSubmit = async (data: ResetPasswordForm) => {
    setServerError(null);
    try {
      await api.post("/auth/password-reset/confirm/", {
        uid: uid,
        token: token,
        new_password: data.password,
      });
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3500);
    } catch (err) {
      setServerError(resolveApiError(err, "Link expirado ou inválido. Solicite um novo."));
    }
  };

  if (!isLinkValid) {
    return (
      <AuthLayout hero={<AuthHero logo={<img src="/images/logo-amparo.svg" className="w-40" />} title="Link Inválido" subtitle="Este link está incompleto." imageSrc="/images/auth-hero2.jpeg"/>}>
        <div className="flex flex-col items-center text-center space-y-6 py-8">
          <XCircle size={60} className="text-red-500" />
          <h2 className="text-2xl font-bold">Link Quebrado</h2>
          <p className="text-text/70">O link de recuperação está inválido ou faltando parâmetros.</p>
          <Link to="/forgot-password" className="text-primary font-bold hover:underline">Pedir novo link</Link>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout hero={<AuthHero logo={<img src="/images/logo-amparo.svg" className="w-40" />} title="Sucesso!" subtitle="Acesso restabelecido." imageSrc="/images/auth-hero2.jpeg"/>}>
        <div className="flex flex-col items-center text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Check size={40} />
          </div>
          <h2 className="text-2xl font-bold">Senha Alterada!</h2>
          <p className="text-text/70">Sua senha foi redefinida. Redirecionando para o login...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      hero={
        <AuthHero logo={<img src="/images/logo-amparo.svg" className="w-40" />} title="Criar Nova Senha" subtitle="Crie uma senha forte e segura para a sua conta." imageSrc="/images/auth-hero2.jpeg"/>
      }
    >
      <AuthForm
        headerIcon={<img src="/images/amparo-icon.svg" className="w-10" />}
        title="Nova Senha"
        description="Digite sua nova senha de acesso."
        submitLabel="Salvar Nova Senha"
        onSubmit={handleSubmit(onSubmit)}
        error={serverError}
        isLoading={isSubmitting}
        footer={<span />}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-text">Nova Senha</label>
          <PasswordToggleInput register={register("password")} />
          {errors.password && !passwordValue && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}

          {passwordValue.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {PASSWORD_REQUIREMENTS.map((req) => {
                const met = req.test(passwordValue);
                return (
                  <div key={req.key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${met ? "bg-primary-light/50 text-primary border-primary/20" : "bg-gray-50 text-text/40 border-gray-100"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${met ? "bg-primary" : "bg-gray-200"}`}>
                      {met && <Check size={9} className="text-white" strokeWidth={3} />}
                    </span>
                    {req.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text">Confirmar Nova Senha</label>
          <PasswordToggleInput register={register("confirm_password")} />
          {errors.confirm_password && (
            <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
          )}
          {confirmValue.length > 0 && !errors.confirm_password && (
            <p className={`text-xs font-medium flex items-center gap-1 transition-colors ${passwordValue === confirmValue ? "text-primary" : "text-text/40"}`}>
              {passwordValue === confirmValue ? <><Check size={12} /> Senhas coincidem</> : "As senhas ainda não coincidem"}
            </p>
          )}
        </div>
      </AuthForm>
    </AuthLayout>
  );
}

// ─── Auxiliares ───
function PasswordToggleInput({ register, placeholder = "••••••••" }: { register: UseFormRegisterReturn, placeholder?: string }) {
  const [visible, setVisible] = useState(false);
  const inputClass = "w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} {...register} placeholder={placeholder} className={`${inputClass} pr-12`} />
      <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text/50 hover:text-text transition-colors">
        {visible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}