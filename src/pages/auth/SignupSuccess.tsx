import { useState } from "react";
import { MailCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/api/axios";
import { resolveApiError } from "@/utils/apiError";
import type { User, ApiResponse } from "@/types";
import type { InternalAxiosRequestConfig } from "axios";

interface SuppressConfig extends InternalAxiosRequestConfig {
  _suppressGlobalLogout?: boolean;
}

export default function SignupSuccessPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'error' | 'info'>('info');

  const navigate = useNavigate();
  const { user, accessToken, refreshToken, setAuth, logout } = useAuthStore();

  const showFeedback = (message: string, type: 'error' | 'info' = 'info') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
  };

  const handleCheckVerification = async () => {
    if (!accessToken || !refreshToken) {
      showFeedback("Sessão inválida. Por favor, faça login novamente.", 'error');
      setTimeout(() => { logout(); navigate("/login", { replace: true }); }, 1500);
      return;
    }

    setIsChecking(true);
    setFeedbackMessage(null);

    try {
      const response = await api.get<ApiResponse<User>>("/auth/me/", {
        headers: { Authorization: `Bearer ${accessToken}` },
        _suppressGlobalLogout: true,
      } as SuppressConfig);

      const userData: User = response.data.data;

      if (userData.is_verified) {
        setAuth(accessToken, refreshToken, userData);
        navigate("/feed", { replace: true });
      } else {
        showFeedback("E-mail ainda não verificado. Verifique sua caixa de entrada.", 'info');
      }
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 401) {
        showFeedback("Sessão expirada. Faça login novamente.", 'error');
        setTimeout(() => { logout(); navigate("/login", { replace: true }); }, 1500);
      } else {
        showFeedback(resolveApiError(err, "Erro ao verificar a conta."), 'error');
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setFeedbackMessage(null);
    try {
      await api.post("/auth/resend-verification/", { email: user?.email });
      showFeedback("E-mail reenviado! Verifique sua caixa de entrada.", 'info');
    } catch (err) {
      showFeedback(resolveApiError(err, "Não foi possível reenviar o e-mail."), 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12 space-y-8">

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center text-primary animate-pulse">
            <MailCheck size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text">Confirme seu e-mail</h1>
            <p className="text-text/70">
              Enviamos um link de confirmação para{" "}
              <span className="font-semibold text-text">{user?.email}</span>.
              Acesse-o para liberar seu acesso.
            </p>
          </div>
        </div>

        {feedbackMessage && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium text-center ${
              feedbackType === 'error'
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-primary-light/40 text-primary border border-primary/10'
            }`}
          >
            {feedbackMessage}
          </div>
        )}

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
            onClick={() => { logout(); navigate("/login", { replace: true }); }}
            className="w-full h-12 flex items-center justify-center gap-2 bg-transparent text-text/60 rounded-xl font-medium hover:bg-black/5 transition-colors"
          >
            <ArrowLeft size={18} />
            Sair e usar outra conta
          </button>
        </div>

        <div className="pt-4 text-center border-t border-border">
          <p className="text-sm text-text/60">
            Não recebeu o e-mail?{" "}
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-primary hover:underline font-semibold disabled:opacity-50"
            >
              {isResending ? "Reenviando..." : "Reenviar agora"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
