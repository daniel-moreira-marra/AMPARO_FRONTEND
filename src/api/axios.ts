import axios, { type InternalAxiosRequestConfig } from 'axios';

interface AmparoRequestConfig extends InternalAxiosRequestConfig {
  _skipAuth?: boolean;
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: AmparoRequestConfig) => {
    if (config._skipAuth || config.url?.endsWith('/auth/token/')) {
      return config;
    }

    const token = localStorage.getItem('access_token');
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
    if (error.response?.status === 401) {
      // Dispatches a global event so the auth store can react (logout) without
      // creating a circular dependency between axios and the store.
      // TODO: implement silent token refresh here before dispatching the event.
      window.dispatchEvent(new Event('amparo:unauthorized'));
    }
    return Promise.reject(error);
  }
);
