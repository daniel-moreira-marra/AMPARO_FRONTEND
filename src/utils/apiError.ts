interface ApiErrorShape {
  response?: {
    status?: number;
    data?: {
      error?: {
        message?: string;
        details?: Record<string, string[]>;
      };
      detail?: string;
      non_field_errors?: string[];
    };
  };
}

export function resolveApiError(err: unknown, fallback = 'Erro inesperado.'): string {
  const e = err as ApiErrorShape;
  const errorBody = e.response?.data?.error;

  if (errorBody?.details) {
    const firstField = Object.values(errorBody.details)[0];
    if (firstField?.[0]) return firstField[0];
  }

  if (errorBody?.message) return errorBody.message;

  const drf = e.response?.data?.detail ?? e.response?.data?.non_field_errors?.[0];
  if (drf) return drf;

  switch (e.response?.status) {
    case 400: return 'Dados inválidos. Revise as informações e tente novamente.';
    case 401: return 'Credenciais inválidas. Verifique seu email e senha.';
    case 403: return 'Você não tem permissão para realizar esta ação.';
    case 404: return 'Recurso não encontrado.';
    case 409: return 'Conflito: este recurso já existe.';
    case 429: return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    case 500: return 'Erro interno do servidor. Tente novamente mais tarde.';
  }

  if (e.response) return fallback;
  return 'Falha de conexão. Verifique sua internet.';
}
