import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation, Link } from "react-router-dom";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthHero from "@/components/auth/AuthHero";
import AuthForm from "@/components/auth/AuthForm";

import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/api/axios";

import type { User } from "@/types";
import type { AuthResponse } from "@/types";


// ================= VALIDATION =================

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

type LoginForm = z.infer<typeof loginSchema>;


// ================= PAGE =================

export default function LoginPage() {

  const [serverError, setServerError] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/feed";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });


  // ================= SUBMIT =================

  const onSubmit = async (data: LoginForm) => {
  setServerError(null);
  try {
    // 1. Pega os tokens
    const response = await api.post<AuthResponse>("/auth/token/", data);
    const { access, refresh } = response.data.data;

    // 2. Busca o usuário atualizado do banco
    // Certifique-se que esta rota retorna o is_verified atualizado!
    const meResponse = await api.get("/auth/me/", {
      headers: { Authorization: `Bearer ${access}` } // Garante que usa o token novo
    });
    
    const user: User = meResponse.data.data;

    // 3. Salva tudo de uma vez no Zustand (o persist cuida do localStorage sozinho)
    setAuth(access, refresh, user);
    
    // 4. Navega
    navigate(from, { replace: true });

  } catch (err: any) {
    // ... seus tratamentos de erro
  }
};


  // ================= UI =================

  return (
    <AuthLayout
      hero={
        <AuthHero
          logo={<img src="/images/logo-amparo.svg" className="w-40" />}
          title="Cuidar de quem importa, juntos"
          subtitle="Conectando pessoas idosas, famílias e profissionais de saúde com segurança, acolhimento e confiança."
          imageSrc="/images/auth-hero2.jpeg"
        />
      }
    >
      <AuthForm
        headerIcon={<img src="/images/amparo-icon.svg" className="w-10" />}
        title="Bem-vindo de volta"
        description="Entre com seus dados para acessar sua conta"
        submitLabel="Entrar"
        onSubmit={handleSubmit(onSubmit)}
        error={serverError}
        isLoading={isSubmitting}
        footer={
          <div className="space-y-2">
            <p>
              Não tem uma conta?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Criar conta
              </Link>
            </p>

            <Link to="/forgot-password" className="text-blue hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        }
      >

        {/* EMAIL */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-text">Email</label>

          <input
            type="email"
            {...register("email")}
            placeholder="seu@email.com"
            className="w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />

          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-text">Senha</label>

          <input
            type="password"
            {...register("password")}
            placeholder="••••••••"
            className="w-full h-12 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />

          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

      </AuthForm>
    </AuthLayout>
  );
}