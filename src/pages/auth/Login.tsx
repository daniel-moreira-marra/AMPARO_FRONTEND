import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthHero from "@/components/auth/AuthHero";
import AuthForm from "@/components/auth/AuthForm";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (!email || !password) {
      throw new Error("Preencha todos os campos para continuar.");
    }

    console.log("login data:", { email, password });
  }

  return (
    <AuthLayout
      hero={
        <AuthHero
          logo={<img src="/images/logo-amparo.svg" alt="amparo" className="w-40" />}
          title="Cuidar de quem importa, juntos"
          subtitle="Conectando pessoas idosas, famílias e profissionais de saúde com segurança, acolhimento e confiança."
          imageSrc="/images/auth-hero2.jpeg"
          imageAlt="Profissional de saúde cuidando de pessoa idosa"
        />
      }
    >
      <AuthForm
        headerIcon = {<img src="/images/amparo-icon.svg" alt="amparo" className="w-10" />}
        title="Bem-vindo de volta"
        description="Entre com seus dados para acessar sua conta"
        submitLabel="entrar"
        onSubmit={handleLogin}
        footer={
          <div className="space-y-2">
            <p>
              Não tem uma conta?{" "}
              <a href="/register" className="text-primary font-medium hover:underline">
                Criar conta
              </a>
            </p>

            <a href="/forgot-password" className="text-blue hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
        }
      >
        {/* EMAIL */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-text">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="
              w-full h-12 px-4
              rounded-xl
              border border-border
              text-text
              focus:outline-none
              focus:ring-2 focus:ring-primary/40
              focus:border-primary
              transition
            "
          />
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-text">
            Senha
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="
              w-full h-12 px-4
              rounded-xl
              border border-border
              text-text
              focus:outline-none
              focus:ring-2 focus:ring-primary/40
              focus:border-primary
              transition
            "
          />
        </div>
      </AuthForm>
    </AuthLayout>
  );
}