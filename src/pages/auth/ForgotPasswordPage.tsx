import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthHero from "@/components/auth/AuthHero";
import AuthForm from "@/components/auth/AuthForm";
import { api } from "@/api/axios";
import { resolveApiError } from "@/utils/apiError";

const forgotPasswordSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setServerError(null);
    try {
      await api.post("/auth/password-reset/", data);
      setIsSuccess(true);
    } catch (err) {
      setServerError(resolveApiError(err, "Não foi possível processar sua solicitação."));
    }
  };

  const inputClass =
    "w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  if (isSuccess) {
    return (
      <AuthLayout
        hero={
          <AuthHero
            logo={<img src="/images/logo-amparo.svg" className="w-40" />}
            title="Recuperação de Acesso"
            subtitle="Fique tranquilo, nós te ajudamos a voltar para sua conta com segurança."
            imageSrc="/images/auth-hero2.jpeg"
          />
        }
      >
        <div className="flex flex-col items-center text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center text-primary animate-pulse">
            <MailCheck size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text">E-mail Enviado!</h2>
            <p className="text-text/70 max-w-sm">
              Se houver uma conta associada a este e-mail, enviaremos um link para você redefinir sua senha. Verifique sua caixa de entrada.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full h-12 flex items-center justify-center bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity mt-4"
          >
            Voltar para o Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      hero={
        <AuthHero
          logo={<img src="/images/logo-amparo.svg" className="w-40" />}
          title="Recuperação de Acesso"
          subtitle="Fique tranquilo, nós te ajudamos a voltar para sua conta com segurança."
          imageSrc="/images/auth-hero2.jpeg"
        />
      }
    >
      <AuthForm
        headerIcon={<img src="/images/amparo-icon.svg" className="w-10" />}
        title="Esqueceu sua senha?"
        description="Digite seu e-mail abaixo e enviaremos instruções para criar uma nova senha."
        submitLabel="Enviar link de recuperação"
        onSubmit={handleSubmit(onSubmit)}
        error={serverError}
        isLoading={isSubmitting}
        footer={
          <p>
            Lembrou da senha?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Voltar para login
            </Link>
          </p>
        }
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-text">Email</label>
          <input
            type="email"
            {...register("email")}
            placeholder="seu@email.com"
            className={inputClass}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </AuthForm>
    </AuthLayout>
  );
}