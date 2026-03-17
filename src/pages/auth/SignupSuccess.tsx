import { useState } from "react";
import { MailCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/api/axios";

export default function SignupSuccessPage() {
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();
  
  // Pegamos os dados atuais da store
  const { user, accessToken, refreshToken, setAuth, logout } = useAuthStore();

  // Função para checar se o usuário já validou o e-mail no banco
  const handleCheckVerification = async () => {
  setIsChecking(true);
  try {
    // 1. Forçamos o envio do token que está na Store no Header da requisição
    const response = await api.get("/auth/me/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = response.data.data || response.data;

    if (userData.is_verified) {
      // 2. Atualiza a store com os novos dados (onde is_verified agora é true)
      setAuth(accessToken!, refreshToken!, userData);
      navigate("/feed", { replace: true });
    } else {
      alert("E-mail ainda não verificado. Por favor, verifique seu e-mail.");
    }
  } catch (error: any) {
    console.error("Erro ao verificar conta", error);
    if (error.response?.status === 401) {
      alert("Sua sessão expirou. Por favor, faça login novamente.");
      logout();
    }
  } finally {
    setIsChecking(false);
  }
};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12 space-y-8">
        
        {/* Ícone e Título */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center text-primary animate-pulse">
            <MailCheck size={40} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text">Confirme seu e-mail</h1>
            <p className="text-text/70">
              Enviamos um link de confirmação para <span className="font-semibold text-text">{user?.email}</span>.
              Acesse-o para liberar seu acesso.
            </p>
          </div>
        </div>

        {/* Ações Principais */}
        <div className="space-y-3">
          <button 
            onClick={handleCheckVerification}
            disabled={isChecking}
            className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isChecking ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              "Já verifiquei meu e-mail"
            )}
          </button>

          <button 
            onClick={() => logout()}
            className="w-full h-12 flex items-center justify-center gap-2 bg-transparent text-text/60 rounded-xl font-medium hover:bg-black/5 transition-colors"
          >
            <ArrowLeft size={18} />
            Sair e usar outra conta
          </button>
        </div>

        {/* Footer */}
        <div className="pt-4 text-center border-t border-border">
          <p className="text-sm text-text/60">
            Não recebeu o e-mail?{" "}
            <button className="text-primary hover:underline font-semibold">
              Reenviar agora
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}