import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    setAuth: (access: string, refresh: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            setAuth: (access, refresh, user) => set({
                accessToken: access,
                refreshToken: refresh,
                user,
                isAuthenticated: true
            }),
            logout: () => set({
                accessToken: null,
                refreshToken: null,
                user: null,
                isAuthenticated: false
            }),
        }),
        {
            name: 'amparo-auth',
        }
    )
);
