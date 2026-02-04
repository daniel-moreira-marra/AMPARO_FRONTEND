export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role?: 'ELDER' | 'CAREGIVER' | 'FAMILY' | 'PROFESSIONAL' | 'INSTITUTION';
}

export interface Post {
    id: number;
    content: string;
    image?: string;
    author: {
        id: number;
        full_name: string;
        avatar?: string;
    };
    created_at: string;
    likes_count: number;
    comments_count: number;
    liked_by_me: boolean;
}

export interface PaginatedResponse<T> {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results: T[];
}

export interface AuthResponse {
    access: string;
    refresh: string;
}
