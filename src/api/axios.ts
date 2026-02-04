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
        // We will use local storage for token for now, or cookie if supported
        // For MVP, simple localStorage
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
