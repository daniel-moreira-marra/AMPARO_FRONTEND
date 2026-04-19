interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      message?: string;
      non_field_errors?: string[];
      [key: string]: unknown;
    };
  };
  message?: string;
}

export function resolveApiError(err: unknown, fallback = 'Erro inesperado.'): string {
  const e = err as ApiErrorResponse;

  const serverMessage =
    e.response?.data?.detail ||
    e.response?.data?.message ||
    e.response?.data?.non_field_errors?.[0];

  if (serverMessage) return serverMessage;

  switch (e.response?.status) {
    case 400: return 'Dados inválidos. Revise as informações e tente novamente.';
    case 401: return 'Credenciais inválidas. Verifique seu email e senha.';
    case 403: return 'Você não tem permissão para realizar esta ação.';
    case 404: return 'Recurso não encontrado.';
    case 429: return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    case 500: return 'Erro interno do servidor. Tente novamente mais tarde.';
  }

  if (e.response) return fallback;

  return 'Falha de conexão. Verifique sua internet.';
}
