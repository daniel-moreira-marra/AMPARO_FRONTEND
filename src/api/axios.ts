import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

interface AmparoRequestConfig extends InternalAxiosRequestConfig {
  _skipAuth?: boolean;
  _suppressGlobalLogout?: boolean;
}

// Em dev, usa o proxy do Vite (/api → http://localhost:8000) para evitar CORS.
// Em produção, defina VITE_API_BASE_URL com a URL completa do backend.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicRoutes = [
  '/auth/token/',
  '/auth/signup/',
  '/auth/password-reset/',
  '/auth/password-reset/confirm/',
  '/auth/verify-email/',
];

api.interceptors.request.use(
  (config: AmparoRequestConfig) => {
    // Se a requisição já pede para pular, ou se a rota estiver na lista pública, segue em frente sem Token
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    if (config._skipAuth || isPublicRoute) {
      return config;
    }

    // Injeta o token apenas nas rotas protegidas
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config as AmparoRequestConfig | undefined;
    if (error.response?.status === 401 && !config?._suppressGlobalLogout) {
      window.dispatchEvent(new Event('amparo:unauthorized'));
    }
    return Promise.reject(error);
  }
);
