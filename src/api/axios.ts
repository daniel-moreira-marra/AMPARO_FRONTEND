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

api.interceptors.request.use(
  (config: AmparoRequestConfig) => {
    if (config._skipAuth) return config;

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
