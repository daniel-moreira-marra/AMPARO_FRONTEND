import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Allow skipping auth header if specified in config (e.g. for signup/login)
        // Also skip for /auth/token/ endpoint to prevent sending stale tokens
        if ((config as any)._skipAuth || config.url?.endsWith('/auth/token/')) {
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
    async (error) => {
        // Handle token expiration logic later (refresh token flow)
        if (error.response?.status === 401) {
            // Optional: Redirect to login or dispatch event
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);
