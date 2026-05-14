import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/api/axios";
import { resolveApiError } from "@/utils/apiError";

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const hasAttempted = useRef(false);

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setErrorMessage("Link inválido. Os parâmetros de confirmação não foram encontrados na URL.");
      return;
    }

    // Previne requisição duplicada no React.StrictMode
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const confirmEmail = async () => {
      try {
        await api.post("/auth/verify-email/", { uid, token });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMessage(resolveApiError(err, "Este link é inválido ou já expirou."));
      }
    };

    confirmEmail();
  }, [uid, token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12 space-y-8 text-center">
        
        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 size={60} className="animate-spin text-primary" />
            <h1 className="text-2xl font-bold text-text">Verificando...</h1>
            <p className="text-text/70">Aguarde enquanto confirmamos o seu e-mail.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-2xl font-bold text-text">E-mail Confirmado!</h1>
            <p className="text-text/70">
              Sua conta foi ativada com sucesso. Você já pode acessar a plataforma.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-12 mt-4 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Fazer Login Agora
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <XCircle size={40} />
            </div>
            <h1 className="text-2xl font-bold text-text">Falha na Confirmação</h1>
            <p className="text-text/70">{errorMessage}</p>
            <Link
              to="/login"
              className="w-full h-12 mt-4 flex items-center justify-center border border-border text-text rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Voltar ao Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}